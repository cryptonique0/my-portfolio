/**
 * Analytics Schema Migration for BitArt Market
 * Adds tables for real-time dashboard metrics and historical analytics
 * 
 * Run this after 001_initial_schema.sql
 */

-- ========== REALTIME EVENTS TABLE ==========
CREATE TABLE IF NOT EXISTS realtime_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  nft_id UUID REFERENCES nfts(id) ON DELETE SET NULL,
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  action VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_realtime_events_type ON realtime_events(event_type);
CREATE INDEX idx_realtime_events_user ON realtime_events(user_id);
CREATE INDEX idx_realtime_events_nft ON realtime_events(nft_id);
CREATE INDEX idx_realtime_events_created ON realtime_events(created_at DESC);

-- ========== DASHBOARD METRICS TABLE ==========
CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_date DATE NOT NULL,
  total_volume DECIMAL(18, 8) DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  total_nfts_sold INTEGER DEFAULT 0,
  average_price DECIMAL(18, 8) DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  new_collections INTEGER DEFAULT 0,
  top_collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  top_creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(metric_date)
);

CREATE INDEX idx_metrics_date ON dashboard_metrics(metric_date DESC);

-- ========== HOURLY METRICS TABLE ==========
CREATE TABLE IF NOT EXISTS hourly_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_hour TIMESTAMP WITH TIME ZONE NOT NULL,
  volume DECIMAL(18, 8) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  listed_nfts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(metric_hour)
);

CREATE INDEX idx_hourly_metrics_time ON hourly_metrics(metric_hour DESC);

-- ========== DAILY TRENDING TABLE ==========
CREATE TABLE IF NOT EXISTS daily_trending (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trend_date DATE NOT NULL,
  entity_id UUID NOT NULL,
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('collection', 'user', 'nft')),
  rank INTEGER NOT NULL,
  trend_score DECIMAL(10, 2) DEFAULT 0,
  change_percent DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trend_date, entity_id, entity_type)
);

CREATE INDEX idx_trending_date ON daily_trending(trend_date DESC);
CREATE INDEX idx_trending_entity ON daily_trending(entity_id, entity_type);

-- ========== SEARCH ANALYTICS TABLE ==========
CREATE TABLE IF NOT EXISTS search_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  search_query VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  result_count INTEGER,
  clicked_result_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_search_query ON search_analytics(search_query);
CREATE INDEX idx_search_user ON search_analytics(user_id);
CREATE INDEX idx_search_created ON search_analytics(created_at DESC);

-- ========== USER ACTIVITY STATS TABLE ==========
CREATE TABLE IF NOT EXISTS user_activity_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  total_purchases INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_volume_purchased DECIMAL(18, 8) DEFAULT 0,
  total_volume_sold DECIMAL(18, 8) DEFAULT 0,
  total_created_nfts INTEGER DEFAULT 0,
  total_collections_created INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_activity_stats ON user_activity_stats(user_id);

-- ========== ROI TRACKING TABLE ==========
CREATE TABLE IF NOT EXISTS roi_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nft_id UUID NOT NULL REFERENCES nfts(id) ON DELETE CASCADE,
  purchase_price DECIMAL(18, 8) NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
  current_price DECIMAL(18, 8),
  roi_percent DECIMAL(10, 2),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, nft_id)
);

CREATE INDEX idx_roi_user ON roi_tracking(user_id);
CREATE INDEX idx_roi_nft ON roi_tracking(nft_id);
CREATE INDEX idx_roi_percent ON roi_tracking(roi_percent DESC);

-- ========== CHART DATA CACHE TABLE ==========
CREATE TABLE IF NOT EXISTS chart_data_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chart_type VARCHAR(50) NOT NULL,
  time_range VARCHAR(20) NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(chart_type, time_range)
);

CREATE INDEX idx_cache_expires ON chart_data_cache(expires_at);

-- ========== LEADERBOARD TABLE ==========
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  leaderboard_type VARCHAR(50) NOT NULL CHECK (leaderboard_type IN ('volume', 'creators', 'collectors', 'trending')),
  rank INTEGER NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  score DECIMAL(18, 8) NOT NULL,
  period VARCHAR(20) DEFAULT 'all-time' CHECK (period IN ('daily', 'weekly', 'monthly', 'all-time')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_type ON leaderboards(leaderboard_type, period);
CREATE INDEX idx_leaderboard_user ON leaderboards(user_id);
CREATE INDEX idx_leaderboard_collection ON leaderboards(collection_id);
CREATE INDEX idx_leaderboard_score ON leaderboards(score DESC);

-- ========== ENABLE RLS POLICIES ==========

-- Realtime events are read-only for most users
ALTER TABLE realtime_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view realtime events" ON realtime_events FOR SELECT USING (true);
CREATE POLICY "Service role can insert events" ON realtime_events FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Dashboard metrics are public
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view dashboard metrics" ON dashboard_metrics FOR SELECT USING (true);

-- Hourly metrics are public
ALTER TABLE hourly_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view hourly metrics" ON hourly_metrics FOR SELECT USING (true);

-- Daily trending is public
ALTER TABLE daily_trending ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view trending" ON daily_trending FOR SELECT USING (true);

-- Search analytics - user can only see their own
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own searches" ON search_analytics FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Service role can insert searches" ON search_analytics FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- User activity stats
ALTER TABLE user_activity_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view user activity stats" ON user_activity_stats FOR SELECT USING (true);

-- ROI tracking - user can only see their own
ALTER TABLE roi_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own ROI" ON roi_tracking FOR SELECT USING (auth.uid() = user_id);

-- Cache is public
ALTER TABLE chart_data_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view cache" ON chart_data_cache FOR SELECT USING (true);

-- Leaderboards are public
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view leaderboards" ON leaderboards FOR SELECT USING (true);

-- ========== SAMPLE DATA (Optional - for testing) ==========

-- Insert sample dashboard metric for today
INSERT INTO dashboard_metrics (metric_date, total_volume, total_transactions, total_nfts_sold, average_price, total_users, active_users, new_collections)
VALUES (CURRENT_DATE, 450000.50000000, 1250, 3400, 132.35294118, 2500, 680, 45)
ON CONFLICT (metric_date) DO NOTHING;

-- Insert sample hourly metrics for last 24 hours
DO $$
DECLARE
  i INT;
  sample_hour TIMESTAMP WITH TIME ZONE;
BEGIN
  FOR i IN 0..23 LOOP
    sample_hour := NOW() - (i || ' hours')::INTERVAL;
    INSERT INTO hourly_metrics (metric_hour, volume, transaction_count, active_users, listed_nfts)
    VALUES (
      date_trunc('hour', sample_hour),
      (RANDOM() * 50000)::DECIMAL(18, 8),
      (RANDOM() * 100)::INTEGER,
      (RANDOM() * 100)::INTEGER,
      (RANDOM() * 200)::INTEGER
    )
    ON CONFLICT (metric_hour) DO NOTHING;
  END LOOP;
END $$;

-- Insert sample chart cache
INSERT INTO chart_data_cache (chart_type, time_range, data, expires_at)
VALUES (
  'volume',
  'weekly',
  '{"labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "data": [45000, 52000, 48000, 61000, 55000, 72000, 68000]}'::JSONB,
  NOW() + INTERVAL '1 hour'
)
ON CONFLICT (chart_type, time_range) DO NOTHING;

INSERT INTO chart_data_cache (chart_type, time_range, data, expires_at)
VALUES (
  'transactions',
  'weekly',
  '{"labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "data": [120, 145, 132, 168, 155, 192, 178]}'::JSONB,
  NOW() + INTERVAL '1 hour'
)
ON CONFLICT (chart_type, time_range) DO NOTHING;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables that need updated_at
CREATE TRIGGER update_dashboard_metrics_updated_at BEFORE UPDATE ON dashboard_metrics
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hourly_metrics_updated_at BEFORE UPDATE ON hourly_metrics
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_activity_stats_updated_at BEFORE UPDATE ON user_activity_stats
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roi_tracking_updated_at BEFORE UPDATE ON roi_tracking
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboards_updated_at BEFORE UPDATE ON leaderboards
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========== MIGRATION COMPLETE ==========
-- This migration adds comprehensive analytics tracking
-- Tables: realtime_events, dashboard_metrics, hourly_metrics, daily_trending, search_analytics, user_activity_stats, roi_tracking, chart_data_cache, leaderboards
