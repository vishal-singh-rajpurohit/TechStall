import uuid
from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


class ProductSummary(BaseModel):
    id: uuid.UUID
    title: str
    price: float
    selling_price: float
    stock: int = 10
    brand: Optional[str] = "Generic"
    images: List[str] = []

    model_config = {"from_attributes": True}


class MediaResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    media_type: str
    url: str
    public_id: Optional[str] = None
    thumbnail_url: Optional[str] = None
    format: Optional[str] = None
    bytes: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    is_primary: bool = False
    order: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ProductResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: List[str] = []
    isActive: bool
    price: float
    selling_price: float
    stock: int = 10
    brand: Optional[str] = "Generic"
    sku: Optional[str] = None
    category: Optional[str] = None
    images: List[str] = []
    videos: List[str] = []
    media: List[MediaResponse] = []
    specifications: Optional[str] = "{}"
    caregory_id: Optional[uuid.UUID] = None
    seller_id: Optional[uuid.UUID] = None
    rating: float = 0.0
    reviews_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class PaginatedProductsResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    page: int
    limit: int
    total_pages: int
    category: Optional[str] = None


# ---------------- CART SCHEMAS ----------------

class AddToCartRequest(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(default=1, ge=1)


class UpdateCartItemRequest(BaseModel):
    quantity: int = Field(default=1, ge=0)


class RemoveCartRequest(BaseModel):
    cart_item_id: Optional[uuid.UUID] = None
    product_id: Optional[uuid.UUID] = None


class QuantityChangeRequest(BaseModel):
    cart_item_id: Optional[uuid.UUID] = None
    product_id: Optional[uuid.UUID] = None
    amount: int = Field(default=1, ge=1)


class CartItemResponse(BaseModel):
    id: uuid.UUID
    productId: uuid.UUID
    quantity: int
    product: Optional[ProductSummary] = None
    item_total: float = 0.0
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class CartResponse(BaseModel):
    items: List[CartItemResponse]
    total_items: int
    subtotal: float


# ---------------- ORDER & PAYMENT SCHEMAS ----------------

class DirectBuyItem(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(default=1, ge=1)


class PlaceOrderRequest(BaseModel):
    address: str = Field(..., max_length=200)
    city: str = Field(..., max_length=50)
    state: str = Field(..., max_length=50)
    pin_code: str = Field(..., max_length=6)
    mobile_number: str = Field(..., max_length=12)
    direct_buy: Optional[DirectBuyItem] = None
    items: Optional[List[DirectBuyItem]] = None



class OrderItemResponse(BaseModel):
    id: uuid.UUID
    productId: uuid.UUID
    quantity: int
    product: Optional[ProductSummary] = None
    item_price: float

    model_config = {"from_attributes": True}


class PaymentSummaryResponse(BaseModel):
    id: uuid.UUID
    razorpay_order_id: str
    razorpay_payment_id: Optional[str] = None
    amount: float
    currency: str
    status: str

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: uuid.UUID
    userId: uuid.UUID
    total: float
    status: str
    isVerified: bool
    mobile_number: str
    address: str
    city: str
    state: str
    pin_code: str
    items: List[OrderItemResponse]
    payment: Optional[PaymentSummaryResponse] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class VerifyOrderRequest(BaseModel):
    order_id: uuid.UUID
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None


class PayOrderRequest(BaseModel):
    order_id: uuid.UUID
    payment_method: Optional[str] = "razorpay"


class CancelOrderRequest(BaseModel):
    order_id: Optional[uuid.UUID] = None
    reason: Optional[str] = None


# ---------------- REVIEW SCHEMAS ----------------

class CreateReviewRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Star rating between 1 and 5")
    content: str = Field(..., min_length=1, max_length=1000, description="Customer review text")


class ReviewItemResponse(BaseModel):
    id: uuid.UUID
    productId: uuid.UUID
    userId: uuid.UUID
    userName: str
    rating: int
    content: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ProductReviewsResponse(BaseModel):
    product_id: uuid.UUID
    average_rating: float
    reviews_count: int
    rating_breakdown: dict[int, int]
    reviews: List[ReviewItemResponse]
