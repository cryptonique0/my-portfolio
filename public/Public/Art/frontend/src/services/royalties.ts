import axios from 'axios';
import { config } from '../config/env';

export interface RoyaltyRecord {
  id: string;
  nftId: string;
  contractAddress: string;
  creatorAddress: string;
  royaltyPercentage: number;
  salePrice: string;
  royaltyAmount: string;
  buyerAddress: string;
  sellerAddress: string;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
}

export interface CreatorRoyalties {
  creatorAddress: string;
  totalRoyalties: string;
  totalRoyaltySales: number;
  averageRoyaltyPercentage: number;
  topNFT: {
    nftId: string;
    nftName: string;
    royaltiesEarned: string;
    salesCount: number;
  } | null;
  recentRoyalties: RoyaltyRecord[];
}

export interface RoyaltyChartData {
  date: string;
  timestamp: number;
  royaltyAmount: string;
  salesCount: number;
  averageRoyaltyPercentage: number;
}

export interface NFTRoyaltyStats {
  nftId: string;
  contractAddress: string;
  nftName: string;
  creatorAddress: string;
  royaltyPercentage: number;
  totalRoyaltiesEarned: string;
  totalSales: number;
  totalVolume: string;
  lastSaleDate: number;
  lastSalePrice: string;
}

const API_BASE_URL = config.apiUrl;

/**
 * Fetch creator royalties
 */
export async function fetchCreatorRoyalties(address: string): Promise<CreatorRoyalties> {
  try {
    const response = await axios.get(`${API_BASE_URL}/royalties/creator/${address}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching creator royalties:', error);
    throw error;
  }
}

/**
 * Fetch royalty history
 */
export async function fetchRoyaltyHistory(
  address: string,
  days: number = 30
): Promise<RoyaltyChartData[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/royalties/creator/${address}/history`, {
      params: { days }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching royalty history:', error);
    return [];
  }
}

/**
 * Fetch NFT royalty stats
 */
export async function fetchNFTRoyaltyStats(nftId: string): Promise<NFTRoyaltyStats> {
  try {
    const response = await axios.get(`${API_BASE_URL}/royalties/nft/${nftId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching NFT royalty stats:', error);
    throw error;
  }
}

/**
 * Fetch top royalty NFTs
 */
export async function fetchTopRoyaltyNFTs(limit: number = 20): Promise<NFTRoyaltyStats[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/royalties/top`, {
      params: { limit }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching top royalty NFTs:', error);
    return [];
  }
}

/**
 * Calculate royalties
 */
export async function calculateRoyalties(
  salePrice: string | number,
  royaltyPercentage: number
): Promise<{
  salePrice: string;
  royaltyPercentage: number;
  royaltyAmount: string;
  sellerAmount: string;
}> {
  try {
    const response = await axios.post(`${API_BASE_URL}/royalties/calculate`, {
      salePrice,
      royaltyPercentage
    });
    return response.data.data;
  } catch (error) {
    console.error('Error calculating royalties:', error);
    throw error;
  }
}

/**
 * Format royalty amount as string
 */
export function formatRoyalty(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `Ξ ${num.toFixed(4)}`;
}

/**
 * Get earnings trend
 */
export function getEarningsTrend(history: RoyaltyChartData[]): number {
  if (history.length < 2) return 0;
  
  const recent = history.slice(-7); // Last 7 days
  const previous = history.slice(-14, -7); // Previous 7 days
  
  const recentTotal = recent.reduce((sum, d) => sum + parseFloat(d.royaltyAmount), 0);
  const previousTotal = previous.reduce((sum, d) => sum + parseFloat(d.royaltyAmount), 0);
  
  if (previousTotal === 0) return 0;
  
  return ((recentTotal - previousTotal) / previousTotal) * 100;
}
