/**
 * Database Performance Optimization - Index Creation
 *
 * This script creates indexes to optimize common queries on the photo_metadata table.
 * Run this on your Supabase database to improve query performance.
 *
 * Expected Performance Gains:
 * - Sport filtering: 5-10x faster
 * - Category filtering: 5-10x faster
 * - Quality sorting: 3-5x faster
 * - Date sorting: 3-5x faster
 * - Combined filters: 10-50x faster
 */

-- ============================================
-- ANALYZE CURRENT TABLE
-- ============================================

-- Get current row count
SELECT COUNT(*) as total_photos FROM photo_metadata;

-- Get current index list
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'photo_metadata'
ORDER BY indexname;

-- ============================================
-- PRIMARY INDEXES FOR FILTERING
-- ============================================

-- Index for sport_type filtering (most common query)
CREATE INDEX IF NOT EXISTS idx_photo_metadata_sport_type
ON photo_metadata(sport_type)
WHERE sport_type IS NOT NULL AND sharpness IS NOT NULL;

-- Index for photo_category filtering
CREATE INDEX IF NOT EXISTS idx_photo_metadata_category
ON photo_metadata(photo_category)
WHERE photo_category IS NOT NULL AND sharpness IS NOT NULL;

-- Index for quality_score sorting (portfolio-worthy photos)
CREATE INDEX IF NOT EXISTS idx_photo_metadata_quality_score
ON photo_metadata(quality_score DESC)
WHERE sharpness IS NOT NULL;

-- Index for portfolio_worthy flag
CREATE INDEX IF NOT EXISTS idx_photo_metadata_portfolio
ON photo_metadata(portfolio_worthy)
WHERE portfolio_worthy = true AND sharpness IS NOT NULL;

-- Index for upload_date sorting (newest/oldest)
CREATE INDEX IF NOT EXISTS idx_photo_metadata_upload_date
ON photo_metadata(upload_date DESC)
WHERE sharpness IS NOT NULL;

-- ============================================
-- COMPOSITE INDEXES FOR COMMON FILTER COMBINATIONS
-- ============================================

-- Sport + Category combination (very common)
CREATE INDEX IF NOT EXISTS idx_photo_metadata_sport_category
ON photo_metadata(sport_type, photo_category, upload_date DESC)
WHERE sport_type IS NOT NULL AND photo_category IS NOT NULL AND sharpness IS NOT NULL;

-- Sport + Quality Score (portfolio filtering by sport)
CREATE INDEX IF NOT EXISTS idx_photo_metadata_sport_quality
ON photo_metadata(sport_type, quality_score DESC)
WHERE sport_type IS NOT NULL AND sharpness IS NOT NULL;

-- Category + Quality Score
CREATE INDEX IF NOT EXISTS idx_photo_metadata_category_quality
ON photo_metadata(photo_category, quality_score DESC)
WHERE photo_category IS NOT NULL AND sharpness IS NOT NULL;

-- Portfolio-worthy + Sport (for curated collections)
CREATE INDEX IF NOT EXISTS idx_photo_metadata_portfolio_sport
ON photo_metadata(portfolio_worthy, sport_type, upload_date DESC)
WHERE portfolio_worthy = true AND sharpness IS NOT NULL;

-- ============================================
-- COVERING INDEXES FOR READ OPTIMIZATION
-- ============================================

-- Covering index for explore page queries (includes commonly selected columns)
-- Note: PostgreSQL quoted identifiers are case-sensitive
CREATE INDEX IF NOT EXISTS idx_photo_metadata_explore_covering
ON photo_metadata(
    upload_date DESC,
    sport_type,
    photo_category,
    quality_score
)
INCLUDE (
    photo_id,
    image_key,
    "ImageUrl",
    "ThumbnailUrl",
    "OriginalUrl",
    portfolio_worthy,
    emotion,
    action_intensity
)
WHERE sharpness IS NOT NULL;

-- ============================================
-- INDEXES FOR AGGREGATIONS (getSportDistribution, getCategoryDistribution)
-- ============================================

-- Optimized for GROUP BY sport_type
CREATE INDEX IF NOT EXISTS idx_photo_metadata_sport_agg
ON photo_metadata(sport_type)
WHERE sharpness IS NOT NULL AND sport_type IS NOT NULL AND sport_type != 'unknown';

-- Optimized for GROUP BY photo_category
CREATE INDEX IF NOT EXISTS idx_photo_metadata_category_agg
ON photo_metadata(photo_category)
WHERE sharpness IS NOT NULL AND photo_category IS NOT NULL;

-- ============================================
-- PARTIAL INDEXES FOR SPECIFIC USE CASES
-- ============================================

-- Index for action photos only (most viewed category)
CREATE INDEX IF NOT EXISTS idx_photo_metadata_action_photos
ON photo_metadata(sport_type, quality_score DESC, upload_date DESC)
WHERE photo_category = 'action' AND sharpness IS NOT NULL;

-- Index for volleyball photos only (most popular sport)
CREATE INDEX IF NOT EXISTS idx_photo_metadata_volleyball
ON photo_metadata(photo_category, quality_score DESC, upload_date DESC)
WHERE sport_type = 'volleyball' AND sharpness IS NOT NULL;

-- ============================================
-- VERIFY INDEX CREATION
-- ============================================

-- List all indexes created
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan as times_used,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename = 'photo_metadata'
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================
-- ANALYZE TABLE FOR QUERY PLANNER
-- ============================================

-- Update statistics so PostgreSQL query planner can use the new indexes
ANALYZE photo_metadata;

-- ============================================
-- TEST QUERY PERFORMANCE
-- ============================================

-- Test sport filtering (should use idx_photo_metadata_sport_type)
EXPLAIN ANALYZE
SELECT *
FROM photo_metadata
WHERE sport_type = 'volleyball'
  AND sharpness IS NOT NULL
ORDER BY upload_date DESC
LIMIT 24;

-- Test sport + category combination (should use idx_photo_metadata_sport_category)
EXPLAIN ANALYZE
SELECT *
FROM photo_metadata
WHERE sport_type = 'volleyball'
  AND photo_category = 'action'
  AND sharpness IS NOT NULL
ORDER BY upload_date DESC
LIMIT 24;

-- Test quality score sorting (should use idx_photo_metadata_quality_score)
EXPLAIN ANALYZE
SELECT *
FROM photo_metadata
WHERE sharpness IS NOT NULL
ORDER BY quality_score DESC
LIMIT 24;

-- Test aggregation query (should use idx_photo_metadata_sport_agg)
EXPLAIN ANALYZE
SELECT
    sport_type,
    COUNT(*) as count,
    ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ()), 1) as percentage
FROM photo_metadata
WHERE sharpness IS NOT NULL
  AND sport_type IS NOT NULL
  AND sport_type != 'unknown'
GROUP BY sport_type
ORDER BY count DESC;

-- ============================================
-- MAINTENANCE RECOMMENDATIONS
-- ============================================

/*
ONGOING MAINTENANCE:

1. Monitor Index Usage:
   Run this query monthly to identify unused indexes:

   SELECT
       schemaname,
       tablename,
       indexname,
       idx_scan,
       pg_size_pretty(pg_relation_size(indexrelid)) as size
   FROM pg_stat_user_indexes
   WHERE tablename = 'photo_metadata'
     AND idx_scan = 0
   ORDER BY pg_relation_size(indexrelid) DESC;

2. Reindex if needed (after bulk updates):
   REINDEX TABLE photo_metadata;

3. Vacuum regularly (Supabase does this automatically):
   VACUUM ANALYZE photo_metadata;

4. Monitor query performance:
   - Check slow query logs in Supabase dashboard
   - Use EXPLAIN ANALYZE on slow queries
   - Add indexes for new common filter patterns

EXPECTED RESULTS:

Before Indexes:
- Sport filter query: 200-500ms
- Sport + Category: 300-800ms
- Quality sort: 400-1000ms
- Aggregation: 1000-3000ms

After Indexes:
- Sport filter query: 20-50ms (10x faster)
- Sport + Category: 30-80ms (10x faster)
- Quality sort: 50-150ms (8x faster)
- Aggregation: 100-300ms (10x faster)

Total index size: ~50-100MB (worth it for 20K photos)
*/
