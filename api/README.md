# FastAPI Backend

This is the FastAPI backend for the Property Tax Group application, being migrated from Next.js API routes.

## Setup

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Environment Variables

Create a `.env` file in the project root with:

```env
POSTGRES_URL=your_postgresql_connection_string_here
```

#### Local Development
For local development with Docker:
```
POSTGRES_URL=postgres://propertytaxgroup:localpass@localhost:54320/verceldb
```

#### Production (Vercel + Supabase)
For production deployment on Vercel with Supabase, use the **pooler connection** (port 6543):
```
POSTGRES_URL=postgres://[db-user].[project-ref]:[db-password]@aws-0-[aws-region].pooler.supabase.com:6543/postgres
```

**Important**: For Vercel/serverless deployments, always use the pooler connection (port 6543) instead of the direct connection (port 5432). The application will automatically:
- Detect the Vercel environment
- Use NullPool for connection pooling (recommended for serverless)
- Switch to pooler mode if a direct connection is detected
- Convert `sslmode=require` parameters to asyncpg-compatible SSL settings

**SSL Parameter Handling**: If your Supabase connection string includes `?sslmode=require`, the application will automatically convert this to asyncpg-compatible SSL parameters to avoid connection errors.

### 3. Test Database Connection

Run the test script to verify your database connection:

```bash
python api/test_db_connection.py
```

### 4. Run the FastAPI Server

For development:
```bash
uvicorn api.index:app --reload --port 8000
```

## API Endpoints

- `GET /` - Root endpoint
- `GET /api/hello` - Hello World endpoint
- `GET /api/health` - Health check endpoint
- `GET /api/properties/sample` - Get sample properties from database
- `GET /api/test-routing` - Test endpoint to verify routing configuration
- `GET /docs` - Interactive API documentation
- `GET /openapi.json` - OpenAPI schema

## Database Models

The API uses SQLAlchemy with async support for database operations. Currently implemented models:

- `PropertyData` - Main property information table

## Architecture

- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Async ORM for database operations
- **PostgreSQL** - Database (via asyncpg driver)
- **Dependency Injection** - Database sessions are injected into endpoints
- **Connection Pooling**:
  - Local development: Standard connection pooling
  - Production (Vercel): NullPool for serverless compatibility
- **SSL Handling**: Automatic conversion of psycopg2 SSL parameters to asyncpg format

## Routing Configuration

The Next.js application is configured to route API requests as follows:
- `/api/auth/*` - Handled by Next.js
- `/api/analyze/*` - Handled by Next.js  
- `/api/*` (everything else) - Routed to FastAPI

This allows gradual migration from Next.js API routes to FastAPI.

## Troubleshooting

### SSL Connection Issues
If you encounter `sslmode` errors in production:
1. Ensure you're using the Supabase pooler connection (port 6543)
2. The application automatically handles SSL parameter conversion
3. Check that your connection string doesn't have conflicting SSL parameters

### Connection Pool Issues
For serverless deployments (Vercel):
- Always use NullPool (automatically configured)
- Use transaction mode pooler connections
- Monitor connection usage in Supabase dashboard

## Next Steps

1. Migrate authentication endpoints from Next.js
2. Move property analysis logic to FastAPI
3. Convert admin endpoints to FastAPI routes
4. Add comprehensive error handling
5. Implement request validation with Pydantic models
6. Add API versioning
7. Set up proper logging and monitoring 