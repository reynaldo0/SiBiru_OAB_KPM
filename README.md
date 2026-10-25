# 🏛️ SIBIRU Backend Service (REST API)

> **Sistem Informasi Peminjaman Ruangan Internal**  
> Backend Headless REST API terpusat berbasis **Python 3.12+ / FastAPI / SQLAlchemy / Pydantic v2 / SQLite** sesuai spesifikasi **PRD SIBIRU Versi 1.0**.

---

## 🌟 Fitur Utama Sesuai PRD

1. **Katalog & Ketersediaan Ruangan Real-time (FR-01)**:
   - Endpoint katalog ruangan lengkap dengan kapasitas, lokasi, dan daftar fasilitas (AC, Proyektor, Sound System, dll).
   - Pengecekan status ketersediaan jam per tanggal secara presisi (*self-service*).
2. **⚡ Mesin Validasi Bentrok Otomatis (*Conflict Detection Engine*) (FR-02)**:
   - Menerapkan formula overlap interval:  
     $$\text{Bentrok} \iff (\text{JamMulai}_{\text{Baru}} < \text{JamSelesai}_{\text{Eksisting}}) \land (\text{JamSelesai}_{\text{Baru}} > \text{JamMulai}_{\text{Eksisting}})$$
   - Pengecekan otomatis terhadap peminjaman berstatus `APPROVED` dan `PENDING` pada ruangan & tanggal yang sama.
   - Peringatan instan HTTP `409 Conflict` jika terdeteksi bentrok waktu.
   - Slot berdampingan (misal: 08:00–10:00 dan 10:00–12:00) diizinkan secara sah.
   - Peminjaman yang berstatus `REJECTED` secara otomatis membebaskan kembali slot waktu.
3. **Proteksi Kondisi Transaksi Simultan (*Race Condition Booking*)**:
   - Dilengkapi *concurrency lock* per ruangan dan SQLite WAL mode untuk menjamin 0% risiko jadwal ganda (*double booking*) pada permintaan serentak di milidetik yang sama.
4. **Portal Peminjam (FR-03)**:
   - Pengajuan peminjaman cepat dengan validasi ketat (keperluan minimal 10 karakter, tanggal masa depan, jam valid).
   - Menu "Pengajuan Saya" dengan tracking status (🟡 `PENDING`, 🟢 `APPROVED`, 🔴 `REJECTED` beserta alasan penolakan).
5. **Modul Pengelola / Admin (FR Bagian 6)**:
   - **Dashboard Ringkas**: Metrik statistik jumlah pengajuan (Pending, Approved, Rejected) dan peminjaman hari ini.
   - **Antrean Pengajuan Masuk**: Aksi cepat *Setujui* dan *Tolak* (wajib mengisi `rejection_reason` saat menolak).
   - **Master Jadwal Ruangan**: Timeline terpadu pemanfaatan seluruh ruangan.
   - **Kelola Data Ruangan**: Fitur CRUD (Tambah, Edit, Nonaktifkan) master data ruangan dan fasilitas.
   - **Riwayat & Pencarian**: Filter rentang tanggal, jenis ruangan, status, dan pencarian kata kunci.

---

## 🛠️ Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Asynchronous, High Performance)
- **Data Validation**: [Pydantic v2](https://docs.pydantic.dev/)
- **ORM**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/)
- **Database**: SQLite (dengan PRAGMA WAL mode & Foreign Keys aktif)
- **Testing**: [pytest](https://pytest.org/) & [httpx](https://www.python-httpx.org/) (23 automated test cases)
- **Dokumentasi API**: Swagger UI bawaan (`/docs`) & ReDoc (`/redoc`)

---

## 🚀 Panduan Instalasi & Menjalankan Server

### 1. Kloning / Buka Direktori Proyek
```bash
cd sibiru-service
```

### 2. Instalasi Dependensi
```bash
pip install -r requirements.txt
```

### 3. Menjalankan Server API
Anda dapat menjalankan server dengan salah satu cara berikut:

**Opsi A (Paling Mudah - Menggunakan Script Otomatis):**
```powershell
.\run.ps1
```
*atau di Command Prompt / File Explorer:*
```cmd
.\run.bat
```

**Opsi B (Menggunakan Virtual Environment `.venv`):**
```powershell
.\.venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 --reload
```
*atau aktifkan virtual environment terlebih dahulu:*
```powershell
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Server akan aktif di:
- **API Base URL**: `http://localhost:8000/api/v1`
- **Swagger UI (Dokumentasi Interaktif & Try-it-out)**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 👥 Akun Demo & Autentikasi

Backend menyediakan mekanisme autentikasi fleksibel via HTTP Header:
- **Header**: `X-User-Id: <user_id atau NIM/NIP>`

### Akun Pre-seeded:
| Nama | Peran | NIM / NIP | ID Pengguna |
| :--- | :--- | :--- | :--- |
| **Budi Santoso, S.Kom.** | `ADMIN` (Pengelola) | `197905202008011002` | `usr_admin_01` |
| **Ahmad Zaki** | `BORROWER` (Mahasiswa) | `2101001` | `usr_mhs_01` |
| **Dr. Siti Rahma, M.T.** | `BORROWER` (Dosen) | `198501152010122001` | `usr_dosen_01` |

> *Catatan: Jika request dikirim tanpa header `X-User-Id` saat pengujian development, sistem akan fallback otomatis ke akun peminjam demo.*

---

## 📑 Ringkasan Endpoint REST API

### 🔑 1. Autentikasi & Profil Pengguna
- `POST /api/v1/auth/login` — Login simulasi berdasarkan NIM/NIP/ID.
- `GET /api/v1/auth/me` — Ambil profil akun aktif pengguna yang login.
- `GET /api/v1/auth/demo-users` — Daftar akun demo untuk pengujian switch peran di frontend.

### 🏢 2. Modul Peminjam (*Borrower*)
- `GET /api/v1/rooms` — Katalog seluruh ruangan aktif beserta fasilitas & kapasitas.
- `GET /api/v1/rooms/{room_id}/availability?date=YYYY-MM-DD` — Cek slot jam terpakai secara real-time pada tanggal tertentu.
- `POST /api/v1/bookings` — Mengajukan permohonan peminjaman baru (dilindungi Conflict Detection Engine).
- `GET /api/v1/bookings/my?status=PENDING` — Melihat daftar pengajuan milik pengguna (status 🟡🟢🔴 + detail alasan penolakan).
- `GET /api/v1/bookings/{booking_id}` — Detail permohonan peminjaman.

### 🛡️ 3. Modul Pengelola (*Admin*)
*Memerlukan header akun berstatus `ADMIN` (misal: `X-User-Id: usr_admin_01`).*
- `GET /api/v1/admin/metrics` — Metrik ringkasan dashboard (total pending, approved, rejected, total rooms, today bookings).
- `GET /api/v1/admin/bookings` — Antrean permohonan & riwayat dengan multi-filter (`status`, `room_id`, `start_date`, `end_date`, `search`).
- `PATCH /api/v1/admin/bookings/{id}/status` — Menyetujui (`APPROVED`) atau Menolak (`REJECTED` + wajib menyertakan `rejection_reason`).
- `GET /api/v1/admin/schedule` — Master timeline seluruh agenda ruangan.
- `POST /api/v1/admin/rooms` — Tambah ruangan baru beserta fasilitasnya.
- `PUT /api/v1/admin/rooms/{id}` — Update data ruangan & fasilitas.
- `PATCH /api/v1/admin/rooms/{id}/status` — Mengaktifkan / menonaktifkan ruangan.

---

## 🧪 Pengujian Otomatis (*Automated Testing*)

Jalankan seluruh test suite dengan:
```bash
python -m pytest -v
```

### Cakupan Pengujian:
- ✅ **`tests/test_conflict_engine.py`**: Uji rumus matematis interval waktu (overlap awal, overlap akhir, enclosed, enclosing, adjacent allowed, disjoint).
- ✅ **`tests/test_bookings_api.py`**: Uji integrasi API peminjaman, proteksi bentrok (HTTP 409), validasi field wajib (keperluan min 10 karakter, rentang jam valid).
- ✅ **`tests/test_admin_api.py`**: Uji RBAC (403 untuk non-admin), approval antrean, penolakan wajib alasan (422 jika kosong), pembebasan slot saat ditolak, serta CRUD ruangan.
- ✅ **`tests/test_concurrency.py`**: Simulasi 10 transaksi serentak secara simultan untuk membuktikan 0% race condition booking.
