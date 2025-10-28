/**
 * Timeline Metadata View
 *
 * PURPOSE: Pre-compute timeline structure for efficient page scaffolding
 *
 * SOLVES:
 * - Timeline page loading thousands of photos just to determine which months exist
 * - Scrubber needing year/month photo counts
 * - Infinite scroll needing next batch metadata
 * - Filter controls needing available options per time period
 *
 * PERFORMANCE:
 * - Aggregates ~20K photos into ~50-100 month records
 * - Can be materialized or refreshed periodically
 * - Enables sub-second timeline page loads
 *
 * USAGE:
 * - Timeline page: Load first N months, get total counts
 * - Scrubber: Get all year-month counts for visualization
 * - Filters: Get sport/category distributions per time period
 */

-- Drop existing view if it exists
DROP VIEW IF EXISTS timeline_months CASCADE;

-- Create view that aggregates photos by year-month
CREATE VIEW timeline_months AS
WITH monthly_base AS (
  SELECT
    DATE_TRUNC('month', upload_date) AS month_start,
    EXTRACT(YEAR FROM upload_date)::INTEGER AS year,
    EXTRACT(MONTH FROM upload_date)::INTEGER AS month,
    sport_type,
    photo_category,
    upload_date,
    sharpness,
    composition_score
  FROM photo_metadata
  WHERE sharpness IS NOT NULL
),
sport_agg AS (
  SELECT
    month_start,
    jsonb_object_agg(
      COALESCE(sport_type, 'unknown'),
      count
    ) AS sport_counts
  FROM (
    SELECT
      month_start,
      sport_type,
      COUNT(*) as count
    FROM monthly_base
    GROUP BY month_start, sport_type
  ) s
  GROUP BY month_start
),
category_agg AS (
  SELECT
    month_start,
    jsonb_object_agg(
      COALESCE(photo_category, 'unknown'),
      count
    ) AS category_counts
  FROM (
    SELECT
      month_start,
      photo_category,
      COUNT(*) as count
    FROM monthly_base
    GROUP BY month_start, photo_category
  ) c
  GROUP BY month_start
)
SELECT
  b.month_start,
  b.year,
  b.month,
  COUNT(*) AS photo_count,
  s.sport_counts,
  c.category_counts,
  MIN(b.upload_date) AS first_photo_date,
  MAX(b.upload_date) AS last_photo_date,
  ROUND(AVG(b.sharpness)::NUMERIC, 2) AS avg_sharpness,
  ROUND(AVG(b.composition_score)::NUMERIC, 2) AS avg_composition_score,
  COUNT(*) FILTER (WHERE b.composition_score >= 80) AS high_quality_count
FROM monthly_base b
LEFT JOIN sport_agg s ON b.month_start = s.month_start
LEFT JOIN category_agg c ON b.month_start = c.month_start
GROUP BY b.month_start, b.year, b.month, s.sport_counts, c.category_counts
ORDER BY b.year DESC, b.month DESC;


-- Create materialized view version for production (faster, needs refresh)
-- Uncomment when ready for production:

/*
DROP MATERIALIZED VIEW IF EXISTS timeline_months_mv CASCADE;

CREATE MATERIALIZED VIEW timeline_months_mv AS
SELECT
  DATE_TRUNC('month', upload_date) AS month_start,
  EXTRACT(YEAR FROM upload_date)::INTEGER AS year,
  EXTRACT(MONTH FROM upload_date)::INTEGER AS month,
  COUNT(*) AS photo_count,

  -- Pre-compute sport counts as JSONB
  (
    SELECT jsonb_object_agg(sport_type, count)
    FROM (
      SELECT
        COALESCE(sport_type, 'unknown') as sport_type,
        COUNT(*) as count
      FROM photo_metadata pm2
      WHERE DATE_TRUNC('month', pm2.upload_date) = DATE_TRUNC('month', pm.upload_date)
        AND pm2.sharpness IS NOT NULL
      GROUP BY sport_type
    ) s
  ) AS sport_counts,

  -- Pre-compute category counts as JSONB
  (
    SELECT jsonb_object_agg(photo_category, count)
    FROM (
      SELECT
        COALESCE(photo_category, 'unknown') as photo_category,
        COUNT(*) as count
      FROM photo_metadata pm2
      WHERE DATE_TRUNC('month', pm2.upload_date) = DATE_TRUNC('month', pm.upload_date)
        AND pm2.sharpness IS NOT NULL
      GROUP BY photo_category
    ) c
  ) AS category_counts,

  MIN(upload_date) AS first_photo_date,
  MAX(upload_date) AS last_photo_date,
  ROUND(AVG(sharpness)::NUMERIC, 2) AS avg_sharpness,
  ROUND(AVG(composition_score)::NUMERIC, 2) AS avg_composition_score,
  COUNT(*) FILTER (WHERE composition_score >= 80) AS high_quality_count

FROM photo_metadata pm
WHERE sharpness IS NOT NULL
GROUP BY DATE_TRUNC('month', upload_date), year, month;

-- Create index on materialized view for fast lookups
CREATE INDEX idx_timeline_months_mv_year_month ON timeline_months_mv(year DESC, month DESC);
CREATE INDEX idx_timeline_months_mv_month_start ON timeline_months_mv(month_start DESC);

-- Function to refresh materialized view (call after bulk uploads)
CREATE OR REPLACE FUNCTION refresh_timeline_months()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY timeline_months_mv;
END;
$$ LANGUAGE plpgsql;
*/


-- Example queries using the view:

-- 1. Get all available months with counts (for scrubber)
-- SELECT year, month, photo_count FROM timeline_months;

-- 2. Get first 6 months with sport breakdowns (for timeline page load)
-- SELECT
--   year,
--   month,
--   photo_count,
--   sport_counts,
--   category_counts
-- FROM timeline_months
-- LIMIT 6;

-- 3. Get months filtered by sport
-- SELECT
--   year,
--   month,
--   (sport_counts->>'volleyball')::INTEGER as volleyball_count
-- FROM timeline_months
-- WHERE sport_counts ? 'volleyball'  -- Has volleyball photos
-- ORDER BY year DESC, month DESC;

-- 4. Get total photos per year (for year selector)
-- SELECT
--   year,
--   SUM(photo_count) as total_photos
-- FROM timeline_months
-- GROUP BY year
-- ORDER BY year DESC;

-- 5. Check if specific month has photos matching filters
-- SELECT
--   photo_count,
--   (sport_counts->>'volleyball')::INTEGER as volleyball_count,
--   (category_counts->>'action')::INTEGER as action_count
-- FROM timeline_months
-- WHERE year = 2024 AND month = 10;
