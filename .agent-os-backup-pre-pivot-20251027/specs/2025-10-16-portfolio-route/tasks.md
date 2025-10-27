# Task Breakdown: Portfolio Route with Quality Gradient & 3D Gravity Views

## Overview
Total Tasks: 15 tasks across 4 task groups
Estimated Timeline: 7-10 working days
Assigned Implementers: ui-designer, testing-engineer
Critical Path: Task Groups 1 → 2 → 3 → 4 (sequential dependencies)

## Executive Summary

This implementation assembles existing, fully-built portfolio components ([`QualityGradientGrid`](../../src/components/portfolio/QualityGradientGrid.tsx:24), [`PortfolioGrid`](../../src/components/portfolio/PortfolioGrid.tsx:11), [`PhotoGravity`](../../src/components/portfolio/PhotoGravity.tsx:53)) into the new `/portfolio` route. The work focuses on **component orchestration and view mode management** rather than component development. All dependencies are already installed, and all reusable components are 100% complete.

**Key Simplifications:**
- No database changes required (existing schema supports all features)
- No new portfolio components to build (reuse existing 100%)
- No API changes needed (existing `/api/gallery` endpoint handles all queries)
- Test focus: Core user workflows only (15-25 tests maximum)

**Timeline Breakdown:**
- **Days 1-2:** Route foundation and basic structure
- **Days 3-5:** View mode integration (gradient, grid, 3D)
- **Days 6-7:** Navigation, polish, and transitions
- **Days 8-10:** Test review, gap analysis, and validation

**Risk Mitigation:**
- Start with route foundation to enable early testing
- Add progressive enhancement (gradient → grid → 3D views)
- Test at each checkpoint before moving to next phase
- All tasks have clear rollback paths
- 3D view has performance safeguards (100 photo limit)

## Task List

---

### Task Group 1: Route Setup & Foundation (Days 1-2)

**Assigned implementer:** ui-designer
**Dependencies:** None
**Parallel Opportunities:** None (foundation must complete first)
**Estimated Time:** 6-8 hours

---

#### Task 1.1: Write 2-8 focused tests for portfolio page route
**Priority:** Critical
**Estimated Time:** 2 hours
**Dependencies:** None
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Write 2-8 tests maximum for critical portfolio page behaviors
- [x] Test route returns 200 status
- [x] Test page loads with header and view mode toggles
- [x] Test loading state displays during data fetch
- [x] Test error state displays on API failure
- [x] Test only portfolio-quality photos loaded (quality 8+)
- [x] Skip exhaustive edge case testing

**Files to Create/Modify:**
- `tests/e2e/portfolio-page.spec.ts` (create)

**Implementation Notes:**
- Follow [`test-writing.md`](../../agent-os/standards/testing/test-writing.md): Focus on core user flows only
- Use Playwright for E2E tests
- Mock SWR for controlled data states
- Test API call includes `portfolioWorthy=true&minQualityScore=8` params
- Reference: "Write Minimal Tests During Development" standard

---

#### Task 1.2: Create portfolio page route with basic structure
**Priority:** Critical
**Estimated Time:** 2 hours
**Dependencies:** None
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Create `/portfolio` route at `src/app/portfolio/page.tsx`
- [x] Export default Next.js page component with 'use client' directive
- [x] Add page header with "Portfolio" title
- [x] Add semantic HTML structure (header, main, sections)
- [x] Add photo count display area
- [x] Ensure route returns 200 status on navigation
- [x] Follow Next.js 15 App Router patterns

**Files to Create/Modify:**
- `src/app/portfolio/page.tsx` (create)

**Implementation Notes:**
- Use Next.js 15.1.6 App Router conventions
- Mark as client component ('use client') for SWR hooks and state management
- Reference [`spec.md`](spec.md) lines 424-470 for component structure
- Match design system patterns from existing pages
- Header should include space for view mode toggles

---

#### Task 1.3: Set up SWR data fetching for portfolio photos
**Priority:** Critical
**Estimated Time:** 2 hours
**Dependencies:** Task 1.2
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Import useSWR from 'swr' package (already installed)
- [x] Create fetcher function for `/api/gallery` endpoint
- [x] Fetch with query params: `portfolioWorthy=true&minQualityScore=8`
- [x] Configure SWR with revalidateOnFocus: false, dedupingInterval: 60000
- [x] Handle loading state with isLoading flag
- [x] Handle error state with error object
- [x] Extract photos array from response data
- [x] Add loading spinner component
- [x] Add error state with retry button

**Files to Create/Modify:**
- `src/app/portfolio/page.tsx` (modify)
- Import from [`src/components/common/LoadingState.tsx`](../../src/components/common/LoadingState.tsx) (existing)
- Import from [`src/components/common/ErrorState.tsx`](../../src/components/common/ErrorState.tsx) (existing)

**Implementation Notes:**
- SWR already installed at version 2.2.5
- Cache for 60 seconds to reduce API calls
- API route already exists at [`src/app/api/gallery/route.ts`](../../src/app/api/gallery/route.ts)
- Reference [`spec.md`](spec.md) lines 454-461 for state management pattern
- Verify only photos with quality score 8+ are returned

---

#### Task 1.4: Ensure route foundation tests pass
**Priority:** Critical
**Estimated Time:** 1 hour
**Dependencies:** Tasks 1.1-1.3
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Run ONLY the 2-8 tests written in Task 1.1
- [x] All tests pass without errors
- [x] Route navigates successfully
- [x] Loading and error states render correctly
- [x] Portfolio photos fetch with correct filters
- [x] Do NOT run entire test suite

**Files to Create/Modify:**
- None (validation step)

**Implementation Notes:**
- Use `npx playwright test tests/e2e/portfolio-page.spec.ts` to run specific tests
- Fix any failing tests before proceeding to Task Group 2
- Expected: 5-8 passing tests
- Verify in browser: `/portfolio` route loads and shows loading state

---

### Task Group 2: View Mode Integration (Days 3-5)

**Assigned implementer:** ui-designer
**Dependencies:** Task Group 1 complete
**Parallel Opportunities:** Tasks 2.1, 2.3, 2.5 can prepare in parallel after 2.0
**Estimated Time:** 12-16 hours

---

#### Task 2.0: Write 2-8 focused tests for view mode functionality
**Priority:** High
**Estimated Time:** 2 hours
**Dependencies:** Task Group 1
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Write 2-8 tests maximum for view mode behaviors
- [ ] Test view mode toggle buttons render correctly
- [ ] Test default view mode is 'gradient'
- [ ] Test clicking toggle switches view mode
- [ ] Test URL params sync with view mode state
- [ ] Test each view component renders when selected
- [ ] Test 3D view shows fallback if >100 photos
- [ ] Skip exhaustive transition testing

**Files to Create/Modify:**
- `tests/e2e/portfolio-view-modes.spec.ts` (create)

**Implementation Notes:**
- Focus on user interaction flows only
- Use Playwright for E2E tests
- Test behavior, not implementation details
- Mock photo data for controlled testing

---

#### Task 2.1: Create view mode toggle system
**Priority:** Critical
**Estimated Time:** 3 hours
**Dependencies:** Task Group 1
**Parallel:** Can prepare in parallel with Task 2.3
**Risk:** Low

**Acceptance Criteria:**
- [ ] Create ViewModeButton component (inline in page.tsx)
- [ ] Add 3 toggle buttons: Quality Gradient, Grid, 3D Gravity
- [ ] Initialize view mode state: `useState<'gradient' | 'grid' | '3d'>('gradient')`
- [ ] Wire toggle click handlers to update state
- [ ] Sync view mode changes to URL params
- [ ] Add active state styling (black bg for active, gray for inactive)
- [ ] Add icons for each mode (🎨 gradient, 📐 grid, 🌐 3D)
- [ ] Ensure buttons accessible via keyboard (Tab navigation)
- [ ] Add ARIA labels for each button
- [ ] Add aria-pressed attribute for active state

**Files to Create/Modify:**
- `src/app/portfolio/page.tsx` (modify)

**Implementation Notes:**
- Reference [`spec.md`](spec.md) lines 496-516 for toggle implementation
- Use Next.js `useRouter` and `useSearchParams` for URL management
- Match button styles from existing black CTA buttons
- Position toggles below title in header section
- Reference [`spec.md`](spec.md) lines 572-595 for ViewModeButton component

---

#### Task 2.2: Wire URL parameter persistence
**Priority:** High
**Estimated Time:** 2 hours
**Dependencies:** Task 2.1
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Initialize view mode from URL params on mount
- [ ] Update URL when view mode changes via `router.push()`
- [ ] Handle browser back/forward navigation
- [ ] Use query format: `?view=gradient`, `?view=grid`, `?view=3d`
- [ ] Default to 'gradient' if no param or invalid param
- [ ] Preserve view mode when returning from photo detail

**Files to Create/Modify:**
- `src/app/portfolio/page.tsx` (modify)

**Implementation Notes:**
- Reference [`spec.md`](spec.md) lines 446-451 for URL sync pattern
- Reference [`spec.md`](spec.md) lines 599-613 for popstate handling
- Use `useEffect` to sync searchParams to state
- Handle popstate event for back/forward navigation

---

#### Task 2.3: Integrate QualityGradientGrid component
**Priority:** Critical
**Estimated Time:** 2 hours
**Dependencies:** Task 2.2
**Parallel:** Can prepare in parallel with Task 2.1
**Risk:** Low

**Acceptance Criteria:**
- [ ] Import [`QualityGradientGrid`](../../src/components/portfolio/QualityGradientGrid.tsx:24) component
- [ ] Conditionally render when `viewMode === 'gradient'`
- [ ] Pass portfolio photos as `photos` prop
- [ ] Wire `onPhotoClick` handler for navigation
- [ ] Test GSAP animations render correctly
- [ ] Verify brightness/blur effects work (50%-100%, 0-5px)
- [ ] Test photo click navigation to `/photo/[id]`
- [ ] Verify 60fps animation performance in browser

**Files to Create/Modify:**
- `src/app/portfolio/page.tsx` (modify)

**Implementation Notes:**
- Component is 100% complete at [`src/components/portfolio/QualityGradientGrid.tsx`](../../src/components/portfolio/QualityGradientGrid.tsx)
- No modifications needed to the component
- Reference [`spec.md`](spec.md) lines 534-538 for integration
- GSAP animations are built-in with 1.5s duration, 0.02s stagger

---

#### Task 2.4: Integrate PortfolioGrid component
**Priority:** Critical
**Estimated Time:** 2 hours
**Dependencies:** Task 2.2
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Import [`PortfolioGrid`](../../src/components/portfolio/PortfolioGrid.tsx:11) component
- [ ] Conditionally render when `viewMode === 'grid'`
- [ ] Pass portfolio photos as `photos` prop
- [ ] Test masonry layout renders correctly
- [ ] Verify sort controls work (quality, emotion, recent)
- [ ] Test photo click navigation (built-in to component)
- [ ] Verify quality badges display on top-left
- [ ] Test responsive layout (1/2/3/4 columns)

**Files to Create/Modify:**
- `src/app/portfolio/page.tsx` (modify)

**Implementation Notes:**
- Component is 100% complete at [`src/components/portfolio/PortfolioGrid.tsx`](../../src/components/portfolio/PortfolioGrid.tsx)
- No modifications needed to the component
- Reference [`spec.md`](spec.md) lines 540-542 for integration
- Component handles routing internally via Next.js Link

---

#### Task 2.5: Integrate PhotoGravity component (3D view)
**Priority:** Critical
**Estimated Time:** 3 hours
**Dependencies:** Task 2.2
**Parallel:** Can prepare in parallel with Task 2.3
**Risk:** Medium (3D performance considerations)

**Acceptance Criteria:**
- [ ] Import [`PhotoGravity`](../../src/components/portfolio/PhotoGravity.tsx:53) component
- [ ] Conditionally render when `viewMode === '3d'`
- [ ] Limit photos to first 100 for performance (use `useMemo`)
- [ ] Add fallback message if more than 100 photos
- [ ] Add "Switch to Grid View" button in fallback
- [ ] Wire `onPhotoClick` handler for navigation
- [ ] Test Three.js scene initializes correctly
- [ ] Verify OrbitControls work (drag, zoom)
- [ ] Test similarity clustering algorithm
- [ ] Verify 60fps performance with 100 photos in browser
- [ ] Add error boundary fallback to Grid view if 3D fails

**Files to Create/Modify:**
- `src/app/portfolio/page.tsx` (modify)

**Implementation Notes:**
- Component is 100% complete at [`src/components/portfolio/PhotoGravity.tsx`](../../src/components/portfolio/PhotoGravity.tsx)
- No modifications needed to the component
- Reference [`spec.md`](spec.md) lines 544-565 for integration with fallback
- Reference [`spec.md`](spec.md) lines 617-631 for photo limiting logic
- Use `useMemo` to sort by quality and take top 100
- Requires WebGL 2.0 support - handle gracefully if not available

---

#### Task 2.6: Ensure view mode integration tests pass
**Priority:** Critical
**Estimated Time:** 1 hour
**Dependencies:** Tasks 2.0-2.5
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Run ONLY the 2-8 tests written in Task 2.0
- [x] All view mode toggle tests pass
- [x] All component rendering tests pass
- [x] URL parameter sync tests pass
- [x] 3D fallback tests pass if applicable
- [x] Do NOT run entire test suite

**Files to Create/Modify:**
- None (validation step)

**Implementation Notes:**
- Use `npx playwright test tests/e2e/portfolio-view-modes.spec.ts`
- Fix any failing tests before proceeding to Task Group 3
- Expected: 6-8 passing tests
- Manually verify all 3 view modes in browser

---

### Task Group 3: Navigation & Polish (Days 6-7)

**Assigned implementer:** ui-designer
**Dependencies:** Task Group 2 complete
**Parallel Opportunities:** Tasks 3.1-3.2 can run in parallel
**Estimated Time:** 8-10 hours

---

#### Task 3.0: Write 2-8 focused tests for navigation and polish
**Priority:** High
**Estimated Time:** 2 hours
**Dependencies:** Task Group 2
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Write 2-8 tests maximum for navigation behaviors
- [x] Test photo click navigates to `/photo/[id]`
- [x] Test return URL preserves view mode
- [x] Test view mode transitions are smooth
- [x] Test photo count updates correctly
- [x] Test responsive layout at 3 breakpoints
- [x] Skip performance and animation tests

**Files to Create/Modify:**
- `tests/e2e/portfolio-navigation.spec.ts` (create)

**Implementation Notes:**
- Focus on user navigation flows
- Test cross-view navigation patterns
- Verify state persistence

---

#### Task 3.1: Implement photo click navigation
**Priority:** Critical
**Estimated Time:** 2 hours
**Dependencies:** Task Group 2
**Parallel:** Can run parallel with Task 3.2
**Risk:** Low

**Acceptance Criteria:**
- [x] Create `handlePhotoClick` function
- [x] Navigate to `/photo/${photo.id}?returnUrl=/portfolio?view=${viewMode}`
- [x] Pass returnUrl to preserve current view mode
- [x] Wire handler to QualityGradientGrid's `onPhotoClick` prop
- [x] Wire handler to PhotoGravity's `onPhotoClick` prop
- [x] Verify PortfolioGrid handles routing internally (no action needed)
- [x] Test navigation from all 3 view modes
- [x] Verify return from photo detail preserves view mode

**Files to Create/Modify:**
- `src/app/portfolio/page.tsx` (modify)

**Implementation Notes:**
- Reference [`spec.md`](spec.md) lines 470-472 for navigation pattern
- Use Next.js `useRouter` for navigation
- returnUrl format: `/portfolio?view=gradient` (or grid, 3d)
- Photo detail page will use returnUrl for back navigation

---

#### Task 3.2: Add view mode transition animations
**Priority:** High
**Estimated Time:** 2 hours
**Dependencies:** Task Group 2
**Parallel:** Can run parallel with Task 3.1
**Risk:** Low

**Acceptance Criteria:**
- [x] Add crossfade transition between view modes
- [x] Use CSS transitions or Framer Motion
- [x] Set transition duration: 300-500ms
- [x] Prevent layout shift during mode switch
- [x] Add fade-out/fade-in effect
- [x] Verify photo data persists during transition
- [x] Test smooth transitions between all mode pairs
- [x] Add brief loading indicator during mode switch if needed

**Files to Create/Modify:**
- `src/app/portfolio/page.tsx` (modify)

**Implementation Notes:**
- Reference [`spec.md`](spec.md) lines 393-403 for transition requirements
- Use Framer Motion `AnimatePresence` for smooth transitions
- Keep transitions subtle and performant
- Ensure accessibility during transitions (maintain focus)

---

#### Task 3.3: Add photo count display
**Priority:** High
**Estimated Time:** 1 hour
**Dependencies:** Task Group 2
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Display photo count in header: `"${photos.length} portfolio photos"`
- [x] Show loading text while photos fetching
- [x] Update count dynamically if photos change
- [x] Style consistently with design system
- [x] Position below view mode toggles

**Files to Create/Modify:**
- `src/app/portfolio/page.tsx` (modify)

**Implementation Notes:**
- Reference [`spec.md`](spec.md) lines 519-522 for count display
- Simple text display, no complex logic needed
- Use gray color for subtle emphasis

---

#### Task 3.4: Ensure responsive layout
**Priority:** High
**Estimated Time:** 2 hours
**Dependencies:** Tasks 3.1-3.3
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Apply Tailwind CSS classes for responsive padding and margins
- [x] Ensure proper spacing between header, toggles, and view content
- [x] Test layout at mobile (375px), tablet (768px), desktop (1280px+)
- [x] Verify no horizontal scroll at any breakpoint
- [x] Ensure view mode toggles stack on mobile if needed
- [x] Test all 3 view modes at each breakpoint
- [x] Match visual design from [`spec.md`](spec.md) lines 44-77

**Files to Create/Modify:**
- `src/app/portfolio/page.tsx` (modify)

**Implementation Notes:**
- Use Tailwind CSS 4.1.13 (already installed)
- Follow [`responsive.md`](../../agent-os/standards/frontend/responsive.md) standards for breakpoints
- Reference existing pages for spacing patterns
- Mobile: Stack toggles or use smaller buttons
- Desktop: Horizontal toggle row

---

#### Task 3.5: Ensure navigation and polish tests pass
**Priority:** Critical
**Estimated Time:** 1 hour
**Dependencies:** Tasks 3.0-3.4
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Run ONLY the 2-8 tests written in Task 3.0
- [x] All navigation tests pass
- [x] Photo count display tests pass
- [x] Responsive layout tests pass
- [x] Do NOT run entire test suite

**Files to Create/Modify:**
- None (validation step)

**Implementation Notes:**
- Use `npx playwright test tests/e2e/portfolio-navigation.spec.ts`
- Fix any failing tests before proceeding to Task Group 4
- Expected: 5-8 passing tests
- Manually test navigation flow in browser

---

### Task Group 4: Test Review & Gap Analysis (Days 8-10)

**Assigned implementer:** testing-engineer
**Dependencies:** Task Groups 1-3 complete
**Parallel Opportunities:** None (must review all prior work)
**Estimated Time:** 8-12 hours

---

#### Task 4.1: Review tests from Task Groups 1-3
**Priority:** High
**Estimated Time:** 2 hours
**Dependencies:** Task Groups 1-3
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Review 2-8 tests from Task 1.1 (route foundation)
- [ ] Review 2-8 tests from Task 2.0 (view modes)
- [ ] Review 2-8 tests from Task 3.0 (navigation)
- [ ] Total existing tests: approximately 6-24 tests
- [ ] Document test coverage for critical workflows
- [ ] Identify any redundant or overlapping tests

**Files to Create/Modify:**
- None (review step)

**Implementation Notes:**
- Read test files to understand existing coverage
- Use code coverage tool to identify gaps (if available)
- Focus review on portfolio feature only, not entire app
- Check for: route access, view modes, navigation, responsive design

---

#### Task 4.2: Analyze test coverage gaps for portfolio feature only
**Priority:** High
**Estimated Time:** 2 hours
**Dependencies:** Task 4.1
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Identify critical user workflows lacking test coverage
- [ ] Focus ONLY on gaps related to portfolio route feature
- [ ] Prioritize end-to-end workflows over unit test gaps
- [ ] Do NOT assess entire application test coverage
- [ ] Document up to 10 critical gaps maximum

**Files to Create/Modify:**
- None (analysis step)

**Implementation Notes:**
- Critical workflows to check:
  - Full user journey: land on /portfolio → switch views → click photo → return
  - Keyboard navigation through view mode toggles
  - 3D view performance fallback (>100 photos)
  - Error recovery flows
  - URL parameter edge cases
- Skip: performance tests, accessibility audits, visual regression (unless critical)

---

#### Task 4.3: Write up to 10 additional strategic tests maximum
**Priority:** High
**Estimated Time:** 4 hours
**Dependencies:** Task 4.2
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Add maximum of 10 new tests to fill identified critical gaps
- [ ] Focus on integration points and end-to-end workflows
- [ ] Do NOT write comprehensive coverage for all scenarios
- [ ] Skip edge cases, performance tests, and accessibility tests unless business-critical
- [ ] Use Playwright for E2E tests, Jest for integration tests

**Files to Create/Modify:**
- `tests/e2e/portfolio-integration.spec.ts` (create if needed)
- Additional test files as needed (max 2 new files)

**Implementation Notes:**
- Follow [`test-writing.md`](../../agent-os/standards/testing/test-writing.md): "Test Only Core User Flows"
- Prioritize:
  1. Full user journey (portfolio → view mode → photo detail → back)
  2. Keyboard navigation for accessibility
  3. 3D view fallback with >100 photos
  4. Critical error scenarios
- Expected: 4-10 additional tests maximum
- Total test count should remain under 35 tests

---

#### Task 4.4: Run feature-specific tests only
**Priority:** Critical
**Estimated Time:** 2 hours
**Dependencies:** Task 4.3
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Run ONLY tests related to portfolio route feature
- [ ] Tests from Task 1.1 pass (2-8 tests)
- [ ] Tests from Task 2.0 pass (2-8 tests)
- [ ] Tests from Task 3.0 pass (2-8 tests)
- [ ] Tests from Task 4.3 pass (4-10 tests)
- [ ] Expected total: approximately 10-34 tests maximum
- [ ] Do NOT run the entire application test suite
- [ ] Verify critical workflows pass

**Files to Create/Modify:**
- None (validation step)

**Implementation Notes:**
- Run: `npx playwright test tests/e2e/portfolio-*.spec.ts`
- All tests should pass before considering feature complete
- Fix any failing tests before final review
- Generate test coverage report if needed

---

## Execution Order & Critical Path

### Sequential Dependencies (Must follow this order)
1. **Task Group 1** (Days 1-2) - Foundation must complete first
2. **Task Group 2** (Days 3-5) - Requires route to exist
3. **Task Group 3** (Days 6-7) - Requires view modes working
4. **Task Group 4** (Days 8-10) - Requires all features implemented

### Critical Path (Blocking Tasks)
These tasks block other work and should be prioritized:
- Task 1.2: Create portfolio page route (blocks all other tasks)
- Task 1.3: Set up SWR data fetching (blocks view mode integration)
- Task 2.1: Create view mode toggle system (blocks all view integrations)
- Task 2.2: Wire URL parameter persistence (blocks navigation testing)
- Task 3.1: Implement photo click navigation (blocks end-to-end flow)

### Parallel Work Opportunities
These tasks can run simultaneously:
- **After Task Group 1 completes:**
  - Task 2.0 (write view mode tests) + Task 2.1 (create toggle system)
  - Task 2.3, 2.4, 2.5 (prepare component integrations) can be started in parallel
- **After Task 2.2 completes:**
  - Task 3.1 (photo navigation) + Task 3.2 (transitions) + Task 3.3 (photo count)

---

## Testing Checkpoints

### Checkpoint 1: Route Foundation (End of Day 2)
**Run:** Tests from Task 1.1 (2-8 tests)
**Verify:**
- /portfolio route returns 200
- Page renders header with title
- Loading state works
- Error state works
- Only portfolio photos (quality 8+) loaded
- Photo count displays

### Checkpoint 2: View Mode Integration (End of Day 5)
**Run:** Tests from Task 1.1 + Task 2.0 (4-16 tests total)
**Verify:**
- All 3 view mode toggles render
- View mode switches correctly
- URL params sync with state
- QualityGradientGrid renders with GSAP animations
- PortfolioGrid renders with masonry layout
- PhotoGravity renders with 3D scene
- 3D fallback works with >100 photos

### Checkpoint 3: Navigation & Polish (End of Day 7)
**Run:** Tests from Tasks 1.1 + 2.0 + 3.0 (6-24 tests total)
**Verify:**
- Photo click navigates correctly
- Return URL preserves view mode
- View mode transitions animate smoothly
- Photo count updates correctly
- Responsive layout works at 3 breakpoints
- Keyboard navigation through toggles works

### Checkpoint 4: Final Validation (End of Day 10)
**Run:** All portfolio feature tests (10-34 tests maximum)
**Verify:**
- All critical workflows pass
- End-to-end journey works
- 3D performance fallback works
- Error recovery works
- URL parameter edge cases handled
- Responsive design correct

---

## Rollback Plan

Each task group has a safe rollback strategy:

### If Task Group 1 Fails
**Impact:** No portfolio route exists
**Rollback:** Delete `src/app/portfolio/` directory
**Risk:** Very Low (isolated new files)

### If Task Group 2 Fails
**Impact:** View modes not working
**Rollback:** Revert changes to `src/app/portfolio/page.tsx`, keep route with static content
**Risk:** Low (no existing components modified)
**Note:** Components are 100% complete, only integration code would need rollback

### If Task Group 3 Fails
**Impact:** Navigation or polish features not working
**Rollback:** Revert navigation and transition code, keep view modes functional
**Risk:** Low (isolated additions to page.tsx)
**Note:** Can ship without transitions if needed

### If Task Group 4 Fails
**Impact:** Additional tests not passing
**Rollback:** Remove additional tests, keep feature with 6-24 tests from earlier groups
**Risk:** Very Low (tests only, no production code affected)

---

## Definition of Done

The portfolio route feature is complete when:

1. **Functionality:**
   - [ ] /portfolio route returns 200 status
   - [ ] Only portfolio photos (quality 8+) load from API
   - [ ] 3 view mode toggles work (Quality Gradient, Grid, 3D Gravity)
   - [ ] Default view is Quality Gradient
   - [ ] QualityGradientGrid renders with GSAP brightness/blur effects
   - [ ] PortfolioGrid renders with masonry layout and sort controls
   - [ ] PhotoGravity renders 3D scene with OrbitControls
   - [ ] 3D view limits to 100 photos with fallback message
   - [ ] Photo click navigates to `/photo/[id]` from all views
   - [ ] Return URL preserves view mode preference
   - [ ] View mode persists in URL params

2. **Testing:**
   - [ ] 10-34 feature-specific tests written (6-24 from task groups + up to 10 strategic)
   - [ ] Core user workflows covered
   - [ ] Critical integration points tested
   - [ ] Tests follow standards (minimal, behavioral, fast)
   - [ ] All tests passing

3. **Quality:**
   - [ ] No TypeScript errors
   - [ ] No console errors in browser
   - [ ] Responsive on mobile (375px), tablet (768px), desktop (1280px+)
   - [ ] Keyboard navigation works through all toggles
   - [ ] Loading and error states display correctly
   - [ ] View mode transitions smooth (300-500ms)
   - [ ] GSAP animations maintain 60fps
   - [ ] 3D view maintains 60fps with 100 photos
   - [ ] Photo count displays accurately

4. **Accessibility:**
   - [ ] ARIA labels on all interactive elements
   - [ ] aria-pressed on toggle buttons
   - [ ] Keyboard accessible (Tab, Enter, Space)
   - [ ] Focus management during transitions
   - [ ] Screen reader announces view mode changes
   - [ ] WCAG 2.1 AA color contrast met

5. **Documentation:**
   - [ ] Code comments for complex logic (if any)
   - [ ] Implementation notes in task files
   - [ ] README updated with /portfolio route (optional)

---

## Standards Compliance Checklist

### Global Standards
- [ ] Use Next.js 15.1.6 App Router patterns
- [ ] Use TypeScript for type safety
- [ ] Follow DRY principle (reuse existing components 100%)
- [ ] Remove any dead code or commented blocks
- [ ] Use meaningful variable and function names
- [ ] Follow [`conventions.md`](../../agent-os/standards/global/conventions.md)

### Frontend Standards
- [ ] Components have single responsibility
- [ ] State kept as local as possible
- [ ] Clear component interfaces with typed props
- [ ] Use Tailwind CSS 4.1.13 for styling
- [ ] Responsive design for 3 breakpoints (375px, 768px, 1280px+)
- [ ] Follow [`components.md`](../../agent-os/standards/frontend/components.md)
- [ ] Follow [`responsive.md`](../../agent-os/standards/frontend/responsive.md)

### Testing Standards
- [ ] Write minimal tests during development (2-8 per group)
- [ ] Test behavior, not implementation
- [ ] Focus on core user flows only
- [ ] Defer edge case testing
- [ ] Fast execution (tests run in seconds)
- [ ] Follow [`test-writing.md`](../../agent-os/standards/testing/test-writing.md)

### API Standards
- [ ] Use existing `/api/gallery` endpoint (no new endpoints needed)
- [ ] Proper query parameter usage (`portfolioWorthy=true&minQualityScore=8`)
- [ ] Handle loading and error states
- [ ] Consistent error messages
- [ ] Follow [`api.md`](../../agent-os/standards/backend/api.md)

### Accessibility Standards
- [ ] Keyboard navigation support
- [ ] ARIA attributes on interactive elements
- [ ] Focus management
- [ ] Color contrast WCAG AA
- [ ] Screen reader support
- [ ] Follow [`accessibility.md`](../../agent-os/standards/frontend/accessibility.md)

---

## Dependencies & Prerequisites

### Required Dependencies (Already Installed)
- next@15.1.6 - App Router framework
- react@19.1.1 - UI library
- framer-motion@12.23.22 - Animation library
- gsap@3.12.5 - GSAP animations (Quality Gradient)
- three@0.169.0 - 3D rendering library
- @react-three/fiber@8.17.8 - React Three.js renderer
- @react-three/drei@9.112.0 - Three.js helpers (OrbitControls, Html)
- swr@2.2.5 - Data fetching
- tailwindcss@4.1.13 - Styling

### Required Components (Already Built - 100% Complete)
- [`QualityGradientGrid`](../../src/components/portfolio/QualityGradientGrid.tsx) - GSAP-animated grid with brightness/blur effects
- [`PortfolioGrid`](../../src/components/portfolio/PortfolioGrid.tsx) - Masonry grid with sort controls
- [`PhotoGravity`](../../src/components/portfolio/PhotoGravity.tsx) - 3D gravity clustering view
- [`PortfolioFilters`](../../src/components/portfolio/PortfolioFilters.tsx) - Filter management (optional)
- [`usePhotoFilters`](../../src/hooks/usePhotoFilters.ts) - Client-side filtering hook (optional)
- [`LoadingState`](../../src/components/common/LoadingState.tsx) - Loading spinner
- [`ErrorState`](../../src/components/common/ErrorState.tsx) - Error display with retry

### Required API Endpoints
- GET [`/api/gallery`](../../src/app/api/gallery/route.ts) (exists, no changes needed)
  - Supports query params: `portfolioWorthy=true&minQualityScore=8`

### Required Types
- [`Photo`](../../src/types/photo.ts) (exists)
- [`PhotoMetadata`](../../src/types/photo.ts) (exists)
- [`PhotoFilterState`](../../src/types/photo.ts) (exists, optional usage)

---

## Success Metrics

### Performance Targets
- [ ] Time to First Byte < 600ms
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] View mode switch time < 500ms
- [ ] GSAP animation frame rate: Solid 60fps
- [ ] 3D rendering frame rate: Solid 60fps with up to 100 photos
- [ ] Memory usage stable during view mode transitions (< 10% increase)

### User Experience Targets
- [ ] Zero layout shift during view mode switching
- [ ] Clear loading states for all async operations
- [ ] User-friendly error messages with retry options
- [ ] Keyboard accessible throughout
- [ ] Smooth transitions between all view modes
- [ ] Intuitive view mode toggle design

### Code Quality Targets
- [ ] Zero TypeScript errors
- [ ] Zero ESLint errors
- [ ] All portfolio feature tests passing (10-34 tests)
- [ ] Code review approved
- [ ] No console warnings in production build

### Accessibility Targets
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation through all interactive elements
- [ ] Screen reader compatibility
- [ ] Focus management during view transitions
- [ ] Appropriate ARIA labels and attributes

---

## Notes for Implementers

### For ui-designer (Task Groups 1-3)
- You're orchestrating existing components, not building new ones
- All portfolio components are 100% complete - just integrate them
- Focus on layout, view mode management, and responsive design
- Reference existing pages for patterns (e.g., browse route)
- Test each view mode thoroughly in browser as you build
- Verify 60fps animations visually (GSAP and 3D)
- Test on multiple screen sizes as you build
- Pay attention to URL parameter sync - critical for navigation

### For testing-engineer (Task Group 4)
- Review existing tests from previous groups first
- Only add tests if critical gaps exist
- Maximum 10 additional tests - be highly selective
- Focus on end-to-end workflows, not unit test coverage
- Prioritize:
  1. Full user journey (portfolio → view modes → photo detail → back)
  2. Keyboard navigation for accessibility
  3. 3D view fallback with >100 photos
  4. Critical error scenarios
- Use Playwright for E2E, Jest for integration (if needed)
- Test count should remain under 35 tests total

### General Tips
- Commit after each completed task for granular rollback
- Test in browser as you build, don't wait until the end
- Start with quality gradient (simplest view) to get flow working
- Add grid view next (medium complexity)
- Add 3D view last (most complex, has fallback)
- Ask questions if spec is unclear
- Reference existing code patterns (especially browse route)
- Keep changes minimal and focused
- Performance test 3D view with 100 photos before moving on

---

## Browser Support

- Chrome 90+ (primary target)
- Firefox 88+ (full support)
- Safari 14+ (iOS Safari 14+)
- Edge 90+ (full support)
- **Note:** 3D view requires WebGL 2.0 support
  - Gracefully disable 3D toggle if WebGL not available
  - Show message: "3D view requires WebGL 2.0"

---

## Error Handling Scenarios

1. **API fetch fails:** Display error state with retry button
2. **No portfolio photos found:** Show empty state with message and link to browse
3. **3D view initialization fails:** Fallback to Grid view with error message
4. **More than 100 photos in 3D mode:** Show fallback message with Grid view option
5. **Network offline:** Show offline indicator, enable retry when online
6. **Invalid view mode in URL:** Reset to default 'gradient' view
7. **Photo navigation fails:** Stay on portfolio page with error toast
8. **WebGL not supported:** Disable 3D view option, show only Gradient and Grid toggles

---

## Performance Optimization Notes

### Quality Gradient View
- GSAP animations are already optimized (will-change, transform-based)
- Hardware acceleration enabled automatically
- Stagger prevents simultaneous animations

### Grid View
- Framer Motion LayoutGroup handles smooth transitions
- Virtual scrolling not needed (portfolio count reasonable)
- CSS Grid provides efficient layout

### 3D Gravity View
- Strict 100 photo limit enforces performance
- Use `useMemo` to sort and slice photo array
- Three.js scene already optimized by component
- OrbitControls damping set to 0.05 for smooth interaction
- Lerp interpolation (0.1) provides smooth movement without jank

### General Optimizations
- SWR caching reduces API calls (60s dedupe)
- Loading states prevent layout shift
- Lazy load components if initial bundle size grows
- Monitor memory usage during view switches
- Use Chrome DevTools Performance tab to verify 60fps

---

## Final Checklist Before Ship

- [ ] All 10-34 tests passing
- [ ] Manual test: /portfolio loads in < 2 seconds
- [ ] Manual test: All 3 view modes render correctly
- [ ] Manual test: Photo navigation works from each view
- [ ] Manual test: Return from photo preserves view mode
- [ ] Manual test: 3D fallback shows for >100 photos
- [ ] Manual test: Keyboard navigation works
- [ ] Manual test: Responsive on mobile, tablet, desktop
- [ ] Manual test: Error states display correctly
- [ ] Lighthouse Performance score > 90
- [ ] No TypeScript errors
- [ ] No console errors in production
- [ ] Code review approved
- [ ] Documentation updated