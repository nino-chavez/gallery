-- Data Quality Verification Script
-- Purpose: Verify that all data quality remediations were successful
-- Run this after applying all normalization migrations
-- Date: 2025-10-28

-- ===============================================
-- DATA QUALITY VERIFICATION REPORT
-- ===============================================

-- 1. TIME_OF_DAY VERIFICATION
-- ----------------------------------------
-- Expected: All values should be canonical (✅ Valid)

SELECT
  time_of_day as value,
  COUNT(*) as count,
  CASE
    WHEN time_of_day IN ('golden_hour', 'midday', 'evening', 'blue_hour', 'night', 'dawn') THEN '✅ Valid'
    WHEN time_of_day LIKE '%-%' THEN '❌ Contains hyphens'
    WHEN time_of_day IS NULL THEN '⚠️ NULL'
    ELSE '❌ Non-canonical'
  END as status
FROM photo_metadata
WHERE time_of_day IS NOT NULL
GROUP BY time_of_day
ORDER BY
  CASE
    WHEN time_of_day IN ('golden_hour', 'midday', 'evening', 'blue_hour', 'night', 'dawn') THEN 0
    ELSE 1
  END,
  count DESC;

-- 2. PLAY_TYPE VERIFICATION
-- ----------------------------------------
-- Expected: All non-NULL values should be canonical (✅ Valid)

SELECT
  play_type as value,
  COUNT(*) as count,
  CASE
    WHEN play_type IN ('attack', 'block', 'dig', 'set', 'serve', 'celebration', 'transition') THEN '✅ Valid'
    WHEN play_type IS NULL THEN '⚠️ NULL (acceptable)'
    ELSE '❌ Non-canonical'
  END as status
FROM photo_metadata
GROUP BY play_type
ORDER BY
  CASE
    WHEN play_type IN ('attack', 'block', 'dig', 'set', 'serve', 'celebration', 'transition') THEN 0
    WHEN play_type IS NULL THEN 1
    ELSE 2
  END,
  count DESC;

-- 3. SPORT_TYPE VERIFICATION
-- ----------------------------------------
-- Expected: Most values should be canonical; some may require manual review

SELECT
  sport_type as value,
  COUNT(*) as count,
  CASE
    WHEN sport_type IN ('volleyball', 'basketball', 'soccer', 'softball', 'football', 'baseball', 'track', 'portrait') THEN '✅ Valid'
    WHEN sport_type IS NULL THEN '⚠️ NULL (acceptable)'
    ELSE '❌ Non-canonical'
  END as status
FROM photo_metadata
GROUP BY sport_type
ORDER BY
  CASE
    WHEN sport_type IN ('volleyball', 'basketball', 'soccer', 'softball', 'football', 'baseball', 'track', 'portrait') THEN 0
    WHEN sport_type IS NULL THEN 1
    ELSE 2
  END,
  count DESC;

-- 4. EMOTION VERIFICATION
-- ----------------------------------------
-- Expected: All values should be canonical or NULL (no multi-value entries)

SELECT
  emotion as value,
  COUNT(*) as count,
  CASE
    WHEN emotion IN ('triumph', 'determination', 'intensity', 'focus', 'excitement', 'serenity') THEN '✅ Valid'
    WHEN emotion LIKE '%|%' THEN '❌ Multi-value (CRITICAL)'
    WHEN emotion IS NULL THEN '⚠️ NULL (acceptable)'
    ELSE '❌ Non-canonical'
  END as status
FROM photo_metadata
GROUP BY emotion
ORDER BY
  CASE
    WHEN emotion IN ('triumph', 'determination', 'intensity', 'focus', 'excitement', 'serenity') THEN 0
    WHEN emotion IS NULL THEN 1
    WHEN emotion LIKE '%|%' THEN 3
    ELSE 2
  END,
  count DESC;

-- 5. SUMMARY STATISTICS
-- ----------------------------------------
-- Expected: All counts should be 0 or near-0 after remediation
SELECT
  'sport_type' as field,
  COUNT(CASE WHEN sport_type NOT IN ('volleyball', 'basketball', 'soccer', 'softball', 'football', 'baseball', 'track', 'portrait') AND sport_type IS NOT NULL THEN 1 END) as non_canonical_count,
  COUNT(CASE WHEN sport_type LIKE '%-%' THEN 1 END) as hyphen_count,
  COUNT(CASE WHEN sport_type LIKE '%|%' THEN 1 END) as multi_value_count
FROM photo_metadata

UNION ALL

SELECT
  'photo_category' as field,
  COUNT(CASE WHEN photo_category NOT IN ('action', 'celebration', 'candid', 'portrait', 'warmup', 'ceremony') AND photo_category IS NOT NULL THEN 1 END),
  COUNT(CASE WHEN photo_category LIKE '%-%' THEN 1 END),
  COUNT(CASE WHEN photo_category LIKE '%|%' THEN 1 END)
FROM photo_metadata

UNION ALL

SELECT
  'play_type' as field,
  COUNT(CASE WHEN play_type NOT IN ('attack', 'block', 'dig', 'set', 'serve', 'celebration', 'transition') AND play_type IS NOT NULL THEN 1 END),
  COUNT(CASE WHEN play_type LIKE '%-%' THEN 1 END),
  COUNT(CASE WHEN play_type LIKE '%|%' THEN 1 END)
FROM photo_metadata

UNION ALL

SELECT
  'action_intensity' as field,
  COUNT(CASE WHEN action_intensity NOT IN ('low', 'medium', 'high', 'peak') AND action_intensity IS NOT NULL THEN 1 END),
  COUNT(CASE WHEN action_intensity LIKE '%-%' THEN 1 END),
  COUNT(CASE WHEN action_intensity LIKE '%|%' THEN 1 END)
FROM photo_metadata

UNION ALL

SELECT
  'composition' as field,
  COUNT(CASE WHEN composition NOT IN ('rule_of_thirds', 'leading_lines', 'centered', 'symmetry', 'frame_within_frame') AND composition IS NOT NULL THEN 1 END),
  COUNT(CASE WHEN composition LIKE '%-%' THEN 1 END),
  COUNT(CASE WHEN composition LIKE '%|%' THEN 1 END)
FROM photo_metadata

UNION ALL

SELECT
  'time_of_day' as field,
  COUNT(CASE WHEN time_of_day NOT IN ('golden_hour', 'midday', 'evening', 'blue_hour', 'night', 'dawn') AND time_of_day IS NOT NULL THEN 1 END),
  COUNT(CASE WHEN time_of_day LIKE '%-%' THEN 1 END),
  COUNT(CASE WHEN time_of_day LIKE '%|%' THEN 1 END)
FROM photo_metadata

UNION ALL

SELECT
  'lighting' as field,
  COUNT(CASE WHEN lighting NOT IN ('natural', 'backlit', 'dramatic', 'soft', 'artificial') AND lighting IS NOT NULL THEN 1 END),
  COUNT(CASE WHEN lighting LIKE '%-%' THEN 1 END),
  COUNT(CASE WHEN lighting LIKE '%|%' THEN 1 END)
FROM photo_metadata

UNION ALL

SELECT
  'color_temperature' as field,
  COUNT(CASE WHEN color_temperature NOT IN ('warm', 'cool', 'neutral') AND color_temperature IS NOT NULL THEN 1 END),
  COUNT(CASE WHEN color_temperature LIKE '%-%' THEN 1 END),
  COUNT(CASE WHEN color_temperature LIKE '%|%' THEN 1 END)
FROM photo_metadata

UNION ALL

SELECT
  'emotion' as field,
  COUNT(CASE WHEN emotion NOT IN ('triumph', 'determination', 'intensity', 'focus', 'excitement', 'serenity') AND emotion IS NOT NULL THEN 1 END),
  COUNT(CASE WHEN emotion LIKE '%-%' THEN 1 END),
  COUNT(CASE WHEN emotion LIKE '%|%' THEN 1 END)
FROM photo_metadata

ORDER BY non_canonical_count DESC;

-- 6. CRITICAL ISSUES CHECK
-- ----------------------------------------
-- Expected: No rows returned (all critical issues resolved)
WITH critical_issues AS (
  SELECT
    photo_id,
    CASE
      WHEN emotion LIKE '%|%' THEN 'Multi-value emotion'
      WHEN time_of_day LIKE '%-%' THEN 'Hyphenated time_of_day'
      WHEN play_type NOT IN ('attack', 'block', 'dig', 'set', 'serve', 'celebration', 'transition') AND play_type IS NOT NULL THEN 'Invalid play_type'
      WHEN sport_type NOT IN ('volleyball', 'basketball', 'soccer', 'softball', 'football', 'baseball', 'track', 'portrait') AND sport_type IS NOT NULL THEN 'Invalid sport_type'
    END as issue_type
  FROM photo_metadata
  WHERE
    emotion LIKE '%|%'
    OR time_of_day LIKE '%-%'
    OR (play_type NOT IN ('attack', 'block', 'dig', 'set', 'serve', 'celebration', 'transition') AND play_type IS NOT NULL)
    OR (sport_type NOT IN ('volleyball', 'basketball', 'soccer', 'softball', 'football', 'baseball', 'track', 'portrait') AND sport_type IS NOT NULL)
)
SELECT
  issue_type,
  COUNT(*) as count
FROM critical_issues
GROUP BY issue_type
ORDER BY count DESC;

-- ===============================================
-- END OF VERIFICATION REPORT
-- ===============================================
