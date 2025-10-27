# Design Principles - Nino Chavez Gallery

**Version:** 1.0.0
**Last Updated:** 2025-10-26
**Status:** Active Design System

---

## Core Philosophy: Digital Gallery Aesthetic

The gallery is a **content delivery system**, not a software application. Every pixel of chrome must justify its existence. Photos are the product; UI is infrastructure.

**Target:** ≥60% content, ≤40% chrome (above the fold)

---

## 1. Content-First Hierarchy

### Principle
Content (photos) must be visible immediately upon page load. No "scroll to see photos" pattern.

### Rules
- **Above-the-fold test:** Photos must occupy ≥60% of viewport height on initial load
- **Progressive disclosure:** All non-essential UI starts collapsed
- **Interaction budget:** Users should interact with photos, not filters
- **Chrome compression:** Headers should be ≤120px on desktop, ≤100px on mobile

### Anti-Patterns
- ❌ Large hero sections without content
- ❌ Expanded filter panels by default
- ❌ Full-width metadata displays
- ❌ Large icons/logos consuming vertical space

### Success Pattern
```
[Minimal Header: 80px]
[Photos Grid: Immediate, fills viewport]
```

---

## 2. Inline Utility Pattern

### Principle
Controls should be **inline pills**, not **block containers**. UI should flow horizontally, not stack vertically.

### Rules
- **Filters:** Small collapsed pills that expand to dropdowns
- **Inline flow:** Related controls on same horizontal line
- **Dropdown positioning:** Use `absolute` positioning for expanded states
- **No full-width blocks:** Avoid `w-full` for utility controls

### Component Sizing
```typescript
// Button Hierarchy
const sizes = {
  utility: 'px-3 py-1.5 text-xs',      // Filters, tags
  action: 'px-4 py-2 text-sm',          // Primary actions
  hero: 'px-6 py-3 text-base'           // CTAs, headers
};
```

### Example: Filter Pattern
```svelte
<!-- ❌ Bad: Full-width container -->
<div class="w-full p-4 bg-charcoal-800">
  <h3>Sport Filter</h3>
  <!-- Pills -->
</div>

<!-- ✅ Good: Inline pill -->
<div class="inline-block relative">
  <button class="px-3 py-1.5 text-xs">Sport ▼</button>
  {#if expanded}
    <div class="absolute top-full left-0"><!-- Dropdown --></div>
  {/if}
</div>
```

---

## 3. Gestalt Principles (Proximity & Grouping)

### Principle
Related items should be **visually proximate**. Controls should live near what they control.

### Rules
- **Sort controls:** Live above the grid, not in the header
- **Pagination:** Lives below the grid, not in the header
- **Filters:** Group in header (they affect global state)
- **Search:** Lives in header (global filter)

### Layout Zones
```
┌─ Header Zone ────────────────────────┐
│ Title + Count + Search               │
│ [Sport ▼] [Category ▼]               │
└──────────────────────────────────────┘
┌─ Grid Control Zone ──────────────────┐
│ "1-24 of 1,234" ······ [Sort ▼]     │
└──────────────────────────────────────┘
┌─ Content Zone ───────────────────────┐
│ [Photo] [Photo] [Photo]              │
│ [Photo] [Photo] [Photo]              │
└──────────────────────────────────────┘
```

### Anti-Pattern
```
❌ Sort dropdown in header (far from grid)
❌ Filter controls below grid (affects above content)
❌ Pagination in sidebar (affects main content)
```

---

## 4. Typography as Data Visualization

### Principle
Text size should reflect **information hierarchy**, not **importance**. Data is small, content is large.

### Scale
```typescript
const typographyScale = {
  // Metadata (de-emphasized)
  metadata: 'text-xs text-charcoal-400',     // "1,234 photos"
  utility: 'text-xs',                         // Button labels

  // Navigation (functional)
  nav: 'text-sm',                             // Nav links
  label: 'text-sm font-medium',               // Form labels

  // Content (emphasized)
  body: 'text-base',                          // Photo captions
  heading: 'text-xl lg:text-2xl',             // Page titles
  display: 'text-2xl lg:text-4xl'             // Hero text
};
```

### Rules
- **Counts/numbers:** Always `text-xs` and muted color
- **Titles:** Keep compact (`text-xl` max on utility pages)
- **No verbosity:** "Gallery" not "Explore Gallery", "1,234" not "Showing 1,234 photos"

### Example
```svelte
<!-- ❌ Bad: Large verbose metadata -->
<h1 class="text-4xl">Explore Gallery</h1>
<p class="text-lg">1,234 photos from events and sessions</p>

<!-- ✅ Good: Compact data -->
<h1 class="text-xl">Gallery <span class="text-xs text-charcoal-400">1,234</span></h1>
```

---

## 5. Progressive Disclosure Strategy

### Principle
Show only what users need **right now**. Reveal complexity on demand.

### Disclosure Hierarchy
```
Always Visible (Tier 0):
- Content (photos)
- Primary navigation

Collapsed by Default (Tier 1):
- Filters
- Secondary controls
- Metadata panels

Hidden Until Requested (Tier 2):
- Advanced filters
- Bulk actions
- Settings
```

### Rules
- **Default state:** Collapsed
- **Expand trigger:** User click/tap
- **Visual hint:** Chevron icon (▼/▲)
- **Animation:** Smooth slide transition
- **Mobile:** Everything collapsed on mobile

### Filter Disclosure Pattern
```svelte
let isExpanded = $state(false); // Default: collapsed

<button onclick={() => isExpanded = !isExpanded}>
  Filter {isExpanded ? '▲' : '▼'}
</button>

{#if isExpanded}
  <div transition:slide><!-- Options --></div>
{/if}
```

---

## 6. Visual Data Layers

### Principle
Visual treatments should **encode information** AND be **actionable**, not just decoration.

### Rules
- **Must satisfy BOTH:**
  1. Encodes data (quality, emotion, category)
  2. Provides context (filter UI, legend, action)
- **Minimal by default:** Hidden until hover/interaction
- **Functional:** Triggers user action (filter, navigate)
- **No competing effects:** Subtle, photos remain hero

### Data → Visual Mapping (Correct Pattern)

```typescript
// ❌ WRONG: Always-visible decorative effects
if (portfolioWorthy) {
  class = "quality-shimmer"; // Infinite animation, always visible
}

// ✅ CORRECT: Hover-revealed functional indicators
<PhotoCard class="group">
  <!-- Clean by default -->

  <!-- Hover: Show badge + action -->
  <div class="opacity-0 group-hover:opacity-100">
    {#if portfolioWorthy}
      <Badge variant="portfolio">Portfolio</Badge>
    {/if}

    {#if emotion}
      <Button
        onclick={() => filterByEmotion(emotion)}
        style="color: {emotionColor}"
      >
        <Sparkles /> Find Similar
      </Button>
    {/if}
  </div>
</PhotoCard>

// ✅ CORRECT: Filter UI provides context
<EmotionFilter options={emotions} />  <!-- Creates mental model -->
```

### Emotion Colors (with Context)
```typescript
const emotionColors = {
  triumph: '#FFD700',      // Gold
  intensity: '#FF4500',    // Red-orange
  focus: '#4169E1',        // Blue
  determination: '#8B008B', // Purple
  excitement: '#FF69B4',   // Pink
  serenity: '#20B2AA'      // Teal
};

// Must be paired with EmotionFilter UI and "Find Similar" actions
```

---

## 7. Chrome Budget System

### Principle
UI chrome has a **strict budget**. Every component must justify its vertical space.

### Budget Allocation (Desktop)
```
Header Chrome Budget: 120px max
├─ Title row: 40px (title + count)
├─ Search row: 36px (search bar)
└─ Filter row: 32px (collapsed pills)

Grid Controls: 32px
├─ Metadata: 16px (count text)
└─ Sort: 24px (dropdown)

Total Chrome: ~152px
Viewport: 1080px
Chrome Ratio: 14% ✅
```

### Measurement
```typescript
// Audit calculation
const chromeHeight = headerHeight + controlsHeight;
const viewportHeight = window.innerHeight;
const chromeRatio = chromeHeight / viewportHeight;

// Pass/Fail
const isValid = chromeRatio <= 0.40; // ≤40% chrome
```

### Mobile Budget
```
Header Chrome Budget: 100px max
Grid Controls: 24px
Total Chrome: ~124px
Viewport: 844px (iPhone 14)
Chrome Ratio: 15% ✅
```

---

## 8. Minimal Defaults Principle

### Principle
Everything starts in its **smallest, simplest state**. Complexity is opt-in.

### Default States
```typescript
const defaults = {
  filters: 'collapsed',
  search: 'empty',
  sort: 'quality',           // Best-first
  pagination: 'page-1',
  lightbox: 'closed',
  tooltips: 'hidden',
  panels: 'collapsed'
};
```

### Rules
- **Collapsed:** All expandable UI
- **Hidden:** All optional UI
- **Empty:** All input fields
- **Minimal text:** No verbose descriptions by default

---

## 9. Interaction Patterns

### Hover States
```css
/* Subtle scale + lift */
.interactive {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.interactive:hover {
  scale: 1.02;
  translate: 0 -4px;
}
```

### Click Feedback
```svelte
<Motion whileTap={{ scale: 0.97 }}>
  <button>Click me</button>
</Motion>
```

### Loading States
```svelte
{#if loading}
  <!-- Skeleton grid -->
{:else}
  <!-- Actual content -->
{/if}
```

---

## 10. Responsive Strategy

### Breakpoint Philosophy
```
Mobile-first, content-first, minimal-first
```

### Breakpoints
```typescript
const breakpoints = {
  sm: '640px',   // Large phone
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px'   // Large desktop
};
```

### Mobile Rules
- **Everything collapsed:** Filters, controls, panels
- **Vertical stacking:** No horizontal scrolling
- **Touch targets:** Minimum 48px tap targets
- **Reduced chrome:** Even tighter budget

### Desktop Rules
- **Inline utilities:** Pills, not blocks
- **Horizontal flow:** Use available width
- **Compact chrome:** Still minimal
- **More columns:** Denser grid

---

## Anti-Patterns to Avoid

### 1. Spatial Waste
```svelte
<!-- ❌ Bad -->
<div class="p-8 mb-6">
  <h2 class="text-3xl mb-4">Filters</h2>
  <div class="grid grid-cols-1 gap-6">
    <!-- Large spacing everywhere -->
  </div>
</div>

<!-- ✅ Good -->
<div class="inline-flex gap-2">
  <button class="px-3 py-1.5 text-xs">Sport ▼</button>
  <button class="px-3 py-1.5 text-xs">Category ▼</button>
</div>
```

### 2. Content Burial
```svelte
<!-- ❌ Bad: Photos below fold -->
<header class="h-[400px]"><!-- Large hero --></header>
<section class="py-12"><!-- More chrome --></section>
<div><!-- Finally, photos at 600px+ --></div>

<!-- ✅ Good: Photos immediately -->
<header class="h-[80px]"><!-- Minimal --></header>
<div><!-- Photos at 80px --></div>
```

### 3. Gestalt Violations
```svelte
<!-- ❌ Bad: Sort in header, far from grid -->
<header>
  <select>Sort</select>
</header>
<div class="mt-12"><!-- Grid here --></div>

<!-- ✅ Good: Sort near grid -->
<header><!-- No sort --></header>
<div>
  <div class="flex justify-between mb-4">
    <span>1-24 of 1,234</span>
    <select>Sort</select>
  </div>
  <!-- Grid here -->
</div>
```

---

## Audit Checklist

Use this checklist to audit any page:

### Content-First (P0)
- [ ] Photos/content visible above fold (≥60% viewport)
- [ ] Chrome ≤40% of viewport height
- [ ] No large headers pushing content down
- [ ] Progressive disclosure implemented

### Spatial Efficiency (P0)
- [ ] Inline utilities (not full-width blocks)
- [ ] Compact typography for metadata
- [ ] Minimal padding/margins
- [ ] No wasted vertical space

### Gestalt Principles (P1)
- [ ] Controls near what they control
- [ ] Related items grouped
- [ ] Visual hierarchy clear
- [ ] Logical information flow

### Visual Data (P1)
- [ ] Quality stratification visible
- [ ] Emotion halos working
- [ ] Visual treatments encode data
- [ ] No arbitrary decoration

### Responsive (P2)
- [ ] Mobile-first design
- [ ] Collapsed by default on mobile
- [ ] Touch targets ≥48px
- [ ] No horizontal scroll

---

## Component Specifications

### Filter Pill (Inline)
```svelte
<div class="relative inline-block">
  <button class="px-3 py-1.5 text-xs rounded-full
                 bg-charcoal-800/50 border border-charcoal-700
                 hover:border-gold-500/30 transition-all
                 flex items-center gap-1.5">
    <Icon class="w-3 h-3" />
    <span>Label</span>
    <ChevronDown class="w-3 h-3" />
  </button>

  {#if expanded}
    <div class="absolute top-full left-0 mt-2 p-3
                bg-charcoal-900 border border-charcoal-800
                rounded-lg shadow-xl z-30 min-w-[240px]">
      <!-- Dropdown content -->
    </div>
  {/if}
</div>
```

### Sort Dropdown (Compact)
```svelte
<select class="px-3 py-1.5 text-xs rounded-md
               bg-charcoal-900 border border-charcoal-800
               focus:border-gold-500 focus:ring-1
               focus:ring-gold-500/50 transition-colors">
  <option value="quality">Portfolio First</option>
  <option value="newest">Newest</option>
</select>
```

### Metadata Display (Minimal)
```svelte
<Typography variant="caption" class="text-charcoal-400 text-xs">
  {start}–{end} of {total}
</Typography>
```

---

## Success Metrics

### Chrome-to-Content Ratio
```
Target: ≤40% chrome
Measurement: Total chrome height / viewport height
```

### Time to Content
```
Target: 0 interactions to see photos
Measurement: Photos visible on initial load
```

### Interaction Budget
```
Target: ≤2 clicks to filter
Measurement: Clicks required to apply filter
```

### Visual Hierarchy Score
```
- P0 violations (content burial): 0 points
- P1 violations (spatial waste): -1 point each
- P2 violations (gestalt): -2 points each
Target: 0 violations
```

---

## Version History

### v1.0.0 (2025-10-26)
- Initial design principles extracted from explore page refactor
- Defined content-first hierarchy
- Established inline utility pattern
- Created chrome budget system
- Documented anti-patterns

---

**Next Steps:**
1. Apply these principles to remaining pages (albums, collections, home)
2. Create component library implementing these patterns
3. Build automated audit tools to measure compliance
4. Establish design review process using this guide
