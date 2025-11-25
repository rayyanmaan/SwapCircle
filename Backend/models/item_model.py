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


class ItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class ItemOut(ItemCreate):
    id: str
    owner_id: Optional[str] = None
    status: str = "available"
    images: List[ImageOut] = []
