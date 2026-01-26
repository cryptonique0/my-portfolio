/**
 * RecentlyAdded Page
 * Display recently added NFTs to the marketplace
 */

import React, { useState } from 'react';
import { useRecentlyAdded } from '../hooks/useAdvancedSearch';

export const RecentlyAdded: React.FC = () => {
  const { nfts, loading, error } = useRecentlyAdded();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.ceil(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatPrice = (price: string | number | undefined) => {
    if (!price) return 'Not for sale';
    return `${price} ETH`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-12 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">🆕 Recently Added NFTs</h1>
          <p className="text-lg text-emerald-100">
            Fresh and newest NFTs just added to the marketplace
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                {loading ? '...' : `${nfts.length} NFTs`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">View:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : nfts.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              // Grid View
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {nfts.map((nft) => (
                  <div
                    key={nft.id}
                    className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer group"
                  >
                    {/* Image Container */}
                    <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-700 h-48">
                      <img
                        src={nft.imageUrl}
                        alt={nft.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {/* New Badge */}
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        NEW
                      </div>
                      {/* Added Date Badge */}
                      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        {formatDate(nft.createdAt || new Date().toISOString())}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate mb-1">
                        {nft.name}
                      </h3>

                      {/* Creator */}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate">
                        by {nft.creator.slice(0, 10)}...
                      </p>

                      {/* Price */}
                      <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Price</p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {formatPrice(nft.price)}
                        </p>
                      </div>

                      {/* Rarity */}
                      {nft.rarity && (
                        <div className="mb-3">
                          <span className="inline-block text-xs font-semibold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                            {nft.rarity}
                          </span>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span>👁️ {nft.views || 0}</span>
                        <span>❤️ {nft.favorites || 0}</span>
                      </div>

                      {/* Action Button */}
                      <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors">
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-3">
                {nfts.map((nft) => (
                  <div
                    key={nft.id}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow p-4 flex gap-4 items-center cursor-pointer group"
                  >
                    {/* Image */}
                    <img
                      src={nft.imageUrl}
                      alt={nft.name}
                      className="w-24 h-24 object-cover rounded group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                          {nft.name}
                        </h3>
                        <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 px-2 py-1 rounded-full font-semibold">
                          {formatDate(nft.createdAt || new Date().toISOString())}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        by {nft.creator}
                      </p>

                      {nft.rarity && (
                        <span className="inline-block text-xs font-semibold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded mr-2 mb-2">
                          {nft.rarity}
                        </span>
                      )}

                      {/* Stats */}
                      <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>👁️ {nft.views || 0} views</span>
                        <span>❤️ {nft.favorites || 0} favorites</span>
                      </div>
                    </div>

                    {/* Price and Action */}
                    <div className="flex flex-col items-end gap-2">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Price</p>
                        <p className="font-bold text-lg text-gray-900 dark:text-white">
                          {formatPrice(nft.price)}
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors whitespace-nowrap">
                        View →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No recently added NFTs available at the moment
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Check back soon for new listings!
            </p>
          </div>
        )}
      </div>

      {/* Info Box */}
      {nfts.length > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-200 dark:border-emerald-800">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-1">
                  Get in Early
                </h3>
                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                  Recently added NFTs often represent early opportunities to collect unique pieces
                  before they become popular. Keep an eye on new listings to find hidden gems!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
