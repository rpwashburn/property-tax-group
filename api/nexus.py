from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from datetime import datetime

app = FastAPI(
    title="Property Tax Group Nexus API",
    description="FastAPI backend for Property Tax Group services - handles property analysis, valuations, and reporting",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Add CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "Property Tax Nexus API is running successfully!",
        "service": "Property Tax Group Nexus",
        "version": "1.0.0",
        "timestamp": datetime.now(datetime.UTC).isoformat(),
        "environment": os.getenv("VERCEL_ENV", "development"),
        "endpoints": {
            "hello": "/nexus/hello",
            "health": "/nexus/health", 
            "docs": "/nexus/docs",
            "redoc": "/nexus/redoc"
        }
    }

@app.get("/hello")
async def hello_world():
    """Hello endpoint for testing connectivity"""
    return {
        "message": "Hello World from Property Tax Nexus API!",
        "service": "nexus",
        "timestamp": datetime.now(datetime.UTC).isoformat(),
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "Property Tax Nexus API",
        "timestamp": datetime.now(datetime.UTC).isoformat(),
        "uptime": "operational",
        "version": "1.0.0"
    }

@app.get("/status")
async def get_status():
    """Get detailed status information"""
    return {
        "api_status": "operational",
        "database_status": "not_connected",  # Will update when DB is added
        "external_services": {
            "property_data": "ready",
            "analysis_engine": "ready",
            "reporting": "ready"
        },
        "timestamp": datetime.now(datetime.UTC).isoformat()
    }

# Error handler for 404s
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "error": "Endpoint not found",
            "message": "The requested endpoint was not found in Nexus API",
            "available_endpoints": [
                "/", "/hello", "/health", "/status", "/docs"
            ],
            "timestamp": datetime.now(datetime.UTC).isoformat()
        }
    )
