import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { fetchCreatorStats, CreatorStats, formatEarnings, getDaysSinceJoin } from '../services/creators';
import { BaseScanLink } from '../components/BaseScanLink';
import CreatorRevenueChart from '../components/CreatorRevenueChart';
import RoyaltyHistory from '../components/RoyaltyHistory';
import { VerificationBadge } from '../components/VerificationBadge';
import { FollowButton } from '../components/FollowButton';
import { FollowerStats } from '../components/FollowerStats';
import { ActivityFeed } from '../components/ActivityFeed';

/**
 * Creator Profile Page
 */
export const CreatorProfilePage: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const { user } = useWallet();
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setError('No creator address provided');
      setLoading(false);
      return;
    }

    const loadCreatorStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCreatorStats(address);
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load creator profile');
      } finally {
        setLoading(false);
      }
    };

    loadCreatorStats();
  }, [address]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin">
          <svg className="w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200">{error || 'Failed to load creator profile'}</p>
        </div>
      </div>
    );
  }

  const { profile, earnings, recentSales, mostSoldNFT } = stats;
  const daysSinceJoin = getDaysSinceJoin(profile.joinedDate);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
        {/* Background */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

        {/* Profile Info */}
        <div className="px-6 py-6 -mt-16 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            {/* Avatar */}
            <img
              src={profile.avatar}
              alt={profile.username}
              className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-700 flex-shrink-0"
            />

            {/* Profile Details */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {profile.username}
                </h1>
                <VerificationBadge address={address || ''} size="sm" />
                {user.address && user.address !== address && (
                  <FollowButton
                    followerAddress={user.address}
                    creatorAddress={address || ''}
                    variant="secondary"
                  />
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
                {profile.bio}
              </p>

              {/* Address */}
              <div className="mt-3 flex items-center gap-2">
                <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </code>
                <BaseScanLink type="address" hash={address || ''} label="View on BaseScan" />
              </div>

              {/* Social Links */}
              {(profile.website || profile.twitter || profile.instagram) && (
                <div className="flex gap-3 mt-3">
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      title="Website"
                    >
                      🌐
                    </a>
                  )}
                  {profile.twitter && (
                    <a
                      href={`https://twitter.com/${profile.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-500"
                      title="Twitter"
                    >
                      𝕏
                    </a>
                  )}
                  {profile.instagram && (
                    <a
                      href={`https://instagram.com/${profile.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-700 dark:text-pink-400"
                      title="Instagram"
                    >
                      📷
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Member Since */}
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {daysSinceJoin}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Days Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Earnings</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {formatEarnings(earnings.totalEarnings)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {earnings.totalSales} sales
          </div>
        </div>

        {/* Volume */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Volume</div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            Ξ {parseFloat(earnings.totalVolume).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {earnings.nftsSold} NFTs sold
          </div>
        </div>

        {/* Average Price */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Average Price</div>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
            Ξ {earnings.averagePrice}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            per sale
          </div>
        </div>

        {/* Followers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Followers</div>
          <div className="text-3xl font-bold text-pink-600 dark:text-pink-400 mt-2">
            {(earnings.followers / 1000).toFixed(1)}K
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            supporters
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <FollowerStats address={address || ''} showFollowing showRecent />
      </div>

      {/* Creator Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* NFTs Created */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {earnings.nftsCreated}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">NFTs Created</div>
        </div>

        {/* Top Sale */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            Ξ {earnings.topSale}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Highest Sale</div>
        </div>

        {/* Last Earning */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Math.floor((Date.now() - earnings.lastEarning) / (60 * 60 * 1000))}h
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Since Last Sale</div>
        </div>
      </div>

      {/* Most Sold NFT */}
      {mostSoldNFT && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Most Sold NFT</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-gray-900 dark:text-white">{mostSoldNFT.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {mostSoldNFT.sales} sales • Ξ {mostSoldNFT.totalVolume} volume
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                #{mostSoldNFT.tokenId}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <CreatorRevenueChart creatorAddress={address || ''} days={30} title="30-Day Revenue Trend" />
        </div>

        {/* Royalty History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white">Royalty History</h2>
            {address && (
              <button
                onClick={() => navigate(`/royalties/${address}`)}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
              >
                View All →
              </button>
            )}
          </div>
          <RoyaltyHistory creatorAddress={address || ''} limit={5} />
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Recent Sales</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-400 font-medium">NFT</th>
                <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-400 font-medium">Price</th>
                <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-400 font-medium">Buyer</th>
                <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-400 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale) => (
                <tr key={sale.txHash} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3 px-2">
                    <a href={`/nft/${sale.tokenId}`} className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                      {sale.nftName}
                    </a>
                  </td>
                  <td className="py-3 px-2 font-bold text-gray-900 dark:text-white">
                    Ξ {sale.price}
                  </td>
                  <td className="py-3 px-2">
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {sale.buyer.slice(0, 6)}...{sale.buyer.slice(-4)}
                    </code>
                  </td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400 text-xs">
                    {new Date(sale.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Creator Activity</h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">Live events</span>
        </div>
        <ActivityFeed filters={{ creatorAddress: address || '' }} limit={15} showFilters />
      </div>
    </div>
  );
};

export default CreatorProfilePage;
