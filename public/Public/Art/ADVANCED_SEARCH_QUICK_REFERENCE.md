# Advanced Search & Filtering - Quick Reference

## 🚀 Quick Start (5 minutes)

### For Users
1. **Search:** Type in the search bar → See results instantly
2. **Filter:** Select rarity, category, price range
3. **Sort:** Choose trending, price, views, recent
4. **Explore:** Check out Trending, Hot Collections, Recently Added sections
5. **Paginate:** Navigate through results with buttons

### For Developers
1. **Use Components:**
```tsx
import { AdvancedSearch, TrendingNFTs } from './components';
<AdvancedSearch />
<TrendingNFTs />
```

2. **Use Hooks:**
```tsx
import { useAdvancedSearch, useTrendingNFTs } from './hooks/useAdvancedSearch';
const { results, search, filters } = useAdvancedSearch();
const { nfts: trending } = useTrendingNFTs();
```

3. **Call APIs:**
```bash
GET /api/search-advanced/search?query=digital&limit=50
GET /api/search-advanced/trending
GET /api/search-advanced/hot-collections
GET /api/search-advanced/recently-added
```

---

## 📂 File Locations

### Backend
```
backend/src/
├── services/
│   └── search-advanced.service.ts      (300+ lines)
└── routes/
    └── search-advanced.ts              (250+ lines)
```

### Frontend
```
frontend/src/
├── hooks/
│   └── useAdvancedSearch.ts            (300+ lines)
└── components/
    ├── AdvancedSearch.tsx              (450+ lines)
    ├── FilterPanel.tsx                 (350+ lines)
    ├── TrendingNFTs.tsx                (400+ lines)
    ├── RecentlyAdded.tsx               (380+ lines)
    └── index.search.ts                 (exports)
```

### Documentation
```
├── ADVANCED_SEARCH_GUIDE.md            (2,000+ lines)
├── ADVANCED_SEARCH_INTEGRATION.md      (1,500+ lines)
├── ADVANCED_SEARCH_SUMMARY.md          (1,500+ lines)
└── ADVANCED_SEARCH_CHECKLIST.md        (500+ lines)
```

---

## 🔗 API Endpoints

### Search
```
GET /api/search-advanced/search
Query: query, minPrice, maxPrice, rarity, category, sortBy, offset, limit
```

### Trending
```
GET /api/search-advanced/trending
Query: limit
```

### Hot Collections
```
GET /api/search-advanced/hot-collections
Query: limit
```

### Recently Added
```
GET /api/search-advanced/recently-added
Query: limit
```

### Suggestions
```
GET /api/search-advanced/suggestions
Query: query, limit
```

### Filter Options
```
GET /api/search-advanced/filters
Response: { rarities, categories, priceRange }
```

### Popular Searches
```
GET /api/search-advanced/popular
Query: limit
```

---

## 🎯 Component Usage

### AdvancedSearch
```tsx
import { AdvancedSearch } from './components';

<AdvancedSearch />
```
Features: Search bar, filters, trending, hot collections, recently added

### TrendingNFTs
```tsx
import { TrendingNFTs } from './components';

<TrendingNFTs />
```
Features: Ranked trending NFTs, hot collections grid, statistics

### RecentlyAdded
```tsx
import { RecentlyAdded } from './components';

<RecentlyAdded />
```
Features: Grid/list view, time-based sorting, quick stats

### FilterPanel
```tsx
import { FilterPanel } from './components';

<FilterPanel 
  filters={filters}
  rarities={options.rarities}
  categories={options.categories}
  onRarityChange={handleRarity}
  onCategoryChange={handleCategory}
  onPriceChange={handlePrice}
  onSortChange={handleSort}
  onReset={handleReset}
/>
```
Features: Collapsible sections, price inputs, multi-select filters

---

## 🪝 Hook Usage

### useAdvancedSearch
```tsx
const {
  results,           // NFTSearchResult[]
  total,             // number
  loading,           // boolean
  error,             // string | null
  filters,           // SearchFilters
  suggestions,       // string[]
  filterOptions,     // FilterOptions | null
  search,            // (filters?) => void
  getSuggestions,    // (query) => void
  updateFilters,     // (newFilters) => void
  nextPage,          // () => void
  prevPage,          // () => void
  resetFilters,      // () => void
  loadFilterOptions, // () => void
} = useAdvancedSearch();
```

### useTrendingNFTs
```tsx
const {
  nfts,              // TrendingNFT[]
  loading,           // boolean
  error,             // string | null
} = useTrendingNFTs();
```

### useHotCollections
```tsx
const {
  collections,       // HotCollection[]
  loading,           // boolean
  error,             // string | null
} = useHotCollections();
```

### useRecentlyAdded
```tsx
const {
  nfts,              // NFTSearchResult[]
  loading,           // boolean
  error,             // string | null
} = useRecentlyAdded();
```

---

## 📊 Data Types

### SearchFilters
```typescript
{
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  rarity?: string[];
  category?: string[];
  creator?: string;
  owner?: string;
  sortBy?: 'recent' | 'trending' | 'views' | 'price_asc' | 'price_desc';
  offset?: number;
  limit?: number;
}
```

### NFTSearchResult
```typescript
{
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  rarity: string;
  category: string;
  creator: string;
  owner: string;
  views: number;
  favorites: number;
  createdAt: string;
}
```

### TrendingNFT
```typescript
{
  id: string;
  name: string;
  creator: string;
  price: number;
  trend: number;           // percentage change
  views: number;
  favorites: number;
  imageUrl: string;
}
```

### HotCollection
```typescript
{
  id: string;
  name: string;
  creator: string;
  floorPrice: number;
  volume24h: number;
  items: number;
  trend: number;            // percentage change
  imageUrl: string;
}
```

---

## 🛠️ Configuration

### Backend Environment Variables
```env
# Optional - defaults are built-in
SEARCH_SUGGESTIONS_MIN_LENGTH=2
SEARCH_RESULTS_DEFAULT_LIMIT=50
SEARCH_TRENDING_DAYS=1
SEARCH_CACHE_TTL=300
```

### Frontend Configuration
- API URL: Auto-configured from environment
- Token: Read from localStorage key 'authToken'

---

## 🔒 Security

### Authentication
- All endpoints require JWT token
- Token passed in Authorization header: `Authorization: Bearer <token>`

### Validation
- All inputs validated server-side
- SQL injection prevention (parameterized queries)
- CORS configured

### Rate Limiting
- 100 req/min per IP (default)
- Configurable in middleware

---

## 🐛 Troubleshooting

### Search Returns Empty
**Cause:** No NFTs matching criteria
**Fix:** Try fewer filters, shorter search term

### Suggestions Not Working
**Cause:** Query too short (< 2 chars)
**Fix:** Type at least 2 characters

### Trending Not Showing
**Cause:** Insufficient data
**Fix:** Ensure NFTs have price and creator data

### Slow Performance
**Cause:** No database indexes
**Fix:** Run optimization indexes (see docs)

### Component Not Rendering
**Cause:** Import path wrong
**Fix:** Check import statement in code

---

## 📈 Performance Tips

1. **Use pagination:** Don't load all results at once
2. **Lazy load:** Load filter options on demand
3. **Cache results:** Implement local caching for repeated searches
4. **Optimize DB:** Add indexes for frequently searched fields

---

## 🚀 Deployment

### Backend
1. Ensure routes registered in `/backend/src/index.ts` ✅
2. Set environment variables
3. Run database migrations (if needed)
4. Start backend server

### Frontend
1. Import components in your pages
2. Build: `npm run build`
3. Deploy to hosting

---

## 📞 Support

### Check These First
1. `/api-docs` - Interactive API documentation
2. `ADVANCED_SEARCH_GUIDE.md` - Full documentation
3. `ADVANCED_SEARCH_INTEGRATION.md` - Integration guide
4. Backend/frontend console logs

### Common Fixes
- Clear cache: Ctrl+Shift+Delete (Chrome)
- Restart server: Kill process, npm run dev
- Check token: Verify JWT in localStorage
- Check network: Open DevTools → Network tab

---

## 📋 Files Summary

| File | Size | Purpose |
|------|------|---------|
| search-advanced.service.ts | 300+ | Core search logic |
| search-advanced.ts | 250+ | API endpoints |
| useAdvancedSearch.ts | 300+ | React hooks |
| AdvancedSearch.tsx | 450+ | Main UI component |
| FilterPanel.tsx | 350+ | Filter UI |
| TrendingNFTs.tsx | 400+ | Trending display |
| RecentlyAdded.tsx | 380+ | New NFTs display |

**Total:** 2,430+ lines of production code

---

## ✅ Status

**Implementation:** ✅ Complete
**Testing:** ✅ Verified
**Documentation:** ✅ Comprehensive
**Production Ready:** ✅ Yes

---

**Last Updated:** 2024
**Version:** 1.0.0

For detailed information, see:
- 📖 [ADVANCED_SEARCH_GUIDE.md](./ADVANCED_SEARCH_GUIDE.md)
- 🔧 [ADVANCED_SEARCH_INTEGRATION.md](./ADVANCED_SEARCH_INTEGRATION.md)
- ✅ [ADVANCED_SEARCH_SUMMARY.md](./ADVANCED_SEARCH_SUMMARY.md)
