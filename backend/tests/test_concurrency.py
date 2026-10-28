import concurrent.futures
from datetime import date, timedelta
from fastapi.testclient import TestClient
from app.main import app


def test_concurrent_booking_race_condition(client):
    """
    Kebutuhan Non-Fungsional (PRD Bagian 8):
    Integritas Data: Penanganan kondisi transaksi simultan untuk mencegah race condition booking.
    Target: 0% insiden bentrok jadwal pemakaian.

    Simulasi 10 permintaan booking serentak pada ruangan, tanggal, dan jam yang sama.
    Hasil yang diharapkan: Tepat 1 permohonan yang lolos (HTTP 201), dan 9 lainnya ditolak (HTTP 409).
    """
    target_date = (date.today() + timedelta(days=5)).isoformat()
    total_concurrent_requests = 10

    def make_booking_request(index: int):
        payload = {
            "room_id": "room_test_01",
            "organization": f"Organisasi Simultan #{index}",
            "purpose": f"Kegiatan Pengujian Transaksi Konkuren #{index}",
            "booking_date": target_date,
            "start_time": "10:00:00",
            "end_time": "12:00:00"
        }
        with TestClient(app) as local_client:
            return local_client.post("/api/v1/bookings", json=payload, headers={"X-User-Id": "usr_mhs_test"})

    with concurrent.futures.ThreadPoolExecutor(max_workers=total_concurrent_requests) as executor:
        futures = [executor.submit(make_booking_request, i) for i in range(total_concurrent_requests)]
        responses = [f.result() for f in concurrent.futures.as_completed(futures)]

    success_responses = [r for r in responses if r.status_code == 201]
    conflict_responses = [r for r in responses if r.status_code == 409]

    # Pastikan tepat 1 berhasil dan 9 ditolak bentrok
    assert len(success_responses) == 1, f"Harus tepat 1 booking yang berhasil, namun ditemukan {len(success_responses)}"
    assert len(conflict_responses) == total_concurrent_requests - 1, f"Harus {total_concurrent_requests - 1} ditolak bentrok"

    # Verifikasi konsistensi database: hanya ada 1 booking pada rentang tersebut
    check_availability = client.get(f"/api/v1/rooms/room_test_01/availability?date={target_date}")
    assert check_availability.status_code == 200
    booked_intervals = check_availability.json()["booked_intervals"]
    assert len(booked_intervals) == 1
