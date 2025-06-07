"""
Migration service for transitioning from NextJS schema to canonical schema.

This module provides utilities for migrating data from the existing HCAD-formatted
tables to the new canonical property assessment schema.
"""

import asyncio
import logging
from decimal import Decimal
from typing import Dict, List, Optional, Tuple
from uuid import uuid4, UUID

from sqlalchemy import text, select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

from ..core.config import settings
from ..models import (
    Jurisdiction, Address, Property, Valuation, Structure, StructureElement,
    ExtraFeature, Fixture, CodeMap, ElementType, FeatureType, FixtureType
)
from .connection import DatabaseManager

logger = logging.getLogger(__name__)


class MigrationService:
    """Service for migrating legacy HCAD data to canonical schema."""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager
    
    async def migrate_all_data(self) -> Dict[str, int]:
        """
        Migrate all data from legacy tables to canonical schema.
        
        Returns:
            Dict with counts of migrated records by type
        """
        logger.info("Starting full data migration from HCAD schema to canonical schema")
        
        migration_counts = {
            "jurisdictions": 0,
            "addresses": 0,
            "properties": 0,
            "valuations": 0,
            "structures": 0,
            "structure_elements": 0,
            "extra_features": 0,
            "fixtures": 0,
            "code_maps": 0,
        }
        
        async with self.db_manager.get_session() as session:
            try:
                # Step 1: Create HCAD jurisdiction
                hcad_jurisdiction = await self._create_hcad_jurisdiction(session)
                migration_counts["jurisdictions"] = 1
                logger.info(f"Created HCAD jurisdiction: {hcad_jurisdiction.id}")
                
                # Step 2: Create lookup tables and code maps
                element_types = await self._create_element_types(session, hcad_jurisdiction.id)
                feature_types = await self._create_feature_types(session, hcad_jurisdiction.id)
                fixture_types = await self._create_fixture_types(session, hcad_jurisdiction.id)
                code_maps_count = await self._create_code_maps(session, hcad_jurisdiction.id)
                migration_counts["code_maps"] = code_maps_count
                
                # Step 3: Migrate properties in batches
                property_migration = await self._migrate_properties_batch(
                    session, hcad_jurisdiction.id
                )
                migration_counts.update(property_migration)
                
                await session.commit()
                logger.info(f"Migration completed successfully: {migration_counts}")
                
            except Exception as e:
                await session.rollback()
                logger.error(f"Migration failed: {e}")
                raise
        
        return migration_counts
    
    async def _create_hcad_jurisdiction(self, session: AsyncSession) -> Jurisdiction:
        """Create the HCAD jurisdiction record."""
        
        hcad = Jurisdiction(
            state="TX",
            county_name="Harris",
            fips_code="48201",
            full_name="Harris County, Texas",
            short_name="HCAD",
            source_system="HCAD Export",
            data_format="CSV",
            is_active=True
        )
        
        session.add(hcad)
        await session.flush()
        return hcad
    
    async def _create_element_types(self, session: AsyncSession, jurisdiction_id: UUID) -> Dict[str, UUID]:
        """Create element types from structural_elements data."""
        
        # Get unique element types from legacy data
        result = await session.execute(text("""
            SELECT DISTINCT code, type_dscr, category_dscr
            FROM structural_elements 
            WHERE code IS NOT NULL AND type_dscr IS NOT NULL
        """))
        
        element_types = {}
        for row in result:
            element_type = ElementType(
                code=row.code,
                description=row.type_dscr,
                category=row.category_dscr,
                is_active=True
            )
            session.add(element_type)
            await session.flush()
            element_types[row.code] = element_type.id
        
        logger.info(f"Created {len(element_types)} element types")
        return element_types
    
    async def _create_feature_types(self, session: AsyncSession, jurisdiction_id: UUID) -> Dict[str, UUID]:
        """Create feature types from extra_features_detail data."""
        
        result = await session.execute(text("""
            SELECT DISTINCT cd, dscr
            FROM extra_features_detail 
            WHERE cd IS NOT NULL AND dscr IS NOT NULL
        """))
        
        feature_types = {}
        for row in result:
            feature_type = FeatureType(
                code=row.cd,
                description=row.dscr,
                is_active=True
            )
            session.add(feature_type)
            await session.flush()
            feature_types[row.cd] = feature_type.id
        
        logger.info(f"Created {len(feature_types)} feature types")
        return feature_types
    
    async def _create_fixture_types(self, session: AsyncSession, jurisdiction_id: UUID) -> Dict[str, UUID]:
        """Create fixture types from fixtures data."""
        
        result = await session.execute(text("""
            SELECT DISTINCT type, type_dscr
            FROM fixtures 
            WHERE type IS NOT NULL AND type_dscr IS NOT NULL
        """))
        
        fixture_types = {}
        for row in result:
            fixture_type = FixtureType(
                code=row.type,
                description=row.type_dscr,
                is_active=True
            )
            session.add(fixture_type)
            await session.flush()
            fixture_types[row.type] = fixture_type.id
        
        logger.info(f"Created {len(fixture_types)} fixture types")
        return fixture_types
    
    async def _create_code_maps(self, session: AsyncSession, jurisdiction_id: UUID) -> int:
        """Create code mappings for HCAD-specific codes."""
        
        code_maps = [
            # Building class mappings
            ("building_class", "A", "A", "Class A - Superior"),
            ("building_class", "B", "B", "Class B - Good"),
            ("building_class", "C", "C", "Class C - Average"),
            ("building_class", "D", "D", "Class D - Fair"),
            ("building_class", "E", "E", "Class E - Poor"),
            
            # Condition code mappings
            ("condition", "E", "EXCELLENT", "Excellent condition"),
            ("condition", "G", "GOOD", "Good condition"),
            ("condition", "A", "AVERAGE", "Average condition"),
            ("condition", "F", "FAIR", "Fair condition"),
            ("condition", "P", "POOR", "Poor condition"),
            
            # Grade mappings
            ("grade", "A+", "A_PLUS", "Grade A+"),
            ("grade", "A", "A", "Grade A"),
            ("grade", "B+", "B_PLUS", "Grade B+"),
            ("grade", "B", "B", "Grade B"),
            ("grade", "C+", "C_PLUS", "Grade C+"),
            ("grade", "C", "C", "Grade C"),
        ]
        
        count = 0
        for code_type, source_code, std_code, description in code_maps:
            code_map = CodeMap(
                jurisdiction_id=jurisdiction_id,
                code_type=code_type,
                source_code=source_code,
                std_code=std_code,
                std_description=description,
                is_active=True,
                confidence_level="high",
                created_from_source="migration"
            )
            session.add(code_map)
            count += 1
        
        await session.flush()
        logger.info(f"Created {count} code mappings")
        return count
    
    async def _migrate_properties_batch(
        self, 
        session: AsyncSession, 
        jurisdiction_id: UUID,
        batch_size: int = 1000
    ) -> Dict[str, int]:
        """Migrate properties in batches to avoid memory issues."""
        
        counts = {
            "addresses": 0,
            "properties": 0,
            "valuations": 0,
            "structures": 0,
            "structure_elements": 0,
            "extra_features": 0,
            "fixtures": 0,
        }
        
        # Get total count
        result = await session.execute(text("SELECT COUNT(*) FROM property_data"))
        total_properties = result.scalar()
        logger.info(f"Migrating {total_properties} properties in batches of {batch_size}")
        
        offset = 0
        while offset < total_properties:
            batch_counts = await self._migrate_property_batch(
                session, jurisdiction_id, offset, batch_size
            )
            
            for key, value in batch_counts.items():
                counts[key] += value
            
            offset += batch_size
            logger.info(f"Completed batch {offset//batch_size}, total migrated: {counts}")
            
            # Commit each batch
            await session.commit()
        
        return counts
    
    async def _migrate_property_batch(
        self,
        session: AsyncSession,
        jurisdiction_id: UUID,
        offset: int,
        limit: int
    ) -> Dict[str, int]:
        """Migrate a single batch of properties."""
        
        # Get property data batch
        result = await session.execute(text(f"""
            SELECT * FROM property_data 
            ORDER BY acct 
            LIMIT {limit} OFFSET {offset}
        """))
        
        properties_data = result.fetchall()
        counts = {"addresses": 0, "properties": 0, "valuations": 0, "structures": 0, "structure_elements": 0, "extra_features": 0, "fixtures": 0}
        
        for prop_row in properties_data:
            try:
                # Create address
                address = await self._create_address_from_property(session, prop_row)
                if address:
                    counts["addresses"] += 1
                
                # Create property
                property_obj = await self._create_property_from_data(
                    session, prop_row, jurisdiction_id, address.id if address else None
                )
                counts["properties"] += 1
                
                # Create valuation (2024 tax year)
                valuation = await self._create_valuation_from_property(
                    session, prop_row, property_obj.id
                )
                counts["valuations"] += 1
                
                # Migrate related data
                structure_counts = await self._migrate_property_structures(
                    session, prop_row.acct, property_obj.id
                )
                for key, value in structure_counts.items():
                    counts[key] += value
                    
            except Exception as e:
                logger.error(f"Failed to migrate property {prop_row.acct}: {e}")
                continue
        
        return counts
    
    async def _create_address_from_property(self, session: AsyncSession, prop_row) -> Optional[Address]:
        """Create normalized address from property data."""
        
        if not prop_row.site_addr_1:
            return None
        
        # Parse address components
        street_parts = []
        if prop_row.str_num:
            street_parts.append(prop_row.str_num)
        if prop_row.str:
            street_parts.append(prop_row.str)
        if prop_row.str_sfx:
            street_parts.append(prop_row.str_sfx)
        if prop_row.str_sfx_dir:
            street_parts.append(prop_row.str_sfx_dir)
        
        formatted_address = prop_row.site_addr_1
        if prop_row.site_addr_2:
            formatted_address += f", {prop_row.site_addr_2}"
        
        address = Address(
            line1=prop_row.site_addr_1,
            line2=prop_row.site_addr_2,
            city="Houston",  # Default for HCAD
            state="TX",
            street_number=prop_row.str_num,
            street_name=prop_row.str,
            street_suffix=prop_row.str_sfx,
            street_direction=prop_row.str_sfx_dir,
            formatted_address=formatted_address,
            is_standardized=False
        )
        
        session.add(address)
        await session.flush()
        return address
    
    async def _create_property_from_data(
        self,
        session: AsyncSession,
        prop_row,
        jurisdiction_id: UUID,
        situs_address_id: Optional[UUID]
    ) -> Property:
        """Create property from legacy data."""
        
        property_obj = Property(
            jurisdiction_id=jurisdiction_id,
            account_number=prop_row.acct,
            situs_address_id=situs_address_id,
            state_class=prop_row.state_class,
            school_district=prop_row.school_dist,
            neighborhood_code=prop_row.neighborhood_code,
            neighborhood_group=prop_row.neighborhood_grp,
            market_area_1=prop_row.market_area_1,
            market_area_1_desc=prop_row.market_area_1_dscr,
            market_area_2=prop_row.market_area_2,
            market_area_2_desc=prop_row.market_area_2_dscr,
            economic_area=prop_row.econ_area,
            land_area_sqft=self._safe_float(prop_row.land_ar),
            acreage=self._safe_float(prop_row.acreage),
            year_improved=self._safe_int(prop_row.yr_impr),
            year_annexed=self._safe_int(prop_row.yr_annexed),
            legal_description=prop_row.lgl_1,
            source_account_id=prop_row.acct,
            is_active=True
        )
        
        session.add(property_obj)
        await session.flush()
        return property_obj
    
    async def _create_valuation_from_property(
        self,
        session: AsyncSession,
        prop_row,
        property_id: UUID
    ) -> Valuation:
        """Create valuation record from property data."""
        
        valuation = Valuation(
            property_id=property_id,
            tax_year=2024,  # Assuming current HCAD data is 2024
            land_value=self._safe_decimal(prop_row.land_val),
            improvement_value=self._safe_decimal(prop_row.bld_val),
            extra_features_value=self._safe_decimal(prop_row.x_features_val),
            agricultural_value=self._safe_decimal(prop_row.ag_val),
            assessed_value=self._safe_decimal(prop_row.assessed_val),
            market_value=self._safe_decimal(prop_row.tot_mkt_val),
            appraised_value=self._safe_decimal(prop_row.tot_appr_val),
            new_construction_value=self._safe_decimal(prop_row.new_construction_val),
            replacement_cost_new=self._safe_decimal(prop_row.tot_rcn_val),
            is_noticed=prop_row.noticed == "Y" if prop_row.noticed else None,
            is_protested=prop_row.protested == "Y" if prop_row.protested else None,
            value_status=prop_row.value_status,
            data_source="HCAD_MIGRATION"
        )
        
        session.add(valuation)
        await session.flush()
        return valuation
    
    async def _migrate_property_structures(
        self,
        session: AsyncSession,
        account_number: str,
        property_id: UUID
    ) -> Dict[str, int]:
        """Migrate structures and related data for a property."""
        
        counts = {"structures": 0, "structure_elements": 0, "extra_features": 0, "fixtures": 0}
        
        # Get unique building numbers for this account
        result = await session.execute(text("""
            SELECT DISTINCT bld_num 
            FROM structural_elements 
            WHERE acct = :acct AND bld_num IS NOT NULL
        """), {"acct": account_number})
        
        building_numbers = [row.bld_num for row in result]
        
        for bld_num in building_numbers:
            structure = Structure(
                property_id=property_id,
                structure_sequence=int(bld_num) if bld_num.isdigit() else 1,
                is_primary=bld_num == "1",
                source_building_id=bld_num,
                is_active=True
            )
            session.add(structure)
            await session.flush()
            counts["structures"] += 1
            
            # Migrate structure elements for this building
            element_count = await self._migrate_structure_elements(
                session, account_number, bld_num, structure.id
            )
            counts["structure_elements"] += element_count
            
            # Migrate extra features for this building
            feature_count = await self._migrate_extra_features(
                session, account_number, bld_num, property_id, structure.id
            )
            counts["extra_features"] += feature_count
            
            # Migrate fixtures for this building
            fixture_count = await self._migrate_fixtures(
                session, account_number, bld_num, property_id, structure.id
            )
            counts["fixtures"] += fixture_count
        
        return counts
    
    async def _migrate_structure_elements(
        self,
        session: AsyncSession,
        account_number: str,
        bld_num: str,
        structure_id: UUID
    ) -> int:
        """Migrate structural elements for a specific building."""
        
        # Get element type mapping
        element_types_result = await session.execute(
            select(ElementType.id, ElementType.code)
        )
        element_type_map = {code: id for id, code in element_types_result}
        
        result = await session.execute(text("""
            SELECT * FROM structural_elements 
            WHERE acct = :acct AND bld_num = :bld_num
        """), {"acct": account_number, "bld_num": bld_num})
        
        count = 0
        for row in result:
            element_type_id = element_type_map.get(row.code)
            if not element_type_id:
                continue
            
            element = StructureElement(
                structure_id=structure_id,
                element_type_id=element_type_id,
                grade=row.adj,
                source_code=row.code,
                source_description=row.type_dscr,
                source_category=row.category_dscr
            )
            session.add(element)
            count += 1
        
        await session.flush()
        return count
    
    async def _migrate_extra_features(
        self,
        session: AsyncSession,
        account_number: str,
        bld_num: str,
        property_id: UUID,
        structure_id: UUID
    ) -> int:
        """Migrate extra features for a specific building."""
        
        # Get feature type mapping
        feature_types_result = await session.execute(
            select(FeatureType.id, FeatureType.code)
        )
        feature_type_map = {code: id for id, code in feature_types_result}
        
        # Handle both property-level and building-level features
        where_clause = "acct = :acct AND (bld_num = :bld_num OR bld_num IS NULL)"
        result = await session.execute(text(f"""
            SELECT * FROM extra_features_detail 
            WHERE {where_clause}
        """), {"acct": account_number, "bld_num": bld_num})
        
        count = 0
        for row in result:
            feature_type_id = feature_type_map.get(row.cd)
            if not feature_type_id:
                continue
            
            feature = ExtraFeature(
                property_id=property_id,
                structure_id=structure_id if row.bld_num else None,
                feature_type_id=feature_type_id,
                length=self._safe_decimal(row.length),
                width=self._safe_decimal(row.width),
                units=self._safe_decimal(row.units),
                unit_price=self._safe_decimal(row.unit_price),
                adjusted_unit_price=self._safe_decimal(row.adj_unit_price),
                percent_complete=self._safe_decimal(row.pct_comp),
                actual_year=row.act_yr,
                effective_year=row.eff_yr,
                depreciated_value=self._safe_decimal(row.dpr_val),
                assessed_value=self._safe_decimal(row.asd_val),
                grade=row.grade,
                condition_code=row.cond_cd,
                condition_percent=self._safe_decimal(row.pct_cond),
                notes=row.note,
                source_code=row.cd,
                source_description=row.dscr
            )
            session.add(feature)
            count += 1
        
        await session.flush()
        return count
    
    async def _migrate_fixtures(
        self,
        session: AsyncSession,
        account_number: str,
        bld_num: str,
        property_id: UUID,
        structure_id: UUID
    ) -> int:
        """Migrate fixtures for a specific building."""
        
        # Get fixture type mapping
        fixture_types_result = await session.execute(
            select(FixtureType.id, FixtureType.code)
        )
        fixture_type_map = {code: id for id, code in fixture_types_result}
        
        result = await session.execute(text("""
            SELECT * FROM fixtures 
            WHERE acct = :acct AND bld_num = :bld_num
        """), {"acct": account_number, "bld_num": bld_num})
        
        count = 0
        for row in result:
            fixture_type_id = fixture_type_map.get(row.type)
            if not fixture_type_id:
                continue
            
            fixture = Fixture(
                property_id=property_id,
                structure_id=structure_id,
                fixture_type_id=fixture_type_id,
                units=self._safe_decimal(row.units),
                source_code=row.type,
                source_description=row.type_dscr
            )
            session.add(fixture)
            count += 1
        
        await session.flush()
        return count
    
    def _safe_decimal(self, value: str) -> Optional[Decimal]:
        """Safely convert string to Decimal."""
        if not value or value.strip() == "":
            return None
        try:
            return Decimal(str(value).replace(",", ""))
        except:
            return None
    
    def _safe_float(self, value: str) -> Optional[float]:
        """Safely convert string to float."""
        if not value or value.strip() == "":
            return None
        try:
            return float(str(value).replace(",", ""))
        except:
            return None
    
    def _safe_int(self, value: str) -> Optional[int]:
        """Safely convert string to int."""
        if not value or value.strip() == "":
            return None
        try:
            return int(str(value).replace(",", ""))
        except:
            return None


# Migration CLI function
async def run_migration():
    """Run the full migration process."""
    db_manager = DatabaseManager()
    await db_manager.initialize()
    
    try:
        migration_service = MigrationService(db_manager)
        results = await migration_service.migrate_all_data()
        
        print("Migration completed successfully!")
        print("Records migrated:")
        for record_type, count in results.items():
            print(f"  {record_type}: {count:,}")
            
    except Exception as e:
        print(f"Migration failed: {e}")
        raise
    finally:
        await db_manager.close()


if __name__ == "__main__":
    asyncio.run(run_migration()) 