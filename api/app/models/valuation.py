"""
Valuation model for time-series property values.
"""

from datetime import date
from decimal import Decimal
from sqlalchemy import String, Index, ForeignKey, Integer, Date, Numeric, UniqueConstraint, Boolean
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, TYPE_CHECKING
from uuid import UUID

from .base import Base

if TYPE_CHECKING:
    from .property import Property


class Valuation(Base):
    """
    Time-series property valuations.
    
    Stores annual property values, supporting historical analysis and
    year-over-year comparisons across all jurisdictions.
    """
    
    __tablename__ = "valuations"
    
    # Property relationship (required)
    property_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("properties.id", ondelete="CASCADE"),
        nullable=False
    )
    
    # Time period (required)
    tax_year: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Core valuation components (using Decimal for precise monetary calculations)
    land_value: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=12, scale=2), 
        nullable=True
    )
    improvement_value: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=12, scale=2),
        nullable=True
    )
    extra_features_value: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=12, scale=2),
        nullable=True
    )
    agricultural_value: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=12, scale=2),
        nullable=True
    )
    
    # Calculated totals
    assessed_value: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=12, scale=2),
        nullable=True
    )
    market_value: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=12, scale=2),
        nullable=True
    )
    appraised_value: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=12, scale=2),
        nullable=True
    )
    
    # New construction tracking
    new_construction_value: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=12, scale=2),
        nullable=True
    )
    replacement_cost_new: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=12, scale=2),
        nullable=True
    )
    
    # Administrative dates
    certified_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    notice_sent_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    revision_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    
    # Status flags
    is_noticed: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    is_protested: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    is_certified: Mapped[Optional[bool]] = mapped_column(Boolean, default=False, nullable=False)
    
    # Value status and audit trail
    value_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    revision_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    revised_by: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Source tracking
    data_source: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    source_record_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Relationships
    property: Mapped["Property"] = relationship(
        "Property",
        back_populates="valuations"
    )
    
    # Constraints and indexes
    __table_args__ = (
        # Unique constraint: one valuation per property per year
        UniqueConstraint("property_id", "tax_year", name="uq_valuation_property_year"),
        
        # Performance indexes
        Index("idx_valuation_property", "property_id"),
        Index("idx_valuation_year", "tax_year"),
        Index("idx_valuation_values", "market_value", "assessed_value"),
        Index("idx_valuation_certified", "is_certified", "certified_date"),
        Index("idx_valuation_protested", "is_protested"),
        Index("idx_valuation_property_year", "property_id", "tax_year"),
    )
    
    def __repr__(self) -> str:
        return f"<Valuation(property_id={self.property_id}, year={self.tax_year}, market_value={self.market_value})>"
    
    @property
    def total_land_and_improvement(self) -> Optional[Decimal]:
        """Calculate total of land and improvement values."""
        if self.land_value is None or self.improvement_value is None:
            return None
        return self.land_value + self.improvement_value
    
    @property 
    def improvement_to_total_ratio(self) -> Optional[float]:
        """Calculate improvement value as percentage of total value."""
        total = self.total_land_and_improvement
        if total is None or total == 0 or self.improvement_value is None:
            return None
        return float(self.improvement_value / total) 