# Backend Work Items — Scan Results

Generated: 2025-11-28

Purpose
- This document summarizes what the frontend currently expects from the backend, which backend endpoints are implemented, which are stubbed/missing, and recommended next work items to turn the project into a fully working app.

Scan summary
- I scanned both `Frontend/` and `Backend/` and collected TODO markers, mock usages, and API calls from the frontend.
- Frontend uses a `MOCK_MODE` for auth and a `mockItems.json` dataset. Several frontend components include `TODO` comments indicating missing backend integration.

Frontend → Backend API expectations (found in `Frontend/src/services/api.js` and other files)
- Auth
  - POST `/auth/register` — expected: register and return token + user
    - Backend: implemented in `Backend/routes/auth_routes.py` (returns token + user)
  - POST `/auth/login` — expected: return token + user
    - Backend: implemented in `Backend/routes/auth_routes.py`
  - GET `/auth/me` — expected: return current authenticated user
    - Backend: implemented in `Backend/routes/auth_routes.py`
  - POST `/auth/verify/{token}` — expected: verify email by token
    - Backend: MISSING (no `/auth/verify` route in `Backend/routes/auth_routes.py`)

- Users
  - GET `/users/{userId}` — expected: return user profile (id, email, username, full_name, credits etc.)
    - Backend: `Backend/routes/user_routes.py` is a stub (returns minimal `{ user: { id } }`)
  - PATCH `/users/{userId}` — expected: update profile
    - Backend: MISSING (user_routes has no PATCH implementation)

- Items
  - GET `/items` — list items
    - Backend: implemented in `Backend/routes/item_routes.py`
  - GET `/items/{itemId}` — get single item
    - Backend: implemented
  - POST `/items` — create item (frontend `UploadForm` will need to submit multipart/form-data with images)
    - Backend: implemented — accepts an item body (JSON) and optional `images: List[UploadFile]` via multipart. Good, but verify expected request shape with frontend.
  - PATCH `/items/{itemId}` — update item (supports images)
    - Backend: implemented
  - DELETE `/items/{itemId}` — delete
    - Backend: implemented
  - POST `/items/{item_id}/lock` & `/unlock` — used as simple locking, available in backend
    - Backend: implemented (dev-only locking endpoints)

- Credits / Messages / Swap / Other features
  - `/credits/*` — frontend may expect credit balance modification (UploadForm uses credits value but no direct call yet)
    - Backend: `Backend/routes/credit_routes.py` is a stub. Needs proper implementation.
  - `/messages/*` — messaging / contact seller
    - Backend: `Backend/routes/message_routes.py` is a stub.
  - Swap/request flow — frontend includes TODOs for swap/request buttons and a swap feature
    - Backend: No explicit swap-request endpoints (only lock/unlock). Consider adding `/swaps` or `/requests` endpoints to record proposals and manage approvals.

- Frontend mock usage
  - `Frontend/src/services/api.js` supports `MOCK_MODE` (env `NEXT_PUBLIC_MOCK_AUTH`) that bypasses backend and stores mock token/user in localStorage.
  - `Frontend/src/data/mockItems.json` is used by listing components until backend integration is implemented.
  - `Frontend/src/components/ListingPage.js` and `Frontend/src/app/listing/page.js` contain TODOs to replace mock data with real API integration.

Backend-side stubs and gaps (direct action items)
1. Add `/auth/verify/{token}` route in `Backend/routes/auth_routes.py` (or remove expectation in frontend). Implementation can be a no-op dev flow or update user metadata to mark email_verified.
2. Replace user route stubs with real implementations that use `Backend.services.user_service`:
   - `GET /users/{id}` should return full user object matching the frontend expectations (id, email, username, full_name, credits).
   - `PATCH /users/{id}` to update `username`, `full_name`, and other profile fields. Ensure authentication/authorization checks if necessary.
3. Implement credits endpoints (`GET /credits/balance`, `POST /credits/add`) with user-backed balances tracked in user storage or a simple ledger.
4. Implement messages (contact seller) endpoints: `POST /messages` and `GET /messages?userId=` to support inbox-like behavior.
5. Add swap/request endpoints (recommended):
   - `POST /swaps` (create a swap request between users/items)
   - `GET /swaps` (list requests)
   - `POST /swaps/{id}/accept|reject` — allow sellers to accept/reject requests
   This is necessary to replace the frontend placeholder `handleSwapClick` with a real flow.
6. Improve `users` and `items` data linking:
   - When creating items, capture `owner_id` = authenticated user id (requires integrating auth into the create item endpoint).
   - When listing items, include owner metadata or allow `GET /users/{id}` to provide owner info for the frontend to show seller details.
7. Add `/auth/verify` email flow or update frontend to skip verification in dev.
8. Ensure consistent response shapes and error responses match frontend error handling (often reads `data.detail` or `data.message`). Use `detail` or `message` consistently.

Cross-cutting backend improvements (recommended)
- Migrate from JSON file storage to a DB (Postgres or MongoDB) and add an abstraction layer (repository/service) so the frontend can scale.
- Replace simple HMAC token auth with standard JWTs and a secure password hashing function (`bcrypt`/`argon2`) for production.
- Add input validation, size/type checks for image uploads, and sanitize filenames. Consider limiting image size and count.
- Add CORS, rate-limiting, and request throttling for public endpoints.
- Add structured logging and centralized error handling.
- Add automated tests that cover the full API surface (auth, items including images, user profile edits, swap flows).
- Add GitHub Actions CI to run `pytest Backend/tests` on PRs and run frontend lint/tests.

Suggested prioritized implementation plan (small increments)
1. High priority (small, high impact)
   - Implement `GET /users/{id}` and `PATCH /users/{id}` using `user_service` to return/update the real user object.
   - Implement `/auth/verify/{token}` as a dev-flow endpoint (mark email_verified or return 200).
   - Wire item creation to use authenticated user as `owner_id` (update `create_item` route to read Authorization Bearer token with `auth_service`).
   - Add a small example in the frontend `UploadForm` showing how to submit `multipart/form-data` to `/items`.

2. Medium priority
   - Implement credits endpoints and persist balances on user object.
   - Implement messages endpoints (create/list) and a basic schema.
   - Implement swap/request endpoints (create/list/accept/reject) — or at minimum wire lock/unlock to a user action flow.

3. Lower priority / nice to have
   - Migrate storage to a DB and add CI automation.
   - Replace mock auth with full auth flow and remove `MOCK_MODE` or keep it as a dev fallback behind the env var.

Concrete next steps I can take now
- Implement `GET/PATCH /users/{id}` and `/auth/verify/{token}` in `Backend/routes/` and add small tests. (Low-risk, quick wins.)
- Implement a simple `POST /swaps` and `POST /messages` stub wired to file storage for end-to-end flow.
- Add example frontend changes that submit `UploadForm` to `/items` (showing `FormData` usage) so the app can be tested end-to-end.

Which of these should I do next? I can start with implementing the user endpoints and `/auth/verify/{token}` (recommended), or I can implement an `UploadForm` -> `/items` integration example so you can test uploads immediately.