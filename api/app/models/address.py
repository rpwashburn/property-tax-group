"""
Address model for normalized address storage.
"""

from sqlalchemy import String, Index, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional, TYPE_CHECKING

from .base import Base

if TYPE_CHECKING:
    from .property import Property


class Address(Base):
    """
    Normalized address storage.
    
    Separates address components for better searching and standardization
    across jurisdictions with different address formats.
    """
    
    __tablename__ = "addresses"
    
    # Core address components
    line1: Mapped[str] = mapped_column(String(255), nullable=False)
    line2: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(2), nullable=False)
    zip_code: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    zip_plus4: Mapped[Optional[str]] = mapped_column(String(4), nullable=True)
    
    # Parsed components for searching
    street_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    street_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    street_suffix: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # St, Ave, etc.
    street_direction: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)  # N, S, E, W
    unit_type: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # Apt, Unit, etc.
    unit_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    
    # Geographic coordinates (for future use)
    latitude: Mapped[Optional[float]] = mapped_column(nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(nullable=True)
    
    # Standardization tracking
    is_standardized: Mapped[bool] = mapped_column(default=False, nullable=False)
    standardization_source: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # USPS, Google, etc.
    
    # Full address for search/display
    formatted_address: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Relationships
    situs_properties: Mapped[List["Property"]] = relationship(
        "Property",
        foreign_keys="Property.situs_address_id",
        back_populates="situs_address"
    )
    
    mailing_properties: Mapped[List["Property"]] = relationship(
        "Property", 
        foreign_keys="Property.mailing_address_id",
        back_populates="mailing_address"
    )
    
    # Indexes for search performance
    __table_args__ = (
        Index("idx_address_city_state", "city", "state"),
        Index("idx_address_zip", "zip_code"),
        Index("idx_address_street", "street_number", "street_name"),
        Index("idx_address_coords", "latitude", "longitude"),
        Index("idx_address_formatted", "formatted_address"),
    )
    
    def __repr__(self) -> str:
        return f"<Address(id={self.id}, address='{self.formatted_address}')>" 