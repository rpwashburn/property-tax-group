#!/usr/bin/env python3
"""
Script to generate the initial migration for the canonical property assessment schema.
"""

import asyncio
import os
import subprocess
import sys
from pathlib import Path

# Add the API directory to the Python path
api_dir = Path(__file__).parent.parent
sys.path.insert(0, str(api_dir))

from app.core.config import settings
from app.database.connection import DatabaseManager


async def main():
    """Generate and run the initial migration."""
    
    print("🚀 Creating canonical property assessment schema migration...")
    
    # Change to the API directory
    os.chdir(api_dir)
    
    # Create the migration
    print("📝 Generating migration file...")
    result = subprocess.run([
        "alembic", "revision", "--autogenerate", 
        "-m", "Create canonical property assessment schema"
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"❌ Failed to create migration: {result.stderr}")
        return 1
    
    print(f"✅ Migration created successfully:")
    print(result.stdout)
    
    # Test database connection
    print("🔍 Testing database connection...")
    try:
        db_manager = DatabaseManager()
        await db_manager.initialize()
        
        async with db_manager.get_session() as session:
            # Test the connection
            await session.execute("SELECT 1")
            print("✅ Database connection successful")
        
        await db_manager.close()
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("Please ensure your database is running and configured correctly.")
        return 1
    
    # Ask user if they want to run the migration
    response = input("\n🤔 Would you like to run the migration now? (y/N): ")
    
    if response.lower() in ['y', 'yes']:
        print("🔄 Running migration...")
        result = subprocess.run(["alembic", "upgrade", "head"], capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"❌ Migration failed: {result.stderr}")
            return 1
        
        print("✅ Migration completed successfully!")
        print(result.stdout)
        
        print("\n🎉 Canonical schema has been created!")
        print("You can now run the migration service to migrate your HCAD data.")
        
    else:
        print("⏸️  Migration not run. You can run it later with: alembic upgrade head")
    
    return 0


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code) 