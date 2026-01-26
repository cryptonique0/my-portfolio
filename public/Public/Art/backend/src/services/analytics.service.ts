/**
 * Analytics Service - Handles all analytics tracking and reporting
 */

import { supabase, supabaseAdmin } from '../config/supabase';
import { Analytics } from '../types/database';
import { logger } from '../utils/logger';

export class AnalyticsService {
  /**
   * Track event
   */
  static async trackEvent(
    eventType: string,
    userId?: string | null,
    nftId?: string | null,
    metadata?: Record<string, any>
  ): Promise<Analytics | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('analytics')
        .insert([
          {
            event_type: eventType,
            user_id: userId || null,
            nft_id: nftId || null,
            metadata: metadata || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error tracking event:', error);
      return null;
    }
  }

  /**
   * Get event count
   */
  static async getEventCount(eventType: string, hours = 24): Promise<number> {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      const { count, error } = await supabase
        .from('analytics')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', eventType)
        .gt('created_at', since);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      logger.error('Error getting event count:', error);
      return 0;
    }
  }

  /**
   * Get user activity
   */
  static async getUserActivity(userId: string, limit = 50): Promise<Analytics[]> {
    try {
      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching user activity:', error);
      return [];
    }
  }

  /**
   * Get NFT analytics
   */
  static async getNFTAnalytics(nftId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .eq('nft_id', nftId);

      if (error) throw error;

      const events = data || [];
      const viewCount = events.filter((e) => e.event_type === 'nft_viewed').length;
      const favoriteCount = events.filter((e) => e.event_type === 'nft_favorited').length;
      const shareCount = events.filter((e) => e.event_type === 'nft_shared').length;

      return {
        views: viewCount,
        favorites: favoriteCount,
        shares: shareCount,
        events,
      };
    } catch (error) {
      logger.error('Error fetching NFT analytics:', error);
      return { views: 0, favorites: 0, shares: 0, events: [] };
    }
  }

  /**
   * Get platform statistics
   */
  static async getPlatformStats(): Promise<any> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Total users
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Total NFTs
      const { count: nftCount } = await supabase
        .from('nfts')
        .select('*', { count: 'exact', head: true });

      // Total transactions
      const { count: transactionCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Today's transactions
      const { count: todayTransactionCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('created_at', today.toISOString());

      // Platform volume
      const { data: volumeData } = await supabase
        .from('transactions')
        .select('price')
        .eq('status', 'completed');

      const volume = (volumeData || []).reduce((sum, t) => sum + parseFloat(t.price), 0);

      return {
        users: userCount || 0,
        nfts: nftCount || 0,
        totalTransactions: transactionCount || 0,
        todayTransactions: todayTransactionCount || 0,
        totalVolume: volume,
      };
    } catch (error) {
      logger.error('Error fetching platform stats:', error);
      return {
        users: 0,
        nfts: 0,
        totalTransactions: 0,
        todayTransactions: 0,
        totalVolume: 0,
      };
    }
  }

  /**
   * Get popular search terms
   */
  static async getPopularSearches(limit = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('analytics')
        .select('metadata')
        .eq('event_type', 'search')
        .order('created_at', { ascending: false })
        .limit(limit * 5); // Get more to filter duplicates

      if (error) throw error;

      const searches = (data || []).map((d) => d.metadata?.query).filter(Boolean);
      const counts = searches.reduce(
        (acc, search) => {
          acc[search] = (acc[search] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([query, count]) => ({ query, count }));
    } catch (error) {
      logger.error('Error fetching popular searches:', error);
      return [];
    }
  }

  /**
   * Get trending events
   */
  static async getTrendingEvents(hours = 24, limit = 10): Promise<any[]> {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('analytics')
        .select('event_type')
        .gt('created_at', since);

      if (error) throw error;

      const events = (data || []).map((d) => d.event_type);
      const counts = events.reduce(
        (acc, event) => {
          acc[event] = (acc[event] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([event, count]) => ({ event, count }));
    } catch (error) {
      logger.error('Error fetching trending events:', error);
      return [];
    }
  }
}
