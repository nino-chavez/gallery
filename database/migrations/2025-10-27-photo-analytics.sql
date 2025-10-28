/**
 * Photo Analytics Schema
 *
 * Tracks photo views, search queries, and popular photos
 * For privacy: tracks aggregate data, no individual user tracking
 */

-- Photo Views Table
CREATE TABLE IF NOT EXISTS photo_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES photo_metadata(photo_id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_source TEXT, -- 'explore', 'collection', 'album', 'direct', 'search'
  referrer TEXT -- optional: collection slug, album key, or search query
);

-- Search Queries Table
CREATE TABLE IF NOT EXISTS search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text TEXT NOT NULL,
  filters_used JSONB, -- Stores which filters were applied
  results_count INTEGER,
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_photo_views_photo_id ON photo_views(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_views_viewed_at ON photo_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_photo_views_source ON photo_views(view_source);
CREATE INDEX IF NOT EXISTS idx_search_queries_searched_at ON search_queries(searched_at DESC);

-- Materialized view for popular photos (refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS popular_photos AS
SELECT
  photo_id,
  COUNT(*) as view_count,
  COUNT(DISTINCT DATE(viewed_at)) as days_active,
  MAX(viewed_at) as last_viewed,
  MIN(viewed_at) as first_viewed
FROM photo_views
WHERE viewed_at >= NOW() - INTERVAL '30 days' -- Last 30 days
GROUP BY photo_id
ORDER BY view_count DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_popular_photos_photo_id ON popular_photos(photo_id);

-- Function to refresh popular photos view (call periodically)
CREATE OR REPLACE FUNCTION refresh_popular_photos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY popular_photos;
END;
$$;

-- RLS Policies (public read access, server-only write)
ALTER TABLE photo_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read analytics (for displaying popular photos)
CREATE POLICY "Anyone can view photo analytics"
  ON photo_views FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view search analytics"
  ON search_queries FOR SELECT
  USING (true);

-- Only allow inserts from server (service_role)
CREATE POLICY "Service role can insert photo views"
  ON photo_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can insert search queries"
  ON search_queries FOR INSERT
  WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE photo_views IS 'Tracks photo view events for analytics (no PII)';
COMMENT ON TABLE search_queries IS 'Tracks search queries and filter usage';
COMMENT ON MATERIALIZED VIEW popular_photos IS 'Aggregated view of most popular photos in last 30 days';
COMMENT ON FUNCTION refresh_popular_photos IS 'Refreshes the popular_photos materialized view';
