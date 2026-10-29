# 🏛️ SIBIRU — Sistem Informasi Peminjaman Ruangan Internal

> Solusi terintegrasi pengelolaan dan reservasi ruangan kampus bebas tumpang tindih waktu (*zero double-booking*) dengan arsitektur modern **FastAPI + MySQL Laragon (Backend)** dan **React 19 + TypeScript + Tailwind CSS (Frontend)**.

---

## ⚡ Command CLI SIBIRU (Cara Tercepat Menjalankan)

Proyek ini telah dilengkapi dengan antarmuka baris perintah (**SIBIRU CLI**) terpadu. Anda cukup menjalankan perintah dari terminal root proyek:

| Perintah CLI | Alternatif (NPM) | Keterangan |
|---|---|---|
| `.\sibiru start` | `npm start` / `npm run dev` | **Menjalankan Backend & Frontend sekaligus** di jendela terpisah |
| `.\sibiru backend` | `npm run backend` | Menjalankan service backend FastAPI (Port `8000`) |
| `.\sibiru frontend` | `npm run frontend` | Menjalankan aplikasi frontend Vite/React (Port `3000`) |
| `.\sibiru status` | `npm run status` | **Memeriksa status** koneksi MySQL Laragon (Port `3306`), Backend, dan Frontend |
| `.\sibiru seed` | `npm run seed` | Membuat tabel & menabur data awal (*seed*) ke MySQL Laragon |
| `.\sibiru test` | `npm run test` | Menjalankan seluruh 26 automated unit & integration test suites |

> **Catatan:** Di Command Prompt (CMD), Anda cukup mengetik `sibiru start`. Di PowerShell, gunakan `.\sibiru start` atau `python cli.py start`.

---

## 🌐 Alamat Layanan & Akses

* **Frontend Web Application**: [http://localhost:3000](http://localhost:3000)
* **Backend REST API Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc Technical Specification**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
* **Database Server**: MySQL Laragon pada `127.0.0.1:3306` (Database: `sibiru`)

---

## 🔑 Kredensial Akun Percobaan (Demo Data)

Autentikasi menggunakan verifikasi nyata kata sandi ter-hash SHA-256 + salt pada database MySQL:

| Peran Akun | Nama Pengguna | NIM / NIP | Kata Sandi | Hak Akses |
|---|---|---|---|---|
| **Pengelola (Admin)** | Drs. Hendro Wibowo, M.T. | `197905202008011002` | `admin123` | Portal pengelola, verifikasi persetujuan/penolakan, master jadwal, CRUD fasilitas |
| **Mahasiswa** | Rian Pratama | `2101001` | `mhs123` | Katalog ruangan, pengajuan slot waktu, pemantauan status pengajuan |
| **Dosen Pembina** | Dr. Sri Wahyuni, M.Kom. | `198501152010122001` | `dosen123` | Peminjaman ruang rapat senat, auditorium, dan laboratorium |

> **Pendaftaran Akun Baru**: Pengguna juga dapat langsung mendaftar melalui menu **Daftar Akun Baru** pada halaman login. Data langsung tersimpan di MySQL.

---

## 📁 Struktur Direktori Monorepo

```
SiBiru_OAB_KPM/
├── cli.py                  # 💻 Core script SIBIRU CLI Python
├── sibiru.cmd / sibiru.bat # ⚡ Launcher CLI untuk Command Prompt Windows
├── sibiru.ps1              # ⚡ Launcher CLI untuk Windows PowerShell
├── package.json            # 📦 Root npm scripts (npm start, npm run backend, etc.)
├── run_all.bat             # 🚀 Shortcut 1-klik buka backend + frontend
├── run_backend.bat         # ⚙️ Shortcut jalankan backend saja
├── run_frontend.bat        # 🎨 Shortcut jalankan frontend saja
│
├── docs/                   # 📄 Dokumentasi & spesifikasi (di-gitignore)
│   ├── DOKUMENTASI.md      # Arsitektur backend, conflict detection, skema DB
│   ├── DESIGN.md           # Sistem desain visual, palet #006569, token UI
│   └── ROADMAP.md          # Rencana rilis frontend & matriks pengujian
│
├── backend/                # ⚙️ Headless REST API (FastAPI, SQLAlchemy, MySQL Laragon)
│   ├── app/                # Modul inti, model ORM, schema Pydantic, router API
│   │   ├── core/           # Security (SHA-256) & Conflict Detection Engine
│   │   ├── models/         # User, Room, RoomFacility, Booking (SQLAlchemy)
│   │   ├── routers/        # /auth, /rooms, /bookings, /admin
│   │   ├── database.py     # MySQL Connection Pooling (PyMySQL)
│   │   ├── config.py       # Pydantic Settings & environment variables
│   │   └── seed.py         # Seeder master data ruangan & user
│   ├── tests/              # 26 Automated test suites (pytest)
│   └── .env                # Konfigurasi koneksi MySQL Laragon
│
├── frontend/               # 💻 Aplikasi Web (React 19, TypeScript, Tailwind CSS, Vite 6)
│   ├── src/
│   │   ├── app/            # Root Router & Shell navigasi
│   │   ├── pages/          # Home, Katalog, Detail Ruangan, Pengajuan Saya, Login/Register, Admin Portal
│   │   ├── components/     # UI primitives, layout, modal booking, timeline ketersediaan
│   │   ├── hooks/          # TanStack Query hooks dengan auto-refresh 3s real-time
│   │   ├── services/       # HTTP Client API terhubung ke FastAPI
│   │   ├── store/          # Zustand auth store & sesi token persisten
│   │   └── types/          # Definisi TypeScript tersinkronisasi
│   ├── public/assets/      # Ilustrasi WebP editorial MATRA
│   └── vite.config.ts      # Konfigurasi proxy /api/v1 -> localhost:8000
│
├── MATRA/                  # 🖼️ Folder referensi editorial visual
├── .gitignore              # Mengabaikan docs/, node_modules/, *.db, .venv/, .env
└── README.md               # Panduan utama repositori
```
