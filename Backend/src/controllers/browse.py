import uuid
import math
from typing import Optional, List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, case
from sqlalchemy.orm import selectinload

from ..models.User import Users, Cart
from ..models.Products import Products, Category, ProductsEmbeddings
from ..models.Orders import Orders, OrderItems, StatusEnum
from ..models.Payment import RazorpayPayment, PaymentStatusEnum
from ..schema.shop import (
    AddToCartRequest,
    UpdateCartItemRequest,
    CartItemResponse,
    CartResponse,
    ProductSummary,
    ProductResponse,
    PaginatedProductsResponse,
    PlaceOrderRequest,
    OrderItemResponse,
    PaymentSummaryResponse,
    OrderResponse,
)
from ..schema.auth import MessageResponse
from ..utils.embedding import embed_query

def _format_product_response(p: Products) -> ProductResponse:
    media_list = getattr(p, "media", []) or []
    image_urls = [m.url for m in media_list if m.media_type == "image"] or p.images or []
    video_urls = [m.url for m in media_list if m.media_type == "video"]
    cat_title = p.category.title if getattr(p, "category", None) else None

    rev_list = getattr(p, "reviews", []) or []
    rev_count = len(rev_list)
    avg_rating = round(sum(r.rating for r in rev_list) / rev_count, 1) if rev_count > 0 else 0.0

    return ProductResponse(
        id=p.id,
        title=p.title,
        description=p.description or [],
        isActive=p.isActive,
        price=p.price,
        selling_price=p.selling_price,
        stock=p.stock,
        brand=p.brand,
        sku=p.sku,
        category=cat_title,
        images=image_urls,
        videos=video_urls,
        media=media_list,
        specifications=p.specifications or "{}",
        caregory_id=p.caregory_id,
        seller_id=p.seller_id,
        rating=avg_rating,
        reviews_count=rev_count,
        created_at=p.created_at,
        updated_at=p.updated_at,
    )


# ------------------ PRODUCT BROWSING ------------------

async def list_products(
    db: AsyncSession,
    category_id: Optional[uuid.UUID] = None,
    search: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
) -> List[ProductResponse]:
    """Browse active products with optional category and search filters, including media gallery."""

    stmt = (
        select(Products)
        .where(Products.isActive == True)
        .options(
            selectinload(Products.media),
            selectinload(Products.category),
            selectinload(Products.reviews),
        )
    )

    if category_id:
        stmt = stmt.where(Products.caregory_id == category_id)

    if search:
        embeddings = await embed_query(search)

        stmt = (
        stmt.outerjoin(ProductsEmbeddings, ProductsEmbeddings.product_id == Products.id)
        .order_by(
            case(
                (ProductsEmbeddings.embedding.is_not(None),
                 ProductsEmbeddings.embedding.cosine_distance(embeddings)),
                else_=1.0  # push no-embedding products to the back, but don't exclude them
            )
        )
    )

    stmt = stmt.limit(limit).offset(offset)
    result = await db.execute(stmt)
    products = result.scalars().all()

    return [_format_product_response(p) for p in products]


async def get_product(
    product_id: uuid.UUID,
    db: AsyncSession,
) -> ProductResponse:
    """Get single product details with full media gallery and reviews."""
    stmt = (
        select(Products)
        .where(Products.id == product_id, Products.isActive == True)
        .options(
            selectinload(Products.media),
            selectinload(Products.category),
            selectinload(Products.reviews),
        )
    )
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return _format_product_response(product)


async def get_products_by_category_paginated(
    cat: str,
    page: int,
    limit: int,
    db: AsyncSession,
) -> PaginatedProductsResponse:
    """Retrieve paginated products by category name or UUID."""
    page = max(1, page)
    limit = max(1, min(100, limit))
    offset = (page - 1) * limit

    is_uuid = False
    cat_uuid = None
    try:
        cat_uuid = uuid.UUID(cat)
        is_uuid = True
    except (ValueError, AttributeError):
        is_uuid = False

    if is_uuid:
        count_stmt = select(func.count(Products.id)).where(Products.isActive == True, Products.caregory_id == cat_uuid)
        stmt = (
            select(Products)
            .where(Products.isActive == True, Products.caregory_id == cat_uuid)
            .options(
                selectinload(Products.media),
                selectinload(Products.category),
                selectinload(Products.reviews),
            )
            .order_by(Products.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
    else:
        count_stmt = (
            select(func.count(Products.id))
            .join(Category, Products.caregory_id == Category.id, isouter=True)
            .where(
                Products.isActive == True,
                or_(
                    Category.title.ilike(f"%{cat}%"),
                    Products.title.ilike(f"%{cat}%"),
                ),
            )
        )
        stmt = (
            select(Products)
            .join(Category, Products.caregory_id == Category.id, isouter=True)
            .where(
                Products.isActive == True,
                or_(
                    Category.title.ilike(f"%{cat}%"),
                    Products.title.ilike(f"%{cat}%"),
                ),
            )
            .options(
                selectinload(Products.media),
                selectinload(Products.category),
                selectinload(Products.reviews),
            )
            .order_by(Products.created_at.desc())
            .limit(limit)
            .offset(offset)
        )

    count_res = await db.execute(count_stmt)
    total = count_res.scalar() or 0

    res = await db.execute(stmt)
    products = res.scalars().all()

    total_pages = math.ceil(total / limit) if total > 0 else 1

    return PaginatedProductsResponse(
        products=[_format_product_response(p) for p in products],
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
        category=cat,
    )
