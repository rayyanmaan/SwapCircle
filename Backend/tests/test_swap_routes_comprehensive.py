"""Comprehensive tests for swap routes."""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch

from main import app


@pytest.fixture
def client():
    return TestClient(app)


class TestRequestSwap:
    """Tests for POST /swaps/items/{item_id}/request endpoint."""

    def test_request_swap_success(
        self, client, mock_user, mock_user2, mock_item, mock_swap_request, mock_token
    ):
        """Test successfully creating a swap request."""
        with patch(
            "routes.swap_routes.auth_service.get_user_id_from_request",
            return_value=mock_user2["id"],
        ):
            with patch(
                "routes.swap_routes.storage_service.get_item", return_value=mock_item
            ):
                with patch(
                    "routes.swap_routes.get_user_by_id", return_value=mock_user2
                ):
                    with patch(
                        "routes.swap_routes.swap_service.get_requests_for_requester",
                        return_value=[],
                    ):
                        with patch(
                            "routes.swap_routes.swap_service.create_swap_request",
                            return_value=mock_swap_request,
                        ):
                            with patch(
                                "routes.swap_routes.storage_service.upsert_item",
                                return_value=None,
                            ):
                                with patch(
                                    "routes.swap_routes.notification_service.create_notification",
                                    return_value=None,
                                ):
                                    response = client.post(
                                        f"/swaps/items/{mock_item['id']}/request",
                                        headers={
                                            "Authorization": f"Bearer {mock_token}"
                                        },
                                    )
                                    assert response.status_code == 200
                                    data = response.json()
                                    assert data["status"] == "requested"
                                    assert "request_id" in data

    def test_request_swap_own_item(self, client, mock_user, mock_item, mock_token):
        """Test requesting swap for own item (should fail)."""
        with patch(
            "routes.swap_routes.auth_service.get_user_id_from_request",
            return_value=mock_user["id"],
        ):
            with patch(
                "routes.swap_routes.storage_service.get_item", return_value=mock_item
            ):
                response = client.post(
                    f"/swaps/items/{mock_item['id']}/request",
                    headers={"Authorization": f"Bearer {mock_token}"},
                )
                assert response.status_code == 403
                assert (
                    "cannot swap or purchase your own items"
                    in response.json()["detail"]
                )

    def test_request_swap_item_not_available(
        self, client, mock_user2, mock_item, mock_token
    ):
        """Test requesting swap for unavailable item."""
        mock_item["status"] = "swapped"
        with patch(
            "routes.swap_routes.auth_service.get_user_id_from_request",
            return_value=mock_user2["id"],
        ):
            with patch(
                "routes.swap_routes.storage_service.get_item", return_value=mock_item
            ):
                response = client.post(
                    f"/swaps/items/{mock_item['id']}/request",
                    headers={"Authorization": f"Bearer {mock_token}"},
                )
                assert response.status_code == 400
                assert "not available" in response.json()["detail"]

    def test_request_swap_insufficient_credits(
        self, client, mock_user2, mock_item, mock_token
    ):
        """Test requesting swap with insufficient credits."""
        mock_user2["credits"] = 0.5  # Less than required
        mock_item["credits"] = 2.0
        with patch(
            "routes.swap_routes.auth_service.get_user_id_from_request",
            return_value=mock_user2["id"],
        ):
            with patch(
                "routes.swap_routes.storage_service.get_item", return_value=mock_item
            ):
                with patch(
                    "routes.swap_routes.get_user_by_id", return_value=mock_user2
                ):
                    with patch(
                        "routes.swap_routes.swap_service.get_requests_for_requester",
                        return_value=[],
                    ):
                        response = client.post(
                            f"/swaps/items/{mock_item['id']}/request",
                            headers={"Authorization": f"Bearer {mock_token}"},
                        )
                        assert response.status_code == 400
                        assert "Insufficient credits" in response.json()["detail"]

    def test_request_swap_duplicate_request(
        self, client, mock_user2, mock_item, mock_swap_request, mock_token
    ):
        """Test creating duplicate swap request."""
        existing_request = {**mock_swap_request, "status": "pending"}
        with patch(
            "routes.swap_routes.auth_service.get_user_id_from_request",
            return_value=mock_user2["id"],
        ):
            with patch(
                "routes.swap_routes.storage_service.get_item", return_value=mock_item
            ):
                with patch(
                    "routes.swap_routes.get_user_by_id", return_value=mock_user2
                ):
                    with patch(
                        "routes.swap_routes.swap_service.get_requests_for_requester",
                        return_value=[existing_request],
                    ):
                        response = client.post(
                            f"/swaps/items/{mock_item['id']}/request",
                            headers={"Authorization": f"Bearer {mock_token}"},
                        )
                        assert response.status_code == 400
                        assert (
                            "already have a pending swap request"
                            in response.json()["detail"]
                        )


class TestApproveSwap:
    """Tests for POST /swaps/items/{item_id}/requests/{request_id}/approve endpoint."""

    def test_approve_swap_success(
        self, client, mock_user, mock_user2, mock_item, mock_swap_request, mock_token
    ):
        """Test successfully approving a swap request."""
        with patch(
            "routes.swap_routes.auth_service.get_user_id_from_request",
            return_value=mock_user["id"],
        ):
            with patch(
                "routes.swap_routes.storage_service.get_item", return_value=mock_item
            ):
                with patch(
                    "routes.swap_routes.swap_service.get_swap_request",
                    return_value=mock_swap_request,
                ):
                    with patch(
                        "routes.swap_routes.get_user_by_id", return_value=mock_user2
                    ):
                        with patch(
                            "routes.swap_routes.credit_service.deduct_credits",
                            return_value=8.0,
                        ):
                            with patch(
                                "routes.swap_routes.credit_service.add_credits",
                                return_value=12.0,
                            ):
                                with patch(
                                    "routes.swap_routes.swap_service.update_swap_request",
                                    return_value=None,
                                ):
                                    with patch(
                                        "routes.swap_routes.swap_service.cancel_other_pending_requests",
                                        return_value=None,
                                    ):
                                        with patch(
                                            "routes.swap_routes.storage_service.upsert_item",
                                            return_value=None,
                                        ):
                                            with patch(
                                                "routes.swap_routes.notification_service.create_notification",
                                                return_value=None,
                                            ):
                                                response = client.post(
                                                    f"/swaps/items/{mock_item['id']}/requests/{mock_swap_request['id']}/approve",
                                                    headers={
                                                        "Authorization": f"Bearer {mock_token}"
                                                    },
                                                )
                                                assert response.status_code == 200
                                                data = response.json()
                                                assert data["status"] == "approved"

    def test_approve_swap_not_owner(
        self, client, mock_user2, mock_item, mock_swap_request, mock_token
    ):
        """Test approving swap when not the owner."""
        with patch(
            "routes.swap_routes.auth_service.get_user_id_from_request",
            return_value=mock_user2["id"],
        ):
            with patch(
                "routes.swap_routes.storage_service.get_item", return_value=mock_item
            ):
                with patch(
                    "routes.swap_routes.swap_service.get_swap_request",
                    return_value=mock_swap_request,
                ):
                    response = client.post(
                        f"/swaps/items/{mock_item['id']}/requests/{mock_swap_request['id']}/approve",
                        headers={"Authorization": f"Bearer {mock_token}"},
                    )
                    assert response.status_code == 403
                    assert (
                        "Only the item owner can approve" in response.json()["detail"]
                    )

    def test_approve_swap_request_not_found(
        self, client, mock_user, mock_item, mock_token
    ):
        """Test approving non-existent swap request."""
        with patch(
            "routes.swap_routes.auth_service.get_user_id_from_request",
            return_value=mock_user["id"],
        ):
            with patch(
                "routes.swap_routes.storage_service.get_item", return_value=mock_item
            ):
                with patch(
                    "routes.swap_routes.swap_service.get_swap_request",
                    return_value=None,
                ):
                    response = client.post(
                        f"/swaps/items/{mock_item['id']}/requests/nonexistent/approve",
                        headers={"Authorization": f"Bearer {mock_token}"},
                    )
                    assert response.status_code == 404

    def test_approve_swap_request_not_pending(
        self, client, mock_user, mock_item, mock_swap_request, mock_token
    ):
        """Test approving a swap request that's not pending."""
        mock_swap_request["status"] = "approved"
        with patch(
            "routes.swap_routes.auth_service.get_user_id_from_request",
            return_value=mock_user["id"],
        ):
            with patch(
                "routes.swap_routes.storage_service.get_item", return_value=mock_item
            ):
                with patch(
                    "routes.swap_routes.swap_service.get_swap_request",
                    return_value=mock_swap_request,
                ):
                    response = client.post(
                        f"/swaps/items/{mock_item['id']}/requests/{mock_swap_request['id']}/approve",
                        headers={"Authorization": f"Bearer {mock_token}"},
                    )
                    assert response.status_code == 400
                    assert "not pending" in response.json()["detail"]


class TestRejectSwap:
    """Tests for POST /swaps/items/{item_id}/requests/{request_id}/reject endpoint."""

    def test_reject_swap_success(
        self, client, mock_user, mock_item, mock_swap_request, mock_token
    ):
        """Test successfully rejecting a swap request."""
        with patch(
            "routes.swap_routes.auth_service.get_user_id_from_request",
            return_value=mock_user["id"],
        ):
            with patch(
                "routes.swap_routes.storage_service.get_item", return_value=mock_item
            ):
                with patch(
                    "routes.swap_routes.swap_service.get_swap_request",
                    return_value=mock_swap_request,
                ):
                    with patch(
                        "routes.swap_routes.swap_service.update_swap_request",
                        return_value=None,
                    ):
                        with patch(
                            "routes.swap_routes.swap_service.get_pending_requests_for_item",
                            return_value=[],
                        ):
                            with patch(
                                "routes.swap_routes.storage_service.upsert_item",
                                return_value=None,
                            ):
                                with patch(
                                    "routes.swap_routes.get_user_by_id",
                                    return_value=mock_user,
                                ):
                                    with patch(
                                        "routes.swap_routes.notification_service.create_notification",
                                        return_value=None,
                                    ):
                                        response = client.post(
                                            f"/swaps/items/{mock_item['id']}/requests/{mock_swap_request['id']}/reject",
                                            headers={
                                                "Authorization": f"Bearer {mock_token}"
                                            },
                                        )
                                        assert response.status_code == 200
                                        data = response.json()
                                        assert data["status"] == "rejected"

    def test_reject_swap_not_owner(
        self, client, mock_user2, mock_item, mock_swap_request, mock_token
    ):
        """Test rejecting swap when not the owner."""
        with patch(
            "routes.swap_routes.auth_service.get_user_id_from_request",
            return_value=mock_user2["id"],
        ):
            with patch(
                "routes.swap_routes.storage_service.get_item", return_value=mock_item
            ):
                with patch(
                    "routes.swap_routes.swap_service.get_swap_request",
                    return_value=mock_swap_request,
                ):
                    response = client.post(
                        f"/swaps/items/{mock_item['id']}/requests/{mock_swap_request['id']}/reject",
                        headers={"Authorization": f"Bearer {mock_token}"},
                    )
                    assert response.status_code == 403


class TestCancelSwap:
    """Tests for POST /swaps/items/{item_id}/cancel endpoint."""

    def test_cancel_swap_success(
        self, client, mock_user2, mock_item, mock_swap_request, mock_token
    ):
        """Test successfully canceling a swap request."""
        with patch(
            "routes.swap_routes.auth_service.get_user_id_from_request",
            return_value=mock_user2["id"],
        ):
            with patch(
                "routes.swap_routes.storage_service.get_item", return_value=mock_item
            ):
                with patch(
                    "routes.swap_routes.swap_service.get_requests_for_requester",
                    return_value=[mock_swap_request],
                ):
                    with patch(
                        "routes.swap_routes.swap_service.update_swap_request",
                        return_value=None,
                    ):
                        with patch(
                            "routes.swap_routes.swap_service.get_pending_requests_for_item",
                            return_value=[],
                        ):
                            with patch(
                                "routes.swap_routes.storage_service.upsert_item",
                                return_value=None,
                            ):
                                with patch(
                                    "routes.swap_routes.get_user_by_id",
                                    return_value=mock_user2,
                                ):
                                    with patch(
                                        "routes.swap_routes.notification_service.create_notification",
                                        return_value=None,
                                    ):
                                        response = client.post(
                                            f"/swaps/items/{mock_item['id']}/cancel",
                                            headers={
                                                "Authorization": f"Bearer {mock_token}"
                                            },
                                        )
                                        assert response.status_code == 200
                                        data = response.json()
                                        assert data["status"] == "cancelled"

    def test_cancel_swap_no_request(self, client, mock_user2, mock_item, mock_token):
        """Test canceling when no pending request exists."""
        with patch(
            "routes.swap_routes.auth_service.get_user_id_from_request",
            return_value=mock_user2["id"],
        ):
            with patch(
                "routes.swap_routes.storage_service.get_item", return_value=mock_item
            ):
                with patch(
                    "routes.swap_routes.swap_service.get_requests_for_requester",
                    return_value=[],
                ):
                    response = client.post(
                        f"/swaps/items/{mock_item['id']}/cancel",
                        headers={"Authorization": f"Bearer {mock_token}"},
                    )
                    assert response.status_code == 404
                    assert "No pending swap request found" in response.json()["detail"]


class TestGetSwapRequests:
    """Tests for GET /swaps/requests endpoint."""

    def test_get_swap_requests_success(
        self, client, mock_user, mock_swap_request, mock_token
    ):
        """Test getting swap requests for authenticated user."""
        with patch(
            "routes.swap_routes.auth_service.get_user_id_from_request",
            return_value=mock_user["id"],
        ):
            with patch(
                "routes.swap_routes.swap_service.get_pending_requests_for_owner",
                return_value=[mock_swap_request],
            ):
                with patch(
                    "routes.swap_routes.swap_service.get_requests_for_requester",
                    return_value=[],
                ):
                    with patch(
                        "routes.swap_routes.storage_service.get_item",
                        return_value={"id": "item123", "title": "Test Item"},
                    ):
                        with patch(
                            "routes.swap_routes.get_user_by_id",
                            return_value={"id": "user456", "username": "testuser2"},
                        ):
                            response = client.get(
                                "/swaps/requests",
                                headers={"Authorization": f"Bearer {mock_token}"},
                            )
                            assert response.status_code == 200
                            data = response.json()
                            assert "as_owner" in data
                            assert "as_requester" in data

    def test_get_swap_requests_no_auth(self, client):
        """Test getting swap requests without authentication."""
        response = client.get("/swaps/requests")
        assert response.status_code == 401


class TestGetSwapHistory:
    """Tests for GET /swaps/history endpoint."""

    def test_get_swap_history_success(
        self, client, mock_user, mock_swap_request, mock_token
    ):
        """Test getting swap history for authenticated user."""
        approved_swap = {**mock_swap_request, "status": "approved"}
        with patch(
            "routes.swap_routes.auth_service.get_user_id_from_request",
            return_value=mock_user["id"],
        ):
            with patch(
                "routes.swap_routes.swap_service.get_approved_swaps_for_user",
                return_value=[approved_swap],
            ):
                with patch(
                    "routes.swap_routes.storage_service.get_item",
                    return_value={
                        "id": "item123",
                        "title": "Test Item",
                        "owner_id": "user123",
                    },
                ):
                    with patch(
                        "routes.swap_routes.get_user_by_id",
                        return_value={"id": "user456", "username": "testuser2"},
                    ):
                        response = client.get(
                            "/swaps/history",
                            headers={"Authorization": f"Bearer {mock_token}"},
                        )
                        assert response.status_code == 200
                        data = response.json()
                        assert isinstance(data, list)

    def test_get_swap_history_no_auth(self, client):
        """Test getting swap history without authentication."""
        response = client.get("/swaps/history")
        assert response.status_code == 401
