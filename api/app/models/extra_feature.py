"""
Extra feature models for property enhancements and amenities.
"""

from decimal import Decimal
from sqlalchemy import String, Index, ForeignKey, Integer, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional, TYPE_CHECKING
from uuid import UUID

from .base import Base, LookupMixin

if TYPE_CHECKING:
    from .property import Property
    from .structure import Structure


class FeatureType(Base, LookupMixin):
    """
    Lookup table for extra feature types.
    
    Centralizes the mapping of feature codes to descriptions
    across all jurisdictions (pools, garages, decks, etc.).
    """
    
    __tablename__ = "feature_types"
    
    # Extended classification
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # Pool, Garage, etc.
    subcategory: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Measurement details
    default_unit: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    is_quantifiable: Mapped[bool] = mapped_column(default=True, nullable=False)
    
    # Valuation information
    typical_unit_price_range_low: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=10, scale=2),
        nullable=True
    )
    typical_unit_price_range_high: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=10, scale=2),
        nullable=True
    )
    
    # Relationships
    extra_features: Mapped[List["ExtraFeature"]] = relationship(
        "ExtraFeature",
        back_populates="feature_type"
    )
    
    # Indexes
    __table_args__ = (
        Index("idx_feature_type_category", "category", "subcategory"),
        Index("idx_feature_type_active", "is_active"),
    )
    
    def __repr__(self) -> str:
        return f"<FeatureType(code='{self.code}', description='{self.description}')>"


class ExtraFeature(Base):
    """
    Extra features and amenities on properties.
    
    Replaces the original extra_features_detail table with proper
    normalization and support for both property-level and structure-level features.
    """
    
    __tablename__ = "extra_features"
    
    # Property relationship (required)
    property_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("properties.id", ondelete="CASCADE"),
        nullable=False
    )
    
    # Structure relationship (optional - for structure-specific features)
    structure_id: Mapped[Optional[UUID]] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("structures.id", ondelete="CASCADE"),
        nullable=True
    )
    
    # Feature type relationship (required)
    feature_type_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("feature_types.id", ondelete="RESTRICT"),
        nullable=False
    )
    
    # Measurement and quantity
    quantity: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=12, scale=4),
        nullable=True
    )
    unit: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    
    # Dimensions
    length: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=10, scale=2),
        nullable=True
    )
    width: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=10, scale=2),
        nullable=True
    )
    depth: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=10, scale=2),
        nullable=True
    )
    
    # Quality and condition
    grade: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    condition_code: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    condition_percent: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=5, scale=2),
        nullable=True
    )
    
    # Pricing and valuation
    unit_price: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=10, scale=2),
        nullable=True
    )
    adjusted_unit_price: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=10, scale=2),
        nullable=True
    )
    depreciated_value: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=12, scale=2),
        nullable=True
    )
    assessed_value: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=12, scale=2),
        nullable=True
    )
    
    # Construction details
    actual_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    effective_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    percent_complete: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=5, scale=2),
        nullable=True
    )
    
    # Additional information
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Source data tracking
    source_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    source_description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Relationships
    property: Mapped["Property"] = relationship(
        "Property",
        back_populates="extra_features"
    )
    
    structure: Mapped[Optional["Structure"]] = relationship(
        "Structure",
        back_populates="extra_features"
    )
    
    feature_type: Mapped["FeatureType"] = relationship(
        "FeatureType",
        back_populates="extra_features"
    )
    
    # Indexes
    __table_args__ = (
        Index("idx_extra_feature_property", "property_id"),
        Index("idx_extra_feature_structure", "structure_id"),
        Index("idx_extra_feature_type", "feature_type_id"),
        Index("idx_extra_feature_grade", "grade"),
        Index("idx_extra_feature_condition", "condition_code"),
        Index("idx_extra_feature_year", "actual_year"),
        Index("idx_extra_feature_value", "assessed_value"),
        Index("idx_extra_feature_source", "source_code"),
    )
    
    def __repr__(self) -> str:
        return f"<ExtraFeature(id={self.id}, property_id={self.property_id}, type={self.feature_type_id})>"
    
    @property
    def total_area(self) -> Optional[Decimal]:
        """Calculate total area if length and width are available."""
        if self.length is not None and self.width is not None:
            return self.length * self.width
        return None
    
    @property
    def total_volume(self) -> Optional[Decimal]:
        """Calculate total volume if length, width, and depth are available."""
        if self.length is not None and self.width is not None and self.depth is not None:
            return self.length * self.width * self.depth
        return None 