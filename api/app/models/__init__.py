"""
Database models for the canonical property assessment schema.

This module contains SQLAlchemy models that implement the canonical schema
as defined in the Property Assessment Schema PRD.
"""

from .base import Base
from .jurisdiction import Jurisdiction
from .address import Address
from .property import Property
from .valuation import Valuation
from .structure import Structure
from .structure_element import StructureElement, ElementType
from .extra_feature import ExtraFeature, FeatureType
from .fixture import Fixture, FixtureType
from .code_map import CodeMap

__all__ = [
    "Base",
    "Jurisdiction",
    "Address", 
    "Property",
    "Valuation",
    "Structure",
    "StructureElement",
    "ElementType",
    "ExtraFeature", 
    "FeatureType",
    "Fixture",
    "FixtureType",
    "CodeMap",
] 