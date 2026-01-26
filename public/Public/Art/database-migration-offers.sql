-- Offers System Migration
-- Creates offers table with support for counter-offers, expiration, and history

-- Enum for offer status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'offer_status') THEN
    CREATE TYPE offer_status AS ENUM ('open','accepted','rejected','expired','countered');
  END IF;
END$$;

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id TEXT NOT NULL,
  seller_address TEXT,
  buyer_address TEXT NOT NULL,
  amount NUMERIC(18,8) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'STX',
  status offer_status NOT NULL DEFAULT 'open',
  expires_at TIMESTAMPTZ,
  parent_offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_offers_nft_id ON offers(nft_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer ON offers(buyer_address);
CREATE INDEX IF NOT EXISTS idx_offers_seller ON offers(seller_address);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_expires_at ON offers(expires_at);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION set_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_offers_updated_at ON offers;
CREATE TRIGGER trg_offers_updated_at
BEFORE UPDATE ON offers
FOR EACH ROW EXECUTE PROCEDURE set_offers_updated_at();

-- RLS policies
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert offers for themselves
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'offers_insert_self'
  ) THEN
    CREATE POLICY offers_insert_self ON offers
      FOR INSERT
      TO authenticated
      WITH CHECK (buyer_address = current_setting('request.jwt.claims', true)::jsonb->>'wallet_address');
  END IF;
END$$;

-- Allow users to view offers where they are buyer or seller
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'offers_select_buyer_seller'
  ) THEN
    CREATE POLICY offers_select_buyer_seller ON offers
      FOR SELECT
      TO authenticated
      USING (
        (buyer_address = current_setting('request.jwt.claims', true)::jsonb->>'wallet_address') OR
        (seller_address = current_setting('request.jwt.claims', true)::jsonb->>'wallet_address')
      );
  END IF;
END$$;

-- Allow buyer or seller to update status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'offers_update_buyer_seller'
  ) THEN
    CREATE POLICY offers_update_buyer_seller ON offers
      FOR UPDATE
      TO authenticated
      USING (
        (buyer_address = current_setting('request.jwt.claims', true)::jsonb->>'wallet_address') OR
        (seller_address = current_setting('request.jwt.claims', true)::jsonb->>'wallet_address')
      );
  END IF;
END$$;

-- Note: Service role can bypass RLS for admin operations
