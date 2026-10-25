from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date, datetime, timezone
from app.database import get_db
from app.models.room import Room, RoomFacility
from app.models.booking import Booking
from app.models.user import User
from app.schemas.booking import (
    BookingResponse, BookingStatusUpdate, AdminMetricsResponse, MasterScheduleItem
)
from app.schemas.room import (
    RoomResponse, RoomCreate, RoomUpdate, RoomStatusUpdate
)
from app.core.dependencies import require_admin
from app.core.exceptions import ResourceNotFoundException
from app.routers.rooms import format_room_response
from app.routers.bookings import format_booking_response

router = APIRouter(prefix="/admin", tags=["Modul Pengelola (Admin)"])


# --- 1. Dashboard Ringkas ---
@router.get("/metrics", response_model=AdminMetricsResponse, summary="Ringkasan Metrik Dashboard (FR Modul Pengelola)")
def get_admin_metrics(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Mengambil ringkasan metrik statistik jumlah pengajuan:
    - Menunggu (Pending)
    - Disetujui (Approved)
    - Ditolak (Rejected)
    Serta metrik inventaris ruangan dan peminjaman hari ini.
    """
    pending_count = db.query(Booking).filter(Booking.status == "PENDING").count()
    approved_count = db.query(Booking).filter(Booking.status == "APPROVED").count()
    rejected_count = db.query(Booking).filter(Booking.status == "REJECTED").count()
    total_bookings = db.query(Booking).count()

    total_rooms = db.query(Room).count()
    active_rooms = db.query(Room).filter(Room.is_active == True).count()

    today = date.today()
    today_bookings_count = db.query(Booking).filter(Booking.booking_date == today).count()

    return AdminMetricsResponse(
        pending_count=pending_count,
        approved_count=approved_count,
        rejected_count=rejected_count,
        total_bookings=total_bookings,
        total_rooms=total_rooms,
        active_rooms=active_rooms,
        today_bookings_count=today_bookings_count
    )


# --- 2. Kelola Pengajuan Masuk & Riwayat Pencarian ---
@router.get("/bookings", response_model=List[BookingResponse], summary="Daftar Pengajuan Masuk & Riwayat (Filter & Pencarian)")
def list_admin_bookings(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter status: PENDING, APPROVED, REJECTED"),
    room_id: Optional[str] = Query(None, description="Filter ID Ruangan tertentu"),
    start_date: Optional[date] = Query(None, description="Rentang tanggal awal"),
    end_date: Optional[date] = Query(None, description="Rentang tanggal akhir"),
    search: Optional[str] = Query(None, description="Cari nama peminjam, organisasi, atau agenda"),
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Menampilkan antrean permohonan masuk maupun riwayat arsip transaksi.
    Mendukung filter berdasarkan status, rentang tanggal, jenis ruangan, dan pencarian teks.
    """
    query = db.query(Booking)

    if status_filter:
        query = query.filter(Booking.status == status_filter.upper())

    if room_id:
        query = query.filter(Booking.room_id == room_id)

    if start_date:
        query = query.filter(Booking.booking_date >= start_date)

    if end_date:
        query = query.filter(Booking.booking_date <= end_date)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            (Booking.borrower_name.ilike(search_filter)) |
            (Booking.organization.ilike(search_filter)) |
            (Booking.purpose.ilike(search_filter))
        )

    bookings = query.order_by(Booking.booking_date.desc(), Booking.start_time.asc()).all()
    return [format_booking_response(b) for b in bookings]


@router.patch("/bookings/{booking_id}/status", response_model=BookingResponse, summary="Aksi Setujui / Tolak Pengajuan")
def update_booking_status(
    booking_id: str,
    payload: BookingStatusUpdate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Memperbarui status pengajuan menjadi 'APPROVED' atau 'REJECTED'.
    Jika pengelola menolak ('REJECTED'), field 'rejection_reason' WAJIB diisi.
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise ResourceNotFoundException("Pengajuan Peminjaman", booking_id)

    booking.status = payload.status
    if payload.status == "REJECTED":
        booking.rejection_reason = payload.rejection_reason.strip()
    else:
        booking.rejection_reason = None

    booking.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(booking)

    return format_booking_response(booking)


# --- 3. Master Jadwal Ruangan (Master Timeline) ---
@router.get("/schedule", response_model=List[MasterScheduleItem], summary="Master Timeline Jadwal Terpadu")
def get_master_schedule(
    start_date: Optional[date] = Query(None, description="Tanggal awal timeline (default: hari ini)"),
    end_date: Optional[date] = Query(None, description="Tanggal akhir timeline (default: 7 hari ke depan)"),
    room_id: Optional[str] = Query(None, description="Filter ruangan spesifik"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter status (misal: APPROVED atau PENDING)"),
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Tampilan master timeline terpadu yang memuat seluruh agenda pemanfaatan ruangan dalam rentang waktu.
    Sesuai PRD Bagian 6: Master Jadwal Ruangan.
    """
    from datetime import timedelta
    target_start = start_date or date.today()
    target_end = end_date or (target_start + timedelta(days=7))

    query = db.query(Booking).filter(
        Booking.booking_date >= target_start,
        Booking.booking_date <= target_end
    )

    if room_id:
        query = query.filter(Booking.room_id == room_id)

    if status_filter:
        query = query.filter(Booking.status == status_filter.upper())
    else:
        # Default: tampilkan yang APPROVED dan PENDING di timeline
        query = query.filter(Booking.status.in_(["APPROVED", "PENDING"]))

    bookings = query.order_by(Booking.booking_date.asc(), Booking.start_time.asc()).all()

    return [
        MasterScheduleItem(
            id=b.id,
            room_id=b.room_id,
            room_name=b.room.name if b.room else "N/A",
            user_id=b.user_id,
            borrower_name=b.borrower_name,
            organization=b.organization,
            purpose=b.purpose,
            booking_date=b.booking_date,
            start_time=b.start_time,
            end_time=b.end_time,
            status=b.status
        )
        for b in bookings
    ]


# --- 4. Kelola Data Ruangan (CRUD Ruangan) ---
@router.post("/rooms", response_model=RoomResponse, status_code=status.HTTP_201_CREATED, summary="Tambah Data Ruangan")
def create_room(
    payload: RoomCreate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Menambahkan master data ruangan baru beserta fasilitasnya."""
    existing = db.query(Room).filter(Room.name == payload.name.strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ruangan dengan nama '{payload.name}' sudah ada."
        )

    room = Room(
        name=payload.name.strip(),
        location=payload.location.strip(),
        capacity=payload.capacity,
        is_active=payload.is_active,
        image_url=payload.image_url
    )
    db.add(room)
    db.flush()

    for fac_name in payload.facilities:
        if fac_name.strip():
            db.add(RoomFacility(room_id=room.id, name=fac_name.strip()))

    db.commit()
    db.refresh(room)
    return format_room_response(room)


@router.put("/rooms/{room_id}", response_model=RoomResponse, summary="Edit Data Ruangan")
def update_room(
    room_id: str,
    payload: RoomUpdate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Memperbarui informasi nama, kapasitas, lokasi, dan fasilitas ruangan."""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise ResourceNotFoundException("Ruangan", room_id)

    if payload.name is not None:
        conflict_name = db.query(Room).filter(Room.name == payload.name.strip(), Room.id != room_id).first()
        if conflict_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Nama ruangan '{payload.name}' sudah digunakan."
            )
        room.name = payload.name.strip()

    if payload.location is not None:
        room.location = payload.location.strip()

    if payload.capacity is not None:
        room.capacity = payload.capacity

    if payload.is_active is not None:
        room.is_active = payload.is_active

    if payload.image_url is not None:
        room.image_url = payload.image_url

    if payload.facilities is not None:
        # Hapus fasilitas lama dan ganti dengan yang baru
        db.query(RoomFacility).filter(RoomFacility.room_id == room_id).delete()
        for fac_name in payload.facilities:
            if fac_name.strip():
                db.add(RoomFacility(room_id=room.id, name=fac_name.strip()))

    room.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(room)
    return format_room_response(room)


@router.patch("/rooms/{room_id}/status", response_model=RoomResponse, summary="Aktifkan / Nonaktifkan Ruangan")
def toggle_room_status(
    room_id: str,
    payload: RoomStatusUpdate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Mengubah status operasional ruangan (aktif / nonaktif)."""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise ResourceNotFoundException("Ruangan", room_id)

    room.is_active = payload.is_active
    room.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(room)
    return format_room_response(room)
