"""
FastAPI Application Entry Point
Production-ready configuration with proper middleware, security, and routing.
"""

import os
import time
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError, HTTPException
import uvicorn

from app.core.config import settings
from app.core.logging import setup_logging
from app.api.v1.router import api_router
from app.database.connection import get_engine

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Lifespan context manager for FastAPI application.
    Handles startup and shutdown events.
    """
    logger.info("Starting up Property Tax Nexus API...")

    try:
        # Test database connection
        engine = get_engine()
        async with engine.begin() as conn:
            await conn.execute("SELECT 1")
        logger.info("Database connection established successfully")

        yield

    except Exception as e:
        logger.error(f"Failed to start application: {e}")
        raise
    finally:
        logger.info("Shutting down Property Tax Nexus API...")
        # Clean up resources if needed
        engine = get_engine()
        await engine.dispose()


def create_application() -> FastAPI:
    """
    Application factory pattern for creating FastAPI instance.
    """
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description="Production-ready API for Property Tax Analysis with Multi-Jurisdiction Support",
        version=settings.VERSION,
        openapi_url=(
            f"{settings.API_V1_STR}/openapi.json"
            if not settings.ENVIRONMENT == "production"
            else None
        ),
        docs_url="/docs" if not settings.ENVIRONMENT == "production" else None,
        redoc_url="/redoc" if not settings.ENVIRONMENT == "production" else None,
        lifespan=lifespan,
    )

    # Security middleware
    if settings.ALLOWED_HOSTS:
        app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request logging middleware
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        """Log all incoming requests"""
        start_time = time.time()

        # Log request
        logger.info(
            f"Request: {request.method} {request.url.path} "
            f"from {request.client.host if request.client else 'unknown'}"
        )

        try:
            response = await call_next(request)
            process_time = time.time() - start_time

            # Log response
            logger.info(f"Response: {response.status_code} " f"in {process_time:.4f}s")

            # Add process time header
            response.headers["X-Process-Time"] = str(process_time)
            return response

        except Exception as e:
            process_time = time.time() - start_time
            logger.error(
                f"Request failed: {request.method} {request.url.path} "
                f"after {process_time:.4f}s - {str(e)}"
            )
            raise

    # Exception handlers
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ):
        """Handle validation errors"""
        logger.warning(f"Validation error for {request.url.path}: {exc.errors()}")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": "Validation Error",
                "detail": exc.errors(),
                "path": str(request.url.path),
            },
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        """Handle HTTP exceptions"""
        logger.warning(f"HTTP exception for {request.url.path}: {exc.detail}")
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": "HTTP Error",
                "detail": exc.detail,
                "path": str(request.url.path),
            },
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        """Handle unexpected exceptions"""
        logger.error(
            f"Unexpected error for {request.url.path}: {str(exc)}", exc_info=True
        )

        if settings.ENVIRONMENT == "development":
            import traceback

            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": "Internal Server Error",
                    "detail": str(exc),
                    "traceback": traceback.format_exc().split("\n"),
                    "path": str(request.url.path),
                },
            )
        else:
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": "Internal Server Error",
                    "detail": "An unexpected error occurred",
                    "path": str(request.url.path),
                },
            )

    # Health check endpoint
    @app.get("/health", tags=["Health"])
    async def health_check():
        """Health check endpoint"""
        return {
            "status": "healthy",
            "service": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "environment": settings.ENVIRONMENT,
        }

    # Include API router
    app.include_router(api_router, prefix=settings.API_V1_STR)

    return app


# Create the FastAPI application
app = create_application()

# For local development
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=settings.ENVIRONMENT == "development",
        log_level="info",
    )
