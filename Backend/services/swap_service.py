"""Swap request service for managing swap requests and approvals using MongoDB.

Stores swap requests in MongoDB `swap_requests` collection with support for async operations.
"""

from typing import Dict, Any, List, Optional
from bson import ObjectId
from datetime import datetime
from database.connection import get_db


def _get_db_optional():
    """Return database handle or None if not connected."""
    try:
        return get_db()
    except RuntimeError:
        return None


def _convert_id(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Convert MongoDB _id to id for API compatibility."""
    if doc is None:
        return None
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc


async def create_swap_request(
    item_id: str, requester_id: str, credits_required: float
) -> Dict[str, Any]:
    """Create a new swap request."""
    db = get_db()
    swap_requests_collection = db["swap_requests"]

    request = {
        "item_id": item_id,
        "requester_id": requester_id,
        "credits_required": credits_required,
        "status": "pending",  # pending, approved, rejected, cancelled
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }

    result = await swap_requests_collection.insert_one(request)
    request["_id"] = result.inserted_id
    return _convert_id(request)


async def get_swap_request(request_id: str) -> Optional[Dict[str, Any]]:
    """Get a swap request by ID."""
    db = get_db()
    swap_requests_collection = db["swap_requests"]
    try:
        request = await swap_requests_collection.find_one({"_id": ObjectId(request_id)})
    except Exception:
        # If ObjectId conversion fails, try with string id
        request = await swap_requests_collection.find_one({"id": request_id})
    return _convert_id(request)


async def get_pending_requests_for_item(item_id: str) -> List[Dict[str, Any]]:
    """Get all pending swap requests for an item."""
    db = get_db()
    swap_requests_collection = db["swap_requests"]
    cursor = swap_requests_collection.find({"item_id": item_id, "status": "pending"})
    requests = await cursor.to_list(length=None)
    return [_convert_id(req) for req in requests]


async def get_pending_requests_for_owner(owner_id: str) -> List[Dict[str, Any]]:
    """Get all pending swap requests for items owned by a user."""
    from services.storage_service import get_item

    db = get_db()
    swap_requests_collection = db["swap_requests"]
    cursor = swap_requests_collection.find({"status": "pending"})
    all_pending = await cursor.to_list(length=None)

    owner_requests = []
    for req in all_pending:
        item = await get_item(req.get("item_id"))
        if item and item.get("owner_id") == owner_id:
            owner_requests.append(_convert_id(req))

    return owner_requests


async def get_requests_for_requester(requester_id: str) -> List[Dict[str, Any]]:
    """Get all swap requests made by a user (includes all statuses)."""
    db = _get_db_optional()
    if db is None:
        return []

    swap_requests_collection = db["swap_requests"]
    cursor = swap_requests_collection.find({"requester_id": requester_id})
    requests = await cursor.to_list(length=None)
    return [_convert_id(req) for req in requests]


async def get_pending_requests_count_for_user(requester_id: str) -> int:
    """Count pending requests for a user (test-friendly helper)."""
    db = _get_db_optional()
    if db is None:
        return 0

    swap_requests_collection = db["swap_requests"]
    try:
        return await swap_requests_collection.count_documents(
            {"requester_id": requester_id, "status": "pending"}
        )
    except Exception:
        # Fallback if count_documents unavailable (e.g., mocked collections)
        cursor = swap_requests_collection.find(
            {"requester_id": requester_id, "status": "pending"}
        )
        requests = await cursor.to_list(length=None)
        return len(requests)


async def get_approved_swaps_for_user(user_id: str) -> List[Dict[str, Any]]:
    """Get all approved swap requests where user is either owner or requester."""
    from services.storage_service import get_item

    db = get_db()
    swap_requests_collection = db["swap_requests"]
    cursor = swap_requests_collection.find({"status": "approved"})
    approved_swaps_list = await cursor.to_list(length=None)

    approved_swaps = []
    for req in approved_swaps_list:
        item = await get_item(req.get("item_id"))
        item_owner_id = item.get("owner_id") if item else None
        requester_id = req.get("requester_id")

        # Include if user is the owner or the requester
        if item_owner_id == user_id or requester_id == user_id:
            approved_swaps.append(_convert_id(req))

    return approved_swaps


async def update_swap_request(request_id: str, status: str) -> Optional[Dict[str, Any]]:
    """Update swap request status (approved, rejected, cancelled)."""
    db = get_db()
    swap_requests_collection = db["swap_requests"]

    update_data = {"status": status, "updated_at": datetime.now().isoformat()}

    try:
        result = await swap_requests_collection.update_one(
            {"_id": ObjectId(request_id)}, {"$set": update_data}
        )
        if result.matched_count == 0:
            return None
        # Fetch updated request
        request = await swap_requests_collection.find_one({"_id": ObjectId(request_id)})
        return _convert_id(request)
    except Exception:
        # If ObjectId conversion fails, try with string id
        result = await swap_requests_collection.update_one(
            {"id": request_id}, {"$set": update_data}
        )
        if result.matched_count == 0:
            return None
        request = await swap_requests_collection.find_one({"id": request_id})
        return _convert_id(request)


async def cancel_swap_request(request_id: str) -> Optional[Dict[str, Any]]:
    """Cancel a swap request by updating its status to 'cancelled'.

    This is a convenience function that calls update_swap_request with 'cancelled' status.
    """
    return await update_swap_request(request_id, "cancelled")


async def cancel_other_pending_requests(item_id: str, exclude_request_id: str = None):
    """Cancel all other pending requests for an item (when one is approved).

    This is used when a swap request is approved to automatically cancel any other
    pending requests for the same item.
    """
    db = get_db()
    swap_requests_collection = db["swap_requests"]

    query = {"item_id": item_id, "status": "pending"}
    if exclude_request_id:
        try:
            query["_id"] = {"$ne": ObjectId(exclude_request_id)}
        except Exception:
            query["id"] = {"$ne": exclude_request_id}

    update_data = {"status": "cancelled", "updated_at": datetime.now().isoformat()}

    await swap_requests_collection.update_many(query, {"$set": update_data})
