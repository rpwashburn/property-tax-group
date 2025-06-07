# Authentication System Documentation

## Overview

This Property Tax Group application features a comprehensive authentication system built with [Better Auth](https://better-auth.com/), providing secure user registration, login, session management, and password reset functionality.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Setup & Configuration](#setup--configuration)
- [User Flows](#user-flows)
- [API Endpoints](#api-endpoints)
- [Components](#components)
- [Database Schema](#database-schema)
- [Security Features](#security-features)
- [Development](#development)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## Features

### ✅ **Complete Authentication Flow**
- User registration with email/password
- User login with session management
- Secure logout functionality
- Password reset via email (forgot password)
- Authenticated password change (dashboard)
- Admin user seeding and management

### ✅ **Security Features**
- Secure password hashing (bcrypt)
- Session-based authentication with cookies
- CSRF protection
- Rate limiting
- Token-based password reset (1-hour expiration)
- Input validation and sanitization

### ✅ **User Experience**
- Responsive UI with shadcn/ui components
- Real-time form validation
- Toast notifications for feedback
- Loading states and error handling
- Mobile-friendly design

## Architecture

### Technology Stack
- **Backend:** Better Auth with Drizzle ORM
- **Database:** PostgreSQL
- **Frontend:** Next.js 15 with React 19
- **UI Components:** shadcn/ui
- **Styling:** Tailwind CSS
- **Email:** Mock service (development) / Configurable for production

### Key Files Structure
```
src/
├── app/
│   ├── (auth)/                    # Auth-specific layouts and pages
│   │   ├── layout.tsx            # Clean auth layout (no header/footer)
│   │   ├── login/page.tsx        # Login page
│   │   ├── register/page.tsx     # Registration page
│   │   ├── forgot-password/page.tsx  # Password reset request
│   │   └── reset-password/page.tsx   # Password reset form
│   └── dashboard/page.tsx        # User dashboard with password change
├── lib/
│   ├── auth.ts                   # Better Auth server configuration
│   └── auth-client.ts            # Better Auth client configuration
├── drizzle/
│   └── auth-schema.ts            # Database schema for auth tables
├── components/
│   ├── header.tsx                # Navigation with auth status
│   └── ui/                       # shadcn/ui components
└── hooks/
    └── use-session.ts            # Session management hook
```

## Setup & Configuration

### 1. Environment Variables

Create a `.env` file in your project root:

```env
# Database
POSTGRES_URL="postgresql://username:password@host:port/database"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# Admin Seeding (Optional)
ADMIN_EMAIL="admin@propertytaxgroup.com"
ADMIN_PASSWORD="your-secure-password"
ADMIN_NAME="Admin User"

# Email Service (Production)
# RESEND_API_KEY="your-resend-api-key"
```

### 2. Database Setup

Run the database migrations:

```bash
# Generate migration
npx drizzle-kit generate --name add-auth-tables

# Apply migration
npx drizzle-kit migrate
```

### 3. Seed Admin User

Create the initial admin user:

```bash
pnpm run seed:admin
```

## User Flows

### 1. User Registration Flow
1. Navigate to `/register`
2. Fill in name, email, password, and confirm password
3. Submit form
4. Account created → Redirect to dashboard
5. User is automatically logged in

### 2. User Login Flow
1. Navigate to `/login`
2. Enter email and password
3. Submit form
4. Session created → Redirect to dashboard

### 3. Forgot Password Flow
1. Navigate to `/forgot-password` (or click "Forgot password?" on login)
2. Enter email address
3. Submit form → Reset email sent
4. Check email for reset link (development: check console)
5. Click link → Navigate to `/reset-password?token=...`
6. Enter new password and confirm
7. Submit → Password updated
8. Navigate to login with new password

### 4. Dashboard Password Change Flow
1. Login and navigate to `/dashboard`
2. Scroll to "Change Password" section
3. Enter current password and new password
4. Submit → Password updated immediately
5. Continue using application with new password

## API Endpoints

Better Auth automatically provides these endpoints at `/api/auth/*`:

### Authentication
- `POST /api/auth/sign-up/email` - User registration
- `POST /api/auth/sign-in/email` - User login
- `POST /api/auth/sign-out` - User logout
- `GET /api/auth/session` - Get current session

### Password Management
- `POST /api/auth/forget-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-password` - Change password (authenticated)

### Session Management
- `GET /api/auth/session` - Get current user session
- `POST /api/auth/session/refresh` - Refresh session

## Components

### Authentication Pages

#### Login Page (`/login`)
- Email/password form
- "Forgot password?" link
- Navigation to registration
- Form validation and error handling

#### Registration Page (`/register`)
- Name, email, password, confirm password
- Client-side validation
- Auto-redirect after successful registration

#### Forgot Password Page (`/forgot-password`)
- Email input for reset request
- Success state with instructions
- Email sent confirmation

#### Reset Password Page (`/reset-password`)
- Token validation from URL parameters
- New password form with confirmation
- Error handling for invalid/expired tokens

### Dashboard Components

#### User Dashboard (`/dashboard`)
- User information display
- Password change form
- Session management
- Sign out functionality

#### Header Component
- Dynamic auth status display
- Sign in/Sign out buttons
- User information display (when logged in)
- Navigation links

### Hooks

#### useSession
```typescript
import { useSession } from '@/hooks/use-session';

const { data: session, isPending, error } = useSession();
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Accounts Table
```sql
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  password TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  expires_at TIMESTAMP NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  user_id TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Verifications Table
```sql
CREATE TABLE verifications (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Security Features

### Password Security
- **Hashing:** bcrypt with 12 rounds
- **Validation:** Minimum 8 characters
- **Reset Tokens:** 1-hour expiration
- **Current Password Required:** For authenticated password changes

### Session Security
- **HTTP-Only Cookies:** Prevent XSS attacks
- **Secure Cookies:** HTTPS-only in production
- **SameSite:** CSRF protection
- **Session Expiration:** 7 days with refresh

### Rate Limiting
- **Built-in Protection:** 100 requests per minute per IP
- **Endpoint Specific:** Different limits for auth endpoints

### CSRF Protection
- **Token-based:** Automatic CSRF token validation
- **Origin Checking:** Validates request origins

## Development

### Running the Application
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Seed admin user
pnpm run seed:admin
```

### Testing Authentication

#### Manual Testing Checklist
1. **Registration:**
   - [ ] Create account with valid email/password
   - [ ] Verify password confirmation validation
   - [ ] Check duplicate email handling

2. **Login:**
   - [ ] Login with valid credentials
   - [ ] Test invalid email/password errors
   - [ ] Verify session persistence

3. **Password Reset:**
   - [ ] Request reset for existing email
   - [ ] Check console for reset link (development)
   - [ ] Follow reset link and change password
   - [ ] Login with new password

4. **Dashboard:**
   - [ ] Access dashboard when logged in
   - [ ] Change password using current password
   - [ ] Verify new password works

5. **Session Management:**
   - [ ] Logout functionality
   - [ ] Session expiration handling
   - [ ] Navigation protection

### Development URLs
- Login: `http://localhost:3000/login`
- Register: `http://localhost:3000/register`
- Dashboard: `http://localhost:3000/dashboard`
- Forgot Password: `http://localhost:3000/forgot-password`

## Production Deployment

### Email Service Configuration

Replace the mock email service in `src/lib/auth.ts`:

#### Using Resend (Recommended)
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, html }) {
  await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to,
    subject,
    html,
  });
}
```

#### Using SendGrid
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail({ to, subject, html }) {
  await sgMail.send({
    to,
    from: 'noreply@yourdomain.com',
    subject,
    html,
  });
}
```

### Environment Variables for Production
```env
# Required
POSTGRES_URL="your-production-database-url"
BETTER_AUTH_SECRET="your-production-secret-key"
BETTER_AUTH_URL="https://yourdomain.com"

# Email Service
RESEND_API_KEY="your-resend-api-key"

# Admin User
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="secure-production-password"
```

### Security Checklist for Production
- [ ] Set secure `BETTER_AUTH_SECRET`
- [ ] Configure HTTPS-only cookies
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Test email deliverability
- [ ] Backup database regularly

## Troubleshooting

### Common Issues

#### "Session not found" or authentication errors
- Check database connection
- Verify `BETTER_AUTH_SECRET` is set
- Clear browser cookies and try again

#### Password reset emails not working
- **Development:** Check server console for email logs
- **Production:** Verify email service API keys and configuration

#### Database connection errors
- Verify `POSTGRES_URL` format and credentials
- Check if database migrations have been applied

#### CSRF token errors
- Ensure requests include proper headers
- Check `BETTER_AUTH_URL` matches your domain

### Debug Mode

Enable debug logging in development:

```typescript
// In src/lib/auth.ts
export const auth = betterAuth({
  // ... other config
  logger: {
    level: "debug"
  }
});
```

### Support Resources

- [Better Auth Documentation](https://better-auth.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Next.js Authentication Guide](https://nextjs.org/docs/authentication)

---

## Summary

This authentication system provides a complete, secure, and user-friendly authentication experience with:

- ✅ **Complete user flows** (registration, login, password management)
- ✅ **Production-ready security** (CSRF, rate limiting, secure sessions)
- ✅ **Developer-friendly setup** (clear documentation, easy configuration)
- ✅ **Extensible architecture** (role-based access, social auth ready)

The system is ready for production use with proper email service configuration and environment variables. 