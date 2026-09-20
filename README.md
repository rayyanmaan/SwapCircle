<div align="center">

# SwapCircle

### A campus clothing exchange with no money in it — students swap wardrobes on a credit economy instead

<img src="https://img.shields.io/badge/FastAPI-async-009688?logo=fastapi&logoColor=white" alt="FastAPI">
<img src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs&logoColor=white" alt="Next.js 16">
<img src="https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=black" alt="React 19.1">
<img src="https://img.shields.io/badge/MongoDB-motor%20async-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
<img src="https://img.shields.io/badge/Docker-compose-2496ED?logo=docker&logoColor=white" alt="Docker Compose">
<img src="https://img.shields.io/badge/tests-140%20backend%20%C2%B7%2032%20frontend-3BB273" alt="140 backend, 32 frontend tests">
<img src="https://img.shields.io/badge/CI-Python%203.10%20%7C%203.11%20%7C%203.12-2E86AB" alt="CI matrix">

**[Watch the demo](https://drive.google.com/drive/folders/19RuniEnLB7I8uOnmebBP-4bIR8VTMZDC)** &nbsp;·&nbsp;
**[Architecture](#architecture)** &nbsp;·&nbsp;
**[The hard parts](#the-hard-parts)** &nbsp;·&nbsp;
**[Run it](#running-it)**

</div>

---

## What it is

Students throw out clothes constantly and buy replacements constantly. Resale platforms exist, but
they demand pricing, payment, shipping and trust between strangers — enough friction that a jacket
sits in a closet instead.

SwapCircle removes the money entirely. **List an item and you earn credits. Spend credits to claim
somebody else's item.** Nothing is priced in currency, nothing is shipped, and every counterparty is
on the same campus, so handover is a walk across a quad.

Taking money out does not simplify the system — it **relocates** the difficulty. With no payment
processor there is no external ledger to reconcile against, so the credit balance the app maintains
*is* the source of truth. An accounting bug does not show up as a failed charge; it silently mints
or destroys value. That constraint drove most of the engineering decisions below.

---

## Architecture

```
┌──────────────────────────────┐        ┌───────────────────────────────┐
│  Next.js 16 · React 19       │        │  FastAPI  (async, motor)      │
│                              │        │                               │
│  App Router pages            │  REST  │  9 routers · 46 endpoints     │
│  Context: Auth, Notification │ ─────▶ │    /auth /users /items /swaps │
│  Custom hooks (favourites,   │        │    /credits /ratings          │
│    profile, seller info)     │  JSON  │    /notifications /reports    │
│  Tailwind 4                  │ ◀───── │    /contact                   │
└──────────────────────────────┘        │                               │
        │                               │  services/  ← business logic  │
        │                               │  models/    ← Pydantic schemas│
   Jest · RTL · MSW                     │  routes/    ← HTTP only       │
   32 component tests                   └───────────────────────────────┘
                                             │                    │
                                     ┌───────▼────────┐  ┌────────▼────────┐
                                     │  MongoDB       │  │ Firebase Storage│
                                     │  (motor async, │  │ (item images)   │
                                     │   transactions)│  └─────────────────┘
                                     └────────────────┘
```

Routes stay thin: they validate, authorise, and delegate. Every rule that matters — credit
movement, swap state transitions, rating aggregation, image validation — lives in `services/`, which
is what makes 140 backend tests practical to write without spinning up HTTP for each one.

### Domain model

| Collection | Holds | Notable fields |
|---|---|---|
| `users` | Accounts and profiles | `salt`, `password_hash`, `credits`, social handles, `location` |
| `items` | Listings | `status`, `credits`, `locked_by`, `locked_until`, category/size/condition |
| `swap_requests` | Claim lifecycle | `status` ∈ `pending · approved · rejected · cancelled` |
| `transactions` | Append-only credit ledger | `user_id`, `amount`, `type`, `created_at` |
| `ratings` | Peer reputation | `stars` 1–5, aggregated into `average_rating` |

---

## The hard parts

The three problems below are the reason this is more than CRUD.

### 1. Credits must never be created or destroyed by accident

A naive `credits -= amount` has a race: two concurrent requests both read a balance of 5, both
approve a 5-credit spend, and the user spends 10 credits they never had.

`credit_service.deduct_credits()` runs the balance check, the ledger write and the balance update
inside a **MongoDB multi-document transaction**, so the three either all land or none do:

```python
async with client.start_session() as session:
    async with session.start_transaction():
        user = await get_user_by_id(user_id, session=session)
        if user.get("credits", 0.0) < amount:
            raise ValueError(f"Insufficient credits. Balance: {...}, required: {amount}")
        await _record_transaction(...)      # append-only audit row
        await update_user(...)              # denormalised balance
```

There are **two** representations of a balance on purpose: the append-only `transactions` ledger is
the authoritative history, and `users.credits` is a denormalised cache so a profile page is one read
rather than a full aggregation. That is a deliberate trade — and because denormalised values drift,
`sync_user_credits_from_transactions()` exists to recompute the cache from the ledger and repair it.

MongoDB transactions need a replica set and are unavailable on a standalone `mongod`, which is
exactly what a teammate running `docker compose up` gets. Rather than making local development
require a replica set, the service detects the capability and degrades to sequential writes.

### 2. Two people must not claim the same jacket

Items are physical and unique — the swap flow takes real time, and there is exactly one of each.

The fix is an **explicit lock with a TTL**. `POST /items/{id}/lock` sets `status = "locked"`,
records `locked_by`, and stamps `locked_until = now + 24h`. A second claimant is rejected with
`400 already locked`; the owner is blocked from locking their own item with a `403`. The expiry is
what keeps the system from deadlocking on abandoned swaps, since an unattended lock would otherwise
take an item off the market permanently.

### 3. Swap state must move in one direction

A claim moves `pending → approved | rejected | cancelled`, and that lifecycle is enforced with a
typed `SwapRequestStatus` enum rather than raw strings, so an invalid transition fails at the
Pydantic boundary instead of reaching the database. Approval is the point where a credit transfer, a
status change, a lock release and a notification all have to agree — the single most test-covered
path in the codebase.

---

## Testing and CI

| | Count | Tooling |
|---|---:|---|
| Backend tests | **140** | pytest, pytest-asyncio, httpx `AsyncClient` |
| Frontend tests | **32** across 12 files | Jest, React Testing Library, MSW, jest-fetch-mock |
| CI matrix | 3 versions | GitHub Actions on Python 3.10, 3.11, 3.12 |

The backend suite is split between per-route coverage (`test_*_routes_comprehensive.py`) and
service-level tests for the logic that actually holds invariants (`test_credit_system.py`,
`test_swap_service.py`, `test_rating_service.py`, `test_lock_routes.py`). Services are tested
directly rather than only through HTTP, so a credit-arithmetic failure surfaces as a failing unit
test instead of a confusing 500.

On the frontend, MSW intercepts at the network layer, which means components are tested against
realistic request/response cycles rather than hand-stubbed fetch mocks.

CI runs on pushes and pull requests that touch `Backend/**`, so the matrix build is not triggered by
unrelated frontend changes.

---

## Stack

<table>
<tr><td width="50%" valign="top">

**Backend**

| | |
|---|---|
| FastAPI | Async routers, dependency injection, OpenAPI at `/docs` |
| motor | Async MongoDB driver |
| Pydantic v1/v2 | Request/response schemas — `config.py` supports both |
| firebase-admin | Item image storage |
| passlib, python-multipart | Auth helpers, file uploads |
| pytest + pytest-asyncio | 140 tests |

</td><td width="50%" valign="top">

**Frontend**

| | |
|---|---|
| Next.js 16 (App Router, Turbopack) | Routing, SSR, dev/build |
| React 19.1 | Contexts for auth + notifications |
| Tailwind CSS 4 | Styling via PostCSS |
| Jest + RTL + MSW | 32 component/integration tests |
| Custom hooks | `useFavorites`, `useProfileData`, `useSellerInfo` |

</td></tr>
</table>

Shared concerns live where they belong: `contexts/` for auth and notification state, `hooks/` for
data access, `utils/validators/` split by domain (`user`, `item`, `access`, `errors`), and
`services/api.js` as the single fetch boundary — with a `__mocks__` twin so tests never reach the
network by accident.

---

## Running it

**Docker Compose is the supported path.** It brings up MongoDB, the API and the web app together.

```bash
git clone https://github.com/rayyanmaan/SwapCircle.git
cd SwapCircle

# Backend/.env.local  — create this yourself, never commit it
#   MONGODB_URI=mongodb://mongo:27017/swapcircle
#   DATABASE_NAME=swapcircle
#   JWT_SECRET_KEY=<generate: openssl rand -hex 32>
#   FIREBASE_STORAGE_BUCKET=<your-bucket>.appspot.com
#   FIREBASE_CREDENTIALS_PATH=/app/firebase-credentials.json
#
# Frontend/.env.local
#   NEXT_PUBLIC_API_URL=http://localhost:8000

docker compose up --build
```

| Service | URL |
|---|---|
| Web app | http://localhost:3000 |
| API | http://localhost:8000 |
| OpenAPI docs | http://localhost:8000/docs |

<details>
<summary><b>Running the two halves manually</b></summary>

```bash
# Backend
cd Backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
pytest                       # 140 tests

# Frontend
cd Frontend
npm install
npm run dev                  # http://localhost:3000
npm test                     # Jest with coverage
```

The backend falls back to a local MongoDB at `mongodb://mongo:27017/swapcircle` if the configured
URI is unreachable, so a first run works before any Atlas setup.

</details>

> **Secrets:** every credential is read from environment variables. Firebase service-account JSON and
> `.env*` files must stay out of version control — `.gitignore` excludes both. If you fork this,
> generate your own `JWT_SECRET_KEY` and your own Firebase key rather than reusing any value you
> find in the repository's history.

---

## Repository map

```
SwapCircle/
├── Backend/
│   ├── main.py                    FastAPI app, CORS, lifespan DB connect/close
│   ├── routes/                    9 routers, 46 endpoints — HTTP only
│   ├── services/                  business logic: credits, swaps, auth, images,
│   │                              ratings, notifications, email, storage
│   ├── models/                    Pydantic schemas + status enums
│   ├── database/connection.py     motor client lifecycle
│   ├── tests/                     140 tests, route- and service-level
│   └── Dockerfile
├── Frontend/
│   ├── src/app/                   App Router pages (browse, product, profile,
│   │                              upload, settings, legal)
│   ├── src/components/            ~25 components, 12 with test files
│   ├── src/contexts/              Auth + Notification providers
│   ├── src/hooks/                 data-access hooks
│   ├── src/services/api.js        single fetch boundary (+ __mocks__)
│   ├── src/utils/validators/      domain-split validation
│   └── Dockerfile
├── Documentation/                 architecture, specs, team roles
├── codebase/                      per-layer reference docs
├── .github/workflows/             CI: backend tests on 3 Python versions
└── docker-compose.yml             mongo + backend + frontend
```

---

## My contribution

SwapCircle was built by a **team of seven**. Claiming the whole thing would be dishonest, so
specifically, I worked on:

- **Application entry point and database layer** — `main.py`, CORS and middleware setup, and the
  `motor` connection lifecycle wired to FastAPI's `lifespan`.
- **The items domain end to end** — `item_routes.py` is the largest router in the project at 12
  endpoints, covering listing CRUD, search and filtering, the lock/unlock mechanism, and the
  request/approve/reject swap flow.
- **Item test coverage**, plus the OpenAPI surface exposed at `/docs`.
- **Frontend components** — the area I touched most by commit count, including browse and listing
  views.

Teammates owned authentication and the credit service (Katia), media services, Docker and CI
(Kazeem), and the bulk of frontend architecture (Hasnain, Mulyn, Aiman). The credit-transaction code
quoted above is a teammate's work; it is included here because the README should describe the
system, not only my part of it.

---

## Known limitations

Worth stating plainly rather than leaving for a reader to discover:

1. **Password hashing uses salted SHA-256.** `auth_service.py` applies a per-user random salt, which
   defeats rainbow tables, but SHA-256 is a *fast* hash and therefore brute-forceable on commodity
   GPUs. `passlib[bcrypt]` is already a dependency; migrating to bcrypt or Argon2 with a rehash-on-
   login path is the highest-value security fix outstanding.
2. **Access tokens are HMAC-signed strings, not standards-compliant JWTs.** They work, but they lack
   expiry claims and a revocation path.
3. **Denormalised balances can drift.** `sync_user_credits_from_transactions()` repairs them, but
   nothing runs it on a schedule.
4. **Lock expiry is not swept.** `locked_until` is written and checked, but no background job
   releases locks once they lapse.
5. **No end-to-end tests.** Unit and integration coverage is solid; nothing exercises a full
   browser-level swap between two accounts.
