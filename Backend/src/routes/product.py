import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..schema.shop import (
    ProductResponse,
    PaginatedProductsResponse,
    CreateReviewRequest,
    ReviewItemResponse,
    ProductReviewsResponse,
)
from ..schema.auth import MessageResponse
from ..controllers import browse, review, auth
from ..models.User import Users
from ..db.desp import get_db


router = APIRouter(tags=["PRODUCT"])


@router.get("/categories", status_code=status.HTTP_200_OK)
async def get_all_categories(db: AsyncSession = Depends(get_db)):
    """Retrieve all available product categories."""
    return await browse.list_all_categories(db=db)


@router.get("/brands", status_code=status.HTTP_200_OK)
async def get_all_brands(db: AsyncSession = Depends(get_db)):
    """Retrieve all distinct product brands."""
    return await browse.list_all_brands(db=db)


@router.get("/get/products", status_code=status.HTTP_200_OK, response_model=List[ProductResponse])
@router.get("/products", status_code=status.HTTP_200_OK, response_model=List[ProductResponse])
async def get_all_products(
    category_id: Optional[uuid.UUID] = Query(None, description="Filter by category ID"),
    search: Optional[str] = Query(None, description="Search keyword in product title"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all active products with optional category and search filters."""
    return await browse.list_products(
        db=db,
        category_id=category_id,
        search=search,
        limit=limit,
        offset=offset,
    )


@router.get("/get/{product_id}", status_code=status.HTTP_200_OK, response_model=ProductResponse)
@router.get("/products/{product_id}", status_code=status.HTTP_200_OK, response_model=ProductResponse)
async def get_product_by_id(
    product_id: uuid.UUID = Path(..., alias="product_id"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve details for a single active product."""
    return await browse.get_product(product_id=product_id, db=db)


@router.get("/category/{cat}/{page}/{limit}", status_code=status.HTTP_200_OK, response_model=PaginatedProductsResponse)
async def get_products_by_category_paged(
    cat: str = Path(..., description="Category title or Category UUID"),
    page: int = Path(..., ge=1, description="Page number"),
    limit: int = Path(..., ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve paginated products for a specified category."""
    return await browse.get_products_by_category_paginated(
        cat=cat,
        page=page,
        limit=limit,
        db=db,
    )


@router.get("/category/{cat}", status_code=status.HTTP_200_OK, response_model=PaginatedProductsResponse)
async def get_products_by_category_default(
    cat: str = Path(..., description="Category title or Category UUID"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve products for a specified category with query parameters."""
    return await browse.get_products_by_category_paginated(
        cat=cat,
        page=page,
        limit=limit,
        db=db,
    )


# ---------------- PRODUCT REVIEWS & RATINGS ----------------

@router.post("/get/{product_id}/reviews", status_code=status.HTTP_201_CREATED, response_model=ReviewItemResponse)
@router.post("/{product_id}/reviews", status_code=status.HTTP_201_CREATED, response_model=ReviewItemResponse)
async def create_or_update_product_review(
    payload: CreateReviewRequest,
    product_id: uuid.UUID = Path(..., alias="product_id"),
    current_user: Users = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit a rating and review for a product, or update an existing review."""
    return await review.create_or_update_review(
        product_id=product_id,
        payload=payload,
        current_user=current_user,
        db=db,
    )


@router.get("/get/{product_id}/reviews", status_code=status.HTTP_200_OK, response_model=ProductReviewsResponse)
@router.get("/{product_id}/reviews", status_code=status.HTTP_200_OK, response_model=ProductReviewsResponse)
async def get_product_reviews(
    product_id: uuid.UUID = Path(..., alias="product_id"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all ratings, average score, breakdown, and customer reviews for a product."""
    return await review.get_product_reviews(
        product_id=product_id,
        db=db,
    )


@router.get("/get/{product_id}/reviews/my-review", status_code=status.HTTP_200_OK, response_model=Optional[ReviewItemResponse])
@router.get("/{product_id}/reviews/my-review", status_code=status.HTTP_200_OK, response_model=Optional[ReviewItemResponse])
async def get_my_product_review(
    product_id: uuid.UUID = Path(..., alias="product_id"),
    current_user: Users = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve the current user's review for this product if already submitted."""
    return await review.get_user_review_for_product(
        product_id=product_id,
        current_user=current_user,
        db=db,
    )


@router.delete("/get/{product_id}/reviews", status_code=status.HTTP_200_OK, response_model=MessageResponse)
@router.delete("/{product_id}/reviews", status_code=status.HTTP_200_OK, response_model=MessageResponse)
async def delete_product_review(
    product_id: uuid.UUID = Path(..., alias="product_id"),
    review_id: Optional[uuid.UUID] = Query(None, description="Specific review ID to delete"),
    current_user: Users = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete the current user's review for a product."""
    return await review.delete_review(
        product_id=product_id,
        current_user=current_user,
        db=db,
        review_id=review_id,
    )

