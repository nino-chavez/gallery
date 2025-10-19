# Data Architecture Strategy: Multi-Sport Enrichment

**Date:** October 19, 2025
**Status:** Technical Architecture Plan
**Scope:** AI Enrichment, Database Schema, Migration Strategy

---

## Executive Summary

### Current State Analysis

**Existing Enrichment:**
- ✅ 20,000+ photos enriched with AI metadata
- ✅ Cost: ~$300-500 already invested
- ✅ Quality: High-quality Gemini/Claude analysis
- ⚠️ **Problem:** Volleyball-specific prompts and `playType` taxonomy

**Key Finding:**
The enrichment process is **already semi-sport-agnostic** (line 107: "If this is NOT a sports photo... set playType=null"), but the prompt is volleyball-biased and lacks sport detection.

### Strategic Recommendation

**DO NOT re-enrich 20K existing photos.** Instead:

1. **Layer sport taxonomy on existing data** (SQL migration + inference)
2. **Enhance enrichment prompt** for future photos (sport-agnostic)
3. **Extend Supabase schema** with backward-compatible fields
4. **Implement sport detection** in enrichment pipeline

**Cost Savings:** ~$400 (avoiding re-enrichment)
**Timeline:** 1 week for schema + prompt updates
**Risk:** Low - additive changes, no data loss

---

## Part 1: Existing Data Analysis

### Current Enrichment Metadata

**From `vision-client.ts` (lines 19-48):**

```typescript
interface VisionAnalysisResult {
  title: string;
  caption: string;
  keywords: { tier1, tier2, tier3 };
  emotion: string;
  composition: string;
  timeOfDay: string;
  quality: {
    sharpness: number;
    exposureAccuracy: number;
    compositionScore: number;
    emotionalImpact: number;
  };
  portfolioWorthy: boolean;
  printReady: boolean;
  useCases: string[];
  socialMediaOptimized: boolean;
  playType: 'attack' | 'block' | 'dig' | 'set' | 'serve' | 'pass' | 'celebration' | 'timeout' | null;
  actionIntensity: 'low' | 'medium' | 'high' | 'peak';
  provider: 'claude' | 'openai' | 'gemini';
  cost: number;
}
```

**Compatibility Assessment:**

| Field | Multi-Sport Compatible? | Action Required |
|-------|-------------------------|-----------------|
| `title`, `caption`, `keywords` | ✅ YES | None - universal |
| `emotion`, `composition`, `timeOfDay` | ✅ YES | None - universal |
| `quality.*` scores | ✅ YES | None - universal |
| `portfolioWorthy`, `printReady` | ✅ YES | None - universal |
| `useCases`, `socialMediaOptimized` | ✅ YES | None - universal |
| `playType` | ⚠️ **VOLLEYBALL-SPECIFIC** | Add `sport_type` + `action_type` |
| `actionIntensity` | ✅ YES | None - universal |

**Key Insight:** 90% of enrichment data is already sport-agnostic!

### What We Can Infer from Existing Data

**Sport Type Inference (No AI Vision Needed):**

```sql
-- Rule 1: If playType is volleyball-specific → sport_type = 'volleyball'
UPDATE photo_metadata
SET sport_type = 'volleyball'
WHERE play_type IN ('attack', 'block', 'dig', 'set', 'serve', 'pass');

-- Rule 2: If playType = 'celebration' or 'timeout' → check keywords
UPDATE photo_metadata
SET sport_type = CASE
  WHEN keywords @> ARRAY['volleyball'] THEN 'volleyball'
  WHEN keywords @> ARRAY['basketball'] THEN 'basketball'
  WHEN keywords @> ARRAY['soccer'] THEN 'soccer'
  ELSE 'unknown'
END
WHERE play_type IN ('celebration', 'timeout');

-- Rule 3: If playType = null → analyze keywords + title
UPDATE photo_metadata
SET sport_type = CASE
  WHEN keywords @> ARRAY['volleyball'] OR title ILIKE '%volleyball%' THEN 'volleyball'
  WHEN keywords @> ARRAY['portrait'] OR keywords @> ARRAY['candid'] THEN 'portrait'
  WHEN keywords @> ARRAY['basketball'] THEN 'basketball'
  WHEN keywords @> ARRAY['soccer'] THEN 'soccer'
  ELSE 'unknown'
END
WHERE play_type IS NULL;

-- Rule 4: Use album_name as fallback
UPDATE photo_metadata m
SET sport_type = CASE
  WHEN m.album_name ILIKE '%volleyball%' THEN 'volleyball'
  WHEN m.album_name ILIKE '%basketball%' THEN 'basketball'
  WHEN m.album_name ILIKE '%soccer%' THEN 'soccer'
  WHEN m.album_name ILIKE '%portrait%' OR m.album_name ILIKE '%senior%' THEN 'portrait'
  ELSE sport_type
END
WHERE sport_type = 'unknown';
```

**Photo Category Inference:**

```sql
UPDATE photo_metadata
SET photo_category = CASE
  -- Action shots (high intensity + sport-specific play)
  WHEN action_intensity IN ('high', 'peak') AND play_type IN ('attack', 'block', 'dig', 'serve', 'set')
    THEN 'action'

  -- Celebrations
  WHEN play_type = 'celebration' OR emotion = 'triumph'
    THEN 'celebration'

  -- Candid moments (low intensity + timeout or null play)
  WHEN action_intensity = 'low' AND (play_type = 'timeout' OR play_type IS NULL)
    THEN 'candid'

  -- Portraits (keywords contain 'portrait', 'senior', 'headshot')
  WHEN keywords @> ARRAY['portrait'] OR keywords @> ARRAY['senior'] OR keywords @> ARRAY['headshot']
    THEN 'portrait'

  -- Warmup (keywords or title mentions 'warmup', 'practice')
  WHEN title ILIKE '%warmup%' OR title ILIKE '%practice%'
    THEN 'warmup'

  -- Default to action for high intensity
  WHEN action_intensity IN ('medium', 'high', 'peak')
    THEN 'action'

  -- Default to candid for everything else
  ELSE 'candid'
END;
```

**Confidence Estimate:**
- **80% accuracy** for sport_type (volleyball-dominant sample)
- **90% accuracy** for photo_category (action_intensity is reliable)
- **Manual review needed:** ~2,000 photos (10% flagged as 'unknown')

---

## Part 2: Enhanced Enrichment Architecture

### Problem with Current Prompt (lines 96-150)

**Current Prompt Issues:**

```typescript
// ❌ Hardcoded volleyball terminology
"playType": "attack|block|dig|set|serve|pass|celebration|timeout|null"

// ❌ Volleyball-biased instructions
"For sports: Use modern volleyball terms ('attack' not 'spike', 'pass' for serve-receive)"

// ❌ Single sport assumption
context.sport is passed but ignored in playType options
```

**Impact:**
- Basketball photos get `playType: null` (loses action context)
- Soccer photos classified incorrectly
- Portraits work fine (playType=null handled correctly)

### Revised Multi-Sport Prompt Architecture

**Strategy: Prompt Stacking with Sport Detection**

**Phase 1: Sport Detection Pre-Prompt**

```typescript
async function detectSportType(imageUrl: string, context: VisionContext): Promise<string> {
  const detectionPrompt = `Analyze this image and identify the sport or photo type.

Context:
- Album: ${context.albumName || 'Unknown'}
- Expected: ${context.sport} (but verify what you actually see)

Return ONLY the sport type from this list:
- volleyball
- basketball
- soccer
- football
- baseball
- track
- portrait (if close-up, posed, or candid person)
- candid (if between-play moment, not focused on action)
- ceremony (if awards, recognition, group photo)
- other

Respond with a single word.`;

  // Quick, cheap API call (use Gemini Flash for $0.0001/image)
  const sportType = await callVisionAPI(detectionPrompt, imageUrl, { model: 'gemini-flash' });
  return sportType.trim().toLowerCase();
}
```

**Phase 2: Sport-Specific Enrichment Prompt**

```typescript
function buildMultiSportPrompt(context: VisionContext, sportType: string): string {
  // Get sport-specific action types
  const actionTypes = SPORT_ACTION_TAXONOMY[sportType] || {
    actions: ['action'],
    terminology: 'Use descriptive action terms appropriate for this sport'
  };

  const prompt = `Analyze this ${sportType} photo from "${context.eventName}".

Context:
- Sport Type: ${sportType}
- Event: ${context.eventName}
- Album: ${context.albumName || 'Unknown'}

Generate metadata in this JSON format:

{
  "title": "8-word max action-focused title",
  "caption": "20-word descriptive caption with emotion and context",
  "keywords": {
    "tier1": ["sport", "action", "subject"] (3-5 core),
    "tier2": ["emotion", "composition", "lighting"] (5-7 descriptive),
    "tier3": ["sport:${sportType}", "action:xxx", "emotion:xxx"] (7-10 structured)
  },
  "emotion": "triumph|focus|intensity|determination|excitement|serenity",
  "composition": "rule-of-thirds|leading-lines|symmetry|motion-blur|close-up",
  "timeOfDay": "morning|afternoon|golden-hour|evening|night|midday",

  "quality": {
    "sharpness": 0-10,
    "exposureAccuracy": 0-10,
    "compositionScore": 0-10,
    "emotionalImpact": 0-10
  },
  "portfolioWorthy": true|false,
  "printReady": true|false,
  "useCases": ["social-media", "website-hero", "athlete-portfolio", "print"],
  "socialMediaOptimized": true|false,

  "sportType": "${sportType}",
  "photoCategory": "action|portrait|candid|celebration|warmup|ceremony",
  "actionType": "${getActionTypeOptions(sportType)}" (see sport-specific list below),
  "actionIntensity": "low|medium|high|peak"
}

${getActionTypeInstructions(sportType)}

Requirements:
- Be specific to ${sportType} actions and terminology
- Set actionType from the options above (or null if not applicable)
- For portraits/candid: set actionType=null, adjust actionIntensity=low
- Quality scores: Be objective about technical excellence
- portfolioWorthy: Reserve for exceptional shots regardless of category`;

  return prompt;
}
```

**Phase 3: Sport-Specific Action Taxonomies**

```typescript
const SPORT_ACTION_TAXONOMY: Record<string, {
  actions: string[];
  terminology: string;
}> = {
  volleyball: {
    actions: ['attack', 'block', 'dig', 'set', 'serve', 'pass', 'celebration', 'timeout'],
    terminology: 'Use modern volleyball terms: attack (not spike), pass (for serve-receive)'
  },
  basketball: {
    actions: ['dunk', 'layup', 'three-pointer', 'free-throw', 'rebound', 'steal', 'block', 'pass', 'dribble', 'celebration'],
    terminology: 'Use basketball terminology: three-pointer, layup, dunk, rebound'
  },
  soccer: {
    actions: ['goal', 'shot', 'save', 'pass', 'tackle', 'header', 'dribble', 'corner-kick', 'celebration'],
    terminology: 'Use soccer terminology: goal, save, tackle, header'
  },
  football: {
    actions: ['touchdown', 'tackle', 'pass', 'catch', 'run', 'kick', 'sack', 'interception', 'celebration'],
    terminology: 'Use football terminology: touchdown, tackle, sack, interception'
  },
  baseball: {
    actions: ['pitch', 'hit', 'catch', 'throw', 'slide', 'home-run', 'strikeout', 'celebration'],
    terminology: 'Use baseball terminology: pitch, hit, home run, strikeout'
  },
  track: {
    actions: ['sprint', 'hurdles', 'relay', 'long-jump', 'high-jump', 'shot-put', 'finish'],
    terminology: 'Use track & field terminology: sprint, hurdles, relay, jump'
  },
  portrait: {
    actions: [null],
    terminology: 'Not an action shot - focus on expression, composition, lighting'
  },
  candid: {
    actions: [null],
    terminology: 'Between-play moment - focus on emotion, interaction, context'
  },
  ceremony: {
    actions: [null],
    terminology: 'Formal or group setting - focus on emotion, recognition, composition'
  },
  other: {
    actions: [null],
    terminology: 'Describe what you see without sport-specific terminology'
  }
};

function getActionTypeOptions(sportType: string): string {
  const actions = SPORT_ACTION_TAXONOMY[sportType]?.actions || [null];
  return actions.join('|');
}

function getActionTypeInstructions(sportType: string): string {
  const taxonomy = SPORT_ACTION_TAXONOMY[sportType];
  if (!taxonomy) return '';

  return `
Sport-Specific Action Types for ${sportType}:
${taxonomy.actions.filter(a => a !== null).map(a => `- ${a}`).join('\n')}

${taxonomy.terminology}

If none of these actions apply, set actionType=null.`;
}
```

### Enhanced Vision Client Flow

```typescript
export async function analyzePhoto(
  imageUrl: string,
  context: VisionContext
): Promise<VisionAnalysisResult> {
  // STEP 1: Detect sport type (cheap, fast)
  const detectedSport = await detectSportType(imageUrl, context);

  console.log(`   🏀 Detected sport: ${detectedSport}`);

  // STEP 2: Build sport-specific prompt
  const prompt = buildMultiSportPrompt(context, detectedSport);

  // STEP 3: Analyze with full enrichment
  const result = await callVisionAPI(prompt, imageUrl, {
    model: context.preferredModel || 'claude',
    includeQuality: true
  });

  // STEP 4: Validate and return
  return {
    ...result,
    sportType: detectedSport, // Add sport type to result
    provider: context.preferredModel || 'claude'
  };
}
```

**Cost Analysis:**

| Step | Model | Cost per Image | Purpose |
|------|-------|----------------|---------|
| Sport Detection | Gemini Flash | $0.0001 | Quick classification |
| Full Enrichment | Claude 3.5 Sonnet | $0.012 | Detailed metadata |
| **Total** | **Combined** | **$0.0121** | **~20% increase** |

**For 1,000 new photos:**
- Old cost: $12.00 (Claude only)
- New cost: $12.10 (Sport detection + Claude)
- **Incremental cost: $0.10** (negligible)

---

## Part 3: Supabase Schema Evolution

### Current Schema (Inferred from TypeScript)

```sql
-- Existing columns from photo.ts
photo_id TEXT PRIMARY KEY
image_key TEXT
album_key TEXT
album_name TEXT
ImageUrl TEXT
OriginalUrl TEXT
ThumbnailUrl TEXT

-- Quality scores (0-10)
sharpness DECIMAL(3,1)
exposure_accuracy DECIMAL(3,1)
composition_score DECIMAL(3,1)
emotional_impact DECIMAL(3,1)

-- Portfolio flags
portfolio_worthy BOOLEAN
print_ready BOOLEAN
social_media_optimized BOOLEAN

-- Volleyball-specific
play_type TEXT
action_intensity TEXT

-- Composition & Emotion
emotion TEXT
composition TEXT
time_of_day TEXT

-- Use cases
use_cases TEXT[]

-- AI metadata
ai_provider TEXT
ai_cost DECIMAL(8,6)
enriched_at TIMESTAMP
```

### Enhanced Schema (Backward Compatible)

```sql
-- NEW COLUMNS (ADDITIVE - no breaking changes)

-- Sport taxonomy (multi-sport support)
ALTER TABLE photo_metadata
ADD COLUMN sport_type VARCHAR(50),
ADD COLUMN photo_category VARCHAR(50),
ADD COLUMN action_type VARCHAR(100);

-- Constraints
ALTER TABLE photo_metadata
ADD CONSTRAINT check_sport_type
  CHECK (sport_type IN (
    'volleyball', 'basketball', 'soccer', 'football',
    'baseball', 'track', 'portrait', 'candid',
    'ceremony', 'other', NULL
  ));

ALTER TABLE photo_metadata
ADD CONSTRAINT check_photo_category
  CHECK (photo_category IN (
    'action', 'portrait', 'candid', 'celebration',
    'warmup', 'ceremony', 'other', NULL
  ));

-- Indexes for filtering
CREATE INDEX idx_sport_type ON photo_metadata(sport_type);
CREATE INDEX idx_photo_category ON photo_metadata(photo_category);
CREATE INDEX idx_action_type ON photo_metadata(action_type);

-- Composite index for common queries
CREATE INDEX idx_sport_quality ON photo_metadata(sport_type, quality_score DESC);
CREATE INDEX idx_category_emotion ON photo_metadata(photo_category, emotion);

-- BACKWARD COMPATIBILITY
-- Keep play_type for existing queries (map to action_type internally)
-- Add computed column or view for legacy support

CREATE OR REPLACE VIEW photo_metadata_legacy AS
SELECT
  *,
  -- Legacy play_type maps to action_type for volleyball
  CASE
    WHEN sport_type = 'volleyball' THEN action_type
    ELSE play_type
  END as legacy_play_type
FROM photo_metadata;
```

**Migration Strategy:**

```sql
-- STEP 1: Add new columns (non-breaking)
ALTER TABLE photo_metadata
ADD COLUMN IF NOT EXISTS sport_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS photo_category VARCHAR(50),
ADD COLUMN IF NOT EXISTS action_type VARCHAR(100);

-- STEP 2: Backfill existing data (inference rules from Part 1)
-- Rule 1: Sport type inference
UPDATE photo_metadata
SET sport_type = CASE
  WHEN play_type IN ('attack', 'block', 'dig', 'set', 'serve', 'pass') THEN 'volleyball'
  WHEN keywords @> ARRAY['volleyball'] OR album_name ILIKE '%volleyball%' THEN 'volleyball'
  WHEN keywords @> ARRAY['basketball'] OR album_name ILIKE '%basketball%' THEN 'basketball'
  WHEN keywords @> ARRAY['soccer'] OR album_name ILIKE '%soccer%' THEN 'soccer'
  WHEN keywords @> ARRAY['portrait'] OR keywords @> ARRAY['senior'] THEN 'portrait'
  WHEN play_type IS NULL AND action_intensity = 'low' THEN 'candid'
  ELSE 'volleyball' -- Safe default for this dataset
END
WHERE sport_type IS NULL;

-- Rule 2: Photo category inference
UPDATE photo_metadata
SET photo_category = CASE
  WHEN action_intensity IN ('high', 'peak') AND play_type IS NOT NULL THEN 'action'
  WHEN play_type = 'celebration' OR emotion = 'triumph' THEN 'celebration'
  WHEN action_intensity = 'low' OR play_type = 'timeout' THEN 'candid'
  WHEN keywords @> ARRAY['portrait'] THEN 'portrait'
  WHEN action_intensity IN ('medium', 'high', 'peak') THEN 'action'
  ELSE 'candid'
END
WHERE photo_category IS NULL;

-- Rule 3: Action type mapping (volleyball-specific → sport-agnostic)
UPDATE photo_metadata
SET action_type = CASE
  WHEN sport_type = 'volleyball' THEN play_type
  WHEN sport_type = 'portrait' THEN NULL
  WHEN sport_type = 'candid' THEN NULL
  ELSE play_type -- Keep for future manual tagging
END
WHERE action_type IS NULL;

-- STEP 3: Add constraints after data is clean
-- (Run constraint creation from above)

-- STEP 4: Verify migration
SELECT
  sport_type,
  photo_category,
  COUNT(*) as photo_count,
  AVG(quality_score) as avg_quality
FROM photo_metadata
GROUP BY sport_type, photo_category
ORDER BY photo_count DESC;

-- Expected output:
-- volleyball | action       | 12,000+ | 8.5
-- volleyball | celebration  | 1,500   | 8.2
-- volleyball | candid       | 500     | 7.8
-- portrait   | portrait     | 2,000   | 8.7
-- candid     | candid       | 1,500   | 7.5
-- other      | action       | 1,000   | 8.0
```

**Rollback Plan (if needed):**

```sql
-- Remove new columns without data loss
ALTER TABLE photo_metadata
DROP COLUMN IF EXISTS sport_type,
DROP COLUMN IF EXISTS photo_category,
DROP COLUMN IF EXISTS action_type;

-- All existing data (play_type, quality scores, etc.) remains intact
```

---

## Part 4: Implementation Roadmap

### Week 1: Schema Migration (CRITICAL PATH)

**Day 1: Backup & Preparation**
```bash
# Backup Supabase database
pg_dump -h <supabase-host> -U postgres -d postgres > backup_$(date +%Y%m%d).sql

# Test migration on local PostgreSQL
createdb gallery_test
psql gallery_test < backup_$(date +%Y%m%d).sql
```

**Day 2: Schema Enhancement**
```sql
-- Run migration SQL (from Part 3)
-- Add sport_type, photo_category, action_type columns
-- Run inference queries to backfill data
-- Verify with SELECT queries
```

**Day 3: Data Validation**
```typescript
// Create validation script: scripts/validate-sport-taxonomy.ts
import { supabaseServer } from '$lib/supabase/server';

async function validateTaxonomy() {
  // Check for null sport_type
  const { data: unknownSport } = await supabaseServer
    .from('photo_metadata')
    .select('id, title, keywords, album_name')
    .is('sport_type', null);

  console.log(`Found ${unknownSport.length} photos with unknown sport type`);

  // Check category distribution
  const { data: categoryDist } = await supabaseServer
    .from('photo_metadata')
    .select('sport_type, photo_category, count')
    .group('sport_type, photo_category');

  console.table(categoryDist);

  // Flag photos needing manual review
  const { data: needsReview } = await supabaseServer
    .from('photo_metadata')
    .select('*')
    .or('sport_type.is.null,photo_category.is.null');

  // Export to CSV for manual tagging
  fs.writeFileSync('needs-manual-review.csv', json2csv(needsReview));
}
```

**Day 4-5: Manual Review**
- Export ~2,000 photos flagged as 'unknown' or 'other'
- Create simple admin UI for bulk tagging
- Tag by album name, keywords, visual review
- Re-run migration with manual corrections

### Week 2: Enrichment Pipeline Enhancement

**Day 1: Sport Detection Implementation**
```typescript
// Add to scripts/vision-client.ts
export async function detectSportType(
  imageUrl: string,
  context: VisionContext
): Promise<string> {
  // Implementation from Part 2
}
```

**Day 2: Multi-Sport Prompt Builder**
```typescript
// Update buildPrompt() function
// Add SPORT_ACTION_TAXONOMY constant
// Implement getActionTypeOptions() and getActionTypeInstructions()
```

**Day 3: Integration & Testing**
```bash
# Test on sample photos (10 per sport)
pnpm run enrich:smugmug --model=gemini --limit=10 --dry-run

# Expected output:
# Volleyball: sport_type=volleyball, action_type=attack
# Basketball: sport_type=basketball, action_type=dunk
# Portrait: sport_type=portrait, action_type=null
```

**Day 4-5: Parallel Enrichment**
```bash
# Run NEW enrichment for any photos added after migration
# Use enhanced prompt with sport detection
pnpm run enrich:smugmug --model=gemini --age-filter="<1month" --concurrency=50
```

### Week 3: Frontend Integration

**Day 1: Update TypeScript Types**
```typescript
// src/types/photo.ts
export type SportType =
  | 'volleyball'
  | 'basketball'
  | 'soccer'
  | 'portrait'
  | 'other';

export type PhotoCategory =
  | 'action'
  | 'portrait'
  | 'candid'
  | 'celebration';

export interface PhotoMetadata {
  // ... existing fields ...

  // NEW: Sport taxonomy
  sport_type: SportType;
  photo_category: PhotoCategory;
  action_type: string | null;

  // DEPRECATED: Keep for backward compatibility
  play_type: string | null;
}
```

**Day 2: Sport Filter Component**
```svelte
<!-- src/lib/components/gallery/SportFilter.svelte -->
<script lang="ts">
  import type { SportType } from '$types/photo';

  let { selected = $bindable([]) }: { selected: SportType[] } = $props();

  const sportCounts = $derived.by(async () => {
    // Fetch sport counts from Supabase
    const { data } = await supabaseClient
      .from('photo_metadata')
      .select('sport_type, count')
      .group('sport_type');
    return data;
  });
</script>

<div class="sport-filter">
  <h3>Sport Type</h3>
  {#each sportCounts as { sport_type, count }}
    <label>
      <input
        type="checkbox"
        value={sport_type}
        bind:group={selected}
      />
      {sport_type} ({count})
    </label>
  {/each}
</div>
```

**Day 3-5: Update All Query Logic**
```typescript
// src/lib/supabase/server.ts
export interface FetchPhotosOptions {
  // ... existing options ...

  // NEW: Sport filtering
  sportTypes?: SportType[];
  photoCategories?: PhotoCategory[];
}

export async function fetchPhotos(options?: FetchPhotosOptions): Promise<Photo[]> {
  let query = supabaseServer.from('photo_metadata').select('*');

  // Apply sport filter
  if (options?.sportTypes?.length) {
    query = query.in('sport_type', options.sportTypes);
  }

  // Apply category filter
  if (options?.photoCategories?.length) {
    query = query.in('photo_category', options.photoCategories);
  }

  // ... existing filters ...
}
```

### Week 4: Testing & Deployment

**Day 1-2: E2E Testing**
- Test sport filtering on /explore
- Test category filtering on /collections
- Verify SEO meta tags include sport_type
- Test share URLs with sport context

**Day 3: Performance Testing**
```sql
-- Verify index performance
EXPLAIN ANALYZE
SELECT * FROM photo_metadata
WHERE sport_type = 'volleyball'
  AND photo_category = 'action'
  AND quality_score >= 8.0
ORDER BY quality_score DESC
LIMIT 24;

-- Should use idx_sport_quality index
-- Execution time should be < 50ms
```

**Day 4: Deploy to Production**
```bash
# Run migration on Supabase production
# Deploy updated SvelteKit app
# Monitor for errors

# Verify data integrity
SELECT
  COUNT(*) FILTER (WHERE sport_type IS NULL) as null_sport,
  COUNT(*) FILTER (WHERE photo_category IS NULL) as null_category,
  COUNT(*) as total
FROM photo_metadata;

# Expected: null_sport < 100, null_category < 50
```

**Day 5: Post-Deploy Validation**
- Run full SEO audit (meta tags correct?)
- Test all filters on production
- Verify analytics tracking sport_type
- Monitor Supabase query performance

---

## Part 5: Cost-Benefit Analysis

### Option A: Re-Enrich All 20K Photos (NOT RECOMMENDED)

**Costs:**
- API calls: 20,000 × $0.0121 = **$242**
- Development time: 2 weeks
- Risk: Data loss, prompt tuning iterations (+$100)
- **Total: ~$350 + 2 weeks**

**Benefits:**
- Perfect sport taxonomy consistency
- Latest AI model improvements
- Cleaner data architecture

**Verdict:** ❌ **Not worth it** - existing data is already 90% compatible

---

### Option B: Layer Taxonomy + Enhanced Future Enrichment (RECOMMENDED)

**Costs:**
- Schema migration: 2 days
- Inference queries: 1 day
- Manual review (2K photos): 2 days
- Prompt enhancement: 3 days
- Testing & deployment: 1 week
- **Total: ~2 weeks, $0 API cost**

**Benefits:**
- ✅ Preserve $300 existing investment
- ✅ Sport-agnostic for future photos
- ✅ 80-90% accurate sport classification
- ✅ Backward compatible (no breaking changes)
- ✅ Incremental improvement

**Verdict:** ✅ **HIGHLY RECOMMENDED**

---

## Part 6: Decision Matrix

| Question | Answer | Rationale |
|----------|--------|-----------|
| **Re-enrich 20K photos?** | ❌ NO | Existing data is 90% compatible, not worth $350 |
| **Update enrichment prompt?** | ✅ YES | Future photos need sport detection |
| **Add database fields?** | ✅ YES | Enables sport filtering, SEO, multi-sport |
| **Infer sport from existing data?** | ✅ YES | 80% accuracy via SQL queries, good enough |
| **Manual review needed?** | ✅ YES | ~2,000 photos (10%) need human tagging |
| **Breaking changes?** | ❌ NO | Additive schema, backward compatible |

---

## Part 7: Success Metrics

### Migration Success Criteria

**Week 1 (Schema):**
- [ ] `sport_type` populated for ≥90% of photos
- [ ] `photo_category` populated for ≥95% of photos
- [ ] Zero null values in quality scores
- [ ] All indexes created and performing (<50ms queries)

**Week 2 (Enrichment):**
- [ ] Enhanced prompt tested on 100 sample photos
- [ ] Sport detection accuracy ≥95% (manual validation)
- [ ] Action type taxonomy working for 5+ sports
- [ ] Cost per photo ≤$0.015 (within budget)

**Week 3 (Frontend):**
- [ ] Sport filter UI functional
- [ ] Category filter UI functional
- [ ] Query performance <500ms for filtered views
- [ ] SEO meta tags include sport_type

**Week 4 (Production):**
- [ ] Migration deployed to production
- [ ] Zero data loss (20K photos intact)
- [ ] Sport filtering works on live site
- [ ] Analytics tracking sport_type distributions

---

## Final Recommendation

**Execute Option B: Layer Taxonomy + Enhanced Future Enrichment**

**Timeline:** 4 weeks
**Cost:** $0 API costs (preserve existing enrichment)
**Risk:** Low (additive changes, no data loss)
**ROI:** High (enables multi-sport positioning without re-enrichment)

**Next Step:** Begin Week 1, Day 1 - Database backup and schema migration preparation.

---

**This strategy preserves your $300 enrichment investment while future-proofing for multi-sport growth.**
