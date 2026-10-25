from datetime import date, timedelta


def test_get_rooms_catalog(client):
    """Pengujian katalog ruangan (FR-01)"""
    res = client.get("/api/v1/rooms")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Ruang Uji 101"
    assert "AC" in data[0]["facilities"]


def test_create_booking_success(client):
    """Pengujian pengajuan peminjaman valid (FR-02)"""
    target_date = (date.today() + timedelta(days=2)).isoformat()
    payload = {
        "room_id": "room_test_01",
        "organization": "HIMA Test",
        "purpose": "Rapat Kerja Pengurus HIMA Tahunan",
        "booking_date": target_date,
        "start_time": "09:00:00",
        "end_time": "11:00:00"
    }

    res = client.post("/api/v1/bookings", json=payload, headers={"X-User-Id": "usr_mhs_test"})
    assert res.status_code == 201
    data = res.json()
    assert data["status"] == "PENDING"
    assert data["borrower_name"] == "Mahasiswa Test"
    assert data["room_id"] == "room_test_01"


def test_create_booking_conflict_rejected(client):
    """
    Pengujian validasi bentrok otomatis:
    Pengajuan kedua pada slot yang tumpang tindih harus ditolak dengan HTTP 409 Conflict.
    """
    target_date = (date.today() + timedelta(days=2)).isoformat()

    # 1. Booking pertama (09:00 - 11:00)
    client.post("/api/v1/bookings", json={
        "room_id": "room_test_01",
        "organization": "HIMA Test",
        "purpose": "Kegiatan Pertama Resmi",
        "booking_date": target_date,
        "start_time": "09:00:00",
        "end_time": "11:00:00"
    }, headers={"X-User-Id": "usr_mhs_test"})

    # 2. Booking kedua overlap (10:00 - 12:00) -> Wajib ditolak 409
    res2 = client.post("/api/v1/bookings", json={
        "room_id": "room_test_01",
        "organization": "UKM Musik",
        "purpose": "Latihan Musik Bersama UKM",
        "booking_date": target_date,
        "start_time": "10:00:00",
        "end_time": "12:00:00"
    }, headers={"X-User-Id": "usr_mhs_test"})

    assert res2.status_code == 409
    error_body = res2.json()["detail"]
    assert "Jadwal Bentrok" in error_body["error"]
    assert "09:00" in error_body["message"]


def test_create_booking_adjacent_slot_allowed(client):
    """
    Slot berdampingan (misal: 11:00 - 13:00 setelah 09:00 - 11:00) harus BERHASIL tanpa bentrok.
    """
    target_date = (date.today() + timedelta(days=2)).isoformat()

    # Booking 1: 09:00 - 11:00
    client.post("/api/v1/bookings", json={
        "room_id": "room_test_01",
        "organization": "HIMA Test",
        "purpose": "Sesi Pagi Pelatihan Komputer",
        "booking_date": target_date,
        "start_time": "09:00:00",
        "end_time": "11:00:00"
    }, headers={"X-User-Id": "usr_mhs_test"})

    # Booking 2: 11:00 - 13:00 (tepat berdampingan)
    res = client.post("/api/v1/bookings", json={
        "room_id": "room_test_01",
        "organization": "UKM Robotika",
        "purpose": "Sesi Siang Perakitan Robot",
        "booking_date": target_date,
        "start_time": "11:00:00",
        "end_time": "13:00:00"
    }, headers={"X-User-Id": "usr_mhs_test"})

    assert res.status_code == 201
    assert res.json()["status"] == "PENDING"


def test_validation_purpose_too_short(client):
    """Validasi keperluan minimal 10 karakter"""
    target_date = (date.today() + timedelta(days=2)).isoformat()
    res = client.post("/api/v1/bookings", json={
        "room_id": "room_test_01",
        "organization": "HIMA Test",
        "purpose": "Rapat",  # Kurang dari 10 karakter
        "booking_date": target_date,
        "start_time": "09:00:00",
        "end_time": "11:00:00"
    }, headers={"X-User-Id": "usr_mhs_test"})

    assert res.status_code == 422


def test_validation_invalid_time_range(client):
    """Validasi jam mulai harus lebih awal daripada jam selesai"""
    target_date = (date.today() + timedelta(days=2)).isoformat()
    res = client.post("/api/v1/bookings", json={
        "room_id": "room_test_01",
        "organization": "HIMA Test",
        "purpose": "Kegiatan Workshop Mahasiswa",
        "booking_date": target_date,
        "start_time": "15:00:00",
        "end_time": "14:00:00"  # start > end
    }, headers={"X-User-Id": "usr_mhs_test"})

    assert res.status_code == 422


def test_my_bookings_list_and_filter(client):
    """Pengujian menu Pengajuan Saya (FR-03)"""
    target_date = (date.today() + timedelta(days=3)).isoformat()

    client.post("/api/v1/bookings", json={
        "room_id": "room_test_01",
        "organization": "HIMA Test",
        "purpose": "Diskusi Internal Divisi Humas",
        "booking_date": target_date,
        "start_time": "13:00:00",
        "end_time": "15:00:00"
    }, headers={"X-User-Id": "usr_mhs_test"})

    res = client.get("/api/v1/bookings/my", headers={"X-User-Id": "usr_mhs_test"})
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert data[0]["borrower_name"] == "Mahasiswa Test"

    # Filter status PENDING
    res_pending = client.get("/api/v1/bookings/my?status=PENDING", headers={"X-User-Id": "usr_mhs_test"})
    assert res_pending.status_code == 200
    assert all(b["status"] == "PENDING" for b in res_pending.json())
