"""
API V1 Router
Main router for API version 1 endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from app.database.connection import get_db
import logging

logger = logging.getLogger(__name__)

api_router = APIRouter()


@api_router.get("/")
async def root():
    """Root endpoint for API v1"""
    return {
        "message": "Property Tax Nexus API v1",
        "status": "healthy",
        "version": "1.0.0"
    }


@api_router.get("/hello")
async def hello():
    """Hello endpoint"""
    return {
        "message": "Hello from Property Tax Nexus API!",
        "status": "working"
    }


@api_router.get("/properties/sample")
async def get_sample_properties(db: AsyncSession = Depends(get_db)):
    """Get sample properties from the database"""
    try:
        # Import the PropertyData model
        from api.database import PropertyData
        
        # Query for 5 properties from the database
        query = select(PropertyData).limit(5)
        result = await db.execute(query)
        properties = result.scalars().all()
        
        # Transform to match the expected format
        sample_data = []
        for prop in properties:
            # Parse numeric values safely
            total_appraised = 0.0
            total_market = 0.0
            
            try:
                if prop.tot_appr_val and prop.tot_appr_val.strip():
                    total_appraised = float(prop.tot_appr_val)
            except (ValueError, AttributeError):
                pass
                
            try:
                if prop.tot_mkt_val and prop.tot_mkt_val.strip():
                    total_market = float(prop.tot_mkt_val)
            except (ValueError, AttributeError):
                pass
            
            sample_data.append({
                "account": prop.acct,
                "address": prop.site_addr_1 or "N/A",
                "neighborhood": prop.neighborhood_grp or "N/A",
                "appraised_value": int(total_appraised),
                "market_value": int(total_market)
            })
        
        return {
            "status": "success",
            "total_properties": len(sample_data),
            "sample_data": sample_data,
            "message": f"Sample property data from database ({len(sample_data)} properties)"
        }
    
    except Exception as e:
        logger.error(f"Error fetching sample properties: {str(e)}")
        raise HTTPException(
            status_code=503, 
            detail=f"Database unavailable: {str(e)}"
        )
