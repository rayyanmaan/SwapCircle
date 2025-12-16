"""Comprehensive tests for item routes."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch, MagicMock
from io import BytesIO

from main import app


@pytest.fixture
def client():
    return TestClient(app)


class TestCreateItem:
    """Tests for POST /items/ endpoint."""
    
    def test_create_item_success_json(self, client, mock_user, mock_item, mock_token):
        """Test creating an item with JSON body."""
        with patch("routes.item_routes.auth_service.get_user_id_from_request", return_value=mock_user["id"]):
            with patch("routes.item_routes.storage_service.upsert_item", new_callable=AsyncMock, return_value=None):
                with patch("routes.item_routes.credit_service.add_credits", new_callable=AsyncMock, return_value=11.0):
                    response = client.post(
                        "/items/",
                        json={
                            "title": "Test Item",
                            "description": "A test item",
                            "category": "tops",
                            "size": "M",
                            "location": "San Francisco",
                            "condition": "like_new",
                            "branded": "Yes",
                            "credits": 2.0
                        },
                        headers={"Authorization": f"Bearer {mock_token}"}
                    )
                    assert response.status_code == 201
                    data = response.json()
                    assert data["title"] == "Test Item"
                    assert data["owner_id"] == mock_user["id"]
                    assert data["status"] == "available"
    
    def test_create_item_success_with_images(self, client, mock_user, mock_token):
        """Test creating an item with images."""
        with patch("routes.item_routes.auth_service.get_user_id_from_request", return_value=mock_user["id"]):
            with patch("routes.item_routes.image_service.upload_image", new_callable=AsyncMock, return_value=("/static/images/test.jpg", "img123")):
                with patch("routes.item_routes.storage_service.upsert_item", new_callable=AsyncMock, return_value=None):
                    with patch("routes.item_routes.credit_service.add_credits", new_callable=AsyncMock, return_value=11.0):
                        files = [("images", ("test.jpg", BytesIO(b"fake image data"), "image/jpeg"))]
                        data = {
                            "item": '{"title": "Test Item", "description": "A test item", "category": "tops", "size": "M", "location": "San Francisco", "condition": "like_new", "branded": "Yes", "credits": 2.0}'
                        }
                        response = client.post(
                            "/items/",
                            data=data,
                            files=files,
                            headers={"Authorization": f"Bearer {mock_token}"}
                        )
                        assert response.status_code == 201
                        data = response.json()
                        assert len(data["images"]) > 0
    
    def test_create_item_missing_auth(self, client):
        """Test creating an item without authentication."""
        response = client.post(
            "/items/",
            json={"title": "Test Item"}
        )
        assert response.status_code == 401
    
    def test_create_item_missing_title(self, client, mock_token):
        """Test creating an item without required title."""
        with patch("routes.item_routes.auth_service.get_user_id_from_request", return_value="user123"):
            response = client.post(
                "/items/",
                json={"description": "A test item"},
                headers={"Authorization": f"Bearer {mock_token}"}
            )
            assert response.status_code == 422


class TestListItems:
    """Tests for GET /items/ endpoint."""
    
    def test_list_items_success(self, client, mock_item):
        """Test listing all items."""
        with patch("routes.item_routes.storage_service.list_items", new_callable=AsyncMock, return_value=[mock_item]):
            with patch("routes.item_routes.swap_service.get_pending_requests_for_item", new_callable=AsyncMock, return_value=[]):
                response = client.get("/items/")
                assert response.status_code == 200
                data = response.json()
                assert isinstance(data, list)
                assert len(data) > 0
    
    def test_list_items_filter_by_owner(self, client, mock_item):
        """Test listing items filtered by owner."""
        with patch("routes.item_routes.storage_service.list_items", new_callable=AsyncMock, return_value=[mock_item]):
            with patch("routes.item_routes.swap_service.get_pending_requests_for_item", new_callable=AsyncMock, return_value=[]):
                response = client.get("/items/?owner_id=user123")
                assert response.status_code == 200
                data = response.json()
                assert all(item["owner_id"] == "user123" for item in data)
    
    def test_list_items_filter_by_status(self, client, mock_item):
        """Test listing items filtered by status."""
        with patch("routes.item_routes.storage_service.list_items", new_callable=AsyncMock, return_value=[mock_item]):
            with patch("routes.item_routes.swap_service.get_pending_requests_for_item", new_callable=AsyncMock, return_value=[]):
                response = client.get("/items/?status=available")
                assert response.status_code == 200
                data = response.json()
                assert all(item["status"] == "available" for item in data)
    
    def test_list_items_empty(self, client):
        """Test listing items when none exist."""
        with patch("routes.item_routes.storage_service.list_items", new_callable=AsyncMock, return_value=[]):
            response = client.get("/items/")
            assert response.status_code == 200
            data = response.json()
            assert data == []


class TestGetItem:
    """Tests for GET /items/{item_id} endpoint."""
    
    def test_get_item_success(self, client, mock_item):
        """Test getting a single item."""
        with patch("routes.item_routes.storage_service.get_item", new_callable=AsyncMock, return_value=mock_item):
            with patch("routes.item_routes.swap_service.get_pending_requests_for_item", new_callable=AsyncMock, return_value=[]):
                response = client.get(f"/items/{mock_item['id']}")
                assert response.status_code == 200
                data = response.json()
                assert data["id"] == mock_item["id"]
                assert data["title"] == mock_item["title"]
    
    def test_get_item_not_found(self, client):
        """Test getting a non-existent item."""
        with patch("routes.item_routes.storage_service.get_item", new_callable=AsyncMock, return_value=None):
            response = client.get("/items/nonexistent")
            assert response.status_code == 404
            assert "item not found" in response.json()["detail"]
    
    def test_get_item_pending_status(self, client, mock_item):
        """Test getting an item with pending requests (status should be pending)."""
        mock_item["status"] = "available"
        with patch("routes.item_routes.storage_service.get_item", new_callable=AsyncMock, return_value=mock_item):
            with patch("routes.item_routes.swap_service.get_pending_requests_for_item", new_callable=AsyncMock, return_value=[{"id": "req1"}]):
                response = client.get(f"/items/{mock_item['id']}")
                assert response.status_code == 200
                data = response.json()
                assert data["status"] == "pending"


class TestUpdateItem:
    """Tests for PATCH /items/{item_id} endpoint."""
    
    def test_update_item_success(self, client, mock_user, mock_item, mock_token):
        """Test updating an item."""
        with patch("routes.item_routes.storage_service.get_item", new_callable=AsyncMock, return_value=mock_item):
            with patch("routes.item_routes.auth_service.get_user_id_from_request", return_value=mock_user["id"]):
                with patch("routes.item_routes.storage_service.upsert_item", new_callable=AsyncMock, return_value=None):
                    response = client.patch(
                        f"/items/{mock_item['id']}",
                        json={"title": "Updated Title"},
                        headers={"Authorization": f"Bearer {mock_token}"}
                    )
                    assert response.status_code == 200
                    data = response.json()
                    assert data["title"] == "Updated Title"
    
    def test_update_item_not_owner(self, client, mock_item, mock_token):
        """Test updating an item when user is not the owner."""
        with patch("routes.item_routes.storage_service.get_item", return_value=mock_item):
            with patch("routes.item_routes.auth_service.get_user_id_from_request", return_value="different_user"):
                response = client.patch(
                    f"/items/{mock_item['id']}",
                    json={"title": "Updated Title"},
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 403
                assert "forbidden" in response.json()["detail"].lower()
    
    def test_update_item_not_found(self, client, mock_token):
        """Test updating a non-existent item."""
        with patch("routes.item_routes.storage_service.get_item", new_callable=AsyncMock, return_value=None):
            with patch("routes.item_routes.auth_service.get_user_id_from_request", return_value="user123"):
                response = client.patch(
                    "/items/nonexistent",
                    json={"title": "Updated Title"},
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 404
    
    def test_update_item_with_images(self, client, mock_user, mock_item, mock_token):
        """Test updating an item with new images."""
        with patch("routes.item_routes.storage_service.get_item", new_callable=AsyncMock, return_value=mock_item):
            with patch("routes.item_routes.auth_service.get_user_id_from_request", return_value=mock_user["id"]):
                with patch("routes.item_routes.image_service.upload_image", new_callable=AsyncMock, return_value=("/static/images/new.jpg", "img456")):
                    with patch("routes.item_routes.storage_service.upsert_item", new_callable=AsyncMock, return_value=None):
                        files = [("images", ("new.jpg", BytesIO(b"fake image data"), "image/jpeg"))]
                        data = {"item": '{"title": "Updated Title"}'}
                        response = client.patch(
                            f"/items/{mock_item['id']}",
                            data=data,
                            files=files,
                            headers={"Authorization": f"Bearer {mock_token}"}
                        )
                        assert response.status_code == 200


class TestDeleteItem:
    """Tests for DELETE /items/{item_id} endpoint."""
    
    def test_delete_item_success(self, client, mock_user, mock_item, mock_token):
        """Test deleting an item."""
        # Ensure mock_item has status "available" to trigger credit deduction
        test_item = {**mock_item, "status": "available"}
        with patch("routes.item_routes.storage_service.get_item", new_callable=AsyncMock, return_value=test_item):
            with patch("routes.item_routes.auth_service.get_user_id_from_request", return_value=mock_user["id"]):
                with patch("routes.item_routes.image_service.delete_image", new_callable=AsyncMock, return_value=None):
                    with patch("routes.item_routes.storage_service.delete_item", new_callable=AsyncMock, return_value=None):
                        with patch("routes.item_routes.credit_service.deduct_credits", new_callable=AsyncMock, return_value=1.0):
                            response = client.delete(
                                f"/items/{test_item['id']}",
                                headers={"Authorization": f"Bearer {mock_token}"}
                            )
                            assert response.status_code == 204
    
    def test_delete_item_not_found(self, client, mock_user, mock_token):
        """Test deleting a non-existent item."""
        with patch("routes.item_routes.storage_service.get_item", new_callable=AsyncMock, return_value=None):
            with patch("routes.item_routes.auth_service.get_user_id_from_request", return_value=mock_user["id"]):
                response = client.delete(
                    "/items/nonexistent",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 404
    
    def test_delete_item_not_owner(self, client, mock_user, mock_item, mock_token):
        """Test deleting an item when user is not the owner."""
        # Set item owner to different user
        test_item = {**mock_item, "owner_id": "different_user"}
        with patch("routes.item_routes.storage_service.get_item", new_callable=AsyncMock, return_value=test_item):
            with patch("routes.item_routes.auth_service.get_user_id_from_request", return_value=mock_user["id"]):
                response = client.delete(
                    f"/items/{test_item['id']}",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 403
                assert "owner" in response.json()["detail"].lower()
    
    def test_delete_item_no_auth(self, client, mock_item):
        """Test deleting an item without authentication."""
        with patch("routes.item_routes.storage_service.get_item", new_callable=AsyncMock, return_value=mock_item):
            response = client.delete(f"/items/{mock_item['id']}")
            assert response.status_code == 401


class TestLockItem:
    """Tests for POST /items/{item_id}/lock endpoint."""
    
    def test_lock_item_success(self, client, mock_user, mock_item, mock_token):
        """Test locking an item."""
        with patch("routes.item_routes.storage_service.get_item", new_callable=AsyncMock, return_value=mock_item):
            with patch("routes.item_routes.auth_service.get_user_id_from_request", return_value="user456"):
                with patch("routes.item_routes.storage_service.upsert_item", new_callable=AsyncMock, return_value=None):
                    response = client.post(
                        f"/items/{mock_item['id']}/lock",
                        headers={"Authorization": f"Bearer {mock_token}"}
                    )
                    assert response.status_code == 200
                    assert response.json()["status"] == "locked"
    
    def test_lock_item_own_item(self, client, mock_user, mock_item, mock_token):
        """Test locking your own item (should fail)."""
        with patch("routes.item_routes.storage_service.get_item", return_value=mock_item):
            with patch("routes.item_routes.auth_service.get_user_id_from_request", return_value=mock_user["id"]):
                response = client.post(
                    f"/items/{mock_item['id']}/lock",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 403
    
    def test_lock_item_already_locked(self, client, mock_item, mock_token):
        """Test locking an already locked item."""
        mock_item["status"] = "locked"
        with patch("routes.item_routes.storage_service.get_item", return_value=mock_item):
            with patch("routes.item_routes.auth_service.get_user_id_from_request", return_value="user456"):
                response = client.post(
                    f"/items/{mock_item['id']}/lock",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 400
                assert "already locked" in response.json()["detail"]


class TestUnlockItem:
    """Tests for POST /items/{item_id}/unlock endpoint."""
    
    def test_unlock_item_success(self, client, mock_user, mock_item, mock_token):
        """Test unlocking an item."""
        mock_item["status"] = "locked"
        with patch("routes.item_routes.storage_service.get_item", new_callable=AsyncMock, return_value=mock_item):
            with patch("routes.item_routes.auth_service.get_user_id_from_request", return_value=mock_user["id"]):
                with patch("routes.item_routes.storage_service.upsert_item", new_callable=AsyncMock, return_value=None):
                    response = client.post(
                        f"/items/{mock_item['id']}/unlock",
                        headers={"Authorization": f"Bearer {mock_token}"}
                    )
                    assert response.status_code == 200
                    assert response.json()["status"] == "available"
    
    def test_unlock_item_not_owner(self, client, mock_item, mock_token):
        """Test unlocking an item when not the owner."""
        mock_item["status"] = "locked"
        with patch("routes.item_routes.storage_service.get_item", return_value=mock_item):
            with patch("routes.item_routes.auth_service.get_user_id_from_request", return_value="different_user"):
                response = client.post(
                    f"/items/{mock_item['id']}/unlock",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 403
    
    def test_unlock_item_not_locked(self, client, mock_user, mock_item, mock_token):
        """Test unlocking an item that's not locked."""
        with patch("routes.item_routes.storage_service.get_item", return_value=mock_item):
            with patch("routes.item_routes.auth_service.get_user_id_from_request", return_value=mock_user["id"]):
                response = client.post(
                    f"/items/{mock_item['id']}/unlock",
                    headers={"Authorization": f"Bearer {mock_token}"}
                )
                assert response.status_code == 400
                assert "not locked" in response.json()["detail"]