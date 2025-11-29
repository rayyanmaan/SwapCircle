"""Credit service implementation"""

import json
from pathlib import Path
from typing import List, Dict, Any, Optional
import threading
import uuid
from datetime import datetime

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
TRANSACTIONS_FILE = DATA_DIR / "transactions.json"

_lock = threading.Lock()


def _load_transactions() -> List[Dict[str, Any]]:
    """Load transactions from JSON file"""
    if not TRANSACTIONS_FILE.exists():
        return []
    with TRANSACTIONS_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)


def _save_transactions(transactions: List[Dict[str, Any]]):
    """Save transactions to JSON file"""
    with TRANSACTIONS_FILE.open("w", encoding="utf-8") as f:
        json.dump(transactions, f, ensure_ascii=False, indent=2)


def _record_transaction(
    user_id: str, amount: float, transaction_type: str, description: str = ""
) -> Dict[str, Any]:
    """Record a transaction and return the transaction record"""
    transaction = {
        "id": uuid.uuid4().hex,
        "user_id": user_id,
        "amount": amount,
        "type": transaction_type,  # "credit_add", "credit_deduct", "swap", "purchase"
        "description": description,
        "created_at": datetime.now().isoformat(),
    }

    with _lock:
        transactions = _load_transactions()
        transactions.append(transaction)
        _save_transactions(transactions)

    return transaction


def get_user_balance(user_id: str) -> float:
    """Calculate user's current balance from transaction history"""
    from Backend.services.user_service import get_user_by_id

    # First check if user exists
    user = get_user_by_id(user_id)
    if not user:
        raise ValueError(f"User {user_id} not found")

    # Calculate balance from transactions
    transactions = _load_transactions()
    user_transactions = [t for t in transactions if t.get("user_id") == user_id]

    balance = 0.0
    for transaction in user_transactions:
        if transaction.get("type") in ["credit_add", "swap_credit"]:
            balance += transaction.get("amount", 0)
        elif transaction.get("type") in ["credit_deduct", "swap_debit"]:
            balance -= transaction.get("amount", 0)

    return balance


def add_credits(user_id: str, amount: float) -> float:
    """Add credits to user account and return new balance"""
    from Backend.services.user_service import get_user_by_id

    user = get_user_by_id(user_id)
    if not user:
        raise ValueError(f"User {user_id} not found")

    # Record the transaction
    _record_transaction(
        user_id=user_id,
        amount=amount,
        transaction_type="credit_add",
        description=f"Added {amount} credits to account",
    )

    # Return the new calculated balance
    return get_user_balance(user_id)


def deduct_credits(user_id: str, amount: float) -> float:
    """Deduct credits from user account and return new balance"""
    current_balance = get_user_balance(user_id)

    if current_balance < amount:
        raise ValueError(
            f"Insufficient credits. Current balance: {current_balance}, required: {amount}"
        )

    # Record the transaction
    _record_transaction(
        user_id=user_id,
        amount=amount,
        transaction_type="credit_deduct",
        description=f"Deducted {amount} credits from account",
    )

    # Return the new calculated balance
    return get_user_balance(user_id)


def get_user_transactions(user_id: str) -> List[Dict[str, Any]]:
    """Get all transactions for a user, sorted by date (newest first)"""
    transactions = _load_transactions()
    user_transactions = [t for t in transactions if t.get("user_id") == user_id]

    # Sort by creation date, newest first
    user_transactions.sort(key=lambda x: x.get("created_at", ""), reverse=True)

    return user_transactions
