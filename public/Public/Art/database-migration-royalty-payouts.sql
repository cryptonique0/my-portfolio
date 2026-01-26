-- Royalty Payouts Migration

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payout_status') THEN
    CREATE TYPE payout_status AS ENUM ('pending','processed','failed');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS royalty_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_wallet TEXT NOT NULL,
  amount NUMERIC(18,8) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'STX',
  status payout_status NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  tx_hash TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_payouts_wallet ON royalty_payouts(creator_wallet);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON royalty_payouts(status);

ALTER TABLE royalty_payouts ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert payout requests for themselves
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'payouts_insert_self'
  ) THEN
    CREATE POLICY payouts_insert_self ON royalty_payouts
      FOR INSERT
      TO authenticated
      WITH CHECK (creator_wallet = current_setting('request.jwt.claims', true)::jsonb->>'wallet_address');
  END IF;
END$$;

-- Authenticated users can select their own payouts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'payouts_select_self'
  ) THEN
    CREATE POLICY payouts_select_self ON royalty_payouts
      FOR SELECT
      TO authenticated
      USING (creator_wallet = current_setting('request.jwt.claims', true)::jsonb->>'wallet_address');
  END IF;
END$$;

-- Authenticated users can update their own payouts only if pending (e.g., cancel)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'payouts_update_self_pending'
  ) THEN
    CREATE POLICY payouts_update_self_pending ON royalty_payouts
      FOR UPDATE
      TO authenticated
      USING (creator_wallet = current_setting('request.jwt.claims', true)::jsonb->>'wallet_address' AND status = 'pending');
  END IF;
END$$;
