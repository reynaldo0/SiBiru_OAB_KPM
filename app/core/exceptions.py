from fastapi import HTTPException, status
from typing import Optional, Any, Dict


class BookingConflictException(HTTPException):
    def __init__(self, detail: str, conflicting_data: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "error": "Jadwal Bentrok (Conflict)",
                "message": detail,
                "conflict_details": conflicting_data or {}
            }
        )


class ResourceNotFoundException(HTTPException):
    def __init__(self, resource_name: str, identifier: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource_name} dengan ID '{identifier}' tidak ditemukan."
        )


class InvalidOperationException(HTTPException):
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
