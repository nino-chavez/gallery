# Task Breakdown: The Living Archive v2 Foundation

**Project:** Complete Frontend Reimplementation with Design System
**Timeline:** 10-12 weeks across 4 phases
**Total Tasks:** 85 tasks across 22 deliverables
**Backend Status:** ✅ Migrated (verify only, no implementation needed)

---

## Overview

This tasks list implements The Living Archive v2 following the comprehensive Design Brief and product roadmap. The backend infrastructure (Supabase, SmugMug, AI enrichment) is production-ready from v1 and requires verification only. This spec focuses exclusively on frontend implementation.

**Key Principles:**
- **Design-First Approach:** Design system must be complete before feature implementation
- **Quality Gates Required:** Each phase has design/performance/testing checklists
- **No Emojis:** Lucide React icons exclusively
- **60fps Non-Negotiable:** All animations validated
- **WCAG AAA:** 7:1 contrast minimum

**Assigned Implementers:**
- `ui-designer` - Design system, UI components, layouts, styling, interactions
- `testing-engineer` - Strategic test coverage at phase completion

---

## Phase 0: Project Setup & Initialization

**Duration:** 1-2 days
**Purpose:** Establish clean Next.js 15 foundation before design system work

### Task Group 0.1: Project Initialization

**Assigned Implementer:** `ui-designer`
**Dependencies:** None

- [ ] **Initialize Next.js 15 Project** (`M`) - Create fresh Next.js 15 project with TypeScript
  - **Files:** Project root, `next.config.ts`, `tsconfig.json`
  - **Requirements:**
    - Run `pnpm create next-app@latest` with TypeScript, App Router, Tailwind CSS
    - Enable strict TypeScript mode
    - Configure `src/` directory structure
  - **Design Principles:** N/A (infrastructure)
  - **Acceptance Criteria:**
    - Next.js 15 project runs with `pnpm dev`
    - TypeScript strict mode enabled
    - App Router configured
    - Tailwind CSS working
  - **Dependencies:** None

- [ ] **Install Core Dependencies** (`M`) - Add animation, data fetching, and utility libraries
  - **Files:** `package.json`
  - **Requirements:**
    - Framer Motion 12 (UI animations)
    - GSAP 3 (timelines, scrubbing)
    - Three.js + @react-three/fiber (3D Galaxy)
    - @tanstack/react-virtual (virtual scrolling)
    - SWR 2 (data fetching)
    - Lucide React (icons only, NO emojis)
    - @fontsource-variable/inter (typography)
  - **Design Principles:** Tech stack alignment
  - **Acceptance Criteria:**
    - All dependencies installed with pnpm
    - No version conflicts
    - TypeScript types available
  - **Dependencies:** Task 0.1.1

- [ ] **Configure Tailwind CSS 4** (`S`) - Set up Tailwind with custom config for design tokens
  - **Files:** `tailwind.config.ts`, `postcss.config.js`
  - **Requirements:**
    - Enable JIT mode
    - Configure content paths for App Router
    - Prepare for CSS custom properties integration
  - **Design Principles:** Design token foundation
  - **Acceptance Criteria:**
    - Tailwind classes working
    - JIT compilation fast
    - No console warnings
  - **Dependencies:** Task 0.1.2

- [ ] **Set Up Testing Infrastructure** (`M`) - Install and configure Playwright
  - **Files:** `playwright.config.ts`, `tests/` directory
  - **Requirements:**
    - Install Playwright with browsers
    - Configure for E2E and visual regression
    - Set up test directory structure
    - Configure base URL and viewport sizes
  - **Design Principles:** Quality foundation
  - **Acceptance Criteria:**
    - `pnpm playwright test` runs successfully
    - Browsers installed (Chromium, Firefox, WebKit)
    - Screenshot directory configured
  - **Dependencies:** Task 0.1.1

- [ ] **Verify Backend Integration** (`S`) - Confirm Supabase and SmugMug APIs accessible
  - **Files:** `.env.local`, `src/lib/supabase/client.ts`, `src/lib/smugmug/client.ts`
  - **Requirements:**
    - Copy environment variables from .env.example
    - Test Supabase connection
    - Verify photo_metadata table accessible
    - Test SmugMug API connection
  - **Design Principles:** Backend preservation
  - **Acceptance Criteria:**
    - Supabase client connects successfully
    - Query returns photo_metadata records
    - SmugMug API responds to test request
    - All 12 semantic dimensions present in data
  - **Dependencies:** Task 0.1.1

---

## Phase 1: Unbreakable Foundation (2-3 weeks)

**Deliverables:** 5
**Focus:** Design system, core components, virtual scrolling, basic filtering

---

### Task Group 1.1: Design Tokens & Motion System

**Assigned Implementer:** `ui-designer`
**Dependencies:** Phase 0 complete

- [ ] **Create Motion Tokens** (`M`) - Implement comprehensive motion token system
  - **Files:** `src/lib/motion-tokens.ts`
  - **Requirements:**
    - Export MOTION object with spring configurations (gentle, snappy, bouncy)
    - Export duration presets (fast 0.2s, normal 0.3s, slow 0.5s, cinematic 0.8s)
    - Export easing curves (easeOut, easeInOut, anticipate)
    - TypeScript types for all configurations
  - **Design Principles:** Motion tokens required (no arbitrary durations)
  - **Acceptance Criteria:**
    - Motion tokens exported and importable
    - TypeScript autocomplete working
    - All spring configs documented
    - Easing curves match Design Brief
  - **Dependencies:** Phase 0 complete

- [ ] **Create Emotion Palette** (`M`) - Implement 6-emotion color system
  - **Files:** `src/lib/motion-tokens.ts` (export alongside motion tokens)
  - **Requirements:**
    - Define EMOTION_PALETTE with 6 emotions: triumph, intensity, focus, determination, excitement, serenity
    - Each emotion has: primary color, gradient, glow, description
    - Colors from Design Brief specification
    - TypeScript types for Emotion union type
  - **Design Principles:** EMOTION_PALETTE is core system (not just accents)
  - **Acceptance Criteria:**
    - All 6 emotions defined
    - Primary colors, gradients, glows correct
    - Importable from motion-tokens.ts
    - TypeScript types working
  - **Dependencies:** Task 1.1.1

- [ ] **Create Global CSS Custom Properties** (`M`) - Define design token CSS variables
  - **Files:** `src/styles/globals.css`
  - **Requirements:**
    - Color palette (charcoal backgrounds, white text, gold accents)
    - Spacing scale (4/8/16/24/32/48/64px)
    - Border radius scale (sm/md/lg/full)
    - Shadow scale (sm/md/lg/xl)
    - WCAG AAA contrast verified (7:1 minimum)
  - **Design Principles:** Use design tokens exclusively (no hard-coded values)
  - **Acceptance Criteria:**
    - CSS custom properties defined
    - Applied globally to :root
    - WCAG AAA contrast verified with color checker
    - No hard-coded hex values in components
  - **Dependencies:** Task 1.1.2

- [ ] **Load Inter Variable Font** (`S`) - Install and configure typography font
  - **Files:** `src/app/layout.tsx`, `src/styles/globals.css`
  - **Requirements:**
    - Install @fontsource-variable/inter
    - Import in root layout
    - Apply to body with CSS
    - Weights 400-700 available
  - **Design Principles:** Inter Variable font only (single typeface)
  - **Acceptance Criteria:**
    - Inter Variable loads successfully
    - Applied globally to all text
    - Variable font weights working
    - No FOUT (Flash of Unstyled Text)
  - **Dependencies:** Task 1.1.3

---

### Task Group 1.2: Core UI Components

**Assigned Implementer:** `ui-designer`
**Dependencies:** Task Group 1.1 complete

- [ ] **Create Typography Component** (`M`) - Semantic type scale component
  - **Files:** `src/components/common/Typography.tsx`
  - **Requirements:**
    - Support variants: hero, h1, h2, h3, body, small, tiny, button, label
    - Use CSS custom properties for colors
    - Semantic HTML (h1, h2, p, span as appropriate)
    - Props: variant, as, children, className
  - **Design Principles:** Typography component required for all text
  - **Acceptance Criteria:**
    - All variants render correctly
    - Semantic HTML tags used
    - WCAG AAA contrast maintained
    - TypeScript props typed
  - **Dependencies:** Task 1.1.4

- [ ] **Create Button Component** (`M`) - Multi-variant button with interactions
  - **Files:** `src/components/common/Button.tsx`
  - **Requirements:**
    - Variants: primary (gold), secondary (outline), ghost (text only)
    - Interaction states: hover (brightness 1.1, scale 1.02), active (scale 0.98), focus (gold outline)
    - Disabled state (50% opacity)
    - Use motion tokens for spring animations
  - **Design Principles:** Spring physics, motion tokens required
  - **Acceptance Criteria:**
    - All 3 variants working
    - Hover/active/focus states correct
    - Spring animation from MOTION.spring.snappy
    - WCAG AAA focus indicator
  - **Dependencies:** Task 1.2.1

- [ ] **Create Card Component** (`M`) - Elevated surface component
  - **Files:** `src/components/common/Card.tsx`
  - **Requirements:**
    - Background: var(--color-surface)
    - Border radius: var(--radius-md)
    - Shadow: var(--shadow-md)
    - Padding: var(--spacing-lg)
    - Hover state: shadow expands, translateY(-4px), spring physics
  - **Design Principles:** Gentle spring physics, CSS custom properties
  - **Acceptance Criteria:**
    - Card renders with correct styles
    - Hover lift effect smooth
    - Spring animation from MOTION.spring.gentle
    - No hard-coded values
  - **Dependencies:** Task 1.2.1

- [ ] **Create Input Component** (`M`) - Form input with states
  - **Files:** `src/components/common/Input.tsx`
  - **Requirements:**
    - Background: var(--color-background)
    - Border: 1px solid var(--color-border)
    - Height: 48px (touch target)
    - Focus state: gold border with glow
    - Error/success states
    - Placeholder styling
  - **Design Principles:** WCAG AAA contrast, adequate touch targets
  - **Acceptance Criteria:**
    - Input renders correctly
    - Focus state with gold border
    - Error/success states working
    - WCAG AAA contrast verified
  - **Dependencies:** Task 1.2.1

---

### Task Group 1.3: Photo Grid with Virtual Scrolling

**Assigned Implementer:** `ui-designer`
**Dependencies:** Task Group 1.2 complete

- [ ] **Create PhotoCard Component** (`L`) - Photo card with metadata overlay
  - **Files:** `src/components/portfolio/PhotoCard.tsx`
  - **Requirements:**
    - Next.js Image component with optimization
    - Blurhash placeholder generation
    - Emotion halo (colored glow from EMOTION_PALETTE)
    - Quality badge (gold corner for portfolio_worthy)
    - Hover state: scale 1.02, shadow expansion
    - Props: photo (PhotoMetadata), showMetadata, emotionHalo, qualityGlow
  - **Design Principles:** Emotion halos, quality visualization
  - **Acceptance Criteria:**
    - Image optimization working (WebP/AVIF)
    - Blurhash placeholder displays
    - Emotion halo color matches palette
    - Gold badge on portfolio_worthy photos
    - Hover animation smooth (60fps)
  - **Dependencies:** Task Group 1.2 complete

- [ ] **Create Virtual Photo Grid** (`XL`) - High-performance photo grid with @tanstack/react-virtual
  - **Files:** `src/components/portfolio/PhotoGrid.tsx`
  - **Requirements:**
    - Use @tanstack/react-virtual for windowed rendering
    - 300px estimated row height with dynamic adjustment
    - 5-row overscan buffer
    - Adaptive columns (1-6 based on viewport width: mobile 1-2, tablet 3-4, desktop 5-6)
    - Intersection Observer lazy loading (200px root margin)
    - Responsive srcset with breakpoints
  - **Design Principles:** Performance first (60fps with 10K+ photos)
  - **Acceptance Criteria:**
    - Renders 10,000+ photos without frame drops
    - Virtual scrolling maintains 60fps (Chrome DevTools validated)
    - Adaptive columns responsive
    - Images lazy load correctly
    - Smooth scrolling experience
  - **Dependencies:** Task 1.3.1

---

### Task Group 1.4: Filtering & Sorting System

**Assigned Implementer:** `ui-designer`
**Dependencies:** Task Group 1.3 complete

- [ ] **Create Filter State Types** (`S`) - TypeScript types for filtering
  - **Files:** `src/types/filters.ts`
  - **Requirements:**
    - FilterState interface with all filter dimensions
    - Emotion, PlayType, CompositionPattern, ActionIntensity union types
    - Sort modes enum
  - **Design Principles:** Type safety
  - **Acceptance Criteria:**
    - All filter types defined
    - TypeScript autocomplete working
    - Importable from types/filters
  - **Dependencies:** Task Group 1.3 complete

- [ ] **Create Filter Panel Component** (`L`) - Multi-dimensional filter UI
  - **Files:** `src/components/filters/FilterPanel.tsx`
  - **Requirements:**
    - Checkboxes for portfolio_worthy, print_ready, social_media_optimized
    - Emotion filter (6 checkboxes with EMOTION_PALETTE color backgrounds)
    - Play type filter (7 checkboxes with Lucide React icons: Zap, Shield, ArrowDown, Target, Circle)
    - Composition pattern multi-select
    - Action intensity filter (4 checkboxes)
    - Real-time photo count updates (query Supabase)
    - "Clear All Filters" button
    - URL query param persistence
  - **Design Principles:** NO emojis (Lucide icons only), emotion color coding
  - **Acceptance Criteria:**
    - All filter categories functional
    - Lucide icons used (NO ⚡🛡️🤿 emojis)
    - Emotion filters color-coded from palette
    - Real-time counts accurate
    - URL params update on change
    - Clear All button resets state
  - **Dependencies:** Task 1.4.1

- [ ] **Create Sort Controls** (`M`) - Sort mode selector
  - **Files:** `src/components/filters/SortControls.tsx`
  - **Requirements:**
    - Sort modes: Quality Descending, Chronological, Emotion Clusters, Play Type Groups
    - Dropdown or button group UI
    - Updates URL query params
    - Visual indicator of active sort
  - **Design Principles:** Clear UI affordances
  - **Acceptance Criteria:**
    - All 4 sort modes available
    - Active sort visually indicated
    - Grid re-orders on sort change
    - URL params persist sort state
  - **Dependencies:** Task 1.4.2

- [ ] **Implement Filter Logic & Query** (`L`) - Connect filters to Supabase queries
  - **Files:** `src/hooks/usePhotoFilters.ts`, `src/lib/supabase/queries.ts`
  - **Requirements:**
    - Build Supabase query from FilterState
    - AND logic for filter combinations
    - Real-time count queries
    - Debounced filter updates (300ms)
    - SWR caching for performance
  - **Design Principles:** Performance optimization
  - **Acceptance Criteria:**
    - Filters apply correctly to query
    - Real-time counts accurate (<300ms)
    - Query optimized (uses indexes)
    - SWR caching reduces redundant queries
  - **Dependencies:** Task 1.4.2

---

### Task Group 1.5: Navigation & Layout

**Assigned Implementer:** `ui-designer`
**Dependencies:** Task Group 1.4 complete

- [ ] **Create Navigation Component** (`M`) - Global navigation header
  - **Files:** `src/components/layout/Navigation.tsx`
  - **Requirements:**
    - Gallery Lobby link
    - Search icon button
    - Collections dropdown
    - Mobile hamburger menu
    - Responsive behavior
  - **Design Principles:** Accessibility, keyboard navigation
  - **Acceptance Criteria:**
    - Navigation visible on all pages
    - Mobile menu functional
    - Keyboard accessible (Tab, Enter)
    - ARIA landmarks present
  - **Dependencies:** Task Group 1.4 complete

- [ ] **Create Header & Footer** (`M`) - Layout header and footer components
  - **Files:** `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`
  - **Requirements:**
    - Header with site branding
    - Footer with photographer info
    - Consistent across all pages
    - Semantic HTML (header, footer)
  - **Design Principles:** Semantic HTML, consistent branding
  - **Acceptance Criteria:**
    - Header/footer render correctly
    - Semantic HTML tags used
    - Photographer branding visible
  - **Dependencies:** Task 1.5.1

- [ ] **Create Breadcrumb Component** (`S`) - Navigation breadcrumb trail
  - **Files:** `src/components/layout/Breadcrumb.tsx`
  - **Requirements:**
    - Shows current path hierarchy
    - Clickable links to parent routes
    - Separator icons (Lucide ChevronRight)
  - **Design Principles:** Clear navigation affordances
  - **Acceptance Criteria:**
    - Breadcrumb displays current path
    - Links functional
    - Lucide icon for separator
  - **Dependencies:** Task 1.5.1

- [ ] **Implement Skip to Content Link** (`S`) - Accessibility enhancement
  - **Files:** `src/components/layout/SkipToContent.tsx`
  - **Requirements:**
    - Hidden by default, visible on focus
    - Jumps to main content ID
    - Keyboard accessible
  - **Design Principles:** WCAG AAA accessibility
  - **Acceptance Criteria:**
    - Link hidden until Tab focus
    - Jumps to main content correctly
    - WCAG AAA compliant
  - **Dependencies:** Task 1.5.2

---

### Task Group 1.6: Phase 1 Testing

**Assigned Implementer:** `testing-engineer`
**Dependencies:** Task Groups 1.1-1.5 complete

- [ ] **Write 2-8 Focused E2E Tests** (`M`) - Strategic test coverage for Phase 1
  - **Files:** `tests/e2e/phase1-foundation.spec.ts`
  - **Requirements:**
    - Test 1: Homepage loads with navigation
    - Test 2: Photo grid renders with virtual scrolling
    - Test 3: Filter panel applies filters correctly
    - Test 4: Sort controls change grid order
    - Test 5-8: Critical user flows only (if needed)
  - **Design Principles:** Test behavior, not implementation
  - **Acceptance Criteria:**
    - Maximum 8 strategic tests
    - All tests pass
    - Critical workflows covered
    - No exhaustive edge case testing
  - **Dependencies:** Task Groups 1.1-1.5 complete

- [ ] **Create Visual Regression Baseline** (`M`) - Capture screenshot baselines
  - **Files:** `tests/visual/phase1-baselines.spec.ts`
  - **Requirements:**
    - Screenshot: Homepage with navigation
    - Screenshot: Photo grid (desktop + mobile)
    - Screenshot: Filter panel (default state)
    - Pixel diff threshold: 0.2%
  - **Design Principles:** Visual consistency validation
  - **Acceptance Criteria:**
    - Baseline screenshots captured
    - Playwright visual regression configured
    - Threshold set to 0.2%
  - **Dependencies:** Task 1.6.1

---

### Task Group 1.7: Phase 1 Quality Gates

**Assigned Implementer:** `ui-designer`
**Dependencies:** Task Group 1.6 complete

- [ ] **Run Phase 1 Design Checklist** (`M`) - Verify Design Brief compliance
  - **Files:** N/A (validation task)
  - **Requirements:**
    - ✓ Inter Variable font loaded and applied globally
    - ✓ All colors from design tokens (CSS custom properties)
    - ✓ Typography component used for all text
    - ✓ Lucide React icons exclusively (NO emojis)
    - ✓ Motion tokens used for all transitions
    - ✓ WCAG AAA contrast verified (7:1 minimum)
    - ✓ Spacing from design scale (no arbitrary values)
    - ✓ 60fps validated (Chrome DevTools Performance tab)
  - **Design Principles:** Non-negotiable quality standards
  - **Acceptance Criteria:**
    - All checklist items verified
    - No violations found
    - Documentation updated
  - **Dependencies:** Task Group 1.6 complete

- [ ] **Run Phase 1 Performance Checklist** (`M`) - Validate performance targets
  - **Files:** N/A (validation task)
  - **Requirements:**
    - ✓ Lighthouse Performance 90+
    - ✓ Lighthouse Accessibility 90+
    - ✓ Lighthouse Best Practices 90+
    - ✓ Lighthouse SEO 90+
    - ✓ Page load <2s
    - ✓ Virtual scrolling handles 10K+ photos at 60fps
    - ✓ Bundle size <200KB gzipped
  - **Design Principles:** Performance non-negotiable
  - **Acceptance Criteria:**
    - All Lighthouse scores 90+
    - Performance targets met
    - Bundle size within limits
  - **Dependencies:** Task 1.7.1

---

## Phase 2: Intelligent Interface (2-3 weeks)

**Deliverables:** 6
**Focus:** Gallery Lobby, search, quality stratification, AI story curation, collections

---

### Task Group 2.1: Gallery Lobby Homepage

**Assigned Implementer:** `ui-designer`
**Dependencies:** Phase 1 complete

- [ ] **Create Gallery Lobby Hero Section** (`M`) - Above-fold hero with tagline
  - **Files:** `src/components/lobby/HeroSection.tsx`
  - **Requirements:**
    - Site tagline and primary CTA
    - Minimal design with 60%+ whitespace
    - Cinematic fade-in animation (Framer Motion)
    - Responsive typography scaling
  - **Design Principles:** Clear focal point, cinematic transitions
  - **Acceptance Criteria:**
    - Hero renders with tagline
    - CTA button functional
    - 60%+ whitespace maintained
    - Fade-in animation smooth (300ms)
  - **Dependencies:** Phase 1 complete

- [ ] **Create Featured Stories Carousel** (`L`) - AI-generated narrative previews
  - **Files:** `src/components/lobby/FeaturedStories.tsx`
  - **Requirements:**
    - Display 3-5 AI-generated narratives
    - Cinematic preview thumbnails (16:9 ratio)
    - Emotional curve mini-graphs
    - Photo counts per story
    - Click to open Story Viewer
    - Horizontal scroll or carousel navigation
  - **Design Principles:** Visual storytelling, emotional curves visible
  - **Acceptance Criteria:**
    - Carousel displays 3-5 stories
    - Thumbnails 16:9 ratio
    - Emotional curve graphs render
    - Click navigation functional
    - Smooth carousel transitions
  - **Dependencies:** Task 2.1.1

- [ ] **Create Explore Pathways Grid** (`M`) - Entry points to signature features
  - **Files:** `src/components/lobby/ExplorePathways.tsx`
  - **Requirements:**
    - 3 tiles: 3D Emotion Galaxy, Emotion Timeline, Thematic Collections
    - Preview animations for each tile
    - Click navigates to respective feature
    - Responsive grid layout
  - **Design Principles:** Clear navigation affordances
  - **Acceptance Criteria:**
    - 3 pathway tiles render
    - Preview animations working
    - Click navigation functional
    - Responsive grid layout
  - **Dependencies:** Task 2.1.1

- [ ] **Create Thematic Collections Section** (`M`) - Persistent collection previews
  - **Files:** `src/components/lobby/ThematicCollections.tsx`
  - **Requirements:**
    - Display 4-6 thematic collections
    - Preview grids (4-photo thumbnails each)
    - Photo counts and emotion distribution
    - Click navigates to collection detail
  - **Design Principles:** Visual hierarchy, emotion distribution visible
  - **Acceptance Criteria:**
    - 4-6 collections display
    - Preview grids render
    - Photo counts accurate
    - Emotion distribution visualized
    - Click navigation functional
  - **Dependencies:** Task 2.1.1

- [ ] **Create Search Bar Component** (`M`) - Prominent natural language search
  - **Files:** `src/components/lobby/SearchBar.tsx`
  - **Requirements:**
    - Large, prominent search input
    - Natural language placeholder text
    - Debounced input (300ms)
    - Enter key submits search
    - Navigates to search results page
  - **Design Principles:** Clear affordances, natural language
  - **Acceptance Criteria:**
    - Search bar prominent
    - Placeholder text clear
    - Debounce working (300ms)
    - Enter submits search
    - Navigation functional
  - **Dependencies:** Task 2.1.1

- [ ] **Implement Gallery Lobby Page Transitions** (`M`) - Framer Motion transitions
  - **Files:** `src/app/page.tsx`, transitions between routes
  - **Requirements:**
    - Fade-in on page load (300ms)
    - Fade-out on navigation (300ms)
    - Use Framer Motion AnimatePresence
    - Respect prefers-reduced-motion
  - **Design Principles:** Cinematic transitions, motion tokens
  - **Acceptance Criteria:**
    - Page transitions smooth
    - 300ms fade duration
    - Reduced motion fallback
    - No layout shift
  - **Dependencies:** Tasks 2.1.1-2.1.5

---

### Task Group 2.2: Natural Language Search

**Assigned Implementer:** `ui-designer`
**Dependencies:** Task Group 2.1 complete

- [ ] **Create Query Parser** (`L`) - Extract filters from natural language
  - **Files:** `src/lib/search/queryParser.ts`
  - **Requirements:**
    - Pattern matching for emotions (triumphant, intense, focused, etc.)
    - Pattern matching for play types (attack, block, dig, set, serve)
    - Pattern matching for quality indicators (portfolio worthy, peak intensity)
    - Return FilterState object
    - Handle multi-word queries
  - **Design Principles:** Semantic understanding
  - **Acceptance Criteria:**
    - "triumphant celebration blocks" → emotion=triumph, play_type=block
    - "peak intensity attack shots" → action_intensity=peak, play_type=attack
    - "portfolio worthy serenity" → portfolio_worthy=true, emotion=serenity
    - Multi-word queries parsed correctly
  - **Dependencies:** Task Group 2.1 complete

- [ ] **Create Search Results Page** (`L`) - Display search results with faceted filters
  - **Files:** `src/app/search/page.tsx`, `src/components/search/SearchResults.tsx`
  - **Requirements:**
    - Query from URL params
    - Parse query with queryParser
    - Apply filters to photo grid
    - Display applied filters as chips
    - One-click removal of filter chips
    - Use quality-stratified grid
  - **Design Principles:** Clear filter feedback, quality prioritization
  - **Acceptance Criteria:**
    - Search results display correctly
    - Applied filters shown as chips
    - Chip removal functional
    - Quality-stratified grid used
    - URL params persist state
  - **Dependencies:** Task 2.2.1

- [ ] **Create Faceted Filters Sidebar** (`M`) - Applied filters with removal
  - **Files:** `src/components/search/FacetedFilters.tsx`
  - **Requirements:**
    - Display active filters as colored chips
    - Emotion chips use EMOTION_PALETTE colors
    - Click chip to remove filter
    - "Clear All" button
    - Photo count updates in real-time
  - **Design Principles:** Emotion palette integration, clear affordances
  - **Acceptance Criteria:**
    - Active filters display as chips
    - Emotion chips color-coded
    - Click removal functional
    - Clear All button works
    - Real-time counts accurate
  - **Dependencies:** Task 2.2.2

- [ ] **Implement Query Suggestions** (`M`) - Autocomplete dropdown
  - **Files:** `src/components/search/QuerySuggestions.tsx`
  - **Requirements:**
    - Dropdown appears on input focus
    - Suggests based on available metadata (emotions, play types, quality)
    - Click suggestion to apply
    - Keyboard navigation (arrow keys)
  - **Design Principles:** Progressive disclosure
  - **Acceptance Criteria:**
    - Dropdown appears on focus
    - Suggestions relevant
    - Click to apply functional
    - Keyboard navigation works
  - **Dependencies:** Task 2.2.2

- [ ] **Implement Saved Searches** (`S`) - LocalStorage persistence
  - **Files:** `src/hooks/useSavedSearches.ts`
  - **Requirements:**
    - Save search queries to localStorage
    - Display saved searches dropdown
    - Click to restore saved search
    - Max 10 saved searches
  - **Design Principles:** User convenience
  - **Acceptance Criteria:**
    - Searches persist in localStorage
    - Dropdown displays saved searches
    - Click restores search
    - Max 10 enforced
  - **Dependencies:** Task 2.2.2

---

### Task Group 2.3: Quality-Stratified Grid

**Assigned Implementer:** `ui-designer`
**Dependencies:** Task Group 2.2 complete

- [ ] **Implement Quality Stratification Logic** (`M`) - Sort by portfolio_worthy and quality
  - **Files:** `src/hooks/useQualityStratification.ts`
  - **Requirements:**
    - Sort photos: portfolio_worthy first, then by quality score
    - Quality threshold: >= 8 for priority placement
    - Maintain stable sort for equal quality
  - **Design Principles:** Quality hierarchy
  - **Acceptance Criteria:**
    - Portfolio_worthy photos appear first
    - Quality >= 8 prioritized
    - Sort stable for equal scores
    - Performance maintained
  - **Dependencies:** Task Group 2.2 complete

- [ ] **Create Quality Badge Component** (`S`) - Gold corner badge for portfolio shots
  - **Files:** `src/components/portfolio/QualityBadge.tsx`
  - **Requirements:**
    - Gold corner badge (triangle or star)
    - Shimmer box-shadow animation on hover
    - Only visible on portfolio_worthy photos
    - Lucide icon (Star or Award)
  - **Design Principles:** Visual quality indicators, NO emojis
  - **Acceptance Criteria:**
    - Badge renders on portfolio_worthy only
    - Gold color from design tokens
    - Shimmer animation smooth
    - Lucide icon used (NO ⭐ emoji)
  - **Dependencies:** Task 2.3.1

- [ ] **Create Quality Gradient Mode** (`L`) - Brightness/blur adjustment based on quality
  - **Files:** `src/components/portfolio/QualityGradientToggle.tsx`, photo card styles
  - **Requirements:**
    - Toggle button to enable/disable gradient mode
    - Applies brightness adjustment (50-100% based on quality 0-10)
    - Applies Gaussian blur (0-5px, inverse to quality)
    - Dimming for low-quality (opacity 60% for quality <5)
    - GSAP animations for smooth transitions
  - **Design Principles:** Visual hierarchy through quality
  - **Acceptance Criteria:**
    - Toggle button functional
    - Brightness scales with quality
    - Blur inverse to quality
    - Low-quality dimmed
    - GSAP transitions smooth (300ms)
  - **Dependencies:** Task 2.3.2

- [ ] **Create "Jump to Portfolio" Button** (`M`) - Floating scroll button
  - **Files:** `src/components/portfolio/JumpToPortfolio.tsx`
  - **Requirements:**
    - Floating button (bottom-right corner)
    - Appears when scrolled past first page
    - Click scrolls to first portfolio_worthy photo
    - Smooth scroll animation
    - Fade in/out on scroll position
  - **Design Principles:** User convenience
  - **Acceptance Criteria:**
    - Button appears when scrolled
    - Click scrolls to portfolio section
    - Smooth scroll animation
    - Fade transitions smooth
  - **Dependencies:** Task 2.3.1

---

### Task Group 2.4: AI Story Curation Engine

**Assigned Implementer:** `ui-designer`
**Dependencies:** Task Group 2.3 complete

- [ ] **Implement Game-Winning Rally Detection** (`M`) - Narrative arc algorithm #1
  - **Files:** `src/lib/story-curation/gameWinningRally.ts`
  - **Requirements:**
    - Filter: final 5 minutes of game (timestamp-based)
    - Filter: peak intensity + (triumph OR intensity emotion)
    - Minimum 3 photos required
    - Sort chronologically
    - Calculate emotional curve (0-10 intensity)
    - Return NarrativeArc object
  - **Design Principles:** Algorithmic story detection
  - **Acceptance Criteria:**
    - Detects game-winning rallies correctly
    - Minimum 3 photos enforced
    - Emotional curve calculated
    - Generation <3s
  - **Dependencies:** Task Group 2.3 complete

- [ ] **Implement Player Highlight Reel Detection** (`M`) - Narrative arc algorithm #2
  - **Files:** `src/lib/story-curation/playerHighlightReel.ts`
  - **Requirements:**
    - Filter: portfolio_worthy = true
    - Group by athlete (requires athlete metadata or placeholder)
    - Top 10 shots per athlete
    - Sort by quality score descending
    - Calculate emotional curve
  - **Design Principles:** Quality-driven curation
  - **Acceptance Criteria:**
    - Top 10 portfolio shots selected
    - Sorted by quality
    - Grouped by athlete (if available)
    - Generation <3s
  - **Dependencies:** Task 2.4.1

- [ ] **Implement Season Journey Detection** (`M`) - Narrative arc algorithm #3
  - **Files:** `src/lib/story-curation/seasonJourney.ts`
  - **Requirements:**
    - One representative photo per game/event
    - Chronological sequence
    - Select highest quality photo from each event
    - Calculate emotional curve across season
  - **Design Principles:** Temporal storytelling
  - **Acceptance Criteria:**
    - One photo per event selected
    - Chronological order
    - Highest quality prioritized
    - Generation <3s
  - **Dependencies:** Task 2.4.1

- [ ] **Implement Comeback Story Detection** (`M`) - Narrative arc algorithm #4
  - **Files:** `src/lib/story-curation/comebackStory.ts`
  - **Requirements:**
    - Emotion pattern: determination → intensity → triumph
    - Minimum 4 photos (at least one of each emotion)
    - Chronological sequence showing arc
    - Calculate emotional curve showing progression
  - **Design Principles:** Emotional arc detection
  - **Acceptance Criteria:**
    - Detects emotion progression
    - Minimum 4 photos enforced
    - Chronological sequence
    - Emotional curve shows arc
    - Generation <3s
  - **Dependencies:** Task 2.4.1

- [ ] **Implement Technical Excellence Detection** (`M`) - Narrative arc algorithm #5
  - **Files:** `src/lib/story-curation/technicalExcellence.ts`
  - **Requirements:**
    - Filter: sharpness >= 9 AND composition >= 9
    - Minimum 8 photos
    - Sort by quality score
    - Calculate emotional curve
  - **Design Principles:** Technical quality showcase
  - **Acceptance Criteria:**
    - Filters technical metrics correctly
    - Minimum 8 photos enforced
    - Sorted by quality
    - Generation <3s
  - **Dependencies:** Task 2.4.1

- [ ] **Implement Emotion Spectrum Detection** (`M`) - Narrative arc algorithm #6
  - **Files:** `src/lib/story-curation/emotionSpectrum.ts`
  - **Requirements:**
    - Filter: 4+ different emotions in single game/event
    - Minimum 1 photo per emotion
    - Sort by emotional diversity
    - Calculate emotional curve showing variety
  - **Design Principles:** Emotional diversity showcase
  - **Acceptance Criteria:**
    - Detects 4+ emotions correctly
    - Minimum photos per emotion
    - Sorted by diversity
    - Generation <3s
  - **Dependencies:** Task 2.4.1

- [ ] **Create Story Generation API Endpoint** (`L`) - Server-side story generation
  - **Files:** `src/app/api/stories/generate/route.ts`
  - **Requirements:**
    - Accept album_key and arc_type params
    - Call appropriate detection algorithm
    - Return NarrativeArc object
    - Redis caching (1-hour TTL)
    - Error handling for invalid requests
  - **Design Principles:** Performance optimization with caching
  - **Acceptance Criteria:**
    - API endpoint functional
    - All 6 arc types supported
    - Redis caching working
    - Generation <3s
    - Cached responses <100ms
  - **Dependencies:** Tasks 2.4.1-2.4.6

---

### Task Group 2.5: Thematic Collections

**Assigned Implementer:** `ui-designer`
**Dependencies:** Task Group 2.4 complete

- [ ] **Create Collections Index Page** (`M`) - List all thematic collections
  - **Files:** `src/app/collections/page.tsx`
  - **Requirements:**
    - Display 6 thematic collections (Technical Excellence, Peak Moments, Emotional Journeys, Player Spotlights, Game-Winning Rallies, Comeback Stories)
    - Preview thumbnails (4-photo grid per collection)
    - Photo counts per collection
    - Emotion distribution visualization (color bar chart)
    - Click navigates to collection detail
  - **Design Principles:** Visual hierarchy, emotion visualization
  - **Acceptance Criteria:**
    - 6 collections display
    - Preview grids render (4 photos each)
    - Photo counts accurate
    - Emotion distribution visualized
    - Click navigation functional
  - **Dependencies:** Task Group 2.4 complete

- [ ] **Create Collection Detail Page** (`L`) - Full collection with filtering
  - **Files:** `src/app/collections/[slug]/page.tsx`
  - **Requirements:**
    - Display all photos in collection
    - Use quality-stratified grid
    - Enable filtering (same filters as main grid)
    - Export options (PDF, ZIP download)
    - Collection metadata (title, description, photo count)
  - **Design Principles:** Utilitarian curation tools
  - **Acceptance Criteria:**
    - Collection photos display
    - Quality-stratified grid used
    - Filtering functional
    - Export buttons present (implementation future)
    - Metadata renders correctly
  - **Dependencies:** Task 2.5.1

- [ ] **Create Emotion Distribution Chart** (`M`) - Color bar chart visualization
  - **Files:** `src/components/collections/EmotionDistribution.tsx`
  - **Requirements:**
    - Horizontal bar chart
    - Colors from EMOTION_PALETTE
    - Percentages for each emotion
    - Responsive sizing
    - Tooltip on hover showing counts
  - **Design Principles:** Emotion palette integration, data visualization
  - **Acceptance Criteria:**
    - Bar chart renders correctly
    - Colors match EMOTION_PALETTE
    - Percentages accurate
    - Tooltips show counts
    - Responsive sizing
  - **Dependencies:** Task 2.5.1

- [ ] **Implement Lazy Collection Generation** (`L`) - Background job on first visit
  - **Files:** `src/lib/collections/generator.ts`, API endpoint
  - **Requirements:**
    - Check if collection exists in cache/database
    - If not, run detection algorithm (3-5s)
    - Show loading state with spinner
    - Cache result
    - Daily regeneration via cron (future: stub only)
  - **Design Principles:** Performance with progressive loading
  - **Acceptance Criteria:**
    - Collection generates on first visit
    - Loading state displays (3-5s)
    - Result cached
    - Subsequent visits instant
  - **Dependencies:** Task 2.5.2

---

### Task Group 2.6: Advanced Filter Interface

**Assigned Implementer:** `ui-designer`
**Dependencies:** Task Group 2.5 complete

- [ ] **Create Collapsible Filter Sections** (`M`) - Organized filter UI
  - **Files:** `src/components/filters/AdvancedFilterPanel.tsx`
  - **Requirements:**
    - Collapsible sections: Quality Metrics, Emotion & Mood, Play Types, Composition, Technical
    - Click header to expand/collapse
    - Smooth accordion animation (Framer Motion)
    - Default: Quality Metrics and Emotion & Mood expanded
  - **Design Principles:** Progressive disclosure, organized hierarchy
  - **Acceptance Criteria:**
    - 5 collapsible sections render
    - Click to expand/collapse functional
    - Accordion animation smooth (300ms)
    - Default expanded sections correct
  - **Dependencies:** Task Group 2.5 complete

- [ ] **Create Quality Range Sliders** (`L`) - Dual-handle range inputs
  - **Files:** `src/components/filters/QualitySlider.tsx`
  - **Requirements:**
    - Dual-handle slider (min/max)
    - Range: 0-10 scale
    - Separate sliders for sharpness, exposure, composition, emotional impact
    - Real-time photo count updates
    - Visual track fill between handles
  - **Design Principles:** Precise quality control
  - **Acceptance Criteria:**
    - Dual handles working
    - Range 0-10 enforced
    - All 4 quality metrics supported
    - Real-time counts accurate
    - Track fill renders correctly
  - **Dependencies:** Task 2.6.1

- [ ] **Create Emotion Filter Chips** (`M`) - Color-coded emotion selection
  - **Files:** `src/components/filters/EmotionChips.tsx`
  - **Requirements:**
    - 6 emotion chips with EMOTION_PALETTE backgrounds
    - Click to toggle selection
    - Active state: border highlight + scale 1.05
    - Hover state: brightness 1.1
    - Multi-select support
  - **Design Principles:** Emotion palette integration, tactile interaction
  - **Acceptance Criteria:**
    - 6 chips render with palette colors
    - Toggle selection functional
    - Active/hover states correct
    - Multi-select working
  - **Dependencies:** Task 2.6.1

- [ ] **Create Play Type Filter with Icons** (`M`) - Icon-based play type selection
  - **Files:** `src/components/filters/PlayTypeFilter.tsx`
  - **Requirements:**
    - 7 play types with Lucide React icons: attack (Zap), block (Shield), dig (ArrowDown), set (Target), serve (Circle), pass (ArrowUp), celebration (Trophy)
    - Click to toggle selection
    - Icon + label layout
    - Multi-select support
    - NO emojis
  - **Design Principles:** Lucide icons exclusively (NO emojis)
  - **Acceptance Criteria:**
    - 7 play types render
    - Lucide icons used (NO ⚡🛡️🤿 emojis)
    - Toggle selection functional
    - Multi-select working
  - **Dependencies:** Task 2.6.1

- [ ] **Create Filter Presets Dropdown** (`M`) - Quick filter combinations
  - **Files:** `src/components/filters/FilterPresets.tsx`
  - **Requirements:**
    - 4 presets: Portfolio Shots, Social Ready, Print Ready, Peak Moments
    - Dropdown UI
    - Click applies preset filter combination
    - Visual indicator of applied preset
  - **Design Principles:** User convenience
  - **Acceptance Criteria:**
    - 4 presets available
    - Click applies correct filters
    - Dropdown functional
    - Active preset indicated
  - **Dependencies:** Task 2.6.1

---

### Task Group 2.7: Phase 2 Testing

**Assigned Implementer:** `testing-engineer`
**Dependencies:** Task Groups 2.1-2.6 complete

- [ ] **Write 2-8 Focused E2E Tests** (`M`) - Strategic test coverage for Phase 2
  - **Files:** `tests/e2e/phase2-intelligent-interface.spec.ts`
  - **Requirements:**
    - Test 1: Gallery Lobby loads with featured stories
    - Test 2: Search query returns results
    - Test 3: Quality-stratified grid prioritizes portfolio shots
    - Test 4: Story generation completes <3s
    - Test 5-8: Critical user flows only (if needed)
  - **Design Principles:** Test behavior, not implementation
  - **Acceptance Criteria:**
    - Maximum 8 strategic tests
    - All tests pass
    - Critical workflows covered
    - No exhaustive edge case testing
  - **Dependencies:** Task Groups 2.1-2.6 complete

- [ ] **Update Visual Regression Tests** (`M`) - Capture new component screenshots
  - **Files:** `tests/visual/phase2-baselines.spec.ts`
  - **Requirements:**
    - Screenshot: Gallery Lobby
    - Screenshot: Search results page
    - Screenshot: Quality-stratified grid
    - Screenshot: Advanced filter panel (expanded)
  - **Design Principles:** Visual consistency validation
  - **Acceptance Criteria:**
    - New baselines captured
    - Visual regression tests pass
    - No unexpected differences
  - **Dependencies:** Task 2.7.1

---

### Task Group 2.8: Phase 2 Quality Gates

**Assigned Implementer:** `ui-designer`
**Dependencies:** Task Group 2.7 complete

- [ ] **Run Phase 2 Design Checklist** (`M`) - Verify Design Brief compliance
  - **Files:** N/A (validation task)
  - **Requirements:**
    - ✓ Gallery Lobby has clear focal point with 60%+ whitespace
    - ✓ Quality-stratified grid prioritizes portfolio_worthy
    - ✓ Emotion halos visible on photos (colored glow per emotion)
    - ✓ Quality gradient applies dimming/blur correctly
    - ✓ NO emojis in filter UI (Lucide icons only)
    - ✓ Search interface uses Typography component
    - ✓ Cinematic transitions between views (Framer Motion)
    - ✓ All animations from motion tokens
  - **Design Principles:** Non-negotiable quality standards
  - **Acceptance Criteria:**
    - All checklist items verified
    - No violations found
    - Documentation updated
  - **Dependencies:** Task Group 2.7 complete

- [ ] **Run Phase 2 Performance Checklist** (`M`) - Validate performance targets
  - **Files:** N/A (validation task)
  - **Requirements:**
    - ✓ Gallery Lobby loads <1.5s
    - ✓ Search returns results <500ms
    - ✓ Story generation <3s
    - ✓ Thematic Collections load <5s
    - ✓ Filter updates <300ms (debounced)
  - **Design Principles:** Performance non-negotiable
  - **Acceptance Criteria:**
    - All performance targets met
    - Chrome DevTools measurements recorded
    - Lighthouse scores maintained 90+
  - **Dependencies:** Task 2.8.1

---

## Phase 3: Experiential Layer (3-4 weeks)

**Deliverables:** 7
**Focus:** Physics interactions, contextual cursor, emotion ambience, timeline, momentum scroll

---

### Task Group 3.1: Magnetic Filter Orbs

**Assigned Implementer:** `ui-designer`
**Dependencies:** Phase 2 complete

- [ ] **Create Magnetic Attraction Hook** (`L`) - Physics calculation for cursor attraction
  - **Files:** `src/hooks/useMagneticAttraction.ts`
  - **Requirements:**
    - Track mouse position with velocity
    - Calculate distance to orb center
    - Inverse square law for attraction strength
    - 100px magnetic radius
    - Return x/y offset for orb position
  - **Design Principles:** Physics-based interactions
  - **Acceptance Criteria:**
    - Attraction formula correct (inverse square)
    - 100px radius enforced
    - Velocity factored in
    - Returns offset values
  - **Dependencies:** Phase 2 complete

- [ ] **Create Magnetic Filter Orb Component** (`L`) - Physics-based filter button
  - **Files:** `src/components/filters/MagneticFilterOrb.tsx`
  - **Requirements:**
    - Framer Motion spring animations (stiffness 300, damping 30)
    - Apply magnetic offset from hook
    - Glow effect on hover (emotion-based color)
    - Active state: scale 0.95 + brightness 1.2
    - Brightness correlates to photo count (more photos = brighter)
    - Keyboard accessible (Tab, Space)
    - ARIA labels
  - **Design Principles:** Spring physics, emotion palette, accessibility
  - **Acceptance Criteria:**
    - Orbs attract cursor within 100px
    - Spring physics feels natural (snappy preset)
    - Active state visually distinct
    - Glow color matches emotion
    - Keyboard navigation functional
    - ARIA labels present
  - **Dependencies:** Task 3.1.1

- [ ] **Integrate Magnetic Orbs into Filter Panel** (`M`) - Replace checkbox filters
  - **Files:** Update `src/components/filters/FilterPanel.tsx` or create new version
  - **Requirements:**
    - Replace emotion and play type checkboxes with magnetic orbs
    - Grid layout for orbs
    - Mobile optimization (larger tap targets, simplified physics)
    - Maintains filter state correctly
  - **Design Principles:** Progressive enhancement for interaction
  - **Acceptance Criteria:**
    - Orbs replace checkboxes
    - Grid layout responsive
    - Filter state maintained
    - Mobile tap targets adequate (44x44px)
    - Physics simplified on mobile
  - **Dependencies:** Task 3.1.2

---

### Task Group 3.2: Contextual Cursor

**Assigned Implementer:** `ui-designer`
**Dependencies:** Task Group 3.1 complete

- [ ] **Create Mouse Position Hook** (`M`) - Track mouse with velocity
  - **Files:** `src/hooks/useMousePosition.ts`
  - **Requirements:**
    - Track x/y coordinates
    - Calculate velocity (delta per frame)
    - Debounce to 60fps max
    - Return position and velocity
  - **Design Principles:** Performance optimization
  - **Acceptance Criteria:**
    - Position tracking accurate
    - Velocity calculated correctly
    - 60fps debounce working
    - Returns position + velocity
  - **Dependencies:** Task Group 3.1 complete

- [ ] **Create Contextual Cursor Component** (`L`) - Custom cursor with emotion morphing
  - **Files:** `src/components/common/ContextualCursor.tsx`
  - **Requirements:**
    - GSAP-powered cursor following (200ms ease)
    - Default: small circle (12px, white border)
    - Photo hover: morphs based on emotion (size 20-24px, color from EMOTION_PALETTE)
    - Metadata tooltip: quality score, composition type, play type icon
    - Tooltip positioned 10px offset from cursor
    - Hide on touch devices (CSS @media pointer: coarse)
    - Respect prefers-reduced-motion
    - Z-index management (always above content)
  - **Design Principles:** Emotion palette, progressive disclosure, accessibility
  - **Acceptance Criteria:**
    - Cursor follows mouse smoothly (200ms lag)
    - Morphs color/size based on emotion
    - Metadata tooltip displays without clicks
    - Update rate <16ms (60fps)
    - Hidden on touch devices
    - Respects prefers-reduced-motion
  - **Dependencies:** Task 3.2.1

- [ ] **Integrate Contextual Cursor with Photo Cards** (`M`) - Pass metadata to cursor
  - **Files:** Update `src/components/portfolio/PhotoCard.tsx` and cursor integration
  - **Requirements:**
    - Photo card hover triggers cursor update
    - Pass photo metadata to cursor context
    - Update emotion, quality, composition data
    - Use data attributes or context API
  - **Design Principles:** Component communication
  - **Acceptance Criteria:**
    - Hover updates cursor state
    - Metadata passed correctly
    - Tooltip renders photo data
    - No performance degradation
  - **Dependencies:** Task 3.2.2

---

### Task Group 3.3: 3D Photo Card Physics

**Assigned Implementer:** `ui-designer`
**Dependencies:** Task Group 3.2 complete

- [ ] **Create Tilt Effect Hook** (`M`) - Calculate 3D tilt from mouse position
  - **Files:** `src/hooks/useTiltEffect.ts`
  - **Requirements:**
    - Calculate mouse position relative to card center
    - Apply rotateX/rotateY transforms
    - Max 15° rotation on any axis
    - Smooth spring animations
    - Return transform values
  - **Design Principles:** 3D perspective, spring physics
  - **Acceptance Criteria:**
    - Tilt calculation correct
    - Max 15° enforced
    - Spring animation smooth
    - Returns rotateX/Y values
  - **Dependencies:** Task Group 3.2 complete

- [ ] **Create Repulsion Hook** (`M`) - Calculate cursor repulsion force field
  - **Files:** `src/hooks/useRepulsion.ts`
  - **Requirements:**
    - 150px repulsion radius
    - Calculate repulsion vector from cursor to card center
    - Spring physics (stiffness 400, damping 25)
    - Affects adjacent cards within radius
    - Return offset values
  - **Design Principles:** Physics-based spatial relationships
  - **Acceptance Criteria:**
    - Repulsion radius 150px
    - Vector calculation correct
    - Spring physics smooth
    - Adjacent cards affected
    - Returns offset values
  - **Dependencies:** Task 3.3.1

- [ ] **Enhance Photo Card with 3D Physics** (`L`) - Add tilt, lift, and repulsion
  - **Files:** Update `src/components/portfolio/PhotoCard.tsx`
  - **Requirements:**
    - Apply tilt effect on hover (useTiltEffect)
    - Apply lift transformation (translateZ 20px)
    - Apply repulsion to adjacent cards (useRepulsion)
    - Box-shadow expansion on hover (md → lg)
    - Emotion-based glow intensity (portfolio_worthy: animated shimmer)
    - GPU acceleration (CSS will-change: transform)
    - Accessibility: no tilt on keyboard focus (use scale 1.02 + outline instead)
  - **Design Principles:** 3D depth, spring physics, accessibility
  - **Acceptance Criteria:**
    - Tilt effect responsive to mouse
    - Max rotation 15°
    - Lift effect visible (shadow expansion)
    - Cursor repulsion pushes adjacent cards
    - Glow color matches emotion
    - 60fps maintained with 50+ cards
    - Keyboard focus uses scale instead of tilt
  - **Dependencies:** Tasks 3.3.1, 3.3.2

---

### Task Group 3.4: Emotion Ambience

**Assigned Implementer:** `ui-designer`
**Dependencies:** Task Group 3.3 complete

- [ ] **Create Visible Photos Hook** (`M`) - Track photos in viewport
  - **Files:** `src/hooks/useVisiblePhotos.ts`
  - **Requirements:**
    - Intersection Observer with 100px root margin
    - Track intersection ratio per photo
    - Calculate dominant emotion (weighted by quality)
    - Update every 500ms (debounced)
    - Return dominant emotion and color
  - **Design Principles:** Performance optimization, quality weighting
  - **Acceptance Criteria:**
    - Intersection Observer working
    - Dominant emotion calculated correctly
    - 500ms debounce enforced
    - Quality weighting applied
    - Returns emotion + color
  - **Dependencies:** Task Group 3.3 complete

- [ ] **Create Emotion Ambience Provider** (`L`) - Context for adaptive theming
  - **Files:** `src/components/theming/EmotionAmbienceProvider.tsx`
  - **Requirements:**
    - React Context for theme state
    - Updates CSS custom properties (--accent-current, --glow-current)
    - Smooth transitions (800ms ease)
    - Opt-out toggle (stored in localStorage)
    - Falls back to gold accent if disabled
    - Respects prefers-reduced-motion (instant transitions)
  - **Design Principles:** Adaptive theming, accessibility, user control
  - **Acceptance Criteria:**
    - Context provides current emotion and color
    - CSS custom properties update smoothly (800ms)
    - Opt-out toggle functional
    - Fallback to gold working
    - Respects prefers-reduced-motion
  - **Dependencies:** Task 3.4.1

- [ ] **Integrate Emotion Ambience Across UI** (`M`) - Apply theming to components
  - **Files:** Update components to use --accent-current, --glow-current
  - **Requirements:**
    - Filter orbs use --accent-current for glow
    - Buttons use --accent-current for hover
    - Contextual cursor uses --accent-current for morph
    - Card glows use --glow-current
    - Border highlights use --accent-current
    - Background ambient lighting (10% opacity gradient overlays)
  - **Design Principles:** Consistent emotion-driven theming
  - **Acceptance Criteria:**
    - Orbs, buttons, cursor update color
    - Card glows update color
    - Background gradient applies subtly
    - No jarring color shifts
    - Smooth 800ms transitions
  - **Dependencies:** Task 3.4.2

---

### Task Group 3.5: Emotion Timeline Scrubber

**Assigned Implementer:** `ui-designer`
**Dependencies:** Task Group 3.4 complete

- [ ] **Create Timeline Scrubber Hook** (`L`) - GSAP Draggable for scrubbing
  - **Files:** `src/hooks/useTimelineScrubber.ts`
  - **Requirements:**
    - GSAP Draggable plugin integration
    - Snap-to-boundary logic at emotion transitions
    - Calculate scrubber position from drag
    - Return current index and seek function
    - Keyboard controls support
  - **Design Principles:** Smooth scrubbing, snap behavior
  - **Acceptance Criteria:**
    - Draggable working smoothly
    - Snaps to emotion transitions
    - Returns current index
    - Seek function works
    - Keyboard control ready
  - **Dependencies:** Task Group 3.4 complete

- [ ] **Create Emotion Timeline Component** (`XL`) - Interactive timeline with emotional curve
  - **Files:** `src/components/story/EmotionTimeline.tsx`
  - **Requirements:**
    - GSAP Draggable scrubber handle
    - Emotional curve graph (SVG path, color-coded segments)
    - Y-axis: emotion intensity (0-10)
    - X-axis: time/sequence position
    - Snap-to-boundary at emotion transitions
    - Playback progress indicator (animated fill)
    - Click-to-seek functionality
    - Keyboard controls (Left/Right arrows scrub, Space pause/play, Escape close)
    - Auto-advance mode (2-5s per photo, adjustable)
    - Tooltips on hover (emotion labels + timestamps)
  - **Design Principles:** Emotion palette, intuitive scrubbing, accessibility
  - **Acceptance Criteria:**
    - Scrubber draggable smoothly
    - Emotional curve rendered correctly
    - Snaps to emotion transitions
    - Click-to-seek functional
    - Keyboard controls work (arrows, space, escape)
    - Auto-play advances smoothly
    - Tooltips display emotion labels
  - **Dependencies:** Task 3.5.1

- [ ] **Integrate Timeline with Story Viewer** (`M`) - Connect timeline to photo navigation
  - **Files:** Update story viewer component, create if needed
  - **Requirements:**
    - Timeline controls photo index
    - Seek function updates displayed photo
    - Auto-play mode advances photos
    - Story metadata (NarrativeArc) passed to timeline
  - **Design Principles:** Component integration
  - **Acceptance Criteria:**
    - Timeline seek updates photo
    - Auto-play advances photos
    - Story metadata passed correctly
    - No performance degradation
  - **Dependencies:** Task 3.5.2

---

### Task Group 3.6: Momentum Scroll with Smart Snap

**Assigned Implementer:** `ui-designer`
**Dependencies:** Task Group 3.5 complete

- [ ] **Create Momentum Scroll Hook** (`L`) - Physics-based scrolling with snap
  - **Files:** `src/hooks/useMomentumScroll.ts`
  - **Requirements:**
    - Framer Motion useScroll + useSpring for inertia
    - Velocity detection (500px/s threshold)
    - Quality-threshold snap logic (portfolio_worthy, quality >= 8)
    - Identifies best photo in viewport when velocity decreases
    - Auto-centers best photo with smooth scroll
    - Progressive friction dampening
    - Respects prefers-reduced-motion
  - **Design Principles:** Physics-based natural scrolling, quality prioritization
  - **Acceptance Criteria:**
    - Velocity detection triggers at 500px/s
    - Snaps to portfolio_worthy photos only
    - Friction dampening feels natural
    - Smooth scroll to target
    - Respects prefers-reduced-motion
  - **Dependencies:** Task Group 3.5 complete

- [ ] **Create Scroll Snap Indicator** (`M`) - Visual indicators for snap targets
  - **Files:** `src/components/portfolio/ScrollSnapIndicator.tsx`
  - **Requirements:**
    - Subtle glow highlights snap targets
    - Pulse animation (opacity 0.5 → 1.0)
    - Only visible during scroll momentum
    - Fades out when settled
  - **Design Principles:** Visual affordances
  - **Acceptance Criteria:**
    - Indicators highlight snap targets
    - Pulse animation smooth
    - Visible during scroll only
    - Fade out after settle
  - **Dependencies:** Task 3.6.1

- [ ] **Integrate Momentum Scroll with Photo Grid** (`M`) - Apply to virtual grid
  - **Files:** Update photo grid component or wrapper
  - **Requirements:**
    - Apply momentum scroll hook to scrollable container
    - Works with virtual scrolling system
    - Mobile touch gesture integration (@use-gesture/react)
    - Smoother deceleration curves on mobile
    - No conflict with browser default scroll
  - **Design Principles:** Performance maintenance, cross-device support
  - **Acceptance Criteria:**
    - Momentum scroll works with virtual scrolling
    - Mobile gestures smooth
    - No conflict with native scroll
    - 60fps maintained
  - **Dependencies:** Tasks 3.6.1, 3.6.2

---

### Task Group 3.7: Play Type Morphing Grid

**Assigned Implementer:** `ui-designer`
**Dependencies:** Task Group 3.6 complete

- [ ] **Create Play Type Badge Component** (`S`) - Icon badge for play types
  - **Files:** `src/components/portfolio/PlayTypeBadge.tsx`
  - **Requirements:**
    - Lucide React icons: attack (Zap), block (Shield), dig (ArrowDown), set (Target), serve (Circle), pass (ArrowUp), celebration (Trophy)
    - Size variants: sm, md, lg
    - Icon + label or icon only
    - NO emojis
  - **Design Principles:** Lucide icons exclusively
  - **Acceptance Criteria:**
    - All 7 play types supported
    - Lucide icons used (NO ⚡🛡️🤿 emojis)
    - Size variants working
    - Icon + label option
  - **Dependencies:** Task Group 3.6 complete

- [ ] **Create Play Type Morphing Grid** (`L`) - Animated grid with shared layout
  - **Files:** `src/components/portfolio/PlayTypeMorphGrid.tsx`
  - **Requirements:**
    - Framer Motion LayoutGroup for shared layout animations
    - AnimatePresence with popLayout mode
    - 300ms stagger on entrance (index * 0.05 delay)
    - Play type badge indicators on cards
    - Layout recalculation on filter changes with spring physics
    - Exit animations (scale 0.8 + opacity 0, 200ms duration)
    - Component keys based on photo IDs
    - Maintains virtual scrolling performance
  - **Design Principles:** Smooth morphing, spring physics, performance
  - **Acceptance Criteria:**
    - Layout animations smooth on filter change
    - Stagger effect visible (300ms total)
    - Play type badges display correct icons
    - Exit animations complete before removal
    - Virtual scrolling unaffected
    - 60fps maintained during morph
  - **Dependencies:** Task 3.7.1

---

### Task Group 3.8: Phase 3 Testing

**Assigned Implementer:** `testing-engineer`
**Dependencies:** Task Groups 3.1-3.7 complete

- [ ] **Write 2-8 Focused E2E Tests** (`M`) - Strategic test coverage for Phase 3
  - **Files:** `tests/e2e/phase3-experiential-layer.spec.ts`
  - **Requirements:**
    - Test 1: Magnetic orbs attract cursor
    - Test 2: Contextual cursor displays metadata
    - Test 3: Photo cards tilt on hover
    - Test 4: Emotion ambience updates UI colors
    - Test 5-8: Critical interactions only (if needed)
  - **Design Principles:** Test behavior, not implementation
  - **Acceptance Criteria:**
    - Maximum 8 strategic tests
    - All tests pass
    - Critical interactions covered
    - No exhaustive edge case testing
  - **Dependencies:** Task Groups 3.1-3.7 complete

- [ ] **Create FPS Validation Test** (`M`) - Verify 60fps during interactions
  - **Files:** `tests/performance/fps-validation.spec.ts`
  - **Requirements:**
    - Enable FPS monitoring (Chrome DevTools Protocol)
    - Trigger animations (hover photo cards, scroll grid)
    - Measure frame rate
    - Assert 60fps maintained (58fps tolerance)
  - **Design Principles:** Performance validation
  - **Acceptance Criteria:**
    - FPS monitoring working
    - Animation tests run
    - 60fps validated (58fps minimum)
    - Measurements recorded
  - **Dependencies:** Task 3.8.1

---

### Task Group 3.9: Phase 3 Quality Gates

**Assigned Implementer:** `ui-designer`
**Dependencies:** Task Group 3.8 complete

- [ ] **Run Phase 3 Design Checklist** (`M`) - Verify Design Brief compliance
  - **Files:** N/A (validation task)
  - **Requirements:**
    - ✓ All animations use motion tokens (MOTION.spring.*)
    - ✓ 60fps maintained across all interactions (FPS meter)
    - ✓ Contextual cursor morphs color by emotion
    - ✓ Photo cards have 3D tilt + lift on hover
    - ✓ Emotion Ambience shifts UI colors smoothly
    - ✓ EMOTION_PALETTE integrated (halos, ambience, timeline, cursor)
    - ✓ prefers-reduced-motion respected (instant or fade-only)
    - ✓ NO hard-coded animation durations
  - **Design Principles:** Non-negotiable quality standards
  - **Acceptance Criteria:**
    - All checklist items verified
    - No violations found
    - FPS meter validated
    - Documentation updated
  - **Dependencies:** Task Group 3.8 complete

- [ ] **Run Phase 3 Performance Checklist** (`M`) - Validate performance targets
  - **Files:** N/A (validation task)
  - **Requirements:**
    - ✓ FPS meter shows 60fps during interactions
    - ✓ Magnetic orbs update <16ms
    - ✓ Contextual cursor update rate <16ms
    - ✓ Photo card physics smooth with 50+ cards
    - ✓ Emotion Ambience transitions without jank
    - ✓ Momentum scroll snaps without disruption
  - **Design Principles:** Performance non-negotiable
  - **Acceptance Criteria:**
    - All performance targets met
    - Chrome DevTools measurements recorded
    - No frame drops detected
  - **Dependencies:** Task 3.9.1

---

## Phase 4: Signature Moment (2-3 weeks)

**Deliverables:** 4
**Focus:** 3D Emotion Galaxy with Three.js, interactions, performance optimization

---

### Task Group 4.1: 3D Emotion Galaxy Core

**Assigned Implementer:** `ui-designer`
**Dependencies:** Phase 3 complete

- [ ] **Create Similarity Scoring Algorithm** (`L`) - Calculate 3D positions from metadata
  - **Files:** `src/utils/similarityScoring.ts`
  - **Requirements:**
    - Emotion similarity: 30% weight
    - Play type: 25% weight
    - Composition: 15% weight
    - Quality proximity: 15% weight
    - Time proximity: 10% weight
    - Color palette: 5% weight
    - Returns [x, y, z] coordinates for each photo
    - Clustering creates coherent groupings
  - **Design Principles:** Algorithmic spatial organization
  - **Acceptance Criteria:**
    - Similarity formula correct (weighted)
    - Returns 3D coordinates
    - Clustering creates coherent groups
    - Performance <1s for 500 photos
  - **Dependencies:** Phase 3 complete

- [ ] **Create Photo Sprite Component** (`M`) - Three.js textured plane
  - **Files:** `src/components/galaxy/PhotoSprite.tsx`
  - **Requirements:**
    - React Three Fiber mesh with texture
    - Photo texture (512x512 max, compressed)
    - Billboard effect (always faces camera)
    - Click handler for photo selection
    - Hover state (scale 1.2x + glow)
  - **Design Principles:** GPU optimization, interaction affordances
  - **Acceptance Criteria:**
    - Sprite renders in 3D space
    - Texture optimized (512x512 max)
    - Billboard effect working
    - Click detection functional
    - Hover scale smooth
  - **Dependencies:** Task 4.1.1

- [ ] **Create Emotion Galaxy Scene** (`XL`) - Three.js scene with 500 photos
  - **Files:** `src/components/galaxy/EmotionGalaxy.tsx`, `src/app/galaxy/page.tsx`
  - **Requirements:**
    - @react-three/fiber Canvas component
    - 500 curated photos (portfolio_worthy + emotion/play type diversity)
    - Photo sprites positioned by similarity algorithm
    - OrbitControls (zoom 5-50 units, pan ±100 units)
    - Lerp-based camera transitions (lerp factor 0.05)
    - Depth-of-field blur (EffectComposer)
    - GPU instanced rendering
    - Custom shaders for photo textures
  - **Design Principles:** 60fps non-negotiable, spatial storytelling
  - **Acceptance Criteria:**
    - 500 photos render in 3D space
    - Similarity clustering creates coherent groupings
    - Camera lerp transitions smooth
    - OrbitControls functional (zoom, pan, rotate)
    - Depth-of-field blur applied
    - 60fps maintained on target hardware (2019 MacBook Pro)
  - **Dependencies:** Tasks 4.1.1, 4.1.2

---

### Task Group 4.2: Galaxy Interaction & Navigation

**Assigned Implementer:** `ui-designer`
**Dependencies:** Task Group 4.1 complete

- [ ] **Implement Raycaster Click Detection** (`M`) - Click photo to view detail
  - **Files:** Update `src/components/galaxy/EmotionGalaxy.tsx`
  - **Requirements:**
    - Three.js Raycaster for click detection
    - Click photo sprite → open detail view (or navigate to photo page)
    - Smooth camera transition to clicked photo (GSAP)
    - 1-2 second transition with ease-out
  - **Design Principles:** Smooth interactions, GSAP timelines
  - **Acceptance Criteria:**
    - Click detection functional
    - Camera transitions to clicked photo
    - 1-2s smooth animation
    - Detail view opens correctly
  - **Dependencies:** Task Group 4.1 complete

- [ ] **Implement Galaxy Hover States** (`M`) - Interactive photo sprites
  - **Files:** Update `src/components/galaxy/PhotoSprite.tsx`
  - **Requirements:**
    - Hover scales sprite to 1.2x
    - Glow effect (emotion-based color from EMOTION_PALETTE)
    - Tooltip with photo title and emotion
    - Spring animation for hover transitions
  - **Design Principles:** Emotion palette, tactile feedback
  - **Acceptance Criteria:**
    - Hover scale smooth (1.2x)
    - Glow color matches emotion
    - Tooltip displays correctly
    - Spring animation natural
  - **Dependencies:** Task 4.2.1

- [ ] **Create Minimap Component** (`M`) - 2D overlay showing camera position
  - **Files:** `src/components/galaxy/Minimap.tsx`
  - **Requirements:**
    - 2D HTML overlay (bottom-right corner)
    - Camera position (yellow dot)
    - Cluster locations (colored dots by emotion)
    - Click minimap to fly to location (GSAP camera animation)
    - Responsive sizing
  - **Design Principles:** Spatial orientation, navigation affordances
  - **Acceptance Criteria:**
    - Minimap displays correctly
    - Camera position dot tracks correctly
    - Cluster dots color-coded
    - Click to fly functional
    - GSAP animation smooth (2s ease-out)
  - **Dependencies:** Task 4.2.1

- [ ] **Create Cluster Labels** (`M`) - Floating text sprites in 3D
  - **Files:** `src/components/galaxy/ClusterLabel.tsx`
  - **Requirements:**
    - @react-three/drei Text component
    - Shows emotion/play type label
    - Positioned above cluster centers
    - Billboard effect (always faces camera)
    - Fade in/out based on camera distance
  - **Design Principles:** Spatial labeling, readability
  - **Acceptance Criteria:**
    - Labels render above clusters
    - Text legible
    - Billboard effect working
    - Fade based on distance
  - **Dependencies:** Task 4.2.1

- [ ] **Create Galaxy Controls UI** (`M`) - Fly to Cluster buttons and reset
  - **Files:** `src/components/galaxy/GalaxyControls.tsx`
  - **Requirements:**
    - "Fly to Cluster" buttons (one per emotion cluster)
    - Reset camera button (returns to default view)
    - GSAP camera animations (2s ease-out)
    - Keyboard shortcuts (WASD movement, arrows rotation, space auto-rotate toggle)
  - **Design Principles:** Guided navigation, accessibility
  - **Acceptance Criteria:**
    - Fly to Cluster buttons functional
    - Reset button returns to default
    - GSAP animations smooth
    - Keyboard shortcuts work
  - **Dependencies:** Task 4.2.1

---

### Task Group 4.3: Performance Optimization & Fallback

**Assigned Implementer:** `ui-designer`
**Dependencies:** Task Group 4.2 complete

- [ ] **Implement Performance Monitoring** (`M`) - FPS tracking with Stats.js
  - **Files:** `src/components/galaxy/PerformanceMonitor.tsx`
  - **Requirements:**
    - Stats.js overlay (FPS, MS, MB counters)
    - Visible in dev mode only
    - Track FPS in useFrame hook
    - Trigger callback if FPS <55 for 3 consecutive frames
  - **Design Principles:** 16ms frame budget enforcement
  - **Acceptance Criteria:**
    - Stats.js overlay visible in dev
    - FPS tracking accurate
    - Callback triggers <55fps (3 frames)
    - Real-time monitoring working
  - **Dependencies:** Task Group 4.2 complete

- [ ] **Implement Automatic Quality Degradation** (`L`) - Reduce quality on low FPS
  - **Files:** Update `src/components/galaxy/EmotionGalaxy.tsx`
  - **Requirements:**
    - Triggers when FPS <55 for 3 consecutive frames
    - Step 1: Reduce particle count (500 → 300)
    - Step 2: Reduce particle count (300 → 150)
    - Step 3: Disable depth-of-field effect
    - Step 4: Simplify shaders
    - Show notification to user (performance mode activated)
  - **Design Principles:** Graceful degradation
  - **Acceptance Criteria:**
    - Degradation triggers correctly
    - Particle count reduces in steps
    - Depth-of-field disables
    - Shaders simplify
    - User notification displays
    - Performance improves after degradation
  - **Dependencies:** Task 4.3.1

- [ ] **Implement Texture Optimization** (`M`) - Compress and optimize textures
  - **Files:** Update texture loading in galaxy components
  - **Requirements:**
    - KTX2 compressed textures
    - Mipmaps for distant photos
    - Max texture size: 512x512
    - Level-of-detail system (512px close, 256px medium, 128px far)
    - Frustum culling (automatic with Three.js renderer)
  - **Design Principles:** GPU optimization
  - **Acceptance Criteria:**
    - Textures compressed (KTX2)
    - Mipmaps generated
    - LOD system working (3 levels)
    - Frustum culling enabled
    - Memory usage reduced
  - **Dependencies:** Task 4.3.1

- [ ] **Implement WebGL Fallback** (`M`) - Detect WebGL and provide fallback
  - **Files:** `src/components/galaxy/WebGLFallback.tsx`
  - **Requirements:**
    - Detect WebGL 2.0 support on mount
    - Show "3D not supported" message if unavailable
    - Provide link to standard 2D grid view
    - Fallback activates automatically
  - **Design Principles:** Progressive enhancement
  - **Acceptance Criteria:**
    - WebGL detection working
    - Fallback message displays correctly
    - Link to 2D grid functional
    - Automatic fallback on unsupported
  - **Dependencies:** Task 4.3.1

- [ ] **Create Galaxy Loading State** (`M`) - Progress indicator with preview
  - **Files:** `src/components/galaxy/GalaxyLoader.tsx`
  - **Requirements:**
    - Animated particle system preview (2D Canvas)
    - Shows % loaded and ETA
    - Skippable with any key press
    - Smooth transition to full galaxy (fade)
  - **Design Principles:** Progressive loading, user control
  - **Acceptance Criteria:**
    - Loading state displays
    - Progress % accurate
    - ETA calculated correctly
    - Skippable with key press
    - Transition to galaxy smooth
  - **Dependencies:** Task 4.3.1

---

### Task Group 4.4: Galaxy Entry Experience

**Assigned Implementer:** `ui-designer`
**Dependencies:** Task Group 4.3 complete

- [ ] **Create Galaxy Entry Transition** (`M`) - Framer Motion page transition
  - **Files:** `src/components/galaxy/GalaxyEntryTransition.tsx`
  - **Requirements:**
    - Fade out Gallery Lobby (300ms)
    - Fade in galaxy canvas (500ms)
    - Use Framer Motion AnimatePresence
    - Respect prefers-reduced-motion
  - **Design Principles:** Cinematic transitions
  - **Acceptance Criteria:**
    - Page transition smooth
    - Fade durations correct (300ms/500ms)
    - Reduced motion fallback
    - No layout shift
  - **Dependencies:** Task Group 4.3 complete

- [ ] **Create Camera Flythrough** (`L`) - Guided tour on first visit
  - **Files:** `src/components/galaxy/CameraFlythrough.tsx`
  - **Requirements:**
    - Auto-rotates through emotion clusters
    - Pauses at interesting viewpoints (2-3s each)
    - Total duration: 30 seconds
    - Skippable with click, key, or scroll
    - GSAP timeline for camera path
    - Only shows on first visit (localStorage flag)
  - **Design Principles:** Guided discovery, user control
  - **Acceptance Criteria:**
    - Flythrough completes 30s tour
    - Pauses at viewpoints (2-3s)
    - Skippable with any input
    - GSAP timeline smooth
    - Shows once only (localStorage)
  - **Dependencies:** Task 4.4.1

- [ ] **Create Instructional Overlay** (`M`) - First-visit tutorial
  - **Files:** `src/components/galaxy/InstructionalOverlay.tsx`
  - **Requirements:**
    - Modal overlay explaining controls
    - Drag to rotate, scroll to zoom instructions
    - Keyboard shortcuts listed
    - "Got it" dismissal button
    - Never shows again (localStorage flag)
  - **Design Principles:** Progressive onboarding
  - **Acceptance Criteria:**
    - Overlay displays on first visit
    - Instructions clear
    - "Got it" button dismisses
    - Shows once only (localStorage)
  - **Dependencies:** Task 4.4.1

- [ ] **Implement Gallery Exit Transition** (`M`) - Smooth return to lobby
  - **Files:** Update Galaxy and Lobby transition logic
  - **Requirements:**
    - Smooth fade (500ms)
    - Preserves scroll position in lobby
    - Framer Motion AnimatePresence
  - **Design Principles:** State preservation
  - **Acceptance Criteria:**
    - Exit transition smooth (500ms)
    - Lobby scroll position preserved
    - No layout shift
  - **Dependencies:** Task 4.4.1

---

### Task Group 4.5: Phase 4 Testing

**Assigned Implementer:** `testing-engineer`
**Dependencies:** Task Groups 4.1-4.4 complete

- [ ] **Write 2-8 Focused E2E Tests** (`M`) - Strategic test coverage for Phase 4
  - **Files:** `tests/e2e/phase4-signature-moment.spec.ts`
  - **Requirements:**
    - Test 1: Galaxy loads and renders 500 photos
    - Test 2: OrbitControls functional (zoom, pan)
    - Test 3: Click photo navigates to detail
    - Test 4: Minimap click flies to location
    - Test 5-8: Critical 3D interactions only (if needed)
  - **Design Principles:** Test behavior, not implementation
  - **Acceptance Criteria:**
    - Maximum 8 strategic tests
    - All tests pass
    - Critical 3D workflows covered
    - No exhaustive edge case testing
  - **Dependencies:** Task Groups 4.1-4.4 complete

- [ ] **Create 60fps Validation Test** (`M`) - Verify Galaxy performance
  - **Files:** `tests/performance/galaxy-fps-validation.spec.ts`
  - **Requirements:**
    - Enable FPS monitoring in Galaxy
    - Measure frame rate during interactions
    - Verify 60fps maintained with 500 photos
    - Test on benchmark device (2019 MacBook Pro equivalent)
  - **Design Principles:** Performance validation
  - **Acceptance Criteria:**
    - FPS measurement working
    - 60fps validated (58fps minimum)
    - Measurements recorded
    - Performance targets met
  - **Dependencies:** Task 4.5.1

---

### Task Group 4.6: Phase 4 Quality Gates

**Assigned Implementer:** `ui-designer`
**Dependencies:** Task Group 4.5 complete

- [ ] **Run Phase 4 Design Checklist** (`M`) - Verify Design Brief compliance
  - **Files:** N/A (validation task)
  - **Requirements:**
    - ✓ Cinematic entry sequence uses Framer Motion
    - ✓ Loading state designed (NO generic spinners)
    - ✓ Photo sprites optimized (512x512 max)
    - ✓ Performance budget enforced (16ms frame budget)
    - ✓ Graceful fallback to 2D grid
    - ✓ Camera transitions use GSAP
    - ✓ Exit transition animated (smooth fade)
  - **Design Principles:** Non-negotiable quality standards
  - **Acceptance Criteria:**
    - All checklist items verified
    - No violations found
    - Design Brief followed
    - Documentation updated
  - **Dependencies:** Task Group 4.5 complete

- [ ] **Run Phase 4 Performance Checklist** (`M`) - Validate performance targets
  - **Files:** N/A (validation task)
  - **Requirements:**
    - ✓ 60fps with 500 photos on target hardware
    - ✓ Fallback triggers on low-performance devices
    - ✓ Loading <5s on 10 Mbps connection
    - ✓ No memory leaks (10-minute continuous use)
    - ✓ FPS monitor shows accurate stats
  - **Design Principles:** Performance non-negotiable
  - **Acceptance Criteria:**
    - All performance targets met
    - Chrome DevTools measurements recorded
    - Memory profiling shows no leaks
    - Fallback tested on low-end device
  - **Dependencies:** Task 4.6.1

---

## Final Integration & Launch Preparation

### Task Group 5.1: Cross-Phase Integration Testing

**Assigned Implementer:** `testing-engineer`
**Dependencies:** All phases complete

- [ ] **Write End-to-End User Journey Tests** (`L`) - Complete persona workflows
  - **Files:** `tests/e2e/user-journeys.spec.ts`
  - **Requirements:**
    - Explorer journey: Lobby → Featured Story → Galaxy → Detail
    - Seeker journey: Search → Filter → Quality Grid → Download
    - Curator journey: Collections → Advanced Filter → Bulk Select → Export
    - Maximum 10-15 strategic tests covering all phases
  - **Design Principles:** Complete user workflows
  - **Acceptance Criteria:**
    - All 3 persona journeys tested
    - Maximum 15 tests total
    - All tests pass
    - Critical end-to-end paths covered
  - **Dependencies:** All phases complete

- [ ] **Run Full Visual Regression Suite** (`M`) - All components and pages
  - **Files:** `tests/visual/full-regression.spec.ts`
  - **Requirements:**
    - Screenshot all major pages (Lobby, Grid, Search, Collections, Galaxy)
    - Screenshot all major components (Navigation, Filters, Cards, Timeline)
    - Compare against baselines
    - Document any intentional changes
  - **Design Principles:** Visual consistency validation
  - **Acceptance Criteria:**
    - All screenshots captured
    - Visual regression tests pass
    - Intentional changes documented
    - No unexpected differences
  - **Dependencies:** Task 5.1.1

- [ ] **Run Full Lighthouse Audit** (`M`) - All pages validated
  - **Files:** N/A (validation task)
  - **Requirements:**
    - Run Lighthouse on all major pages
    - Verify scores 90+ for Performance, Accessibility, Best Practices, SEO
    - Document any scores below threshold
    - Create remediation plan for any failures
  - **Design Principles:** Quality assurance
  - **Acceptance Criteria:**
    - All pages audited
    - Scores 90+ (or documented exceptions)
    - Remediation plan created if needed
  - **Dependencies:** Task 5.1.2

---

## Summary

**Total Tasks:** 85 tasks across 22 deliverables
**Timeline:** 10-12 weeks
**Phases:** 4 phases + final integration

**Key Milestones:**
- **Phase 1 (Weeks 1-3):** Design system, virtual grid, basic filtering
- **Phase 2 (Weeks 4-6):** Gallery Lobby, search, AI story curation, collections
- **Phase 3 (Weeks 7-10):** Physics interactions, emotion ambience, timeline
- **Phase 4 (Weeks 11-12):** 3D Emotion Galaxy, performance optimization

**Quality Gates Enforced:**
- Design checklist at end of each phase
- Performance checklist at end of each phase
- Testing at end of each phase (2-8 strategic tests per phase)
- Final integration testing for complete user journeys

**Design Brief Compliance:**
- NO emojis (Lucide React icons exclusively)
- Motion tokens required (no arbitrary durations)
- 60fps non-negotiable (validated with FPS meter)
- EMOTION_PALETTE core system (halos, ambience, timeline, cursor)
- WCAG AAA contrast (7:1 minimum)
- Typography component for all text
- CSS custom properties for all colors
- Spring physics for natural interactions

**Success Criteria:**
- All 4 phases complete with quality gates passed
- 60fps animations maintained throughout
- Lighthouse scores 90+ across all pages
- Three user personas have complete, tested journeys
- Award-winning aesthetic matching Linear/Apple quality bar
