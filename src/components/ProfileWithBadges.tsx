import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useBadges } from '@/hooks/useBadges';
import { BadgeShowcase, BadgeGrid } from '@/components/BadgeDisplay';

/**
 * Profile with Badge Integration Example
 * 
 * This component demonstrates how to integrate the badge system
 * with user profiles throughout the application
 */

interface ProfileWithBadgesProps {
  userAddress: string;
  showBadgeGrid?: boolean;
}

export function ProfileWithBadges({
  userAddress,
  showBadgeGrid = false,
}: ProfileWithBadgesProps) {
  const { address: currentUserAddress } = useAccount();
  const { userBadges, fetchUserBadges, getBadgeCount } = useBadges();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBadges = async () => {
      setIsLoading(true);
      await fetchUserBadges(userAddress);
      setIsLoading(false);
    };

    loadBadges();
  }, [userAddress, fetchUserBadges]);

  if (isLoading) {
    return <div className="animate-pulse">Loading badges...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Profile Header with Badge Count */}
      <div className="profile-header border-b border-gray-200 dark:border-gray-800 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">User Profile</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-600">
              {getBadgeCount()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Badges Earned
            </div>
          </div>
        </div>
      </div>

      {/* Badge Showcase (Compact) */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Achievements</h2>
        <BadgeShowcase
          badges={userBadges}
          maxDisplay={6}
          size="medium"
        />
        {userBadges.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No badges earned yet. Complete profile sections and verify credentials to earn badges!
          </div>
        )}
      </div>

      {/* Full Badge Grid (Optional) */}
      {showBadgeGrid && userBadges.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Badge Collection</h2>
          <BadgeGrid
            badges={userBadges}
            size="large"
            showLocked={true}
          />
        </div>
      )}

      {/* Badge Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BadgeStatCard
          label="Total Badges"
          value={getBadgeCount()}
          icon="🏆"
        />
        <BadgeStatCard
          label="Most Recent"
          value={
            userBadges.length > 0
              ? userBadges[0].name
              : 'None'
          }
          icon="⭐"
        />
        <BadgeStatCard
          label="Rarest Badge"
          value={
            userBadges.length > 0
              ? userBadges.reduce((prev, current) =>
                  (prev.currentSupply || 0) < (current.currentSupply || 0)
                    ? prev
                    : current
                ).name
              : 'None'
          }
          icon="💎"
        />
      </div>

      {/* Is Own Profile */}
      {currentUserAddress === userAddress && (
        <BadgeManagementPanel />
      )}
    </div>
  );
}

/**
 * Badge Stat Card Component
 */
function BadgeStatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <div className="text-3xl">{icon}</div>
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {label}
          </div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Badge Management Panel (for own profile)
 * Shows badge progress and unlocking information
 */
function BadgeManagementPanel() {
  const { address } = useAccount();
  const { badges, userBadges } = useBadges();
  const [reputationScore] = useState(0); // TODO: Fetch from OnChainResume contract

  const lockedBadges = badges.filter(
    (b) => !userBadges.some((ub) => ub.id === b.id)
  );

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
      <h3 className="text-lg font-semibold mb-4">Your Badge Progress</h3>

      {/* Reputation Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Reputation Progress</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {reputationScore} / 10,000
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${Math.min((reputationScore / 10000) * 100, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Upcoming Badges */}
      {lockedBadges.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">
            Next Badges to Unlock ({lockedBadges.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {lockedBadges
              .sort((a, b) => a.requiredReputation - b.requiredReputation)
              .slice(0, 3)
              .map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex-1">
                    <div className="font-medium">{badge.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Requires {badge.requiredReputation.toLocaleString()} reputation
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl">
                      {reputationScore >= badge.requiredReputation ? '✓' : '🔒'}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {lockedBadges.length === 0 && (
        <div className="text-center text-green-600 font-medium">
          ✨ You've unlocked all available badges!
        </div>
      )}
    </div>
  );
}

/**
 * Leaderboard Integration with Badges
 */
export function LeaderboardWithBadges() {
  const [topProfiles, setTopProfiles] = useState<any[]>([]);
  const { badges } = useBadges();

  useEffect(() => {
    // TODO: Fetch top profiles from contract
    // setTopProfiles(...)
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Top Profiles</h2>
      <div className="space-y-3">
        {topProfiles.map((profile, index) => (
          <div
            key={profile.address}
            className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-lg transition"
          >
            {/* Rank */}
            <div className="text-2xl font-bold w-12 text-center">
              {index === 0 && '🥇'}
              {index === 1 && '🥈'}
              {index === 2 && '🥉'}
              {index > 2 && `#${index + 1}`}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="font-medium">{profile.handle}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {profile.reputation.toLocaleString()} reputation
              </div>
            </div>

            {/* Badges */}
            <div className="flex gap-2">
              {badges
                .filter((b) => profile.reputation >= b.requiredReputation)
                .slice(0, 3)
                .map((badge) => (
                  <div
                    key={badge.id}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-lg shadow-md"
                    title={badge.name}
                  >
                    {badge.id === 3 && '👑'}
                    {badge.id === 2 && '⭐'}
                    {badge.id === 1 && '🌟'}
                    {badge.id === 0 && '✓'}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Badge Unlock Notification Component
 * Shows when user earns a new badge
 */
export function BadgeUnlockNotification({
  badge,
  onClose,
}: {
  badge: any;
  onClose: () => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-6 max-w-sm border-2 border-purple-400 dark:border-purple-600 animate-bounce">
      <div className="text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-lg font-bold mb-2">Badge Unlocked!</h3>
        <div className="mb-4">
          <div className="text-3xl mb-2">🏅</div>
          <p className="font-semibold">{badge.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {badge.description}
          </p>
        </div>
        <button
          onClick={onClose}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg transition"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}

export default ProfileWithBadges;
