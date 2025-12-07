"""Swap request models for managing swap requests between users."""

from pydantic import BaseModel
from typing import Optional
from enum import Enum
from datetime import datetime


class SwapRequestStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class SwapRequestCreate(BaseModel):
    item_id: str
    requester_id: str
    credits_required: float


class SwapRequestOut(BaseModel):
    id: str
    item_id: str
    requester_id: str
    credits_required: float
    status: SwapRequestStatus
    created_at: str
    updated_at: Optional[str] = None


class SwapRequestUpdate(BaseModel):
    status: SwapRequestStatus

