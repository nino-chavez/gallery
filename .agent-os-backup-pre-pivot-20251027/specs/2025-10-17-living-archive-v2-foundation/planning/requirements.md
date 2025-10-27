# Requirements: Living Archive V2 Foundation

**Date:** 2025-10-17
**Status:** Requirements Gathered from Product Documentation

---

## Project Overview

**The Living Archive** is a complete frontend reimplementation of an AI-enriched sports photography gallery platform. The v2 project preserves all v1 backend infrastructure (Supabase, SmugMug, AI enrichment) and reimplements only the frontend following comprehensive design principles.

**Core Mission:** Transform 20,000 sports photos from a static library into a Living Archive—a dynamic, intelligent exploration platform with cinematic user experiences.

---

## User Personas (Design Requirements)

### 1. Alex, The Explorer
- **Role:** Creative professional, photographer browsing for inspiration
- **Journey:** Gallery Lobby → Featured Stories → 3D Emotion Galaxy
- **Design Needs:** Visually rich, immersive, "wow" moments
- **Key Features:** Cinematic transitions, emotion ambience, serendipitous discovery

### 2. Maria, The Seeker
- **Role:** Athlete/parent finding specific photos quickly
- **Journey:** Search bar → Quality-stratified grid → Detail view
- **Design Needs:** Ruthlessly efficient, powerful filtering
- **Key Features:** Natural language search, contextual cursor, quality indicators

### 3. David, The Curator
- **Role:** Coach/manager building collections for recruiting/marketing
- **Journey:** Thematic Collections → Bulk selection → PDF export
- **Design Needs:** Utilitarian tools for gathering/organizing
- **Key Features:** Multi-select, batch actions, export controls

---

## Design Principles (Non-Negotiable)

**From Design Brief (agent-os/product/design-brief.md):**

### Visual & Aesthetic
1. **NO EMOJIS IN UI** - Lucide React icons exclusively
2. **NO FLAT GENERIC LAYOUTS** - Quality stratification required
3. **USE DESIGN TOKENS EXCLUSIVELY** - No hard-coded values
4. **TYPOGRAPHY COMPONENT REQUIRED** - Semantic type scale
5. **INTER VARIABLE FONT ONLY** - No multiple typefaces

### Motion & Interaction
6. **MOTION TOKENS REQUIRED** - No arbitrary durations
7. **60FPS NON-NEGOTIABLE** - All animations validated
8. **CINEMATIC TRANSITIONS** - No jarring cuts
9. **PHYSICS-BASED INTERACTIONS** - Spring animations
10. **RESPECT REDUCED MOTION** - Fallbacks required

### Data Visualization
11. **EMOTION_PALETTE IS CORE SYSTEM** - Not just accents
12. **METADATA AS VISUAL ELEMENTS** - Transform data into design
13. **PROGRESSIVE DISCLOSURE** - Contextual information reveal

### Component Design
14. **LUCIDE REACT ICONS ONLY** - No mixing libraries
15. **CONSISTENT SPACING SCALE** - From design tokens
16. **WCAG AAA CONTRAST** - 7:1 minimum for all text

---

## Technical Requirements

### Performance Targets
- **Page Load:** <2 seconds for initial render
- **Animations:** 60fps maintained at all times
- **Virtual Scrolling:** Support 10,000+ photos without degradation
- **Lighthouse Scores:** 90+ across all metrics
- **Bundle Size:** Main bundle <200KB gzipped

### Technology Stack
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript 5.8
- **Styling:** Tailwind CSS 4 with design tokens
- **Animation:** Framer Motion (UI), GSAP (timelines), Three.js (3D)
- **Data Fetching:** SWR, @tanstack/react-virtual
- **Testing:** Playwright (E2E + visual regression)
- **Package Manager:** pnpm (required)

### Backend Integration (Already Migrated)
- **Database:** Supabase PostgreSQL with 12 semantic dimensions
- **API:** SmugMug OAuth integration
- **Data:** 20,000+ enriched photos, 200+ albums
- **Scripts:** AI enrichment pipeline (Gemini/Claude/OpenAI)

---

## Phased Implementation Requirements

### Phase 1: Unbreakable Foundation (2-3 weeks)

**Deliverables:**
1. Design System & Motion Tokens
   - Inter Variable font, charcoal/gold palette
   - Spring configs (gentle/snappy/bouncy)
   - Emotion palette (6 emotions with colors/gradients)
   - Spacing/sizing scales, WCAG AAA contrast

2. Database Schema & AI Enrichment Pipeline
   - Supabase integration verified
   - Photo metadata table accessible
   - 12 semantic dimensions available

3. Core Photo Grid with Virtual Scrolling
   - @tanstack/react-virtual implementation
   - 300px row height, 5-row overscan
   - Adaptive columns (1-6 based on viewport)
   - Next.js Image + blurhash placeholders
   - 10,000+ photos at 60fps

4. Basic Filtering & Sorting System
   - Multi-dimensional filters (quality, emotion, play type)
   - Real-time photo counts
   - URL query param persistence
   - Sort modes (Quality/Chronological/Emotion/Play Type)

5. Navigation & Layout Structure
   - Global navigation
   - Responsive layout
   - Accessibility features (skip to content, ARIA, keyboard nav)

**Success Criteria:**
- Lighthouse 90+ scores
- Virtual grid renders 10K photos without frame drops
- Design tokens documented
- All filters functional
- Database queries optimized

### Phase 2: Intelligent Interface (2-3 weeks)

**Deliverables:**
6. Gallery Lobby (Homepage)
   - Hero section with tagline
   - Featured Stories carousel (3-5 AI narratives)
   - Explore Pathways grid (3D Galaxy, Timeline, Collections)
   - Prominent search bar
   - Thematic Collections section
   - Framer Motion page transitions

7. Natural Language Search
   - Pattern matching (emotion + play type queries)
   - Query parser for filters
   - Faceted filtering sidebar
   - Query suggestions
   - Saved searches (localStorage)

8. Quality-Stratified Grid View
   - Portfolio_worthy prioritization
   - Gold badges, shimmer effects
   - Quality gradient mode (brightness/blur)
   - Dimming for low-quality
   - "Jump to Portfolio" button

9. AI Story Curation Engine
   - 6 narrative arc algorithms:
     - Game-Winning Rally
     - Player Highlight Reel
     - Season Journey
     - Comeback Story
     - Technical Excellence
     - Emotion Spectrum
   - <3s generation time
   - Emotional curve visualization

10. Thematic Collections
    - Persistent collections (Technical Excellence, Peak Moments, etc.)
    - Lazy generation (3-5s background job)
    - Preview thumbnails with photo counts
    - Emotion distribution visualizations

11. Advanced Filter Interface
    - Collapsible sections
    - Range sliders for quality scores
    - Emotion chips with color-coding
    - Play type filter with icons
    - Composition pattern multi-select
    - Time of day filter

**Success Criteria:**
- Search returns results <500ms
- Story generation <3s
- Gallery Lobby loads <1.5s
- Quality stratification visible
- All 6 narrative algorithms functional

### Phase 3: Experiential Layer (3-4 weeks)

**Deliverables:**
12. Magnetic Filter Orbs
    - Framer Motion spring physics
    - 100px attraction radius
    - Cursor tracking with velocity prediction
    - Haptic-like feedback curves
    - Accessibility support

13. Contextual Cursor
    - GSAP mouse following (200ms ease)
    - Morphs color by emotion (triumph=gold, intensity=red)
    - Metadata tooltip (quality, composition, play type)
    - Hides on touch devices
    - Respects prefers-reduced-motion

14. 3D Photo Card Physics
    - Hover tilt (mouse position, max 15° rotation)
    - Lift transformation (translateZ 20px)
    - Cursor repulsion (150px radius)
    - Emotion-based glow intensity
    - Spring animations (stiffness 400, damping 25)

15. Emotion Ambience (Adaptive Theming)
    - UI shifts to match dominant photo emotion
    - Intersection Observer tracks visible photos
    - Smooth 800ms transitions
    - Applies to orbs, buttons, highlights
    - Opt-out toggle

16. Emotion Timeline Scrubber
    - GSAP Draggable for smooth scrubbing
    - Emotional curve graph (color-coded segments)
    - Snap-to-boundary at emotion transitions
    - Click-to-seek
    - Keyboard controls (arrows, space, escape)

17. Momentum Scroll with Smart Snap
    - Framer Motion useScroll + useSpring
    - Velocity detection (500px/s triggers snap)
    - Quality-threshold snap (quality >= 8)
    - Progressive friction dampening
    - Visual snap indicators

18. Play Type Morphing Grid
    - LayoutGroup for shared layout animations
    - AnimatePresence with popLayout
    - 300ms stagger on entrance
    - Play type badges with icons
    - Spring physics on filter changes

**Success Criteria:**
- All animations 60fps (FPS meter validated)
- Magnetic orbs attract within 100px
- Contextual cursor <16ms update rate
- Photo card physics smooth on 50+ cards
- Emotion Ambience transitions smoothly

### Phase 4: Signature Moment (2-3 weeks)

**Deliverables:**
19. 3D Emotion Galaxy Core
    - Three.js + React Three Fiber
    - 500 curated photos (portfolio_worthy subset)
    - Similarity scoring (emotion 30%, play type 25%, composition 15%)
    - Lerp-based camera transitions
    - Depth-of-field blur
    - Instanced rendering for performance

20. Galaxy Interaction & Navigation
    - Raycaster click detection
    - Hover states (scale 1.2x + glow)
    - Camera animations (GSAP)
    - Minimap overlay
    - Cluster labels
    - "Fly to Cluster" buttons

21. Performance Optimization & Fallback
    - 16ms frame budget (60fps)
    - Texture optimization (512x512 max)
    - Frustum culling
    - Level-of-detail system
    - Auto quality degradation <55fps
    - WebGL fallback to 2D grid

22. Galaxy Entry Experience
    - Framer Motion page transition
    - Loading screen with particle preview
    - Camera flythrough (30s, skippable)
    - Instructional overlay (first visit)
    - Exit transition with fade

**Success Criteria:**
- 60fps with 500 photos on 2019 MacBook Pro
- Fallback triggers on low-performance devices
- Similarity clustering creates coherent groupings
- Camera controls smooth and intuitive
- Loading <5s on 10 Mbps connection

---

## Quality Gates

**Before marking any phase complete:**

### Design Quality Checklist
- [ ] No emojis used (Lucide icons only)
- [ ] No hard-coded colors (design tokens only)
- [ ] Typography component used for all text
- [ ] Motion tokens used for all animations
- [ ] 60fps maintained (Performance tab validation)
- [ ] EMOTION_PALETTE integrated (halos, ambience, timeline, cursor)
- [ ] Visual hierarchy clear (focal points, 60%+ whitespace)
- [ ] WCAG AAA contrast (7:1 minimum)
- [ ] Reduced motion fallback (prefers-reduced-motion)
- [ ] AI metadata visualized (not just text)

### Performance Checklist
- [ ] Lighthouse Performance 90+
- [ ] Lighthouse Accessibility 90+
- [ ] Lighthouse Best Practices 90+
- [ ] Lighthouse SEO 90+
- [ ] Page load <2s
- [ ] Animations locked at 60fps
- [ ] Virtual scrolling handles 10K+ photos
- [ ] Bundle size <200KB gzipped

### Testing Checklist
- [ ] Playwright E2E tests written
- [ ] Visual regression tests updated
- [ ] User journey tests pass (Explorer, Seeker, Curator)
- [ ] Manual QA for motion interactions
- [ ] Accessibility tested (VoiceOver/NVDA)

---

## Anti-Patterns to Avoid

**From Design Brief:**
- ❌ Flat, generic card layouts with equal visual weight
- ❌ Emoji usage (⚡ 🛡️ 🤿 ❌)
- ❌ Hard-coded hex values
- ❌ Multiple typefaces
- ❌ Random animation durations
- ❌ Jarring page cuts
- ❌ Metadata as text labels only
- ❌ Low contrast (failing WCAG AA)
- ❌ Missing reduced motion fallbacks
- ❌ Ignoring EMOTION_PALETTE

---

## Data Schema (Available from Backend)

**Photo Metadata Structure:**
```typescript
interface PhotoMetadata {
  photo_id: string;
  image_key: string;
  album_key: string;
  album_name: string;

  // Image URLs
  ImageUrl: string;
  OriginalUrl: string;
  ThumbnailUrl: string;

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

**20,000+ photos available with all fields populated.**

---

## Reference Documents

- **Design Brief:** `agent-os/product/design-brief.md` (19KB comprehensive principles)
- **Product Mission:** `agent-os/product/mission.md` (22KB vision + personas)
- **Product Roadmap:** `agent-os/product/roadmap.md` (24KB phased plan)
- **Tech Stack:** `agent-os/product/tech-stack.md` (19KB complete stack)
- **Backend Migration:** `V1_BACKEND_PRESERVATION.md` (migration complete)
- **Development Guide:** `CLAUDE.md` (updated with design principles)

---

## Constraints

1. **Backend is Fixed:** Do not modify v1 backend code (Supabase, SmugMug, enrichment)
2. **Design Brief is Law:** All implementation must follow non-negotiable principles
3. **Performance is Non-Negotiable:** 60fps and <2s loads required
4. **Incremental Phases:** Complete Phase N before starting Phase N+1
5. **Quality Gates:** All checklists must pass before phase completion
6. **Package Manager:** pnpm only (not npm or yarn)

---

## Success Metrics

**The spec is successful when:**
1. All 4 phases implemented with quality gates passed
2. Design Brief principles followed throughout
3. Performance targets met (60fps, <2s loads, Lighthouse 90+)
4. Three user personas have complete, tested journeys
5. 20,000+ photos browseable at 60fps
6. Award-winning aesthetic matching Linear/Apple quality bar

**Timeline:** 10-12 weeks (2-3 weeks per phase)
**Risk Mitigation:** Quality gates prevent shipping incomplete features
