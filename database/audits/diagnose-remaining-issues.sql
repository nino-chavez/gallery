-- Diagnostic Query: Identify remaining non-canonical values
-- Purpose: Show exactly which values are still invalid after migrations
-- Date: 2025-10-28

-- PLAY_TYPE: Show remaining invalid values
SELECT
  'PLAY_TYPE REMAINING ISSUES' as section,
  play_type,
  COUNT(*) as count
FROM photo_metadata
WHERE play_type NOT IN ('attack', 'block', 'dig', 'set', 'serve', 'celebration', 'transition')
  AND play_type IS NOT NULL
GROUP BY play_type
ORDER BY count DESC;

-- SPORT_TYPE: Show remaining invalid values
SELECT
  'SPORT_TYPE REMAINING ISSUES' as section,
  sport_type,
  COUNT(*) as count
FROM photo_metadata
WHERE sport_type NOT IN ('volleyball', 'basketball', 'soccer', 'softball', 'football', 'baseball', 'track', 'portrait')
  AND sport_type IS NOT NULL
GROUP BY sport_type
ORDER BY count DESC;

-- EMOTION: Show remaining invalid values
SELECT
  'EMOTION REMAINING ISSUES' as section,
  emotion,
  COUNT(*) as count
FROM photo_metadata
WHERE emotion NOT IN ('triumph', 'determination', 'intensity', 'focus', 'excitement', 'serenity')
  AND emotion IS NOT NULL
GROUP BY emotion
ORDER BY count DESC
LIMIT 20;

-- TIME_OF_DAY: Show remaining invalid values
SELECT
  'TIME_OF_DAY REMAINING ISSUES' as section,
  time_of_day,
  COUNT(*) as count
FROM photo_metadata
WHERE time_of_day NOT IN ('golden_hour', 'midday', 'evening', 'blue_hour', 'night', 'dawn')
  AND time_of_day IS NOT NULL
GROUP BY time_of_day
ORDER BY count DESC;
