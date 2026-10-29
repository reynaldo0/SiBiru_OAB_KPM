#!/usr/bin/env python3
"""
SIBIRU CLI - Antarmuka Baris Perintah untuk Manajemen Layanan SIBIRU
Mendukung MySQL Laragon, Backend FastAPI, dan Frontend React/Vite.
"""

import sys
import os
import subprocess
import socket
import time
import argparse

# Direktori proyek
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

# Deteksi executable Python yang tersedia
def get_python_executable():
    local_app_data = os.environ.get("LOCALAPPDATA", "")
    candidates = [
        os.path.join(local_app_data, "Programs", "Python", "Python315", "python.exe"),
        os.path.join(BACKEND_DIR, ".venv", "Scripts", "python.exe"),
        sys.executable,
        "C:\\msys64\\ucrt64\\bin\\python.exe",
        "python"
    ]
    for c in candidates:
        if c and os.path.exists(c):
            return c
    return "python"

PYTHON_BIN = get_python_executable()

# ANSI Color codes
GREEN = "\033[92m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"

def print_banner():
    banner = f"""
{CYAN}{BOLD}======================================================================
  🏛️  SIBIRU CLI - Sistem Informasi Peminjaman Ruangan Kampus
  Integrated with MySQL Laragon · FastAPI · React 19 · Vite 6
======================================================================{RESET}
"""
    print(banner)

def check_port(host: str, port: int, timeout: float = 1.5) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except (OSError, socket.timeout):
        return False

def cmd_status(args=None):
    print_banner()
    print(f"{BOLD}[1] Memeriksa Status Layanan Database & Server:{RESET}\n")

    # 1. MySQL Port 3306
    mysql_ok = check_port("127.0.0.1", 3306)
    if mysql_ok:
        print(f"  {GREEN}● MySQL Laragon (3306){RESET} : AKTIF & TERHUBUNG")
    else:
        print(f"  {RED}● MySQL Laragon (3306){RESET} : TIDAK TERDETEKSI / MATI")
        print(f"    {YELLOW}↳ Tips: Buka Laragon dan tekan tombol 'Start All'.{RESET}")

    # 2. Backend Port 8000
    backend_ok = check_port("127.0.0.1", 8000)
    if backend_ok:
        print(f"  {GREEN}● Backend API (8000){RESET}   : AKTIF (http://localhost:8000/docs)")
    else:
        print(f"  {YELLOW}○ Backend API (8000){RESET}   : Tidak berjalan (Jalankan: sibiru backend)")

    # 3. Frontend Port 3000
    frontend_ok = check_port("127.0.0.1", 3000)
    if frontend_ok:
        print(f"  {GREEN}● Frontend Web (3000){RESET}  : AKTIF (http://localhost:3000)")
    else:
        print(f"  {YELLOW}○ Frontend Web (3000){RESET}  : Tidak berjalan (Jalankan: sibiru frontend)")

    print(f"\n{BOLD}[2] Konfigurasi Sistem:{RESET}")
    print(f"  Python Binary   : {PYTHON_BIN}")
    print(f"  Backend Dir     : {BACKEND_DIR}")
    print(f"  Frontend Dir    : {FRONTEND_DIR}")
    print(f"  MySQL URL       : mysql+pymysql://root:@127.0.0.1:3306/sibiru")
    print()

def cmd_seed(args=None):
    print_banner()
    print(f"{BOLD}Menyinkronkan dan Menabur Data Awal (Seed) ke MySQL Laragon...{RESET}\n")

    if not check_port("127.0.0.1", 3306):
        print(f"{RED}ERROR: MySQL Laragon port 3306 tidak dapat diakses!{RESET}")
        print(f"Pastikan aplikasi Laragon telah dibuka dan MySQL dalam status Running.\n")
        sys.exit(1)

    sys.path.insert(0, BACKEND_DIR)
    try:
        from app.database import engine, Base, SessionLocal
        from app.models.user import User
        from app.models.room import Room
        from app.models.booking import Booking
        from app.seed import seed_database

        print("1. Membuat tabel di database MySQL 'sibiru' jika belum ada...")
        Base.metadata.create_all(bind=engine)
        print(f"   {GREEN}✓ Tabel berhasil diverifikasi/dibuat.{RESET}")

        print("2. Menyuntikkan akun demo & data master ruangan...")
        seed_database()
        print(f"   {GREEN}✓ Data awal berhasil di-seed.{RESET}")

        db = SessionLocal()
        u_count = db.query(User).count()
        r_count = db.query(Room).count()
        b_count = db.query(Booking).count()
        db.close()

        print(f"\n{GREEN}{BOLD}SUKSES!{RESET} Statistik Database MySQL saat ini:")
        print(f"  - Total Pengguna : {u_count} (Admin: 197905202008011002/admin123, Mhs: 2101001/mhs123)")
        print(f"  - Total Ruangan  : {r_count} ruangan")
        print(f"  - Total Booking  : {b_count} agenda peminjaman\n")
    except Exception as e:
        print(f"{RED}Terjadi kesalahan saat seed:{RESET} {e}")
        sys.exit(1)

def cmd_backend(args=None):
    print_banner()
    if not check_port("127.0.0.1", 3306):
        print(f"{YELLOW}PERINGATAN: MySQL di port 3306 belum terdeteksi. Pastikan Laragon aktif!{RESET}\n")

    print(f"{GREEN}{BOLD}Menjalankan SIBIRU Backend Service...{RESET}")
    print(f"Endpoint: http://127.0.0.1:8000")
    print(f"Swagger : http://127.0.0.1:8000/docs")
    print(f"Database: MySQL Laragon (sibiru)\n")

    cmd = [PYTHON_BIN, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
    try:
        subprocess.run(cmd, cwd=BACKEND_DIR)
    except KeyboardInterrupt:
        print(f"\n{YELLOW}Backend service dihentikan.{RESET}")

def cmd_frontend(args=None):
    print_banner()
    print(f"{GREEN}{BOLD}Menjalankan SIBIRU Frontend Application...{RESET}")
    print(f"Akses Web: http://localhost:3000\n")

    cmd = ["npm", "run", "dev"]
    shell = os.name == "nt"
    try:
        subprocess.run(cmd, cwd=FRONTEND_DIR, shell=shell)
    except KeyboardInterrupt:
        print(f"\n{YELLOW}Frontend server dihentikan.{RESET}")

def cmd_start(args=None):
    print_banner()
    print(f"{GREEN}{BOLD}Memulai SIBIRU Monorepo (Backend + Frontend)...{RESET}\n")

    if not check_port("127.0.0.1", 3306):
        print(f"{YELLOW}[PERINGATAN] MySQL Laragon di port 3306 belum aktif.{RESET}")
        print(f"Silakan buka Laragon lalu klik 'Start All' agar database dapat diakses.\n")

    if os.name == "nt":
        # Jalankan di dua jendela terminal terpisah di Windows
        backend_bat = os.path.join(ROOT_DIR, "run_backend.bat")
        frontend_bat = os.path.join(ROOT_DIR, "run_frontend.bat")

        print(f"-> Membuka jendela Backend Server...")
        subprocess.Popen(f'start "SIBIRU - Backend (FastAPI + MySQL)" cmd /c "{backend_bat}"', shell=True)
        time.sleep(1.5)

        print(f"-> Membuka jendela Frontend Web...")
        subprocess.Popen(f'start "SIBIRU - Frontend (React 19 + Vite)" cmd /c "{frontend_bat}"', shell=True)

        print(f"\n{GREEN}{BOLD}Kedua layanan telah berhasil dijalankan!{RESET}")
        print(f"  • Frontend Web : {CYAN}http://localhost:3000{RESET}")
        print(f"  • Backend Docs : {CYAN}http://localhost:8000/docs{RESET}")
        print(f"\nTekan Ctrl+C di masing-masing jendela untuk menghentikan server.")
    else:
        print("Gunakan 'sibiru backend' dan 'sibiru frontend' di dua terminal terpisah.")

def cmd_test(args=None):
    print_banner()
    print(f"{BOLD}Menjalankan Suite Pengujian Backend...{RESET}\n")
    test_script = os.path.join(ROOT_DIR, "scratch", "test_mysql_endpoints.py")
    if os.path.exists(test_script):
        cmd = [PYTHON_BIN, test_script]
        subprocess.run(cmd, cwd=ROOT_DIR)
    else:
        cmd = [PYTHON_BIN, "-m", "pytest", "tests", "-v"]
        subprocess.run(cmd, cwd=BACKEND_DIR)

def main():
    parser = argparse.ArgumentParser(
        description="SIBIRU CLI - Manajemen Sistem Peminjaman Ruangan Kampus",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Contoh Penggunaan:
  sibiru start       Jalankan backend dan frontend sekaligus di jendela terpisah
  sibiru backend     Jalankan backend service (FastAPI di port 8000)
  sibiru frontend    Jalankan frontend web app (Vite di port 3000)
  sibiru status      Periksa status MySQL Laragon, backend, dan frontend
  sibiru seed        Inisialisasi tabel dan tabur akun demo ke MySQL
  sibiru test        Jalankan pengujian endpoint API terhadap MySQL
        """
    )

    subparsers = parser.add_subparsers(dest="command", help="Perintah yang tersedia")

    subparsers.add_parser("start", help="Jalankan backend & frontend bersamaan")
    subparsers.add_parser("dev", help="Alias untuk start")
    subparsers.add_parser("backend", help="Jalankan backend FastAPI (port 8000)")
    subparsers.add_parser("frontend", help="Jalankan frontend Vite (port 3000)")
    subparsers.add_parser("status", help="Cek status koneksi MySQL dan server")
    subparsers.add_parser("seed", help="Tabur data demo ke MySQL Laragon")
    subparsers.add_parser("test", help="Jalankan uji integrasi API MySQL")

    args = parser.parse_args()

    commands = {
        "start": cmd_start,
        "dev": cmd_start,
        "backend": cmd_backend,
        "frontend": cmd_frontend,
        "status": cmd_status,
        "seed": cmd_seed,
        "test": cmd_test,
    }

    if not args.command:
        cmd_status()
        parser.print_help()
    else:
        handler = commands.get(args.command)
        if handler:
            handler(args)
        else:
            parser.print_help()

if __name__ == "__main__":
    main()
