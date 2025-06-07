"""
Fixture models for property fixtures and built-in features.
"""

from decimal import Decimal
from sqlalchemy import String, Index, ForeignKey, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional, TYPE_CHECKING
from uuid import UUID

from .base import Base, LookupMixin

if TYPE_CHECKING:
    from .property import Property
    from .structure import Structure


class FixtureType(Base, LookupMixin):
    """
    Lookup table for fixture types.
    
    Centralizes the mapping of fixture codes to descriptions
    across all jurisdictions (cabinets, flooring, appliances, etc.).
    """
    
    __tablename__ = "fixture_types"
    
    # Extended classification
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # Kitchen, Bath, etc.
    subcategory: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Measurement details
    default_unit: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    is_quantifiable: Mapped[bool] = mapped_column(default=True, nullable=False)
    
    # Relationships
    fixtures: Mapped[List["Fixture"]] = relationship(
        "Fixture",
        back_populates="fixture_type"
    )
    
    # Indexes
    __table_args__ = (
        Index("idx_fixture_type_category", "category", "subcategory"),
        Index("idx_fixture_type_active", "is_active"),
    )
    
    def __repr__(self) -> str:
        return f"<FixtureType(code='{self.code}', description='{self.description}')>"


class Fixture(Base):
    """
    Fixtures and built-in features within structures.
    
    Replaces the original fixtures table with proper normalization
    and foreign key relationships.
    """
    
    __tablename__ = "fixtures"
    
    # Property relationship (required for property-level fixtures)
    property_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("properties.id", ondelete="CASCADE"),
        nullable=False
    )
    
    # Structure relationship (required for structure-specific fixtures)
    structure_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("structures.id", ondelete="CASCADE"),
        nullable=False
    )
    
    # Fixture type relationship (required)
    fixture_type_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("fixture_types.id", ondelete="RESTRICT"),
        nullable=False
    )
    
    # Quantity and measurement
    units: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=12, scale=4),
        nullable=True
    )
    unit_type: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    
    # Quality and condition
    grade: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    condition: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    
    # Additional details
    brand: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    model: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    material: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    color: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    size_description: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Installation details
    installation_year: Mapped[Optional[int]] = mapped_column(nullable=True)
    is_built_in: Mapped[bool] = mapped_column(default=True, nullable=False)
    
    # Notes
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Source data tracking
    source_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    source_description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Relationships
    property: Mapped["Property"] = relationship(
        "Property",
        back_populates="fixtures"
    )
    
    structure: Mapped["Structure"] = relationship(
        "Structure",
        back_populates="fixtures"
    )
    
    fixture_type: Mapped["FixtureType"] = relationship(
        "FixtureType",
        back_populates="fixtures"
    )
    
    # Indexes
    __table_args__ = (
        Index("idx_fixture_property", "property_id"),
        Index("idx_fixture_structure", "structure_id"),
        Index("idx_fixture_type", "fixture_type_id"),
        Index("idx_fixture_grade", "grade"),
        Index("idx_fixture_condition", "condition"),
        Index("idx_fixture_year", "installation_year"),
        Index("idx_fixture_source", "source_code"),
        Index("idx_fixture_property_structure", "property_id", "structure_id"),
    )
    
    def __repr__(self) -> str:
        return f"<Fixture(id={self.id}, structure_id={self.structure_id}, type={self.fixture_type_id})>" 