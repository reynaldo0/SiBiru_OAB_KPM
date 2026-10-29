from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, LoginRequest, LoginResponse, UserRegisterRequest
from app.core.dependencies import get_current_user
from app.core.security import hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Autentikasi & Profil Pengguna"])


@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED, summary="Pendaftaran Pengguna Baru")
def register(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    """
    Mendaftarkan akun baru (Mahasiswa, Dosen, atau Staf Admin).
    Memeriksa keunikan NIM/NIP dan email, menyimpan kata sandi ter-hash,
    serta langsung mengembalikan sesi login aktif.
    """
    clean_identifier = payload.identifier.strip()
    clean_email = payload.email.strip() if payload.email else None

    # 1. Cek apakah NIM/NIP sudah terdaftar
    existing_identifier = db.query(User).filter(User.identifier == clean_identifier).first()
    if existing_identifier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"NIM / NIP '{clean_identifier}' sudah terdaftar. Silakan login atau gunakan NIM/NIP lain."
        )

    # 2. Cek apakah email sudah terdaftar
    if clean_email:
        existing_email = db.query(User).filter(User.email == clean_email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Alamat email '{clean_email}' sudah terdaftar dalam sistem."
            )

    # 3. Normalisasi Role
    role = payload.role.strip().upper()
    if role not in ["BORROWER", "ADMIN"]:
        role = "BORROWER"

    # 4. Buat dan simpan User
    new_user = User(
        name=payload.name.strip(),
        identifier=clean_identifier,
        role=role,
        organization=payload.organization.strip(),
        phone=payload.phone.strip() if payload.phone else None,
        email=clean_email,
        password_hash=hash_password(payload.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return LoginResponse(
        token=new_user.id,
        user=UserResponse.model_validate(new_user),
        message=f"Pendaftaran berhasil! Selamat datang di SIBIRU, {new_user.name}."
    )


@router.post("/login", response_model=LoginResponse, summary="Login Peminjam / Admin")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Login menggunakan NIM/NIP atau Email atau ID Akun beserta kata sandi.
    Mengembalikan data profil dan token identifier untuk header 'X-User-Id'.
    """
    identifier = payload.identifier.strip()

    # Cari user berdasarkan NIM/NIP, email, atau ID
    user = db.query(User).filter(
        (User.identifier == identifier) |
        (User.email == identifier) |
        (User.id == identifier)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Akun dengan NIM/NIP/Email '{identifier}' tidak terdaftar."
        )

    # Verifikasi kata sandi jika ada
    if payload.password is not None:
        if not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Kata sandi yang Anda masukkan salah. Silakan periksa kembali."
            )
    elif user.password_hash:
        # Jika akun memiliki password tetapi payload tidak mengirimkannya
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kata sandi wajib diisi untuk masuk ke akun ini."
        )

    return LoginResponse(
        token=user.id,
        user=UserResponse.model_validate(user),
        message=f"Berhasil masuk sebagai {user.name} ({user.role})"
    )


@router.get("/me", response_model=UserResponse, summary="Profil Pengguna Aktif")
def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    Mengambil data profil peminjam atau admin yang sedang aktif/login.
    """
    return UserResponse.model_validate(current_user)

