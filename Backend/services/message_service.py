"""Message service implementation"""

import json
from pathlib import Path
from typing import List, Dict, Any, Optional
import threading
import uuid
from datetime import datetime

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
MESSAGES_FILE = DATA_DIR / "messages.json"

_lock = threading.Lock()


def _load_messages() -> List[Dict[str, Any]]:
    """Load messages from JSON file"""
    if not MESSAGES_FILE.exists():
        return []
    with MESSAGES_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)


def _save_messages(messages: List[Dict[str, Any]]):
    """Save messages to JSON file"""
    with MESSAGES_FILE.open("w", encoding="utf-8") as f:
        json.dump(messages, f, ensure_ascii=False, indent=2)


def create_message(sender_id: str, recipient_id: str, content: str) -> Dict[str, Any]:
    """Create a new message and save it"""
    from Backend.services.user_service import get_user_by_id

    # Verify both users exist
    sender = get_user_by_id(sender_id)
    recipient = get_user_by_id(recipient_id)

    if not sender:
        raise ValueError(f"Sender user {sender_id} not found")
    if not recipient:
        raise ValueError(f"Recipient user {recipient_id} not found")

    message = {
        "id": uuid.uuid4().hex,
        "sender_id": sender_id,
        "recipient_id": recipient_id,
        "content": content,
        "sent_at": datetime.now().isoformat(),
        "read": False,
    }

    with _lock:
        messages = _load_messages()
        messages.append(message)
        _save_messages(messages)

    return message


def get_message_by_id(message_id: str) -> Optional[Dict[str, Any]]:
    """Get a message by its ID"""
    messages = _load_messages()
    for message in messages:
        if message.get("id") == message_id:
            return message
    return None


def get_user_messages(user_id: str) -> List[Dict[str, Any]]:
    """Get all messages for a user (both sent and received)"""
    messages = _load_messages()
    user_messages = [
        msg
        for msg in messages
        if msg.get("sender_id") == user_id or msg.get("recipient_id") == user_id
    ]

    # Sort by sent date, newest first
    user_messages.sort(key=lambda x: x.get("sent_at", ""), reverse=True)

    return user_messages


def get_conversation(user1_id: str, user2_id: str) -> List[Dict[str, Any]]:
    """Get conversation between two users"""
    messages = _load_messages()
    conversation = [
        msg
        for msg in messages
        if (msg.get("sender_id") == user1_id and msg.get("recipient_id") == user2_id)
        or (msg.get("sender_id") == user2_id and msg.get("recipient_id") == user1_id)
    ]

    # Sort by sent date, oldest first (for chronological order)
    conversation.sort(key=lambda x: x.get("sent_at", ""))

    return conversation


def get_user_conversations(user_id: str) -> List[Dict[str, Any]]:
    """Get list of users that the user has conversations with"""
    messages = _load_messages()
    user_messages = [
        msg
        for msg in messages
        if msg.get("sender_id") == user_id or msg.get("recipient_id") == user_id
    ]

    # Extract unique user IDs from conversations
    conversation_partners = set()
    for msg in user_messages:
        if msg.get("sender_id") == user_id:
            conversation_partners.add(msg.get("recipient_id"))
        else:
            conversation_partners.add(msg.get("sender_id"))

    # Get user details for each conversation partner
    from Backend.services.user_service import get_user_by_id

    conversations = []
    for partner_id in conversation_partners:
        partner = get_user_by_id(partner_id)
        if partner:
            # Get last message in conversation
            conversation_msgs = get_conversation(user_id, partner_id)
            last_message = conversation_msgs[-1] if conversation_msgs else None

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
                    "unread_count": len(
                        [
                            m
                            for m in conversation_msgs
                            if not m.get("read") and m.get("recipient_id") == user_id
                        ]
                    ),
                }
            )

    # Sort by last message time, newest first
    conversations.sort(key=lambda x: x.get("last_message_time") or "", reverse=True)

    return conversations


def mark_message_as_read(message_id: str, user_id: str) -> bool:
    """Mark a message as read by the recipient"""
    with _lock:
        messages = _load_messages()
        for i, msg in enumerate(messages):
            if msg.get("id") == message_id and msg.get("recipient_id") == user_id:
                messages[i]["read"] = True
                _save_messages(messages)
                return True
        return False
