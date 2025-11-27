from fastapi.testclient import TestClient
from pathlib import Path
import json

from Backend.main import app


USERS_FILE = Path(__file__).resolve().parents[1] / "data" / "users.json"


def _rm_users_file():
    try:
        if USERS_FILE.exists():
            USERS_FILE.unlink()
    except Exception:
        pass


def test_register_login_me_flow():
    _rm_users_file()
    client = TestClient(app)

    payload = {
        "email": "test_auth@example.com",
        "password": "testpass",
        "username": "testauth",
        "full_name": "Test Auth",
    }

    # Register
    r = client.post("/auth/register", json=payload)
    assert r.status_code == 201, r.text
    data = r.json()
    assert "token" in data and "user" in data
    assert data["user"]["email"] == payload["email"]

    # Login
    r2 = client.post("/auth/login", json={"email": payload["email"], "password": payload["password"]})
    assert r2.status_code == 200, r2.text
    d2 = r2.json()
    assert "token" in d2 and "user" in d2

    # Me
    token = d2["token"]
    r3 = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r3.status_code == 200, r3.text
    me = r3.json()
    assert me["email"] == payload["email"]


def test_register_duplicate_email():
    _rm_users_file()
    client = TestClient(app)

    payload = {
        "email": "dup@example.com",
        "password": "dup12345",
        "username": "dupuser",
        "full_name": "Dup User",
    }

    r1 = client.post("/auth/register", json=payload)
    assert r1.status_code == 201, r1.text

    r2 = client.post("/auth/register", json=payload)
    assert r2.status_code == 400
    data = r2.json()
    assert data.get("detail") == "email already registered"


def test_login_wrong_password_and_unknown_user():
    _rm_users_file()
    client = TestClient(app)

    payload = {
        "email": "known@example.com",
        "password": "rightpass",
        "username": "known",
        "full_name": "Known User",
    }

    # register known user
    r = client.post("/auth/register", json=payload)
    assert r.status_code == 201

    # wrong password
    r2 = client.post("/auth/login", json={"email": payload["email"], "password": "wrongpass"})
    assert r2.status_code == 401
    assert r2.json().get("detail") == "invalid credentials"

    # unknown user
    r3 = client.post("/auth/login", json={"email": "noone@example.com", "password": "whatever"})
    assert r3.status_code == 401
    assert r3.json().get("detail") == "invalid credentials"


def test_me_missing_and_malformed_token():
    _rm_users_file()
    client = TestClient(app)

    payload = {
        "email": "tokenuser@example.com",
        "password": "tokenpass",
        "username": "tokenuser",
        "full_name": "Token User",
    }
    # register and login
    r = client.post("/auth/register", json=payload)
    assert r.status_code == 201
    token = r.json()["token"]

    # missing header
    r_missing = client.get("/auth/me")
    assert r_missing.status_code == 401
    assert r_missing.json().get("detail") == "missing authorization header"

    # malformed token (no '|')
    r_malformed = client.get("/auth/me", headers={"Authorization": "Bearer malformedtoken"})
    assert r_malformed.status_code == 401
    assert r_malformed.json().get("detail") == "invalid token"


def test_register_missing_fields():
    _rm_users_file()
    client = TestClient(app)

    # missing email
    payload = {"password": "p", "username": "u"}
    r = client.post("/auth/register", json=payload)
    assert r.status_code == 422

