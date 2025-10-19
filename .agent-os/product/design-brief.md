# Design Brief: The Living Archive

**Last Updated:** 2025-10-17
**Version:** 1.0.0
**Status:** Active Design System Reference

---

## Purpose

This document establishes non-negotiable aesthetic and interaction principles for The Living Archive. It bridges the gap between high-level product vision and concrete implementation details, ensuring every design decision aligns with our "award-winning" standard.

**Critical Context:** This brief exists to prevent design drift. Implementation must satisfy functional requirements AND deliver the experiential layer that differentiates The Living Archive from generic photo galleries.

---

## 1. Core Vision & Strategic Foundation

### Vision Statement

The Living Archive is a **cinematic, intelligent exploration platform** that transforms 20,000 sports photography images from a static library into a dynamic narrative experience. The site showcases **dual mastery**—both photographic artistry and digital design excellence.

### Aesthetic Goal

**Innovative. Modern. Sleek. Forward-thinking.**

The design should feel:
- **Emotionally resonant:** Users connect with photos through data-driven visual enhancements
- **Premium quality:** Visual polish rivaling Linear, Apple product pages, Stripe marketing
- **Content-first:** UI is the elegant gallery wall, not competing artwork
- **Performance-conscious:** Smooth 60fps interactions signal technical sophistication

### User Personas (Design Implications)

**The Explorer (Alex)**
- **Design Need:** Visually rich, immersive journey with "wow" moments
- **Primary Path:** Gallery Lobby → Featured Stories → 3D Emotion Galaxy
- **Key Features:** Cinematic transitions, emotion ambience, serendipitous discovery
- **Success Metric:** Time on site, feature engagement, return visits

**The Seeker (Maria)**
- **Design Need:** Ruthlessly efficient search and filtering
- **Primary Path:** Search bar → Quality-stratified grid → Detail view
- **Key Features:** Natural language search, contextual cursor, quality indicators
- **Success Metric:** Time to target photo, search success rate, download conversions

**The Curator (David)**
- **Design Need:** Utilitarian tools for gathering, organizing, exporting
- **Primary Path:** Thematic Collections → Bulk selection → PDF export
- **Key Features:** Multi-select, batch actions, export controls
- **Success Metric:** Collection build time, export usage, task completion rate

---

## 2. Aesthetic Principles (The "Look")

### Visual Hierarchy & Layout

**Principle:** Guide the user's eye to a clear focal point through deliberate hierarchy.

**Requirements:**
- **No flat, generic layouts:** Avoid uniform three-column card grids with equal visual weight
- **Use negative space deliberately:** 60% whitespace ratio creates clean "digital gallery" aesthetic
- **Establish clear focal points:** Hero photos, featured stories, and portfolio-worthy images dominate
- **Progressive information disclosure:** Metadata reveals on interaction, not upfront overload
- **Grid stratification:** Quality-scored photos prioritized at top, creating visual pyramid

**Anti-Pattern:** Standard Pinterest-style masonry grids with no differentiation between exceptional and mediocre photos.

**Reference Standard:** Apple product pages (clear hero, breathing room), Linear's feature pages (strong hierarchy, deliberate whitespace).

### Typography

**Principle:** Semantic type scale with clean, modern aesthetic.

**Requirements:**
- **Use Typography component exclusively:** All text must use defined semantic components
- **Font family:** Inter Variable font for clean, modern, highly legible text
- **Type scale:**
  - Body: 16px (1rem)
  - Small: 14px (0.875rem)
  - Headings: 24px / 32px / 48px (1.5rem / 2rem / 3rem)
- **Line height:** 1.5 for body, 1.2 for headings
- **Font weights:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Contrast:** WCAG AAA compliance (7:1 minimum)

**Anti-Pattern:** Mixing multiple typefaces, using system fonts, inconsistent sizing.

### Color System

**Principle:** Minimalist, content-first palette with AI data driving dynamic color.

**Base Palette (Muted & Neutral):**
- **Background:** Charcoal `#1a1a1a` (dark mode primary)
- **Surface:** Warm gray `#2a2a2a` (cards, elevated surfaces)
- **Text primary:** `#ffffff` (high contrast)
- **Text secondary:** `#a0a0a0` (metadata, labels)
- **Accent:** Gold `#d4af37` (quality indicators, CTAs)

**Emotion Palette (Data-Driven Accents):**
- **Triumph:** Gold `#FFD700` (radial gradient, warm glow)
- **Intensity:** Red-orange `#FF4500` (vibrant, energetic)
- **Focus:** Cool blue `#4169E1` (calm, concentrated)
- **Determination:** Deep purple `#6A0DAD` (strong, resolute)
- **Excitement:** Vibrant yellow `#FFD700` (bright, celebratory)
- **Serenity:** Soft teal `#40E0D0` (gentle, peaceful)

**Color Usage Rules:**
- **EMOTION_PALETTE is not just for accents:** It's a core system driving emotion halos, ambient theming, interactive glows, and timeline visualization
- **All colors from design tokens:** Never hard-code hex values; use CSS custom properties
- **Adaptive theming:** UI shifts to match dominant photo emotion (background gradients, filter orb colors, cursor glow)
- **Accessibility:** Maintain WCAG AA minimum (4.5:1) for all text, AAA (7:1) preferred

**Anti-Pattern:** Flat, single-color schemes that ignore AI metadata. Generic blue/gray palettes with no emotional resonance.

### Iconography

**Principle:** Clean, modern, consistent icon system enhances clarity without decoration.

**Requirements:**
- **Icon library:** Lucide React exclusively (modern, minimal, consistent stroke width)
- **NO EMOJIS:** Never use emojis in UI (❌ ⚡ 🛡️ 🤿). Use proper icons or text labels
- **Icon sizing:** 16px / 20px / 24px (consistent with type scale)
- **Stroke width:** 2px (matches Lucide default)
- **Color:** Inherit from parent text color (semantic consistency)
- **Usage:** Sparingly, only to enhance clarity (search icon, filter toggle, navigation)

**Play Type Indicators:**
- attack: `<Zap />` (Lucide)
- block: `<Shield />` (Lucide)
- dig: `<ArrowDown />` (Lucide)
- set: `<Target />` (Lucide)
- serve: `<Circle />` (Lucide)

**Anti-Pattern:** Emoji usage (🎾 ⚡), mixing icon libraries (Heroicons + Font Awesome), decorative icons without semantic purpose.

### Data Visualization as Art

**Principle:** Transform invisible AI metadata into elegant visual design elements.

**Emotion Halos:**
- Subtle colored glow around photos corresponding to detected emotion
- Glow radius: 4-12px based on quality score (higher quality = stronger glow)
- GPU-accelerated with `will-change: box-shadow`
- CSS custom properties for dynamic color injection

**Quality Glow:**
- Portfolio-worthy photos have gentle shimmer effect (animated box-shadow)
- Non-portfolio photos dimmed (opacity 60%, subtle blur 2-5px)
- Creates visual hierarchy: eyes drawn to quality automatically

**Composition Overlays:**
- AI-detected composition lines (rule of thirds, leading lines, framing, symmetry)
- Revealed on hover as SVG overlay with animated stroke-dashoffset
- Subtle styling: 40% opacity, white stroke, 1px width
- Educational purpose: shows composition technique
- Dismissible with click/tap

**Emotional Curve Graphs:**
- Story viewer displays emotion intensity over time as line chart
- Color-coded segments match emotion palette
- Real-time position indicator during playback
- Interactive: click graph to seek to moment

**Anti-Pattern:** Listing metadata as text labels. Generic tags without visual treatment. Missing the opportunity to make data beautiful.

---

## 3. Interaction Principles (The "Feel")

### Motion Philosophy

**Principle:** Motion must be subtle, fluid, and meaningful—creating a cinematic experience, not a busy one.

**Core Guidelines:**
- **Subtle, not showy:** Animations should feel natural, never distracting
- **Fluid transitions:** No jarring cuts; every state change animated
- **Meaningful motion:** Every animation serves a purpose (feedback, guidance, delight)
- **Performance-locked:** 60fps non-negotiable across all interactions
- **Accessibility:** Respect `prefers-reduced-motion` with instant or fade-only alternatives

**Motion Token System:**
All animations must use defined motion tokens from `src/lib/motion-tokens.ts`:

```typescript
MOTION.spring.gentle    // Stiffness 100, damping 20 (smooth, natural)
MOTION.spring.snappy    // Stiffness 300, damping 30 (quick, responsive)
MOTION.spring.bouncy    // Stiffness 500, damping 35 (playful, energetic)

MOTION.duration.fast    // 0.2s (quick feedback)
MOTION.duration.normal  // 0.3s (standard transitions)
MOTION.duration.slow    // 0.5s (dramatic reveals)

MOTION.ease.easeOut     // [0.16, 1, 0.3, 1] (smooth deceleration)
MOTION.ease.easeInOut   // [0.4, 0, 0.2, 1] (balanced acceleration)
```

**Anti-Pattern:** Random easing curves, inconsistent durations, overly playful/bouncy animations that feel unprofessional.

### Macro-Motion (Page & View Transitions)

**Principle:** Create seamless, cohesive navigation flow. The site should feel like one continuous experience, not disconnected pages.

**Shared Element Transitions:**
- **Grid to Detail View:** Photo morphs from grid position to full-screen using Framer Motion `layoutId`
- **Maintains spatial awareness:** User tracks photo movement, no disorientation
- **Duration:** 400ms with `easeOut` curve
- **Accompanying elements:** Metadata fades in (200ms delay), background blurs (300ms)

**Page Transitions:**
- **Route changes:** Subtle fade (opacity 0 → 1, 300ms)
- **NO slide/swipe animations:** Fade only for professional aesthetic
- **Loading states:** Skeleton screens or blurhash placeholders (never spinners)

**Story Viewer Entry:**
- **Cinematic reveal:** Full-screen modal slides up from bottom (500ms `easeOut`)
- **Background treatment:** Gallery view blurs and darkens (300ms)
- **First photo:** Scales from 0.9 to 1.0 with fade-in (400ms)

**Anti-Pattern:** Jarring cuts between pages. Overly elaborate slide/swipe transitions. Spinner-based loading states.

### Micro-Interactions (Hover, Focus, Active States)

**Principle:** Physics-based, context-aware interactions that respond to data.

**Photo Card Interactions:**
- **Hover state:**
  - 3D tilt based on cursor position relative to card center (max 5° rotation)
  - Lift effect: `translateZ(20px)` + shadow expansion
  - Cursor repulsion field: Adjacent cards push away (150px radius, spring physics)
  - Emotion-based glow intensity: Portfolio-worthy photos shimmer more
- **Duration:** Spring physics (`snappy` preset)
- **Accessibility:** No tilt on keyboard focus (use scale 1.02 + outline instead)

**Filter Orb Interactions:**
- **Magnetic attraction:** 100px radius pulls cursor toward orb center
- **Haptic-like feedback:** Spring resistance increases near center
- **Active state:** Scale 0.95 + brightness 1.2 (tactile press feeling)
- **Animation:** Framer Motion spring (`stiffness: 300, damping: 30`)

**Contextual Cursor:**
- **Default state:** Small circle (12px diameter, white border)
- **Photo hover:** Morphs size/color based on emotion metadata
  - Triumph → Gold glow (24px, `#FFD700`)
  - Intensity → Red-orange glow (24px, `#FF4500`)
  - Serenity → Soft teal glow (20px, `#40E0D0`)
- **Transition:** GSAP morph with 200ms easing
- **Data display:** Quality score, play type icon appear near cursor
- **Touch devices:** Hidden (not applicable)

**Momentum Scroll with Smart Snap:**
- **Physics:** Framer Motion `useScroll` + `useSpring` for inertia
- **Velocity detection:** High-velocity scrolling triggers snap behavior
- **Quality threshold:** Automatically centers portfolio-worthy photos (quality >= 8)
- **Friction:** Progressive dampening as velocity decreases
- **Visual indicators:** Snap targets highlighted with subtle pulse (opacity 0.5 → 1.0)

**Anti-Pattern:** Emotion-driven animations that treat all photos identically. Generic hover states. Missing the opportunity to make AI data interactive.

### Data as Interaction

**Principle:** AI-enriched metadata is a primary driver of the UI, creating interactive experiences impossible with manual tagging.

**Magnetic Filter Orbs:**
- Filter buttons are not static—they attract cursor with spring physics
- Real-time photo count updates as combinations change
- Orb brightness correlates to photo count (more photos = brighter glow)

**Quality Stratification:**
- Grid automatically prioritizes portfolio-worthy photos
- Low-quality photos dimmed and blurred, creating visual hierarchy
- User can toggle "Show All Quality" to see full collection

**Emotion Timeline Scrubber:**
- Drag to scrub through emotional arc of story/collection
- Snap to emotion transition boundaries
- Emotional curve graph color-codes segments by emotion
- Playback auto-advances with configurable timing

**Thematic Collections:**
- AI-generated galleries based on narrative detection algorithms
- Preview thumbnails show emotion distribution as color bar chart
- One-click access from Gallery Lobby

**Anti-Pattern:** Presenting AI metadata as passive text labels. Not leveraging semantic data for interaction design.

---

## 4. Component Design Standards

### Button Component

**Visual Treatment:**
- **Primary:** Gold background `#d4af37`, white text, subtle shadow
- **Secondary:** Charcoal outline, white text, transparent background
- **Ghost:** Text only, no border, underline on hover
- **Disabled:** 50% opacity, no pointer events

**Interaction:**
- **Hover:** Brightness 1.1, scale 1.02 (spring `snappy`)
- **Active:** Scale 0.98, brightness 0.9
- **Focus:** 2px gold outline, 4px offset

**Anti-Pattern:** Rounded pill buttons (too playful), gradient backgrounds (too dated), emoji icons.

### Card Component

**Visual Treatment:**
- **Background:** Warm gray `#2a2a2a`
- **Border radius:** 8px (subtle, modern)
- **Shadow:** `0 4px 12px rgba(0,0,0,0.15)` (elevated, not flat)
- **Padding:** 24px (breathing room)

**Interaction:**
- **Hover:** Shadow expands to `0 8px 24px rgba(0,0,0,0.25)`, lift `translateY(-4px)`
- **Transition:** Spring physics (`gentle` preset)

**Anti-Pattern:** Flat cards with no shadow/elevation, excessive border radius (>12px), colored backgrounds.

### Input Component

**Visual Treatment:**
- **Background:** Charcoal `#1a1a1a`
- **Border:** 1px solid `#404040`
- **Text:** White `#ffffff`
- **Placeholder:** Secondary gray `#a0a0a0`
- **Height:** 48px (comfortable touch target)

**Interaction:**
- **Focus:** Gold border `#d4af37`, 2px width, glow effect
- **Error:** Red border `#FF4500`, error message below
- **Success:** Green border `#4CAF50`, checkmark icon

**Anti-Pattern:** Underline-only inputs (too minimal), colored backgrounds, low-contrast placeholder text.

### Photo Grid Component

**Layout:**
- **Columns:** Adaptive 1-6 based on viewport (Tailwind responsive grid)
- **Gap:** 16px (consistent spacing)
- **Aspect ratio:** 3:2 for sports photography (16:9 alternative for video)
- **Virtual scrolling:** @tanstack/react-virtual (required for 10K+ photos)

**Visual Treatment:**
- **Quality stratification:** Portfolio-worthy photos appear first
- **Emotion halos:** Subtle colored glow per emotion
- **Quality gradient:** Dimming/blur for low-quality photos
- **Hover state:** 3D tilt, lift, glow intensity increase

**Anti-Pattern:** Equal visual weight for all photos, no virtual scrolling, missing quality indicators.

---

## 5. Anti-Patterns (Explicit Guardrails)

### What to Avoid

**Layout & Hierarchy:**
- ❌ Flat, generic card layouts with equal visual weight
- ❌ Overcrowded interfaces with <40% whitespace
- ❌ Buried focal points (hero images hidden below fold)
- ❌ Inconsistent grid systems (mixing 3-column and 4-column arbitrarily)

**Typography:**
- ❌ Multiple typefaces (stick to Inter Variable only)
- ❌ System fonts (Arial, Helvetica, sans-serif)
- ❌ Inconsistent sizing (random px values not from type scale)
- ❌ Low contrast (failing WCAG AA)

**Color:**
- ❌ Ignoring EMOTION_PALETTE (missing AI data integration opportunity)
- ❌ Hard-coded hex values (use CSS custom properties/tokens)
- ❌ Generic blue/gray palettes with no emotional resonance
- ❌ Accessibility violations (insufficient contrast)

**Iconography:**
- ❌ Emoji usage (⚡ 🛡️ 🤿 ❌)
- ❌ Mixing icon libraries (Lucide + Heroicons + Font Awesome)
- ❌ Decorative icons without semantic purpose
- ❌ Inconsistent sizing/stroke width

**Motion:**
- ❌ Jarring page cuts (no transitions)
- ❌ Overly playful/bouncy animations (unprofessional)
- ❌ Random easing curves (not from motion tokens)
- ❌ Ignoring `prefers-reduced-motion`
- ❌ Animations below 60fps

**Interaction:**
- ❌ Generic hover states (all photos treated identically)
- ❌ Static filters (missing magnetic attraction)
- ❌ Missing contextual cursor
- ❌ No smart scroll snap to quality photos

**Data Presentation:**
- ❌ Listing metadata as text labels only
- ❌ Not visualizing AI data (emotion halos, quality glow, composition overlays)
- ❌ Missing emotional curve graphs in story viewer
- ❌ Failing to leverage semantic intelligence for interaction

**Component Design:**
- ❌ Over-implementing metaphors (complex HUD, photography simulator UI)
- ❌ Pill buttons with excessive border radius
- ❌ Gradient backgrounds (dated aesthetic)
- ❌ Underline-only inputs (too minimal)
- ❌ Low-contrast form states

---

## 6. Quality Gates & Verification

### Design Review Checklist

Before marking any UI implementation as complete, verify:

**Visual Hierarchy:**
- [ ] Clear focal point (hero image, featured story, quality photos prioritized)
- [ ] 60%+ whitespace ratio (breathing room, not cramped)
- [ ] No flat, generic layouts (stratified by quality/emotion)

**Typography:**
- [ ] All text uses Typography component (no raw `<p>` or `<span>`)
- [ ] Inter Variable font loaded and applied
- [ ] Sizes from defined type scale (no arbitrary px values)
- [ ] WCAG AAA contrast (7:1 minimum)

**Color:**
- [ ] All colors from design tokens (CSS custom properties)
- [ ] EMOTION_PALETTE integrated (halos, ambience, timeline)
- [ ] Adaptive theming functional (UI shifts with photo emotion)
- [ ] Accessibility maintained (AA minimum, AAA preferred)

**Iconography:**
- [ ] Lucide React icons exclusively (no emojis, no mixed libraries)
- [ ] Consistent sizing (16/20/24px)
- [ ] Semantic usage only (enhances clarity, not decorative)

**Motion:**
- [ ] All animations use motion tokens (no random durations/easing)
- [ ] 60fps maintained (validate with FPS meter)
- [ ] `prefers-reduced-motion` respected (instant or fade-only fallback)
- [ ] Shared element transitions implemented (grid to detail)

**Interaction:**
- [ ] Photo cards have 3D tilt + lift on hover
- [ ] Contextual cursor morphs based on emotion metadata
- [ ] Magnetic filter orbs functional (100px attraction radius)
- [ ] Smart scroll snap prioritizes quality photos

**Data Visualization:**
- [ ] Emotion halos visible on photos
- [ ] Quality glow/dimming applied (portfolio vs. low-quality)
- [ ] Composition overlays reveal on hover
- [ ] Emotional curve graphs in story viewer

**Performance:**
- [ ] Virtual scrolling implemented (10K+ photos)
- [ ] Page load <2s (Lighthouse audit)
- [ ] Animations locked at 60fps (no jank)
- [ ] Images optimized (Next.js Image, blurhash placeholders)

### Reference Standards

When in doubt, compare to:
- **Linear:** Strong hierarchy, deliberate whitespace, clean typography
- **Apple product pages:** Hero focus, breathing room, subtle motion
- **Stripe marketing:** Data visualization, premium aesthetic, performance

**The goal is not to copy, but to match the quality bar.**

---

## 7. Implementation Workflow

### Starting a New Feature

1. **Review Design Brief:** Read relevant sections (aesthetic, interaction, anti-patterns)
2. **Check Motion Tokens:** Reference `src/lib/motion-tokens.ts` for animation values
3. **Use Design Tokens:** Import CSS custom properties for colors, spacing, typography
4. **Follow Component Patterns:** Use existing Button, Typography, Card components
5. **Verify Against Checklist:** Use Quality Gates before marking complete

### Common Mistakes & Corrections

**Mistake:** "I'll use emojis for play type icons (⚡ 🛡️)"
**Correction:** Use Lucide React icons: `<Zap />`, `<Shield />`

**Mistake:** "I'll create a flat three-column grid with no visual hierarchy"
**Correction:** Implement quality stratification (portfolio-worthy first), add emotion halos, apply quality gradient

**Mistake:** "I'll hard-code `#FFD700` for the gold accent"
**Correction:** Use CSS custom property: `var(--color-accent-gold)` or motion token: `EMOTION_PALETTE.triumph.primary`

**Mistake:** "I'll use a slide transition between pages"
**Correction:** Use subtle fade (300ms `easeOut`) for professional aesthetic

**Mistake:** "All photos will have the same hover effect"
**Correction:** Differentiate by emotion and quality (portfolio-worthy shimmer more, emotion drives glow color)

**Mistake:** "I'll present metadata as text labels below the photo"
**Correction:** Visualize as emotion halos, quality glow, composition overlays; use contextual cursor for on-demand display

---

## 8. Design System Reference

### File Locations

- **Motion Tokens:** `src/lib/motion-tokens.ts`
- **Color Palette:** `src/styles/globals.css` (CSS custom properties)
- **Typography Scale:** `src/components/common/Typography.tsx`
- **Component Library:** `src/components/common/`
- **Design Brief:** `agent-os/product/design-brief.md` (this file)

### Key Design Tokens

**Spacing Scale:**
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
```

**Border Radius:**
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-full: 9999px;
```

**Shadows:**
```css
--shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
--shadow-md: 0 4px 12px rgba(0,0,0,0.15);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.25);
--shadow-xl: 0 16px 48px rgba(0,0,0,0.35);
```

**Z-Index Scale:**
```css
--z-base: 0;
--z-dropdown: 1000;
--z-sticky: 1020;
--z-modal: 1030;
--z-popover: 1040;
--z-tooltip: 1050;
```

---

## Conclusion

This Design Brief is the **source of truth** for all aesthetic and interaction decisions in The Living Archive. When implementation conflicts arise, this document takes precedence.

**Remember:** The goal is not just to build a functional photo gallery. The goal is to create an award-winning experience that showcases mastery of both photography and digital design.

**Every design choice should answer:**
1. Does this enhance the user's journey (Explorer, Seeker, or Curator)?
2. Does this leverage AI metadata in a meaningful way?
3. Does this meet the quality bar of Linear, Apple, or Stripe?
4. Does this maintain 60fps performance?

If the answer to any is "no," revisit the design.

---

**Design is not decoration. Design is strategy.**
