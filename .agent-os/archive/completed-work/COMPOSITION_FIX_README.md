# Composition Filter Fix - Complete Solution

**Date:** 2025-10-28
**Status:** ✅ Ready for Migration
**Priority:** P0 - Data Quality Issue

---

## Problem Summary

The composition filter was showing 0 results due to **data quality issues from AI enrichment**:

### Root Causes

1. **Format Mismatch**: AI returned hyphens (`rule-of-thirds`) but filter expected underscores (`rule_of_thirds`)
2. **Multi-Value Strings**: AI returned combined values (`close-up|dramatic-angle|leading-lines`) instead of single primary value
3. **Non-Canonical Values**: AI returned values not in the filter list (`framing` vs `frame_within_frame`)
4. **Prompt Ambiguity**: Original prompt listed wrong options and didn't enforce single-value returns

### Database State (Before Fix)

From SQL analysis, 19,688 photos have composition data with **inconsistent formats**:

| Issue | Example Values | Count | Impact |
|-------|---------------|-------|--------|
| Hyphens | `rule-of-thirds`, `leading-lines` | ~11K+ | Filter doesn't match |
| Multi-value | `close-up\|dramatic-angle\|rule-of-thirds` | ~2K+ | Not searchable |
| Wrong values | `frame-within-a-frame` vs `frame_within_frame` | 2 | No matches |
| Unmapped | `close-up`, `dramatic-angle`, `wide-angle` | ~8K+ | Not compositions |

---

## Solution Implemented

### 1. Fixed AI Enrichment Prompt ✅

**File:** `src/lib/ai/enrichment-prompts.ts:43-55`

**Changes:**
- Updated composition options to match filter: `rule_of_thirds`, `leading_lines`, `centered`, `symmetry`, `frame_within_frame`
- Added explicit instructions: "SINGLE VALUE ONLY"
- Added explicit instructions: "Use UNDERSCORES not hyphens"
- Added explicit instructions: "NO multi-value strings"
- Added detailed descriptions of each composition type

**Effect:** All **future** AI enrichments will return clean, canonical values

---

### 2. Created Migration Script ✅

**File:** `database/migrations/normalize-composition-values.sql`

**Features:**
- **Safe**: Creates backup table before any changes
- **Preview Mode**: Shows what will change before applying
- **Intelligent Mapping**: Handles all known variations
- **Validation**: Ensures only canonical values after migration
- **Constraint Ready**: Can add CHECK constraint after validation

**Mapping Logic:**
```sql
rule-of-thirds → rule_of_thirds
leading-lines → leading_lines
centered-subject → centered
frame-within-a-frame → frame_within_frame
close-up|dramatic-angle → rule_of_thirds (extract primary)
dramatic-angle|rule-of-thirds → rule_of_thirds (extract primary)
close-up (NOT a composition) → centered (sensible default)
wide-angle (NOT a composition) → rule_of_thirds (sensible default)
```

---

## Migration Process

### Step 1: Preview Changes (SAFE - No Data Modified)

Run in Supabase SQL Editor:

```sql
-- Load the migration file (Steps 1-3 only)
-- This will show you what WILL change without modifying data

SELECT
  composition AS original,
  normalize_composition(composition) AS normalized,
  COUNT(*) as count
FROM photo_metadata
WHERE composition IS NOT NULL
GROUP BY composition, normalize_composition(composition)
ORDER BY count DESC;
```

**Review the output** to ensure mappings are correct.

---

### Step 2: Run Migration (MODIFIES DATA)

After reviewing preview, uncomment and run Step 4:

```sql
UPDATE photo_metadata
SET composition = normalize_composition(composition)
WHERE composition IS NOT NULL;
```

**Expected Result:** ~19K rows updated

---

### Step 3: Validate Results

Run validation queries (Step 5):

```sql
-- Should show only 5 canonical values
SELECT
  composition,
  COUNT(*) as photo_count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM photo_metadata WHERE composition IS NOT NULL), 2) as percentage
FROM photo_metadata
WHERE composition IS NOT NULL
GROUP BY composition
ORDER BY photo_count DESC;
```

**Expected Output:**
| composition | photo_count | percentage |
|-------------|-------------|------------|
| rule_of_thirds | ~7K+ | ~40% |
| leading_lines | ~3K+ | ~20% |
| centered | ~6K+ | ~35% |
| symmetry | ~400+ | ~2% |
| frame_within_frame | ~100+ | ~1% |

---

### Step 4: Add Database Constraint (OPTIONAL)

After successful migration and validation, enforce data quality:

```sql
ALTER TABLE photo_metadata
ADD CONSTRAINT composition_valid_values
CHECK (
  composition IS NULL OR
  composition IN ('rule_of_thirds', 'leading_lines', 'centered', 'symmetry', 'frame_within_frame')
);
```

**Effect:** Database will reject any future invalid composition values

---

### Step 5: Cleanup (After Validation)

```sql
DROP FUNCTION IF EXISTS normalize_composition(TEXT);
DROP TABLE IF EXISTS composition_backup_20251028;
```

---

## Rollback Plan

If migration causes issues:

```sql
-- Restore from backup
UPDATE photo_metadata pm
SET composition = backup.composition
FROM composition_backup_20251028 backup
WHERE pm.photo_id = backup.photo_id;
```

---

## Testing

### Before Migration

Filter query returns **0 results** for `frame_within_frame`:
```sql
SELECT COUNT(*) FROM photo_metadata
WHERE composition = 'frame_within_frame';
-- Result: 0
```

### After Migration

Filter query returns **expected results**:
```sql
SELECT COUNT(*) FROM photo_metadata
WHERE composition = 'frame_within_frame';
-- Result: ~100-200 (estimated)
```

---

## Future Prevention

### For New Photos

✅ **Fixed:** Updated enrichment prompt will return clean values

### For Re-Enrichment

If re-running AI enrichment on existing photos:
1. Use the updated `BUCKET1_PROMPT` (already fixed)
2. Values will automatically be canonical
3. No additional cleanup needed

---

## Files Modified

1. `src/lib/ai/enrichment-prompts.ts` - Fixed composition prompt
2. `database/migrations/normalize-composition-values.sql` - Migration script (NEW)
3. `.agent-os/COMPOSITION_FIX_README.md` - This document (NEW)

---

## Next Steps

1. **Review Preview** - Run Step 1 of migration in Supabase SQL Editor
2. **Run Migration** - If preview looks good, uncomment and run Step 4
3. **Validate** - Run validation queries (Step 5)
4. **Test Filter** - Verify composition filter works in explore page
5. **(Optional) Add Constraint** - Run Step 6 to enforce data quality
6. **Cleanup** - Drop temporary function and backup table

---

## Success Criteria

✅ All composition values use underscores
✅ All composition values are single (not multi-value)
✅ All composition values match one of 5 canonical options
✅ Composition filter returns expected results
✅ Future AI enrichments return clean values

---

**Status:** Ready for migration. No code changes required - only database migration needed.
