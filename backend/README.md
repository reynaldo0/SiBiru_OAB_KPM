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

### 1. Masuk ke Direktori Backend
```bash
cd backend
```

### 2. Instalasi Dependensi
```bash
pip install -r requirements.txt
```

### 3. Menjalankan Server API
```powershell
.\run.ps1
```
*atau:*
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Server aktif di:
- **API Base URL**: `http://localhost:8000/api/v1`
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 👥 Akun Demo & Header Autentikasi

Backend menggunakan autentikasi fleksibel berbasis HTTP Header:
- **Header**: `X-User-Id: <user_id atau NIM/NIP>`

| Nama | Peran | NIM / NIP | ID Pengguna |
| :--- | :--- | :--- | :--- |
| **Budi Santoso, S.Kom.** | `ADMIN` (Pengelola) | `197905202008011002` | `usr_admin_01` |
| **Ahmad Zaki** | `BORROWER` (Mahasiswa) | `2101001` | `usr_mhs_01` |
| **Dr. Siti Rahma, M.T.** | `BORROWER` (Dosen) | `198501152010122001` | `usr_dosen_01` |
