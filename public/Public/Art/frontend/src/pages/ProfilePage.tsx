import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { userService } from '../services/api';
import { UserProfile, NFT } from '../types';
import { useWallet } from '../hooks/useWallet';
import { VerificationBadge } from '../components/VerificationBadge';
import { FollowButton } from '../components/FollowButton';
import { FollowerStats } from '../components/FollowerStats';
import { ActivityFeed } from '../components/ActivityFeed';
import { ProfileSkeleton } from '../components/SkeletonLoader';
import { NoNFTsFound } from '../components/EmptyState';

// New Profile Enhancement Components
import {
  ProfileEditor,
  PortfolioDashboard,
  TradingStatistics,
  AchievementsBadges,
  VerificationRequestForm,
} from '../components/profile';

export const ProfilePage: React.FC = () => {
  const { address } = useParams();
  const { user } = useWallet();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('owned');

  useEffect(() => {
    const fetchData = async () => {
      if (!address) return;

      try {
        setLoading(true);
        const profileData = await userService.getProfile(address);
        setProfile(profileData);

        const nftsData = await userService.getNFTs(address);
        setNfts(nftsData.nfts);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Banner */}
      <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-500" />

      {/* Profile */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8 -mt-24 mb-12">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white dark:border-gray-900">
              {address?.substring(0, 2).toUpperCase()}
            </div>
          </div>

          {/* Info */}
          <div className="pt-8 flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {profile.address}
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

            {profile.bio && (
              <p className="text-gray-600 dark:text-gray-400">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-8">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.stats.nftsOwned}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">NFTs Owned</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.stats.nftsCreated}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.stats.totalSales}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sales</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.stats.followers}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Followers</p>
              </div>
            </div>

            <div className="mt-6">
              <FollowerStats address={address || ''} showFollowing showRecent />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex gap-8">
            {user.address === address && (
              <button
                onClick={() => setActiveTab('editor')}
                className={`py-4 font-semibold border-b-2 transition-colors ${
                  activeTab === 'editor'
                    ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Edit Profile
              </button>
            )}
            <button
              onClick={() => setActiveTab('owned')}
              className={`py-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'owned'
                  ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Owned NFTs
            </button>
            <button
              onClick={() => setActiveTab('created')}
              className={`py-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'created'
                  ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Created
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`py-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'portfolio'
                  ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Portfolio
            </button>
            <button
              onClick={() => setActiveTab('trading')}
              className={`py-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'trading'
                  ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Trading Stats
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`py-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'achievements'
                  ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Achievements
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'activity'
                  ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Activity
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="pb-12">
          {activeTab === 'editor' && user.address === address && (
            <div className="max-w-4xl mx-auto">
              <ProfileEditor userId={address || ''} />
              
              {/* Verification Request Section */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Request Verification
                </h2>
                <VerificationRequestForm />
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="max-w-6xl mx-auto">
              <PortfolioDashboard userId={address || ''} />
            </div>
          )}

          {activeTab === 'trading' && (
            <div className="max-w-6xl mx-auto">
              <TradingStatistics userId={address || ''} />
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="max-w-6xl mx-auto">
              <AchievementsBadges userId={address || ''} />
            </div>
          )}

          {activeTab === 'owned' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {nfts.length === 0 ? (
                <div className="col-span-full">
                  <NoNFTsFound />
                </div>
              ) : (
                nfts.map((nft) => (
                  <div
                    key={nft.id}
                    className="rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow hover:shadow-lg transition-shadow"
                  >
                    <div className="h-40 bg-gray-200 dark:bg-gray-700">
                      <img
                        src={nft.image}
                        alt={nft.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {nft.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {nft.category}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'created' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {nfts.filter((nft) => nft.creator === address).length === 0 ? (
                <div className="col-span-full">
                  <NoNFTsFound />
                </div>
              ) : (
                nfts
                  .filter((nft) => nft.creator === address)
                  .map((nft) => (
                    <div
                      key={nft.id}
                      className="rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow"
                    >
                      <div className="h-40 bg-gray-200 dark:bg-gray-700">
                        <img
                          src={nft.image}
                          alt={nft.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {nft.name}
                        </h3>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <ActivityFeed
                filters={{ creatorAddress: address || '' }}
                limit={15}
                showFilters
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
