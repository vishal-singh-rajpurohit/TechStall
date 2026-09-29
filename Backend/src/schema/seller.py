import uuid
from pydantic import BaseModel, EmailStr, model_validator, Field
from typing import Optional, List
from datetime import datetime
from ..models.Orders import StatusEnum


class SellerRegisterRequest(BaseModel):
    name: str = Field(..., max_length=80)
    email: EmailStr = Field(..., max_length=200)
    password: str = Field(..., min_length=6)
    conform_password: str = Field(..., min_length=6)
    mobile_number: str = Field(..., max_length=12)
    address: str = Field(..., max_length=200)
    city: str = Field(..., max_length=50)
    state: str = Field(..., max_length=50)
    pin_code: str = Field(..., max_length=6)

    @model_validator(mode="after")
    def verify_passwords_match(self):
        if self.password != self.conform_password:
            raise ValueError("passwords do not match")
        return self


class SellerLoginRequest(BaseModel):
    email: EmailStr
    password: str


class SellerUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, max_length=80)
    mobile_number: Optional[str] = Field(None, max_length=12)
    address: Optional[str] = Field(None, max_length=200)
    city: Optional[str] = Field(None, max_length=50)
    state: Optional[str] = Field(None, max_length=50)
    pin_code: Optional[str] = Field(None, max_length=6)


class SellerResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    name: str
    mobile_number: Optional[str] = None
    address: str
    city: str
    state: str
    pin_code: str
    isVerified: bool
    isActive: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class SellerTokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class SellerAuthResponse(BaseModel):
    message: str
    seller: SellerResponse
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# ---------------- PRODUCT MANAGEMENT SCHEMAS ----------------

class MediaItemInput(BaseModel):
    url: str
    media_type: Optional[str] = None  # "image" or "video" (auto-detected if None)
    public_id: Optional[str] = None
    thumbnail_url: Optional[str] = None
    format: Optional[str] = None
    is_primary: Optional[bool] = False
    order: Optional[int] = 0


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


class MediaUploadResponse(BaseModel):
    url: str
    media_type: str
    public_id: str
    thumbnail_url: Optional[str] = None
    format: Optional[str] = None
    bytes: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None


class NewProductRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=400)
    description: List[str] = []
    price: float = Field(..., gt=0)
    selling_price: float = Field(..., gt=0)
    category_id: Optional[uuid.UUID] = None
    category_title: Optional[str] = None
    stock: int = Field(default=10, ge=0)
    brand: Optional[str] = "Generic"
    sku: Optional[str] = None
    images: List[str] = []
    videos: List[str] = []
    media: Optional[List[MediaItemInput]] = None
    specifications: Optional[dict] = {}


class ModifyProductRequest(BaseModel):
    product_id: Optional[uuid.UUID] = None
    title: Optional[str] = Field(None, min_length=2, max_length=400)
    description: Optional[List[str]] = None
    price: Optional[float] = Field(None, gt=0)
    selling_price: Optional[float] = Field(None, gt=0)
    category_id: Optional[uuid.UUID] = None
    category_title: Optional[str] = None
    stock: Optional[int] = Field(None, ge=0)
    brand: Optional[str] = None
    sku: Optional[str] = None
    images: Optional[List[str]] = None
    videos: Optional[List[str]] = None
    media: Optional[List[MediaItemInput]] = None
    specifications: Optional[dict] = None
    isActive: Optional[bool] = None


class ChangeStockRequest(BaseModel):
    product_id: uuid.UUID
    stock: Optional[int] = Field(None, ge=0)
    adjustment: Optional[int] = None  # e.g. +10, -5


class DeleteProductRequest(BaseModel):
    product_id: uuid.UUID


# ---------------- SELLER ORDER SCHEMAS ----------------

class ChangeOrderStatusRequest(BaseModel):
    order_id: uuid.UUID
    status: StatusEnum
