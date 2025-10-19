# Task Breakdown: UI/UX Innovation Implementation

## Overview
Total Tasks: 72
Implementation Timeline: 10 weeks (4 phases)
Assigned roles: ui-designer, testing-engineer

## Task List

### Phase 1: Foundation Fixes (Week 1)

#### Task Group 1.1: Critical Bug Fixes
**Assigned implementer:** ui-designer
**Dependencies:** None
**Priority:** BLOCKER
**Effort:** 4 hours

- [x] 1.1.1 Fix browse page image quality error
  - Update `next.config.js` to include quality 85 in valid qualities array
  - Test browse page renders without runtime errors
  - **Files:** `next.config.js`, `src/app/browse/page.tsx`
  - **Acceptance:**
    - Browse page loads without errors
    - All images render correctly with quality prop
    - No console warnings related to image optimization

- [x] 1.1.2 Verify all page routes load successfully
  - Test homepage, portfolio, browse, search, stories routes
  - Check for any runtime errors or broken links
  - **Files:** All route files in `src/app/`
  - **Acceptance:**
    - All routes load without errors
    - Navigation between pages works smoothly
    - No 404 or 500 errors

#### Task Group 1.2: Semantic HTML & Accessibility
**Assigned implementer:** ui-designer
**Dependencies:** Task Group 1.1
**Priority:** HIGH
**Effort:** 8 hours

- [x] 1.2.1 Add semantic landmarks to layout
  - Add main, nav, section landmarks to root layout
  - Implement skip-to-content link in header
  - **Files:** `src/app/layout.tsx`, `src/components/layouts/Header.tsx`
  - **Acceptance:**
    - Screen reader announces all landmarks correctly
    - Skip link works with keyboard (Tab to activate)
    - Valid HTML5 semantic structure

- [x] 1.2.2 Fix heading hierarchy on all pages
  - Ensure single H1 per page, proper H2-H6 nesting
  - Add ARIA labels where headings are visually hidden
  - **Files:** `src/app/page.tsx`, `src/app/portfolio/page.tsx`, `src/app/browse/page.tsx`
  - **Acceptance:**
    - No heading level skips (H1→H3)
    - Each page has exactly one H1
    - Heading outline is logical and complete

- [x] 1.2.3 Implement visible focus indicators
  - Add 2px outline in accent color for all interactive elements
  - Ensure focus indicators contrast 4.5:1 against backgrounds
  - **Files:** `tailwind.config.ts`, `src/app/globals.css`
  - **Acceptance:**
    - All buttons, links, inputs show visible focus
    - Focus indicators meet WCAG contrast requirements
    - Focus ring does not obscure content

#### Task Group 1.3: Loading States
**Assigned implementer:** ui-designer
**Dependencies:** Task Group 1.2
**Priority:** HIGH
**Effort:** 6 hours

- [x] 1.3.1 Create skeleton loader components
  - PhotoGridSkeleton with configurable count
  - StoryCardSkeleton for story loading
  - **Files:** `src/components/common/Skeleton.tsx`
  - **Acceptance:**
    - Skeletons animate with pulse effect
    - Aspect ratios match actual content
    - Skeletons respect grid layout

- [x] 1.3.2 Integrate skeletons into grids
  - Add loading states to PortfolioGrid, PlayTypeMorphGrid
  - Show skeletons during data fetch
  - **Files:** `src/components/portfolio/PortfolioGrid.tsx`, `src/components/gallery/PlayTypeMorphGrid.tsx`
  - **Acceptance:**
    - Skeletons appear immediately on page load
    - Smooth transition from skeleton to content
    - No layout shift when content loads

- [x] 1.3.3 Add loading indicators for async operations
  - Spinner for story generation
  - Progress indicators for filter application
  - **Files:** `src/components/common/LoadingSpinner.tsx`, `src/components/filters/PhotoFilters.tsx`
  - **Acceptance:**
    - Loading states visible for operations >300ms
    - Indicators are ARIA-live regions
    - Loading cannot be triggered multiple times

#### Task Group 1.4: Verification & Testing
**Assigned implementer:** testing-engineer
**Dependencies:** Task Groups 1.1-1.3
**Priority:** HIGH
**Effort:** 4 hours

- [x] 1.4.1 Run accessibility audit with axe-core
  - Test all pages for WCAG AA compliance
  - Document and fix any critical/serious issues
  - **Files:** `tests/accessibility/`
  - **Acceptance:**
    - No critical accessibility violations
    - All landmarks properly labeled
    - Keyboard navigation works end-to-end

- [x] 1.4.2 Create Playwright test for Phase 1 fixes
  - Test browse page renders without errors
  - Test keyboard navigation through interactive elements
  - **Files:** `tests/user-journeys/phase1-foundation.spec.ts`
  - **Acceptance:**
    - All Phase 1 tests pass
    - Visual regression tests updated
    - No console errors during test runs

---

### Phase 2: Surface Existing Innovations (Weeks 2-3)

#### Task Group 2.1: Emotion Navigation System
**Assigned implementer:** ui-designer
**Dependencies:** Phase 1 complete
**Priority:** HIGH
**Effort:** 16 hours

- [x] 2.1.1 Create EmotionContext provider
  - Context tracks active emotion across navigation
  - Persists emotion selection in session storage
  - **Files:** `src/contexts/EmotionContext.tsx`
  - **Acceptance:**
    - Context available in all components
    - Active emotion persists across page navigation
    - Session storage syncs with context state

- [x] 2.1.2 Build EmotionNavigationCard component
  - 6 cards with EMOTION_PALETTE gradients and glows
  - Hover effects: scale 1.05, brighten glow
  - **Files:** `src/components/emotion/EmotionNavigationCard.tsx`
  - **Acceptance:**
    - Cards use correct emotion colors from palette
    - Hover animations smooth (spring physics)
    - Click navigates to filtered portfolio

- [x] 2.1.3 Integrate emotion cards on homepage
  - Grid of 6 cards (2 cols mobile, 3 cols desktop)
  - Display photo count per emotion
  - **Files:** `src/app/page.tsx`
  - **Acceptance:**
    - Cards render in correct grid layout
    - Photo counts accurate from database
    - Responsive on all breakpoints

- [x] 2.1.4 Add emotion halos to photo cards
  - 2px glow in EMOTION_PALETTE color around photos
  - Halo intensity based on emotional_impact score
  - **Files:** `src/components/portfolio/PortfolioGrid.tsx`
  - **Acceptance:**
    - Halos visible with correct emotion color
    - Intensity correlates to emotional_impact (0-10)
    - Halos do not affect layout or performance

- [x] 2.1.5 Implement emotion filter chips
  - Replace current filter UI with emotion chips
  - Active chips show emotion-colored background
  - **Files:** `src/components/filters/EmotionFilterChips.tsx`
  - **Acceptance:**
    - Chips styled with EMOTION_PALETTE
    - Multiple emotions can be selected
    - Filter results update immediately

- [x] 2.1.6 Add emotion indicator to photo detail view
  - Show dominant emotion with icon and color
  - Theme shift: page adopts emotion gradient
  - **Files:** `src/app/photo/[id]/page.tsx`, `src/components/photo/EmotionIndicator.tsx`, `src/components/photo/PhotoDetail.tsx`
  - **Acceptance:**
    - Emotion displayed with correct icon and color
    - Page theme transitions smoothly (300ms)
    - Theme persists while viewing photo

#### Task Group 2.2: MagneticFilterOrb Activation
**Assigned implementer:** ui-designer
**Dependencies:** Task Group 2.1
**Priority:** HIGH
**Effort:** 12 hours

- [x] 2.2.1 Create MagneticFilterBar component
  - 6 emotion orbs in orbital formation
  - Each orb 80px diameter with emotion gradient
  - **Files:** `src/components/filters/MagneticFilterBar.tsx`
  - **Acceptance:**
    - Orbs render in circular/orbital layout
    - Each orb uses correct EMOTION_PALETTE gradient
    - Orbs spaced evenly in formation

- [x] 2.2.2 Integrate MagneticFilterOrb physics
  - Use existing MagneticFilterOrb component
  - Magnetic radius: 100px (cursor attracts orb)
  - **Files:** `src/components/filters/MagneticFilterBar.tsx` (using `src/components/interactions/MagneticFilterOrb.tsx`)
  - **Acceptance:**
    - Orbs respond to cursor within 100px
    - Spring physics feel smooth and natural
    - Multiple orbs interact with each other

- [x] 2.2.3 Add active state interactions
  - Active orb glows with emotion color
  - Orb "sticks" to cursor briefly when clicked
  - **Files:** `src/components/filters/MagneticFilterBar.tsx`
  - **Acceptance:**
    - Active state visually distinct (glow effect)
    - Click interaction feels satisfying
    - Active filters show in UI summary

- [x] 2.2.4 Add instructional tooltips
  - First-time users see "Drag to filter" hint
  - Tooltip dismisses after first interaction
  - **Files:** `src/components/filters/MagneticFilterBar.tsx`
  - **Acceptance:**
    - Tooltip appears on first visit
    - Dismisses after first orb interaction
    - Preference saved in localStorage

- [x] 2.2.5 Replace filter UI on portfolio page
  - Swap PhotoFilters with MagneticFilterBar
  - Maintain existing filter logic and state
  - **Files:** `src/app/portfolio/page.tsx`
  - **Acceptance:**
    - Magnetic orbs replace old filter UI
    - All filter functionality preserved
    - Smooth transition, no layout shift

#### Task Group 2.3: Quality Stratification
**Assigned implementer:** ui-designer
**Dependencies:** Task Group 2.1
**Priority:** MEDIUM
**Effort:** 10 hours

- [x] 2.3.1 Create QualityBadge component
  - Gold star badge for portfolio_worthy photos
  - Print-ready and social-optimized indicators
  - **Files:** `src/components/portfolio/QualityBadge.tsx`
  - **Acceptance:**
    - Badge displays correct quality flag
    - Icon and color match quality type
    - Badge positioned in top-right corner

- [x] 2.3.2 Implement 2x grid sizing for portfolio photos
  - Portfolio-worthy photos span 2 columns in grid
  - Masonry layout adjusts dynamically
  - **Files:** `src/components/portfolio/PortfolioGrid.tsx`
  - **Acceptance:**
    - Portfolio photos are 2x larger in grid
    - Layout remains balanced and responsive
    - No broken grid at narrow viewports

- [x] 2.3.3 Add quality-based sort options
  - "Portfolio First" and "Highest Quality" sort
  - Sort respects existing filters
  - **Files:** `src/components/portfolio/PortfolioGrid.tsx`
  - **Acceptance:**
    - Sort dropdown includes new options
    - Portfolio photos appear first when sorted
    - Quality scores determine order

- [x] 2.3.4 Implement graduated opacity
  - Lower quality photos have reduced opacity (0.7-1.0)
  - Opacity based on composition_score
  - **Files:** `src/components/portfolio/PhotoCard.tsx`
  - **Acceptance:**
    - Opacity correlates with quality (0-10 scale)
    - High-quality photos fully opaque
    - Effect subtle, doesn't obscure content

- [x] 2.3.5 Add shimmer animation to portfolio badges
  - Subtle gradient sweep on portfolio-worthy photos
  - Animation triggers on scroll into view
  - **Files:** `src/components/portfolio/QualityBadge.tsx`
  - **Acceptance:**
    - Shimmer effect smooth (2s duration)
    - Animation runs once per session
    - Does not affect performance

#### Task Group 2.4: Story Discovery UI
**Assigned implementer:** ui-designer
**Dependencies:** Task Group 2.1
**Priority:** MEDIUM
**Effort:** 14 hours

- [x] 2.4.1 Create StoryTypeCard component
  - Cards for 6 story types with icons and descriptions
  - Hover effect shows example photo count
  - **Files:** `src/components/story/StoryTypeCard.tsx`
  - **Acceptance:**
    - Each story type has unique icon
    - Description explains story detection algorithm
    - Hover shows estimated photo count

- [x] 2.4.2 Build StoryGenerationModal component
  - Modal with 6 story type options
  - Preview of photos that would be included
  - **Files:** `src/components/story/StoryGenerationModal.tsx`
  - **Acceptance:**
    - Modal opens with smooth animation
    - Story types displayed in grid
    - Close modal with Escape key

- [x] 2.4.3 Add "Generate Story" CTA to portfolio
  - Floating action button or prominent header button
  - Opens StoryGenerationModal on click
  - **Files:** `src/app/portfolio/page.tsx`
  - **Acceptance:**
    - CTA visible and accessible
    - Click opens modal with correct context
    - Button disabled when no photos available

- [x] 2.4.4 Implement story generation flow
  - Call /api/stories/generate with selected type
  - Show loading state during generation
  - Navigate to story viewer on success
  - **Files:** `src/components/story/StoryGenerationModal.tsx`
  - **Acceptance:**
    - API call succeeds and creates story
    - Loading spinner visible during generation
    - Redirect to /stories/[id] on success

- [x] 2.4.5 Create RecentStoriesCarousel for homepage
  - Horizontal scroll of auto-generated story cards
  - Show story type, photo count, emotional curve preview
  - **Files:** `src/components/story/RecentStoriesCarousel.tsx`
  - **Acceptance:**
    - Carousel shows 3-5 recent stories
    - Smooth horizontal scroll
    - Click card navigates to story viewer

#### Task Group 2.5: Phase 2 Testing
**Assigned implementer:** testing-engineer
**Dependencies:** Task Groups 2.1-2.4
**Priority:** HIGH
**Effort:** 8 hours

- [x] 2.5.1 Create Playwright tests for emotion navigation
  - Test emotion card click → filtered portfolio
  - Test emotion halos render with correct colors
  - **Files:** `tests/user-journeys/emotion-navigation.spec.ts`
  - **Acceptance:**
    - Emotion filter flow works end-to-end
    - Visual regression captures emotion colors
    - Tests pass on all viewport sizes

- [x] 2.5.2 Test MagneticFilterOrb interactions
  - Test orb responds to cursor proximity
  - Test active state and filter application
  - **Files:** `tests/user-journeys/magnetic-filters.spec.ts`
  - **Acceptance:**
    - Magnetic physics work in headless browser
    - Active orbs correctly filter results
    - Keyboard fallback works

- [x] 2.5.3 Test quality stratification
  - Test portfolio photos are 2x size in grid
  - Test sort options apply correctly
  - **Files:** `tests/visual/quality-stratification.spec.ts`
  - **Acceptance:**
    - Visual regression confirms 2x sizing
    - Quality badges render correctly
    - Sort updates grid order

- [x] 2.5.4 Test story generation flow
  - Test modal opens and displays story types
  - Test story creation and navigation
  - **Files:** `tests/user-journeys/story-generation.spec.ts`
  - **Acceptance:**
    - Story modal opens with CTA click
    - API generates story successfully
    - User redirected to story viewer

---

### Phase 3: Microinteractions & Polish (Weeks 4-5)

#### Task Group 3.1: Shared Element Transitions
**Assigned implementer:** ui-designer
**Dependencies:** Phase 2 complete
**Priority:** MEDIUM
**Effort:** 12 hours

- [x] 3.1.1 Create SharedElementTransition component
  - Use Framer Motion layoutId for photo morphing
  - Grid thumbnail → Detail view transition
  - **Files:** `src/components/transitions/SharedElementTransition.tsx`
  - **Acceptance:**
    - Photo morphs smoothly from grid to detail
    - Animation duration: 400ms (MOTION.duration.base)
    - Works across Next.js route changes

- [x] 3.1.2 Integrate shared elements in PortfolioGrid
  - Wrap PhotoCard with layoutId prop
  - Match layoutId in detail view
  - **Files:** `src/components/portfolio/PortfolioGrid.tsx`, `src/components/portfolio/PhotoCard.tsx`
  - **Acceptance:**
    - Each photo has unique layoutId
    - Click photo triggers morph transition
    - Grid scroll position preserved

- [x] 3.1.3 Add page transition animations
  - Fade + slide for route changes
  - Orchestrated stagger for grid items
  - **Files:** `src/app/layout.tsx`, `src/components/transitions/PageTransition.tsx`
  - **Acceptance:**
    - Pages fade out/in smoothly (300ms)
    - Grid items stagger 50ms per item
    - No flash of unstyled content

- [x] 3.1.4 Implement emotion theme persistence
  - Active emotion color persists across navigation
  - Header, backgrounds adopt emotion gradient
  - **Files:** `src/contexts/EmotionContext.tsx`, `src/app/layout.tsx`
  - **Acceptance:**
    - Theme transitions smoothly (500ms)
    - Emotion color visible in UI elements
    - Theme resets when emotion filter cleared

#### Task Group 3.2: Photo Card Physics
**Assigned implementer:** ui-designer
**Dependencies:** Task Group 3.1
**Priority:** MEDIUM
**Effort:** 10 hours

- [x] 3.2.1 Implement cursor repulsion effect
  - Cards push away within 50px of cursor
  - Use spring physics for natural movement
  - **Files:** `src/components/portfolio/PhotoCard.tsx`
  - **Acceptance:**
    - Repulsion radius exactly 50px
    - Movement uses MOTION.spring.gentle
    - Effect disabled on touch devices

- [x] 3.2.2 Add 3D tilt on hover
  - rotateX/rotateY based on cursor position
  - Maximum tilt: 10 degrees
  - **Files:** `src/components/portfolio/PhotoCard.tsx`
  - **Acceptance:**
    - Tilt responds to cursor movement
    - Returns to neutral on mouse leave
    - Smooth spring animation (200ms)

- [x] 3.2.3 Implement lift animation
  - translateZ(20px) on hover
  - Box shadow elevation increases
  - **Files:** `src/components/portfolio/PhotoCard.tsx`
  - **Acceptance:**
    - Card lifts with 20px transform
    - Shadow grows to 0 4px 20px rgba(0,0,0,0.3)
    - Animation timing: 200ms ease-out

- [x] 3.2.4 Add stagger entrance animations
  - Grid items fade in on initial load
  - 50ms delay per card, max 1s total
  - **Files:** `src/components/portfolio/PortfolioGrid.tsx`
  - **Acceptance:**
    - Cards fade from opacity 0 to 1
    - Stagger creates wave effect
    - Animation runs once per page load

#### Task Group 3.3: Scroll-Linked Animations
**Assigned implementer:** ui-designer
**Dependencies:** Task Group 3.2
**Priority:** LOW
**Effort:** 8 hours

- [x] 3.3.1 Implement parallax backgrounds
  - Section backgrounds scroll at 0.5x speed
  - Emotion-themed gradient layers
  - **Files:** `src/components/common/ParallaxSection.tsx`
  - **Acceptance:**
    - Background moves slower than content
    - No jank or layout shift
    - Disabled when prefers-reduced-motion

- [x] 3.3.2 Add progress-based reveals
  - Elements fade in as they scroll into view
  - Trigger at 20% viewport intersection
  - **Files:** `src/hooks/useScrollReveal.ts`
  - **Acceptance:**
    - Elements invisible until intersection
    - Fade in smoothly (400ms)
    - Uses Intersection Observer API

- [x] 3.3.3 Create emotion-colored scroll indicator
  - Vertical progress bar in active emotion color
  - Shows read progress on story pages
  - **Files:** `src/components/common/ScrollProgress.tsx`
  - **Acceptance:**
    - Progress bar height matches scroll percentage
    - Color matches active emotion or default accent
    - Fixed position, does not obscure content

#### Task Group 3.4: Enhanced Empty States
**Assigned implementer:** ui-designer
**Dependencies:** Task Group 3.3
**Priority:** LOW
**Effort:** 6 hours

- [x] 3.4.1 Add animated illustrations to EmptyState
  - Subtle floating animation for icons
  - Emotion-themed background gradients
  - **Files:** `src/components/common/EmptyState.tsx`
  - **Acceptance:**
    - Icons float with 2s loop animation
    - Background uses active emotion gradient
    - Illustrations are SVG, not raster

- [x] 3.4.2 Enhance CTA buttons in empty states
  - Hover effects: scale 1.05, brighten
  - Clear action labels ("Generate Story", "Browse All")
  - **Files:** `src/components/common/EmptyState.tsx`
  - **Acceptance:**
    - CTAs have clear, actionable text
    - Hover animation smooth and responsive
    - Keyboard accessible with visible focus

- [x] 3.4.3 Add contextual empty state messages
  - Different messages for filtered vs. unfiltered states
  - Suggest related actions based on context
  - **Files:** `src/components/common/EmptyState.tsx`
  - **Acceptance:**
    - Messages change based on active filters
    - Suggestions relevant to user's context
    - Friendly, encouraging tone

#### Task Group 3.5: Phase 3 Testing
**Assigned implementer:** testing-engineer
**Dependencies:** Task Groups 3.1-3.4
**Priority:** MEDIUM
**Effort:** 6 hours

- [x] 3.5.1 Test shared element transitions
  - Visual regression for grid → detail morph
  - Test scroll position preservation
  - **Files:** `tests/visual/shared-transitions.spec.ts`
  - **Acceptance:**
    - Transition screenshots match baseline
    - No layout shift during animation
    - Tests pass at 1920x1080 and 375x812

- [x] 3.5.2 Performance test for photo card physics
  - Verify 60fps during cursor interactions
  - Test with 100+ photos in grid
  - **Files:** `tests/performance/photo-physics.spec.ts`
  - **Acceptance:**
    - Frame rate stays above 60fps
    - No dropped frames during repulsion
    - CPU usage remains reasonable

- [x] 3.5.3 Test scroll animations
  - Verify parallax and reveals work correctly
  - Test reduced motion fallback
  - **Files:** `tests/user-journeys/scroll-animations.spec.ts`
  - **Acceptance:**
    - Parallax visible in screenshots
    - Reveals trigger at correct scroll positions
    - Animations disabled with prefers-reduced-motion

---

### Phase 4: Emotion Galaxy 3D (Weeks 6-10)

#### Task Group 4.1: 3D Infrastructure Setup
**Assigned implementer:** ui-designer
**Dependencies:** Phase 3 complete
**Priority:** HIGH
**Effort:** 16 hours

- [ ] 4.1.1 Install @react-three/fiber and dependencies
  - Add @react-three/fiber, @react-three/drei, three
  - Configure Next.js for WebGL compatibility
  - **Files:** `package.json`, `next.config.js`
  - **Acceptance:**
    - Packages installed with pnpm
    - No TypeScript errors for Three.js types
    - Bundle size increase tracked (<150KB)

- [ ] 4.1.2 Create EmotionGalaxy3D base component
  - Canvas setup with PerspectiveCamera
  - Scene, camera, renderer configuration
  - **Files:** `src/components/galaxy/EmotionGalaxy3D.tsx`
  - **Acceptance:**
    - Canvas renders without errors
    - Camera positioned at z: 500
    - 60fps on M1 Mac or equivalent

- [ ] 4.1.3 Add OrbitControls for camera navigation
  - Mouse drag to rotate camera
  - Scroll to zoom in/out
  - **Files:** `src/components/galaxy/EmotionGalaxy3D.tsx`
  - **Acceptance:**
    - Camera rotates smoothly with mouse
    - Zoom constrained to min/max distances
    - Controls disabled during camera flights

- [ ] 4.1.4 Implement WebGL capability detection
  - Check for WebGL support on mount
  - Fallback to 2D grid if unsupported
  - **Files:** `src/hooks/useWebGLSupport.ts`, `src/components/galaxy/EmotionGalaxy3D.tsx`
  - **Acceptance:**
    - WebGL check runs before 3D render
    - Graceful fallback to 2D on failure
    - Warning message shown to user

#### Task Group 4.2: Emotion Orbs
**Assigned implementer:** ui-designer
**Dependencies:** Task Group 4.1
**Priority:** HIGH
**Effort:** 12 hours

- [ ] 4.2.1 Create EmotionOrb mesh component
  - SphereGeometry with 100-unit radius
  - Gradient material using EMOTION_PALETTE
  - **Files:** `src/components/galaxy/EmotionOrb.tsx`
  - **Acceptance:**
    - Orb renders with correct geometry
    - Gradient matches emotion color
    - 32 segments for smoothness

- [ ] 4.2.2 Position 6 orbs in spherical formation
  - Calculate positions using spherical coordinates
  - Evenly distribute orbs in 3D space
  - **Files:** `src/components/galaxy/EmotionGalaxy3D.tsx`
  - **Acceptance:**
    - 6 orbs visible from default camera position
    - Orbs evenly spaced in sphere
    - No orbs overlap or clip

- [ ] 4.2.3 Add PointLight glow to orbs
  - Emotion-colored light emanates from each orb
  - Light intensity: 1.5, distance: 300 units
  - **Files:** `src/components/galaxy/EmotionOrb.tsx`
  - **Acceptance:**
    - Glow visible in scene
    - Light color matches emotion
    - No performance degradation

- [ ] 4.2.4 Implement orb click interactions
  - Raycasting to detect orb clicks
  - Trigger camera flight to orb on click
  - **Files:** `src/components/galaxy/EmotionOrb.tsx`
  - **Acceptance:**
    - Click detection accurate
    - Only one orb clicked at a time
    - Cursor changes to pointer on hover

#### Task Group 4.3: Photo Particle System
**Assigned implementer:** ui-designer
**Dependencies:** Task Group 4.2
**Priority:** HIGH
**Effort:** 18 hours

- [ ] 4.3.1 Create PhotoParticle component
  - PlaneGeometry (20x20 units) with photo texture
  - MeshBasicMaterial with transparency
  - **Files:** `src/components/gallery/PhotoParticle.tsx`
  - **Acceptance:**
    - Photo texture loads correctly
    - Aspect ratio preserved (match photo)
    - Transparency works for rounded corners

- [ ] 4.3.2 Implement spatial positioning algorithm
  - Position based on emotion + intensity score
  - Distance from orb = intensity * 50 units
  - **Files:** `src/lib/galaxy/spatial-positioning.ts`
  - **Acceptance:**
    - Photos cluster around correct emotion orb
    - Higher intensity photos closer to center
    - No overlapping photos

- [ ] 4.3.3 Create PhotoParticleSystem manager
  - Renders 100-500 photo particles efficiently
  - LOD system: only render visible photos
  - **Files:** `src/components/gallery/PhotoParticleSystem.tsx`
  - **Acceptance:**
    - 500 photos render at 60fps desktop
    - LOD reduces draw calls for distant photos
    - Frustum culling excludes off-screen photos

- [ ] 4.3.4 Add magnetic drift toward cursor
  - Adapt MagneticFilterOrb physics to 3D
  - Photos within 100 units drift toward cursor
  - **Files:** `src/components/gallery/PhotoParticle.tsx`
  - **Acceptance:**
    - Photos respond to cursor in 3D space
    - Drift feels natural with spring physics
    - Effect disabled on mobile

- [ ] 4.3.5 Implement photo click interactions
  - Click photo → camera zooms in, shows detail overlay
  - 2D overlay appears over 3D scene
  - **Files:** `src/components/gallery/PhotoParticle.tsx`, `src/components/gallery/PhotoDetailOverlay.tsx`
  - **Acceptance:**
    - Click zooms camera to photo
    - Detail overlay shows metadata
    - Close button returns camera to previous position

#### Task Group 4.4: Camera Flight Animations
**Assigned implementer:** ui-designer
**Dependencies:** Task Group 4.3
**Priority:** HIGH
**Effort:** 10 hours

- [ ] 4.4.1 Create camera flight system with GSAP
  - Animate camera position and lookAt target
  - Easing: power2.inOut, duration: 1.5s
  - **Files:** `src/lib/galaxy/camera-flights.ts`
  - **Acceptance:**
    - Camera flies smoothly to target
    - lookAt updates during animation
    - Flight can be interrupted by new click

- [ ] 4.4.2 Implement flyToEmotion function
  - Target position: orb position + z: 150
  - Camera looks at orb center during flight
  - **Files:** `src/lib/galaxy/camera-flights.ts`
  - **Acceptance:**
    - Camera ends at correct distance from orb
    - Orb stays centered in view
    - Animation completes in 1.5s

- [ ] 4.4.3 Add resetCamera function
  - Returns to default view (z: 500, center focus)
  - Triggered by "Reset View" button or Escape key
  - **Files:** `src/lib/galaxy/camera-flights.ts`
  - **Acceptance:**
    - Camera returns to initial position
    - Animation smooth and interruptible
    - OrbitControls re-enabled after reset

- [ ] 4.4.4 Implement keyboard navigation for orbs
  - Arrow keys: cycle through emotions
  - Enter: fly to selected emotion orb
  - **Files:** `src/components/galaxy/EmotionGalaxy3D.tsx`
  - **Acceptance:**
    - Arrow keys highlight next/prev orb
    - Enter triggers camera flight
    - Visual indicator shows selected orb

#### Task Group 4.5: Story Constellations
**Assigned implementer:** ui-designer
**Dependencies:** Task Group 4.4
**Priority:** MEDIUM
**Effort:** 12 hours

- [ ] 4.5.1 Create StoryConstellation component
  - THREE.Line connects photos in story sequence
  - Line color matches story emotion theme
  - **Files:** `src/components/galaxy/StoryConstellation.tsx`
  - **Acceptance:**
    - Lines drawn between story photos
    - Path follows chronological order
    - Color uses EMOTION_PALETTE

- [ ] 4.5.2 Fetch story data for constellation rendering
  - Query /api/stories for active stories
  - Map story photos to 3D positions
  - **Files:** `src/lib/galaxy/story-data.ts`
  - **Acceptance:**
    - Stories fetched on galaxy mount
    - Photo positions match particle system
    - Data updates when new story generated

- [ ] 4.5.3 Add constellation hover interactions
  - Highlight path on hover
  - Show story title tooltip
  - **Files:** `src/components/galaxy/StoryConstellation.tsx`
  - **Acceptance:**
    - Path brightens on hover
    - Tooltip positioned near cursor
    - Hover works with raycasting

- [ ] 4.5.4 Implement "follow story" camera path
  - Click constellation → camera follows path
  - Pauses at each photo for 2 seconds
  - **Files:** `src/lib/galaxy/camera-flights.ts`
  - **Acceptance:**
    - Camera visits each photo in sequence
    - Smooth transitions between photos
    - Skip or pause with spacebar

#### Task Group 4.6: View Toggle System
**Assigned implementer:** ui-designer
**Dependencies:** Task Groups 4.3-4.5
**Priority:** MEDIUM
**Effort:** 8 hours

- [ ] 4.6.1 Create ViewToggle UI component
  - Toggle between 2D grid, 2.5D isometric, 3D space
  - Keyboard shortcut: D key
  - **Files:** `src/components/galaxy/ViewToggle.tsx`
  - **Acceptance:**
    - 3 buttons for each view mode
    - Active mode highlighted
    - D key cycles through modes

- [ ] 4.6.2 Implement 2D grid fallback
  - Standard PortfolioGrid when 3D disabled
  - Maintains emotion filtering and sorting
  - **Files:** `src/components/galaxy/EmotionGalaxy3D.tsx`
  - **Acceptance:**
    - 2D grid renders when WebGL unavailable
    - All filtering works in 2D mode
    - Seamless toggle from 3D to 2D

- [ ] 4.6.3 Implement 2.5D isometric view
  - Photos positioned in isometric grid
  - CSS transforms for pseudo-3D effect
  - **Files:** `src/components/gallery/IsometricGrid.tsx`
  - **Acceptance:**
    - Isometric perspective visible
    - Photos maintain proper spacing
    - Performance equivalent to 2D grid

- [ ] 4.6.4 Add transition animations between views
  - Smooth fade between 2D/2.5D/3D modes
  - Photo positions interpolate during transition
  - **Files:** `src/components/galaxy/EmotionGalaxy3D.tsx`
  - **Acceptance:**
    - 500ms fade between modes
    - No jarring layout shifts
    - Mode preference saved to localStorage

#### Task Group 4.7: Accessibility & Performance
**Assigned implementer:** ui-designer
**Dependencies:** Task Groups 4.1-4.6
**Priority:** HIGH
**Effort:** 10 hours

- [ ] 4.7.1 Implement keyboard navigation in 3D
  - Arrow keys: move camera position
  - Tab: cycle through photos
  - **Files:** `src/components/galaxy/EmotionGalaxy3D.tsx`
  - **Acceptance:**
    - Arrow keys move camera smoothly
    - Tab highlights next photo
    - Escape resets camera view

- [ ] 4.7.2 Add screen reader support
  - ARIA labels for 3D scene elements
  - Announce camera position changes
  - **Files:** `src/components/galaxy/EmotionGalaxy3D.tsx`
  - **Acceptance:**
    - Scene described to screen readers
    - Position changes announced
    - Fallback instructions provided

- [ ] 4.7.3 Implement reduced motion support
  - Disable camera flights when prefers-reduced-motion
  - Instant position changes instead of animations
  - **Files:** `src/components/galaxy/EmotionGalaxy3D.tsx`
  - **Acceptance:**
    - Camera jumps instead of flying
    - 3D scene still functional
    - User preference detected correctly

- [ ] 4.7.4 Optimize 3D rendering performance
  - Frustum culling for off-screen objects
  - Instanced rendering for repeated geometries
  - **Files:** `src/components/gallery/PhotoParticleSystem.tsx`
  - **Acceptance:**
    - 60fps with 500 photos on desktop
    - 30fps minimum on mobile devices
    - Draw calls reduced by 50%+

- [ ] 4.7.5 Add performance monitoring
  - FPS counter in dev mode
  - Warn user if FPS drops below 30
  - **Files:** `src/components/galaxy/PerformanceMonitor.tsx`
  - **Acceptance:**
    - FPS visible in bottom corner
    - Warning shown for sustained low FPS
    - Auto-reduce quality if performance poor

#### Task Group 4.8: Phase 4 Testing
**Assigned implementer:** testing-engineer
**Dependencies:** Task Groups 4.1-4.7
**Priority:** HIGH
**Effort:** 12 hours

- [ ] 4.8.1 Test 3D scene initialization
  - Verify Canvas renders without errors
  - Test WebGL fallback on unsupported browsers
  - **Files:** `tests/user-journeys/emotion-galaxy-init.spec.ts`
  - **Acceptance:**
    - 3D scene loads successfully
    - Fallback to 2D works correctly
    - No console errors in 3D mode

- [ ] 4.8.2 Test emotion orb interactions
  - Test orb clicks trigger camera flights
  - Test keyboard navigation between orbs
  - **Files:** `tests/user-journeys/emotion-galaxy-orbs.spec.ts`
  - **Acceptance:**
    - Click orb → camera flies correctly
    - Arrow keys cycle through orbs
    - Enter key triggers flight

- [ ] 4.8.3 Test photo particle interactions
  - Test photo clicks show detail overlay
  - Test magnetic drift with cursor
  - **Files:** `tests/user-journeys/emotion-galaxy-photos.spec.ts`
  - **Acceptance:**
    - Photos clickable in 3D space
    - Detail overlay shows correct metadata
    - Magnetic drift visible and smooth

- [ ] 4.8.4 Test story constellation rendering
  - Test paths drawn between story photos
  - Test "follow story" camera animation
  - **Files:** `tests/user-journeys/emotion-galaxy-stories.spec.ts`
  - **Acceptance:**
    - Constellation paths render correctly
    - Camera follows path smoothly
    - All story photos visited in order

- [ ] 4.8.5 Test view toggle system
  - Test 2D/2.5D/3D mode switching
  - Test D key keyboard shortcut
  - **Files:** `tests/user-journeys/emotion-galaxy-views.spec.ts`
  - **Acceptance:**
    - All 3 views render correctly
    - Smooth transitions between modes
    - Mode preference persists

- [ ] 4.8.6 Performance and accessibility testing
  - Test 60fps maintained in 3D
  - Test keyboard navigation end-to-end
  - **Files:** `tests/performance/emotion-galaxy.spec.ts`, `tests/accessibility/emotion-galaxy-a11y.spec.ts`
  - **Acceptance:**
    - FPS stays above 60 on desktop
    - All 3D interactions keyboard accessible
    - Reduced motion disables animations

---

## Execution Order

**Recommended implementation sequence:**

1. **Phase 1 (Week 1):** Foundation Fixes
   - Task Groups 1.1 → 1.2 → 1.3 → 1.4

2. **Phase 2 (Weeks 2-3):** Surface Innovations
   - Task Group 2.1 (Emotion Navigation) first
   - Task Groups 2.2, 2.3, 2.4 can be parallelized
   - Task Group 2.5 (Testing) last

3. **Phase 3 (Weeks 4-5):** Microinteractions
   - Task Groups 3.1 → 3.2 → 3.3 → 3.4 → 3.5

4. **Phase 4 (Weeks 6-10):** Emotion Galaxy 3D
   - Task Group 4.1 (Infrastructure) must complete first
   - Task Groups 4.2, 4.3 can overlap partially
   - Task Groups 4.4, 4.5 depend on 4.3
   - Task Group 4.6 depends on 4.3-4.5
   - Task Groups 4.7, 4.8 are final

## Critical Path Dependencies

- Phase 2 cannot start until Phase 1 complete
- Phase 3 can start after Phase 2 Task Group 2.1 complete (emotion system)
- Phase 4 requires Phase 3 complete for optimal integration
- All testing task groups depend on their phase's implementation groups

## Success Metrics

**Phase 1:**
- Zero accessibility violations (axe-core)
- All pages load without errors
- 100% keyboard navigable

**Phase 2:**
- Emotion navigation discoverable (6 cards on homepage)
- MagneticFilterOrb visible and functional
- Story generation flow end-to-end working
- Portfolio photos visually stratified by quality

**Phase 3:**
- Shared element transitions smooth (<400ms)
- 60fps maintained during all animations
- Photo card physics feel natural and responsive

**Phase 4:**
- 3D scene renders at 60fps desktop, 30fps mobile
- Camera flights smooth and interruptible
- All interactions keyboard accessible
- WebGL fallback functional
- Story constellations render correctly

## Notes

- **Testing approach:** Each phase includes focused testing (2-8 tests per task group). Testing-engineer adds max 10 strategic tests at end of each phase.
- **Standards compliance:** All implementations must follow Next.js 15, React 19, TypeScript 5.8 patterns documented in agent-os/standards/.
- **Performance budget:** Lighthouse score must remain 90+ throughout all phases.
- **Accessibility:** WCAG AA compliance minimum for all new components.
- **Browser support:** Modern browsers only (Chrome, Firefox, Safari, Edge last 2 versions). Phase 4 requires WebGL.
