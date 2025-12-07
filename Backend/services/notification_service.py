"""Notification service for managing user notifications in MongoDB.

This service creates, retrieves, and manages notification records stored in the database.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from bson import ObjectId
from database.connection import get_db
from services.storage_service import get_item
from services.user_service import get_user_by_id


def _convert_id(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Convert MongoDB _id to id for API compatibility."""
    if doc is None:
        return None
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc


async def create_notification(
    user_id: str,
    event_type: str,
    request_id: str,
    item_id: str,
    message: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Create a new notification record.
    
    Args:
        user_id: The user who should receive this notification
        event_type: Type of event ("new_request", "approved", "rejected")
        request_id: The swap request ID associated with this notification
        item_id: The item ID associated with this notification
        message: Optional custom message (will be generated if not provided)
        metadata: Optional additional metadata (item_title, other_user_id, etc.)
    
    Returns:
        The created notification document
    """
    db = get_db()
    notifications_collection = db["notifications"]
    
    # Generate message if not provided
    if not message:
        item = await get_item(item_id)
        item_title = item.get("title", "Unknown Item") if item else "Unknown Item"
        
        if event_type == "new_request":
            requester = await get_user_by_id(metadata.get("other_user_id") if metadata else None)
            requester_name = requester.get("username", "Someone") if requester else "Someone"
            message = f'New swap request for "{item_title}" from {requester_name}'
        elif event_type == "approved":
            message = f'Your swap request for "{item_title}" was approved!'
        elif event_type == "rejected":
            message = f'Your swap request for "{item_title}" was rejected'
        else:
            message = f"Swap event: {event_type}"
    
    notification = {
        "user_id": user_id,
        "event_type": event_type,
        "request_id": request_id,
        "item_id": item_id,
        "message": message,
        "read": False,
        "created_at": datetime.now().isoformat(),
        **(metadata or {})
    }
    
    result = await notifications_collection.insert_one(notification)
    notification["_id"] = result.inserted_id
    return _convert_id(notification)


async def get_user_notifications(
    user_id: str,
    limit: int = 50,
    unread_only: bool = False
) -> List[Dict[str, Any]]:
    """Get notifications for a user.
    
    Args:
        user_id: The user ID to get notifications for
        limit: Maximum number of notifications to return (default: 50)
        unread_only: If True, only return unread notifications
    
    Returns:
        List of notification documents, sorted by created_at (newest first)
    """
    db = get_db()
    notifications_collection = db["notifications"]
    
    query = {"user_id": user_id}
    if unread_only:
        query["read"] = False
    
    cursor = notifications_collection.find(query).sort("created_at", -1).limit(limit)
    notifications = await cursor.to_list(length=limit)
    
    return [_convert_id(n) for n in notifications]


async def get_unread_count(user_id: str) -> int:
    """Get the count of unread notifications for a user."""
    db = get_db()
    notifications_collection = db["notifications"]
    
    count = await notifications_collection.count_documents({
        "user_id": user_id,
        "read": False
    })
    
    return count


async def mark_notification_as_read(notification_id: str, user_id: str) -> bool:
    """Mark a specific notification as read.
    
    Args:
        notification_id: The notification ID to mark as read
        user_id: The user ID (for security - ensures user can only mark their own notifications)
    
    Returns:
        True if the notification was found and updated, False otherwise
    """
    db = get_db()
    notifications_collection = db["notifications"]
    
    try:
        result = await notifications_collection.update_one(
            {
                "_id": ObjectId(notification_id),
                "user_id": user_id  # Security: ensure user can only mark their own notifications
            },
            {"$set": {"read": True, "read_at": datetime.now().isoformat()}}
        )
        return result.matched_count > 0
    except Exception:
        # If ObjectId conversion fails, try with string id
        result = await notifications_collection.update_one(
            {
                "id": notification_id,
                "user_id": user_id
            },
            {"$set": {"read": True, "read_at": datetime.now().isoformat()}}
        )
        return result.matched_count > 0


async def mark_all_as_read(user_id: str) -> int:
    """Mark all notifications as read for a user.
    
    Args:
        user_id: The user ID
    
    Returns:
        Number of notifications marked as read
    """
    db = get_db()
    notifications_collection = db["notifications"]
    
    result = await notifications_collection.update_many(
        {"user_id": user_id, "read": False},
        {"$set": {"read": True, "read_at": datetime.now().isoformat()}}
    )
    
    return result.modified_count


async def delete_notification(notification_id: str, user_id: str) -> bool:
    """Delete a notification.
    
    Args:
        notification_id: The notification ID to delete
        user_id: The user ID (for security)
    
    Returns:
        True if the notification was found and deleted, False otherwise
    """
    db = get_db()
    notifications_collection = db["notifications"]
    
    try:
        result = await notifications_collection.delete_one({
            "_id": ObjectId(notification_id),
            "user_id": user_id
        })
        return result.deleted_count > 0
    except Exception:
        result = await notifications_collection.delete_one({
            "id": notification_id,
            "user_id": user_id
        })
        return result.deleted_count > 0


# Legacy function for backward compatibility - now creates notifications from swap events
async def get_recent_swap_events(user_id: str, since_minutes: int = 5) -> List[Dict[str, Any]]:
    """Get recent swap events for a user (legacy function).
    
    This function is kept for backward compatibility but now returns
    notifications from the database instead of querying swap_requests directly.
    
    Args:
        user_id: The ID of the user to get events for
        since_minutes: How many minutes back to look (default: 5)
    
    Returns:
        List of event dictionaries compatible with the old format
    """
    from datetime import timedelta
    
    # Get notifications from the last since_minutes
    cutoff_time = datetime.now() - timedelta(minutes=since_minutes)
    cutoff_iso = cutoff_time.isoformat()
    
    db = get_db()
    notifications_collection = db["notifications"]
    
    cursor = notifications_collection.find({
        "user_id": user_id,
        "created_at": {"$gte": cutoff_iso}
    }).sort("created_at", -1)
    
    notifications = await cursor.to_list(length=None)
    
    # Convert to legacy format for backward compatibility
    events = []
    for notif in notifications:
        notif = _convert_id(notif)
        events.append({
            "event_type": notif.get("event_type"),
            "request_id": notif.get("request_id"),
            "item_id": notif.get("item_id"),
            "item_title": notif.get("item_title", "Unknown Item"),
            "timestamp": notif.get("created_at"),
            "status": notif.get("status"),
            "other_user_id": notif.get("other_user_id"),
            "other_user_name": notif.get("other_user_name", "Unknown User"),
            "read": notif.get("read", False),
            "notification_id": notif.get("id"),  # Add notification ID
        })
    
    return events
