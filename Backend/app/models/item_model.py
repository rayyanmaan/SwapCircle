"""Item model stubs
"""
from pydantic import BaseModel
from typing import Optional


class ItemCreate(BaseModel):
    title: str
    description: Optional[str]


class ItemOut(ItemCreate):
    id: str
    owner_id: str
