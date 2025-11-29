"""Message models"""

from pydantic import BaseModel
from typing import Optional


class MessageCreate(BaseModel):
    sender_id: str
    recipient_id: str
    content: str


class MessageOut(BaseModel):
    id: str
    sender_id: str
    recipient_id: str
    content: str
    sent_at: str
    read: bool


class ConversationPartner(BaseModel):
    user_id: str
    username: str
    full_name: Optional[str]
    last_message: Optional[str]
    last_message_time: Optional[str]
    unread_count: int
