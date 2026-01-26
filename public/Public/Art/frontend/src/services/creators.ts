import axios from 'axios';

export interface CreatorProfile {
  address: string;
  username: string;
  bio: string;
  avatar: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  joinedDate: number;
  verified: boolean;
}

export interface CreatorEarnings {
  address: string;
  totalEarnings: string;
  totalSales: number;
  totalVolume: string;
  averagePrice: string;
  topSale: string;
  nftsCreated: number;
  nftsSold: number;
  followers: number;
  lastEarning: number;
}

export interface CreatorStats {
  profile: CreatorProfile;
  earnings: CreatorEarnings;
  recentSales: Array<{
    tokenId: string;
    nftName: string;
    buyer: string;
    price: string;
    timestamp: number;
    txHash: string;
  }>;
  mostSoldNFT: {
    name: string;
    tokenId: string;
    sales: number;
    totalVolume: string;
  } | null;
}

import { config } from '../config/env';

const API_BASE_URL = config.apiUrl;

/**
 * Fetch creator profile
 */
export async function fetchCreatorProfile(address: string): Promise<CreatorProfile> {
  try {
    const response = await axios.get(`${API_BASE_URL}/creators/${address}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching creator profile:', error);
    throw error;
  }
}

/**
 * Fetch creator earnings
 */
export async function fetchCreatorEarnings(address: string): Promise<CreatorEarnings> {
  try {
    const response = await axios.get(`${API_BASE_URL}/creators/${address}/earnings`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching creator earnings:', error);
    throw error;
  }
}

/**
 * Fetch complete creator stats
 */
export async function fetchCreatorStats(address: string): Promise<CreatorStats> {
  try {
    const response = await axios.get(`${API_BASE_URL}/creators/${address}/stats`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching creator stats:', error);
    throw error;
  }
}

/**
 * Fetch creator rankings
 */
export async function fetchCreatorRankings(
  type: 'earnings' | 'sales' | 'followers' = 'earnings',
  limit: number = 50
): Promise<Array<CreatorProfile & CreatorEarnings>> {
  try {
    const response = await axios.get(`${API_BASE_URL}/creators/rankings/${type}`, {
      params: { limit }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching creator rankings:', error);
    return [];
  }
}

/**
 * Update creator profile
 */
export async function updateCreatorProfile(
  address: string,
  updates: Partial<CreatorProfile>
): Promise<CreatorProfile> {
  try {
    const response = await axios.put(`${API_BASE_URL}/creators/${address}`, updates);
    return response.data.data;
  } catch (error) {
    console.error('Error updating creator profile:', error);
    throw error;
  }
}

/**
 * Format earnings as string
 */
export function formatEarnings(earnings: string | number): string {
  const num = typeof earnings === 'string' ? parseFloat(earnings) : earnings;
  return `Ξ ${num.toFixed(3)}`;
}

/**
 * Get days since join
 */
export function getDaysSinceJoin(joinedDate: number): number {
  return Math.floor((Date.now() - joinedDate) / (24 * 60 * 60 * 1000));
}
