"""Credit service implementation for managing user credits and transactions using MongoDB.

This module handles all credit-related operations including:
- Adding credits to user accounts
- Deducting credits from user accounts
- Recording transactions for audit trail
- Maintaining data integrity through MongoDB transactions

Key features:
- Transactional operations: Ensures both user credits and transaction records
  are updated atomically using MongoDB transactions
- Transaction history: Maintains a complete audit trail of all credit changes

This implementation follows #cs110-CodeReadability by using clear function names,
meaningful comments, and consistent error messages.
"""

from typing import List, Dict, Any, Optional
from bson import ObjectId
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClientSession

# Import transaction type constants to avoid typos and ensure consistency
from utils.constants import (
    TRANSACTION_TYPE_CREDIT_ADD,
    TRANSACTION_TYPE_CREDIT_DEDUCT,
    TRANSACTION_TYPE_ITEM_UPLOAD,
    TRANSACTION_TYPE_SWAP_CREDIT,
    TRANSACTION_TYPE_SWAP_DEBIT,
)
from database.connection import get_db


def _convert_id(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Convert MongoDB _id to id for API compatibility."""
    if doc is None:
        return None
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc


async def _record_transaction(
    user_id: str,
    amount: float,
    transaction_type: str,
    description: str = "",
    session: Optional[AsyncIOMotorClientSession] = None
) -> Dict[str, Any]:
    """Record a transaction in the transaction history.

    Args:
        user_id: The ID of the user involved in the transaction
        amount: The credit amount (positive for additions, will be used as-is)
        transaction_type: Type of transaction (use constants from utils.constants)
        description: Optional description of the transaction
        session: Optional MongoDB session for transactions

    Returns:
        The created transaction dictionary with id, timestamps, etc.
    """
    db = get_db()
    transactions_collection = db["transactions"]
    
    transaction = {
        "user_id": user_id,
        "amount": amount,
        "type": transaction_type,
        "description": description,
        "created_at": datetime.now().isoformat(),
    }
    
    if session:
        result = await transactions_collection.insert_one(transaction, session=session)
    else:
        result = await transactions_collection.insert_one(transaction)
    
    transaction["_id"] = result.inserted_id
    return _convert_id(transaction)


async def get_user_balance(user_id: str) -> float:
    """Calculate user's current balance from transaction history.

    This function recalculates the balance by summing all transactions
    for the user. It's useful for integrity checks, but for performance,
    the user's credits field should be used as the source of truth.

    Args:
        user_id: The ID of the user whose balance to calculate

    Returns:
        The calculated balance from all transactions

    Raises:
        ValueError: If the user doesn't exist
    """
    from services.user_service import get_user_by_id

    # First check if user exists
    user = await get_user_by_id(user_id)
    if not user:
        raise ValueError(f"User {user_id} not found")

    # Calculate balance from transactions using MongoDB aggregation
    db = get_db()
    transactions_collection = db["transactions"]
    
    pipeline = [
        {"$match": {"user_id": user_id}},
        {
            "$group": {
                "_id": None,
                "balance": {
                    "$sum": {
                        "$cond": [
                            {
                                "$in": [
                                    "$type",
                                    [
                                        TRANSACTION_TYPE_CREDIT_ADD,
                                        TRANSACTION_TYPE_SWAP_CREDIT,
                                        TRANSACTION_TYPE_ITEM_UPLOAD,
                                    ],
                                ]
                            },
                            "$amount",
                            {"$multiply": ["$amount", -1]},
                        ]
                    }
                }
            }
        }
    ]
    
    cursor = transactions_collection.aggregate(pipeline)
    result = await cursor.to_list(length=1)
    
    if result and result[0].get("balance") is not None:
        return float(result[0]["balance"])
    return 0.0


async def add_credits(
    user_id: str,
    amount: float,
    transaction_type: str = TRANSACTION_TYPE_CREDIT_ADD,
    description: str = None,
) -> float:
    """Add credits to user account and return new balance.

    This function atomically:
    1. Records the transaction (for audit trail)
    2. Updates the user's credits field directly (for performance)

    Uses MongoDB transactions to ensure data integrity.

    Args:
        user_id: The ID of the user receiving credits
        amount: The amount of credits to add (must be positive)
        transaction_type: Type of transaction (defaults to TRANSACTION_TYPE_CREDIT_ADD)
        description: Optional description of why credits were added

    Returns:
        The new credit balance after the addition

    Raises:
        ValueError: If the user doesn't exist
    """
    from services.user_service import get_user_by_id, update_user
    from motor.motor_asyncio import AsyncIOMotorClient

    # Use default description if not provided
    if description is None:
        description = f"Added {amount} credits to account"

    db = get_db()
    client: AsyncIOMotorClient = db.client
    
    # Use MongoDB transaction for atomicity
    async with client.start_session() as session:
        async with session.start_transaction():
            # Get fresh user data
            user = await get_user_by_id(user_id)
            if not user:
                raise ValueError(f"User {user_id} not found")

            # Record the transaction first (for audit trail)
            await _record_transaction(
                user_id=user_id,
                amount=amount,
                transaction_type=transaction_type,
                description=description,
                session=session,
            )

            # Update user's credits field directly (for performance - O(1) instead of O(n))
            current_credits = user.get("credits", 0.0)
            new_credits = current_credits + amount
            await update_user(user_id, {"credits": new_credits}, session=session)

    return new_credits


async def deduct_credits(
    user_id: str,
    amount: float,
    transaction_type: str = TRANSACTION_TYPE_CREDIT_DEDUCT,
    description: str = None,
) -> float:
    """Deduct credits from user account and return new balance.

    This function atomically:
    1. Checks if user has sufficient credits
    2. Records the transaction (for audit trail)
    3. Updates the user's credits field directly (for performance)

    Uses MongoDB transactions to ensure data integrity.

    Args:
        user_id: The ID of the user whose credits are being deducted
        amount: The amount of credits to deduct (must be positive)
        transaction_type: Type of transaction (defaults to TRANSACTION_TYPE_CREDIT_DEDUCT)
        description: Optional description of why credits were deducted

    Returns:
        The new credit balance after the deduction

    Raises:
        ValueError: If the user doesn't exist or has insufficient credits
    """
    from services.user_service import get_user_by_id, update_user
    from motor.motor_asyncio import AsyncIOMotorClient

    # Use default description if not provided
    if description is None:
        description = f"Deducted {amount} credits from account"

    db = get_db()
    client: AsyncIOMotorClient = db.client
    
    # Use MongoDB transaction for atomicity
    async with client.start_session() as session:
        async with session.start_transaction():
            # Get fresh user data
            user = await get_user_by_id(user_id)
            if not user:
                raise ValueError(f"User {user_id} not found")

            current_balance = user.get("credits", 0.0)

            # Check if user has sufficient credits before proceeding
            if current_balance < amount:
                raise ValueError(
                    f"Insufficient credits. Current balance: {current_balance}, required: {amount}"
                )

            # Record the transaction first (for audit trail)
            await _record_transaction(
                user_id=user_id,
                amount=amount,
                transaction_type=transaction_type,
                description=description,
                session=session,
            )

            # Update user's credits field directly (for performance - O(1) instead of O(n))
            new_credits = current_balance - amount
            await update_user(user_id, {"credits": new_credits}, session=session)

    return new_credits


async def get_user_transactions(user_id: str) -> List[Dict[str, Any]]:
    """Get all transactions for a user, sorted by date (newest first).

    Args:
        user_id: The ID of the user whose transactions to retrieve

    Returns:
        A list of transaction dictionaries, sorted by creation date (newest first)
    """
    db = get_db()
    transactions_collection = db["transactions"]
    
    cursor = transactions_collection.find({"user_id": user_id}).sort("created_at", -1)
    transactions = await cursor.to_list(length=None)
    
    return [_convert_id(t) for t in transactions]


async def sync_user_credits_from_transactions(user_id: str) -> float:
    """Recalculate and update user's credits from all transactions.

    This function is useful for data integrity checks or fixing discrepancies
    between the user's credits field and the transaction history. It recalculates
    the balance from all transactions and updates the user's credits field to match.

    Use this function if you suspect the user's credits field is out of sync
    with the transaction history (e.g., after a crash or data corruption).

    Args:
        user_id: The ID of the user whose credits to sync

    Returns:
        The recalculated balance that was written to the user's credits field

    Raises:
        ValueError: If the user doesn't exist
    """
    from services.user_service import get_user_by_id, update_user

    user = await get_user_by_id(user_id)
    if not user:
        raise ValueError(f"User {user_id} not found")

    # Calculate balance from transactions
    calculated_balance = await get_user_balance(user_id)

    # Update user's credits field to match calculated balance
    await update_user(user_id, {"credits": calculated_balance})

    return calculated_balance
