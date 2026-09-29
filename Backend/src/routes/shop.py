import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..schema.shop import (
    AddToCartRequest,
    UpdateCartItemRequest,
    CartResponse,
    PlaceOrderRequest,
    OrderResponse,
    ProductResponse,
)
from ..schema.auth import MessageResponse
from ..controllers import shop
from ..controllers import auth
from ..models.User import Users
from ..db.desp import get_db

router = APIRouter(prefix="/shop", tags=["SHOP"])


# ------------------ ORDER ROUTES ------------------

@router.post("/order", status_code=status.HTTP_201_CREATED, response_model=OrderResponse)
async def place_new_order(
    payload: PlaceOrderRequest,
    current_user: Users = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Place a new order.
    Supports either:
    1. Cart checkout (purchases all active cart items and clears cart).
    2. Direct Buy ("Buy Now") for a single product without clearing cart.
    """
    return await shop.place_order(payload=payload, current_user=current_user, db=db)


@router.get("/orders", status_code=status.HTTP_200_OK, response_model=List[OrderResponse])
async def list_orders(
    current_user: Users = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all orders placed by the authenticated user."""
    return await shop.list_user_orders(current_user=current_user, db=db)


@router.get("/orders/{order_id}", status_code=status.HTTP_200_OK, response_model=OrderResponse)
async def get_single_order(
    order_id: uuid.UUID,
    current_user: Users = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full details of an order belonging to the authenticated user."""
    return await shop.get_order_details(order_id=order_id, current_user=current_user, db=db)


@router.post("/orders/{order_id}/cancel", status_code=status.HTTP_200_OK, response_model=OrderResponse)
async def cancel_order(
    order_id: uuid.UUID,
    current_user: Users = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cancel a pending order belonging to the authenticated user."""
    return await shop.cancel_order(order_id=order_id, current_user=current_user, db=db)


# ------------------ PRODUCT BROWSING ROUTES ------------------

@router.get("/products", status_code=status.HTTP_200_OK, response_model=List[ProductResponse])
async def browse_products(
    category_id: Optional[uuid.UUID] = Query(None, description="Filter by category ID"),
    search: Optional[str] = Query(None, description="Search keyword in product title"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Browse active products with optional filters."""
    return await shop.list_products(
        db=db,
        category_id=category_id,
        search=search,
        limit=limit,
        offset=offset,
    )


@router.get("/products/{product_id}", status_code=status.HTTP_200_OK, response_model=ProductResponse)
async def get_single_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve details for a single active product."""
    return await shop.get_product(product_id=product_id, db=db)

