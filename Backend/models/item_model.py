"""Pydantic models for items.
"""
from pydantic import BaseModel
from typing import Optional, List


class ImageOut(BaseModel):
    id: str
    url: str


class ItemCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    size: Optional[str] = None
    location: Optional[str] = None
    condition: Optional[str] = None
    branded: Optional[str] = "No"
    credits: Optional[float] = 1.0


class ItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    size: Optional[str] = None
    location: Optional[str] = None
    condition: Optional[str] = None
    branded: Optional[str] = None
    credits: Optional[float] = None
    status: Optional[str] = None


class ItemOut(ItemCreate):
    id: str
    owner_id: Optional[str] = None
    status: str = "available"
    images: List[ImageOut] = []
