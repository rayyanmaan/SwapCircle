"""Comprehensive tests for user routes."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from io import BytesIO

from main import app
from routes.user_routes import get_authenticated_user_id


@pytest.fixture
def client():
    return TestClient(app)


class TestListUsers:
    """Tests for GET /users/ endpoint."""
    
    def test_list_users_success(self, client, mock_user):
        """Test listing all users."""
        with patch("routes.user_routes.user_service.list_users", return_value=[mock_user]):
            response = client.get("/users/")
            assert response.status_code == 200
            data = response.json()
            assert "users" in data
            assert isinstance(data["users"], list)


class TestGetUserByUsername:
    """Tests for GET /users/username/{username} endpoint."""
    
    def test_get_user_by_username_success(self, client, mock_user):
        """Test getting user by username."""
        with patch("routes.user_routes.user_service.get_user_by_username", return_value=mock_user):
            with patch("services.rating_service.get_user_rating_stats", new_callable=AsyncMock, return_value={"average_rating": 4.5, "total_ratings": 10}):
                response = client.get(f"/users/username/{mock_user['username']}")
                assert response.status_code == 200
                data = response.json()
                assert data["username"] == mock_user["username"]
                assert "average_rating" in data
    
    def test_get_user_by_username_not_found(self, client):
        """Test getting non-existent user by username."""
        with patch("routes.user_routes.user_service.get_user_by_username", return_value=None):
            response = client.get("/users/username/nonexistent")
            assert response.status_code == 404


class TestGetUserById:
    """Tests for GET /users/{user_id} endpoint."""
    
    def test_get_user_by_id_success(self, client, mock_user):
        """Test getting user by ID."""
        with patch("routes.user_routes.user_service.get_user_by_id", return_value=mock_user):
            with patch("services.rating_service.get_user_rating_stats", new_callable=AsyncMock, return_value={"average_rating": 4.5, "total_ratings": 10}):
                response = client.get(f"/users/{mock_user['id']}")
                assert response.status_code == 200
                data = response.json()
                assert data["id"] == mock_user["id"]
    
    def test_get_user_by_id_not_found(self, client):
        """Test getting non-existent user by ID."""
        with patch("routes.user_routes.user_service.get_user_by_id", return_value=None):
            response = client.get("/users/nonexistent")
            assert response.status_code == 404


class TestUpdateUser:
    """Tests for PATCH /users/{user_id} endpoint."""
    
    def test_update_user_success(self, client, mock_user, mock_token):
        """Test updating user profile."""
        updated_user = {**mock_user, "full_name": "Updated Name"}
        with patch("routes.user_routes.auth_service.verify_access_token", return_value=True):
            with patch("routes.user_routes.user_service.get_user_by_id", return_value=mock_user):
                with patch("routes.user_routes.user_service.update_user", return_value=updated_user):
                    with patch("services.rating_service.get_user_rating_stats", new_callable=AsyncMock, return_value={"average_rating": 4.5, "total_ratings": 10}):
                        response = client.patch(
                            f"/users/{mock_user['id']}",
                            json={"full_name": "Updated Name"},
                            headers={"Authorization": f"Bearer {mock_token}"}
                        )
                        assert response.status_code == 200
                        data = response.json()
                        assert data["full_name"] == "Updated Name"
    
    def test_update_user_not_owner(self, client, mock_user, mock_token):
        """Test updating another user's profile (should fail)."""
        with patch("routes.user_routes.auth_service.verify_access_token", return_value=True):
            response = client.patch(
                "/users/different_user_id",
                json={"full_name": "Updated Name"},
                headers={"Authorization": f"Bearer {mock_token}"}
            )
            assert response.status_code == 403
    
    def test_update_user_duplicate_username(self, client, mock_user, mock_token):
        """Test updating username to one that's already taken."""
        other_user = {**mock_user, "id": "other_user", "username": "taken_username"}
        with patch("routes.user_routes.auth_service.verify_access_token", return_value=True):
            with patch("routes.user_routes.user_service.get_user_by_id", return_value=mock_user):
                with patch("routes.user_routes.user_service.get_user_by_username", return_value=other_user):
                    response = client.patch(
                        f"/users/{mock_user['id']}",
                        json={"username": "taken_username"},
                        headers={"Authorization": f"Bearer {mock_token}"}
                    )
                    assert response.status_code == 400
                    assert "username already taken" in response.json()["detail"]


class TestUploadProfilePicture:
    """Tests for POST /users/{user_id}/profile-picture endpoint."""
    
    def test_upload_profile_picture_success(self, client, mock_user, mock_token):
        """Test uploading profile picture."""
        updated_user = {**mock_user, "profile_pic": "/static/images/profile.jpg"}
        with patch("routes.user_routes.auth_service.verify_access_token", return_value=True):
            with patch("routes.user_routes.user_service.get_user_by_id", return_value=mock_user):
                with patch("routes.user_routes.image_service.upload_image", return_value=("/static/images/profile.jpg", "img123")):
                    with patch("routes.user_routes.user_service.update_user", return_value=updated_user):
                        with patch("services.rating_service.get_user_rating_stats", new_callable=AsyncMock, return_value={"average_rating": 4.5, "total_ratings": 10}):
                            files = {"file": ("profile.jpg", BytesIO(b"fake image data"), "image/jpeg")}
                            response = client.post(
                                f"/users/{mock_user['id']}/profile-picture",
                                files=files,
                                headers={"Authorization": f"Bearer {mock_token}"}
                            )
                            assert response.status_code == 200
                            data = response.json()
                            assert data["profile_pic"] == "/static/images/profile.jpg"
    
    def test_upload_profile_picture_not_owner(self, client, mock_token):
        """Test uploading profile picture for another user."""
        with patch("routes.user_routes.auth_service.verify_access_token", return_value=True):
            files = {"file": ("profile.jpg", BytesIO(b"fake image data"), "image/jpeg")}
            response = client.post(
                "/users/different_user_id/profile-picture",
                files=files,
                headers={"Authorization": f"Bearer {mock_token}"}
            )
            assert response.status_code == 403


class TestFavorites:
    """Tests for favorites endpoints."""
    
    def test_add_favorite_success(self, client, mock_user, mock_token):
        """Test adding item to favorites."""
        updated_user = {**mock_user, "favorites": ["item123"]}
        app.dependency_overrides[get_authenticated_user_id] = lambda: mock_user["id"]
        try:
            with patch("routes.user_routes.user_service.add_favorite", new_callable=AsyncMock, return_value=updated_user):
                response = client.post(
                    f"/users/{mock_user['id']}/favorites/item123",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 200
                data = response.json()
                assert "favorites" in data
        finally:
            app.dependency_overrides.clear()
    
    def test_remove_favorite_success(self, client, mock_user, mock_token):
        """Test removing item from favorites."""
        updated_user = {**mock_user, "favorites": []}
        app.dependency_overrides[get_authenticated_user_id] = lambda: mock_user["id"]
        try:
            with patch("routes.user_routes.user_service.remove_favorite", new_callable=AsyncMock, return_value=updated_user):
                response = client.delete(
                    f"/users/{mock_user['id']}/favorites/item123",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 200
        finally:
            app.dependency_overrides.clear()
    
    def test_get_favorites_success(self, client, mock_user, mock_token):
        """Test getting user's favorites."""
        app.dependency_overrides[get_authenticated_user_id] = lambda: mock_user["id"]
        try:
            with patch("routes.user_routes.user_service.get_user_favorites", new_callable=AsyncMock, return_value=["item123", "item456"]):
                response = client.get(
                    f"/users/{mock_user['id']}/favorites",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 200
                data = response.json()
                assert "favorites" in data
                assert isinstance(data["favorites"], list)
        finally:
            app.dependency_overrides.clear()
    
    def test_add_favorite_not_authorized(self, client, mock_user, mock_token):
        """Test adding favorite for another user."""
        app.dependency_overrides[get_authenticated_user_id] = lambda: "different_user"
        try:
            response = client.post(
                f"/users/{mock_user['id']}/favorites/item123",
                headers={"Authorization": f"Bearer {mock_token}"}
            )
            assert response.status_code == 403
        finally:
            app.dependency_overrides.clear()

