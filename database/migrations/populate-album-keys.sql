-- Migration: Populate album_key in photo_metadata
--
-- Purpose: Extract album_key from ImageUrl if not already set.
-- This is required for album sync functionality between SmugMug and Supabase.
--
-- Run: psql -d your_database -f database/migrations/populate-album-keys.sql
--
-- Date: 2025-10-28

BEGIN;

-- Step 1: Check current state
SELECT
  COUNT(*) as total_photos,
  COUNT(*) FILTER (WHERE album_key IS NOT NULL) as with_album_key,
  COUNT(*) FILTER (WHERE album_key IS NULL) as without_album_key
FROM photo_metadata;

-- Step 2: Extract album_key from ImageUrl for rows where album_key is NULL
--
-- Assumes ImageUrl format: https://photos.smugmug.com/photos/{album_key}/{image_key}-{size}.jpg
-- Or: https://{custom-domain}/photos/{album_key}/{image_key}-{size}.jpg
--
-- Examples:
--   https://photos.smugmug.com/photos/i-HtxsgN/0/5472x3648/X3/i-HtxsgN-X3.jpg
--   Album key is "i-HtxsgN" (first occurrence after /photos/)

UPDATE photo_metadata
SET album_key = (
  SELECT
    CASE
      -- Extract first path segment after /photos/
      WHEN ImageUrl ~ '^https?://[^/]+/photos/([^/]+)' THEN
        (regexp_matches(ImageUrl, '^https?://[^/]+/photos/([^/]+)', 'i'))[1]
      ELSE NULL
    END
)
WHERE album_key IS NULL
  AND ImageUrl IS NOT NULL
  AND ImageUrl ~ '^https?://[^/]+/photos/';

-- Step 3: Verify extraction worked
SELECT
  COUNT(*) as total_photos,
  COUNT(*) FILTER (WHERE album_key IS NOT NULL) as with_album_key,
  COUNT(*) FILTER (WHERE album_key IS NULL) as without_album_key,
  COUNT(*) FILTER (WHERE album_key IS NULL AND ImageUrl IS NOT NULL) as missing_but_has_url
FROM photo_metadata;

-- Step 4: Show sample of extracted album_keys
SELECT
  album_key,
  COUNT(*) as photo_count,
  MIN(album_name) as example_album_name
FROM photo_metadata
WHERE album_key IS NOT NULL
GROUP BY album_key
ORDER BY photo_count DESC
LIMIT 10;

-- Step 5: Create index for album sync operations (if not exists)
CREATE INDEX IF NOT EXISTS idx_photo_metadata_album_key
  ON photo_metadata(album_key)
  WHERE album_key IS NOT NULL;

-- Step 6: Create index for album name updates
CREATE INDEX IF NOT EXISTS idx_photo_metadata_album_key_name
  ON photo_metadata(album_key, album_name)
  WHERE album_key IS NOT NULL;

COMMIT;

-- Verification queries to run manually after migration:

-- Check albums with inconsistent names (photos in same album with different album_name)
/*
SELECT
  album_key,
  COUNT(DISTINCT album_name) as distinct_names,
  array_agg(DISTINCT album_name) as names,
  COUNT(*) as photo_count
FROM photo_metadata
WHERE album_key IS NOT NULL
GROUP BY album_key
HAVING COUNT(DISTINCT album_name) > 1
ORDER BY photo_count DESC
LIMIT 20;
*/

-- Check most common album keys
/*
SELECT
  album_key,
  album_name,
  COUNT(*) as photo_count
FROM photo_metadata
WHERE album_key IS NOT NULL
GROUP BY album_key, album_name
ORDER BY photo_count DESC
LIMIT 20;
*/

-- Check photos without album_key
/*
SELECT
  image_key,
  ImageUrl,
  album_name,
  photo_date
FROM photo_metadata
WHERE album_key IS NULL
LIMIT 10;
*/
