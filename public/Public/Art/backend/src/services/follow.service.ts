/**
 * Follow Service - Handles all follow relationship operations
 */

import { supabase, supabaseAdmin } from '../config/supabase';
import { Follow } from '../types/database';
import { logger } from '../utils/logger';

export class FollowService {
  /**
   * Create follow relationship
   */
  static async followUser(followerId: string, followingId: string): Promise<Follow | null> {
    try {
      if (followerId === followingId) {
        throw new Error('Cannot follow yourself');
      }

      const { data, error } = await supabaseAdmin
        .from('follows')
        .insert([
          {
            follower_id: followerId,
            following_id: followingId,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      logger.info(`${followerId} followed ${followingId}`);
      return data;
    } catch (error) {
      logger.error('Error following user:', error);
      return null;
    }
  }

  /**
   * Remove follow relationship
   */
  static async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (error) throw error;
      logger.info(`${followerId} unfollowed ${followingId}`);
      return true;
    } catch (error) {
      logger.error('Error unfollowing user:', error);
      return false;
    }
  }

  /**
   * Get user's followers
   */
  static async getFollowers(userId: string, limit = 50, offset = 0): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('follower:follower_id(*)')
        .eq('following_id', userId)
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return (data || []).map((f) => f.follower).filter(Boolean);
    } catch (error) {
      logger.error('Error fetching followers:', error);
      return [];
    }
  }

  /**
   * Get users that user is following
   */
  static async getFollowing(userId: string, limit = 50, offset = 0): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('following:following_id(*)')
        .eq('follower_id', userId)
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return (data || []).map((f) => f.following).filter(Boolean);
    } catch (error) {
      logger.error('Error fetching following:', error);
      return [];
    }
  }

  /**
   * Check if user follows another user
   */
  static async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      logger.error('Error checking follow status:', error);
      return false;
    }
  }

  /**
   * Get follower count
   */
  static async getFollowerCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      logger.error('Error getting follower count:', error);
      return 0;
    }
  }

  /**
   * Get following count
   */
  static async getFollowingCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      logger.error('Error getting following count:', error);
      return 0;
    }
  }

  /**
   * Get mutual followers
   */
  static async getMutualFollowers(userId: string, otherUserId: string): Promise<any[]> {
    try {
      // Get users that both follow
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

      if (error) throw error;

      const userFollowing = (data || []).map((f) => f.following_id);

      // Get users that other user follows
      const { data: otherData, error: otherError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', otherUserId);

      if (otherError) throw otherError;

      const otherFollowing = (otherData || []).map((f) => f.following_id);

      // Find intersection
      const mutual = userFollowing.filter((id) => otherFollowing.includes(id));

      // Get user details for mutual followers
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .in('id', mutual);

      return users || [];
    } catch (error) {
      logger.error('Error getting mutual followers:', error);
      return [];
    }
  }
}
