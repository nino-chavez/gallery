# Product Roadmap

## Overview

**Last Updated:** October 18, 2025

This roadmap outlines the phased development of **The Living Archive**, organized into 4 strategic phases that build incrementally from foundation to signature experiences. Each phase includes specific deliverables, success criteria, and persona alignment.

**Current Status:** Phase 1 ✅ Complete | Phase 2 🚧 In Progress (Gallery Lobby active)

### Market Validation (October 2025)

Competitive analysis of 500px, Flickr, and SmugMug confirmed our strategic differentiation:
- ✅ **Emotion-first discovery** doesn't exist in competitor galleries
- ✅ **AI narrative detection** (game-winning rallies, comeback stories) is unique
- ✅ **Quality stratification** with visual indicators not available elsewhere
- ✅ **Physics-based interactions** differentiate from static grid UX

**Validated Implementation:** `/explore` page with 6 emotion selectors + 5 curated collections proves market gap. Story Curation Engine (6 narrative algorithms) further establishes unique position.

**Strategic Priority:** Gallery Lobby as hub - Featured Stories carousel creates immediate "wow" moment while serving all 3 personas (Explorers, Seekers, Curators).

**Development Strategy:**
- Build foundation systems first (design tokens, data architecture, core interactions)
- Layer intelligent features on solid infrastructure (search, AI curation, collections)
- Add experiential polish incrementally (motion, theming, micro-interactions)
- Deliver signature 3D experience last with strict performance budget

**Performance Constraints:**
- Maintain 60fps animations throughout all phases
- Page load times under 2 seconds
- Virtual scrolling support for 10,000+ photos
- Lighthouse scores 90+ across all metrics

**Design Quality Gates:**
- All phases must adhere to Design Brief (`agent-os/product/design-brief.md`)
- No emojis in UI (Lucide React icons only)
- No flat generic layouts (quality stratification required)
- Design tokens exclusively (no hard-coded colors/spacing)
- Motion tokens for all animations (no arbitrary durations)
- WCAG AAA contrast (7:1 minimum for all text)

**Reference:** See `agent-os/product/design-brief.md` for comprehensive aesthetic principles, anti-patterns, and quality checklists.

---

## Phase 1: Unbreakable Foundation ✅ **COMPLETE**

**Duration:** 2-3 weeks | **Persona Focus:** All users benefit from robust foundation | **Status:** ✅ Shipped October 2025

Build the core infrastructure and design system that supports all future features. Establish technical excellence, visual identity, and data architecture that won't require refactoring.

### Deliverables

1. [x] **Design System & Motion Tokens** — Implement comprehensive design token system with Digital Gallery aesthetic (Inter Variable font, charcoal/warm gray palette, accent gold), motion tokens (spring configs for gentle/snappy/bouncy), emotion palette (6 emotions with primary colors, gradients, glow effects), play type icons, spacing/sizing scales, WCAG AAA contrast ratios. `S`

2. [x] **Database Schema & AI Enrichment Pipeline** — Create Supabase PostgreSQL schema with photo_metadata table (12 semantic dimensions: quality scores, emotions, composition, play types, action intensity, use cases), stories table for AI-generated narratives, indexes on portfolio_worthy/play_type/emotion, pgvector extension for semantic search. Implement AI enrichment script using Gemini Vision API with SQLite staging cache, cost tracking ($0.003-0.015 per photo), batch processing with progress bars. `M`

3. [x] **Core Photo Grid with Virtual Scrolling** — Build performant photo grid using @tanstack/react-virtual with 300px estimated row height, 5-row overscan, adaptive columns (1-6 based on viewport), Next.js Image component integration with automatic WebP/AVIF format selection, blurhash placeholder generation, Intersection Observer lazy loading (200px root margin), responsive srcset with 6 breakpoints. Grid supports 10,000+ photos at 60fps. `M`

4. [x] **Basic Filtering & Sorting System** — Implement multi-dimensional filter UI with checkboxes for portfolio_worthy, print_ready, social_media_optimized, emotion types (6 options), play types (7 options), composition patterns, action intensity levels. Real-time photo count updates, filter combination logic (AND operators), persistent state in URL query params, one-click clear all. Sort modes: Quality Descending (default), Chronological, Emotion Clusters, Play Type Groups. `M`

5. [x] **Navigation & Layout Structure** — Create app shell with global navigation (Gallery Lobby link, Search icon, Collections dropdown, user menu placeholder), responsive layout with mobile hamburger menu, footer with photographer branding, breadcrumb trail for deep navigation, accessibility features (skip to content, ARIA landmarks, keyboard navigation), dark mode toggle (future-proofing for theming). `S`

**Success Criteria:**
- Lighthouse scores 90+ (Performance, Accessibility, Best Practices, SEO)
- Virtual grid renders 10,000 photos without frame drops
- Design tokens exported and documented in Storybook
- All filters functional with correct photo counts
- Database schema supports all planned metadata dimensions
- AI enrichment processes 1,000 photos in under 10 minutes

**Design Quality Checklist:**
- [ ] Inter Variable font loaded and applied globally (no system fonts)
- [ ] All colors from design tokens (CSS custom properties, no hard-coded hex)
- [ ] Typography component used for all text (no raw `<p>` or `<span>`)
- [ ] Lucide React icons exclusively (NO emojis: ❌ ⚡ 🛡️ 🤿)
- [ ] Motion tokens used for all transitions (from `src/lib/motion-tokens.ts`)
- [ ] WCAG AAA contrast verified (7:1 minimum, use contrast checker)
- [ ] Spacing from design scale (4/8/16/24/32/48px, no arbitrary values)
- [ ] 60fps validated (Chrome DevTools Performance tab)

**Persona Value:**
- **Explorers:** Clean, professional aesthetic establishes credibility
- **Seekers:** Functional filtering enables basic discovery
- **Curators:** Performance ensures smooth browsing at scale

---

## Phase 2: Intelligent Interface 🚧 **IN PROGRESS**

**Duration:** 2-3 weeks | **Persona Focus:** Seekers (primary), Curators (secondary) | **Status:** 🚧 Active Development

Layer intelligent discovery features on the foundation. Enable powerful search, quality-stratified browsing, and AI-curated collections that help users find exceptional content quickly.

**Completed So Far:**
- ✅ `/explore` page with emotion-driven discovery (6 emotions, 5 collections)
- ✅ AI Story Curation Engine (6 narrative arc algorithms)
- ✅ `/api/stories` endpoint (generates narratives in <3s)
- ✅ Gallery Lobby (Homepage) with Featured Stories carousel and Explore Pathways
- ✅ Story Viewer (`/stories/[id]`) with cinematic auto-play and emotional curve timeline
- ✅ Quality-Stratified Grid View (`/gallery`) with portfolio prioritization

**Current Priority:** Natural Language Search + Advanced Filter Interface

### Deliverables

6. [x] **Gallery Lobby (Homepage)** ✅ **COMPLETE** — Multi-entry point homepage with hero section (site tagline, search bar, stats), Featured Stories carousel showing 3 AI-generated narratives with preview thumbnails, photo counts, confidence badges, Explore Pathways grid (Emotion Discovery, Gallery Browse, Smart Search tiles with hover effects), clickable story cards linking to `/stories/[id]`, responsive layout, Framer Motion animations. Implemented at `/src/app/page.tsx`. `L`

7. [ ] **Natural Language Search** — Implement semantic search system with pattern-matching for common queries (emotion + play type combinations like "triumphant celebration blocks"), query parser extracting filters from natural language ("show me peak intensity attack shots" → filters: play_type=attack, action_intensity=peak), Pinecone vector database integration for embeddings-based similarity search, faceted filtering sidebar showing applied filters with one-click removal, query suggestions dropdown based on available metadata, saved searches stored in localStorage, search results page with quality-stratified grid. `M`

7.5. [x] **Story Viewer** ✅ **COMPLETE** — Cinematic full-screen story viewer at `/stories/[id]` with auto-play (3s intervals), AnimatePresence transitions between photos (fade + scale), emotional curve timeline with SVG visualization, clickable emotion points for jumping, play/pause/prev/next controls, keyboard navigation (arrows, space, escape), photo metadata overlay (emotion badge, intensity, counter), progress bar, glassmorphism story header with type badge. Implemented at `/src/app/stories/[id]/page.tsx`. `M`

8. [x] **Quality-Stratified Grid View** ✅ **COMPLETE** — Quality-stratified photo grid at `/gallery` with portfolio_worthy prioritization (2x2 larger cards), visual quality indicators (gold star badge, emotion halos with glow effects), quality-based dimming for low-quality photos (opacity 60%, blur(2px) for score < 5), dynamic glow intensity based on quality score, hover metadata overlay with quality progress bar, responsive grid (1/2/4 columns), filter controls (portfolio toggle, quality slider, emotion dropdown). Implemented at `/src/app/gallery/page.tsx`. `M`

9. [x] **AI Story Curation Engine** ✅ **COMPLETE** — Backend story detection system implementing 6 narrative arc algorithms: Game-Winning Rally (final 5 min + peak intensity + triumph/intensity, min 3 photos), Player Highlight Reel (top 10 portfolio shots per athlete, sorted by quality), Season Journey (one photo per game, chronological), Comeback Story (emotion pattern: determination → intensity → triumph, min 4 photos), Technical Excellence (sharpness >= 9 + composition >= 9, min 8 photos), Emotion Spectrum (4+ emotions in single game/event). Each detection function returns NarrativeArc object with photos, title, description, emotional curve data. Story generation API endpoint with caching (Redis, 1-hour TTL). `L`

10. [ ] **Thematic Collections** — Create persistent collections based on story detection algorithms (Technical Excellence, Peak Moments, Emotional Journeys, Player Spotlights), lazy generation on first visit (3-5s background job with loading state), collection index page showing all collections with preview thumbnails (4-photo grid), photo counts, emotion distribution visualizations, one-click access from Gallery Lobby, collection detail pages with full photo grid, filtering, and export options. Collections regenerate daily via cron job. `M`

11. [ ] **Advanced Filter Interface** — Redesign filter system with collapsible sections (Quality Metrics, Emotion & Mood, Play Types, Composition, Technical), range sliders for quality scores (sharpness, exposure, composition, emotional impact with 0-10 scale), emotion filter chips with color-coded backgrounds (using emotion palette), play type filter with icons (⚡ attack, 🛡️ block, etc.), composition pattern multi-select (rule of thirds, leading lines, framing, symmetry), time of day filter (dawn, morning, afternoon, golden hour, evening, night), filter presets dropdown (Portfolio Shots, Social Ready, Print Ready, Peak Moments). `M`

**Success Criteria:**
- Natural language search returns relevant results in <500ms
- Story generation completes in under 3 seconds for any narrative type
- Gallery Lobby loads in <1.5s with hero images optimized
- Quality stratification visibly prioritizes best photos
- All 6 narrative arc detection algorithms functional with test coverage
- Thematic Collections generate successfully for 200+ albums

**Design Quality Checklist:**
- [ ] Gallery Lobby has clear focal point with 60%+ whitespace
- [ ] Quality-stratified grid implemented (portfolio_worthy photos prioritized)
- [ ] Emotion halos visible on photos (colored glow per emotion)
- [ ] Quality gradient applied (dimming/blur for low-quality photos)
- [ ] NO emojis in filter UI (use Lucide icons: `<Zap />`, `<Shield />`)
- [ ] Search interface uses Typography component for all text
- [ ] Cinematic transitions between views (Framer Motion layoutId morphing)
- [ ] All animations from motion tokens (no arbitrary duration values)

**Persona Value:**
- **Seekers:** Natural language search + quality stratification drastically reduces time to find best photos
- **Curators:** Thematic Collections provide pre-built starting points for recruiting packages and highlights
- **Explorers:** Gallery Lobby offers multiple engaging entry points with visual intrigue

---

## Phase 3: Experiential Layer

**Duration:** 3-4 weeks | **Persona Focus:** Explorers (primary), All users (secondary)

Add signature motion interactions, visual theming, and micro-interactions that create "wow" moments and showcase design mastery. Transform functional interface into memorable experience.

### Deliverables

12. [ ] **Magnetic Filter Orbs** — Replace checkbox filters with physics-based orbs using Framer Motion spring animations (stiffness: 300, damping: 30), 100px magnetic attraction radius with real-time strength calculation (inverse square law), cursor tracking with velocity-based prediction, haptic-like feedback curves (ease-out acceleration), active state with glow effect and scale transform, accessibility support (keyboard Tab navigation, Space to toggle, ARIA labels), mobile touch optimization (larger tap targets, simplified physics). Component: MagneticFilterOrb.tsx with useMagneticAttraction hook. `M`

13. [ ] **Contextual Cursor** — Implement custom cursor system using GSAP with smooth mouse following (200ms ease), cursor morphs size/color based on hovering element (photo emotion metadata determines color from palette: triumph=gold, intensity=red, focus=blue), metadata preview tooltip displays quality score, composition type, play type icon without clicks, cursor hides on touch devices, respects prefers-reduced-motion (falls back to default cursor), z-index management to stay above all content. Component: ContextualCursor.tsx with useMousePosition hook. `S`

14. [ ] **3D Photo Card Physics** — Add photo card interactions using Framer Motion with hover tilt effect (calculate mouse position relative to card center, apply rotateX/rotateY transforms, max 15deg rotation), lift transformation on hover (translateZ 20px + box-shadow expansion), cursor repulsion force field (150px radius pushes adjacent cards away using spring physics), emotion-based glow intensity (portfolio_worthy photos get animated shimmer box-shadow), smooth spring animations for all transforms (stiffness: 400, damping: 25), GPU acceleration with will-change CSS property. Component: PhotoCard.tsx with useTiltEffect and useRepulsion hooks. `M`

15. [ ] **Emotion Ambience (Adaptive Theming)** — Build dynamic theming system that shifts UI colors to match dominant photo emotion in viewport, Intersection Observer tracks visible photos, calculates dominant emotion from visible set (weighted by quality score), smoothly transitions UI accent colors (filter orbs, buttons, highlights, borders) to emotion palette color over 800ms, background ambient lighting effects (subtle gradient overlays), applies to contextual cursor, magnetic orbs, card glows, opt-out toggle in settings for accessibility, CSS custom properties for theme injection, React Context for theme state management. Component: EmotionAmbienceProvider.tsx with useVisiblePhotos hook. `L`

16. [ ] **Emotion Timeline Scrubber** — Create timeline navigation component using GSAP Draggable plugin for smooth scrubbing, displays emotional curve graph with color-coded segments (matches emotion palette), snap-to-boundary logic at emotion transition points, playback progress indicator (animated fill), click-to-seek functionality (jump to timestamp), keyboard controls (arrows to scrub, space to pause, escape to close), auto-advance mode with configurable timing (2-5 seconds per photo), tooltips showing emotion labels and timestamps on hover. Integrates with story viewer for narrative navigation. Component: EmotionTimeline.tsx. `M`

17. [ ] **Momentum Scroll with Smart Snap** — Enhance scrolling with Framer Motion useScroll + useSpring for physics-based inertia, velocity detection monitors scroll speed (threshold: 500px/s triggers snap), quality-threshold snap logic identifies portfolio_worthy photos (quality >= 8) in viewport and auto-centers them, progressive friction dampening as velocity decreases, visual snap indicators (subtle glow highlights snap targets), works with virtual scrolling system, respects prefers-reduced-motion (disables snap behavior), mobile optimization with touch gesture integration (@use-gesture/react). Hook: useMomentumScroll.ts. `M`

18. [ ] **Play Type Morphing Grid** — Implement grid filtering animation using Framer Motion LayoutGroup for shared layout animations, AnimatePresence with popLayout mode for smooth exit animations, 300ms stagger on grid item entrance (calculated from index), play type badge indicators with icons (⚡ attack, 🛡️ block, 🤿 dig, 🎯 set, 🎾 serve, 🎉 celebration), layout recalculation on filter changes with spring physics, maintains virtual scrolling performance during animations, exit animations (scale + opacity fade), component keys based on photo IDs for proper animation tracking. Component: PlayTypeMorphGrid.tsx. `S`

**Success Criteria:**
- All animations maintain 60fps (validated with Chrome DevTools FPS meter)
- Magnetic orbs attract cursor within 100px with smooth spring physics
- Contextual cursor displays metadata without latency (<16ms update rate)
- Photo card physics work smoothly on grids with 50+ visible cards
- Emotion Ambience transitions without jarring color shifts
- Timeline scrubber integrates with story viewer seamlessly
- Momentum scroll snaps to quality photos without disrupting user intent
- Play type morphing completes in <500ms for filter changes

**Design Quality Checklist:**
- [ ] All animations use motion tokens (MOTION.spring.gentle/snappy/bouncy)
- [ ] 60fps maintained across all interactions (FPS meter validation)
- [ ] Contextual cursor morphs color based on emotion (triumph=gold, intensity=red)
- [ ] Photo cards have 3D tilt + lift on hover (max 15° rotation, 20px translateZ)
- [ ] Emotion Ambience shifts UI colors smoothly (800ms transition)
- [ ] EMOTION_PALETTE integrated (halos, ambience, timeline, cursor)
- [ ] `prefers-reduced-motion` respected (instant or fade-only fallbacks)
- [ ] NO hard-coded animation durations (all from motion-tokens.ts)

**Persona Value:**
- **Explorers:** Signature interactions create memorable "wow" moments, showcase design sophistication, encourage deeper exploration through delightful friction
- **Seekers:** Contextual cursor provides instant metadata without clicks, saving time
- **Curators:** Visual feedback (glows, quality indicators) helps quickly identify best shots

---

## Phase 4: Signature Moment (3D Emotion Galaxy)

**Duration:** 2-3 weeks | **Persona Focus:** Explorers (exclusive), Portfolio visitors

Deliver the signature 3D visualization experience that demonstrates technical mastery and provides a novel way to discover photos through spatial clustering. This is the "showpiece" feature with strict performance constraints.

### Deliverables

19. [ ] **3D Emotion Galaxy Core** — Build Three.js + React Three Fiber scene rendering 500 curated photos (subset selected by portfolio_worthy + diversity of emotions/play types), photo sprites positioned in 3D space using similarity scoring algorithm (emotion similarity: 30%, play type: 25%, composition: 15%, quality proximity: 15%, time proximity: 10%, color palette: 5%), clusters form naturally based on metadata, lerp-based smooth movement for camera transitions (0.05 lerp factor), OrbitControls for user navigation (zoom limits: 5-50 units, pan limits: ±100 units), depth-of-field blur for spatial depth perception (near/far plane adjustments), GPU instanced rendering for performance. Component: EmotionGalaxy.tsx using @react-three/fiber and @react-three/drei. `L`

20. [ ] **Galaxy Interaction & Navigation** — Add interaction layer with raycaster for click detection (select photo to view details), hover states (photo scales to 1.2x + glow effect), camera animations using GSAP for smooth transitions to selected photo clusters, minimap overlay showing camera position and cluster locations, cluster labels (floating text sprites showing emotion/play type), "Fly to Cluster" buttons for guided navigation (animate camera to predefined viewpoints), reset camera button returns to default view, keyboard shortcuts (WASD for camera movement, arrow keys for rotation, Space for auto-rotate toggle). `M`

21. [ ] **Performance Optimization & Fallback** — Implement strict performance budget monitoring (16ms frame budget = 60fps), Three.js texture optimization (compressed textures, mipmaps, max size 512x512 for sprites), frustum culling (only render visible photos), level-of-detail system (reduce sprite quality at distance), performance profiling with Stats.js overlay (FPS, MS, MB counters), automatic quality degradation if FPS drops below 55 for 3 consecutive frames (reduces particle count, disables depth-of-field), WebGL detection with graceful fallback to 2D grid view (shows "3D not supported" message with option to view standard grid), loading state with 3D progress indicator. `M`

22. [ ] **Galaxy Entry Experience** — Design cinematic entry sequence using Framer Motion for page transition from Gallery Lobby, loading screen with animated particle system preview (teases 3D experience), camera flythrough on first load (auto-rotates through clusters with pauses at interesting viewpoints, 30-second duration, skippable with any input), ambient background music toggle (optional, royalty-free instrumental), instructional overlay on first visit (explains controls, dismissible, never shows again), exit transition back to Gallery Lobby with smooth fade. Entry point from Gallery Lobby "Explore Pathways" tile with preview animation. `M`

**Success Criteria:**
- 3D scene maintains 60fps with 500 photos on target hardware (2019 MacBook Pro or equivalent)
- Fallback triggers automatically on low-performance devices (detected via initial benchmark)
- Similarity clustering creates visually coherent groupings (manual QA validation)
- Camera controls feel smooth and intuitive (user testing with 5+ participants)
- Loading completes in under 5 seconds on 10 Mbps connection
- Entry experience creates "wow" moment (qualitative user feedback)
- No memory leaks during extended sessions (test 10-minute continuous use)

**Design Quality Checklist:**
- [ ] Cinematic entry sequence uses Framer Motion page transitions
- [ ] Loading state designed (NO generic spinners, use particle preview)
- [ ] Photo sprites optimized (512x512 max, compressed textures)
- [ ] Performance budget enforced (16ms frame budget = 60fps)
- [ ] Graceful fallback to 2D grid (WebGL detection, quality message)
- [ ] Camera transitions use GSAP (smooth flythrough on first load)
- [ ] Exit transition to Gallery Lobby animated (subtle fade)

**Persona Value:**
- **Explorers:** Signature 3D experience is the memorable centerpiece, provides novel discovery through spatial relationships, showcases photographer's technical sophistication
- **Portfolio Visitors:** Demonstrates mastery of cutting-edge web technologies, differentiates portfolio from competitors
- **Seekers/Curators:** Not primary use case, but available as exploratory tool

---

## Implementation Notes

### Strategic Phase Ordering

**Phase 1 (Foundation):** Must be unbreakable. Everything builds on this infrastructure. Invest time in robust database schema, design system, and virtual scrolling performance. Shortcuts here create technical debt that compounds.

**Phase 2 (Intelligence):** Adds high-value utility for Seekers and Curators without requiring advanced interactions. Natural language search and AI-curated collections provide immediate ROI by drastically reducing time-to-find for target photos.

**Phase 3 (Experience):** Layering motion and theming on stable infrastructure ensures interactions enhance rather than hinder usability. Explorers get wow moments, but Seekers/Curators don't lose functionality.

**Phase 4 (Signature):** 3D Galaxy is isolated feature with contained scope. Can ship Phases 1-3 as MVP without it. Strict performance budget prevents feature from degrading overall site quality.

### Cross-Phase Considerations

**Performance Monitoring:**
- Lighthouse CI runs on every deployment (scores must remain 90+)
- Real User Monitoring (RUM) via Sentry tracks Web Vitals in production
- FPS monitoring in development (Chrome DevTools frame rate overlay)
- Bundle size tracking with @next/bundle-analyzer (main bundle <200KB gzipped)

**Accessibility:**
- WCAG 2.1 AA compliance required across all phases
- Keyboard navigation tested in every component
- Screen reader testing with VoiceOver/NVDA for critical paths
- Reduced motion support (respects prefers-reduced-motion media query)
- Color contrast validation (minimum 4.5:1 ratio for text)

**Testing Strategy:**
- Playwright E2E tests for user journeys (Explorer, Seeker, Curator paths)
- Visual regression tests for UI consistency (screenshot comparisons)
- Performance regression tests (Lighthouse scores, animation frame rates)
- Unit tests for complex algorithms (story detection, similarity scoring)
- Manual QA for motion interactions (physics feel, timing)

**Data & Content:**
- Work with production dataset (20,000 photos across 200+ albums)
- AI enrichment runs on representative sample (1,000 photos minimum)
- Test edge cases (albums with <10 photos, missing metadata, all same emotion)
- Performance testing at scale (grids with 10,000+ photos)

### Future Phases (Post-Launch)

**Phase 5: Mobile Optimization & PWA**
- Touch gesture support (@use-gesture/react integration)
- Mobile-specific UI adaptations (simplified orbs, bottom sheets)
- Progressive Web App (PWA) configuration (offline support, install prompt)
- iOS/Android native-like experiences

**Phase 6: Collaboration & User Accounts**
- Athlete/Coach accounts with personal dashboards
- Custom collection creation and sharing
- Photo favoriting and commenting
- Team galleries with role-based access

**Phase 7: Monetization & Print Shop**
- Print fulfillment integration (WHCC, Bay Photo, Printique)
- Payment processing (Stripe)
- Commission splitting (photographer/platform)
- Order tracking and customer service workflows

**Phase 8: Analytics & Insights**
- Photographer dashboard with engagement metrics
- Conversion funnel analysis (view → favorite → download → purchase)
- Heatmaps showing photo interaction patterns
- A/B testing framework for feature optimization

### Technology Choices Rationale

**Framer Motion vs. GSAP:** Use Framer Motion for React component animations (declarative, layout animations), GSAP for complex timelines and scroll-triggered effects (more control, better performance for timeline scrubbing).

**Supabase vs. Custom Backend:** Supabase provides PostgreSQL with pgvector for semantic search, real-time subscriptions, edge functions, and authentication out-of-the-box. Faster development than custom Node.js backend.

**Three.js vs. Babylon.js:** Three.js has larger ecosystem, better React integration (@react-three/fiber), more examples for photo sprite rendering. Adequate for 500-photo scene with proper optimization.

**Pinecone vs. Weaviate:** Pinecone's managed service eliminates devops overhead, excellent documentation, predictable pricing. Semantic search isn't core differentiator, so prefer ease of integration.

**@tanstack/react-virtual vs. react-window:** Tanstack Virtual has better TypeScript support, more flexible API, supports dynamic row heights, active maintenance. Worth migration from react-window.

---

## Success Metrics (Post-Launch)

**Engagement Metrics:**
- Average session duration: >5 minutes (indicates exploration vs. quick exit)
- Photos viewed per session: >50 (suggests discovery behavior)
- Return visitor rate: >40% within 30 days
- 3D Galaxy entry rate: >25% of Explorer persona visits

**Utility Metrics:**
- Time to find target photo (Seeker): <2 minutes (vs. 10+ minutes chronological browsing)
- Story generation usage: >15% of sessions include story viewing
- Collection export rate: >10% of Curator sessions result in PDF/ZIP download
- Search satisfaction: Natural language queries return relevant results >80% of time

**Technical Metrics:**
- Lighthouse Performance score: 90+ maintained in production
- P95 page load time: <2.5 seconds
- Animation frame rate: 60fps maintained on 75th percentile devices
- 3D Galaxy performance: 60fps on 50th percentile devices with fallback <10% trigger rate

**Portfolio Impact:**
- Bounce rate: <30% (indicates engaging experience)
- Social shares: >5% of sessions include share action
- Portfolio referrals: Tracked via UTM parameters, measure industry attention
- Photographer brand lift: Qualitative feedback from portfolio viewers and clients
