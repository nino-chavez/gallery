-- ============================================
-- Add Image Dimension Columns to photo_metadata
-- ============================================
-- Purpose: Store width, height, and aspect ratio for smart hero photo selection
-- Data Source: SmugMug API (ArchivedSize field)
--
-- Usage:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Run the backfill script: scripts/backfill-dimensions.ts
-- 3. Update hero query to filter by aspect_ratio > 1.0 (landscape)
--
-- Author: Claude Code
-- Date: 2025-10-31
-- ============================================

-- Add width column (pixels)
ALTER TABLE photo_metadata
ADD COLUMN IF NOT EXISTS width INTEGER;

-- Add height column (pixels)
ALTER TABLE photo_metadata
ADD COLUMN IF NOT EXISTS height INTEGER;

-- Add aspect_ratio column (computed: width / height)
-- Values: >1.0 = landscape, <1.0 = portrait, =1.0 = square
ALTER TABLE photo_metadata
ADD COLUMN IF NOT EXISTS aspect_ratio DECIMAL(5,2);

-- Add index for hero photo queries (filter by aspect ratio)
CREATE INDEX IF NOT EXISTS idx_photo_metadata_aspect_ratio
ON photo_metadata(aspect_ratio)
WHERE sharpness IS NOT NULL;

-- Add index for landscape photos (aspect_ratio > 1.0)
CREATE INDEX IF NOT EXISTS idx_photo_metadata_landscape
ON photo_metadata(sport_type, aspect_ratio, emotional_impact DESC)
WHERE aspect_ratio > 1.0 AND sharpness IS NOT NULL;

-- Comment the new columns
COMMENT ON COLUMN photo_metadata.width IS 'Image width in pixels (from SmugMug ArchivedSize)';
COMMENT ON COLUMN photo_metadata.height IS 'Image height in pixels (from SmugMug ArchivedSize)';
COMMENT ON COLUMN photo_metadata.aspect_ratio IS 'Width / Height ratio. >1.0 = landscape, <1.0 = portrait, =1.0 = square';

-- ============================================
-- VERIFY MIGRATION
-- ============================================

-- Check new columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'photo_metadata'
  AND column_name IN ('width', 'height', 'aspect_ratio');

-- Check indexes created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'photo_metadata'
  AND indexname LIKE '%aspect%';

-- ============================================
-- EXAMPLE QUERIES (After Backfill)
-- ============================================

/*
-- Count photos by orientation
SELECT
    CASE
        WHEN aspect_ratio > 1.2 THEN 'Landscape'
        WHEN aspect_ratio < 0.8 THEN 'Portrait'
        ELSE 'Square'
    END as orientation,
    COUNT(*) as count,
    ROUND(AVG(aspect_ratio), 2) as avg_ratio
FROM photo_metadata
WHERE aspect_ratio IS NOT NULL
GROUP BY orientation
ORDER BY count DESC;

-- Hero-eligible landscape photos
SELECT COUNT(*)
FROM photo_metadata
WHERE sport_type = 'volleyball'
    AND aspect_ratio > 1.0  -- Landscape only
    AND sharpness >= 7.5
    AND emotional_impact >= 7.0
    AND sharpness IS NOT NULL;

-- Sample landscape photos for hero
SELECT
    photo_id,
    image_key,
    width,
    height,
    aspect_ratio,
    sharpness,
    emotional_impact
FROM photo_metadata
WHERE sport_type = 'volleyball'
    AND aspect_ratio > 1.0
    AND sharpness >= 7.5
ORDER BY emotional_impact DESC
LIMIT 10;
*/
