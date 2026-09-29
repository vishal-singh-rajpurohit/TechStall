import uuid
from typing import TYPE_CHECKING, Optional, List
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy import String, Boolean, Float, Integer, Text, ForeignKey
from pgvector.sqlalchemy import Vector
from ..db.db import Base
from .TimeStamps import TimestampMixin

if TYPE_CHECKING:
    from .User import Users, Cart
    from .Seller import Seller
    from .Orders import OrderItems


class Category(TimestampMixin, Base):
    __tablename__ = "category"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    title: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)

    products: Mapped[list["Products"]] = relationship(
        back_populates="category", cascade="all, delete-orphan", passive_deletes=True
    )


class Reviews(TimestampMixin, Base):
    __tablename__ = "reviews"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    content: Mapped[str] = mapped_column(String(500), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)

    productId: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    userId: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    product: Mapped["Products"] = relationship(back_populates="reviews")
    user: Mapped["Users"] = relationship(back_populates="reviews")


class Products(TimestampMixin, Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    title: Mapped[str] = mapped_column(String(400), nullable=False)
    description: Mapped[list[str]] = mapped_column(ARRAY(Text), default=list, server_default="{}")

    isActive: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    price: Mapped[float] = mapped_column(Float, nullable=False)
    selling_price: Mapped[float] = mapped_column(Float, nullable=False)

    stock: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    brand: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, default="Generic")
    sku: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, default=None)
    images: Mapped[list[str]] = mapped_column(ARRAY(String), default=list, server_default="{}")
    specifications: Mapped[Optional[str]] = mapped_column(Text, nullable=True, default="{}")

    caregory_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("category.id", ondelete='CASCADE'), nullable=True)
    seller_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("sellers.id", ondelete='CASCADE'))

    embedding: Mapped[Optional["ProductsEmbeddings"]] = relationship(
        back_populates="product", cascade="all, delete-orphan", uselist=False
    )

    category: Mapped[Optional["Category"]] = relationship(back_populates="products")
    seller: Mapped["Seller"] = relationship(back_populates="products")


    reviews: Mapped[list["Reviews"]] = relationship(
        back_populates="product", cascade="all, delete-orphan", passive_deletes=True
    )
    cart_items: Mapped[list["Cart"]] = relationship(
        back_populates="product", cascade="all, delete-orphan", passive_deletes=True
    )
    order_items: Mapped[list["OrderItems"]] = relationship(
        back_populates="product", cascade="all, delete-orphan", passive_deletes=True
    )
    media: Mapped[list["Media"]] = relationship(
        back_populates="product", cascade="all, delete-orphan", passive_deletes=True, order_by="Media.order"
    )


class ProductsEmbeddings(TimestampMixin, Base):
    __tablename__ = "products_embeddings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(768), nullable=True, default=None)
    
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id", ondelete='CASCADE'))

    product: Mapped["Products"] = relationship(back_populates="embedding")

class Media(TimestampMixin, Base):
    __tablename__ = "media"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )

    media_type: Mapped[str] = mapped_column(String(20), default="image", nullable=False)  # "image" or "video"
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    public_id: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)  # Cloudinary public_id
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    format: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    bytes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    width: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    height: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    product: Mapped["Products"] = relationship(back_populates="media")
