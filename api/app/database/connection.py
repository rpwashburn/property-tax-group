"""
Database Connection Management
Centralized database connection and session management with connection pooling.
"""

import logging
from typing import AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool, QueuePool
from sqlalchemy import text
from contextlib import asynccontextmanager
import time

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Global engine instance
_engine: Optional[create_async_engine] = None
_session_factory: Optional[async_sessionmaker] = None


def get_engine():
    """
    Get or create the global database engine.
    Uses singleton pattern to ensure single engine instance.
    """
    global _engine
    
    if _engine is None:
        database_url = settings.get_database_url()
        logger.info(f"Creating database engine for: {database_url.split('@')[0]}@...")
        
        # Engine configuration based on environment
        engine_kwargs = {
            "echo": settings.DEBUG and not settings.is_production(),
            "future": True,
            "pool_pre_ping": True,  # Verify connections before use
        }
        
        # Configure connection pooling based on environment
        if settings.is_production():
            # For production, use connection pooling
            engine_kwargs.update({
                "poolclass": QueuePool,
                "pool_size": settings.DB_POOL_SIZE,
                "max_overflow": settings.DB_MAX_OVERFLOW,
                "pool_timeout": settings.DB_POOL_TIMEOUT,
                "pool_recycle": settings.DB_POOL_RECYCLE,
            })
            
            # Production SSL and performance settings
            engine_kwargs["connect_args"] = {
                "server_settings": {
                    "jit": "off",
                    "application_name": f"{settings.PROJECT_NAME}-{settings.VERSION}"
                },
                "command_timeout": 60,
            }
            
        else:
            # For development/local, simpler configuration
            engine_kwargs.update({
                "pool_size": 5,
                "max_overflow": 0,
            })
            
            engine_kwargs["connect_args"] = {
                "server_settings": {"jit": "off"},
                "command_timeout": 60,
            }
        
        try:
            _engine = create_async_engine(database_url, **engine_kwargs)
            logger.info("Database engine created successfully")
            
        except Exception as e:
            logger.error(f"Failed to create database engine: {str(e)}")
            raise
    
    return _engine


def get_session_factory():
    """
    Get or create the global session factory.
    """
    global _session_factory
    
    if _session_factory is None:
        engine = get_engine()
        _session_factory = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
            autocommit=False
        )
        logger.info("Session factory created successfully")
    
    return _session_factory


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency function to get database session.
    This is used with FastAPI's Depends() for dependency injection.
    
    Yields:
        AsyncSession: Database session
    """
    session_factory = get_session_factory()
    
    async with session_factory() as session:
        try:
            yield session
        except Exception as e:
            logger.error(f"Database session error: {str(e)}")
            await session.rollback()
            raise
        finally:
            await session.close()


@asynccontextmanager
async def get_db_context() -> AsyncGenerator[AsyncSession, None]:
    """
    Context manager for database sessions.
    Use this for manual session management outside of FastAPI dependencies.
    
    Usage:
        async with get_db_context() as db:
            # Use db session
            result = await db.execute(query)
    """
    session_factory = get_session_factory()
    
    async with session_factory() as session:
        try:
            yield session
        except Exception as e:
            logger.error(f"Database context error: {str(e)}")
            await session.rollback()
            raise
        finally:
            await session.close()


async def test_database_connection() -> bool:
    """
    Test database connectivity.
    
    Returns:
        bool: True if connection successful, False otherwise
    """
    try:
        async with get_db_context() as db:
            result = await db.execute(text("SELECT 1 as test"))
            test_value = result.scalar()
            
            if test_value == 1:
                logger.info("Database connection test successful")
                return True
            else:
                logger.error("Database connection test returned unexpected result")
                return False
                
    except Exception as e:
        logger.error(f"Database connection test failed: {str(e)}")
        return False


async def close_database_connections():
    """
    Close all database connections.
    Call this during application shutdown.
    """
    global _engine, _session_factory
    
    if _engine:
        await _engine.dispose()
        logger.info("Database engine disposed")
        _engine = None
        _session_factory = None


class DatabaseManager:
    """
    Database manager for handling database operations and connection lifecycle.
    """
    
    def __init__(self):
        self.logger = get_logger(f"{__name__}.DatabaseManager")
        
    async def initialize(self) -> None:
        """Initialize database connections and test connectivity"""
        self.logger.info("Initializing database manager...")
        
        # Test connection
        if await test_database_connection():
            self.logger.info("Database manager initialized successfully")
        else:
            raise RuntimeError("Failed to establish database connection")
    
    async def health_check(self) -> dict:
        """
        Perform database health check.
        
        Returns:
            dict: Health check results
        """
        try:
            start_time = time.time()
            connection_ok = await test_database_connection()
            response_time = time.time() - start_time
            
            return {
                "status": "healthy" if connection_ok else "unhealthy",
                "response_time_ms": round(response_time * 1000, 2),
                "database_url": settings.get_database_url().split('@')[0] + "@...",
                "pool_info": await self._get_pool_info() if connection_ok else None
            }
            
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "database_url": settings.get_database_url().split('@')[0] + "@..."
            }
    
    async def _get_pool_info(self) -> dict:
        """Get connection pool information"""
        engine = get_engine()
        pool = engine.pool
        
        return {
            "pool_size": getattr(pool, 'size', 'N/A'),
            "checked_in": getattr(pool, 'checkedin', 'N/A'),
            "checked_out": getattr(pool, 'checkedout', 'N/A'),
            "overflow": getattr(pool, 'overflow', 'N/A'),
        }
    
    async def shutdown(self) -> None:
        """Shutdown database connections"""
        self.logger.info("Shutting down database manager...")
        await close_database_connections()
        self.logger.info("Database manager shutdown complete")


# Global database manager instance
db_manager = DatabaseManager() 