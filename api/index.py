import os
from fastapi import FastAPI, Depends, HTTPException
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict, Any
import traceback
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Use absolute import for Docker compatibility
try:
    from api.database import get_db, PropertyData
except ImportError:
    from database import get_db, PropertyData

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

@app.get("/api/test-routing")
async def test_routing():
    """Test endpoint to verify catch-all routing is working"""
    return {
        "message": "This is a FastAPI endpoint!",
        "routing": "All /api/* routes now default to FastAPI",
        "exceptions": [
            "/api/auth/* - Still handled by Next.js",
            "/api/analyze/* - Still handled by Next.js"
        ],
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/api/properties/sample")
async def get_sample_properties(db: AsyncSession = Depends(get_db)):
    """Get a sample of properties from the database"""
    try:
        logger.info("Attempting to query properties...")
        
        # Query to get a few properties with their addresses
        query = select(
            PropertyData.acct,
            PropertyData.site_addr_1,
            PropertyData.neighborhood_grp,
            PropertyData.tot_appr_val,
            PropertyData.tot_mkt_val
        ).limit(5)
        
        result = await db.execute(query)
        properties = result.fetchall()
        
        # Also get the total count
        count_query = select(func.count()).select_from(PropertyData)
        count_result = await db.execute(count_query)
        total_count = count_result.scalar()
        
        # Format the response
        property_list = []
        for prop in properties:
            property_list.append({
                "account": prop.acct,
                "address": prop.site_addr_1 or "No address",
                "neighborhood": prop.neighborhood_grp or "Unknown",
                "appraised_value": prop.tot_appr_val or "0",
                "market_value": prop.tot_mkt_val or "0"
            })
        
        logger.info(f"Successfully retrieved {len(property_list)} properties")
        
        return {
            "status": "success",
            "total_properties": total_count,
            "sample_properties": property_list,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"Database error: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
