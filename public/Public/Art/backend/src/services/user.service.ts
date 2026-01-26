/**
 * User Service - Handles all user-related database operations
 */

import { supabase, supabaseAdmin } from '../config/supabase';
import { User } from '../types/database';
import { logger } from '../utils/logger';

export class UserService {
  /**
   * Create or update user profile
   */
  static async upsertUser(
    walletAddress: string,
    userData: Partial<User>
  ): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .upsert(
          {
            wallet_address: walletAddress,
            ...userData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'wallet_address' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error upserting user:', error);
      return null;
    }
  }

  /**
   * Get user by wallet address
   */
  static async getUserByWallet(walletAddress: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      logger.error('Error fetching user:', error);
      return null;
    }
  }

  /**
   * Get user by username
   */
  static async getUserByUsername(username: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      logger.error('Error fetching user by username:', error);
      return null;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      logger.error('Error fetching user by ID:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating user:', error);
      return null;
    }
  }

  /**
   * Get user profile with stats
   */
  static async getUserProfile(userId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          nfts:nfts(count),
          created_nfts:nfts!creator_id(count),
          followers:follows!following_id(count),
          following:follows!follower_id(count),
          sales:transactions!seller_id(count)
        `)
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      logger.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Search users
   */
  static async searchUsers(query: string, limit = 10): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.ilike.%${query}%,bio.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error searching users:', error);
      return [];
    }
  }

  /**
   * Get trending creators
   */
  static async getTrendingCreators(limit = 10): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'creator')
        .order('follower_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching trending creators:', error);
      return [];
    }
  }

  /**
   * Verify user
   */
  static async verifyUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .update({ verified: true })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error verifying user:', error);
      return false;
    }
  }

  /**
   * Update follower count
   */
  static async updateFollowerCount(userId: string, increment = true): Promise<void> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return;

      const newCount = increment ? user.follower_count + 1 : Math.max(0, user.follower_count - 1);

      await supabaseAdmin
        .from('users')
        .update({ follower_count: newCount })
        .eq('id', userId);
    } catch (error) {
      logger.error('Error updating follower count:', error);
    }
  }
}
