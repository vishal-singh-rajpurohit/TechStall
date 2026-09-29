import uuid
from typing import Optional, List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..models.User import Users
from ..models.Products import Products, Reviews
from ..schema.shop import (
    CreateReviewRequest,
    ReviewItemResponse,
    ProductReviewsResponse,
)
from ..schema.auth import MessageResponse


async def create_or_update_review(
    product_id: uuid.UUID,
    payload: CreateReviewRequest,
    current_user: Users,
    db: AsyncSession,
) -> ReviewItemResponse:
    """Create a new review or update an existing review for a product by the current user."""
    # Verify product exists and is active
    stmt = select(Products).where(Products.id == product_id, Products.isActive == True)
    res = await db.execute(stmt)
    product = res.scalar_one_or_none()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or inactive",
        )

    # Check if user already reviewed this product
    review_stmt = select(Reviews).where(
        Reviews.productId == product_id,
        Reviews.userId == current_user.id,
    )
    review_res = await db.execute(review_stmt)
    existing_review = review_res.scalar_one_or_none()

    if existing_review:
        existing_review.rating = payload.rating
        existing_review.content = payload.content.strip()
        await db.commit()
        await db.refresh(existing_review)
        return ReviewItemResponse(
            id=existing_review.id,
            productId=existing_review.productId,
            userId=existing_review.userId,
            userName=current_user.name,
            rating=existing_review.rating,
            content=existing_review.content,
            created_at=existing_review.created_at,
            updated_at=existing_review.updated_at,
        )

    # Create new review
    new_review = Reviews(
        productId=product_id,
        userId=current_user.id,
        rating=payload.rating,
        content=payload.content.strip(),
    )
    db.add(new_review)
    await db.commit()
    await db.refresh(new_review)

    return ReviewItemResponse(
        id=new_review.id,
        productId=new_review.productId,
        userId=new_review.userId,
        userName=current_user.name,
        rating=new_review.rating,
        content=new_review.content,
        created_at=new_review.created_at,
        updated_at=new_review.updated_at,
    )


async def get_product_reviews(
    product_id: uuid.UUID,
    db: AsyncSession,
) -> ProductReviewsResponse:
    """Retrieve all reviews, computed average rating, and breakdown for a product."""
    # Verify product exists
    prod_stmt = select(Products).where(Products.id == product_id, Products.isActive == True)
    prod_res = await db.execute(prod_stmt)
    product = prod_res.scalar_one_or_none()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    # Fetch reviews with user details
    rev_stmt = (
        select(Reviews)
        .where(Reviews.productId == product_id)
        .options(selectinload(Reviews.user))
        .order_by(Reviews.created_at.desc())
    )
    rev_res = await db.execute(rev_stmt)
    reviews_list = rev_res.scalars().all()

    total_count = len(reviews_list)
    breakdown = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    total_rating_sum = 0

    items: List[ReviewItemResponse] = []
    for r in reviews_list:
        total_rating_sum += r.rating
        if r.rating in breakdown:
            breakdown[r.rating] += 1
        else:
            breakdown[r.rating] = 1

        items.append(
            ReviewItemResponse(
                id=r.id,
                productId=r.productId,
                userId=r.userId,
                userName=r.user.name if r.user else "Verified Customer",
                rating=r.rating,
                content=r.content,
                created_at=r.created_at,
                updated_at=r.updated_at,
            )
        )

    avg_rating = round(total_rating_sum / total_count, 1) if total_count > 0 else 0.0

    return ProductReviewsResponse(
        product_id=product_id,
        average_rating=avg_rating,
        reviews_count=total_count,
        rating_breakdown=breakdown,
        reviews=items,
    )


async def get_user_review_for_product(
    product_id: uuid.UUID,
    current_user: Users,
    db: AsyncSession,
) -> Optional[ReviewItemResponse]:
    """Retrieve current user's review for a product if one exists."""
    stmt = (
        select(Reviews)
        .where(Reviews.productId == product_id, Reviews.userId == current_user.id)
    )
    res = await db.execute(stmt)
    rev = res.scalar_one_or_none()
    if not rev:
        return None

    return ReviewItemResponse(
        id=rev.id,
        productId=rev.productId,
        userId=rev.userId,
        userName=current_user.name,
        rating=rev.rating,
        content=rev.content,
        created_at=rev.created_at,
        updated_at=rev.updated_at,
    )


async def delete_review(
    product_id: uuid.UUID,
    current_user: Users,
    db: AsyncSession,
    review_id: Optional[uuid.UUID] = None,
) -> MessageResponse:
    """Delete a user's review for a product."""
    stmt = select(Reviews).where(
        Reviews.productId == product_id,
        Reviews.userId == current_user.id,
    )
    if review_id:
        stmt = stmt.where(Reviews.id == review_id)

    res = await db.execute(stmt)
    rev = res.scalar_one_or_none()
    if not rev:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found or you do not have permission to delete it",
        )

    await db.delete(rev)
    await db.commit()

    return MessageResponse(message="Review deleted successfully")
