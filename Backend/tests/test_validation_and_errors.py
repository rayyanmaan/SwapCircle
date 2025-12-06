"""Test validation error messages and error handling"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from main import app

USERS_FILE = Path(__file__).resolve().parents[1] / "data" / "users.json"


def _rm_files():
    for p in (USERS_FILE,):
        try:
            if p.exists():
                p.unlink()
        except Exception:
            pass


def test_register_validation_empty_email():
    """Test error message when email is empty"""
    _rm_files()
    client = TestClient(app)
    
    payload = {"email": "", "password": "test123", "username": "user", "full_name": "Test"}
    r = client.post("/auth/register", json=payload)
    assert r.status_code == 422  # Validation error
    data = r.json()
    assert "detail" in data
    assert len(data["detail"]) > 0  # Should have validation errors


def test_register_validation_invalid_email():
    """Test error message for invalid email format"""
    _rm_files()
    client = TestClient(app)
    
    payload = {"email": "not-an-email", "password": "test123", "username": "user", "full_name": "Test"}
    r = client.post("/auth/register", json=payload)
    assert r.status_code == 422
    data = r.json()
    assert "detail" in data


def test_register_validation_short_password():
    """Test that short passwords are accepted (no min length enforced in model)"""
    _rm_files()
    client = TestClient(app)
    
    payload = {"email": "test@example.com", "password": "a", "username": "user", "full_name": "Test"}
    r = client.post("/auth/register", json=payload)
    # Should succeed as no min length validation in UserCreate
    assert r.status_code == 201


def test_register_duplicate_email():
    """Test detailed error when registering with duplicate email"""
    _rm_files()
    client = TestClient(app)
    
    payload = {"email": "dup@example.com", "password": "test123", "username": "user1", "full_name": "Test"}
    r1 = client.post("/auth/register", json=payload)
    assert r1.status_code == 201
    
    # Try again with same email
    payload2 = {"email": "dup@example.com", "password": "different", "username": "user2", "full_name": "Test"}
    r2 = client.post("/auth/register", json=payload2)
    assert r2.status_code == 400
    data = r2.json()
    assert "detail" in data
    assert "already registered" in data["detail"].lower()


def test_login_invalid_credentials():
    """Test error message for invalid login credentials"""
    _rm_files()
    client = TestClient(app)
    
    # Register a user first
    payload = {"email": "test@example.com", "password": "correct", "username": "user", "full_name": "Test"}
    client.post("/auth/register", json=payload)
    
    # Try wrong password
    r = client.post("/auth/login", json={"email": "test@example.com", "password": "wrong"})
    assert r.status_code == 401
    data = r.json()
    assert "detail" in data
    assert "invalid credentials" in data["detail"].lower()


def test_login_nonexistent_user():
    """Test error message when logging in with non-existent email"""
    _rm_files()
    client = TestClient(app)
    
    r = client.post("/auth/login", json={"email": "notfound@example.com", "password": "anypass"})
    assert r.status_code == 401
    data = r.json()
    assert "detail" in data
    assert "invalid credentials" in data["detail"].lower()


def test_missing_authorization_header():
    """Test error message when missing Authorization header on protected endpoint"""
    _rm_files()
    client = TestClient(app)
    
    # Try PATCH without auth (protected endpoint)
    r = client.patch("/users/someid", json={"username": "new"})
    assert r.status_code == 401
    data = r.json()
    assert "detail" in data


def test_invalid_bearer_token():
    """Test error message with malformed Authorization header"""
    _rm_files()
    client = TestClient(app)
    
    # Missing Bearer prefix
    r = client.patch("/users/someid", json={"username": "new"}, headers={"Authorization": "invalid_token"})
    assert r.status_code == 401
    data = r.json()
    assert "detail" in data
    
    # Multiple parts without Bearer
    r = client.patch("/users/someid", json={"username": "new"}, headers={"Authorization": "Something else token"})
    assert r.status_code == 401


def test_invalid_token():
    """Test error message with invalid token signature"""
    _rm_files()
    client = TestClient(app)
    
    fake_token = "user123|fakesignature"
    r = client.patch("/users/someid", json={"username": "new"}, headers={"Authorization": f"Bearer {fake_token}"})
    assert r.status_code == 401
    data = r.json()
    assert "detail" in data
