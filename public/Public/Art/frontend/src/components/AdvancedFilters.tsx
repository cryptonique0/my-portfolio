import React, { useState } from 'react';
import { SearchFilters } from '../services/search';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  loading?: boolean;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onFiltersChange,
  loading = false
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'popularity'
  });

  const handleChange = (key: keyof SearchFilters, value: any) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFiltersChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Sort Options */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Sort By
        </label>
        <select
          value={filters.sortBy || 'popularity'}
          onChange={(e) => {
            const value = e.target.value as SearchFilters['sortBy'];
            switch (value) {
              case 'price_asc':
                handleChange('sortOrder', 'asc');
                break;
              case 'price_desc':
                handleChange('sortOrder', 'desc');
                break;
              case 'oldest':
                handleChange('sortOrder', 'asc');
                break;
              default:
                handleChange('sortOrder', 'desc');
            }
            handleChange('sortBy', value);
          }}
          disabled={loading}
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="popularity">Most Popular</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="trending">Trending</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Price Range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Min Price (Ξ)
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={filters.priceMin || ''}
            onChange={(e) => handleChange('priceMin', e.target.value ? parseFloat(e.target.value) : undefined)}
            disabled={loading}
            placeholder="0"
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Max Price (Ξ)
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={filters.priceMax || ''}
            onChange={(e) => handleChange('priceMax', e.target.value ? parseFloat(e.target.value) : undefined)}
            disabled={loading}
            placeholder="∞"
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Category
        </label>
        <select
          value={filters.category || ''}
          onChange={(e) => handleChange('category', e.target.value || undefined)}
          disabled={loading}
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="">All Categories</option>
          <option value="photography">Photography</option>
          <option value="generative">Generative</option>
          <option value="music">Music</option>
          <option value="3d">3D</option>
          <option value="collectibles">Collectibles</option>
        </select>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Status
        </label>
        <select
          value={filters.status || ''}
          onChange={(e) => handleChange('status', (e.target.value || undefined) as SearchFilters['status'])}
          disabled={loading}
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="">Any</option>
          <option value="listed">Listed</option>
          <option value="auction">Auction</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      {/* Network */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Network
        </label>
        <select
          value={filters.network || ''}
          onChange={(e) => handleChange('network', (e.target.value || undefined) as SearchFilters['network'])}
          disabled={loading}
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="">All Networks</option>
          <option value="base-testnet">Base Sepolia</option>
          <option value="base-mainnet">Base Mainnet</option>
        </select>
      </div>

      {/* Verified Creator */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.verified || false}
          onChange={(e) => handleChange('verified', e.target.checked ? true : undefined)}
          disabled={loading}
          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">Verified Creator Only</span>
      </label>

      {/* Has Royalties */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.hasRoyalties || false}
          onChange={(e) => handleChange('hasRoyalties', e.target.checked ? true : undefined)}
          disabled={loading}
          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">With Royalties</span>
      </label>

      {/* Listed Only */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.onlyListed || false}
          onChange={(e) => handleChange('onlyListed', e.target.checked ? true : undefined)}
          disabled={loading}
          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">For Sale Only</span>
      </label>

      {/* Rarity */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Rarity
        </label>
        <select
          value={filters.rarity || ''}
          onChange={(e) => handleChange('rarity', e.target.value || undefined)}
          disabled={loading}
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="">All Rarities</option>
          <option value="common">Common</option>
          <option value="uncommon">Uncommon</option>
          <option value="rare">Rare</option>
          <option value="legendary">Legendary</option>
        </select>
      </div>

      {/* Creator Filter */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Creator
        </label>
        <input
          type="text"
          value={filters.creator || ''}
          onChange={(e) => handleChange('creator', e.target.value || undefined)}
          disabled={loading}
          placeholder="Filter by creator..."
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>
    </div>
  );
};

export default AdvancedFilters;
