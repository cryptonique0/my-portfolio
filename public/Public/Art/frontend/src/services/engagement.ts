import { api } from './api';

export const engagementService = {
  getLeaderboard: async (limit: number = 10) => {
    const response = await api.get('/engagement/leaderboard', { params: { limit } });
    return response.data.leaderboard as LeaderboardEntry[];
  },
  getUserSummary: async (address: string) => {
    const response = await api.get(`/engagement/user/${address}`);
    return response.data as { success: boolean; summary: LeaderboardEntry; multipliers: Multipliers };
  },
  getReferrals: async (address?: string) => {
    const response = await api.get('/engagement/referrals', { params: { address } });
    return response.data as ReferralResponse;
  },
  getDrops: async () => {
    const response = await api.get('/engagement/drops');
    return response.data.drops as DropSchedule[];
  },
  notifyDrop: async (id: string, payload: { email?: string; webhook?: string }) => {
    const response = await api.post(`/engagement/drops/${id}/notify`, payload);
    return response.data;
  },
  getRecommendations: async (tags?: string[]) => {
    const response = await api.get('/engagement/recommendations', {
      params: { tags: tags?.join(',') }
    });
    return response.data.recommendations as Recommendation[];
  },
  getTrust: async () => {
    const response = await api.get('/engagement/trust');
    return response.data.trust as TrustSignals;
  }
};

export interface LeaderboardEntry {
  address: string;
  username: string;
  xp: number;
  volume: number;
  streakDays: number;
  badges: string[];
  lastAction: string;
  lastActiveAt: string;
}

export interface Multipliers {
  buy: number;
  sell: number;
  mint: number;
  list: number;
  referral: number;
}

export interface ReferralResponse {
  success: boolean;
  you: {
    address: string;
    code: string;
    clicks: number;
    signups: number;
    referredVolume: number;
    rewardsEth: number;
    pendingRewardsEth: number;
    rank: number;
  };
  topReferrers: Array<{ address: string; username: string; referrals: number; volume: number; rewards: number }>;
  baseline: { address: string; username: string; referrals: number; volume: number; rewards: number };
}

export interface DropSchedule {
  id: string;
  title: string;
  creator: string;
  supply: number;
  allowlistOpen: string;
  mintOpen: string;
  mintClose: string;
  priceEth: number;
  allowlistSpots: number;
  isFeatured: boolean;
  tags: string[];
}

export interface Recommendation {
  id: string;
  name: string;
  image: string;
  tags: string[];
  score: number;
  reason: string;
}

export interface TrustSignals {
  badges: Array<{ code: string; label: string; description: string; severity: string }>;
  recentAlerts: Array<{ collection: string; reason: string; action: string; flaggedAt: string }>;
}

export default engagementService;
