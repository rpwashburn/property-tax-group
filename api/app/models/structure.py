"""
Structure models for building-level information.
"""

from decimal import Decimal
from sqlalchemy import String, Index, ForeignKey, Integer, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional, TYPE_CHECKING
from uuid import UUID

from .base import Base

if TYPE_CHECKING:
    from .property import Property
    from .structure_element import StructureElement
    from .extra_feature import ExtraFeature
    from .fixture import Fixture


class Structure(Base):
    """
    Individual structures/buildings on a property.
    
    Aggregates common structural information from the original
    structural_elements table, supporting properties with multiple buildings.
    """
    
    __tablename__ = "structures"
    
    # Property relationship (required)
    property_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("properties.id", ondelete="CASCADE"),
        nullable=False
    )
    
    # Structure identification
    structure_sequence: Mapped[int] = mapped_column(Integer, nullable=False)  # Original bld_num
    structure_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Physical characteristics
    year_built: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    effective_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    living_area_sqft: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=10, scale=2),
        nullable=True
    )
    total_area_sqft: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=10, scale=2),
        nullable=True
    )
    
    # Building classification
    building_class: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    occupancy_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    construction_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Quality and condition
    quality_grade: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    condition_rating: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    
    # Stories and layout
    number_of_stories: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=3, scale=1),
        nullable=True
    )
    number_of_units: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Status
    is_primary: Mapped[bool] = mapped_column(default=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    
    # Source data tracking
    source_building_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Relationships
    property: Mapped["Property"] = relationship(
        "Property",
        back_populates="structures"
    )
    
    structure_elements: Mapped[List["StructureElement"]] = relationship(
        "StructureElement",
        back_populates="structure",
        cascade="all, delete-orphan"
    )
    
    extra_features: Mapped[List["ExtraFeature"]] = relationship(
        "ExtraFeature",
        back_populates="structure",
        cascade="all, delete-orphan"
    )
    
    fixtures: Mapped[List["Fixture"]] = relationship(
        "Fixture",
        back_populates="structure",
        cascade="all, delete-orphan"
    )
    
    # Constraints and indexes
    __table_args__ = (
        # Unique constraint: structure sequence per property
        UniqueConstraint("property_id", "structure_sequence", name="uq_structure_property_sequence"),
        
        # Performance indexes
        Index("idx_structure_property", "property_id"),
        Index("idx_structure_sequence", "property_id", "structure_sequence"),
        Index("idx_structure_year_built", "year_built"),
        Index("idx_structure_class", "building_class"),
        Index("idx_structure_primary", "is_primary"),
        Index("idx_structure_active", "is_active"),
    )
    
    def __repr__(self) -> str:
        return f"<Structure(id={self.id}, property_id={self.property_id}, sequence={self.structure_sequence})>" 