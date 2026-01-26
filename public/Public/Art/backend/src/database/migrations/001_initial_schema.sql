/**
 * SQL Migration for Supabase Database Schema
 * Run this in Supabase SQL Editor to create all tables
 * 
 * Steps:
 * 1. Go to Supabase Dashboard
 * 2. Navigate to SQL Editor
 * 3. Click "New Query"
 * 4. Copy entire contents of this file
 * 5. Click "Run"
 */

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable JSONB for analytics
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ========== USERS TABLE ==========
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE,
  email VARCHAR(255) UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  verified BOOLEAN DEFAULT false,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'creator', 'admin')),
  follower_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_username ON users(username);

-- ========== COLLECTIONS TABLE ==========
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  banner_url TEXT,
  floor_price DECIMAL(18, 8),
  volume DECIMAL(18, 8) DEFAULT 0,
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_collections_creator ON collections(creator_id);

-- ========== NFT TABLE ==========
CREATE TABLE IF NOT EXISTS nfts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_id INTEGER,
  contract_address VARCHAR(255),
  blockchain VARCHAR(20) DEFAULT 'base' CHECK (blockchain IN ('base', 'stacks')),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  metadata_uri TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  price DECIMAL(18, 8),
  for_sale BOOLEAN DEFAULT false,
  royalty_percentage DECIMAL(5, 2) DEFAULT 10,
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_nfts_owner ON nfts(owner_id);
CREATE INDEX idx_nfts_creator ON nfts(creator_id);
CREATE INDEX idx_nfts_for_sale ON nfts(for_sale);
CREATE INDEX idx_nfts_collection ON nfts(collection_id);

-- ========== TRANSACTIONS TABLE ==========
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('mint', 'purchase', 'transfer', 'auction_sale')),
  nft_id UUID NOT NULL REFERENCES nfts(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  price DECIMAL(18, 8) NOT NULL,
  transaction_hash VARCHAR(255) UNIQUE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_nft ON transactions(nft_id);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller ON transactions(seller_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- ========== AUCTIONS TABLE ==========
CREATE TABLE IF NOT EXISTS auctions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nft_id UUID NOT NULL UNIQUE REFERENCES nfts(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_price DECIMAL(18, 8) NOT NULL,
  current_price DECIMAL(18, 8) NOT NULL,
  highest_bidder_id UUID REFERENCES users(id) ON DELETE SET NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'ended', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_auctions_nft ON auctions(nft_id);
CREATE INDEX idx_auctions_creator ON auctions(creator_id);
CREATE INDEX idx_auctions_status ON auctions(status);

-- ========== BIDS TABLE ==========
CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(18, 8) NOT NULL,
  transaction_hash VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'outbid', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bids_auction ON bids(auction_id);
CREATE INDEX idx_bids_bidder ON bids(bidder_id);
CREATE INDEX idx_bids_status ON bids(status);

-- ========== OFFERS TABLE ==========
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nft_id UUID NOT NULL REFERENCES nfts(id) ON DELETE CASCADE,
  proposer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(18, 8) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_offers_nft ON offers(nft_id);
CREATE INDEX idx_offers_proposer ON offers(proposer_id);
CREATE INDEX idx_offers_recipient ON offers(recipient_id);

-- ========== NOTIFICATIONS TABLE ==========
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('sale', 'bid', 'follow', 'message', 'auction_won')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- ========== FOLLOWS TABLE ==========
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- ========== ANALYTICS TABLE ==========
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  nft_id UUID REFERENCES nfts(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_event ON analytics(event_type);
CREATE INDEX idx_analytics_user ON analytics(user_id);
CREATE INDEX idx_analytics_nft ON analytics(nft_id);

-- ========== TRIGGER FOR updated_at ==========
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nfts_updated_at BEFORE UPDATE ON nfts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auctions_updated_at BEFORE UPDATE ON auctions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========== ROW LEVEL SECURITY (RLS) ==========
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- RLS policies (examples - adjust based on your needs)
CREATE POLICY "Public read access to users"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

CREATE POLICY "Public read access to NFTs"
  ON nfts FOR SELECT
  USING (true);

CREATE POLICY "Public read access to auctions"
  ON auctions FOR SELECT
  USING (true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
