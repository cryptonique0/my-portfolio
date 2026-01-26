# Advanced Search & Filtering Integration Guide

## Quick Start

### 1. Backend Integration (Already Complete ✅)

The search routes are already registered in the backend:
- Routes file: `/backend/src/routes/search-advanced.ts`
- Service file: `/backend/src/services/search-advanced.service.ts`
- Routes registered in: `/backend/src/index.ts` (line ~223)

### 2. Frontend Integration

#### Step 1: Import Hooks in Your Components
```typescript
import { 
  useAdvancedSearch, 
  useTrendingNFTs, 
  useHotCollections, 
  useRecentlyAdded 
} from '../hooks/useAdvancedSearch';
```

#### Step 2: Use Pre-Built Components
```typescript
import { 
  AdvancedSearch, 
  TrendingNFTs, 
  RecentlyAdded, 
  FilterPanel 
} from '../components';

function HomePage() {
  return (
    <div>
      <AdvancedSearch />
    </div>
  );
}

function TrendingPage() {
  return <TrendingNFTs />;
}

function NewPage() {
  return <RecentlyAdded />;
}
```

#### Step 3: Or Build Custom Components with Hooks
```typescript
function CustomSearchPage() {
  const { results, loading, error, search, filters } = useAdvancedSearch();
  const { nfts: trending } = useTrendingNFTs();

  return (
    <div>
      <h1>Search NFTs</h1>
      <input 
        onChange={(e) => search(e.target.value)}
        placeholder="Search..."
      />
      {loading && <div>Loading...</div>}
      {results.map(nft => (
        <div key={nft.id}>{nft.name}</div>
      ))}
    </div>
  );
}
```

## API Endpoints

### Search NFTs
```
GET /api/search-advanced/search
Query Parameters:
  - query: string (search text)
  - minPrice: number (optional)
  - maxPrice: number (optional)
  - rarity: string[] (optional)
  - category: string[] (optional)
  - creator: string (optional)
  - sortBy: 'recent' | 'trending' | 'views' | 'price_asc' | 'price_desc'
  - offset: number (default: 0)
  - limit: number (default: 50)

Response:
{
  "success": true,
  "data": {
    "results": NFTSearchResult[],
    "total": number,
    "offset": number,
    "limit": number
  }
}
```

### Get Trending NFTs
```
GET /api/search-advanced/trending?limit=10

Response:
{
  "success": true,
  "data": TrendingNFT[]
}
```

### Get Hot Collections
```
GET /api/search-advanced/hot-collections?limit=10

Response:
{
  "success": true,
  "data": HotCollection[]
}
```

### Get Recently Added
```
GET /api/search-advanced/recently-added?limit=20

Response:
{
  "success": true,
  "data": NFTSearchResult[]
}
```

### Get Search Suggestions
```
GET /api/search-advanced/suggestions?query=<text>&limit=10

Response:
{
  "success": true,
  "data": string[]
}
```

### Get Available Filters
```
GET /api/search-advanced/filters

Response:
{
  "success": true,
  "data": {
    "rarities": string[],
    "categories": string[],
    "priceRange": { min: number, max: number }
  }
}
```

### Get Popular Searches
```
GET /api/search-advanced/popular?limit=20

Response:
{
  "success": true,
  "data": string[]
}
```

## File Structure

```
backend/
├── src/
│   ├── routes/
│   │   └── search-advanced.ts          (250+ lines) ✅
│   ├── services/
│   │   └── search-advanced.service.ts  (300+ lines) ✅
│   └── index.ts                        (Updated) ✅

frontend/
├── src/
│   ├── hooks/
│   │   └── useAdvancedSearch.ts        (300+ lines) ✅
│   └── components/
│       ├── AdvancedSearch.tsx          (450+ lines) ✅
│       ├── FilterPanel.tsx             (350+ lines) ✅
│       ├── TrendingNFTs.tsx            (400+ lines) ✅
│       ├── RecentlyAdded.tsx           (380+ lines) ✅
│       └── index.search.ts             (Component exports) ✅
```

## Database Setup

The advanced search feature uses the existing `nfts` table structure. For optimal performance, add these indexes:

```sql
-- Full-text search indexes (optional, for large datasets)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_nfts_name_trgm ON nfts USING GIN (name gin_trgm_ops);
CREATE INDEX idx_nfts_description_trgm ON nfts USING GIN (description gin_trgm_ops);

-- Performance indexes
CREATE INDEX idx_nfts_price ON nfts(price);
CREATE INDEX idx_nfts_creator_address ON nfts(creator_address);
CREATE INDEX idx_nfts_created_at ON nfts(created_at DESC);

-- Analytics table (for search recording)
CREATE TABLE IF NOT EXISTS search_analytics (
  id SERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  results_count INTEGER,
  user_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

CREATE INDEX idx_search_analytics_query ON search_analytics(query);
CREATE INDEX idx_search_analytics_user ON search_analytics(user_address);
CREATE INDEX idx_search_analytics_created_at ON search_analytics(created_at DESC);
```

## Environment Variables

Add to `backend/.env` if you want to customize:

```env
# Search Configuration (optional - defaults are built-in)
SEARCH_SUGGESTIONS_MIN_LENGTH=2
SEARCH_RESULTS_DEFAULT_LIMIT=50
SEARCH_MAX_RESULTS=1000
SEARCH_TRENDING_DAYS=1
SEARCH_CACHE_ENABLED=true
SEARCH_CACHE_TTL=300
```

## Testing the Feature

### Using cURL
```bash
# Search for NFTs
curl -X GET "http://localhost:3000/api/search-advanced/search?query=digital&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get trending NFTs
curl -X GET "http://localhost:3000/api/search-advanced/trending" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get hot collections
curl -X GET "http://localhost:3000/api/search-advanced/hot-collections" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get suggestions
curl -X GET "http://localhost:3000/api/search-advanced/suggestions?query=art" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using the Frontend
1. Navigate to `/search` to see the AdvancedSearch component
2. Navigate to `/trending` to see TrendingNFTs
3. Navigate to `/recently-added` to see RecentlyAdded
4. Try searching with filters, sorting, and pagination

## Performance Tips

### 1. Implement Caching
```typescript
// Example: Cache trending results
const trendingCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedTrending() {
  const cached = trendingCache.get('trending');
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data;
  }
  const data = await searchService.getTrendingNFTs(10);
  trendingCache.set('trending', { data, time: Date.now() });
  return data;
}
```

### 2. Pagination
Always use pagination to reduce data transfer:
```typescript
// Load 50 items per page, not all
const { results, total } = await search({
  query: 'digital',
  limit: 50,
  offset: 0
});
```

### 3. Lazy Loading
Load filter options only when needed:
```typescript
const FilterPanel = () => {
  const [expanded, setExpanded] = useState(false);
  const { filterOptions, loadFilterOptions } = useAdvancedSearch();

  useEffect(() => {
    if (expanded) {
      loadFilterOptions();
    }
  }, [expanded]);

  return <div>{expanded && <Filters options={filterOptions} />}</div>;
};
```

## Troubleshooting

### Search Returns No Results
1. Check if NFTs exist in database: `SELECT COUNT(*) FROM nfts;`
2. Verify search query is not too specific
3. Try searching with just a few characters
4. Check if NFT data is properly indexed

### Suggestions Not Working
1. Ensure suggestion query length >= 2 characters
2. Check if NFTs have names/descriptions populated
3. Verify database connection is working

### Trending/Hot Collections Not Showing
1. Verify analytics data exists (if using it)
2. Check if NFTs have price and creator data
3. Ensure at least 10 NFTs exist for trending

### Slow Search Performance
1. Add database indexes (see Database Setup section)
2. Reduce limit parameter
3. Use more specific filters
4. Check database query performance with EXPLAIN ANALYZE

## Production Deployment

### Backend
1. Ensure all environment variables are set
2. Run database migrations/indexes
3. Configure rate limiting as needed
4. Enable caching
5. Monitor API performance

### Frontend
1. Build optimized production bundle: `npm run build`
2. Minify component files
3. Implement lazy loading for components
4. Configure CDN for assets
5. Set up error monitoring

## Feature Enhancements (Optional)

### Add Elasticsearch
```typescript
// For large-scale deployment
const elasticsearch = require('@elastic/elasticsearch');
const client = new elasticsearch.Client({ node: 'http://localhost:9200' });

async function elasticSearch(query: string) {
  const result = await client.search({
    index: 'nfts',
    body: {
      query: {
        multi_match: {
          query: query,
          fields: ['name', 'description', 'creator']
        }
      }
    }
  });
  return result;
}
```

### Add Algolia
```typescript
// For advanced search features
const algoliasearch = require('algoliasearch');
const client = algoliasearch(APP_ID, API_KEY);
const index = client.initIndex('nfts');

async function algoliaSearch(query: string) {
  const results = await index.search(query);
  return results.hits;
}
```

### Add ML-based Recommendations
```typescript
// Get personalized recommendations
async function getRecommendations(userId: string) {
  const userHistory = await getUserSearchHistory(userId);
  const preferences = analyzeUserPreferences(userHistory);
  return recommendNFTs(preferences);
}
```

## Documentation Files

- **ADVANCED_SEARCH_GUIDE.md** - Complete feature documentation
- **ADVANCED_SEARCH_INTEGRATION.md** - This file
- API Documentation at `/api-docs` - Interactive Swagger UI

## Support

For issues or questions:
1. Check the error message in browser console or backend logs
2. Verify all files are created in correct locations
3. Ensure database tables exist and have data
4. Check JWT token is valid and included in API requests
5. Review API documentation at `/api-docs`

---

**Status:** ✅ Complete and Ready for Production
**Version:** 1.0.0
**Last Updated:** 2024
