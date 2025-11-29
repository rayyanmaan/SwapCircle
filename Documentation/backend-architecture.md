# Backend Architecture

## Credit System Implementation

### Credit Flow
- **User downloads app** → 0 credits
- **User uploads an item** → +1 credit (so two uploads minimum to buy your first item)
- **User wants an item** → -2 credits
- **"Locking item"** → Locking in 2 credits that are reserved for this item
  - Seller has already posted details on how long item can be locked
- **User sells an item** → +1 credit

## Backend Coverage Areas

### Core Functionality
1. **User management** – Authentication, profiles, roles
2. **Item listings** – Upload, view, update, delete clothing items
3. **Exchange logic** – Matching, requests, approvals, transactions
4. **Database design + schema** – MongoDB models and relationships
5. **API development (REST/FastAPI)** – Endpoints for frontend
6. **Notifications or chat system** (optional)
7. **Deployment + integration** – Firebase, AWS, Render, etc.

### Additional Features
- Notification about swap happening through automated email
- Feature for different countries or campuses using filter by locations

## File Structure

```
backend/
│
├── app/
│   ├── main.py                # Entry point
│   ├── config.py              # Environment variables, DB setup
│   ├── models/                # MongoDB schemas
│   │   ├── user_model.py
│   │   ├── item_model.py
│   │   ├── message_model.py
│   │   └── transaction_model.py
│   ├── routes/                # All API routes
│   │   ├── auth_routes.py
│   │   ├── user_routes.py
│   │   ├── item_routes.py
│   │   ├── credit_routes.py
│   │   └── message_routes.py
│   ├── services/              # Helper logic
│   │   ├── credit_service.py
│   │   ├── email_service.py
│   │   ├── auth_service.py
│   │   └── image_service.py
│   ├── utils/                 # Utility functions
│   │   ├── token_utils.py
│   │   ├── validators.py
│   │   └── constants.py
│   └── database/
│       └── connection.py
│
├── tests/                     # Unit tests
├── requirements.txt
└── README.md
```

## Task Split - Independent Work Model

Each team member works completely independently on their timeline without needing others to finish something first. No API calls or logic that depends on another teammate's code. Everything integrates smoothly later, but each part is self-contained.

### Team Member 1 — Rayyan (User & Authentication)

**Goal:** Everything related to users, registration, login, and profile info.

**Files to Own:**
- `auth_routes.py`
- `auth_service.py`
- `user_routes.py`
- `validators.py`
- `token_utils.py`
- `user_model.py`

**Tasks (Independent):**
- Implement registration (`/register`) and login (`/login`) routes
- Implement email verification (`/verify/{token}`)
- Implement `/me` and `/users/{id}` endpoints returning user info + contact info
- Include all credit fields (`credits`, `base_credits`) in user model but no logic for credit changes—just store and return values
- Include contact fields (`instagram_handle`, `whatsapp_number`)
- Unit tests: registration, login, email verification, fetching profiles

**Independence:**
- Can create dummy initial credits for users (`credits = BASE_CREDITS`) without waiting for Kazeem
- Users' `items_listed` can be an empty array for now; Katia will later update it
- No calls to items, reservations, or credit logic are needed

### Team Member 2 — Kazeem (Credits & Reservations)

**Goal:** Standalone credit and reservation services that don't require live items or users.

**Files to Own:**
- `credit_service.py`
- `reservation_service.py`
- `reservation_model.py`
- `transaction_model.py`

**Tasks (Independent):**
- Implement all credit logic (`add_credit()`, `deduct_credit()`, `lock_credit()`, `refund_credit()`)
- Implement reservation logic using dummy references: `item_id`, `buyer_id`, `seller_id` can just be `ObjectId()` placeholders
- Implement expiry checks for reservations with timestamps
- Unit tests: credit operations and reservation expiry/refund logic

**Independence:**
- Kazeem doesn't need actual user or item collections—just reference IDs
- No API calls from items or users are needed
- The services can be fully tested with dummy/mock data

### Team Member 3 — Katia (Items & Images)

**Goal:** CRUD and image handling for items with static user/contact info—no dependency on actual users or credit logic.

**Files to Own:**
- `item_routes.py`
- `item_model.py`
- `image_service.py`

**Tasks (Independent):**
- Implement item endpoints: `GET /items`, `GET /items/{id}`, `POST /items`, `PATCH /items/{id}`, `DELETE /items/{id}`
- Include `contact_info` as a static field in items (`instagram`, `whatsapp`, `email`)—doesn't have to reference actual user collection
- Include `status` (`available`, `locked`, `sold`) but locking logic can be simulated with dummy flags
- Image upload and delete functionality
- Unit tests: CRUD and image handling

**Independence:**
- Can work fully with static or dummy data for `seller_id`, `locked_by`, `contact_info`
- No real calls to credits or reservations are needed
- Can simulate locking by changing status field locally

## Key Points for Fully Independent Work

### Dummy Data Everywhere
- Users: predefined credits
- Items: dummy `seller_id`
- Reservations: dummy IDs

### No Inter-Service Calls Required
- Katia does not need Rayyan's user API or Kazeem's credit/reservation service
- Kazeem does not need items or users to exist
- Rayyan does not need items or credit logic to return profiles

### Integration Later
- Once everyone is done, the team can replace dummy IDs with real references and integrate routes
- Services will be connected through shared database models
- API endpoints will be unified

## Additional Backend Tasks

### Kazeem's Additional Responsibilities
- `app/services/media_service.py`
- `app/api/v1/media.py`
- `app/workers/*` (expire_reservations/reset_daily_posts)
- Docker + CI + deploy files

### Rayyan's Additional Responsibilities
- `app/main.py`
- `app/db.py`
- `app/api/v1/items.py`
- `app/services/item_service.py`
- Search & filters
- OpenAPI exposure
- Item tests

### Katia's Additional Responsibilities
- `app/models/user.py`
- `app/services/credit_service.py`
- `app/api/v1/auth.py` (register/login/verify)
- `app/api/v1/users.py` (me/credits)
- Transactions collection
- Unit tests for credit flows

## External Resources

- ChatGPT conversations for architecture planning:
  - [Architecture Discussion](https://chatgpt.com/s/t_68f63ee2a2dc8191872e534b5cb52ae1)
  - [Task Split Discussion](https://chatgpt.com/c/68f6364f-8334-8332-8585-59db782fe10f)

## TODO & Next Steps

### Integration Tasks
- [ ] Replace dummy IDs with real references once all team members complete their independent work
- [ ] Connect services through shared database models
- [ ] Unify API endpoints and test end-to-end flows
- [ ] Integrate credit system with item locking/unlocking
- [ ] Connect user authentication with item ownership

### Testing & Quality
- [ ] Add integration tests for cross-service functionality
- [ ] Review and consolidate unit tests from all team members
- [ ] Set up continuous integration pipeline
- [ ] Add API documentation (OpenAPI/Swagger)

### Deployment
- [ ] Finalize deployment configuration
- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Test deployment pipeline

### Documentation
- [ ] Update file structure to match actual implementation
- [ ] Document API endpoints with request/response examples
- [ ] Add database schema diagrams
- [ ] Document deployment process
