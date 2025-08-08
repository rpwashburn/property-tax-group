# PDF Cache System

## Overview

The PDF cache system prevents expensive AI API calls during PDF development by caching the comparables analysis data locally. This allows developers to iterate on PDF design without repeatedly calling the AI backend.

## How It Works

### 1. **Cache-First Approach**
- When accessing `/admin/comparables/{property_id}/pdf`, the system first checks for cached data
- If cached data exists, it's loaded instantly
- If no cache exists, fresh data is fetched from the API and then cached

### 2. **Cache Location**
- Cache files are stored in `.pdf-cache/` directory in the project root
- Each property gets its own file: `comparables-{accountId}.json`
- Cache directory is git-ignored for development use only

### 3. **Cache Management UI**
- **Cache indicator**: Badge shows when data is from cache
- **Timestamp**: Shows when data was cached
- **Refresh button**: Clears cache and fetches fresh data
- **Clear button**: Removes cached data for the property

## Usage

### For Developers

1. **First visit** to a property's PDF page:
   ```
   📄 /admin/comparables/1234567890123/pdf
   → API call made (costs money)
   → Data cached automatically
   → PDF generation ready
   ```

2. **Subsequent visits**:
   ```
   📄 /admin/comparables/1234567890123/pdf
   → Cache hit! No API call
   → Instant PDF generation
   ```

3. **When you need fresh data**:
   - Click the "Refresh" button to fetch new data
   - Or use the cache management scripts

### Command Line Tools

```bash
# View cache statistics
pnpm pdf-cache:stats

# List all cached properties  
pnpm pdf-cache

# Clear specific property cache
node scripts/manage-pdf-cache.js clear 1234567890123

# Clear all cache (requires FORCE=1)
FORCE=1 pnpm pdf-cache:clear

# Show detailed cached data
node scripts/manage-pdf-cache.js show 1234567890123
```

## Cache Structure

Each cached file contains:
```json
{
  "property": { /* Full property data */ },
  "comparablesData": { /* AI analysis results */ },
  "cachedAt": "2024-01-15T10:30:00.000Z",
  "accountId": "1234567890123"
}
```

## Development Workflow

1. **Initial Setup**: First PDF generation creates cache
2. **PDF Iteration**: Modify PDF components without API calls
3. **Data Refresh**: Use refresh when underlying data changes
4. **Production**: Remove cache system before deployment

## Cache Benefits

- ⚡ **Instant Loading**: No waiting for AI analysis
- 💰 **Cost Savings**: Avoid expensive API calls during development
- 🔄 **Iteration Speed**: Rapid PDF design testing
- 📊 **Consistency**: Same data across design iterations

## Important Notes

- **Development Only**: This cache system is for development purposes
- **Not for Production**: Remove before deploying to production
- **Data Freshness**: Remember to refresh cache when business logic changes
- **Storage**: Cache files can be large (200KB+ per property)

## Cache File Management

### Automatic Management
- Cache created automatically on first API call
- Cache used automatically on subsequent visits
- Cache cleared via UI buttons

### Manual Management
```bash
# Check what's cached
pnpm pdf-cache:stats

# Clear everything (be careful!)
FORCE=1 pnpm pdf-cache:clear

# Clear specific property
node scripts/manage-pdf-cache.js clear 1234567890123
```

## Troubleshooting

### Cache Not Working
1. Check if `.pdf-cache/` directory exists
2. Verify file permissions
3. Check console for error messages

### Stale Data
1. Use "Refresh" button in UI
2. Or clear cache manually: `pnpm cache:clear`

### Large Cache Size
1. Check cache stats: `pnpm pdf-cache:stats`
2. Clear old entries periodically
3. Each property cache is ~200KB-500KB

## Implementation Details

- **Cache Module**: `src/lib/pdf-cache.ts`
- **Page Integration**: `src/app/admin/comparables/[property_id]/pdf/page.tsx`
- **Management Script**: `scripts/manage-pdf-cache.js`
- **Cache Location**: `.pdf-cache/comparables-{accountId}.json`