# Vercel Deployment Guide

This guide covers deploying the Property Tax Nexus API to Vercel with proper configuration and file exclusions.

## Configuration Files

### 1. `vercel.json`
The main Vercel configuration file that:
- Configures the Python runtime for FastAPI
- Sets up routing to direct `/api/*` requests to the FastAPI app
- Excludes unnecessary files from deployment
- Sets memory and timeout limits

### 2. `.vercelignore`
Additional file exclusions for Vercel deployment:
- Development files and directories
- Test files and documentation
- Database migration files
- Virtual environments
- IDE and OS-specific files

## File Exclusions

The deployment is optimized by excluding:

### Development Files
- `.git/`, `.next/`, `node_modules/`
- Python cache files (`__pycache__/`, `.pytest_cache/`, `.mypy_cache/`)
- Virtual environments (`.venv/`, `venv/`, `env/`)

### Testing & Documentation
- Test files (`test_*.py`, `*_test.py`, `tests/`)
- Documentation (`README.md`, `docs/`, `*.md`)
- Coverage reports and logs

### Database & Migration Files
- Alembic migrations (`alembic/`, `alembic.ini`)
- Migration scripts (`scripts/`)
- These are excluded because Vercel serverless functions don't run migrations

### Configuration Files
- Development configs (`pyproject.toml`, `docker-compose*`, `Dockerfile*`)
- IDE settings (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`, `Thumbs.db`)

## Environment Variables

Set these in your Vercel project dashboard:

### Required Variables
```bash
DATABASE_URL=postgresql+asyncpg://user:password@host:port/database
ENVIRONMENT=production
SECRET_KEY=your-super-secret-key-change-this-in-production
```

### CORS & Security
```bash
BACKEND_CORS_ORIGINS=["https://yourdomain.com","https://www.yourdomain.com"]
ALLOWED_HOSTS=["yourdomain.com","www.yourdomain.com"]
```

### Optional Configuration
```bash
LOG_LEVEL=INFO
API_V1_STR=/api/v1
PROJECT_NAME=Property Tax Nexus API
VERSION=1.0.0
```

### Critical Variables (Required to fix CORS issues)

Add these environment variables in your Vercel dashboard under Settings > Environment Variables:

```bash
# Authentication Configuration (CRITICAL - fixes CORS errors)
BETTER_AUTH_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-app-name.vercel.app
BETTER_AUTH_SECRET=your-super-secret-auth-key-minimum-32-characters-long

# Database Configuration
POSTGRES_URL=postgres://[user].[project]:[password]@[host]:[port]/postgres

# Optional: Property API Configuration
PROPERTY_API_BASE_URL=https://your-api-domain.com

# Optional: Vercel Bypass for Internal API Calls
VERCEL_AUTOMATION_BYPASS_SECRET=your_secret_here
```

### Important Notes:

1. **Replace `your-app-name` with your actual Vercel app name**
   - If your app is at `https://fightyourtax-ai.vercel.app`, use that exact URL
   - Do NOT include trailing slashes

2. **Generate a secure BETTER_AUTH_SECRET**
   - Must be at least 32 characters long
   - Use a random string generator or: `openssl rand -hex 32`

3. **Database URL should use pooler connection**
   - For Supabase: use port 6543 (pooler) not 5432 (direct)
   - Format: `postgres://[user].[project]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

## Deployment Steps

### 1. Pre-deployment Checklist
- [ ] Ensure all required environment variables are set in Vercel
- [ ] Database is accessible from Vercel (check firewall rules)
- [ ] All necessary tables exist in the database
- [ ] CORS origins include your frontend domain

### 2. Deploy to Vercel
```bash
# Option 1: Using Vercel CLI
npm i -g vercel
vercel --prod

# Option 2: GitHub integration
# Push to main branch and Vercel will auto-deploy
```

### 3. Post-deployment Testing
- [ ] Test health endpoint: `GET /health`
- [ ] Test API documentation: `GET /docs` (development only)
- [ ] Test API endpoints: `GET /api/v1/...`
- [ ] Check Vercel function logs for any errors

## Function Configuration

The Vercel configuration includes:
- **Runtime**: `@vercel/python` (Python 3.11)
- **Memory**: 1024 MB
- **Max Duration**: 30 seconds
- **Entry Point**: `api/index.py`

## Database Considerations

### Connection Pooling
Vercel serverless functions don't maintain persistent connections. The FastAPI app is configured with:
- Connection pooling for efficiency
- Automatic connection cleanup
- Health checks for database connectivity

### Migrations
Database migrations are **not** run automatically on Vercel. You must:
1. Run migrations manually on your database before deployment
2. Use a separate migration service or run them locally
3. Consider using a managed database service for production

## Monitoring & Logging

### Vercel Function Logs
- Access logs through Vercel dashboard
- Configure log levels via `LOG_LEVEL` environment variable
- Structured JSON logging for better parsing

### Error Handling
The API includes comprehensive error handling:
- Request validation errors (422)
- HTTP exceptions with proper status codes
- Unexpected errors with environment-specific details
- Request/response logging with timing

## Security Features

### Included Security Measures
- CORS configuration
- Trusted host middleware
- Request logging and monitoring
- Environment-based configuration
- Production/development mode handling

### Additional Recommendations
- Use HTTPS only (Vercel provides this by default)
- Implement rate limiting (consider Vercel Edge Config)
- Monitor for suspicious activity
- Regular security updates for dependencies

## Performance Optimization

### File Size Reduction
- Comprehensive exclusion of unnecessary files
- Only essential Python files are included
- No development dependencies in production

### Cold Start Optimization
- Minimal imports in entry point
- Lazy loading of heavy dependencies
- Efficient connection pooling

## Troubleshooting

### Common Issues

#### 1. Module Import Errors
- Ensure all dependencies are in `requirements.txt`
- Check that file paths are correct for serverless environment

#### 2. Database Connection Failures
- Verify `DATABASE_URL` is correct
- Check database firewall allows Vercel IPs
- Ensure database is online and accessible

#### 3. CORS Errors
- Add your frontend domain to `BACKEND_CORS_ORIGINS`
- Include both www and non-www versions
- Use HTTPS URLs in production

#### 4. Function Timeout
- Check if database queries are optimized
- Consider increasing `maxDuration` if needed
- Implement proper async/await patterns

### Debug Mode
For development debugging, set:
```bash
ENVIRONMENT=development
```
This enables:
- API documentation endpoints
- Detailed error responses with stack traces
- More verbose logging

## API Endpoints

Once deployed, your API will be available at:
- Health check: `https://yourdomain.vercel.app/health`
- API base: `https://yourdomain.vercel.app/api/v1/`
- Documentation: `https://yourdomain.vercel.app/docs` (development only)

## Next Steps

After successful deployment:
1. Set up monitoring and alerting
2. Configure custom domain if needed
3. Implement CI/CD pipeline with GitHub Actions
4. Set up database backup strategy
5. Consider implementing caching for frequently accessed data 

## Quick Fix for CORS Error

If you're seeing this error:
```
Access to fetch at 'http://localhost:3000/api/auth/get-session' from origin 'https://fightyourtax-ai.vercel.app' has been blocked by CORS policy
```

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add these variables:
   ```
   BETTER_AUTH_URL = https://fightyourtax-ai.vercel.app
NEXT_PUBLIC_BETTER_AUTH_URL = https://fightyourtax-ai.vercel.app
   BETTER_AUTH_SECRET = [generate-32-char-secret]
   ```
5. Redeploy your application

## Security Checklist

- [ ] `BETTER_AUTH_SECRET` is at least 32 characters
- [ ] Database credentials are secure
- [ ] No sensitive data in environment variable names
- [ ] URLs use HTTPS in production
- [ ] CORS origins are properly configured 