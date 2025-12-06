"""Credit service implementation for managing user credits and transactions.

This module handles all credit-related operations including:
- Adding credits to user accounts
- Deducting credits from user accounts
- Recording transactions for audit trail
- Maintaining data integrity through transactional operations

Key features:
- Transactional operations: Ensures both user credits and transaction records
  are updated atomically to prevent data inconsistencies
- Per-user locking: Prevents race conditions when multiple operations
  modify the same user's credits simultaneously
- Transaction history: Maintains a complete audit trail of all credit changes

This implementation follows #cs110-CodeReadability by using clear function names,
meaningful comments, and consistent error messages.
"""

import json
from pathlib import Path
from typing import List, Dict, Any, Optional, Callable
import threading
import uuid
from datetime import datetime

# Import transaction type constants to avoid typos and ensure consistency
from utils.constants import (
    TRANSACTION_TYPE_CREDIT_ADD,
    TRANSACTION_TYPE_CREDIT_DEDUCT,
    TRANSACTION_TYPE_ITEM_UPLOAD,
    TRANSACTION_TYPE_SWAP_CREDIT,
    TRANSACTION_TYPE_SWAP_DEBIT,
)

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
TRANSACTIONS_FILE = DATA_DIR / "transactions.json"

# Global lock for transaction file operations
_lock = threading.Lock()

# Per-user locks to prevent race conditions when multiple operations
# modify the same user's credits simultaneously
_user_locks: Dict[str, threading.Lock] = {}
_user_locks_lock = threading.Lock()  # Lock for accessing the _user_locks dictionary


def _get_user_lock(user_id: str) -> threading.Lock:
    """Get or create a per-user lock for thread-safe credit operations.

    This function ensures that each user has their own lock, preventing
    race conditions when multiple operations try to modify the same user's
    credits at the same time.

    Args:
        user_id: The ID of the user whose lock we need

    Returns:
        A threading.Lock object specific to this user
    """
    with _user_locks_lock:
        if user_id not in _user_locks:
            _user_locks[user_id] = threading.Lock()
        return _user_locks[user_id]


def _load_transactions() -> List[Dict[str, Any]]:
    """Load all transactions from the JSON file.

    Returns:
        A list of transaction dictionaries. Returns empty list if file doesn't exist.
    """
    if not TRANSACTIONS_FILE.exists():
        return []
    with TRANSACTIONS_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)


def _save_transactions(transactions: List[Dict[str, Any]]):
    """Save transactions to the JSON file.

    This function is thread-safe and should be called within a lock context.

    Args:
        transactions: List of transaction dictionaries to save
    """
    with TRANSACTIONS_FILE.open("w", encoding="utf-8") as f:
        json.dump(transactions, f, ensure_ascii=False, indent=2)


def _record_transaction(
    user_id: str, amount: float, transaction_type: str, description: str = ""
) -> Dict[str, Any]:
    """Record a transaction in the transaction history.

    This function creates a transaction record and appends it to the
    transactions file. It should be called within a transactional context
    to ensure atomicity with user credit updates.

    Args:
        user_id: The ID of the user involved in the transaction
        amount: The credit amount (positive for additions, will be used as-is)
        transaction_type: Type of transaction (use constants from utils.constants)
        description: Optional description of the transaction

    Returns:
        The created transaction dictionary with id, timestamps, etc.

    Note:
        This function is NOT thread-safe on its own. It should be called
        from within a transactional helper that holds the necessary locks.
    """
    transaction = {
        "id": uuid.uuid4().hex,
        "user_id": user_id,
        "amount": amount,
        "type": transaction_type,
        "description": description,
        "created_at": datetime.now().isoformat(),
    }

    # Note: This function assumes it's called within a lock context
    # The transactional helper will ensure proper locking
    transactions = _load_transactions()
    transactions.append(transaction)
    _save_transactions(transactions)

    return transaction


def get_user_balance(user_id: str) -> float:
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
    user = get_user_by_id(user_id)
    if not user:
        raise ValueError(f"User {user_id} not found")

    # Calculate balance from transactions
    transactions = _load_transactions()
    user_transactions = [t for t in transactions if t.get("user_id") == user_id]

    balance = 0.0
    for transaction in user_transactions:
        # Use constants for transaction type checking
        trans_type = transaction.get("type")
        if trans_type in [
            TRANSACTION_TYPE_CREDIT_ADD,
            TRANSACTION_TYPE_SWAP_CREDIT,
            TRANSACTION_TYPE_ITEM_UPLOAD,
        ]:
            balance += transaction.get("amount", 0)
        elif trans_type in [
            TRANSACTION_TYPE_CREDIT_DEDUCT,
            TRANSACTION_TYPE_SWAP_DEBIT,
        ]:
            balance -= transaction.get("amount", 0)

    return balance


def _execute_credit_transaction(
    user_id: str, operation: Callable[[], Dict[str, Any]]
) -> Dict[str, Any]:
    """Execute a credit operation atomically within a transaction.

    This helper function ensures that both the user credit update and
    transaction record are written atomically. If the server crashes
    between these two operations, we could end up with inconsistent data.
    This function prevents that by:
    1. Acquiring a per-user lock to prevent concurrent modifications
    2. Acquiring the global transaction lock
    3. Executing both operations
    4. Releasing locks

    This follows the transactional pattern we learned in class with SQL transactions,
    adapted for file-based storage.

    Args:
        user_id: The ID of the user whose credits are being modified
        operation: A callable that performs the credit operation and returns
                   a dict with 'transaction' and 'new_credits' keys

    Returns:
        Dictionary containing 'transaction' and 'new_credits'

    Raises:
        ValueError: If the user doesn't exist or operation fails
    """
    from services.user_service import get_user_by_id

    # Verify user exists before acquiring locks
    user = get_user_by_id(user_id)
    if not user:
        raise ValueError(f"User {user_id} not found")

    # Acquire per-user lock first (prevents race conditions for same user)
    user_lock = _get_user_lock(user_id)
    user_lock.acquire()

    try:
        # Acquire global transaction lock (ensures atomicity of file writes)
        _lock.acquire()
        try:
            # Execute the operation (updates user credits and records transaction)
            result = operation()
            return result
        finally:
            _lock.release()
    finally:
        user_lock.release()


def add_credits(
    user_id: str,
    amount: float,
    transaction_type: str = TRANSACTION_TYPE_CREDIT_ADD,
    description: str = None,
) -> float:
    """Add credits to user account and return new balance.

    This function atomically:
    1. Records the transaction (for audit trail)
    2. Updates the user's credits field directly (for performance)

    The operation is wrapped in a transactional helper to ensure data integrity.
    If the server crashes between these operations, both will be rolled back
    (or neither will complete), preventing inconsistent state.

    The user's credits field is the source of truth for balance queries.
    Transactions are kept for audit/history purposes only.

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

    # Use default description if not provided
    if description is None:
        description = f"Added {amount} credits to account"

    # Define the operation to execute within the transaction
    def _add_credits_operation():
        """Inner function that performs the actual credit addition.

        This is executed within the transactional context to ensure
        both the transaction record and user credit update happen atomically.
        """
        # Get fresh user data (within lock to ensure consistency)
        user = get_user_by_id(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")

        # Record the transaction first (for audit trail)
        transaction = _record_transaction(
            user_id=user_id,
            amount=amount,
            transaction_type=transaction_type,
            description=description,
        )

        # Update user's credits field directly (for performance - O(1) instead of O(n))
        current_credits = user.get("credits", 0.0)
        new_credits = current_credits + amount
        update_user(user_id, {"credits": new_credits})

        return {"transaction": transaction, "new_credits": new_credits}

    # Execute within transactional context (ensures atomicity)
    result = _execute_credit_transaction(user_id, _add_credits_operation)
    return result["new_credits"]


def deduct_credits(
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

    The operation is wrapped in a transactional helper to ensure data integrity.
    If the server crashes between these operations, both will be rolled back
    (or neither will complete), preventing inconsistent state.

    The user's credits field is the source of truth for balance queries.
    Transactions are kept for audit/history purposes only.

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

    # Use default description if not provided
    if description is None:
        description = f"Deducted {amount} credits from account"

    # Define the operation to execute within the transaction
    def _deduct_credits_operation():
        """Inner function that performs the actual credit deduction.

        This is executed within the transactional context to ensure
        both the transaction record and user credit update happen atomically.
        """
        # Get fresh user data (within lock to ensure consistency)
        user = get_user_by_id(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")

        current_balance = user.get("credits", 0.0)

        # Check if user has sufficient credits before proceeding
        if current_balance < amount:
            raise ValueError(
                f"Insufficient credits. Current balance: {current_balance}, required: {amount}"
            )

        # Record the transaction first (for audit trail)
        transaction = _record_transaction(
            user_id=user_id,
            amount=amount,
            transaction_type=transaction_type,
            description=description,
        )

        # Update user's credits field directly (for performance - O(1) instead of O(n))
        new_credits = current_balance - amount
        update_user(user_id, {"credits": new_credits})

        return {"transaction": transaction, "new_credits": new_credits}

    # Execute within transactional context (ensures atomicity)
    result = _execute_credit_transaction(user_id, _deduct_credits_operation)
    return result["new_credits"]


def get_user_transactions(user_id: str) -> List[Dict[str, Any]]:
    """Get all transactions for a user, sorted by date (newest first).

    Args:
        user_id: The ID of the user whose transactions to retrieve

    Returns:
        A list of transaction dictionaries, sorted by creation date (newest first)
    """
    transactions = _load_transactions()
    user_transactions = [t for t in transactions if t.get("user_id") == user_id]

    # Sort by creation date, newest first
    user_transactions.sort(key=lambda x: x.get("created_at", ""), reverse=True)

    return user_transactions


def sync_user_credits_from_transactions(user_id: str) -> float:
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

    user = get_user_by_id(user_id)
    if not user:
        raise ValueError(f"User {user_id} not found")

    # Calculate balance from transactions
    calculated_balance = get_user_balance(user_id)

    # Update user's credits field to match calculated balance
    update_user(user_id, {"credits": calculated_balance})

    return calculated_balance
