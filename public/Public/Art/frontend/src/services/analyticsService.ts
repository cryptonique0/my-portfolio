/**
 * Analytics Service Client
 * Handles all API calls to backend analytics endpoints
 */

import { API_BASE_URL } from '../config/api';

export interface DashboardMetrics {
  totalVolume: number;
  totalTransactions: number;
  totalNFTsSold: number;
  averagePrice: number;
  totalUsers: number;
  activeUsers: number;
  newCollections: number;
}

export interface MarketMetrics {
  volume24h: number;
  transactions24h: number;
  listedNFTs: number;
  totalCollections: number;
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

export interface LeaderboardEntry {
  rank: number;
  userId?: string;
  username?: string;
  score: number;
  period: string;
}

export interface PopularSearch {
  query: string;
  count: number;
}

class AnalyticsService {
  private baseURL = `${API_BASE_URL}/advanced-analytics`;

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(date?: string): Promise<DashboardMetrics> {
    const url = new URL(`${this.baseURL}/dashboard`);
    if (date) url.searchParams.append('date', date);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch dashboard metrics');
    return response.json();
  }

  /**
   * Get market metrics
   */
  async getMarketMetrics(): Promise<MarketMetrics> {
    const response = await fetch(`${this.baseURL}/market`);
    if (!response.ok) throw new Error('Failed to fetch market metrics');
    return response.json();
  }

  /**
   * Get volume metrics
   */
  async getVolumeMetrics(timeRange: 'hourly' | 'daily' | 'weekly' = 'daily'): Promise<any> {
    const url = new URL(`${this.baseURL}/volume`);
    url.searchParams.append('timeRange', timeRange);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch volume metrics');
    return response.json();
  }

  /**
   * Get trending entities
   */
  async getTrendingMetrics(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<any> {
    const url = new URL(`${this.baseURL}/trending`);
    url.searchParams.append('period', period);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch trending metrics');
    return response.json();
  }

  /**
   * Get chart data
   */
  async getChartData(
    chartType: 'volume' | 'transactions' | 'users' | 'collections',
    timeRange: '24h' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<ChartData> {
    const url = new URL(`${this.baseURL}/charts/${chartType}`);
    url.searchParams.append('timeRange', timeRange);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`Failed to fetch ${chartType} chart data`);
    return response.json();
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(
    type: 'volume' | 'creators' | 'collectors' | 'trending',
    period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'all-time',
    limit: number = 10
  ): Promise<any> {
    const url = new URL(`${this.baseURL}/leaderboard/${type}`);
    url.searchParams.append('period', period);
    url.searchParams.append('limit', limit.toString());

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return response.json();
  }

  /**
   * Get user activity
   */
  async getUserActivity(userId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/user/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user activity');
    return response.json();
  }

  /**
   * Get popular searches
   */
  async getPopularSearches(limit: number = 10): Promise<any> {
    const url = new URL(`${this.baseURL}/searches/popular`);
    url.searchParams.append('limit', limit.toString());

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch popular searches');
    return response.json();
  }

  /**
   * Track analytics event
   */
  async trackEvent(eventType: string, userId: string | null, metadata?: Record<string, any>): Promise<void> {
    const response = await fetch(`${this.baseURL}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, userId, metadata }),
    });

    if (!response.ok) throw new Error('Failed to track event');
  }

  /**
   * Export data as CSV
   */
  exportCSV(dataType: 'transactions' | 'nfts' | 'users' | 'collections' | 'metrics' | 'roi', params?: Record<string, any>): void {
    const url = new URL(`${this.baseURL}/export/${dataType}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value.toString());
      });
    }

    // Trigger download
    const link = document.createElement('a');
    link.href = url.toString();
    link.download = true;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export leaderboard as CSV
   */
  exportLeaderboardCSV(type: string, period?: string): void {
    const url = new URL(`${this.baseURL}/export/leaderboard/${type}`);
    if (period) url.searchParams.append('period', period);

    const link = document.createElement('a');
    link.href = url.toString();
    link.download = true;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export default new AnalyticsService();
