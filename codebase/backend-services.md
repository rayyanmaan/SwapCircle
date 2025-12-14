# Backend Services Documentation

This document describes all services in the SwapCircle backend. Services contain the business logic and interact with the database.

## Overview

Services are located in `Backend/services/` and handle:
- Business logic
- Database operations
- External service integrations (email, storage)
- Data validation and transformation

---

## Authentication Service (`auth_service.py`)

Handles password hashing, token creation, and authentication verification.

### Functions

#### `hash_password(password: str, salt: str = None) -> Tuple[str, str]`
Hash a password with SHA-256 and salt.

**Parameters:**
- `password`: Plain text password
- `salt`: Optional salt (generated if not provided)

**Returns:** Tuple of (salt, hashed_password)

#### `verify_password(plain: str, salt: str, hashed: str) -> bool`
Verify a password against stored salt and hash.

**Returns:** `True` if password matches, `False` otherwise

#### `create_access_token(user_id: str) -> str`
Create an HMAC-signed access token for development.

**Note:** For production, use JWT tokens (PyJWT or python-jose).

**Returns:** Token string in format `user_id|hmac_signature`

#### `verify_access_token(token: str) -> bool`
Verify an HMAC-signed access token.

**Returns:** `True` if token is valid, `False` otherwise

#### `get_user_id_from_token(token: str) -> Optional[str]`
Extract user ID from token.

**Returns:** User ID if token is valid, `None` otherwise

#### `get_user_id_from_request(request: Request) -> str`
Extract and verify user ID from request Authorization header.

**Raises:** `HTTPException` if token is missing or invalid

**Returns:** User ID string

---

## User Service (`user_service.py`)

Manages user data in MongoDB `users` collection.

### Functions

#### `list_users() -> List[Dict[str, Any]]`
List all users.

**Returns:** List of user dictionaries

#### `get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]`
Get user by ID.

**Returns:** User dictionary or `None` if not found

#### `get_user_by_email(email: str) -> Optional[Dict[str, Any]]`
Get user by email address.

**Returns:** User dictionary or `None` if not found

#### `get_user_by_username(username: str) -> Optional[Dict[str, Any]]`
Get user by username.

**Returns:** User dictionary or `None` if not found

#### `create_user(email: str, username: str, full_name: str, salt: str, password_hash: str) -> Dict[str, Any]`
Create a new user.

**Returns:** Created user dictionary with `id` field

#### `update_user(user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]`
Update user information.

**Parameters:**
- `user_id`: User ID to update
- `updates`: Dictionary of fields to update

**Returns:** Updated user dictionary or `None` if not found

#### `add_favorite(user_id: str, item_id: str) -> bool`
Add item to user's favorites.

**Returns:** `True` if successful, `False` if item already in favorites

#### `remove_favorite(user_id: str, item_id: str) -> bool`
Remove item from user's favorites.

**Returns:** `True` if successful, `False` if item not in favorites

#### `get_favorites(user_id: str) -> List[str]`
Get list of favorite item IDs for a user.

**Returns:** List of item ID strings

---

## Item/Storage Service (`storage_service.py`)

Manages item data storage. Currently uses JSON file storage for development.

### Functions

#### `get_item(item_id: str) -> Optional[Dict[str, Any]]`
Get item by ID.

**Returns:** Item dictionary or `None` if not found

#### `list_items(owner_id: str = None, status: str = None) -> List[Dict[str, Any]]`
List items with optional filtering.

**Parameters:**
- `owner_id`: Filter by owner ID
- `status`: Filter by status

**Returns:** List of item dictionaries

#### `create_item(item_data: Dict[str, Any]) -> Dict[str, Any]`
Create a new item.

**Returns:** Created item dictionary with `id` field

#### `update_item(item_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]`
Update item information.

**Returns:** Updated item dictionary or `None` if not found

#### `delete_item(item_id: str) -> bool`
Delete an item.

**Returns:** `True` if successful, `False` if item not found

---

## Swap Service (`swap_service.py`)

Manages swap requests, approvals, and swap history using MongoDB.

### Functions

#### `create_swap_request(item_id: str, requester_id: str, credits_required: float) -> Dict[str, Any]`
Create a new swap request.

**Returns:** Created swap request dictionary

#### `get_swap_request(request_id: str) -> Optional[Dict[str, Any]]`
Get swap request by ID.

**Returns:** Swap request dictionary or `None` if not found

#### `get_requests_for_item(item_id: str) -> List[Dict[str, Any]]`
Get all swap requests for an item.

**Returns:** List of swap request dictionaries

#### `get_pending_requests_for_item(item_id: str) -> List[Dict[str, Any]]`
Get pending swap requests for an item.

**Returns:** List of pending swap request dictionaries

#### `get_requests_for_requester(requester_id: str) -> List[Dict[str, Any]]`
Get all swap requests created by a user.

**Returns:** List of swap request dictionaries

#### `get_requests_for_owner(owner_id: str) -> List[Dict[str, Any]]`
Get all swap requests for items owned by a user.

**Returns:** List of swap request dictionaries

#### `update_swap_request(request_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]`
Update swap request status.

**Returns:** Updated swap request dictionary or `None` if not found

#### `delete_swap_request(request_id: str) -> bool`
Delete a swap request.

**Returns:** `True` if successful, `False` if not found

---

## Credit Service (`credit_service.py`)

Manages user credits, credit locking, and credit transactions.

### Functions

#### `get_credit_balance(user_id: str) -> Dict[str, float]`
Get user's credit balance.

**Returns:** Dictionary with `credits`, `locked_credits`, and `available_credits`

#### `add_credits(user_id: str, amount: float, reason: str = "") -> bool`
Add credits to user account.

**Returns:** `True` if successful

#### `deduct_credits(user_id: str, amount: float, reason: str = "") -> bool`
Deduct credits from user account.

**Raises:** `ValueError` if insufficient credits

**Returns:** `True` if successful

#### `lock_credits(user_id: str, amount: float, reason: str = "") -> bool`
Lock credits (reserve them for a pending transaction).

**Raises:** `ValueError` if insufficient available credits

**Returns:** `True` if successful

#### `unlock_credits(user_id: str, amount: float, reason: str = "") -> bool`
Unlock credits (release them from a reservation).

**Returns:** `True` if successful

#### `transfer_credits(from_user_id: str, to_user_id: str, amount: float, reason: str = "") -> bool`
Transfer credits between users.

**Raises:** `ValueError` if insufficient credits

**Returns:** `True` if successful

#### `create_transaction(user_id: str, amount: float, transaction_type: str, reason: str = "") -> Dict[str, Any]`
Create a credit transaction record.

**Returns:** Transaction dictionary

#### `get_transactions(user_id: str) -> List[Dict[str, Any]]`
Get transaction history for a user.

**Returns:** List of transaction dictionaries

---

## Image Service (`image_service.py`)

Handles image upload, storage, and deletion.

### Functions

#### `save_image(file: UploadFile, item_id: str = None) -> str`
Save an uploaded image file.

**Parameters:**
- `file`: FastAPI UploadFile object
- `item_id`: Optional item ID for organizing images

**Returns:** Relative path to saved image (e.g., `/static/images/filename.jpg`)

#### `delete_image(image_path: str) -> bool`
Delete an image file.

**Returns:** `True` if successful, `False` if file not found

#### `get_image_url(image_path: str, base_url: str = None) -> str`
Get full URL for an image.

**Returns:** Full image URL

---

## Storage Service (`storage_service.py`)

Handles file-based storage for items (development only).

**Note:** In production, this should be replaced with MongoDB or another database.

### Functions

- `get_item(item_id: str)`
- `list_items(owner_id: str = None, status: str = None)`
- `create_item(item_data: Dict[str, Any])`
- `update_item(item_id: str, updates: Dict[str, Any])`
- `delete_item(item_id: str)`

---

## Email Service (`email_service.py`)

Sends email notifications using SMTP.

### Functions

#### `send_contact_email(email: str, name: str, subject: str, message: str, contact_type: str) -> Tuple[bool, str]`
Send contact form email to user and admin.

**Parameters:**
- `email`: User's email address
- `name`: User's name
- `subject`: Email subject
- `message`: Email message content
- `contact_type`: Type of contact (`"contact"`, `"feedback"`, or `"bug"`)

**Returns:** Tuple of (success: bool, message: str)

#### `send_verification_email(email: str, token: str) -> Tuple[bool, str]`
Send email verification link.

**Returns:** Tuple of (success: bool, message: str)

#### `send_swap_notification_email(email: str, item_title: str, requester_name: str) -> Tuple[bool, str]`
Send notification email for swap request.

**Returns:** Tuple of (success: bool, message: str)

---

## Rating Service (`rating_service.py`)

Manages user ratings in MongoDB `ratings` collection.

### Functions

#### `create_or_update_rating(rater_user_id: str, rated_user_id: str, stars: int) -> Dict[str, Any]`
Create or update a rating.

**Parameters:**
- `rater_user_id`: ID of user giving the rating
- `rated_user_id`: ID of user being rated
- `stars`: Rating value (1-5)

**Raises:** `ValueError` if stars not in range 1-5

**Returns:** Rating dictionary

#### `get_rating(rater_user_id: str, rated_user_id: str) -> Optional[Dict[str, Any]]`
Get rating given by one user to another.

**Returns:** Rating dictionary or `None` if not found

#### `get_user_ratings(rated_user_id: str) -> List[Dict[str, Any]]`
Get all ratings for a user.

**Returns:** List of rating dictionaries

#### `get_rating_stats(rated_user_id: str) -> Dict[str, Any]`
Get rating statistics for a user.

**Returns:** Dictionary with `average_rating`, `total_ratings`, and `rating_distribution`

---

## Message Service (`message_service.py`)

Manages in-app messaging between users.

### Functions

#### `create_message(sender_id: str, recipient_id: str, content: str) -> Dict[str, Any]`
Create a new message.

**Returns:** Message dictionary

#### `get_messages(user_id: str, conversation_with: str = None) -> List[Dict[str, Any]]`
Get messages for a user.

**Parameters:**
- `user_id`: User ID to get messages for
- `conversation_with`: Optional filter by conversation partner

**Returns:** List of message dictionaries

#### `get_conversations(user_id: str) -> List[Dict[str, Any]]`
Get list of conversations for a user.

**Returns:** List of conversation dictionaries with last message and unread count

---

## Notification Service (`notification_service.py`)

Manages user notifications.

### Functions

#### `create_notification(user_id: str, notification_type: str, message: str, data: Dict[str, Any] = None) -> Dict[str, Any]`
Create a new notification.

**Returns:** Notification dictionary

#### `get_notifications(user_id: str) -> List[Dict[str, Any]]`
Get all notifications for a user.

**Returns:** List of notification dictionaries

#### `get_recent_notifications(user_id: str, limit: int = 10) -> List[Dict[str, Any]]`
Get recent notifications.

**Returns:** List of recent notification dictionaries

#### `get_unread_count(user_id: str) -> int`
Get count of unread notifications.

**Returns:** Unread notification count

#### `mark_as_read(notification_id: str) -> bool`
Mark a notification as read.

**Returns:** `True` if successful

#### `mark_all_as_read(user_id: str) -> bool`
Mark all notifications as read for a user.

**Returns:** `True` if successful

#### `delete_notification(notification_id: str) -> bool`
Delete a notification.

**Returns:** `True` if successful

---

## Service Patterns

### ID Conversion
All services that interact with MongoDB use `_convert_id()` helper function to convert MongoDB `_id` to `id` for API compatibility.

### Error Handling
- Services raise `ValueError` for invalid input
- Services return `None` or `False` for not found operations
- HTTP exceptions are raised in route handlers, not services

### Async Operations
All database operations are async using `motor` (async MongoDB driver).

### Transaction Logging
Credit operations automatically create transaction records for audit purposes.

---

## Service Dependencies

```
auth_service
  └── config (settings)

user_service
  └── database.connection

storage_service
  └── (file-based storage)

swap_service
  └── database.connection

credit_service
  └── database.connection
  └── user_service

image_service
  └── (file system)

email_service
  └── (SMTP)

rating_service
  └── database.connection

message_service
  └── database.connection

notification_service
  └── database.connection
```

---

## Notes

- Services are designed to be testable with mock data
- Database operations use async/await for better performance
- Credit operations are atomic and include transaction logging
- Image storage uses local filesystem in development, Firebase in production
- Email service requires SMTP configuration in environment variables

