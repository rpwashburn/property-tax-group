# Authentication Quick Start Guide

## 🚀 Get Authentication Working in 5 Minutes

### 1. Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database URL
POSTGRES_URL="your-database-connection-string"
BETTER_AUTH_SECRET="your-random-secret-key"
```

### 2. Run Database Migrations
```bash
npx drizzle-kit migrate
```

### 3. Seed Admin User
```bash
pnpm run seed:admin
```

### 4. Start Development Server
```bash
pnpm dev
```

## 🎯 Ready-to-Use URLs

- **Login:** http://localhost:3000/login
- **Register:** http://localhost:3000/register
- **Dashboard:** http://localhost:3000/dashboard
- **Forgot Password:** http://localhost:3000/forgot-password

## 🔐 Default Admin Credentials

- **Email:** admin@fightyourtax.ai
- **Password:** admin123456

**⚠️ Change this password immediately using the forgot password flow!**

## 🧪 Quick Test Checklist

1. [ ] Register a new user account
2. [ ] Login with created account
3. [ ] Access dashboard
4. [ ] Change password from dashboard
5. [ ] Test forgot password flow
6. [ ] Login with admin credentials
7. [ ] Reset admin password

## 📧 Email in Development

Password reset emails are logged to the **server console** in development mode. Check your terminal for the reset links.

## 🔧 Common Issues

**Database Connection Error:**
- Check your `POSTGRES_URL` in `.env`
- Ensure database is running and accessible

**Authentication Not Working:**
- Verify `BETTER_AUTH_SECRET` is set in `.env`
- Clear browser cookies and try again

**Can't See Reset Emails:**
- Check server console/terminal for email logs
- Look for "📧 Email would be sent:" messages

## 📚 Full Documentation

For complete setup, configuration, and production deployment instructions, see [AUTHENTICATION.md](./AUTHENTICATION.md).

---

## 🎉 You're All Set!

Your authentication system is now ready with:
- ✅ User registration and login
- ✅ Session management
- ✅ Password reset flows
- ✅ Admin user management
- ✅ Secure session handling 