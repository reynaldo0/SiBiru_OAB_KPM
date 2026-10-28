from app.routers.auth import router as auth_router
from app.routers.rooms import router as rooms_router
from app.routers.bookings import router as bookings_router
from app.routers.admin import router as admin_router

__all__ = ["auth_router", "rooms_router", "bookings_router", "admin_router"]
