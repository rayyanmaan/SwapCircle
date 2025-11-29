# Test Credentials for SwapCircle

## Sample User Accounts

These are sample credentials you can use to test the authentication system once the backend is fully implemented.

### Test User 1
- **Email:** `test@swapcircle.com`
- **Username:** `testuser`
- **Password:** `test123`
- **Full Name:** `Test User`

### Test User 2
- **Email:** `student@minerva.edu`
- **Username:** `student1`
- **Password:** `password123`
- **Full Name:** `Student One`

### Test User 3
- **Email:** `demo@example.com`
- **Username:** `demo`
- **Password:** `demo123`
- **Full Name:** `Demo User`

## Current Status

⚠️ **Note:** The backend authentication endpoints are currently stubs. To test authentication:

1. **Option 1:** Use Mock Mode (Recommended for frontend testing)
   - Create a `.env.local` file in the `Frontend` directory
   - Add: `NEXT_PUBLIC_MOCK_AUTH=true`
   - Restart your Next.js dev server
   - You can now use the credentials below to test the frontend UI

2. **Option 2:** Wait for backend implementation
   - The backend routes (`/auth/login`, `/auth/register`) need to be fully implemented
   - Once implemented, set `NEXT_PUBLIC_MOCK_AUTH=false` or remove it
   - Use the credentials above to register and login

## Registration Requirements

When registering a new user, you'll need:
- **Email:** Valid email address
- **Username:** 3-20 characters, alphanumeric
- **Password:** Minimum 6 characters
- **Full Name:** Optional

## Expected User Data Structure

After successful login, the user object should contain:
```json
{
  "id": "user_id_here",
  "email": "test@swapcircle.com",
  "username": "testuser",
  "full_name": "Test User",
  "credits": 0,
  "items_listed": [],
  "instagram_handle": null,
  "whatsapp_number": null
}
```

