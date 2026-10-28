from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.room import Room
from app.models.booking import Booking
from app.schemas.room import RoomResponse, RoomAvailabilityResponse, BookedInterval
from app.core.exceptions import ResourceNotFoundException

router = APIRouter(prefix="/rooms", tags=["Katalog & Ketersediaan Ruangan"])


def format_room_response(room: Room) -> RoomResponse:
    return RoomResponse(
        id=room.id,
        name=room.name,
        location=room.location,
        capacity=room.capacity,
        is_active=room.is_active,
        image_url=room.image_url,
        facilities=[f.name for f in room.facilities],
        created_at=room.created_at,
        updated_at=room.updated_at
    )


@router.get("", response_model=List[RoomResponse], summary="Katalog Ruangan (FR-01)")
def list_rooms(
    is_active_only: bool = Query(True, description="Filter hanya ruangan yang aktif secara operasional"),
    min_capacity: Optional[int] = Query(None, description="Filter kapasitas minimal"),
    search: Optional[str] = Query(None, description="Pencarian nama atau lokasi ruangan"),
    db: Session = Depends(get_db)
):
    """
    Menampilkan katalog ruangan lengkap dengan kapasitas dan daftar fasilitas.
    Sesuai PRD FR-01: Informasi & Ketersediaan Ruangan.
    """
    query = db.query(Room)

    if is_active_only:
        query = query.filter(Room.is_active == True)

    if min_capacity is not None:
        query = query.filter(Room.capacity >= min_capacity)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter((Room.name.ilike(search_filter)) | (Room.location.ilike(search_filter)))

    rooms = query.order_by(Room.name.asc()).all()
    return [format_room_response(r) for r in rooms]


@router.get("/{room_id}", response_model=RoomResponse, summary="Detail Ruangan")
def get_room(room_id: str, db: Session = Depends(get_db)):
    """Mengambil detail satu ruangan beserta fasilitasnya."""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise ResourceNotFoundException("Ruangan", room_id)
    return format_room_response(room)


@router.get("/{room_id}/availability", response_model=RoomAvailabilityResponse, summary="Ketersediaan Jadwal Real-time (FR-01)")
def check_room_availability(
    room_id: str,
    booking_date: Optional[date] = Query(None, alias="date", description="Tanggal yang dicek (format YYYY-MM-DD), default: hari ini"),
    db: Session = Depends(get_db)
):
    """
    Mengecek jadwal dan status ruangan pada tanggal yang dipilih.
    Mengembalikan daftar interval waktu yang sudah dibooking (Disetujui atau Menunggu Persetujuan).
    Peminjam dapat menggunakan informasi ini untuk memilih slot jam kosong secara presisi.
    """
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise ResourceNotFoundException("Ruangan", room_id)

    target_date = booking_date or date.today()

    # Query active bookings on target date (status APPROVED or PENDING)
    active_bookings = db.query(Booking).filter(
        Booking.room_id == room_id,
        Booking.booking_date == target_date,
        Booking.status.in_(["APPROVED", "PENDING"])
    ).order_by(Booking.start_time.asc()).all()

    booked_intervals = [
        BookedInterval(
            booking_id=b.id,
            start_time=b.start_time.strftime("%H:%M"),
            end_time=b.end_time.strftime("%H:%M"),
            status=b.status,
            organization=b.organization,
            borrower_name=b.borrower_name
        )
        for b in active_bookings
    ]

    return RoomAvailabilityResponse(
        room_id=room.id,
        room_name=room.name,
        date=target_date.isoformat(),
        is_room_active=room.is_active,
        booked_intervals=booked_intervals
    )
