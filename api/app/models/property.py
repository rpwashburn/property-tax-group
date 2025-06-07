"""
Property model for the canonical property assessment schema.
"""

from sqlalchemy import String, Index, Text, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional, TYPE_CHECKING
from uuid import UUID

from .base import Base

if TYPE_CHECKING:
    from .jurisdiction import Jurisdiction
    from .address import Address
    from .valuation import Valuation
    from .structure import Structure
    from .extra_feature import ExtraFeature
    from .fixture import Fixture


class Property(Base):
    """
    Core property table with jurisdiction-aware account numbers.
    
    This table replaces the property_data table with a normalized structure
    that supports multiple jurisdictions and time-series valuations.
    """
    
    __tablename__ = "properties"
    
    # Jurisdiction relationship (required)
    jurisdiction_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("jurisdictions.id", ondelete="RESTRICT"),
        nullable=False
    )
    
    # Account identification (unique per jurisdiction)
    account_number: Mapped[str] = mapped_column(String(50), nullable=False)
    parcel_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Address relationships
    situs_address_id: Mapped[Optional[UUID]] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("addresses.id", ondelete="SET NULL"),
        nullable=True
    )
    
    mailing_address_id: Mapped[Optional[UUID]] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("addresses.id", ondelete="SET NULL"),
        nullable=True
    )
    
    # Property classification
    state_class: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    property_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Geographic/administrative areas
    school_district: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    neighborhood_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    neighborhood_group: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    market_area_1: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    market_area_1_desc: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    market_area_2: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    market_area_2_desc: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    economic_area: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    
    # Physical characteristics
    land_area_sqft: Mapped[Optional[float]] = mapped_column(nullable=True)
    acreage: Mapped[Optional[float]] = mapped_column(nullable=True)
    
    # Legal description
    legal_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    deed_restrictions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Status and history
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    year_improved: Mapped[Optional[int]] = mapped_column(nullable=True)
    year_annexed: Mapped[Optional[int]] = mapped_column(nullable=True)
    
    # Source data tracking
    source_account_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # Original HCAD acct
    last_data_update: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    
    # Relationships
    jurisdiction: Mapped["Jurisdiction"] = relationship(
        "Jurisdiction",
        back_populates="properties"
    )
    
    situs_address: Mapped[Optional["Address"]] = relationship(
        "Address",
        foreign_keys=[situs_address_id],
        back_populates="situs_properties"
    )
    
    mailing_address: Mapped[Optional["Address"]] = relationship(
        "Address",
        foreign_keys=[mailing_address_id], 
        back_populates="mailing_properties"
    )
    
    valuations: Mapped[List["Valuation"]] = relationship(
        "Valuation",
        back_populates="property",
        cascade="all, delete-orphan",
        order_by="Valuation.tax_year.desc()"
    )
    
    structures: Mapped[List["Structure"]] = relationship(
        "Structure",
        back_populates="property",
        cascade="all, delete-orphan"
    )
    
    extra_features: Mapped[List["ExtraFeature"]] = relationship(
        "ExtraFeature",
        back_populates="property",
        cascade="all, delete-orphan"
    )
    
    fixtures: Mapped[List["Fixture"]] = relationship(
        "Fixture",
        back_populates="property",
        cascade="all, delete-orphan"
    )
    
    # Constraints and indexes
    __table_args__ = (
        # Unique constraint on jurisdiction + account number
        UniqueConstraint("jurisdiction_id", "account_number", name="uq_property_jurisdiction_account"),
        
        # Performance indexes
        Index("idx_property_account", "account_number"),
        Index("idx_property_jurisdiction", "jurisdiction_id"),
        Index("idx_property_addresses", "situs_address_id", "mailing_address_id"),
        Index("idx_property_classification", "state_class", "property_type"),
        Index("idx_property_neighborhood", "neighborhood_code"),
        Index("idx_property_active", "is_active"),
    )
    
    def __repr__(self) -> str:
        return f"<Property(id={self.id}, account='{self.account_number}')>" 