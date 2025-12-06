"""Transaction models"""

from pydantic import BaseModel
from typing import Optional
from enum import Enum


class TransactionType(str, Enum):
    CREDIT_ADD = "credit_add"
    CREDIT_DEDUCT = "credit_deduct"
    ITEM_UPLOAD = "item_upload"
    SWAP_CREDIT = "swap_credit"
    SWAP_DEBIT = "swap_debit"
    PURCHASE = "purchase"


class TransactionCreate(BaseModel):
    user_id: str
    amount: float
    type: TransactionType
    description: Optional[str] = ""


class TransactionOut(BaseModel):
    id: str
    user_id: str
    amount: float
    type: TransactionType
    description: Optional[str]
    created_at: str


class CreditBalance(BaseModel):
    user_id: str
    balance: float


class CreditAddRequest(BaseModel):
    amount: float


class CreditDeductRequest(BaseModel):
    amount: float
