import os
from fastapi import FastAPI
from datetime import datetime, timezone

app = FastAPI()

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Property Tax Nexus API is working!",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": "ok"
    }

@app.get("/api/hello")
async def hello():
    """Hello endpoint"""
    return {
        "message": "Hello World from Nexus API!",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/api/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Property Tax Nexus API",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
