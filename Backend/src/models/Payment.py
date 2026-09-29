import uuid
import enum
from typing import TYPE_CHECKING, Optional
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import String, Float, Text, Enum, ForeignKey
from ..db.db import Base
from .TimeStamps import TimestampMixin

if TYPE_CHECKING:
    from .Orders import Orders
    from .User import Users


class PaymentStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class RazorpayPayment(TimestampMixin, Base):
    __tablename__ = "razorpay_payments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    orderId: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    userId: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    razorpay_order_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    razorpay_payment_id: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=True, index=True)
    razorpay_signature: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)

    status: Mapped[PaymentStatusEnum] = mapped_column(
        Enum(PaymentStatusEnum, name="payment_status"),
        default=PaymentStatusEnum.PENDING,
        server_default=PaymentStatusEnum.PENDING.value,
        nullable=False,
        index=True,
    )

    method: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    error_code: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    error_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    order: Mapped["Orders"] = relationship(back_populates="payments")
    user: Mapped["Users"] = relationship(back_populates="payments")
