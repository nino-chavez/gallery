/**
 * Database Performance Optimization - Simplified Index Creation
 *
 * This is a simplified version that focuses on index creation only.
 * No verification queries - just the essential indexes.
 *
 * Safe to run multiple times (uses IF NOT EXISTS)
 */

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

-- Index for quality_score sorting
CREATE INDEX IF NOT EXISTS idx_photo_metadata_quality_score
ON photo_metadata(quality_score DESC)
WHERE sharpness IS NOT NULL;

-- Index for portfolio_worthy flag
CREATE INDEX IF NOT EXISTS idx_photo_metadata_portfolio
ON photo_metadata(portfolio_worthy)
WHERE portfolio_worthy = true AND sharpness IS NOT NULL;

-- Index for upload_date sorting
CREATE INDEX IF NOT EXISTS idx_photo_metadata_upload_date
ON photo_metadata(upload_date DESC)
WHERE sharpness IS NOT NULL;

-- ============================================
-- COMPOSITE INDEXES FOR COMMON COMBINATIONS
-- ============================================

-- Sport + Category (MOST IMPORTANT - very common)
CREATE INDEX IF NOT EXISTS idx_photo_metadata_sport_category
ON photo_metadata(sport_type, photo_category, upload_date DESC)
WHERE sport_type IS NOT NULL AND photo_category IS NOT NULL AND sharpness IS NOT NULL;

-- Sport + Quality Score
CREATE INDEX IF NOT EXISTS idx_photo_metadata_sport_quality
ON photo_metadata(sport_type, quality_score DESC)
WHERE sport_type IS NOT NULL AND sharpness IS NOT NULL;

-- Category + Quality Score
CREATE INDEX IF NOT EXISTS idx_photo_metadata_category_quality
ON photo_metadata(photo_category, quality_score DESC)
WHERE photo_category IS NOT NULL AND sharpness IS NOT NULL;

-- Portfolio + Sport
CREATE INDEX IF NOT EXISTS idx_photo_metadata_portfolio_sport
ON photo_metadata(portfolio_worthy, sport_type, upload_date DESC)
WHERE portfolio_worthy = true AND sharpness IS NOT NULL;

-- ============================================
-- AGGREGATION INDEXES
-- ============================================

-- For getSportDistribution()
CREATE INDEX IF NOT EXISTS idx_photo_metadata_sport_agg
ON photo_metadata(sport_type)
WHERE sharpness IS NOT NULL AND sport_type IS NOT NULL AND sport_type != 'unknown';

-- For getCategoryDistribution()
CREATE INDEX IF NOT EXISTS idx_photo_metadata_category_agg
ON photo_metadata(photo_category)
WHERE sharpness IS NOT NULL AND photo_category IS NOT NULL;

-- ============================================
-- PARTIAL INDEXES FOR HOT PATHS
-- ============================================

-- Action photos only (most viewed category)
CREATE INDEX IF NOT EXISTS idx_photo_metadata_action_photos
ON photo_metadata(sport_type, quality_score DESC, upload_date DESC)
WHERE photo_category = 'action' AND sharpness IS NOT NULL;

-- Volleyball photos only (most popular sport)
CREATE INDEX IF NOT EXISTS idx_photo_metadata_volleyball
ON photo_metadata(photo_category, quality_score DESC, upload_date DESC)
WHERE sport_type = 'volleyball' AND sharpness IS NOT NULL;

-- ============================================
-- UPDATE STATISTICS
-- ============================================

-- Critical: Update table statistics so query planner uses new indexes
ANALYZE photo_metadata;

-- ============================================
-- DONE!
-- ============================================

-- Verify indexes were created:
SELECT COUNT(*) as total_indexes_created
FROM pg_indexes
WHERE tablename = 'photo_metadata'
  AND schemaname = 'public'
  AND indexname LIKE 'idx_photo_metadata%';

-- Success message
SELECT '✓ All indexes created successfully!' as status;
