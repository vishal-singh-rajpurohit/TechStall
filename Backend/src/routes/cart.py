import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..schema.shop import (
    AddToCartRequest,
    UpdateCartItemRequest,
    RemoveCartRequest,
    QuantityChangeRequest,
    CartResponse,
)
from ..schema.auth import MessageResponse
from ..controllers import cart, auth
from ..models.User import Users
from ..db.desp import get_db

router = APIRouter(tags=["CART"])


@router.get("/", status_code=status.HTTP_200_OK, response_model=CartResponse)
@router.get("", status_code=status.HTTP_200_OK, response_model=CartResponse)
async def get_user_cart(
    current_user: Users = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all active items in the authenticated user's cart."""
    return await cart.get_cart(current_user=current_user, db=db)


@router.post("/add", status_code=status.HTTP_200_OK, response_model=CartResponse)
async def add_item_to_cart(
    payload: AddToCartRequest,
    current_user: Users = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a product to the user's cart or increment its quantity."""
    return await cart.add_to_cart(payload=payload, current_user=current_user, db=db)


@router.post("/remove", status_code=status.HTTP_200_OK, response_model=CartResponse)
@router.delete("/remove", status_code=status.HTTP_200_OK, response_model=CartResponse)
async def remove_item_from_cart(
    payload: Optional[RemoveCartRequest] = None,
    product_id: Optional[uuid.UUID] = Query(None),
    current_user: Users = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a specific item from the user's cart by payload or product_id."""
    return await cart.remove_from_cart(
        payload=payload,
        cart_item_id=None,
        product_id=product_id,
        current_user=current_user,
        db=db,
    )


@router.delete("/remove/{cart_item_id}", status_code=status.HTTP_200_OK, response_model=CartResponse)
async def remove_cart_item_by_path(
    cart_item_id: uuid.UUID,
    current_user: Users = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove an item from cart specified by path param."""
    return await cart.remove_from_cart(
        payload=None,
        cart_item_id=cart_item_id,
        product_id=None,
        current_user=current_user,
        db=db,
    )


@router.post("/quantity-inc", status_code=status.HTTP_200_OK, response_model=CartResponse)
@router.patch("/quantity-inc", status_code=status.HTTP_200_OK, response_model=CartResponse)
async def increment_cart_item(
    payload: QuantityChangeRequest,
    current_user: Users = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Increment the quantity of an item in the cart."""
    return await cart.quantity_inc(payload=payload, current_user=current_user, db=db)


@router.post("/quantity-dec", status_code=status.HTTP_200_OK, response_model=CartResponse)
@router.patch("/quantity-dec", status_code=status.HTTP_200_OK, response_model=CartResponse)
async def decrement_cart_item(
    payload: QuantityChangeRequest,
    current_user: Users = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Decrement the quantity of an item in the cart."""
    return await cart.quantity_dec(payload=payload, current_user=current_user, db=db)


@router.delete("/", status_code=status.HTTP_200_OK, response_model=MessageResponse)
async def clear_cart(
    current_user: Users = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Clear all active items from the user's cart."""
    return await cart.clear_cart(current_user=current_user, db=db)
