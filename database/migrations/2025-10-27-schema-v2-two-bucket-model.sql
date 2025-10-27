/**
 * Database Migration: Schema v2.0 - Two-Bucket Model
 *
 * Date: 2025-10-27
 * Purpose: Modernize schema to align with two-bucket metadata model
 *
 * BUCKET 1: Concrete & Filterable (user-facing search filters)
 * BUCKET 2: Abstract & Internal (AI story detection only)
 *
 * Changes:
 * - Add 6 new columns (lighting, color_temperature, time_in_game, athlete_id, event_id, ai_confidence)
 * - Remove 5 obsolete columns (portfolio_worthy, print_ready, social_media_optimized, quality_score, use_cases)
 * - Update indexes (remove obsolete, add new)
 *
 * IMPORTANT: Run backup before executing this migration!
 */

-- ============================================
-- PHASE 1: BACKUP CURRENT TABLE
-- ============================================

-- Create backup table with timestamp
CREATE TABLE IF NOT EXISTS photo_metadata_backup_20251027 AS
SELECT * FROM photo_metadata;

-- Verify backup
SELECT COUNT(*) as backup_count FROM photo_metadata_backup_20251027;
SELECT COUNT(*) as current_count FROM photo_metadata;

-- ============================================
-- PHASE 2: ADD NEW COLUMNS (Bucket 1 & 2)
-- ============================================

-- Bucket 1: User-facing aesthetic filters
ALTER TABLE photo_metadata
  ADD COLUMN IF NOT EXISTS lighting TEXT,
  ADD COLUMN IF NOT EXISTS color_temperature TEXT;

-- Bucket 2: Internal story detection context
ALTER TABLE photo_metadata
  ADD COLUMN IF NOT EXISTS time_in_game TEXT,
  ADD COLUMN IF NOT EXISTS athlete_id TEXT,
  ADD COLUMN IF NOT EXISTS event_id UUID,
  ADD COLUMN IF NOT EXISTS ai_confidence FLOAT;

-- Verify new columns added
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'photo_metadata'
  AND column_name IN ('lighting', 'color_temperature', 'time_in_game', 'athlete_id', 'event_id', 'ai_confidence')
ORDER BY column_name;

-- ============================================
-- PHASE 3: REMOVE OBSOLETE COLUMNS
-- ============================================

-- Drop obsolete columns (if they exist)
ALTER TABLE photo_metadata
  DROP COLUMN IF EXISTS portfolio_worthy,
  DROP COLUMN IF EXISTS print_ready,
  DROP COLUMN IF EXISTS social_media_optimized,
  DROP COLUMN IF EXISTS use_cases;

-- Note: quality_score is typically a computed/derived column, not stored
-- If it exists as a stored column, remove it:
ALTER TABLE photo_metadata
  DROP COLUMN IF EXISTS quality_score;

-- Verify columns removed
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'photo_metadata'
ORDER BY column_name;

-- ============================================
-- PHASE 4: DROP OBSOLETE INDEXES
-- ============================================

-- Drop indexes on removed columns
DROP INDEX IF EXISTS idx_photo_metadata_portfolio;
DROP INDEX IF EXISTS idx_photo_metadata_quality_score;
DROP INDEX IF EXISTS idx_photo_metadata_portfolio_sport;

-- Drop covering index with obsolete INCLUDE columns
DROP INDEX IF EXISTS idx_photo_metadata_explore_covering;

-- Verify indexes dropped
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'photo_metadata'
  AND schemaname = 'public'
ORDER BY indexname;

-- ============================================
-- PHASE 5: CREATE NEW INDEXES (User-Facing Only)
-- ============================================

-- Bucket 1 indexes (NEW user-facing filters)
CREATE INDEX IF NOT EXISTS idx_photo_lighting
  ON photo_metadata(lighting)
  WHERE lighting IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_photo_color_temperature
  ON photo_metadata(color_temperature)
  WHERE color_temperature IS NOT NULL;

-- Updated composite index for common queries (Action + Aesthetic)
CREATE INDEX IF NOT EXISTS idx_photo_action_aesthetic
  ON photo_metadata(play_type, time_of_day, composition, lighting)
  WHERE play_type IS NOT NULL;

-- NO indexes on Bucket 2 (internal) fields
-- NO index on emotion (not user-facing)
-- NO index on time_in_game (internal only)
-- NO index on athlete_id (internal only)
-- NO index on event_id (queries will filter by album/date, not event_id directly)

-- Verify new indexes created
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'photo_metadata'
  AND indexname IN ('idx_photo_lighting', 'idx_photo_color_temperature', 'idx_photo_action_aesthetic')
ORDER BY indexname;

-- ============================================
-- PHASE 6: UPDATE STATISTICS
-- ============================================

-- Update table statistics for query planner
ANALYZE photo_metadata;

-- ============================================
-- PHASE 7: VALIDATION QUERIES
-- ============================================

-- Check schema structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'photo_metadata'
ORDER BY
  CASE
    WHEN column_name IN ('play_type', 'action_intensity', 'sport_type', 'photo_category', 'composition', 'time_of_day', 'lighting', 'color_temperature') THEN 1  -- Bucket 1
    WHEN column_name IN ('emotion', 'sharpness', 'composition_score', 'exposure_accuracy', 'emotional_impact', 'time_in_game', 'athlete_id', 'event_id') THEN 2  -- Bucket 2
    ELSE 3
  END,
  column_name;

-- Check index coverage (should have indexes on Bucket 1 only)
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'photo_metadata'
  AND schemaname = 'public'
ORDER BY indexname;

-- Count photos by new filter dimensions
SELECT
  lighting,
  COUNT(*) as count
FROM photo_metadata
WHERE lighting IS NOT NULL
GROUP BY lighting
ORDER BY count DESC;

SELECT
  color_temperature,
  COUNT(*) as count
FROM photo_metadata
WHERE color_temperature IS NOT NULL
GROUP BY color_temperature
ORDER BY count DESC;

-- ============================================
-- PHASE 8: TEST QUERIES (Bucket 1 Filters)
-- ============================================

-- Test user-facing filter query (should use new indexes)
EXPLAIN ANALYZE
SELECT *
FROM photo_metadata
WHERE play_type = 'block'
  AND lighting = 'backlit'
  AND time_of_day = 'golden_hour'
ORDER BY photo_date DESC
LIMIT 24;

-- Test aesthetic-only filter (should use new indexes)
EXPLAIN ANALYZE
SELECT *
FROM photo_metadata
WHERE lighting = 'dramatic'
  AND color_temperature = 'warm'
ORDER BY photo_date DESC
LIMIT 24;

-- ============================================
-- MIGRATION SUMMARY
-- ============================================

/*
CHANGES APPLIED:

✅ Added 6 new columns:
  - lighting (Bucket 1: user-facing)
  - color_temperature (Bucket 1: user-facing)
  - time_in_game (Bucket 2: internal)
  - athlete_id (Bucket 2: internal)
  - event_id (Bucket 2: internal)
  - ai_confidence (Bucket 2: internal)

✅ Removed 5 obsolete columns:
  - portfolio_worthy (assumed quality varies)
  - print_ready (subjective, not extractable)
  - social_media_optimized (subjective, not extractable)
  - quality_score (composite metric, futile filter)
  - use_cases (redundant)

✅ Updated indexes:
  - Added: idx_photo_lighting, idx_photo_color_temperature, idx_photo_action_aesthetic
  - Removed: idx_photo_metadata_portfolio, idx_photo_metadata_quality_score, idx_photo_metadata_portfolio_sport

NEXT STEPS:

1. Run backfill script to populate new columns:
   - Extract lighting and color_temperature via AI (Bucket 1)
   - Extract time_in_game, athlete_id, event_id from context (Bucket 2)

2. Update application code:
   - Remove references to obsolete columns (portfolio_worthy, print_ready, etc.)
   - Add new filter UI for lighting and color_temperature
   - Update story detection algorithms to use new internal fields

3. Monitor performance:
   - Check query execution plans (should use new indexes)
   - Verify search response times (<500ms target)
   - Track AI confidence scores (aim for >0.75 average)

ROLLBACK (if needed):

-- Restore from backup
DROP TABLE IF EXISTS photo_metadata;
ALTER TABLE photo_metadata_backup_20251027 RENAME TO photo_metadata;

-- Recreate old indexes
(see database/performance-indexes.sql for original index definitions)
*/
