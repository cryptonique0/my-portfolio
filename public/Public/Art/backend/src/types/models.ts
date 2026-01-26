export interface NFT {
  id: string;
  tokenId: number;
  name: string;
  description: string;
  image: string;
  creator: string;
  owner: string;
  price?: number;
  listed: boolean;
  royaltyPercentage: number;
  category: string;
  attributes?: NFTAttribute[];
  createdAt: string;
  updatedAt: string;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

export interface NFTListing {
  id: string;
  tokenId: number;
  seller: string;
  price: number;
  expiresAt?: string;
  status: 'active' | 'sold' | 'cancelled' | 'expired';
  createdAt: string;
}

export interface User {
  address: string;
  username?: string;
  bio?: string;
  avatar?: string;
  banner?: string;
  verified: boolean;
  createdAt: string;
  social?: {
    twitter?: string;
    discord?: string;
    website?: string;
  };
}

export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  type: 'mint' | 'sale' | 'transfer' | 'list' | 'unlist';
  tokenId: number;
  price?: number;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface MarketplaceStats {
  totalVolume: number;
  totalSales: number;
  totalUsers: number;
  totalListings: number;
  floorPrice: number;
  averagePrice: number;
  last24hVolume: number;
}

export interface CreatorStats {
  address: string;
  totalNFTs: number;
  totalSales: number;
  totalRevenue: number;
  averagePrice: number;
  topNFT?: NFT;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  verified?: boolean;
  listed?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'trending';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
}

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;
