-- ============================================
-- Complete Blockchain Features Database Setup
-- All tables needed for the 5 blockchain features
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. BLOCKCHAIN EVENTS TABLE (Event Listeners)
-- ============================================

CREATE TABLE IF NOT EXISTS blockchain_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  block_number INTEGER NOT NULL,
  event_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blockchain_events_event_type ON blockchain_events(event_type);
CREATE INDEX IF NOT EXISTS idx_blockchain_events_contract_address ON blockchain_events(contract_address);
CREATE INDEX IF NOT EXISTS idx_blockchain_events_created_at ON blockchain_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blockchain_events_transaction_hash ON blockchain_events(transaction_hash);

-- ============================================
-- 2. TRANSACTIONS TABLE (Transaction Tracker)
-- ============================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  transaction_hash TEXT NOT NULL UNIQUE,
  transaction_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  from_address TEXT,
  to_address TEXT,
  value TEXT,
  gas_used TEXT,
  gas_price TEXT,
  block_number INTEGER,
  confirmations INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- ============================================
-- 3. NFTS TABLE (NFT Minting)
-- ============================================

CREATE TABLE IF NOT EXISTS nfts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_id TEXT,
  contract_address TEXT NOT NULL,
  owner_address TEXT NOT NULL,
  creator_address TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  metadata_uri TEXT,
  metadata_ipfs TEXT,
  mint_tx_hash TEXT,
  mint_status TEXT DEFAULT 'pending',
  royalty_percentage NUMERIC(5,2) DEFAULT 0,
  attributes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nfts_token_id ON nfts(token_id);
CREATE INDEX IF NOT EXISTS idx_nfts_contract_address ON nfts(contract_address);
CREATE INDEX IF NOT EXISTS idx_nfts_owner_address ON nfts(owner_address);
CREATE INDEX IF NOT EXISTS idx_nfts_creator_address ON nfts(creator_address);
CREATE INDEX IF NOT EXISTS idx_nfts_mint_status ON nfts(mint_status);

-- ============================================
-- 4. MARKETPLACE LISTINGS TABLE (Buy/Sell Flow)
-- ============================================

CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nft_id UUID REFERENCES nfts(id),
  nft_address TEXT NOT NULL,
  token_id TEXT NOT NULL,
  seller_address TEXT NOT NULL,
  price TEXT NOT NULL,
  currency TEXT DEFAULT 'ETH',
  status TEXT DEFAULT 'active',
  list_tx_hash TEXT,
  sale_tx_hash TEXT,
  buyer_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sold_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_nft_id ON marketplace_listings(nft_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON marketplace_listings(seller_address);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_created_at ON marketplace_listings(created_at DESC);

-- ============================================
-- 5. AUCTIONS TABLE (Auction System)
-- ============================================

CREATE TABLE IF NOT EXISTS auctions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nft_id UUID REFERENCES nfts(id),
  nft_address TEXT NOT NULL,
  token_id TEXT NOT NULL,
  seller_address TEXT NOT NULL,
  start_price TEXT NOT NULL,
  current_bid TEXT,
  highest_bidder TEXT,
  reserve_price TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'active',
  create_tx_hash TEXT,
  settle_tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auctions_nft_id ON auctions(nft_id);
CREATE INDEX IF NOT EXISTS idx_auctions_seller ON auctions(seller_address);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_end_time ON auctions(end_time);

-- ============================================
-- 6. AUCTION BIDS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS auction_bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
  bidder_address TEXT NOT NULL,
  bid_amount TEXT NOT NULL,
  bid_tx_hash TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auction_bids_auction_id ON auction_bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_bids_bidder ON auction_bids(bidder_address);
CREATE INDEX IF NOT EXISTS idx_auction_bids_created_at ON auction_bids(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE blockchain_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_bids ENABLE ROW LEVEL SECURITY;

-- Blockchain Events Policies
DROP POLICY IF EXISTS "Allow read access to blockchain events" ON blockchain_events;
CREATE POLICY "Allow read access to blockchain events"
  ON blockchain_events FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow insert from service" ON blockchain_events;
CREATE POLICY "Allow insert from service"
  ON blockchain_events FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert from authenticated users" ON blockchain_events;
CREATE POLICY "Allow insert from authenticated users"
  ON blockchain_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Transactions Policies
DROP POLICY IF EXISTS "Users can read own transactions" ON transactions;
CREATE POLICY "Users can read own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- NFTs Policies
DROP POLICY IF EXISTS "NFTs are viewable by everyone" ON nfts;
CREATE POLICY "NFTs are viewable by everyone"
  ON nfts FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create NFTs" ON nfts;
CREATE POLICY "Users can create NFTs"
  ON nfts FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Owners can update their NFTs" ON nfts;
CREATE POLICY "Owners can update their NFTs"
  ON nfts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Marketplace Listings Policies
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON marketplace_listings;
CREATE POLICY "Listings are viewable by everyone"
  ON marketplace_listings FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create listings" ON marketplace_listings;
CREATE POLICY "Users can create listings"
  ON marketplace_listings FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Sellers can update their listings" ON marketplace_listings;
CREATE POLICY "Sellers can update their listings"
  ON marketplace_listings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Auctions Policies
DROP POLICY IF EXISTS "Auctions are viewable by everyone" ON auctions;
CREATE POLICY "Auctions are viewable by everyone"
  ON auctions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create auctions" ON auctions;
CREATE POLICY "Users can create auctions"
  ON auctions FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Sellers can update their auctions" ON auctions;
CREATE POLICY "Sellers can update their auctions"
  ON auctions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Auction Bids Policies
DROP POLICY IF EXISTS "Bids are viewable by everyone" ON auction_bids;
CREATE POLICY "Bids are viewable by everyone"
  ON auction_bids FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can place bids" ON auction_bids;
CREATE POLICY "Users can place bids"
  ON auction_bids FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_nfts_updated_at ON nfts;
CREATE TRIGGER update_nfts_updated_at
    BEFORE UPDATE ON nfts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_marketplace_listings_updated_at ON marketplace_listings;
CREATE TRIGGER update_marketplace_listings_updated_at
    BEFORE UPDATE ON marketplace_listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_auctions_updated_at ON auctions;
CREATE TRIGGER update_auctions_updated_at
    BEFORE UPDATE ON auctions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE COMMENTS
-- ============================================

COMMENT ON TABLE blockchain_events IS 'Real-time blockchain events from smart contracts';
COMMENT ON TABLE transactions IS 'User transaction history with status tracking';
COMMENT ON TABLE nfts IS 'NFT metadata and minting information';
COMMENT ON TABLE marketplace_listings IS 'Active and historical marketplace listings';
COMMENT ON TABLE auctions IS 'Auction details and status';
COMMENT ON TABLE auction_bids IS 'Bids placed on auctions';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN (
    'blockchain_events',
    'transactions',
    'nfts',
    'marketplace_listings',
    'auctions',
    'auction_bids'
  )
ORDER BY table_name;

-- Check all indexes
SELECT 
  tablename,
  COUNT(*) as index_count
FROM pg_indexes 
WHERE tablename IN (
  'blockchain_events',
  'transactions',
  'nfts',
  'marketplace_listings',
  'auctions',
  'auction_bids'
)
GROUP BY tablename
ORDER BY tablename;

-- Check RLS is enabled
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN (
  'blockchain_events',
  'transactions',
  'nfts',
  'marketplace_listings',
  'auctions',
  'auction_bids'
)
ORDER BY tablename;

-- ============================================
-- SAMPLE DATA (for testing - optional)
-- ============================================

-- Uncomment to insert sample data

/*
-- Sample NFT
INSERT INTO nfts (
  contract_address,
  owner_address,
  creator_address,
  name,
  description,
  mint_status
) VALUES (
  '0xD15D1766cd7c2D4FbcEb4f015CbD54058304d682',
  '0x1234567890123456789012345678901234567890',
  '0x1234567890123456789012345678901234567890',
  'Test NFT #1',
  'A test NFT for development',
  'minted'
);

-- Sample Transaction
INSERT INTO transactions (
  user_id,
  transaction_hash,
  transaction_type,
  status,
  from_address,
  to_address
) VALUES (
  'user-123',
  '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  'mint',
  'confirmed',
  '0x1234567890123456789012345678901234567890',
  '0xD15D1766cd7c2D4FbcEb4f015CbD54058304d682'
);

-- Sample Blockchain Event
INSERT INTO blockchain_events (
  event_type,
  contract_address,
  transaction_hash,
  block_number,
  event_data
) VALUES (
  'nft_minted',
  '0xD15D1766cd7c2D4FbcEb4f015CbD54058304d682',
  '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  12345678,
  '{"from": "0x0000000000000000000000000000000000000000", "to": "0x1234567890123456789012345678901234567890", "tokenId": "1"}'::jsonb
);
*/

-- ============================================
-- CLEANUP (for development - use with caution)
-- ============================================

/*
-- WARNING: This will delete all data!
-- Uncomment only if you want to reset everything

TRUNCATE TABLE auction_bids CASCADE;
TRUNCATE TABLE auctions CASCADE;
TRUNCATE TABLE marketplace_listings CASCADE;
TRUNCATE TABLE nfts CASCADE;
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE blockchain_events CASCADE;
*/

-- ============================================
-- END OF MIGRATION
-- ============================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Blockchain features database setup complete!';
  RAISE NOTICE '   Tables created: 6';
  RAISE NOTICE '   - blockchain_events';
  RAISE NOTICE '   - transactions';
  RAISE NOTICE '   - nfts';
  RAISE NOTICE '   - marketplace_listings';
  RAISE NOTICE '   - auctions';
  RAISE NOTICE '   - auction_bids';
  RAISE NOTICE '   RLS policies applied to all tables';
  RAISE NOTICE '   Indexes created for optimal performance';
END $$;
