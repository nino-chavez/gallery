/**
 * Timeline Metadata View - FIXED VERSION
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
 * FIX: Removed correlated subqueries that caused "ungrouped column" errors
 * Instead: Use direct aggregation in the main query
 */

DROP MATERIALIZED VIEW IF EXISTS timeline_months_mv CASCADE;

CREATE MATERIALIZED VIEW timeline_months_mv AS
SELECT
  month_start,
  year,
  month,
  photo_count,

  -- Sport counts as JSONB (aggregated from the grouped data)
  jsonb_object_agg(
    COALESCE(sport_type, 'unknown'),
    sport_count
  ) FILTER (WHERE sport_type IS NOT NULL OR sport_count > 0) AS sport_counts,

  -- Category counts as JSONB (aggregated from the grouped data)
  jsonb_object_agg(
    COALESCE(photo_category, 'unknown'),
    category_count
  ) FILTER (WHERE photo_category IS NOT NULL OR category_count > 0) AS category_counts,

  first_photo_date,
  last_photo_date,
  avg_sharpness,
  avg_composition_score,
  high_quality_count

FROM (
  SELECT
    DATE_TRUNC('month', upload_date) AS month_start,
    EXTRACT(YEAR FROM upload_date)::INTEGER AS year,
    EXTRACT(MONTH FROM upload_date)::INTEGER AS month,

    -- Aggregate by sport within each month
    sport_type,
    COUNT(*) FILTER (WHERE sport_type IS NOT NULL) AS sport_count,

    -- Aggregate by category within each month
    photo_category,
    COUNT(*) FILTER (WHERE photo_category IS NOT NULL) AS category_count,

    -- Month-level aggregates
    COUNT(*) AS photo_count,
    MIN(upload_date) AS first_photo_date,
    MAX(upload_date) AS last_photo_date,
    ROUND(AVG(sharpness)::NUMERIC, 2) AS avg_sharpness,
    ROUND(AVG(composition_score)::NUMERIC, 2) AS avg_composition_score,
    COUNT(*) FILTER (WHERE composition_score >= 80) AS high_quality_count

  FROM photo_metadata
  WHERE sharpness IS NOT NULL
  GROUP BY
    DATE_TRUNC('month', upload_date),
    EXTRACT(YEAR FROM upload_date),
    EXTRACT(MONTH FROM upload_date),
    sport_type,
    photo_category
) subquery
GROUP BY
  month_start,
  year,
  month,
  photo_count,
  first_photo_date,
  last_photo_date,
  avg_sharpness,
  avg_composition_score,
  high_quality_count;

-- Create indexes on materialized view for fast lookups
CREATE INDEX idx_timeline_months_mv_year_month ON timeline_months_mv(year DESC, month DESC);
CREATE INDEX idx_timeline_months_mv_month_start ON timeline_months_mv(month_start DESC);

-- Function to refresh materialized view (call after bulk uploads)
CREATE OR REPLACE FUNCTION refresh_timeline_months()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY timeline_months_mv;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON MATERIALIZED VIEW timeline_months_mv IS 'Pre-computed timeline metadata with sport/category breakdowns per month';


-- Example queries using the view:

-- 1. Get all available months with counts (for scrubber)
-- SELECT year, month, photo_count FROM timeline_months_mv;

-- 2. Get first 6 months with sport breakdowns (for timeline page load)
-- SELECT
--   year,
--   month,
--   photo_count,
--   sport_counts,
--   category_counts
-- FROM timeline_months_mv
-- ORDER BY year DESC, month DESC
-- LIMIT 6;

-- 3. Get months filtered by sport
-- SELECT
--   year,
--   month,
--   (sport_counts->>'volleyball')::INTEGER as volleyball_count
-- FROM timeline_months_mv
-- WHERE sport_counts ? 'volleyball'  -- Has volleyball photos
-- ORDER BY year DESC, month DESC;

-- 4. Get total photos per year (for year selector)
-- SELECT
--   year,
--   SUM(photo_count) as total_photos
-- FROM timeline_months_mv
-- GROUP BY year
-- ORDER BY year DESC;

-- 5. Check if specific month has photos matching filters
-- SELECT
--   photo_count,
--   (sport_counts->>'volleyball')::INTEGER as volleyball_count,
--   (category_counts->>'action')::INTEGER as action_count
-- FROM timeline_months_mv
-- WHERE year = 2024 AND month = 10;
