# UI/UX Design System Implementation - Requirements

## Source Documents
- Visual UI/UX Audit Report (docs/VISUAL_UIUX_AUDIT_REPORT.md)
- UI/UX Implementation Plan (docs/UIUX_IMPLEMENTATION_PLAN.md)

## Executive Summary

The nino-chavez-gallery application requires a comprehensive design system enforcement and visual refinement to achieve the premium, cohesive aesthetic matching the nino-chavez-site and signal-dispatch-blog standards.

**Status:** Functionally complete but visually incomplete
**Goal:** Innovative, modern, sleek, forward-thinking design
**Total Issues Identified:** 43 design system and component-level issues

## Critical Requirements

### 1. Design System Enforcement (Phase 1 - Priority: CRITICAL)

#### 1.1 Unified Button Component
- **Objective:** Replace all hardcoded button styles with unified Button component
- **Variants Required:** 4 variants (primary, secondary, tertiary, icon)
- **Current Issues:**
  - Inconsistent use of `bg-blue-600`, `rounded-full bg-black`, `bg-white/20`
  - No standardized button system
- **Impact:** HIGH severity

#### 1.2 Semantic Typography Components
- **Objective:** Define Heading and Text components enforcing consistent typography scale
- **Components Required:** Heading (6 levels), Text (4 variants)
- **Current Issues:**
  - Fragmented heading sizes (text-3xl, text-2xl, text-xl inconsistently)
  - No semantic mapping
- **Impact:** HIGH severity

#### 1.3 Color Token Enforcement
- **Objective:** Replace all hardcoded colors with design system tokens
- **Current Issues:**
  - EMOTION_PALETTE defined but unused (6 emotion types)
  - Inconsistent use of `accent-primary`
  - Hardcoded colors in 25+ components
- **Impact:** HIGH severity

#### 1.4 Typography Scale in globals.css
- **Objective:** Define semantic typography scale in design tokens layer
- **Requirements:**
  - Font sizes (h1-h6, body, caption)
  - Line heights (tight, snug, normal, relaxed, loose)
  - Letter spacing
  - Font families
- **Impact:** MEDIUM severity

### 2. Component Refinement (Phase 2 - Priority: HIGH)

#### 2.1 PortfolioGrid Layout Efficiency
- **Objective:** Optimize responsive grid to show maximum photos per viewport
- **Current Issues:**
  - Only 1-2 photos visible despite 1000+ photos
  - Suboptimal breakpoints (1 col mobile, 2-3 cols desktop)
  - Large gaps waste space
- **Target:** 2 cols mobile, 3 tablet, 4 desktop, 5-6 ultra-wide
- **Impact:** HIGH severity

#### 2.2 EmotionTimeline GSAP Integration
- **Objective:** Fix broken DOM selector issue; migrate to React refs
- **Current Issues:**
  - Targets non-existent `.quality-photo-card` selector
  - GSAP Draggable initialization fails silently
  - Interactive timeline completely non-functional
- **Impact:** HIGH severity

#### 2.3 StoryViewer Control Accessibility
- **Objective:** Improve contrast, button size, focus indicators, labels
- **Current Issues:**
  - Low contrast (2.5:1 ratio, needs 4.5:1 minimum)
  - Small touch targets (<44px)
  - Missing focus indicators
  - No aria-labels
- **Impact:** HIGH severity

#### 2.4 Skeleton Loading States
- **Objective:** Prevent layout shift (CLS); improve perceived performance
- **Requirements:**
  - PhotoSkeleton component
  - Integration in PortfolioGrid and PlayTypeMorphGrid
  - Shimmer animation
- **Impact:** MEDIUM severity

### 3. Polish & Micro-Interactions (Phase 3 - Priority: MEDIUM)

#### 3.1 Contextual Empty States
- **Objective:** Design helpful, branded empty state screens for all routes
- **Routes:** /portfolio, /search, /browse, /stories, /album
- **Requirements:**
  - EmptyState component with 5 state types
  - Emotion palette colors in icons
  - Optional action buttons
- **Impact:** MEDIUM severity

#### 3.2 Button Click & Filter Micro-Interactions
- **Objective:** Add visual feedback to interactive elements
- **Requirements:**
  - Scale feedback (0.98 → 1.0)
  - Shadow effects
  - Smooth transitions (300ms)
- **Impact:** MEDIUM severity

#### 3.3 Photo Hover State Animations
- **Objective:** Add sophisticated hover effects to grid photos
- **Requirements:**
  - Image zoom (1 → 1.1x scale)
  - Dark overlay
  - Text/icon fade-in
  - 300-500ms timing
- **Impact:** LOW severity

#### 3.4 PlayTypeMorphGrid Spring Physics
- **Objective:** Adjust GSAP spring configuration for natural motion
- **Current Issues:**
  - Bouncy, unnatural feel (damping: 20, stiffness: 300)
- **Target:** Smoother physics (damping: 18-20, stiffness: 200-280)
- **Impact:** LOW severity

### 4. Accessibility & Responsiveness (Phase 4 - Priority: MEDIUM)

#### 4.1 Contrast Issues Audit
- **Objective:** Ensure WCAG AA compliance (4.5:1 contrast minimum)
- **Requirements:**
  - All text passes WCAG AA
  - Image-based text has scrim/background
  - Testing with axe DevTools
- **Impact:** MEDIUM severity

#### 4.2 Mobile Responsiveness Optimization
- **Objective:** Verify optimal experience at all breakpoints
- **Test Points:** 360px, 480px, 768px, 1024px, 1536px
- **Requirements:**
  - No horizontal scrolling
  - 44x44px minimum touch targets
  - Readable text (16px minimum)
- **Impact:** MEDIUM severity

#### 4.3 Focus Indicators
- **Objective:** Ensure keyboard navigation is visible and accessible
- **Requirements:**
  - Global focus ring styles
  - Consistent accent-primary color
  - Logical focus order
  - No focus traps
- **Impact:** MEDIUM severity

#### 4.4 Adaptive Text Contrast Over Images
- **Objective:** Ensure text readable on any background image
- **Requirements:**
  - Gradient scrims for contrast
  - Guaranteed 4.5:1 ratio
  - Position variants (top, center, bottom)
- **Impact:** LOW severity

## Success Metrics

### Design System Adoption
- ✅ 100% of buttons use Button component (0 hardcoded styles)
- ✅ 95%+ of headings use Heading component
- ✅ 90%+ of text uses Text component
- ✅ All colors sourced from design tokens (0 hardcoded hex/rgb)

### Visual Polish
- ✅ All empty states contextual and helpful
- ✅ Skeleton loading visible during data fetch
- ✅ Micro-interactions on all interactive elements
- ✅ Smooth page transitions

### Accessibility
- ✅ WCAG AA compliance (4.5:1 contrast minimum)
- ✅ Keyboard navigation works on all pages
- ✅ Focus indicators visible
- ✅ Screen reader support verified
- ✅ No accessibility console warnings

### Performance
- ✅ LCP < 2.5s
- ✅ CLS < 0.1
- ✅ Grid shows maximum photos per viewport
- ✅ Animations maintain 60fps

### Code Quality
- ✅ No TypeScript errors
- ✅ No ESLint violations
- ✅ All components documented
- ✅ Proper error boundaries

## Technical Context

### Technology Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- GSAP (animation)
- React
- Framer Motion (some components)

### Existing Design System Assets
- `src/app/globals.css` - Design tokens
- `src/lib/motion-tokens.ts` - Motion and emotion palette
- Color system defined but underutilized
- Typography scale partially defined

### Files Requiring Modification
**Phase 1:** 15+ component files for design system enforcement
**Phase 2:** 4 major components (PortfolioGrid, EmotionTimeline, StoryViewer, LoadingState)
**Phase 3:** All interactive components for micro-interactions
**Phase 4:** All components for accessibility review

## Estimated Effort
- **Phase 1:** 2-3 days (Design System Enforcement)
- **Phase 2:** 3-4 days (Component Refinement)
- **Phase 3:** 2-3 days (Polish & Micro-Interactions)
- **Phase 4:** 2 days (Accessibility & Responsiveness)

**Total:** 8-12 days for complete implementation

## Execution Strategy
- Execute phases sequentially (Phase 2 depends on Phase 1)
- Run verification commands after each phase
- Test at multiple breakpoints
- Maintain backward compatibility
- Commit each task completion separately

## Quality Gates
After each phase:
- `npm run build` - No compilation errors
- `npm run type-check` - No TypeScript errors
- `npm run lint` - No ESLint violations
- No console errors on localhost:3000
- Visual consistency verified at multiple breakpoints
