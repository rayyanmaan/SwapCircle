# Backend API Test Suite

This directory contains comprehensive tests for all backend API endpoints in the SwapCircle application.

## Test Structure

### Test Files

- **`conftest.py`** - Shared pytest fixtures and utilities used across all tests
- **`test_auth_routes_comprehensive.py`** - Tests for authentication endpoints (`/auth/*`)
- **`test_item_routes_comprehensive.py`** - Tests for item management endpoints (`/items/*`)
- **`test_swap_routes_comprehensive.py`** - Tests for swap request endpoints (`/swaps/*`)
- **`test_user_routes_comprehensive.py`** - Tests for user profile endpoints (`/users/*`)
- **`test_credit_routes_comprehensive.py`** - Tests for credit management endpoints (`/credits/*`)
- **`test_notification_routes_comprehensive.py`** - Tests for notification endpoints (`/notifications/*`)
- **`test_rating_routes_comprehensive.py`** - Tests for rating endpoints (`/ratings/*`)
- **`test_contact_routes_comprehensive.py`** - Tests for contact form endpoints (`/contact`)

### Legacy Test Files

The following test files exist from earlier development and are kept for backward compatibility:
- `test_auth_routes.py` - Basic auth route tests
- `test_rating_routes.py` - Basic rating route tests
- `test_rating_service.py` - Rating service unit tests
- `test_swap_service.py` - Swap service unit tests
- `test_lock_routes.py` - Item lock/unlock tests

## Running Tests

### Run All Tests
```bash
pytest
```

### Run Specific Test File
```bash
pytest tests/test_auth_routes_comprehensive.py
```

### Run Specific Test Class
```bash
pytest tests/test_auth_routes_comprehensive.py::TestRegister
```

### Run Specific Test
```bash
pytest tests/test_auth_routes_comprehensive.py::TestRegister::test_register_success
```

### Run with Verbose Output
```bash
pytest -v
```

### Run with Coverage
```bash
pytest --cov=Backend --cov-report=html
```

## Test Coverage

### Authentication Routes (`/auth`)
- ✅ User registration (success, duplicate email, duplicate username, validation)
- ✅ User login (success, invalid credentials, missing fields)
- ✅ Get current user (`/auth/me`) (success, missing auth, invalid token, user not found)
- ✅ Email verification (success, invalid token, user not found)

### Item Routes (`/items`)
- ✅ Create item (JSON, multipart with images, missing auth, validation)
- ✅ List items (all, filtered by owner, filtered by status, empty)
- ✅ Get item (success, not found, pending status)
- ✅ Update item (success, not owner, not found, with images)
- ✅ Delete item (success, not found)
- ✅ Lock item (success, own item, already locked)
- ✅ Unlock item (success, not owner, not locked)

### Swap Routes (`/swaps`)
- ✅ Request swap (success, own item, item unavailable, insufficient credits, duplicate request)
- ✅ Approve swap (success, not owner, request not found, not pending)
- ✅ Reject swap (success, not owner)
- ✅ Cancel swap (success, no request)
- ✅ Get swap requests (success, no auth)
- ✅ Get swap history (success, no auth)

### User Routes (`/users`)
- ✅ List users (success)
- ✅ Get user by username (success, not found)
- ✅ Get user by ID (success, not found)
- ✅ Update user profile (success, not owner, duplicate username)
- ✅ Upload profile picture (success, not owner)
- ✅ Add favorite (success, not authorized)
- ✅ Remove favorite (success)
- ✅ Get favorites (success)

### Credit Routes (`/credits`)
- ✅ Get balance (success, no auth)
- ✅ Add credits (success, negative amount, zero amount)
- ✅ Deduct credits (success, insufficient, negative amount)
- ✅ Get transactions (success, no auth)

### Notification Routes (`/notifications`)
- ✅ Get notifications (success, unread only, no auth)
- ✅ Get recent notifications (success)
- ✅ Get unread count (success)
- ✅ Mark notification as read (success, not found)
- ✅ Mark all as read (success)
- ✅ Delete notification (success, not found)

### Rating Routes (`/ratings`)
- ✅ Give rating (success, self-rating, invalid stars, no auth)
- ✅ Get my rating (exists, not exists)
- ✅ Get rating stats (success, no ratings)

### Contact Routes (`/contact`)
- ✅ Submit contact form (success, feedback, bug report, missing fields, invalid email, email failure)


## Test Fixtures

The `conftest.py` file provides shared fixtures:

- **`client`** - FastAPI TestClient instance
- **`mock_user`** - Mock user dictionary
- **`mock_user2`** - Second mock user for testing interactions
- **`mock_token`** - Mock authentication token
- **`mock_item`** - Mock item dictionary
- **`mock_swap_request`** - Mock swap request dictionary
- **`auth_headers`** - Authorization headers with mock token
- **`mock_auth_service`** - Mocked auth_service functions
- **`mock_user_service`** - Mocked user_service functions
- **`mock_storage_service`** - Mocked storage_service functions
- **`mock_swap_service`** - Mocked swap_service functions
- **`mock_credit_service`** - Mocked credit_service functions
- **`mock_image_service`** - Mocked image_service functions
- **`mock_notification_service`** - Mocked notification_service functions
- **`mock_rating_service`** - Mocked rating_service functions
- **`mock_email_service`** - Mocked email_service functions

## Testing Patterns

### Authentication Testing
All protected endpoints are tested for:
- Missing authorization header
- Invalid token format
- Invalid/expired tokens
- Unauthorized access (wrong user)

### Success Cases
Each endpoint includes tests for:
- Successful operations with valid data
- Proper response structure
- Correct status codes

### Error Cases
Each endpoint includes tests for:
- Missing required fields (422 validation errors)
- Invalid data formats
- Resource not found (404)
- Unauthorized access (401/403)
- Business logic errors (400)

### Mocking Strategy
- Services are mocked to avoid database dependencies
- External services (email, image storage) are mocked
- Authentication is mocked for consistent testing
- Database operations are mocked to keep tests fast and isolated

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on other tests
2. **Mocking**: External dependencies are mocked to avoid side effects
3. **Coverage**: Both success and error paths are tested
4. **Clarity**: Test names clearly describe what is being tested
5. **Organization**: Tests are grouped by endpoint/functionality

## Adding New Tests

When adding new endpoints or functionality:

1. Add test cases to the appropriate test file
2. Use existing fixtures from `conftest.py` when possible
3. Follow the existing naming conventions:
   - Test classes: `Test<EndpointName>`
   - Test methods: `test_<scenario>_<expected_outcome>`
4. Test both success and error cases
5. Include authentication/authorization tests for protected endpoints
6. Update this README with new test coverage

## Continuous Integration

These tests should be run:
- Before committing code
- In CI/CD pipelines
- Before deploying to production

## Notes

- Tests use FastAPI's `TestClient` which doesn't require a running server
- All async operations are properly handled by pytest-asyncio
- Mock data is consistent across tests for predictability
- Tests are designed to run quickly without external dependencies

