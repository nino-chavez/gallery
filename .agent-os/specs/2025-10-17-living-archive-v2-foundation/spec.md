# Specification: The Living Archive v2 Foundation

**Project:** Complete Frontend Reimplementation with Design System
**Timeline:** 10-12 weeks across 4 phases
**Status:** Ready for Implementation

---

## 1. Overview

### Project Summary

The Living Archive v2 is a frontend-only reimplementation of an AI-enriched sports photography gallery platform. The v1 backend (Supabase, SmugMug, AI enrichment) is production-ready and preserved intact. This spec covers the complete redesign and implementation of the frontend to transform a collection of 20,000+ sports photos into an award-winning exploration experience.

**Core Mission:** Transform a static photo library into a Living Archive—a dynamic, intelligent platform that showcases both photographic artistry and digital design mastery through AI-powered discovery, physics-based interactions, and cinematic user experiences.

### Key Context

**What's Preserved from v1:**
- Supabase database with 4 production migrations
- 20,000+ AI-enriched photos with 12 semantic dimensions
- SmugMug API integration (OAuth, photo fetching)
- AI vision enrichment scripts (Gemini/Claude/OpenAI)
- Metadata sync utilities and SQLite staging databases

**What's Being Reimplemented:**
- Complete frontend UI/UX following Design Brief principles
- Design system (motion tokens, emotion palette, typography)
- Component architecture with modern React patterns
- User journeys for three distinct personas
- Motion and interaction systems

### Success Criteria

This implementation will be successful when:

1. **All 4 phases complete** with quality gates passed
2. **Design Brief principles followed** throughout (no emojis, design tokens only, WCAG AAA)
3. **Performance targets met** (60fps animations, <2s page loads, Lighthouse 90+)
4. **Three user personas** have complete, tested journeys
5. **22 deliverables implemented** from phased roadmap
6. **Award-winning aesthetic** matching Linear/Apple quality bar

---

## 2. User Personas & Journeys

### Alex, The Explorer (28-45 years old)

**Profile:**
- Creative professional, designer, or photographer seeking inspiration
- Arrives via portfolio link, social media, or search
- Values visual richness, innovative design, memorable experiences

**Pain Points:**
- Generic photo galleries lack engagement and storytelling
- Hard to understand photographer's range quickly
- Static grids don't convey emotion or narrative arcs
- No memorable "wow" moments

**Goals:**
- Be inspired by exceptional photography
- Experience innovative design
- Discover unexpected visual stories
- Bookmark portfolio for future reference

**Journey Map:**
1. **Entry:** Gallery Lobby with hero section and featured stories
2. **Exploration:** Drawn to Featured Story with cinematic preview
3. **Immersion:** Explores 3D Emotion Galaxy for spatial discovery
4. **Serendipity:** Discovers hidden narratives through contextual cursor
5. **Delight:** Emotion Ambience and physics interactions create wow moments

**Design Requirements:**
- Cinematic transitions between views
- Emotion-driven visual theming
- Magnetic filter orbs with spring physics
- 3D Emotion Galaxy as signature experience
- Contextual cursor showing metadata without clicks

---

### Maria, The Seeker (16-55 years old)

**Profile:**
- Athlete, parent, or event attendee on a mission
- Received gallery link after tournament
- Needs to find best photos quickly for download/sharing

**Pain Points:**
- Overwhelming to scroll through thousands of chronological photos
- Doesn't know which photos are technically best
- Traditional search requires exact keywords
- Wastes time browsing mediocre shots

**Goals:**
- Find personal best action shots efficiently
- Identify print-worthy and social media-ready images
- Download files quickly
- Create highlight collections

**Journey Map:**
1. **Entry:** Direct link to gallery or search bar
2. **Search:** Natural language query ("triumphant celebration blocking shots")
3. **Refinement:** Filters by portfolio quality + play type
4. **Selection:** Quality-stratified grid shows best photos first
5. **Action:** Downloads social media pack or saves to collection

**Design Requirements:**
- Natural language search with semantic understanding
- Quality-stratified grid (portfolio_worthy prioritized)
- Advanced filtering with real-time photo counts
- Contextual cursor for instant metadata
- Clear quality indicators (gold badges, shimmer effects)

---

### David, The Curator (30-50 years old)

**Profile:**
- Coach, team manager, or brand professional
- Building visual assets for recruiting/marketing
- Needs efficient curation and export workflows

**Pain Points:**
- Manual curation takes hours without quality indicators
- Hard to find photos that tell cohesive stories
- Existing tools don't support batch operations
- No advanced filtering (composition, emotion arcs, intensity)

**Goals:**
- Build thematic collections efficiently
- Generate highlight reels for recruiting
- Export presentation-ready packages
- Demonstrate team/program quality

**Journey Map:**
1. **Entry:** Team portal or Gallery Lobby
2. **Discovery:** Reviews AI-generated Thematic Collections
3. **Filtering:** Applies Technical Excellence + Peak Intensity filters
4. **Selection:** Bulk selects portfolio shots with quality indicators
5. **Export:** Downloads PDF package with metadata

**Design Requirements:**
- AI-generated Thematic Collections (pre-curated)
- Bulk selection with multi-select support
- Advanced filter interface with range sliders
- PDF export with emotional curves
- Utilitarian tools without sacrificing aesthetic

---

## 3. Design System Foundation

### Motion Tokens

**Location:** `src/lib/motion-tokens.ts`

All animations must use predefined motion tokens. No arbitrary duration or easing values allowed.

**Spring Configurations:**
```typescript
export const MOTION = {
  spring: {
    // Smooth, natural springs for gentle interactions
    gentle: { stiffness: 100, damping: 20 },

    // Quick, responsive springs for UI feedback
    snappy: { stiffness: 300, damping: 30 },

    // Playful, energetic springs for delight moments
    bouncy: { stiffness: 500, damping: 35 }
  },

  duration: {
    fast: 0.2,    // Quick feedback (button press, hover)
    normal: 0.3,  // Standard transitions (page changes, filters)
    slow: 0.5,    // Dramatic reveals (story viewer entry)
    cinematic: 0.8 // Smooth theme transitions (emotion ambience)
  },

  ease: {
    easeOut: [0.16, 1, 0.3, 1],      // Smooth deceleration
    easeInOut: [0.4, 0, 0.2, 1],     // Balanced acceleration
    anticipate: [0.5, 0.05, 0.1, 1]  // Slight bounce
  }
};
```

**Usage Requirements:**
- Import from `motion-tokens.ts` only
- Never hard-code timing values
- Use Framer Motion for React component animations
- Use GSAP for complex timelines and scroll effects
- Always respect `prefers-reduced-motion`

---

### Emotion Palette

**Location:** `src/lib/motion-tokens.ts` (exported alongside motion tokens)

The EMOTION_PALETTE is not just for accents—it's a core system driving halos, ambience, timeline visualization, and cursor morphing.

**Palette Definition:**
```typescript
export const EMOTION_PALETTE = {
  triumph: {
    primary: '#FFD700',
    gradient: 'radial-gradient(circle, #FFD700 0%, #FFA500 100%)',
    glow: '0 0 20px rgba(255, 215, 0, 0.6)',
    description: 'Victory moments, game-winning plays'
  },
  intensity: {
    primary: '#FF4500',
    gradient: 'radial-gradient(circle, #FF4500 0%, #DC143C 100%)',
    glow: '0 0 20px rgba(255, 69, 0, 0.6)',
    description: 'Peak action, high-energy moments'
  },
  focus: {
    primary: '#4169E1',
    gradient: 'radial-gradient(circle, #4169E1 0%, #1E90FF 100%)',
    glow: '0 0 20px rgba(65, 105, 225, 0.6)',
    description: 'Concentration, mental preparation'
  },
  determination: {
    primary: '#6A0DAD',
    gradient: 'radial-gradient(circle, #6A0DAD 0%, #8B008B 100%)',
    glow: '0 0 20px rgba(106, 13, 173, 0.6)',
    description: 'Grit, perseverance, resilience'
  },
  excitement: {
    primary: '#FFD700',
    gradient: 'radial-gradient(circle, #FFD700 0%, #FFFF00 100%)',
    glow: '0 0 20px rgba(255, 215, 0, 0.6)',
    description: 'Celebration, joy, enthusiasm'
  },
  serenity: {
    primary: '#40E0D0',
    gradient: 'radial-gradient(circle, #40E0D0 0%, #20B2AA 100%)',
    glow: '0 0 20px rgba(64, 224, 208, 0.6)',
    description: 'Calm moments, reflection, sportsmanship'
  }
};
```

**Implementation Requirements:**
- Emotion halos on all photo cards
- Contextual cursor morphs color by emotion
- Emotion Ambience shifts UI theme dynamically
- Timeline scrubber uses emotion colors for segments
- Story viewer displays emotional curves with palette

---

### Typography System

**Component Location:** `src/components/common/Typography.tsx`

**Font Family:** Inter Variable (`@fontsource-variable/inter`)
- Single typeface for entire site (no mixing)
- Variable font supports weights 400-700 dynamically
- High legibility for metadata and body text

**Type Scale:**
```typescript
export const TYPOGRAPHY = {
  // Display/Hero
  hero: { size: '3rem', lineHeight: 1.1, weight: 700 },      // 48px

  // Headings
  h1: { size: '2rem', lineHeight: 1.2, weight: 600 },        // 32px
  h2: { size: '1.5rem', lineHeight: 1.2, weight: 600 },      // 24px
  h3: { size: '1.25rem', lineHeight: 1.3, weight: 500 },     // 20px

  // Body
  body: { size: '1rem', lineHeight: 1.5, weight: 400 },      // 16px
  small: { size: '0.875rem', lineHeight: 1.5, weight: 400 }, // 14px
  tiny: { size: '0.75rem', lineHeight: 1.4, weight: 400 },   // 12px

  // UI Elements
  button: { size: '0.875rem', lineHeight: 1, weight: 500 },  // 14px
  label: { size: '0.75rem', lineHeight: 1.4, weight: 500 },  // 12px (uppercase)
};
```

**Usage Requirements:**
- All text must use Typography component
- No raw `<p>`, `<span>`, or `<div>` with text content
- WCAG AAA contrast (7:1 minimum)
- Example: `<Typography variant="body">Text</Typography>`

---

### Color System

**Base Palette (Muted & Neutral):**
```css
/* CSS Custom Properties - src/styles/globals.css */
:root {
  /* Backgrounds */
  --color-background: #1a1a1a;     /* Charcoal dark */
  --color-surface: #2a2a2a;        /* Elevated surfaces */
  --color-surface-hover: #333333;  /* Hover state */

  /* Text */
  --color-text-primary: #ffffff;   /* High contrast */
  --color-text-secondary: #a0a0a0; /* Metadata, labels */
  --color-text-tertiary: #666666;  /* Disabled, hints */

  /* Accents */
  --color-accent-gold: #d4af37;    /* Quality indicators, CTAs */
  --color-accent-hover: #e5c04c;   /* Hover brightening */

  /* Borders */
  --color-border: #404040;
  --color-border-focus: var(--color-accent-gold);
}
```

**Spacing Scale:**
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
--spacing-3xl: 64px;
```

**Border Radius:**
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-full: 9999px;
```

**Shadows:**
```css
--shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
--shadow-md: 0 4px 12px rgba(0,0,0,0.15);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.25);
--shadow-xl: 0 16px 48px rgba(0,0,0,0.35);
```

**Usage Requirements:**
- Never hard-code hex values
- Use CSS custom properties exclusively
- Maintain WCAG AAA contrast for text
- Adaptive theming via JavaScript updates to custom properties

---

### Core Components

**Button Component** (`src/components/common/Button.tsx`)

**Variants:**
- Primary: Gold background, white text, shadow
- Secondary: Charcoal outline, white text, transparent
- Ghost: Text only, no border, underline on hover

**Interaction States:**
```typescript
// Hover: brightness 1.1, scale 1.02 (spring snappy)
// Active: scale 0.98, brightness 0.9
// Focus: 2px gold outline, 4px offset
// Disabled: 50% opacity, no pointer events
```

---

**Card Component** (`src/components/common/Card.tsx`)

**Visual Treatment:**
- Background: `var(--color-surface)`
- Border radius: `var(--radius-md)`
- Shadow: `var(--shadow-md)`
- Padding: `var(--spacing-lg)`

**Interaction:**
- Hover: Shadow expands to `var(--shadow-lg)`, lift `translateY(-4px)`
- Transition: Spring physics (`MOTION.spring.gentle`)

---

**Input Component** (`src/components/common/Input.tsx`)

**Visual Treatment:**
- Background: `var(--color-background)`
- Border: 1px solid `var(--color-border)`
- Text: `var(--color-text-primary)`
- Placeholder: `var(--color-text-secondary)`
- Height: 48px (comfortable touch target)

**Interaction:**
- Focus: Gold border, glow effect
- Error: Red border, error message below
- Success: Green border, checkmark icon

---

## 4. Phase 1: Unbreakable Foundation (2-3 weeks)

### Deliverable 1: Design System & Motion Tokens

**Description:** Implement comprehensive design token system following Digital Gallery aesthetic.

**Requirements:**
- Create `src/lib/motion-tokens.ts` with all motion configurations
- Export EMOTION_PALETTE with 6 emotions (colors, gradients, glows)
- Create `src/styles/globals.css` with CSS custom properties
- Load Inter Variable font (`@fontsource-variable/inter`)
- Define spacing scale (4/8/16/24/32/48/64px)
- WCAG AAA contrast ratios verified

**Files to Create:**
- `src/lib/motion-tokens.ts`
- `src/styles/globals.css`
- `src/components/common/Typography.tsx`
- `src/components/common/Button.tsx`
- `src/components/common/Card.tsx`
- `src/components/common/Input.tsx`

**Success Criteria:**
- [ ] Motion tokens exported and usable in components
- [ ] EMOTION_PALETTE available with all 6 emotions
- [ ] CSS custom properties defined and applied globally
- [ ] Inter Variable font loaded successfully
- [ ] Typography component renders all variants
- [ ] Button component has all 3 variants
- [ ] WCAG AAA contrast verified with color checker

---

### Deliverable 2: Database Schema & AI Enrichment Pipeline

**Description:** Verify v1 backend integration is functional and accessible.

**Requirements:**
- Confirm Supabase connection works (test query photo_metadata)
- Verify 20,000+ enriched photos available
- Test SmugMug API integration (album listing, photo fetching)
- Validate 12 semantic dimensions populated
- Confirm image URLs accessible

**Backend Files (Already Migrated):**
- `src/lib/supabase/client.ts` - Browser client
- `src/lib/supabase/server.ts` - Server-side client
- `src/lib/smugmug/client.ts` - SmugMug OAuth client
- `src/types/photo.ts` - PhotoMetadata type definitions

**Success Criteria:**
- [ ] Supabase client connects successfully
- [ ] Query returns photo_metadata records
- [ ] All 12 semantic dimensions present
- [ ] Image URLs resolve correctly
- [ ] SmugMug API returns albums and photos
- [ ] AI enrichment scripts executable

---

### Deliverable 3: Core Photo Grid with Virtual Scrolling

**Description:** Build performant photo grid supporting 10,000+ photos at 60fps.

**Requirements:**
- Use `@tanstack/react-virtual` for windowed rendering
- 300px estimated row height with dynamic adjustment
- 5-row overscan buffer for smooth scrolling
- Adaptive columns (1-6 based on viewport width)
- Next.js Image component with automatic WebP/AVIF
- Blurhash placeholder generation
- Intersection Observer lazy loading (200px root margin)
- Responsive srcset with 6 breakpoints

**Component Structure:**
```typescript
// src/components/portfolio/PhotoGrid.tsx
interface PhotoGridProps {
  photos: PhotoMetadata[];
  columns?: number; // Auto-detected if not provided
  onPhotoClick?: (photo: PhotoMetadata) => void;
}

// src/components/portfolio/PhotoCard.tsx
interface PhotoCardProps {
  photo: PhotoMetadata;
  showMetadata?: boolean;
  emotionHalo?: boolean;
  qualityGlow?: boolean;
}
```

**Success Criteria:**
- [ ] Renders 10,000+ photos without frame drops
- [ ] Virtual scrolling maintains 60fps
- [ ] Adaptive columns responsive (mobile → desktop)
- [ ] Images lazy load with blurhash placeholders
- [ ] Next.js Image optimization working
- [ ] Click handler navigates to detail view

---

### Deliverable 4: Basic Filtering & Sorting System

**Description:** Multi-dimensional filter UI with real-time photo counts.

**Requirements:**
- Checkboxes for portfolio_worthy, print_ready, social_media_optimized
- Emotion filter (6 checkboxes with color coding)
- Play type filter (7 checkboxes: attack, block, dig, set, serve, pass, celebration)
- Composition pattern multi-select
- Action intensity filter (low/medium/high/peak)
- Real-time photo count updates (query Supabase with filters)
- Filter combination logic (AND operators)
- Persistent state in URL query params
- One-click "Clear All Filters" button
- Sort modes: Quality Descending, Chronological, Emotion Clusters, Play Type Groups

**Component Structure:**
```typescript
// src/components/filters/FilterPanel.tsx
interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
  photoCount: number; // Real-time count from query
}

// src/types/filters.ts
interface FilterState {
  portfolio_worthy?: boolean;
  print_ready?: boolean;
  social_media_optimized?: boolean;
  emotions?: Emotion[];
  play_types?: PlayType[];
  composition_patterns?: CompositionPattern[];
  action_intensity?: ActionIntensity[];
  quality_min?: number;
  quality_max?: number;
}
```

**Success Criteria:**
- [ ] All filter categories functional
- [ ] Real-time photo counts accurate
- [ ] URL query params update on filter change
- [ ] Clear All button resets to default state
- [ ] Sort modes change grid order
- [ ] Filter combinations apply correctly (AND logic)

---

### Deliverable 5: Navigation & Layout Structure

**Description:** App shell with global navigation and responsive layout.

**Requirements:**
- Global navigation with Gallery Lobby link, Search icon, Collections dropdown
- Responsive layout with mobile hamburger menu
- Footer with photographer branding
- Breadcrumb trail for deep navigation
- Skip to content link for accessibility
- ARIA landmarks (header, main, nav, footer)
- Keyboard navigation support (Tab, Enter, Escape)
- Dark mode only (no light mode toggle needed)

**Component Structure:**
```typescript
// src/components/layout/Navigation.tsx
// src/components/layout/Header.tsx
// src/components/layout/Footer.tsx
// src/components/layout/Breadcrumb.tsx
```

**Success Criteria:**
- [ ] Navigation visible on all pages
- [ ] Mobile hamburger menu functional
- [ ] Breadcrumb shows current path
- [ ] Skip to content link works with keyboard
- [ ] ARIA landmarks present
- [ ] Keyboard navigation functional

---

### Phase 1 Quality Gates

**Design Checklist:**
- [ ] Inter Variable font loaded and applied globally
- [ ] All colors from design tokens (CSS custom properties)
- [ ] Typography component used for all text
- [ ] Lucide React icons exclusively (NO emojis)
- [ ] Motion tokens used for all transitions
- [ ] WCAG AAA contrast verified (7:1 minimum)
- [ ] Spacing from design scale (no arbitrary values)
- [ ] 60fps validated (Chrome DevTools Performance tab)

**Performance Checklist:**
- [ ] Lighthouse Performance 90+
- [ ] Lighthouse Accessibility 90+
- [ ] Lighthouse Best Practices 90+
- [ ] Lighthouse SEO 90+
- [ ] Page load <2s
- [ ] Virtual scrolling handles 10K+ photos
- [ ] Bundle size <200KB gzipped

**Testing Checklist:**
- [ ] Playwright E2E test: Load homepage, navigate to grid
- [ ] Visual regression test: Screenshot grid view
- [ ] Accessibility test: VoiceOver/NVDA navigation
- [ ] Performance test: Virtual scrolling with 10K photos

---

## 5. Phase 2: Intelligent Interface (2-3 weeks)

### Deliverable 6: Gallery Lobby (Homepage)

**Description:** Multi-entry point homepage with Featured Stories, Explore Pathways, and Search.

**Requirements:**
- Hero section with site tagline and primary CTA
- Featured Stories carousel showing 3-5 AI-generated narratives
  - Cinematic preview thumbnails (16:9 ratio)
  - Emotional curve mini-graphs
  - Photo counts per story
  - Click to open Story Viewer
- Explore Pathways grid (3 tiles):
  - 3D Emotion Galaxy tile with preview animation
  - Emotion Timeline tile
  - Thematic Collections tile
- Prominent search bar with natural language placeholder
- Thematic Collections section (4-6 persistent collections)
  - Preview grids (4-photo thumbnails)
  - Photo counts and emotion distribution
- Personalized recommendations module (future: based on viewing history)
- Framer Motion page transitions (fade 300ms)

**Component Structure:**
```typescript
// src/app/page.tsx - Gallery Lobby
// src/components/lobby/HeroSection.tsx
// src/components/lobby/FeaturedStories.tsx
// src/components/lobby/ExplorePathways.tsx
// src/components/lobby/ThematicCollections.tsx
// src/components/lobby/SearchBar.tsx
```

**Success Criteria:**
- [ ] Gallery Lobby loads in <1.5s
- [ ] Featured Stories carousel functional
- [ ] Explore Pathways tiles link to correct routes
- [ ] Search bar navigates to search results
- [ ] Thematic Collections display correctly
- [ ] Page transition smooth (300ms fade)

---

### Deliverable 7: Natural Language Search

**Description:** Semantic search with pattern matching for emotion + play type queries.

**Requirements:**
- Query parser extracts filters from natural language
  - "triumphant celebration blocks" → emotion=triumph, play_type=block
  - "peak intensity attack shots" → action_intensity=peak, play_type=attack
  - "portfolio worthy serenity moments" → portfolio_worthy=true, emotion=serenity
- Pinecone vector database integration for embeddings-based similarity search
- Faceted filtering sidebar showing applied filters
  - One-click removal of filter chips
- Query suggestions dropdown based on available metadata
- Saved searches stored in localStorage
- Search results page with quality-stratified grid

**Component Structure:**
```typescript
// src/app/search/page.tsx
// src/components/search/SearchBar.tsx
// src/components/search/SearchResults.tsx
// src/components/search/FacetedFilters.tsx
// src/components/search/QueryParser.ts
```

**Implementation Notes:**
- Use Fuse.js for fuzzy matching on metadata
- Pinecone for semantic similarity (OpenAI embeddings)
- Debounce search input (300ms)
- Show loading state during query

**Success Criteria:**
- [ ] Natural language queries return relevant results
- [ ] Query parsing extracts filters correctly
- [ ] Search returns results in <500ms
- [ ] Faceted filters display and work
- [ ] Saved searches persist across sessions
- [ ] No results state handled gracefully

---

### Deliverable 8: Quality-Stratified Grid View

**Description:** Enhanced photo grid with portfolio_worthy prioritization and visual hierarchy.

**Requirements:**
- Portfolio_worthy photos appear first (quality >= 8)
- Visual quality indicators:
  - Gold corner badge on portfolio_worthy photos
  - Shimmer box-shadow animation on hover
- Quality gradient mode toggle:
  - Applies brightness adjustment (50-100% based on quality score)
  - Gaussian blur (0-5px, inverse to quality)
  - Dimming for low-quality (opacity 60%)
- Infinite scroll with virtual rendering
- "Jump to Portfolio Shots" floating button (appears when scrolled past first page)
- GSAP animations for quality transitions

**Component Structure:**
```typescript
// src/components/portfolio/QualityStratifiedGrid.tsx
// src/components/portfolio/QualityBadge.tsx
// src/components/portfolio/QualityGradientToggle.tsx
// src/hooks/useQualityStratification.ts
```

**Success Criteria:**
- [ ] Portfolio photos prioritized at top
- [ ] Gold badges visible on portfolio_worthy
- [ ] Shimmer effect animates on hover
- [ ] Quality gradient mode functional
- [ ] Jump to Portfolio button appears correctly
- [ ] Transitions smooth with GSAP

---

### Deliverable 9: AI Story Curation Engine

**Description:** Backend system detecting 6 narrative arc patterns and generating stories.

**Requirements:**
- Implement 6 narrative detection algorithms:
  1. **Game-Winning Rally:** Final 5 minutes + peak intensity + triumph/intensity (min 3 photos)
  2. **Player Highlight Reel:** Top 10 portfolio shots per athlete, sorted by quality
  3. **Season Journey:** One photo per game, chronological sequence
  4. **Comeback Story:** Emotion pattern (determination → intensity → triumph, min 4 photos)
  5. **Technical Excellence:** Sharpness >= 9 + composition >= 9 (min 8 photos)
  6. **Emotion Spectrum:** 4+ emotions in single game/event
- Each detection function returns NarrativeArc object:
  - arc_type: string
  - photos: PhotoMetadata[]
  - title: string
  - description: string
  - emotional_curve: number[] (0-10 intensity values)
  - metadata: { generated_at, cache_duration }
- Story generation API endpoint: `/api/stories/generate?album_key=xxx&arc_type=xxx`
- Redis caching (1-hour TTL)
- <3s generation time for any narrative

**API Structure:**
```typescript
// src/app/api/stories/generate/route.ts
interface GenerateStoryRequest {
  album_key: string;
  arc_type: 'game_winning_rally' | 'player_highlight' | 'season_journey' |
           'comeback_story' | 'technical_excellence' | 'emotion_spectrum';
}

interface NarrativeArc {
  arc_type: string;
  photos: PhotoMetadata[];
  title: string;
  description: string;
  emotional_curve: number[];
  metadata: {
    generated_at: string;
    cache_duration: number;
  };
}
```

**Success Criteria:**
- [ ] All 6 detection algorithms functional
- [ ] Story generation <3s for any type
- [ ] Emotional curve calculated correctly
- [ ] Redis caching reduces repeat queries
- [ ] API endpoint returns valid NarrativeArc

---

### Deliverable 10: Thematic Collections

**Description:** Persistent collections generated by AI story detection algorithms.

**Requirements:**
- Pre-curated galleries:
  - Technical Excellence
  - Peak Moments
  - Emotional Journeys
  - Player Spotlights
  - Game-Winning Rallies
  - Comeback Stories
- Lazy generation on first visit (3-5s background job with loading state)
- Collection index page (`/collections`) showing all collections:
  - Preview thumbnails (4-photo grid)
  - Photo counts
  - Emotion distribution visualizations (color bar chart)
- Collection detail pages (`/collections/[slug]`):
  - Full photo grid with filtering
  - Export options (PDF, ZIP download)
- Collections regenerate daily via cron job

**Component Structure:**
```typescript
// src/app/collections/page.tsx
// src/app/collections/[slug]/page.tsx
// src/components/collections/CollectionCard.tsx
// src/components/collections/EmotionDistribution.tsx
```

**Success Criteria:**
- [ ] 6 thematic collections available
- [ ] Lazy generation completes in <5s
- [ ] Loading state displays during generation
- [ ] Preview thumbnails and counts correct
- [ ] Emotion distribution visualized
- [ ] Collection detail pages functional

---

### Deliverable 11: Advanced Filter Interface

**Description:** Redesigned filter system with collapsible sections and range sliders.

**Requirements:**
- Collapsible sections:
  - Quality Metrics (sharpness, exposure, composition, emotional impact)
  - Emotion & Mood (6 emotion checkboxes with color backgrounds)
  - Play Types (7 checkboxes with Lucide icons)
  - Composition (multi-select: rule of thirds, leading lines, framing, symmetry)
  - Technical (time of day, action intensity)
- Range sliders for quality scores (0-10 scale with dual handles)
- Emotion filter chips with color-coded backgrounds from EMOTION_PALETTE
- Play type filter with Lucide React icons:
  - attack: `<Zap />`
  - block: `<Shield />`
  - dig: `<ArrowDown />`
  - set: `<Target />`
  - serve: `<Circle />`
- Filter presets dropdown:
  - Portfolio Shots
  - Social Ready
  - Print Ready
  - Peak Moments
- Real-time photo count updates
- "Apply Filters" button (debounced 300ms)

**Component Structure:**
```typescript
// src/components/filters/AdvancedFilterPanel.tsx
// src/components/filters/QualitySlider.tsx
// src/components/filters/EmotionChips.tsx
// src/components/filters/PlayTypeFilter.tsx
// src/components/filters/FilterPresets.tsx
```

**Success Criteria:**
- [ ] All filter sections collapsible
- [ ] Range sliders functional (dual handles)
- [ ] Emotion chips color-coded correctly
- [ ] Play type icons from Lucide (NO emojis)
- [ ] Filter presets apply correct combinations
- [ ] Real-time photo counts accurate

---

### Phase 2 Quality Gates

**Design Checklist:**
- [ ] Gallery Lobby has clear focal point with 60%+ whitespace
- [ ] Quality-stratified grid prioritizes portfolio_worthy
- [ ] Emotion halos visible on photos (colored glow per emotion)
- [ ] Quality gradient applies dimming/blur correctly
- [ ] NO emojis in filter UI (Lucide icons only)
- [ ] Search interface uses Typography component
- [ ] Cinematic transitions between views (Framer Motion)
- [ ] All animations from motion tokens

**Performance Checklist:**
- [ ] Gallery Lobby loads <1.5s
- [ ] Search returns results <500ms
- [ ] Story generation <3s
- [ ] Thematic Collections load <5s
- [ ] Filter updates <300ms (debounced)

**Testing Checklist:**
- [ ] E2E test: Search → Filter → View photo
- [ ] E2E test: Gallery Lobby → Story → Viewer
- [ ] Visual regression: Gallery Lobby, Search Results
- [ ] Accessibility: Keyboard navigation for filters

---

## 6. Phase 3: Experiential Layer (3-4 weeks)

### Deliverable 12: Magnetic Filter Orbs

**Description:** Physics-based filter buttons with magnetic attraction and spring animations.

**Requirements:**
- Replace checkbox filters with floating orbs
- Framer Motion spring animations:
  - stiffness: 300
  - damping: 30
- 100px magnetic attraction radius
- Real-time strength calculation (inverse square law)
- Cursor tracking with velocity-based prediction
- Haptic-like feedback curves (ease-out acceleration)
- Active state: scale 0.95 + brightness 1.2
- Glow effect on hover (emotion-based color)
- Accessibility:
  - Keyboard Tab navigation
  - Space to toggle
  - ARIA labels
- Mobile touch optimization (larger tap targets, simplified physics)

**Component Structure:**
```typescript
// src/components/filters/MagneticFilterOrb.tsx
interface MagneticFilterOrbProps {
  label: string;
  active: boolean;
  onToggle: () => void;
  emotion?: Emotion; // For color theming
  photoCount?: number; // Brightness correlates to count
}

// src/hooks/useMagneticAttraction.ts
interface MagneticOptions {
  radius: number; // 100px
  strength: number; // 0-1 scale
  velocityFactor: number; // Prediction multiplier
}
```

**Implementation Notes:**
- Use Framer Motion `motion.button`
- Track mouse position with `useMousePosition` hook
- Calculate distance to orb center
- Apply spring animation to orb position
- Brightness increases with photo count (more photos = brighter glow)

**Success Criteria:**
- [ ] Orbs attract cursor within 100px
- [ ] Spring physics feels natural (snappy preset)
- [ ] Active state visually distinct
- [ ] Glow color matches emotion (if applicable)
- [ ] Keyboard navigation functional
- [ ] Mobile touch targets adequate (44x44px minimum)

---

### Deliverable 13: Contextual Cursor

**Description:** Custom cursor morphing based on photo emotion metadata.

**Requirements:**
- GSAP-powered cursor following mouse (200ms ease)
- Default state: small circle (12px diameter, white border)
- Photo hover: morphs size/color based on emotion
  - triumph → Gold glow (24px, #FFD700)
  - intensity → Red-orange glow (24px, #FF4500)
  - focus → Cool blue glow (20px, #4169E1)
  - determination → Deep purple (22px, #6A0DAD)
  - excitement → Vibrant yellow (24px, #FFD700)
  - serenity → Soft teal (20px, #40E0D0)
- Metadata preview tooltip displays:
  - Quality score (e.g., "Quality: 8.5/10")
  - Composition type (e.g., "Rule of Thirds")
  - Play type icon (Lucide React icon)
- Tooltip positioned near cursor (10px offset)
- Hides on touch devices (CSS `@media (pointer: coarse)`)
- Respects `prefers-reduced-motion` (falls back to default cursor)
- Z-index management (always above content)

**Component Structure:**
```typescript
// src/components/common/ContextualCursor.tsx
interface ContextualCursorProps {
  enabled?: boolean; // Default true, false on touch devices
}

// src/hooks/useMousePosition.ts
interface MousePosition {
  x: number;
  y: number;
  velocity: { x: number; y: number };
}
```

**Implementation Notes:**
- Use GSAP `gsap.quickTo()` for smooth following
- Portal cursor to document.body (z-index control)
- Update cursor state on photo card hover
- Metadata passed via data attributes or context

**Success Criteria:**
- [ ] Cursor follows mouse smoothly (200ms lag)
- [ ] Morphs color/size based on emotion
- [ ] Metadata tooltip displays without clicks
- [ ] Update rate <16ms (60fps)
- [ ] Hidden on touch devices
- [ ] Respects prefers-reduced-motion

---

### Deliverable 14: 3D Photo Card Physics

**Description:** Photo card interactions with tilt, lift, and cursor repulsion.

**Requirements:**
- Hover tilt effect:
  - Calculate mouse position relative to card center
  - Apply rotateX/rotateY transforms
  - Max 15° rotation on any axis
- Lift transformation on hover:
  - translateZ(20px) for depth
  - Box-shadow expansion (md → lg)
- Cursor repulsion force field:
  - 150px radius pushes adjacent cards away
  - Spring physics (stiffness: 400, damping: 25)
  - Calculates repulsion vector from cursor to card center
- Emotion-based glow intensity:
  - Portfolio_worthy photos: animated shimmer box-shadow
  - Glow color matches emotion palette
- GPU acceleration:
  - CSS `will-change: transform`
  - Hardware-accelerated properties only
- Accessibility:
  - No tilt on keyboard focus
  - Use scale 1.02 + outline instead

**Component Structure:**
```typescript
// src/components/portfolio/PhotoCard.tsx (enhanced)
interface PhotoCardProps {
  photo: PhotoMetadata;
  enablePhysics?: boolean; // Default true
  onHover?: (photo: PhotoMetadata) => void;
}

// src/hooks/useTiltEffect.ts
interface TiltOptions {
  maxRotation: number; // 15deg
  perspective: number; // 1000px
}

// src/hooks/useRepulsion.ts
interface RepulsionOptions {
  radius: number; // 150px
  strength: number; // 0-1 scale
}
```

**Implementation Notes:**
- Use Framer Motion `motion.div`
- Calculate mouse position with `useMousePosition`
- Apply 3D transforms via `rotateX`, `rotateY`, `translateZ`
- Repulsion affects adjacent cards within radius
- Glow intensity correlates to quality score

**Success Criteria:**
- [ ] Tilt effect responsive to mouse position
- [ ] Max rotation capped at 15°
- [ ] Lift effect visible (shadow expansion)
- [ ] Cursor repulsion pushes adjacent cards
- [ ] Glow color matches emotion
- [ ] 60fps maintained with 50+ cards
- [ ] Keyboard focus uses scale instead of tilt

---

### Deliverable 15: Emotion Ambience (Adaptive Theming)

**Description:** Dynamic UI theming that shifts to match dominant photo emotion in viewport.

**Requirements:**
- Intersection Observer tracks visible photos
- Calculates dominant emotion from visible set:
  - Weighted by quality score (higher quality = more influence)
  - Updates every 500ms (debounced)
- Smoothly transitions UI accent colors (800ms):
  - Filter orbs
  - Button hover states
  - Contextual cursor
  - Card glows
  - Border highlights
- Background ambient lighting effects:
  - Subtle gradient overlays (10% opacity)
  - Radial gradients from emotion palette
- CSS custom properties for theme injection:
  - `--accent-current: <emotion-color>`
  - `--glow-current: <emotion-glow>`
- React Context for theme state management
- Opt-out toggle in settings:
  - "Disable Emotion Ambience"
  - Falls back to gold accent
- Respects `prefers-reduced-motion` (instant transitions, no gradients)

**Component Structure:**
```typescript
// src/components/theming/EmotionAmbienceProvider.tsx
interface EmotionAmbienceContextValue {
  currentEmotion: Emotion | null;
  dominantColor: string;
  enableAmbience: boolean;
  toggleAmbience: () => void;
}

// src/hooks/useVisiblePhotos.ts
interface VisiblePhoto {
  photo: PhotoMetadata;
  intersectionRatio: number;
  quality: number;
}
```

**Implementation Notes:**
- Wrap app with `EmotionAmbienceProvider`
- Use Intersection Observer with root margin 100px
- Calculate dominant emotion with weighted average
- Update CSS custom properties via `document.documentElement.style.setProperty`
- Smooth transitions with CSS `transition: all 800ms ease`

**Success Criteria:**
- [ ] Dominant emotion calculated correctly
- [ ] UI colors shift smoothly (800ms)
- [ ] Filter orbs, buttons, cursor update color
- [ ] Background gradient applies subtly
- [ ] Opt-out toggle functional
- [ ] No jarring color shifts
- [ ] Respects prefers-reduced-motion

---

### Deliverable 16: Emotion Timeline Scrubber

**Description:** Interactive timeline for scrubbing through story emotional arcs.

**Requirements:**
- GSAP Draggable plugin for smooth scrubbing
- Emotional curve graph overlay:
  - Color-coded segments by emotion (matches palette)
  - Y-axis: emotion intensity (0-10)
  - X-axis: time/sequence position
- Snap-to-boundary logic at emotion transitions
- Playback progress indicator (animated fill)
- Click-to-seek functionality (jump to timestamp)
- Keyboard controls:
  - Left/Right arrows: scrub backward/forward
  - Space: pause/play
  - Escape: close timeline
- Auto-advance mode with configurable timing:
  - 2-5 seconds per photo (adjustable)
  - Smooth transitions between photos
- Tooltips showing emotion labels and timestamps on hover
- Integrates with Story Viewer for narrative navigation

**Component Structure:**
```typescript
// src/components/story/EmotionTimeline.tsx
interface EmotionTimelineProps {
  story: NarrativeArc;
  currentIndex: number;
  onSeek: (index: number) => void;
  autoPlay?: boolean;
  autoPlayDuration?: number; // Seconds per photo
}

// src/hooks/useTimelineScrubber.ts
interface ScrubberOptions {
  snap: boolean;
  snapThreshold: number; // Distance to snap point
  minDragDistance: number; // Minimum drag for seek
}
```

**Implementation Notes:**
- Use GSAP Draggable on scrubber handle
- Render emotional curve as SVG path
- Calculate curve from story.emotional_curve values
- Color segments with emotion palette gradients
- Auto-advance with `setInterval` (clearable)

**Success Criteria:**
- [ ] Scrubber draggable smoothly
- [ ] Emotional curve rendered correctly
- [ ] Snaps to emotion transitions
- [ ] Click-to-seek functional
- [ ] Keyboard controls work
- [ ] Auto-play advances smoothly
- [ ] Tooltips display emotion labels

---

### Deliverable 17: Momentum Scroll with Smart Snap

**Description:** Physics-based scrolling with automatic snapping to quality photos.

**Requirements:**
- Framer Motion `useScroll` + `useSpring` for inertia
- Velocity detection:
  - Monitors scroll speed
  - Threshold: 500px/s triggers snap
- Quality-threshold snap logic:
  - Identifies portfolio_worthy photos (quality >= 8) in viewport
  - Auto-centers best photo when velocity decreases
- Progressive friction dampening:
  - High velocity: minimal friction
  - Low velocity: increases friction to settle
- Visual snap indicators:
  - Subtle glow highlights snap targets
  - Pulse animation (opacity 0.5 → 1.0)
- Works with virtual scrolling system
- Respects `prefers-reduced-motion` (disables snap, instant scroll)
- Mobile optimization:
  - Touch gesture integration (`@use-gesture/react`)
  - Smoother deceleration curves

**Component Structure:**
```typescript
// src/hooks/useMomentumScroll.ts
interface MomentumScrollOptions {
  velocityThreshold: number; // 500px/s
  qualityThreshold: number; // 8
  friction: number; // 0-1 scale
  snapDuration: number; // 400ms
}

// src/components/portfolio/ScrollSnapIndicator.tsx
interface SnapIndicatorProps {
  targetIndex: number;
  active: boolean;
}
```

**Implementation Notes:**
- Use Framer Motion `useScroll` on scrollable container
- Calculate velocity with `useVelocity` hook
- Find nearest quality photo when velocity drops
- Smooth scroll to target with `scrollIntoView({ behavior: 'smooth' })`
- Highlight snap target with glow animation

**Success Criteria:**
- [ ] Velocity detection triggers at 500px/s
- [ ] Snaps to portfolio_worthy photos only
- [ ] Friction dampening feels natural
- [ ] Visual indicators pulse correctly
- [ ] Works with virtual scrolling
- [ ] Respects prefers-reduced-motion
- [ ] Mobile gestures smooth

---

### Deliverable 18: Play Type Morphing Grid

**Description:** Grid filtering animations with shared layout and stagger effects.

**Requirements:**
- Framer Motion LayoutGroup for shared layout animations
- AnimatePresence with `popLayout` mode for exits
- 300ms stagger on grid item entrance:
  - Calculated from index: `delay: index * 0.05`
- Play type badge indicators with Lucide icons:
  - attack: `<Zap />` (lightning bolt)
  - block: `<Shield />` (shield)
  - dig: `<ArrowDown />` (down arrow)
  - set: `<Target />` (target crosshair)
  - serve: `<Circle />` (circle)
- Layout recalculation on filter changes with spring physics
- Exit animations:
  - Scale 0.8 + opacity 0
  - 200ms duration
- Component keys based on photo IDs for proper tracking
- Maintains virtual scrolling performance during animations

**Component Structure:**
```typescript
// src/components/portfolio/PlayTypeMorphGrid.tsx
interface PlayTypeMorphGridProps {
  photos: PhotoMetadata[];
  activePlayType: PlayType | null;
  onFilterChange: (playType: PlayType) => void;
}

// src/components/portfolio/PlayTypeBadge.tsx
interface PlayTypeBadgeProps {
  playType: PlayType;
  size?: 'sm' | 'md' | 'lg';
}
```

**Implementation Notes:**
- Wrap grid with `<LayoutGroup>`
- Each PhotoCard gets `layout` prop
- Use `<AnimatePresence mode="popLayout">`
- Stagger calculated with `custom` prop
- Exit animations via `exit={{ scale: 0.8, opacity: 0 }}`

**Success Criteria:**
- [ ] Layout animations smooth on filter change
- [ ] Stagger effect visible (300ms total)
- [ ] Play type badges display correct icons
- [ ] Exit animations complete before removal
- [ ] Virtual scrolling unaffected
- [ ] 60fps maintained during morph

---

### Phase 3 Quality Gates

**Design Checklist:**
- [ ] All animations use motion tokens (MOTION.spring.*)
- [ ] 60fps maintained across all interactions (FPS meter)
- [ ] Contextual cursor morphs color by emotion
- [ ] Photo cards have 3D tilt + lift on hover
- [ ] Emotion Ambience shifts UI colors smoothly
- [ ] EMOTION_PALETTE integrated (halos, ambience, timeline, cursor)
- [ ] `prefers-reduced-motion` respected (instant or fade-only)
- [ ] NO hard-coded animation durations

**Performance Checklist:**
- [ ] FPS meter shows 60fps during interactions
- [ ] Magnetic orbs update <16ms
- [ ] Contextual cursor update rate <16ms
- [ ] Photo card physics smooth with 50+ cards
- [ ] Emotion Ambience transitions without jank
- [ ] Momentum scroll snaps without disruption

**Testing Checklist:**
- [ ] E2E test: Filter with magnetic orbs
- [ ] E2E test: Hover photos, check contextual cursor
- [ ] E2E test: Scroll grid, verify snap behavior
- [ ] Manual QA: Physics feel natural
- [ ] Accessibility: Keyboard navigation for orbs

---

## 7. Phase 4: Signature Moment (2-3 weeks)

### Deliverable 19: 3D Emotion Galaxy Core

**Description:** Three.js scene rendering 500 curated photos in 3D space with similarity clustering.

**Requirements:**
- Three.js + React Three Fiber (`@react-three/fiber`)
- Photo sprite rendering (500 curated subset):
  - Selected by portfolio_worthy + diversity of emotions/play types
  - Texture optimization: 512x512 max, compressed
- Similarity scoring algorithm positions photos in 3D:
  - Emotion similarity: 30% weight
  - Play type: 25% weight
  - Composition: 15% weight
  - Quality proximity: 15% weight
  - Time proximity: 10% weight
  - Color palette: 5% weight
- Clusters form naturally based on metadata
- Lerp-based camera transitions (lerp factor 0.05):
  - Smooth movement to selected photos
- OrbitControls for user navigation:
  - Zoom limits: 5-50 units
  - Pan limits: ±100 units
  - Rotation enabled
- Depth-of-field blur for spatial depth:
  - Near/far plane adjustments
  - Blur intensity based on distance
- GPU instanced rendering for performance:
  - Single geometry, multiple instances
  - Custom shaders for photo textures

**Component Structure:**
```typescript
// src/app/galaxy/page.tsx
// src/components/galaxy/EmotionGalaxy.tsx
interface EmotionGalaxyProps {
  photos: PhotoMetadata[]; // 500 curated photos
  initialCameraPosition?: [number, number, number];
}

// src/components/galaxy/PhotoSprite.tsx
interface PhotoSpriteProps {
  photo: PhotoMetadata;
  position: [number, number, number];
  onClick: (photo: PhotoMetadata) => void;
}

// src/utils/similarityScoring.ts
function calculateSimilarityPosition(
  photo: PhotoMetadata,
  allPhotos: PhotoMetadata[]
): [number, number, number];
```

**Implementation Notes:**
- Use `@react-three/fiber` Canvas component
- Photo sprites as textured planes
- Calculate 3D positions with similarity algorithm
- OrbitControls from `@react-three/drei`
- EffectComposer for depth-of-field

**Success Criteria:**
- [ ] 500 photos render in 3D space
- [ ] Similarity clustering creates coherent groupings
- [ ] Camera lerp transitions smooth
- [ ] OrbitControls functional (zoom, pan, rotate)
- [ ] Depth-of-field blur applied
- [ ] 60fps maintained on target hardware

---

### Deliverable 20: Galaxy Interaction & Navigation

**Description:** Interactive layer with raycasting, hover states, and guided navigation.

**Requirements:**
- Raycaster for click detection:
  - Click photo sprite → open detail view
  - Smooth camera transition to clicked photo
- Hover states:
  - Photo scales to 1.2x
  - Glow effect (emotion-based color)
  - Tooltip with photo title and emotion
- Camera animations using GSAP:
  - Smooth transitions to clusters
  - 1-2 second duration with ease-out
- Minimap overlay showing:
  - Camera position (yellow dot)
  - Cluster locations (colored dots by emotion)
  - Click minimap to fly to location
- Cluster labels (floating text sprites):
  - Shows emotion/play type
  - Positioned above cluster centers
  - Billboard effect (always faces camera)
- "Fly to Cluster" buttons:
  - Predefined viewpoints for each emotion cluster
  - Animated camera transitions
- Reset camera button:
  - Returns to default view
  - Smooth animation (2s ease-out)
- Keyboard shortcuts:
  - WASD: camera movement
  - Arrow keys: rotation
  - Space: auto-rotate toggle

**Component Structure:**
```typescript
// src/components/galaxy/GalaxyControls.tsx
interface GalaxyControlsProps {
  clusters: Cluster[];
  onFlyToCluster: (cluster: Cluster) => void;
  onResetCamera: () => void;
}

// src/components/galaxy/Minimap.tsx
interface MinimapProps {
  cameraPosition: [number, number, number];
  clusters: Cluster[];
  onMinimapClick: (position: [number, number, number]) => void;
}

// src/components/galaxy/ClusterLabel.tsx
interface ClusterLabelProps {
  cluster: Cluster;
  position: [number, number, number];
}
```

**Implementation Notes:**
- Use Three.js Raycaster for click detection
- GSAP timeline for camera animations
- Minimap rendered as 2D overlay (HTML)
- Text sprites from `@react-three/drei` Text component
- Auto-rotate with `useFrame` hook

**Success Criteria:**
- [ ] Click detection functional (raycaster)
- [ ] Hover states scale and glow correctly
- [ ] Camera animations smooth (GSAP)
- [ ] Minimap displays correct positions
- [ ] Cluster labels visible and legible
- [ ] Fly to Cluster buttons functional
- [ ] Keyboard shortcuts work

---

### Deliverable 21: Performance Optimization & Fallback

**Description:** Strict performance budgeting with automatic quality degradation and WebGL fallback.

**Requirements:**
- 16ms frame budget enforcement (60fps):
  - Monitor frame rate with Stats.js overlay
  - Show FPS, MS, MB counters in dev mode
- Three.js texture optimization:
  - Compressed textures (KTX2 format)
  - Mipmaps for distant photos
  - Max texture size: 512x512
- Frustum culling:
  - Only render photos in camera view
  - Automatic with Three.js renderer
- Level-of-detail (LOD) system:
  - Reduce sprite resolution at distance
  - 512px up close, 256px medium, 128px far
- Performance profiling:
  - Stats.js shows FPS in real-time
  - Alert if FPS drops below 55 for 3 consecutive frames
- Automatic quality degradation:
  - Triggers when FPS <55 for 3 frames
  - Reduces particle count (500 → 300 → 150)
  - Disables depth-of-field effect
  - Simplifies shaders
- WebGL detection with graceful fallback:
  - Detect WebGL 2.0 support on mount
  - Show "3D not supported" message if unavailable
  - Provide link to standard 2D grid view
  - Fallback activates automatically
- Loading state with 3D progress indicator:
  - Animated particle system preview
  - Shows % loaded and ETA
  - Smooth transition to full galaxy

**Component Structure:**
```typescript
// src/components/galaxy/PerformanceMonitor.tsx
interface PerformanceMonitorProps {
  onQualityDegrade: () => void;
  fpsThreshold: number; // 55fps
  consecutiveFrames: number; // 3
}

// src/components/galaxy/WebGLFallback.tsx
interface WebGLFallbackProps {
  message: string;
  fallbackRoute: string; // /grid
}

// src/components/galaxy/GalaxyLoader.tsx
interface GalaxyLoaderProps {
  progress: number; // 0-100
  estimatedTime: number; // seconds
}
```

**Implementation Notes:**
- Use Stats.js for FPS monitoring
- Track FPS in `useFrame` hook
- Trigger quality degradation callback
- WebGL detection with `canvas.getContext('webgl2')`
- Texture compression with KTX2Loader

**Success Criteria:**
- [ ] 60fps maintained on target hardware
- [ ] FPS monitoring shows real-time stats
- [ ] Automatic degradation triggers <55fps
- [ ] WebGL detection functional
- [ ] Fallback message displays correctly
- [ ] Loading state smooth (progress bar)

---

### Deliverable 22: Galaxy Entry Experience

**Description:** Cinematic entry sequence with loading screen and first-visit tutorial.

**Requirements:**
- Framer Motion page transition from Gallery Lobby:
  - Fade out lobby (300ms)
  - Fade in galaxy canvas (500ms)
- Loading screen with animated particle preview:
  - Teases 3D experience with 2D particle system
  - Shows loading progress (0-100%)
  - ETA calculated from download speed
  - Skippable with any key press
- Camera flythrough on first load:
  - Auto-rotates through emotion clusters
  - Pauses at interesting viewpoints (2-3s each)
  - Total duration: 30 seconds
  - Skippable with click, key, or scroll
- Ambient background music toggle (optional):
  - Royalty-free instrumental
  - Volume control slider
  - Mute button
  - Preference saved to localStorage
- Instructional overlay on first visit:
  - Explains controls (drag to rotate, scroll to zoom)
  - Shows keyboard shortcuts
  - Dismissible with "Got it" button
  - Never shows again (localStorage flag)
- Exit transition back to Gallery Lobby:
  - Smooth fade (500ms)
  - Preserves scroll position in lobby

**Component Structure:**
```typescript
// src/components/galaxy/GalaxyEntryTransition.tsx
interface EntryTransitionProps {
  onComplete: () => void;
}

// src/components/galaxy/GalaxyLoader.tsx (enhanced)
interface LoaderProps {
  progress: number;
  onSkip: () => void;
}

// src/components/galaxy/CameraFlythrough.tsx
interface FlythroughProps {
  clusters: Cluster[];
  duration: number; // 30s
  onComplete: () => void;
  onSkip: () => void;
}

// src/components/galaxy/InstructionalOverlay.tsx
interface InstructionalProps {
  onDismiss: () => void;
  showOnce: boolean; // localStorage flag
}
```

**Implementation Notes:**
- Use Framer Motion `AnimatePresence` for page transitions
- Loading screen with Canvas 2D particle animation
- Camera flythrough with GSAP timeline
- Music player with `<audio>` element
- Instructional overlay as modal (Radix UI Dialog)

**Success Criteria:**
- [ ] Page transition smooth (fade in/out)
- [ ] Loading screen displays progress
- [ ] Camera flythrough completes 30s tour
- [ ] Flythrough skippable with any input
- [ ] Instructional overlay shows on first visit only
- [ ] Exit transition preserves lobby state
- [ ] Background music toggle functional

---

### Phase 4 Quality Gates

**Design Checklist:**
- [ ] Cinematic entry sequence uses Framer Motion
- [ ] Loading state designed (NO generic spinners)
- [ ] Photo sprites optimized (512x512 max)
- [ ] Performance budget enforced (16ms frame budget)
- [ ] Graceful fallback to 2D grid
- [ ] Camera transitions use GSAP
- [ ] Exit transition animated (smooth fade)

**Performance Checklist:**
- [ ] 60fps with 500 photos on target hardware
- [ ] Fallback triggers on low-performance devices
- [ ] Loading <5s on 10 Mbps connection
- [ ] No memory leaks (10-minute continuous use)
- [ ] FPS monitor shows accurate stats

**Testing Checklist:**
- [ ] E2E test: Galaxy Lobby → Galaxy → Detail
- [ ] E2E test: Click cluster, verify camera movement
- [ ] Manual QA: Camera controls smooth and intuitive
- [ ] Performance test: 60fps validation on benchmark device
- [ ] Accessibility: Keyboard shortcuts functional

---

## 8. Technical Architecture

### Component Hierarchy

```
src/
├── app/
│   ├── page.tsx                     # Gallery Lobby (homepage)
│   ├── search/page.tsx              # Search Results
│   ├── grid/page.tsx                # Photo Grid
│   ├── collections/
│   │   ├── page.tsx                 # Collections Index
│   │   └── [slug]/page.tsx          # Collection Detail
│   ├── galaxy/page.tsx              # 3D Emotion Galaxy
│   └── api/
│       ├── stories/generate/route.ts
│       └── smugmug/
│           ├── albums/route.ts
│           └── photos/[key]/route.ts
│
├── components/
│   ├── common/
│   │   ├── Typography.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── ContextualCursor.tsx
│   ├── layout/
│   │   ├── Navigation.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Breadcrumb.tsx
│   ├── lobby/
│   │   ├── HeroSection.tsx
│   │   ├── FeaturedStories.tsx
│   │   ├── ExplorePathways.tsx
│   │   ├── ThematicCollections.tsx
│   │   └── SearchBar.tsx
│   ├── portfolio/
│   │   ├── PhotoGrid.tsx
│   │   ├── PhotoCard.tsx
│   │   ├── QualityStratifiedGrid.tsx
│   │   ├── QualityBadge.tsx
│   │   └── PlayTypeMorphGrid.tsx
│   ├── filters/
│   │   ├── FilterPanel.tsx
│   │   ├── MagneticFilterOrb.tsx
│   │   ├── AdvancedFilterPanel.tsx
│   │   ├── QualitySlider.tsx
│   │   └── EmotionChips.tsx
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   ├── SearchResults.tsx
│   │   └── FacetedFilters.tsx
│   ├── collections/
│   │   ├── CollectionCard.tsx
│   │   └── EmotionDistribution.tsx
│   ├── story/
│   │   ├── StoryViewer.tsx
│   │   └── EmotionTimeline.tsx
│   ├── galaxy/
│   │   ├── EmotionGalaxy.tsx
│   │   ├── PhotoSprite.tsx
│   │   ├── GalaxyControls.tsx
│   │   ├── Minimap.tsx
│   │   ├── ClusterLabel.tsx
│   │   ├── PerformanceMonitor.tsx
│   │   ├── WebGLFallback.tsx
│   │   └── GalaxyLoader.tsx
│   └── theming/
│       └── EmotionAmbienceProvider.tsx
│
├── lib/
│   ├── motion-tokens.ts             # Motion system + EMOTION_PALETTE
│   ├── supabase/
│   │   ├── client.ts                # Browser client (preserved)
│   │   └── server.ts                # Server client (preserved)
│   ├── smugmug/
│   │   ├── client.ts                # SmugMug OAuth (preserved)
│   │   └── common.ts                # Utilities (preserved)
│   └── cache/
│       └── smugmug-cache.ts         # Cache utilities (preserved)
│
├── hooks/
│   ├── useMagneticAttraction.ts
│   ├── useMousePosition.ts
│   ├── useTiltEffect.ts
│   ├── useRepulsion.ts
│   ├── useQualityStratification.ts
│   ├── useVisiblePhotos.ts
│   ├── useTimelineScrubber.ts
│   └── useMomentumScroll.ts
│
├── types/
│   ├── photo.ts                     # PhotoMetadata interface
│   ├── filters.ts                   # FilterState interface
│   ├── story.ts                     # NarrativeArc interface
│   └── smugmug.ts                   # SmugMug types (preserved)
│
├── styles/
│   └── globals.css                  # CSS custom properties
│
└── utils/
    ├── similarityScoring.ts
    └── emotionCalculation.ts
```

---

### Data Flow Architecture

**Photo Data Pipeline:**

1. **Source:** SmugMug API or Supabase database
2. **Enrichment:** AI vision analysis (Gemini/Claude/OpenAI)
3. **Storage:** Supabase photo_metadata table (12 dimensions)
4. **Query:** Next.js API routes → Supabase client
5. **Cache:** SWR client-side, Redis server-side
6. **Render:** React components with virtual scrolling

**User Journey Flow:**

```
Entry Point (Gallery Lobby / Direct Link)
    ↓
Search or Browse
    ↓
Filter / Sort
    ↓
Photo Grid (Quality-Stratified)
    ↓
Photo Detail View
    ↓
Actions (Download / Collection / Story)
```

**Story Generation Flow:**

```
Request Story (API call)
    ↓
Check Redis Cache (1-hour TTL)
    ↓
If cached: Return immediately
    ↓
If not cached:
    - Query Supabase for photos
    - Apply narrative detection algorithm
    - Calculate emotional curve
    - Cache result in Redis
    - Return NarrativeArc
```

---

### API Routes

**Photo Queries:**
- `GET /api/photos` - List photos with filters/sorting
- `GET /api/photos/[id]` - Single photo detail
- `GET /api/albums` - List albums
- `GET /api/albums/[key]/photos` - Photos in album

**Story Generation:**
- `POST /api/stories/generate` - Generate story for album/filters
- `GET /api/stories/[id]` - Retrieve cached story

**Search:**
- `GET /api/search?q=<query>` - Natural language search
- `POST /api/search/embeddings` - Generate embeddings for query

**Collections:**
- `GET /api/collections` - List thematic collections
- `GET /api/collections/[slug]` - Collection detail with photos

---

### State Management

**Server State (SWR):**
- Photo data from Supabase
- Story generation results
- Search results
- Collection listings

**Client State (React Hooks):**
- Filter selections (useState)
- Sort order (useState)
- UI interactions (hover, focus, active)
- Emotion Ambience (useContext)
- Virtual scroll position (useScroll)

**URL State:**
- Filter query params
- Sort order
- Search query
- Page/offset (if pagination)

**Local Storage:**
- Saved searches
- Emotion Ambience opt-out preference
- First-visit flags (tutorial shown)
- Background music preference

---

## 9. Implementation Notes

### Anti-Patterns to Avoid

**Visual Design:**
- Flat, generic card layouts with equal visual weight
- Emoji usage (Use Lucide React icons instead)
- Hard-coded hex values (Use CSS custom properties)
- Multiple typefaces (Inter Variable only)
- Low contrast text (Maintain WCAG AAA 7:1)

**Motion & Animation:**
- Random animation durations (Use motion tokens)
- Jarring page cuts (Use smooth transitions)
- Overly playful/bouncy animations (Professional aesthetic)
- Ignoring `prefers-reduced-motion`
- Animations below 60fps

**Component Design:**
- Over-implementing metaphors (Complex HUD, photography simulator UI)
- Pill buttons with excessive border radius
- Gradient backgrounds (Dated aesthetic)
- Underline-only inputs (Too minimal)
- Missing focus states (Accessibility)

**Data Presentation:**
- Listing metadata as text labels only
- Not visualizing AI data (No emotion halos, quality glow)
- Missing emotional curve graphs in story viewer
- Treating all photos with identical visual weight

---

### Common Mistakes & Corrections

**Mistake:** "I'll use emojis for play type icons (lightning bolt, shield, etc.)"
**Correction:** Use Lucide React icons: `<Zap />`, `<Shield />`, `<ArrowDown />`, `<Target />`, `<Circle />`

**Mistake:** "I'll create a flat three-column grid with no visual hierarchy"
**Correction:** Implement quality stratification (portfolio_worthy first), add emotion halos, apply quality gradient

**Mistake:** "I'll hard-code `#FFD700` for the gold accent"
**Correction:** Use CSS custom property: `var(--color-accent-gold)` or motion token: `EMOTION_PALETTE.triumph.primary`

**Mistake:** "I'll use a slide transition between pages"
**Correction:** Use subtle fade (300ms `easeOut`) for professional aesthetic

**Mistake:** "All photos will have the same hover effect"
**Correction:** Differentiate by emotion and quality (portfolio_worthy shimmer more, emotion drives glow color)

**Mistake:** "I'll present metadata as text labels below the photo"
**Correction:** Visualize as emotion halos, quality glow, composition overlays; use contextual cursor for on-demand display

---

### Best Practices

**Design System:**
- Always import from `motion-tokens.ts` for animations
- Use Typography component for all text
- Reference CSS custom properties for colors
- Test WCAG AAA contrast with color checker

**Performance:**
- Virtual scroll for any list >100 items
- Lazy load images with Next.js Image
- Use blurhash placeholders
- Monitor FPS with Chrome DevTools
- Optimize bundle size (<200KB gzipped)

**Accessibility:**
- Semantic HTML (header, nav, main, footer)
- ARIA landmarks and labels
- Keyboard navigation (Tab, Enter, Escape, Arrows)
- Focus management for modals
- Skip to content link
- Respect `prefers-reduced-motion`

**Motion Design:**
- Use Framer Motion for React animations
- Use GSAP for complex timelines
- Spring physics for natural feel
- Never hard-code timing values
- Always provide reduced-motion fallback

---

## 10. Testing Strategy

### End-to-End Tests (Playwright)

**User Journey: Explorer Path**
```typescript
test('Explorer journey: Lobby → Story → Galaxy', async ({ page }) => {
  // 1. Navigate to Gallery Lobby
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('The Living Archive');

  // 2. Click Featured Story
  await page.locator('[data-testid="featured-story"]').first().click();
  await expect(page).toHaveURL(/\/story\/*/);

  // 3. Verify Story Viewer loads
  await expect(page.locator('[data-testid="story-viewer"]')).toBeVisible();

  // 4. Navigate to 3D Galaxy
  await page.locator('[data-testid="explore-galaxy"]').click();
  await expect(page).toHaveURL('/galaxy');

  // 5. Verify Galaxy loads
  await expect(page.locator('canvas')).toBeVisible();
});
```

**User Journey: Seeker Path**
```typescript
test('Seeker journey: Search → Filter → Download', async ({ page }) => {
  // 1. Navigate to Gallery Lobby
  await page.goto('/');

  // 2. Perform natural language search
  await page.fill('[data-testid="search-input"]', 'triumphant celebration blocks');
  await page.press('[data-testid="search-input"]', 'Enter');

  // 3. Verify search results
  await expect(page).toHaveURL(/\/search\?q=*/);
  await expect(page.locator('[data-testid="photo-card"]')).toHaveCount.greaterThan(0);

  // 4. Apply filter
  await page.check('[data-testid="filter-portfolio-worthy"]');
  await page.waitForLoadState('networkidle');

  // 5. Click photo
  await page.locator('[data-testid="photo-card"]').first().click();

  // 6. Verify detail view
  await expect(page.locator('[data-testid="photo-detail"]')).toBeVisible();
});
```

**User Journey: Curator Path**
```typescript
test('Curator journey: Collections → Filter → Export', async ({ page }) => {
  // 1. Navigate to Collections
  await page.goto('/collections');

  // 2. Select Technical Excellence collection
  await page.click('[data-testid="collection-technical-excellence"]');

  // 3. Apply filters
  await page.check('[data-testid="filter-peak-intensity"]');
  await page.waitForLoadState('networkidle');

  // 4. Bulk select photos
  await page.click('[data-testid="select-all"]');

  // 5. Export as PDF
  const downloadPromise = page.waitForEvent('download');
  await page.click('[data-testid="export-pdf"]');
  const download = await downloadPromise;

  // 6. Verify PDF downloaded
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
});
```

---

### Visual Regression Tests

**Screenshots to Capture:**
- Gallery Lobby (desktop + mobile)
- Photo Grid (quality-stratified view)
- Search Results (with faceted filters)
- Story Viewer (with emotional curve)
- Collections Index
- 3D Galaxy (entry screen + loaded state)
- Filter Panel (all states: default, active, hover)
- Photo Card (default, hover, portfolio_worthy)

**Pixel Diff Threshold:** 0.2% (allows minor rendering differences)

```typescript
test('Visual regression: Gallery Lobby', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('gallery-lobby.png', {
    threshold: 0.2,
    maxDiffPixels: 100
  });
});
```

---

### Performance Tests

**Lighthouse CI Configuration:**
```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/grid",
        "http://localhost:3000/search",
        "http://localhost:3000/collections",
        "http://localhost:3000/galaxy"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```

**Animation Performance Test:**
```typescript
test('60fps animation validation', async ({ page }) => {
  // Enable FPS monitoring
  await page.goto('/', { waitUntil: 'networkidle' });

  // Start FPS recording
  const client = await page.context().newCDPSession(page);
  await client.send('Performance.enable');

  // Trigger animation (hover photo card)
  await page.hover('[data-testid="photo-card"]');

  // Wait for animation to complete
  await page.waitForTimeout(500);

  // Get FPS metrics
  const metrics = await client.send('Performance.getMetrics');
  const fps = metrics.metrics.find(m => m.name === 'Frames')?.value;

  // Assert 60fps maintained
  expect(fps).toBeGreaterThanOrEqual(58); // Allow 2fps tolerance
});
```

**Virtual Scrolling Performance:**
```typescript
test('Virtual scrolling with 10K photos', async ({ page }) => {
  // Load grid with 10,000 photos
  await page.goto('/grid?limit=10000');

  // Record scroll performance
  await page.evaluate(() => {
    performance.mark('scroll-start');
    window.scrollTo(0, 10000); // Scroll down
  });

  await page.waitForTimeout(1000);

  // Measure frame drops
  const frameDrop = await page.evaluate(() => {
    performance.mark('scroll-end');
    performance.measure('scroll', 'scroll-start', 'scroll-end');
    const measure = performance.getEntriesByName('scroll')[0];
    return measure.duration;
  });

  // Assert no significant jank
  expect(frameDrop).toBeLessThan(1000); // <1s for 10K px scroll
});
```

---

### Accessibility Tests

**Keyboard Navigation:**
```typescript
test('Keyboard navigation: Filter panel', async ({ page }) => {
  await page.goto('/grid');

  // Tab to first filter
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');

  // Verify focus on filter orb
  const focused = page.locator('[data-testid="filter-orb"]:focus');
  await expect(focused).toBeVisible();

  // Toggle filter with Space
  await page.keyboard.press('Space');

  // Verify filter applied
  const active = page.locator('[data-testid="filter-orb"][aria-pressed="true"]');
  await expect(active).toBeVisible();
});
```

**Screen Reader Testing (Manual):**
- VoiceOver (macOS): Test navigation landmarks, ARIA labels
- NVDA (Windows): Test form inputs, focus management
- Verify all interactive elements have descriptive labels
- Ensure images have meaningful alt text

---

## 11. Success Metrics

### Phase Completion Criteria

**Phase 1 Complete When:**
- Lighthouse scores 90+ across all metrics
- Virtual grid renders 10K photos without frame drops
- Design tokens documented and usable
- All filters functional with correct counts
- Database queries optimized (<100ms)

**Phase 2 Complete When:**
- Search returns results <500ms
- Story generation <3s for any narrative type
- Gallery Lobby loads <1.5s
- Quality stratification visible
- All 6 narrative algorithms functional

**Phase 3 Complete When:**
- All animations 60fps (FPS meter validated)
- Magnetic orbs attract within 100px
- Contextual cursor <16ms update rate
- Photo card physics smooth on 50+ cards
- Emotion Ambience transitions smoothly

**Phase 4 Complete When:**
- 60fps with 500 photos on target hardware
- Fallback triggers on low-performance devices
- Similarity clustering creates coherent groupings
- Camera controls smooth and intuitive
- Loading <5s on 10 Mbps connection

---

### Post-Launch Metrics

**Engagement:**
- Average session duration >5 minutes
- Photos viewed per session >50
- Return visitor rate >40% within 30 days
- 3D Galaxy entry rate >25% of Explorer visits

**Utility:**
- Time to find target photo <2 minutes (Seeker)
- Story generation usage >15% of sessions
- Collection export rate >10% of Curator sessions
- Search satisfaction >80% relevant results

**Technical:**
- Lighthouse Performance 90+ in production
- P95 page load time <2.5s
- Animation frame rate 60fps on 75th percentile devices
- 3D Galaxy 60fps on 50th percentile devices
- Fallback trigger rate <10%

**Portfolio Impact:**
- Bounce rate <30%
- Social shares >5% of sessions
- Portfolio referrals tracked via UTM
- Qualitative feedback from portfolio viewers

---

## 12. Appendix

### Photo Metadata Schema

```typescript
interface PhotoMetadata {
  // Identifiers
  photo_id: string;
  image_key: string;
  album_key: string;
  album_name: string;

  // Image URLs
  ImageUrl: string;          // Display size (600KB+)
  OriginalUrl: string;       // Full resolution
  ThumbnailUrl: string;      // Medium size (87KB)

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
  emotion: 'triumph' | 'focus' | 'intensity' | 'determination' | 'excitement' | 'serenity';
  composition: string;
  time_of_day: string;

  // Volleyball-specific
  play_type: 'attack' | 'block' | 'dig' | 'set' | 'serve' | 'pass' | 'celebration' | 'timeout' | null;
  action_intensity: 'low' | 'medium' | 'high' | 'peak';

  // Use cases
  use_cases: string[];

  // AI metadata
  ai_provider: 'gemini' | 'claude' | 'openai';
  ai_cost: number;
  enriched_at: string;
}
```

---

### Narrative Arc Schema

```typescript
interface NarrativeArc {
  arc_type: 'game_winning_rally' | 'player_highlight' | 'season_journey' |
           'comeback_story' | 'technical_excellence' | 'emotion_spectrum';
  photos: PhotoMetadata[];
  title: string;
  description: string;
  emotional_curve: number[];  // 0-10 intensity values, length = photos.length
  metadata: {
    generated_at: string;
    cache_duration: number;
    album_key?: string;
    filter_params?: FilterState;
  };
}
```

---

### Filter State Schema

```typescript
interface FilterState {
  portfolio_worthy?: boolean;
  print_ready?: boolean;
  social_media_optimized?: boolean;
  emotions?: Emotion[];
  play_types?: PlayType[];
  composition_patterns?: CompositionPattern[];
  action_intensity?: ActionIntensity[];
  quality_min?: number;  // 0-10
  quality_max?: number;  // 0-10
  time_of_day?: TimeOfDay[];
  sort_by?: 'quality' | 'chronological' | 'emotion' | 'play_type';
  sort_order?: 'asc' | 'desc';
}
```

---

### Environment Variables

**Required for Development:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

**Optional for Full Features:**
```bash
# SmugMug
SMUGMUG_API_KEY=
SMUGMUG_API_SECRET=
SMUGMUG_ACCESS_TOKEN=
SMUGMUG_ACCESS_TOKEN_SECRET=
SMUGMUG_USERNAME=

# AI Vision
GOOGLE_API_KEY=              # Gemini Flash (recommended)
ANTHROPIC_API_KEY=           # Claude (alternative)
OPENAI_API_KEY=              # GPT-4 Vision (alternative)

# Cost Control
GEMINI_MODEL=models/gemini-1.5-flash-002
SMUGMUG_IMAGE_SIZE=M        # Medium = 85% cost savings
```

---

### Tech Stack Summary

**Frontend:**
- Next.js 15 (App Router, React 19)
- TypeScript 5.8 (strict mode)
- Tailwind CSS 4 (design tokens)
- Framer Motion 12 (UI animations)
- GSAP 3 (timelines, scrubbing)
- Three.js + @react-three/fiber (3D Galaxy)
- @tanstack/react-virtual (virtual scrolling)
- SWR 2 (data fetching)

**Backend (Preserved):**
- Supabase (PostgreSQL, pgvector)
- SmugMug API (OAuth 1.0a)
- Redis (Upstash, caching)
- AI Vision APIs (Gemini/Claude/OpenAI)

**Testing:**
- Playwright (E2E + visual regression)
- Lighthouse CI (performance audits)

**Deployment:**
- Vercel (hosting, edge functions)
- GitHub Actions (CI/CD)

---

### Reference Documents

**Product Documentation:**
- `agent-os/product/mission.md` - Vision and personas
- `agent-os/product/roadmap.md` - Phased implementation plan
- `agent-os/product/tech-stack.md` - Complete technology stack
- `agent-os/product/design-brief.md` - Aesthetic and interaction principles

**Backend Preservation:**
- `V1_BACKEND_PRESERVATION.md` - Migration guide
- `agent-os/CURRENT_STATUS.md` - v1 implementation status

**Development:**
- `CLAUDE.md` - Development workflow and commands
- `README.md` - Quick start guide
- `.env.example` - Environment variable template

---

**End of Specification**

This specification provides comprehensive guidance for implementing The Living Archive v2 frontend. Follow the phased approach, adhere to Design Brief principles, and validate quality gates at each phase. The result will be an award-winning experience that showcases both photographic artistry and digital design mastery.
