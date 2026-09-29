import uuid
from typing import TYPE_CHECKING
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Boolean, Text, String
from ..db.db import Base
from .TimeStamps import TimestampMixin

if TYPE_CHECKING:
    from .Products import Products

class Seller(TimestampMixin, Base):
    __tablename__ = "sellers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    mobile_number: Mapped[str] = mapped_column(String(12), unique=False)
    refresh_token: Mapped[str] = mapped_column(Text, default="")
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)

    isVerified: Mapped[bool] = mapped_column(Boolean, default=False)
    isActive: Mapped[bool] = mapped_column(Boolean, default=True)

    address: Mapped[str] = mapped_column(String(200), nullable=False)
    city: Mapped[str] = mapped_column(String(50), nullable=False)
    state: Mapped[str] = mapped_column(String(50), nullable=False)
    pin_code: Mapped[str] = mapped_column(String(6), nullable=False)

    products: Mapped[list["Products"]] = relationship(
        back_populates="seller", cascade="all, delete-orphan", passive_deletes=True
    )

