# Mock Authentication Mode

This document explains how to enable mock authentication for frontend testing when the backend is not available.

## How to Enable Mock Mode

1. Create a `.env.local` file in the `Frontend` directory (if it doesn't exist)
2. Add this line: `NEXT_PUBLIC_MOCK_AUTH=true`
3. Restart your Next.js development server
4. The authentication will now work with mock responses

## Mock Credentials

When mock mode is enabled, you can use these pre-configured credentials:

### Pre-configured Test Accounts:
- **Email:** `test@swapcircle.com` | **Password:** `test123`
  - Username: `testuser`
  - Credits: 5
  
- **Email:** `student@minerva.edu` | **Password:** `password123`
  - Username: `student1`
  - Credits: 3
  
- **Email:** `demo@example.com` | **Password:** `demo123`
  - Username: `demo`
  - Credits: 10

### Any Other Credentials:
- Any email/password combination will work in mock mode
- The system will automatically create a mock user with the provided email
- Username will be derived from the email (part before @)
- Credits will start at 0

## What Mock Mode Does

- **Login:** Accepts any credentials and returns a mock token
- **Register:** Creates a mock user and automatically logs in
- **Get Current User:** Returns mock user data
- **No Backend Required:** All authentication happens in the browser

## Disabling Mock Mode

1. Remove `NEXT_PUBLIC_MOCK_AUTH=true` from `.env.local`, or set it to `false`
2. Restart your Next.js development server
3. The app will now use the real backend API (requires backend to be running)

