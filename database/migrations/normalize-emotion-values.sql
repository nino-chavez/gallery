-- Migration: Normalize emotion values
-- Purpose: Clean up multi-value emotion fields and non-canonical values
-- Expected canonical values: triumph, determination, intensity, focus, excitement, serenity
-- Date: 2025-10-28

-- Summary of issues:
-- 1. Multi-value contamination (pipe delimited): ~1,000 rows
-- 2. Non-canonical single values: ~2,000 rows
-- 3. Valid canonical values: ~17,000 rows

-- Strategy:
-- 1. For multi-value fields, select the FIRST canonical value (most dominant emotion)
-- 2. Map common non-canonical values to canonical equivalents
-- 3. Set unclear values to NULL for re-enrichment

BEGIN;

-- Step 1: Handle multi-value contamination by selecting first canonical value
UPDATE photo_metadata
SET emotion =
  CASE
    -- Extract first canonical emotion from pipe-delimited list
    WHEN emotion LIKE '%focus%' THEN 'focus'
    WHEN emotion LIKE '%determination%' THEN 'determination'
    WHEN emotion LIKE '%intensity%' THEN 'intensity'
    WHEN emotion LIKE '%excitement%' THEN 'excitement'
    WHEN emotion LIKE '%triumph%' THEN 'triumph'
    WHEN emotion LIKE '%serenity%' THEN 'serenity'
    -- If contains playfulness, map to excitement (similar energy)
    WHEN emotion LIKE '%playfulness%' THEN 'excitement'
    ELSE emotion
  END
WHERE emotion LIKE '%|%';

-- Step 2: Map non-canonical single values to canonical equivalents
UPDATE photo_metadata
SET emotion =
  CASE
    -- High-energy emotions -> excitement
    WHEN emotion IN ('joy', 'happiness', 'playfulness', 'enthusiasm', 'vibrancy') THEN 'excitement'

    -- Concentrated focus emotions -> focus
    WHEN emotion IN ('concentration', 'anticipation', 'curiosity', 'contemplation') THEN 'focus'

    -- Achievement/pride emotions -> triumph
    WHEN emotion IN ('pride', 'satisfaction', 'confidence', 'fulfillment') THEN 'triumph'

    -- Calm/peaceful emotions -> serenity
    WHEN emotion IN ('contentment', 'appreciation', 'gratitude', 'fondness') THEN 'serenity'

    -- Community/connection emotions -> determination (team effort)
    WHEN emotion IN ('unity', 'camaraderie', 'respect', 'affection', 'community', 'dedication') THEN 'determination'

    -- Negative or unclear emotions -> NULL (requires re-enrichment)
    WHEN emotion IN ('distress', 'anxiety', 'neglect', 'solemnity', 'mysterious', 'mystery') THEN NULL

    -- Descriptive/non-emotion terms -> NULL
    WHEN emotion IN ('documentation', 'informational', 'candid', 'dramatic', 'raw', 'action', 'interest') THEN NULL

    -- Ambiguous terms -> intensity (sports context)
    WHEN emotion IN ('awe', 'intrigue') THEN 'intensity'

    ELSE emotion
  END
WHERE emotion NOT IN ('triumph', 'determination', 'intensity', 'focus', 'excitement', 'serenity')
  AND emotion NOT LIKE '%|%'
  AND emotion IS NOT NULL;

-- Verification query (run after migration)
-- SELECT
--   emotion,
--   COUNT(*) as count,
--   CASE
--     WHEN emotion IN ('triumph', 'determination', 'intensity', 'focus', 'excitement', 'serenity') THEN '✅ Valid'
--     WHEN emotion LIKE '%|%' THEN '❌ Multi-value (should be none)'
--     WHEN emotion IS NULL THEN '⚠️ NULL (acceptable, needs enrichment)'
--     ELSE '❌ Non-canonical'
--   END as status
-- FROM photo_metadata
-- GROUP BY emotion
-- ORDER BY count DESC;

COMMIT;

-- Expected results after migration:
-- All emotion values should be one of: triumph, determination, intensity, focus, excitement, serenity, NULL
-- Multi-value count should be 0
-- Non-canonical count should be 0
-- Some values set to NULL for re-enrichment

-- To identify photos that need re-enrichment:
-- SELECT photo_id, ImageUrl FROM photo_metadata WHERE emotion IS NULL AND enriched_at IS NOT NULL;
