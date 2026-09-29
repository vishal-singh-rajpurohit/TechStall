import uuid
import enum
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import String, Integer, Float, Boolean, Enum, DateTime, ForeignKey
from ..db.db import Base
from .TimeStamps import TimestampMixin
from .Products import Products
from .User import Users

if TYPE_CHECKING:
    from .Products import Products
    from .User import Users
    from .Payment import RazorpayPayment

class StatusEnum(str, enum.Enum):
    PENDING="PENDING"
    CONFORMED="CONFORMED"
    CONFIRMED="CONFORMED"
    PROCESSING="PENDING"
    SHIPPED="SHIPPED"
    OUT_FOR_DELIVERY="OUT_FOR_DELIVERY"
    DELIEVERED="DELIEVERED"
    CANCELLED="CANCELLED"

class OrderItems(TimestampMixin, Base):
    __tablename__="order_items"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quantity:Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    orderId: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    productId: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),ForeignKey("products.id", ondelete="CASCADE"), nullable=False)

    order: Mapped["Orders"] = relationship(back_populates="items")
    product: Mapped["Products"] = relationship(back_populates="order_items")


class Orders(TimestampMixin, Base):
    __tablename__="orders"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    userId: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    total: Mapped[float] = mapped_column(Float, nullable=False)
    isVerified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    status: Mapped[StatusEnum] = mapped_column(
        Enum(StatusEnum, name="status"),
        default=StatusEnum.PENDING,
        server_default=StatusEnum.PENDING.value,
        nullable=False,
        index=True
    )

    mobile_number: Mapped[str] = mapped_column(String(12), unique=False)
    address: Mapped[str] = mapped_column(String(200), nullable=False)
    city: Mapped[str] = mapped_column(String(50), nullable=False)
    state: Mapped[str] = mapped_column(String(50), nullable=False)
    pin_code: Mapped[str] = mapped_column(String(6), nullable=False)

    user: Mapped["Users"] = relationship(back_populates="orders")
    items: Mapped[list["OrderItems"]] = relationship(
        back_populates="order", cascade="all, delete-orphan", passive_deletes=True
    )
    payments: Mapped[list["RazorpayPayment"]] = relationship(
        back_populates="order", cascade="all, delete-orphan", passive_deletes=True
    )
