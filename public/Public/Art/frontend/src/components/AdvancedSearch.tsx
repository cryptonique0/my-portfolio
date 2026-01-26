/**
 * AdvancedSearch Component
 * Full-featured search and filtering interface
 */

import React, { useState, useEffect } from 'react';
import { useAdvancedSearch, useTrendingNFTs, useHotCollections, useRecentlyAdded } from '../hooks/useAdvancedSearch';

export const AdvancedSearch: React.FC = () => {
  const {
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
  } = useAdvancedSearch();

  const { nfts: trending } = useTrendingNFTs();
  const { collections: hotCollections } = useHotCollections();
  const { nfts: recentlyAdded } = useRecentlyAdded();

  const [searchInput, setSearchInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<number>();
  const [priceMax, setPriceMax] = useState<number>();
  const [sortBy, setSortBy] = useState<string>('recent');

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    getSuggestions(value);
  };

  // Submit search
  const handleSearch = (term?: string) => {
    const query = term || searchInput;
    setShowSuggestions(false);
    updateFilters({
      query,
      rarity: selectedRarities.length > 0 ? selectedRarities : undefined,
      category: selectedCategories.length > 0 ? selectedCategories : undefined,
      minPrice: priceMin,
      maxPrice: priceMax,
      sortBy: sortBy as any,
    });
  };

  // Toggle rarity filter
  const toggleRarity = (rarity: string) => {
    setSelectedRarities((prev) =>
      prev.includes(rarity)
        ? prev.filter((r) => r !== rarity)
        : [...prev, rarity]
    );
  };

  // Toggle category filter
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Calculate current page
  const currentPage =
    Math.floor((filters.offset || 0) / (filters.limit || 50)) + 1;
  const totalPages = Math.ceil(total / (filters.limit || 50));

  const formatTrendPercent = (trend: number) => {
    const sign = trend > 0 ? '+' : '';
    return `${sign}${trend.toFixed(2)}%`;
  };

  const getTrendColor = (trend: number) => {
    return trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header with Search Bar */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            🔍 Advanced Search
          </h1>

          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search NFTs by name, creator, or attribute..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />

                {/* Search Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          handleSearch(suggestion);
                          setSearchInput(suggestion);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleSearch()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Search
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Rarity Filter */}
            {filterOptions?.rarities && filterOptions.rarities.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🏷️ Rarity
                </label>
                <div className="space-y-2">
                  {filterOptions.rarities.map((rarity) => (
                    <label key={rarity} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedRarities.includes(rarity)}
                        onChange={() => toggleRarity(rarity)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {rarity}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Category Filter */}
            {filterOptions?.categories && filterOptions.categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📂 Category
                </label>
                <div className="space-y-2">
                  {filterOptions.categories.map((category) => (
                    <label key={category} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                💰 Price Range
              </label>
              <div className="space-y-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={priceMin || ''}
                  onChange={(e) => setPriceMin(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={priceMax || ''}
                  onChange={(e) => setPriceMax(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📊 Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  updateFilters({ sortBy: e.target.value as any });
                }}
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="recent">Recently Added</option>
                <option value="trending">Trending</option>
                <option value="views">Most Viewed</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Reset All Filters
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Featured Sections */}
        {!searchInput && (
          <>
            {/* Trending NFTs */}
            {trending.length > 0 && (
              <section className="mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                  🔥 Trending NFTs
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {trending.slice(0, 5).map((nft) => (
                    <div
                      key={nft.id}
                      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
                    >
                      <img
                        src={nft.imageUrl}
                        alt={nft.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {nft.name}
                        </h3>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {nft.price} ETH
                          </span>
                          <span className={`text-sm font-semibold ${getTrendColor(nft.trend)}`}>
                            {formatTrendPercent(nft.trend)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          👁️ {nft.views.toLocaleString()} views
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Hot Collections */}
            {hotCollections.length > 0 && (
              <section className="mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                  🔥 Hot Collections
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {hotCollections.slice(0, 4).map((collection) => (
                    <div
                      key={collection.id}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-lg transition-shadow"
                    >
                      {collection.imageUrl && (
                        <img
                          src={collection.imageUrl}
                          alt={collection.name}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      )}
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {collection.name}
                      </h3>
                      <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p>Floor: {collection.floorPrice} ETH</p>
                        <p>Volume: {collection.volume24h} ETH</p>
                        <p>Items: {collection.items}</p>
                        <p className={`font-semibold ${getTrendColor(collection.trend)}`}>
                          {formatTrendPercent(collection.trend)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Recently Added */}
            {recentlyAdded.length > 0 && (
              <section className="mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                  🆕 Recently Added
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {recentlyAdded.slice(0, 5).map((nft) => (
                    <div
                      key={nft.id}
                      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
                    >
                      <img
                        src={nft.imageUrl}
                        alt={nft.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {nft.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          by {nft.creator.slice(0, 6)}...
                        </p>
                        {nft.price && (
                          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-2">
                            {nft.price} ETH
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Search Results */}
        {searchInput && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Search Results for "{searchInput}"
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {total} items found
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            ) : results.length > 0 ? (
              <>
                {/* Results Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {results.map((nft) => (
                    <div
                      key={nft.id}
                      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <img
                        src={nft.imageUrl}
                        alt={nft.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {nft.name}
                        </h3>
                        {nft.rarity && (
                          <span className="inline-block text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded mt-1">
                            {nft.rarity}
                          </span>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          by {nft.creator.slice(0, 6)}...
                        </p>
                        <div className="flex justify-between items-center mt-3 text-sm">
                          <span>👁️ {nft.views}</span>
                          <span>❤️ {nft.favorites}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white"
                    >
                      ← Previous
                    </button>
                    <span className="text-gray-700 dark:text-gray-300">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                <p className="text-lg">No results found</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Try adjusting your filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
