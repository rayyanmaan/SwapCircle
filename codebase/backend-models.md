# Backend Data Models Documentation

This document describes all Pydantic models used in the SwapCircle backend for request/response validation and data serialization.

## Overview

All models are located in `Backend/models/` and use Pydantic for:
- Request validation
- Response serialization
- Type checking
- Automatic API documentation

---

## User Models (`user_model.py`)

### `UserCreate`
Model for user registration.

```python
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = ""
    password: str
```

**Fields:**
- `email`: Valid email address (validated by Pydantic)
- `username`: Unique username
- `full_name`: Optional full name
- `password`: Plain text password (will be hashed)

### `UserUpdate`
Model for updating user profile.

```python
class UserUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    instagram_handle: Optional[str] = None
    whatsapp_number: Optional[str] = None
    facebook_url: Optional[str] = None
    twitter_handle: Optional[str] = None
    linkedin_url: Optional[str] = None
```

**Fields:** All fields are optional for partial updates.

### `UserOut`
Model for user response data.

```python
class UserOut(BaseModel):
    id: str
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    credits: float = 0.0
    email_verified: bool = False
    bio: Optional[str] = None
    profile_pic: Optional[str] = None
    instagram_handle: Optional[str] = None
    whatsapp_number: Optional[str] = None
    facebook_url: Optional[str] = None
    twitter_handle: Optional[str] = None
    linkedin_url: Optional[str] = None
```

**Fields:**
- `id`: User ID (MongoDB ObjectId as string)
- `credits`: Current credit balance
- `email_verified`: Email verification status
- Social media fields are optional

### `Login`
Model for login request.

```python
class Login(BaseModel):
    email: EmailStr
    password: str
```

### `AuthResponse`
Model for authentication response.

```python
class AuthResponse(BaseModel):
    token: str
    user: UserOut
```

---

## Item Models (`item_model.py`)

### `ImageOut`
Model for image data in responses.

```python
class ImageOut(BaseModel):
    id: str
    url: str
```

**Fields:**
- `id`: Image ID
- `url`: Image URL (relative or absolute)

### `ItemCreate`
Model for creating a new item.

```python
class ItemCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    size: Optional[str] = None
    location: Optional[str] = None
    condition: Optional[str] = None
    branded: Optional[str] = "No"
    credits: Optional[float] = 1.0
```

**Fields:**
- `title`: Item title (required)
- `description`: Item description (may contain metadata)
- `category`: Item category (e.g., "tops", "bottoms", "shoes")
- `size`: Item size (e.g., "S", "M", "L")
- `location`: Campus location
- `condition`: Item condition (e.g., "like_new", "good", "fair")
- `branded`: Whether item is branded ("Yes" or "No")
- `credits`: Credits required for swap (default: 1.0)

**Note:** Metadata (category, size, location, condition, credits) is currently stored in the description field and parsed by the frontend. Future versions should store these as separate fields.

### `ItemUpdate`
Model for updating an item.

```python
class ItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    size: Optional[str] = None
    location: Optional[str] = None
    condition: Optional[str] = None
    branded: Optional[str] = None
    credits: Optional[float] = None
    status: Optional[str] = None
```

**Fields:** All fields are optional for partial updates.

### `ItemOut`
Model for item response data.

```python
class ItemOut(ItemCreate):
    id: str
    owner_id: Optional[str] = None
    status: str = "available"
    images: List[ImageOut] = []
```

**Fields:**
- `id`: Item ID (MongoDB ObjectId as string)
- `owner_id`: ID of user who owns the item
- `status`: Item status (`"available"`, `"pending"`, `"sold"`, `"locked"`)
- `images`: List of image objects

**Inherits:** All fields from `ItemCreate`

---

## Swap Request Models (`swap_request_model.py`)

### `SwapRequestStatus`
Enum for swap request status.

```python
class SwapRequestStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
```

### `SwapRequestCreate`
Model for creating a swap request.

```python
class SwapRequestCreate(BaseModel):
    item_id: str
    requester_id: str
    credits_required: float
```

**Fields:**
- `item_id`: ID of item being requested
- `requester_id`: ID of user making the request
- `credits_required`: Credits required for the swap

### `SwapRequestOut`
Model for swap request response.

```python
class SwapRequestOut(BaseModel):
    id: str
    item_id: str
    requester_id: str
    credits_required: float
    status: SwapRequestStatus
    created_at: str
    updated_at: Optional[str] = None
```

**Fields:**
- `id`: Swap request ID
- `status`: Current status (enum)
- `created_at`: ISO 8601 timestamp
- `updated_at`: ISO 8601 timestamp (optional)

### `SwapRequestUpdate`
Model for updating swap request status.

```python
class SwapRequestUpdate(BaseModel):
    status: SwapRequestStatus
```

---

## Transaction Models (`transaction_model.py`)

### `TransactionType`
Enum for transaction types.

```python
class TransactionType(str, Enum):
    CREDIT_ADD = "credit_add"
    CREDIT_DEDUCT = "credit_deduct"
    ITEM_UPLOAD = "item_upload"
    SWAP_CREDIT = "swap_credit"
    SWAP_DEBIT = "swap_debit"
    PURCHASE = "purchase"
```

### `TransactionCreate`
Model for creating a transaction.

```python
class TransactionCreate(BaseModel):
    user_id: str
    amount: float
    type: TransactionType
    description: Optional[str] = ""
```

**Fields:**
- `user_id`: ID of user involved in transaction
- `amount`: Transaction amount (positive for credits, negative for debits)
- `type`: Type of transaction (enum)
- `description`: Optional description

### `TransactionOut`
Model for transaction response.

```python
class TransactionOut(BaseModel):
    id: str
    user_id: str
    amount: float
    type: TransactionType
    description: Optional[str]
    created_at: str
```

**Fields:**
- `id`: Transaction ID
- `created_at`: ISO 8601 timestamp

### `CreditBalance`
Model for credit balance response.

```python
class CreditBalance(BaseModel):
    user_id: str
    balance: float
```

### `CreditAddRequest`
Model for adding credits.

```python
class CreditAddRequest(BaseModel):
    amount: float
```

### `CreditDeductRequest`
Model for deducting credits.

```python
class CreditDeductRequest(BaseModel):
    amount: float
```

---

## Rating Models (`rating_model.py`)

### `RatingCreate`
Model for creating a rating.

```python
class RatingCreate(BaseModel):
    stars: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
```

**Fields:**
- `stars`: Rating value (1-5, validated by Pydantic)

### `RatingOut`
Model for rating response.

```python
class RatingOut(BaseModel):
    id: str
    rater_user_id: str
    rated_user_id: str
    stars: int = Field(..., ge=1, le=5)
    created_at: datetime
    updated_at: datetime
```

**Fields:**
- `id`: Rating ID
- `rater_user_id`: ID of user giving the rating
- `rated_user_id`: ID of user being rated
- `stars`: Rating value (1-5)
- `created_at`: Timestamp when rating was created
- `updated_at`: Timestamp when rating was last updated

### `UserRatingStats`
Model for user rating statistics.

```python
class UserRatingStats(BaseModel):
    average_rating: float = Field(..., ge=0.0, le=5.0)
    total_ratings: int = Field(..., ge=0)
    rating_breakdown: Optional[dict] = None
```

**Fields:**
- `average_rating`: Average rating (0.0-5.0)
- `total_ratings`: Total number of ratings
- `rating_breakdown`: Optional dictionary with rating distribution (e.g., `{1: 0, 2: 1, 3: 2, 4: 3, 5: 4}`)

---

## Message Models

Message models are defined inline in `Backend/routes/message_routes.py`.

### `MessageCreate`
Model for creating a message.

```python
class MessageCreate(BaseModel):
    recipient_id: str
    content: str
```

### `MessageOut`
Model for message response.

```python
class MessageOut(BaseModel):
    id: str
    sender_id: str
    recipient_id: str
    content: str
    created_at: str
    read: bool = False
```

---

## Notification Models

Notification models are defined inline in `Backend/routes/notification_routes.py`.

### `NotificationOut`
Model for notification response.

```python
class NotificationOut(BaseModel):
    id: str
    user_id: str
    type: str
    message: str
    data: Optional[Dict[str, Any]] = None
    read: bool = False
    created_at: str
```

**Fields:**
- `type`: Notification type (e.g., `"swap_request"`, `"swap_approved"`, `"swap_rejected"`)
- `data`: Optional additional data as dictionary

---

## Contact Models

Contact models are defined in `Backend/routes/contact_routes.py`.

### `ContactRequest`
Model for contact form submission.

```python
class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str
    type: str  # 'contact' | 'feedback' | 'bug'
```

**Fields:**
- `type`: Type of contact (`"contact"`, `"feedback"`, or `"bug"`)

---

## Model Patterns

### Optional Fields
Most update models use `Optional` fields to allow partial updates.

### Field Validation
- Email fields use `EmailStr` for validation
- Numeric fields use `Field(..., ge=X, le=Y)` for range validation
- Enum fields use `Enum` classes for type safety

### ID Fields
- All output models include `id: str` field
- IDs are MongoDB ObjectIds converted to strings

### Timestamps
- Timestamps are stored as ISO 8601 strings or `datetime` objects
- `created_at` is typically required
- `updated_at` is typically optional

### Inheritance
- `ItemOut` inherits from `ItemCreate` to include all creation fields
- This pattern reduces code duplication

---

## Database Schema Mapping

Models map to MongoDB collections as follows:

- `UserOut` → `users` collection
- `ItemOut` → `items` collection (or JSON file storage in development)
- `SwapRequestOut` → `swap_requests` collection
- `TransactionOut` → `transactions` collection
- `RatingOut` → `ratings` collection
- `MessageOut` → `messages` collection
- `NotificationOut` → `notifications` collection

---

## Notes

- All models use Pydantic v2 features
- Models are automatically validated on request/response
- FastAPI generates OpenAPI documentation from models
- Enum types provide type safety and validation
- Optional fields allow flexible partial updates
- Field validators ensure data integrity

