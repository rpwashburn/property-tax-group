import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, String, DateTime, Numeric, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.pool import NullPool
from datetime import datetime
import uuid
import logging
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get database URL from environment variable
DATABASE_URL = os.getenv("POSTGRES_URL", "")

# Detect if we're running in Vercel
IS_VERCEL = (
    os.getenv("VERCEL", "").lower() == "1" or os.getenv("VERCEL_ENV") is not None
)

# If no DATABASE_URL, try to construct from Docker defaults
if not DATABASE_URL:
    logger.warning("POSTGRES_URL not set, using Docker defaults")
    DATABASE_URL = (
        "postgres://propertytaxgroup:localpass@propertytaxgroup-db:5432/verceldb"
    )

# Log the database host for debugging (without password)
if DATABASE_URL:
    # Extract host for logging
    try:
        import re

        host_match = re.search(r"@([^:\/]+)", DATABASE_URL)
        if host_match:
            logger.info(f"Database host: {host_match.group(1)}")
    except Exception:
        pass

# Convert postgres:// to postgresql:// for SQLAlchemy
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Convert to async URL for asyncpg
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# For Supabase in production, ensure we're using the pooler connection (port 6543)
if IS_VERCEL and "supabase.com" in DATABASE_URL and ":5432" in DATABASE_URL:
    logger.warning(
        "Detected Supabase direct connection in Vercel. Switching to pooler mode."
    )
    DATABASE_URL = DATABASE_URL.replace(":5432", ":6543")
    DATABASE_URL = DATABASE_URL.replace("db.", "pooler.")

# Handle SSL parameters - convert psycopg2 sslmode to asyncpg-compatible parameters
def fix_asyncpg_ssl_params(url: str) -> str:
    """Convert psycopg2 sslmode parameters to asyncpg-compatible parameters"""
    parsed = urlparse(url)
    query_params = parse_qs(parsed.query)
    
    # Handle sslmode parameter conversion
    if 'sslmode' in query_params:
        sslmode = query_params['sslmode'][0]
        # Remove the problematic sslmode parameter
        del query_params['sslmode']
        
        # For production/Supabase connections that require SSL
        if sslmode == 'require' and IS_VERCEL:
            # For asyncpg, we'll handle SSL in connect_args instead
            pass
        elif sslmode == 'disable':
            query_params['ssl'] = ['disable']
    
    # Rebuild the URL with cleaned parameters
    new_query = urlencode(query_params, doseq=True)
    new_parsed = parsed._replace(query=new_query)
    return urlunparse(new_parsed)

DATABASE_URL = fix_asyncpg_ssl_params(DATABASE_URL)

# For local Docker connections, disable SSL
if (
    "propertytaxgroup-db" in DATABASE_URL
    or ("localhost" in DATABASE_URL and not IS_VERCEL)
    or ("127.0.0.1" in DATABASE_URL and not IS_VERCEL)
):
    if "?" not in DATABASE_URL:
        DATABASE_URL += "?ssl=disable"
    elif "ssl=" not in DATABASE_URL:
        DATABASE_URL += "&ssl=disable"

logger.info(f"Using database URL format: {DATABASE_URL.split('@')[0]}@...")
logger.info(f"Running in {'Vercel' if IS_VERCEL else 'local'} environment")

# Create engine configuration based on environment
engine_kwargs = {
    "echo": not IS_VERCEL,  # Disable SQL logging in production
    "future": True,
    "pool_pre_ping": True,  # Verify connections before use
}

# Configure connection args based on environment
if IS_VERCEL:
    # For Vercel/serverless, use NullPool as recommended by Supabase
    engine_kwargs["poolclass"] = NullPool
    
    # For Supabase connections in production, configure SSL properly for asyncpg
    if "supabase.com" in DATABASE_URL:
        engine_kwargs["connect_args"] = {
            "server_settings": {"jit": "off"},
            "command_timeout": 60,
            "ssl": "require",  # Use string value for asyncpg
        }
    else:
        engine_kwargs["connect_args"] = {
            "server_settings": {"jit": "off"},
            "command_timeout": 60,
        }
else:
    # For local development with Docker
    engine_kwargs["connect_args"] = {
        "server_settings": {"jit": "off"},
        "command_timeout": 60,
        "ssl": None,  # Disable SSL for local connections
    }

# Create async engine
try:
    engine = create_async_engine(DATABASE_URL, **engine_kwargs)
    logger.info("Database engine created successfully")
    if IS_VERCEL:
        logger.info("Using NullPool for serverless environment")
except Exception as e:
    logger.error(f"Failed to create database engine: {str(e)}")
    raise

# Create async session factory
async_session_maker = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Create declarative base
Base = declarative_base()

# Define PropertyData model matching the drizzle schema
class PropertyData(Base):
    __tablename__ = "property_data"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    acct = Column(String(13), nullable=False, unique=True, index=True)
    str_num = Column(String(10))
    str = Column(String(50))
    str_sfx = Column(String(10))
    str_sfx_dir = Column(String(10))
    site_addr_1 = Column(String(100))
    site_addr_2 = Column(String(100))
    site_addr_3 = Column(String(100))
    state_class = Column(String(10))
    school_dist = Column(String(10))
    neighborhood_code = Column(String(10))
    neighborhood_grp = Column(String(100))
    market_area_1 = Column(String(10))
    market_area_1_dscr = Column(String(100))
    market_area_2 = Column(String(10))
    market_area_2_dscr = Column(String(100))
    tot_appr_val = Column(String(20))
    tot_mkt_val = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

# Dependency to get database session
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
