# Information Architecture v2.0

**Last Updated:** 2025-10-27
**Status:** Active (Post-Pivot)
**Version:** 2.0.0

---

## Overview

The site is organized into **4 distinct modes**, each serving a specific persona and use case. This IA solves the navigation ambiguity from the old vision by providing clear, persona-driven pathways.

### The 4 Modes

| Mode | Persona | Purpose | Route |
|------|---------|---------|-------|
| **Browse** | Traditionalist | Simple album-first view | `/albums` |
| **Explore** | Explorer (Alex) | AI-driven dynamic feed | `/explore` |
| **Search** | Seeker (Maria) | NLP action queries | `/search` |
| **Collections** | Curator (David) | AI stories + favorites | `/collections` |

---

## Mode 1: Browse (The Traditionalist)

### Purpose
Provide a simple, predictable, album-first hierarchical view. This is the "SmugMug" experience for visitors who want traditional navigation without complexity.

### Target Persona: The Traditionalist
- **Who:** Visitors who prefer simplicity over innovation
- **Behavior:** Linear browsing, album-based organization
- **Need:** Predictable navigation, no learning curve

### User Journey
```
Homepage → Browse → Album List → Select Album → Photo Grid → Lightbox
```

### Routes

#### `/albums` (Album Listing)
**Purpose:** Show all albums with thumbnails and metadata

**Layout:**
```
[Header: Global Nav]

[Page Title: "Albums"]

[Grid: 3 columns desktop, 2 mobile]
  [AlbumCard]
    - Thumbnail (album cover photo)
    - Title (e.g., "Tournament Name - Date")
    - Photo count (e.g., "125 photos")
    - Date (e.g., "October 2025")
  [AlbumCard]
  [AlbumCard]
  ...
```

**Data Requirements:**
- `album_id`, `album_name`, `cover_photo_url`, `photo_count`, `created_date`

**Interaction:**
- Click album → Navigate to `/albums/[albumKey]`
- Hover → Subtle lift animation (MOTION.spring.gentle)

#### `/albums/[albumKey]` (Album Detail)
**Purpose:** Show all photos in a single album

**Layout:**
```
[Header: Global Nav]

[Breadcrumb: Albums > Album Name]

[Album Header]
  - Title
  - Date
  - Photo count
  - Description (optional)

[Photo Grid: Responsive columns]
  [PhotoCard] [PhotoCard] [PhotoCard]
  [PhotoCard] [PhotoCard] [PhotoCard]
  ...

[Pagination or Infinite Scroll]
```

**Data Requirements:**
- Query: `SELECT * FROM photo_metadata WHERE album_key = $1 ORDER BY photo_date ASC`

**Interaction:**
- Click photo → Open lightbox
- Arrow keys → Navigate prev/next in lightbox
- Escape → Close lightbox

### Features
- ✅ Album listing with thumbnails
- ✅ Basic chronological photo grids
- ✅ Simple lightbox viewer
- ✅ No complex filters or AI features (intentionally simplified)

### Implementation Notes
- **Simplicity is the feature:** No emotion halos, no quality indicators, no morphing grids
- **Performance:** Use virtual scrolling for albums with >100 photos
- **Accessibility:** Keyboard navigation, ARIA landmarks, semantic HTML

---

## Mode 2: Explore (The Explorer)

### Purpose
AI-driven dynamic discovery with innovative visual features. This is the "Instagram feed" experience with spatial clustering, emotion halos, and play type morphing.

### Target Persona: The Explorer (Alex)
- **Who:** Creative professionals seeking visual inspiration
- **Behavior:** Non-linear browsing, serendipitous discovery
- **Need:** Unexpected moments, visual intrigue, innovative interactions

### User Journey
```
Homepage → Explore → [Choose Entry Point]:
  → 3D Emotion Galaxy (spatial discovery)
  → Dynamic Feed (AI-recommended scroll)
  → Play Type Morphing Grid (filter + animate)
```

### Routes

#### `/explore` (Main Explore Page)
**Purpose:** AI-driven photo feed with multiple discovery modes

**Layout:**
```
[Header: Global Nav]

[Explore Header]
  - Tagline: "Discover unexpected moments"
  - Mode Toggle: [Feed View] [Galaxy View] [Grid View]

[Dynamic Feed or Grid]
  - AI-recommended photos based on viewing history
  - Visual treatments: Emotion Halos, Play Type badges
  - Infinite scroll with progressive loading

[Floating Controls]
  - Play Type Filter Pills (attack, block, dig, set, serve)
  - Emotion Filter (optional, not primary)
```

**Data Requirements:**
- Query: AI-recommended photos based on similarity scoring
- Metadata: `play_type`, `emotion`, `composition`, `action_intensity`

**Interaction:**
- **Play Type Filter:** Click pill → Morphing Grid animation (Deliverable 18)
- **Emotion Halo:** Visible on hover (colored glow per emotion)
- **Click photo:** Open detail view with metadata overlay

#### `/explore/galaxy` (3D Emotion Galaxy)
**Purpose:** Spatial photo clustering for serendipitous discovery

**Layout:**
```
[Fullscreen 3D Canvas]
  - Three.js rendering 500 curated photos
  - Spatial clusters based on emotion + play type + composition
  - Orbit controls (mouse drag, scroll zoom)

[Minimap: Bottom right]
  - Shows camera position
  - Click to jump to cluster

[Controls: Top right]
  - Reset Camera
  - Cluster Labels toggle
  - Auto-rotate toggle
```

**Data Requirements:**
- Curated subset: 500 photos with high `portfolio_worthy` scores
- Similarity scoring: emotion (30%), play_type (25%), composition (15%), quality (15%)

**Interaction:**
- **Hover photo:** Scale 1.2x + glow effect
- **Click photo:** Zoom in + show detail panel
- **Drag:** Orbit camera
- **Scroll:** Zoom in/out

**Reference:** Deliverable 19 from old roadmap (repurposed for Explore mode)

### Features
- ✅ **3D Emotion Galaxy** (Deliverable 19) - Spatial clustering
- ✅ **Emotion Halos** (P1-2) - Colored glow per emotion
- ✅ **Play Type Morphing Grid** (Deliverable 18) - Animated filter changes
- ✅ AI-recommended photos based on viewing patterns
- ✅ Serendipitous discovery through similarity

### Implementation Notes
- **Performance Budget:** 60fps required, 500 photo limit in Galaxy
- **Fallback:** WebGL not supported → Show 2D grid with message
- **Accessibility:** Keyboard controls for Galaxy (WASD, arrows, tab)

---

## Mode 3: Search (The Seeker)

### Purpose
Advanced NLP search for action-based queries. This is the primary tool for Seekers (Maria) to find specific moments using natural language.

### Target Persona: The Seeker (Maria)
- **Who:** Athlete/parent finding specific photos efficiently
- **Behavior:** Mission-driven, keyword search, specific criteria
- **Need:** Natural language queries, instant results, action-based filters

### User Journey
```
Homepage → Search → Type Query → View Results → Filter/Refine → Download
```

### Routes

#### `/search` (Search Page)
**Purpose:** NLP search with action-based filtering

**Layout:**
```
[Header: Global Nav]

[Search Hero]
  - Large search input: "Find photos..."
  - Placeholder examples: "triumphant celebration blocks"
  - Voice input icon (optional)

[Search Results]
  [Applied Filters]
    - play_type: block
    - emotion: triumph
    - action_intensity: peak
    [Clear All]

  [Results Grid: 3-4 columns]
    [PhotoCard with metadata badges]
    [PhotoCard]
    ...

  [Result Count: "Found 47 photos"]

[Sidebar Filters: Collapsible]
  [Play Type]
    ☐ Attack (125)
    ☐ Block (89)
    ☐ Dig (234)
    ☐ Set (178)
    ☐ Serve (92)

  [Action Intensity]
    ☐ Low (450)
    ☐ Medium (890)
    ☐ High (567)
    ☐ Peak (234)

  [Composition]
    ☐ Rule of Thirds
    ☐ Leading Lines
    ☐ Framing

  [Time of Day]
    ☐ Golden Hour
    ☐ Midday
    ☐ Evening
```

**Data Requirements:**
- NLP query parser: Extract `play_type`, `emotion`, `action_intensity` from natural language
- Query: `SELECT * FROM photo_metadata WHERE play_type = $1 AND emotion = $2 AND action_intensity = $3`
- Real-time counts: Update filter counts as user refines

**Interaction:**
- **Type query:** Instant search suggestions dropdown
- **Select filter:** Update results with smooth grid transition
- **Click photo:** Open detail view with download options

### NLP Query Examples

| User Query | Parsed Filters |
|------------|----------------|
| "triumphant celebration blocks" | `play_type: block`, `emotion: triumph` |
| "intense attack shots" | `play_type: attack`, `action_intensity: peak OR high` |
| "diving digs with great composition" | `play_type: dig`, `composition: rule_of_thirds OR leading_lines` |
| "golden hour serves" | `play_type: serve`, `time_of_day: golden_hour` |
| "peak intensity rallies" | `action_intensity: peak`, `play_type: attack OR block` |

### Features
- ✅ **Natural Language Search** (Deliverable 7) - Parse action queries
- ✅ Action-based filtering (play_type primary dimension)
- ✅ Aesthetic filtering (composition, time_of_day, lighting)
- ✅ Real-time results with photo counts
- ✅ Saved searches (localStorage)

### Implementation Notes
- **Query Parser:** Use pattern matching for common queries (emotion + play_type combos)
- **Fallback:** If NLP fails, show faceted filter UI
- **Performance:** <500ms search response time
- **Accessibility:** Search input must have clear label, keyboard navigation for filters

---

## Mode 4: Collections (The Curator)

### Purpose
AI-generated thematic collections + user favorites. This is the answer to the "???" in your original question. It's the home for Curators (David) and their saved photos.

### Target Persona: The Curator (David)
- **Who:** Coach/brand manager building visual assets
- **Behavior:** Thematic gathering, bulk operations, export workflows
- **Need:** Pre-built collections, favorites management, PDF/ZIP export

### User Journey
```
Homepage → Collections → [Choose Type]:
  → AI Thematic Collections (pre-curated)
  → My Favorites (user saved)
  → Create New Collection
```

### Routes

#### `/collections` (Collections Index)
**Purpose:** Show all AI-generated thematic collections + user favorites

**Layout:**
```
[Header: Global Nav]

[Collections Header]
  - Tagline: "Curated stories and saved favorites"
  - [+ Create Collection] button

[Section: AI Thematic Collections]
  [CollectionCard: Comeback Stories]
    - Preview grid (4 photos)
    - Title + description
    - Photo count: 47 photos
    - Emotion distribution bar chart
    [View Collection]

  [CollectionCard: Technical Excellence]
  [CollectionCard: Game-Winning Rallies]
  [CollectionCard: Player Highlight Reels]
  ...

[Section: My Favorites]
  [CollectionCard: Saved Photos]
    - Preview grid
    - Photo count: 12 photos
    [View Favorites]
```

**Data Requirements:**
- AI collections generated by Story Curation Engine (Deliverable 9)
- User favorites stored in localStorage or user profile (if auth implemented)

#### `/collections/[collectionId]` (Collection Detail)
**Purpose:** Show all photos in a collection with bulk actions

**Layout:**
```
[Header: Global Nav]

[Collection Header]
  - Title (e.g., "Comeback Stories")
  - Description (e.g., "Photos showing emotional arc: determination → triumph")
  - Photo count
  - [Export PDF] [Export ZIP] buttons

[Emotional Curve Graph] (for Story collections)
  - SVG line chart showing emotion intensity over time
  - Color-coded segments

[Photo Grid: 3-4 columns]
  [PhotoCard with selection checkbox]
  [PhotoCard]
  ...

[Bulk Actions Bar] (appears when photos selected)
  - [Download Selected] [Add to Favorites] [Remove]
```

**Data Requirements:**
- Story detection: Run AI algorithms (Deliverable 9)
- Collection metadata: `collection_id`, `title`, `description`, `story_type`, `photo_ids[]`

### AI Thematic Collections

#### 1. Comeback Stories
**Detection Logic:**
- Emotional pattern: `determination` → `intensity` → `triumph`
- Minimum 4 photos
- From single game/event

**Use Case:** Recruiting materials, highlight reels, motivational content

#### 2. Technical Excellence
**Detection Logic:**
- `sharpness >= 9` AND `composition >= 9`
- Minimum 8 photos

**Use Case:** Portfolio showcases, print-ready shots

#### 3. Game-Winning Rallies
**Detection Logic:**
- Final 5 minutes of game
- `action_intensity: peak` OR `high`
- `emotion: triumph` OR `intensity`
- Minimum 3 photos

**Use Case:** Season highlight reels, social media posts

#### 4. Player Highlight Reels
**Detection Logic:**
- Top 10 portfolio shots per athlete
- Sorted by quality score (internal use only)

**Use Case:** Recruiting packages, athlete portfolios

#### 5. Season Journey
**Detection Logic:**
- One representative photo per game/event
- Chronological sequence

**Use Case:** End-of-season recap, yearbook materials

#### 6. Emotion Spectrum
**Detection Logic:**
- 4+ different emotions in single game/event

**Use Case:** Storytelling, showcasing range

### Features
- ✅ AI-generated thematic collections (6 types)
- ✅ User favorites management
- ✅ Bulk selection and export (PDF, ZIP)
- ✅ Emotional curve visualization (for story collections)
- ✅ One-click access from homepage

### Implementation Notes
- **Generation Strategy:** Lazy load (generate on first visit, cache for 24 hours)
- **Performance:** Show loading state during AI detection (3-5s)
- **Export:** Use jsPDF for PDF generation, JSZip for bulk downloads
- **Accessibility:** Keyboard selection (Shift+click range), ARIA for checkboxes

---

## Global Navigation

### Header Structure
```
[Logo: Nino Chavez Gallery]

[Nav: Primary]
  - Browse
  - Explore
  - Search
  - Collections

[Nav: Secondary]
  - About (optional)
  - Contact (optional)

[User Menu]
  - Favorites (count badge)
  - Settings (optional)
```

### Homepage (`/`)
**Purpose:** Introduce the 4 modes and provide entry points

**Layout:**
```
[Hero Section]
  - Headline: "20,000 moments. Four ways to discover."
  - Subheadline: "Choose your journey"

[4-Mode Grid: 2x2]
  [Mode Card: Browse]
    - Icon
    - Title: "Browse Albums"
    - Description: "Traditional album view"
    [Enter Browse]

  [Mode Card: Explore]
    - Icon
    - Title: "Explore Moments"
    - Description: "AI-driven discovery"
    [Enter Explore]

  [Mode Card: Search]
    - Icon
    - Title: "Search Actions"
    - Description: "Find specific plays"
    [Enter Search]

  [Mode Card: Collections]
    - Icon
    - Title: "View Collections"
    - Description: "Stories & favorites"
    [Enter Collections]
```

---

## Route Map (Full Site)

```
/ (Homepage - 4-mode entry)
├── /albums (Album listing)
│   └── /albums/[albumKey] (Album detail)
│       └── Lightbox modal (photo viewer)
├── /explore (AI feed + filters)
│   └── /explore/galaxy (3D Emotion Galaxy)
├── /search (NLP search + filters)
│   └── Query params: ?q=blocks&play_type=block
└── /collections (Collections index)
    ├── /collections/comeback-stories (AI collection)
    ├── /collections/technical-excellence (AI collection)
    ├── /collections/game-winning-rallies (AI collection)
    ├── /collections/player-highlights (AI collection)
    ├── /collections/season-journey (AI collection)
    ├── /collections/emotion-spectrum (AI collection)
    └── /collections/favorites (User favorites)
```

---

## Implementation Priority

### Phase 1: Core 4 Modes
1. **Browse** (`/albums`, `/albums/[albumKey]`) - Highest priority (traditionalist baseline)
2. **Search** (`/search`) - High priority (seeker utility)
3. **Collections** (`/collections`) - High priority (curator efficiency)
4. **Explore** (`/explore`) - Lower priority (advanced feature)

### Phase 2: AI Features
1. Story Curation Engine (Deliverable 9) - Powers Collections
2. NLP Search Parser (Deliverable 7) - Powers Search
3. Recommendation Algorithm - Powers Explore feed

### Phase 3: Innovative Visual Features
1. Play Type Morphing Grid (Deliverable 18) - Explore + Search
2. 3D Emotion Galaxy (Deliverable 19) - Explore mode
3. Emotion Halos (P1-2) - Explore mode only

---

## Design Constraints

### Content-First Principles (Apply to All Modes)
- ✅ Photos must occupy ≥60% of viewport height
- ✅ Chrome (headers, filters) must be ≤40% of viewport
- ✅ Use inline pill filters (not block containers)
- ✅ Progressive disclosure (controls start collapsed)

**Reference:** See `.agent-os/DESIGN_SYSTEM.md` for full principles

### Performance Targets (Apply to All Modes)
- ✅ Page load: <2 seconds
- ✅ Animations: 60fps locked
- ✅ Virtual scrolling: Support 10,000+ photos
- ✅ Search: <500ms response time

---

## Conclusion

**The 4-Mode IA solves:**
1. Navigation ambiguity (clear pathways per persona)
2. Feature overload (innovative features isolated to Explore)
3. Metadata utility (action-based search, not abstract emotions)

**The Result:**
- Traditionalists get simplicity (Browse)
- Explorers get innovation (Explore)
- Seekers get specificity (Search)
- Curators get efficiency (Collections)

---

**Status:** Ready for implementation
**Next Steps:** Define metadata schema and Story Curation algorithms
