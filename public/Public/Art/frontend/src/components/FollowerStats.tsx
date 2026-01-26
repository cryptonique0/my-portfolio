import { FC } from 'react';
import { getCreatorStats, getFollowerCount } from '../services/follows';
import { useQuery } from '@tanstack/react-query';

interface FollowerStatsProps {
  address: string;
  showFollowing?: boolean;
  showRecent?: boolean;
  className?: string;
}

export const FollowerStats: FC<FollowerStatsProps> = ({
  address,
  showFollowing = true,
  showRecent = false,
  className = ''
}) => {
  // Get follower count
  const { data: followerCount = 0, isLoading: countLoading } = useQuery({
    queryKey: ['followerCount', address],
    queryFn: () => getFollowerCount(address),
    enabled: !!address,
    staleTime: 60000 // 1 minute
  });

  // Get full stats if needed
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['creatorStats', address],
    queryFn: () => getCreatorStats(address),
    enabled: !!address && (showFollowing || showRecent),
    staleTime: 60000 // 1 minute
  });

  const isLoading = countLoading || statsLoading;

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 rounded w-24" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Followers */}
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-gray-900">{followerCount.toLocaleString()}</span>
        <span className="text-xs text-gray-500">Followers</span>
      </div>

      {/* Following */}
      {showFollowing && stats && (
        <div className="flex flex-col border-l border-gray-200 pl-4">
          <span className="text-sm font-semibold text-gray-900">{stats.followingCount.toLocaleString()}</span>
          <span className="text-xs text-gray-500">Following</span>
        </div>
      )}

      {/* Recent followers */}
      {showRecent && stats && stats.recentFollowers.length > 0 && (
        <div className="flex flex-col border-l border-gray-200 pl-4">
          <div className="flex -space-x-2">
            {stats.recentFollowers.slice(0, 3).map((follower: { address: string; name?: string }) => (
              <div
                key={follower.address}
                className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full border-2 border-white"
                title={follower.name || follower.address.slice(0, 6)}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 mt-1">
            {stats.recentFollowers.length} new followers
          </span>
        </div>
      )}
    </div>
  );
};

export default FollowerStats;
