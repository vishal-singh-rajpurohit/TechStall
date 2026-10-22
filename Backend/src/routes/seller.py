import uuid
from typing import Optional, List, Any
from fastapi import APIRouter, Request, Response, Depends, status, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession

from ..schema.seller import (
    SellerRegisterRequest,
    SellerLoginRequest,
    SellerUpdateRequest,
    SellerResponse,
    SellerAuthResponse,
    SellerTokenResponse,
    NewProductRequest,
    ModifyProductRequest,
    ChangeStockRequest,
    DeleteProductRequest,
    ChangeOrderStatusRequest,
    MediaItemInput,
    MediaUploadResponse,
)
from ..schema.auth import MessageResponse, VerifyRequest
from ..controllers import seller
from ..models.Seller import Seller
from ..db.desp import get_db

router = APIRouter(tags=["SELLER"])


# ---------------- SELLER AUTH ROUTES ----------------

@router.get("/", status_code=status.HTTP_200_OK)
async def seller_root():
    """Health check for seller service."""
    return {"status": "OK", "role": "seller"}


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=SellerAuthResponse)
async def register_seller(
    payload: SellerRegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Register a new seller account with business information."""
    return await seller.register(payload=payload, response=response, db=db)


@router.post("/login", status_code=status.HTTP_200_OK, response_model=SellerAuthResponse)
async def login_seller(
    payload: SellerLoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate seller and receive auth cookies and JWT."""
    return await seller.login(payload=payload, response=response, db=db)


@router.post("/logout", status_code=status.HTTP_200_OK, response_model=MessageResponse)
async def logout_seller(
    response: Response,
    db: AsyncSession = Depends(get_db),
    current_seller: Optional[Seller] = Depends(seller.get_current_seller_optional),
):
    """Log out seller, clear cookies, and invalidate refresh token."""
    return await seller.logout(response=response, db=db, current_seller=current_seller)


@router.post("/refresh", status_code=status.HTTP_200_OK, response_model=SellerTokenResponse)
async def refresh_seller_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Refresh seller access and refresh tokens using cookie or header."""
    return await seller.refresh_tokens(request=request, response=response, db=db)
 

@router.get("/me", status_code=status.HTTP_200_OK, response_model=SellerResponse)
async def get_seller_profile(
    current_seller: Seller = Depends(seller.get_current_seller),
):
    """Retrieve currently authenticated seller's profile."""
    return await seller.me(current_seller=current_seller)


@router.patch("/me", status_code=status.HTTP_200_OK, response_model=SellerResponse)
async def update_seller_profile(
    payload: SellerUpdateRequest,
    current_seller: Seller = Depends(seller.get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    """Update profile and contact details of the authenticated seller."""
    return await seller.update_me(payload=payload, current_seller=current_seller, db=db)


@router.post("/verify", status_code=status.HTTP_200_OK, response_model=MessageResponse)
@router.get("/verify", status_code=status.HTTP_200_OK, response_model=MessageResponse)
async def verify_seller(
    payload: Optional[VerifyRequest] = None,
    current_seller: Optional[Seller] = Depends(seller.get_current_seller_optional),
    db: AsyncSession = Depends(get_db),
):
    """Verify seller account."""
    return await seller.verify(current_seller=current_seller, db=db, payload=payload)


# ---------------- SELLER PRODUCT MANAGEMENT ROUTES ----------------

@router.post("/upload-media", status_code=status.HTTP_200_OK, response_model=MediaUploadResponse)
async def upload_product_media(
    payload: MediaItemInput,
    current_seller: Seller = Depends(seller.get_current_seller),
):
    """Upload product image or video to Cloudinary."""
    return await seller.upload_media_asset(
        file_or_url=payload.url,
        media_type=payload.media_type or "auto",
        is_primary=payload.is_primary or False,
        order=payload.order or 0,
    )


@router.post("/new-product", status_code=status.HTTP_201_CREATED)
@router.post("/add-product", status_code=status.HTTP_201_CREATED)
async def create_new_product(
    payload: NewProductRequest,
    current_seller: Seller = Depends(seller.get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    """Create a new product listing owned by the authenticated seller."""
    return await seller.new_product(payload=payload, current_seller=current_seller, db=db)


@router.post("/modify-product", status_code=status.HTTP_200_OK)
@router.post("/modify-product/", status_code=status.HTTP_200_OK)
@router.put("/modify-product", status_code=status.HTTP_200_OK)
@router.put("/modify-product/", status_code=status.HTTP_200_OK)
@router.patch("/modify-product", status_code=status.HTTP_200_OK)
@router.patch("/modify-product/", status_code=status.HTTP_200_OK)
@router.post("/update-product", status_code=status.HTTP_200_OK)
@router.post("/update-product/", status_code=status.HTTP_200_OK)
@router.put("/update-product", status_code=status.HTTP_200_OK)
@router.put("/update-product/", status_code=status.HTTP_200_OK)
@router.patch("/update-product", status_code=status.HTTP_200_OK)
@router.patch("/update-product/", status_code=status.HTTP_200_OK)
async def modify_product_details(
    payload: ModifyProductRequest,
    current_seller: Seller = Depends(seller.get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    """Modify details of a product owned by the seller."""
    return await seller.modify_product(
        product_id=payload.product_id,
        payload=payload,
        current_seller=current_seller,
        db=db,
    )


@router.post("/modify-product/{product_id}", status_code=status.HTTP_200_OK)
@router.patch("/modify-product/{product_id}", status_code=status.HTTP_200_OK)
@router.put("/modify-product/{product_id}", status_code=status.HTTP_200_OK)
@router.post("/update-product/{product_id}", status_code=status.HTTP_200_OK)
@router.patch("/update-product/{product_id}", status_code=status.HTTP_200_OK)
@router.put("/update-product/{product_id}", status_code=status.HTTP_200_OK)
async def modify_product_by_path(
    product_id: uuid.UUID,
    payload: ModifyProductRequest,
    current_seller: Seller = Depends(seller.get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    """Modify details of a product specified by path param."""
    return await seller.modify_product(
        product_id=product_id,
        payload=payload,
        current_seller=current_seller,
        db=db,
    )



# Note: support exact spelling /delete-prodct requested by user, plus aliases
@router.post("/delete-prodct", status_code=status.HTTP_200_OK, response_model=MessageResponse)
@router.delete("/delete-prodct", status_code=status.HTTP_200_OK, response_model=MessageResponse)
@router.post("/delete-product", status_code=status.HTTP_200_OK, response_model=MessageResponse)
@router.delete("/delete-product", status_code=status.HTTP_200_OK, response_model=MessageResponse)
async def unlist_product(
    payload: Optional[DeleteProductRequest] = None,
    product_id: Optional[uuid.UUID] = Query(None),
    current_seller: Seller = Depends(seller.get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    """Unlist a product by setting isActive = False (soft-delete)."""
    return await seller.delete_product(
        product_id=product_id,
        current_seller=current_seller,
        db=db,
        payload=payload,
    )


@router.delete("/delete-product/{product_id}", status_code=status.HTTP_200_OK, response_model=MessageResponse)
@router.delete("/delete-prodct/{product_id}", status_code=status.HTTP_200_OK, response_model=MessageResponse)
async def unlist_product_by_path(
    product_id: uuid.UUID,
    current_seller: Seller = Depends(seller.get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    """Unlist a product by ID in path."""
    return await seller.delete_product(
        product_id=product_id,
        current_seller=current_seller,
        db=db,
    )


@router.get("/get-product", status_code=status.HTTP_200_OK)
@router.get("/my-products", status_code=status.HTTP_200_OK)
@router.get("/products", status_code=status.HTTP_200_OK)
async def get_seller_product_catalog(
    product_id: Optional[uuid.UUID] = Query(None),
    current_seller: Seller = Depends(seller.get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all seller products or a single product by query ID."""
    return await seller.get_seller_products(
        current_seller=current_seller,
        db=db,
        product_id=product_id,
    )


@router.get("/get-product/{product_id}", status_code=status.HTTP_200_OK)
async def get_seller_product_by_path_id(
    product_id: uuid.UUID,
    current_seller: Seller = Depends(seller.get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve a single seller product by path ID."""
    return await seller.get_seller_products(
        current_seller=current_seller,
        db=db,
        product_id=product_id,
    )


@router.post("/change-stock", status_code=status.HTTP_200_OK)
@router.patch("/change-stock", status_code=status.HTTP_200_OK)
async def change_product_stock(
    payload: ChangeStockRequest,
    current_seller: Seller = Depends(seller.get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    """Change the stock level of a product."""
    return await seller.change_stock(
        payload=payload,
        current_seller=current_seller,
        db=db,
    )


# ---------------- SELLER ORDERS ROUTES ----------------

@router.get("/orders/get-orders", status_code=status.HTTP_200_OK)
async def list_seller_orders(
    current_seller: Seller = Depends(seller.get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all orders containing products owned by the seller."""
    return await seller.get_seller_orders(current_seller=current_seller, db=db)


@router.get("/orders/get/{id}", status_code=status.HTTP_200_OK)
@router.get("/orders/get-order/{id}", status_code=status.HTTP_200_OK)
async def get_seller_order(
    id: uuid.UUID = Path(...),
    current_seller: Seller = Depends(seller.get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve details for a specific order by ID."""
    return await seller.get_seller_order_by_id(order_id=id, current_seller=current_seller, db=db)


@router.post("/orders/change-order-status", status_code=status.HTTP_200_OK)
@router.patch("/orders/change-order-status", status_code=status.HTTP_200_OK)
async def update_order_status(
    payload: ChangeOrderStatusRequest,
    current_seller: Seller = Depends(seller.get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    """Change the status of an order (e.g. PROCESSING, SHIPPED, DELIEVERED, CANCELLED)."""
    return await seller.change_order_status(
        payload=payload,
        current_seller=current_seller,
        db=db,
    )

