from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.room import Room
from app.models.booking import Booking
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingResponse
from app.core.dependencies import get_current_user
from app.core.conflict_engine import get_room_lock, find_conflicting_bookings
from app.core.exceptions import BookingConflictException, ResourceNotFoundException

router = APIRouter(prefix="/bookings", tags=["Pengajuan & Riwayat Peminjam"])


def format_booking_response(booking: Booking) -> BookingResponse:
    return BookingResponse(
        id=booking.id,
        room_id=booking.room_id,
        room_name=booking.room.name if booking.room else None,
        room_location=booking.room.location if booking.room else None,
        user_id=booking.user_id,
        borrower_name=booking.borrower_name,
        organization=booking.organization,
        purpose=booking.purpose,
        booking_date=booking.booking_date,
        start_time=booking.start_time,
        end_time=booking.end_time,
        status=booking.status,
        rejection_reason=booking.rejection_reason,
        created_at=booking.created_at,
        updated_at=booking.updated_at
    )


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED, summary="Ajukan Peminjaman Ruangan (FR-02)")
def create_booking(
    payload: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mengajukan peminjaman ruangan dengan validasi bentrok otomatis (Conflict Detection Engine).
    Rumus PRD: (JamMulai_Baru < JamSelesai_Eksisting) AND (JamSelesai_Baru > JamMulai_Eksisting)
    Status awal pengajuan adalah 'PENDING' (Menunggu Persetujuan Pengelola).
    Dilengkapi penanganan transaksi atomik untuk mencegah 'race condition booking'.
    """
    # 1. Cek keberadaan dan status operasional ruangan
    room = db.query(Room).filter(Room.id == payload.room_id).first()
    if not room:
        raise ResourceNotFoundException("Ruangan", payload.room_id)

    if not room.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ruangan '{room.name}' saat ini berstatus non-aktif dan tidak dapat dipinjam."
        )

    # 2. Concurrency Lock per ruangan untuk mengamankan proses check-and-insert
    room_lock = get_room_lock(payload.room_id)
    with room_lock:
        # Pengecekan bentrok jadwal terhadap status APPROVED dan PENDING
        conflicts = find_conflicting_bookings(
            db=db,
            room_id=payload.room_id,
            booking_date=payload.booking_date,
            start_time=payload.start_time,
            end_time=payload.end_time
        )

        if conflicts:
            conflict = conflicts[0]
            start_str = conflict.start_time.strftime("%H:%M")
            end_str = conflict.end_time.strftime("%H:%M")
            raise BookingConflictException(
                detail=f"Slot waktu bertabrakan dengan pengajuan berstatus '{conflict.status}' "
                       f"({start_str} - {end_str}) oleh '{conflict.organization}'.",
                conflicting_data={
                    "conflicting_booking_id": conflict.id,
                    "existing_status": conflict.status,
                    "existing_organization": conflict.organization,
                    "existing_start_time": start_str,
                    "existing_end_time": end_str,
                    "date": payload.booking_date.isoformat()
                }
            )

        # 3. Simpan data permohonan ke database jika tidak ada bentrok
        new_booking = Booking(
            room_id=payload.room_id,
            user_id=current_user.id,
            borrower_name=current_user.name,  # Terisi otomatis sesuai akun login aktif
            organization=payload.organization,
            purpose=payload.purpose,
            booking_date=payload.booking_date,
            start_time=payload.start_time,
            end_time=payload.end_time,
            status="PENDING",  # Status default Menunggu Persetujuan
            rejection_reason=None
        )

        db.add(new_booking)
        db.commit()
        db.refresh(new_booking)

    return format_booking_response(new_booking)


@router.get("/my", response_model=List[BookingResponse], summary="Pengajuan Saya (FR-03)")
def get_my_bookings(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter status: PENDING, APPROVED, REJECTED"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Menampilkan daftar permohonan peminjaman milik peminjam yang sedang aktif.
    Sesuai PRD FR-03: Memantau siklus status (Menunggu, Disetujui, Ditolak + Alasan).
    """
    query = db.query(Booking).filter(Booking.user_id == current_user.id)

    if status_filter:
        query = query.filter(Booking.status == status_filter.upper())

    bookings = query.order_by(Booking.booking_date.desc(), Booking.start_time.desc()).all()
    return [format_booking_response(b) for b in bookings]


@router.get("/{booking_id}", response_model=BookingResponse, summary="Detail Pengajuan Peminjaman")
def get_booking_detail(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mengambil detail satu pengajuan peminjaman."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise ResourceNotFoundException("Pengajuan Peminjaman", booking_id)

    # Validasi hak akses jika bukan admin dan bukan pemilik pengajuan
    if current_user.role != "ADMIN" and booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki izin untuk melihat pengajuan ini."
        )

    return format_booking_response(booking)
