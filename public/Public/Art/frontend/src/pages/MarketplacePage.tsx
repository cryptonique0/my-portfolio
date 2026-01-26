import React, { useState, useEffect } from 'react';
import { Button, Card, Input } from '../components/UI';
import { ActivityFeed } from '../components/ActivityFeed';
import { marketplaceService } from '../services/api';
import { getTrendingByActivity } from '../services/activity';
import { useQuery } from '@tanstack/react-query';
import { ListingGridSkeleton } from '../components/SkeletonLoader';
import { NoListingsFound } from '../components/EmptyState';

export const MarketplacePage: React.FC = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    sortBy: 'price'
  });

  const { data: trendingByActivity } = useQuery({
    queryKey: ['trendingByActivity', 12],
    queryFn: () => getTrendingByActivity(12)
  });

  useEffect(() => {
    const loadListings = async () => {
      try {
        const response = await marketplaceService.getListings(1, 20, filters);
        setListings(response.listings);
      } catch (error) {
        console.error('Failed to load listings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadListings();
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Marketplace</h1>

        {/* Filters */}
        <Card className="mb-8">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Min Price</label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Price</label>
              <Input
                type="number"
                placeholder="1000"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="price">Price</option>
                <option value="date">Date Listed</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Listings */}
        {isLoading ? (
          <ListingGridSkeleton count={8} />
        ) : listings.length === 0 ? (
          <NoListingsFound />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <div className="mb-4 bg-gray-200 dark:bg-gray-700 h-48 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">NFT #{listing.nftId}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">NFT #{listing.nftId}</h3>
                <div className="mb-4">
                  <p className="text-2xl font-bold text-blue-600">{listing.price} ETH</p>
                  <p className="text-sm text-gray-500">Quantity: {listing.quantity}</p>
                </div>
                <Button variant="primary" className="w-full">Buy Now</Button>
              </Card>
            ))}
          </div>
        )}

        {/* Trending by Activity */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Trending by Activity</h2>
            <span className="text-sm text-gray-500">Driven by mints, bids, and sales</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(trendingByActivity || []).map((nft: {
              contractAddress: string;
              nftId: string;
              activityCount: number;
              recentPrice?: number;
              floorPrice?: number;
            }) => (
              <Card key={`${nft.contractAddress}-${nft.nftId}`} className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  #{nft.nftId}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">NFT #{nft.nftId}</p>
                  <p className="text-sm text-gray-500">Contract: {nft.contractAddress.slice(0, 6)}...{nft.contractAddress.slice(-4)}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-semibold text-purple-600 dark:text-purple-400">{nft.activityCount} events</span>
                    {nft.recentPrice && <span>Last: {nft.recentPrice} ETH</span>}
                    {nft.floorPrice && <span>Floor: {nft.floorPrice} ETH</span>}
                  </div>
                </div>
              </Card>
            ))}
            {(!trendingByActivity || trendingByActivity.length === 0) && (
              <div className="col-span-full text-gray-600 dark:text-gray-400">No trending data yet.</div>
            )}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Marketplace Activity</h2>
            <span className="text-sm text-gray-500">Filter by event type</span>
          </div>
          <ActivityFeed limit={20} showFilters className="mt-4" />
        </div>
      </div>
    </div>
  );
};
