import axios from 'axios';
import { getBaseProvider } from './stacks';

/**
 * Creator profile and earnings service
 */

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
  totalEarnings: string; // Total earnings in ETH
  totalSales: number;
  totalVolume: string;
  averagePrice: string;
  topSale: string;
  nftsCreated: number;
  nftsSold: number;
  followers: number;
  lastEarning: number; // Unix timestamp
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

/**
 * Fetch creator profile
 */
export async function getCreatorProfile(
  address: string
): Promise<CreatorProfile> {
  try {
    // In production, fetch from database or smart contract
    // For now, return mock profile with real address
    return {
      address,
      username: `Creator_${address.slice(2, 8)}`,
      bio: 'Digital artist creating unique NFT experiences on Base.',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`,
      website: 'https://example.com',
      twitter: '@creator',
      instagram: '@creator',
      joinedDate: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90 days ago
      verified: Math.random() > 0.5
    };
  } catch (error) {
    console.error('Error fetching creator profile:', error);
    throw error;
  }
}

/**
 * Fetch creator earnings
 */
export async function getCreatorEarnings(
  address: string
): Promise<CreatorEarnings> {
  try {
    // In production, calculate from smart contract events
    const totalEarnings = (Math.random() * 500).toFixed(2);
    const totalSales = Math.floor(Math.random() * 200);
    const totalVolume = (Math.random() * 1000).toFixed(2);

    return {
      address,
      totalEarnings,
      totalSales,
      totalVolume,
      averagePrice: (parseFloat(totalVolume) / totalSales).toFixed(3),
      topSale: (Math.random() * 50).toFixed(2),
      nftsCreated: Math.floor(Math.random() * 500),
      nftsSold: totalSales,
      followers: Math.floor(Math.random() * 5000),
      lastEarning: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
    };
  } catch (error) {
    console.error('Error fetching creator earnings:', error);
    throw error;
  }
}

/**
 * Fetch complete creator stats
 */
export async function getCreatorStats(
  address: string
): Promise<CreatorStats> {
  try {
    const [profile, earnings] = await Promise.all([
      getCreatorProfile(address),
      getCreatorEarnings(address)
    ]);

    // Mock recent sales
    const recentSales = Array.from({ length: 5 }, (_, i) => ({
      tokenId: `${Math.floor(Math.random() * 10000)}`,
      nftName: `NFT #${Math.floor(Math.random() * 10000)}`,
      buyer: `0x${Math.random().toString(16).slice(2)}`,
      price: (Math.random() * 10).toFixed(2),
      timestamp: Date.now() - i * 24 * 60 * 60 * 1000,
      txHash: `0x${Math.random().toString(16).slice(2)}`
    }));

    return {
      profile,
      earnings,
      recentSales,
      mostSoldNFT: {
        name: 'Signature Collection #1',
        tokenId: '1',
        sales: 45,
        totalVolume: (Math.random() * 500).toFixed(2)
      }
    };
  } catch (error) {
    console.error('Error fetching creator stats:', error);
    throw error;
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
    // In production, save to database
    const profile = await getCreatorProfile(address);
    return { ...profile, ...updates };
  } catch (error) {
    console.error('Error updating creator profile:', error);
    throw error;
  }
}

/**
 * Get creator rankings
 */
export async function getCreatorRankings(
  type: 'earnings' | 'sales' | 'followers' = 'earnings',
  limit: number = 50
): Promise<Array<CreatorProfile & CreatorEarnings>> {
  try {
    const rankings = Array.from({ length: limit }, (_, i) => {
      const address = `0x${Math.random().toString(16).slice(2)}`;
      return {
        address,
        username: `Creator${i + 1}`,
        bio: 'Digital artist',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
        verified: i < 10,
        joinedDate: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
        website: undefined,
        twitter: undefined,
        instagram: undefined,
        totalEarnings: (Math.random() * 500).toFixed(2),
        totalSales: Math.floor(Math.random() * 200),
        totalVolume: (Math.random() * 1000).toFixed(2),
        averagePrice: (Math.random() * 5).toFixed(3),
        topSale: (Math.random() * 50).toFixed(2),
        nftsCreated: Math.floor(Math.random() * 500),
        nftsSold: Math.floor(Math.random() * 200),
        followers: Math.floor(Math.random() * 5000),
        lastEarning: Date.now()
      };
    });

    // Sort by type
    if (type === 'earnings') {
      return rankings.sort((a, b) => 
        parseFloat(b.totalEarnings) - parseFloat(a.totalEarnings)
      );
    } else if (type === 'sales') {
      return rankings.sort((a, b) => b.totalSales - a.totalSales);
    } else {
      return rankings.sort((a, b) => b.followers - a.followers);
    }
  } catch (error) {
    console.error('Error fetching creator rankings:', error);
    return [];
  }
}

/**
 * Placeholder: fetch creator collections
 */
export async function getCreatorCollections(address: string): Promise<any[]> {
  try {
    // Replace with real data source
    return [];
  } catch (error) {
    console.error('Error fetching creator collections:', error);
    return [];
  }
}
