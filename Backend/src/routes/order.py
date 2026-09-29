import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..schema.shop import (
    PlaceOrderRequest,
    VerifyOrderRequest,
    PayOrderRequest,
    CancelOrderRequest,
    OrderResponse,
)
from ..controllers import shop, auth
from ..models.User import Users
from ..db.desp import get_db

router = APIRouter(tags=["ORDER"])


@router.post("/place-order", status_code=status.HTTP_201_CREATED, response_model=OrderResponse)
async def place_order(
    payload: PlaceOrderRequest,
    current_user: Users = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Place a new order (from active cart or direct buy)."""
    return await shop.place_order(payload=payload, current_user=current_user, db=db)
 
@router.post("/verify-order", status_code=status.HTTP_200_OK, response_model=OrderResponse)
async def verify_order_status(
    payload: VerifyOrderRequest,
    current_user: Users = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify order and payment authenticity."""
    return await shop.verify_order(payload=payload, current_user=current_user, db=db)


@router.post("/pay", status_code=status.HTTP_200_OK, response_model=OrderResponse)
async def pay_for_order(
    payload: PayOrderRequest,
    current_user: Users = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Initiate or complete payment for an existing order."""
    return await shop.pay_order(payload=payload, current_user=current_user, db=db)


@router.get("/get-order/{order_id}", status_code=status.HTTP_200_OK, response_model=OrderResponse)
async def get_order_by_id(
    order_id: uuid.UUID = Path(..., alias="order_id"),
    current_user: Users = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full details of an order belonging to current user."""
    return await shop.get_order_details(order_id=order_id, current_user=current_user, db=db)


@router.post("/cancel-order", status_code=status.HTTP_200_OK, response_model=OrderResponse)
@router.patch("/cancel-order", status_code=status.HTTP_200_OK, response_model=OrderResponse)
async def cancel_order(
    payload: Optional[CancelOrderRequest] = None,
    order_id: Optional[uuid.UUID] = Query(None),
    current_user: Users = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cancel a pending order belonging to the current user."""
    return await shop.cancel_order_flexible(
        payload=payload,
        order_id=order_id,
        current_user=current_user,
        db=db,
    )


@router.post("/cancel-order/{order_id}", status_code=status.HTTP_200_OK, response_model=OrderResponse)
@router.patch("/cancel-order/{order_id}", status_code=status.HTTP_200_OK, response_model=OrderResponse)
async def cancel_order_by_path(
    order_id: uuid.UUID,
    current_user: Users = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cancel a pending order specified by path param."""
    return await shop.cancel_order_flexible(
        payload=None,
        order_id=order_id,
        current_user=current_user,
        db=db,
    )


@router.get("/orders", status_code=status.HTTP_200_OK, response_model=List[OrderResponse])
async def list_user_orders(
    current_user: Users = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all orders placed by the current user."""
    return await shop.list_user_orders(current_user=current_user, db=db)
