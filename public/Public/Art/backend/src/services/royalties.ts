/**
 * Royalty tracking and analytics service
 */

export interface RoyaltyRecord {
  id: string;
  nftId: string;
  contractAddress: string;
  creatorAddress: string;
  royaltyPercentage: number;
  salePrice: string; // In ETH
  royaltyAmount: string; // In ETH
  buyerAddress: string;
  sellerAddress: string;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
}

export interface CreatorRoyalties {
  creatorAddress: string;
  totalRoyalties: string; // Total ETH earned from royalties
  totalRoyaltySales: number; // Total sales that triggered royalties
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

/**
 * Get creator royalty statistics
 */
export async function getCreatorRoyalties(
  creatorAddress: string
): Promise<CreatorRoyalties> {
  try {
    // In production, query royalty events from smart contract
    // For now, generate mock data with realistic structure
    const recentRoyalties = Array.from({ length: 10 }, (_, i) => ({
      id: `royalty_${i}`,
      nftId: `${Math.floor(Math.random() * 10000)}`,
      contractAddress: process.env.NFT_CONTRACT_ADDRESS || '0x0',
      creatorAddress,
      royaltyPercentage: 10,
      salePrice: (Math.random() * 50).toFixed(2),
      royaltyAmount: (Math.random() * 5).toFixed(2),
      buyerAddress: `0x${Math.random().toString(16).slice(2)}`,
      sellerAddress: `0x${Math.random().toString(16).slice(2)}`,
      timestamp: Date.now() - i * 24 * 60 * 60 * 1000,
      transactionHash: `0x${Math.random().toString(16).slice(2)}`,
      blockNumber: Math.floor(Math.random() * 1000000)
    }));

    const totalRoyalties = recentRoyalties
      .reduce((sum, r) => sum + parseFloat(r.royaltyAmount), 0)
      .toFixed(2);

    return {
      creatorAddress,
      totalRoyalties,
      totalRoyaltySales: recentRoyalties.length * 5,
      averageRoyaltyPercentage: 10,
      topNFT: {
        nftId: '12345',
        nftName: 'Top Earner #1',
        royaltiesEarned: (Math.random() * 100).toFixed(2),
        salesCount: Math.floor(Math.random() * 50)
      },
      recentRoyalties
    };
  } catch (error) {
    console.error('Error fetching creator royalties:', error);
    throw error;
  }
}

/**
 * Get royalty history for chart
 */
export async function getRoyaltyHistory(
  creatorAddress: string,
  days: number = 30
): Promise<RoyaltyChartData[]> {
  try {
    const history: RoyaltyChartData[] = [];

    for (let i = days; i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const timestamp = date.getTime();

      history.push({
        date: date.toISOString().split('T')[0],
        timestamp,
        royaltyAmount: (Math.random() * 10).toFixed(2),
        salesCount: Math.floor(Math.random() * 20),
        averageRoyaltyPercentage: 8 + Math.random() * 4
      });
    }

    return history;
  } catch (error) {
    console.error('Error fetching royalty history:', error);
    return [];
  }
}

/**
 * Get NFT-specific royalty statistics
 */
export async function getNFTRoyaltyStats(
  nftId: string,
  contractAddress: string
): Promise<NFTRoyaltyStats> {
  try {
    return {
      nftId,
      contractAddress,
      nftName: `NFT #${nftId}`,
      creatorAddress: `0x${Math.random().toString(16).slice(2)}`,
      royaltyPercentage: 10,
      totalRoyaltiesEarned: (Math.random() * 500).toFixed(2),
      totalSales: Math.floor(Math.random() * 200),
      totalVolume: (Math.random() * 5000).toFixed(2),
      lastSaleDate: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
      lastSalePrice: (Math.random() * 50).toFixed(2)
    };
  } catch (error) {
    console.error('Error fetching NFT royalty stats:', error);
    throw error;
  }
}

/**
 * Get top earning NFTs by royalties
 */
export async function getTopRoyaltyNFTs(
  limit: number = 20
): Promise<NFTRoyaltyStats[]> {
  try {
    const nfts = Array.from({ length: limit }, (_, i) => ({
      nftId: String(i + 1),
      contractAddress: process.env.NFT_CONTRACT_ADDRESS || '0x0',
      nftName: `Top Earner #${i + 1}`,
      creatorAddress: `0x${Math.random().toString(16).slice(2)}`,
      royaltyPercentage: Math.floor(Math.random() * 15) + 5,
      totalRoyaltiesEarned: (Math.random() * 500).toFixed(2),
      totalSales: Math.floor(Math.random() * 200),
      totalVolume: (Math.random() * 5000).toFixed(2),
      lastSaleDate: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
      lastSalePrice: (Math.random() * 50).toFixed(2)
    }));

    return nfts.sort((a, b) => 
      parseFloat(b.totalRoyaltiesEarned) - parseFloat(a.totalRoyaltiesEarned)
    );
  } catch (error) {
    console.error('Error fetching top royalty NFTs:', error);
    return [];
  }
}

/**
 * Calculate estimated royalties for future sale
 */
export function calculateRoyalties(
  salePrice: string | number,
  royaltyPercentage: number
): string {
  const price = typeof salePrice === 'string' ? parseFloat(salePrice) : salePrice;
  const royalty = (price * royaltyPercentage) / 100;
  return royalty.toFixed(4);
}
