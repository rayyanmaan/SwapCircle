"""Pydantic models for items (used by FastAPI routes)
"""
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Dict, Any
from enum import Enum


class ItemStatus(str, Enum):
    available = "available"
    locked = "locked"
    sold = "sold"


class ContactInfo(BaseModel):
    instagram: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None


class ItemCreate(BaseModel):
    title: str
    description: Optional[str] = None
    contact_info: Optional[ContactInfo] = None


class ItemUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    contact_info: Optional[ContactInfo]
    status: Optional[ItemStatus]


class ImageOut(BaseModel):
    id: str
    url: str


class ItemOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    owner_id: Optional[str]
    contact_info: Optional[ContactInfo]
    status: ItemStatus = Field(default=ItemStatus.available)
    images: List[ImageOut] = Field(default_factory=list)
