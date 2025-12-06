"""Project constants for SwapCircle backend.

This module contains constants used throughout the application to ensure
consistency and avoid typos. Using constants instead of plain strings
makes the code more maintainable and reduces the risk of errors.

Constants follow naming conventions:
- UPPER_SNAKE_CASE for all constants
- Grouped by functionality (transaction types, status values, etc.)
"""

# Pagination constants
DEFAULT_PAGE_SIZE = 20
MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5 MB

# Transaction type constants
# These represent the different types of credit transactions in the system.
# Using constants prevents typos and makes refactoring easier.
TRANSACTION_TYPE_CREDIT_ADD = "credit_add"  # Generic credit addition
TRANSACTION_TYPE_CREDIT_DEDUCT = "credit_deduct"  # Generic credit deduction
TRANSACTION_TYPE_ITEM_UPLOAD = "item_upload"  # Credits awarded for uploading an item
TRANSACTION_TYPE_SWAP_CREDIT = "swap_credit"  # Credits received from approved swap
TRANSACTION_TYPE_SWAP_DEBIT = "swap_debit"  # Credits deducted for swap purchase

# Item status constants
ITEM_STATUS_AVAILABLE = "available"
ITEM_STATUS_PENDING = "pending"
ITEM_STATUS_LOCKED = "locked"
ITEM_STATUS_SWAPPED = "swapped"

# Swap request status constants
SWAP_STATUS_PENDING = "pending"
SWAP_STATUS_APPROVED = "approved"
SWAP_STATUS_REJECTED = "rejected"
SWAP_STATUS_CANCELLED = "cancelled"
