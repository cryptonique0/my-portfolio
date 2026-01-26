import axios from 'axios';
import { config } from '../config/env';

export interface MarketplaceStats {
  totalVolume: string;
  totalSales: number;
  activeListing: number;
  uniqueCreators: number;
  uniqueCollectors: number;
  floorPrice: string;
  averagePrice: string;
  lastUpdated: number;
}

export interface PriceHistory {
  timestamp: number;
  volume: string;
  sales: number;
  floorPrice: string;
  averagePrice: string;
}

export interface Collection {
  name: string;
  contractAddress: string;
  volume: string;
  floorPrice: string;
  owners: number;
  items: number;
}

const API_BASE_URL = config.apiUrl;

/**
 * Fetch marketplace statistics
 */
export async function fetchMarketplaceStats(): Promise<MarketplaceStats> {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics/stats`);
    return response.data.data || response.data.stats;
  } catch (error) {
    console.error('Error fetching marketplace stats:', error);
    throw error;
  }
}

/**
 * Fetch price history for chart
 */
export async function fetchPriceHistory(days: number = 30): Promise<PriceHistory[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics/history`, {
      params: { days }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching price history:', error);
    return [];
  }
}

/**
 * Fetch top collections
 */
export async function fetchTopCollections(limit: number = 10): Promise<Collection[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics/collections/top`, {
      params: { limit }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching top collections:', error);
    return [];
  }
}

/**
 * Fetch collection stats by address
 */
export async function fetchCollectionStats(address: string): Promise<any> {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics/collections/${address}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching collection stats:', error);
    throw error;
  }
}

/**
 * Fetch top creators
 */
export async function fetchTopCreators(limit: number = 10): Promise<any[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics/top-creators`, {
      params: { limit }
    });
    return response.data.creators || [];
  } catch (error) {
    console.error('Error fetching top creators:', error);
    return [];
  }
}

/**
 * Fetch top buyers
 */
export async function fetchTopBuyers(limit: number = 10): Promise<any[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics/top-buyers`, {
      params: { limit }
    });
    return response.data.buyers || [];
  } catch (error) {
    console.error('Error fetching top buyers:', error);
    return [];
  }
}

/**
 * Format volume as ETH string
 */
export function formatVolume(volume: string | number): string {
  const num = typeof volume === 'string' ? parseFloat(volume) : volume;
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  return num.toFixed(2);
}

/**
 * Format as currency
 */
export function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `Ξ ${num.toFixed(3)}`;
}
