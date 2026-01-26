export interface NFT {
  id: number;
  name: string;
  description: string;
  image: string;
  imageHash: string;
  category: string;
  royaltyPercentage: number;
  creator: string;
  owner: string;
  metadataHash: string;
  metadataUri: string;
  createdAt: string;
}

export interface Listing {
  id: number;
  nftId: number;
  seller: string;
  price: number;
  quantity: number;
  listedAt: string;
  expiresAt: string;
  status: 'active' | 'sold' | 'cancelled';
}

export interface UserProfile {
  address: string;
  bio: string;
  avatar: string;
  banner: string;
  createdAt: string;
  stats: {
    nftsCreated: number;
    nftsOwned: number;
    totalSales: number;
    followers: number;
    following: number;
  };
  social: {
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  verified: boolean;
}

export interface MarketplaceStats {
  totalVolume: number;
  totalNfts: number;
  totalUsers: number;
  totalListings: number;
  averagePrice: number;
  floorPrice: number;
  totalSales: number;
}

export interface Transaction {
  id: string;
  listingId: number;
  nftId: number;
  buyer: string;
  seller: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  platformFee: number;
  sellerAmount: number;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}
