import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface UserProfile {
  user_id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  discord?: string;
  telegram?: string;
  portfolio_value?: number;
  total_sales?: number;
  total_purchases?: number;
  nfts_created?: number;
  nfts_owned?: number;
  followers_count?: number;
  following_count?: number;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SocialLinks {
  website?: string;
  twitter?: string;
  instagram?: string;
  discord?: string;
  telegram?: string;
}

export interface PortfolioStats {
  user_id: string;
  total_value: number;
  nfts_owned: number;
  nfts_created: number;
  total_sales_value: number;
  total_purchases_value: number;
  profit_loss: number;
  best_sale?: number;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'trading' | 'social' | 'creation' | 'collection' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  points: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export interface AchievementProgress {
  achievement_id: string;
  current_value: number;
  required_value: number;
  percentage: number;
  unlocked: boolean;
}

export interface TradingStats {
  user_id: string;
  total_volume: number;
  total_sales: number;
  total_purchases: number;
  profit_loss: number;
  best_sale: number;
  avg_sale_price: number;
  avg_purchase_price: number;
  total_trades: number;
  period: 'all_time' | '30d' | '7d' | '24h';
}

export interface TradingActivity {
  date: string;
  sales_volume: number;
  purchases_volume: number;
  net_profit: number;
  trades_count: number;
}

export interface VerificationRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  request_type: 'creator' | 'influencer' | 'business' | 'developer';
  reason: string;
  submitted_at: string;
}

// ============================================================================
// useProfile Hook
// ============================================================================

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/profile/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated');
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Refresh profile
      if (userId) {
        await fetchProfile(userId);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  const updateAvatar = async (file: File): Promise<string | null> => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated');
      return null;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch(`${API_URL}/api/profile/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const data = await response.json();
      
      // Refresh profile
      if (userId) {
        await fetchProfile(userId);
      }

      return data.avatar_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  };

  const updateBanner = async (file: File): Promise<string | null> => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated');
      return null;
    }

    const formData = new FormData();
    formData.append('banner', file);

    try {
      const response = await fetch(`${API_URL}/api/profile/banner`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload banner');
      }

      const data = await response.json();
      
      // Refresh profile
      if (userId) {
        await fetchProfile(userId);
      }

      return data.banner_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  };

  const updateSocialLinks = async (links: SocialLinks): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated');
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/api/profile/social-links`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(links),
      });

      if (!response.ok) {
        throw new Error('Failed to update social links');
      }

      // Refresh profile
      if (userId) {
        await fetchProfile(userId);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  const fetchPortfolioStats = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/${id}/portfolio-stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio stats');
      }

      const data = await response.json();
      setPortfolioStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
      fetchPortfolioStats(userId);
    }
  }, [userId, fetchProfile]);

  return {
    profile,
    portfolioStats,
    loading,
    error,
    updateProfile,
    updateAvatar,
    updateBanner,
    updateSocialLinks,
    refetch: () => userId && fetchProfile(userId),
  };
}

// ============================================================================
// useAchievements Hook
// ============================================================================

export function useAchievements(userId?: string) {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [progress, setProgress] = useState<AchievementProgress[]>([]);
  const [stats, setStats] = useState<{
    total_unlocked: number;
    total_points: number;
    completion_percentage: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/profile/${id}/achievements`);
      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }

      const data = await response.json();
      setAchievements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProgress = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/${id}/achievement-progress`);
      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }

      const data = await response.json();
      setProgress(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchStats = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/${id}/achievement-stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const checkForNewAchievements = async (): Promise<UserAchievement[]> => {
    const token = localStorage.getItem('token');
    if (!token) {
      return [];
    }

    try {
      const response = await fetch(`${API_URL}/api/profile/check-achievements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      
      // Refresh achievements if new ones were unlocked
      if (data.new_achievements.length > 0 && userId) {
        await fetchAchievements(userId);
      }

      return data.new_achievements;
    } catch (err) {
      return [];
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAchievements(userId);
      fetchProgress(userId);
      fetchStats(userId);
    }
  }, [userId, fetchAchievements]);

  return {
    achievements,
    progress,
    stats,
    loading,
    error,
    checkForNewAchievements,
    refetch: () => userId && fetchAchievements(userId),
  };
}

// ============================================================================
// useTradingStats Hook
// ============================================================================

export function useTradingStats(userId?: string) {
  const [stats, setStats] = useState<TradingStats | null>(null);
  const [activity, setActivity] = useState<TradingActivity[]>([]);
  const [topTrades, setTopTrades] = useState<{
    top_sales: any[];
    top_purchases: any[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (id: string, period: string = 'all_time') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/profile/${id}/trading-stats?period=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch trading stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActivity = async (id: string, days: number = 30) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/${id}/trading-activity?days=${days}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activity');
      }

      const data = await response.json();
      setActivity(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchTopTrades = async (id: string, limit: number = 5) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/${id}/top-trades?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch top trades');
      }

      const data = await response.json();
      setTopTrades(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchStats(userId);
      fetchActivity(userId);
      fetchTopTrades(userId);
    }
  }, [userId, fetchStats]);

  return {
    stats,
    activity,
    topTrades,
    loading,
    error,
    refetchStats: (period?: string) => userId && fetchStats(userId, period),
    refetchActivity: (days?: number) => userId && fetchActivity(userId, days),
  };
}

// ============================================================================
// useVerification Hook
// ============================================================================

export function useVerification() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [eligibility, setEligibility] = useState<{
    eligible: boolean;
    reasons: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitRequest = async (
    requestType: 'creator' | 'influencer' | 'business' | 'developer',
    data: {
      social_proof: string[];
      portfolio_links: string[];
      reason: string;
    }
  ): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated');
      return false;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/profile/verification/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          request_type: requestType,
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      await fetchRequests();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async (requestType: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/profile/verification/eligibility/${requestType}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to check eligibility');
      }

      const data = await response.json();
      setEligibility(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchRequests = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/profile/verification/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return {
    requests,
    eligibility,
    loading,
    error,
    submitRequest,
    checkEligibility,
    refetchRequests: fetchRequests,
  };
}
