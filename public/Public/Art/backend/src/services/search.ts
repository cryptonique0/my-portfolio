/**
 * Search & Discovery Service
 * Handles advanced filtering, sorting, and search ranking
 */

export interface NFTFilter {
  query?: string;
  priceMin?: number;
  priceMax?: number;
  creator?: string;
  collection?: string;
  rarity?: string;
  hasRoyalties?: boolean;
  verified?: boolean;
  onlyListed?: boolean;
}

// Extended filter type used by routes
export type SearchFilters = NFTFilter & {
  sortBy?: SortOptions['field'];
  sortOrder?: SortOptions['order'];
  status?: string;
  category?: string;
};

export interface SortOptions {
  field: 'popularity' | 'price' | 'date' | 'trending';
  order: 'asc' | 'desc';
}

export interface SearchResult {
  id: string;
  name: string;
  image: string;
  price?: number;
  creator: string;
  verified: boolean;
  royaltyPercentage?: number;
  salesCount: number;
  popularity: number;
  trending: boolean;
  listed: boolean;
  rarity: string;
  relevanceScore?: number;
  createdAt?: number;
}

/**
 * Search NFTs with advanced filters
 */
export async function searchNFTs(
  filters: SearchFilters,
  sort: SortOptions = { field: 'popularity', order: 'desc' },
  page: number = 1,
  limit: number = 20
): Promise<{
  results: SearchResult[];
  total: number;
  page: number;
  hasMore: boolean;
}> {
  // Mock implementation - replace with real database queries
  const mockNFTs: SearchResult[] = generateMockNFTs(100);

  let filtered = mockNFTs;

  // Apply filters
  if (filters.query) {
    const lowerQuery = filters.query.toLowerCase();
    filtered = filtered.filter(
      nft =>
        nft.name.toLowerCase().includes(lowerQuery) ||
        nft.creator.toLowerCase().includes(lowerQuery)
    );
  }

  if (filters.priceMin !== undefined) {
    filtered = filtered.filter(nft => (nft.price || 0) >= filters.priceMin!);
  }

  if (filters.priceMax !== undefined) {
    filtered = filtered.filter(nft => (nft.price || 0) <= filters.priceMax!);
  }

  if (filters.creator) {
    filtered = filtered.filter(nft => nft.creator.toLowerCase() === filters.creator!.toLowerCase());
  }

  if (filters.rarity) {
    filtered = filtered.filter(nft => nft.rarity === filters.rarity);
  }

  if (filters.hasRoyalties) {
    filtered = filtered.filter(nft => (nft.royaltyPercentage || 0) > 0);
  }

  if (filters.verified) {
    filtered = filtered.filter(nft => nft.verified);
  }

  if (filters.onlyListed) {
    filtered = filtered.filter(nft => nft.listed);
  }

  // Resolve sort from filters if provided
  const resolvedSort: SortOptions = filters.sortBy
    ? { field: filters.sortBy as SortOptions['field'], order: filters.sortOrder || 'desc' }
    : sort;

  // Apply sorting
  filtered.sort((a, b) => {
    let comparison = 0;

    switch (resolvedSort.field) {
      case 'popularity':
        comparison = b.popularity - a.popularity;
        break;
      case 'price':
        comparison = (a.price || 0) - (b.price || 0);
        break;
      case 'date':
        comparison = (b as any).createdAt - (a as any).createdAt;
        break;
      case 'trending':
        if (a.trending !== b.trending) {
          comparison = a.trending ? -1 : 1;
        } else {
          comparison = b.popularity - a.popularity;
        }
        break;
      default:
        comparison = 0;
    }

    return resolvedSort.order === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const start = (page - 1) * limit;
  const end = start + limit;
  const results = filtered.slice(start, end);

  return {
    results,
    total: filtered.length,
    page,
    hasMore: end < filtered.length
  };
}

/**
 * Get trending NFTs
 */
export async function getTrendingNFTs(limit: number = 10): Promise<SearchResult[]> {
  const allNFTs = generateMockNFTs(50);
  return allNFTs
    .filter(nft => nft.trending)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

/**
 * Get popular categories with mock counts
 */
export async function getPopularCategories(): Promise<Array<{ category: string; count: number }>> {
  const categories = ['photography', 'generative', 'music', '3d', 'collectibles'];
  return categories.map(category => ({
    category,
    count: Math.floor(Math.random() * 500)
  }));
}

/**
 * Get mock price statistics
 */
export async function getPriceStats(): Promise<{
  min: number;
  max: number;
  average: number;
  median: number;
}> {
  const prices = generateMockNFTs(50)
    .map(nft => nft.price || 0)
    .sort((a, b) => a - b);

  const min = prices[0] || 0;
  const max = prices[prices.length - 1] || 0;
  const average = prices.length
    ? prices.reduce((sum, p) => sum + p, 0) / prices.length
    : 0;
  const mid = Math.floor(prices.length / 2);
  const median = prices.length % 2 === 0 ? (prices[mid - 1] + prices[mid]) / 2 : prices[mid] || 0;

  return {
    min: Number(min.toFixed(2)),
    max: Number(max.toFixed(2)),
    average: Number(average.toFixed(2)),
    median: Number(median.toFixed(2))
  };
}

/**
 * Get NFTs by category
 */
export async function getNFTsByCategory(
  category: string,
  limit: number = 20,
  page: number = 1
): Promise<{
  results: SearchResult[];
  total: number;
  hasMore: boolean;
}> {
  const allNFTs = generateMockNFTs(100);
  const filtered = allNFTs.filter(nft => nft.rarity === category || category === 'all');

  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    results: filtered.slice(start, end),
    total: filtered.length,
    hasMore: end < filtered.length
  };
}

/**
 * Get search suggestions
 */
export async function getSearchSuggestions(query: string): Promise<string[]> {
  const allNFTs = generateMockNFTs(100);
  const lowerQuery = query.toLowerCase();

  const suggestions = new Set<string>();

  allNFTs.forEach(nft => {
    if (nft.name.toLowerCase().includes(lowerQuery)) {
      suggestions.add(nft.name);
    }
    if (nft.creator.toLowerCase().includes(lowerQuery)) {
      suggestions.add(nft.creator);
    }
  });

  return Array.from(suggestions).slice(0, 5);
}

/**
 * Calculate popularity score
 */
export function calculatePopularityScore(nft: any): number {
  let score = 0;

  // Sales count (0-30 points)
  score += Math.min(nft.salesCount || 0, 30);

  // Verified creator (10 points)
  if (nft.verified) score += 10;

  // Trending (15 points)
  if (nft.trending) score += 15;

  // Recent activity (10 points)
  if (nft.lastActivityTime) {
    const daysSince = (Date.now() - nft.lastActivityTime) / (1000 * 60 * 60 * 24);
    if (daysSince < 7) score += 10;
  }

  return Math.min(score, 100);
}

/**
 * Helper: Generate mock NFTs for testing
 */
function generateMockNFTs(count: number): SearchResult[] {
  const rarities = ['common', 'uncommon', 'rare', 'legendary'];
  const creators = ['ArtistoX', 'CreativeGenius', 'PixelMaster', 'DigitalDreamer', 'CodeArtist'];
  const nfts: SearchResult[] = [];

  for (let i = 0; i < count; i++) {
    const isTrending = Math.random() > 0.85;
    const isVerified = Math.random() > 0.7;

    nfts.push({
      id: `nft-${i}`,
      name: `NFT Collection #${i + 1}`,
      image: `https://via.placeholder.com/300?text=NFT${i + 1}`,
      price: Math.random() * 50,
      creator: creators[i % creators.length],
      verified: isVerified,
      royaltyPercentage: Math.random() * 20,
      salesCount: Math.floor(Math.random() * 100),
      popularity: Math.floor(Math.random() * 100),
      trending: isTrending,
      listed: Math.random() > 0.3,
      rarity: rarities[Math.floor(Math.random() * rarities.length)],
      createdAt: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
    });
  }

  return nfts;
}
