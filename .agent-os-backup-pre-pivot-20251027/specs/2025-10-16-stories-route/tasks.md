# Task Breakdown: Stories Dynamic Route with Full-Screen Viewer

## Overview
Total Tasks: 22 tasks across 5 task groups
Estimated Timeline: 10-12 working days
Assigned Implementers: ui-designer, api-engineer, testing-engineer
Critical Path: Task Groups 1 → 2 → 3 → 4 → 5 (sequential dependencies)

## Executive Summary

This implementation integrates the fully-complete [`StoryViewer`](src/components/story/StoryViewer.tsx:1) component into a new dynamic route at `/stories/[id]`. The work focuses on **route setup, data fetching, sharing, and PDF export** rather than UI component development. The StoryViewer is 100% complete and requires zero modifications.

**Key Simplifications:**
- No database changes required (existing schema supports all features)
- StoryViewer component is 100% complete, use as-is
- API endpoint already exists at [`/api/stories/[id]`](src/app/api/stories/[id]/route.ts:1)
- Test focus: Core user workflows only (18-30 tests maximum)
- One new dependency: jsPDF for export functionality

**Risk Mitigation:**
- Start with route foundation and data fetching to enable early testing
- Add progressive enhancement (viewer → share → export → SEO)
- Test at each checkpoint before moving to next phase
- All tasks have clear rollback paths
- PDF export isolated in separate component for easy debugging

## Task List

---

### Task Group 1: Route Foundation & Data Fetching (Days 1-2)

**Assigned implementer:** ui-designer
**Dependencies:** None
**Parallel Opportunities:** None (foundation must complete first)
**Estimated Time:** 6-8 hours

---

#### Task 1.1: Write 2-8 focused tests for stories route basics
**Priority:** Critical
**Estimated Time:** 2 hours
**Dependencies:** None
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Write 2-8 tests maximum for critical stories route behaviors
- [x] Test route returns 200 status for valid story ID
- [x] Test route returns 404 for invalid story ID
- [x] Test loading state displays during data fetch
- [x] Test error state displays on API failure with retry button
- [x] Skip exhaustive edge case testing

**Files to Create/Modify:**
- `tests/e2e/stories-route.spec.ts` (create)

**Implementation Notes:**
- Follow [`agent-os/standards/testing/test-writing.md`](agent-os/standards/testing/test-writing.md:1): Focus on core user flows only
- Use Playwright for E2E tests
- Mock SWR for controlled data states
- Reference: "Write Minimal Tests During Development" standard

---

#### Task 1.2: Create stories dynamic route with async params
**Priority:** Critical
**Estimated Time:** 2 hours
**Dependencies:** None
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Create `/stories/[id]` route at `src/app/stories/[id]/page.tsx`
- [x] Export default Next.js page component with 'use client' directive
- [x] Extract story ID using Next.js 15 async params pattern: `const { id } = use(params)`
- [x] Add basic page structure (will add StoryViewer later)
- [x] Ensure route returns 200 status for valid ID
- [x] Follow Next.js 15 App Router dynamic route patterns

**Files to Create/Modify:**
- `src/app/stories/[id]/page.tsx` (create)

**Implementation Notes:**
- Use Next.js 15.1.6 App Router conventions
- Mark as client component ('use client') for SWR hooks
- Reference spec.md lines 494-510 for async params pattern
- Import `use` from 'react' for params extraction

---

#### Task 1.3: Set up SWR data fetching for story API
**Priority:** Critical
**Estimated Time:** 2 hours
**Dependencies:** Task 1.2
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Import useSWR from 'swr' package (already installed)
- [x] Create fetcher function for `/api/stories/[id]` endpoint
- [x] Configure SWR with revalidateOnFocus: false, dedupingInterval: 300000 (5 min)
- [x] Handle loading state with isLoading flag
- [x] Handle error state with error object and mutate for retry
- [x] Extract story object from response data: `{ story: NarrativeArc }`

**Files to Create/Modify:**
- `src/app/stories/[id]/page.tsx` (modify)

**Implementation Notes:**
- SWR already installed at version 2.2.5
- Cache for 5 minutes to reduce API calls
- API route already exists at [`src/app/api/stories/[id]/route.ts`](src/app/api/stories/[id]/route.ts:1)
- Reference spec.md lines 517-525 for SWR configuration
- Import `NarrativeArc` type from [`src/lib/story-curation/narrative-arcs.ts`](src/lib/story-curation/narrative-arcs.ts:1)

---

#### Task 1.4: Add loading and error states with retry
**Priority:** High
**Estimated Time:** 2 hours
**Dependencies:** Task 1.3
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Display full-screen loading spinner with black background during fetch
- [x] Show error message with "Story Not Found" for 404 errors
- [x] Show generic error message for network failures
- [x] Add "Back to Browse" button in error state that navigates to /browse
- [x] Add "Retry" option for network errors using SWR mutate
- [x] Ensure accessibility with proper ARIA labels
- [x] Match black background styling from spec

**Files to Create/Modify:**
- `src/app/stories/[id]/page.tsx` (modify)
- Import from [`src/components/common/LoadingState.tsx`](src/components/common/LoadingState.tsx:1) (existing)
- Import from [`src/components/common/ErrorState.tsx`](src/components/common/ErrorState.tsx:1) (existing)

**Implementation Notes:**
- Reuse existing LoadingState and ErrorState components
- Reference spec.md lines 527-548 for error handling pattern
- Follow [`agent-os/standards/global/error-handling.md`](agent-os/standards/global/error-handling.md:1) for user-friendly messages
- Use `router.push('/browse')` for navigation

---

#### Task 1.5: Ensure route foundation tests pass
**Priority:** Critical
**Estimated Time:** 1 hour
**Dependencies:** Tasks 1.1-1.4
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Run ONLY the 2-8 tests written in Task 1.1
- [x] All tests pass without errors
- [x] Route navigates successfully to valid story ID
- [x] 404 error displays for invalid story ID
- [x] Loading and error states render correctly
- [x] Do NOT run entire test suite

**Files to Create/Modify:**
- None (validation step)

**Implementation Notes:**
- Use `npx playwright test tests/e2e/stories-route.spec.ts` to run specific tests
- Fix any failing tests before proceeding to Task Group 2
- Expected: 5-8 passing tests

---

### Task Group 2: Story Viewer Integration (Days 3-4)

**Assigned implementer:** ui-designer
**Dependencies:** Task Group 1 complete
**Parallel Opportunities:** Tasks 2.1-2.2 can run in parallel after 2.0
**Estimated Time:** 6-8 hours

---

#### Task 2.0: Write 2-8 focused tests for viewer integration
**Priority:** High
**Estimated Time:** 2 hours
**Dependencies:** Task Group 1
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Write 2-8 tests maximum for StoryViewer integration
- [x] Test viewer renders with story data correctly
- [x] Test auto-play starts automatically
- [x] Test play/pause toggle works
- [x] Test navigation (prev/next) works with boundary checks
- [x] Test close button navigates back
- [x] Test keyboard controls (arrows, space, escape)
- [x] Skip exhaustive interaction testing

**Files to Create/Modify:**
- `tests/e2e/stories-viewer.spec.ts` (create)

**Implementation Notes:**
- Focus on integration between route and viewer
- Test behavior inherited from StoryViewer component
- Use Playwright for interaction testing

---

#### Task 2.1: Integrate StoryViewer component
**Priority:** Critical
**Estimated Time:** 2 hours
**Dependencies:** Task Group 1
**Parallel:** Can run parallel with Task 2.2
**Risk:** Low

**Acceptance Criteria:**
- [x] Import StoryViewer from [`src/components/story/StoryViewer.tsx`](src/components/story/StoryViewer.tsx:1)
- [x] Pass story data as `story` prop with NarrativeArc type
- [x] Set `autoPlay={true}` for automatic playback
- [x] Verify viewer renders in full-screen black background
- [x] Verify all viewer features work (inherited from component)
- [x] NO modifications to StoryViewer component required

**Files to Create/Modify:**
- `src/app/stories/[id]/page.tsx` (modify)

**Implementation Notes:**
- StoryViewer is 100% complete at [`src/components/story/StoryViewer.tsx`](src/components/story/StoryViewer.tsx:1)
- Component already includes all features: auto-play, transitions, emotional curve, keyboard nav
- Reference spec.md lines 121-133 for component usage
- Simply pass props and render, no customization needed

---

#### Task 2.2: Implement onClose handler with router navigation
**Priority:** Critical
**Estimated Time:** 1 hour
**Dependencies:** Task 2.1
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Import useRouter from 'next/navigation'
- [x] Create router instance: `const router = useRouter()`
- [x] Pass onClose handler to StoryViewer: `onClose={() => router.back()}`
- [x] Verify close button (X) navigates back to previous page
- [x] Verify Escape key triggers close (inherited from StoryViewer)
- [x] Test fallback to /browse if no history exists

**Files to Create/Modify:**
- `src/app/stories/[id]/page.tsx` (modify)

**Implementation Notes:**
- Reference spec.md lines 562-565 for onClose implementation
- `router.back()` navigates to previous page in history
- StoryViewer already handles Escape key → onClose callback
- Consider adding fallback: if no history, navigate to /browse

---

#### Task 2.3: Test viewer interactions work correctly
**Priority:** High
**Estimated Time:** 2 hours
**Dependencies:** Tasks 2.1-2.2
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Verify auto-play starts with 3-second intervals
- [x] Verify play/pause button toggles correctly
- [x] Verify prev/next navigation with disabled states at boundaries
- [x] Verify emotional curve click-to-seek works
- [x] Verify progress dots reflect current position
- [x] Verify keyboard navigation (arrows, space, escape)
- [x] Verify smooth Framer Motion transitions

**Files to Create/Modify:**
- None (manual testing step)

**Implementation Notes:**
- All functionality inherited from StoryViewer component
- Test in browser with real story data
- Reference spec.md lines 367-376 for success criteria
- These features should work automatically without code changes

---

#### Task 2.4: Ensure viewer integration tests pass
**Priority:** Critical
**Estimated Time:** 1 hour
**Dependencies:** Tasks 2.0-2.3
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Run ONLY the 2-8 tests written in Task 2.0
- [x] All viewer integration tests pass
- [x] Viewer renders correctly with story data
- [x] Navigation and controls work as expected
- [x] Do NOT run entire test suite

**Files to Create/Modify:**
- None (validation step)

**Implementation Notes:**
- Use `npx playwright test tests/e2e/stories-viewer.spec.ts`
- Fix any failing tests before proceeding to Task Group 3
- Expected: 6-8 passing tests

---

### Task Group 3: Share & Export Features (Days 5-7)

**Assigned implementer:** api-engineer
**Dependencies:** Task Group 2 complete
**Parallel Opportunities:** Tasks 3.2-3.3 can run in parallel after 3.1
**Estimated Time:** 10-14 hours

---

#### Task 3.1: Write 2-8 focused tests for share and export
**Priority:** High
**Estimated Time:** 2 hours
**Dependencies:** Task Group 2
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Write 2-8 tests maximum for share/export workflows
- [x] Test share button copies URL to clipboard
- [x] Test share toast notification displays
- [x] Test social media share dialogs open
- [x] Test PDF export button triggers generation
- [x] Test PDF download completes successfully
- [x] Skip timeout and error scenario testing (unless critical)

**Files to Create/Modify:**
- `tests/e2e/stories-share-export.spec.ts` (create)

**Implementation Notes:**
- Mock clipboard API for testing
- Mock jsPDF for PDF generation tests
- Focus on integration, not library behavior
- Test critical happy paths only

---

#### Task 3.2: Install jsPDF dependency
**Priority:** Critical
**Estimated Time:** 0.5 hours
**Dependencies:** Task Group 2
**Parallel:** Can run parallel with Task 3.3
**Risk:** Very Low

**Acceptance Criteria:**
- [x] Install jsPDF package: `npm install jspdf`
- [x] Verify jsPDF version in package.json
- [x] Verify TypeScript types included or install @types/jspdf if needed
- [x] Test import works: `import { jsPDF } from 'jspdf'`

**Files to Create/Modify:**
- `package.json` (modify)

**Implementation Notes:**
- jsPDF is the only new dependency required for this feature
- Latest stable version should be used
- Reference spec.md line 836 for dependency requirement

---

#### Task 3.3: Create ShareButton component
**Priority:** High
**Estimated Time:** 3 hours
**Dependencies:** Task Group 2
**Parallel:** Can run parallel with Task 3.2
**Risk:** Low

**Acceptance Criteria:**
- [x] Create `src/components/story/ShareButton.tsx` component
- [x] Implement copy-to-clipboard using navigator.clipboard.writeText
- [x] Show success toast notification with Framer Motion animation
- [x] Add social media share options (Twitter, Facebook, LinkedIn)
- [x] Format share URLs with story ID and title
- [x] Handle clipboard API errors gracefully
- [x] Style with white/20 opacity, backdrop blur, rounded-full
- [x] Add proper ARIA labels for accessibility

**Files to Create/Modify:**
- `src/components/story/ShareButton.tsx` (create)

**Implementation Notes:**
- Reference spec.md lines 572-636 for complete implementation
- Use Framer Motion's AnimatePresence for toast
- Share URL format: `${window.location.origin}/stories/${storyId}`
- Social platforms use intent URLs with encoded parameters
- Toast auto-dismisses after 2 seconds

---

#### Task 3.4: Create ExportPDFButton component
**Priority:** Critical
**Estimated Time:** 4 hours
**Dependencies:** Tasks 3.2, 3.3
**Parallel:** No
**Risk:** Medium

**Acceptance Criteria:**
- [x] Create `src/components/story/ExportPDFButton.tsx` component
- [x] Implement PDF generation using jsPDF library
- [x] Add title page with story metadata (title, description, type, quality)
- [x] Add all photos (one per page) with emotion labels
- [x] Load images using crossOrigin: 'anonymous' for CORS
- [x] Calculate proper image dimensions to fit PDF pages
- [x] Handle image load failures gracefully
- [x] Generate filename: `[story-title]-story.pdf` (sanitized)
- [x] Show loading state during export (button disabled)
- [x] Handle export errors with user-friendly alert

**Files to Create/Modify:**
- `src/components/story/ExportPDFButton.tsx` (create)

**Implementation Notes:**
- Reference spec.md lines 639-746 for complete implementation
- Use dynamic import for jsPDF: `const { jsPDF } = await import('jspdf')`
- Helper functions: loadImage(), calculateImageDimensions()
- PDF page size: A4 (210mm x 297mm)
- Center images horizontally on each page
- Add photo captions if available from photo metadata

---

#### Task 3.5: Integrate share and export buttons into route
**Priority:** High
**Estimated Time:** 1.5 hours
**Dependencies:** Tasks 3.3, 3.4
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Import ShareButton and ExportPDFButton components
- [x] Position buttons in fixed top-right corner (below close button)
- [x] Pass storyId and storyTitle to ShareButton
- [x] Pass story object to ExportPDFButton
- [x] Add flex gap-4 for spacing between buttons
- [x] Ensure z-index (z-50) keeps buttons above viewer
- [x] Verify buttons don't overlap close button

**Files to Create/Modify:**
- `src/app/stories/[id]/page.tsx` (modify)

**Implementation Notes:**
- Reference spec.md lines 554-559 for positioning
- Fixed position: `fixed top-20 right-8 z-50`
- Buttons render above StoryViewer but below close button
- Test responsive positioning on mobile

---

#### Task 3.6: Test share and export functionality
**Priority:** High
**Estimated Time:** 2 hours
**Dependencies:** Task 3.5
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Test copy link functionality in multiple browsers
- [x] Verify toast notification appears and auto-dismisses
- [x] Test Twitter share opens correct dialog
- [x] Test Facebook share opens correct dialog
- [x] Test LinkedIn share opens correct dialog
- [x] Test PDF export generates correctly with 5-photo story
- [x] Test PDF export generates correctly with 15-photo story
- [x] Verify PDF includes all photos and metadata
- [x] Test error handling for image load failures
- [x] Verify export completes in under 5 seconds

**Files to Create/Modify:**
- None (manual testing step)

**Implementation Notes:**
- Test across Chrome, Firefox, Safari
- Test on mobile devices for share functionality
- Verify social media preview displays correctly
- Check PDF renders properly in PDF viewers

---

#### Task 3.7: Ensure share and export tests pass
**Priority:** Critical
**Estimated Time:** 1 hour
**Dependencies:** Tasks 3.1-3.6
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Run ONLY the 2-8 tests written in Task 3.1
- [x] All share and export tests pass
- [x] Clipboard operations work correctly
- [x] PDF generation completes without errors
- [x] Do NOT run entire test suite

**Files to Create/Modify:**
- None (validation step)

**Implementation Notes:**
- Use `npx playwright test tests/e2e/stories-share-export.spec.ts`
- Fix any failing tests before proceeding to Task Group 4
- Expected: 6-8 passing tests

---

### Task Group 4: SEO & Metadata (Days 8-9)

**Assigned implementer:** ui-designer
**Dependencies:** Task Group 3 complete
**Parallel Opportunities:** Task 4.1 can start immediately after Task Group 3
**Estimated Time:** 6-8 hours

---

#### Task 4.1: Write 2-8 focused tests for SEO metadata
**Priority:** High
**Estimated Time:** 1.5 hours
**Dependencies:** Task Group 3
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Write 2-8 tests maximum for metadata generation
- [x] Test generateMetadata function fetches story correctly
- [x] Test Open Graph tags populate with story data
- [x] Test Twitter Card tags populate correctly
- [x] Test first photo used as og:image
- [x] Test fallback metadata for 404 stories
- [x] Skip exhaustive metadata field testing

**Files to Create/Modify:**
- `tests/e2e/stories-metadata.spec.ts` (create)

**Implementation Notes:**
- Test server-side metadata generation
- Verify meta tags in rendered HTML
- Use Playwright's page.locator to check meta tags
- Focus on critical social sharing tags

---

#### Task 4.2: Implement generateMetadata function
**Priority:** Critical
**Estimated Time:** 3 hours
**Dependencies:** Task Group 3
**Parallel:** No
**Risk:** Medium

**Acceptance Criteria:**
- [x] Add generateMetadata async function to page.tsx
- [x] Extract story ID from async params
- [x] Fetch story data from `/api/stories/[id]` endpoint
- [x] Generate Open Graph metadata (title, description, images, type)
- [x] Generate Twitter Card metadata (card, title, description, images)
- [x] Use first photo as social preview image (1200x630 size)
- [x] Set siteName to 'Nino Chavez Gallery'
- [x] Handle fetch errors with fallback metadata
- [x] Set appropriate image dimensions (width: 1200, height: 630)

**Files to Create/Modify:**
- `src/app/stories/[id]/page.tsx` (modify)

**Implementation Notes:**
- Reference spec.md lines 749-794 for implementation
- Import `Metadata` type from 'next'
- Use `process.env.NEXT_PUBLIC_BASE_URL` for API URL
- Fallback metadata for errors: "Story Not Found"
- Twitter card type: 'summary_large_image'
- Open Graph type: 'article'

---

#### Task 4.3: Test metadata in social media previews
**Priority:** High
**Estimated Time:** 2 hours
**Dependencies:** Task 4.2
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Test Open Graph tags visible in browser DevTools
- [x] Test Twitter Card preview using Twitter Card Validator
- [x] Test Facebook preview using Facebook Sharing Debugger
- [x] Test LinkedIn preview using LinkedIn Post Inspector
- [x] Verify story title displays correctly
- [x] Verify story description displays correctly
- [x] Verify first photo displays as preview image
- [x] Test metadata for valid and invalid story IDs

**Files to Create/Modify:**
- None (manual testing step)

**Implementation Notes:**
- Tools to use:
  - Twitter: https://cards-dev.twitter.com/validator
  - Facebook: https://developers.facebook.com/tools/debug/
  - LinkedIn: https://www.linkedin.com/post-inspector/
- Test with deployed URL or ngrok for local testing
- Verify image URLs are accessible publicly
- Note: Tests validate metadata structure; actual social preview testing requires deployment

---

#### Task 4.4: Ensure SEO metadata tests pass
**Priority:** Critical
**Estimated Time:** 1 hour
**Dependencies:** Tasks 4.1-4.3
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [x] Run ONLY the 2-8 tests written in Task 4.1
- [x] All metadata generation tests pass
- [x] Meta tags populate correctly in HTML
- [x] Social sharing previews work
- [x] Do NOT run entire test suite

**Files to Create/Modify:**
- None (validation step)

**Implementation Notes:**
- Use `npx playwright test tests/e2e/stories-metadata.spec.ts`
- Fix any failing tests before proceeding to Task Group 5
- Expected: 5-8 passing tests

---

### Task Group 5: Test Review & Gap Analysis (Days 10-12)

**Assigned implementer:** testing-engineer
**Dependencies:** Task Groups 1-4 complete
**Parallel Opportunities:** None (must review all prior work)
**Estimated Time:** 8-12 hours

---

#### Task 5.1: Review tests from Task Groups 1-4
**Priority:** High
**Estimated Time:** 2 hours
**Dependencies:** Task Groups 1-4
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Review 2-8 tests from Task 1.1 (route foundation)
- [ ] Review 2-8 tests from Task 2.0 (viewer integration)
- [ ] Review 2-8 tests from Task 3.1 (share and export)
- [ ] Review 2-8 tests from Task 4.1 (SEO metadata)
- [ ] Total existing tests: approximately 8-32 tests
- [ ] Document test coverage for critical workflows
- [ ] Identify any redundant or overlapping tests

**Files to Create/Modify:**
- None (review step)

**Implementation Notes:**
- Read all test files to understand existing coverage
- Use code coverage tool to identify gaps (if available)
- Focus review on stories route feature only, not entire app
- Create coverage report for stories route

---

#### Task 5.2: Analyze test coverage gaps for stories feature only
**Priority:** High
**Estimated Time:** 2 hours
**Dependencies:** Task 5.1
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Identify critical user workflows lacking test coverage
- [ ] Focus ONLY on gaps related to stories route feature
- [ ] Prioritize end-to-end workflows over unit test gaps
- [ ] Do NOT assess entire application test coverage
- [ ] Document up to 10 critical gaps maximum

**Files to Create/Modify:**
- None (analysis step)

**Implementation Notes:**
- Critical workflows to check:
  - Full journey: navigate to /stories/[id] → view story → share → export
  - Keyboard navigation through all interactive elements
  - Error recovery flows (404, network errors, export failures)
  - Responsive layout behavior (mobile, tablet, desktop)
  - Accessibility features (ARIA, focus management)
- Skip: performance tests, visual regression (unless critical)

---

#### Task 5.3: Write up to 10 additional strategic tests maximum
**Priority:** High
**Estimated Time:** 4 hours
**Dependencies:** Task 5.2
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Add maximum of 10 new tests to fill identified critical gaps
- [ ] Focus on integration points and end-to-end workflows
- [ ] Do NOT write comprehensive coverage for all scenarios
- [ ] Skip edge cases, performance tests unless business-critical
- [ ] Use Playwright for E2E tests, Jest for integration tests
- [ ] Total tests across all groups should not exceed 30 tests

**Files to Create/Modify:**
- `tests/e2e/stories-integration.spec.ts` (create if needed)
- `src/app/stories/[id]/__tests__/integration.test.tsx` (create if needed)

**Implementation Notes:**
- Follow [`agent-os/standards/testing/test-writing.md`](agent-os/standards/testing/test-writing.md:1): "Test Only Core User Flows"
- Prioritize:
  1. Full user journey (browse → generate story → view → share → export)
  2. Keyboard navigation for accessibility compliance
  3. Critical error scenarios (404, network failures)
  4. PDF generation with various photo counts
- Expected: 4-10 additional tests maximum

---

#### Task 5.4: Run feature-specific tests only
**Priority:** Critical
**Estimated Time:** 2 hours
**Dependencies:** Task 5.3
**Parallel:** No
**Risk:** Low

**Acceptance Criteria:**
- [ ] Run ONLY tests related to stories route feature
- [ ] Tests from Task 1.1 pass (2-8 tests)
- [ ] Tests from Task 2.0 pass (2-8 tests)
- [ ] Tests from Task 3.1 pass (2-8 tests)
- [ ] Tests from Task 4.1 pass (2-8 tests)
- [ ] Tests from Task 5.3 pass (4-10 tests)
- [ ] Expected total: approximately 12-42 tests (aim for 18-30)
- [ ] Do NOT run the entire application test suite
- [ ] Verify critical workflows pass

**Files to Create/Modify:**
- None (validation step)

**Implementation Notes:**
- Run: `npx playwright test tests/e2e/stories-*.spec.ts`
- Run: `npm test src/app/stories/` for unit/integration tests
- All tests should pass before considering feature complete
- Fix any failing tests before final review
- Generate coverage report for stories feature only

---

## Execution Order & Critical Path

### Sequential Dependencies (Must follow this order)
1. **Task Group 1** (Days 1-2) - Foundation must complete first
2. **Task Group 2** (Days 3-4) - Requires route and data fetching to exist
3. **Task Group 3** (Days 5-7) - Requires viewer working to add share/export
4. **Task Group 4** (Days 8-9) - Can build upon existing route structure
5. **Task Group 5** (Days 10-12) - Requires all features implemented

### Critical Path (Blocking Tasks)
These tasks block other work and should be prioritized:
- Task 1.2: Create stories dynamic route (blocks all other tasks)
- Task 1.3: Set up SWR data fetching (blocks viewer integration)
- Task 2.1: Integrate StoryViewer (blocks share/export features)
- Task 3.2: Install jsPDF dependency (blocks PDF export)
- Task 3.4: Create ExportPDFButton (most complex new component)
- Task 4.2: Implement generateMetadata (required for social sharing)

### Parallel Work Opportunities
These tasks can run simultaneously:
- **After Task Group 1 completes:**
  - Task 2.0 (write viewer tests) + Task 2.1 (integrate viewer)
- **After Task Group 2 completes:**
  - Task 3.2 (install jsPDF) + Task 3.3 (create ShareButton)

---

## Testing Checkpoints

### Checkpoint 1: Route Foundation (End of Day 2)
**Run:** Tests from Task 1.1 (2-8 tests)
**Verify:**
- /stories/[id] route returns 200 for valid ID
- /stories/[id] route returns 404 for invalid ID
- Page renders with loading state
- Error state displays with retry button
- SWR fetches story data correctly

### Checkpoint 2: Viewer Integration (End of Day 4)
**Run:** Tests from Task 1.1 + Task 2.0 (4-16 tests total)
**Verify:**
- StoryViewer renders with story data
- Auto-play starts automatically (3-second intervals)
- Play/pause toggle works
- Navigation (prev/next) works with boundary checks
- Close button navigates back
- Keyboard controls work (arrows, space, escape)
- Emotional curve seek functionality works

### Checkpoint 3: Share & Export (End of Day 7)
**Run:** Tests from Tasks 1.1 + 2.0 + 3.1 (6-24 tests total)
**Verify:**
- Share button copies URL to clipboard
- Toast notification displays and auto-dismisses
- Social media share dialogs open correctly
- PDF export generates successfully
- PDF includes all photos and metadata
- Export completes in under 5 seconds

### Checkpoint 4: SEO Metadata (End of Day 9)
**Run:** Tests from Tasks 1.1 + 2.0 + 3.1 + 4.1 (8-32 tests total)
**Verify:**
- generateMetadata function works
- Open Graph tags populate correctly
- Twitter Card tags populate correctly
- First photo used as preview image
- Social sharing previews display correctly
- Fallback metadata works for 404 errors

### Checkpoint 5: Final Validation (End of Day 12)
**Run:** All stories feature tests (12-42 tests, aim for 18-30)
**Verify:**
- All critical workflows pass
- Full user journey works end-to-end
- Keyboard navigation throughout
- Error recovery flows work
- Responsive layout correct on all breakpoints
- Accessibility compliance verified

---

## Rollback Plan

Each task group has a safe rollback strategy:

### If Task Group 1 Fails
**Impact:** No stories route exists
**Rollback:** Delete `src/app/stories/` directory
**Risk:** Very Low (isolated new files)

### If Task Group 2 Fails
**Impact:** Viewer not integrated
**Rollback:** Revert changes to `src/app/stories/[id]/page.tsx`, keep route with error message
**Risk:** Very Low (StoryViewer unchanged, only route modified)

### If Task Group 3 Fails
**Impact:** Share/export not working
**Rollback:** Remove ShareButton and ExportPDFButton, keep viewer working
**Risk:** Low (components isolated in separate files)
**Note:** Keep git commit after each task for granular rollback

### If Task Group 4 Fails
**Impact:** SEO metadata not generated
**Rollback:** Remove generateMetadata function, keep basic page working
**Risk:** Very Low (metadata is optional enhancement)

### If Task Group 5 Fails
**Impact:** Additional tests not passing
**Rollback:** Remove additional tests, keep feature with 8-32 tests from earlier groups
**Risk:** Very Low (tests only, no production code affected)

---

## Definition of Done

The stories dynamic route feature is complete when:

1. **Functionality:**
   - [ ] /stories/[id] route returns 200 for valid story ID
   - [ ] /stories/[id] route returns 404 for invalid story ID
   - [ ] Story data fetches from API correctly
   - [ ] StoryViewer renders with all features working
   - [ ] Auto-play starts automatically (3-second intervals)
   - [ ] All viewer controls work (play/pause, prev/next, seek)
   - [ ] Keyboard navigation works (arrows, space, escape)
   - [ ] Close button navigates back to previous page
   - [ ] Share button copies URL to clipboard
   - [ ] Social media share dialogs open correctly
   - [ ] PDF export generates successfully
   - [ ] PDF includes all photos and metadata
   - [ ] Open Graph metadata generates correctly
   - [ ] Twitter Card metadata generates correctly
   - [ ] Error handling works for 404 and network failures

2. **Testing:**
   - [ ] 18-30 feature-specific tests written across all groups
   - [ ] Core user workflows covered (navigate → view → share → export)
   - [ ] Critical integration points tested
   - [ ] Tests follow standards (minimal, behavioral, fast)
   - [ ] All tests passing

3. **Quality:**
   - [ ] No TypeScript errors
   - [ ] No console errors in browser
   - [ ] Responsive on mobile (375px), tablet (768px), desktop (1280px+)
   - [ ] Keyboard navigation accessible throughout
   - [ ] WCAG 2.1 AA compliance verified
   - [ ] Loading and error states display correctly
   - [ ] Smooth 60fps transitions
   - [ ] PDF export completes in under 5 seconds

4. **Documentation:**
   - [ ] Code comments for complex logic (PDF generation, metadata)
   - [ ] ARIA labels on all interactive elements
   - [ ] Implementation docs created for each task group
   - [ ] README updated with /stories/[id] documentation (optional)

---

## Standards Compliance Checklist

### Global Standards
- [ ] Use Next.js 15.1.6 App Router patterns
- [ ] Use TypeScript for type safety
- [ ] Follow DRY principle (reuse StoryViewer 100%)
- [ ] Remove any dead code or commented blocks
- [ ] Use meaningful variable and function names
- [ ] Follow conventions from [`agent-os/standards/global/conventions.md`](agent-os/standards/global/conventions.md:1)

### Frontend Standards
- [ ] Components have single responsibility
- [ ] State kept as local as possible
- [ ] Clear component interfaces with typed props
- [ ] Use Tailwind CSS 4.1.13 for styling
- [ ] Responsive design for 3 breakpoints (mobile, tablet, desktop)
- [ ] Accessibility compliance per [`agent-os/standards/frontend/accessibility.md`](agent-os/standards/frontend/accessibility.md:1)

### Testing Standards
- [ ] Write minimal tests during development (2-8 per group)
- [ ] Test behavior, not implementation
- [ ] Focus on core user flows only
- [ ] Defer edge case testing
- [ ] Fast execution (tests run in seconds)
- [ ] Follow [`agent-os/standards/testing/test-writing.md`](agent-os/standards/testing/test-writing.md:1)

### API Standards
- [ ] Proper HTTP status codes (200, 404, 500)
- [ ] Consistent JSON response format
- [ ] Error handling with user-friendly messages
- [ ] Cache headers for performance (5-minute cache)
- [ ] Follow [`agent-os/standards/backend/api.md`](agent-os/standards/backend/api.md:1)

---

## Dependencies & Prerequisites

### Required Dependencies (Already Installed)
- next@15.1.6 - App Router framework
- react@19.1.1 - UI library
- framer-motion@12.23.22 - Animation library (used by StoryViewer)
- swr@2.2.5 - Data fetching
- tailwindcss@4.1.13 - Styling
- @supabase/supabase-js@2.75.0 - Database client

### New Dependency Required
- **jspdf** - PDF generation library (install in Task 3.2)

### Required Components (Already Built - 100% Complete)
- [`StoryViewer`](src/components/story/StoryViewer.tsx:1) - Full-screen story display with all features
- [`LoadingState`](src/components/common/LoadingState.tsx:1) - Reusable loading spinner
- [`ErrorState`](src/components/common/ErrorState.tsx:1) - Reusable error display

### Required API Endpoints (Already Exist)
- `GET /api/stories/[id]` - Fetch complete story with photos (no changes needed)

### Required Types (Already Defined)
- `NarrativeArc` from [`src/lib/story-curation/narrative-arcs.ts`](src/lib/story-curation/narrative-arcs.ts:1)
- `Photo` from [`src/types/photo.ts`](src/types/photo.ts:1)
- `Metadata` from 'next' (built-in)

---

## Success Metrics

### Performance Targets
- [ ] Initial page load < 1.5 seconds on 3G connection
- [ ] Story fetch time < 1 second on good connection
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 2.5s
- [ ] PDF generation < 5 seconds for 10-photo story
- [ ] Share action < 200ms response time
- [ ] Smooth 60fps transitions for all animations
- [ ] Cumulative Layout Shift < 0.1
- [ ] Lighthouse Performance score > 90

### User Experience Targets
- [ ] Zero layout shift during story viewing
- [ ] Clear loading states for all async operations
- [ ] User-friendly error messages with recovery actions
- [ ] Keyboard accessible throughout
- [ ] WCAG 2.1 AA compliance verified
- [ ] Responsive layout works on all screen sizes
- [ ] Social sharing previews display correctly

### Code Quality Targets
- [ ] Zero TypeScript errors
- [ ] Zero ESLint errors
- [ ] All tests passing (18-30 tests)
- [ ] Code review approved by testing-engineer
- [ ] No console warnings in production build

---

## Notes for Implementers

### For ui-designer (Task Groups 1, 2, 4)
- You're integrating an existing component (StoryViewer), not building new UI
- Focus on route setup, data fetching, and metadata generation
- StoryViewer requires ZERO modifications - use as-is
- Reference existing pages for patterns and styling
- Test responsive layout as you build (mobile, tablet, desktop)
- Pay special attention to SEO metadata for social sharing

### For api-engineer (Task Group 3)
- You're building two new components: ShareButton and ExportPDFButton
- jsPDF is the critical new dependency - test thoroughly
- PDF generation is the most complex feature - allow extra time
- Share functionality uses browser APIs - handle permissions gracefully
- Reference spec.md lines 572-746 for complete implementation examples
- Test PDF export with stories of varying photo counts (5, 10, 15 photos)

### For testing-engineer (Task Group 5)
- Review existing tests from previous groups first
- Only add tests if critical gaps exist
- Maximum 10 additional tests - be highly selective
- Focus on end-to-end workflows, not unit test coverage
- Prioritize: full user journey, keyboard nav, error recovery
- Use Playwright for E2E, Jest for integration tests
- Aim for 18-30 total tests across all groups

### General Tips
- Commit after each completed task for granular rollback
- Test in browser as you build, don't wait until the end
- Ask questions if spec is unclear
- Reference existing code for patterns (StoryGenerationModal for modals, PhotoDetail for navigation)
- Keep changes minimal and focused
- StoryViewer is 100% complete - DO NOT modify it
- All StoryViewer features work automatically once you pass correct props

---

## Related Features

This specification completes Phase 4 (AI Story Curation & Discovery) by:
1. ✅ Story generation (complete via [`/api/stories/generate`](src/app/api/stories/generate/route.ts:1))
2. ✅ StoryViewer component (100% complete at [`src/components/story/StoryViewer.tsx`](src/components/story/StoryViewer.tsx:1))
3. ➡️ **Stories route (this spec)** - Enables viewing generated stories at dedicated URL
4. ➡️ **PDF export** (new requirement) - Enables saving/printing stories
5. ➡️ **Social sharing** (new requirement) - Enables sharing stories on social media

**User Journey:**
```
Browse Page → Generate Story Button → Select Arc Type → Story Generated
                                                              ↓
                                             Redirect to /stories/[id]
                                                              ↓
                                  View Story → Share/Export → Download/Share!