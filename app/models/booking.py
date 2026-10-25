import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Date, Time, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    room_id = Column(String(36), ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    borrower_name = Column(String(100), nullable=False)
    organization = Column(String(100), nullable=False)  # HIMA, UKM, Prodi, etc.
    purpose = Column(Text, nullable=False)  # Min 10 chars
    booking_date = Column(Date, nullable=False, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    status = Column(String(20), nullable=False, default="PENDING", index=True)  # PENDING, APPROVED, REJECTED
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    room = relationship("Room", back_populates="bookings")
    user = relationship("User", back_populates="bookings")

    __table_args__ = (
        Index("ix_bookings_room_date_status", "room_id", "booking_date", "status"),
    )
