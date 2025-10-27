## PHASE 2: Component Refinement (Days 4-6, Priority: HIGH)

### Task Group 2.2: EmotionTimeline GSAP Repair
**Assigned implementer:** ui-designer
**Dependencies:** Phase 1 complete
**Estimated Duration:** 0.5 days

- [x] 2.2.0 Complete EmotionTimeline GSAP Repair
  - [x] 2.2.1 Write 2-8 focused tests for EmotionTimeline functionality
    - Test timeline component mounts without errors
    - Test GSAP Draggable initializes successfully
    - Test timeline responds to drag events
    - Test cleanup function kills Draggable on unmount
    - Test no console warnings about missing targets
    - Limit to critical GSAP integration testing only
  - [x] 2.2.2 Migrate EmotionTimeline from DOM selectors to React refs
    - Remove broken `.quality-photo-card` DOM selector (line 45)
    - Add `useRef` for timeline container
    - Update GSAP Draggable.create to use ref instead of selector
    - Add cleanup function to kill Draggable on unmount (prevent memory leaks)
    - File: `src/components/interactions/EmotionTimeline.tsx`
  - [x] 2.2.3 Configure GSAP Draggable with proper bounds and inertia
    - Set type: 'x' for horizontal dragging
    - Configure bounds based on content width
    - Add onDragStart and onDragEnd handlers
    - Enable inertia for natural feel
    - Add cursor states: cursor-grab, active:cursor-grabbing
  - [x] 2.2.4 Ensure EmotionTimeline tests pass
    - Run ONLY the 2-8 tests written in 2.2.1
    - Verify no GSAP console errors
    - Verify dragging works with mouse
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 8 tests written in 2.2.1 pass ✓
- EmotionTimeline component mounts without console errors ✓
- GSAP Draggable initializes successfully on mount ✓
- Timeline responds to mouse drag events ✓
- No "GSAP target .quality-photo-card not found" warning ✓
- Cleanup function kills Draggable on unmount ✓
- Component keyboard accessible ✓

**Files Created:**
- `tests/e2e/EmotionTimeline.spec.ts`

**Files Modified:**
- `src/components/interactions/EmotionTimeline.tsx`
