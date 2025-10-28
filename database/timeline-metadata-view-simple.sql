/**
 * Timeline Metadata View - SIMPLIFIED VERSION
 *
 * PURPOSE: Pre-compute timeline structure (year/month with photo counts)
 *
 * APPROACH: Simple aggregation first, then add sport/category counts separately
 *
 * STEP 1: Create basic timeline view
 * STEP 2: Query sport/category counts dynamically (fast with proper indexes)
 */

-- Drop existing if any
DROP MATERIALIZED VIEW IF EXISTS timeline_months_mv CASCADE;

-- Create materialized view with basic month aggregations
CREATE MATERIALIZED VIEW timeline_months_mv AS
SELECT
  DATE_TRUNC('month', upload_date) AS month_start,
  EXTRACT(YEAR FROM DATE_TRUNC('month', upload_date))::INTEGER AS year,
  EXTRACT(MONTH FROM DATE_TRUNC('month', upload_date))::INTEGER AS month,
  COUNT(*) AS photo_count,
  MIN(upload_date) AS first_photo_date,
  MAX(upload_date) AS last_photo_date,
  ROUND(AVG(sharpness)::NUMERIC, 2) AS avg_sharpness,
  ROUND(AVG(composition_score)::NUMERIC, 2) AS avg_composition_score,
  COUNT(*) FILTER (WHERE composition_score >= 80) AS high_quality_count
FROM photo_metadata
WHERE sharpness IS NOT NULL
GROUP BY DATE_TRUNC('month', upload_date);

-- Create indexes for fast lookups
CREATE INDEX idx_timeline_months_mv_year_month ON timeline_months_mv(year DESC, month DESC);
CREATE INDEX idx_timeline_months_mv_month_start ON timeline_months_mv(month_start DESC);

-- Add comment
COMMENT ON MATERIALIZED VIEW timeline_months_mv IS 'Pre-computed timeline metadata: photo counts per month';

-- Function to refresh materialized view (call after bulk uploads)
CREATE OR REPLACE FUNCTION refresh_timeline_months()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW timeline_months_mv;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- HELPER VIEW: Sport counts per month (queryable separately if needed)
-- ============================================================================

DROP VIEW IF EXISTS timeline_month_sports CASCADE;

CREATE VIEW timeline_month_sports AS
SELECT
  DATE_TRUNC('month', upload_date) AS month_start,
  EXTRACT(YEAR FROM DATE_TRUNC('month', upload_date))::INTEGER AS year,
  EXTRACT(MONTH FROM DATE_TRUNC('month', upload_date))::INTEGER AS month,
  COALESCE(sport_type, 'unknown') AS sport_type,
  COUNT(*) AS photo_count
FROM photo_metadata
WHERE sharpness IS NOT NULL
GROUP BY DATE_TRUNC('month', upload_date), sport_type;

COMMENT ON VIEW timeline_month_sports IS 'Sport distribution per month (join with timeline_months_mv if needed)';


-- ============================================================================
-- HELPER VIEW: Category counts per month (queryable separately if needed)
-- ============================================================================

DROP VIEW IF EXISTS timeline_month_categories CASCADE;

CREATE VIEW timeline_month_categories AS
SELECT
  DATE_TRUNC('month', upload_date) AS month_start,
  EXTRACT(YEAR FROM DATE_TRUNC('month', upload_date))::INTEGER AS year,
  EXTRACT(MONTH FROM DATE_TRUNC('month', upload_date))::INTEGER AS month,
  COALESCE(photo_category, 'unknown') AS photo_category,
  COUNT(*) AS photo_count
FROM photo_metadata
WHERE sharpness IS NOT NULL
GROUP BY DATE_TRUNC('month', upload_date), photo_category;

COMMENT ON VIEW timeline_month_categories IS 'Category distribution per month (join with timeline_months_mv if needed)';


-- ============================================================================
-- EXAMPLE QUERIES
-- ============================================================================

-- 1. Get all available months with counts (for horizontal timeline)
-- SELECT year, month, photo_count
-- FROM timeline_months_mv
-- ORDER BY year DESC, month DESC;

-- 2. Get total photos per year (for year bars)
-- SELECT
--   year,
--   SUM(photo_count) as total_photos
-- FROM timeline_months_mv
-- GROUP BY year
-- ORDER BY year DESC;

-- 3. Get first 6 months for initial page load
-- SELECT *
-- FROM timeline_months_mv
-- ORDER BY year DESC, month DESC
-- LIMIT 6;

-- 4. Get sport breakdown for a specific month (if needed)
-- SELECT
--   tm.year,
--   tm.month,
--   tm.photo_count AS total_photos,
--   jsonb_object_agg(tms.sport_type, tms.photo_count) AS sport_counts
-- FROM timeline_months_mv tm
-- LEFT JOIN timeline_month_sports tms ON tm.month_start = tms.month_start
-- WHERE tm.year = 2024 AND tm.month = 10
-- GROUP BY tm.year, tm.month, tm.photo_count;

-- 5. Get category breakdown for a specific month (if needed)
-- SELECT
--   tm.year,
--   tm.month,
--   tm.photo_count AS total_photos,
--   jsonb_object_agg(tmc.photo_category, tmc.photo_count) AS category_counts
-- FROM timeline_months_mv tm
-- LEFT JOIN timeline_month_categories tmc ON tm.month_start = tmc.month_start
-- WHERE tm.year = 2024 AND tm.month = 10
-- GROUP BY tm.year, tm.month, tm.photo_count;


-- ============================================================================
-- REFRESH THE VIEW (run once after creating)
-- ============================================================================

REFRESH MATERIALIZED VIEW timeline_months_mv;
