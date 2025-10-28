/**
 * Migration: Fix Sport Type Misclassifications
 *
 * Purpose: Correct albums where photos were incorrectly classified as volleyball
 * when they should be other sports or non-sports categories
 *
 * Common Issues:
 * 1. Dog/pet photos classified as volleyball
 * 2. Bowling photos classified as volleyball
 * 3. Other non-volleyball sports misclassified
 *
 * Strategy:
 * - Identify albums by name patterns that are clearly not volleyball
 * - Update sport_type to correct value based on album name/context
 * - Refresh materialized view to update album pills
 */

-- Step 1: Preview albums that might be misclassified
-- Look for albums with volleyball as primary sport but non-volleyball names
SELECT
  album_key,
  album_name,
  primary_sport,
  photo_count
FROM albums_summary
WHERE primary_sport = 'volleyball'
  AND (
    album_name ILIKE '%dog%' OR
    album_name ILIKE '%pet%' OR
    album_name ILIKE '%bowl%' OR
    album_name ILIKE '%puppy%' OR
    album_name ILIKE '%canine%'
  )
ORDER BY album_name;

-- Step 2: Identify specific albums that need correction
-- (MANUAL REVIEW REQUIRED - uncomment and adjust album_keys after review)

/*
-- Example corrections based on album name patterns:

-- Dogs/Pets -> 'other' or 'portrait'
UPDATE photo_metadata
SET sport_type = 'other'
WHERE album_key IN (
  -- Add album_keys for dog/pet albums here
  'album-key-1',
  'album-key-2'
);

-- Bowling -> 'other' or create 'bowling' category if desired
UPDATE photo_metadata
SET sport_type = 'other'
WHERE album_key IN (
  -- Add album_keys for bowling albums here
  'album-key-3'
);
*/

-- Step 3: After corrections, refresh the materialized view
/*
REFRESH MATERIALIZED VIEW albums_summary;
*/

-- Step 4: Validation - Check if corrections worked
/*
SELECT
  album_key,
  album_name,
  primary_sport,
  photo_count
FROM albums_summary
WHERE album_key IN (
  -- List corrected album_keys here
  'album-key-1',
  'album-key-2',
  'album-key-3'
)
ORDER BY album_name;
*/

-- Step 5: Alternative approach - Query actual photo metadata to identify issues
-- This helps find patterns in misclassifications
SELECT
  album_name,
  sport_type,
  COUNT(*) as photo_count,
  array_agg(DISTINCT photo_category) as categories
FROM photo_metadata
WHERE album_name IS NOT NULL
  AND (
    album_name ILIKE '%dog%' OR
    album_name ILIKE '%pet%' OR
    album_name ILIKE '%bowl%' OR
    album_name ILIKE '%puppy%'
  )
GROUP BY album_name, sport_type
ORDER BY album_name, photo_count DESC;
