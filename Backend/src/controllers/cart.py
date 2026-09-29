import uuid
from typing import Optional, List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..models.User import Users, Cart
from ..models.Products import Products
from ..schema.shop import (
    AddToCartRequest,
    UpdateCartItemRequest,
    RemoveCartRequest,
    QuantityChangeRequest,
    CartItemResponse,
    CartResponse,
    ProductSummary
)
from ..schema.auth import MessageResponse

async def get_cart(current_user: Users, db: AsyncSession) -> CartResponse:
    """Retrieve active cart items and calculate totals for current user."""
    stmt = (
        select(Cart)
        .where(Cart.userId == current_user.id, Cart.isActive == True)
        .options(selectinload(Cart.product))
    )
    result = await db.execute(stmt)
    cart_items = result.scalars().all()

    items_response: List[CartItemResponse] = []
    subtotal = 0.0
    total_items = 0

    for item in cart_items:
        prod_summary = ProductSummary.model_validate(item.product) if item.product else None
        item_price = item.product.selling_price if item.product else 0.0
        item_total = item_price * item.quantity

        subtotal += item_total
        total_items += item.quantity

        items_response.append(
            CartItemResponse(
                id=item.id,
                productId=item.productId,
                quantity=item.quantity,
                product=prod_summary,
                item_total=item_total,
                created_at=item.created_at,
            )
        )

    return CartResponse(
        items=items_response,
        total_items=total_items,
        subtotal=round(subtotal, 2),
    )


async def add_to_cart(
    payload: AddToCartRequest,
    current_user: Users,
    db: AsyncSession,
) -> CartResponse:
    """Add a product to cart or increment quantity if already present."""
    stmt = select(Products).where(Products.id == payload.product_id)
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()

    if not product or not product.isActive:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or inactive",
        )

    cart_stmt = select(Cart).where(
        Cart.userId == current_user.id,
        Cart.productId == payload.product_id
    )
    cart_res = await db.execute(cart_stmt)
    existing_cart_item = cart_res.scalar_one_or_none()

    if existing_cart_item:
        if existing_cart_item.isActive:
            existing_cart_item.quantity += payload.quantity
        else:
            existing_cart_item.isActive = True
            existing_cart_item.quantity = payload.quantity
    else:
        new_cart_item = Cart(
            userId=current_user.id,
            productId=payload.product_id,
            quantity=payload.quantity,
            isActive=True,
        )
        db.add(new_cart_item)

    await db.commit()
    return await get_cart(current_user=current_user, db=db)


async def update_cart_item(
    cart_item_id: uuid.UUID,
    payload: UpdateCartItemRequest,
    current_user: Users,
    db: AsyncSession,
) -> CartResponse:
    """Update quantity of an existing cart item."""
    stmt = select(Cart).where(Cart.id == cart_item_id, Cart.userId == current_user.id)
    result = await db.execute(stmt)
    cart_item = result.scalar_one_or_none()

    if not cart_item or not cart_item.isActive:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found",
        )

    if payload.quantity <= 0:
        cart_item.isActive = False
    else:
        cart_item.quantity = payload.quantity

    await db.commit()
    return await get_cart(current_user=current_user, db=db)


async def remove_cart_item(
    cart_item_id: uuid.UUID,
    current_user: Users,
    db: AsyncSession,
) -> CartResponse:
    """Remove a specific item from user's active cart."""
    stmt = select(Cart).where(Cart.id == cart_item_id, Cart.userId == current_user.id)
    result = await db.execute(stmt)
    cart_item = result.scalar_one_or_none()

    if not cart_item or not cart_item.isActive:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found",
        )

    cart_item.isActive = False
    await db.commit()
    return await get_cart(current_user=current_user, db=db)


async def remove_from_cart(
    payload: Optional[RemoveCartRequest],
    current_user: Users,
    db: AsyncSession,
    cart_item_id: Optional[uuid.UUID] = None,
    product_id: Optional[uuid.UUID] = None,
) -> CartResponse:
    """Flexible removal from cart by item ID or product ID."""
    target_item_id = cart_item_id or (payload.cart_item_id if payload else None)
    target_prod_id = product_id or (payload.product_id if payload else None)

    if target_item_id:
        return await remove_cart_item(cart_item_id=target_item_id, current_user=current_user, db=db)
    elif target_prod_id:
        stmt = select(Cart).where(Cart.productId == target_prod_id, Cart.userId == current_user.id, Cart.isActive == True)
        res = await db.execute(stmt)
        item = res.scalar_one_or_none()
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")
        item.isActive = False
        await db.commit()
        return await get_cart(current_user=current_user, db=db)
    else:
        # Clear cart if no IDs provided
        await clear_cart(current_user=current_user, db=db)
        return await get_cart(current_user=current_user, db=db)


async def quantity_inc(
    payload: QuantityChangeRequest,
    current_user: Users,
    db: AsyncSession,
) -> CartResponse:
    """Increment quantity of an item in cart."""
    stmt = None
    if payload.cart_item_id:
        stmt = select(Cart).where(Cart.id == payload.cart_item_id, Cart.userId == current_user.id, Cart.isActive == True)
    elif payload.product_id:
        stmt = select(Cart).where(Cart.productId == payload.product_id, Cart.userId == current_user.id, Cart.isActive == True)
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="cart_item_id or product_id required")

    res = await db.execute(stmt)
    item = res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    item.quantity += payload.amount
    await db.commit()
    return await get_cart(current_user=current_user, db=db)


async def quantity_dec(
    payload: QuantityChangeRequest,
    current_user: Users,
    db: AsyncSession,
) -> CartResponse:
    """Decrement quantity of an item in cart. If <= 0, deactivates item."""
    stmt = None
    if payload.cart_item_id:
        stmt = select(Cart).where(Cart.id == payload.cart_item_id, Cart.userId == current_user.id, Cart.isActive == True)
    elif payload.product_id:
        stmt = select(Cart).where(Cart.productId == payload.product_id, Cart.userId == current_user.id, Cart.isActive == True)
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="cart_item_id or product_id required")

    res = await db.execute(stmt)
    item = res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    item.quantity -= payload.amount
    if item.quantity <= 0:
        item.isActive = False

    await db.commit()
    return await get_cart(current_user=current_user, db=db)


async def clear_cart(
    current_user: Users,
    db: AsyncSession,
) -> MessageResponse:
    """Clear all active items from user's cart."""
    stmt = select(Cart).where(Cart.userId == current_user.id, Cart.isActive == True)
    result = await db.execute(stmt)
    cart_items = result.scalars().all()

    for item in cart_items:
        item.isActive = False

    await db.commit()
    return MessageResponse(message="Cart cleared successfully")
