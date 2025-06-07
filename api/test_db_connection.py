"""
Test script to verify database connection
Run with: python api/test_db_connection.py
"""
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

def fix_asyncpg_ssl_params(url: str) -> str:
    """Convert psycopg2 sslmode parameters to asyncpg-compatible parameters and remove invalid ones"""
    parsed = urlparse(url)
    query_params = parse_qs(parsed.query)
    
    # List of known valid PostgreSQL/asyncpg parameters
    valid_params = {
        'ssl', 'sslcert', 'sslkey', 'sslrootcert', 'sslcrl', 'sslcompression',
        'target_session_attrs', 'application_name', 'connect_timeout',
        'command_timeout', 'server_settings'
    }
    
    # Remove invalid/unknown parameters and handle sslmode conversion
    cleaned_params = {}
    ssl_required = False
    
    for param, values in query_params.items():
        if param == 'sslmode':
            # Handle sslmode parameter conversion
            sslmode = values[0] if values else 'prefer'
            if sslmode == 'require':
                ssl_required = True
            elif sslmode == 'disable':
                cleaned_params['ssl'] = ['disable']
        elif param in valid_params:
            # Keep valid parameters
            cleaned_params[param] = values
        else:
            # Log and remove invalid parameters
            print(f"⚠️  Removing invalid URL parameter: {param}={values}")
    
    # Rebuild the URL with cleaned parameters
    new_query = urlencode(cleaned_params, doseq=True)
    new_parsed = parsed._replace(query=new_query)
    cleaned_url = urlunparse(new_parsed)
    
    # Store SSL requirement for later use in connect_args
    if ssl_required:
        cleaned_url += "&_ssl_required=true" if new_query else "?_ssl_required=true"
    
    return cleaned_url, ssl_required

async def test_connection():
    # Get database URL from environment variable
    DATABASE_URL = os.getenv("POSTGRES_URL", "")
    
    if not DATABASE_URL:
        print("❌ ERROR: POSTGRES_URL environment variable is not set!")
        print("Please set POSTGRES_URL in your .env file or environment")
        return
    
    print(f"🔍 Original URL contains: {DATABASE_URL.split('?')[1] if '?' in DATABASE_URL else 'no parameters'}")
    
    # Convert postgres:// to postgresql:// for SQLAlchemy
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Convert to async URL for asyncpg
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    # Fix SSL parameters for asyncpg
    DATABASE_URL, ssl_required = fix_asyncpg_ssl_params(DATABASE_URL)
    
    # Remove our internal SSL flag
    DATABASE_URL = DATABASE_URL.replace("&_ssl_required=true", "").replace("?_ssl_required=true", "")
    
    print(f"🔄 Testing connection to database...")
    
    try:
        # Create engine with appropriate SSL configuration
        connect_args = {}
        if ssl_required or "supabase.com" in DATABASE_URL:
            connect_args["ssl"] = "require"
            print("🔒 Using SSL connection")
        else:
            print("🔓 Using non-SSL connection")
        
        engine = create_async_engine(
            DATABASE_URL, 
            echo=False,
            connect_args=connect_args
        )
        
        async with engine.begin() as conn:
            # Test basic query
            result = await conn.execute(text("SELECT 1"))
            count_result = await conn.execute(text("SELECT COUNT(*) FROM property_data"))
            count = count_result.scalar()
            
        print("✅ Database connection successful!")
        print(f"✅ property_data table exists with {count} records!")
        
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        print("\nMake sure:")
        print("1. POSTGRES_URL is correctly set")
        print("2. The database is accessible")
        print("3. The property_data table exists")
        print("4. For Supabase: Use pooler connection (port 6543) in production")
        print("5. Remove any invalid URL parameters like 'supa=...'")
    finally:
        if 'engine' in locals():
            await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_connection()) 