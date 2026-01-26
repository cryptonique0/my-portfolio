-- ============================================================================
-- Profile Enhancements Database Migration
-- Run this script to add all required tables and columns
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Extend users table with profile fields
-- ============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS twitter TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS portfolio_value DECIMAL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_sales DECIMAL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_purchases DECIMAL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nfts_created INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nfts_owned INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;

-- ============================================================================
-- 2. Create achievements table
-- ============================================================================

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('trading', 'social', 'creation', 'collection', 'special')),
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'legendary')),
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. Create user_achievements junction table
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  progress INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

-- ============================================================================
-- 4. Create verification_requests table
-- ============================================================================

CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  request_type TEXT NOT NULL CHECK (request_type IN ('creator', 'influencer', 'business', 'developer')),
  social_proof TEXT[] DEFAULT '{}',
  portfolio_links TEXT[] DEFAULT '{}',
  reason TEXT NOT NULL,
  admin_notes TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by TEXT
);

-- ============================================================================
-- 5. Create portfolio_snapshots table
-- ============================================================================

CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  total_value DECIMAL NOT NULL,
  nfts_count INTEGER NOT NULL,
  snapshot_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. Create verification_revocations table
-- ============================================================================

CREATE TABLE IF NOT EXISTS verification_revocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  revoked_by TEXT NOT NULL,
  reason TEXT NOT NULL,
  revoked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_user ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_user ON portfolio_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_date ON portfolio_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_verification_revocations_user ON verification_revocations(user_id);

-- ============================================================================
-- 8. Create composite indexes for common queries
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_verified ON users(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_users_portfolio_value ON users(portfolio_value DESC);
CREATE INDEX IF NOT EXISTS idx_users_followers ON users(followers_count DESC);

COMMIT;

-- ============================================================================
-- Verification
-- ============================================================================

-- Verify all tables were created
SELECT 
  'achievements' as table_name, COUNT(*) as count FROM achievements
UNION ALL
SELECT 
  'user_achievements', COUNT(*) FROM user_achievements
UNION ALL
SELECT 
  'verification_requests', COUNT(*) FROM verification_requests
UNION ALL
SELECT 
  'portfolio_snapshots', COUNT(*) FROM portfolio_snapshots
UNION ALL
SELECT 
  'verification_revocations', COUNT(*) FROM verification_revocations;

-- ============================================================================
-- Notes:
-- - Run this script in your Supabase SQL editor or via psql
-- - All ALTER TABLE commands use IF NOT EXISTS to prevent errors on re-run
-- - Foreign keys have ON DELETE CASCADE for automatic cleanup
-- - Indexes improve query performance for common operations
-- ============================================================================
