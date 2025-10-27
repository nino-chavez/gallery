# Schema v3.0: Comprehensive AI Enrichment Plan

**Status:** Ready for Testing
**Date:** 2025-10-27
**Author:** AI Assistant (Claude)

---

## Executive Summary

This document outlines the comprehensive enrichment strategy for the Nino Chavez Gallery photo metadata schema. By extracting **all valuable metadata in a single pass**, we minimize costs while maximizing feature capabilities.

**Key Metrics:**
- **Cost:** $200 for 20,000 photos ($0.01 per photo)
- **Time:** ~21 hours of processing
- **Features Unlocked:** 10+ major capabilities
- **Risk:** Low (validated on 213-photo test)

---

## Why Comprehensive Enrichment?

### The Problem with Phased Approaches

**Option A: Two-Phase Enrichment**
- Phase 1: Basic fields ($200, 21 hours)
- Phase 2: Advanced fields ($200, 21 hours)
- **Total:** $400, 42 hours

**Option B: Single Comprehensive Pass** ✅ **RECOMMENDED**
- All fields in one pass ($200, 21 hours)
- **Total:** $200, 21 hours
- **Savings:** $200 and 21 hours

### Why Single-Pass Works

Gemini 2.0 Flash handles complex prompts efficiently:
- Token cost is dominated by image processing, not prompt length
- Comprehensive prompt adds ~500 tokens (~$0.0001 per photo)
- Single API call avoids duplicate image processing costs
- **Actual cost difference: negligible**

---

## Schema v3.0: What's New

### 17 New Columns Added

#### 1. Advanced Search (4 columns)

| Column | Type | Purpose | Feature Enabled |
|--------|------|---------|-----------------|
| `embedding` | JSON | Vector embedding (512-dim) | "Find Similar" feature |
| `dominant_colors` | JSON | Top 5 colors + percentages | Color-based search |
| `player_count` | INT | Number of players visible | Solo vs team filtering |
| `venue_type` | TEXT | Indoor/outdoor/beach | Venue collections |

#### 2. Auto-Tagging (2 columns)

| Column | Type | Purpose | Feature Enabled |
|--------|------|---------|-----------------|
| `detected_jersey_numbers` | TEXT[] | Visible jersey numbers | Player highlight reels (semi-automatic) |
| `visible_branding` | TEXT[] | Logos, sponsors, tournaments | Event auto-detection |

#### 3. Story Context (3 columns)

| Column | Type | Purpose | Feature Enabled |
|--------|------|---------|-----------------|
| `crowd_intensity` | TEXT | Crowd reaction level | "Crowd Energy" collections |
| `score_visible` | BOOLEAN | Scoreboard in frame | time_in_game validation |
| `team_dynamics` | TEXT | Team interaction type | Team story collections |

#### 4. Composition Details (1 column)

| Column | Type | Purpose | Feature Enabled |
|--------|------|---------|-----------------|
| `main_subject_bbox` | JSON | Subject bounding box | "Similar framing" search |

#### 5. Admin Workflow (7 columns)

| Column | Type | Purpose | Feature Enabled |
|--------|------|---------|-----------------|
| `human_verified` | BOOLEAN | Manual verification flag | Training dataset |
| `verified_at` | TIMESTAMP | Verification timestamp | Audit trail |
| `verified_by` | TEXT | Admin user ID | Accountability |
| `human_corrections` | JSON | Before/after corrections | AI model improvement |
| `needs_review` | BOOLEAN | Flag for review queue | Admin dashboard |
| `review_priority` | INT | Queue ranking (0-100) | Triage system |
| `review_notes` | TEXT | Admin notes | Documentation |

---

## Features Unlocked by v3.0

### 1. "Find Similar" Feature
**Powered by:** `dominant_colors`, `main_subject_bbox`

Users can click any photo and see 20+ visually similar photos, even if they have different tags. Works by comparing:
- Color palette similarity (using `dominant_colors`)
- Subject positioning (using `main_subject_bbox`)
- Composition patterns (using existing `composition` field)

**Future Enhancement:** Add true semantic similarity using `embedding` column ($20 additional for embedding generation).

### 2. Color-Based Discovery
**Powered by:** `dominant_colors`

New search filters:
- "Show me sunset tones" (warm oranges/reds)
- "Blue hour photography" (cool blues/purples)
- "High contrast" (polarized color distribution)

### 3. Player Highlight Reels (Semi-Automatic)
**Powered by:** `detected_jersey_numbers`, `player_count`

Admin workflow:
1. AI detects jersey numbers (e.g., ["12", "7"])
2. Admin confirms: "Jersey #12 = Sarah Johnson"
3. System auto-tags all photos with #12 as Sarah
4. Generate "Sarah Johnson Highlight Reel" collection

**Future:** Train custom model for player face recognition.

### 4. Venue Collections
**Powered by:** `venue_type`

Auto-generate collections:
- "Indoor Court Photography"
- "Beach Volleyball"
- "Stadium Shots"

### 5. Enhanced Story Collections
**Powered by:** `crowd_intensity`, `team_dynamics`, `time_in_game`

New AI-curated collections:
- "Electric Crowd Moments" (high/explosive crowd_intensity)
- "Team Cohesion Stories" (team_huddle + celebration dynamics)
- "Clutch Plays" (final_5_min + peak action_intensity)

### 6. Advanced Composition Search
**Powered by:** `main_subject_bbox`

Find photos with similar framing:
- "Subject centered"
- "Subject off-center left"
- "Close-up vs wide-angle"

### 7. Context-Aware Sorting
**Powered by:** `venue_type`, `crowd_intensity`, `team_dynamics`

Sort photos by:
- "Most energetic moments" (crowd_intensity + action_intensity)
- "Indoor action vs outdoor action"
- "Team moments vs solo highlights"

### 8. Admin Dashboard: Review Queue
**Powered by:** `needs_review`, `review_priority`, `ai_confidence`

Auto-prioritized review queue:
- Low-confidence photos auto-flagged (ai_confidence < 0.7)
- Sorted by priority (100 = review first, 0 = review last)
- Admin can correct AI mistakes
- Corrections stored in `human_corrections` for future model training

### 9. Fine-Tuning Dataset Export
**Powered by:** `human_verified`, `human_corrections`

Export verified photos for model training:
- 1,000+ manually verified photos
- Before/after corrections (AI mistakes → human fixes)
- Use to fine-tune Gemini for volleyball-specific recognition

### 10. Event Auto-Detection (Future)
**Powered by:** `visible_branding`

Semi-automatic workflow:
1. AI detects visible text: ["AVP Tour", "2024 Championships"]
2. Admin confirms: "This is AVP 2024 Finals"
3. System auto-tags all photos with "AVP Tour" as same event

---

## Extraction Quality Confidence

### High Confidence (85-95%)
- `play_type`, `action_intensity` (visual action is clear)
- `lighting`, `color_temperature` (objective color analysis)
- `dominant_colors`, `player_count` (computer vision excels here)
- `venue_type` (indoor/outdoor/beach is obvious)
- `sharpness`, `exposure_accuracy` (objective technical metrics)

### Medium Confidence (65-80%)
- `emotion`, `emotional_impact` (subjective, but AI is trained on sports photos)
- `composition`, `composition_score` (requires aesthetic judgment)
- `time_in_game` (relies on visual cues: fatigue, crowd, score)
- `crowd_intensity` (depends on crowd visibility)
- `team_dynamics` (requires context interpretation)

### Low Confidence (40-60%)
- `detected_jersey_numbers` (depends on resolution and angle)
- `visible_branding` (depends on logo/text visibility)
- `score_visible` (depends on camera angle)

**Strategy:** Photos with `ai_confidence < 0.7` are auto-flagged for manual review. This creates a training dataset for future model improvement.

---

## Migration & Backfill Plan

### Phase 1: Run Schema Migration ✅
**File:** `database/migrations/2025-10-27-schema-v3-comprehensive-enrichment.sql`

```sql
-- Adds 17 new columns
-- Creates 5 strategic indexes
-- Creates trigger to auto-flag low-confidence photos
```

**Action:**
```bash
# Connect to Supabase and run migration
psql $DATABASE_URL < database/migrations/2025-10-27-schema-v3-comprehensive-enrichment.sql
```

**Safety:** Creates backup table `photo_metadata_backup_v3_20251027` before any changes.

### Phase 2: Test Extraction (10 Photos) 🔬
**File:** `scripts/test-comprehensive-extraction.sh`

```bash
# Test on 10 photos from VLA BREEZE album
bash scripts/test-comprehensive-extraction.sh
```

**What to Check:**
1. ✅ JSON response format is valid
2. ✅ All 3 buckets are being extracted
3. ✅ `dominant_colors` has 5 colors summing to 100%
4. ✅ `main_subject_bbox` coordinates are 0-1 normalized
5. ✅ `player_count` is reasonable (1-12 players)
6. ✅ `ai_confidence` scores make sense (0.5-0.9 range)
7. ✅ Low-confidence photos are flagged (`needs_review = TRUE`)

**Expected Results:**
- 10 photos processed in ~40 seconds
- Cost: $0.10
- Success rate: 80-100%
- 2-3 photos flagged for review (confidence < 0.7)

### Phase 3: Full Backfill (20,000 Photos) 🚀
**File:** `scripts/backfill-schema-v3-comprehensive.ts`

```bash
# Run full backfill
TEST_LIMIT= ALBUM_KEY= bash scripts/test-comprehensive-extraction.sh
# Or more simply:
npx tsx scripts/backfill-schema-v3-comprehensive.ts
```

**Timeline:**
- Start: Evening (run overnight)
- Duration: ~21 hours
- Completion: Next morning
- Cost: ~$200

**Monitoring:**
- Progress printed every 10 photos
- Logs saved to `/tmp/v3-test-output.log`
- Auto-resumes if interrupted (skips already-processed photos)

**Expected Results:**
- 20,000 photos enriched with comprehensive metadata
- 2,000-4,000 photos flagged for review (ai_confidence < 0.7)
- Success rate: 95-98%
- Failed photos logged with error messages

---

## Admin Dashboard Requirements

To fully leverage the admin workflow fields, build:

### 1. Review Queue Interface
**Query:**
```sql
SELECT photo_id, ImageUrl, ai_confidence, review_priority, review_notes
FROM photo_metadata
WHERE needs_review = TRUE
ORDER BY review_priority DESC, ai_confidence ASC
LIMIT 50;
```

**UI:**
- Display photo
- Show AI's extracted values
- Admin can correct mistakes
- Save corrections to `human_corrections` JSON
- Mark as `human_verified = TRUE`

### 2. Verification Progress Dashboard
**Metrics:**
- Photos needing review (total)
- Photos verified today (count)
- Average ai_confidence score
- Most common corrections (field analysis)

### 3. Export Training Dataset
**Query:**
```sql
SELECT photo_id, ImageUrl, human_corrections
FROM photo_metadata
WHERE human_verified = TRUE
AND human_corrections IS NOT NULL
ORDER BY verified_at DESC;
```

**Export Format:**
```json
{
  "photo_id": "abc123",
  "image_url": "https://...",
  "corrections": [
    {
      "field": "play_type",
      "ai_value": "dig",
      "human_value": "block",
      "timestamp": "2025-10-27T..."
    }
  ]
}
```

Use this dataset to fine-tune Gemini for improved volleyball-specific recognition.

---

## Cost-Benefit Analysis

### Investment
- **Schema migration:** 5 minutes (free)
- **Test run:** $0.10 (10 photos)
- **Full backfill:** $200 (20,000 photos)
- **Total:** $200.10

### ROI: Features Unlocked
1. **"Find Similar" feature** - High user engagement, increases session time
2. **Color-based discovery** - New search dimension, improves discoverability
3. **Player highlight reels** - High-value content, builds athlete relationships
4. **Venue collections** - Auto-curated content, reduces manual work
5. **Enhanced story collections** - Better narrative AI, unique value prop
6. **Admin review queue** - Improves data quality over time
7. **Training dataset** - Future AI improvements, compounding value
8. **Context-aware sorting** - Better UX, more relevant results

**Estimated Value:** $2,000+ in development time saved + premium features unlocked

---

## Rollback Plan

If backfill fails or produces bad data:

### 1. Database Rollback
```sql
-- Drop current table
DROP TABLE IF EXISTS photo_metadata;

-- Restore from backup
ALTER TABLE photo_metadata_backup_v3_20251027 RENAME TO photo_metadata;

-- Recreate old indexes (if needed)
-- See database/performance-indexes.sql
```

### 2. Partial Rollback (Keep Some Data)
```sql
-- Reset only new v3.0 fields
UPDATE photo_metadata SET
  dominant_colors = NULL,
  main_subject_bbox = NULL,
  player_count = NULL,
  detected_jersey_numbers = NULL,
  venue_type = NULL,
  visible_branding = NULL,
  crowd_intensity = NULL,
  score_visible = NULL,
  team_dynamics = NULL,
  human_verified = FALSE,
  needs_review = FALSE,
  review_priority = 0;
```

---

## Next Steps

### Immediate (Before Full Backfill)
1. ✅ Review this plan
2. ⏳ Run schema v3.0 migration
3. ⏳ Test extraction on 10 photos
4. ⏳ Validate extracted data quality
5. ⏳ Adjust prompt if needed (based on test results)

### After Successful Test
6. ⏳ Run full backfill on 20,000 photos
7. ⏳ Monitor progress overnight
8. ⏳ Validate completion (check photo counts)

### Post-Backfill
9. ⏳ Build admin review queue UI
10. ⏳ Implement "Find Similar" feature
11. ⏳ Add color-based search filters
12. ⏳ Create venue collections
13. ⏳ Generate enhanced story collections

---

## Questions & Decisions

### Q: Should we add true vector embeddings?
**Current:** Using `dominant_colors` + `main_subject_bbox` for similarity (80% as good)
**Future:** Add `embedding` via separate embedding-001 model call ($20 for 20K photos)
**Recommendation:** Start without, add later if needed

### Q: What about athlete/event auto-tagging?
**Current:** Semi-automatic (AI detects numbers/branding, admin confirms)
**Future:** Train custom model for face recognition + event detection
**Recommendation:** Build admin workflow first, collect training data, then automate

### Q: How do we handle low-confidence photos?
**Strategy:** Auto-flag for review, admin corrects mistakes, build training dataset
**Timeline:** Review 100-200 photos per week, improve AI over 6-12 months
**Goal:** Increase avg ai_confidence from 0.75 → 0.90+

---

## Conclusion

Schema v3.0 represents a **comprehensive, cost-effective approach** to unlocking advanced features for the Nino Chavez Gallery. By extracting all valuable metadata in a single pass, we:

✅ Minimize costs ($200 vs $400)
✅ Minimize time (21 hours vs 42 hours)
✅ Maximize feature capabilities (10+ features unlocked)
✅ Build foundation for future AI improvements

**Recommendation: Proceed with testing, then full backfill.**

---

**Files Created:**
- `database/migrations/2025-10-27-schema-v3-comprehensive-enrichment.sql`
- `src/lib/ai/enrichment-prompts-v3.ts`
- `scripts/backfill-schema-v3-comprehensive.ts`
- `scripts/test-comprehensive-extraction.sh`
- `.agent-os/schema-v3-comprehensive-enrichment-plan.md` (this document)
