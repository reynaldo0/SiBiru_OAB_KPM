from datetime import date, time, timedelta, datetime
from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.room import Room, RoomFacility
from app.models.booking import Booking


def seed_database():
    """Menginisialisasi basis data dan menyuntikkan data dummy awal."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Cek apakah sudah ada data
        if db.query(User).count() > 0:
            print("[SEED] Database sudah memiliki data, melewatkan seeding.")
            return

        print("[SEED] Menyuntikkan data awal SIBIRU...")

        # 1. Buat Pengguna Demo
        user_admin = User(
            id="usr_admin_01",
            name="Budi Santoso, S.Kom.",
            identifier="197905202008011002",
            role="ADMIN",
            organization="Bagian Fasilitas & Sarpras Kampus",
            phone="081234567890",
            email="admin.fasilitas@kampus.ac.id"
        )

        user_mhs = User(
            id="usr_mhs_01",
            name="Ahmad Zaki",
            identifier="2101001",
            role="BORROWER",
            organization="HIMA Informatika",
            phone="081987654321",
            email="ahmad.zaki@student.kampus.ac.id"
        )

        user_dosen = User(
            id="usr_dosen_01",
            name="Dr. Siti Rahma, M.T.",
            identifier="198501152010122001",
            role="BORROWER",
            organization="Prodi Sistem Informasi",
            phone="081345678901",
            email="siti.rahma@dosen.kampus.ac.id"
        )

        db.add_all([user_admin, user_mhs, user_dosen])
        db.flush()

        # 2. Buat Master Data Ruangan & Fasilitas
        rooms_data = [
            {
                "id": "room_auditorium",
                "name": "Auditorium Utama",
                "location": "Gedung Rektorat Lt. 3",
                "capacity": 300,
                "facilities": ["AC Central", "Proyektor Laser HD", "Sound System Line Array", "Panggung", "Microphone Wireless"]
            },
            {
                "id": "room_lab_c201",
                "name": "Lab Komputer C-201",
                "location": "Gedung FTI Lt. 2",
                "capacity": 40,
                "facilities": ["AC", "PC Workstation 40 Unit", "Proyektor", "Whiteboard", "High Speed LAN"]
            },
            {
                "id": "room_seminar_b",
                "name": "Ruang Seminar Gedung B",
                "location": "Gedung Pascasarjana Lt. 1",
                "capacity": 80,
                "facilities": ["AC", "Smart TV 75 Inch", "Sound System", "Whiteboard", "Mic Wireless"]
            },
            {
                "id": "room_rapat_senat",
                "name": "Ruang Rapat Senat",
                "location": "Gedung Rektorat Lt. 2",
                "capacity": 25,
                "facilities": ["AC", "Conference Camera 4K", "Microphone Meja", "Smart TV 65 Inch"]
            }
        ]

        created_rooms = {}
        for r_data in rooms_data:
            room = Room(
                id=r_data["id"],
                name=r_data["name"],
                location=r_data["location"],
                capacity=r_data["capacity"],
                is_active=True
            )
            db.add(room)
            db.flush()
            created_rooms[r_data["id"]] = room

            for fac in r_data["facilities"]:
                db.add(RoomFacility(room_id=room.id, name=fac))

        db.flush()

        # 3. Buat Booking Dummy
        today = date.today()
        tomorrow = today + timedelta(days=1)
        next_week = today + timedelta(days=3)

        bookings_data = [
            # 1: Disetujui (Approved) - Auditorium besok jam 09:00 - 12:00
            Booking(
                id="book_sample_01",
                room_id="room_auditorium",
                user_id="usr_mhs_01",
                borrower_name="Ahmad Zaki",
                organization="HIMA Informatika",
                purpose="Seminar Nasional Artificial Intelligence & Future Tech",
                booking_date=tomorrow,
                start_time=time(9, 0),
                end_time=time(12, 0),
                status="APPROVED",
                rejection_reason=None
            ),
            # 2: Menunggu Persetujuan (Pending) - Lab Komputer besok jam 13:00 - 16:00
            Booking(
                id="book_sample_02",
                room_id="room_lab_c201",
                user_id="usr_mhs_01",
                borrower_name="Ahmad Zaki",
                organization="HIMA Informatika",
                purpose="Workshop Hands-on Cloud Native Architecture",
                booking_date=tomorrow,
                start_time=time(13, 0),
                end_time=time(16, 0),
                status="PENDING",
                rejection_reason=None
            ),
            # 3: Ditolak (Rejected) - Ruang Rapat Senat
            Booking(
                id="book_sample_03",
                room_id="room_rapat_senat",
                user_id="usr_dosen_01",
                borrower_name="Dr. Siti Rahma, M.T.",
                organization="Prodi Sistem Informasi",
                purpose="Rapat Koordinasi Akreditasi Program Studi",
                booking_date=next_week,
                start_time=time(10, 0),
                end_time=time(12, 0),
                status="REJECTED",
                rejection_reason="Ruangan telah dipesan untuk Rapat Pimpinan Universitas di slot waktu tersebut."
            )
        ]

        db.add_all(bookings_data)
        db.commit()
        print("[SEED] Seeding berhasil diselesaikan!")

    except Exception as e:
        db.rollback()
        print(f"[SEED] Gagal melakukan seeding: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
