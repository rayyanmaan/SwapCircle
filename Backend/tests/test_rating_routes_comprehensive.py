"""Comprehensive tests for rating routes."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch

from main import app


@pytest.fixture
def client():
    return TestClient(app)


class TestGiveRating:
    """Tests for POST /ratings/{rated_user_id} endpoint."""
    
    def test_give_rating_success(self, client, mock_user, mock_user2, mock_token):
        """Test successfully giving a rating."""
        rating_doc = {
            "id": "rating123",
            "rater_user_id": mock_user["id"],
            "rated_user_id": mock_user2["id"],
            "stars": 5,
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00"
        }
        with patch("routes.rating_routes.auth_service.get_user_id_from_request", return_value=mock_user["id"]):
            with patch("routes.rating_routes.rating_service.create_or_update_rating", return_value=rating_doc):
                response = client.post(
                    f"/ratings/{mock_user2['id']}",
                    json={"stars": 5},
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 200
                data = response.json()
                assert data["stars"] == 5
                assert data["rater_user_id"] == mock_user["id"]
                assert data["rated_user_id"] == mock_user2["id"]
    
    def test_give_rating_self_rating(self, client, mock_user, mock_token):
        """Test rating yourself (should fail)."""
        with patch("routes.rating_routes.auth_service.get_user_id_from_request", return_value=mock_user["id"]):
            response = client.post(
                f"/ratings/{mock_user['id']}",
                json={"stars": 5},
                headers={"Authorization": f"Bearer {mock_token}"}
            )
            assert response.status_code == 400
            assert "cannot rate themselves" in response.json()["detail"]
    
    def test_give_rating_invalid_stars(self, client, mock_user, mock_user2, mock_token):
        """Test giving rating with invalid star value."""
        with patch("routes.rating_routes.auth_service.get_user_id_from_request", return_value=mock_user["id"]):
            response = client.post(
                f"/ratings/{mock_user2['id']}",
                json={"stars": 6},  # Invalid: should be 1-5
                headers={"Authorization": f"Bearer {mock_token}"}
            )
            # Should fail validation
            assert response.status_code in [400, 422]
    
    def test_give_rating_no_auth(self, client, mock_user2):
        """Test giving rating without authentication."""
        response = client.post(
            f"/ratings/{mock_user2['id']}",
            json={"stars": 5}
        )
        assert response.status_code == 401


class TestGetMyRating:
    """Tests for GET /ratings/{rated_user_id}/my-rating endpoint."""
    
    def test_get_my_rating_exists(self, client, mock_user, mock_user2, mock_token):
        """Test getting existing rating."""
        rating_doc = {
            "id": "rating123",
            "rater_user_id": mock_user["id"],
            "rated_user_id": mock_user2["id"],
            "stars": 4,
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00"
        }
        with patch("routes.rating_routes.auth_service.get_user_id_from_request", return_value=mock_user["id"]):
            with patch("routes.rating_routes.rating_service.get_rating", return_value=rating_doc):
                response = client.get(
                    f"/ratings/{mock_user2['id']}/my-rating",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 200
                data = response.json()
                assert data["stars"] == 4
    
    def test_get_my_rating_not_exists(self, client, mock_user, mock_user2, mock_token):
        """Test getting rating when it doesn't exist."""
        with patch("routes.rating_routes.auth_service.get_user_id_from_request", return_value=mock_user["id"]):
            with patch("routes.rating_routes.rating_service.get_rating", return_value=None):
                response = client.get(
                    f"/ratings/{mock_user2['id']}/my-rating",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 200
                assert response.json() is None


class TestGetRatingStats:
    """Tests for GET /ratings/{rated_user_id}/stats endpoint."""
    
    def test_get_rating_stats_success(self, client, mock_user2):
        """Test getting rating statistics."""
        stats = {
            "average_rating": 4.5,
            "total_ratings": 10,
            "rating_breakdown": {1: 0, 2: 1, 3: 2, 4: 3, 5: 4}
        }
        with patch("routes.rating_routes.rating_service.get_user_rating_stats", return_value=stats):
            response = client.get(f"/ratings/{mock_user2['id']}/stats")
            assert response.status_code == 200
            data = response.json()
            assert data["average_rating"] == 4.5
            assert data["total_ratings"] == 10
            assert "rating_breakdown" in data
    
    def test_get_rating_stats_no_ratings(self, client, mock_user2):
        """Test getting rating stats when user has no ratings."""
        stats = {
            "average_rating": 0.0,
            "total_ratings": 0,
            "rating_breakdown": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        }
        with patch("routes.rating_routes.rating_service.get_user_rating_stats", return_value=stats):
            response = client.get(f"/ratings/{mock_user2['id']}/stats")
            assert response.status_code == 200
            data = response.json()
            assert data["total_ratings"] == 0

