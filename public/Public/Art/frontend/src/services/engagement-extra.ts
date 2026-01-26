import { api } from './api';

export interface Quest {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  badge: string;
  expiresAt: string;
  progress: number;
  target: number;
}

export interface SocialProofEvent {
  user: string;
  action: string;
  nft: string;
  time: string;
}

export interface PortfolioHealth {
  address: string;
  diversityScore: number;
  verifiedCollections: number;
  unrealizedPnL: number;
  tips: string[];
}

export const engagementExtraService = {
  getQuests: async (): Promise<Quest[]> => {
    const res = await api.get('/engagement/quests');
    return res.data.quests;
  },
  getSocialProof: async (): Promise<SocialProofEvent[]> => {
    const res = await api.get('/engagement/social-proof');
    return res.data.events;
  },
  getPortfolioHealth: async (address?: string): Promise<PortfolioHealth> => {
    const res = await api.get('/engagement/portfolio-health', { params: { address } });
    return res.data.health;
  }
};
