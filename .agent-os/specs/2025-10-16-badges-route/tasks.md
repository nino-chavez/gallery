# Task Breakdown: Profile Badges Route with Discovery Progress

## Overview
Total Tasks: 11 tasks across 3 task groups
Estimated Timeline: 5-6 working days
Assigned Implementers: ui-designer, testing-engineer
Critical Path: Task Groups 1 → 2 → 3 (sequential dependencies)

## Executive Summary

This implementation creates the `/profile/badges` route that displays the gamification/discovery layer. The work focuses on **pure integration** of the existing [`BadgeCollection`](../../src/components/delight/DiscoveryBadges.tsx:180) component with localStorage persistence. This is the **simplest of the three new routes** with no API calls, no complex state management, and no interactive features beyond basic navigation.

**Key Simplifications:**
- No database changes required (localStorage only)
- No API endpoints needed (purely client-side)
- No new components to build (100% reuse of BadgeCollection)
- No complex interactions (static display + single navigation button)
- Minimal test coverage (10-18 tests maximum vs 30+ for other routes)

**Risk Mitigation:**
- Start with route foundation and localStorage integration
- Add progressive enhancement (stats → progress → navigation)
- Test at each checkpoint before moving to next phase
- All tasks have clear rollback paths

## Task List

---

### Task Group 1: Route Foundation & localStorage (Days 1-2)

**Assigned implementer:** ui-designer
**Dependencies:** None
**Parallel Opportunities:** None (foundation must complete first)
**Estimated Time:** 6-8 hours

---

#### Task 1.1: Write 2-4 focused tests for badges page route
**Priority:** Critical
**Estimated Time:** 1.5 hours
**Dependencies:** None
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Write 2-4 tests maximum for critical badges page behaviors
- [ ] Test route returns 200 status
- [ ] Test page loads with header and badge grid
- [ ] Test localStorage loads correctly
- [ ] Skip exhaustive edge case testing

**Files to Create/Modify:**
- `tests/e2e/badges-page.spec.ts` (create)

**Implementation Notes:**
- Follow test-writing.md: Focus on core user flows only
- Use Playwright for E2E tests
- Mock localStorage for controlled states
- Reference: "Write Minimal Tests During Development" standard

---

#### Task 1.2: Create badges page route with basic structure
**Priority:** Critical
**Estimated Time:** 2 hours
**Dependencies:** None
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Create `/profile/badges` route at `src/app/profile/badges/page.tsx`
- [ ] Export default Next.js page component with 'use client' directive
- [ ] Add page header with "Your Badge Collection" title
- [ ] Add semantic HTML structure (header, main, sections)
- [ ] Ensure route returns 200 status on navigation
- [ ] Follow Next.js 15 App Router patterns

**Files to Create/Modify:**
- `src/app/profile/badges/page.tsx` (create)

**Implementation Notes:**
- Use Next.js 15.1.6 App Router conventions
- Mark as client component ('use client') for localStorage hooks
- Reference spec.md lines 146-156 for component structure
- Match design system patterns from existing pages

---

#### Task 1.3: Implement localStorage access utilities
**Priority:** Critical
**Estimated Time:** 2 hours
**Dependencies:** Task 1.2
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Create utility functions to read from localStorage
- [ ] Implement loadUnlockedBadges() function
- [ ] Implement loadBadgeProgress() function
- [ ] Add try-catch error handling for localStorage failures
- [ ] Return default empty state on errors
- [ ] Define TypeScript interfaces for badge and discovery data

**Files to Create/Modify:**
- `src/lib/badge-storage.ts` (create)

**Implementation Notes:**
- Reference spec.md lines 580-668 for utility implementation
- localStorage keys: 'discovery-badges', 'discovery-progress'
- Handle cases where localStorage is disabled
- Parse JSON with validation

---

#### Task 1.4: Load badge data on component mount
**Priority:** Critical
**Estimated Time:** 1.5 hours
**Dependencies:** Task 1.3
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Use useEffect to load data on mount
- [ ] Call loadUnlockedBadges() and store in state
- [ ] Call loadBadgeProgress() and store in state
- [ ] Handle loading errors gracefully
- [ ] Set default empty states on errors
- [ ] Verify no console errors on missing data

**Files to Create/Modify:**
- `src/app/profile/badges/page.tsx` (modify)

**Implementation Notes:**
- Reference spec.md lines 429-451 for loading pattern
- No loading spinner needed (localStorage is synchronous)
- State structure: `Set<string>` for unlocked badges, object for progress
- Empty dependency array for useEffect (run once on mount)

---

#### Task 1.5: Ensure route foundation tests pass
**Priority:** Critical
**Estimated Time:** 1 hour
**Dependencies:** Tasks 1.1-1.4
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Run ONLY the 2-4 tests written in Task 1.1
- [ ] All tests pass without errors
- [ ] Route navigates successfully
- [ ] localStorage data loads correctly
- [ ] Do NOT run entire test suite

**Files to Create/Modify:**
- None (validation step)

**Implementation Notes:**
- Use `npx playwright test tests/e2e/badges-page.spec.ts` to run specific tests
- Fix any failing tests before proceeding to Task Group 2
- Expected: 3-4 passing tests

---

### Task Group 2: Badge Display & Stats (Days 3-4)

**Assigned implementer:** ui-designer
**Dependencies:** Task Group 1 complete
**Parallel Opportunities:** Tasks 2.1-2.2 can run in parallel after 2.0
**Estimated Time:** 8-10 hours

---

#### Task 2.0: Write 2-6 focused tests for badge display and stats
**Priority:** High
**Estimated Time:** 2 hours
**Dependencies:** Task Group 1
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Write 2-6 tests maximum for badge display behaviors
- [ ] Test BadgeCollection renders with correct unlock states
- [ ] Test stats bar displays correct counts
- [ ] Test progress indicators show correctly
- [ ] Test locked vs unlocked badge styling
- [ ] Skip exhaustive state combination testing

**Files to Create/Modify:**
- `tests/e2e/badges-display.spec.ts` (create)

**Implementation Notes:**
- Focus on visual states and data display
- Use Playwright for E2E tests
- Test behavior, not implementation details

---

#### Task 2.1: Integrate BadgeCollection component
**Priority:** Critical
**Estimated Time:** 2 hours
**Dependencies:** Task Group 1
**Parallel:** Can run parallel with Task 2.2
**Risk:** Low

**Acceptance Criteria:**
- [ ] Import BadgeCollection from `src/components/delight/DiscoveryBadges.tsx`
- [ ] Import AVAILABLE_BADGES array
- [ ] Pass unlockedBadges Set as badges prop
- [ ] Render BadgeCollection in correct position per spec layout
- [ ] Verify all 6 badges render in grid (2x3 mobile, 3x2 desktop)
- [ ] Verify locked/unlocked states display correctly

**Files to Create/Modify:**
- `src/app/profile/badges/page.tsx` (modify)

**Implementation Notes:**
- BadgeCollection is 100% complete at lines 180+ in DiscoveryBadges.tsx
- Component already includes all styling (gradient/grayscale)
- Reference spec.md lines 106-118 for component usage
- No modifications to BadgeCollection needed

---

#### Task 2.2: Implement stats bar component
**Priority:** Critical
**Estimated Time:** 2 hours
**Dependencies:** Task Group 1
**Parallel:** Can run parallel with Task 2.1
**Risk:** Low

**Acceptance Criteria:**
- [ ] Create stats bar below header
- [ ] Display badges unlocked count (X/6)
- [ ] Calculate and display exploration percentage
- [ ] Format with trophy and magnifying glass emoji icons
- [ ] Add bullet separator between stats
- [ ] Make responsive (stack on mobile if needed)

**Files to Create/Modify:**
- `src/app/profile/badges/page.tsx` (modify)

**Implementation Notes:**
- Reference spec.md lines 86-91 for stats bar specifications
- Stats: "🏆 3/6 Badges Unlocked • 48% Explored"
- Center alignment, max-width: 600px
- Use discoveries.totalPhotosViewed for percentage calculation

---

#### Task 2.3: Implement badge progress calculator
**Priority:** High
**Estimated Time:** 2.5 hours
**Dependencies:** Task 2.1
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Import EMOTION_ICONS and PLAY_TYPE_ICONS from motion-tokens.ts
- [ ] Create getBadgeProgress() helper function
- [ ] Calculate emotion exploration progress (X/5 emotions)
- [ ] Calculate play type progress (X/8 play types)
- [ ] Calculate portfolio photo progress (X/10 found)
- [ ] Calculate peak moment, golden hour, print-ready progress
- [ ] Return formatted progress strings (e.g., "7/10 found")
- [ ] Return "✓ Complete" for unlocked badges

**Files to Create/Modify:**
- `src/app/profile/badges/page.tsx` (modify)

**Implementation Notes:**
- Reference spec.md lines 548-577 for progress calculation logic
- Import motion tokens: lines 139-142 in spec
- Each badge has different completion criteria
- Progress only shown for locked badges

---

#### Task 2.4: Display progress indicators on badge cards
**Priority:** High
**Estimated Time:** 1.5 hours
**Dependencies:** Task 2.3
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Show progress text below each badge description
- [ ] Display progress for locked badges only
- [ ] Display "✓ Complete" for unlocked badges
- [ ] Format: xs font, semibold, centered
- [ ] Ensure text readable on both gradient and gray backgrounds

**Files to Create/Modify:**
- `src/app/profile/badges/page.tsx` (modify)

**Implementation Notes:**
- May require enhancing BadgeCollection to accept progress prop
- Reference spec.md lines 672-734 for enhanced component pattern
- Alternative: Display progress in separate detail section below grid

---

#### Task 2.5: Ensure badge display tests pass
**Priority:** Critical
**Estimated Time:** 1 hour
**Dependencies:** Tasks 2.0-2.4
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Run ONLY the 2-6 tests written in Task 2.0
- [ ] All badge display tests pass
- [ ] Stats bar rendering tests pass
- [ ] Progress indicators display correctly
- [ ] Do NOT run entire test suite

**Files to Create/Modify:**
- None (validation step)

**Implementation Notes:**
- Use `npx playwright test tests/e2e/badges-display.spec.ts`
- Fix any failing tests before proceeding to Task Group 3
- Expected: 4-6 passing tests

---

### Task Group 3: Test Review & Gap Analysis (Days 5-6)

**Assigned implementer:** testing-engineer
**Dependencies:** Task Groups 1-2 complete
**Parallel Opportunities:** None (must review all prior work)
**Estimated Time:** 6-8 hours

---

#### Task 3.1: Add "Keep Exploring" navigation button
**Priority:** Critical
**Estimated Time:** 1.5 hours
**Dependencies:** Task Group 2
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Create button below badge grid, centered
- [ ] Use black background, white text, rounded-full style
- [ ] Add rocket emoji (🚀) before text
- [ ] Wire onClick to navigate to /browse
- [ ] Add hover animation (scale 1.05)
- [ ] Add focus styles for keyboard accessibility
- [ ] Ensure keyboard navigable (Tab + Enter)

**Files to Create/Modify:**
- `src/app/profile/badges/page.tsx` (modify)

**Implementation Notes:**
- Reference spec.md lines 93-100 for button specifications
- Use Next.js useRouter for navigation
- Position: margin-top: 48px below grid
- ARIA label: "Return to browse page to continue exploring"

---

#### Task 3.2: Write 2-4 focused tests for navigation
**Priority:** High
**Estimated Time:** 1.5 hours
**Dependencies:** Task 3.1
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Write 2-4 tests maximum for navigation functionality
- [ ] Test "Keep Exploring" button navigates to /browse
- [ ] Test keyboard navigation (Tab to button, Enter to navigate)
- [ ] Test button accessibility (ARIA labels, focus indicators)
- [ ] Skip exhaustive navigation scenario testing

**Files to Create/Modify:**
- `tests/e2e/badges-navigation.spec.ts` (create)

**Implementation Notes:**
- Focus on happy path navigation only
- Test keyboard accessibility as priority
- Verify focus visible on button

---

#### Task 3.3: Review tests from Task Groups 1-2
**Priority:** High
**Estimated Time:** 1.5 hours
**Dependencies:** Task Groups 1-2
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Review 2-4 tests from Task 1.1 (route foundation)
- [ ] Review 2-6 tests from Task 2.0 (badge display)
- [ ] Review 2-4 tests from Task 3.2 (navigation)
- [ ] Total existing tests: approximately 6-14 tests
- [ ] Document test coverage for critical workflows
- [ ] Identify any redundant or overlapping tests

**Files to Create/Modify:**
- None (review step)

**Implementation Notes:**
- Read test files to understand existing coverage
- Focus review on badges feature only, not entire app
- Check for test quality and effectiveness

---

#### Task 3.4: Analyze test coverage gaps for badges feature only
**Priority:** High
**Estimated Time:** 1.5 hours
**Dependencies:** Task 3.3
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Identify critical user workflows lacking test coverage
- [ ] Focus ONLY on gaps related to badges route feature
- [ ] Prioritize end-to-end workflows over unit test gaps
- [ ] Do NOT assess entire application test coverage
- [ ] Document up to 4-6 critical gaps maximum

**Files to Create/Modify:**
- None (analysis step)

**Implementation Notes:**
- Critical workflows to check:
  - localStorage error handling
  - Responsive layout behavior at all breakpoints
  - Badge unlock state edge cases
  - Missing accessibility tests
- Skip: performance tests, visual regression (unless critical)

---

#### Task 3.5: Write up to 4-6 additional strategic tests maximum
**Priority:** Medium
**Estimated Time:** 2 hours
**Dependencies:** Task 3.4
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Add maximum of 4-6 new tests to fill identified critical gaps
- [ ] Focus on edge cases and error handling
- [ ] Do NOT write comprehensive coverage for all scenarios
- [ ] Skip exhaustive testing of all state combinations
- [ ] Use Playwright for E2E tests

**Files to Create/Modify:**
- `tests/e2e/badges-edge-cases.spec.ts` (create if needed)
- `tests/e2e/badges-accessibility.spec.ts` (create if needed)

**Implementation Notes:**
- Follow test-writing.md: "Test Only Core User Flows"
- Prioritize:
  1. localStorage disabled/error scenarios
  2. Keyboard navigation completeness
  3. Responsive layout edge cases
- Expected: 2-6 additional tests maximum

---

#### Task 3.6: Run feature-specific tests only
**Priority:** Critical
**Estimated Time:** 1 hour
**Dependencies:** Task 3.5
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Run ONLY tests related to badges route feature
- [ ] Tests from Task 1.1 pass (2-4 tests)
- [ ] Tests from Task 2.0 pass (2-6 tests)
- [ ] Tests from Task 3.2 pass (2-4 tests)
- [ ] Tests from Task 3.5 pass (2-6 tests)
- [ ] Expected total: approximately 10-18 tests maximum
- [ ] Do NOT run the entire application test suite
- [ ] Verify critical workflows pass

**Files to Create/Modify:**
- None (validation step)

**Implementation Notes:**
- Run: `npx playwright test tests/e2e/badges-*.spec.ts`
- All tests should pass before considering feature complete
- Fix any failing tests before final review

---

## Execution Order & Critical Path

### Sequential Dependencies (Must follow this order)
1. **Task Group 1** (Days 1-2) - Foundation must complete first
2. **Task Group 2** (Days 3-4) - Requires localStorage integration working
3. **Task Group 3** (Days 5-6) - Requires all badge display features complete

### Critical Path (Blocking Tasks)
These tasks block other work and should be prioritized:
- Task 1.2: Create badges page route (blocks all other tasks)
- Task 1.3: Implement localStorage utilities (blocks data loading)
- Task 2.1: Integrate BadgeCollection (blocks visual display)
- Task 2.3: Implement progress calculator (blocks progress display)
- Task 3.1: Add navigation button (blocks navigation testing)

### Parallel Work Opportunities
These tasks can run simultaneously:
- **After Task Group 1 completes:**
  - Task 2.0 (write display tests) + Task 2.1 (integrate BadgeCollection)
- **After Task 1.3 completes:**
  - Task 2.1 (integrate BadgeCollection) + Task 2.2 (implement stats bar)

---

## Testing Checkpoints

### Checkpoint 1: Route Foundation (End of Day 2)
**Run:** Tests from Task 1.1 (2-4 tests)
**Verify:**
- /profile/badges route returns 200
- Page renders header
- localStorage data loads without errors
- Default empty state works

### Checkpoint 2: Badge Display (End of Day 4)
**Run:** Tests from Task 1.1 + Task 2.0 (4-10 tests total)
**Verify:**
- BadgeCollection renders correctly
- Locked/unlocked states display properly
- Stats bar shows accurate counts
- Progress indicators display

### Checkpoint 3: Navigation & Completion (End of Day 6)
**Run:** All badges feature tests (10-18 tests maximum)
**Verify:**
- Keep Exploring button works
- Keyboard navigation complete
- All critical workflows pass
- Responsive layout correct

---

## Rollback Plan

Each task group has a safe rollback strategy:

### If Task Group 1 Fails
**Impact:** No badges route exists
**Rollback:** Delete `src/app/profile/` directory, delete localStorage utility
**Risk:** Very Low (isolated new files)

### If Task Group 2 Fails
**Impact:** Badges not displaying or stats broken
**Rollback:** Revert changes to `src/app/profile/badges/page.tsx`, keep route with basic structure
**Risk:** Low (no existing components modified, only BadgeCollection integration)

### If Task Group 3 Fails
**Impact:** Navigation or additional tests not working
**Rollback:** Remove navigation button, keep display-only page, remove additional tests
**Risk:** Very Low (navigation is optional enhancement)
**Note:** Keep git commit after each task for granular rollback

---

## Definition of Done

The badges route feature is complete when:

1. **Functionality:**
   - [ ] /profile/badges route returns 200 status
   - [ ] Badge unlock state loads from localStorage
   - [ ] All 6 badges display in responsive grid
   - [ ] Locked badges show grayscale styling
   - [ ] Unlocked badges show gradient styling
   - [ ] Stats bar shows accurate badge count and exploration %
   - [ ] Progress indicators display for locked badges
   - [ ] "Keep Exploring" button navigates to /browse
   - [ ] localStorage errors handled gracefully

2. **Testing:**
   - [ ] 10-18 feature-specific tests written
   - [ ] Core user workflows covered
   - [ ] localStorage error handling tested
   - [ ] Keyboard navigation tested
   - [ ] Tests follow standards (minimal, behavioral, fast)

3. **Quality:**
   - [ ] No TypeScript errors
   - [ ] No console errors in browser
   - [ ] Responsive on mobile (375px), tablet (768px), desktop (1280px+)
   - [ ] Keyboard navigation works (Tab + Enter)
   - [ ] Loading states not needed (localStorage is synchronous)
   - [ ] WCAG 2.1 AA color contrast met

4. **Documentation:**
   - [ ] Code comments for complex logic (progress calculation)
   - [ ] ARIA labels on interactive elements (navigation button)
   - [ ] Implementation notes in spec (if deviations made)

---

## Standards Compliance Checklist

### Global Standards
- [ ] Use Next.js 15.1.6 App Router patterns
- [ ] Use TypeScript for type safety
- [ ] Follow DRY principle (100% reuse of BadgeCollection)
- [ ] Remove any dead code or commented blocks
- [ ] Use meaningful variable and function names

### Frontend Standards
- [ ] Components have single responsibility
- [ ] State kept as local as possible
- [ ] Clear component interfaces with typed props
- [ ] Use Tailwind CSS 4.1.13 for styling
- [ ] Responsive design for 3 breakpoints (mobile, tablet, desktop)
- [ ] Semantic HTML structure (header, main, sections)

### Testing Standards
- [ ] Write minimal tests during development (2-6 per group)
- [ ] Test behavior, not implementation
- [ ] Focus on core user flows only
- [ ] Defer edge case testing to Task Group 3
- [ ] Fast execution (tests designed to run in seconds)

### Accessibility Standards
- [ ] Keyboard navigation supported (Tab, Enter)
- [ ] ARIA labels on interactive elements
- [ ] Screen reader friendly (semantic HTML)
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] Focus indicators visible on interactive elements

---

## Dependencies & Prerequisites

### Required Dependencies (Already Installed)
- next@15.1.6 - App Router framework
- react@19.1.1 - UI library
- framer-motion@12.23.22 - Animation library (used by BadgeCollection)
- tailwindcss@4.1.13 - Styling

### Required Components (Already Built)
- BadgeCollection (100% complete at `src/components/delight/DiscoveryBadges.tsx:180`)
- AVAILABLE_BADGES array (100% complete at `src/components/delight/DiscoveryBadges.tsx:16`)
- EMOTION_ICONS (exists at `src/lib/motion-tokens.ts`)
- PLAY_TYPE_ICONS (exists at `src/lib/motion-tokens.ts`)

### Required Data Structures
- localStorage key: 'discovery-badges' (Set<string> as JSON array)
- localStorage key: 'discovery-progress' (object with counters)
- DiscoveryProgress interface (to be created)
- BadgeProgress interface (to be created)

### No Dependencies Required
- No API endpoints needed (client-side only)
- No database changes needed (localStorage only)
- No backend work required

---

## Success Metrics

### Performance Targets
- [ ] Initial page load < 1.5 seconds on 3G
- [ ] localStorage read time < 10ms (synchronous)
- [ ] Badge hover animation solid 60fps
- [ ] Navigation response < 100ms (client-side routing)
- [ ] Zero layout shift during interactions

### User Experience Targets
- [ ] Instant page display (no loading state needed)
- [ ] Clear locked/unlocked visual distinction
- [ ] Progress indicators motivate continued exploration
- [ ] Keyboard accessible throughout
- [ ] User-friendly empty state when no badges unlocked

### Code Quality Targets
- [ ] Zero TypeScript errors
- [ ] Zero ESLint errors
- [ ] All tests passing (10-18 tests)
- [ ] Code review approved
- [ ] No regressions to existing features

---

## Notes for Implementers

### For ui-designer (Task Groups 1-2)
- You're integrating an existing component, not building new UI
- BadgeCollection is 100% complete - just pass it the right props
- Focus on layout, localStorage integration, and responsive design
- Reference existing pages for patterns (browse, portfolio)
- Test on multiple screen sizes as you build
- No loading spinners needed - localStorage is synchronous

### For testing-engineer (Task Group 3)
- Review existing tests from previous groups first
- Only add tests if critical gaps exist
- Maximum 4-6 additional tests - be highly selective
- Focus on localStorage error scenarios and accessibility
- This is the simplest route - don't over-test
- Use Playwright for E2E tests

### General Tips
- Commit after each completed task for granular rollback
- Test in browser as you build, don't wait until the end
- Ask questions if spec is unclear
- Reference existing code for patterns (browse route, portfolio route)
- Keep changes minimal and focused
- This should be the fastest route to implement (5-6 days max)

### Key Differences from Other Routes
- **No API calls** - Everything is localStorage
- **No complex state** - Just load and display
- **No interactions** - Beyond a single navigation button
- **100% component reuse** - BadgeCollection does all the work
- **Shortest timeline** - Simpler than browse (10-15 days) or portfolio (8-10 days)