/**
 * Frontend API Client for Follows Service
 * Handles creator follows, follower tracking, and social features
 */

import { api } from './api';

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
  recentFollowers: Array<{
    address: string;
    name?: string;
    avatar?: string;
    followDate: Date;
  }>;
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
export async function followCreator(follower: string, following: string): Promise<Follow> {
  const response = await api.post('/follows', { follower, following });
  return response.data;
}

/**
 * Unfollow a creator
 */
export async function unfollowCreator(follower: string, following: string): Promise<{ success: boolean }> {
  const response = await api.delete(`/follows/${follower}/${following}`);
  return response.data;
}

/**
 * Check if user is following a creator
 */
export async function isFollowing(follower: string, following: string): Promise<boolean> {
  try {
    const response = await api.get(`/follows/${follower}/${following}`);
    return response.data.isFollowing;
  } catch {
    return false;
  }
}

/**
 * Get follower count for a creator
 */
export async function getFollowerCount(address: string): Promise<number> {
  const response = await api.get(`/follows/${address}/count`);
  return response.data.count;
}

/**
 * Get follower statistics for a creator
 */
export async function getCreatorStats(address: string): Promise<CreatorStats> {
  const response = await api.get(`/follows/${address}/stats`);
  return response.data;
}

/**
 * Get followers of a creator
 */
export async function getFollowers(
  address: string,
  limit: number = 20,
  page: number = 1
): Promise<{
  followers: string[];
  total: number;
  page: number;
}> {
  const response = await api.get(`/follows/${address}/followers`, {
    params: { limit, page }
  });
  return response.data;
}

/**
 * Get creators that a user is following
 */
export async function getFollowing(
  address: string,
  limit: number = 20,
  page: number = 1
): Promise<{
  following: string[];
  total: number;
  page: number;
}> {
  const response = await api.get(`/follows/${address}/following`, {
    params: { limit, page }
  });
  return response.data;
}

/**
 * Get follow notifications for a creator
 */
export async function getFollowNotifications(
  address: string,
  limit: number = 50
): Promise<FollowNotification[]> {
  const response = await api.get(`/follows/${address}/notifications`, {
    params: { limit }
  });
  return response.data;
}

/**
 * Get top creators by follower count
 */
export async function getTopCreators(limit: number = 20): Promise<
  Array<{
    address: string;
    followerCount: number;
    stats: any;
  }>
> {
  const response = await api.get('/follows/top-creators', {
    params: { limit }
  });
  return response.data;
}

/**
 * Get mutual follows between two creators
 */
export async function getMutualFollows(address1: string, address2: string): Promise<{
  mutual: string[];
  count: number;
}> {
  const response = await api.get(`/follows/${address1}/${address2}/mutual`);
  return response.data;
}
