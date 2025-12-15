"""Comprehensive tests for notification routes."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch

from main import app


@pytest.fixture
def client():
    return TestClient(app)


class TestGetNotifications:
    """Tests for GET /notifications endpoint."""
    
    def test_get_notifications_success(self, client, mock_user, mock_token):
        """Test getting notifications."""
        notifications = [
            {
                "id": "notif1",
                "user_id": mock_user["id"],
                "event_type": "new_request",
                "read": False,
                "created_at": "2024-01-01T00:00:00"
            }
        ]
        with patch("routes.notification_routes.auth_service.get_user_id_from_request", return_value=mock_user["id"]):
            with patch("routes.notification_routes.notification_service.get_user_notifications", return_value=notifications):
                response = client.get(
                    "/notifications",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 200
                data = response.json()
                assert isinstance(data, list)
                assert len(data) > 0
    
    def test_get_notifications_unread_only(self, client, mock_user, mock_token):
        """Test getting only unread notifications."""
        with patch("routes.notification_routes.auth_service.get_user_id_from_request", return_value=mock_user["id"]):
            with patch("routes.notification_routes.notification_service.get_user_notifications", return_value=[]):
                response = client.get(
                    "/notifications?unread_only=true",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 200
    
    def test_get_notifications_no_auth(self, client):
        """Test getting notifications without authentication."""
        response = client.get("/notifications")
        assert response.status_code == 401


class TestGetRecentNotifications:
    """Tests for GET /notifications/recent endpoint."""
    
    def test_get_recent_notifications_success(self, client, mock_user, mock_token):
        """Test getting recent notifications."""
        events = [
            {
                "event_type": "approved",
                "request_id": "req1",
                "item_id": "item1"
            }
        ]
        with patch("routes.notification_routes.auth_service.get_user_id_from_request", return_value=mock_user["id"]):
            with patch("routes.notification_routes.notification_service.get_recent_swap_events", return_value=events):
                response = client.get(
                    "/notifications/recent",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 200
                data = response.json()
                assert isinstance(data, list)


class TestGetUnreadCount:
    """Tests for GET /notifications/unread-count endpoint."""
    
    def test_get_unread_count_success(self, client, mock_user, mock_token):
        """Test getting unread notification count."""
        with patch("routes.notification_routes.auth_service.get_user_id_from_request", return_value=mock_user["id"]):
            with patch("routes.notification_routes.notification_service.get_unread_count", return_value=5):
                response = client.get(
                    "/notifications/unread-count",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 200
                data = response.json()
                assert "count" in data
                assert data["count"] == 5


class TestMarkNotificationAsRead:
    """Tests for PATCH /notifications/{notification_id}/read endpoint."""
    
    def test_mark_notification_as_read_success(self, client, mock_user, mock_token):
        """Test marking a notification as read."""
        with patch("routes.notification_routes.auth_service.get_user_id_from_request", return_value=mock_user["id"]):
            with patch("routes.notification_routes.notification_service.mark_notification_as_read", return_value=True):
                response = client.patch(
                    "/notifications/notif1/read",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 200
                data = response.json()
                assert data["success"] is True
    
    def test_mark_notification_as_read_not_found(self, client, mock_user, mock_token):
        """Test marking non-existent notification as read."""
        with patch("routes.notification_routes.auth_service.get_user_id_from_request", return_value=mock_user["id"]):
            with patch("routes.notification_routes.notification_service.mark_notification_as_read", return_value=False):
                response = client.patch(
                    "/notifications/nonexistent/read",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 404


class TestMarkAllAsRead:
    """Tests for PATCH /notifications/read-all endpoint."""
    
    def test_mark_all_as_read_success(self, client, mock_user, mock_token):
        """Test marking all notifications as read."""
        with patch("routes.notification_routes.auth_service.get_user_id_from_request", return_value=mock_user["id"]):
            with patch("routes.notification_routes.notification_service.mark_all_as_read", return_value=3):
                response = client.patch(
                    "/notifications/read-all",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 200
                data = response.json()
                assert data["success"] is True
                assert "3 notification(s)" in data["message"]


class TestDeleteNotification:
    """Tests for DELETE /notifications/{notification_id} endpoint."""
    
    def test_delete_notification_success(self, client, mock_user, mock_token):
        """Test deleting a notification."""
        with patch("routes.notification_routes.auth_service.get_user_id_from_request", return_value=mock_user["id"]):
            with patch("routes.notification_routes.notification_service.delete_notification", return_value=True):
                response = client.delete(
                    "/notifications/notif1",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 200
                data = response.json()
                assert data["success"] is True
    
    def test_delete_notification_not_found(self, client, mock_user, mock_token):
        """Test deleting non-existent notification."""
        with patch("routes.notification_routes.auth_service.get_user_id_from_request", return_value=mock_user["id"]):
            with patch("routes.notification_routes.notification_service.delete_notification", return_value=False):
                response = client.delete(
                    "/notifications/nonexistent",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 404

