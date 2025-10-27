# Product Mission v2.0

**Last Updated:** 2025-10-27
**Status:** Active (Post-Pivot)
**Version:** 2.0.0

---

## The Pivot

### What Changed

**Old Premise (INVALID):**
- Problem: "Static Library Syndrome" - finding good photos among mediocre ones
- Solution: Quality stratification, portfolio prioritization, quality glow effects
- Metadata Model: Abstract tags (emotion, quality_score) as primary dimensions

**New Premise (VALID):**
- Problem: "Library vs. Experience" - lack of discovery tools for an exclusively worthy collection
- Solution: Story-first utility with concrete action-based metadata
- Metadata Model: Concrete utility (Story, Action, Aesthetic)

### The Core Insight

> "If I'm always forced to filter by a second dimension, then is the first dimension useful?"

**The answer is no.** Emotion tags are useless without a second filter. Quality scores are subjective and don't drive utility. We were designing for futility.

---

## The New Problem

### From "Good vs. Mediocre" to "Discovery vs. Overload"

**Core Truth:** The library contains **20,000 exclusively worthy photos**. There are no "mediocre shots" to filter out. The problem is not quality—it's **specificity**.

### Updated Personas & Pain Points

**1. The Traditionalist (New)**
- **Who:** Visitors who want simple, predictable navigation
- **Pain Point:** Modern galleries are too complex; they just want albums and photos
- **Need:** Traditional album-first, hierarchical view (SmugMug-like)
- **Solution:** **Browse mode**

**2. The Explorer (Alex) - REVISED**
- **Who:** Creative professionals seeking visual inspiration
- **Pain Point (OLD):** ❌ "Generic galleries lack engagement"
- **Pain Point (NEW):** ✅ "I can't discover different types of photos—everything looks the same"
- **Need:** Dynamic, AI-driven discovery of unexpected moments
- **Solution:** **Explore mode** (AI feed with innovative features)

**3. The Seeker (Maria) - REVISED**
- **Who:** Athlete/parent finding specific photos
- **Pain Point (OLD):** ❌ "Wastes time browsing mediocre shots"
- **Pain Point (NEW):** ✅ "I can't find specific actions (blocks, attacks) without scrolling forever"
- **Need:** Natural language search for concrete play types
- **Solution:** **Search mode** (NLP action queries)

**4. The Curator (David) - REVISED**
- **Who:** Coach/brand manager building visual assets
- **Pain Point (OLD):** ❌ "Manual curation takes hours without quality indicators"
- **Pain Point (NEW):** ✅ "I can't find thematic collections (Comeback Stories, Technical Excellence) efficiently"
- **Need:** Pre-built story collections and favorites management
- **Solution:** **Collections mode**

---

## The New Solution

### Information Architecture v2.0

The site is organized into **4 distinct modes**, each serving a specific persona and use case:

#### 1. Browse (The Traditionalist)
- **Purpose:** Simple, predictable, album-first navigation
- **Experience:** Traditional hierarchical view (SmugMug-like)
- **Routes:** `/albums`, `/albums/[albumKey]`
- **Features:**
  - Album listing with thumbnails
  - Basic chronological photo grids
  - Simple lightbox viewer
  - No complex filters or AI features

#### 2. Explore (The Explorer)
- **Purpose:** AI-driven dynamic discovery
- **Experience:** Instagram-like feed with innovative visual features
- **Route:** `/explore`
- **Features:**
  - **3D Emotion Galaxy** (Deliverable 19) - Spatial photo clustering
  - **Emotion Halos** (P1-2) - Visual emotion indicators
  - **Play Type Morphing Grid** (Deliverable 18) - Dynamic grid transitions
  - AI-recommended photos based on viewing patterns
  - Serendipitous discovery through similarity

#### 3. Search (The Seeker)
- **Purpose:** Advanced NLP search for action-based queries
- **Experience:** Natural language input with instant results
- **Route:** `/search`
- **Features:**
  - **Natural Language Search** (Deliverable 7) - "triumphant celebration blocks"
  - Action-based filtering (play_type: attack, block, dig, set, serve)
  - Aesthetic filtering (composition, time_of_day, lighting)
  - Real-time results with photo counts
  - Saved searches

#### 4. Collections (The Curator)
- **Purpose:** Thematic AI collections + user favorites
- **Experience:** Pre-curated galleries and personal saves
- **Route:** `/collections`, `/collections/[collectionId]`
- **Features:**
  - **AI-Generated Thematic Collections:**
    - "Comeback Stories" (emotional arc detection)
    - "Technical Excellence" (composition + sharpness)
    - "Game-Winning Rallies" (final moments + intensity)
    - "Player Highlight Reels" (best shots per athlete)
  - **User Favorites** (personal saved photos)
  - Bulk selection and export (PDF, ZIP)

---

## The New Metadata Model

### From Abstract to Concrete

**What We Stop Asking:**
- ❌ "What is this photo's emotion?" (Too abstract, not useful alone)
- ❌ "What is this photo's quality_score?" (Subjective, non-actionable)

**What We Start Asking:**
- ✅ "What **Story** does this photo belong to?" (Narrative context)
- ✅ "What **Action** is in this photo?" (Concrete play type)
- ✅ "What **Aesthetic** does this photo have?" (Concrete composition)

### New Metadata Dimensions

#### 1. Story (Narrative Context)
**Purpose:** Discover photos through narrative arcs, not isolated tags

**Examples:**
- `story_type: "Game-Winning Rally"`
- `story_type: "Comeback Story"`
- `story_type: "Player Highlight Reel"`
- `story_type: "Season Journey"`
- `story_type: "Technical Excellence"`
- `story_type: "Emotion Spectrum"`

**Implementation:** AI Story Curation Engine (Deliverable 9) detects these patterns automatically

#### 2. Action (Concrete Play Type)
**Purpose:** Search for specific moments, not abstract feelings

**Examples:**
- `play_type: "block"` (Searchable: "show me blocks")
- `play_type: "attack"` (Searchable: "find attacks")
- `play_type: "dig"` (Searchable: "diving digs")
- `play_type: "set"` (Searchable: "setter hands")
- `play_type: "serve"` (Searchable: "jump serves")
- `action_intensity: "peak"` (Searchable: "most intense moments")

**UI Treatment:** Play Type Morphing Grid (Deliverable 18) animates filter changes

#### 3. Aesthetic (Concrete Composition)
**Purpose:** Filter by visual characteristics, not subjective "quality"

**Examples:**
- `composition: "rule_of_thirds"`
- `composition: "leading_lines"`
- `composition: "framing"`
- `composition: "symmetry"`
- `time_of_day: "golden_hour"`
- `lighting: "backlit"` or `"dramatic"`

**Use Case:** Curators finding specific visual styles for branding

---

## What We Keep from the Old Vision

### Design Principles (Aesthetic Foundation)
- ✅ "Digital Gallery" aesthetic (60% content, 40% chrome)
- ✅ Inter Variable font, charcoal/warm gray palette
- ✅ Motion tokens (spring physics, 60fps animations)
- ✅ Content-first hierarchy
- ✅ Inline utility pattern (collapsed pills, not block containers)

**Reference:** See `.agent-os/DESIGN_SYSTEM.md` and `.agent-os/design-principles.md`

### Technical Architecture
- ✅ SvelteKit 2.x + Svelte 5 (Runes)
- ✅ Tailwind CSS 4
- ✅ Supabase PostgreSQL
- ✅ Virtual scrolling (@tanstack/svelte-query)
- ✅ Performance targets (60fps, <2s page load)

### Innovative Features (Repurposed)
- ✅ **3D Emotion Galaxy** (Deliverable 19) - Moves to **Explore mode**
- ✅ **AI Story Curation Engine** (Deliverable 9) - Powers **Collections mode**
- ✅ **Natural Language Search** (Deliverable 7) - Core of **Search mode**
- ✅ **Play Type Morphing Grid** (Deliverable 18) - Visual treatment for action filters

---

## What We Remove from the Old Vision

### Obsolete Features
- ❌ **Quality-Stratified Grid** (Deliverable 8) - Assumes quality varies significantly
- ❌ **Quality Glow** - Visual indicator for portfolio_worthy photos (all photos are worthy)
- ❌ **Emotion Timeline Scrubber** (Deliverable 16) - Emotion arcs not primary narrative
- ❌ **Magnetic Filter Orbs** (Deliverable 12) - Emotion as primary filter is invalid
- ❌ **Emotion Ambience** (Deliverable 15) - Adaptive theming based on emotion
- ❌ **Contextual Cursor** (Deliverable 13) - Showing emotion metadata on hover

### Obsolete Metadata
- ❌ `emotion` as a standalone filter dimension
- ❌ `quality_score` as a UI driver
- ❌ `portfolio_worthy` as a prioritization flag

**Note:** These metadata fields may still exist in the database for the AI Story Curation Engine's internal logic, but they are **not exposed as primary user-facing filters**.

---

## Success Metrics v2.0

### Engagement Metrics
- **Browse mode:** Average session duration >3 minutes (traditionalist satisfaction)
- **Explore mode:** Feature engagement >25% (Galaxy, Halos, Morphing Grid usage)
- **Search mode:** Query success rate >80% (NLP understanding accuracy)
- **Collections mode:** Favorite/export rate >15% (utility validation)

### Utility Metrics
- **Seekers:** Time to find specific action <90 seconds (vs. 10+ minutes scrolling)
- **Curators:** Collection creation time <5 minutes (vs. 30+ minutes manual curation)
- **Explorers:** Photos viewed per session >50 (discovery behavior)

### Technical Metrics
- Lighthouse Performance: 90+ maintained
- P95 page load: <2.5 seconds
- Animation frame rate: 60fps on 75th percentile devices
- Search response time: <500ms for NLP queries

---

## Implementation Priority

### Phase 1: Core IA (4 Modes)
1. **Browse** - Traditional album view (high priority for traditionalists)
2. **Search** - NLP action queries (high priority for seekers)
3. **Collections** - Story collections + favorites (high priority for curators)
4. **Explore** - AI feed with innovative features (lower priority, advanced users)

### Phase 2: AI Story Engine
- Implement 6 narrative detection algorithms (Deliverable 9)
- Power Collections mode with pre-built thematic galleries

### Phase 3: Innovative Visual Features
- 3D Emotion Galaxy (Deliverable 19) in Explore mode
- Play Type Morphing Grid (Deliverable 18) in Search/Explore
- Emotion Halos (P1-2) in Explore mode only

### Phase 4: Polish & Optimization
- Performance tuning (60fps, <2s load)
- Mobile optimization
- Accessibility compliance (WCAG AA minimum)

---

## Conclusion

**Old Vision:** Emotion-first discovery with quality stratification
**New Vision:** Story-first utility with action-based search

**The Fundamental Shift:**
- From "abstract tags" to "concrete utility"
- From "good vs. mediocre" to "specific vs. generic"
- From "one discovery path" to "four distinct modes"

**The Result:**
- Traditionalists get simplicity (Browse)
- Explorers get innovation (Explore with Galaxy/Halos/Morphing)
- Seekers get specificity (Search with NLP actions)
- Curators get efficiency (Collections with AI stories)

---

**Status:** Ready for implementation
**Next Steps:** Define detailed IA structure and metadata schema
