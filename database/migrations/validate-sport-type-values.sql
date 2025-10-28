-- Migration: Validate and fix sport_type values
-- Purpose: Identify and log non-canonical sport_type values for manual review
-- Expected canonical values: volleyball, basketball, soccer, softball, football, baseball, track, portrait
-- Date: 2025-10-28

-- Summary:
-- This migration identifies non-canonical sport_type values (712 rows)
-- Since we don't have the specific breakdown, we create a validation query
-- Manual review required to determine correct mappings

-- Create a temporary table to log non-canonical values for review
BEGIN;

-- Step 1: Create audit log of non-canonical values (if table doesn't exist)
CREATE TABLE IF NOT EXISTS sport_type_audit (
  photo_id TEXT PRIMARY KEY,
  original_sport_type TEXT,
  suggested_sport_type TEXT,
  audit_timestamp TIMESTAMP DEFAULT NOW()
);

-- Step 2: Insert non-canonical values into audit table
INSERT INTO sport_type_audit (photo_id, original_sport_type, suggested_sport_type)
SELECT
  photo_id,
  sport_type,
  CASE
    -- Common misspellings or variations
    WHEN LOWER(sport_type) LIKE '%volley%' THEN 'volleyball'
    WHEN LOWER(sport_type) LIKE '%basket%' THEN 'basketball'
    WHEN LOWER(sport_type) LIKE '%soccer%' OR LOWER(sport_type) LIKE '%futbol%' THEN 'soccer'
    WHEN LOWER(sport_type) LIKE '%soft%' THEN 'softball'
    WHEN LOWER(sport_type) LIKE '%foot%' AND sport_type != 'football' THEN 'football'
    WHEN LOWER(sport_type) LIKE '%base%' THEN 'baseball'
    WHEN LOWER(sport_type) LIKE '%track%' OR LOWER(sport_type) LIKE '%field%' THEN 'track'
    WHEN LOWER(sport_type) LIKE '%portrait%' OR LOWER(sport_type) LIKE '%headshot%' THEN 'portrait'
    -- Generic or unclear
    WHEN sport_type IN ('action', 'sports', 'game', 'match') THEN NULL -- Requires manual review
    ELSE NULL -- Unknown, requires manual review
  END
FROM photo_metadata
WHERE sport_type IS NOT NULL
  AND sport_type NOT IN ('volleyball', 'basketball', 'soccer', 'softball', 'football', 'baseball', 'track', 'portrait')
ON CONFLICT (photo_id) DO UPDATE
  SET original_sport_type = EXCLUDED.original_sport_type,
      suggested_sport_type = EXCLUDED.suggested_sport_type,
      audit_timestamp = NOW();

-- Step 3: Apply automatic fixes for clear cases
UPDATE photo_metadata pm
SET sport_type = sta.suggested_sport_type
FROM sport_type_audit sta
WHERE pm.photo_id = sta.photo_id
  AND sta.suggested_sport_type IS NOT NULL;

-- Step 4: Report what needs manual review
-- Uncomment to see what needs manual review:
-- SELECT
--   original_sport_type,
--   suggested_sport_type,
--   COUNT(*) as count
-- FROM sport_type_audit
-- GROUP BY original_sport_type, suggested_sport_type
-- ORDER BY count DESC;

COMMIT;

-- Verification query (run after migration)
-- SELECT
--   sport_type,
--   COUNT(*) as count,
--   CASE
--     WHEN sport_type IN ('volleyball', 'basketball', 'soccer', 'softball', 'football', 'baseball', 'track', 'portrait') THEN '✅ Valid'
--     WHEN sport_type IS NULL THEN '⚠️ NULL (acceptable)'
--     ELSE '❌ Non-canonical'
--   END as status
-- FROM photo_metadata
-- GROUP BY sport_type
-- ORDER BY count DESC;

-- To review items that still need manual attention:
-- SELECT * FROM sport_type_audit WHERE suggested_sport_type IS NULL ORDER BY original_sport_type;

-- After manual review, apply fixes like:
-- UPDATE photo_metadata SET sport_type = 'volleyball' WHERE photo_id IN (SELECT photo_id FROM sport_type_audit WHERE original_sport_type = 'specific_value');

-- Drop audit table when complete:
-- DROP TABLE sport_type_audit;
