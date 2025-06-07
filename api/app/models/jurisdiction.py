"""
Jurisdiction model for multi-county support.
"""

from sqlalchemy import String, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, TYPE_CHECKING

from .base import Base

if TYPE_CHECKING:
    from .property import Property
    from .code_map import CodeMap


class Jurisdiction(Base):
    """
    Represents a taxing jurisdiction (county, city, etc.).
    
    This table enables multi-jurisdiction support by providing a 
    canonical identifier for each jurisdiction's data.
    """
    
    __tablename__ = "jurisdictions"
    
    # Core jurisdiction identification
    state: Mapped[str] = mapped_column(String(2), nullable=False)  # TX, CA, etc.
    county_name: Mapped[str] = mapped_column(String(100), nullable=False)
    fips_code: Mapped[str] = mapped_column(String(5), nullable=True, unique=True)
    
    # Administrative details
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)  # "Harris County, Texas"
    short_name: Mapped[str] = mapped_column(String(50), nullable=False)  # "HCAD"
    
    # Data source configuration
    source_system: Mapped[str] = mapped_column(String(100), nullable=True)  # "HCAD Export"
    data_format: Mapped[str] = mapped_column(String(50), nullable=True)  # "CSV", "API", etc.
    
    # Status
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    
    # Relationships
    properties: Mapped[List["Property"]] = relationship(
        "Property", 
        back_populates="jurisdiction",
        cascade="all, delete-orphan"
    )
    
    code_maps: Mapped[List["CodeMap"]] = relationship(
        "CodeMap",
        back_populates="jurisdiction", 
        cascade="all, delete-orphan"
    )
    
    # Indexes
    __table_args__ = (
        Index("idx_jurisdiction_state_county", "state", "county_name"),
        Index("idx_jurisdiction_active", "is_active"),
    )
    
    def __repr__(self) -> str:
        return f"<Jurisdiction(id={self.id}, name='{self.full_name}')>" 