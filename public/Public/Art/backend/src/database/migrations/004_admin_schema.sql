/**
 * Admin Schema Migration
 * Adds tables for moderation, bans, suspensions, and admin actions
 */

-- ========== ADMIN ACTIONS TABLE ==========
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- ban, suspend, unban, unsuspend, delete_nft, warning, update_settings
  target_type VARCHAR(50) NOT NULL, -- user, nft, collection, transaction
  target_id VARCHAR(255) NOT NULL,
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX idx_admin_actions_action_type ON admin_actions(action_type);
CREATE INDEX idx_admin_actions_target_id ON admin_actions(target_id);
CREATE INDEX idx_admin_actions_created_at ON admin_actions(created_at DESC);

ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all actions" ON admin_actions FOR SELECT USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);
CREATE POLICY "Admins can insert actions" ON admin_actions FOR INSERT WITH CHECK (
  admin_id = auth.uid() AND EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

-- ========== USER BANS TABLE ==========
CREATE TABLE IF NOT EXISTS user_bans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  banned_by UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  permanent BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_expiry CHECK (permanent OR expires_at IS NOT NULL)
);

CREATE INDEX idx_user_bans_user_id ON user_bans(user_id);
CREATE INDEX idx_user_bans_active ON user_bans(active);
CREATE INDEX idx_user_bans_expires_at ON user_bans(expires_at);

ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage bans" ON user_bans FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);
CREATE POLICY "Users can view their own bans" ON user_bans FOR SELECT USING (user_id = auth.uid());

-- ========== USER SUSPENSIONS TABLE ==========
CREATE TABLE IF NOT EXISTS user_suspensions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suspended_by UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  duration_days INT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_suspensions_user_id ON user_suspensions(user_id);
CREATE INDEX idx_user_suspensions_active ON user_suspensions(active);
CREATE INDEX idx_user_suspensions_expires_at ON user_suspensions(expires_at);

ALTER TABLE user_suspensions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage suspensions" ON user_suspensions FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

-- ========== NFT MODERATION TABLE ==========
CREATE TABLE IF NOT EXISTS nft_moderation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nft_id UUID NOT NULL,
  flagged_by UUID REFERENCES auth.users(id),
  moderated_by UUID REFERENCES auth.users(id),
  reason VARCHAR(50) NOT NULL, -- spam, explicit, copyright, stolen, other
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, removed
  action_taken VARCHAR(50), -- none, warning, delisted, deleted
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_nft_moderation_nft_id ON nft_moderation(nft_id);
CREATE INDEX idx_nft_moderation_status ON nft_moderation(status);
CREATE INDEX idx_nft_moderation_created_at ON nft_moderation(created_at DESC);

ALTER TABLE nft_moderation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage moderation" ON nft_moderation FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);
CREATE POLICY "Users can view public moderation status" ON nft_moderation FOR SELECT USING (status != 'pending');

-- ========== ADMIN SETTINGS TABLE ==========
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_settings_key ON admin_settings(key);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage settings" ON admin_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

-- Trigger for updated_at
CREATE TRIGGER update_admin_actions_updated_at BEFORE UPDATE ON admin_actions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_bans_updated_at BEFORE UPDATE ON user_bans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_suspensions_updated_at BEFORE UPDATE ON user_suspensions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nft_moderation_updated_at BEFORE UPDATE ON nft_moderation
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
