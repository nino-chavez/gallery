# Data Quality Remediation Guide

**Created:** 2025-10-28
**Purpose:** Normalize non-canonical values in photo_metadata table

## Overview

This document describes the data quality issues identified in the gallery database and the migrations created to remediate them.

## Issues Identified

### Critical Issues (Require Immediate Remediation)

1. **time_of_day** - 5,963 non-canonical values (30% of data)
   - 326 values with hyphens (e.g., `golden-hour`)
   - 5,637 non-canonical values (e.g., `afternoon`, `morning`)

2. **play_type** - 5,534 non-canonical values (35% of data)
   - String literal `'null'` instead of actual NULL (3,078 rows)
   - `pass`, `timeout`, and generic action terms

3. **emotion** - ~1,000 multi-value contaminated rows
   - Pipe-delimited values (e.g., `focus|determination|intensity`)
   - Non-canonical single values (e.g., `joy`, `playfulness`)

4. **sport_type** - 712 non-canonical values (3% of data)
   - Requires manual review to identify specific issues

### Clean Fields (No Action Required)

- `composition` ✅
- `lighting` ✅
- `color_temperature` ✅
- `photo_category` ✅
- `action_intensity` ✅

## Migration Scripts

### 1. normalize-time-of-day-values.sql

**Remediations:**
- `afternoon` → `evening` (5,547 rows)
- `golden-hour` → `golden_hour` (274 rows)
- `morning` → `dawn` (47 rows)
- Game/action context → `midday` (72 rows)
- Generic daytime → `midday` (37 rows)

**Expected Result:**
All values should be: `golden_hour`, `midday`, `evening`, `blue_hour`, `night`, `dawn`

### 2. normalize-play-type-values.sql

**Remediations:**
- String `'null'` → actual NULL (3,078 rows)
- `pass` → `dig` (1,531 rows)
- `timeout` → `celebration` (915 rows)
- Generic actions → `attack` (3 rows)
- Non-standard plays → `transition` (7 rows)

**Expected Result:**
All non-NULL values should be: `attack`, `block`, `dig`, `set`, `serve`, `celebration`, `transition`

### 3. validate-sport-type-values.sql

**Approach:**
- Creates audit table `sport_type_audit`
- Applies automatic fixes for clear cases
- Flags unclear values for manual review

**Expected Result:**
Most values should be: `volleyball`, `basketball`, `soccer`, `softball`, `football`, `baseball`, `track`, `portrait`

Some values may require manual review.

### 4. normalize-emotion-values.sql

**Remediations:**

**Multi-value cleanup:**
- Extracts first canonical emotion from pipe-delimited strings
- Prioritizes most dominant emotion

**Value mappings:**
- High-energy emotions → `excitement` (joy, happiness, playfulness)
- Concentrated focus → `focus` (concentration, anticipation)
- Achievement/pride → `triumph` (pride, satisfaction)
- Calm/peaceful → `serenity` (contentment, appreciation)
- Community/team → `determination` (unity, camaraderie)
- Negative/unclear → NULL (for re-enrichment)

**Expected Result:**
All non-NULL values should be: `triumph`, `determination`, `intensity`, `focus`, `excitement`, `serenity`

No multi-value entries should remain.

### 5. fix-remaining-data-quality-issues.sql

**Purpose:** Handle sport-specific play types and 'other' sport_type values

**Play Type Remediations:**
- Basketball actions (`dribble`, `jump_shot`, `dunk`) → `attack`
- Baseball/Softball (`pitch`, `throw`) → `serve`
- Baseball/Softball (`catch`) → `dig`
- Soccer (`header`) → `attack`
- Soccer (`save`) → `dig`
- Track (`run`, `sprint`, `jump`, `hurdle`) → `transition`
- Generic (`hit`) → `attack`
- String 'NULL' (uppercase) → actual NULL

**Sport Type Strategy:**
- Uses play_type patterns to infer correct sport_type
- Maps 'other' values to correct sport based on play_type
- Sets unclear values to NULL for re-enrichment

**Expected Result:**
All play_type values should be canonical (355 rows fixed)
All 'other' sport_type values should be mapped or NULL (712 rows processed)

## Execution Order

**IMPORTANT:** Run migrations in this order:

```bash
# 1. Time of day normalization
psql $SUPABASE_DB_URL -f database/migrations/normalize-time-of-day-values.sql

# 2. Play type normalization
psql $SUPABASE_DB_URL -f database/migrations/normalize-play-type-values.sql

# 3. Sport type validation (creates audit table)
psql $SUPABASE_DB_URL -f database/migrations/validate-sport-type-values.sql

# 4. Emotion normalization
psql $SUPABASE_DB_URL -f database/migrations/normalize-emotion-values.sql

# 5. Fix remaining issues (sport-specific plays, 'other' sport types)
psql $SUPABASE_DB_URL -f database/migrations/fix-remaining-data-quality-issues.sql

# 6. Verify results
psql $SUPABASE_DB_URL -f database/audits/verify-data-quality-remediation.sql

# 7. (Optional) Diagnose any remaining issues
psql $SUPABASE_DB_URL -f database/audits/diagnose-remaining-issues.sql
```

## Verification

After running all migrations, execute the verification script:

```bash
psql $SUPABASE_DB_URL -f database/audits/verify-data-quality-remediation.sql
```

### Expected Verification Results

**Summary Statistics:**
| Field | Non-canonical | Hyphens | Multi-value |
|-------|--------------|---------|-------------|
| time_of_day | 0 | 0 | 0 |
| play_type | 0 | 0 | 0 |
| emotion | 0 | 0 | 0 |
| sport_type | <50 | 0 | 0 |

**Critical Issues Check:**
- Should return NO ROWS (all critical issues resolved)

## Manual Review Required

### Sport Type Audit

After running the sport_type validation migration:

```sql
-- Review items needing manual attention
SELECT
  original_sport_type,
  COUNT(*) as count
FROM sport_type_audit
WHERE suggested_sport_type IS NULL
GROUP BY original_sport_type
ORDER BY count DESC;
```

Apply manual fixes:

```sql
-- Example
UPDATE photo_metadata
SET sport_type = 'volleyball'
WHERE photo_id IN (
  SELECT photo_id
  FROM sport_type_audit
  WHERE original_sport_type = 'specific_value'
);
```

### Emotion Re-enrichment

Photos with NULL emotion values after migration may need re-enrichment:

```sql
SELECT
  photo_id,
  ImageUrl,
  photo_category,
  action_intensity
FROM photo_metadata
WHERE emotion IS NULL
  AND enriched_at IS NOT NULL
ORDER BY upload_date DESC;
```

## Rollback Strategy

All migrations use transactions (`BEGIN`/`COMMIT`). If issues arise:

1. The migration will fail and rollback automatically
2. Manual rollback: Restore from backup taken before migration

### Pre-Migration Backup

```bash
# Create backup before running migrations
pg_dump $SUPABASE_DB_URL -t photo_metadata > photo_metadata_backup_$(date +%Y%m%d).sql
```

### Restore from Backup

```bash
# Only if needed
psql $SUPABASE_DB_URL -c "TRUNCATE photo_metadata;"
psql $SUPABASE_DB_URL < photo_metadata_backup_YYYYMMDD.sql
```

## Impact Assessment

### Estimated Rows Affected

**Initial Migrations (1-4):**
- **time_of_day:** 5,963 rows updated
- **play_type:** 5,534 rows updated (initial pass)
- **emotion:** ~1,000 rows updated
- **sport_type:** ~500-700 rows updated (automatic), ~200 flagged for review

**Supplemental Migration (5):**
- **play_type:** 355 additional rows (sport-specific actions)
- **sport_type:** 712 'other' values mapped or set to NULL

**Total:** ~13,500+ rows modified (67% of database)

### Performance Impact

- Migrations use indexed columns (sport_type, time_of_day, etc.)
- Estimated execution time: 30-60 seconds per migration
- No downtime required (transactional updates)

### Application Impact

**No application code changes required.**

The application already expects canonical values. These migrations align the data with existing application expectations.

## Post-Migration Tasks

1. ✅ Verify all migrations completed successfully
2. ✅ Run verification script
3. ✅ Review sport_type audit table
4. ✅ Apply manual fixes for sport_type if needed
5. ✅ Identify photos needing emotion re-enrichment
6. ✅ Drop `sport_type_audit` table when complete
7. ✅ Update enrichment prompts to prevent future contamination
8. ✅ Monitor application for any edge cases

## Future Prevention

### Enrichment Prompt Updates

Update AI enrichment prompts to enforce canonical values:

```typescript
// Example: Strict emotion validation
const emotionPrompt = `
Return ONLY ONE of these exact values:
- triumph
- determination
- intensity
- focus
- excitement
- serenity

Do NOT return multiple values separated by pipes.
Do NOT return any other values.
`;
```

### Database Constraints (Optional)

Consider adding CHECK constraints after validation:

```sql
ALTER TABLE photo_metadata
ADD CONSTRAINT check_time_of_day
CHECK (time_of_day IN ('golden_hour', 'midday', 'evening', 'blue_hour', 'night', 'dawn'));

ALTER TABLE photo_metadata
ADD CONSTRAINT check_emotion
CHECK (emotion IN ('triumph', 'determination', 'intensity', 'focus', 'excitement', 'serenity'));
```

## Questions or Issues?

If you encounter any issues during migration:

1. Check the verification script output
2. Review transaction logs for errors
3. Consult this README for rollback procedures
4. Test migrations on a development database first

---

**Document Version:** 1.0
**Last Updated:** 2025-10-28
