/**
 * NFT service placeholder
 * Replace mock implementations with real chain/database logic
 */

export interface NFTMetadata {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
  creator: string;
  collection?: string;
  royaltyPercentage?: number;
}

export async function getNFTMetadata(tokenId: string): Promise<NFTMetadata | null> {
  // Mock metadata
  return {
    tokenId,
    name: `NFT #${tokenId}`,
    description: 'Placeholder metadata',
    image: `https://via.placeholder.com/400?text=NFT+${tokenId}`,
    creator: '0xcreator',
    collection: 'Mock Collection',
    royaltyPercentage: 5
  };
}

export async function listNFTs(limit: number = 20): Promise<NFTMetadata[]> {
  return Array.from({ length: limit }, (_, i) => ({
    tokenId: String(i + 1),
    name: `NFT #${i + 1}`,
    description: 'Placeholder metadata',
    image: `https://via.placeholder.com/400?text=NFT+${i + 1}`,
    creator: '0xcreator',
    collection: 'Mock Collection',
    royaltyPercentage: 5
  }));
}
