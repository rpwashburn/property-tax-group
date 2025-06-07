from fastapi import FastAPI, Query
from datetime import datetime
import os
from typing import Optional

app = FastAPI()

@app.get("/")
async def root(path: Optional[str] = Query(None)):
    """Root endpoint - handles routing via path query parameter"""
    try:
        # Route based on path parameter from Next.js rewrite
        if path == "hello":
            return {
                "message": "Hello World from Nexus API!",
                "timestamp": datetime.now(datetime.UTC).isoformat(),
                "path_received": path
            }
        elif path is None or path == "":
            # Default root response
            return {
                "message": "Property Tax Nexus API is working!",
                "timestamp": datetime.now(datetime.UTC).isoformat(),
                "status": "ok",
                "endpoints": ["/nexus", "/nexus/hello"]
            }
        else:
            # Unknown path
            return {
                "error": "Endpoint not found",
                "path_requested": path,
                "available_paths": ["hello"],
                "timestamp": datetime.now(datetime.UTC).isoformat()
            }
    except Exception as e:
        return {
            "error": str(e),
            "message": "Error in root endpoint",
            "path_received": path
        }

@app.get("/hello")
async def hello():
    """Direct hello endpoint (fallback)"""
    try:
        return {
            "message": "Hello World from Nexus API!",
            "timestamp": datetime.now(datetime.UTC).isoformat(),
            "note": "Direct access to /hello endpoint"
        }
    except Exception as e:
        return {
            "error": str(e),
            "message": "Error in hello endpoint"
        }
