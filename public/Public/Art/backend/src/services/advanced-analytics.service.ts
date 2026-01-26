/**
 * Advanced Analytics Service
 * Provides comprehensive analytics and metrics for the dashboard
 */

import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export interface DashboardMetricsData {
  totalVolume: number;
  totalTransactions: number;
  totalNFTsSold: number;
  averagePrice: number;
  totalUsers: number;
  activeUsers: number;
  newCollections: number;
  topCollection?: { id: string; name: string };
  topCreator?: { id: string; username: string };
}

export interface VolumeMetrics {
  timestamp: string;
  volume: number;
  transactionCount: number;
  averagePrice: number;
}

export interface TrendingEntity {
  rank: number;
  entityId: string;
  entityType: 'collection' | 'user' | 'nft';
  trendScore: number;
  changePercent: number;
  name?: string;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
  }>;
}

export interface UserActivityMetrics {
  userId: string;
  totalPurchases: number;
  totalSales: number;
  volumePurchased: number;
  volumeSold: number;
  totalNFTsCreated: number;
  lastActivity: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId?: string;
  username?: string;
  score: number;
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
}

export class AdvancedAnalyticsService {
  /**
   * Get dashboard metrics for a specific date or today
   */
  static async getDashboardMetrics(dateString?: string): Promise<DashboardMetricsData | null> {
    try {
      const queryDate = dateString || new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .eq('metric_date', queryDate)
        .single();

      if (error) {
        logger.warn(`Dashboard metrics not found for ${queryDate}, generating fresh data`);
        return await this.calculateDashboardMetrics();
      }

      return {
        totalVolume: data.total_volume,
        totalTransactions: data.total_transactions,
        totalNFTsSold: data.total_nfts_sold,
        averagePrice: data.average_price,
        totalUsers: data.total_users,
        activeUsers: data.active_users,
        newCollections: data.new_collections,
      };
    } catch (error) {
      logger.error('Error fetching dashboard metrics:', error);
      return null;
    }
  }

  /**
   * Calculate dashboard metrics from transactions
   */
  static async calculateDashboardMetrics(): Promise<DashboardMetricsData | null> {
    try {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('price')
        .eq('status', 'completed')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const { data: users } = await supabase
        .from('users')
        .select('id');

      const { data: nfts } = await supabase
        .from('nfts')
        .select('id')
        .eq('status', 'sold')
        .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const { data: collections } = await supabase
        .from('collections')
        .select('id')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const volumes = (transactions || []).map((t) => parseFloat(t.price));
      const totalVolume = volumes.reduce((a, b) => a + b, 0);
      const averagePrice = volumes.length > 0 ? totalVolume / volumes.length : 0;

      return {
        totalVolume,
        totalTransactions: transactions?.length || 0,
        totalNFTsSold: nfts?.length || 0,
        averagePrice,
        totalUsers: users?.length || 0,
        activeUsers: Math.floor((users?.length || 0) * 0.35),
        newCollections: collections?.length || 0,
      };
    } catch (error) {
      logger.error('Error calculating dashboard metrics:', error);
      return null;
    }
  }

  /**
   * Get volume metrics for time range
   */
  static async getVolumeMetrics(timeRange: 'hourly' | 'daily' | 'weekly' = 'daily'): Promise<VolumeMetrics[]> {
    try {
      let query = supabase
        .from('hourly_metrics')
        .select('metric_hour, volume, transaction_count')
        .order('metric_hour', { ascending: false });

      if (timeRange === 'daily') {
        query = query.gte('metric_hour', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      } else if (timeRange === 'weekly') {
        query = query.gte('metric_hour', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      return (data || []).map((item: any) => ({
        timestamp: item.metric_hour,
        volume: item.volume,
        transactionCount: item.transaction_count,
        averagePrice: item.transaction_count > 0 ? item.volume / item.transaction_count : 0,
      }));
    } catch (error) {
      logger.error('Error fetching volume metrics:', error);
      return [];
    }
  }

  /**
   * Get trending collections and creators
   */
  static async getTrendingMetrics(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<TrendingEntity[]> {
    try {
      const daysAgo = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;
      const trendDate = new Date();
      trendDate.setDate(trendDate.getDate() - daysAgo);
      const dateStr = trendDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_trending')
        .select('*')
        .eq('trend_date', dateStr)
        .order('rank', { ascending: true })
        .limit(20);

      if (error) throw error;

      return (data || []).map((item: any) => ({
        rank: item.rank,
        entityId: item.entity_id,
        entityType: item.entity_type,
        trendScore: item.trend_score,
        changePercent: item.change_percent,
      }));
    } catch (error) {
      logger.error('Error fetching trending metrics:', error);
      return [];
    }
  }

  /**
   * Get market overview metrics
   */
  static async getMarketMetrics() {
    try {
      const { data: hourlyData } = await supabase
        .from('hourly_metrics')
        .select('volume, transaction_count')
        .gte('metric_hour', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const totalVolume24h = (hourlyData || []).reduce((sum, h: any) => sum + (h.volume || 0), 0);
      const totalTransactions24h = (hourlyData || []).reduce((sum, h: any) => sum + (h.transaction_count || 0), 0);

      const { data: allNFTs } = await supabase
        .from('nfts')
        .select('id')
        .eq('status', 'listed');

      const { data: allCollections } = await supabase
        .from('collections')
        .select('id');

      return {
        volume24h: totalVolume24h,
        transactions24h: totalTransactions24h,
        listedNFTs: allNFTs?.length || 0,
        totalCollections: allCollections?.length || 0,
      };
    } catch (error) {
      logger.error('Error fetching market metrics:', error);
      return {
        volume24h: 0,
        transactions24h: 0,
        listedNFTs: 0,
        totalCollections: 0,
      };
    }
  }

  /**
   * Get user activity metrics
   */
  static async getUserActivity(userId: string): Promise<UserActivityMetrics | null> {
    try {
      const { data, error } = await supabase
        .from('user_activity_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        logger.warn(`User activity stats not found for ${userId}`);
        return null;
      }

      return {
        userId: data.user_id,
        totalPurchases: data.total_purchases,
        totalSales: data.total_sales,
        volumePurchased: data.total_volume_purchased,
        volumeSold: data.total_volume_sold,
        totalNFTsCreated: data.total_created_nfts,
        lastActivity: data.last_activity,
      };
    } catch (error) {
      logger.error(`Error fetching user activity for ${userId}:`, error);
      return null;
    }
  }

  /**
   * Get chart data with caching
   */
  static async getChartData(
    chartType: 'volume' | 'transactions' | 'users' | 'collections',
    timeRange: '24h' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<ChartData | null> {
    try {
      // Try to get from cache
      const { data: cached } = await supabase
        .from('chart_data_cache')
        .select('data')
        .eq('chart_type', chartType)
        .eq('time_range', timeRange)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (cached) {
        return cached.data as ChartData;
      }

      // Generate fresh data
      let chartData: ChartData | null = null;

      if (chartType === 'volume') {
        chartData = await this.generateVolumeChart(timeRange);
      } else if (chartType === 'transactions') {
        chartData = await this.generateTransactionChart(timeRange);
      } else if (chartType === 'users') {
        chartData = await this.generateUserChart(timeRange);
      } else if (chartType === 'collections') {
        chartData = await this.generateCollectionChart(timeRange);
      }

      // Cache the result
      if (chartData) {
        await supabase.from('chart_data_cache').upsert({
          chart_type: chartType,
          time_range: timeRange,
          data: chartData,
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        });
      }

      return chartData;
    } catch (error) {
      logger.error(`Error fetching chart data (${chartType}, ${timeRange}):`, error);
      return null;
    }
  }

  /**
   * Generate volume chart data
   */
  private static async generateVolumeChart(timeRange: string): Promise<ChartData> {
    const { data } = await supabase
      .from('hourly_metrics')
      .select('metric_hour, volume')
      .gte('metric_hour', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('metric_hour', { ascending: true });

    const labels = (data || []).map((d: any) => new Date(d.metric_hour).toLocaleDateString());
    const volumeData = (data || []).map((d: any) => d.volume);

    return {
      labels,
      datasets: [
        {
          label: 'Trading Volume',
          data: volumeData,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
        },
      ],
    };
  }

  /**
   * Generate transaction chart data
   */
  private static async generateTransactionChart(timeRange: string): Promise<ChartData> {
    const { data } = await supabase
      .from('hourly_metrics')
      .select('metric_hour, transaction_count')
      .gte('metric_hour', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('metric_hour', { ascending: true });

    const labels = (data || []).map((d: any) => new Date(d.metric_hour).toLocaleDateString());
    const transactionData = (data || []).map((d: any) => d.transaction_count);

    return {
      labels,
      datasets: [
        {
          label: 'Transactions',
          data: transactionData,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
        },
      ],
    };
  }

  /**
   * Generate user chart data
   */
  private static async generateUserChart(timeRange: string): Promise<ChartData> {
    const { data } = await supabase
      .from('hourly_metrics')
      .select('metric_hour, active_users')
      .gte('metric_hour', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('metric_hour', { ascending: true });

    const labels = (data || []).map((d: any) => new Date(d.metric_hour).toLocaleDateString());
    const userData = (data || []).map((d: any) => d.active_users);

    return {
      labels,
      datasets: [
        {
          label: 'Active Users',
          data: userData,
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
        },
      ],
    };
  }

  /**
   * Generate collection chart data
   */
  private static async generateCollectionChart(timeRange: string): Promise<ChartData> {
    const { data } = await supabase
      .from('hourly_metrics')
      .select('metric_hour, listed_nfts')
      .gte('metric_hour', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('metric_hour', { ascending: true });

    const labels = (data || []).map((d: any) => new Date(d.metric_hour).toLocaleDateString());
    const collectionData = (data || []).map((d: any) => d.listed_nfts);

    return {
      labels,
      datasets: [
        {
          label: 'Listed NFTs',
          data: collectionData,
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
        },
      ],
    };
  }

  /**
   * Get leaderboard data
   */
  static async getLeaderboard(
    type: 'volume' | 'creators' | 'collectors' | 'trending',
    period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'all-time',
    limit: number = 10
  ): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from('leaderboards')
        .select('rank, user_id, score, period')
        .eq('leaderboard_type', type)
        .eq('period', period)
        .order('rank', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((item: any) => ({
        rank: item.rank,
        userId: item.user_id,
        score: item.score,
        period: item.period,
      }));
    } catch (error) {
      logger.error(`Error fetching leaderboard (${type}, ${period}):`, error);
      return [];
    }
  }

  /**
   * Track analytics event
   */
  static async trackEvent(eventType: string, userId: string | null, metadata?: Record<string, any>) {
    try {
      const { error } = await supabase.from('realtime_events').insert({
        event_type: eventType,
        user_id: userId,
        action: eventType,
        metadata,
      });

      if (error) {
        logger.warn(`Failed to track event ${eventType}:`, error);
      }
    } catch (error) {
      logger.error(`Error tracking event:`, error);
    }
  }

  /**
   * Get popular search queries
   */
  static async getPopularSearches(limit: number = 10): Promise<Array<{ query: string; count: number }>> {
    try {
      const { data, error } = await supabase
        .from('search_analytics')
        .select('search_query')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const queries = (data || []).reduce(
        (acc: Record<string, number>, item: any) => {
          acc[item.search_query] = (acc[item.search_query] || 0) + 1;
          return acc;
        },
        {}
      );

      return Object.entries(queries)
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      logger.error('Error fetching popular searches:', error);
      return [];
    }
  }
}
