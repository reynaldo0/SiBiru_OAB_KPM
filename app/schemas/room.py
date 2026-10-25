from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime


class RoomFacilityResponse(BaseModel):
    id: str
    name: str

    model_config = ConfigDict(from_attributes=True)


class RoomBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    location: str = Field(..., min_length=2, max_length=100)
    capacity: int = Field(..., gt=0, description="Kapasitas maksimal orang")
    is_active: bool = True
    image_url: Optional[str] = None


class RoomCreate(RoomBase):
    facilities: List[str] = Field(default_factory=list, description="Daftar fasilitas ruangan, misal: AC, Proyektor")


class RoomUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    location: Optional[str] = Field(None, min_length=2, max_length=100)
    capacity: Optional[int] = Field(None, gt=0)
    is_active: Optional[bool] = None
    image_url: Optional[str] = None
    facilities: Optional[List[str]] = None


class RoomStatusUpdate(BaseModel):
    is_active: bool


class RoomResponse(BaseModel):
    id: str
    name: str
    location: str
    capacity: int
    is_active: bool
    image_url: Optional[str] = None
    facilities: List[str] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BookedInterval(BaseModel):
    booking_id: str
    start_time: str
    end_time: str
    status: str
    organization: str
    borrower_name: str


class RoomAvailabilityResponse(BaseModel):
    room_id: str
    room_name: str
    date: str
    is_room_active: bool
    booked_intervals: List[BookedInterval]
