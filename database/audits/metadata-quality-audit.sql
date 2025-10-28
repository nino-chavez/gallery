/**
 * Comprehensive Metadata Quality Audit
 *
 * Purpose: Identify data quality issues across all filterable metadata fields
 * Run Date: 2025-10-28
 *
 * Checks for:
 * - Format inconsistencies (hyphens vs underscores)
 * - Multi-value strings where single values expected
 * - Non-canonical values
 * - NULL vs empty string issues
 * - Values outside expected enums
 */

-- =============================================================================
-- BUCKET 1: User-Facing Filterable Fields
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. SPORT_TYPE
-- -----------------------------------------------------------------------------
SELECT '1. SPORT_TYPE AUDIT' as audit_section;

-- Expected: volleyball, basketball, soccer, softball, football, baseball, track, portrait
-- Check for variants and issues
SELECT
  sport_type as value,
  COUNT(*) as count,
  CASE
    WHEN sport_type IN ('volleyball', 'basketball', 'soccer', 'softball', 'football', 'baseball', 'track', 'portrait') THEN '✅ Valid'
    WHEN sport_type LIKE '%-%' THEN '⚠️ Contains hyphens'
    WHEN sport_type LIKE '%|%' THEN '❌ Multi-value'
    WHEN sport_type IS NULL THEN '⚠️ NULL'
    WHEN sport_type = '' THEN '⚠️ Empty string'
    ELSE '❌ Non-canonical'
  END as status
FROM photo_metadata
WHERE sport_type IS NOT NULL
GROUP BY sport_type
ORDER BY count DESC;

-- -----------------------------------------------------------------------------
-- 2. PHOTO_CATEGORY
-- -----------------------------------------------------------------------------
SELECT '2. PHOTO_CATEGORY AUDIT' as audit_section;

-- Expected: action, celebration, candid, portrait, warmup, ceremony
SELECT
  photo_category as value,
  COUNT(*) as count,
  CASE
    WHEN photo_category IN ('action', 'celebration', 'candid', 'portrait', 'warmup', 'ceremony') THEN '✅ Valid'
    WHEN photo_category LIKE '%-%' THEN '⚠️ Contains hyphens'
    WHEN photo_category LIKE '%|%' THEN '❌ Multi-value'
    WHEN photo_category IS NULL THEN '⚠️ NULL'
    WHEN photo_category = '' THEN '⚠️ Empty string'
    ELSE '❌ Non-canonical'
  END as status
FROM photo_metadata
WHERE photo_category IS NOT NULL
GROUP BY photo_category
ORDER BY count DESC;

-- -----------------------------------------------------------------------------
-- 3. PLAY_TYPE
-- -----------------------------------------------------------------------------
SELECT '3. PLAY_TYPE AUDIT' as audit_section;

-- Expected: attack, block, dig, set, serve, celebration, transition
SELECT
  play_type as value,
  COUNT(*) as count,
  CASE
    WHEN play_type IN ('attack', 'block', 'dig', 'set', 'serve', 'celebration', 'transition') THEN '✅ Valid'
    WHEN play_type LIKE '%-%' THEN '⚠️ Contains hyphens'
    WHEN play_type LIKE '%|%' THEN '❌ Multi-value'
    WHEN play_type IS NULL THEN '⚠️ NULL'
    WHEN play_type = '' THEN '⚠️ Empty string'
    ELSE '❌ Non-canonical'
  END as status
FROM photo_metadata
WHERE play_type IS NOT NULL
GROUP BY play_type
ORDER BY count DESC;

-- -----------------------------------------------------------------------------
-- 4. ACTION_INTENSITY
-- -----------------------------------------------------------------------------
SELECT '4. ACTION_INTENSITY AUDIT' as audit_section;

-- Expected: low, medium, high, peak
SELECT
  action_intensity as value,
  COUNT(*) as count,
  CASE
    WHEN action_intensity IN ('low', 'medium', 'high', 'peak') THEN '✅ Valid'
    WHEN action_intensity LIKE '%-%' THEN '⚠️ Contains hyphens'
    WHEN action_intensity LIKE '%|%' THEN '❌ Multi-value'
    WHEN action_intensity IS NULL THEN '⚠️ NULL'
    WHEN action_intensity = '' THEN '⚠️ Empty string'
    ELSE '❌ Non-canonical'
  END as status
FROM photo_metadata
WHERE action_intensity IS NOT NULL
GROUP BY action_intensity
ORDER BY count DESC;

-- -----------------------------------------------------------------------------
-- 5. COMPOSITION (Already audited, but included for completeness)
-- -----------------------------------------------------------------------------
SELECT '5. COMPOSITION AUDIT' as audit_section;

-- Expected: rule_of_thirds, leading_lines, centered, symmetry, frame_within_frame
SELECT
  composition as value,
  COUNT(*) as count,
  CASE
    WHEN composition IN ('rule_of_thirds', 'leading_lines', 'centered', 'symmetry', 'frame_within_frame') THEN '✅ Valid'
    WHEN composition LIKE '%-%' THEN '⚠️ Contains hyphens'
    WHEN composition LIKE '%|%' THEN '❌ Multi-value'
    WHEN composition IS NULL THEN '⚠️ NULL'
    WHEN composition = '' THEN '⚠️ Empty string'
    ELSE '❌ Non-canonical'
  END as status
FROM photo_metadata
WHERE composition IS NOT NULL
GROUP BY composition
ORDER BY count DESC
LIMIT 50;

-- -----------------------------------------------------------------------------
-- 6. TIME_OF_DAY
-- -----------------------------------------------------------------------------
SELECT '6. TIME_OF_DAY AUDIT' as audit_section;

-- Expected: golden_hour, midday, evening, blue_hour, night, dawn
SELECT
  time_of_day as value,
  COUNT(*) as count,
  CASE
    WHEN time_of_day IN ('golden_hour', 'midday', 'evening', 'blue_hour', 'night', 'dawn') THEN '✅ Valid'
    WHEN time_of_day LIKE '%-%' THEN '⚠️ Contains hyphens'
    WHEN time_of_day LIKE '%|%' THEN '❌ Multi-value'
    WHEN time_of_day IS NULL THEN '⚠️ NULL'
    WHEN time_of_day = '' THEN '⚠️ Empty string'
    ELSE '❌ Non-canonical'
  END as status
FROM photo_metadata
WHERE time_of_day IS NOT NULL
GROUP BY time_of_day
ORDER BY count DESC;

-- -----------------------------------------------------------------------------
-- 7. LIGHTING
-- -----------------------------------------------------------------------------
SELECT '7. LIGHTING AUDIT' as audit_section;

-- Expected: natural, backlit, dramatic, soft, artificial
SELECT
  lighting as value,
  COUNT(*) as count,
  CASE
    WHEN lighting IN ('natural', 'backlit', 'dramatic', 'soft', 'artificial') THEN '✅ Valid'
    WHEN lighting LIKE '%-%' THEN '⚠️ Contains hyphens'
    WHEN lighting LIKE '%|%' THEN '❌ Multi-value'
    WHEN lighting IS NULL THEN '⚠️ NULL'
    WHEN lighting = '' THEN '⚠️ Empty string'
    ELSE '❌ Non-canonical'
  END as status
FROM photo_metadata
WHERE lighting IS NOT NULL
GROUP BY lighting
ORDER BY count DESC;

-- -----------------------------------------------------------------------------
-- 8. COLOR_TEMPERATURE
-- -----------------------------------------------------------------------------
SELECT '8. COLOR_TEMPERATURE AUDIT' as audit_section;

-- Expected: warm, cool, neutral
SELECT
  color_temperature as value,
  COUNT(*) as count,
  CASE
    WHEN color_temperature IN ('warm', 'cool', 'neutral') THEN '✅ Valid'
    WHEN color_temperature LIKE '%-%' THEN '⚠️ Contains hyphens'
    WHEN color_temperature LIKE '%|%' THEN '❌ Multi-value'
    WHEN color_temperature IS NULL THEN '⚠️ NULL'
    WHEN color_temperature = '' THEN '⚠️ Empty string'
    ELSE '❌ Non-canonical'
  END as status
FROM photo_metadata
WHERE color_temperature IS NOT NULL
GROUP BY color_temperature
ORDER BY count DESC;

-- =============================================================================
-- BUCKET 2: Internal Fields (For Reference)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 9. EMOTION
-- -----------------------------------------------------------------------------
SELECT '9. EMOTION AUDIT' as audit_section;

-- Expected: triumph, determination, intensity, focus, excitement, serenity
SELECT
  emotion as value,
  COUNT(*) as count,
  CASE
    WHEN emotion IN ('triumph', 'determination', 'intensity', 'focus', 'excitement', 'serenity') THEN '✅ Valid'
    WHEN emotion LIKE '%-%' THEN '⚠️ Contains hyphens'
    WHEN emotion LIKE '%|%' THEN '❌ Multi-value'
    WHEN emotion IS NULL THEN '⚠️ NULL'
    WHEN emotion = '' THEN '⚠️ Empty string'
    ELSE '❌ Non-canonical'
  END as status
FROM photo_metadata
WHERE emotion IS NOT NULL
GROUP BY emotion
ORDER BY count DESC;

-- -----------------------------------------------------------------------------
-- 10. TIME_IN_GAME
-- -----------------------------------------------------------------------------
SELECT '10. TIME_IN_GAME AUDIT' as audit_section;

-- Expected: first_5_min, middle, final_5_min, overtime, unknown
SELECT
  time_in_game as value,
  COUNT(*) as count,
  CASE
    WHEN time_in_game IN ('first_5_min', 'middle', 'final_5_min', 'overtime', 'unknown') THEN '✅ Valid'
    WHEN time_in_game LIKE '%-%' THEN '⚠️ Contains hyphens'
    WHEN time_in_game LIKE '%|%' THEN '❌ Multi-value'
    WHEN time_in_game IS NULL THEN '⚠️ NULL'
    WHEN time_in_game = '' THEN '⚠️ Empty string'
    ELSE '❌ Non-canonical'
  END as status
FROM photo_metadata
WHERE time_in_game IS NOT NULL
GROUP BY time_in_game
ORDER BY count DESC;

-- =============================================================================
-- SUMMARY: Data Quality Issues Count
-- =============================================================================

SELECT 'SUMMARY: DATA QUALITY ISSUES' as summary;

SELECT
  'sport_type' as field,
  COUNT(CASE WHEN sport_type NOT IN ('volleyball', 'basketball', 'soccer', 'softball', 'football', 'baseball', 'track', 'portrait') THEN 1 END) as non_canonical_count,
  COUNT(CASE WHEN sport_type LIKE '%-%' THEN 1 END) as hyphen_count,
  COUNT(CASE WHEN sport_type LIKE '%|%' THEN 1 END) as multi_value_count,
  COUNT(CASE WHEN sport_type = '' THEN 1 END) as empty_string_count
FROM photo_metadata
WHERE sport_type IS NOT NULL

UNION ALL

SELECT
  'photo_category' as field,
  COUNT(CASE WHEN photo_category NOT IN ('action', 'celebration', 'candid', 'portrait', 'warmup', 'ceremony') THEN 1 END),
  COUNT(CASE WHEN photo_category LIKE '%-%' THEN 1 END),
  COUNT(CASE WHEN photo_category LIKE '%|%' THEN 1 END),
  COUNT(CASE WHEN photo_category = '' THEN 1 END)
FROM photo_metadata
WHERE photo_category IS NOT NULL

UNION ALL

SELECT
  'play_type' as field,
  COUNT(CASE WHEN play_type NOT IN ('attack', 'block', 'dig', 'set', 'serve', 'celebration', 'transition') THEN 1 END),
  COUNT(CASE WHEN play_type LIKE '%-%' THEN 1 END),
  COUNT(CASE WHEN play_type LIKE '%|%' THEN 1 END),
  COUNT(CASE WHEN play_type = '' THEN 1 END)
FROM photo_metadata
WHERE play_type IS NOT NULL

UNION ALL

SELECT
  'action_intensity' as field,
  COUNT(CASE WHEN action_intensity NOT IN ('low', 'medium', 'high', 'peak') THEN 1 END),
  COUNT(CASE WHEN action_intensity LIKE '%-%' THEN 1 END),
  COUNT(CASE WHEN action_intensity LIKE '%|%' THEN 1 END),
  COUNT(CASE WHEN action_intensity = '' THEN 1 END)
FROM photo_metadata
WHERE action_intensity IS NOT NULL

UNION ALL

SELECT
  'composition' as field,
  COUNT(CASE WHEN composition NOT IN ('rule_of_thirds', 'leading_lines', 'centered', 'symmetry', 'frame_within_frame') THEN 1 END),
  COUNT(CASE WHEN composition LIKE '%-%' THEN 1 END),
  COUNT(CASE WHEN composition LIKE '%|%' THEN 1 END),
  COUNT(CASE WHEN composition = '' THEN 1 END)
FROM photo_metadata
WHERE composition IS NOT NULL

UNION ALL

SELECT
  'time_of_day' as field,
  COUNT(CASE WHEN time_of_day NOT IN ('golden_hour', 'midday', 'evening', 'blue_hour', 'night', 'dawn') THEN 1 END),
  COUNT(CASE WHEN time_of_day LIKE '%-%' THEN 1 END),
  COUNT(CASE WHEN time_of_day LIKE '%|%' THEN 1 END),
  COUNT(CASE WHEN time_of_day = '' THEN 1 END)
FROM photo_metadata
WHERE time_of_day IS NOT NULL

UNION ALL

SELECT
  'lighting' as field,
  COUNT(CASE WHEN lighting NOT IN ('natural', 'backlit', 'dramatic', 'soft', 'artificial') THEN 1 END),
  COUNT(CASE WHEN lighting LIKE '%-%' THEN 1 END),
  COUNT(CASE WHEN lighting LIKE '%|%' THEN 1 END),
  COUNT(CASE WHEN lighting = '' THEN 1 END)
FROM photo_metadata
WHERE lighting IS NOT NULL

UNION ALL

SELECT
  'color_temperature' as field,
  COUNT(CASE WHEN color_temperature NOT IN ('warm', 'cool', 'neutral') THEN 1 END),
  COUNT(CASE WHEN color_temperature LIKE '%-%' THEN 1 END),
  COUNT(CASE WHEN color_temperature LIKE '%|%' THEN 1 END),
  COUNT(CASE WHEN color_temperature = '' THEN 1 END)
FROM photo_metadata
WHERE color_temperature IS NOT NULL

ORDER BY non_canonical_count DESC;

-- =============================================================================
-- NULL/EMPTY COVERAGE ANALYSIS
-- =============================================================================

SELECT 'FIELD COVERAGE ANALYSIS' as coverage;

SELECT
  COUNT(*) as total_photos,
  COUNT(sport_type) as sport_type_populated,
  COUNT(photo_category) as photo_category_populated,
  COUNT(play_type) as play_type_populated,
  COUNT(action_intensity) as action_intensity_populated,
  COUNT(composition) as composition_populated,
  COUNT(time_of_day) as time_of_day_populated,
  COUNT(lighting) as lighting_populated,
  COUNT(color_temperature) as color_temperature_populated,
  ROUND(COUNT(sport_type) * 100.0 / COUNT(*), 2) as sport_type_pct,
  ROUND(COUNT(photo_category) * 100.0 / COUNT(*), 2) as photo_category_pct,
  ROUND(COUNT(play_type) * 100.0 / COUNT(*), 2) as play_type_pct,
  ROUND(COUNT(action_intensity) * 100.0 / COUNT(*), 2) as action_intensity_pct,
  ROUND(COUNT(composition) * 100.0 / COUNT(*), 2) as composition_pct,
  ROUND(COUNT(time_of_day) * 100.0 / COUNT(*), 2) as time_of_day_pct,
  ROUND(COUNT(lighting) * 100.0 / COUNT(*), 2) as lighting_pct,
  ROUND(COUNT(color_temperature) * 100.0 / COUNT(*), 2) as color_temperature_pct
FROM photo_metadata;
