"""
Common Pydantic schemas for API responses.
"""

from typing import Any, Dict, Generic, List, Optional, TypeVar
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field


# Base schemas
class BaseResponse(BaseModel):
    """Base response model with common fields."""
    
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TimestampedBase(BaseModel):
    """Base model with timestamp fields."""
    
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Pagination schemas
class PaginationParams(BaseModel):
    """Pagination parameters for list endpoints."""
    
    page: int = Field(default=1, ge=1, description="Page number (1-based)")
    limit: int = Field(default=20, ge=1, le=100, description="Number of items per page")
    
    @property
    def offset(self) -> int:
        """Calculate offset for database queries."""
        return (self.page - 1) * self.limit


T = TypeVar('T')


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response model."""
    
    items: List[T]
    total: int = Field(description="Total number of items")
    page: int = Field(description="Current page number")
    limit: int = Field(description="Items per page")
    pages: int = Field(description="Total number of pages")
    has_next: bool = Field(description="Whether there is a next page")
    has_prev: bool = Field(description="Whether there is a previous page")
    
    @classmethod
    def create(
        cls,
        items: List[T],
        total: int,
        page: int,
        limit: int
    ) -> "PaginatedResponse[T]":
        """Create a paginated response from items and pagination info."""
        pages = (total + limit - 1) // limit  # Ceiling division
        
        return cls(
            items=items,
            total=total,
            page=page,
            limit=limit,
            pages=pages,
            has_next=page < pages,
            has_prev=page > 1
        )


# Error schemas
class ErrorDetail(BaseModel):
    """Individual error detail."""
    
    field: Optional[str] = Field(None, description="Field that caused the error")
    message: str = Field(description="Error message")
    code: Optional[str] = Field(None, description="Error code")


class ErrorResponse(BaseModel):
    """Standard error response model."""
    
    error: str = Field(description="Error type or category")
    message: str = Field(description="Human-readable error message")
    details: Optional[List[ErrorDetail]] = Field(None, description="Detailed error information")
    request_id: Optional[str] = Field(None, description="Request ID for tracking")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Error timestamp")


# Health check schema
class HealthResponse(BaseModel):
    """Health check response model."""
    
    status: str = Field(description="Service status")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    version: Optional[str] = Field(None, description="Application version")
    database: Optional[str] = Field(None, description="Database status")
    dependencies: Optional[Dict[str, str]] = Field(None, description="Dependency statuses")


# Search and filtering schemas
class SearchParams(BaseModel):
    """Base search parameters."""
    
    query: Optional[str] = Field(None, description="Search query string")
    sort_by: Optional[str] = Field(None, description="Field to sort by")
    sort_order: Optional[str] = Field("asc", regex="^(asc|desc)$", description="Sort order")


class DateRangeFilter(BaseModel):
    """Date range filter."""
    
    start_date: Optional[datetime] = Field(None, description="Start date")
    end_date: Optional[datetime] = Field(None, description="End date")


# API metadata schemas
class APIMetadata(BaseModel):
    """API metadata for responses."""
    
    version: str = Field(description="API version")
    endpoint: str = Field(description="Endpoint path")
    method: str = Field(description="HTTP method")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    processing_time_ms: Optional[float] = Field(None, description="Processing time in milliseconds") 