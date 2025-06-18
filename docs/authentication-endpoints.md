# Authentication API Endpoints

This document outlines the authentication API endpoints available in the FightYourTax.AI application, powered by Better Auth.

## Base Configuration

All authentication endpoints are handled through:
- **Route Handler**: `src/app/api/auth/[...all]/route.ts`
- **Base URL**: `/api/auth/*`
- **Handler**: Better Auth with `toNextJsHandler`

## Available Endpoints

### 1. User Registration

**Endpoint**: `POST /api/auth/sign-up/email`

**Purpose**: Register a new user with email and password

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Success Response** (201):
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "emailVerified": false
  },
  "session": {
    "id": "session_id",
    "userId": "user_id",
    "expiresAt": "2024-06-10T01:00:00.000Z"
  }
}
```

**Error Response** (400):
```json
{
  "error": "User with this email already exists"
}
```

### 2. User Login

**Endpoint**: `POST /api/auth/sign-in/email`

**Purpose**: Authenticate user with email and password

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Success Response** (200):
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "session": {
    "id": "session_id",
    "userId": "user_id",
    "expiresAt": "2024-06-10T01:00:00.000Z"
  }
}
```

**Error Response** (401):
```json
{
  "error": "Invalid email or password"
}
```

### 3. User Logout

**Endpoint**: `POST /api/auth/sign-out`

**Purpose**: Terminate user session

**Request**: No body required (uses session cookie)

**Success Response** (200):
```json
{
  "success": true
}
```

### 4. Get Current Session

**Endpoint**: `GET /api/auth/get-session`

**Purpose**: Retrieve current user session information

**Request**: No body required (uses session cookie)

**Success Response** (200):
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "session": {
    "id": "session_id",
    "userId": "user_id",
    "expiresAt": "2024-06-10T01:00:00.000Z"
  }
}
```

**No Session Response** (401):
```json
{
  "user": null,
  "session": null
}
```

### 5. CSRF Token

**Endpoint**: `GET /api/auth/csrf`

**Purpose**: Get CSRF token for form protection

**Success Response** (200):
```json
{
  "csrfToken": "csrf_token_value"
}
```

## Authentication Flow

### Registration Flow
1. Client sends POST to `/api/auth/sign-up/email`
2. Better Auth validates email/password
3. User record created in database
4. Session cookie set automatically
5. User data returned

### Login Flow
1. Client sends POST to `/api/auth/sign-in/email`
2. Better Auth validates credentials
3. Session created and cookie set
4. User data returned

### Logout Flow
1. Client sends POST to `/api/auth/sign-out`
2. Session invalidated
3. Cookie cleared
4. Success confirmation returned

## Session Management

- **Session Duration**: 7 days (configurable in `src/lib/auth.ts`)
- **Session Update**: Every 24 hours
- **Cookie Settings**: 
  - HttpOnly: true
  - Secure: true (in production)
  - SameSite: 'lax'

## Client-Side Usage

### Using with Auth Client

```typescript
import { authClient } from "@/lib/auth-client";

// Registration
const { data, error } = await authClient.signUp.email({
  email: "user@example.com",
  password: "password123",
  name: "John Doe"
});

// Login
const { data, error } = await authClient.signIn.email({
  email: "user@example.com",
  password: "password123"
});

// Logout
await authClient.signOut();

// Get session
const session = authClient.useSession();
```

### Direct API Calls

```typescript
// Registration
const response = await fetch('/api/auth/sign-up/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe'
  })
});

// Login
const response = await fetch('/api/auth/sign-in/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
```

## Error Handling

Common error status codes:
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid credentials or no session)
- **409**: Conflict (user already exists)
- **500**: Internal Server Error

All errors follow the format:
```json
{
  "error": "Human-readable error message"
}
```

## Database Schema

User records are stored with these fields:
- `id`: Unique identifier
- `email`: User email (unique)
- `name`: User display name
- `role`: User role ("user" or "admin")
- `emailVerified`: Email verification status
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

## Security Features

- **Password Hashing**: Automatic secure hashing
- **Session Management**: Secure HTTP-only cookies
- **CSRF Protection**: Built-in CSRF token support
- **Role-Based Access**: User roles for authorization
- **Trusted Origins**: Configurable trusted domains 