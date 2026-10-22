import uuid
import json
import logging
from typing import Optional, Any, List

logger = logging.getLogger(__name__)
from fastapi import Request, Response, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from sqlalchemy.orm import selectinload

from ..models.Seller import Seller
from ..models.Products import Products, Category, Media, ProductsEmbeddings
from ..models.Orders import Orders, OrderItems
from ..services.cloudinary_service import cloudinary_service
from ..schema.seller import (
    SellerRegisterRequest,
    SellerLoginRequest,
    SellerUpdateRequest,
    SellerResponse,
    SellerAuthResponse,
    SellerTokenResponse,
)
from ..schema.auth import MessageResponse
from ..utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    set_seller_auth_cookies,
    clear_seller_auth_cookies,
)
from ..db.desp import get_db
from ..utils.embedding import embed_product


async def get_current_seller_optional(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> Optional[Seller]:
    """Retrieve current seller from Authorization header or cookie, or None if unauthenticated."""
    token: Optional[str] = None

    auth_header = request.headers.get("Authorization") or request.headers.get("authorization")
    if auth_header and auth_header.lower().startswith("bearer "):
        token = auth_header.split(" ", 1)[1].strip()

    if not token:
        token = request.cookies.get("seller_access_token") or request.cookies.get("access_token")

    if not token:
        return None

    try:
        payload = decode_token(token, is_refresh=False)
        seller_id_str = payload.get("sub") or payload.get("id") or payload.get("seller_id")
        token_type = payload.get("type", "access")
        role = payload.get("role", "seller")
        if not seller_id_str:
            return None
        if token_type and token_type != "access":
            return None
        if role and role not in ("seller", "admin"):
            return None
        seller_id = uuid.UUID(str(seller_id_str))
    except Exception:
        return None

    stmt = select(Seller).where(Seller.id == seller_id)
    result = await db.execute(stmt)
    seller = result.scalar_one_or_none()

    if not seller or not seller.isActive:
        return None

    return seller


async def get_current_seller(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> Seller:
    """Enforce seller authentication and return the current active seller."""
    seller = await get_current_seller_optional(request=request, db=db)
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate seller credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return seller


async def register(
    payload: SellerRegisterRequest,
    response: Response,
    db: AsyncSession,
) -> SellerAuthResponse:
    """Register a new seller, hash password, create DB record, and set auth cookies."""
    clean_email = payload.email.strip().lower()
    stmt = select(Seller).where(func.lower(Seller.email) == clean_email)
    result = await db.execute(stmt)
    existing_seller = result.scalar_one_or_none()

    if existing_seller:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A seller account with this email already exists",
        )

    password_hashed = hash_password(payload.password)

    new_seller = Seller(
        name=payload.name.strip(),
        email=clean_email,
        password_hash=password_hashed,
        mobile_number=payload.mobile_number,
        address=payload.address,
        city=payload.city,
        state=payload.state,
        pin_code=payload.pin_code,
        refresh_token="",
        isVerified=False,
        isActive=True,
    )
    db.add(new_seller)
    await db.flush()

    token_payload = {
        "sub": str(new_seller.id),
        "email": new_seller.email,
        "role": "seller",
    }
    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token(token_payload)

    new_seller.refresh_token = refresh_token
    await db.commit()
    await db.refresh(new_seller)

    set_seller_auth_cookies(response, access_token=access_token, refresh_token=refresh_token)

    return SellerAuthResponse(
        message="Seller registered successfully",
        seller=SellerResponse.model_validate(new_seller),
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


async def login(
    payload: SellerLoginRequest,
    response: Response,
    db: AsyncSession,
) -> SellerAuthResponse:
    """Authenticate seller credentials, issue tokens, and set auth cookies."""
    clean_email = payload.email.strip().lower()
    stmt = select(Seller).where(func.lower(Seller.email) == clean_email)
    result = await db.execute(stmt)
    seller = result.scalar_one_or_none()

    if not seller or not verify_password(payload.password, seller.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid seller email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not seller.isActive:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seller account is inactive or suspended",
        )

    token_payload = {
        "sub": str(seller.id),
        "email": seller.email,
        "role": "seller",
    }
    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token(token_payload)

    seller.refresh_token = refresh_token
    await db.commit()
    await db.refresh(seller)

    set_seller_auth_cookies(response, access_token=access_token, refresh_token=refresh_token)

    return SellerAuthResponse(
        message="Seller login successful",
        seller=SellerResponse.model_validate(seller),
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


async def logout(
    response: Response,
    db: AsyncSession,
    current_seller: Optional[Seller] = None,
) -> MessageResponse:
    """Clear seller cookies and invalidate refresh token in database."""
    if current_seller:
        current_seller.refresh_token = ""
        await db.commit()

    clear_seller_auth_cookies(response)
    return MessageResponse(message="Seller successfully logged out")


async def refresh_tokens(
    request: Request,
    response: Response,
    db: AsyncSession,
) -> SellerTokenResponse:
    """Refresh seller access and refresh tokens using cookie or Authorization header."""
    refresh_token = request.cookies.get("seller_refresh_token")

    if not refresh_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            refresh_token = auth_header.split(" ", 1)[1]

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Seller refresh token not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        decoded = decode_token(refresh_token, is_refresh=True)
        seller_id_str = decoded.get("sub")
        token_type = decoded.get("type")
        role = decoded.get("role")
        if not seller_id_str or token_type != "refresh" or role != "seller":
            raise ValueError()
        seller_id = uuid.UUID(seller_id_str)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired seller refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    stmt = select(Seller).where(Seller.id == seller_id)
    result = await db.execute(stmt)
    seller = result.scalar_one_or_none()

    if not seller or not seller.isActive:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Seller not found or inactive",
        )

    if seller.refresh_token and seller.refresh_token != refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Seller refresh token is no longer valid",
        )

    token_payload = {
        "sub": str(seller.id),
        "email": seller.email,
        "role": "seller",
    }
    new_access_token = create_access_token(token_payload)
    new_refresh_token = create_refresh_token(token_payload)

    seller.refresh_token = new_refresh_token
    await db.commit()

    set_seller_auth_cookies(response, access_token=new_access_token, refresh_token=new_refresh_token)

    return SellerTokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
    )


async def me(current_seller: Seller) -> SellerResponse:
    """Return the profile of the currently authenticated seller."""
    return SellerResponse.model_validate(current_seller)


async def update_me(
    payload: SellerUpdateRequest,
    current_seller: Seller,
    db: AsyncSession,
) -> SellerResponse:
    """Update profile details of the authenticated seller."""
    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if value is not None:
            setattr(current_seller, field, value)

    await db.commit()
    await db.refresh(current_seller)
    return SellerResponse.model_validate(current_seller)


async def verify(
    current_seller: Optional[Seller],
    db: AsyncSession,
    payload: Optional[dict] = None,
) -> MessageResponse:
    """Verify seller account."""
    if current_seller:
        current_seller.isVerified = True
        await db.commit()
        return MessageResponse(message="Seller account verified successfully", status="OK")
    return MessageResponse(message="Seller verification confirmed", status="OK")


def _format_media_item(m: Media) -> dict:
    return {
        "id": str(m.id),
        "product_id": str(m.product_id),
        "media_type": m.media_type,
        "url": m.url,
        "public_id": m.public_id,
        "thumbnail_url": m.thumbnail_url,
        "format": m.format,
        "bytes": m.bytes,
        "width": m.width,
        "height": m.height,
        "is_primary": m.is_primary,
        "order": m.order,
        "created_at": m.created_at.isoformat() if m.created_at else None,
        "updated_at": m.updated_at.isoformat() if m.updated_at else None,
    }


# ------------------- SELLER PRODUCT CONTROLLERS ------------------
 
async def upload_media_asset(
    file_or_url: str,
    media_type: str = "auto",
    is_primary: bool = False,
    order: int = 0,
) -> dict:
    """Upload media file/url to Cloudinary and return normalized metadata."""
    return await cloudinary_service.upload_asset(
        file_or_url=file_or_url,
        media_type=media_type,
        is_primary=is_primary,
        order=order,
    )


async def new_product(
    payload: Any,
    current_seller: Seller,
    db: AsyncSession,
) -> dict:
    """Create a new product listing owned by the seller, storing media in the media table via Cloudinary."""
    category_id = payload.category_id
    cat_obj = None

    # If category title is provided but not category_id, find or create category
    if not category_id and payload.category_title:
        cat_stmt = select(Category).where(Category.title.ilike(payload.category_title))
        cat_res = await db.execute(cat_stmt)
        cat_obj = cat_res.scalar_one_or_none()
        if not cat_obj:
            cat_obj = Category(title=payload.category_title)
            db.add(cat_obj)
            await db.flush()
        category_id = cat_obj.id

    specs_str = "{}"
    if payload.specifications:
        specs_str = json.dumps(payload.specifications)

    new_prod = Products(
        title=payload.title,
        description=payload.description or [],
        price=payload.price,
        selling_price=payload.selling_price,
        stock=payload.stock,
        brand=payload.brand or "Generic",
        sku=payload.sku,
        images=[],
        specifications=specs_str,
        caregory_id=category_id,
        seller_id=current_seller.id,
        isActive=True,
    )
    db.add(new_prod)
    await db.flush()

    # Process and store media in the media table via Cloudinary
    media_records: List[Media] = []
    image_urls: List[str] = []
    video_urls: List[str] = []

    # 1. Process explicit media objects
    if getattr(payload, "media", None):
        for idx, item in enumerate(payload.media):
            item_data = item.model_dump() if hasattr(item, "model_dump") else (item if isinstance(item, dict) else item.__dict__)
            uploaded = await cloudinary_service.upload_asset(
                file_or_url=item_data.get("url"),
                media_type=item_data.get("media_type") or "auto",
                public_id=item_data.get("public_id"),
                is_primary=item_data.get("is_primary", False) or (idx == 0),
                order=item_data.get("order", idx),
            )
            media_obj = Media(
                id=uuid.uuid4(),
                product_id=new_prod.id,
                media_type=uploaded["media_type"],
                url=uploaded["url"],
                public_id=uploaded.get("public_id"),
                thumbnail_url=uploaded.get("thumbnail_url"),
                format=uploaded.get("format"),
                bytes=uploaded.get("bytes"),
                width=uploaded.get("width"),
                height=uploaded.get("height"),
                is_primary=uploaded.get("is_primary", False),
                order=uploaded.get("order", idx),
            )
            media_records.append(media_obj)
            if uploaded["media_type"] == "image":
                image_urls.append(uploaded["url"])
            else:
                video_urls.append(uploaded["url"])

    # 2. Process legacy/convenience images list
    if getattr(payload, "images", None):
        for idx, img_url in enumerate(payload.images):
            if img_url not in image_urls:
                uploaded = await cloudinary_service.upload_asset(
                    file_or_url=img_url,
                    media_type="image",
                    is_primary=(len(image_urls) == 0),
                    order=len(media_records),
                )
                media_obj = Media(
                    id=uuid.uuid4(),
                    product_id=new_prod.id,
                    media_type="image",
                    url=uploaded["url"],
                    public_id=uploaded.get("public_id"),
                    thumbnail_url=uploaded.get("thumbnail_url"),
                    format=uploaded.get("format"),
                    bytes=uploaded.get("bytes"),
                    width=uploaded.get("width"),
                    height=uploaded.get("height"),
                    is_primary=(len(image_urls) == 0),
                    order=len(media_records),
                )
                media_records.append(media_obj)
                image_urls.append(uploaded["url"])

    # 3. Process videos list
    if getattr(payload, "videos", None):
        for idx, vid_url in enumerate(payload.videos):
            if vid_url not in video_urls:
                uploaded = await cloudinary_service.upload_asset(
                    file_or_url=vid_url,
                    media_type="video",
                    is_primary=False,
                    order=len(media_records),
                )
                media_obj = Media(
                    id=uuid.uuid4(),
                    product_id=new_prod.id,
                    media_type="video",
                    url=uploaded["url"],
                    public_id=uploaded.get("public_id"),
                    thumbnail_url=uploaded.get("thumbnail_url"),
                    format=uploaded.get("format"),
                    bytes=uploaded.get("bytes"),
                    width=uploaded.get("width"),
                    height=uploaded.get("height"),
                    is_primary=False,
                    order=len(media_records),
                )
                media_records.append(media_obj)
                video_urls.append(uploaded["url"])

    new_prod.images = image_urls
    if media_records:
        db.add_all(media_records)

    # Generating Embedding
    try:
        category_name = cat_obj.title if cat_obj else "Uncategorized"
        desctiption_text = f"""
        title: {new_prod.title},
        description: {new_prod.description},
        category: {category_name},
        brand: {new_prod.brand},
        specifications: {new_prod.specifications},
        price: {new_prod.price},
        selling_price: {new_prod.selling_price}
        """
        embedding = await embed_product(desctiption_text)

        new_embedding = ProductsEmbeddings(
            product_id=new_prod.id,
            embedding=embedding
        )
        db.add(new_embedding)

    except Exception as e:
        logger.error(f"Embedding generation failed for product {new_prod.id}: {e}")


    await db.commit()
    await db.refresh(new_prod)

    # Re-fetch with media relation
    prod_stmt = select(Products).where(Products.id == new_prod.id).options(selectinload(Products.media))
    prod_res = await db.execute(prod_stmt)
    full_prod = prod_res.scalar_one()

    return {
        "message": "Product created successfully",
        "id": str(full_prod.id),
        "product_id": str(full_prod.id),
        "product": {
            "id": str(full_prod.id),
            "title": full_prod.title,
            "sku": full_prod.sku,
            "price": full_prod.price,
            "selling_price": full_prod.selling_price,
            "stock": full_prod.stock,
            "brand": full_prod.brand,
            "images": [m.url for m in full_prod.media if m.media_type == "image"] or full_prod.images,
            "videos": [m.url for m in full_prod.media if m.media_type == "video"],
            "media": [_format_media_item(m) for m in full_prod.media],
            "isActive": full_prod.isActive,
            "category_id": str(full_prod.caregory_id) if full_prod.caregory_id else None,
            "seller_id": str(full_prod.seller_id),
            "created_at": full_prod.created_at.isoformat() if full_prod.created_at else None,
        },
        "status": "OK",
    }


async def modify_product(
    product_id: Optional[uuid.UUID],
    payload: Any,
    current_seller: Seller,
    db: AsyncSession,
) -> dict:
    """Modify details of a product owned by the seller, updating media in the media table via Cloudinary."""
    target_id = product_id or getattr(payload, "product_id", None)
    if not target_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="product_id is required in path or request body",
        )

    if isinstance(target_id, str):
        try:
            target_id = uuid.UUID(target_id)
        except Exception:
            pass

    stmt = select(Products).where(Products.id == target_id).options(selectinload(Products.media))
    res = await db.execute(stmt)
    prod = res.scalar_one_or_none()

    if not prod:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    # Associate product with the authenticated seller
    if prod.seller_id is None or prod.seller_id != current_seller.id:
        prod.seller_id = current_seller.id

    if payload.title is not None:
        prod.title = payload.title
    if payload.description is not None:
        prod.description = payload.description if isinstance(payload.description, list) else [payload.description]
    if payload.price is not None:
        prod.price = payload.price
    if payload.selling_price is not None:
        prod.selling_price = payload.selling_price
    if payload.stock is not None:
        prod.stock = payload.stock
    if payload.brand is not None:
        prod.brand = payload.brand
    if payload.sku is not None:
        prod.sku = payload.sku
    if payload.isActive is not None:
        prod.isActive = payload.isActive
    if payload.specifications is not None:
        prod.specifications = payload.specifications if isinstance(payload.specifications, str) else json.dumps(payload.specifications)

    if payload.category_id is not None:
        prod.caregory_id = payload.category_id
    elif getattr(payload, "category_title", None):
        cat_stmt = select(Category).where(Category.title.ilike(payload.category_title))
        cat_res = await db.execute(cat_stmt)
        cat_obj = cat_res.scalar_one_or_none()
        if not cat_obj:
            cat_obj = Category(title=payload.category_title)
            db.add(cat_obj)
            await db.flush()
        prod.caregory_id = cat_obj.id

    # Handle Media updates
    media_updated = False
    if getattr(payload, "media", None) is not None:
        # Full media replacement
        await db.execute(delete(Media).where(Media.product_id == prod.id))
        new_media_records: List[Media] = []
        for idx, item in enumerate(payload.media):
            item_data = item.model_dump() if hasattr(item, "model_dump") else (item if isinstance(item, dict) else item.__dict__)
            uploaded = await cloudinary_service.upload_asset(
                file_or_url=item_data.get("url"),
                media_type=item_data.get("media_type") or "auto",
                public_id=item_data.get("public_id"),
                is_primary=item_data.get("is_primary", False) or (idx == 0),
                order=item_data.get("order", idx),
            )
            media_obj = Media(
                id=uuid.uuid4(),
                product_id=prod.id,
                media_type=uploaded["media_type"],
                url=uploaded["url"],
                public_id=uploaded.get("public_id"),
                thumbnail_url=uploaded.get("thumbnail_url"),
                format=uploaded.get("format"),
                bytes=uploaded.get("bytes"),
                width=uploaded.get("width"),
                height=uploaded.get("height"),
                is_primary=uploaded.get("is_primary", False),
                order=uploaded.get("order", idx),
            )
            new_media_records.append(media_obj)
        if new_media_records:
            db.add_all(new_media_records)
        media_updated = True
    else:
        # Check if images or videos were provided separately
        if getattr(payload, "images", None) is not None:
            await db.execute(delete(Media).where(Media.product_id == prod.id, Media.media_type == "image"))
            new_imgs: List[Media] = []
            for idx, img_url in enumerate(payload.images):
                uploaded = await cloudinary_service.upload_asset(
                    file_or_url=img_url,
                    media_type="image",
                    is_primary=(idx == 0),
                    order=idx,
                )
                new_imgs.append(Media(
                    id=uuid.uuid4(),
                    product_id=prod.id,
                    media_type="image",
                    url=uploaded["url"],
                    public_id=uploaded.get("public_id"),
                    thumbnail_url=uploaded.get("thumbnail_url"),
                    format=uploaded.get("format"),
                    bytes=uploaded.get("bytes"),
                    width=uploaded.get("width"),
                    height=uploaded.get("height"),
                    is_primary=(idx == 0),
                    order=idx,
                ))
            if new_imgs:
                db.add_all(new_imgs)
            media_updated = True

        if getattr(payload, "videos", None) is not None:
            await db.execute(delete(Media).where(Media.product_id == prod.id, Media.media_type == "video"))
            new_vids: List[Media] = []
            for idx, vid_url in enumerate(payload.videos):
                uploaded = await cloudinary_service.upload_asset(
                    file_or_url=vid_url,
                    media_type="video",
                    is_primary=False,
                    order=idx + 10,
                )
                new_vids.append(Media(
                    id=uuid.uuid4(),
                    product_id=prod.id,
                    media_type="video",
                    url=uploaded["url"],
                    public_id=uploaded.get("public_id"),
                    thumbnail_url=uploaded.get("thumbnail_url"),
                    format=uploaded.get("format"),
                    bytes=uploaded.get("bytes"),
                    width=uploaded.get("width"),
                    height=uploaded.get("height"),
                    is_primary=False,
                    order=idx + 10,
                ))
            if new_vids:
                db.add_all(new_vids)
            media_updated = True

    await db.commit()
    await db.refresh(prod)

    # Re-fetch with media relation
    prod_stmt = select(Products).where(Products.id == prod.id).options(selectinload(Products.media), selectinload(Products.category))
    prod_res = await db.execute(prod_stmt)
    full_prod = prod_res.scalar_one()

    # Re-sync images field on product
    img_urls = [m.url for m in full_prod.media if m.media_type == "image"]
    if img_urls and full_prod.images != img_urls:
        full_prod.images = img_urls
        await db.commit()

    # Re-sync vector embeddings for semantic search
    try:
        category_name = full_prod.category.title if full_prod.category else "Uncategorized"
        desc_text = f"""
        title: {full_prod.title},
        description: {full_prod.description},
        category: {category_name},
        price: {full_prod.price},
        selling_price: {full_prod.selling_price}
        """
        embedding = await embed_product(desc_text)
        emb_stmt = select(ProductsEmbeddings).where(ProductsEmbeddings.product_id == full_prod.id)
        emb_res = await db.execute(emb_stmt)
        existing_emb = emb_res.scalar_one_or_none()
        if existing_emb:
            existing_emb.embedding = embedding
        else:
            db.add(ProductsEmbeddings(product_id=full_prod.id, embedding=embedding))
        await db.commit()
    except Exception as e:
        logger.warning(f"Embedding sync notice for product {full_prod.id}: {e}")

    prod_images = [m.url for m in full_prod.media if m.media_type == "image"] or full_prod.images
    return {
        "message": "Product updated successfully",
        "product_id": str(full_prod.id),
        "title": full_prod.title,
        "stock": full_prod.stock,
        "selling_price": full_prod.selling_price,
        "isActive": full_prod.isActive,
        "images": prod_images,
        "videos": [m.url for m in full_prod.media if m.media_type == "video"],
        "media": [_format_media_item(m) for m in full_prod.media],
        "status": "OK",
        "product": {
            "id": str(full_prod.id),
            "title": full_prod.title,
            "stock": full_prod.stock,
            "selling_price": full_prod.selling_price,
            "isActive": full_prod.isActive,
            "images": prod_images,
        },
    }


async def delete_product(
    product_id: Optional[uuid.UUID],
    current_seller: Seller,
    db: AsyncSession,
    payload: Optional[Any] = None,
) -> MessageResponse:
    """Unlist a product by setting isActive = False."""
    target_id = product_id or (payload.product_id if payload and hasattr(payload, "product_id") else None)
    if not target_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="product_id is required either in query or body",
        )

    if isinstance(target_id, str):
        try:
            target_id = uuid.UUID(target_id)
        except Exception:
            pass

    stmt = select(Products).where(Products.id == target_id)
    res = await db.execute(stmt)
    prod = res.scalar_one_or_none()

    if not prod:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    if prod.seller_id and prod.seller_id != current_seller.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this product",
        )
    prod.isActive = False
    await db.commit()

    return MessageResponse(message="Product successfully unlisted", status="OK")


async def get_seller_products(
    current_seller: Seller,
    db: AsyncSession,
    product_id: Optional[uuid.UUID] = None,
) -> Any:
    """Retrieve seller's products or a single product with full media gallery."""
    if product_id:
        if isinstance(product_id, str):
            try:
                product_id = uuid.UUID(product_id)
            except Exception:
                pass
        stmt = (
            select(Products)
            .where(Products.id == product_id)
            .options(
                selectinload(Products.media),
                selectinload(Products.category),
            )
        )
        res = await db.execute(stmt)
        prod = res.scalar_one_or_none()
        if not prod:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        return {
            "id": str(prod.id),
            "title": prod.title,
            "sku": prod.sku,
            "brand": prod.brand,
            "price": prod.price,
            "selling_price": prod.selling_price,
            "stock": prod.stock,
            "images": [m.url for m in prod.media if m.media_type == "image"] or prod.images,
            "videos": [m.url for m in prod.media if m.media_type == "video"],
            "media": [_format_media_item(m) for m in prod.media],
            "description": prod.description,
            "specifications": prod.specifications,
            "category": prod.category.title if prod.category else "monitors",
            "isActive": prod.isActive,
            "category_id": str(prod.caregory_id) if prod.caregory_id else None,
            "created_at": prod.created_at.isoformat() if prod.created_at else None,
        }

    stmt = (
        select(Products)
        .where(Products.seller_id == current_seller.id)
        .options(
            selectinload(Products.media),
            selectinload(Products.category),
        )
        .order_by(Products.created_at.desc())
    )
    res = await db.execute(stmt)
    products = res.scalars().all()

    return [
        {
            "id": str(p.id),
            "title": p.title,
            "sku": p.sku,
            "brand": p.brand,
            "price": p.price,
            "selling_price": p.selling_price,
            "stock": p.stock,
            "images": [m.url for m in p.media if m.media_type == "image"] or p.images,
            "videos": [m.url for m in p.media if m.media_type == "video"],
            "media": [_format_media_item(m) for m in p.media],
            "description": p.description,
            "specifications": p.specifications,
            "category": p.category.title if p.category else "monitors",
            "isActive": p.isActive,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in products
    ]


async def change_stock(
    payload: Any,
    current_seller: Seller,
    db: AsyncSession,
) -> dict:
    """Change the stock quantity of a seller's product."""
    stmt = select(Products).where(Products.id == payload.product_id, Products.seller_id == current_seller.id)
    res = await db.execute(stmt)
    prod = res.scalar_one_or_none()

    if not prod:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or not owned by current seller",
        )

    if payload.stock is not None:
        prod.stock = payload.stock
    elif payload.adjustment is not None:
        prod.stock = max(0, prod.stock + payload.adjustment)

    await db.commit()
    await db.refresh(prod)

    return {
        "message": "Stock updated successfully",
        "product_id": str(prod.id),
        "stock": prod.stock,
        "product": {
            "id": str(prod.id),
            "stock": prod.stock,
            "title": prod.title,
        },
        "status": "OK",
    }

# ------------------- SELLER ORDERS CONTROLLERS ------------------

async def get_seller_orders(
    current_seller: Seller,
    db: AsyncSession,
) -> List[dict]:
    """Retrieve all orders containing items from this seller."""
    # Find orders that have order_items for seller's products
    stmt = (
        select(Orders)
        .join(OrderItems, OrderItems.orderId == Orders.id)
        .join(Products, Products.id == OrderItems.productId)
        .where(Products.seller_id == current_seller.id)
        .options(
            selectinload(Orders.items).selectinload(OrderItems.product),
            selectinload(Orders.payments),
            selectinload(Orders.user),
        )
        .distinct()
        .order_by(Orders.created_at.desc())
    )
    res = await db.execute(stmt)
    orders = res.scalars().all()

    results = []
    for o in orders:
        results.append({
            "id": str(o.id),
            "orderNumber": f"ORD-{str(o.id)[:8].upper()}",
            "userId": str(o.userId),
            "customerName": o.user.name if o.user and hasattr(o.user, "name") else "Verified Customer",
            "customerEmail": o.user.email if o.user else "customer@example.com",
            "total": o.total,
            "status": o.status.value if hasattr(o.status, "value") else str(o.status),
            "isVerified": o.isVerified,
            "mobile_number": o.mobile_number,
            "address": o.address,
            "city": o.city,
            "state": o.state,
            "pin_code": o.pin_code,
            "created_at": o.created_at.isoformat() if o.created_at else None,
            "payments": [
                {
                    "id": str(p.id),
                    "razorpay_payment_id": p.razorpay_payment_id,
                    "status": p.status.value if hasattr(p.status, "value") else str(p.status),
                    "amount": p.amount,
                }
                for p in o.payments
            ] if o.payments else [],
            "items": [
                {
                    "id": str(item.id),
                    "productId": str(item.productId),
                    "productTitle": item.product.title if item.product else "",
                    "quantity": item.quantity,
                    "price": item.product.selling_price if item.product else 0.0,
                }
                for item in o.items
            ],
        })

    return results


async def get_seller_order_by_id(
    order_id: uuid.UUID,
    current_seller: Seller,
    db: AsyncSession,
) -> dict:
    """Retrieve a single order's details for seller."""
    stmt = (
        select(Orders)
        .where(Orders.id == order_id)
        .options(
            selectinload(Orders.items).selectinload(OrderItems.product),
            selectinload(Orders.payments),
            selectinload(Orders.user),
        )
    )
    res = await db.execute(stmt)
    order = res.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    return {
        "id": str(order.id),
        "orderNumber": f"ORD-{str(order.id)[:8].upper()}",
        "userId": str(order.userId),
        "customerName": order.user.name if order.user and hasattr(order.user, "name") else "Verified Customer",
        "customerEmail": order.user.email if order.user else "customer@example.com",
        "total": order.total,
        "status": order.status.value if hasattr(order.status, "value") else str(order.status),
        "isVerified": order.isVerified,
        "mobile_number": order.mobile_number,
        "address": order.address,
        "city": order.city,
        "state": order.state,
        "pin_code": order.pin_code,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "payments": [
            {
                "id": str(p.id),
                "razorpay_payment_id": p.razorpay_payment_id,
                "status": p.status.value if hasattr(p.status, "value") else str(p.status),
                "amount": p.amount,
            }
            for p in order.payments
        ] if order.payments else [],
        "items": [
            {
                "id": str(item.id),
                "productId": str(item.productId),
                "productTitle": item.product.title if item.product else "",
                "quantity": item.quantity,
                "price": item.product.selling_price if item.product else 0.0,
            }
            for item in order.items
        ],
    }


async def change_order_status(
    payload: Any,
    current_seller: Seller,
    db: AsyncSession,
) -> dict:
    """Change the status of an order."""
    stmt = select(Orders).where(Orders.id == payload.order_id)
    res = await db.execute(stmt)
    order = res.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    order.status = payload.status
    await db.commit()
    await db.refresh(order)

    return {
        "message": "Order status updated successfully",
        "order_id": str(order.id),
        "status": order.status.value if hasattr(order.status, "value") else str(order.status),
    }