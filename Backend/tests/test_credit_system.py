"""Tests for credit system with refunds & request limits."""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

from main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def mock_user():
    return {
        "id": "user_1",
        "email": "user1@example.com",
        "username": "user1",
        "full_name": "User One",
        "credits": 10.0,
        "password_hash": "hashed",
        "salt": "salt",
        "email_verified": True,
    }


@pytest.fixture
def mock_user2():
    return {
        "id": "user_2",
        "email": "user2@example.com",
        "username": "user2",
        "full_name": "User Two",
        "credits": 5.0,
        "password_hash": "hashed",
        "salt": "salt",
        "email_verified": True,
    }


@pytest.fixture
def mock_item():
    return {
        "id": "item_1",
        "title": "Test Item",
        "description": "A test item",
        "owner_id": "user_1",
        "status": "available",
        "credits": 1.0,
        "images": [],
        "category": "clothing",
    }


@pytest.fixture
def mock_token():
    return "user_1|test_signature"


@pytest.fixture
def mock_swap_request():
    return {
        "id": "request_1",
        "item_id": "item_1",
        "requester_id": "user_2",
        "credits_required": 1.0,
        "status": "pending",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00",
    }


class TestCreditDeductionOnRequest:
    """Tests for credit deduction when swap request is created."""

    def test_request_swap_deducts_credits(
        self,
        client,
        mock_user2,
        mock_item,
        mock_swap_request,
        mock_token,
    ):
        """Test that credits are deducted when swap request created."""
        with patch(
            "routes.swap_routes.auth_service.get_user_id_from_request",
            return_value=mock_user2["id"],
        ):
            with patch(
                "routes.swap_routes.storage_service.get_item",
                return_value=mock_item,
            ):
                with patch(
                    "routes.swap_routes.get_user_by_id",
                    return_value=mock_user2,
                ):
                    with patch(
                        "routes.swap_routes.swap_service" ".get_requests_for_requester",
                        return_value=[],
                    ):
                        with patch(
                            "routes.swap_routes.swap_service" ".create_swap_request",
                            return_value=mock_swap_request,
                        ):
                            with patch(
                                "routes.swap_routes" ".credit_service.deduct_credits",
                                return_value=4.0,
                            ):
                                with patch(
                                    "routes.swap_routes" ".storage_service.upsert_item",
                                    return_value=None,
                                ):
                                    with patch(
                                        "routes.swap_routes"
                                        ".notification_service"
                                        ".create_notification",
                                        return_value=None,
                                    ):
                                        item_id = mock_item["id"]
                                        response = client.post(
                                            f"/swaps/items/{item_id}" "/request",
                                            headers={
                                                "Authorization": f"Bearer {mock_token}"
                                            },
                                        )
                                        assert response.status_code == 200

    def test_insufficient_credits(
        self,
        client,
        mock_user2,
        mock_item,
        mock_token,
    ):
        """Test swap request fails with insufficient credits."""
        mock_user2["credits"] = 0.5
        with patch(
            "routes.swap_routes.auth_service.get_user_id_from_request",
            return_value=mock_user2["id"],
        ):
            with patch(
                "routes.swap_routes.storage_service.get_item",
                return_value=mock_item,
            ):
                with patch(
                    "routes.swap_routes.get_user_by_id",
                    return_value=mock_user2,
                ):
                    with patch(
                        "routes.swap_routes.swap_service" ".get_requests_for_requester",
                        return_value=[],
                    ):
                        response = client.post(
                            f"/swaps/items/{mock_item['id']}/request",
                            headers={"Authorization": f"Bearer {mock_token}"},
                        )
                        assert response.status_code == 402


class TestCreditRefundOnCancellation:
    """Tests for credit refund when swap request is cancelled."""

    def test_cancel_swap_refunds_credits(
        self,
        client,
        mock_user2,
        mock_item,
        mock_swap_request,
        mock_token,
    ):
        """Test cancelling swap request refunds credits."""
        pending_request = {**mock_swap_request, "status": "pending"}
        with patch(
            "routes.swap_routes.auth_service.get_user_id_from_request",
            return_value=mock_user2["id"],
        ):
            with patch(
                "routes.swap_routes.storage_service.get_item",
                return_value=mock_item,
            ):
                with patch(
                    "routes.swap_routes.swap_service" ".get_requests_for_requester",
                    return_value=[pending_request],
                ):
                    with patch(
                        "routes.swap_routes.swap_service" ".update_swap_request",
                        return_value=None,
                    ):
                        with patch(
                            "routes.swap_routes" ".credit_service.refund_credits",
                            return_value=6.0,
                        ):
                            with patch(
                                "routes.swap_routes.swap_service"
                                ".get_pending_requests_for_item",
                                return_value=[],
                            ):
                                with patch(
                                    "routes.swap_routes" ".storage_service.upsert_item",
                                    return_value=None,
                                ):
                                    with patch(
                                        "routes.swap_routes"
                                        ".notification_service"
                                        ".create_notification",
                                        return_value=None,
                                    ):
                                        with patch(
                                            "routes.swap_routes" ".get_user_by_id",
                                            return_value=mock_user2,
                                        ):
                                            item_id = mock_item["id"]
                                            response = client.post(
                                                f"/swaps/items/{item_id}" "/cancel",
                                                headers={
                                                    "Authorization": f"Bearer {mock_token}"
                                                },
                                            )
                                            assert response.status_code == 200


class TestCreditRefundOnRejection:
    """Tests for credit refund when swap request is rejected."""

    def test_reject_swap_refunds_credits(
        self,
        client,
        mock_user,
        mock_user2,
        mock_item,
        mock_swap_request,
        mock_token,
    ):
        """Test rejecting swap request refunds credits."""
        with patch(
            "routes.swap_routes.auth_service.get_user_id_from_request",
            return_value=mock_user["id"],
        ):
            with patch(
                "routes.swap_routes.storage_service.get_item",
                return_value=mock_item,
            ):
                with patch(
                    "routes.swap_routes.swap_service.get_swap_request",
                    return_value=mock_swap_request,
                ):
                    with patch(
                        "routes.swap_routes.swap_service" ".update_swap_request",
                        return_value=None,
                    ):
                        with patch(
                            "routes.swap_routes" ".credit_service.refund_credits",
                            return_value=6.0,
                        ):
                            with patch(
                                "routes.swap_routes.swap_service"
                                ".get_pending_requests_for_item",
                                return_value=[],
                            ):
                                with patch(
                                    "routes.swap_routes" ".storage_service.upsert_item",
                                    return_value=None,
                                ):
                                    with patch(
                                        "routes.swap_routes"
                                        ".notification_service"
                                        ".create_notification",
                                        return_value=None,
                                    ):
                                        with patch(
                                            "routes.swap_routes" ".get_user_by_id",
                                            return_value=mock_user,
                                        ):
                                            item_id = mock_item["id"]
                                            req_id = mock_swap_request["id"]
                                            response = client.post(
                                                f"/swaps/items/{item_id}"
                                                f"/requests/{req_id}"
                                                "/reject",
                                                headers={
                                                    "Authorization": f"Bearer {mock_token}"
                                                },
                                            )
                                            assert response.status_code == 200


class TestPendingRequestLimit:
    """Tests for limiting pending requests based on credits."""

    def test_pending_request_limit(
        self,
        client,
        mock_user2,
        mock_item,
        mock_swap_request,
        mock_token,
    ):
        """Test user cannot exceed pending request limit."""
        mock_user2["credits"] = 2.0
        mock_request_1 = {**mock_swap_request, "id": "request_1", "status": "pending"}
        mock_request_2 = {**mock_swap_request, "id": "request_2", "status": "pending"}
        with patch(
            "routes.swap_routes.auth_service.get_user_id_from_request",
            return_value=mock_user2["id"],
        ):
            with patch(
                "routes.swap_routes.storage_service.get_item",
                return_value=mock_item,
            ):
                with patch(
                    "routes.swap_routes.get_user_by_id",
                    return_value=mock_user2,
                ):
                    with patch(
                        "routes.swap_routes.swap_service" ".get_requests_for_requester",
                        return_value=[mock_request_1, mock_request_2],
                    ):
                        response = client.post(
                            f"/swaps/items/{mock_item['id']}" "/request",
                            headers={"Authorization": f"Bearer {mock_token}"},
                        )
                        assert response.status_code == 400


class TestCreditPrivacy:
    """Tests for hiding credit balance from other users."""

    def test_own_profile_shows_credits(
        self,
        client,
        mock_user,
        mock_token,
    ):
        """Test that user can see their own credit balance."""
        with patch(
            "routes.user_routes.get_authenticated_user_id",
            return_value=mock_user["id"],
        ):
            with patch(
                "routes.user_routes.user_service.get_user_by_id",
                return_value=mock_user,
            ):
                with patch(
                    "services.rating_service.get_user_rating_stats"
                ) as mock_rating:
                    mock_rating.return_value = {
                        "average_rating": 5.0,
                        "total_ratings": 10,
                    }
                    response = client.get(
                        f"/users/{mock_user['id']}",
                        headers={"Authorization": f"Bearer {mock_token}"},
                    )
                    assert response.status_code == 200
                    data = response.json()
                    assert data["credits"] == 10.0

    def test_other_profile_hides_credits(
        self,
        client,
        mock_user,
        mock_user2,
        mock_token,
    ):
        """Test that user cannot see other users' credits."""
        with patch(
            "routes.user_routes.get_authenticated_user_id",
            return_value=mock_user["id"],
        ):
            with patch(
                "routes.user_routes.user_service.get_user_by_id",
                return_value=mock_user2,
            ):
                with patch(
                    "services.rating_service.get_user_rating_stats"
                ) as mock_rating:
                    mock_rating.return_value = {
                        "average_rating": 4.0,
                        "total_ratings": 5,
                    }
                    response = client.get(
                        f"/users/{mock_user2['id']}",
                        headers={"Authorization": f"Bearer {mock_token}"},
                    )
                    assert response.status_code == 200
                    data = response.json()
                    assert data["credits"] == 0.0  # Hidden
