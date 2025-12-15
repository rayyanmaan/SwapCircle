"""User storage service using MongoDB.

Stores users in MongoDB `users` collection with support for async operations.
"""

from typing import Dict, Any, List, Optional
from bson import ObjectId
from bson.errors import InvalidId
from pymongo import ReturnDocument
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


async def list_users() -> List[Dict[str, Any]]:
    """List all users."""
    db = get_db()
    users_collection = db["users"]
    cursor = users_collection.find({})
    users = await cursor.to_list(length=None)
    return [_convert_id(user) for user in users]


async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user by email address."""
    db = get_db()
    users_collection = db["users"]
    user = await users_collection.find_one({"email": email})
    return _convert_id(user)


async def get_user_by_id(user_id: str, session=None) -> Optional[Dict[str, Any]]:
    """Get user by ID.

    Args:
        user_id: The user ID to look up
        session: Optional MongoDB session for transactions
    """
    db = _get_db_optional()
    if db is None:
        return None
    users_collection = db["users"]
    try:
        user = await users_collection.find_one(
            {"_id": ObjectId(user_id)}, session=session
        )
    except Exception:
        # If ObjectId conversion fails, try as string
        user = await users_collection.find_one({"id": user_id}, session=session)
    return _convert_id(user)


async def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    """Get user by username."""
    db = get_db()
    users_collection = db["users"]
    user = await users_collection.find_one({"username": username})
    return _convert_id(user)


async def create_user(
    email: str, username: str, full_name: str, salt: str, password_hash: str
) -> Dict[str, Any]:
    """Create a new user."""
    db = get_db()
    users_collection = db["users"]
    user = {
        "email": email,
        "username": username,
        "full_name": full_name,
        "credits": 0.0,
        "email_verified": False,
        "salt": salt,
        "password_hash": password_hash,
    }
    result = await users_collection.insert_one(user)
    user["_id"] = result.inserted_id
    return _convert_id(user)


async def update_user(
    user_id: str, updates: Dict[str, Any], session=None
) -> Optional[Dict[str, Any]]:
    """Update fields on a user. Returns the updated user or None if not found.

    Only a whitelist of fields are updated to avoid accidental modification of
    authentication fields (`salt`, `password_hash`).

    Args:
        user_id: The user ID to update
        updates: Dictionary of fields to update
        session: Optional MongoDB session for transactions
    """
    from motor.motor_asyncio import AsyncIOMotorClientSession

    allowed = {
        "username",
        "full_name",
        "bio",
        "credits",
        "email_verified",
        "profile_pic",
        "instagram_handle",
        "whatsapp_number",
        "facebook_url",
        "twitter_handle",
        "linkedin_url",
    }
    # filter updates to allowed keys
    filtered = {k: v for k, v in updates.items() if k in allowed}
    if not filtered:
        return None

    db = get_db()
    users_collection = db["users"]
    try:
        # Try with ObjectId first
        user_oid = ObjectId(user_id)
        result = await users_collection.update_one(
            {"_id": user_oid}, {"$set": filtered}, session=session
        )
        if result.matched_count == 0:
            return None
        # Fetch updated user
        user = await users_collection.find_one({"_id": user_oid}, session=session)
        return _convert_id(user)
    except Exception:
        # If ObjectId conversion fails, try as string
        result = await users_collection.update_one(
            {"id": user_id}, {"$set": filtered}, session=session
        )
        if result.matched_count == 0:
            return None
        user = await users_collection.find_one({"id": user_id}, session=session)
        return _convert_id(user)


async def add_favorite(user_id: str, item_id: str) -> Optional[Dict[str, Any]]:
    """Add an item to user's favorites. Uses $addToSet to prevent duplicates."""
    db = get_db()
    users_collection = db["users"]
    try:
        user_oid = ObjectId(user_id)
        result = await users_collection.find_one_and_update(
            {"_id": user_oid},
            {"$addToSet": {"favorites": item_id}},
            return_document=ReturnDocument.AFTER,
        )
        return _convert_id(result)
    except InvalidId:
        # Fallback for string IDs
        result = await users_collection.find_one_and_update(
            {"id": user_id},
            {"$addToSet": {"favorites": item_id}},
            return_document=ReturnDocument.AFTER,
        )
        return _convert_id(result)


async def remove_favorite(user_id: str, item_id: str) -> Optional[Dict[str, Any]]:
    """Remove an item from user's favorites."""
    db = get_db()
    users_collection = db["users"]
    try:
        user_oid = ObjectId(user_id)
        result = await users_collection.find_one_and_update(
            {"_id": user_oid},
            {"$pull": {"favorites": item_id}},
            return_document=ReturnDocument.AFTER,
        )
        return _convert_id(result)
    except InvalidId:
        # Fallback for string IDs
        result = await users_collection.find_one_and_update(
            {"id": user_id},
            {"$pull": {"favorites": item_id}},
            return_document=ReturnDocument.AFTER,
        )
        return _convert_id(result)


async def get_user_favorites(user_id: str) -> List[str]:
    """Get list of item IDs that user has favorited."""
    db = get_db()
    users_collection = db["users"]
    try:
        user_oid = ObjectId(user_id)
        user = await users_collection.find_one({"_id": user_oid}, {"favorites": 1})
    except Exception:
        # Fallback for string IDs
        user = await users_collection.find_one({"id": user_id}, {"favorites": 1})

    return user.get("favorites", []) if user else []
