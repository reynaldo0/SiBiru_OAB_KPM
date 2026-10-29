import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    identifier = Column(String(50), nullable=False, unique=True, index=True)  # NIM / NIP
    role = Column(String(20), nullable=False, default="BORROWER")  # BORROWER or ADMIN
    organization = Column(String(100), nullable=False)  # HIMA, UKM, Prodi, Unit Kerja
    phone = Column(String(25), nullable=True)
    email = Column(String(100), nullable=True)
    password_hash = Column(String(255), nullable=True)  # Hash kata sandi
    created_at = Column(DateTime, default=utc_now)

    bookings = relationship("Booking", back_populates="user", cascade="all, delete-orphan")
