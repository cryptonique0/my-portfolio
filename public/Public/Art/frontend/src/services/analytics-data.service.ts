/**
 * Analytics Data Service
 * Backend service for fetching and storing analytics data
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface AnalyticsEvent {
  id?: string;
  eventName: string;
  eventData: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
  pageUrl?: string;
}

export interface FunnelStep {
  step: string;
  users: number;
  conversions: number;
  conversionRate: number;
}

export interface UserFlow {
  source: string;
  destination: string;
  count: number;
  bounceRate: number;
}

export interface UserBehavior {
  userId: string;
  avgSessionDuration: number;
  sessionsCount: number;
  lastActive: number;
  location?: string;
  deviceType?: string;
}

class AnalyticsDataService {
  private authToken: string | null = null;

  constructor() {
    this.authToken = localStorage.getItem('authToken');
  }

  /**
   * Track event to backend
   */
  async trackEventToBackend(event: AnalyticsEvent): Promise<void> {
    try {
      await axios.post(`${API_URL}/api/analytics/events`, event, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.warn('[Analytics] Failed to track event:', error);
    }
  }

  /**
   * Get conversion funnel data
   */
  async getConversionFunnel(dateRange?: { startDate: string; endDate: string }): Promise<FunnelStep[]> {
    try {
      const response = await axios.get(`${API_URL}/api/analytics/funnel`, {
        params: dateRange,
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('[Analytics] Failed to fetch funnel data:', error);
      return [];
    }
  }

  /**
   * Get user flow data
   */
  async getUserFlow(dateRange?: { startDate: string; endDate: string }): Promise<UserFlow[]> {
    try {
      const response = await axios.get(`${API_URL}/api/analytics/user-flow`, {
        params: dateRange,
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('[Analytics] Failed to fetch user flow:', error);
      return [];
    }
  }

  /**
   * Get user behavior data
   */
  async getUserBehavior(timeframe: 'today' | 'week' | 'month' = 'week'): Promise<UserBehavior[]> {
    try {
      const response = await axios.get(`${API_URL}/api/analytics/user-behavior`, {
        params: { timeframe },
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('[Analytics] Failed to fetch user behavior:', error);
      return [];
    }
  }

  /**
   * Get heat map data for page
   */
  async getHeatmapData(pageUrl: string): Promise<any[]> {
    try {
      const response = await axios.get(`${API_URL}/api/analytics/heatmap`, {
        params: { page: pageUrl },
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('[Analytics] Failed to fetch heatmap data:', error);
      return [];
    }
  }

  /**
   * Get event analytics
   */
  async getEventAnalytics(eventName: string, dateRange?: { startDate: string; endDate: string }): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/api/analytics/events/${eventName}`, {
        params: dateRange,
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });
      return response.data.data || {};
    } catch (error) {
      console.error('[Analytics] Failed to fetch event analytics:', error);
      return {};
    }
  }

  /**
   * Get dashboard summary
   */
  async getDashboardSummary(dateRange?: { startDate: string; endDate: string }): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/api/analytics/summary`, {
        params: dateRange,
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });
      return response.data.data || {};
    } catch (error) {
      console.error('[Analytics] Failed to fetch dashboard summary:', error);
      return {};
    }
  }

  /**
   * Get retention cohorts
   */
  async getRetentionCohorts(): Promise<any[]> {
    try {
      const response = await axios.get(`${API_URL}/api/analytics/retention`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('[Analytics] Failed to fetch retention data:', error);
      return [];
    }
  }
}

export const analyticsDataService = new AnalyticsDataService();
