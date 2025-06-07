"""
Structure element models for detailed building components.
"""

from decimal import Decimal
from sqlalchemy import String, Index, ForeignKey, Integer, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional, TYPE_CHECKING
from uuid import UUID

from .base import Base, LookupMixin, TimestampMixin

if TYPE_CHECKING:
    from .structure import Structure
    from .code_map import CodeMap


class ElementType(Base, LookupMixin):
    """
    Lookup table for structure element types.
    
    Centralizes the mapping of element codes to descriptions
    across all jurisdictions.
    """
    
    __tablename__ = "element_types"
    
    # Extended classification
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    subcategory: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Measurement details
    default_unit: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    is_quantifiable: Mapped[bool] = mapped_column(default=True, nullable=False)
    
    # Relationships
    structure_elements: Mapped[List["StructureElement"]] = relationship(
        "StructureElement",
        back_populates="element_type"
    )
    
    # Indexes
    __table_args__ = (
        Index("idx_element_type_category", "category", "subcategory"),
        Index("idx_element_type_active", "is_active"),
    )
    
    def __repr__(self) -> str:
        return f"<ElementType(code='{self.code}', description='{self.description}')>"


class StructureElement(Base):
    """
    Individual structural elements/components within a structure.
    
    Replaces the original structural_elements table with proper
    normalization and foreign key relationships.
    """
    
    __tablename__ = "structure_elements"
    
    # Structure relationship (required)
    structure_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("structures.id", ondelete="CASCADE"),
        nullable=False
    )
    
    # Element type relationship (required)
    element_type_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("element_types.id", ondelete="RESTRICT"),
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
    height: Mapped[Optional[Decimal]] = mapped_column(
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
    
    # Year information
    actual_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    effective_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Adjustment factors
    adjustment_factor: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=8, scale=4),
        nullable=True
    )
    percent_complete: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=5, scale=2),
        nullable=True
    )
    
    # Notes and additional information
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Source data tracking
    source_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    source_description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    source_category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Relationships
    structure: Mapped["Structure"] = relationship(
        "Structure",
        back_populates="structure_elements"
    )
    
    element_type: Mapped["ElementType"] = relationship(
        "ElementType",
        back_populates="structure_elements"
    )
    
    # Indexes
    __table_args__ = (
        Index("idx_structure_element_structure", "structure_id"),
        Index("idx_structure_element_type", "element_type_id"),
        Index("idx_structure_element_grade", "grade"),
        Index("idx_structure_element_condition", "condition_code"),
        Index("idx_structure_element_year", "actual_year"),
        Index("idx_structure_element_source", "source_code"),
    )
    
    def __repr__(self) -> str:
        return f"<StructureElement(id={self.id}, structure_id={self.structure_id}, type={self.element_type_id})>"
    
    @property
    def total_area(self) -> Optional[Decimal]:
        """Calculate total area if length and width are available."""
        if self.length is not None and self.width is not None:
            return self.length * self.width
        return None 