-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL,
  event_data JSONB DEFAULT {},
  session_id VARCHAR(255),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  page_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);

-- Analytics Summary Table (for dashboard data)
CREATE TABLE IF NOT EXISTS analytics_summary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  metric_name VARCHAR(255) NOT NULL,
  metric_value NUMERIC,
  metric_data JSONB DEFAULT {},
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, metric_name)
);

-- Heatmap Data Table
CREATE TABLE IF NOT EXISTS heatmap_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url TEXT NOT NULL,
  x_position INTEGER,
  y_position INTEGER,
  click_count INTEGER DEFAULT 1,
  element_class TEXT,
  element_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_heatmap_page_url ON heatmap_data(page_url);
CREATE INDEX IF NOT EXISTS idx_heatmap_created_at ON heatmap_data(created_at);

-- Enable RLS on analytics tables
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE heatmap_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_events (authenticated users can read all, admins can write)
CREATE POLICY "Authenticated users can read analytics events"
ON analytics_events FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert analytics events"
ON analytics_events FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for analytics_summary (authenticated users can read)
CREATE POLICY "Authenticated users can read analytics summary"
ON analytics_summary FOR SELECT
USING (auth.role() = 'authenticated');

-- RLS Policies for heatmap_data (authenticated users can read)
CREATE POLICY "Authenticated users can read heatmap data"
ON heatmap_data FOR SELECT
USING (auth.role() = 'authenticated');
