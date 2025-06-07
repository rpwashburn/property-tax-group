"""
Application Configuration
Centralized configuration management using Pydantic settings with environment variable support.
"""

import os
from typing import List, Optional, Any, Dict
from pydantic import BaseSettings, Field, validator, PostgresDsn
from functools import lru_cache


class Settings(BaseSettings):
    """
    Application settings with environment variable support.
    All settings can be overridden via environment variables.
    """
    
    # Basic App Settings
    PROJECT_NAME: str = Field(
        default="Property Tax Nexus API",
        description="Name of the application"
    )
    VERSION: str = Field(
        default="1.0.0", 
        description="Application version"
    )
    DESCRIPTION: str = Field(
        default="Production-ready API for Property Tax Analysis with Multi-Jurisdiction Support",
        description="Application description"
    )
    
    # Environment
    ENVIRONMENT: str = Field(
        default="development",
        description="Current environment (development, staging, production)"
    )
    DEBUG: bool = Field(
        default=True,
        description="Enable debug mode"
    )
    
    # API Configuration
    API_V1_STR: str = Field(
        default="/api/v1",
        description="API v1 prefix"
    )
    
    # Security
    SECRET_KEY: str = Field(
        default="dev-secret-key-change-in-production",
        description="Secret key for JWT and other cryptographic operations"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=60 * 24 * 8,  # 8 days
        description="Access token expiration time in minutes"
    )
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:8000",
            "http://localhost:8080",
            "https://localhost:3000",
        ],
        description="List of allowed CORS origins"
    )
    
    # Trusted Hosts
    ALLOWED_HOSTS: List[str] = Field(
        default=["localhost", "127.0.0.1"],
        description="List of allowed hosts"
    )
    
    # Database Configuration
    POSTGRES_SERVER: str = Field(
        default="localhost",
        description="PostgreSQL server host"
    )
    POSTGRES_USER: str = Field(
        default="propertytaxgroup",
        description="PostgreSQL username"
    )
    POSTGRES_PASSWORD: str = Field(
        default="localpass",
        description="PostgreSQL password"
    )
    POSTGRES_DB: str = Field(
        default="verceldb",
        description="PostgreSQL database name"
    )
    POSTGRES_PORT: int = Field(
        default=5432,
        description="PostgreSQL port"
    )
    
    # Full Database URL (constructed from components or provided directly)
    DATABASE_URL: Optional[str] = Field(
        default=None,
        description="Complete database URL (overrides individual components)"
    )
    
    # Database Pool Configuration
    DB_POOL_SIZE: int = Field(
        default=20,
        description="Database connection pool size"
    )
    DB_MAX_OVERFLOW: int = Field(
        default=0,
        description="Database connection pool max overflow"
    )
    DB_POOL_TIMEOUT: int = Field(
        default=30,
        description="Database connection pool timeout"
    )
    DB_POOL_RECYCLE: int = Field(
        default=3600,
        description="Database connection pool recycle time"
    )
    
    # Redis Configuration (for caching and background tasks)
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Redis connection URL"
    )
    
    # Logging Configuration
    LOG_LEVEL: str = Field(
        default="INFO",
        description="Logging level"
    )
    LOG_FORMAT: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        description="Logging format"
    )
    
    # External Services
    RATE_LIMIT_REQUESTS: int = Field(
        default=100,
        description="Rate limit requests per minute"
    )
    
    # Monitoring
    ENABLE_METRICS: bool = Field(
        default=True,
        description="Enable Prometheus metrics collection"
    )
    
    @validator("ENVIRONMENT")
    def validate_environment(cls, v):
        """Validate environment setting"""
        allowed_envs = ["development", "staging", "production"]
        if v not in allowed_envs:
            raise ValueError(f"Environment must be one of: {allowed_envs}")
        return v
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str]:
        """Parse CORS origins from string or list"""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    @validator("ALLOWED_HOSTS", pre=True)
    def assemble_allowed_hosts(cls, v: str | List[str]) -> List[str]:
        """Parse allowed hosts from string or list"""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    @validator("DEBUG", pre=True)
    def assemble_debug(cls, v):
        """Parse debug setting"""
        if isinstance(v, str):
            return v.lower() in ("true", "1", "yes", "on")
        return v
    
    def get_database_url(self) -> str:
        """
        Get the database URL, either from DATABASE_URL or constructed from components.
        """
        if self.DATABASE_URL:
            url = self.DATABASE_URL
        else:
            url = (
                f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
                f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
            )
        
        # Convert to async URL for asyncpg
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        
        return url
    
    def is_development(self) -> bool:
        """Check if running in development mode"""
        return self.ENVIRONMENT == "development"
    
    def is_production(self) -> bool:
        """Check if running in production mode"""
        return self.ENVIRONMENT == "production"
    
    def is_testing(self) -> bool:
        """Check if running in testing mode"""
        return self.ENVIRONMENT == "testing"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Uses lru_cache to avoid re-parsing environment variables on every call.
    """
    return Settings()


# Create global settings instance
settings = get_settings() 