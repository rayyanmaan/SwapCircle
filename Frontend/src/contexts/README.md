# Authentication System

This directory contains the authentication context and related components for SwapCircle.

## Files

- `AuthContext.js` - React context provider for managing authentication state

## Usage

The `AuthProvider` is already wrapped around the app in `app/layout.js`. You can use the `useAuth` hook in any component:

```javascript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, register, logout, loading } = useAuth();
  
  // Use authentication state and methods
}
```

## API

The authentication system expects the backend to provide the following endpoints:

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current authenticated user
- `POST /auth/verify/{token}` - Verify email with token

## Environment Variables

Set `NEXT_PUBLIC_API_URL` in your `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Token Storage

Tokens are stored in `localStorage` and automatically included in API requests via the Authorization header.

