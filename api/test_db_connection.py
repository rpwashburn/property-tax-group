"""
Test script to verify database connection
Run with: python api/test_db_connection.py
"""
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

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
    
    print(f"🔄 Testing connection to database...")
    
    try:
        # Create engine and test connection
        engine = create_async_engine(DATABASE_URL, echo=False)
        
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
    finally:
        if 'engine' in locals():
            await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_connection()) 