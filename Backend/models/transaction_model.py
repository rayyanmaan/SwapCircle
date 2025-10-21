"""Transaction model stubs
"""
from pydantic import BaseModel
from typing import Optional


class TransactionCreate(BaseModel):
    buyer_id: str
    seller_id: str
    item_id: str
    amount: float


class TransactionOut(TransactionCreate):
    id: str
    status: str
    created_at: Optional[str]
