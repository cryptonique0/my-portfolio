/**
 * TypeScript types for all Supabase database tables
 */

// User profile
export interface User {
  id: string;
  wallet_address: string;
  username: string | null;
  email: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  verified: boolean;
  role: 'user' | 'creator' | 'admin';
  follower_count: number;
  created_at: string;
  updated_at: string;
}

// NFT metadata and ownership
export interface NFT {
  id: string;
  token_id: number;
  contract_address: string;
  blockchain: 'base' | 'stacks';
  name: string;
  description: string | null;
  image_url: string;
  metadata_uri: string | null;
  owner_id: string;
  creator_id: string;
  price: number | null;
  for_sale: boolean;
  royalty_percentage: number;
  collection_id: string | null;
  created_at: string;
  updated_at: string;
}

// Transaction history
export interface Transaction {
  id: string;
  type: 'mint' | 'purchase' | 'transfer' | 'auction_sale';
  nft_id: string;
  from_user_id: string | null;
  to_user_id: string;
  seller_id: string;
  buyer_id: string;
  price: number;
  transaction_hash: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

// Auction information
export interface Auction {
  id: string;
  nft_id: string;
  creator_id: string;
  start_price: number;
  current_price: number;
  highest_bidder_id: string | null;
  start_date: string;
  end_date: string;
  status: 'active' | 'ended' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Bid records
export interface Bid {
  id: string;
  auction_id: string;
  bidder_id: string;
  amount: number;
  transaction_hash: string | null;
  status: 'pending' | 'confirmed' | 'outbid' | 'cancelled';
  created_at: string;
}

// Analytics data
export interface Analytics {
  id: string;
  event_type: string;
  user_id: string | null;
  nft_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

// Notification records
export interface Notification {
  id: string;
  user_id: string;
  type: 'sale' | 'bid' | 'follow' | 'message' | 'auction_won';
  title: string;
  message: string;
  data: Record<string, any> | null;
  read: boolean;
  created_at: string;
}

// Offer system
export interface Offer {
  id: string;
  nft_id: string;
  proposer_id: string;
  recipient_id: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expiry_date: string;
  created_at: string;
  updated_at: string;
}

// User follows relationship
export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

// Collection/Category
export interface Collection {
  id: string;
  creator_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  banner_url: string | null;
  floor_price: number | null;
  volume: number;
  item_count: number;
  created_at: string;
  updated_at: string;
}
