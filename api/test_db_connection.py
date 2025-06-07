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
    """Convert psycopg2 sslmode parameters to asyncpg-compatible parameters"""
    parsed = urlparse(url)
    query_params = parse_qs(parsed.query)
    
    # Handle sslmode parameter conversion
    if 'sslmode' in query_params:
        sslmode = query_params['sslmode'][0]
        # Remove the problematic sslmode parameter
        del query_params['sslmode']
        
        # For connections that require SSL, we'll handle it in connect_args
        if sslmode == 'disable':
            query_params['ssl'] = ['disable']
    
    # Rebuild the URL with cleaned parameters
    new_query = urlencode(query_params, doseq=True)
    new_parsed = parsed._replace(query=new_query)
    return urlunparse(new_parsed)

async def test_connection():
    # Get database URL from environment variable
    DATABASE_URL = os.getenv("POSTGRES_URL", "")
    
    if not DATABASE_URL:
        print("❌ ERROR: POSTGRES_URL environment variable is not set!")
        print("Please set POSTGRES_URL in your .env file or environment")
        return
    
    # Convert postgres:// to postgresql:// for SQLAlchemy
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Convert to async URL for asyncpg
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    # Fix SSL parameters for asyncpg
    DATABASE_URL = fix_asyncpg_ssl_params(DATABASE_URL)
    
    print(f"🔄 Testing connection to database...")
    
    try:
        # Create engine with appropriate SSL configuration
        connect_args = {}
        if "supabase.com" in DATABASE_URL:
            connect_args["ssl"] = "require"
        
        engine = create_async_engine(
            DATABASE_URL, 
            echo=False,
            connect_args=connect_args
        )
        
        async with engine.begin() as conn:
            # Test basic query
            result = await conn.execute(text("SELECT 1"))
            await conn.execute(text("SELECT COUNT(*) FROM property_data"))
            
        print("✅ Database connection successful!")
        print("✅ property_data table exists!")
        
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        print("\nMake sure:")
        print("1. POSTGRES_URL is correctly set")
        print("2. The database is accessible")
        print("3. The property_data table exists")
        print("4. For Supabase: Use pooler connection (port 6543) in production")
    finally:
        if 'engine' in locals():
            await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_connection()) 