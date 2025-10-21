"""Message model stubs
"""
from pydantic import BaseModel
from typing import Optional


class MessageCreate(BaseModel):
    sender_id: str
    recipient_id: str
    content: str


class MessageOut(MessageCreate):
    id: str
    sent_at: Optional[str]
