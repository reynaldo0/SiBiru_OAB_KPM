from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.user import User


def get_current_user(
    x_user_id: Optional[str] = Header(None, description="ID Pengguna atau NIM/NIP untuk autentikasi sesi aktif"),
    authorization: Optional[str] = Header(None, description="Bearer token (opsional)"),
    db: Session = Depends(get_db)
) -> User:
    """
    Mengambil pengguna aktif berdasarkan Header X-User-Id atau Bearer Token.
    Jika tidak disediakan dalam mode demo/dev, akan fallback ke akun peminjam default.
    """
    user_identifier = None

    if x_user_id:
        user_identifier = x_user_id.strip()
    elif authorization and authorization.startswith("Bearer "):
        user_identifier = authorization.replace("Bearer ", "").strip()

    if user_identifier:
        # Search by id or identifier (NIM/NIP)
        user = db.query(User).filter(
            (User.id == user_identifier) | (User.identifier == user_identifier)
        ).first()
        if user:
            return user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Pengguna dengan identifier/ID '{user_identifier}' tidak ditemukan."
        )

    # Fallback default user for convenient testing/demo if no header provided
    default_user = db.query(User).filter(User.role == "BORROWER").first()
    if default_user:
        return default_user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Header 'X-User-Id' atau 'Authorization: Bearer <id>' diperlukan untuk autentikasi."
    )


def require_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Memastikan pengguna yang login memiliki peran 'ADMIN' (Pengelola Ruangan).
    """
    if current_user.role.upper() != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak: Hanya petugas pengelola ruangan (ADMIN) yang dapat mengakses fitur ini."
        )
    return current_user
