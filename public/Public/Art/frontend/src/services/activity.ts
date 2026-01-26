/**
 * Frontend API Client for Activity Service
 * Handles marketplace activity feed and real-time events
 */

import { api } from './api';

export interface ActivityEvent {
  id: string;
  type: 'mint' | 'sale' | 'bid' | 'listing' | 'follow' | 'verification';
  actor: string;
  target?: string;
  nftId?: string;
  contractAddress?: string;
  amount?: number;
  timestamp: Date;
  txHash?: string;
  details: Record<string, any>;
}

export interface MintEvent extends ActivityEvent {
  type: 'mint';
  nftId: string;
  contractAddress: string;
  details: {
    creator: string;
    tokenId: number;
    metadata: Record<string, any>;
  };
}

export interface SaleEvent extends ActivityEvent {
  type: 'sale';
  nftId: string;
  contractAddress: string;
  amount: number;
  details: {
    seller: string;
    buyer: string;
    price: number;
    royaltyFee?: number;
    platformFee?: number;
  };
}

export interface BidEvent extends ActivityEvent {
  type: 'bid';
  nftId: string;
  contractAddress: string;
  amount: number;
  details: {
    bidder: string;
    previousBid?: number;
    auctionId: string;
  };
}

export interface ActivityStats {
  totalMints: number;
  totalSales: number;
  totalBids: number;
  totalListings: number;
  totalFollows: number;
  recentActivity: number;
  averagePrice: number;
  totalVolume: number;
}

/**
 * Get global activity feed
 */
export async function getActivityFeed(filters?: {
  type?: string[];
  creatorAddress?: string;
  nftId?: string;
  limit?: number;
  page?: number;
}): Promise<{
  events: ActivityEvent[];
  total: number;
  page: number;
}> {
  const params: any = {
    limit: filters?.limit || 20,
    page: filters?.page || 1
  };

  if (filters?.type && filters.type.length > 0) {
    params.type = filters.type.join(',');
  }

  if (filters?.creatorAddress) {
    params.creatorAddress = filters.creatorAddress;
  }

  if (filters?.nftId) {
    params.nftId = filters.nftId;
  }

  const response = await api.get('/activity/feed', { params });
  return response.data;
}

/**
 * Get activity for a specific creator
 */
export async function getCreatorActivity(creatorAddress: string, limit: number = 50): Promise<ActivityEvent[]> {
  const response = await api.get(`/activity/creator/${creatorAddress}`, {
    params: { limit }
  });
  return response.data;
}

/**
 * Get activity for a specific NFT
 */
export async function getNFTActivity(
  nftId: string,
  contractAddress: string,
  limit: number = 50
): Promise<ActivityEvent[]> {
  const response = await api.get(`/activity/nft/${nftId}/${contractAddress}`, {
    params: { limit }
  });
  return response.data;
}

/**
 * Get recent sales activity
 */
export async function getRecentSales(limit: number = 20): Promise<SaleEvent[]> {
  const response = await api.get('/activity/sales', {
    params: { limit }
  });
  return response.data;
}

/**
 * Get recent mints activity
 */
export async function getRecentMints(limit: number = 20): Promise<MintEvent[]> {
  const response = await api.get('/activity/mints', {
    params: { limit }
  });
  return response.data;
}

/**
 * Get trending NFTs by activity
 */
export async function getTrendingByActivity(limit: number = 20): Promise<
  Array<{
    nftId: string;
    contractAddress: string;
    activityCount: number;
    recentPrice?: number;
    floorPrice?: number;
  }>
> {
  const response = await api.get('/activity/trending', {
    params: { limit }
  });
  return response.data;
}

/**
 * Get activity statistics
 */
export async function getActivityStats(): Promise<ActivityStats> {
  const response = await api.get('/activity/stats');
  return response.data;
}

/**
 * Track a new activity event
 */
export async function trackActivity(event: Omit<ActivityEvent, 'id'>): Promise<{ eventId: string }> {
  const response = await api.post('/activity/track', event);
  return response.data;
}
