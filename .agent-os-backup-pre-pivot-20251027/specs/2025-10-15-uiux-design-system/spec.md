# Specification: UI/UX Design System Implementation + Experiential Layer Enhancements

## Goal

Transform the nino-chavez-gallery from functionally complete to **innovative, emotionally resonant experience** by:
1. Implementing a cohesive design system and refining 43 identified component issues
2. Adding experiential layer enhancements that create cinematic user flow and emotional engagement
3. Leveraging the unique EMOTION_PALETTE as a core interaction mode rather than minor accent
4. Achieving the innovative, modern, sleek, forward-thinking aesthetic matching nino-chavez-site standards

**Timeline:** 10-12 days (was 8-10 days before experiential enhancements)

## User Stories

- As a user, I want consistent button styling across the app so that interactive elements feel cohesive and professional
- As a user, I want optimal photo grid layouts so that I can view maximum photos per viewport without excessive scrolling
- As a user, I want smooth animations and micro-interactions so that the interface feels responsive and polished
- As a keyboard user, I want visible focus indicators so that I can navigate the site effectively
- As a user with visual impairments, I want high-contrast text so that all content is readable (WCAG AA compliance)
- As a user, I want contextual empty states so that I understand what to do when no content is available
- As a user, I want skeleton loading states so that I know content is loading and experience minimal layout shift

## Core Requirements

### Functional Requirements

**Phase 1: Design System Enforcement (Critical)**
- Unified Button component with 4 variants (primary, secondary, tertiary, icon)
- Semantic Typography components (Heading with 6 levels, Text with 4 variants)
- Color token enforcement across all components (replace hardcoded colors)
- Typography scale defined in globals.css with semantic variables

**Phase 2: Component Refinement (High Priority)**
- PortfolioGrid optimized for responsive breakpoints (2 cols mobile → 6 cols ultra-wide)
- EmotionTimeline GSAP integration fixed (migrate from DOM selectors to React refs)
- StoryViewer controls enhanced for accessibility (44px+ touch targets, 4.5:1 contrast)
- Skeleton loading states implemented to prevent layout shift (CLS < 0.1)

**Phase 3: Polish & Micro-Interactions (Medium Priority)**
- Contextual EmptyState component for all routes (portfolio, search, browse, stories, album)
- Button click animations with scale feedback (0.98 → 1.0)
- Photo hover state animations (zoom, overlay, fade-in metadata)
- PlayTypeMorphGrid spring physics refinement (smoother, less bouncy)

**Phase 4: Accessibility & Responsiveness (Medium Priority)**
- Contrast audit ensuring WCAG AA compliance (4.5:1 minimum)
- Mobile responsiveness optimization at 5 breakpoints (360px, 480px, 768px, 1024px, 1536px)
- Focus indicators on all interactive elements (consistent accent-primary ring)
- Adaptive text contrast over images (gradient scrims for readability)

### Non-Functional Requirements

**Performance**
- LCP < 2.5s (Largest Contentful Paint)
- CLS < 0.1 (Cumulative Layout Shift via skeleton states)
- Animations maintain 60fps
- Grid displays maximum photos per viewport

**Accessibility**
- WCAG AA compliance (4.5:1 contrast ratio minimum)
- Keyboard navigation functional on all pages
- Focus indicators visible with 2px accent-primary ring
- Screen reader support verified
- Touch targets minimum 44x44px on mobile

**Code Quality**
- Zero TypeScript errors
- Zero ESLint violations
- All components documented with JSDoc
- Proper error boundaries in place

## Visual Design

### Existing Design System Assets

**Current State:**
- `/src/app/globals.css` - Design tokens partially defined (colors, button system, animations)
- `/src/lib/motion-tokens.ts` - Motion configs and emotion palette (6 emotions: triumph, focus, intensity, determination, excitement, serenity)
- Color system defined but underutilized (accent colors, grayscale, emotion palette)
- Typography scale partially defined in globals.css but not enforced via components

**Design Target:**
- Aesthetic: Innovative, modern, sleek, forward-thinking
- Reference standard: nino-chavez-site and signal-dispatch-blog
- Current status: Functionally complete but visually incomplete

### Key UI Elements to Implement

**Button System (4 Variants)**
- Primary: `bg-accent` (indigo), full prominence
- Secondary: `bg-gray-900`, standard use
- Tertiary: `bg-white/10`, glass effect for overlays
- Icon: Minimal padding, hover states only

**Typography Hierarchy**
- H1: `text-4xl md:text-5xl` (page titles)
- H2: `text-3xl md:text-4xl` (major sections)
- H3: `text-2xl md:text-3xl` (subsections)
- H4-H6: Scaled appropriately
- Body: `text-base` with 1.5 line-height
- Caption: `text-sm` with gray-600 color

**Color Tokens**
- Primary accent: `--color-accent` (#6366F1)
- Grayscale: `--color-gray-*` (50 through 900)
- Emotion palette: 6 emotions with primary colors, gradients, and glow effects

### Responsive Breakpoints

**Portfolio Grid Layout:**
- Mobile (default): 2 columns, gap-2
- Small mobile (sm:): 2 columns, gap-2
- Tablet (md: 768px): 3 columns, gap-3
- Desktop (lg: 1024px): 4 columns, gap-3
- Large desktop (xl: 1280px): 5 columns, gap-4
- Ultra-wide (2xl: 1536px): 6 columns, gap-4

## Reusable Components

### Existing Code to Leverage

**Components Already Present:**
- `LoadingState.tsx` - Has basic loading spinner and SkeletonGrid component
- `PortfolioGrid.tsx` - Has SortButton inline component (will extract to unified Button)
- `PlayTypeMorphGrid.tsx` - Uses framer-motion for animations, MOTION tokens from motion-tokens.ts
- `globals.css` - Has `.btn-primary`, `.btn-secondary` classes, card system, animations

**Patterns to Follow:**
- Framer Motion animations: Used in PlayTypeMorphGrid with MOTION.spring.responsive
- Motion tokens: MOTION.spring (gentle, responsive, snappy), MOTION.duration, MOTION.ease
- Emotion palette: Already defined in motion-tokens.ts, needs integration
- Card system: `.card-base`, `.hover-lift` classes in globals.css
- Button classes: `.btn-primary`, `.btn-secondary` in globals.css (will migrate to React component)

**Services/Utilities:**
- `motion-tokens.ts` - MOTION config, EMOTION_PALETTE, EMOTION_ICONS, PLAY_TYPE_ICONS
- `globals.css` - Design token CSS variables, animation keyframes, focus styles

### New Components Required

**Must Create:**
- `Button.tsx` - Unified button component (no existing React button component)
- `Typography.tsx` - Heading and Text components for semantic typography enforcement
- `EmptyState.tsx` - Contextual empty states for routes (none exists)
- `PhotoSkeleton.tsx` - Specific skeleton for photo grid items (SkeletonGrid exists but not specific enough)

**Why New Components Needed:**
- Button: Current implementation uses inline className strings and CSS utility classes `.btn-primary`/`.btn-secondary`, not reusable React component
- Typography: No semantic Heading/Text components exist; all headings use inline `<h1 className="...">` patterns
- EmptyState: No contextual empty state component; currently using basic div messages
- PhotoSkeleton: Existing SkeletonGrid is generic; need aspect-ratio specific skeleton for photo grids

## Technical Approach

### Database
- No database changes required (visual refinement only)

### API
- No API changes required (visual refinement only)

### Frontend

**Phase 1: Design System Enforcement (Days 1-3)**

Files to Create:
- `/src/components/ui/Button.tsx` - Unified button with 4 variants, sizes, loading states
- `/src/components/ui/Typography.tsx` - Heading (6 levels) and Text (4 variants) components
- `/src/components/ui/index.ts` - Export all UI components

Files to Modify:
- `/src/app/globals.css` - Add semantic typography CSS variables (font sizes, line heights, letter spacing)
- `/src/components/portfolio/PortfolioGrid.tsx` - Replace inline button styles with Button component
- `/src/components/gallery/PlayTypeMorphGrid.tsx` - Replace hardcoded colors with design tokens
- `/src/components/story/StoryViewer.tsx` - Replace inline button styles with Button component
- `/src/components/filters/PhotoFilters.tsx` - Replace button styles
- `/src/components/filters/MagneticFilterBar.tsx` - Replace button styles
- All page files (`/src/app/*/page.tsx`) - Replace h1-h6 with Heading component, p with Text component
- Search codebase for `bg-blue-600`, `bg-black`, `bg-white/20` and replace with design tokens

**Phase 2: Component Refinement (Days 4-6)**

Files to Modify:
- `/src/components/portfolio/PortfolioGrid.tsx` - Optimize responsive grid breakpoints, add responsive gap classes
- `/src/components/interactions/EmotionTimeline.tsx` - Migrate GSAP Draggable from DOM selectors to React refs
- `/src/components/story/StoryViewer.tsx` - Enhance control buttons (48x48px, better contrast, aria-labels, keyboard shortcuts)
- `/src/components/common/LoadingState.tsx` - Enhance SkeletonGrid with photo-specific skeleton

Files to Create:
- `/src/components/common/PhotoSkeleton.tsx` - Aspect-ratio specific skeleton with shimmer animation

**Phase 3: Polish & Micro-Interactions + Experiential Enhancements (Days 7-10)**

Files to Create:
- `/src/components/common/EmptyState.tsx` - 5 state types with emotion palette icons
- `/src/components/transitions/PageTransition.tsx` - Page transition wrapper with AnimatePresence
- `/src/components/transitions/EmotionAmbience.tsx` - Ambient background effects for emotion theming

Files to Modify:
- `/src/components/ui/Button.tsx` - Add click animation (active:scale-95)
- `/src/components/portfolio/PortfolioGrid.tsx` - Add photo hover animations (zoom, overlay) + staggered entrance animations
- `/src/components/gallery/PlayTypeMorphGrid.tsx` - Refine spring physics (reduce stiffness)
- `/src/lib/motion-tokens.ts` - Adjust spring configurations for smoother feel + add emotion-based animation configs
- `/src/components/filters/MagneticFilterBar.tsx` - Enhance with emotion filter prominence and glow effects
- `/src/app/layout.tsx` - Wrap with PageTransition component
- `/src/app/photo/[id]/page.tsx` - Integrate EmotionAmbience wrapper
- All route page files - Integrate EmptyState component for zero-result scenarios

**Phase 4: Accessibility & Responsiveness (Days 9-10)**

Files to Modify:
- `/src/app/globals.css` - Enhance focus ring styles globally
- All component files - Audit contrast ratios, fix any below 4.5:1
- All image-overlay components - Add gradient scrims for text contrast
- All interactive elements - Verify 44x44px touch targets on mobile

### Testing

**After Each Phase:**
- Run `npm run build` - Verify no compilation errors
- Run `npm run type-check` - Verify no TypeScript errors
- Run `npm run lint` - Verify no ESLint violations
- Manual test at localhost:3000 - No console errors or warnings
- Visual regression - Compare before/after at multiple breakpoints

**Phase-Specific Testing:**
- Phase 1: Verify all buttons use Button component (grep for hardcoded button classes returns 0)
- Phase 2: Test responsive grid at 5 breakpoints, verify GSAP Draggable works, test keyboard navigation
- Phase 3: Verify all empty states contextual, test hover animations, verify smooth springs
- Phase 4: Run axe DevTools accessibility audit, test keyboard navigation, verify contrast ratios

**Accessibility Testing:**
- Contrast checker (WebAIM or similar) for all text on backgrounds
- Keyboard-only navigation test (Tab, Enter, Escape, Arrow keys)
- Screen reader test (VoiceOver on macOS or NVDA on Windows)
- Touch target size verification on mobile devices

## Out of Scope

**Not Included in This Project:**
- Backend functionality changes
- Database schema modifications
- New feature development (focus is visual refinement only)
- SmugMug API integration improvements
- Content management system changes
- Authentication/authorization changes
- Print order processing logic changes
- SEO/metadata improvements
- Performance optimization beyond CLS/LCP related to design system

**Future Enhancements (After This Project):**
- Dark mode color scheme (globals.css has base but not fully implemented)
- Advanced animation sequences beyond micro-interactions
- Custom illustration set for empty states (currently using icons)
- Accessibility beyond WCAG AA (AAA compliance)
- Internationalization (i18n) support
- Advanced theming system (user-selectable themes)

## Experiential Layer Enhancements

### Strategic Context

The current specification guarantees a premium, technically excellent implementation. These enhancements elevate the experience from "premium" to "innovative" by adding the **connective tissue** that transforms discrete components into a cohesive, emotionally resonant journey.

### Enhancement 1: Macro-level Motion and State Transitions

**Gap Identified:** The plan defines excellent micro-interactions (button clicks, photo hovers) but lacks specification for macro-transitions between page states. This can create a disconnected experience of beautifully designed screens rather than a single, fluid environment.

**The Opportunity:** Create a seamless, cinematic user flow that guides attention and reinforces spatial relationships.

**Implementations:**

1. **Page Transition System**
   - **Component:** Create `PageTransition.tsx` wrapper using Framer Motion's `AnimatePresence`
   - **Behavior:** Subtle, fast fade-in/fade-out (200ms) between route navigation
   - **Technical:** Wrap app content in layout.tsx with AnimatePresence
   - **Acceptance:** Zero jarring cuts during navigation, smooth opacity transitions

2. **Shared Layout Animations**
   - **Component:** Enhance PortfolioGrid and photo detail pages with shared layout animations
   - **Behavior:** When user clicks photo thumbnail, image animates from grid position to detail view
   - **Technical:** Use Framer Motion's `layoutId` prop to create morphing effect
   - **Acceptance:** Thumbnail image smoothly expands to full-size detail view
   - **Example:**
     ```typescript
     // PortfolioGrid.tsx
     <motion.div layoutId={`photo-${photo.id}`}>
       <Image src={photo.url} />
     </motion.div>

     // photo/[id]/page.tsx
     <motion.div layoutId={`photo-${photoId}`}>
       <Image src={photo.url} />
     </motion.div>
     ```

3. **Choreographed Entrances**
   - **Component:** Enhance PortfolioGrid with staggered entrance animations
   - **Behavior:** Photos fade and slide into view sequentially (rows or individual items)
   - **Technical:** Use Framer Motion's `staggerChildren` variant
   - **Timing:** 50ms stagger delay, 300ms fade-in per item
   - **Acceptance:** Grid feels alive and dynamic, not static instant render

### Enhancement 2: Narrative and Guided User Journey

**Gap Identified:** The plan builds robust sections (portfolio, stories, albums) but assumes users will navigate themselves. An innovative experience guides users and tells a story.

**The Opportunity:** Transform gallery from passive container to active, curated experience that increases engagement and emotional connection.

**Implementations:**

1. **Curated Entry Points on Homepage**
   - **Component:** Create `FeaturedModule.tsx` for homepage
   - **Variants:** Featured Stories, Latest Additions, Thematic Collections
   - **Behavior:** Compelling, context-rich entry points into gallery
   - **Content:** Each module shows 3-4 hero items with emotional copy
   - **Acceptance:** Homepage becomes discovery tool, not just navigation menu
   - **Phase:** V2 (Post-Launch) - requires content curation strategy

2. **Connected Viewing Experience (Filmstrip Navigation)**
   - **Component:** Create `PhotoFilmstrip.tsx` for photo detail pages
   - **Behavior:** Bottom-mounted horizontal strip showing related photos from same album/story
   - **Interaction:** Click to navigate, drag to scroll, keyboard arrows supported
   - **Technical:** Use GSAP Draggable for smooth horizontal scroll
   - **Acceptance:** Users stay immersed in viewing flow without returning to grid
   - **Phase:** V2 (Post-Launch) - depends on photo relationship metadata

### Enhancement 3: Emotion Palette as Core Interaction Layer

**Gap Identified:** The `EMOTION_PALETTE` is currently limited to "quality badges and filter states" - a unique branding opportunity being used as minor accent.

**The Opportunity:** Elevate "emotion" from simple tag to primary interaction mode and core visual identity.

**Implementations:**

1. **Emotion as Ambient Theme**
   - **Component:** Create `EmotionAmbience.tsx` wrapper component
   - **Behavior:** When viewing photos with emotion tags, apply subtle ambient background effect
   - **Visual:** Slow-moving, low-opacity radial gradient using emotion's color palette
   - **Technical:** CSS custom properties updated dynamically based on active emotion
   - **Example:**
     ```typescript
     // When viewing "Serenity" photo
     <div style={{
       background: `radial-gradient(circle at 50% 50%,
         ${EMOTION_PALETTE.serenity}10 0%,
         transparent 70%)`
     }}>
     ```
   - **Acceptance:** User feels immersed in photo's emotional mood
   - **Phase:** Phase 3 (Polish)

2. **Emotion as Primary Filter**
   - **Component:** Enhance `MagneticFilterBar.tsx` with emotion filter prominence
   - **Behavior:** Emotion filters featured prominently alongside sport/playType
   - **Visual:** Each emotion filter uses its palette color with glow effect
   - **Interaction:** Clicking emotion filter shows all photos matching that mood
   - **Acceptance:** Users can explore entire gallery through emotional lens
   - **Phase:** Phase 3 (Polish)

3. **Emotion-Driven Micro-interactions**
   - **Component:** Enhance photo hover effects based on emotion tag
   - **Behavior:**
     - Serenity: Slow, gentle fade and minimal zoom (1.05x)
     - Excitement: Fast, energetic zoom (1.15x) with quick transition
     - Intensity: Strong zoom with high-contrast overlay
     - Triumph: Scale with upward motion bias
   - **Technical:** Dynamic animation config in hover handler based on photo.emotion
   - **Acceptance:** Hover feels contextually appropriate to photo's mood
   - **Phase:** Phase 3 (Polish)

### Implementation Priority Matrix

| Enhancement | Impact | Effort | Phase | Priority |
|-------------|--------|--------|-------|----------|
| Page transitions | HIGH | LOW | Phase 3 | P1 |
| Staggered grid entrances | MEDIUM | LOW | Phase 3 | P1 |
| Emotion ambient theme | HIGH | MEDIUM | Phase 3 | P1 |
| Emotion-driven hovers | MEDIUM | LOW | Phase 3 | P2 |
| Emotion primary filter | HIGH | MEDIUM | Phase 3 | P2 |
| Shared layout animations | HIGH | HIGH | V2 | P3 |
| Curated entry points | HIGH | HIGH | V2 | P3 |
| Filmstrip navigation | MEDIUM | MEDIUM | V2 | P3 |

### Updated Phase 3 Scope

**Original Phase 3 Tasks:**
- EmptyState component creation
- Button click animations
- Photo hover animations
- Spring physics refinement

**Enhanced Phase 3 Tasks:**
- ✅ All original tasks PLUS:
- Page transition system (PageTransition wrapper)
- Choreographed grid entrances (staggered animations)
- Emotion ambient theme (EmotionAmbience component)
- Emotion-driven hover effects (dynamic animation configs)
- Emotion as primary filter (MagneticFilterBar enhancement)

**Phase 3 Updated Duration:** 3-4 days (was 2-3 days)

### V2 Roadmap (Post-Launch)

**Strategic Enhancements Requiring Content/UX Planning:**

1. **Curated Entry Points**
   - Requires editorial content strategy
   - Featured story selection process
   - Thematic collection curation
   - Hero image and copy writing

2. **Filmstrip Navigation**
   - Requires photo relationship metadata
   - Album/story context association
   - Navigation state management
   - Performance optimization for thumbnail loading

3. **Shared Layout Animations**
   - Requires deep Next.js App Router integration
   - Route transition state management
   - Image optimization for morphing animations
   - Careful memory management

**Estimated V2 Effort:** 5-7 additional days after Phase 4 completion

## Implementation Phases

### Phase 1: Design System Enforcement (Priority: CRITICAL, Days 1-3)

**Dependencies:** None (foundational work)

**Tasks:**
1. Create unified Button component (`/src/components/ui/Button.tsx`)
2. Create Typography components (`/src/components/ui/Typography.tsx`)
3. Update globals.css with semantic typography scale
4. Replace all hardcoded button styles with Button component (15+ files)
5. Replace all hardcoded colors with design tokens (25+ files)
6. Integrate emotion palette into at least 5 components

**Acceptance Criteria:**
- Button.tsx exports Button component with 4 variants, 3 sizes, loading/disabled states
- Typography.tsx exports Heading (6 levels) and Text (4 variants)
- Zero hardcoded button styles remain (`grep "bg-blue-600\|rounded-full bg-black" returns 0`)
- Zero hardcoded color hex values in components
- All page titles use `<Heading level={1}>`
- All section headers use `<Heading level={2}>`
- Emotion palette colors used in quality badges and filter states

### Phase 2: Component Refinement (Priority: HIGH, Days 4-6)

**Dependencies:** Phase 1 complete (uses Button component and design tokens)

**Tasks:**
1. Optimize PortfolioGrid responsive breakpoints (2→6 cols)
2. Fix EmotionTimeline GSAP integration (migrate to refs)
3. Enhance StoryViewer accessibility (contrast, size, labels)
4. Implement PhotoSkeleton component and integrate in grids

**Acceptance Criteria:**
- PortfolioGrid shows 2 cols mobile, 3 tablet, 4 desktop, 5-6 ultra-wide
- EmotionTimeline mounts without GSAP console errors
- GSAP Draggable responds to mouse drag events
- StoryViewer controls are 48x48px minimum
- StoryViewer contrast ratio >= 4.5:1
- All StoryViewer controls have aria-labels
- Skeleton loading visible during data fetch
- No layout shift when photos load (CLS < 0.1)

### Phase 3: Polish & Micro-Interactions + Experiential Enhancements (Priority: MEDIUM, Days 7-10)

**Dependencies:** Phase 1 and 2 complete

**Tasks:**

**Original Polish Tasks:**
1. Create EmptyState component with 5 state types
2. Add button click animations (scale feedback)
3. Implement photo hover animations (zoom, overlay)
4. Refine PlayTypeMorphGrid spring physics

**NEW: Experiential Layer Enhancements:**
5. Create PageTransition wrapper component (Framer Motion AnimatePresence)
6. Implement choreographed grid entrances (staggered fade/slide animations)
7. Create EmotionAmbience component (ambient background effects based on photo emotion)
8. Enhance MagneticFilterBar with emotion filter prominence
9. Implement emotion-driven hover effects (dynamic animation configs per emotion)

**Acceptance Criteria:**

**Original Criteria:**
- EmptyState component handles portfolio, search, browse, stories, album states
- All button clicks show active:scale-95 feedback
- Photo hover shows 1→1.1x zoom, dark overlay, metadata fade-in
- PlayTypeMorphGrid animations feel smooth (not bouncy)
- All empty states use emotion palette colors
- Hover animations complete in 300-500ms

**NEW: Experiential Layer Criteria:**
- PageTransition wrapper implemented in layout.tsx with 200ms fade transitions
- Zero jarring cuts during route navigation
- PortfolioGrid photos fade/slide in with 50ms stagger delay
- Grid entrance feels alive and dynamic (not instant render)
- EmotionAmbience component applies subtle radial gradients based on photo emotion
- User feels immersed in photo's emotional mood when viewing detail pages
- MagneticFilterBar prominently displays emotion filters with glow effects
- Users can explore gallery through emotional lens (filter by triumph, serenity, etc.)
- Photo hovers adapt to emotion tag (serenity=gentle, excitement=energetic)
- Hover behavior contextually appropriate to photo's mood

### Phase 4: Accessibility & Responsiveness (Priority: MEDIUM, Days 9-10)

**Dependencies:** All previous phases complete

**Tasks:**
1. Audit all text contrast ratios (WCAG AA compliance)
2. Verify responsive breakpoints at 5 viewport sizes
3. Add focus indicators to all interactive elements
4. Implement adaptive text contrast over images

**Acceptance Criteria:**
- All text passes WCAG AA (4.5:1 contrast minimum)
- No horizontal scroll at any breakpoint (360px, 480px, 768px, 1024px, 1536px)
- All touch targets >= 44x44px on mobile
- All interactive elements show focus ring on Tab
- Focus ring color consistent (accent-primary)
- Image overlays have gradient scrims for text readability
- Zero accessibility warnings in axe DevTools

## Success Criteria

### Design System Adoption (Phase 1)
- 100% of buttons use `<Button>` component (0 hardcoded button styles)
- 95%+ of headings use `<Heading>` component
- 90%+ of text uses `<Text>` component
- 100% of colors sourced from design tokens (0 hardcoded hex/rgb)

### Visual Polish (Phases 2-3)
- Grid shows maximum photos per viewport (2-6 columns based on screen size)
- All empty states contextual and helpful with emotion palette colors
- Skeleton loading visible during data fetch
- Micro-interactions on all interactive elements (buttons, photos, filters)
- Smooth page transitions without jarring layout shifts

### Accessibility (Phase 4)
- WCAG AA compliance verified (4.5:1 contrast minimum)
- Keyboard navigation functional on all pages
- Focus indicators visible on all interactive elements
- Screen reader support verified with VoiceOver/NVDA
- No accessibility console warnings or errors

### Performance
- LCP < 2.5s (maintain existing performance)
- CLS < 0.1 (improved via skeleton states)
- Grid optimization shows 3-4x more photos per viewport
- All animations maintain 60fps (no jank)

### Code Quality
- Zero TypeScript errors (`npm run type-check`)
- Zero ESLint violations (`npm run lint`)
- Build succeeds without warnings (`npm run build`)
- All components exported from `/src/components/ui/index.ts`

## Quality Gates

**After Each Task:**
```bash
npm run type-check  # No TypeScript errors
npm run lint        # No ESLint violations
```

**After Each Phase:**
```bash
npm run build       # No compilation errors
npm run dev         # Manual test at localhost:3000
# Visual verification at multiple breakpoints
# No console errors or warnings
```

**Before Project Completion:**
```bash
# All 43 issues from audit resolved
# All acceptance criteria met for all 4 phases
# Accessibility audit passes (axe DevTools)
# Visual consistency verified at 5 breakpoints
# Performance metrics maintained (LCP, CLS)
```

## File Modifications Summary

**Files to Create (8 new files):**
- `/src/components/ui/Button.tsx`
- `/src/components/ui/Typography.tsx`
- `/src/components/ui/index.ts`
- `/src/components/common/EmptyState.tsx`
- `/src/components/common/PhotoSkeleton.tsx`
- `/src/components/transitions/PageTransition.tsx` - NEW (Experiential Layer)
- `/src/components/transitions/EmotionAmbience.tsx` - NEW (Experiential Layer)
- `/src/components/transitions/index.ts` - NEW (Experiential Layer)

**Files to Modify (20+ files):**
- `/src/app/globals.css`
- `/src/lib/motion-tokens.ts`
- `/src/components/portfolio/PortfolioGrid.tsx`
- `/src/components/gallery/PlayTypeMorphGrid.tsx`
- `/src/components/story/StoryViewer.tsx`
- `/src/components/interactions/EmotionTimeline.tsx`
- `/src/components/common/LoadingState.tsx`
- `/src/components/filters/PhotoFilters.tsx`
- `/src/components/filters/MagneticFilterBar.tsx`
- `/src/app/page.tsx`
- `/src/app/portfolio/page.tsx`
- `/src/app/browse/page.tsx`
- `/src/app/search/page.tsx`
- `/src/app/stories/[id]/page.tsx`
- `/src/app/album/[key]/page.tsx`
- `/src/app/photo/[id]/page.tsx`
- All components with hardcoded colors or typography

## Dependencies

**Required npm Packages (Already Installed):**
- `next` - App Router framework
- `react` - UI library
- `typescript` - Type safety
- `tailwindcss` - Utility-first CSS
- `framer-motion` - Animation library
- `gsap` - Advanced animations (EmotionTimeline)
- `lucide-react` - Icon library (for EmptyState icons)

**No New Dependencies Required**

## Execution Strategy

**Sequential Phase Execution:**
1. Phase 1 must complete before Phase 2 (design tokens needed for components)
2. Phase 2 must complete before Phase 3 (refined components needed for polish)
3. Phase 4 can begin after Phase 2 (parallel with Phase 3)

**Incremental Commits:**
- Commit after each task completion
- Commit message format: `feat(design-system): [task description]`
- Example: `feat(design-system): create unified Button component with 4 variants`

**Testing at Each Step:**
- Build verification after every file change
- Visual test at localhost:3000 after each component modification
- No progression to next task until current task acceptance criteria met

**Backward Compatibility:**
- Maintain existing functionality throughout
- No breaking changes to component APIs
- All existing routes remain functional

## Technical Specifications

### Button Component Signature

```typescript
type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}
```

### Typography Component Signatures

```typescript
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type TextVariant = 'body' | 'caption' | 'label' | 'code';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: HeadingLevel;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
}

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: TextVariant;
  children: React.ReactNode;
}
```

### EmptyState Component Signature

```typescript
type EmptyStateType = 'portfolio' | 'search' | 'browse' | 'stories' | 'album';

interface EmptyStateProps {
  type: EmptyStateType;
  searchQuery?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

### PhotoSkeleton Component Signature

```typescript
interface PhotoSkeletonProps {
  className?: string;
}
```

## Color Token Mapping

**Replace hardcoded colors with tokens:**
- `bg-blue-600` → `bg-accent` or `bg-accent-primary`
- `bg-black` → `bg-gray-950` or `bg-gray-900`
- `bg-white/20` → `bg-white/10` (glass effect)
- `text-white` → `text-gray-50`
- `text-black` → `text-gray-950`
- Emotion colors → Use `EMOTION_PALETTE` from motion-tokens.ts

## Motion Token Usage

**Spring Physics (from motion-tokens.ts):**
- Gentle: `{ stiffness: 120, damping: 14 }` - Smooth, slow transitions
- Responsive: `{ stiffness: 300, damping: 25 }` - Current PlayTypeMorphGrid setting
- Snappy: `{ stiffness: 400, damping: 25 }` - Quick, immediate feedback

**Recommended Adjustments (Phase 3):**
- Responsive: Reduce stiffness to 200-280 for less bouncy feel
- Damping: Adjust to 18-20 for smoother motion

**Duration Tokens:**
- instant: 0.1s
- fast: 0.2s
- base: 0.3s
- slow: 0.5s
- slower: 0.8s

## Verification Commands

**Type Safety:**
```bash
npm run type-check
```

**Linting:**
```bash
npm run lint
```

**Build:**
```bash
npm run build
```

**Search for Violations:**
```bash
# Find hardcoded button styles (should return 0 after Phase 1)
grep -r "bg-blue-600\|rounded-full bg-black\|bg-white/20" src/components/ --include="*.tsx"

# Find hardcoded hex colors (should return 0 after Phase 1)
grep -r "#[0-9A-Fa-f]{6}" src/components/ --include="*.tsx"

# Find inline heading styles (should return 0 after Phase 1)
grep -r "<h[1-6] className=\"text-" src/ --include="*.tsx"
```

## Notes for Implementation

**Critical Success Factors:**
1. Execute phases sequentially (Phase 2 depends on Phase 1 completion)
2. Test at multiple breakpoints after every layout change
3. Verify accessibility with keyboard-only navigation testing
4. Maintain backward compatibility throughout
5. Commit incrementally for rollback safety

**Risk Mitigation:**
- Phase 1 has highest risk (foundation for all subsequent work) - test thoroughly
- GSAP ref migration (Phase 2) requires careful testing for memory leaks
- Color token replacement (Phase 1) requires visual verification to prevent regressions
- Responsive grid changes (Phase 2) must test at all 5 breakpoints

**Performance Considerations:**
- Skeleton states improve perceived performance (prevent CLS)
- Optimized grid breakpoints reduce scrolling (better UX)
- Framer Motion animations use GPU acceleration (maintain 60fps)
- Spring physics adjustments reduce computational overhead

**Accessibility Priorities:**
- Contrast ratios take precedence over visual preferences
- Touch target sizes non-negotiable on mobile
- Focus indicators must be visible (never outline: none without replacement)
- Keyboard navigation must work on all interactive elements
