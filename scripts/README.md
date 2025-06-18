# Admin User Seeding

This directory contains scripts for seeding initial data into the application.

## Admin User Seeding

The `seed-admin.ts` script creates an initial admin user for the application.

### Usage

```bash
# Using npm script
pnpm run seed:admin

# Or directly with tsx
tsx scripts/seed-admin.ts
```

### Configuration

The script uses environment variables for configuration. Add these to your `.env` file:

```env
# Admin Seeding Configuration
ADMIN_EMAIL="admin@fightyourtax.ai"     # Default admin email
ADMIN_PASSWORD="your-secure-password"        # Default admin password  
ADMIN_NAME="Admin User"                      # Default admin name
```

### Features

- **Idempotent**: Safe to run multiple times
- **Smart Detection**: Checks if admin user already exists
- **Role Promotion**: Can promote existing users to admin
- **Secure**: Uses bcrypt for password hashing
- **Environment Configurable**: All settings via environment variables

### Behavior

1. **If no user exists with the admin email**: Creates a new admin user
2. **If user exists but is not admin**: Promotes the user to admin role
3. **If user exists and is already admin**: No action taken

### Security Notes

- Passwords are hashed with bcrypt (12 rounds)
- Admin users start with email verification enabled
- Uses Better Auth's ID generation for consistency
- Creates proper authentication account records

### Default Values

If environment variables are not set, the script uses these defaults:

- Email: `admin@fightyourtax.ai`
- Password: `admin123456` 
- Name: `Admin User`

**⚠️ Important**: Always change the default password in production! 

## Password Reset for Admin Users

Instead of relying on the default hardcoded password, you can use the password reset flow:

### Steps:

1. **Visit the forgot password page**: Go to `/forgot-password`
2. **Enter admin email**: Use the admin email (default: `admin@fightyourtax.ai`)
3. **Check console/email**: In development, the reset link will be displayed in the server console
4. **Click reset link**: Follow the link to set a new secure password
5. **Log in**: Use your new password to access the admin account

### Development vs Production

**Development**: Password reset emails are logged to the console for easy testing.

**Production**: Configure a real email service in `src/lib/auth.ts`:

```typescript
// Replace the mock sendEmail function with a real service
// Example with Resend:
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

### Available Email Services

- **Resend** (recommended): Simple API, good free tier
- **SendGrid**: Enterprise-grade with detailed analytics
- **Mailgun**: Developer-friendly with good deliverability
- **Postmark**: Focus on transactional emails
- **Amazon SES**: Cost-effective for high volume

### Security Benefits

✅ **No hardcoded passwords in production**
✅ **Secure token-based reset (1-hour expiration)**
✅ **Email verification requirement**
✅ **Comprehensive error handling**
✅ **Rate limiting protection** 