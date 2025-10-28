# Metadata Quality Audit System

**Version:** 1.0
**Created:** 2025-10-28
**Purpose:** Systematic data quality monitoring and issue detection

---

## Overview

The composition filter bug revealed a systemic data quality issue from AI enrichment. This audit system proactively identifies similar issues across **all metadata fields** before they break filters.

---

## What This Audit Checks

### Issue Types Detected

1. **Format Inconsistencies**
   - Hyphens vs underscores (`rule-of-thirds` vs `rule_of_thirds`)
   - Case mismatches (if any)

2. **Multi-Value Strings**
   - Values like `close-up|dramatic-angle|rule-of-thirds`
   - Should be single canonical values

3. **Non-Canonical Values**
   - Values not in the expected enum/list
   - Example: `framing` when only `frame_within_frame` is valid

4. **NULL vs Empty String**
   - Distinguishes between intentional NULL and problematic empty strings

5. **Coverage Analysis**
   - What % of photos have each field populated
   - Identifies incomplete enrichment

---

## Fields Audited

### Bucket 1: User-Facing Filterable Fields

| Field | Expected Values | Filter Impact |
|-------|----------------|---------------|
| `sport_type` | volleyball, basketball, soccer, softball, football, baseball, track, portrait | High |
| `photo_category` | action, celebration, candid, portrait, warmup, ceremony | High |
| `play_type` | attack, block, dig, set, serve, celebration, transition | Medium |
| `action_intensity` | low, medium, high, peak | Medium |
| `composition` | rule_of_thirds, leading_lines, centered, symmetry, frame_within_frame | High |
| `time_of_day` | golden_hour, midday, evening, blue_hour, night, dawn | Medium |
| `lighting` | natural, backlit, dramatic, soft, artificial | Medium |
| `color_temperature` | warm, cool, neutral | Medium |

### Bucket 2: Internal Fields (Reference Only)

| Field | Expected Values | Filter Impact |
|-------|----------------|---------------|
| `emotion` | triumph, determination, intensity, focus, excitement, serenity | Low (internal) |
| `time_in_game` | first_5_min, middle, final_5_min, overtime, unknown | Low (internal) |

---

## Running The Audit

### Step 1: Execute Audit SQL

Open Supabase SQL Editor and run:

```bash
database/audits/metadata-quality-audit.sql
```

This will output 12 sections:
1. Sport Type Audit
2. Photo Category Audit
3. Play Type Audit
4. Action Intensity Audit
5. Composition Audit
6. Time of Day Audit
7. Lighting Audit
8. Color Temperature Audit
9. Emotion Audit (internal)
10. Time in Game Audit (internal)
11. **Summary: Data Quality Issues Count**
12. **Field Coverage Analysis**

### Step 2: Review Results

Focus on these sections:

#### Summary Table (Section 11)

Look for:
- `non_canonical_count > 0` → Values need normalization
- `hyphen_count > 0` → Format needs fixing
- `multi_value_count > 0` → Single value extraction needed

**Example Output:**
```
| field              | non_canonical | hyphen | multi_value | empty_string |
|--------------------|---------------|--------|-------------|--------------|
| composition        | 19688         | 15000  | 2500        | 0            |
| time_of_day        | 0             | 0      | 0           | 0            | ✅
| lighting           | 0             | 0      | 0           | 0            | ✅
```

#### Coverage Analysis (Section 12)

Check enrichment completeness:
```
| total_photos | composition_populated | composition_pct |
|--------------|----------------------|-----------------|
| 20000        | 19688                | 98.4%           | ✅
| 20000        | 5000                 | 25.0%           | ⚠️ Low coverage
```

---

## Interpreting Results

### Status Indicators

| Status | Meaning | Action Required |
|--------|---------|----------------|
| ✅ Valid | Canonical value, properly formatted | None |
| ⚠️ Contains hyphens | Format issue, fixable | Normalization needed |
| ❌ Multi-value | Multiple values in single field | Extraction needed |
| ❌ Non-canonical | Value outside expected enum | Mapping or re-enrichment needed |
| ⚠️ NULL | No data | May be expected (optional fields) |
| ⚠️ Empty string | Bad data (should be NULL) | Cleanup needed |

---

## Fixing Issues

### If Issues Found

1. **Create Backup**
   ```sql
   CREATE TABLE [field]_backup_[date] AS
   SELECT photo_id, [field], enriched_at
   FROM photo_metadata
   WHERE [field] IS NOT NULL;
   ```

2. **Use Composition Migration as Template**
   - See `database/migrations/normalize-composition-values.sql`
   - Adapt the `normalize_composition()` function for other fields
   - Follow same preview → apply → validate workflow

3. **Update AI Prompt**
   - Fix the field definition in `src/lib/ai/enrichment-prompts.ts`
   - Add explicit rules like composition now has

---

## Automation Recommendations

### Weekly Audit Schedule

Run this audit:
- **After bulk enrichments** (always check new data)
- **Weekly** (catch drift/issues early)
- **Before filter launches** (validate data quality)
- **After prompt changes** (ensure no regressions)

### CI/CD Integration (Future)

```bash
# Add to GitHub Actions or scheduled task
psql $SUPABASE_CONNECTION_STRING < database/audits/metadata-quality-audit.sql > audit-report.txt

# Parse results, fail if issues found
if grep -q "❌" audit-report.txt; then
  echo "Data quality issues detected!"
  exit 1
fi
```

---

## Preventive Measures

### 1. Prompt Engineering ✅

Already implemented for `composition`:
```typescript
// GOOD: Explicit, enforced rules
5. **composition** (string): The PRIMARY composition pattern used (SINGLE VALUE ONLY)
   Options: "rule_of_thirds", "leading_lines", "centered", "symmetry", "frame_within_frame"

   CRITICAL RULES:
   - Return ONLY ONE value (the most dominant composition pattern)
   - Use UNDERSCORES not hyphens (rule_of_thirds NOT rule-of-thirds)
   - NO multi-value strings (NO "close-up|dramatic-angle")
```

Apply this pattern to ALL fields.

### 2. Database Constraints (Recommended)

After validating data is clean:
```sql
ALTER TABLE photo_metadata
ADD CONSTRAINT sport_type_valid_values
CHECK (sport_type IN ('volleyball', 'basketball', 'soccer', 'softball', 'football', 'baseball', 'track', 'portrait'));

ALTER TABLE photo_metadata
ADD CONSTRAINT photo_category_valid_values
CHECK (photo_category IN ('action', 'celebration', 'candid', 'portrait', 'warmup', 'ceremony'));

-- Repeat for all enum fields
```

### 3. Response Validation (Code-Level)

Add validation in enrichment pipeline:
```typescript
function validateBucket1Response(response: Bucket1Response): boolean {
  const validSports = ['volleyball', 'basketball', 'soccer', ...];
  const validCategories = ['action', 'celebration', 'candid', ...];

  return (
    validSports.includes(response.sport_type) &&
    validCategories.includes(response.photo_category) &&
    // ... validate all fields
  );
}
```

---

## Expected Findings

Based on composition analysis, likely issues in other fields:

| Field | Predicted Issue | Confidence |
|-------|----------------|------------|
| `time_of_day` | Hyphens (`golden-hour`) | High |
| `play_type` | Should be clean (simple values) | Low |
| `lighting` | Should be clean (simple values) | Low |
| `emotion` | Possible hyphens or variants | Medium |
| `action_intensity` | Should be clean (simple values) | Low |

---

## Success Criteria

After running audit, ALL fields should show:

✅ **0** non-canonical values
✅ **0** multi-value strings
✅ **0** hyphen-formatted values
✅ **0** empty strings (NULL is OK)
✅ **>95%** coverage for critical fields (sport_type, photo_category)

---

## Files Created

```
database/audits/
└── metadata-quality-audit.sql       # Main audit script

.agent-os/
└── DATA_QUALITY_AUDIT_README.md     # This document
```

---

## Next Steps

1. **Run Audit** in Supabase SQL Editor
2. **Review Results** (focus on Summary + Coverage sections)
3. **Report Findings** (share results with team)
4. **Fix Issues** (use composition migration as template)
5. **Schedule Regular Audits** (weekly or post-enrichment)

---

**Remember:** This audit doesn't modify data - it only reports issues. Always preview changes before applying migrations.
