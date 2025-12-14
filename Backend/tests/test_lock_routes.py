"""Unit tests for lock/unlock item routes."""

import pytest
from unittest.mock import AsyncMock, patch
from fastapi import Request

from services import auth_service, storage_service
from routes import item_routes


@pytest.mark.asyncio
async def test_lock_item_sets_locked_until_and_locked_by():
    mock_item = {"id": "item123", "status": "available", "owner_id": "owner1"}

    with patch.object(auth_service, "get_user_id_from_request", return_value="locker1"):
        with patch.object(
            storage_service, "get_item", new_callable=AsyncMock
        ) as mock_get:
            with patch.object(
                storage_service, "upsert_item", new_callable=AsyncMock
            ) as mock_upsert:
                mock_get.return_value = mock_item.copy()

                # Call lock_item (pass a simple mock request since auth is patched)
                mock_request = type("R", (), {})()
                result = await item_routes.lock_item("item123", mock_request)

                assert result.get("status") == "locked"
                # Ensure upsert called with locked_until and locked_by set
                assert mock_upsert.called
                upserted = mock_upsert.call_args[0][0]
                assert upserted["status"] == "locked"
                assert upserted.get("locked_by") == "locker1"
                assert "locked_until" in upserted


@pytest.mark.asyncio
async def test_unlock_clears_locked_metadata():
    mock_item = {
        "id": "item123",
        "status": "locked",
        "owner_id": "owner1",
        "locked_by": "locker1",
        "locked_until": "2025-01-01T00:00:00",
    }

    with patch.object(auth_service, "get_user_id_from_request", return_value="owner1"):
        with patch.object(
            storage_service, "get_item", new_callable=AsyncMock
        ) as mock_get:
            with patch.object(
                storage_service, "upsert_item", new_callable=AsyncMock
            ) as mock_upsert:
                mock_get.return_value = mock_item.copy()

                mock_request = type("R", (), {})()
                result = await item_routes.unlock_item("item123", mock_request)

                assert result.get("status") == "available"
                assert mock_upsert.called
                upserted = mock_upsert.call_args[0][0]
                assert upserted["status"] == "available"
                assert "locked_until" not in upserted
                assert "locked_by" not in upserted
