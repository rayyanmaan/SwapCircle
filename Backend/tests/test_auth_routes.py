"""Tests for authorization checks on swap-related routes"""

import pytest
from fastapi import HTTPException
from unittest.mock import patch, AsyncMock

from routes import item_routes


def make_request_with_auth(header_value=None):
    class R:
        def __init__(self, h):
            self.headers = {"authorization": h} if h else {}

    return R(header_value)


def test_get_swap_requests_requires_auth():
    # No header
    import asyncio

    with pytest.raises(HTTPException) as exc:
        asyncio.get_event_loop().run_until_complete(
            item_routes.get_swap_requests(make_request_with_auth(None))
        )
    assert exc.value.status_code == 401


def test_get_swap_requests_invalid_token_structure():
    # malformed header
    import asyncio

    with pytest.raises(HTTPException) as exc:
        asyncio.get_event_loop().run_until_complete(
            item_routes.get_swap_requests(make_request_with_auth("Bearer badtoken"))
        )
    assert exc.value.status_code == 401


@pytest.mark.asyncio
async def test_get_swap_requests_happy_path(monkeypatch):
    # Valid token and auth verification
    req = make_request_with_auth("Bearer user1|tok")

    # Patch auth verification to bypass token signature checks for test
    with patch("services.auth_service.verify_access_token", return_value=True):
        with patch.object(item_routes, "swap_service") as mock_swap:
            mock_swap.get_pending_requests_for_owner = AsyncMock(return_value=[])
            mock_swap.get_requests_for_requester = AsyncMock(return_value=[])
            # Since there are no requests, get_user_by_id won't be called, so this is safe
            res = await item_routes.get_swap_requests(req)
            assert "as_owner" in res and "as_requester" in res


def test_get_swap_history_requires_auth():
    import asyncio

    with pytest.raises(HTTPException) as exc:
        asyncio.get_event_loop().run_until_complete(
            item_routes.get_swap_history(make_request_with_auth(None))
        )
    assert exc.value.status_code == 401


def test_get_swap_history_invalid_token_structure():
    import asyncio

    with pytest.raises(HTTPException) as exc:
        asyncio.get_event_loop().run_until_complete(
            item_routes.get_swap_history(make_request_with_auth("Bearer badtoken"))
        )
    assert exc.value.status_code == 401
