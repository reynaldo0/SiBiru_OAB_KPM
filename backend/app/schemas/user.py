from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    name: str
    identifier: str
    role: str = "BORROWER"
    organization: str
    phone: Optional[str] = None
    email: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    identifier: str  # NIM or NIP or User ID


class LoginResponse(BaseModel):
    token: str
    user: UserResponse
    message: str
