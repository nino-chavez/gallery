/**
 * Database Migration: Schema v3.0 - Comprehensive AI Enrichment
 *
 * Date: 2025-10-27
 * Purpose: Add advanced AI-extractable fields for complete feature roadmap
 *
 * This migration adds fields to support:
 * 1. Vector similarity search ("Find Similar" feature)
 * 2. Color-based discovery (palette extraction)
 * 3. Player auto-tagging (jersey number detection)
 * 4. Venue/event auto-grouping (context detection)
 * 5. Enhanced story collections (crowd/score context)
 * 6. Admin verification workflow (human RAG training)
 *
 * IMPORTANT: Run this BEFORE the comprehensive backfill to avoid re-processing 20K photos.
 */

-- ============================================
-- PHASE 1: BACKUP CURRENT TABLE
-- ============================================

-- Create backup table with timestamp
CREATE TABLE IF NOT EXISTS photo_metadata_backup_v3_20251027 AS
SELECT * FROM photo_metadata;

-- Verify backup
SELECT COUNT(*) as backup_count FROM photo_metadata_backup_v3_20251027;
SELECT COUNT(*) as current_count FROM photo_metadata;

-- ============================================
-- PHASE 2: ADD ADVANCED SEARCH FIELDS
-- ============================================

-- Vector embeddings for "Find Similar" feature
-- Note: Using JSON for compatibility; switch to pgvector extension if available
ALTER TABLE photo_metadata
  ADD COLUMN IF NOT EXISTS embedding JSON;

COMMENT ON COLUMN photo_metadata.embedding IS 'Vector embedding from Gemini embedding-001 model (512-dim). Powers "Find Similar" and dynamic Explore feed.';

-- Color palette for visual similarity
ALTER TABLE photo_metadata
  ADD COLUMN IF NOT EXISTS dominant_colors JSON;

COMMENT ON COLUMN photo_metadata.dominant_colors IS 'Top 5 dominant colors with percentages. Format: [{"hex": "#FF5733", "percentage": 35}, ...]. Powers color-based search.';

-- ============================================
-- PHASE 3: ADD AUTO-TAGGING FIELDS
-- ============================================

-- Player detection (auto-populate athlete_id)
ALTER TABLE photo_metadata
  ADD COLUMN IF NOT EXISTS detected_jersey_numbers TEXT[],
  ADD COLUMN IF NOT EXISTS player_count INT;

COMMENT ON COLUMN photo_metadata.detected_jersey_numbers IS 'Visible jersey numbers in photo. Used to auto-tag athletes and build player highlight reels.';
COMMENT ON COLUMN photo_metadata.player_count IS 'Number of players visible in frame. Useful for filtering "individual" vs "team" shots.';

-- Venue/event context (auto-populate event_id)
ALTER TABLE photo_metadata
  ADD COLUMN IF NOT EXISTS venue_type TEXT,
  ADD COLUMN IF NOT EXISTS visible_branding TEXT[];

COMMENT ON COLUMN photo_metadata.venue_type IS 'Type of venue: "indoor_gym", "outdoor_court", "beach", "stadium". Used for auto-grouping by venue.';
COMMENT ON COLUMN photo_metadata.visible_branding IS 'Visible logos, sponsor banners, tournament names. Used to auto-detect events.';

-- ============================================
-- PHASE 4: ADD STORY CONTEXT FIELDS
-- ============================================

-- Enhanced story detection metadata
ALTER TABLE photo_metadata
  ADD COLUMN IF NOT EXISTS crowd_intensity TEXT,
  ADD COLUMN IF NOT EXISTS score_visible BOOLEAN,
  ADD COLUMN IF NOT EXISTS team_dynamics TEXT;

COMMENT ON COLUMN photo_metadata.crowd_intensity IS 'Crowd reaction level: "none", "low", "moderate", "high", "explosive". Enhances "Comeback Stories" and "Crowd Energy" collections.';
COMMENT ON COLUMN photo_metadata.score_visible IS 'Whether scoreboard is visible in photo. Useful for time_in_game validation.';
COMMENT ON COLUMN photo_metadata.team_dynamics IS 'Team interaction type: "individual", "duo", "team_huddle", "celebration", "coaching". Powers team story collections.';

-- ============================================
-- PHASE 5: ADD SPATIAL/COMPOSITION DATA
-- ============================================

-- Subject positioning for advanced composition similarity
ALTER TABLE photo_metadata
  ADD COLUMN IF NOT EXISTS main_subject_bbox JSON;

COMMENT ON COLUMN photo_metadata.main_subject_bbox IS 'Bounding box of main subject. Format: {"x": 0.25, "y": 0.33, "width": 0.5, "height": 0.67}. Normalized 0-1. Powers "similar framing" feature.';

-- ============================================
-- PHASE 6: ADD ADMIN VERIFICATION SCHEMA
-- ============================================

-- Human verification for training dataset
ALTER TABLE photo_metadata
  ADD COLUMN IF NOT EXISTS human_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS verified_by TEXT,
  ADD COLUMN IF NOT EXISTS human_corrections JSON;

COMMENT ON COLUMN photo_metadata.human_verified IS 'Whether this photo has been manually verified by admin. Used to build fine-tuning dataset.';
COMMENT ON COLUMN photo_metadata.verified_at IS 'Timestamp of manual verification.';
COMMENT ON COLUMN photo_metadata.verified_by IS 'Admin user who verified (for audit trail).';
COMMENT ON COLUMN photo_metadata.human_corrections IS 'Before/after corrections. Format: {"field": "play_type", "ai_value": "dig", "human_value": "block"}. Used for AI model improvement.';

-- Review priority queue
ALTER TABLE photo_metadata
  ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS review_priority INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_notes TEXT;

COMMENT ON COLUMN photo_metadata.needs_review IS 'Flag for admin review queue. Set TRUE when ai_confidence < 0.7.';
COMMENT ON COLUMN photo_metadata.review_priority IS 'Priority ranking (0-100). Higher = review sooner. Based on portfolio importance + low confidence.';
COMMENT ON COLUMN photo_metadata.review_notes IS 'Admin notes during review process.';

-- ============================================
-- PHASE 7: VERIFY NEW COLUMNS
-- ============================================

SELECT
  column_name,
  data_type,
  is_nullable,
  col_description('photo_metadata'::regclass, ordinal_position) as description
FROM information_schema.columns
WHERE table_name = 'photo_metadata'
  AND column_name IN (
    'embedding', 'dominant_colors',
    'detected_jersey_numbers', 'player_count',
    'venue_type', 'visible_branding',
    'crowd_intensity', 'score_visible', 'team_dynamics',
    'main_subject_bbox',
    'human_verified', 'verified_at', 'verified_by', 'human_corrections',
    'needs_review', 'review_priority', 'review_notes'
  )
ORDER BY column_name;

-- ============================================
-- PHASE 8: CREATE INDEXES (Strategic)
-- ============================================

-- NO index on embedding (would be huge, use pgvector for that)
-- NO index on dominant_colors (JSON, not filterable directly)
-- YES index on player_count (filterable: "show me solo shots")
-- NO index on detected_jersey_numbers (array, low cardinality)
-- YES index on venue_type (filterable: "indoor vs outdoor")
-- NO index on visible_branding (array, low usage)
-- NO index on Bucket 2 fields (internal only)
-- YES index on human_verified (admin filtering)
-- YES index on needs_review (admin queue)

CREATE INDEX IF NOT EXISTS idx_photo_player_count
  ON photo_metadata(player_count)
  WHERE player_count IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_photo_venue_type
  ON photo_metadata(venue_type)
  WHERE venue_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_photo_verified
  ON photo_metadata(human_verified, verified_at DESC)
  WHERE human_verified = TRUE;

CREATE INDEX IF NOT EXISTS idx_photo_review_queue
  ON photo_metadata(needs_review, review_priority DESC)
  WHERE needs_review = TRUE;

-- Composite index for "similar photos by player + venue"
CREATE INDEX IF NOT EXISTS idx_photo_context_similarity
  ON photo_metadata(player_count, venue_type, play_type)
  WHERE player_count IS NOT NULL AND venue_type IS NOT NULL;

-- Verify indexes created
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'photo_metadata'
  AND indexname IN (
    'idx_photo_player_count',
    'idx_photo_venue_type',
    'idx_photo_verified',
    'idx_photo_review_queue',
    'idx_photo_context_similarity'
  )
ORDER BY indexname;

-- ============================================
-- PHASE 9: CREATE TRIGGER FOR AUTO-REVIEW FLAGGING
-- ============================================

-- Automatically flag low-confidence photos for review
CREATE OR REPLACE FUNCTION flag_low_confidence_for_review()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ai_confidence IS NOT NULL AND NEW.ai_confidence < 0.7 THEN
    NEW.needs_review := TRUE;
    NEW.review_priority := CASE
      WHEN NEW.ai_confidence < 0.5 THEN 100  -- High priority
      WHEN NEW.ai_confidence < 0.6 THEN 70   -- Medium priority
      ELSE 40                                 -- Low priority
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_flag_low_confidence
  BEFORE INSERT OR UPDATE OF ai_confidence ON photo_metadata
  FOR EACH ROW
  EXECUTE FUNCTION flag_low_confidence_for_review();

-- ============================================
-- PHASE 10: UPDATE STATISTICS
-- ============================================

ANALYZE photo_metadata;

-- ============================================
-- PHASE 11: VALIDATION QUERIES
-- ============================================

-- Check all new columns added
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'photo_metadata'
ORDER BY
  CASE
    -- Bucket 1: User-facing
    WHEN column_name IN ('play_type', 'action_intensity', 'sport_type', 'photo_category', 'composition', 'time_of_day', 'lighting', 'color_temperature') THEN 1
    -- Advanced Search
    WHEN column_name IN ('embedding', 'dominant_colors', 'player_count', 'venue_type') THEN 2
    -- Bucket 2: Internal
    WHEN column_name IN ('emotion', 'sharpness', 'composition_score', 'exposure_accuracy', 'emotional_impact', 'time_in_game', 'athlete_id', 'event_id', 'ai_confidence') THEN 3
    -- Context & Auto-tagging
    WHEN column_name IN ('detected_jersey_numbers', 'visible_branding', 'crowd_intensity', 'score_visible', 'team_dynamics', 'main_subject_bbox') THEN 4
    -- Admin/Verification
    WHEN column_name IN ('human_verified', 'verified_at', 'verified_by', 'human_corrections', 'needs_review', 'review_priority', 'review_notes') THEN 5
    ELSE 6
  END,
  column_name;

-- ============================================
-- MIGRATION SUMMARY
-- ============================================

/*
SCHEMA v3.0 CHANGES:

✅ Added 17 new columns:

ADVANCED SEARCH (4 columns):
  - embedding JSON                     [Vector similarity]
  - dominant_colors JSON               [Color-based discovery]
  - player_count INT                   [Solo vs team filtering]
  - venue_type TEXT                    [Indoor/outdoor filtering]

AUTO-TAGGING (2 columns):
  - detected_jersey_numbers TEXT[]     [Player auto-tagging]
  - visible_branding TEXT[]            [Event auto-detection]

STORY CONTEXT (3 columns):
  - crowd_intensity TEXT               [Enhanced story collections]
  - score_visible BOOLEAN              [Time validation]
  - team_dynamics TEXT                 [Team story collections]

COMPOSITION (1 column):
  - main_subject_bbox JSON             [Advanced framing similarity]

ADMIN WORKFLOW (7 columns):
  - human_verified BOOLEAN             [Verification flag]
  - verified_at TIMESTAMP              [Audit trail]
  - verified_by TEXT                   [User tracking]
  - human_corrections JSON             [Training dataset]
  - needs_review BOOLEAN               [Review queue]
  - review_priority INT                [Queue ranking]
  - review_notes TEXT                  [Admin notes]

✅ Added 5 strategic indexes:
  - idx_photo_player_count (user filtering)
  - idx_photo_venue_type (user filtering)
  - idx_photo_verified (admin filtering)
  - idx_photo_review_queue (admin queue)
  - idx_photo_context_similarity (multi-dimensional similarity)

✅ Added trigger:
  - Auto-flag low-confidence photos for review

NEXT STEPS:

1. Run comprehensive backfill script:
   - Extract all Bucket 1 & 2 fields
   - Generate vector embeddings
   - Extract color palettes
   - Detect players, venue, context
   - Flag low-confidence for review

2. Build admin dashboard:
   - Review queue (sorted by priority)
   - Verification interface
   - Corrections tracking
   - Fine-tuning dataset export

3. Implement features:
   - "Find Similar" (using embeddings)
   - Color-based search (using dominant_colors)
   - Player highlight reels (using detected_jersey_numbers)
   - Venue collections (using venue_type)
   - Enhanced story collections (using crowd_intensity, team_dynamics)

ROLLBACK (if needed):

DROP TABLE IF EXISTS photo_metadata;
ALTER TABLE photo_metadata_backup_v3_20251027 RENAME TO photo_metadata;
-- Recreate old indexes (see previous migration files)
*/
