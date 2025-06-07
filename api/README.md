# FastAPI Canonical Property Assessment Schema

This FastAPI application implements the canonical property assessment schema as specified in the PRD. It provides a production-ready API for multi-jurisdiction property data with normalized tables and proper data relationships.

## 🏗️ Architecture Overview

The application follows a modern, production-ready architecture:

```
api/
├── app/
│   ├── core/           # Configuration and logging
│   ├── database/       # Database connection and migration
│   ├── models/         # SQLAlchemy models (canonical schema)
│   ├── schemas/        # Pydantic schemas for API
│   ├── services/       # Business logic services
│   ├── api/v1/         # API routes
│   └── utils/          # Utility functions
├── alembic/            # Database migrations
└── scripts/            # Migration and utility scripts
```

## 📊 Canonical Schema

The canonical schema replaces the HCAD-specific tables with normalized, jurisdiction-aware tables:

### Core Tables

- **`jurisdictions`** - Multi-jurisdiction support (Harris County, Travis County, etc.)
- **`addresses`** - Normalized address storage with parsed components
- **`properties`** - Core property table with jurisdiction + account number uniqueness
- **`valuations`** - Time-series property values (annual tax year data)
- **`structures`** - Individual buildings on properties
- **`code_maps`** - Translation between jurisdiction codes and canonical codes

### Detail Tables

- **`structure_elements`** - Building components (walls, roof, etc.) 
- **`extra_features`** - Property amenities (pools, garages, etc.)
- **`fixtures`** - Built-in features (cabinets, flooring, etc.)
- **`element_types`**, **`feature_types`**, **`fixture_types`** - Lookup tables

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- PostgreSQL 13+
- Existing HCAD data in NextJS schema tables

### Installation

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Set up database connection:**
   ```bash
   export DATABASE_URL="postgresql+asyncpg://user:password@localhost/dbname"
   ```

### Database Migration

#### Step 1: Create Canonical Schema

Generate and run the initial migration to create the canonical tables:

```bash
cd api
python scripts/create_migration.py
```

This script will:
- Generate Alembic migration files for the canonical schema
- Test database connectivity
- Optionally run the migration to create tables

#### Step 2: Migrate Legacy Data

After creating the canonical tables, migrate your existing HCAD data:

```bash
python -m app.database.migration
```

This will:
- Create HCAD jurisdiction record
- Generate lookup tables from existing data
- Migrate properties, valuations, structures, and related data
- Maintain referential integrity throughout the process

## 📈 Migration Process Details

### Data Flow

```
Legacy HCAD Tables          →    Canonical Tables
─────────────────────────────     ─────────────────
property_data               →    properties + valuations + addresses
structural_elements         →    structures + structure_elements + element_types  
extra_features_detail       →    extra_features + feature_types
fixtures                    →    fixtures + fixture_types
neighborhood_codes          →    code_maps
```

### Key Transformations

1. **Jurisdiction Awareness**: All properties linked to jurisdiction (HCAD initially)
2. **Address Normalization**: Street addresses parsed into components
3. **Time Series Values**: Single property record → annual valuation records
4. **Code Translation**: HCAD-specific codes mapped to canonical codes
5. **Referential Integrity**: Proper foreign key relationships established

### Migration Features

- **Batch Processing**: Handles large datasets (millions of records)
- **Error Handling**: Continues on individual record failures
- **Progress Tracking**: Detailed logging and progress reports
- **Data Validation**: Type conversion and format checking
- **Rollback Support**: Database transactions for consistency

## 🔧 Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost/dbname
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=30

# Application
APP_NAME="Property Assessment API"
VERSION="1.0.0"
DEBUG=false
LOG_LEVEL=INFO

# Security (for production)
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Database Configuration

The application uses async PostgreSQL with connection pooling:

```python
# Automatic configuration from environment
settings = Settings()  # Loads from .env
db_manager = DatabaseManager()  # Production-ready connection management
```

## 🌐 API Endpoints

### Property Endpoints

```
GET    /api/v1/properties/              # List properties with pagination
GET    /api/v1/properties/{id}          # Get property details
GET    /api/v1/properties/search        # Search properties
POST   /api/v1/properties/              # Create property
PUT    /api/v1/properties/{id}          # Update property
DELETE /api/v1/properties/{id}          # Delete property
```

### Valuation Endpoints

```
GET    /api/v1/properties/{id}/valuations/     # Property valuations by year
GET    /api/v1/valuations/{id}                 # Specific valuation details
POST   /api/v1/valuations/                     # Create valuation
PUT    /api/v1/valuations/{id}                 # Update valuation
```

### Analytics Endpoints

```
GET    /api/v1/analytics/market-trends         # Market value trends
GET    /api/v1/analytics/jurisdiction-stats    # Cross-jurisdiction comparisons
GET    /api/v1/analytics/property-history      # Property value history
```

## 🔍 Querying Across Jurisdictions

The canonical schema enables consistent queries across all jurisdictions:

```sql
-- Compare land vs improvement ratios across Texas counties
SELECT 
    j.county_name,
    AVG(v.improvement_value / NULLIF(v.market_value, 0)) as avg_improvement_ratio
FROM valuations v
JOIN properties p ON v.property_id = p.id  
JOIN jurisdictions j ON p.jurisdiction_id = j.id
WHERE j.state = 'TX' AND v.tax_year = 2024
GROUP BY j.county_name;
```

```sql
-- Find properties with pools across all jurisdictions
SELECT 
    p.account_number,
    j.short_name as jurisdiction,
    ft.description as feature_type
FROM properties p
JOIN jurisdictions j ON p.jurisdiction_id = j.id
JOIN extra_features ef ON ef.property_id = p.id
JOIN feature_types ft ON ef.feature_type_id = ft.id
WHERE ft.category = 'Pool';
```

## 🧪 Testing

Run the test suite:

```bash
pytest tests/
```

Test specific components:

```bash
pytest tests/test_models.py          # Model tests
pytest tests/test_migration.py       # Migration tests  
pytest tests/test_api.py             # API endpoint tests
```

## 📊 Performance Considerations

### Database Indexes

The schema includes optimized indexes for common query patterns:

- **Property lookups**: `(jurisdiction_id, account_number)`
- **Valuation queries**: `(property_id, tax_year)`
- **Address searches**: `(city, state)`, `(street_number, street_name)`
- **Code translations**: `(jurisdiction_id, code_type, source_code)`

### Migration Performance

- **Batch processing**: 1,000 records per batch (configurable)
- **Connection pooling**: Reuses database connections
- **Minimal logging**: Reduces I/O during migration
- **Parallel processing**: Multiple workers for large datasets

## 🔐 Security

### Production Security Features

- **HTTPS enforcement**: TrustedHostMiddleware configured
- **CORS protection**: Configurable allowed origins
- **Rate limiting**: Request throttling middleware
- **Input validation**: Pydantic schema validation
- **SQL injection protection**: SQLAlchemy parameterized queries

### Database Security

- **Connection encryption**: SSL/TLS for database connections
- **Role-based access**: Database user permissions
- **Audit logging**: Change tracking and monitoring

## 🚀 Deployment

### Production Deployment

1. **Build the container:**
   ```bash
   docker build -t property-assessment-api .
   ```

2. **Run with environment variables:**
   ```bash
   docker run -d \
     -e DATABASE_URL="postgresql+asyncpg://user:pass@host/db" \
     -e LOG_LEVEL="INFO" \
     -p 8000:8000 \
     property-assessment-api
   ```

### Health Monitoring

The application includes comprehensive health checks:

```
GET /health       # Basic health check
GET /health/db    # Database connectivity check
GET /metrics      # Prometheus metrics
```

## 📋 Migration Checklist

Before running the migration:

- [ ] Database backup created
- [ ] Environment variables configured
- [ ] Test database connection successful
- [ ] Sufficient disk space available
- [ ] Migration script tested on subset of data

After migration:

- [ ] Verify record counts match expectations
- [ ] Test sample queries across jurisdictions
- [ ] Validate foreign key relationships
- [ ] Check data type conversions
- [ ] Run application test suite

## 🤝 Contributing

1. Follow the existing code style (Black formatting)
2. Add tests for new functionality
3. Update documentation for API changes
4. Verify migration compatibility

## 📚 Additional Resources

- [Canonical Schema PRD](../prds/canonical_property_assessment_schema_prd.txt)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Async Documentation](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
- [Alembic Migration Guide](https://alembic.sqlalchemy.org/en/latest/tutorial.html) 