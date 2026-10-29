from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.seed import seed_database
from app.routers import auth_router, rooms_router, bookings_router, admin_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Pastikan tabel terbuat & data awal disuntikkan
    Base.metadata.create_all(bind=engine)
    if settings.DATABASE_URL.startswith("sqlite"):
        try:
            with engine.connect() as conn:
                cols = [c[1] for c in conn.exec_driver_sql("PRAGMA table_info(users)").fetchall()]
                if "password_hash" not in cols:
                    conn.exec_driver_sql("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) DEFAULT NULL")
                    conn.commit()
        except Exception as e:
            print(f"[MIGRATION] Kolom password_hash: {e}")

    seed_database()
    yield
    # Shutdown logic jika diperlukan


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
# 🏛️ SIBIRU: Sistem Informasi Peminjaman Ruangan Internal (REST API)
Backend headless service untuk peminjaman ruangan operasional mahasiswa, dosen, dan staf.

### 🌟 Fitur Utama (PRD v1.0):
* **Self-Service Katalog & Jadwal Real-time**: Pengecekan slot jam kosong secara presisi.
* **⚡ Mesin Validasi Bentrok Otomatis (Conflict Detection Engine)**:
  * Rumus: `(JamMulai_Baru < JamSelesai_Eksisting) AND (JamSelesai_Baru > JamMulai_Eksisting)`
  * Proteksi atomic transaction terhadap *race condition booking*.
* **Portal Peminjam**: Form pengajuan cepat & menu *Pengajuan Saya* (tracking status 🟡🟢🔴).
* **Dashboard Pengelola (Admin)**: Ringkasan metrik statistik, approval antrean masuk (+ wajib alasan penolakan), master timeline jadwal, dan CRUD data ruangan.
    """,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(rooms_router, prefix=settings.API_V1_PREFIX)
app.include_router(bookings_router, prefix=settings.API_V1_PREFIX)
app.include_router(admin_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Sistem"])
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "documentation": "/docs",
        "redoc": "/redoc",
        "api_v1_prefix": settings.API_V1_PREFIX
    }


@app.get("/health", tags=["Sistem"])
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
