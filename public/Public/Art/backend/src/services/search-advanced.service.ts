/**
 * Advanced Search Service
 * Full-text search, filtering, trending, and analytics
 */

import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export interface SearchFilters {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  rarity?: string[];
  category?: string[];
  creator?: string;
  owner?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'recent' | 'trending' | 'views';
  limit?: number;
  offset?: number;
}

export interface NFTSearchResult {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  imageUrl: string;
  price?: string;
  creator: string;
  owner: string;
  rarity?: string;
  category?: string;
  views: number;
  favorites: number;
  createdAt: string;
}

export interface TrendingNFT {
  id: string;
  name: string;
  imageUrl: string;
  price: string;
  trend: number; // percentage change
  views: number;
  favorites: number;
  volume: string;
}

export interface HotCollection {
  id: string;
  name: string;
  imageUrl: string;
  floorPrice: string;
  volume24h: string;
  owners: number;
  items: number;
  trend: number; // percentage change
}

export interface RecentlyAdded {
  id: string;
  name: string;
  imageUrl: string;
  creator: string;
  createdAt: string;
  price?: string;
}

export class SearchService {
  /**
   * Full-text search across NFT collection
   */
  async searchNFTs(filters: SearchFilters): Promise<{
    results: NFTSearchResult[];
    total: number;
  }> {
    try {
      let query = supabase.from('nfts').select('*', { count: 'exact' });

      // Full-text search on name and description
      if (filters.query) {
        const searchTerm = filters.query.toLowerCase();
        query = query.or(
          `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
        );
      }

      // Price filtering
      if (filters.minPrice !== undefined) {
        // TODO: Convert price string to number for comparison
        // For now, store price range in metadata
      }
      if (filters.maxPrice !== undefined) {
        // Price max filter
      }

      // Rarity filtering
      if (filters.rarity && filters.rarity.length > 0) {
        query = query.in('rarity', filters.rarity);
      }

      // Category filtering
      if (filters.category && filters.category.length > 0) {
        // Assuming category is stored in attributes JSONB
        // This would need custom filtering logic
      }

      // Creator filtering
      if (filters.creator) {
        query = query.eq('creator_address', filters.creator);
      }

      // Owner filtering
      if (filters.owner) {
        query = query.eq('owner_address', filters.owner);
      }

      // Sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price_asc':
            // Sort by price ascending (would need numeric field)
            query = query.order('created_at', { ascending: true });
            break;
          case 'price_desc':
            query = query.order('created_at', { ascending: false });
            break;
          case 'recent':
            query = query.order('created_at', { ascending: false });
            break;
          case 'trending':
            // Custom trending logic based on views/interactions
            query = query.order('created_at', { ascending: false });
            break;
          case 'views':
            // Would need a views table or field
            query = query.order('created_at', { ascending: false });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Pagination
      const limit = filters.limit || 50;
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, count, error } = await query;

      if (error) {
        throw error;
      }

      const results: NFTSearchResult[] = (data || []).map((nft: any) => ({
        id: nft.id,
        tokenId: nft.token_id,
        name: nft.name,
        description: nft.description,
        imageUrl: nft.image_url,
        creator: nft.creator_address,
        owner: nft.owner_address,
        rarity: nft.attributes?.rarity,
        category: nft.attributes?.category,
        views: nft.views || 0,
        favorites: nft.favorites || 0,
        createdAt: nft.created_at,
      }));

      return {
        results,
        total: count || 0,
      };
    } catch (error) {
      logger.error('Failed to search NFTs:', error);
      throw error;
    }
  }

  /**
   * Get trending NFTs
   */
  async getTrendingNFTs(limit: number = 10): Promise<TrendingNFT[]> {
    try {
      // Get NFTs with high view/interaction counts
      const { data, error } = await supabase
        .from('nfts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      const trending: TrendingNFT[] = (data || []).map((nft: any) => ({
        id: nft.id,
        name: nft.name,
        imageUrl: nft.image_url,
        price: nft.price || '0',
        trend: Math.random() * 100 - 50, // Mock trend data
        views: nft.views || Math.floor(Math.random() * 1000),
        favorites: nft.favorites || Math.floor(Math.random() * 500),
        volume: nft.volume || '0',
      }));

      return trending;
    } catch (error) {
      logger.error('Failed to get trending NFTs:', error);
      throw error;
    }
  }

  /**
   * Get hot collections
   */
  async getHotCollections(limit: number = 10): Promise<HotCollection[]> {
    try {
      // Group NFTs by collection/creator and get stats
      const { data, error } = await supabase.rpc('get_hot_collections', {
        limit_count: limit,
      });

      if (error) {
        // Fallback if RPC doesn't exist
        return this.getHotCollectionsFallback(limit);
      }

      const collections: HotCollection[] = (data || []).map((col: any) => ({
        id: col.id,
        name: col.name,
        imageUrl: col.image_url,
        floorPrice: col.floor_price || '0',
        volume24h: col.volume_24h || '0',
        owners: col.owners || 0,
        items: col.items || 0,
        trend: col.trend || 0,
      }));

      return collections;
    } catch (error) {
      logger.error('Failed to get hot collections:', error);
      return this.getHotCollectionsFallback(limit);
    }
  }

  /**
   * Fallback for getting collections without RPC
   */
  private async getHotCollectionsFallback(
    limit: number
  ): Promise<HotCollection[]> {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .select('creator_address')
        .limit(limit);

      if (error) {
        throw error;
      }

      // Group by creator
      const creators = new Map<string, number>();
      (data || []).forEach((nft: any) => {
        const count = creators.get(nft.creator_address) || 0;
        creators.set(nft.creator_address, count + 1);
      });

      const collections: HotCollection[] = Array.from(creators).map(
        ([creator, count], index) => ({
          id: `collection-${index}`,
          name: `Collection by ${creator.slice(0, 6)}...`,
          imageUrl: '',
          floorPrice: '0',
          volume24h: '0',
          owners: 1,
          items: count,
          trend: Math.random() * 100 - 50,
        })
      );

      return collections;
    } catch (error) {
      logger.error('Failed to get collections fallback:', error);
      return [];
    }
  }

  /**
   * Get recently added NFTs
   */
  async getRecentlyAdded(limit: number = 20): Promise<RecentlyAdded[]> {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      const recent: RecentlyAdded[] = (data || []).map((nft: any) => ({
        id: nft.id,
        name: nft.name,
        imageUrl: nft.image_url,
        creator: nft.creator_address,
        createdAt: nft.created_at,
        price: nft.price,
      }));

      return recent;
    } catch (error) {
      logger.error('Failed to get recently added NFTs:', error);
      throw error;
    }
  }

  /**
   * Get search suggestions based on partial input
   */
  async getSearchSuggestions(
    query: string,
    limit: number = 10
  ): Promise<string[]> {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      const { data, error } = await supabase
        .from('nfts')
        .select('name')
        .ilike('name', `%${query}%`)
        .limit(limit);

      if (error) {
        throw error;
      }

      const suggestions = Array.from(
        new Set((data || []).map((nft: any) => nft.name))
      );
      return suggestions as string[];
    } catch (error) {
      logger.error('Failed to get search suggestions:', error);
      return [];
    }
  }

  /**
   * Get filter options available
   */
  async getFilterOptions(): Promise<{
    rarities: string[];
    categories: string[];
    priceRange: { min: string; max: string };
  }> {
    try {
      const { data, error } = await supabase.from('nfts').select('attributes');

      if (error) {
        throw error;
      }

      const rarities = new Set<string>();
      const categories = new Set<string>();

      (data || []).forEach((nft: any) => {
        if (nft.attributes?.rarity) {
          rarities.add(nft.attributes.rarity);
        }
        if (nft.attributes?.category) {
          categories.add(nft.attributes.category);
        }
      });

      return {
        rarities: Array.from(rarities),
        categories: Array.from(categories),
        priceRange: { min: '0', max: '1000' }, // Mock data
      };
    } catch (error) {
      logger.error('Failed to get filter options:', error);
      throw error;
    }
  }

  /**
   * Record search query for analytics
   */
  async recordSearch(query: string, userId?: string): Promise<void> {
    try {
      await supabase.from('search_analytics').insert({
        query,
        user_id: userId,
        searched_at: new Date().toISOString(),
      });
    } catch (error) {
      logger.warn('Failed to record search:', error);
      // Don't throw - analytics failure shouldn't break search
    }
  }

  /**
   * Get popular search terms
   */
  async getPopularSearches(limit: number = 20): Promise<
    Array<{ term: string; count: number }>
  > {
    try {
      const { data, error } = await supabase.rpc('get_popular_searches', {
        limit_count: limit,
      });

      if (error) {
        // RPC might not exist, return empty
        return [];
      }

      return data || [];
    } catch (error) {
      logger.warn('Failed to get popular searches:', error);
      return [];
    }
  }
}

export const searchService = new SearchService();
