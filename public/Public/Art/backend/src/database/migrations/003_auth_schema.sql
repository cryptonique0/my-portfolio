/**
 * Auth Schema Migration
 * Adds wallet_nonces table for MetaMask authentication flow
 */

-- ========== WALLET NONCES TABLE ==========
CREATE TABLE IF NOT EXISTS wallet_nonces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address VARCHAR(255) UNIQUE NOT NULL,
  nonce VARCHAR(64) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_wallet_nonces_address ON wallet_nonces(wallet_address);
CREATE INDEX idx_wallet_nonces_expires ON wallet_nonces(expires_at);

-- RLS: Anyone can request nonce, only service can insert/update
ALTER TABLE wallet_nonces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can select wallet_nonces" ON wallet_nonces FOR SELECT USING (true);
CREATE POLICY "Service role can insert wallet_nonces" ON wallet_nonces FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role can update wallet_nonces" ON wallet_nonces FOR UPDATE USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_wallet_nonces_updated_at BEFORE UPDATE ON wallet_nonces
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
