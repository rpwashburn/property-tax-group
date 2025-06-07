"""
Code mapping model for jurisdiction-specific code translations.
"""

from sqlalchemy import String, Index, ForeignKey, UniqueConstraint, Text
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, TYPE_CHECKING
from uuid import UUID

from .base import Base

if TYPE_CHECKING:
    from .jurisdiction import Jurisdiction


class CodeMap(Base):
    """
    Translation table for jurisdiction-specific codes to canonical codes.
    
    This table enables mapping of local codes (e.g., HCAD's 'B' for building class)
    to standardized codes across all jurisdictions, maintaining the original
    source codes for audit and reference purposes.
    """
    
    __tablename__ = "code_maps"
    
    # Jurisdiction relationship (required)
    jurisdiction_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("jurisdictions.id", ondelete="CASCADE"),
        nullable=False
    )
    
    # Code classification
    code_type: Mapped[str] = mapped_column(String(100), nullable=False)  # 'building_class', 'element_type', etc.
    code_category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # subcategory if needed
    
    # Source code (from jurisdiction)
    source_code: Mapped[str] = mapped_column(String(50), nullable=False)
    source_description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Canonical/standardized code
    std_code: Mapped[str] = mapped_column(String(50), nullable=False)
    std_description: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Additional mapping information
    mapping_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    confidence_level: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # 'high', 'medium', 'low'
    
    # Status and versioning
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    version: Mapped[int] = mapped_column(default=1, nullable=False)
    effective_from_year: Mapped[Optional[int]] = mapped_column(nullable=True)
    effective_to_year: Mapped[Optional[int]] = mapped_column(nullable=True)
    
    # Data quality tracking
    usage_count: Mapped[int] = mapped_column(default=0, nullable=False)
    last_verified_date: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    verified_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Source tracking
    created_from_source: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # 'migration', 'manual', etc.
    
    # Relationships
    jurisdiction: Mapped["Jurisdiction"] = relationship(
        "Jurisdiction",
        back_populates="code_maps"
    )
    
    # Constraints and indexes
    __table_args__ = (
        # Unique constraint: one mapping per jurisdiction/type/source code
        UniqueConstraint(
            "jurisdiction_id", 
            "code_type", 
            "source_code", 
            name="uq_code_map_jurisdiction_type_source"
        ),
        
        # Performance indexes
        Index("idx_code_map_jurisdiction", "jurisdiction_id"),
        Index("idx_code_map_type", "code_type"),
        Index("idx_code_map_source", "source_code"),
        Index("idx_code_map_std", "std_code"),
        Index("idx_code_map_active", "is_active"),
        Index("idx_code_map_lookup", "jurisdiction_id", "code_type", "source_code"),
        Index("idx_code_map_reverse", "jurisdiction_id", "code_type", "std_code"),
        Index("idx_code_map_category", "code_type", "code_category"),
        Index("idx_code_map_effective", "effective_from_year", "effective_to_year"),
    )
    
    def __repr__(self) -> str:
        return f"<CodeMap(jurisdiction={self.jurisdiction_id}, type='{self.code_type}', source='{self.source_code}' -> std='{self.std_code}')>"
    
    @classmethod
    def get_std_code(
        cls, 
        session, 
        jurisdiction_id: UUID, 
        code_type: str, 
        source_code: str,
        year: Optional[int] = None
    ) -> Optional[str]:
        """
        Helper method to lookup standard code from source code.
        
        Args:
            session: SQLAlchemy session
            jurisdiction_id: UUID of the jurisdiction
            code_type: Type of code (e.g., 'building_class')
            source_code: Original jurisdiction-specific code
            year: Optional year for time-sensitive mappings
            
        Returns:
            Standard code or None if not found
        """
        query = session.query(cls).filter(
            cls.jurisdiction_id == jurisdiction_id,
            cls.code_type == code_type,
            cls.source_code == source_code,
            cls.is_active == True
        )
        
        if year:
            query = query.filter(
                (cls.effective_from_year.is_(None) | (cls.effective_from_year <= year)),
                (cls.effective_to_year.is_(None) | (cls.effective_to_year >= year))
            )
        
        result = query.first()
        return result.std_code if result else None
    
    @classmethod
    def get_source_code(
        cls,
        session,
        jurisdiction_id: UUID,
        code_type: str,
        std_code: str,
        year: Optional[int] = None
    ) -> Optional[str]:
        """
        Helper method to reverse lookup source code from standard code.
        
        Args:
            session: SQLAlchemy session
            jurisdiction_id: UUID of the jurisdiction
            code_type: Type of code (e.g., 'building_class')
            std_code: Standard/canonical code
            year: Optional year for time-sensitive mappings
            
        Returns:
            Source code or None if not found
        """
        query = session.query(cls).filter(
            cls.jurisdiction_id == jurisdiction_id,
            cls.code_type == code_type,
            cls.std_code == std_code,
            cls.is_active == True
        )
        
        if year:
            query = query.filter(
                (cls.effective_from_year.is_(None) | (cls.effective_from_year <= year)),
                (cls.effective_to_year.is_(None) | (cls.effective_to_year >= year))
            )
        
        result = query.first()
        return result.source_code if result else None 