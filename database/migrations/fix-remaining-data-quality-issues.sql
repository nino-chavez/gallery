-- Supplemental Migration: Fix remaining data quality issues
-- Purpose: Handle sport-specific play types and 'other' sport_type values
-- Run this AFTER the main normalization migrations
-- Date: 2025-10-28

BEGIN;

-- =====================================================
-- PART 1: FIX REMAINING PLAY_TYPE ISSUES
-- =====================================================

-- 1. Fix string literal 'NULL' that wasn't caught
UPDATE photo_metadata
SET play_type = NULL
WHERE play_type = 'NULL'; -- uppercase version

-- 2. Basketball-specific plays -> attack (primary scoring action)
UPDATE photo_metadata
SET play_type = 'attack'
WHERE play_type IN ('dribble', 'jump_shot', 'dunk', 'rebound');

-- 3. Baseball/Softball plays
-- pitch/throw -> serve (analogous to volleyball serve)
UPDATE photo_metadata
SET play_type = 'serve'
WHERE play_type IN ('pitch', 'throw');

-- catch -> dig (defensive reception)
UPDATE photo_metadata
SET play_type = 'dig'
WHERE play_type = 'catch';

-- slide -> transition (movement between plays)
UPDATE photo_metadata
SET play_type = 'transition'
WHERE play_type = 'slide';

-- 4. Soccer-specific plays
-- header -> attack (offensive action)
UPDATE photo_metadata
SET play_type = 'attack'
WHERE play_type = 'header';

-- save -> dig (goalkeeper defensive action)
UPDATE photo_metadata
SET play_type = 'dig'
WHERE play_type = 'save';

-- 5. Track & Field plays -> transition (continuous movement)
UPDATE photo_metadata
SET play_type = 'transition'
WHERE play_type IN ('run', 'jump', 'sprint', 'hurdle');

-- 6. Generic actions
-- hit -> attack (offensive action)
UPDATE photo_metadata
SET play_type = 'attack'
WHERE play_type = 'hit';

-- relay -> transition (movement/handoff)
UPDATE photo_metadata
SET play_type = 'transition'
WHERE play_type = 'relay';

-- =====================================================
-- PART 2: FIX SPORT_TYPE 'OTHER' VALUES
-- =====================================================

-- Strategy: Use play_type patterns to infer sport_type
-- If we can't infer, set to NULL for re-enrichment

UPDATE photo_metadata
SET sport_type = CASE
  -- Basketball patterns
  WHEN play_type IN ('dribble', 'jump_shot', 'dunk', 'rebound') THEN 'basketball'

  -- Baseball/Softball patterns
  WHEN play_type IN ('pitch', 'catch', 'slide') AND sport_type = 'other' THEN 'baseball'

  -- Soccer patterns
  WHEN play_type IN ('header', 'save') AND sport_type = 'other' THEN 'soccer'

  -- Track patterns
  WHEN play_type IN ('run', 'sprint', 'jump', 'hurdle') AND sport_type = 'other' THEN 'track'

  -- Volleyball is most common, use as default for unclear cases
  WHEN photo_category = 'action' AND sport_type = 'other' THEN 'volleyball'

  -- Cannot determine - set to NULL for re-enrichment
  ELSE NULL
END
WHERE sport_type = 'other';

-- =====================================================
-- VERIFICATION QUERIES (uncomment to run)
-- =====================================================

-- Check remaining play_type issues
-- SELECT
--   play_type,
--   COUNT(*) as count
-- FROM photo_metadata
-- WHERE play_type NOT IN ('attack', 'block', 'dig', 'set', 'serve', 'celebration', 'transition')
--   AND play_type IS NOT NULL
-- GROUP BY play_type
-- ORDER BY count DESC;

-- Check remaining sport_type issues
-- SELECT
--   sport_type,
--   COUNT(*) as count
-- FROM photo_metadata
-- WHERE sport_type NOT IN ('volleyball', 'basketball', 'soccer', 'softball', 'football', 'baseball', 'track', 'portrait')
--   AND sport_type IS NOT NULL
-- GROUP BY sport_type
-- ORDER BY count DESC;

COMMIT;

-- Expected results:
-- play_type: All 355 non-canonical values should be mapped to canonical values
-- sport_type: All 712 'other' values should be mapped or set to NULL

-- Photos with NULL sport_type after this migration should be re-enriched
