/**
 * useAdvancedSearch Hook
 * Advanced search and filtering functionality
 */

import { useState, useCallback, useEffect } from 'react';

export interface SearchFilters {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  rarity?: string[];
  category?: string[];
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

export interface FilterOptions {
  rarities: string[];
  categories: string[];
  priceRange: { min: string; max: string };
}

export const useAdvancedSearch = (apiUrl: string = '') => {
  const [results, setResults] = useState<NFTSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    limit: 50,
    offset: 0,
    sortBy: 'recent',
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);

  const baseUrl = apiUrl || import.meta.env.VITE_API_URL || 'http://localhost:3001';

  /**
   * Search NFTs with current filters
   */
  const search = useCallback(async (newFilters?: Partial<SearchFilters>) => {
    setLoading(true);
    setError(null);

    try {
      const finalFilters = { ...filters, ...newFilters };
      setFilters(finalFilters);

      const params = new URLSearchParams();
      if (finalFilters.query) params.append('query', finalFilters.query);
      if (finalFilters.minPrice)
        params.append('minPrice', finalFilters.minPrice.toString());
      if (finalFilters.maxPrice)
        params.append('maxPrice', finalFilters.maxPrice.toString());
      if (finalFilters.rarity)
        finalFilters.rarity.forEach((r) => params.append('rarity', r));
      if (finalFilters.category)
        finalFilters.category.forEach((c) => params.append('category', c));
      if (finalFilters.sortBy) params.append('sortBy', finalFilters.sortBy);
      if (finalFilters.limit) params.append('limit', finalFilters.limit.toString());
      if (finalFilters.offset) params.append('offset', finalFilters.offset.toString());

      const response = await fetch(`${baseUrl}/api/search?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.data);
      setTotal(data.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search error';
      setError(message);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, baseUrl]);

  /**
   * Get search suggestions as user types
   */
  const getSuggestions = useCallback(
    async (query: string) => {
      if (!query || query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(
          `${baseUrl}/api/search/suggestions?query=${encodeURIComponent(query)}&limit=10`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to get suggestions');
        }

        const data = await response.json();
        setSuggestions(data.suggestions);
      } catch (err) {
        console.error('Suggestions error:', err);
        setSuggestions([]);
      }
    },
    [baseUrl]
  );

  /**
   * Load available filter options
   */
  const loadFilterOptions = useCallback(async () => {
    try {
      const response = await fetch(`${baseUrl}/api/search/filters`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load filters');
      }

      const data = await response.json();
      setFilterOptions(data.data);
    } catch (err) {
      console.error('Filter options error:', err);
    }
  }, [baseUrl]);

  /**
   * Update filters and search
   */
  const updateFilters = useCallback(
    (newFilters: Partial<SearchFilters>) => {
      search({ ...filters, ...newFilters, offset: 0 });
    },
    [filters, search]
  );

  /**
   * Paginate to next page
   */
  const nextPage = useCallback(() => {
    const newOffset = (filters.offset || 0) + (filters.limit || 50);
    search({ offset: newOffset });
  }, [filters, search]);

  /**
   * Paginate to previous page
   */
  const prevPage = useCallback(() => {
    const newOffset = Math.max(0, (filters.offset || 0) - (filters.limit || 50));
    search({ offset: newOffset });
  }, [filters, search]);

  /**
   * Reset all filters
   */
  const resetFilters = useCallback(() => {
    const defaultFilters: SearchFilters = {
      limit: 50,
      offset: 0,
      sortBy: 'recent',
    };
    setFilters(defaultFilters);
    search(defaultFilters);
  }, [search]);

  // Load filter options on mount
  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  return {
    results,
    total,
    loading,
    error,
    filters,
    suggestions,
    filterOptions,
    search,
    getSuggestions,
    updateFilters,
    nextPage,
    prevPage,
    resetFilters,
  };
};

/**
 * useTrendingNFTs Hook
 */
export const useTrendingNFTs = (apiUrl: string = '') => {
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = apiUrl || import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/search/trending?limit=10`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch trending');

        const data = await response.json();
        setNfts(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading trending');
        setNfts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [baseUrl]);

  return { nfts, loading, error };
};

/**
 * useHotCollections Hook
 */
export const useHotCollections = (apiUrl: string = '') => {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = apiUrl || import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch(
          `${baseUrl}/api/search/hot-collections?limit=10`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch collections');

        const data = await response.json();
        setCollections(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading collections');
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [baseUrl]);

  return { collections, loading, error };
};

/**
 * useRecentlyAdded Hook
 */
export const useRecentlyAdded = (apiUrl: string = '') => {
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = apiUrl || import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/search/recently-added?limit=20`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch recently added');

        const data = await response.json();
        setNfts(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading recent');
        setNfts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();
  }, [baseUrl]);

  return { nfts, loading, error };
};
