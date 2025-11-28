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


def test_get_user_and_patch_flow():
    _rm_users_file()
    client = TestClient(app)

    payload = {
        "email": "user1@example.com",
        "password": "userpass",
        "username": "user1",
        "full_name": "User One",
    }

    # Register
    r = client.post("/auth/register", json=payload)
    assert r.status_code == 201, r.text
    data = r.json()
    assert "user" in data and "token" in data
    user = data["user"]
    token = data["token"]
    user_id = user["id"]

    # GET user
    g = client.get(f"/users/{user_id}")
    assert g.status_code == 200, g.text
    gu = g.json()
    assert gu["email"] == payload["email"]
    assert gu["username"] == payload["username"]

    # PATCH user - update username/full_name/credits
    patch_body = {"username": "newname", "full_name": "New Name", "credits": 7}
    p = client.patch(f"/users/{user_id}", json=patch_body, headers={"Authorization": f"Bearer {token}"})
    assert p.status_code == 200, p.text
    pu = p.json()
    assert pu["username"] == "newname"
    assert pu["full_name"] == "New Name"

    # GET again to confirm persisted
    g2 = client.get(f"/users/{user_id}")
    assert g2.status_code == 200
    g2u = g2.json()
    assert g2u["username"] == "newname"


def test_patch_user_no_valid_fields():
    _rm_users_file()
    client = TestClient(app)

    payload = {
        "email": "user2@example.com",
        "password": "userpass",
        "username": "user2",
        "full_name": "User Two",
    }

    r = client.post("/auth/register", json=payload)
    assert r.status_code == 201
    user_id = r.json()["user"]["id"]

    # Attempt to patch with invalid field
    token = r.json()["token"]
    p = client.patch(f"/users/{user_id}", json={"bad": "value"}, headers={"Authorization": f"Bearer {token}"})
    assert p.status_code == 400
    assert p.json().get("detail") == "no valid fields to update"


def test_get_user_not_found():
    _rm_users_file()
    client = TestClient(app)

    r = client.get("/users/nonexistent")
    assert r.status_code == 404
    assert r.json().get("detail") == "user not found"
