"""
Swap service integration tests.

Note: These tests require a database connection. They are integration tests
that test the swap_service directly. For unit tests of swap functionality,
see test_swap_routes_comprehensive.py which tests the API endpoints with mocked services.
"""
import pytest
from unittest.mock import patch, AsyncMock
from services import swap_service

# These are integration tests that require database setup
# Skip them if database is not available
pytestmark = pytest.mark.skip(reason="Integration tests require database connection. Use test_swap_routes_comprehensive.py for unit tests.")


@pytest.mark.asyncio
async def test_create_swap_request():
    """Integration test - requires database."""
    req = await swap_service.create_swap_request(
        item_id="item_test_1",
        requester_id="user_test_1",
        credits_required=1
    )

    assert req is not None
    assert req["item_id"] == "item_test_1"
    assert req["requester_id"] == "user_test_1"
    assert req["status"] == "pending"


@pytest.mark.asyncio
async def test_update_swap_request():
    """Integration test - requires database."""
    req = await swap_service.create_swap_request(
        item_id="item_test_2",
        requester_id="user_test_2",
        credits_required=2
    )

    updated = await swap_service.update_swap_request(req["id"], "cancelled")
    assert updated["status"] == "cancelled"


@pytest.mark.asyncio
async def test_get_requests_for_requester():
    """Integration test - requires database."""
    req = await swap_service.create_swap_request(
        item_id="item_test_3",
        requester_id="user_abc",
        credits_required=1
    )

    results = await swap_service.get_requests_for_requester("user_abc")
    assert any(r["id"] == req["id"] for r in results)
