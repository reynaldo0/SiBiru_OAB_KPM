from datetime import date, timedelta


def test_admin_access_control_forbidden(client):
    """Peminjam non-admin dilarang mengakses endpoint /admin (403 Forbidden)"""
    res = client.get("/api/v1/admin/metrics", headers={"X-User-Id": "usr_mhs_test"})
    assert res.status_code == 403
    assert "Akses ditolak" in res.json()["detail"]


def test_admin_metrics(client):
    """Pengujian metrik ringkasan dashboard admin"""
    res = client.get("/api/v1/admin/metrics", headers={"X-User-Id": "usr_admin_test"})
    assert res.status_code == 200
    data = res.json()
    assert "pending_count" in data
    assert "approved_count" in data
    assert "rejected_count" in data
    assert "total_rooms" in data


def test_admin_approval_workflow(client):
    """Pengujian approval: PENDING -> APPROVED"""
    target_date = (date.today() + timedelta(days=2)).isoformat()
    # 1. Mahasiswa ajukan booking
    create_res = client.post("/api/v1/bookings", json={
        "room_id": "room_test_01",
        "organization": "HIMA Test",
        "purpose": "Sosialisasi Beasiswa Prestasi Mahasiswa",
        "booking_date": target_date,
        "start_time": "08:00:00",
        "end_time": "10:00:00"
    }, headers={"X-User-Id": "usr_mhs_test"})
    booking_id = create_res.json()["id"]

    # 2. Admin setujui
    appr_res = client.patch(
        f"/api/v1/admin/bookings/{booking_id}/status",
        json={"status": "APPROVED"},
        headers={"X-User-Id": "usr_admin_test"}
    )
    assert appr_res.status_code == 200
    assert appr_res.json()["status"] == "APPROVED"


def test_admin_rejection_requires_reason(client):
    """
    Sesuai PRD Bagian 6:
    Field 'Alasan Penolakan' (rejection_reason) WAJIB diisi jika pengelola menolak pengajuan.
    """
    target_date = (date.today() + timedelta(days=2)).isoformat()
    # 1. Booking baru
    create_res = client.post("/api/v1/bookings", json={
        "room_id": "room_test_01",
        "organization": "UKM Debat",
        "purpose": "Latihan Debat Bahasa Inggris",
        "booking_date": target_date,
        "start_time": "14:00:00",
        "end_time": "16:00:00"
    }, headers={"X-User-Id": "usr_mhs_test"})
    booking_id = create_res.json()["id"]

    # 2. Tolak tanpa alasan -> Wajib ditolak sistem (422)
    reject_fail = client.patch(
        f"/api/v1/admin/bookings/{booking_id}/status",
        json={"status": "REJECTED"},
        headers={"X-User-Id": "usr_admin_test"}
    )
    assert reject_fail.status_code == 422

    # 3. Tolak dengan alasan valid -> Berhasil (200)
    reject_success = client.patch(
        f"/api/v1/admin/bookings/{booking_id}/status",
        json={
            "status": "REJECTED",
            "rejection_reason": "Ruangan sedang digunakan untuk ujian sertifikasi."
        },
        headers={"X-User-Id": "usr_admin_test"}
    )
    assert reject_success.status_code == 200
    assert reject_success.json()["status"] == "REJECTED"
    assert "ujian sertifikasi" in reject_success.json()["rejection_reason"]


def test_rejected_booking_frees_slot(client):
    """
    Ketika sebuah pengajuan Ditolak (REJECTED), slot tersebut harus bisa dipinjam
    oleh pengaju lain tanpa dianggap bentrok.
    """
    target_date = (date.today() + timedelta(days=4)).isoformat()

    # 1. Pengajuan 1
    res1 = client.post("/api/v1/bookings", json={
        "room_id": "room_test_01",
        "organization": "HIMA Test",
        "purpose": "Peminjaman Pertama Ditolak",
        "booking_date": target_date,
        "start_time": "09:00:00",
        "end_time": "11:00:00"
    }, headers={"X-User-Id": "usr_mhs_test"})
    b_id = res1.json()["id"]

    # 2. Admin menolak Pengajuan 1
    client.patch(
        f"/api/v1/admin/bookings/{b_id}/status",
        json={"status": "REJECTED", "rejection_reason": "Proposal belum lengkap"},
        headers={"X-User-Id": "usr_admin_test"}
    )

    # 3. Pengajuan 2 pada jam yang sama persis (09:00 - 11:00) -> Harus BERHASIL!
    res2 = client.post("/api/v1/bookings", json={
        "room_id": "room_test_01",
        "organization": "UKM Seni",
        "purpose": "Peminjaman Pengganti Jadwal",
        "booking_date": target_date,
        "start_time": "09:00:00",
        "end_time": "11:00:00"
    }, headers={"X-User-Id": "usr_mhs_test"})

    assert res2.status_code == 201
    assert res2.json()["status"] == "PENDING"


def test_admin_room_crud(client):
    """Pengujian CRUD Ruangan oleh Admin (FR Modul Pengelola)"""
    # 1. Tambah Ruangan Baru
    create_room_res = client.post("/api/v1/admin/rooms", json={
        "name": "Ruang Smart Class 301",
        "location": "Gedung Kuliah Bersama Lt. 3",
        "capacity": 60,
        "facilities": ["Smart TV 85 Inch", "AC Central", "Whiteboard Glass"]
    }, headers={"X-User-Id": "usr_admin_test"})

    assert create_room_res.status_code == 201
    room_id = create_room_res.json()["id"]
    assert create_room_res.json()["name"] == "Ruang Smart Class 301"

    # 2. Update Ruangan
    update_res = client.put(f"/api/v1/admin/rooms/{room_id}", json={
        "capacity": 75
    }, headers={"X-User-Id": "usr_admin_test"})
    assert update_res.status_code == 200
    assert update_res.json()["capacity"] == 75

    # 3. Toggle Status Nonaktifkan
    status_res = client.patch(f"/api/v1/admin/rooms/{room_id}/status", json={
        "is_active": False
    }, headers={"X-User-Id": "usr_admin_test"})
    assert status_res.status_code == 200
    assert status_res.json()["is_active"] is False


def test_admin_master_schedule(client):
    """Pengujian Master Timeline Seluruh Ruangan (FR Bagian 6)"""
    res = client.get("/api/v1/admin/schedule", headers={"X-User-Id": "usr_admin_test"})
    assert res.status_code == 200
    assert isinstance(res.json(), list)
