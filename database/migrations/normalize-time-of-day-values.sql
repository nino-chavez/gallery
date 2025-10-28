-- Migration: Normalize time_of_day values
-- Purpose: Convert non-canonical time_of_day values to canonical values
-- Expected canonical values: golden_hour, midday, evening, blue_hour, night, dawn
-- Date: 2025-10-28

-- Summary of changes:
-- afternoon -> evening (5,547 rows)
-- golden-hour -> golden_hour (274 rows)
-- morning -> dawn (47 rows)
-- mid-game, mid-action, game-time, game-break, in-game, action-shot, game-action, game-play -> midday (72 rows total)
-- day, daytime -> midday (37 rows)
-- late-afternoon, pre-game, action, training -> evening (4 rows)

BEGIN;

-- 1. afternoon -> evening (most common non-canonical value)
UPDATE photo_metadata
SET time_of_day = 'evening'
WHERE time_of_day = 'afternoon';

-- 2. golden-hour -> golden_hour (fix hyphen to underscore)
UPDATE photo_metadata
SET time_of_day = 'golden_hour'
WHERE time_of_day = 'golden-hour';

-- 3. morning -> dawn (early daytime)
UPDATE photo_metadata
SET time_of_day = 'dawn'
WHERE time_of_day = 'morning';

-- 4. Generic game/action times -> midday (contextual game photos)
UPDATE photo_metadata
SET time_of_day = 'midday'
WHERE time_of_day IN (
  'mid-game', 'mid-action', 'game-time', 'game-break',
  'in-game', 'action-shot', 'game-action', 'game-play',
  'day', 'daytime', 'game'
);

-- 5. Late afternoon and pre-game -> evening
UPDATE photo_metadata
SET time_of_day = 'evening'
WHERE time_of_day IN ('late-afternoon', 'pre-game', 'action', 'training');

-- Verification query (run after migration)
-- SELECT
--   time_of_day,
--   COUNT(*) as count,
--   CASE
--     WHEN time_of_day IN ('golden_hour', 'midday', 'evening', 'blue_hour', 'night', 'dawn') THEN '✅ Valid'
--     ELSE '❌ Non-canonical'
--   END as status
-- FROM photo_metadata
-- WHERE time_of_day IS NOT NULL
-- GROUP BY time_of_day
-- ORDER BY count DESC;

COMMIT;

-- Expected results after migration:
-- All time_of_day values should be one of: golden_hour, midday, evening, blue_hour, night, dawn
-- Non-canonical count should be 0
-- Hyphen count should be 0
