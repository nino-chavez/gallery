/**
 * Migration: Normalize Composition Values
 *
 * Purpose: Fix inconsistent composition data from AI enrichment
 *
 * Issues being fixed:
 * 1. Hyphens instead of underscores (rule-of-thirds → rule_of_thirds)
 * 2. Multi-value strings (close-up|dramatic-angle → extract primary)
 * 3. Non-canonical values (frame-within-a-frame → frame_within_frame)
 * 4. Variations (centered-subject → centered)
 *
 * Canonical values: rule_of_thirds, leading_lines, centered, symmetry, frame_within_frame
 */

-- Step 1: Backup existing composition data
CREATE TABLE IF NOT EXISTS composition_backup_20251028 AS
SELECT photo_id, composition, enriched_at
FROM photo_metadata
WHERE composition IS NOT NULL;

-- Step 2: Create mapping function to normalize composition values
CREATE OR REPLACE FUNCTION normalize_composition(raw_composition TEXT)
RETURNS TEXT AS $$
DECLARE
  normalized TEXT;
  primary_value TEXT;
BEGIN
  -- Handle NULL or empty
  IF raw_composition IS NULL OR raw_composition = '' THEN
    RETURN NULL;
  END IF;

  -- Extract primary value from multi-value strings (take first value before |)
  primary_value := SPLIT_PART(raw_composition, '|', 1);

  -- Replace hyphens with underscores
  normalized := REPLACE(primary_value, '-', '_');

  -- Map common variations to canonical values
  normalized := CASE
    -- Rule of thirds variants
    WHEN normalized LIKE '%rule%third%' THEN 'rule_of_thirds'

    -- Leading lines variants
    WHEN normalized LIKE '%leading%line%' THEN 'leading_lines'

    -- Centered variants
    WHEN normalized IN ('centered', 'center_focus', 'center_weighted',
                        'centered_subject', 'central_focus', 'central_framing',
                        'centralized') THEN 'centered'

    -- Symmetry variants
    WHEN normalized = 'symmetry' THEN 'symmetry'

    -- Frame within frame variants
    WHEN normalized LIKE '%frame%frame%' OR
         normalized LIKE '%framing%' OR
         normalized = 'natural_framing' THEN 'frame_within_frame'

    -- Close-up is not a composition type - map to centered as default
    WHEN normalized = 'close_up' THEN 'centered'

    -- Dramatic angle is not a composition type - map to rule_of_thirds as default
    WHEN normalized = 'dramatic_angle' THEN 'rule_of_thirds'

    -- Motion blur is not a composition type - map to leading_lines as default
    WHEN normalized = 'motion_blur' THEN 'leading_lines'

    -- Wide angle is not a composition type - map to rule_of_thirds as default
    WHEN normalized = 'wide_angle' THEN 'rule_of_thirds'

    -- Shallow DOF variants - map to centered as default
    WHEN normalized LIKE '%shallow%' OR normalized LIKE '%depth%field%' THEN 'centered'

    -- Unknown/unmapped values - keep as NULL (requires manual re-enrichment)
    ELSE NULL
  END;

  -- Validate against canonical values
  IF normalized NOT IN ('rule_of_thirds', 'leading_lines', 'centered', 'symmetry', 'frame_within_frame') THEN
    RETURN NULL;
  END IF;

  RETURN normalized;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 3: Preview the changes (comment out to skip preview)
SELECT
  composition AS original,
  normalize_composition(composition) AS normalized,
  COUNT(*) as count
FROM photo_metadata
WHERE composition IS NOT NULL
GROUP BY composition, normalize_composition(composition)
ORDER BY count DESC
LIMIT 50;

-- Step 4: Apply normalization (UNCOMMENT TO RUN)
/*
UPDATE photo_metadata
SET composition = normalize_composition(composition)
WHERE composition IS NOT NULL;
*/

-- Step 5: Validation queries
/*
-- Count of photos by normalized composition
SELECT
  composition,
  COUNT(*) as photo_count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM photo_metadata WHERE composition IS NOT NULL), 2) as percentage
FROM photo_metadata
WHERE composition IS NOT NULL
GROUP BY composition
ORDER BY photo_count DESC;

-- Photos that couldn't be normalized (NULL after normalization)
SELECT
  photo_id,
  composition
FROM composition_backup_20251028
WHERE composition IS NOT NULL
  AND photo_id IN (
    SELECT photo_id
    FROM photo_metadata
    WHERE composition IS NULL
  )
LIMIT 20;
*/

-- Step 6: Add CHECK constraint to enforce canonical values (UNCOMMENT AFTER VALIDATION)
/*
ALTER TABLE photo_metadata
ADD CONSTRAINT composition_valid_values
CHECK (
  composition IS NULL OR
  composition IN ('rule_of_thirds', 'leading_lines', 'centered', 'symmetry', 'frame_within_frame')
);
*/

-- Cleanup function after validation
/*
DROP FUNCTION IF EXISTS normalize_composition(TEXT);
DROP TABLE IF EXISTS composition_backup_20251028;
*/
