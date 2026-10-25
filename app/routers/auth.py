from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, LoginRequest, LoginResponse
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Autentikasi & Profil Pengguna"])


@router.post("/login", response_model=LoginResponse, summary="Login Peminjam / Admin")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Login menggunakan NIM/NIP atau ID Pengguna.
    Mengembalikan data profil dan token identifier untuk header 'X-User-Id'.
    """
    identifier = payload.identifier.strip()
    user = db.query(User).filter(
        (User.identifier == identifier) | (User.id == identifier)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Akun dengan NIM/NIP/ID '{identifier}' tidak terdaftar."
        )

    return LoginResponse(
        token=user.id,
        user=UserResponse.model_validate(user),
        message=f"Berhasil login sebagai {user.name} ({user.role})"
    )


@router.get("/me", response_model=UserResponse, summary="Profil Pengguna Aktif")
def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    Mengambil data profil peminjam atau admin yang sedang aktif/login.
    Sesuai PRD Bagian 7: Informasi Akun Pengguna (NIM/NIP, Unit/Organisasi, Kontak).
    """
    return UserResponse.model_validate(current_user)


@router.get("/demo-users", response_model=List[UserResponse], summary="Daftar Pengguna Demo")
def get_demo_users(db: Session = Depends(get_db)):
    """
    Mendapatkan daftar akun pengguna yang tersedia untuk pengujian switch peran di frontend / Swagger.
    """
    users = db.query(User).all()
    return [UserResponse.model_validate(u) for u in users]
