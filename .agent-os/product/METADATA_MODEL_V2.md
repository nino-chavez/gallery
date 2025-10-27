# Metadata Model v2.0 - Concrete & Filterable

**Last Updated:** 2025-10-27
**Status:** Active (Post-Pivot)
**Version:** 2.1.0 (Corrected)

---

## The Problem with the Old Model

### The Design Smell

> "If I'm always forced to filter by a second dimension, then is the first dimension useful?"

**The answer is no.** The old metadata model was built on abstract tags that were useless on their own:

- ❌ `emotion: triumph` (Too abstract. What does "triumph" mean without context?)
- ❌ `quality_score: 8.5` (Subjective. Not actionable. Assumes quality varies.)
- ❌ Filtering by emotion alone returns unrelated photos (triumph blocks + triumph serves + triumph celebrations)

**The result:** Users were always forced to filter by TWO dimensions (emotion + play_type), proving the first dimension (emotion) was futile.

---

## The Trap We Almost Fell Into (Again)

### First Attempt at v2.0 (FLAWED)

We initially tried to replace emotion with "story_type" as a searchable pillar:

- ❌ "Pillar 1: Story" (`story_type: comeback`, `story_type: game_winning_rally`)
- ❌ This is the SAME PROBLEM with a fancier name
- ❌ A user would NEVER search for "comeback story" - it's a black-box AI concept
- ❌ It's abstract and futile as a filter input

### The Real Insight

**Story is NOT a filter dimension. Story is a FEATURE.**

- ❌ **Wrong:** "Filter by story_type" (abstract, not intuitive)
- ✅ **Right:** "Navigate TO a pre-curated Story collection"

Users don't search FOR stories. They discover stories as curated destinations in **Collections mode**.

---

## The Correct Model: Two Buckets

Our AI enrichment strategy now has **two distinct purposes**:

### Bucket 1: Concrete & Filterable (User-Facing)

**Purpose:** Expose directly to users as search filters in **Search mode**

**Requirement:** Must be concrete, intuitive, and useful as a **first-dimension** filter

**The Two Pillars:**

#### Pillar 1: Action (Concrete Play Type)

**What AI Finds:**
- `play_type: "block"`, `"attack"`, `"dig"`, `"set"`, `"serve"`, `"celebration"`
- `action_intensity: "low"`, `"medium"`, `"high"`, `"peak"`

**Why Valid:**
- Concrete and searchable
- User understands: "Show me blocks" or "Find peak intensity attacks"
- Directly answers Seeker (Maria's) need to find **specific moments**

**User Queries:**
- "blocks" → `play_type: block`
- "intense attacks" → `play_type: attack`, `action_intensity: peak`
- "diving digs" → `play_type: dig`

#### Pillar 2: Aesthetic (Concrete Composition)

**What AI Finds:**
- `composition: "rule_of_thirds"`, `"leading_lines"`, `"framing"`, `"symmetry"`
- `time_of_day: "golden_hour"`, `"midday"`, `"evening"`, `"blue_hour"`
- `lighting: "natural"`, `"backlit"`, `"dramatic"`, `"soft"`

**Why Valid:**
- Concrete visual characteristics
- User understands: "Show me golden hour shots" or "Find backlit photos"
- Useful for Explorer (Alex) and Curator (David) finding **visual styles**

**User Queries:**
- "golden hour" → `time_of_day: golden_hour`
- "rule of thirds blocks" → `composition: rule_of_thirds`, `play_type: block`
- "dramatic backlit attacks" → `lighting: dramatic OR backlit`, `play_type: attack`

---

### Bucket 2: Abstract & Internal (AI-Only)

**Purpose:** Internal raw material for AI Story Curation Engine to generate Collections

**Requirement:** NOT exposed as user-facing filters

**What AI Finds (Internal Use Only):**

#### Internal Tags (Hidden from Users)

- `emotion: "triumph"`, `"determination"`, `"intensity"`, `"focus"` (abstract, not searchable)
- `sharpness: 9.5` (technical quality metric, internal scoring)
- `composition_score: 9.0` (AI-assessed composition quality, not user-facing)
- `time_in_game: "final_5_minutes"` (temporal context, internal)
- `emotional_arc: [{emotion: 'determination', timestamp: 0}, {emotion: 'triumph', timestamp: 5}]` (narrative context)

#### Why Internal Only

**These tags are NOT useless - they're just not user-facing filters.**

The AI Story Curation Engine uses these internal tags to **generate high-value curated outputs**:

| Internal Tags | Output Collection |
|---------------|------------------|
| `emotion=determination` + `emotion=triumph` | **"Comeback Stories"** collection |
| `sharpness>=9` + `composition_score>=9` | **"Technical Excellence"** collection |
| `time_in_game=final_5_minutes` + `emotion=triumph` | **"Game-Winning Rally"** collection |

**The Result:**
- ✅ User gets the BENEFIT of abstract data (curated story collections)
- ✅ User avoids the CONFUSION of abstract filters (no "emotion" search box)
- ✅ User navigates TO "Comeback Stories" in Collections mode (destination, not filter)

---

## The AI Enrichment Mandate

### What the AI's Job Is

**The AI has two distinct enrichment tasks:**

#### Task 1: Find Concrete Filters (Bucket 1)
**For:** Search mode
**Output:** User-facing metadata in `photo_metadata` table

```sql
-- Concrete, searchable dimensions
ALTER TABLE photo_metadata
  ADD COLUMN play_type TEXT, -- USER-FACING
  ADD COLUMN action_intensity TEXT, -- USER-FACING
  ADD COLUMN composition TEXT, -- USER-FACING
  ADD COLUMN time_of_day TEXT, -- USER-FACING
  ADD COLUMN lighting TEXT; -- USER-FACING
```

#### Task 2: Find Internal Inputs (Bucket 2)
**For:** Collections mode (AI Story Curation Engine)
**Output:** Internal metadata for story detection

```sql
-- Internal tags (NOT user-facing filters)
ALTER TABLE photo_metadata
  ADD COLUMN emotion TEXT, -- INTERNAL ONLY
  ADD COLUMN sharpness FLOAT, -- INTERNAL ONLY
  ADD COLUMN composition_score FLOAT, -- INTERNAL ONLY
  ADD COLUMN time_in_game TEXT, -- INTERNAL ONLY
  ADD COLUMN emotional_impact FLOAT; -- INTERNAL ONLY

-- Story output table (curated destinations)
CREATE TABLE photo_stories (
  story_id UUID PRIMARY KEY,
  story_type TEXT NOT NULL, -- 'comeback', 'game_winning_rally', etc.
  title TEXT,
  description TEXT,
  photo_ids UUID[], -- Photos IN this story
  event_id UUID,
  detected_at TIMESTAMP,
  emotional_arc JSONB, -- Internal: emotion timeline
  confidence_score FLOAT
);
```

---

## Database Schema (Two-Bucket Approach)

### photo_metadata Table

```sql
CREATE TABLE photo_metadata (
  photo_id UUID PRIMARY KEY,
  image_url TEXT NOT NULL,

  -- BUCKET 1: Concrete & Filterable (USER-FACING)
  play_type TEXT, -- 'attack', 'block', 'dig', 'set', 'serve'
  action_intensity TEXT, -- 'low', 'medium', 'high', 'peak'
  composition TEXT, -- 'rule_of_thirds', 'leading_lines', 'framing'
  time_of_day TEXT, -- 'golden_hour', 'midday', 'evening'
  lighting TEXT, -- 'natural', 'backlit', 'dramatic'

  -- BUCKET 2: Abstract & Internal (AI-ONLY)
  emotion TEXT, -- INTERNAL: Used by story detection
  sharpness FLOAT, -- INTERNAL: Technical quality metric
  composition_score FLOAT, -- INTERNAL: AI-assessed quality
  time_in_game TEXT, -- INTERNAL: Temporal context
  emotional_impact FLOAT, -- INTERNAL: Narrative scoring

  -- Metadata
  album_key TEXT,
  photo_date TIMESTAMP,
  enriched_at TIMESTAMP
);

-- Indexes for USER-FACING filters only
CREATE INDEX idx_photo_play_type ON photo_metadata(play_type);
CREATE INDEX idx_photo_action_intensity ON photo_metadata(action_intensity);
CREATE INDEX idx_photo_composition ON photo_metadata(composition);
CREATE INDEX idx_photo_time_of_day ON photo_metadata(time_of_day);
CREATE INDEX idx_photo_lighting ON photo_metadata(lighting);

-- Composite index for common queries
CREATE INDEX idx_photo_action_aesthetic
  ON photo_metadata(play_type, time_of_day, composition);

-- NO index on emotion (not user-facing)
-- NO index on sharpness (internal only)
```

### photo_stories Table (Curated Outputs)

```sql
CREATE TABLE photo_stories (
  story_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_type TEXT NOT NULL, -- 'comeback', 'technical_excellence', etc.
  title TEXT NOT NULL,
  description TEXT,
  photo_ids UUID[] NOT NULL, -- Array of photo IDs in this story
  event_id UUID, -- Link to event/game
  detected_at TIMESTAMP DEFAULT now(),
  emotional_arc JSONB, -- Internal: [{emotion: 'determination', intensity: 0.7}, ...]
  confidence_score FLOAT -- AI detection confidence (0-1)
);

CREATE INDEX idx_photo_stories_type ON photo_stories(story_type);
CREATE INDEX idx_photo_stories_event ON photo_stories(event_id);
```

---

## The Two Pillars (Detailed)

### Pillar 1: Action (Concrete Play Type)

#### play_type Field

| Value | Description | Search Keywords | Icon (Lucide) |
|-------|-------------|-----------------|---------------|
| `attack` | Hitting/spiking | "attacks", "spikes", "hits" | `<Zap />` |
| `block` | Blocking at net | "blocks", "blocking", "stuff blocks" | `<Shield />` |
| `dig` | Defensive save | "digs", "saves", "defensive plays" | `<ArrowDown />` |
| `set` | Setting | "sets", "setter hands", "setting" | `<Target />` |
| `serve` | Serving | "serves", "jump serves", "serving" | `<Circle />` |
| `celebration` | Celebrating | "celebrations", "cheering", "team moments" | `<Star />` |
| `transition` | Movement | "running", "movement", "transitions" | `<Move />` |

#### action_intensity Field

| Value | Description | Use Case |
|-------|-------------|----------|
| `low` | Warm-ups, practice | Background photos |
| `medium` | Standard gameplay | General coverage |
| `high` | Critical plays | Highlight moments |
| `peak` | Spectacular plays | Hero shots |

#### AI Detection (Computer Vision)

```typescript
// Use Gemini Vision or Claude Vision API
export async function detectAction(imageUrl: string): Promise<Action> {
  const response = await gemini.analyzeImage({
    image: imageUrl,
    prompt: `Analyze this volleyball photo and identify:
    1. Play type (attack, block, dig, set, serve, celebration, transition)
    2. Action intensity (low, medium, high, peak)

    Return JSON: {"play_type": "block", "action_intensity": "peak"}`
  });

  return JSON.parse(response);
}
```

---

### Pillar 2: Aesthetic (Concrete Composition)

#### composition Field

| Value | Description | Visual Characteristic |
|-------|-------------|----------------------|
| `rule_of_thirds` | Subject at intersection points | Balanced, professional |
| `leading_lines` | Lines guide eye to subject | Dynamic, storytelling |
| `framing` | Subject framed by environment | Focused, intimate |
| `symmetry` | Balanced, mirrored | Architectural, formal |
| `depth` | Foreground/background separation | Cinematic, 3D feel |
| `negative_space` | Subject isolated with space | Minimalist, dramatic |

#### time_of_day Field

| Value | Description | Visual Quality |
|-------|-------------|----------------|
| `dawn` | Pre-sunrise | Soft, ethereal |
| `morning` | Morning light | Bright, energetic |
| `afternoon` | Midday | High contrast |
| `golden_hour` | Hour before sunset | Warm, glowing |
| `evening` | Post-sunset, dusk | Cool, dramatic |
| `night` | Artificial lighting | High ISO, dramatic |
| `blue_hour` | Twilight | Cool blue tones |

#### lighting Field

| Value | Description | Use Case |
|-------|-------------|----------|
| `natural` | Window/outdoor light | Soft, realistic |
| `artificial` | Gym lighting | Bright, sharp |
| `backlit` | Subject silhouetted | Dramatic, high contrast |
| `soft` | Diffused, even | Flattering, gentle |
| `dramatic` | High contrast, directional | Moody, intense |

#### AI Detection (Computer Vision)

```typescript
export async function detectAesthetic(imageUrl: string): Promise<Aesthetic> {
  const response = await gemini.analyzeImage({
    image: imageUrl,
    prompt: `Analyze this volleyball photo's visual characteristics:
    1. Composition pattern (rule_of_thirds, leading_lines, framing, symmetry, depth, negative_space)
    2. Time of day (dawn, morning, afternoon, golden_hour, evening, night, blue_hour)
    3. Lighting type (natural, artificial, backlit, soft, dramatic)

    Return JSON only.`
  });

  return JSON.parse(response);
}
```

---

## How Collections Mode Works (Story as Destination)

### The AI Story Curation Engine

**Purpose:** Use Bucket 2 (internal metadata) to generate curated story collections

**Implementation:** Deliverable 9 from old roadmap (repurposed)

#### Story Detection Algorithms (6 Types)

##### 1. Game-Winning Rally

**Detection Logic:**
```typescript
function detectGameWinningRally(photos: Photo[]): NarrativeArc | null {
  const candidates = photos.filter(p =>
    p.time_in_game === 'final_5_minutes' && // INTERNAL
    (p.action_intensity === 'peak' || p.action_intensity === 'high') && // USER-FACING
    (p.emotion === 'triumph' || p.emotion === 'intensity') // INTERNAL
  );

  if (candidates.length >= 3) {
    return {
      story_id: generateId(),
      story_type: 'game_winning_rally',
      title: 'Game-Winning Rally',
      description: 'Final moments of triumph',
      photos: candidates,
      confidence_score: 0.9
    };
  }
  return null;
}
```

**Uses Internal Tags:** `time_in_game`, `emotion`

**User Experience:** Navigate to `/collections/game-winning-rally` (destination, not filter)

##### 2. Comeback Story

**Detection Logic:**
```typescript
function detectComebackStory(photos: Photo[]): NarrativeArc | null {
  // Emotional arc: determination → intensity → triumph
  const emotions = photos.map(p => p.emotion); // INTERNAL

  const hasDetermination = emotions.includes('determination');
  const hasIntensity = emotions.includes('intensity');
  const hasTriumph = emotions.includes('triumph');

  if (hasDetermination && hasIntensity && hasTriumph && photos.length >= 4) {
    return {
      story_id: generateId(),
      story_type: 'comeback',
      title: 'Comeback Story',
      description: 'From adversity to triumph',
      photos: sortByEmotionalArc(photos),
      emotional_arc: generateEmotionalCurve(photos), // INTERNAL
      confidence_score: 0.85
    };
  }
  return null;
}
```

**Uses Internal Tags:** `emotion`, `emotional_arc`

**User Experience:** Navigate to `/collections/comeback-stories` (destination)

##### 3. Technical Excellence

**Detection Logic:**
```typescript
function detectTechnicalExcellence(photos: Photo[]): NarrativeArc | null {
  const candidates = photos.filter(p =>
    p.sharpness >= 9 && // INTERNAL
    p.composition_score >= 9 // INTERNAL
  );

  if (candidates.length >= 8) {
    return {
      story_id: generateId(),
      story_type: 'technical_excellence',
      title: 'Technical Excellence',
      description: 'Outstanding composition and sharpness',
      photos: candidates.sort((a, b) => b.sharpness - a.sharpness),
      confidence_score: 0.95
    };
  }
  return null;
}
```

**Uses Internal Tags:** `sharpness`, `composition_score`

**User Experience:** Navigate to `/collections/technical-excellence` (destination)

##### 4. Player Highlight Reel

**Detection Logic:**
```typescript
function detectPlayerHighlights(photos: Photo[], athleteId: string): NarrativeArc | null {
  // Top 10 portfolio shots per athlete
  const athletePhotos = photos
    .filter(p => p.athlete_id === athleteId)
    .filter(p => p.sharpness >= 8 && p.composition_score >= 7) // INTERNAL thresholds
    .sort((a, b) => b.composition_score - a.composition_score)
    .slice(0, 10);

  if (athletePhotos.length >= 5) {
    return {
      story_id: generateId(),
      story_type: 'player_highlight',
      title: `Player #${athleteId} Highlights`,
      description: 'Best moments',
      photos: athletePhotos,
      confidence_score: 0.9
    };
  }
  return null;
}
```

**Uses Internal Tags:** `sharpness`, `composition_score` (quality thresholds)

**User Experience:** Navigate to `/collections/player-highlights` (destination)

##### 5. Season Journey

**Detection Logic:**
```typescript
function detectSeasonJourney(photos: Photo[]): NarrativeArc | null {
  // One representative photo per game, chronological
  const gameGroups = groupBy(photos, 'event_id');

  const seasonPhotos = Object.values(gameGroups).map(gamePhotos =>
    gamePhotos.sort((a, b) => b.composition_score - a.composition_score)[0] // INTERNAL
  );

  if (seasonPhotos.length >= 8) {
    return {
      story_id: generateId(),
      story_type: 'season_journey',
      title: 'Season Journey',
      description: 'One moment from each game',
      photos: seasonPhotos.sort((a, b) => a.photo_date - b.photo_date),
      confidence_score: 0.8
    };
  }
  return null;
}
```

**Uses Internal Tags:** `composition_score` (selection criteria)

**User Experience:** Navigate to `/collections/season-journey` (destination)

##### 6. Emotion Spectrum

**Detection Logic:**
```typescript
function detectEmotionSpectrum(photos: Photo[], eventId: string): NarrativeArc | null {
  const eventPhotos = photos.filter(p => p.event_id === eventId);
  const emotionsInEvent = new Set(eventPhotos.map(p => p.emotion)); // INTERNAL

  if (emotionsInEvent.size >= 4) {
    return {
      story_id: generateId(),
      story_type: 'emotion_spectrum',
      title: 'Emotional Range',
      description: 'Full spectrum of emotions',
      photos: eventPhotos,
      confidence_score: 0.75
    };
  }
  return null;
}
```

**Uses Internal Tags:** `emotion`

**User Experience:** Navigate to `/collections/emotion-spectrum` (destination)

---

## Search Mode Experience (Concrete Filters Only)

### What Users Actually Search For

| User Query | Parsed Filters | Why Valid |
|------------|----------------|-----------|
| "blocks" | `play_type: block` | Concrete action |
| "golden hour serves" | `play_type: serve`, `time_of_day: golden_hour` | Both concrete |
| "dramatic backlit attacks" | `play_type: attack`, `lighting: backlit OR dramatic` | Aesthetic + Action |
| "rule of thirds digs" | `play_type: dig`, `composition: rule_of_thirds` | Both searchable |
| "peak intensity rallies" | `action_intensity: peak` | Concrete intensity |

**Notice:** NO "comeback story" searches. NO "emotion" searches. Only concrete, intuitive inputs.

### NLP Query Parser

```typescript
// src/lib/search/nlp-parser.ts
export function parseQuery(query: string): SearchFilters {
  const filters: SearchFilters = {};

  // Play type patterns (CONCRETE)
  if (/blocks?|blocking/i.test(query)) filters.play_type = 'block';
  if (/attacks?|spikes?|hits?/i.test(query)) filters.play_type = 'attack';
  if (/digs?|saves?|defensive/i.test(query)) filters.play_type = 'dig';
  if (/sets?|setter|setting/i.test(query)) filters.play_type = 'set';
  if (/serves?|serving/i.test(query)) filters.play_type = 'serve';

  // Intensity patterns (CONCRETE)
  if (/peak|intense|spectacular/i.test(query)) filters.action_intensity = 'peak';
  if (/high energy|critical/i.test(query)) filters.action_intensity = 'high';

  // Time of day patterns (CONCRETE)
  if (/golden hour/i.test(query)) filters.time_of_day = 'golden_hour';
  if (/blue hour/i.test(query)) filters.time_of_day = 'blue_hour';
  if (/evening|sunset/i.test(query)) filters.time_of_day = 'evening';

  // Lighting patterns (CONCRETE)
  if (/backlit|backlight/i.test(query)) filters.lighting = 'backlit';
  if (/dramatic/i.test(query)) filters.lighting = 'dramatic';

  // Composition patterns (CONCRETE)
  if (/rule of thirds/i.test(query)) filters.composition = 'rule_of_thirds';
  if (/leading lines/i.test(query)) filters.composition = 'leading_lines';

  // ❌ NO emotion parsing (not user-facing)
  // ❌ NO story_type parsing (not searchable)

  return filters;
}
```

### Search Query Examples

```sql
-- User searches: "golden hour blocks"
SELECT * FROM photo_metadata
WHERE play_type = 'block'
  AND time_of_day = 'golden_hour';

-- User searches: "peak intensity backlit attacks"
SELECT * FROM photo_metadata
WHERE play_type = 'attack'
  AND action_intensity = 'peak'
  AND lighting = 'backlit';

-- User searches: "rule of thirds serves"
SELECT * FROM photo_metadata
WHERE play_type = 'serve'
  AND composition = 'rule_of_thirds';
```

**Notice:** NO joins to `photo_stories` table. Stories are not searchable.

---

## Migration Strategy

### Phase 1: Add User-Facing Columns (Bucket 1)

```sql
ALTER TABLE photo_metadata
  ADD COLUMN play_type TEXT,
  ADD COLUMN action_intensity TEXT,
  ADD COLUMN composition TEXT,
  ADD COLUMN time_of_day TEXT,
  ADD COLUMN lighting TEXT;

CREATE INDEX idx_photo_play_type ON photo_metadata(play_type);
CREATE INDEX idx_photo_composition ON photo_metadata(composition);
CREATE INDEX idx_photo_time_of_day ON photo_metadata(time_of_day);
```

### Phase 2: Add Internal Columns (Bucket 2)

```sql
ALTER TABLE photo_metadata
  ADD COLUMN emotion TEXT, -- INTERNAL ONLY
  ADD COLUMN sharpness FLOAT, -- INTERNAL ONLY
  ADD COLUMN composition_score FLOAT, -- INTERNAL ONLY
  ADD COLUMN time_in_game TEXT; -- INTERNAL ONLY

-- NO indexes on internal fields (not user-searchable)
```

### Phase 3: Backfill Existing Photos

```typescript
// scripts/backfill-metadata.ts
async function backfillMetadata() {
  const photos = await db.select('*').from('photo_metadata');

  for (const photo of photos) {
    // Bucket 1: Concrete & Filterable
    const action = await detectAction(photo.image_url);
    const aesthetic = await detectAesthetic(photo.image_url);

    // Bucket 2: Abstract & Internal
    const emotion = await detectEmotion(photo.image_url);
    const quality = await assessQuality(photo.image_url);

    await db.update('photo_metadata')
      .set({
        // USER-FACING
        play_type: action.play_type,
        action_intensity: action.action_intensity,
        composition: aesthetic.composition,
        time_of_day: aesthetic.time_of_day,
        lighting: aesthetic.lighting,

        // INTERNAL
        emotion: emotion.primary,
        sharpness: quality.sharpness,
        composition_score: quality.composition_score
      })
      .where({ photo_id: photo.photo_id });
  }
}
```

### Phase 4: Create Stories Table & Generate Collections

```sql
CREATE TABLE photo_stories (
  story_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  photo_ids UUID[] NOT NULL,
  event_id UUID,
  detected_at TIMESTAMP DEFAULT now(),
  emotional_arc JSONB,
  confidence_score FLOAT
);
```

```typescript
// scripts/generate-stories.ts
async function generateStories() {
  const photos = await db.select('*').from('photo_metadata');

  // Run all 6 detection algorithms
  const stories = [
    ...detectGameWinningRallies(photos),
    ...detectComebackStories(photos),
    ...detectTechnicalExcellence(photos),
    ...detectPlayerHighlights(photos),
    ...detectSeasonJourneys(photos),
    ...detectEmotionSpectrum(photos)
  ];

  for (const story of stories) {
    await db.insert('photo_stories').values({
      story_type: story.story_type,
      title: story.title,
      description: story.description,
      photo_ids: story.photos.map(p => p.photo_id),
      event_id: story.photos[0].event_id,
      emotional_arc: story.emotional_arc,
      confidence_score: story.confidence_score
    });
  }
}
```

---

## Summary: The Corrected Model

### The Two Buckets

| Bucket | Purpose | User-Facing? | Example |
|--------|---------|--------------|---------|
| **Bucket 1: Concrete & Filterable** | Search mode filters | ✅ YES | `play_type: block`, `time_of_day: golden_hour` |
| **Bucket 2: Abstract & Internal** | AI story inputs | ❌ NO | `emotion: triumph`, `sharpness: 9.5` |

### User Benefits by Persona

| Persona | Old Pain Point | New Solution |
|---------|----------------|--------------|
| **Seeker (Maria)** | "Can't find blocks without scrolling forever" | Search: "blocks" → `play_type: block` (concrete) |
| **Curator (David)** | "Can't find comeback stories efficiently" | Navigate TO `/collections/comeback-stories` (destination) |
| **Explorer (Alex)** | "Everything looks the same" | Explore: AI-recommended feed + visual features |

### The Key Corrections

1. ✅ **Action** and **Aesthetic** are the ONLY searchable dimensions (user-facing)
2. ✅ **Story** is NOT a filter - it's a curated destination in Collections mode
3. ✅ **Emotion**, **quality scores**, and **temporal data** are internal-only (AI use)
4. ✅ Users get the BENEFIT of abstract data (curated collections) without the CONFUSION of abstract filters

---

**Status:** Ready for implementation
**Next Steps:** Backfill photos with two-bucket metadata, generate story collections, implement Search mode with concrete-only filters
