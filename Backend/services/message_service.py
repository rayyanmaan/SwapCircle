"""Message service implementation using MongoDB.

Stores messages in MongoDB `messages` collection with support for async operations.
"""
from typing import List, Dict, Any, Optional
from bson import ObjectId
from datetime import datetime
from database.connection import get_db


def _convert_id(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Convert MongoDB _id to id for API compatibility."""
    if doc is None:
        return None
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc


async def create_message(sender_id: str, recipient_id: str, content: str) -> Dict[str, Any]:
    """Create a new message and save it."""
    from services.user_service import get_user_by_id

    # Verify both users exist
    sender = await get_user_by_id(sender_id)
    recipient = await get_user_by_id(recipient_id)

    if not sender:
        raise ValueError(f"Sender user {sender_id} not found")
    if not recipient:
        raise ValueError(f"Recipient user {recipient_id} not found")

    db = get_db()
    messages_collection = db["messages"]
    
    message = {
        "sender_id": sender_id,
        "recipient_id": recipient_id,
        "content": content,
        "sent_at": datetime.now().isoformat(),
        "read": False,
    }
    
    result = await messages_collection.insert_one(message)
    message["_id"] = result.inserted_id
    return _convert_id(message)


async def get_message_by_id(message_id: str) -> Optional[Dict[str, Any]]:
    """Get a message by its ID."""
    db = get_db()
    messages_collection = db["messages"]
    try:
        message = await messages_collection.find_one({"_id": ObjectId(message_id)})
    except Exception:
        # If ObjectId conversion fails, try with string id
        message = await messages_collection.find_one({"id": message_id})
    return _convert_id(message)


async def get_user_messages(user_id: str) -> List[Dict[str, Any]]:
    """Get all messages for a user (both sent and received)."""
    db = get_db()
    messages_collection = db["messages"]
    cursor = messages_collection.find({
        "$or": [
            {"sender_id": user_id},
            {"recipient_id": user_id}
        ]
    }).sort("sent_at", -1)
    messages = await cursor.to_list(length=None)
    return [_convert_id(msg) for msg in messages]


async def get_conversation(user1_id: str, user2_id: str) -> List[Dict[str, Any]]:
    """Get conversation between two users."""
    db = get_db()
    messages_collection = db["messages"]
    cursor = messages_collection.find({
        "$or": [
            {"sender_id": user1_id, "recipient_id": user2_id},
            {"sender_id": user2_id, "recipient_id": user1_id}
        ]
    }).sort("sent_at", 1)  # Oldest first for chronological order
    messages = await cursor.to_list(length=None)
    return [_convert_id(msg) for msg in messages]


async def get_user_conversations(user_id: str) -> List[Dict[str, Any]]:
    """Get list of users that the user has conversations with."""
    db = get_db()
    messages_collection = db["messages"]
    
    # Get all messages involving this user
    cursor = messages_collection.find({
        "$or": [
            {"sender_id": user_id},
            {"recipient_id": user_id}
        ]
    })
    user_messages = await cursor.to_list(length=None)

    # Extract unique user IDs from conversations
    conversation_partners = set()
    for msg in user_messages:
        if msg.get("sender_id") == user_id:
            conversation_partners.add(msg.get("recipient_id"))
        else:
            conversation_partners.add(msg.get("sender_id"))

    # Get user details for each conversation partner
    from services.user_service import get_user_by_id

    conversations = []
    for partner_id in conversation_partners:
        partner = await get_user_by_id(partner_id)
        if partner:
            # Get last message in conversation
            conversation_msgs = await get_conversation(user_id, partner_id)
            last_message = conversation_msgs[-1] if conversation_msgs else None

            # Count unread messages
            unread_count = sum(
                1 for m in conversation_msgs
                if not m.get("read") and m.get("recipient_id") == user_id
            )

            conversations.append(
                {
                    "user_id": partner_id,
                    "username": partner.get("username"),
                    "full_name": partner.get("full_name"),
                    "last_message": (
                        last_message.get("content") if last_message else None
                    ),
                    "last_message_time": (
                        last_message.get("sent_at") if last_message else None
                    ),
                    "unread_count": unread_count,
                }
            )

    # Sort by last message time, newest first
    conversations.sort(key=lambda x: x.get("last_message_time") or "", reverse=True)

    return conversations


async def mark_message_as_read(message_id: str, user_id: str) -> bool:
    """Mark a message as read by the recipient."""
    db = get_db()
    messages_collection = db["messages"]
    
    try:
        result = await messages_collection.update_one(
            {
                "_id": ObjectId(message_id),
                "recipient_id": user_id
            },
            {"$set": {"read": True}}
        )
        return result.matched_count > 0
    except Exception:
        # If ObjectId conversion fails, try with string id
        result = await messages_collection.update_one(
            {
                "id": message_id,
                "recipient_id": user_id
            },
            {"$set": {"read": True}}
        )
        return result.matched_count > 0
