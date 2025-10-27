# Requirements: Browse Route Implementation

## Requirements Source

This specification was created via the `/agent-os:create-spec` slash command with the following argument:

```
for gaps in /browse route noted in @agent-os/product/VERIFICATION_RESULTS.md
```

**Source Document:** `/Users/nino/Workspace/02-local-dev/nino-chavez-gallery/agent-os/product/VERIFICATION_RESULTS.md`

**Context:** This was a non-interactive requirements gathering process. Requirements were extracted from the visual verification test results document rather than through a traditional Q&A session with the user.

## Critical Findings from VERIFICATION_RESULTS.md

### Primary Issue

**Route Missing Entirely:**
- Test result: "Navigation to /browse returned 404"
- Impact: Core browsing experience unavailable
- Priority: **CRITICAL**
- Location: VERIFICATION_RESULTS.md lines 64-69, 135-141

### Expected Features (from Visual Verification Tests)

From VERIFICATION_RESULTS.md test expectations:

1. **Magnetic Filter Orbs (5 total)**
   - Physics-based attraction within 100px radius
   - Hover responsiveness
   - Active state toggle on click
   - Filter types: Portfolio Quality, Play Type, Emotional Tone, Composition Style, Timeline
   - Source: VERIFICATION_RESULTS.md lines 30-43

2. **Photo Grid with Animations**
   - Display photos in masonry layout
   - Smooth layout morphing when filters change
   - Virtual scrolling for 500+ photos
   - Source: VERIFICATION_RESULTS.md lines 64-72, 245

3. **"Generate Story" Button**
   - Persistent button visible on browse page
   - Opens modal on click
   - Source: VERIFICATION_RESULTS.md lines 116-120, 254

4. **Story Generation Modal**
   - 6 narrative arc type selectors
   - Arc types: player-highlight, game-winning-rally, season-journey, comeback-story, technical-excellence, emotion-spectrum
   - Source: VERIFICATION_RESULTS.md lines 116-120

5. **Performance Targets**
   - Story generation completes in <3 seconds
   - Smooth 60fps animations
   - Source: VERIFICATION_RESULTS.md lines 256-259

### Existing Components (100% Implemented, Not Wired Up)

From VERIFICATION_RESULTS.md lines 147-176:

**Components Found in Codebase:**

1. `src/components/interactions/MagneticFilterOrb.tsx`
   - Status: 100% implemented
   - Features: Physics-based magnetic attraction
   - Gap: Not rendered on any page

2. `src/components/filters/MagneticFilterBar.tsx`
   - Status: 100% implemented
   - Features: Container for 5 magnetic filter orbs
   - Gap: Not rendered on any page

3. `src/components/gallery/PlayTypeMorphGrid.tsx`
   - Status: 100% implemented
   - Features: GSAP-animated grid with layout morphing
   - Gap: Not rendered in browsing context

4. `src/components/story/StoryViewer.tsx`
   - Status: 100% implemented
   - Features: Auto-play, emotional curve, keyboard navigation
   - Note: Not needed for /browse route (used for /stories/[id])

5. `src/components/story/StoryGenerationModal.tsx`
   - Status: 100% implemented (needs extension for browse context)
   - Features: 6 narrative arc types, loading states, focus trap
   - Gap: Browse context type not defined

6. `src/lib/narrative-arcs.ts`
   - Status: 100% implemented
   - Features: Definitions for all 6 arc types
   - Used by: StoryGenerationModal

7. `src/lib/recommendations.ts`
   - Status: 100% implemented
   - Features: Similarity algorithm for recommendations
   - Note: Not needed for /browse route (used for photo detail pages)

8. `src/hooks/usePhotoFilters.ts`
   - Status: 100% implemented
   - Features: Client-side filtering logic for all filter types
   - Gap: Not used in any route yet

**Why Components Aren't Visible:**

From VERIFICATION_RESULTS.md lines 158-176:

> "Why: Pages that import and render these components don't exist in routing structure."
>
> "Current Home Page Structure (src/app/page.tsx):
> Likely rendering only:
> - Basic photo grid
> - Simple navigation
> - NO magnetic filter orbs"
>
> "Missing Imports:
> - MagneticFilterBar - Should be imported and rendered
> - QualityGradientGrid - Needs /portfolio page
> - StoryViewer - Needs /stories/[id] page"

### Implementation Gap Analysis

From VERIFICATION_RESULTS.md lines 282-298:

**Gap Summary:**
- "~60% of documented UX features exist as components but are not accessible through routing structure"
- "Primary work needed is page creation and component integration, not component development"

**Root Cause:**
- Components were built in isolation following UX roadmap
- Route structure was never created to render these components
- Missing orchestration layer to wire components together

**Required Work:**
- Create `/browse` route page
- Import and render existing components
- Wire up state management to connect components
- Extend story generation modal for browse context
- Add minimal integration tests

### Priority and Timeline

From VERIFICATION_RESULTS.md lines 216-231, 298:

**Priority:** CRITICAL
- Reason: Core browsing experience unavailable
- Listed as "Priority 1: Critical Missing Routes (Week 1)"
- One of three critical routes (along with /portfolio and home page updates)

**Estimated Timeline:** 2-3 weeks
- Rationale: "2-3 weeks to create missing pages and wire up existing components"
- Breakdown from VERIFICATION_RESULTS.md:
  - Week 1: Create /browse and /portfolio pages
  - Week 2: Story features (generation modal, flow)
  - Week 3: Discoverability features
  - Week 4: Re-run visual tests

## Technical Constraints

### Database

From VERIFICATION_RESULTS.md and project context:

**No Changes Required:**
- Existing `photos` table has all necessary metadata
- `photo_metadata` JSONB column contains filter fields
- Schema already supports quality scores, play types, emotions, composition

### Dependencies

From VERIFICATION_RESULTS.md and package.json:

**All Required Dependencies Already Installed:**
- Next.js 15.1.6 - App Router framework
- React 19.1.1 - UI library
- Framer Motion 12.23.22 - Animation library
- SWR 2.2.5 - Data fetching
- Tailwind CSS 4.1.13 - Styling
- @supabase/supabase-js 2.75.0 - Database client

**No New Dependencies Needed**

### API Endpoints

**Existing Endpoints:**
- `GET /api/gallery` - Fetch photos with filters (EXISTS, no changes needed)
  - Status: Functional, returns 200
  - Response time: 221-1948ms
  - Source: VERIFICATION_RESULTS.md lines 126-132

**Endpoints to Extend:**
- `POST /api/stories/generate` - Generate story from photos
  - Needs: Accept `context.type: 'browse'` in addition to existing types
  - Existing types: athlete, game, season
  - New type: browse (all filtered photos, no specific context)

## Reusability Opportunities

### Components to Reuse (No Modifications)

1. **MagneticFilterBar** (`src/components/filters/MagneticFilterBar.tsx`)
   - Reuse 100%: Import and render as-is
   - Props: filters, onChange, photoCount
   - Already includes magnetic attraction physics

2. **MagneticFilterOrb** (`src/components/interactions/MagneticFilterOrb.tsx`)
   - Reuse 100%: Used internally by MagneticFilterBar
   - No direct integration needed

3. **PlayTypeMorphGrid** (`src/components/gallery/PlayTypeMorphGrid.tsx`)
   - Reuse 100%: Import and render as-is
   - Props: photos, activePlayType, onPhotoClick
   - Already includes layout animations

4. **usePhotoFilters** (`src/hooks/usePhotoFilters.ts`)
   - Reuse 100%: Import and call with photos + filters
   - Returns: Filtered photos array
   - Handles all filter logic client-side

### Components to Extend (Minimal Changes)

1. **StoryGenerationModal** (`src/components/story/StoryGenerationModal.tsx`)
   - Current: Supports athlete, game, season contexts
   - Extend: Add 'browse' to context type union
   - Change: Add 'browse' to contexts array in STORY_TYPES
   - Impact: ~10 lines of code changes

### Existing API Routes to Use

1. **Gallery API** (`src/app/api/gallery/route.ts`)
   - Use as-is with SWR for data fetching
   - Supports query params for filtering
   - Already returns enriched photo metadata

2. **Story Generation API** (path TBD)
   - Extend to handle browse context
   - Accept filtered photos from browse page
   - Return story ID for redirect

## Scope Definition

### In Scope

**Must Have:**
- Create `/browse` route that returns 200 status
- Render MagneticFilterBar with 5 filter orbs
- Render PlayTypeMorphGrid with filtered photos
- Add "Generate Story" button
- Integrate StoryGenerationModal with browse context
- Extend story generation API for browse context
- Support keyboard navigation
- Add loading and error states
- Write 10-34 focused tests for core workflows

**Should Have:**
- Responsive design (mobile, tablet, desktop)
- Smooth animations (60fps)
- Performance optimization (story generation <3s)
- Accessibility (WCAG 2.1 AA)
- Dynamic photo count display

### Out of Scope

From VERIFICATION_RESULTS.md and reasonable MVP constraints:

**Deferred to Future Iterations:**
- Advanced filters beyond the 5 existing orbs
- Infinite scroll pagination (initial load supports up to 500 photos)
- Saving filter presets or user preferences
- Social sharing from browse page
- Batch selection for custom story creation
- Export filtered results (PDF, ZIP)
- Album creation from filtered photos
- Real-time collaborative filtering
- Comprehensive test coverage (focus on core flows only)
- Performance testing (manual verification sufficient)
- Visual regression testing (defer to Week 4 of roadmap)

## Success Criteria

From VERIFICATION_RESULTS.md lines 239-265:

**When visual tests are re-run, these should pass:**

1. `/browse` page renders successfully
2. "Generate Story" button is visible and clickable
3. Story generation modal shows 6 arc type options
4. Story generates in <3 seconds
5. Filter orbs respond to hover within 100px magnetic radius
6. Photo grid morphs smoothly when filters change
7. Photo count updates dynamically
8. Keyboard navigation works through all interactive elements

**Functional Success:**
- Route returns 200 (not 404)
- All photos load from API
- Filters toggle on/off correctly
- Grid updates in real-time when filters change
- Modal opens/closes correctly
- Story generation completes and redirects to story page

**Technical Success:**
- No TypeScript errors
- No console errors
- All feature-specific tests pass (10-34 tests)
- Responsive layout works on mobile, tablet, desktop
- Loading states display during async operations
- Error states show user-friendly messages

## Implementation Notes

### Development Approach

**Focus on Integration, Not Building:**
- This is NOT a component development project
- This IS a route creation and component orchestration project
- All UI components are complete and tested
- Work is primarily wiring and state management

**Minimal Changes Philosophy:**
- Reuse existing components verbatim where possible
- Only modify StoryGenerationModal (1 file, minimal extension)
- Keep new code to minimum (page route + state management)
- No database migrations or schema changes
- No new dependencies to install

### Testing Strategy

**Limited Testing Approach:**
- Write 2-8 tests per implementation task group
- Testing-engineer adds maximum 10 additional tests
- Total 10-34 tests (not comprehensive coverage)
- Focus on core user workflows only
- Defer edge cases and error scenarios
- Run feature-specific tests only (not entire suite)

### Rollback Strategy

Each task group has clear rollback path:
- Task Group 1: Delete browse directory
- Task Group 2: Revert page changes, keep static route
- Task Group 3: Remove modal integration, revert StoryGenerationModal
- Task Group 4: Remove additional tests, keep feature

## Visual Design Reference

No mockups or design files were provided. The specification includes ASCII layout diagrams that describe:

- Page structure (header, filters, grid)
- Component arrangement (top to bottom flow)
- Filter orb styling (size, spacing, states)
- Grid layout (responsive columns, masonry)

Visual reference is in spec.md lines 42-80.

## Questions Asked / Assumptions Made

Since this was a non-interactive slash command trigger, no Q&A session occurred. The following assumptions were made based on VERIFICATION_RESULTS.md:

**Assumptions:**

1. The 5 filter orbs match those in MagneticFilterBar.tsx
   - Confirmed by reading component: Portfolio Quality, Print Ready, Social Media, Peak Moments, Golden Hour

2. The photo grid should use PlayTypeMorphGrid component
   - Confirmed by VERIFICATION_RESULTS.md listing it as implemented

3. Story generation modal should show all 6 arc types for browse context
   - Inferred from "browse all photos" use case not limiting arc types

4. API endpoint for story generation likely exists but needs extension
   - Based on StoryGenerationModal being 100% complete

5. No URL persistence needed for filter state
   - Not mentioned in VERIFICATION_RESULTS.md, deferred to future

6. Virtual scrolling for 500+ photos is expected
   - Based on VERIFICATION_RESULTS.md line 69 test case

**No Follow-Up Questions:**

Since requirements came from a completed verification test document, no follow-up questions were needed. All necessary information was present in VERIFICATION_RESULTS.md.

## Additional Notes

**From User Context:**

The user provided this context:
- VERIFICATION_RESULTS.md documented 23 visual verification tests
- All tests failed due to missing routes (expected for baseline)
- Core app runs successfully with basic photo grid
- ~60% of UX features exist as components but not in routing structure
- Estimated implementation: 2-3 weeks for page creation + integration

**Implementation Priority:**

This is the #1 priority missing route. VERIFICATION_RESULTS.md lists it first in "Critical Missing Routes" section and marks it as the main browsing experience:

> "/browse: Main browsing with filters + story generation (Priority: CRITICAL)"

**Related Work:**

Other missing routes documented but out of scope for this spec:
- `/portfolio` - Portfolio-quality view (separate spec needed)
- `/stories/[id]` - Story viewer (separate spec needed)
- `/profile/badges` - Badge collection (lower priority)

**Success Metric:**

When implementation is complete, visual verification test 4.13 should pass:

> "Test: Navigation to /browse returned 404"
> "Expected: 200 status with Generate Story button visible"

## Requirements Summary

**In One Sentence:**
Create the missing `/browse` route that assembles existing, fully-implemented components (MagneticFilterBar, PlayTypeMorphGrid, StoryGenerationModal) into a cohesive browsing experience with 5 filter orbs and 6-arc story generation.

**Key Requirements:**
1. Route exists and returns 200 (not 404)
2. 5 magnetic filter orbs with physics-based attraction
3. Photo grid with smooth layout animations
4. "Generate Story" button opens modal with 6 arc types
5. Story generation completes in <3 seconds
6. Keyboard accessible, responsive, error handling

**Key Constraints:**
1. Reuse existing components 100% (except 1 minimal extension)
2. No database changes or new dependencies
3. Write 10-34 focused tests maximum
4. Complete in 2-3 weeks
5. Focus on integration, not building

**Key Success Criteria:**
1. Visual verification test 4.13 passes (route exists, button visible)
2. All core user workflows tested and working
3. Performance targets met (3s story generation, 60fps animations)
4. No TypeScript or console errors
5. Responsive across 3 breakpoints
