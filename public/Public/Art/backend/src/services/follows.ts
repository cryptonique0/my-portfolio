/**
 * Social & Follows Service
 * Manages creator follows, followers, and social connections
 */

export interface Follow {
  follower: string;
  following: string;
  followDate: Date;
  notificationsEnabled: boolean;
}

export interface CreatorStats {
  address: string;
  followerCount: number;
  followingCount: number;
  followers: string[];
  following: string[];
  recentFollowers: Follow[];
}

export interface FollowNotification {
  id: string;
  type: 'new_follower' | 'unfollowed';
  fromCreator: string;
  toCreator: string;
  timestamp: Date;
  read: boolean;
}

/**
 * Follow a creator
 */
export async function followCreator(
  followerAddress: string,
  creatorAddress: string
): Promise<{ success: boolean; txHash: string }> {
  if (!followerAddress || !creatorAddress) {
    throw new Error('Follower and creator addresses are required');
  }

  if (followerAddress === creatorAddress) {
    throw new Error('Cannot follow yourself');
  }

  return {
    success: true,
    txHash: `0x${Math.random().toString(16).slice(2)}`
  };
}

/**
 * Unfollow a creator
 */
export async function unfollowCreator(
  followerAddress: string,
  creatorAddress: string
): Promise<{ success: boolean; txHash: string }> {
  if (!followerAddress || !creatorAddress) {
    throw new Error('Follower and creator addresses are required');
  }

  return {
    success: true,
    txHash: `0x${Math.random().toString(16).slice(2)}`
  };
}

/**
 * Check if user follows creator
 */
export async function isFollowing(
  followerAddress: string,
  creatorAddress: string
): Promise<boolean> {
  if (!followerAddress || !creatorAddress) {
    return false;
  }

  // Mock implementation
  return Math.random() > 0.5;
}

/**
 * Get creator follower count
 */
export async function getFollowerCount(creatorAddress: string): Promise<number> {
  if (!creatorAddress) {
    throw new Error('Creator address is required');
  }

  // Mock implementation
  return Math.floor(Math.random() * 10000);
}

/**
 * Get creator stats (followers, following)
 */
export async function getCreatorStats(creatorAddress: string): Promise<CreatorStats> {
  if (!creatorAddress) {
    throw new Error('Creator address is required');
  }

  const followerCount = Math.floor(Math.random() * 5000);
  const followingCount = Math.floor(Math.random() * 500);

  return {
    address: creatorAddress,
    followerCount,
    followingCount,
    followers: Array(Math.min(followerCount, 100))
      .fill(0)
      .map(() => `0x${Math.random().toString(16).slice(2)}`),
    following: Array(Math.min(followingCount, 50))
      .fill(0)
      .map(() => `0x${Math.random().toString(16).slice(2)}`),
    recentFollowers: Array(Math.min(followerCount, 10))
      .fill(0)
      .map((_, i) => ({
        follower: `0x${Math.random().toString(16).slice(2)}`,
        following: creatorAddress,
        followDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        notificationsEnabled: Math.random() > 0.3
      }))
  };
}

/**
 * Get creator followers
 */
export async function getFollowers(
  creatorAddress: string,
  limit: number = 50,
  page: number = 1
): Promise<{ followers: string[]; total: number }> {
  if (!creatorAddress) {
    throw new Error('Creator address is required');
  }

  return {
    followers: Array(Math.min(limit, 20))
      .fill(0)
      .map(() => `0x${Math.random().toString(16).slice(2)}`),
    total: Math.floor(Math.random() * 5000)
  };
}

/**
 * Get creator following
 */
export async function getFollowing(
  creatorAddress: string,
  limit: number = 50,
  page: number = 1
): Promise<{ following: string[]; total: number }> {
  if (!creatorAddress) {
    throw new Error('Creator address is required');
  }

  return {
    following: Array(Math.min(limit, 20))
      .fill(0)
      .map(() => `0x${Math.random().toString(16).slice(2)}`),
    total: Math.floor(Math.random() * 500)
  };
}

/**
 * Get follow notifications
 */
export async function getFollowNotifications(
  creatorAddress: string,
  limit: number = 20
): Promise<FollowNotification[]> {
  if (!creatorAddress) {
    throw new Error('Creator address is required');
  }

  return Array(Math.min(limit, 10))
    .fill(0)
    .map((_, i) => ({
      id: `notif_${i}`,
      type: Math.random() > 0.5 ? 'new_follower' : 'unfollowed',
      fromCreator: `0x${Math.random().toString(16).slice(2)}`,
      toCreator: creatorAddress,
      timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
      read: i > 5
    }));
}

/**
 * Get top creators by follower count
 */
export async function getTopCreators(limit: number = 20): Promise<CreatorStats[]> {
  return Promise.all(
    Array(Math.min(limit, 20))
      .fill(0)
      .map((_, i) =>
        getCreatorStats(`0x${Math.random().toString(16).slice(2)}`).then(stats => ({
          ...stats,
          followerCount: Math.floor(Math.random() * 10000) + (20 - i) * 500
        }))
      )
  );
}

/**
 * Get mutual followers (creators that both follow each other)
 */
export async function getMutualFollows(
  address1: string,
  address2: string
): Promise<string[]> {
  if (!address1 || !address2) {
    throw new Error('Two creator addresses are required');
  }

  return Array(Math.floor(Math.random() * 100))
    .fill(0)
    .map(() => `0x${Math.random().toString(16).slice(2)}`);
}
