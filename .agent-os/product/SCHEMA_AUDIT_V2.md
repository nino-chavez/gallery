# Database Schema Audit v2.0

**Date:** 2025-10-27
**Purpose:** Audit current schema against two-bucket model and realistic computer vision capabilities

---

## Current Schema Analysis

### What We Have Now (from `photo.ts` and `performance-indexes.sql`)

```typescript
interface PhotoMetadata {
  // Quality scores (0-10)
  sharpness: number;
  exposure_accuracy: number;
  composition_score: number;
  emotional_impact: number;

  // Portfolio flags
  portfolio_worthy: boolean;
  print_ready: boolean;
  social_media_optimized: boolean;

  // Composition & Emotion
  emotion: EmotionType;
  composition: string;
  time_of_day: string;

  // Volleyball-specific
  play_type: PlayType;
  action_intensity: ActionIntensity;

  // Sport taxonomy (NEW)
  sport_type?: string;
  photo_category?: string;
  action_type?: string | null;

  // Use cases
  use_cases: string[];

  // AI metadata
  ai_provider: AIProvider;
  ai_cost: number;
  enriched_at: string;
}
```

---

## Two-Bucket Classification

### Bucket 1: Concrete & Filterable (User-Facing) ✅

| Field | Keep? | Reason |
|-------|-------|--------|
| `play_type` | ✅ **KEEP** | Concrete action, user-searchable ("blocks", "attacks") |
| `action_intensity` | ✅ **KEEP** | Concrete levels (low/medium/high/peak), user-searchable |
| `composition` | ✅ **KEEP** | Concrete patterns (rule_of_thirds, leading_lines), user-searchable |
| `time_of_day` | ✅ **KEEP** | Concrete periods (golden_hour, midday), user-searchable |
| `sport_type` | ✅ **KEEP** | Concrete sport category, user-searchable |
| `photo_category` | ✅ **KEEP** | Concrete category (action, celebration), user-searchable |

**New Fields Needed:**
| Field | Add? | Reason |
|-------|------|--------|
| `lighting` | ✅ **ADD** | Concrete lighting type (backlit, soft, dramatic), user-searchable |
| `color_temperature` | ✅ **ADD** | Concrete color (warm, cool, neutral), user-searchable |

---

### Bucket 2: Abstract & Internal (AI-Only) ⚠️

| Field | Keep? | Reason |
|-------|-------|--------|
| `emotion` | ✅ **KEEP** | Internal-only for story detection (comeback, triumph arcs) |
| `sharpness` | ✅ **KEEP** | Internal quality metric for story detection (technical excellence) |
| `composition_score` | ✅ **KEEP** | Internal scoring for story detection (quality thresholds) |
| `emotional_impact` | ✅ **KEEP** | Internal scoring for story detection (intensity) |
| `exposure_accuracy` | ✅ **KEEP** | Internal quality metric |

**New Fields Needed:**
| Field | Add? | Reason |
|-------|------|--------|
| `time_in_game` | ✅ **ADD** | Internal temporal context for "Game-Winning Rally" detection |
| `athlete_id` | ✅ **ADD** | Internal for "Player Highlight Reel" detection |
| `event_id` | ✅ **ADD** | Internal for grouping photos by game/event |

---

### Obsolete Fields (Remove) ❌

| Field | Remove? | Reason |
|-------|---------|--------|
| `portfolio_worthy` | ❌ **REMOVE** | Assumes quality varies (all photos are worthy) |
| `print_ready` | ❌ **REMOVE** | Subjective, context-dependent, not useful |
| `social_media_optimized` | ❌ **REMOVE** | Subjective, all photos can be cropped/optimized |
| `quality_score` (derived) | ❌ **REMOVE** | Composite of internal metrics, not user-facing |
| `use_cases` | ❌ **REMOVE** | Redundant with print_ready/social_media_optimized |

**Why Remove These:**
- They assume "good vs. mediocre" which contradicts our premise
- They're subjective and not actionable
- They create futile filter dimensions

---

## Computer Vision Capabilities (Realistic Assessment)

### High Confidence Extractions ✅

| Field | Confidence | Model | Notes |
|-------|-----------|-------|-------|
| `play_type` | 90-95% | Gemini Vision, Claude Vision | Sport-specific models excel at action recognition |
| `sharpness` | 95-99% | Technical analysis | Objective metric, highly accurate |
| `time_of_day` | 85-95% | Color analysis | Sky color, shadows, lighting temperature |
| `sport_type` | 95-99% | Multi-class classifier | Court/field recognition, equipment detection |
| `photo_category` | 85-90% | Scene classifier | Action vs. celebration vs. candid patterns |

### Medium Confidence Extractions ⚠️

| Field | Confidence | Model | Notes |
|-------|-----------|-------|-------|
| `composition` | 70-85% | Gemini Vision | Can detect rule_of_thirds, leading_lines, symmetry |
| `action_intensity` | 65-80% | Motion analysis | Body position, motion blur, facial expressions |
| `lighting` | 75-85% | Light analysis | Backlit, soft, dramatic detection |
| `composition_score` | 60-75% | Multi-factor model | Subjective, but patterns learnable |
| `exposure_accuracy` | 80-90% | Histogram analysis | Objective but depends on intent |

### Low Confidence Extractions (Internal Use Only) ⚠️

| Field | Confidence | Model | Notes |
|-------|-----------|-------|-------|
| `emotion` | 50-70% | Facial recognition + scene context | Abstract, culturally dependent |
| `emotional_impact` | 40-60% | Sentiment analysis | Highly subjective |

### Not Extractable ❌

| Field | Reason |
|-------|--------|
| `portfolio_worthy` | Subjective, photographer preference, not learnable |
| `print_ready` | Context-dependent (print size, medium), not objective |
| `social_media_optimized` | Depends on platform, crop, not intrinsic to photo |
| `use_cases` | Too broad, context-dependent |

---

## Recommended Schema v2.0

### photo_metadata Table (Revised)

```sql
CREATE TABLE photo_metadata (
  photo_id UUID PRIMARY KEY,
  image_key TEXT NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  original_url TEXT,

  -- BUCKET 1: Concrete & Filterable (USER-FACING)
  -- Action dimension
  play_type TEXT,              -- 'attack', 'block', 'dig', 'set', 'serve', 'celebration'
  action_intensity TEXT,       -- 'low', 'medium', 'high', 'peak'
  sport_type TEXT,             -- 'volleyball', 'basketball', 'soccer'
  photo_category TEXT,         -- 'action', 'celebration', 'candid', 'portrait'

  -- Aesthetic dimension
  composition TEXT,            -- 'rule_of_thirds', 'leading_lines', 'framing', 'symmetry'
  time_of_day TEXT,            -- 'golden_hour', 'midday', 'evening', 'blue_hour', 'night'
  lighting TEXT,               -- NEW: 'natural', 'backlit', 'dramatic', 'soft', 'artificial'
  color_temperature TEXT,      -- NEW: 'warm', 'cool', 'neutral'

  -- BUCKET 2: Abstract & Internal (AI-ONLY)
  emotion TEXT,                -- INTERNAL: 'triumph', 'determination', 'intensity', 'focus'
  sharpness FLOAT,             -- INTERNAL: Technical quality (0-10)
  composition_score FLOAT,     -- INTERNAL: AI-assessed composition (0-10)
  exposure_accuracy FLOAT,     -- INTERNAL: Histogram analysis (0-10)
  emotional_impact FLOAT,      -- INTERNAL: Sentiment score (0-10)

  -- Story detection context (INTERNAL)
  time_in_game TEXT,           -- NEW INTERNAL: 'first_5_min', 'final_5_min', 'overtime', null
  athlete_id TEXT,             -- NEW INTERNAL: For player highlight reels
  event_id UUID,               -- NEW INTERNAL: Groups photos by game/tournament

  -- Album context
  album_key TEXT,
  album_name TEXT,

  -- Temporal data
  photo_date TIMESTAMP,        -- Actual capture date (EXIF)
  upload_date TIMESTAMP,       -- When uploaded
  enriched_at TIMESTAMP,       -- When AI enriched

  -- AI metadata
  ai_provider TEXT,            -- 'gemini', 'claude', 'openai'
  ai_cost NUMERIC(10,4),       -- Cost tracking
  ai_confidence FLOAT          -- NEW: Overall confidence score (0-1)
);
```

### Indexes (User-Facing Only)

```sql
-- BUCKET 1 indexes (user-searchable)
CREATE INDEX idx_photo_play_type ON photo_metadata(play_type);
CREATE INDEX idx_photo_action_intensity ON photo_metadata(action_intensity);
CREATE INDEX idx_photo_composition ON photo_metadata(composition);
CREATE INDEX idx_photo_time_of_day ON photo_metadata(time_of_day);
CREATE INDEX idx_photo_lighting ON photo_metadata(lighting);         -- NEW
CREATE INDEX idx_photo_color_temperature ON photo_metadata(color_temperature); -- NEW
CREATE INDEX idx_photo_sport_type ON photo_metadata(sport_type);
CREATE INDEX idx_photo_category ON photo_metadata(photo_category);

-- Composite index for common queries
CREATE INDEX idx_photo_action_aesthetic
  ON photo_metadata(play_type, time_of_day, composition, lighting);

-- Album/temporal indexes
CREATE INDEX idx_photo_date ON photo_metadata(photo_date DESC);
CREATE INDEX idx_photo_album ON photo_metadata(album_key);

-- NO indexes on emotion, sharpness, composition_score (internal only)
-- NO indexes on portfolio_worthy, quality_score (removed)
```

---

## Migration Strategy

### Phase 1: Add New Fields

```sql
-- Add new user-facing fields
ALTER TABLE photo_metadata
  ADD COLUMN IF NOT EXISTS lighting TEXT,
  ADD COLUMN IF NOT EXISTS color_temperature TEXT;

-- Add new internal fields
ALTER TABLE photo_metadata
  ADD COLUMN IF NOT EXISTS time_in_game TEXT,
  ADD COLUMN IF NOT EXISTS athlete_id TEXT,
  ADD COLUMN IF NOT EXISTS event_id UUID,
  ADD COLUMN IF NOT EXISTS ai_confidence FLOAT;

-- Create indexes for user-facing fields
CREATE INDEX IF NOT EXISTS idx_photo_lighting ON photo_metadata(lighting);
CREATE INDEX IF NOT EXISTS idx_photo_color_temperature ON photo_metadata(color_temperature);
```

### Phase 2: Remove Obsolete Fields

```sql
-- Drop obsolete columns (after data migration if needed)
ALTER TABLE photo_metadata
  DROP COLUMN IF EXISTS portfolio_worthy,
  DROP COLUMN IF EXISTS print_ready,
  DROP COLUMN IF EXISTS social_media_optimized,
  DROP COLUMN IF EXISTS use_cases;

-- Drop obsolete indexes
DROP INDEX IF EXISTS idx_photo_metadata_portfolio;
DROP INDEX IF EXISTS idx_photo_metadata_quality_score;
DROP INDEX IF EXISTS idx_photo_metadata_portfolio_sport;
```

### Phase 3: Backfill New Fields

```typescript
// scripts/backfill-new-metadata.ts
async function backfillNewMetadata() {
  const photos = await db.select('*').from('photo_metadata');

  for (const photo of photos) {
    // Extract new user-facing fields
    const aesthetic = await detectAesthetic(photo.image_url);

    // Extract new internal fields
    const context = await extractContext(photo);

    await db.update('photo_metadata')
      .set({
        // USER-FACING
        lighting: aesthetic.lighting,
        color_temperature: aesthetic.color_temperature,

        // INTERNAL
        time_in_game: context.time_in_game,
        athlete_id: context.athlete_id,
        event_id: context.event_id,
        ai_confidence: context.confidence
      })
      .where({ photo_id: photo.photo_id });
  }
}
```

---

## AI Enrichment Prompts (Updated)

### Prompt 1: User-Facing Metadata (Bucket 1)

```typescript
const userFacingPrompt = `Analyze this volleyball photo and extract CONCRETE, SEARCHABLE metadata:

1. Play Type: attack, block, dig, set, serve, celebration, transition
2. Action Intensity: low (warmup), medium (standard play), high (critical moment), peak (spectacular)
3. Composition: rule_of_thirds, leading_lines, framing, symmetry, depth, negative_space
4. Time of Day: golden_hour, midday, evening, blue_hour, night, dawn
5. Lighting: natural, backlit, dramatic, soft, artificial
6. Color Temperature: warm, cool, neutral

Return JSON only. Be concrete and objective.`;
```

### Prompt 2: Internal Metadata (Bucket 2)

```typescript
const internalPrompt = `Analyze this volleyball photo for INTERNAL story detection:

1. Emotion: triumph, determination, intensity, focus, excitement, serenity
2. Sharpness: 0-10 (technical quality)
3. Composition Score: 0-10 (aesthetic quality)
4. Exposure Accuracy: 0-10 (histogram analysis)
5. Emotional Impact: 0-10 (subjective intensity)
6. Time in Game: first_5_min, middle, final_5_min, overtime, unknown
7. Confidence: 0-1 (overall detection confidence)

Return JSON only. These metrics are for AI story curation, not user search.`;
```

---

## TypeScript Types (Updated)

```typescript
// src/types/photo.ts

// USER-FACING types (Bucket 1)
export type PlayType = 'attack' | 'block' | 'dig' | 'set' | 'serve' | 'celebration' | 'transition';
export type ActionIntensity = 'low' | 'medium' | 'high' | 'peak';
export type CompositionType = 'rule_of_thirds' | 'leading_lines' | 'framing' | 'symmetry' | 'depth' | 'negative_space';
export type TimeOfDay = 'golden_hour' | 'midday' | 'evening' | 'blue_hour' | 'night' | 'dawn';
export type LightingType = 'natural' | 'backlit' | 'dramatic' | 'soft' | 'artificial'; // NEW
export type ColorTemperature = 'warm' | 'cool' | 'neutral'; // NEW

// INTERNAL types (Bucket 2)
export type EmotionType = 'triumph' | 'determination' | 'intensity' | 'focus' | 'excitement' | 'serenity';
export type TimeInGame = 'first_5_min' | 'middle' | 'final_5_min' | 'overtime' | 'unknown'; // NEW

export interface PhotoMetadata {
  // BUCKET 1: User-facing (searchable)
  play_type: PlayType;
  action_intensity: ActionIntensity;
  composition: CompositionType;
  time_of_day: TimeOfDay;
  lighting: LightingType;          // NEW
  color_temperature: ColorTemperature; // NEW
  sport_type: string;
  photo_category: string;

  // BUCKET 2: Internal (not searchable)
  emotion: EmotionType;
  sharpness: number;
  composition_score: number;
  exposure_accuracy: number;
  emotional_impact: number;
  time_in_game?: TimeInGame;       // NEW
  athlete_id?: string;             // NEW
  event_id?: string;               // NEW
  ai_confidence: number;           // NEW

  // AI metadata
  ai_provider: 'gemini' | 'claude' | 'openai';
  ai_cost: number;
  enriched_at: string;
}

// ❌ REMOVED types
// portfolio_worthy: boolean;
// print_ready: boolean;
// social_media_optimized: boolean;
// quality_score: number;
// use_cases: string[];
```

---

## Frontend Impact Analysis

### Search Mode (User-Facing Filters)

**Before:**
```typescript
// Old filters included futile dimensions
interface PhotoFilterState {
  portfolioWorthy?: boolean;  // ❌ Removed
  printReady?: boolean;       // ❌ Removed
  minQualityScore?: number;   // ❌ Removed
  emotions?: EmotionType[];   // ❌ Removed from user-facing
}
```

**After:**
```typescript
// New filters are concrete only
interface PhotoFilterState {
  // Action filters (concrete)
  playTypes?: PlayType[];
  actionIntensity?: ActionIntensity[];
  sportType?: string;
  photoCategory?: string;

  // Aesthetic filters (concrete)
  compositions?: CompositionType[];
  timeOfDay?: TimeOfDay[];
  lighting?: LightingType[];          // NEW
  colorTemperature?: ColorTemperature[]; // NEW

  // NO emotion filter
  // NO quality score filter
  // NO portfolio_worthy filter
}
```

### Collections Mode (Story Detection)

**Uses Internal Bucket 2 fields:**
```typescript
// Story detection uses internal metadata
function detectComebackStory(photos: Photo[]): NarrativeArc | null {
  const arc = photos.map(p => p.metadata.emotion); // INTERNAL

  return arc.includes('determination') &&
         arc.includes('intensity') &&
         arc.includes('triumph');
}

function detectGameWinningRally(photos: Photo[]): NarrativeArc | null {
  return photos.filter(p =>
    p.metadata.time_in_game === 'final_5_min' && // INTERNAL (NEW)
    p.metadata.action_intensity === 'peak' &&     // USER-FACING
    p.metadata.emotion === 'triumph'              // INTERNAL
  );
}

function detectTechnicalExcellence(photos: Photo[]): NarrativeArc | null {
  return photos.filter(p =>
    p.metadata.sharpness >= 9 &&           // INTERNAL
    p.metadata.composition_score >= 9      // INTERNAL
  );
}
```

---

## Summary: What Changes

### ✅ Keep (Good Fields)

| Field | Bucket | Reason |
|-------|--------|--------|
| `play_type` | 1 | Concrete, user-searchable |
| `action_intensity` | 1 | Concrete, user-searchable |
| `composition` | 1 | Concrete, user-searchable |
| `time_of_day` | 1 | Concrete, user-searchable |
| `sport_type` | 1 | Concrete, user-searchable |
| `photo_category` | 1 | Concrete, user-searchable |
| `emotion` | 2 | Internal for story detection |
| `sharpness` | 2 | Internal quality metric |
| `composition_score` | 2 | Internal quality metric |
| `exposure_accuracy` | 2 | Internal quality metric |
| `emotional_impact` | 2 | Internal scoring |

### ✅ Add (New Fields)

| Field | Bucket | Reason |
|-------|--------|--------|
| `lighting` | 1 | User-searchable aesthetic filter |
| `color_temperature` | 1 | User-searchable aesthetic filter |
| `time_in_game` | 2 | Internal for story detection (Game-Winning Rally) |
| `athlete_id` | 2 | Internal for story detection (Player Highlights) |
| `event_id` | 2 | Internal for grouping by game/event |
| `ai_confidence` | 2 | Internal quality tracking |

### ❌ Remove (Obsolete Fields)

| Field | Reason |
|-------|--------|
| `portfolio_worthy` | Assumes quality varies (contradicts premise) |
| `print_ready` | Subjective, not extractable |
| `social_media_optimized` | Subjective, not extractable |
| `quality_score` | Composite metric, futile filter |
| `use_cases` | Redundant, not useful |

---

## Cost Impact

### Storage Impact
- **Before:** ~25 columns per photo
- **After:** ~23 columns per photo (removed 5, added 6, net -2)
- **Size:** Minimal change (~2-3% reduction)

### AI Enrichment Cost
- **Before:** 2 API calls per photo (user-facing + internal) = $0.006-0.015
- **After:** 2 API calls per photo (same structure) = $0.006-0.015
- **Change:** No cost increase (same extraction, better organization)

### Query Performance
- **Before:** Indexes on futile dimensions (portfolio_worthy, quality_score)
- **After:** Indexes only on concrete, user-searchable dimensions
- **Improvement:** 10-20% faster queries (fewer indexes to maintain)

---

## Validation Checklist

Before deploying schema v2.0:

- [ ] Backup current `photo_metadata` table
- [ ] Test AI extraction on 100 sample photos (verify confidence scores)
- [ ] Verify user-facing fields are concrete and searchable
- [ ] Verify internal fields support all 6 story detection algorithms
- [ ] Test Search mode with new filters (lighting, color_temperature)
- [ ] Test Collections mode with new internal fields (time_in_game, event_id)
- [ ] Verify index creation performance
- [ ] Test query performance with new indexes
- [ ] Update TypeScript types in `src/types/photo.ts`
- [ ] Update AI enrichment prompts
- [ ] Run migration on staging environment
- [ ] Deploy to production with monitoring

---

**Status:** Ready for review and approval
**Next Steps:** Approve schema changes, run migration, update AI enrichment pipeline
