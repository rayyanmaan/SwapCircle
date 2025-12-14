# Backend API Routes Documentation

This document describes all API routes available in the SwapCircle backend.

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: Configured via environment variables

## Interactive API Documentation

FastAPI automatically generates interactive API documentation that you can access in your browser:

### Swagger UI
- **URL**: `http://localhost:8000/docs`
- **Features**: 
  - Interactive API explorer
  - Try out endpoints directly in the browser
  - View request/response schemas
  - See authentication requirements
  - Test endpoints with real data

### ReDoc
- **URL**: `http://localhost:8000/redoc`
- **Features**:
  - Clean, readable API documentation
  - Better for reading and understanding the API
  - Organized by tags/categories

### OpenAPI Schema
- **URL**: `http://localhost:8000/openapi.json`
- **Features**:
  - Machine-readable API schema
  - Can be imported into API testing tools (Postman, Insomnia, etc.)

**Note**: When the backend server is running, simply navigate to `http://localhost:8000/docs` in your browser to explore all available endpoints interactively.

## Authentication

Most routes require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

Tokens are obtained through `/auth/login` or `/auth/register` endpoints.

---

## Authentication Routes (`/auth`)

### POST `/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "full_name": "Full Name"
}
```

**Response:** `201 Created`
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username",
    "full_name": "Full Name",
    "credits": 0.0,
    "email_verified": false
  }
}
```

### POST `/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "token": "jwt_token_here",
  "user": { ... }
}
```

### GET `/auth/me`
Get current authenticated user information.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "username": "username",
  "credits": 2.0,
  ...
}
```

### POST `/auth/verify/{token}`
Verify email address with verification token.

**Response:** `200 OK`
```json
{
  "message": "Email verified successfully"
}
```

---

## User Routes (`/users`)

### GET `/users/`
List all users (may require authentication).

**Response:** `200 OK`
```json
[
  {
    "id": "user_id",
    "username": "username",
    "full_name": "Full Name",
    ...
  }
]
```

### GET `/users/username/{username}`
Get user by username.

**Response:** `200 OK`
```json
{
  "id": "user_id",
  "username": "username",
  "full_name": "Full Name",
  "credits": 2.0,
  ...
}
```

### GET `/users/{user_id}`
Get user by ID.

**Response:** `200 OK`
```json
{
  "id": "user_id",
  "username": "username",
  ...
}
```

### PATCH `/users/{user_id}`
Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "full_name": "Updated Name",
  "bio": "User bio",
  "instagram_handle": "@handle",
  ...
}
```

**Response:** `200 OK`
```json
{
  "id": "user_id",
  "full_name": "Updated Name",
  ...
}
```

### POST `/users/{user_id}/profile-picture`
Upload profile picture.

**Headers:** `Authorization: Bearer <token>`

**Request:** `multipart/form-data` with `file` field

**Response:** `200 OK`
```json
{
  "id": "user_id",
  "profile_pic": "/static/images/profile_pic.jpg",
  ...
}
```

### POST `/users/{user_id}/favorites/{item_id}`
Add item to favorites.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### DELETE `/users/{user_id}/favorites/{item_id}`
Remove item from favorites.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### GET `/users/{user_id}/favorites`
Get user's favorite items.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "id": "item_id",
    "title": "Item Title",
    ...
  }
]
```

---

## Item Routes (`/items`)

### POST `/items/`
Create a new item listing.

**Headers:** `Authorization: Bearer <token>`

**Request:** `multipart/form-data`
- `images`: Array of image files
- `item`: JSON string with item data
  ```json
  {
    "title": "Item Title",
    "description": "Item description with metadata",
    "category": "tops",
    "size": "M",
    "location": "San Francisco",
    "condition": "like_new",
    "credits": 2
  }
  ```

**Response:** `201 Created`
```json
{
  "id": "item_id",
  "title": "Item Title",
  "owner_id": "user_id",
  "images": ["/static/images/image1.jpg"],
  "status": "available",
  ...
}
```

### GET `/items/`
List all items with optional filtering.

**Query Parameters:**
- `owner_id` (optional): Filter by owner
- `status` (optional): Filter by status (`available`, `pending`, `sold`)

**Response:** `200 OK`
```json
[
  {
    "id": "item_id",
    "title": "Item Title",
    "status": "available",
    ...
  }
]
```

### GET `/items/{item_id}`
Get item by ID.

**Response:** `200 OK`
```json
{
  "id": "item_id",
  "title": "Item Title",
  "owner_id": "user_id",
  "images": [...],
  "status": "available",
  ...
}
```

### PATCH `/items/{item_id}`
Update item.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  ...
}
```

**Response:** `200 OK`
```json
{
  "id": "item_id",
  "title": "Updated Title",
  ...
}
```

### DELETE `/items/{item_id}`
Delete item.

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

### POST `/items/{item_id}/lock`
Lock an item (reserve it for swap).

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### POST `/items/{item_id}/unlock`
Unlock an item.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### GET `/items/swap-requests`
Get swap requests for items owned by authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "id": "request_id",
    "item_id": "item_id",
    "requester_id": "user_id",
    "status": "pending",
    ...
  }
]
```

### GET `/items/swap-history`
Get swap history for authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "id": "transaction_id",
    "item_id": "item_id",
    "buyer_id": "user_id",
    "seller_id": "user_id",
    "status": "completed",
    ...
  }
]
```

---

## Swap Routes (`/swaps`)

### POST `/swaps/items/{item_id}/request`
Create a swap request for an item.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": "request_id",
  "item_id": "item_id",
  "requester_id": "user_id",
  "status": "pending",
  ...
}
```

### POST `/swaps/items/{item_id}/requests/{request_id}/approve`
Approve a swap request.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Swap request approved",
  "transaction": { ... }
}
```

### POST `/swaps/items/{item_id}/requests/{request_id}/reject`
Reject a swap request.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Swap request rejected"
}
```

### POST `/swaps/items/{item_id}/cancel`
Cancel a swap request (requester cancels their own request).

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### GET `/swaps/requests`
Get all swap requests for authenticated user (as requester or owner).

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "id": "request_id",
    "item_id": "item_id",
    "requester_id": "user_id",
    "status": "pending",
    ...
  }
]
```

### GET `/swaps/history`
Get swap history (completed swaps) for authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "id": "transaction_id",
    "item_id": "item_id",
    "buyer_id": "user_id",
    "seller_id": "user_id",
    "status": "completed",
    ...
  }
]
```

---

## Rating Routes (`/ratings`)

### POST `/ratings/{rated_user_id}`
Give or update a rating for a user.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "stars": 5
}
```

**Response:** `200 OK`
```json
{
  "id": "rating_id",
  "rater_user_id": "user_id",
  "rated_user_id": "rated_user_id",
  "stars": 5,
  ...
}
```

### GET `/ratings/{rated_user_id}/my-rating`
Get current user's rating for a specific user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": "rating_id",
  "stars": 5,
  ...
}
```

### GET `/ratings/{rated_user_id}/stats`
Get rating statistics for a user.

**Response:** `200 OK`
```json
{
  "average_rating": 4.5,
  "total_ratings": 10,
  "rating_distribution": {
    "5": 5,
    "4": 3,
    "3": 1,
    "2": 1,
    "1": 0
  }
}
```

---

## Message Routes (`/messages`)

### POST `/messages/`
Send a message.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "recipient_id": "user_id",
  "content": "Message content"
}
```

**Response:** `201 Created`
```json
{
  "id": "message_id",
  "sender_id": "user_id",
  "recipient_id": "user_id",
  "content": "Message content",
  ...
}
```

### GET `/messages/`
Get messages for authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `conversation_with` (optional): Filter by conversation partner

**Response:** `200 OK`
```json
[
  {
    "id": "message_id",
    "sender_id": "user_id",
    "recipient_id": "user_id",
    "content": "Message content",
    ...
  }
]
```

### GET `/messages/conversations`
Get list of conversations for authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "user_id": "user_id",
    "username": "username",
    "last_message": { ... },
    "unread_count": 2
  }
]
```

### GET `/messages/{message_id}`
Get message by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": "message_id",
  "sender_id": "user_id",
  "content": "Message content",
  ...
}
```

---

## Notification Routes (`/notifications`)

### GET `/notifications`
Get all notifications for authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "id": "notification_id",
    "user_id": "user_id",
    "type": "swap_request",
    "message": "You have a new swap request",
    "read": false,
    ...
  }
]
```

### GET `/notifications/recent`
Get recent notifications.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  { ... }
]
```

### GET `/notifications/unread-count`
Get count of unread notifications.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "count": 5
}
```

### PATCH `/notifications/{notification_id}/read`
Mark notification as read.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Notification marked as read"
}
```

### PATCH `/notifications/read-all`
Mark all notifications as read.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "All notifications marked as read"
}
```

### DELETE `/notifications/{notification_id}`
Delete a notification.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## Credit Routes (`/credits`)

### GET `/credits/balance`
Get credit balance for authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "credits": 5.0,
  "locked_credits": 2.0,
  "available_credits": 3.0
}
```

### POST `/credits/add`
Add credits to user account (admin operation).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount": 1.0,
  "reason": "Item listed"
}
```

**Response:** `200 OK`

### POST `/credits/deduct`
Deduct credits from user account.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount": 2.0,
  "reason": "Item purchased"
}
```

**Response:** `200 OK`

### GET `/credits/transactions`
Get credit transaction history.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "id": "transaction_id",
    "user_id": "user_id",
    "amount": 1.0,
    "type": "credit",
    "reason": "Item listed",
    ...
  }
]
```

---

## Contact Routes (`/contact`)

### POST `/contact`
Submit contact form (contact, feedback, or bug report).

**Request Body:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "subject": "Subject",
  "message": "Message content",
  "type": "contact"
}
```

**Response:** `200 OK`
```json
{
  "message": "Contact form submitted successfully"
}
```

**Note:** `type` can be `"contact"`, `"feedback"`, or `"bug"`

---

## Error Responses

All routes may return the following error responses:

### 400 Bad Request
```json
{
  "detail": "Error message"
}
```

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "Not authorized to perform this action"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 422 Unprocessable Entity
```json
{
  "detail": {
    "message": "Validation error",
    "errors": [
      {
        "field": "email",
        "message": "Invalid email format",
        "type": "value_error"
      }
    ]
  }
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## CORS Configuration

The backend is configured to accept requests from:
- Development: `http://localhost:3000`
- Production: Configured via `CORS_ORIGINS` environment variable

---

## Notes

- All timestamps are in ISO 8601 format
- Image URLs are relative paths that should be prefixed with the API base URL
- Item metadata (category, size, location, condition, credits) is stored in the description field and parsed by the frontend
- Credit operations are atomic and include transaction logging
- Swap requests automatically lock credits when created
- Credits are refunded if swap requests are rejected or cancelled

