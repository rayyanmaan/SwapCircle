"""Comprehensive tests for authentication routes."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from fastapi import HTTPException

from main import app


@pytest.fixture
def client():
    return TestClient(app)


class TestRegister:
    """Tests for POST /auth/register endpoint."""
    
    def test_register_success(self, client, mock_user):
        """Test successful user registration."""
        with patch("routes.auth_routes.user_service.get_user_by_email", return_value=None):
            with patch("routes.auth_routes.user_service.get_user_by_username", return_value=None):
                with patch("routes.auth_routes.auth_service.hash_password", return_value=("salt", "hash")):
                    with patch("routes.auth_routes.user_service.create_user", return_value=mock_user):
                        with patch("routes.auth_routes.auth_service.create_access_token", return_value="token123"):
                            response = client.post(
                                "/auth/register",
                                json={
                                    "email": "test@example.com",
                                    "username": "testuser",
                                    "password": "password123",
                                    "full_name": "Test User"
                                }
                            )
                            assert response.status_code == 201
                            data = response.json()
                            assert "token" in data
                            assert "user" in data
                            assert data["user"]["email"] == "test@example.com"
                            assert data["user"]["username"] == "testuser"
    
    def test_register_duplicate_email(self, client, mock_user):
        """Test registration with duplicate email."""
        with patch("routes.auth_routes.user_service.get_user_by_email", return_value=mock_user):
            response = client.post(
                "/auth/register",
                json={
                    "email": "test@example.com",
                    "username": "newuser",
                    "password": "password123",
                    "full_name": "New User"
                }
            )
            assert response.status_code == 400
            assert "email already registered" in response.json()["detail"]
    
    def test_register_duplicate_username(self, client, mock_user):
        """Test registration with duplicate username."""
        with patch("routes.auth_routes.user_service.get_user_by_email", return_value=None):
            with patch("routes.auth_routes.user_service.get_user_by_username", return_value=mock_user):
                response = client.post(
                    "/auth/register",
                    json={
                        "email": "new@example.com",
                        "username": "testuser",
                        "password": "password123",
                        "full_name": "New User"
                    }
                )
                assert response.status_code == 400
                assert "username already taken" in response.json()["detail"]
    
    def test_register_missing_fields(self, client):
        """Test registration with missing required fields."""
        response = client.post(
            "/auth/register",
            json={
                "email": "test@example.com"
                # Missing username, password, full_name
            }
        )
        assert response.status_code == 422
    
    def test_register_invalid_email(self, client):
        """Test registration with invalid email format."""
        response = client.post(
            "/auth/register",
            json={
                "email": "invalid-email",
                "username": "testuser",
                "password": "password123",
                "full_name": "Test User"
            }
        )
        assert response.status_code == 422


class TestLogin:
    """Tests for POST /auth/login endpoint."""
    
    def test_login_success(self, client, mock_user):
        """Test successful login."""
        with patch("routes.auth_routes.user_service.get_user_by_email", return_value=mock_user):
            with patch("routes.auth_routes.auth_service.verify_password", return_value=True):
                with patch("routes.auth_routes.auth_service.create_access_token", return_value="token123"):
                    response = client.post(
                        "/auth/login",
                        json={
                            "email": "test@example.com",
                            "password": "password123"
                        }
                    )
                    assert response.status_code == 200
                    data = response.json()
                    assert "token" in data
                    assert "user" in data
                    assert data["user"]["email"] == "test@example.com"
    
    def test_login_invalid_email(self, client):
        """Test login with non-existent email."""
        with patch("routes.auth_routes.user_service.get_user_by_email", return_value=None):
            response = client.post(
                "/auth/login",
                json={
                    "email": "nonexistent@example.com",
                    "password": "password123"
                }
            )
            assert response.status_code == 401
            assert "invalid credentials" in response.json()["detail"]
    
    def test_login_invalid_password(self, client, mock_user):
        """Test login with incorrect password."""
        with patch("routes.auth_routes.user_service.get_user_by_email", return_value=mock_user):
            with patch("routes.auth_routes.auth_service.verify_password", return_value=False):
                response = client.post(
                    "/auth/login",
                    json={
                        "email": "test@example.com",
                        "password": "wrongpassword"
                    }
                )
                assert response.status_code == 401
                assert "invalid credentials" in response.json()["detail"]
    
    def test_login_missing_fields(self, client):
        """Test login with missing fields."""
        response = client.post(
            "/auth/login",
            json={
                "email": "test@example.com"
                # Missing password
            }
        )
        assert response.status_code == 422


class TestMe:
    """Tests for GET /auth/me endpoint."""
    
    def test_me_success(self, client, mock_user, mock_token):
        """Test getting current user info."""
        with patch("routes.auth_routes.auth_service.verify_access_token", return_value=True):
            with patch("routes.auth_routes.user_service.get_user_by_id", return_value=mock_user):
                response = client.get(
                    "/auth/me",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 200
                data = response.json()
                assert data["id"] == mock_user["id"]
                assert data["email"] == mock_user["email"]
                assert data["username"] == mock_user["username"]
                assert "credits" in data
    
    def test_me_missing_auth_header(self, client):
        """Test /auth/me without authorization header."""
        response = client.get("/auth/me")
        assert response.status_code == 401
        assert "missing authorization header" in response.json()["detail"]
    
    def test_me_invalid_token_format(self, client):
        """Test /auth/me with invalid token format."""
        response = client.get(
            "/auth/me",
            headers={"Authorization": "InvalidFormat token"}
        )
        assert response.status_code == 401
        assert "invalid authorization header" in response.json()["detail"]
    
    def test_me_invalid_token(self, client):
        """Test /auth/me with invalid token."""
        with patch("routes.auth_routes.auth_service.verify_access_token", return_value=False):
            response = client.get(
                "/auth/me",
                headers={"Authorization": "Bearer invalid_token"}
            )
            assert response.status_code == 401
            assert "invalid token" in response.json()["detail"]
    
    def test_me_user_not_found(self, client, mock_token):
        """Test /auth/me when user doesn't exist."""
        with patch("routes.auth_routes.auth_service.verify_access_token", return_value=True):
            with patch("routes.auth_routes.user_service.get_user_by_id", return_value=None):
                response = client.get(
                    "/auth/me",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 404
                assert "user not found" in response.json()["detail"]


class TestVerifyEmail:
    """Tests for POST /auth/verify/{token} endpoint."""
    
    def test_verify_email_success(self, client, mock_user, mock_token):
        """Test successful email verification."""
        with patch("routes.auth_routes.auth_service.verify_access_token", return_value=True):
            with patch("routes.auth_routes.user_service.get_user_by_id", return_value=mock_user):
                with patch("routes.auth_routes.user_service.update_user", return_value={**mock_user, "email_verified": True}):
                    response = client.post(f"/auth/verify/{mock_token}")
                    assert response.status_code == 200
                    assert "email verified" in response.json()["message"]
    
    def test_verify_email_invalid_token(self, client):
        """Test email verification with invalid token."""
        with patch("routes.auth_routes.auth_service.verify_access_token", return_value=False):
            response = client.post("/auth/verify/invalid_token")
            assert response.status_code == 400
            assert "invalid token" in response.json()["detail"]
    
    def test_verify_email_user_not_found(self, client, mock_token):
        """Test email verification when user doesn't exist."""
        with patch("routes.auth_routes.auth_service.verify_access_token", return_value=True):
            with patch("routes.auth_routes.user_service.get_user_by_id", return_value=None):
                response = client.post(f"/auth/verify/{mock_token}")
                assert response.status_code == 404
                assert "user not found" in response.json()["detail"]

