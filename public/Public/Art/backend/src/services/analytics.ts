import axios from 'axios';
import { getBaseProvider } from './stacks';

/**
 * Analytics service for marketplace statistics
 */

export interface MarketplaceStats {
  totalVolume: string; // Total volume in ETH
  totalSales: number; // Total number of sales
  activeListing: number; // Active listings count
  uniqueCreators: number; // Number of unique creators
  uniqueCollectors: number; // Number of unique collectors
  floorPrice: string; // Floor price in ETH
  averagePrice: string; // Average sale price in ETH
  lastUpdated: number; // Unix timestamp
}

export interface PriceHistory {
  timestamp: number;
  volume: string;
  sales: number;
  floorPrice: string;
  averagePrice: string;
}

// In-memory cache for analytics (in production, use Redis)
let analyticsCache: {
  stats: MarketplaceStats | null;
  lastUpdated: number;
} = {
  stats: null,
  lastUpdated: 0
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

/**
 * Get marketplace statistics
 */
export async function getMarketplaceStats(): Promise<MarketplaceStats> {
  const now = Date.now();
  
  // Return cached stats if still fresh
  if (analyticsCache.stats && now - analyticsCache.lastUpdated < CACHE_TTL) {
    return analyticsCache.stats;
  }

  try {
    // In production, query smart contract and database
    // For now, calculate from mock data or contract state
    const stats = await calculateMarketplaceStats();
    
    // Update cache
    analyticsCache = {
      stats,
      lastUpdated: now
    };

    return stats;
  } catch (error) {
    console.error('Error fetching marketplace stats:', error);
    
    // Return cached stats if available, even if expired
    if (analyticsCache.stats) {
      return analyticsCache.stats;
    }

    // Return default stats on error
    return getDefaultStats();
  }
}

/**
 * Calculate marketplace statistics from contract
 */
async function calculateMarketplaceStats(): Promise<MarketplaceStats> {
  try {
    const provider = getBaseProvider();

    // Contract address from env (would be set to actual marketplace contract)
    const marketplaceAddress = process.env.MARKETPLACE_CONTRACT_ADDRESS || '';

    if (!marketplaceAddress) {
      return getDefaultStats();
    }

    // This would query the smart contract for:
    // - Total volume from all sales
    // - Total number of sales
    // - Active listings
    // - Floor price
    // - Average price

    // For now, return calculated default stats
    // In production, decode contract calls and aggregate data
    const stats: MarketplaceStats = {
      totalVolume: '125.5',
      totalSales: 342,
      activeListing: 1245,
      uniqueCreators: 156,
      uniqueCollectors: 287,
      floorPrice: '0.1',
      averagePrice: '0.367',
      lastUpdated: Date.now()
    };

    return stats;
  } catch (error) {
    console.error('Error calculating marketplace stats:', error);
    return getDefaultStats();
  }
}

/**
 * Get default/fallback stats
 */
function getDefaultStats(): MarketplaceStats {
  return {
    totalVolume: '0',
    totalSales: 0,
    activeListing: 0,
    uniqueCreators: 0,
    uniqueCollectors: 0,
    floorPrice: '0',
    averagePrice: '0',
    lastUpdated: Date.now()
  };
}

/**
 * Get daily volume over time period
 */
export async function getPriceHistory(
  days: number = 30
): Promise<PriceHistory[]> {
  try {
    // Generate daily price history
    // In production, query historical data from database
    const history: PriceHistory[] = [];

    for (let i = days; i > 0; i--) {
      const timestamp = Date.now() - i * 24 * 60 * 60 * 1000;
      
      history.push({
        timestamp,
        volume: String((Math.random() * 50).toFixed(2)),
        sales: Math.floor(Math.random() * 30),
        floorPrice: String((Math.random() * 1).toFixed(3)),
        averagePrice: String((Math.random() * 2).toFixed(3))
      });
    }

    return history;
  } catch (error) {
    console.error('Error fetching price history:', error);
    return [];
  }
}

/**
 * Get marketplace statistics by collection
 */
export async function getCollectionStats(
  contractAddress: string
): Promise<{
  contractAddress: string;
  volume: string;
  sales: number;
  listings: number;
  floorPrice: string;
  royaltyPercentage: number;
}> {
  try {
    // In production, query contract and database for collection-specific stats
    return {
      contractAddress,
      volume: String((Math.random() * 100).toFixed(2)),
      sales: Math.floor(Math.random() * 500),
      listings: Math.floor(Math.random() * 200),
      floorPrice: String((Math.random() * 2).toFixed(3)),
      royaltyPercentage: Math.random() * 10
    };
  } catch (error) {
    console.error('Error fetching collection stats:', error);
    return {
      contractAddress,
      volume: '0',
      sales: 0,
      listings: 0,
      floorPrice: '0',
      royaltyPercentage: 0
    };
  }
}

/**
 * Get top collections by volume
 */
export async function getTopCollections(limit: number = 10): Promise<any[]> {
  try {
    const collections = [];
    
    for (let i = 0; i < limit; i++) {
      collections.push({
        name: `Collection ${i + 1}`,
        contractAddress: `0x${Math.random().toString(16).slice(2)}`,
        volume: String((Math.random() * 500).toFixed(2)),
        floorPrice: String((Math.random() * 5).toFixed(3)),
        owners: Math.floor(Math.random() * 1000),
        items: Math.floor(Math.random() * 5000)
      });
    }

    return collections.sort((a, b) => 
      parseFloat(b.volume) - parseFloat(a.volume)
    );
  } catch (error) {
    console.error('Error fetching top collections:', error);
    return [];
  }
}

/**
 * Clear analytics cache (for manual refresh)
 */
export function clearAnalyticsCache(): void {
  analyticsCache = {
    stats: null,
    lastUpdated: 0
  };
}

/**
 * Get cached stats if available
 */
export function getCachedStats(): MarketplaceStats | null {
  return analyticsCache.stats;
}
