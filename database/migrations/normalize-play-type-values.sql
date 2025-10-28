-- Migration: Normalize play_type values
-- Purpose: Convert non-canonical play_type values to canonical values
-- Expected canonical values: attack, block, dig, set, serve, celebration, transition
-- Date: 2025-10-28

-- Summary of changes:
-- null (string literal) -> NULL (3,078 rows)
-- pass -> dig (1,531 rows) - defensive play
-- timeout -> celebration (915 rows) - team gathering moment
-- action, play -> attack (3 rows total) - generic action photos
-- joust, cutback, swing, tackle, roll, kick, defense -> transition (7 rows) - non-standard plays

BEGIN;

-- 1. Convert string literal 'null' to actual NULL
UPDATE photo_metadata
SET play_type = NULL
WHERE play_type = 'null';

-- 2. pass -> dig (defensive play where player passes the ball)
UPDATE photo_metadata
SET play_type = 'dig'
WHERE play_type = 'pass';

-- 3. timeout -> celebration (team gathering, similar energy)
UPDATE photo_metadata
SET play_type = 'celebration'
WHERE play_type = 'timeout';

-- 4. Generic action/play -> attack (most common action shot)
UPDATE photo_metadata
SET play_type = 'attack'
WHERE play_type IN ('action', 'play');

-- 5. Non-standard plays -> transition (miscellaneous movement)
UPDATE photo_metadata
SET play_type = 'transition'
WHERE play_type IN (
  'joust', 'cutback', 'swing', 'tackle',
  'roll', 'kick', 'defense'
);

-- Verification query (run after migration)
-- SELECT
--   play_type,
--   COUNT(*) as count,
--   CASE
--     WHEN play_type IN ('attack', 'block', 'dig', 'set', 'serve', 'celebration', 'transition') THEN '✅ Valid'
--     WHEN play_type IS NULL THEN '⚠️ NULL (acceptable)'
--     ELSE '❌ Non-canonical'
--   END as status
-- FROM photo_metadata
-- GROUP BY play_type
-- ORDER BY count DESC;

COMMIT;

-- Expected results after migration:
-- All play_type values should be one of: attack, block, dig, set, serve, celebration, transition, NULL
-- Non-canonical count should be 0
-- pass (1,531) should be added to dig count
-- timeout (915) should be added to celebration count
-- null (3,078) should become actual NULL values
