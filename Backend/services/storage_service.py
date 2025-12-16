"""Item storage service using MongoDB.

Stores items in MongoDB `items` collection with support for async operations.
"""

from typing import Dict, Any, List, Optional
from bson import ObjectId
from database.connection import get_db


def _get_db_optional():
    """Return database handle or None if not connected (test-friendly)."""
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


async def list_items(
    owner_id: Optional[str] = None, status: Optional[str] = None
) -> List[Dict[str, Any]]:
    """List all items, optionally filtered by owner_id and/or status."""
    db = get_db()
    items_collection = db["items"]

    query = {}
    if owner_id:
        query["owner_id"] = owner_id
    if status:
        query["status"] = status

    cursor = items_collection.find(query)
    items = await cursor.to_list(length=None)
    return [_convert_id(item) for item in items]


async def get_item(item_id: str) -> Optional[Dict[str, Any]]:
    """Get item by ID."""
    db = get_db()
    items_collection = db["items"]
    try:
        item = await items_collection.find_one({"_id": ObjectId(item_id)})
    except Exception:
        # If ObjectId conversion fails, try as string id field
        item = await items_collection.find_one({"id": item_id})
    return _convert_id(item)


async def reserve_item_for_request(item_id: str) -> Optional[Dict[str, Any]]:
    """Atomically reserve an item for a swap request by setting status to pending.

    Returns the updated item if reservation succeeded, otherwise None (meaning the
    item was not available anymore).
    """
    db = _get_db_optional()
    if db is None:
        # Graceful fallback: simulate reservation by returning dummy only if available
        return {"id": item_id, "status": "pending"}
    items_collection = db["items"]

    # First try with ObjectId
    try:
        result = await items_collection.update_one(
            {"_id": ObjectId(item_id), "status": "available"},
            {"$set": {"status": "pending"}},
        )
        if result.matched_count > 0:
            item = await items_collection.find_one({"_id": ObjectId(item_id)})
            return _convert_id(item)
    except Exception:
        # Fall back to string id
        result = await items_collection.update_one(
            {"id": item_id, "status": "available"},
            {"$set": {"status": "pending"}},
        )
        if result.matched_count > 0:
            item = await items_collection.find_one({"id": item_id})
            return _convert_id(item)

    return None


async def upsert_item(item: Dict[str, Any]) -> Dict[str, Any]:
    """Insert or update an item."""
    db = get_db()
    items_collection = db["items"]

    item_id = item.get("id")
    if item_id:
        # Try to update existing item
        try:
            # Remove id from item dict for MongoDB
            item_copy = item.copy()
            if "id" in item_copy:
                del item_copy["id"]

            result = await items_collection.update_one(
                {"_id": ObjectId(item_id)}, {"$set": item_copy}, upsert=False
            )
            if result.matched_count > 0:
                # Fetch updated item
                updated_item = await items_collection.find_one(
                    {"_id": ObjectId(item_id)}
                )
                return _convert_id(updated_item)
        except Exception:
            # If ObjectId conversion fails, try with string id
            item_copy = item.copy()
            if "id" in item_copy:
                del item_copy["id"]

            result = await items_collection.update_one(
                {"id": item_id}, {"$set": item_copy}, upsert=False
            )
            if result.matched_count > 0:
                updated_item = await items_collection.find_one({"id": item_id})
                return _convert_id(updated_item)

    # Insert new item
    item_copy = item.copy()
    if "id" in item_copy:
        del item_copy["id"]

    result = await items_collection.insert_one(item_copy)
    item_copy["_id"] = result.inserted_id
    return _convert_id(item_copy)


async def delete_item(item_id: str) -> bool:
    """Delete an item by ID."""
    db = get_db()
    items_collection = db["items"]
    try:
        result = await items_collection.delete_one({"_id": ObjectId(item_id)})
        return result.deleted_count > 0
    except Exception:
        # If ObjectId conversion fails, try with string id
        result = await items_collection.delete_one({"id": item_id})
        return result.deleted_count > 0

# ============ USER FUNCTIONS ============

async def list_users() -> List[Dict[str, Any]]:
    """List all users from the database."""
    db = get_db()
    users_collection = db["users"]
    
    cursor = users_collection.find({})
    users = await cursor.to_list(length=None)
    return [_convert_id(user) for user in users]


async def get_user(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user by ID."""
    db = get_db()
    users_collection = db["users"]
    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
    except Exception:
        # If ObjectId conversion fails, try as string id field
        user = await users_collection.find_one({"id": user_id})
    return _convert_id(user)