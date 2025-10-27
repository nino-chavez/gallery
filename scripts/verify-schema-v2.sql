-- Verification Script: Schema v2.0 Migration
-- Run this in Supabase SQL Editor to verify migration success

-- ============================================
-- Check 1: New columns exist
-- ============================================
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'photo_metadata'
  AND column_name IN ('lighting', 'color_temperature', 'time_in_game', 'athlete_id', 'event_id', 'ai_confidence')
ORDER BY column_name;

-- Expected: 6 rows showing the new columns

-- ============================================
-- Check 2: Obsolete columns removed
-- ============================================
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'photo_metadata'
  AND column_name IN ('portfolio_worthy', 'print_ready', 'social_media_optimized', 'quality_score', 'use_cases');

-- Expected: 0 rows (all removed)

-- ============================================
-- Check 3: New indexes exist
-- ============================================
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'photo_metadata'
  AND indexname IN ('idx_photo_lighting', 'idx_photo_color_temperature', 'idx_photo_action_aesthetic')
ORDER BY indexname;

-- Expected: 3 rows showing new indexes

-- ============================================
-- Check 4: Obsolete indexes removed
-- ============================================
SELECT indexname
FROM pg_indexes
WHERE tablename = 'photo_metadata'
  AND indexname IN ('idx_photo_metadata_portfolio', 'idx_photo_metadata_quality_score');

-- Expected: 0 rows (all removed)

-- ============================================
-- Check 5: Photos ready for enrichment
-- ============================================
SELECT COUNT(*) as photos_needing_enrichment
FROM photo_metadata
WHERE lighting IS NULL;

-- Expected: ~20,000 (all photos need new metadata)

-- ============================================
-- Check 6: Backup table exists
-- ============================================
SELECT COUNT(*) as backup_count
FROM photo_metadata_backup_20251027;

-- Expected: ~20,000 (same as current count)

-- ============================================
-- Summary
-- ============================================
SELECT
  'Schema v2.0 Migration Verified' as status,
  (SELECT COUNT(*) FROM photo_metadata) as current_photos,
  (SELECT COUNT(*) FROM photo_metadata_backup_20251027) as backup_photos,
  (SELECT COUNT(*) FROM photo_metadata WHERE lighting IS NULL) as needing_enrichment;
