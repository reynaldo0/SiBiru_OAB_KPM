from pydantic import BaseModel, Field, ConfigDict, model_validator
from typing import Optional, List
from datetime import date, time, datetime


class BookingCreate(BaseModel):
    room_id: str = Field(..., description="ID ruangan yang dipinjam")
    organization: str = Field(..., min_length=2, max_length=100, description="HIMA, UKM, Prodi, atau Unit Kerja")
    purpose: str = Field(..., min_length=10, description="Keperluan / nama kegiatan (Minimal 10 karakter)")
    booking_date: date = Field(..., description="Tanggal peminjaman")
    start_time: time = Field(..., description="Jam mulai peminjaman (HH:MM:SS atau HH:MM)")
    end_time: time = Field(..., description="Jam selesai peminjaman (HH:MM:SS atau HH:MM)")

    @model_validator(mode="after")
    def validate_times_and_dates(self):
        if self.start_time >= self.end_time:
            raise ValueError("Jam mulai harus lebih awal daripada jam selesai.")
        
        today = date.today()
        if self.booking_date < today:
            raise ValueError("Tanggal peminjaman tidak boleh tanggal yang sudah lewat (harus hari ini atau masa mendatang).")

        return self


class BookingStatusUpdate(BaseModel):
    status: str = Field(..., description="Status baru: APPROVED atau REJECTED")
    rejection_reason: Optional[str] = Field(None, description="Wajib diisi jika status REJECTED")

    @model_validator(mode="after")
    def validate_rejection_reason(self):
        normalized_status = self.status.upper()
        if normalized_status not in ["APPROVED", "REJECTED"]:
            raise ValueError("Status hanya boleh 'APPROVED' atau 'REJECTED'.")
        
        self.status = normalized_status
        if normalized_status == "REJECTED":
            if not self.rejection_reason or len(self.rejection_reason.strip()) < 3:
                raise ValueError("Alasan penolakan (rejection_reason) wajib diisi minimal 3 karakter jika status pengajuan ditolak.")

        return self


class BookingResponse(BaseModel):
    id: str
    room_id: str
    room_name: Optional[str] = None
    room_location: Optional[str] = None
    user_id: str
    borrower_name: str
    organization: str
    purpose: str
    booking_date: date
    start_time: time
    end_time: time
    status: str
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminMetricsResponse(BaseModel):
    pending_count: int
    approved_count: int
    rejected_count: int
    total_bookings: int
    total_rooms: int
    active_rooms: int
    today_bookings_count: int


class MasterScheduleItem(BaseModel):
    id: str
    room_id: str
    room_name: str
    user_id: str
    borrower_name: str
    organization: str
    purpose: str
    booking_date: date
    start_time: time
    end_time: time
    status: str
