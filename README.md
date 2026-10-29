# 🏛️ SIBIRU — Sistem Informasi Peminjaman Ruangan Internal

> Solusi terintegrasi pengelolaan dan reservasi ruangan kampus bebas tumpang tindih waktu (*zero double-booking*) dengan arsitektur modern **FastAPI (Backend)** dan **React 19 + TypeScript + Tailwind CSS (Frontend)**.

---

## 📁 Struktur Direktori Repositori

Proyek ini telah distrukturisasi ke dalam folder terpisah untuk dokumentasi, frontend, dan backend:

```
SiBiru_OAB_KPM/
├── DESIGN.md               # 🎨 Sumber kebenaran sistem desain (warna, tipografi, motion, komponen)
├── ROADMAP.md              # 🗺️ Roadmap frontend, matriks uji, dan backlog pasca-MVP
├── docs/                   # 📄 Dokumentasi teknis backend & PRD (di-gitignore)
│   └── DOKUMENTASI.md      # Arsitektur backend, conflict detection, skema database
│
├── frontend/               # 💻 Aplikasi antarmuka pengguna (React 19, TypeScript, Tailwind)
│   ├── src/
│   │   ├── app/            # Router, shell publik/admin, route guard
│   │   ├── pages/          # Halaman publik & halaman admin
│   │   ├── components/     # UI primitives, layout, booking, timeline, admin
│   │   ├── hooks/          # React Query hooks per domain
│   │   ├── services/       # Client API terhubung ke backend FastAPI
│   │   ├── store/          # Zustand auth store & sesi persisten
│   │   ├── types/          # Definisi TypeScript sinkron dengan backend
│   │   └── styles/         # Global styles & token Pine Teal (#006569)
│   ├── package.json
│   ├── tailwind.config.ts
│   └── vite.config.ts
│
├── backend/                # ⚙️ Headless REST API Service (Python 3.12+, FastAPI, SQLite)
│   ├── app/                # Modul inti, model ORM, schema Pydantic, router API
│   │   ├── core/           # Conflict Detection Engine & per-room locking
│   │   ├── models/         # User, Room, Booking SQLAlchemy models
│   │   ├── routers/        # /auth, /rooms, /bookings, /admin
│   │   └── schemas/        # Request & Response Pydantic v2 schemas
│   ├── tests/              # 23 Automated unit & integration tests
│   ├── requirements.txt    # Dependensi backend
│   ├── run.bat / run.ps1   # Runner otomatis server backend
│   └── README.md           # Panduan spesifik backend
│
├── MATRA/                  # 🖼️ Referensi visual & fitur (bukan bagian aplikasi)
├── .gitignore              # Mengabaikan docs/, node_modules/, *.db, .venv/
└── README.md               # Ringkasan utama repositori
```

---

## ⚡ Panduan Menjalankan Sistem

### 1. Menjalankan Backend Service (FastAPI)

```powershell
# Masuk ke folder backend
cd backend

# Instalasi dependensi (hanya pertama kali)
pip install -r requirements.txt

# Jalankan server
.\run.ps1
```

- **Base URL API**: `http://localhost:8000/api/v1`
- **Swagger UI Dokumentasi Interaktif**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

### 2. Menjalankan Frontend Application (React + Vite)

```bash
# Buka terminal baru dan masuk ke folder frontend
cd frontend

# Instalasi dependensi
npm install

# Jalankan development server
npm run dev
```

- **Frontend Application**: `http://localhost:3000`

---

## 👥 Akun Demo & Simulasi Peran (Role Switcher)

Sistem telah dilengkapi dengan data awal (*pre-seeded data*) untuk tiga persona pengguna:

| Nama Pengguna | Peran | NIM / NIP | ID Pengguna (`X-User-Id`) | Hak Akses |
|---|---|---|---|---|
| **Budi Santoso, S.Kom.** | `ADMIN` | `197905202008011002` | `usr_admin_01` | Dashboard metrik, approve/reject pengajuan, master timeline, CRUD ruangan |
| **Ahmad Zaki** | `BORROWER` | `2101001` | `usr_mhs_01` | Katalog ruangan, pengajuan booking, tracking status |
| **Dr. Siti Rahma, M.T.** | `BORROWER` | `198501152010122001` | `usr_dosen_01` | Peminjaman fasilitas dosen & ruang rapat |

---

## 📚 Referensi Spesifikasi & Dokumentasi

- **[DESIGN.md](DESIGN.md)**: sistem desain SIBIRU — palet *Pine Teal* `#006569` + *Warm Gold*,
  tipografi editorial, komponen, motion, blueprint halaman, dan checklist anti-AI-slop.
- **[ROADMAP.md](ROADMAP.md)**: roadmap frontend per fase, arsitektur, rute, kontrak API,
  matriks uji manual, risiko, dan backlog pasca-MVP.
- **[docs/DOKUMENTASI.md](docs/DOKUMENTASI.md)**: dokumentasi arsitektur backend, algoritma
  *conflict detection*, dan skema database.

### Peta rute frontend

| Rute | Akses | Keterangan |
| --- | --- | --- |
| `/` | Publik | Beranda editorial & ruang pilihan |
| `/katalog` | Publik | Katalog ruangan, filter, dan timeline ketersediaan |
| `/ruangan/:roomId` | Publik | Detail ruang & pemilihan slot |
| `/pengajuan-saya` | Login | Riwayat dan status pengajuan |
| `/login` | Publik | Masuk identitas atau akun demo |
| `/admin` | Admin | Ringkasan operasional |
| `/admin/antrean` | Admin | Antrean pengajuan & keputusan |
| `/admin/jadwal` | Admin | Matriks jadwal mingguan |
| `/admin/ruangan` | Admin | Master ruangan |
