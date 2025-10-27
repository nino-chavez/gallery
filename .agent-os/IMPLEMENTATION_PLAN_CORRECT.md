# Implementation Plan: Lean MVP (Schema v2.0 + 4-Mode IA)

**Version:** 1.0 CORRECTED
**Date:** 2025-10-27
**Status:** APPROVED - Strategic Alignment

---

## Critical Note

**This plan supersedes:**
- ❌ `.agent-os/schema-v3-comprehensive-enrichment-plan.md` (OBSOLETE - rejected schema)
- ❌ `.agent-os/implementation-plan-enrichment-and-tagging.md` (OBSOLETE - feature creep)

**This plan implements:**
- ✅ Schema v2.0 (Two-Bucket model)
- ✅ Simple player tagging
- ✅ 4-mode IA with user-facing features
- ✅ Lean, strategic approach

---

## Table of Contents

1. [Strategic Foundation](#strategic-foundation)
2. [Schema v2.0 Implementation](#schema-v20-implementation)
3. [Simple Player Tagging](#simple-player-tagging)
4. [4-Mode IA Features](#4-mode-ia-features)
5. [7-Week Rollout](#7-week-rollout)

---

## Strategic Foundation

### The Problem We're Solving

**NOT:** Finding good photos among mediocre ones (library is curated)
**YES:** Discovering specific, meaningful moments within a high-quality collection

### The Solution: 4-Mode IA

1. **Browse** - Traditional navigation (albums, timeline)
2. **Search** - Concrete filters (action + aesthetic)
3. **Collections** - AI-curated story collections
4. **Explore** - Dynamic discovery feed

### The Data Strategy: Two-Bucket Model

**Bucket 1 (User-Facing):** Concrete, filterable, objective
- Powers Search mode
- High confidence (85-95%)
- Example: play_type, action_intensity, lighting, composition

**Bucket 2 (Internal):** Abstract, subjective, for AI curation only
- Powers Collections mode
- Medium confidence (65-80%)
- Example: emotion, emotional_impact, sharpness
- **NOT exposed as user filters**

### The UGC Strategy: Simple Player Tagging

**Keep It Simple:**
- One table: `user_tags`
- Basic fields: photo_id, athlete_name, tagged_by, approved
- Admin approval queue (no automation yet)
- No reputation, voting, or gamification
- **Human provides what AI can't:** Player names

---

## Schema v2.0 Implementation

### Phase 1.1: Database Migration

**Source:** Use migration from `SCHEMA_AUDIT_V2.md`

**New Columns (6 total):**

Bucket 1 (User-Facing - 2 columns):
- `lighting` TEXT - Lighting quality/type
- `color_temperature` TEXT - Warm/cool/neutral

Bucket 2 (Internal - 4 columns):
- `time_in_game` TEXT - When in game this occurred
- `athlete_id` TEXT - Manually tagged player (future)
- `event_id` UUID - Manually tagged event (future)
- `ai_confidence` FLOAT - AI's confidence score

**Removed Columns (5 total):**
- portfolio_worthy, print_ready, social_media_optimized
- quality_score, use_cases
- (These create futile filters)

**Updated Indexes:**
- Add: idx_photo_lighting, idx_photo_color_temperature
- Remove: idx_photo_metadata_portfolio, idx_photo_metadata_quality_score

### Phase 1.2: Enrichment Prompts

**File:** `src/lib/ai/enrichment-prompts-v2.ts`

**Two Focused Prompts:**

#### Bucket 1 Prompt (User-Facing)
```typescript
export const BUCKET1_PROMPT = `Extract concrete, filterable metadata:

1. play_type: "attack", "block", "dig", "set", "serve", "celebration"
2. action_intensity: "low", "medium", "high", "peak"
3. sport_type: "volleyball", "basketball", etc.
4. photo_category: "action", "celebration", "candid"
5. composition: "rule_of_thirds", "leading_lines", etc.
6. time_of_day: "golden_hour", "midday", "evening", etc.
7. lighting: "natural", "backlit", "dramatic", "soft", "artificial"
8. color_temperature: "warm", "cool", "neutral"

Return ONLY JSON.`;
```

#### Bucket 2 Prompt (Internal)
```typescript
export const BUCKET2_PROMPT = `Extract subjective metadata for AI story detection:

1. emotion: "triumph", "determination", "intensity", etc.
2. sharpness: 0-10
3. composition_score: 0-10
4. exposure_accuracy: 0-10
5. emotional_impact: 0-10
6. time_in_game: "first_5_min", "middle", "final_5_min", "unknown"
7. ai_confidence: 0-1

Return ONLY JSON.`;
```

**Combined Approach (Single API Call):**
- Use both prompts in one request (cost-effective)
- Parse JSON response with both buckets
- Cost: ~$0.01 per photo
- Total: ~$200 for 20,000 photos

### Phase 1.3: Backfill Script

**File:** `scripts/backfill-schema-v2.ts`

**Key Changes from v3 script:**
- Use BUCKET1_PROMPT + BUCKET2_PROMPT (not comprehensive v3 prompt)
- Extract only 6 new fields (not 17)
- No dominant_colors, player_count, venue_type, etc.
- Keep it lean and focused

**Configuration:**
```typescript
const NEW_FIELDS = [
  'lighting',
  'color_temperature',
  'time_in_game',
  'ai_confidence'
  // athlete_id, event_id stay NULL (manual entry only)
];
```

### Phase 1.4: Timeline & Cost

**Week 1-2: Foundation**
- Day 1: Run Schema v2.0 migration
- Day 2: Test enrichment on 10 photos
- Day 3: Launch full backfill (overnight)
- Day 4-5: Validate results
- Day 6-7: Buffer for issues

**Cost:**
- $200 for 20,000 photos
- ~21 hours processing time

**Deliverable:**
- 20,000 photos with Bucket 1 + Bucket 2 metadata
- Ready for Search + Collections features

---

## Simple Player Tagging

### Phase 2.1: Database Schema

**File:** `database/migrations/2025-10-28-simple-player-tagging.sql`

**One Table Only:**

```sql
CREATE TABLE user_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id TEXT NOT NULL REFERENCES photo_metadata(photo_id),

  -- Player identification
  athlete_name TEXT NOT NULL,
  jersey_number TEXT,

  -- User tracking
  tagged_by_user_id TEXT NOT NULL,
  tagged_by_user_name TEXT,

  -- Approval (simple)
  approved BOOLEAN DEFAULT FALSE,
  approved_by TEXT,
  approved_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_tags_photo ON user_tags(photo_id);
CREATE INDEX idx_user_tags_pending ON user_tags(approved) WHERE approved = FALSE;
CREATE INDEX idx_user_tags_athlete ON user_tags(athlete_name) WHERE approved = TRUE;
```

**That's It. No More Tables.**

No reputation tables, no voting tables, no verified contributors tables.

### Phase 2.2: API Endpoints

**File:** `src/routes/api/tags/+server.ts`

**Three Simple Endpoints:**

```typescript
// POST /api/tags - Create new tag (auth required)
{
  photo_id: string;
  athlete_name: string;
  jersey_number?: string;
}

// GET /api/tags?photo_id={id} - Get tags for photo
{
  tags: Array<{
    id: string;
    athlete_name: string;
    approved: boolean;
  }>
}

// Admin only:
// POST /api/admin/tags/{id}/approve - Approve tag
// POST /api/admin/tags/{id}/reject - Reject tag
```

**No voting, no reputation calculation, no auto-approve logic.**

### Phase 2.3: UI Components

**Component 1: Tag Input**
```svelte
<!-- TagInput.svelte -->
<input
  type="text"
  placeholder="Tag a player..."
  bind:value={athleteName}
/>
<button onclick={submitTag}>Add Tag</button>

{#if submitted}
  <p>Tag submitted for approval!</p>
{/if}
```

**Component 2: Tag Display**
```svelte
<!-- TagDisplay.svelte -->
{#each approvedTags as tag}
  <span class="badge">{tag.athlete_name}</span>
{/each}
```

**Component 3: Admin Queue**
```svelte
<!-- AdminTagQueue.svelte -->
{#each pendingTags as tag}
  <div>
    <img src={tag.photo.thumbnail} />
    <p>Tagged as: {tag.athlete_name}</p>
    <p>By: {tag.tagged_by_user_name}</p>
    <button onclick={() => approve(tag.id)}>✓ Approve</button>
    <button onclick={() => reject(tag.id)}>✗ Reject</button>
  </div>
{/each}
```

**No complex reputation UI, no leaderboards, no badges.**

### Phase 2.4: Timeline

**Week 3-4: Simple Tagging**
- Week 3: Backend (table, API endpoints)
- Week 4: Frontend (tag input, display, admin queue)

**Deliverable:**
- Users can tag players
- Admin can approve/reject
- Tags display on photos

---

## 4-Mode IA Features

### Mode 1: Browse (Week 5)

**Description:** Traditional navigation

**Features:**
- Album listing (already exists)
- Album detail view (already exists)
- Timeline view (already exists)
- **No new development needed** (refine existing)

**Timeline:** 1 week refinement

### Mode 2: Search (Week 5)

**Description:** Concrete filter-based search

**Features:**

**Action Filters (Bucket 1):**
- Play type: Attack, Block, Dig, Set, Serve
- Action intensity: Low, Medium, High, Peak
- Category: Action, Celebration, Candid

**Aesthetic Filters (Bucket 1):**
- Lighting: Natural, Backlit, Dramatic, Soft, Artificial
- Color temperature: Warm, Cool, Neutral
- Time of day: Golden hour, Midday, Evening
- Composition: Rule of thirds, Leading lines, etc.

**NLP Query (Basic):**
- "show me blocks at golden hour"
- Parse keywords → apply filters

**UI:**
```
┌─────────────────────────────────────┐
│ Search                              │
├─────────────────────────────────────┤
│ [Search: "blocks at golden hour" ] │
│                                     │
│ Filters:                            │
│ Play Type: [ ] Attack [x] Block     │
│ Lighting:  [x] Golden Hour          │
│ Time:      [x] Evening              │
│                                     │
│ [24 photos found]                   │
│ [Photo Grid]                        │
└─────────────────────────────────────┘
```

**Timeline:** 1 week

**Database Queries:**
```sql
-- Powered by Bucket 1 data
SELECT * FROM photo_metadata
WHERE play_type = 'block'
  AND time_of_day = 'golden_hour'
  AND lighting = 'natural'
ORDER BY photo_date DESC;
```

### Mode 3: Collections (Week 6-7)

**Description:** AI-curated story collections

**Features:**

**Story Collections (Using Bucket 2):**

1. **"Comeback Stories"**
   - Query: emotion = 'triumph' + time_in_game = 'final_5_min'
   - Narrative: "Critical moments of triumph in the final minutes"

2. **"Peak Intensity"**
   - Query: action_intensity = 'peak' + emotional_impact > 8
   - Narrative: "The most intense moments of gameplay"

3. **"Golden Hour Magic"**
   - Query: time_of_day = 'golden_hour' + composition_score > 7
   - Narrative: "Beautiful lighting meets perfect composition"

4. **"Focus & Determination"**
   - Query: emotion = 'determination' + sharpness > 8
   - Narrative: "Moments of pure concentration and resolve"

5. **"Victory Celebrations"**
   - Query: photo_category = 'celebration' + emotional_impact > 7
   - Narrative: "The joy of winning"

**AI Curation Engine:**
```typescript
// scripts/generate-collections.ts
const collections = [
  {
    id: 'comeback-stories',
    name: 'Comeback Stories',
    query: {
      emotion: 'triumph',
      time_in_game: 'final_5_min',
      emotional_impact: { gt: 7 }
    },
    narrative: 'Critical moments of triumph...'
  },
  // ... more collections
];

// Run weekly to refresh
async function generateCollections() {
  for (const collection of collections) {
    const photos = await supabase
      .from('photo_metadata')
      .select('*')
      .match(collection.query)
      .order('emotional_impact', { ascending: false })
      .limit(50);

    await supabase
      .from('collections')
      .upsert({
        id: collection.id,
        name: collection.name,
        narrative: collection.narrative,
        photo_ids: photos.map(p => p.photo_id),
        updated_at: new Date()
      });
  }
}
```

**UI:**
```
┌─────────────────────────────────────┐
│ Collections                         │
├─────────────────────────────────────┤
│ 🏆 Comeback Stories                 │
│    Critical moments of triumph...   │
│    [View 43 photos]                 │
│                                     │
│ ⚡ Peak Intensity                   │
│    The most intense moments...      │
│    [View 67 photos]                 │
│                                     │
│ 🌅 Golden Hour Magic                │
│    Beautiful lighting meets...      │
│    [View 89 photos]                 │
└─────────────────────────────────────┘
```

**Timeline:** 2 weeks
- Week 6: Curation engine + queries
- Week 7: Collections UI

### Mode 4: Explore (Post-MVP)

**Description:** Dynamic discovery feed

**Defer to Post-MVP:**
- More complex than core modes
- Requires recommendation algorithm
- Lower priority than Search + Collections

**Features (When Built):**
- Infinite scroll feed
- Personalized recommendations
- "Find Similar" (using existing composition + lighting)
- No 3D galaxy (over-engineered)

---

## 7-Week Rollout

### Week 1-2: Foundation (Schema v2.0 + Enrichment)

**Week 1: Migration & Testing**
- Day 1: Run Schema v2.0 migration (production)
- Day 2: Create enrichment-prompts-v2.ts
- Day 3: Update backfill-schema-v2.ts script
- Day 4: Test on 10 photos, validate JSON parsing
- Day 5: Fix any issues, prepare for full run

**Week 2: Full Backfill**
- Day 1: Launch full backfill (overnight)
- Day 2: Monitor progress (first 5,000 photos)
- Day 3: Monitor progress (next 10,000 photos)
- Day 4: Monitor completion (final 5,000 photos)
- Day 5: Validate results, check ai_confidence distribution

**Deliverable:** 20,000 photos enriched with Bucket 1 + Bucket 2

### Week 3-4: Simple Player Tagging

**Week 3: Backend**
- Day 1: Create user_tags table migration
- Day 2: Build API endpoints (create, get, approve, reject)
- Day 3: Add authentication checks
- Day 4: Unit tests for API
- Day 5: Deploy backend

**Week 4: Frontend**
- Day 1-2: Build TagInput component
- Day 3: Build TagDisplay component
- Day 4: Build AdminTagQueue component
- Day 5: Integration testing, deploy

**Deliverable:** Functional player tagging with admin approval

### Week 5: Browse + Search Modes

**Browse Mode (2 days):**
- Day 1: Refine album listing (already exists)
- Day 2: Polish timeline view (already exists)

**Search Mode (3 days):**
- Day 1: Build filter UI (checkboxes for Bucket 1 fields)
- Day 2: Wire filters to Supabase queries
- Day 3: Add NLP query parsing (basic keyword matching)

**Deliverable:** Functional search with concrete filters

### Week 6-7: Collections Mode

**Week 6: Curation Engine**
- Day 1-2: Define 5-8 collection queries (using Bucket 2)
- Day 3: Build generate-collections.ts script
- Day 4: Create collections table schema
- Day 5: Test collection generation on sample data

**Week 7: Collections UI**
- Day 1-2: Build collections listing page
- Day 3-4: Build collection detail page (with narrative)
- Day 5: Polish, deploy, launch

**Deliverable:** 5-8 AI-curated story collections

---

## Success Metrics

### Week 1-2: Foundation
- [ ] 95%+ enrichment success rate
- [ ] Average ai_confidence > 0.75
- [ ] All Bucket 1 fields populated (lighting, color_temperature, etc.)
- [ ] All Bucket 2 fields populated (emotion, time_in_game, etc.)
- [ ] Cost within budget ($200 ± $20)

### Week 3-4: Player Tagging
- [ ] 20+ tags submitted in first week
- [ ] 80%+ tag approval rate
- [ ] <48 hour average approval time
- [ ] 5+ unique contributors
- [ ] Admin moderation <1 hour/week

### Week 5: Search Mode
- [ ] 30+ unique searches in first week
- [ ] 75%+ searches return results
- [ ] Average 2+ filters used per search
- [ ] Positive user feedback (survey)

### Week 6-7: Collections Mode
- [ ] 5-8 collections generated
- [ ] Each collection has 20+ photos
- [ ] Collections refreshed automatically
- [ ] User engagement (pageviews to collections)
- [ ] Positive feedback on narratives

---

## What We're NOT Building

### ❌ Complex Reputation System
- No trust levels
- No badges or achievements
- No auto-approve logic
- No leaderboards
- **Why:** Adds complexity, no proven need yet

### ❌ Verified Contributors Program
- No invitation system
- No special permissions
- No verified badges
- **Why:** Need user base first

### ❌ Advanced Similarity Features
- No vector embeddings
- No "Find Similar" (for now)
- No color palette matching
- **Why:** Nice-to-have, not core

### ❌ Advanced Context Detection
- No player_count field
- No venue_type field
- No dominant_colors extraction
- No crowd_intensity detection
- No team_dynamics analysis
- **Why:** Low value, medium/low confidence

### ❌ Voting System
- No upvote/downvote on tags
- No community validation
- **Why:** Admin approval is sufficient

### ❌ 3D Galaxy Explore Mode
- No WebGL visualization
- No physics-based layout
- **Why:** Over-engineered, standard grid is fine

---

## Technology Stack

### Frontend
- SvelteKit 2.x
- Svelte 5 (Runes)
- Tailwind CSS 4
- lucide-svelte (icons)

### Backend
- Supabase PostgreSQL
- Supabase Auth (when needed)
- Supabase Storage (already configured)

### AI
- Gemini 2.0 Flash (vision)
- Two focused prompts (Bucket 1 + Bucket 2)
- ~$0.01 per photo

### Deployment
- Vercel (SvelteKit)
- Supabase (database + storage)

---

## File Structure

```
database/
├── migrations/
│   ├── 2025-10-27-schema-v2-two-bucket.sql       # From SCHEMA_AUDIT_V2.md
│   └── 2025-10-28-simple-player-tagging.sql      # user_tags table only

src/
├── lib/
│   ├── ai/
│   │   └── enrichment-prompts-v2.ts              # Bucket 1 + Bucket 2 prompts
│   ├── components/
│   │   ├── filters/
│   │   │   ├── ActionFilters.svelte              # Search mode
│   │   │   └── AestheticFilters.svelte           # Search mode
│   │   ├── tagging/
│   │   │   ├── TagInput.svelte
│   │   │   ├── TagDisplay.svelte
│   │   │   └── AdminTagQueue.svelte
│   │   └── collections/
│   │       ├── CollectionCard.svelte
│   │       └── CollectionDetail.svelte
│   └── supabase/
│       ├── client.ts
│       └── server.ts
├── routes/
│   ├── api/
│   │   ├── tags/+server.ts                       # Simple tagging API
│   │   └── admin/
│   │       └── tags/+server.ts                   # Approval endpoints
│   ├── search/+page.svelte                       # Search mode UI
│   ├── collections/+page.svelte                  # Collections listing
│   └── collections/[id]/+page.svelte             # Collection detail

scripts/
├── backfill-schema-v2.ts                         # Lean backfill (6 fields)
└── generate-collections.ts                       # AI curation engine
```

---

## Key Principles

### 1. Lean First
- Build only what's needed for MVP
- Defer complex features until proven need
- Simple > Complex

### 2. User Value First
- Prioritize user-facing features over infrastructure
- Every feature must serve a mode in the 4-mode IA
- No features "for future use"

### 3. Data Integrity
- Bucket 1 = User-facing (concrete, high confidence)
- Bucket 2 = Internal (subjective, AI curation only)
- Never expose Bucket 2 as user filters

### 4. Maintainability
- Simple schemas (6 new columns, not 17)
- Simple UGC (1 table, not 8)
- Code that's easy to understand and modify

### 5. Strategic Alignment
- Every decision maps to the 4-mode IA
- Every feature serves a user persona
- No feature creep

---

## Risk Mitigation

### Technical Risks

| Risk | Mitigation |
|------|-----------|
| Enrichment fails | Test on 10 photos first, rollback plan ready |
| Schema migration breaks site | Run on staging first, backup created |
| Search queries slow | Bucket 1 fields are indexed |
| Collections generation slow | Run as background job, cache results |

### Product Risks

| Risk | Mitigation |
|------|-----------|
| Low tagging participation | Start with athletes/family (high motivation) |
| Search filters too complex | Provide presets ("Golden Hour Blocks") |
| Collections feel arbitrary | Write clear narratives explaining AI logic |
| Admin approval burden | Start small, monitor time commitment |

---

## Deployment Checklist

### Pre-Deployment
- [ ] Schema v2.0 migration tested on staging
- [ ] Backup verified (can restore if needed)
- [ ] Enrichment prompts validated (10 photo test)
- [ ] API endpoints secured (auth checks)
- [ ] Admin dashboard accessible

### Week 1-2 (Foundation)
- [ ] Schema v2.0 migration run on production
- [ ] 20,000 photos enriched successfully
- [ ] Validation queries show expected distributions
- [ ] No performance degradation

### Week 3-4 (Tagging)
- [ ] user_tags table created
- [ ] API endpoints deployed
- [ ] Tagging UI live on photo pages
- [ ] Admin queue functional

### Week 5 (Search)
- [ ] Search page deployed
- [ ] All Bucket 1 filters working
- [ ] Search results accurate
- [ ] Performance <500ms per query

### Week 6-7 (Collections)
- [ ] Collections table created
- [ ] Curation engine runs successfully
- [ ] 5-8 collections generated
- [ ] Collections UI deployed

---

## Post-MVP Roadmap

### After 7 Weeks (Evaluate)

**If Search Mode is successful:**
- Add saved searches
- Add search presets
- Add NLP query improvements

**If Tagging is successful:**
- Add simple reputation (just approval rate %)
- Consider auto-approve for high-accuracy users
- Add athlete profiles (basic)

**If Collections are successful:**
- Generate more collections
- Allow users to suggest collection ideas
- Add collection narratives (longer stories)

**If all successful:**
- Build Explore mode (dynamic feed)
- Add "Find Similar" (using existing data)
- Consider advanced features

**If adoption is low:**
- Double down on what works
- Cut what doesn't
- Iterate on core value prop

---

## Conclusion

This plan is **lean, strategic, and aligned** with our 4-mode IA vision.

**What we build:**
- Schema v2.0 (6 new fields)
- Simple player tagging (1 table)
- 4 modes (Browse, Search, Collections, Explore)

**What we don't build:**
- 17-column comprehensive enrichment
- Complex reputation system
- Verified contributors program
- Advanced AI features with low ROI

**Timeline:** 7 weeks
**Cost:** $200 (AI enrichment only)
**Focus:** User value, not infrastructure

**Next Step:** Run Schema v2.0 migration and start enrichment.

---

**Document Status:** APPROVED - Strategic Alignment
**Supersedes:** All previous v3.0 and complex UGC plans
**Last Updated:** 2025-10-27
