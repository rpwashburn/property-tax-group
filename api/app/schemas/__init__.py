"""
Pydantic schemas for API request/response models.

This module contains Pydantic models that define the structure of
API requests and responses for the canonical property assessment schema.
"""

from .property import (
    PropertyCreate,
    PropertyUpdate,
    PropertyResponse,
    PropertyDetailResponse,
    PropertyListResponse,
)
from .valuation import (
    ValuationCreate,
    ValuationUpdate,
    ValuationResponse,
)
from .jurisdiction import (
    JurisdictionCreate,
    JurisdictionUpdate,
    JurisdictionResponse,
)
from .address import (
    AddressCreate,
    AddressUpdate,
    AddressResponse,
)
from .structure import (
    StructureCreate,
    StructureUpdate,
    StructureResponse,
)
from .common import (
    PaginationParams,
    PaginatedResponse,
    ErrorResponse,
)

__all__ = [
    # Property schemas
    "PropertyCreate",
    "PropertyUpdate", 
    "PropertyResponse",
    "PropertyDetailResponse",
    "PropertyListResponse",
    
    # Valuation schemas
    "ValuationCreate",
    "ValuationUpdate",
    "ValuationResponse",
    
    # Jurisdiction schemas
    "JurisdictionCreate",
    "JurisdictionUpdate",
    "JurisdictionResponse",
    
    # Address schemas
    "AddressCreate",
    "AddressUpdate",
    "AddressResponse",
    
    # Structure schemas
    "StructureCreate",
    "StructureUpdate",
    "StructureResponse",
    
    # Common schemas
    "PaginationParams",
    "PaginatedResponse",
    "ErrorResponse",
] 