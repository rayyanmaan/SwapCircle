from fastapi.testclient import TestClient
from pathlib import Path

from Backend.main import app

USERS_FILE = Path(__file__).resolve().parents[1] / "data" / "users.json"
ITEMS_FILE = Path(__file__).resolve().parents[1] / "data" / "items.json"


def _rm_files():
    for p in (USERS_FILE, ITEMS_FILE):
        try:
            if p.exists():
                p.unlink()
        except Exception:
            pass


def test_verify_endpoint_and_item_owner_flow():
    _rm_files()
    client = TestClient(app)

    payload = {
        "email": "verifyuser@example.com",
        "password": "pass123",
        "username": "verifyuser",
        "full_name": "Verify User",
    }

    # Register
    r = client.post("/auth/register", json=payload)
    assert r.status_code == 201
    data = r.json()
    token = data["token"]
    user = data["user"]
    user_id = user["id"]

    # Verify email using the same token
    v = client.post(f"/auth/verify/{token}")
    assert v.status_code == 200
    assert v.json().get("message") == "email verified"

    # Create an item as this user
    item_payload = {"title": "Test Item", "description": "A test"}
    c = client.post("/items", json=item_payload, headers={"Authorization": f"Bearer {token}"})
    assert c.status_code == 201
    item = c.json()
    assert item.get("owner_id") == user_id

    # Another user tries to update the item and gets forbidden
    payload2 = {"email": "other@example.com", "password": "p2", "username": "other"}
    r2 = client.post("/auth/register", json=payload2)
    t2 = r2.json()["token"]

    patch = {"title": "Hacked"}
    p = client.patch(f"/items/{item.get('id')}", json=patch, headers={"Authorization": f"Bearer {t2}"})
    assert p.status_code == 403

    # Owner can update
    p2 = client.patch(f"/items/{item.get('id')}", json={"title": "Updated"}, headers={"Authorization": f"Bearer {token}"})
    assert p2.status_code == 200
    assert p2.json().get("title") == "Updated"
