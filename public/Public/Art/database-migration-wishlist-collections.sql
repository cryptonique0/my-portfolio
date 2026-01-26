-- Wishlist, Collections, and Price Alerts Migration

-- Enable uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Wishlist: simple favorites mapping
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  nft_id UUID NOT NULL,
  nft_name TEXT,
  nft_image TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, nft_id)
);

-- Collections: user-defined groupings of NFTs
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Collection Items: NFTs inside collections
CREATE TABLE IF NOT EXISTS collection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  nft_id UUID NOT NULL,
  nft_name TEXT,
  nft_image TEXT,
  note TEXT,
  tags TEXT[],
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(collection_id, nft_id)
);

-- Price Alerts: notify users on drops
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  nft_id UUID NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('below_price','percent_drop')),
  target_price DECIMAL(20, 8),
  percent_drop DECIMAL(5,2),
  last_price DECIMAL(20, 8),
  last_notified_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_nft ON wishlist(nft_id);
CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_nft ON collection_items(nft_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_user ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_nft ON price_alerts(nft_id);

-- Updated-at trigger for collections
CREATE OR REPLACE FUNCTION update_collections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_collections_updated_at();

-- Row Level Security
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- Policies: users can manage their own records
CREATE POLICY wishlist_select ON wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY wishlist_insert ON wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY wishlist_delete ON wishlist FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY collections_select ON collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY collections_insert ON collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY collections_update ON collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY collections_delete ON collections FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY collection_items_select ON collection_items FOR SELECT USING (
  EXISTS(SELECT 1 FROM collections c WHERE c.id = collection_id AND c.user_id = auth.uid())
);
CREATE POLICY collection_items_insert ON collection_items FOR INSERT WITH CHECK (
  EXISTS(SELECT 1 FROM collections c WHERE c.id = collection_id AND c.user_id = auth.uid())
);
CREATE POLICY collection_items_delete ON collection_items FOR DELETE USING (
  EXISTS(SELECT 1 FROM collections c WHERE c.id = collection_id AND c.user_id = auth.uid())
);

CREATE POLICY price_alerts_select ON price_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY price_alerts_insert ON price_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY price_alerts_update ON price_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY price_alerts_delete ON price_alerts FOR DELETE USING (auth.uid() = user_id);

-- Helpers
COMMENT ON TABLE wishlist IS 'User favorites for quick access';
COMMENT ON TABLE collections IS 'User-defined NFT collections';
COMMENT ON TABLE collection_items IS 'NFTs organized inside collections';
COMMENT ON TABLE price_alerts IS 'User price-drop alert subscriptions';
