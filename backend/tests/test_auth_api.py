import pytest


def test_auth_login_existing_user(client):
    res = client.post("/api/v1/auth/login", json={"identifier": "MHS_TEST_01", "password": "mhs123"})
    assert res.status_code == 200
    data = res.json()
    assert "token" in data
    assert data["user"]["identifier"] == "MHS_TEST_01"
    assert data["user"]["role"] == "BORROWER"


def test_auth_login_wrong_password(client):
    res = client.post("/api/v1/auth/login", json={"identifier": "MHS_TEST_01", "password": "wrongpassword!"})
    assert res.status_code == 401
    assert "salah" in res.json()["detail"].lower()


def test_auth_register_and_login_flow(client):
    reg_payload = {
        "name": "Bambang Pamungkas",
        "identifier": "2109999",
        "role": "BORROWER",
        "organization": "UKM Sepak Bola",
        "email": "bambang.p@student.kampus.ac.id",
        "phone": "081299998888",
        "password": "bambangpassword123"
    }
    res_reg = client.post("/api/v1/auth/register", json=reg_payload)
    assert res_reg.status_code == 201
    reg_data = res_reg.json()
    assert reg_data["user"]["name"] == "Bambang Pamungkas"
    assert reg_data["user"]["identifier"] == "2109999"

    # Coba register ulang dengan identifier yang sama (harus 400 Bad Request)
    res_dup = client.post("/api/v1/auth/register", json=reg_payload)
    assert res_dup.status_code == 400

    # Login dengan akun baru
    res_login = client.post("/api/v1/auth/login", json={"identifier": "2109999", "password": "bambangpassword123"})
    assert res_login.status_code == 200
    assert res_login.json()["user"]["name"] == "Bambang Pamungkas"
