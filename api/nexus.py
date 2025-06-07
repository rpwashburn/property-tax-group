from fastapi import FastAPI
from datetime import datetime
import os

app = FastAPI()

@app.get("/")
async def root():
    """Simple root endpoint"""
    try:
        return {
            "message": "Property Tax Nexus API is working!",
            "timestamp": datetime.now(datetime.UTC).isoformat(),
            "status": "ok"
        }
    except Exception as e:
        return {
            "error": str(e),
            "message": "Error in root endpoint"
        }

@app.get("/hello")
async def hello():
    """Simple hello endpoint"""
    try:
        return {
            "message": "Hello World from Nexus API!",
            "timestamp": datetime.now(datetime.UTC).isoformat()
        }
    except Exception as e:
        return {
            "error": str(e),
            "message": "Error in hello endpoint"
        }
