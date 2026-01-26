-- ============================================
-- Blockchain Events Table Migration
-- For real-time event monitoring
-- ============================================

-- Create blockchain_events table
CREATE TABLE IF NOT EXISTS blockchain_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  block_number INTEGER NOT NULL,
  event_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_blockchain_events_event_type 
  ON blockchain_events(event_type);

CREATE INDEX IF NOT EXISTS idx_blockchain_events_contract_address 
  ON blockchain_events(contract_address);

CREATE INDEX IF NOT EXISTS idx_blockchain_events_created_at 
  ON blockchain_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blockchain_events_transaction_hash 
  ON blockchain_events(transaction_hash);

-- Enable Row Level Security
ALTER TABLE blockchain_events ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access to blockchain events"
  ON blockchain_events FOR SELECT
  TO authenticated
  USING (true);

-- Allow insert from service role (backend)
CREATE POLICY "Allow insert from service"
  ON blockchain_events FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow insert from authenticated users (optional)
CREATE POLICY "Allow insert from authenticated users"
  ON blockchain_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE blockchain_events IS 'Stores blockchain events from smart contracts for real-time monitoring';
COMMENT ON COLUMN blockchain_events.event_type IS 'Type of event: nft_minted, nft_transferred, item_listed, item_sold, bid_placed, etc.';
COMMENT ON COLUMN blockchain_events.contract_address IS 'Address of the smart contract that emitted the event';
COMMENT ON COLUMN blockchain_events.transaction_hash IS 'Transaction hash where the event occurred';
COMMENT ON COLUMN blockchain_events.block_number IS 'Block number where the event was included';
COMMENT ON COLUMN blockchain_events.event_data IS 'Event data as JSONB (flexible schema)';

-- ============================================
-- Sample Event Data Structures
-- ============================================

-- NFT Minted:
-- {
--   "from": "0x0000000000000000000000000000000000000000",
--   "to": "0x123...",
--   "tokenId": "42"
-- }

-- NFT Transferred:
-- {
--   "from": "0x123...",
--   "to": "0x456...",
--   "tokenId": "42"
-- }

-- Item Listed:
-- {
--   "seller": "0x123...",
--   "nftAddress": "0xNFT...",
--   "tokenId": "42",
--   "price": "1000000000000000000"
-- }

-- Item Sold:
-- {
--   "buyer": "0x456...",
--   "nftAddress": "0xNFT...",
--   "tokenId": "42",
--   "price": "1000000000000000000"
-- }

-- Bid Placed:
-- {
--   "auctionId": "1",
--   "bidder": "0x789...",
--   "amount": "2000000000000000000"
-- }

-- Auction Ended:
-- {
--   "auctionId": "1",
--   "winner": "0x789...",
--   "amount": "2000000000000000000"
-- }

-- ============================================
-- Verification Queries
-- ============================================

-- Verify table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'blockchain_events'
);

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'blockchain_events';

-- Check RLS policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'blockchain_events';

-- Sample insert (for testing)
-- INSERT INTO blockchain_events (
--   event_type,
--   contract_address,
--   transaction_hash,
--   block_number,
--   event_data
-- ) VALUES (
--   'nft_minted',
--   '0x1234567890123456789012345678901234567890',
--   '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
--   12345678,
--   '{"from": "0x0000000000000000000000000000000000000000", "to": "0x9876543210987654321098765432109876543210", "tokenId": "1"}'::jsonb
-- );

-- Sample query (for testing)
-- SELECT * FROM blockchain_events 
-- WHERE event_type = 'nft_minted' 
-- ORDER BY created_at DESC 
-- LIMIT 10;
