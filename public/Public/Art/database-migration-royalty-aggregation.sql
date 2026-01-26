-- Add available_balance column to users table for royalty aggregation
ALTER TABLE users ADD COLUMN IF NOT EXISTS available_balance NUMERIC DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auto_payout_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auto_payout_threshold NUMERIC DEFAULT 10;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_available_balance ON users(available_balance) WHERE available_balance > 0;
