import uuid
from typing import TYPE_CHECKING, Optional
from  datetime import datetime
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import String, Text, Boolean, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from ..db.db import Base
from .TimeStamps import TimestampMixin

if TYPE_CHECKING:
    from .Products import Products, Reviews
    from .Orders import Orders
    from .Payment import RazorpayPayment


class Cart(TimestampMixin, Base):
    __tablename__ = "cart"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    quantity:Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    isActive:Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    userId: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    productId: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),ForeignKey("products.id", ondelete="CASCADE"), nullable=False)

    user: Mapped["Users"] = relationship(back_populates="cart_items")
    product: Mapped["Products"] = relationship(back_populates="cart_items")


class Users(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    mobile_number: Mapped[Optional[str]] = mapped_column(String(12), unique=True, nullable=True, default=None)
    refresh_token: Mapped[str] = mapped_column(Text, default="")
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)

    isVerified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    isActive: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    cart_items: Mapped[list["Cart"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )
    orders: Mapped[list["Orders"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )
    reviews: Mapped[list["Reviews"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )
    payments: Mapped[list["RazorpayPayment"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )


