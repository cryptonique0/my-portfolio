/**
 * FilterPanel Component
 * Sidebar filter interface for advanced search
 */

import React, { useState } from 'react';
import { SearchFilters } from '../hooks/useAdvancedSearch';

interface FilterPanelProps {
  filters: SearchFilters;
  rarities: string[];
  categories: string[];
  onRarityChange: (rarity: string) => void;
  onCategoryChange: (category: string) => void;
  onPriceChange: (min?: number, max?: number) => void;
  onSortChange: (sort: string) => void;
  onReset: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  rarities,
  categories,
  onRarityChange,
  onCategoryChange,
  onPriceChange,
  onSortChange,
  onReset,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['price', 'rarity', 'category', 'sort'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="w-full lg:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
        <button
          onClick={onReset}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          Reset All
        </button>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex justify-between items-center w-full mb-3 text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
        >
          <span className="flex items-center gap-2">
            💰 Price Range
          </span>
          <span>{expandedSections.has('price') ? '−' : '+'}</span>
        </button>
        {expandedSections.has('price') && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                Min Price (ETH)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                defaultValue={filters.minPrice || ''}
                onChange={(e) =>
                  onPriceChange(
                    e.target.value ? parseFloat(e.target.value) : undefined,
                    filters.maxPrice
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                Max Price (ETH)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="∞"
                defaultValue={filters.maxPrice || ''}
                onChange={(e) =>
                  onPriceChange(
                    filters.minPrice,
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Rarity */}
      {rarities.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection('rarity')}
            className="flex justify-between items-center w-full mb-3 text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
          >
            <span className="flex items-center gap-2">
              🏷️ Rarity
            </span>
            <span>{expandedSections.has('rarity') ? '−' : '+'}</span>
          </button>
          {expandedSections.has('rarity') && (
            <div className="space-y-2">
              {rarities.map((rarity) => (
                <label key={rarity} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.rarity?.includes(rarity) || false}
                    onChange={() => onRarityChange(rarity)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {rarity}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category */}
      {categories.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection('category')}
            className="flex justify-between items-center w-full mb-3 text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
          >
            <span className="flex items-center gap-2">
              📂 Category
            </span>
            <span>{expandedSections.has('category') ? '−' : '+'}</span>
          </button>
          {expandedSections.has('category') && (
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.category?.includes(category) || false}
                    onChange={() => onCategoryChange(category)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {category}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sort */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('sort')}
          className="flex justify-between items-center w-full mb-3 text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
        >
          <span className="flex items-center gap-2">
            📊 Sort By
          </span>
          <span>{expandedSections.has('sort') ? '−' : '+'}</span>
        </button>
        {expandedSections.has('sort') && (
          <select
            value={filters.sortBy || 'recent'}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Recently Added</option>
            <option value="trending">Trending</option>
            <option value="views">Most Viewed</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        )}
      </div>

      {/* Active Filters Summary */}
      {(filters.query ||
        filters.minPrice ||
        filters.maxPrice ||
        (filters.rarity && filters.rarity.length > 0) ||
        (filters.category && filters.category.length > 0)) && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase">
            Active Filters
          </p>
          <div className="space-y-1 text-xs">
            {filters.query && (
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Search:</span> {filters.query}
              </p>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Price:</span> {filters.minPrice || '0'} -{' '}
                {filters.maxPrice || '∞'} ETH
              </p>
            )}
            {filters.rarity && filters.rarity.length > 0 && (
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Rarity:</span> {filters.rarity.join(', ')}
              </p>
            )}
            {filters.category && filters.category.length > 0 && (
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Category:</span> {filters.category.join(', ')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
