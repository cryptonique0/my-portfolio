-- Transaction History Database Migration
-- This migration creates the transactions table for comprehensive transaction tracking

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  nft_id UUID NOT NULL,
  nft_name TEXT NOT NULL,
  nft_image TEXT,
  
  -- Transaction type
  type TEXT NOT NULL CHECK (type IN ('purchase', 'sale', 'mint', 'transfer', 'listing', 'delisting', 'bid', 'bid_accepted')),
  
  -- Financial details
  price DECIMAL(20, 8) DEFAULT 0,
  currency TEXT DEFAULT 'STX' CHECK (currency IN ('STX', 'ETH', 'USD', 'BTC')),
  gas_price DECIMAL(20, 8),
  
  -- Parties involved
  from_address TEXT,
  to_address TEXT,
  
  -- Blockchain details
  transaction_hash TEXT,
  block_number BIGINT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  
  -- Metadata
  metadata JSONB,
  
  -- Timestamps
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_nft_id ON transactions(nft_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_from_address ON transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_transactions_to_address ON transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_hash ON transactions(transaction_hash);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_timestamp ON transactions(user_id, timestamp DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_transactions_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions (either as sender or receiver)
CREATE POLICY transactions_select_policy ON transactions
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.uid()::text = from_address OR 
    auth.uid()::text = to_address
  );

-- Only authenticated users can insert transactions
CREATE POLICY transactions_insert_policy ON transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own transactions
CREATE POLICY transactions_update_policy ON transactions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Sample data insertion function for testing
CREATE OR REPLACE FUNCTION insert_sample_transactions(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_nft_id UUID;
BEGIN
  -- Create some sample transactions
  FOR i IN 1..10 LOOP
    v_nft_id := uuid_generate_v4();
    
    -- Purchase transaction
    INSERT INTO transactions (user_id, nft_id, nft_name, nft_image, type, price, currency, from_address, to_address, status, timestamp)
    VALUES (
      p_user_id,
      v_nft_id,
      'Sample NFT #' || i,
      'https://via.placeholder.com/300',
      'purchase',
      (random() * 100)::DECIMAL(20, 8),
      'STX',
      'SP1SAMPLE...',
      p_user_id::text,
      'completed',
      NOW() - (random() * interval '90 days')
    );
    
    -- Optionally add a sale transaction for some NFTs
    IF random() > 0.5 THEN
      INSERT INTO transactions (user_id, nft_id, nft_name, nft_image, type, price, currency, from_address, to_address, status, timestamp)
      VALUES (
        p_user_id,
        v_nft_id,
        'Sample NFT #' || i,
        'https://via.placeholder.com/300',
        'sale',
        (random() * 150)::DECIMAL(20, 8),
        'STX',
        p_user_id::text,
        'SP2SAMPLE...',
        'completed',
        NOW() - (random() * interval '60 days')
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate user's transaction analytics
CREATE OR REPLACE FUNCTION get_user_transaction_analytics(p_user_id UUID)
RETURNS TABLE (
  total_transactions BIGINT,
  total_purchases BIGINT,
  total_sales BIGINT,
  total_spent DECIMAL,
  total_earned DECIMAL,
  net_profit DECIMAL,
  avg_purchase_price DECIMAL,
  avg_sale_price DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_transactions,
    COUNT(*) FILTER (WHERE type IN ('purchase', 'mint'))::BIGINT as total_purchases,
    COUNT(*) FILTER (WHERE type IN ('sale', 'bid_accepted'))::BIGINT as total_sales,
    COALESCE(SUM(price) FILTER (WHERE type IN ('purchase', 'mint')), 0) as total_spent,
    COALESCE(SUM(price) FILTER (WHERE type IN ('sale', 'bid_accepted')), 0) as total_earned,
    COALESCE(SUM(price) FILTER (WHERE type IN ('sale', 'bid_accepted')), 0) - 
      COALESCE(SUM(price) FILTER (WHERE type IN ('purchase', 'mint')), 0) as net_profit,
    AVG(price) FILTER (WHERE type IN ('purchase', 'mint')) as avg_purchase_price,
    AVG(price) FILTER (WHERE type IN ('sale', 'bid_accepted')) as avg_sale_price
  FROM transactions
  WHERE user_id = p_user_id AND status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE transactions IS 'Complete transaction history for all NFT operations';
COMMENT ON COLUMN transactions.type IS 'Type of transaction: purchase, sale, mint, transfer, listing, delisting, bid, bid_accepted';
COMMENT ON COLUMN transactions.price IS 'Transaction price in the specified currency';
COMMENT ON COLUMN transactions.currency IS 'Currency used for the transaction';
COMMENT ON COLUMN transactions.status IS 'Transaction status: pending, completed, failed';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON transactions TO authenticated;
GRANT SELECT ON transactions TO anon;
