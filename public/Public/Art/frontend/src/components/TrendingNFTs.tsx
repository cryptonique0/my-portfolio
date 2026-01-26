/**
 * TrendingNFTs Page
 * Display trending NFTs and hot collections
 */

import React from 'react';
import { useTrendingNFTs, useHotCollections } from '../hooks/useAdvancedSearch';

export const TrendingNFTs: React.FC = () => {
  const { nfts, loading: nftsLoading, error: nftsError } = useTrendingNFTs();
  const { collections, loading: collectionsLoading, error: collectionsError } = useHotCollections();

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600 dark:text-green-400';
    if (trend < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getTrendBgColor = (trend: number) => {
    if (trend > 0) return 'bg-green-50 dark:bg-green-900/20';
    if (trend < 0) return 'bg-red-50 dark:bg-red-900/20';
    return 'bg-gray-50 dark:bg-gray-800/50';
  };

  const formatTrendPercent = (trend: number) => {
    const sign = trend > 0 ? '↑ ' : trend < 0 ? '↓ ' : '';
    return `${sign}${Math.abs(trend).toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">🔥 Trending NFTs</h1>
          <p className="text-lg text-blue-100">
            Discover the hottest NFTs and collections right now
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Trending NFTs Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                ⭐ Top Trending NFTs
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                NFTs with the highest growth in the last 24 hours
              </p>
            </div>
          </div>

          {nftsError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400 mb-6">
              {nftsError}
            </div>
          )}

          {nftsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : nfts.length > 0 ? (
            <div className="space-y-4">
              {nfts.slice(0, 10).map((nft, index) => (
                <div
                  key={nft.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  <div className="flex gap-6 p-6">
                    {/* Rank and Image */}
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white font-bold text-2xl">
                        #{index + 1}
                      </div>
                      <img
                        src={nft.imageUrl}
                        alt={nft.name}
                        className="w-32 h-32 object-cover rounded-lg mt-3"
                      />
                    </div>

                    {/* NFT Info */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {nft.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        by {nft.creator.slice(0, 10)}...
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">
                            Current Price
                          </p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {nft.price} ETH
                          </p>
                        </div>

                        <div className={getTrendBgColor(nft.trend) + ' rounded px-3 py-2'}>
                          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">
                            24h Change
                          </p>
                          <p className={`text-lg font-bold ${getTrendColor(nft.trend)}`}>
                            {formatTrendPercent(nft.trend)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">
                            Views
                          </p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {(nft.views / 1000).toFixed(1)}K
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">
                            Favorites
                          </p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {nft.favorites}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0 flex items-center">
                      <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors">
                        View →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              <p className="text-lg">No trending NFTs available at the moment</p>
            </div>
          )}
        </section>

        {/* Hot Collections Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🏆 Hot Collections
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Collections with the highest trading volume and engagement
            </p>
          </div>

          {collectionsError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400 mb-6">
              {collectionsError}
            </div>
          )}

          {collectionsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : collections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection, index) => (
                <div
                  key={collection.id}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  {/* Header with Rank */}
                  <div className="relative">
                    {collection.imageUrl ? (
                      <img
                        src={collection.imageUrl}
                        alt={collection.name}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-br from-blue-500 to-purple-600" />
                    )}
                    <div className="absolute top-3 left-3 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Collection Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {collection.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {collection.items} items
                    </p>

                    {/* Stats Grid */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Floor Price
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {collection.floorPrice} ETH
                        </span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          24h Volume
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {collection.volume24h} ETH
                        </span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          24h Change
                        </span>
                        <span
                          className={`font-bold ${getTrendColor(collection.trend)}`}
                        >
                          {formatTrendPercent(collection.trend)}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                      View Collection →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              <p className="text-lg">No hot collections available at the moment</p>
            </div>
          )}
        </section>

        {/* Info Box */}
        <div className="mt-16 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
            💡 How We Calculate Trending
          </h3>
          <p className="text-blue-800 dark:text-blue-200">
            Trending NFTs and collections are calculated based on 24-hour price changes, trading
            volume, viewer engagement, and community favorites. This helps you discover emerging
            opportunities and hot assets in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};
