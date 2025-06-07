# Better Auth Setup

## Environment Variables Required

Create a `.env.local` file in the project root with the following variables:

```bash
# Database
POSTGRES_URL="postgresql://username:password@localhost:5432/property_tax_db"

# Better Auth Configuration  
BETTER_AUTH_SECRET="your-secret-key-here-should-be-at-least-32-characters"
BETTER_AUTH_URL="http://localhost:3000"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
```

## Database Migration

After setting up the environment variables, run the following commands to create the necessary database tables:

```bash
# Generate migration for auth tables
npx drizzle-kit generate --name add-auth-tables

# Apply the migration
npx drizzle-kit migrate
```

## Configuration Files Created

1. `src/lib/auth.ts` - Main Better Auth configuration
2. `src/drizzle/auth-schema.ts` - Database schema for auth tables
3. Updated `src/drizzle/schema.ts` - Exports auth tables
4. Updated `src/drizzle/db.ts` - Includes auth schema in database client

## Features Configured

- Email/password authentication
- User roles (default: "user", can be set to "admin")
- Session management (7-day expiration)
- Database persistence with PostgreSQL
- Type-safe auth types exported

## Next Steps

1. Create API routes for authentication endpoints
2. Create login/register UI components
3. Add middleware for route protection
4. Set up admin role management 