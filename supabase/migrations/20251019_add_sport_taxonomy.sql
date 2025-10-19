-- Migration: Add Multi-Sport Taxonomy
-- Date: 2025-10-19
-- Purpose: Enable sport-agnostic filtering and classification
-- Impact: Additive, non-breaking, backward compatible

-- ============================================================================
-- STEP 1: Add New Columns (Nullable, Non-Breaking)
-- ============================================================================

ALTER TABLE photo_metadata
ADD COLUMN IF NOT EXISTS sport_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS photo_category VARCHAR(50),
ADD COLUMN IF NOT EXISTS action_type VARCHAR(100);

COMMENT ON COLUMN photo_metadata.sport_type IS 'Sport classification: volleyball, basketball, soccer, portrait, etc.';
COMMENT ON COLUMN photo_metadata.photo_category IS 'Photo category: action, portrait, candid, celebration, warmup, ceremony';
COMMENT ON COLUMN photo_metadata.action_type IS 'Sport-specific action: volleyball:attack, basketball:dunk, etc.';

-- ============================================================================
-- STEP 2: Create Indexes for Filtering Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_sport_type ON photo_metadata(sport_type);
CREATE INDEX IF NOT EXISTS idx_photo_category ON photo_metadata(photo_category);
CREATE INDEX IF NOT EXISTS idx_action_type ON photo_metadata(action_type);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_sport_quality ON photo_metadata(sport_type, quality_score DESC)
  WHERE quality_score IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sport_portfolio ON photo_metadata(sport_type, portfolio_worthy)
  WHERE portfolio_worthy = true;

CREATE INDEX IF NOT EXISTS idx_category_emotion ON photo_metadata(photo_category, emotion)
  WHERE emotion IS NOT NULL;

-- ============================================================================
-- VERIFICATION QUERIES (Run these after migration)
-- ============================================================================

-- Verify columns added
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'photo_metadata'
--   AND column_name IN ('sport_type', 'photo_category', 'action_type');

-- Verify indexes created
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'photo_metadata'
--   AND indexname LIKE 'idx_sport%' OR indexname LIKE 'idx_category%';

-- Check data state (should all be NULL)
-- SELECT
--   COUNT(*) as total_photos,
--   COUNT(sport_type) as sport_type_populated,
--   COUNT(photo_category) as photo_category_populated,
--   COUNT(action_type) as action_type_populated
-- FROM photo_metadata;
-- Expected: total_photos ~20000, others 0 (ready for inference)
