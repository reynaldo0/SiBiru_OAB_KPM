from datetime import date, time
from typing import List, Optional
from threading import Lock
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.booking import Booking

# In-memory lock map per room to ensure atomic check-and-insert for concurrent requests
_room_locks = {}
_master_lock = Lock()


def get_room_lock(room_id: str) -> Lock:
    """Returns a re-entrant or threading Lock for a specific room to serialize booking writes."""
    with _master_lock:
        if room_id not in _room_locks:
            _room_locks[room_id] = Lock()
        return _room_locks[room_id]


def is_interval_overlapping(
    new_start: time,
    new_end: time,
    existing_start: time,
    existing_end: time
) -> bool:
    """
    Rumus PRD SIBIRU v1.0:
    (JamMulai_Baru < JamSelesai_Eksisting) AND (JamSelesai_Baru > JamMulai_Eksisting)
    """
    return (new_start < existing_end) and (new_end > existing_start)


def find_conflicting_bookings(
    db: Session,
    room_id: str,
    booking_date: date,
    start_time: time,
    end_time: time,
    exclude_booking_id: Optional[str] = None
) -> List[Booking]:
    """
    Mencari booking eksisting yang bentrok pada ruangan dan tanggal yang sama.
    Kriteria:
    - Status: APPROVED atau PENDING (Menunggu Persetujuan)
    - Rumus Overlap: (new_start < existing_end) AND (new_end > existing_start)
    """
    query = db.query(Booking).filter(
        Booking.room_id == room_id,
        Booking.booking_date == booking_date,
        Booking.status.in_(["APPROVED", "PENDING"])
    )

    if exclude_booking_id:
        query = query.filter(Booking.id != exclude_booking_id)

    # In SQL: (start_time < existing.end_time) AND (end_time > existing.start_time)
    conflicting = query.filter(
        and_(
            Booking.end_time > start_time,
            Booking.start_time < end_time
        )
    ).all()

    return conflicting
