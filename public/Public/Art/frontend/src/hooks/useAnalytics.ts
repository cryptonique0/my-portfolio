/**
 * Custom Hooks for Analytics
 * Provides React hooks for analytics data fetching and management
 */

import { useState, useEffect, useCallback } from 'react';
import analyticsService from '../services/analyticsService';
import { eventTrackingService } from '../services/event-tracking.service';

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
  score: number;
}

/**
 * Hook to fetch dashboard metrics
 */
export const useDashboardMetrics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getDashboardMetrics();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  return { metrics, loading, error, refetch: () => {} };
};

/**
 * Hook to fetch market metrics
 */
export const useMarketMetrics = () => {
  const [metrics, setMetrics] = useState<MarketMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getMarketMetrics();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market metrics');
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return { metrics, loading, error };
};

/**
 * Hook to fetch volume metrics
 */
export const useVolumeMetrics = (timeRange: 'hourly' | 'daily' | 'weekly' = 'daily') => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await analyticsService.getVolumeMetrics(timeRange);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch volume metrics');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  return { data, loading, error };
};

/**
 * Hook to fetch trending metrics
 */
export const useTrendingMetrics = (period: 'daily' | 'weekly' | 'monthly' = 'daily') => {
  const [trending, setTrending] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const result = await analyticsService.getTrendingMetrics(period);
        setTrending(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch trending data');
        setTrending(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [period]);

  return { trending, loading, error };
};

/**
 * Hook to fetch chart data
 */
export const useChartData = (
  chartType: 'volume' | 'transactions' | 'users' | 'collections',
  timeRange: '24h' | 'weekly' | 'monthly' = 'weekly'
) => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getChartData(chartType, timeRange);
        setChartData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to fetch ${chartType} data`);
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [chartType, timeRange]);

  return { chartData, loading, error };
};

/**
 * Hook to fetch leaderboard data
 */
export const useLeaderboard = (
  type: 'volume' | 'creators' | 'collectors' | 'trending',
  period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'all-time',
  limit: number = 10
) => {
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const result = await analyticsService.getLeaderboard(type, period, limit);
        setLeaderboard(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
        setLeaderboard(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [type, period, limit]);

  return { leaderboard, loading, error };
};

/**
 * Hook to fetch user activity
 */
export const useUserActivity = (userId: string | null) => {
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setActivity(null);
      setLoading(false);
      return;
    }

    const fetchActivity = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getUserActivity(userId);
        setActivity(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user activity');
        setActivity(null);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [userId]);

  return { activity, loading, error };
};

/**
 * Hook to fetch popular searches
 */
export const usePopularSearches = (limit: number = 10) => {
  const [searches, setSearches] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSearches = async () => {
      try {
        setLoading(true);
        const result = await analyticsService.getPopularSearches(limit);
        setSearches(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch popular searches');
        setSearches(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSearches();
  }, [limit]);

  return { searches, loading, error };
};

/**
 * Hook for tracking events
 */
export const useTrackEvent = () => {
  const trackEvent = useCallback(
    async (eventType: string, userId: string | null, metadata?: Record<string, any>) => {
      try {
        await analyticsService.trackEvent(eventType, userId, metadata);
      } catch (error) {
        console.error('Failed to track event:', error);
      }
    },
    []
  );

  return { trackEvent };
};

/**
 * Hook for CSV export
 */
export const useExportData = () => {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = useCallback(
    async (dataType: 'transactions' | 'nfts' | 'users' | 'collections' | 'metrics' | 'roi', params?: Record<string, any>) => {
      try {
        setExporting(true);
        analyticsService.exportCSV(dataType, params);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to export data');
      } finally {
        setExporting(false);
      }
    },
    []
  );

  const exportLeaderboard = useCallback(async (type: string, period?: string) => {
    try {
      setExporting(true);
      analyticsService.exportLeaderboardCSV(type, period);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export leaderboard');
    } finally {
      setExporting(false);
    }
  }, []);

  return { exportData, exportLeaderboard, exporting, error };
};

/**
 * Hook to automatically track page views and interactions
 */
export const usePageTracking = (pageName: string) => {
  useEffect(() => {
    // Track scroll depth on page
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercentage > 25) {
          eventTrackingService.trackScrollDepth(pageName, Math.round(scrollPercentage));
        }
      }, 500);
    };

    // Track clicks on page
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      eventTrackingService.trackClickEvent(
        target.tagName + (target.id ? `#${target.id}` : ''),
        e.clientX,
        e.clientY
      );
    };

    // Track time on page
    const startTime = Date.now();
    const handleBeforeUnload = () => {
      const duration = Math.round((Date.now() - startTime) / 1000);
      if (duration > 1) {
        eventTrackingService.trackTimeOnPage(pageName, duration);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('click', handleClick);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pageName]);
};

/**
 * Hook to expose event tracking methods
 */
export const useEventTracking = () => {
  return {
    trackNFTView: eventTrackingService.trackNFTView.bind(eventTrackingService),
    trackSearch: eventTrackingService.trackSearch.bind(eventTrackingService),
    trackOfferCreated: eventTrackingService.trackOfferCreated.bind(eventTrackingService),
    trackOfferAccepted: eventTrackingService.trackOfferAccepted.bind(eventTrackingService),
    trackWishlistAdd: eventTrackingService.trackWishlistAdd.bind(eventTrackingService),
    trackCollectionAdd: eventTrackingService.trackCollectionAdd.bind(eventTrackingService),
    trackLogin: eventTrackingService.trackLogin.bind(eventTrackingService),
    trackSignup: eventTrackingService.trackSignup.bind(eventTrackingService),
    trackCustomEvent: eventTrackingService.trackCustomEvent.bind(eventTrackingService),
  };
};
