# 🏛️ SIBIRU Service — Dokumentasi Teknis Lengkap

> **SIBIRU** = Sistem Informasi Peminjaman Ruangan Internal  
> Backend headless REST API berbasis **FastAPI + SQLAlchemy + SQLite**

---

## 📋 Daftar Isi

1. [Gambaran Umum Proyek](#1-gambaran-umum-proyek)
2. [Struktur Direktori](#2-struktur-direktori)
3. [Tech Stack & Dependencies](#3-tech-stack--dependencies)
4. [Setup & Instalasi](#4-setup--instalasi)
5. [Database: Skema & Relasi](#5-database-skema--relasi)
6. [Pembuatan Database (Migration)](#6-pembuatan-database-migration)
7. [Seeding Data Awal](#7-seeding-data-awal)
8. [Arsitektur Aplikasi](#8-arsitektur-aplikasi)
9. [Autentikasi & Otorisasi](#9-autentikasi--otorisasi)
10. [Flow System Lengkap](#10-flow-system-lengkap)
11. [API Endpoints Reference](#11-api-endpoints-reference)
12. [Mesin Conflict Detection](#12-mesin-conflict-detection)
13. [Konfigurasi](#13-konfigurasi)

---

## 1. Gambaran Umum Proyek

SIBIRU adalah layanan backend RESTful API untuk mengelola **peminjaman ruangan** di lingkungan kampus. Sistem ini melayani dua peran pengguna:

| Peran | Deskripsi |
|---|---|
| **BORROWER** | Mahasiswa, dosen, atau staf yang mengajukan peminjaman |
| **ADMIN** | Pengelola fasilitas yang menyetujui atau menolak pengajuan |

### Fitur Utama
- ✅ **Katalog Ruangan** — Lihat daftar ruangan beserta fasilitas dan kapasitas
- ✅ **Cek Ketersediaan Real-time** — Slot jam yang sudah dibooking tampil secara langsung
- ✅ **Pengajuan Peminjaman** — Form booking dengan validasi otomatis
- ✅ **Conflict Detection Engine** — Mencegah booking yang tumpang tindih secara atomik
- ✅ **Portal Admin** — Approve/Reject pengajuan + wajib alasan jika ditolak
- ✅ **Dashboard Metrik** — Statistik ringkas untuk pengelola
- ✅ **Master Timeline** — Jadwal terpadu semua ruangan dalam rentang tanggal

---

## 2. Struktur Direktori

```
sibiru-service/
├── app/
│   ├── main.py               # Entry point FastAPI, lifespan (startup/shutdown)
│   ├── config.py             # Konfigurasi aplikasi (Settings via Pydantic)
│   ├── database.py           # Engine SQLAlchemy, SessionLocal, Base
│   ├── seed.py               # Script seeding data awal
│   │
│   ├── models/               # ORM Models (SQLAlchemy)
│   │   ├── __init__.py
│   │   ├── user.py           # Model: users
│   │   ├── room.py           # Model: rooms, room_facilities
│   │   └── booking.py        # Model: bookings
│   │
│   ├── schemas/              # Pydantic Schemas (Request/Response)
│   │   ├── __init__.py
│   │   ├── user.py           # UserResponse, LoginRequest, LoginResponse
│   │   ├── room.py           # RoomCreate/Update/Response, Availability
│   │   └── booking.py        # BookingCreate/Response, StatusUpdate, Metrics
│   │
│   ├── routers/              # Router FastAPI per domain
│   │   ├── __init__.py
│   │   ├── auth.py           # /auth — Login & Profil
│   │   ├── rooms.py          # /rooms — Katalog & Ketersediaan
│   │   ├── bookings.py       # /bookings — Pengajuan & Riwayat Peminjam
│   │   └── admin.py          # /admin — Dashboard Pengelola
│   │
│   └── core/                 # Utilitas & Logic Inti
│       ├── __init__.py
│       ├── dependencies.py   # Dependency Injection: get_current_user, require_admin
│       ├── conflict_engine.py# Mesin deteksi konflik jadwal + per-room locking
│       └── exceptions.py     # Custom HTTP Exceptions
│
├── tests/                    # Unit & Integration Tests (pytest)
├── requirements.txt          # Dependencies Python
├── run.bat / run.ps1         # Script runner untuk Windows
└── sibiru.db                 # File database SQLite
```

---

## 3. Tech Stack & Dependencies

| Library | Versi Minimum | Kegunaan |
|---|---|---|
| `fastapi` | ≥ 0.115.0 | Framework web async |
| `uvicorn[standard]` | ≥ 0.32.0 | ASGI server |
| `sqlalchemy` | ≥ 2.0.36 | ORM + query builder |
| `pydantic` | ≥ 2.10.0 | Validasi data & serialisasi |
| `pydantic-settings` | ≥ 2.6.0 | Manajemen konfigurasi via env |
| `python-multipart` | ≥ 0.0.17 | Form data support |
| `pytest` | ≥ 8.3.0 | Framework testing |
| `httpx` | ≥ 0.28.0 | HTTP client async (untuk testing) |

---

## 4. Setup & Instalasi

### Prasyarat
- Python ≥ 3.10
- pip atau pip3

### Langkah Instalasi

```bash
# 1. Clone atau masuk ke direktori proyek
cd sibiru-service

# 2. Buat virtual environment
python -m venv .venv

# 3. Aktifkan virtual environment
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Windows CMD:
.\.venv\Scripts\activate.bat

# 4. Install semua dependencies
pip install -r requirements.txt

# 5. Jalankan aplikasi (database & seeding otomatis berjalan)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Atau gunakan script bawaan:
.\run.ps1    # PowerShell
.\run.bat    # CMD
```

### Akses Dokumentasi Interaktif
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

---

## 5. Database: Skema & Relasi

Database menggunakan **SQLite** (file `sibiru.db`) dengan **3 tabel utama** dan **1 tabel fasilitas**.

### ERD (Entity Relationship)

```
┌─────────────────────────────────────┐
│              users                  │
├─────────────────────────────────────┤
│ id          STRING(36)  PK          │
│ name        STRING(100) NOT NULL    │
│ identifier  STRING(50)  UNIQUE IDX  │  ← NIM / NIP
│ role        STRING(20)              │  ← BORROWER | ADMIN
│ organization STRING(100) NOT NULL   │
│ phone       STRING(25)  nullable    │
│ email       STRING(100) nullable    │
│ created_at  DATETIME                │
└─────────────────┬───────────────────┘
                  │ 1
                  │ has many
                  │ N
┌─────────────────▼───────────────────┐      ┌──────────────────────────────────┐
│             bookings                │      │             rooms                │
├─────────────────────────────────────┤      ├──────────────────────────────────┤
│ id             STRING(36)  PK       │      │ id          STRING(36)  PK       │
│ room_id        STRING(36)  FK ──────┼─────►│ name        STRING(100) UNIQUE   │
│ user_id        STRING(36)  FK       │      │ location    STRING(100)          │
│ borrower_name  STRING(100)          │      │ capacity    INTEGER              │
│ organization   STRING(100)          │      │ is_active   BOOLEAN   default T  │
│ purpose        TEXT                 │      │ image_url   STRING(255) nullable │
│ booking_date   DATE        IDX      │      │ created_at  DATETIME             │
│ start_time     TIME                 │      │ updated_at  DATETIME             │
│ end_time       TIME                 │      └──────────────┬───────────────────┘
│ status         STRING(20)  IDX      │                     │ 1
│ rejection_reason TEXT       nullable│                     │ has many
│ created_at     DATETIME             │                     │ N
│ updated_at     DATETIME             │      ┌──────────────▼───────────────────┐
└─────────────────────────────────────┘      │         room_facilities          │
  Composite IDX: (room_id, booking_date,     ├──────────────────────────────────┤
                  status)                    │ id      STRING(36)  PK           │
                                             │ room_id STRING(36)  FK (CASCADE) │
                                             │ name    STRING(50)               │
                                             └──────────────────────────────────┘
```

### Detail Kolom Penting

#### Tabel `users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `identifier` | STRING UNIQUE | NIM (mahasiswa) atau NIP (dosen/staf) — digunakan untuk login |
| `role` | STRING | `BORROWER` (peminjam) atau `ADMIN` (pengelola) |
| `organization` | STRING | HIMA, UKM, Prodi, Unit Kerja, dll |

#### Tabel `rooms`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `is_active` | BOOLEAN | Jika `False`, ruangan tidak bisa dibooking |
| `image_url` | STRING nullable | URL gambar ruangan (opsional) |

#### Tabel `bookings`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `status` | STRING | `PENDING` → `APPROVED` atau `REJECTED` |
| `rejection_reason` | TEXT nullable | **Wajib diisi** saat admin menolak |
| `booking_date` | DATE | Tanggal peminjaman (tidak boleh tanggal lampau) |

#### Composite Index
```sql
-- Mengoptimalkan query conflict detection
CREATE INDEX ix_bookings_room_date_status 
ON bookings (room_id, booking_date, status);
```

---

## 6. Pembuatan Database (Migration)

SIBIRU **tidak menggunakan Alembic**. Database dibuat secara otomatis menggunakan `Base.metadata.create_all()` saat aplikasi pertama kali dijalankan.

### Alur Pembuatan Database

```python
# app/database.py
engine = create_engine(
    settings.DATABASE_URL,       # "sqlite:///./sibiru.db"
    connect_args={"check_same_thread": False}  # Khusus SQLite
)

# Aktifkan Foreign Keys & WAL Mode untuk SQLite
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")    # Aktifkan FK constraint
    cursor.execute("PRAGMA journal_mode=WAL")   # Write-Ahead Logging (concurrency)
    cursor.close()
```

### Kapan Tabel Dibuat?

Saat aplikasi startup melalui **lifespan event** di `app/main.py`:

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ⬇ Startup: Buat semua tabel yang belum ada
    Base.metadata.create_all(bind=engine)
    seed_database()   # Inject data awal
    yield
    # ⬆ Shutdown: tidak ada aksi khusus
```

> [!NOTE]
> `create_all()` bersifat **idempotent** — jika tabel sudah ada, operasi ini dilewati. Database tidak akan di-reset ulang setiap restart.

### SQLite PRAGMA yang Diaktifkan

| PRAGMA | Nilai | Alasan |
|---|---|---|
| `foreign_keys` | ON | Mengaktifkan constraint FK (default OFF di SQLite) |
| `journal_mode` | WAL | Meningkatkan performa concurrent read/write |

---

## 7. Seeding Data Awal

Script seeding berada di [`app/seed.py`](file:///c:/Users/user/Desktop/sibiru-service/app/seed.py). Dijalankan otomatis saat startup.

### Logika Seeding

```
seed_database() dipanggil saat startup
        ↓
Cek: apakah tabel users sudah ada data?
        ↓
    YA → Skip seeding (log: "melewatkan seeding")
        ↓
   TIDAK → Inject data awal
```

### Data yang Di-seed

#### 👤 Pengguna Demo (3 akun)

| ID | Nama | NIM/NIP | Role |
|---|---|---|---|
| `usr_admin_01` | Budi Santoso, S.Kom. | `197905202008011002` | **ADMIN** |
| `usr_mhs_01` | Ahmad Zaki | `2101001` | **BORROWER** |
| `usr_dosen_01` | Dr. Siti Rahma, M.T. | `198501152010122001` | **BORROWER** |

#### 🏫 Ruangan Master (4 ruangan)

| ID | Nama Ruangan | Lokasi | Kapasitas | Fasilitas |
|---|---|---|---|---|
| `room_auditorium` | Auditorium Utama | Gedung Rektorat Lt. 3 | 300 | AC Central, Proyektor Laser HD, Sound System Line Array, Panggung, Mic Wireless |
| `room_lab_c201` | Lab Komputer C-201 | Gedung FTI Lt. 2 | 40 | AC, PC Workstation 40 Unit, Proyektor, Whiteboard, High Speed LAN |
| `room_seminar_b` | Ruang Seminar Gedung B | Gedung Pascasarjana Lt. 1 | 80 | AC, Smart TV 75 Inch, Sound System, Whiteboard, Mic Wireless |
| `room_rapat_senat` | Ruang Rapat Senat | Gedung Rektorat Lt. 2 | 25 | AC, Conference Camera 4K, Microphone Meja, Smart TV 65 Inch |

#### 📅 Booking Demo (3 record)

| ID | Ruangan | Peminjam | Tanggal | Jam | Status |
|---|---|---|---|---|---|
| `book_sample_01` | Auditorium Utama | Ahmad Zaki | Besok | 09:00–12:00 | **APPROVED** |
| `book_sample_02` | Lab Komputer C-201 | Ahmad Zaki | Besok | 13:00–16:00 | **PENDING** |
| `book_sample_03` | Ruang Rapat Senat | Dr. Siti Rahma | 3 hari lagi | 10:00–12:00 | **REJECTED** |

> [!TIP]
> Untuk menjalankan seeding secara manual (tanpa menjalankan server):
> ```bash
> python -m app.seed
> ```

---

## 8. Arsitektur Aplikasi

### Layer Architecture

```
┌────────────────────────────────────────────┐
│              HTTP Request                  │
└────────────────────┬───────────────────────┘
                     ▼
┌────────────────────────────────────────────┐
│         FastAPI Middleware Layer           │
│    (CORS, Request Validation)             │
└────────────────────┬───────────────────────┘
                     ▼
┌────────────────────────────────────────────┐
│              Router Layer                  │
│  /auth  /rooms  /bookings  /admin         │
└────────────────────┬───────────────────────┘
                     ▼
┌────────────────────────────────────────────┐
│           Dependency Injection             │
│   get_current_user()  require_admin()     │
│   get_db()  (Session SQLAlchemy)          │
└────────────────────┬───────────────────────┘
                     ▼
┌────────────────────────────────────────────┐
│             Business Logic                 │
│   Conflict Engine  |  Validation          │
│   Pydantic Schemas (Request/Response)     │
└────────────────────┬───────────────────────┘
                     ▼
┌────────────────────────────────────────────┐
│            ORM Layer (SQLAlchemy)          │
│     User  |  Room  |  Booking Models      │
└────────────────────┬───────────────────────┘
                     ▼
┌────────────────────────────────────────────┐
│         SQLite Database (sibiru.db)        │
└────────────────────────────────────────────┘
```

### Komponen Inti

| Komponen | File | Fungsi |
|---|---|---|
| `Settings` | `config.py` | Konfigurasi terpusat via env var / .env |
| `engine` | `database.py` | SQLAlchemy engine + PRAGMA setup |
| `SessionLocal` | `database.py` | Session factory untuk ORM queries |
| `Base` | `database.py` | Deklaratif base class semua model ORM |
| `get_current_user` | `core/dependencies.py` | Ekstrak user dari header request |
| `require_admin` | `core/dependencies.py` | Guard — hanya ADMIN yang bisa akses |
| `ConflictEngine` | `core/conflict_engine.py` | Deteksi overlap jadwal + per-room locking |
| `CustomExceptions` | `core/exceptions.py` | HTTP exceptions terstruktur |

---

## 9. Autentikasi & Otorisasi

SIBIRU menggunakan **simple token auth** berbasis header — cocok untuk sistem internal kampus.

### Mekanisme Autentikasi

```
Client Request
     │
     ├─ Header: X-User-Id: <user_id_atau_NIM/NIP>
     │          ATAU
     └─ Header: Authorization: Bearer <user_id>
                     │
                     ▼
             get_current_user()
                     │
          ┌──────────┴──────────┐
          │                     │
    Header ada?            Tidak ada header?
          │                     │
    Cari di DB            Fallback ke BORROWER
    by id/identifier      pertama di DB
          │                     │
    Ditemukan? ─────TIDAK──► 401 Unauthorized
          │
         User Object dikembalikan
```

### Login Flow

```
POST /api/v1/auth/login
Body: { "identifier": "2101001" }   ← NIM, NIP, atau User ID
           │
           ▼
   Query DB: User.identifier == value OR User.id == value
           │
   Ditemukan? ─── TIDAK ──► 404 Not Found
           │
          YA
           │
   Return: { "token": user.id, "user": {...} }
           │
   ← Simpan token (user.id) di client
   ← Gunakan sebagai X-User-Id header untuk request selanjutnya
```

### Akun Demo untuk Testing

| Identifier (untuk login) | Role | Kegunaan |
|---|---|---|
| `197905202008011002` atau `usr_admin_01` | **ADMIN** | Akses semua endpoint admin |
| `2101001` atau `usr_mhs_01` | **BORROWER** | Akses peminjam (mahasiswa) |
| `198501152010122001` atau `usr_dosen_01` | **BORROWER** | Akses peminjam (dosen) |

---

## 10. Flow System Lengkap

### Flow 1: Peminjam Mengajukan Booking

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLOW: PENGAJUAN BOOKING                     │
└─────────────────────────────────────────────────────────────────┘

1. Client → GET /api/v1/rooms
   └─ Lihat katalog ruangan (filter: aktif, kapasitas, search)

2. Client → GET /api/v1/rooms/{room_id}/availability?date=YYYY-MM-DD
   └─ Cek slot jam yang sudah terisi

3. Client → POST /api/v1/bookings
   Header: X-User-Id: {user_id}
   Body: {
     "room_id": "room_auditorium",
     "organization": "HIMA Informatika",
     "purpose": "Seminar AI dan Future Tech",
     "booking_date": "2026-10-26",
     "start_time": "09:00",
     "end_time": "12:00"
   }
          │
          ▼
   ┌─── Validasi Pydantic Schema ───┐
   │ • start_time < end_time?       │
   │ • booking_date >= hari ini?    │
   └────────────────┬───────────────┘
                    │ LOLOS
                    ▼
   ┌─── Cek Ruangan di DB ──────────┐
   │ • room ada?                    │
   │ • room.is_active == True?      │
   └────────────────┬───────────────┘
                    │ LOLOS
                    ▼
   ┌─── Acquire Per-Room Lock ──────┐
   │  threading.Lock per room_id    │
   │  (mencegah race condition)     │
   └────────────────┬───────────────┘
                    │
                    ▼
   ┌─── Conflict Detection Engine ──┐
   │  Query DB: bookings dengan     │
   │  status IN (APPROVED, PENDING) │
   │  pada tanggal + ruangan sama   │
   │                                │
   │  Rumus overlap:                │
   │  new_start < exist_end         │
   │  AND new_end > exist_start     │
   └────────────────┬───────────────┘
                    │
          ┌─────────┴────────────┐
          │                      │
     Ada konflik?          Tidak ada konflik
          │                      │
          ▼                      ▼
   409 Conflict         INSERT Booking
   {detail: {           status = "PENDING"
     error,                     │
     message,                   ▼
     conflict_details   201 Created
   }}                   BookingResponse
```

### Flow 2: Admin Mengelola Pengajuan

```
┌─────────────────────────────────────────────────────────────────┐
│                  FLOW: APPROVAL / PENOLAKAN                    │
└─────────────────────────────────────────────────────────────────┘

1. Admin → GET /api/v1/admin/metrics
   └─ Lihat ringkasan: pending=5, approved=10, rejected=2, dll

2. Admin → GET /api/v1/admin/bookings?status=PENDING
   └─ Lihat antrian pengajuan yang menunggu keputusan

3. Admin → PATCH /api/v1/admin/bookings/{booking_id}/status
   Header: X-User-Id: {admin_user_id}
   Body A (Setujui):
   { "status": "APPROVED" }

   Body B (Tolak — rejection_reason WAJIB):
   { "status": "REJECTED", "rejection_reason": "Jadwal konflik dengan acara resmi." }
          │
          ▼
   Validasi: role == ADMIN? → TIDAK → 403 Forbidden
          │ YA
          ▼
   Cari booking by ID → TIDAK → 404 Not Found
          │ ADA
          ▼
   Update booking.status
   Jika REJECTED → simpan rejection_reason
   Jika APPROVED → hapus rejection_reason (set None)
          │
          ▼
   200 OK — BookingResponse (status terupdate)
```

### Flow 3: Peminjam Tracking Status

```
┌─────────────────────────────────────────────────────────────────┐
│                  FLOW: TRACKING STATUS BOOKING                 │
└─────────────────────────────────────────────────────────────────┘

Client → GET /api/v1/bookings/my
Header: X-User-Id: {user_id}
Query params (opsional): ?status=PENDING
         │
         ▼
  Filter: Booking.user_id == current_user.id
         │
         ▼
  Return: List<BookingResponse> sorted by date desc
  Setiap item mengandung:
  ├─ status: 🟡 PENDING | 🟢 APPROVED | 🔴 REJECTED
  └─ rejection_reason (jika REJECTED)
```

### Status Lifecycle Booking

```
          ┌─────────────────────┐
          │ POST /bookings       │
          │ (pengajuan baru)     │
          └──────────┬──────────┘
                     │
                     ▼
              ┌─────────────┐
              │   PENDING   │ 🟡
              │ (menunggu)  │
              └──────┬──────┘
                     │
        ┌────────────┴─────────────┐
        │                          │
        ▼                          ▼
 ┌────────────┐            ┌──────────────┐
 │  APPROVED  │ 🟢         │   REJECTED   │ 🔴
 │ (disetujui)│            │  (ditolak)   │
 └────────────┘            └──────────────┘
                             + rejection_reason
                               WAJIB diisi
```

---

## 11. API Endpoints Reference

Base URL: `http://localhost:8000/api/v1`

### 🔐 Auth — `/auth`

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/auth/login` | ❌ | Login dengan NIM/NIP/ID |
| `GET` | `/auth/me` | ✅ | Profil pengguna aktif |
| `GET` | `/auth/demo-users` | ❌ | Daftar akun demo (dev only) |

**Login Request:**
```json
{ "identifier": "2101001" }
```

**Login Response:**
```json
{
  "token": "usr_mhs_01",
  "user": { "id": "usr_mhs_01", "name": "Ahmad Zaki", "role": "BORROWER", ... },
  "message": "Berhasil login sebagai Ahmad Zaki (BORROWER)"
}
```

---

### 🏫 Rooms — `/rooms`

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `GET` | `/rooms` | ❌ | Katalog ruangan (filter: kapasitas, search) |
| `GET` | `/rooms/{room_id}` | ❌ | Detail satu ruangan |
| `GET` | `/rooms/{room_id}/availability` | ❌ | Jadwal booking ruangan per tanggal |

**Query Params `/rooms`:**
- `is_active_only=true` — filter ruangan aktif
- `min_capacity=50` — kapasitas minimum
- `search=auditorium` — pencarian nama/lokasi

**Availability Response:**
```json
{
  "room_id": "room_auditorium",
  "room_name": "Auditorium Utama",
  "date": "2026-10-26",
  "is_room_active": true,
  "booked_intervals": [
    {
      "booking_id": "book_sample_01",
      "start_time": "09:00",
      "end_time": "12:00",
      "status": "APPROVED",
      "organization": "HIMA Informatika",
      "borrower_name": "Ahmad Zaki"
    }
  ]
}
```

---

### 📋 Bookings — `/bookings`

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/bookings` | ✅ BORROWER | Ajukan peminjaman baru |
| `GET` | `/bookings/my` | ✅ BORROWER | Daftar booking milik saya |
| `GET` | `/bookings/{booking_id}` | ✅ | Detail booking (owner atau ADMIN) |

**Booking Create Request:**
```json
{
  "room_id": "room_auditorium",
  "organization": "HIMA Informatika",
  "purpose": "Seminar Nasional AI dan Future Tech",
  "booking_date": "2026-10-27",
  "start_time": "09:00",
  "end_time": "12:00"
}
```

---

### 🛡️ Admin — `/admin` (Khusus ADMIN)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `GET` | `/admin/metrics` | ✅ ADMIN | Ringkasan metrik dashboard |
| `GET` | `/admin/bookings` | ✅ ADMIN | Semua booking (filter & search) |
| `PATCH` | `/admin/bookings/{id}/status` | ✅ ADMIN | Approve / Reject pengajuan |
| `GET` | `/admin/schedule` | ✅ ADMIN | Master timeline jadwal terpadu |
| `POST` | `/admin/rooms` | ✅ ADMIN | Tambah ruangan baru |
| `PUT` | `/admin/rooms/{id}` | ✅ ADMIN | Edit data ruangan |
| `PATCH` | `/admin/rooms/{id}/status` | ✅ ADMIN | Aktif/nonaktifkan ruangan |

**Metrics Response:**
```json
{
  "pending_count": 5,
  "approved_count": 12,
  "rejected_count": 3,
  "total_bookings": 20,
  "total_rooms": 4,
  "active_rooms": 4,
  "today_bookings_count": 2
}
```

**Approve/Reject Request:**
```json
// Approve:
{ "status": "APPROVED" }

// Reject (rejection_reason WAJIB):
{ "status": "REJECTED", "rejection_reason": "Ruangan sudah dipesan untuk acara resmi." }
```

---

## 12. Mesin Conflict Detection

File: [`app/core/conflict_engine.py`](file:///c:/Users/user/Desktop/sibiru-service/app/core/conflict_engine.py)

### Algoritma Deteksi Overlap

Dua interval waktu dinyatakan **bentrok** jika:

```
(JamMulai_Baru < JamSelesai_Eksisting) AND (JamSelesai_Baru > JamMulai_Eksisting)
```

**Visualisasi:**
```
Eksisting:    [====09:00====12:00====]
Baru (bentrok):         [====11:00====14:00====]
    → 11:00 < 12:00 (TRUE) AND 14:00 > 09:00 (TRUE) → BENTROK!

Baru (OK):    [====13:00====15:00====]
    → 13:00 < 12:00 (FALSE) → TIDAK BENTROK ✓

Baru (OK):    [====07:00====09:00====]
    → 09:00 > 09:00 (FALSE) → TIDAK BENTROK ✓ (tepat bersebelahan OK)
```

### Per-Room Concurrency Lock

Untuk mencegah **race condition** (dua request masuk bersamaan untuk ruangan yang sama):

```python
# Setiap room_id memiliki threading.Lock sendiri
_room_locks = {}

def get_room_lock(room_id: str) -> Lock:
    with _master_lock:
        if room_id not in _room_locks:
            _room_locks[room_id] = Lock()
        return _room_locks[room_id]

# Penggunaan di booking endpoint:
room_lock = get_room_lock(payload.room_id)
with room_lock:
    conflicts = find_conflicting_bookings(...)
    if not conflicts:
        db.add(new_booking)
        db.commit()
```

> [!WARNING]
> Lock ini bersifat **in-memory** (per-process). Tidak aman jika aplikasi dijalankan dengan **multiple workers** (multi-process). Untuk produksi multi-worker, gunakan distributed lock (misal: Redis).

---

## 13. Konfigurasi

File: [`app/config.py`](file:///c:/Users/user/Desktop/sibiru-service/app/config.py)

| Variabel | Default | Keterangan |
|---|---|---|
| `PROJECT_NAME` | `SIBIRU Service` | Nama aplikasi |
| `VERSION` | `1.0.0` | Versi API |
| `API_V1_PREFIX` | `/api/v1` | Prefix semua endpoint |
| `DATABASE_URL` | `sqlite:///./sibiru.db` | URL koneksi database |
| `CORS_ORIGINS` | `["*"]` | Allowed origins (ganti di produksi!) |
| `SECRET_KEY` | `sibiru-secret-key-...` | **Wajib diganti di produksi!** |

### Kustomisasi via `.env`

Buat file `.env` di root proyek:

```env
DATABASE_URL=sqlite:///./sibiru.db
SECRET_KEY=ganti-dengan-key-yang-aman-dan-panjang
CORS_ORIGINS=["http://localhost:3000","https://app.kampus.ac.id"]
```

> [!CAUTION]
> `SECRET_KEY` dan `CORS_ORIGINS=["*"]` pada default config **TIDAK AMAN** untuk environment produksi. Selalu override via file `.env` sebelum deploy.
