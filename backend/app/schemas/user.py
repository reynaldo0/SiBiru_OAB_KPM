from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    identifier: str = Field(..., min_length=3, max_length=50)
    role: str = Field(default="BORROWER")
    organization: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = None
    email: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Nama lengkap pengguna")
    identifier: str = Field(..., min_length=3, max_length=50, description="NIM atau NIP")
    role: str = Field(default="BORROWER", description="Peran: BORROWER atau ADMIN")
    organization: str = Field(..., min_length=2, max_length=100, description="HIMA, UKM, Prodi, Biro, atau Unit")
    phone: Optional[str] = Field(None, description="Nomor Telepon / WhatsApp")
    email: Optional[str] = Field(None, description="Alamat email aktif")
    password: str = Field(..., min_length=4, max_length=100, description="Kata sandi minimal 4 karakter")


class UserResponse(UserBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    identifier: str = Field(..., description="NIM, NIP, Email, atau ID Akun")
    password: Optional[str] = Field(None, description="Kata sandi akun")


class LoginResponse(BaseModel):
    token: str
    user: UserResponse
    message: str
