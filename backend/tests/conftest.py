import os
import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.core.security import hash_password
from app.database import Base, get_db
from app.main import app
from app.models.user import User
from app.models.room import Room, RoomFacility

TEST_DB_FILE = "./test_sibiru.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{TEST_DB_FILE}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False, "timeout": 30}
)


@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.close()


TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def client():
    # Setup test database file
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    init_session = TestingSessionLocal()

    # Seed test users
    admin_user = User(
        id="usr_admin_test",
        name="Admin Pengelola Test",
        identifier="ADMIN_TEST_01",
        role="ADMIN",
        organization="Bagian Fasilitas",
        phone="081111111111",
        email="admin.test@sibiru.ac.id",
        password_hash=hash_password("admin123")
    )
    mhs_user = User(
        id="usr_mhs_test",
        name="Mahasiswa Test",
        identifier="MHS_TEST_01",
        role="BORROWER",
        organization="HIMA Test",
        phone="082222222222",
        email="mhs.test@sibiru.ac.id",
        password_hash=hash_password("mhs123")
    )
    init_session.add_all([admin_user, mhs_user])

    # Seed test room
    room = Room(
        id="room_test_01",
        name="Ruang Uji 101",
        location="Gedung Uji Lt. 1",
        capacity=50,
        is_active=True
    )
    init_session.add(room)
    init_session.flush()

    fac1 = RoomFacility(room_id=room.id, name="AC")
    fac2 = RoomFacility(room_id=room.id, name="Proyektor")
    init_session.add_all([fac1, fac2])

    init_session.commit()
    init_session.close()

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)
    engine.dispose()

    # Cleanup test DB file
    for suffix in ["", "-wal", "-shm"]:
        filepath = TEST_DB_FILE + suffix
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except OSError:
                pass
