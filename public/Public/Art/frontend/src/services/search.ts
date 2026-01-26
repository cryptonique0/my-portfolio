import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Search & Discovery Service
 * Provides advanced filtering, sorting, and search ranking
 */

export interface SearchFilters {
  query?: string;
  priceMin?: number;
  priceMax?: number;
  creator?: string;
  collection?: string;
  category?: string;
  status?: 'listed' | 'auction' | 'sold';
  network?: 'base-testnet' | 'base-mainnet' | 'base';
  sortBy?: 'popularity' | 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'trending';
  sortOrder?: 'asc' | 'desc';
  rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
  hasRoyalties?: boolean;
  verified?: boolean;
  onlyListed?: boolean;
  page?: number;
  limit?: number;
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
  metadata: Record<string, any>;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Advanced search with ranking algorithm
 */
export async function searchNFTs(filters: SearchFilters): Promise<SearchResponse> {
  try {
    const params = new URLSearchParams();

    if (filters.query) params.append('q', filters.query);
    if (filters.priceMin !== undefined) params.append('priceMin', filters.priceMin.toString());
    if (filters.priceMax !== undefined) params.append('priceMax', filters.priceMax.toString());
    if (filters.creator) params.append('creator', filters.creator);
    if (filters.collection) params.append('collection', filters.collection);
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    if (filters.network) params.append('network', filters.network);
    // Map UI sort options to API sort fields and order
    const sortMap: Record<string, { sortBy: string; sortOrder: 'asc' | 'desc' }> = {
      price_asc: { sortBy: 'price', sortOrder: 'asc' },
      price_desc: { sortBy: 'price', sortOrder: 'desc' },
      trending: { sortBy: 'trending', sortOrder: 'desc' },
      newest: { sortBy: 'date', sortOrder: 'desc' },
      oldest: { sortBy: 'date', sortOrder: 'asc' },
      popularity: { sortBy: 'popularity', sortOrder: 'desc' }
    };

    if (filters.sortBy) {
      const mapped = sortMap[filters.sortBy] || { sortBy: 'popularity', sortOrder: 'desc' };
      params.append('sortBy', mapped.sortBy);
      params.append('sortOrder', filters.sortOrder || mapped.sortOrder);
    }
    if (filters.rarity) params.append('rarity', filters.rarity);
    if (filters.hasRoyalties !== undefined) params.append('royalties', filters.hasRoyalties.toString());
    if (filters.verified !== undefined) params.append('verified', filters.verified.toString());
    if (filters.onlyListed !== undefined) params.append('listed', filters.onlyListed.toString());

    params.append('page', (filters.page || 1).toString());
    params.append('limit', (filters.limit || 20).toString());

    const response = await axios.get<SearchResponse>(
      `${API_URL}/search?${params.toString()}`
    );

    return response.data;
  } catch (error: any) {
    console.error('Search failed:', error);
    throw new Error(error.response?.data?.message || 'Search failed');
  }
}

/**
 * Get trending NFTs with popularity ranking
 */
export async function getTrendingNFTs(limit = 10): Promise<SearchResult[]> {
  try {
    const response = await axios.get<SearchResult[]>(
      `${API_URL}/search/trending?limit=${limit}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch trending NFTs:', error);
    return [];
  }
}

/**
 * Get NFTs by category
 */
export async function getNFTsByCategory(
  category: string,
  limit = 20,
  page = 1
): Promise<SearchResponse> {
  try {
    const response = await axios.get<SearchResponse>(
      `${API_URL}/search/category/${category}?limit=${limit}&page=${page}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch category:', error);
    throw new Error('Failed to fetch category');
  }
}

/**
 * Get search suggestions/autocomplete
 */
export async function getSearchSuggestions(query: string): Promise<string[]> {
  try {
    const response = await axios.get<string[]>(
      `${API_URL}/search/suggestions?q=${encodeURIComponent(query)}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch suggestions:', error);
    return [];
  }
}

/**
 * Calculate popularity score (for client-side ranking)
 */
export function calculatePopularityScore(nft: any): number {
  let score = 0;

  // Sales count (0-30 points)
  score += Math.min(nft.salesCount || 0, 30);

  // Verified creator (10 points)
  if (nft.creator?.verified) score += 10;

  // Trending indicator (15 points)
  if (nft.trending) score += 15;

  // Recent sales (10 points)
  if (nft.lastSaleTime && Date.now() - nft.lastSaleTime < 7 * 24 * 60 * 60 * 1000) {
    score += 10;
  }

  // High volume (15 points)
  if ((nft.totalVolume || 0) > 10) score += 15;

  // Royalties (5 points - creator-friendly)
  if ((nft.royaltyPercentage || 0) > 5) score += 5;

  return Math.min(score, 100);
}

/**
 * Filter NFTs client-side (for refinement)
 */
export function filterNFTs(nfts: SearchResult[], filters: SearchFilters): SearchResult[] {
  return nfts.filter(nft => {
    // Price filter
    if (filters.priceMin !== undefined && nft.price !== undefined && nft.price < filters.priceMin) {
      return false;
    }
    if (filters.priceMax !== undefined && nft.price !== undefined && nft.price > filters.priceMax) {
      return false;
    }

    // Creator filter
    if (filters.creator && nft.creator !== filters.creator) {
      return false;
    }

    // Rarity filter
    if (filters.rarity && nft.rarity !== filters.rarity) {
      return false;
    }

    // Royalties filter
    if (filters.hasRoyalties && (!nft.royaltyPercentage || nft.royaltyPercentage === 0)) {
      return false;
    }

    // Verified filter
    if (filters.verified && !nft.verified) {
      return false;
    }

    // Listed filter
    if (filters.onlyListed && !nft.listed) {
      return false;
    }

    return true;
  });
}

/**
 * Sort NFTs by various criteria
 */
export function sortNFTs(nfts: SearchResult[], sortBy: SearchFilters['sortBy']): SearchResult[] {
  const sorted = [...nfts];

  switch (sortBy) {
    case 'popularity':
      return sorted.sort((a, b) => b.popularity - a.popularity);

    case 'price_asc':
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));

    case 'price_desc':
      return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));

    case 'trending':
      return sorted.sort((a, b) => {
        if (a.trending !== b.trending) return a.trending ? -1 : 1;
        return b.popularity - a.popularity;
      });

    case 'newest':
      return sorted.reverse();

    case 'oldest':
      return sorted;

    default:
      return sorted;
  }
}

/**
 * Rank search results by relevance
 */
export function rankSearchResults(
  results: SearchResult[],
  query: string
): SearchResult[] {
  const lowerQuery = query.toLowerCase();

  return results.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Exact name match (50 points)
    if (a.name.toLowerCase() === lowerQuery) scoreA += 50;
    if (b.name.toLowerCase() === lowerQuery) scoreB += 50;

    // Name starts with query (30 points)
    if (a.name.toLowerCase().startsWith(lowerQuery)) scoreA += 30;
    if (b.name.toLowerCase().startsWith(lowerQuery)) scoreB += 30;

    // Name contains query (20 points)
    if (a.name.toLowerCase().includes(lowerQuery)) scoreA += 20;
    if (b.name.toLowerCase().includes(lowerQuery)) scoreB += 20;

    // Creator match (15 points)
    if (a.creator.toLowerCase().includes(lowerQuery)) scoreA += 15;
    if (b.creator.toLowerCase().includes(lowerQuery)) scoreB += 15;

    // Verified creator bonus (10 points)
    if (a.verified) scoreA += 10;
    if (b.verified) scoreB += 10;

    // Popularity tiebreaker
    if (scoreA === scoreB) {
      return b.popularity - a.popularity;
    }

    return scoreB - scoreA;
  });
}
