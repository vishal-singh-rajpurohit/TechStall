import uuid
from typing import Optional, List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..models.User import Users, Cart
from ..models.Products import Products
from ..models.Orders import Orders, OrderItems, StatusEnum
from ..models.Payment import RazorpayPayment, PaymentStatusEnum
from ..schema.shop import (
    AddToCartRequest,
    UpdateCartItemRequest,
    CartItemResponse,
    CartResponse,
    ProductSummary,
    ProductResponse,
    PlaceOrderRequest,
    OrderItemResponse,
    PaymentSummaryResponse,
    OrderResponse,
    VerifyOrderRequest,
    PayOrderRequest,
    CancelOrderRequest,
)
import base64
import json
import urllib.request
import urllib.error
from ..config.settngs import settings
from ..schema.auth import MessageResponse


def _create_razorpay_order_if_configured(amount_rupees: float, receipt_id: str) -> Optional[str]:
    """Attempts to create a genuine Razorpay Order via REST API if keys are provided."""
    key_id = getattr(settings, "RAZORPAY_KEY_ID", "") or ""
    key_secret = getattr(settings, "RAZORPAY_KEY_SECRET", "") or ""
    key_id = key_id.strip()
    key_secret = key_secret.strip()
    if not key_id or not key_secret or "51abc" in key_id.lower() or "dummy" in key_id.lower() or "placeholder" in key_id.lower():
        return None

    try:
        url = "https://api.razorpay.com/v1/orders"
        amount_paise = int(round(amount_rupees * 100))
        payload_data = json.dumps({
            "amount": amount_paise,
            "currency": "INR",
            "receipt": receipt_id,
        }).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=payload_data,
            headers={"Content-Type": "application/json"},
        )
        auth_bytes = base64.b64encode(f"{key_id}:{key_secret}".encode("utf-8")).decode("utf-8")
        req.add_header("Authorization", f"Basic {auth_bytes}")
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status in (200, 201):
                res_json = json.loads(resp.read().decode("utf-8"))
                return res_json.get("id")
    except Exception as e:
        print(f"[Razorpay] Notice: Could not create server order via Razorpay API ({e}). Using local payment reference.")
        return None


def _format_order_response(order: Orders) -> OrderResponse:
    """Helper to convert an Orders model instance into OrderResponse."""
    items_response = []
    if order.items:
        for item in order.items:
            prod_summary = ProductSummary.model_validate(item.product) if item.product else None
            price = item.product.selling_price if item.product else 0.0
            items_response.append(
                OrderItemResponse(
                    id=item.id,
                    productId=item.productId,
                    quantity=item.quantity,
                    product=prod_summary,
                    item_price=price,
                )
            )

    latest_payment = None
    if getattr(order, "payments", None) and len(order.payments) > 0:
        p = order.payments[-1]
        latest_payment = PaymentSummaryResponse(
            id=p.id,
            razorpay_order_id=p.razorpay_order_id,
            razorpay_payment_id=p.razorpay_payment_id,
            amount=p.amount,
            currency=p.currency,
            status=p.status.value if hasattr(p.status, "value") else str(p.status),
        )

    return OrderResponse(
        id=order.id,
        userId=order.userId,
        total=order.total,
        status=order.status.value if hasattr(order.status, "value") else str(order.status),
        isVerified=order.isVerified,
        mobile_number=order.mobile_number,
        address=order.address,
        city=order.city,
        state=order.state,
        pin_code=order.pin_code,
        items=items_response,
        payment=latest_payment,
        created_at=order.created_at,
        updated_at=order.updated_at,
    )


# ------------------ ORDER CONTROLLERS ------------------

async def place_order(
    payload: PlaceOrderRequest,
    current_user: Users,
    db: AsyncSession,
) -> OrderResponse:

    items_to_order = []  # List of tuples: (Products, quantity)
    is_from_cart = False
    active_cart_records = []

    if payload.items and len(payload.items) > 0:
        # Multiple items order flow
        for it in payload.items:
            stmt = select(Products).where(Products.id == it.product_id)
            result = await db.execute(stmt)
            product = result.scalar_one_or_none()
            if product and product.isActive:
                items_to_order.append((product, it.quantity))
        if not items_to_order:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No available active products found in the order list",
            )
    elif payload.direct_buy:
        # Direct Buy flow
        stmt = select(Products).where(Products.id == payload.direct_buy.product_id)
        result = await db.execute(stmt)
        product = result.scalar_one_or_none()
        if not product or not product.isActive:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found or inactive",
            )
        items_to_order.append((product, payload.direct_buy.quantity))
    else:
        # Cart checkout flow
        is_from_cart = True
        stmt = (
            select(Cart)
            .where(Cart.userId == current_user.id, Cart.isActive == True)
            .options(selectinload(Cart.product))
        )
        result = await db.execute(stmt)
        active_cart_records = result.scalars().all()

        if not active_cart_records:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Your cart is empty. Add products before placing an order.",
            )

        for cart_item in active_cart_records:
            if cart_item.product and cart_item.product.isActive:
                items_to_order.append((cart_item.product, cart_item.quantity))

        if not items_to_order:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No available active products in your cart",
            )

    # Calculate total
    total_amount = sum(prod.selling_price * qty for prod, qty in items_to_order)

    # Create Order
    new_order = Orders(
        userId=current_user.id,
        total=round(float(total_amount), 2),
        isVerified=False,
        status=StatusEnum.PENDING,
        mobile_number=payload.mobile_number,
        address=payload.address,
        city=payload.city,
        state=payload.state,
        pin_code=payload.pin_code,
    )
    db.add(new_order)
    await db.flush()

    # Create OrderItems
    for prod, qty in items_to_order:
        item_entry = OrderItems(
            orderId=new_order.id,
            productId=prod.id,
            quantity=qty,
        )
        db.add(item_entry)

    await db.flush()

    # If checkout from cart, deactivate cart items
    if is_from_cart:
        for cart_rec in active_cart_records:
            cart_rec.isActive = False
        await db.flush()

    # Create Razorpay payment record
    rzp_order_id = _create_razorpay_order_if_configured(
        amount_rupees=float(total_amount),
        receipt_id=f"rcpt_{new_order.id.hex[:10]}"
    )
    if not rzp_order_id:
        rzp_order_id = f"order_{uuid.uuid4().hex[:14]}"

    payment = RazorpayPayment(
        orderId=new_order.id,
        userId=current_user.id,
        razorpay_order_id=rzp_order_id,
        amount=round(float(total_amount), 2),
        currency="INR",
        status=PaymentStatusEnum.PENDING,
    )
    db.add(payment)
    await db.commit()

    # Reload order with relations for response
    order_stmt = (
        select(Orders)
        .where(Orders.id == new_order.id)
        .options(
            selectinload(Orders.items).selectinload(OrderItems.product),
            selectinload(Orders.payments),
        )
    )
    order_res = await db.execute(order_stmt)
    full_order = order_res.scalar_one()

    return _format_order_response(full_order)


async def list_user_orders(
    current_user: Users,
    db: AsyncSession,
) -> List[OrderResponse]:
    """Retrieve all orders placed by the current user."""
    stmt = (
        select(Orders)
        .where(Orders.userId == current_user.id)
        .options(
            selectinload(Orders.items).selectinload(OrderItems.product),
            selectinload(Orders.payments),
        )
        .order_by(Orders.created_at.desc())
    )
    result = await db.execute(stmt)
    orders = result.scalars().all()

    return [_format_order_response(o) for o in orders]


async def get_order_details(
    order_id: uuid.UUID,
    current_user: Users,
    db: AsyncSession,
) -> OrderResponse:
    """Retrieve details for a specific order belonging to the current user."""
    stmt = (
        select(Orders)
        .where(Orders.id == order_id, Orders.userId == current_user.id)
        .options(
            selectinload(Orders.items).selectinload(OrderItems.product),
            selectinload(Orders.payments),
        )
    )
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    return _format_order_response(order)


async def cancel_order(
    order_id: uuid.UUID,
    current_user: Users,
    db: AsyncSession,
) -> OrderResponse:
    """Cancel a pending order belonging to the current user."""
    stmt = (
        select(Orders)
        .where(Orders.id == order_id, Orders.userId == current_user.id)
        .options(
            selectinload(Orders.items).selectinload(OrderItems.product),
            selectinload(Orders.payments),
        )
    )
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    if order.status in [StatusEnum.SHIPPED, StatusEnum.OUT_FOR_DELIVERY, StatusEnum.DELIEVERED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel order with status '{order.status.value}'",
        )

    if order.status == StatusEnum.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order is already cancelled",
        )

    order.status = StatusEnum.CANCELLED
    await db.commit()

    return _format_order_response(order)


async def verify_order(
    payload: VerifyOrderRequest,
    current_user: Users,
    db: AsyncSession,
) -> OrderResponse:
    """Verify an order and update payment status to SUCCESS."""
    stmt = (
        select(Orders)
        .where(Orders.id == payload.order_id, Orders.userId == current_user.id)
        .options(
            selectinload(Orders.items).selectinload(OrderItems.product),
            selectinload(Orders.payments),
        )
    )
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    order.isVerified = True
    if order.status == StatusEnum.PENDING:
        order.status = StatusEnum.CONFORMED

    if order.payments:
        p = order.payments[-1]
        p.status = PaymentStatusEnum.SUCCESS
        if payload.razorpay_payment_id:
            p.razorpay_payment_id = payload.razorpay_payment_id
        if payload.razorpay_signature:
            p.razorpay_signature = payload.razorpay_signature
        if payload.razorpay_order_id and (not p.razorpay_order_id or p.razorpay_order_id.startswith("order_")):
            p.razorpay_order_id = payload.razorpay_order_id
    else:
        new_payment = RazorpayPayment(
            orderId=order.id,
            userId=current_user.id,
            razorpay_order_id=payload.razorpay_order_id or f"order_{uuid.uuid4().hex[:14]}",
            razorpay_payment_id=payload.razorpay_payment_id or f"pay_{uuid.uuid4().hex[:14]}",
            amount=order.total,
            currency="INR",
            status=PaymentStatusEnum.SUCCESS,
        )
        db.add(new_payment)

    await db.commit()
    return _format_order_response(order)


async def pay_order(
    payload: PayOrderRequest,
    current_user: Users,
    db: AsyncSession,
) -> OrderResponse:
    """Process or record payment completion for an order."""
    stmt = (
        select(Orders)
        .where(Orders.id == payload.order_id, Orders.userId == current_user.id)
        .options(
            selectinload(Orders.items).selectinload(OrderItems.product),
            selectinload(Orders.payments),
        )
    )
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    if order.payments and any(p.status == PaymentStatusEnum.SUCCESS for p in order.payments):
        return _format_order_response(order)

    if order.payments:
        p = order.payments[-1]
        p.status = PaymentStatusEnum.SUCCESS
        if not p.razorpay_payment_id:
            p.razorpay_payment_id = f"pay_{uuid.uuid4().hex[:14]}"
    else:
        new_payment = RazorpayPayment(
            orderId=order.id,
            userId=current_user.id,
            razorpay_order_id=f"order_{uuid.uuid4().hex[:14]}",
            razorpay_payment_id=f"pay_{uuid.uuid4().hex[:14]}",
            amount=order.total,
            currency="INR",
            status=PaymentStatusEnum.SUCCESS,
        )
        db.add(new_payment)

    order.isVerified = True
    if order.status == StatusEnum.PENDING:
        order.status = StatusEnum.CONFORMED

    await db.commit()

    # Re-fetch order
    stmt = (
        select(Orders)
        .where(Orders.id == order.id)
        .options(
            selectinload(Orders.items).selectinload(OrderItems.product),
            selectinload(Orders.payments),
        )
    )
    order = (await db.execute(stmt)).scalar_one()
    return _format_order_response(order)


async def cancel_order_flexible(
    payload: Optional[CancelOrderRequest],
    current_user: Users,
    db: AsyncSession,
    order_id: Optional[uuid.UUID] = None,
) -> OrderResponse:
    """Cancel order using order_id from path/query or payload."""
    target_id = order_id or (payload.order_id if payload else None)
    if not target_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="order_id is required either in payload or query/path",
        )
    return await cancel_order(order_id=target_id, current_user=current_user, db=db)

