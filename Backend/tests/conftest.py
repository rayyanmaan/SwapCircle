"""Shared pytest fixtures for backend API tests."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch
from typing import Dict, Any

from main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def mock_user():
    """Create a mock user dictionary."""
    return {
        "id": "user123",
        "email": "test@example.com",
        "username": "testuser",
        "full_name": "Test User",
        "password_hash": "hashed_password",
        "salt": "salt123",
        "credits": 10.0,
        "email_verified": True,
        "bio": "Test bio",
        "profile_pic": None,
        "instagram_handle": None,
        "whatsapp_number": None,
        "facebook_url": None,
        "twitter_handle": None,
        "linkedin_url": None,
        "favorites": []
    }


@pytest.fixture
def mock_user2():
    """Create a second mock user for testing interactions."""
    return {
        "id": "user456",
        "email": "test2@example.com",
        "username": "testuser2",
        "full_name": "Test User 2",
        "password_hash": "hashed_password2",
        "salt": "salt456",
        "credits": 5.0,
        "email_verified": True,
        "bio": None,
        "profile_pic": None,
        "favorites": []
    }


@pytest.fixture
def mock_token(mock_user):
    """Create a mock authentication token."""
    return f"{mock_user['id']}|signature123"


@pytest.fixture
def mock_item():
    """Create a mock item dictionary."""
    return {
        "id": "item123",
        "title": "Test Item",
        "description": "A test item description",
        "category": "tops",
        "size": "M",
        "location": "San Francisco",
        "condition": "like_new",
        "branded": "Yes",
        "credits": 2.0,
        "owner_id": "user123",
        "status": "available",
        "images": [
            {"id": "img1", "url": "/static/images/img1.jpg"}
        ]
    }


@pytest.fixture
def mock_swap_request():
    """Create a mock swap request dictionary."""
    return {
        "id": "request123",
        "item_id": "item123",
        "requester_id": "user456",
        "owner_id": "user123",
        "status": "pending",
        "credits_required": 2.0,
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    }


@pytest.fixture
def auth_headers(mock_token):
    """Create authorization headers with mock token."""
    return {"Authorization": f"Bearer {mock_token}"}


@pytest.fixture
def mock_auth_service():
    """Mock auth_service functions."""
    with patch("services.auth_service.verify_access_token", return_value=True) as mock_verify:
        with patch("services.auth_service.get_user_id_from_request") as mock_get_user:
            mock_get_user.return_value = "user123"
            yield {
                "verify_access_token": mock_verify,
                "get_user_id_from_request": mock_get_user
            }


@pytest.fixture
def mock_user_service():
    """Mock user_service functions."""
    with patch("services.user_service.get_user_by_id") as mock_get_by_id:
        with patch("services.user_service.get_user_by_email") as mock_get_by_email:
            with patch("services.user_service.get_user_by_username") as mock_get_by_username:
                with patch("services.user_service.create_user") as mock_create:
                    with patch("services.user_service.update_user") as mock_update:
                        with patch("services.user_service.list_users") as mock_list:
                            with patch("services.user_service.add_favorite") as mock_add_fav:
                                with patch("services.user_service.remove_favorite") as mock_remove_fav:
                                    with patch("services.user_service.get_user_favorites") as mock_get_favs:
                                        yield {
                                            "get_user_by_id": mock_get_by_id,
                                            "get_user_by_email": mock_get_by_email,
                                            "get_user_by_username": mock_get_by_username,
                                            "create_user": mock_create,
                                            "update_user": mock_update,
                                            "list_users": mock_list,
                                            "add_favorite": mock_add_fav,
                                            "remove_favorite": mock_remove_fav,
                                            "get_user_favorites": mock_get_favs
                                        }


@pytest.fixture
def mock_storage_service():
    """Mock storage_service functions."""
    with patch("services.storage_service.get_item") as mock_get:
        with patch("services.storage_service.list_items") as mock_list:
            with patch("services.storage_service.upsert_item") as mock_upsert:
                with patch("services.storage_service.delete_item") as mock_delete:
                    yield {
                        "get_item": mock_get,
                        "list_items": mock_list,
                        "upsert_item": mock_upsert,
                        "delete_item": mock_delete
                    }


@pytest.fixture
def mock_swap_service():
    """Mock swap_service functions."""
    with patch("services.swap_service.create_swap_request") as mock_create:
        with patch("services.swap_service.get_swap_request") as mock_get:
            with patch("services.swap_service.update_swap_request") as mock_update:
                with patch("services.swap_service.get_requests_for_requester") as mock_get_requester:
                    with patch("services.swap_service.get_pending_requests_for_owner") as mock_get_owner:
                        with patch("services.swap_service.get_pending_requests_for_item") as mock_get_item:
                            with patch("services.swap_service.get_approved_swaps_for_user") as mock_get_approved:
                                with patch("services.swap_service.cancel_other_pending_requests") as mock_cancel:
                                    yield {
                                        "create_swap_request": mock_create,
                                        "get_swap_request": mock_get,
                                        "update_swap_request": mock_update,
                                        "get_requests_for_requester": mock_get_requester,
                                        "get_pending_requests_for_owner": mock_get_owner,
                                        "get_pending_requests_for_item": mock_get_item,
                                        "get_approved_swaps_for_user": mock_get_approved,
                                        "cancel_other_pending_requests": mock_cancel
                                    }


@pytest.fixture
def mock_credit_service():
    """Mock credit_service functions."""
    with patch("services.credit_service.get_user_balance") as mock_balance:
        with patch("services.credit_service.add_credits") as mock_add:
            with patch("services.credit_service.deduct_credits") as mock_deduct:
                with patch("services.credit_service.get_user_transactions") as mock_transactions:
                    yield {
                        "get_user_balance": mock_balance,
                        "add_credits": mock_add,
                        "deduct_credits": mock_deduct,
                        "get_user_transactions": mock_transactions
                    }


@pytest.fixture
def mock_image_service():
    """Mock image_service functions."""
    with patch("services.image_service.upload_image") as mock_upload:
        with patch("services.image_service.delete_image") as mock_delete:
            mock_upload.return_value = ("/static/images/test.jpg", "img123")
            yield {
                "upload_image": mock_upload,
                "delete_image": mock_delete
            }


@pytest.fixture
def mock_notification_service():
    """Mock notification_service functions."""
    with patch("services.notification_service.get_user_notifications") as mock_get:
        with patch("services.notification_service.get_recent_swap_events") as mock_recent:
            with patch("services.notification_service.get_unread_count") as mock_count:
                with patch("services.notification_service.mark_notification_as_read") as mock_mark_read:
                    with patch("services.notification_service.mark_all_as_read") as mock_mark_all:
                        with patch("services.notification_service.delete_notification") as mock_delete:
                            with patch("services.notification_service.create_notification") as mock_create:
                                yield {
                                    "get_user_notifications": mock_get,
                                    "get_recent_swap_events": mock_recent,
                                    "get_unread_count": mock_count,
                                    "mark_notification_as_read": mock_mark_read,
                                    "mark_all_as_read": mock_mark_all,
                                    "delete_notification": mock_delete,
                                    "create_notification": mock_create
                                }


@pytest.fixture
def mock_rating_service():
    """Mock rating_service functions."""
    with patch("services.rating_service.create_or_update_rating") as mock_create:
        with patch("services.rating_service.get_rating") as mock_get:
            with patch("services.rating_service.get_user_rating_stats") as mock_stats:
                yield {
                    "create_or_update_rating": mock_create,
                    "get_rating": mock_get,
                    "get_user_rating_stats": mock_stats
                }


@pytest.fixture
def mock_email_service():
    """Mock email_service functions."""
    with patch("services.email_service.send_email") as mock_send:
        mock_send.return_value = True
        yield {"send_email": mock_send}



