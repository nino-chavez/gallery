# Filter UI Patterns Guide

**Version:** 1.0.0
**Last Updated:** 2025-10-29
**Purpose:** Reference guide for implementing filter UI components following UX best practices

---

## Table of Contents

1. [Overview](#overview)
2. [Pattern Selection Decision Tree](#pattern-selection-decision-tree)
3. [Pattern 1: Faceted Sidebar](#pattern-1-faceted-sidebar)
4. [Pattern 2: Improved Dropdown](#pattern-2-improved-dropdown)
5. [Pattern 3: Basic Dropdown](#pattern-3-basic-dropdown)
6. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
7. [Accessibility Requirements](#accessibility-requirements)
8. [Component Reference](#component-reference)

---

## Overview

This guide documents three filter UI patterns implemented in the Nino Chavez Gallery project. Each pattern addresses different use cases and scale requirements.

### Key UX Principles Applied

1. **Law of Proximity** - Related items are grouped with less space between them than unrelated items
2. **Law of Common Region** - Items within a defined boundary (border, background) are perceived as a group
3. **Progressive Disclosure** - Show only what's necessary, reveal more on demand
4. **Context-Aware Counts** - Show dynamic result counts based on current filters

### Pattern Comparison

| Aspect | Faceted Sidebar | Improved Dropdown | Basic Dropdown |
|--------|----------------|-------------------|----------------|
| **Best For** | Primary gallery pages, 8+ filter groups | Secondary pages, 4-6 groups | Simple pages, 2-3 groups |
| **Cognitive Load** | Low (always visible) | Medium (hierarchy helps) | High (flat list) |
| **Screen Real Estate** | Requires 256px width | Minimal (collapsed) | Minimal (collapsed) |
| **Discoverability** | Excellent | Good | Poor |
| **Mobile** | Drawer (slide-in) | Native dropdown | Native dropdown |
| **Scale** | 20+ filter options | 10-15 filter options | 5-10 filter options |

---

## Pattern Selection Decision Tree

```
Start: How many filter groups do you have?

├─ 8+ groups → Use Faceted Sidebar
│  └─ Examples: Main gallery, explore page, collections
│
├─ 4-7 groups → Use Improved Dropdown
│  └─ Examples: Album detail, search results, timeline
│
└─ 1-3 groups → Use Basic Dropdown or Pills
   └─ Examples: Year picker, simple sport filter
```

### Additional Decision Factors

**Use Faceted Sidebar if:**
- ✅ Primary user flow involves filtering
- ✅ Users typically apply 2-4 filters simultaneously
- ✅ Desktop traffic is significant (>40%)
- ✅ You have dynamic filter counts (context-aware)
- ✅ Multi-select filters are common

**Use Improved Dropdown if:**
- ✅ Space is constrained (mobile-first design)
- ✅ Filters are secondary to content browsing
- ✅ Filter changes are infrequent
- ✅ Reduced component count is a priority

**Use Basic Dropdown if:**
- ✅ Very simple filtering (1-3 options)
- ✅ Filter is rarely changed
- ✅ No dynamic counts needed

---

## Pattern 1: Faceted Sidebar

### When to Use

- **Primary application:** Main gallery, explore, collections pages
- **Filter count:** 8+ filter groups
- **Dataset size:** 1,000+ items
- **User behavior:** Users actively filter to narrow down results

### Implementation

**Component:** `FilterSidebar.svelte`

**Location:** `/src/lib/components/filters/FilterSidebar.svelte`

**Key Features:**
- Accordion sections (progressive disclosure)
- Sticky positioning with scroll
- Radio buttons for single-select filters
- Checkboxes for multi-select filters (lighting)
- Context-aware counts showing compatible results
- Disabled state for zero-result options
- Clear all functionality

### Code Example

```svelte
<script lang="ts">
  import FilterSidebar from '$lib/components/filters/FilterSidebar.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<!-- Desktop: Sidebar + Content Layout -->
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
  <div class="flex gap-6">
    <!-- Sidebar (Desktop only) -->
    <div class="hidden lg:block">
      <FilterSidebar
        sports={data.sports}
        categories={data.categories}
        selectedSport={data.selectedSport}
        selectedCategory={data.selectedCategory}
        selectedPlayType={data.selectedPlayType}
        selectedIntensity={data.selectedIntensity}
        selectedLighting={data.selectedLighting}
        selectedColorTemp={data.selectedColorTemp}
        selectedTimeOfDay={data.selectedTimeOfDay}
        selectedComposition={data.selectedComposition}
        onSportSelect={handleSportSelect}
        onCategorySelect={handleCategorySelect}
        onPlayTypeSelect={handlePlayTypeSelect}
        onIntensitySelect={handleIntensitySelect}
        onLightingSelect={handleLightingSelect}
        onColorTempSelect={handleColorTempSelect}
        onTimeOfDaySelect={handleTimeOfDaySelect}
        onCompositionSelect={handleCompositionSelect}
        onClearAll={clearAllFilters}
        filterCounts={data.filterCounts}
      />
    </div>

    <!-- Gallery Content -->
    <div class="flex-1 min-w-0">
      <!-- Your content here -->
    </div>
  </div>
</div>
```

### Layout Specifications

**Desktop (≥1024px):**
- Sidebar width: `w-64` (256px)
- Sidebar positioning: `sticky top-20` (stays visible on scroll)
- Sidebar height: `h-[calc(100vh-5rem)]` (full viewport minus header)
- Content: `flex-1 min-w-0` (takes remaining space)
- Gap: `gap-6` (24px between sidebar and content)

**Mobile (<1024px):**
- Hide sidebar: `hidden lg:block`
- Use dropdown alternative (ConsolidatedFilter) in sticky header
- Or implement drawer pattern (slide-in from right)

### Accordion State Management

```typescript
// Start with primary filters expanded
let expandedSections = $state({
  sport: true,      // ✅ Expanded by default
  category: true,   // ✅ Expanded by default
  playType: false,  // Collapsed
  intensity: false,
  lighting: false,
  colorTemp: false,
  timeOfDay: false,
  composition: false
});

function toggleSection(section: keyof typeof expandedSections) {
  expandedSections[section] = !expandedSections[section];
}
```

### Visual Hierarchy

**Section Styling:**
- Border separator: `border-b border-charcoal-800/30 pb-3`
- Section title: Icon (16px) + Label (14px, font-medium)
- Active count badge: `px-1.5 py-0.5 rounded-full bg-gold-500/20 text-gold-400 text-xs`

**Filter Option Styling:**
- Radio/checkbox: `w-4 h-4` (16px)
- Label: `text-sm` (14px)
- Count: `text-xs text-charcoal-500` (right-aligned)
- Hover state: `hover:bg-charcoal-800/50` (subtle background)
- Active state: `text-gold-400 font-medium`
- Disabled state: `opacity-40 cursor-not-allowed`

### Context-Aware Counts

```typescript
// Merge filterCounts with base data
let sportsWithCounts = $derived(
  sports.map((sport) => {
    const contextCount = filterCounts?.sports?.find((fc) => fc.name === sport.name)?.count;
    return {
      ...sport,
      displayCount: contextCount !== undefined ? contextCount : sport.count,
    };
  })
);

// Disable options with zero results
{@const isDisabled = sport.displayCount === 0}
<label class="{isDisabled ? 'opacity-40 cursor-not-allowed' : ''}">
  <input disabled={isDisabled} />
</label>
```

---

## Pattern 2: Improved Dropdown

### When to Use

- **Secondary pages:** Album detail, timeline, search results
- **Filter count:** 4-7 filter groups
- **Mobile-first:** Space is constrained
- **Quick fix:** Improving existing dropdown without full sidebar

### Implementation

**Component:** `ConsolidatedFilterImproved.svelte`

**Location:** `/src/lib/components/filters/ConsolidatedFilterImproved.svelte`

**Key Improvements Over Basic Dropdown:**

1. **Visual Separators**
   - Horizontal rules between groups: `border-b border-charcoal-800`
   - Increased spacing: `mb-6 pb-6` (24px + 24px padding)

2. **Enhanced Typography**
   - Bold section titles: `text-charcoal-100 text-sm font-semibold mb-3`
   - Clear visual distinction from options

3. **Grouped Regions**
   - Background color for groups: `p-3 bg-charcoal-800/30 rounded-lg`
   - Creates visual "cards" within dropdown

4. **Two-Column Layout**
   - Advanced filters use CSS Grid: `grid grid-cols-2 gap-x-4 gap-y-6`
   - Reduces dropdown height, better space utilization

5. **Increased Padding**
   - Dropdown padding: `p-5` (20px) instead of `p-4` (16px)
   - Better breathing room

### Code Example

```svelte
<script lang="ts">
  import ConsolidatedFilterImproved from '$lib/components/filters/ConsolidatedFilterImproved.svelte';
</script>

<!-- Mobile: Dropdown in sticky header -->
<div class="lg:hidden">
  <ConsolidatedFilterImproved
    sports={data.sports}
    categories={data.categories}
    selectedSport={data.selectedSport}
    onSportSelect={handleSportSelect}
    filterCounts={data.filterCounts}
  />
</div>
```

### Visual Hierarchy Example

**Before (Basic Dropdown):**
```
Dropdown Content:
  Sports
  All
  Volleyball (2431)
  Basketball (543)
  Categories
  All
  Action (1843)
  Play Type
  ...
```
❌ Everything looks the same (high cognitive load)

**After (Improved Dropdown):**
```
Dropdown Content:
  ━━━━━━━━━━━━━━━━━━━━━
  Sports                     ← Bold, distinct
  ┌─────────────────────┐
  │ All                 │   ← Grouped with background
  │ Volleyball (2431)   │
  │ Basketball (543)    │
  └─────────────────────┘
  ━━━━━━━━━━━━━━━━━━━━━    ← Visual separator
  Categories                 ← Bold, distinct
  ┌─────────────────────┐
  │ All                 │
  │ Action (1843)       │
  └─────────────────────┘
```
✅ Clear visual hierarchy (reduced cognitive load)

### CSS Improvements

```svelte
<!-- Primary Filters Dropdown with Improved Hierarchy -->
<div class="p-5 bg-charcoal-900 rounded-lg min-w-[300px]">
  <!-- Sports Section -->
  <div class="mb-6 pb-6 border-b border-charcoal-800">
    <!-- Bold title (Law of Common Region) -->
    <Typography variant="label" class="text-charcoal-100 text-sm font-semibold mb-3 block">
      Sports
    </Typography>

    <!-- Grouped pills (Law of Proximity) -->
    <div class="flex flex-wrap gap-2 p-3 bg-charcoal-800/30 rounded-lg">
      <!-- Filter pills here -->
    </div>
  </div>

  <!-- Categories Section (increased spacing) -->
  <div>
    <Typography variant="label" class="text-charcoal-100 text-sm font-semibold mb-3 block">
      Categories
    </Typography>

    <div class="flex flex-wrap gap-2 p-3 bg-charcoal-800/30 rounded-lg">
      <!-- Filter pills here -->
    </div>
  </div>
</div>
```

### Advanced Filters: Two-Column Layout

```svelte
<!-- Advanced Filters with Grid -->
<div class="grid grid-cols-2 gap-x-4 gap-y-6">
  <!-- Play Type (Column 1) -->
  <div class="col-span-1">
    <Typography>Play Type</Typography>
    <!-- Options -->
  </div>

  <!-- Intensity (Column 2) -->
  <div class="col-span-1">
    <Typography>Intensity</Typography>
    <!-- Options -->
  </div>

  <!-- Lighting (Full width with separator) -->
  <div class="col-span-2 pb-6 border-b border-charcoal-800">
    <Typography>Lighting (Multi-select)</Typography>
    <!-- Options -->
  </div>

  <!-- Color Temp (Column 1) -->
  <div class="col-span-1">
    <!-- ... -->
  </div>

  <!-- Time of Day (Column 2) -->
  <div class="col-span-1">
    <!-- ... -->
  </div>

  <!-- Composition (Full width with top border) -->
  <div class="col-span-2 pt-6 border-t border-charcoal-800">
    <Typography>Composition</Typography>
    <!-- Options -->
  </div>
</div>
```

---

## Pattern 3: Basic Dropdown

### When to Use

- **Simple filtering:** 1-3 filter groups
- **Legacy code:** Already implemented, not worth refactoring
- **Tight deadlines:** Quick implementation needed

### Implementation

**Component:** `ConsolidatedFilter.svelte`

**Location:** `/src/lib/components/filters/ConsolidatedFilter.svelte`

**Limitations:**
- ❌ Flat list structure (no visual hierarchy)
- ❌ High cognitive load for 5+ groups
- ❌ Equal spacing between all items
- ❌ No grouped regions

**When NOT to use:**
- ❌ Primary gallery pages with 8+ filters
- ❌ Large datasets (>5,000 items)
- ❌ Complex multi-select scenarios

**Quick Improvements (30-minute CSS changes):**
If you must use this pattern, apply these CSS-only improvements:

```svelte
<!-- Add separators and spacing -->
<div class="mb-4 pb-4 border-b border-charcoal-800">
  <Typography class="text-charcoal-100 font-semibold mb-2">
    Sports
  </Typography>
  <!-- Pills here -->
</div>
```

---

## Common Mistakes to Avoid

### 1. Ignoring Visual Hierarchy

**❌ Bad:**
```svelte
<div class="mb-4">
  <Typography>Sports</Typography>
  <div class="flex gap-2"><!-- Pills --></div>
</div>
<div class="mb-4">
  <Typography>Categories</Typography>
  <div class="flex gap-2"><!-- Pills --></div>
</div>
```

**✅ Good:**
```svelte
<div class="mb-6 pb-6 border-b border-charcoal-800">
  <Typography class="text-charcoal-100 font-semibold mb-3">Sports</Typography>
  <div class="flex gap-2 p-3 bg-charcoal-800/30 rounded-lg">
    <!-- Pills -->
  </div>
</div>
<div class="mb-6">
  <Typography class="text-charcoal-100 font-semibold mb-3">Categories</Typography>
  <div class="flex gap-2 p-3 bg-charcoal-800/30 rounded-lg">
    <!-- Pills -->
  </div>
</div>
```

### 2. Not Disabling Zero-Result Options

**❌ Bad:**
```svelte
{#each sports as sport}
  <button onclick={() => select(sport.name)}>
    {sport.name} ({sport.count})
  </button>
{/each}
```
Problem: Users can select filters with 0 results (frustrating)

**✅ Good:**
```svelte
{#each sports as sport}
  {@const isDisabled = sport.displayCount === 0}
  <button
    onclick={() => select(sport.name)}
    disabled={isDisabled}
    class="{isDisabled ? 'opacity-40 cursor-not-allowed' : ''}"
  >
    {sport.name} ({sport.displayCount})
  </button>
{/each}
```

### 3. Forgetting Mobile Experience

**❌ Bad:**
```svelte
<!-- Desktop-only sidebar, no mobile alternative -->
<div class="w-64">
  <FilterSidebar />
</div>
```

**✅ Good:**
```svelte
<!-- Desktop: Sidebar -->
<div class="hidden lg:block">
  <FilterSidebar />
</div>

<!-- Mobile: Dropdown or drawer -->
<div class="lg:hidden">
  <ConsolidatedFilter />
</div>
```

### 4. Poor Accordion State Management

**❌ Bad:**
```svelte
// All sections collapsed by default
let expandedSections = $state({
  sport: false,
  category: false,
  playType: false,
  // ...all false
});
```
Problem: Users must click to see any filters (extra friction)

**✅ Good:**
```svelte
// Primary filters expanded, advanced collapsed
let expandedSections = $state({
  sport: true,      // Most used
  category: true,   // Most used
  playType: false,  // Less used
  intensity: false,
  // ...rest collapsed
});
```

### 5. Not Using Context-Aware Counts

**❌ Bad:**
```svelte
<!-- Static counts never change -->
<span>Volleyball (2,431)</span>
```
Problem: Shows "Basketball (543)" even when sport=volleyball is selected (confusing)

**✅ Good:**
```svelte
<!-- Dynamic counts based on filters -->
{@const contextCount = filterCounts?.sports?.find(s => s.name === 'basketball')?.count}
<span>Basketball ({contextCount || 0})</span>
```

---

## Accessibility Requirements

### Keyboard Navigation

**Required:**
- ✅ Tab through filter options
- ✅ Enter/Space to select
- ✅ Escape to close dropdowns/drawers
- ✅ Focus visible (outline or ring)

**Implementation:**
```svelte
<button
  onclick={handleClick}
  class="focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
  aria-label="Filter by volleyball"
  aria-pressed={selected}
>
  Volleyball
</button>
```

### ARIA Attributes

**Accordion Sections:**
```svelte
<button
  onclick={() => toggleSection('sport')}
  aria-expanded={expandedSections.sport}
  aria-controls="sport-section"
>
  Sport
</button>

{#if expandedSections.sport}
  <div id="sport-section">
    <!-- Filter options -->
  </div>
{/if}
```

**Dropdowns:**
```svelte
<button aria-expanded={dropdownOpen} aria-haspopup="true">
  Filters
</button>

{#if dropdownOpen}
  <div role="menu" aria-label="Filter options">
    <button role="menuitem">Option 1</button>
  </div>
{/if}
```

### Screen Reader Announcements

**Active Filters:**
```svelte
<div role="status" aria-live="polite">
  {activeFilterCount} active
  {activeFilterCount === 1 ? 'filter' : 'filters'}
</div>
```

**Result Counts:**
```svelte
<span aria-label="{sport.name}: {sport.displayCount} photos">
  {sport.name} ({sport.displayCount})
</span>
```

---

## Component Reference

### FilterSidebar.svelte

**Location:** `/src/lib/components/filters/FilterSidebar.svelte`

**Props:**
- `sports: Sport[]` - List of sports with counts
- `categories: Category[]` - List of categories with counts
- `selectedSport?: string | null` - Currently selected sport
- `selectedCategory?: string | null` - Currently selected category
- `selectedPlayType?: string | null` - Currently selected play type
- `selectedIntensity?: string | null` - Currently selected intensity
- `selectedLighting?: string[] | null` - Multi-select lighting (array)
- `selectedColorTemp?: string | null` - Currently selected color temperature
- `selectedTimeOfDay?: string | null` - Currently selected time of day
- `selectedComposition?: string | null` - Currently selected composition
- `filterCounts?: FilterCounts` - Context-aware counts
- `onSportSelect?: (sport: string | null) => void` - Sport selection handler
- `onCategorySelect?: (category: string | null) => void` - Category selection handler
- `onPlayTypeSelect?: (playType: string | null) => void` - Play type selection handler
- `onIntensitySelect?: (intensity: string | null) => void` - Intensity selection handler
- `onLightingSelect?: (lighting: string[] | null) => void` - Lighting selection handler (multi-select)
- `onColorTempSelect?: (temp: string | null) => void` - Color temp selection handler
- `onTimeOfDaySelect?: (time: string | null) => void` - Time of day selection handler
- `onCompositionSelect?: (composition: string | null) => void` - Composition selection handler
- `onClearAll?: () => void` - Clear all filters handler

**Example:**
```svelte
<FilterSidebar
  {sports}
  {categories}
  selectedSport={data.selectedSport}
  onSportSelect={handleSportSelect}
  onClearAll={clearAllFilters}
  filterCounts={data.filterCounts}
/>
```

### ConsolidatedFilterImproved.svelte

**Location:** `/src/lib/components/filters/ConsolidatedFilterImproved.svelte`

**Props:** Same as FilterSidebar (API-compatible)

**Differences:**
- Dropdown UI instead of always-visible sidebar
- Two-column layout for advanced filters
- More compact for mobile use

**Example:**
```svelte
<ConsolidatedFilterImproved
  {sports}
  {categories}
  selectedSport={data.selectedSport}
  onSportSelect={handleSportSelect}
  filterCounts={data.filterCounts}
/>
```

### ConsolidatedFilter.svelte

**Location:** `/src/lib/components/filters/ConsolidatedFilter.svelte`

**Status:** Legacy component (use improved version for new code)

**Props:** Same as FilterSidebar

**Limitations:**
- No visual hierarchy
- Flat list structure
- High cognitive load

---

## Testing Checklist

### Functional Testing

- [ ] All filters apply correctly
- [ ] Multi-select filters work (lighting)
- [ ] Clear all removes all filters
- [ ] Context-aware counts update dynamically
- [ ] Zero-result options are disabled
- [ ] URL params sync with filter state

### Responsive Testing

- [ ] Desktop: Sidebar visible and sticky
- [ ] Tablet: Sidebar or dropdown based on breakpoint
- [ ] Mobile: Dropdown or drawer pattern
- [ ] Touch targets are 44px minimum
- [ ] Scrolling works within sidebar/dropdown

### Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Focus visible on all interactive elements
- [ ] Screen reader announces filter changes
- [ ] ARIA attributes correct (expanded, pressed, controls)
- [ ] Color contrast meets WCAG AA (4.5:1)

### Performance Testing

- [ ] Filter changes trigger single server request
- [ ] No unnecessary re-renders
- [ ] Smooth transitions (<200ms)
- [ ] Works with 10,000+ photos

---

## Migration Guide

### Upgrading from Basic Dropdown to Improved Dropdown

**Step 1:** Replace import
```diff
- import ConsolidatedFilter from '$lib/components/filters/ConsolidatedFilter.svelte';
+ import ConsolidatedFilterImproved from '$lib/components/filters/ConsolidatedFilterImproved.svelte';
```

**Step 2:** Update component usage (no prop changes needed - API-compatible)
```diff
- <ConsolidatedFilter
+ <ConsolidatedFilterImproved
    {sports}
    {categories}
    selectedSport={data.selectedSport}
    onSportSelect={handleSportSelect}
    filterCounts={data.filterCounts}
  />
```

**Step 3:** Test visual hierarchy improvements

### Upgrading from Dropdown to Faceted Sidebar

**Step 1:** Add desktop sidebar + mobile dropdown
```svelte
<!-- Desktop: Sidebar -->
<div class="hidden lg:block">
  <FilterSidebar
    {sports}
    {categories}
    selectedSport={data.selectedSport}
    onSportSelect={handleSportSelect}
    onClearAll={clearAllFilters}
    filterCounts={data.filterCounts}
  />
</div>

<!-- Mobile: Keep existing dropdown -->
<div class="lg:hidden">
  <ConsolidatedFilterImproved
    {sports}
    {categories}
    selectedSport={data.selectedSport}
    onSportSelect={handleSportSelect}
    filterCounts={data.filterCounts}
  />
</div>
```

**Step 2:** Update layout for sidebar + content
```svelte
<div class="flex gap-6">
  <!-- Sidebar here -->

  <div class="flex-1 min-w-0">
    <!-- Gallery content -->
  </div>
</div>
```

**Step 3:** Test responsive behavior and accordion state

---

## Related Documentation

- [CODING_STANDARDS.md](../../docs/CODING_STANDARDS.md) - TypeScript and Svelte conventions
- [EVENT_HANDLING.md](../../docs/EVENT_HANDLING.md) - Event propagation patterns
- [supabase-integration.md](./supabase-integration.md) - Filter query patterns

---

**Questions or Issues?**

If you encounter issues implementing these patterns, check:
1. Component prop types match interface definitions
2. Event handlers use correct signatures
3. Filter counts are being passed from server load function
4. Breakpoints match Tailwind config (`lg:` = 1024px)

**Version History:**
- 1.0.0 (2025-10-29) - Initial guide creation with three patterns

---

## Advanced Filter Features

### Mobile Drawer Pattern

**Component:** `FilterSidebarDrawer.svelte`

A slide-in drawer for mobile devices that provides the same filtering capabilities as the desktop sidebar without taking up permanent screen space.

**Features:**
- Slides in from right with backdrop overlay
- Full-height with scroll
- Escape key and backdrop click to dismiss
- Reuses FilterSidebar component internally
- Touch-friendly spacing (48px minimum touch targets)

**Implementation:**
```svelte
<script>
  import FilterSidebarDrawer from '$lib/components/filters/FilterSidebarDrawer.svelte';

  let drawerOpen = $state(false);
</script>

<!-- Trigger button -->
<button onclick={() => drawerOpen = true}>
  Open Filters
</button>

<!-- Drawer -->
<FilterSidebarDrawer
  bind:open={drawerOpen}
  {sports}
  {categories}
  selectedSport={data.selectedSport}
  onSportSelect={handleSportSelect}
  onClose={() => drawerOpen = false}
  filterCounts={data.filterCounts}
/>
```

**Mobile UX Best Practices:**
- Always provide a visible "Filters" button (don't hide in hamburger menu)
- Show active filter count badge on button
- Prevent body scroll when drawer is open
- Use smooth transitions (300ms slide-in)
- Provide multiple ways to close (X button, backdrop, Escape key)

---

### Filter Presets

**Store:** `filter-presets.svelte.ts`

Pre-configured filter combinations for quick access to common use cases.

**Predefined Presets:**
1. **Action Shots** - High-intensity volleyball action (sport=volleyball, category=action, intensity=peak)
2. **Golden Hour** - Warm, natural lighting (timeOfDay=golden_hour, colorTemp=warm, lighting=[natural])
3. **High Intensity** - Peak action moments (intensity=peak, playType=attack)
4. **Dramatic Lighting** - High-contrast shots (lighting=[dramatic, backlit], intensity=high)
5. **Celebrations** - Joyful moments (category=celebration, composition=centered)
6. **Composed Shots** - Well-composed (composition=rule_of_thirds)

**Usage:**
```typescript
import { filterPresets } from '$lib/stores/filter-presets.svelte';

// Apply a preset
const filters = filterPresets.applyPreset('action-shots');
// Returns: { sport: 'volleyball', category: 'action', intensity: 'peak' }

// Create custom preset
const customPreset = filterPresets.savePreset({
  name: 'My Favorite Shots',
  description: 'High-intensity attacks at golden hour',
  filters: {
    sport: 'volleyball',
    playType: 'attack',
    intensity: 'peak',
    timeOfDay: 'golden_hour',
  },
});

// Get recent presets (tracks usage)
const recent = filterPresets.recent; // Top 5 recently used

// Create shareable URL
const url = filterPresets.createShareableURL('action-shots');
// Returns: "/explore?sport=volleyball&category=action&intensity=peak"
```

**UI Component:**
```svelte
<FilterPresetsPanel
  onApplyPreset={handleApplyPreset}
  onApplyHistory={handleApplyHistory}
/>
```

---

### Filter History

**Store:** `filter-history.svelte.ts`

Automatically tracks recently used filter combinations for quick re-access.

**Features:**
- Tracks up to 10 recent filter combinations
- Deduplicates identical filter sets
- Human-readable descriptions (e.g., "Volleyball • Action • Peak Intensity")
- Relative timestamps ("2h ago")
- Persists to localStorage

**Usage:**
```typescript
import { filterHistory } from '$lib/stores/filter-history.svelte';

// Add to history (called automatically on filter changes)
filterHistory.addToHistory({
  sport: 'volleyball',
  category: 'action',
  intensity: 'peak',
});

// Get recent history
const recent = filterHistory.recent; // Last 5 entries

// Get all history
const all = filterHistory.all; // Up to 10 entries

// Remove entry
filterHistory.remove(entryId);

// Clear all history
filterHistory.clear();

// Get relative time string
const timeStr = filterHistory.getRelativeTime(entry.timestamp);
// Returns: "2h ago", "Just now", etc.
```

**Integration Example:**
```svelte
<script>
  // Track filter changes automatically
  $effect(() => {
    filterHistory.addToHistory({
      sport: data.selectedSport,
      category: data.selectedCategory,
      // ... all filters
    });
  });

  // Apply from history
  function handleApplyHistory(entry) {
    // Apply filters from history entry
    applyFilters(entry.filters);
  }
</script>

<FilterPresetsPanel
  onApplyHistory={handleApplyHistory}
/>
```

---

### Filter Sharing

**Component:** `FilterShareButton.svelte`

Allows users to copy a URL with all active filters as query parameters.

**Features:**
- Generates shareable URL with current filters
- One-click copy to clipboard
- Visual feedback (success/error states)
- Disabled when no filters are active
- Shows active filter count in tooltip

**Usage:**
```svelte
<FilterShareButton
  sport={data.selectedSport}
  category={data.selectedCategory}
  playType={data.selectedPlayType}
  intensity={data.selectedIntensity}
  lighting={data.selectedLighting}
  colorTemp={data.selectedColorTemp}
  timeOfDay={data.selectedTimeOfDay}
  composition={data.selectedComposition}
  baseUrl="/explore"
/>
```

**Generated URL Example:**
```
https://example.com/explore?sport=volleyball&category=action&intensity=peak&lighting=dramatic&lighting=backlit
```

**States:**
- **Idle** - Default state, shows "Share" with icon
- **Success** - Shows "Copied!" with checkmark (2s)
- **Error** - Shows "Failed" with X icon (2s)
- **Disabled** - Grayed out when no filters active

---

### Filter Analytics

**Store:** `filter-analytics.svelte.ts`

Tracks filter usage statistics for insights and optimization.

**Features:**
- Individual filter usage counts (how often each filter is used)
- Filter combination patterns (which filters are used together)
- Session-based and all-time stats
- Local storage only (privacy-friendly, no external service)

**Tracked Metrics:**
- Sports, categories, play types, intensities
- Lighting, color temperatures, times of day, compositions
- Top 20 filter combinations
- Session duration and filter change count
- Total sessions

**Usage:**
```typescript
import { filterAnalytics } from '$lib/stores/filter-analytics.svelte';

// Track individual filter selection
filterAnalytics.trackFilter('sports', 'volleyball');
filterAnalytics.trackFilter('intensities', 'peak');

// Track filter combination
filterAnalytics.trackCombination({
  sport: 'volleyball',
  intensity: 'peak',
  lighting: ['dramatic', 'backlit'],
});

// Get top filters by type
const topSports = filterAnalytics.getTopFilters('sports', 5);
// Returns: [{ value: 'volleyball', count: 142 }, ...]

// Get top combinations
const topCombos = filterAnalytics.getTopCombinations(10);
// Returns: [{ filters: ['sport:volleyball', 'intensity:peak'], count: 28, description: 'Volleyball + Peak' }, ...]

// Get summary stats
const summary = filterAnalytics.summary;
// Returns: {
//   totalFilterUsage: 567,
//   totalSessions: 42,
//   avgFiltersPerSession: 13,
//   mostUsedSport: 'volleyball',
//   mostUsedCategory: 'action'
// }

// Export data (for analysis)
const jsonData = filterAnalytics.exportData();

// Reset analytics
filterAnalytics.reset();
```

**Integration Example:**
```svelte
<script>
  // Track filter changes automatically
  $effect(() => {
    if (data.selectedSport) {
      filterAnalytics.trackFilter('sports', data.selectedSport);
    }

    // Track combination
    if (activeFilterCount > 0) {
      filterAnalytics.trackCombination({
        sport: data.selectedSport,
        category: data.selectedCategory,
        // ... all active filters
      });
    }
  });
</script>
```

**Use Cases:**
- Identify most popular filters (prioritize in UI)
- Discover common filter combinations (create presets)
- Understand user behavior patterns
- Optimize filter ordering based on usage
- A/B test filter improvements

---

## Complete Feature Integration Example

Here's how all advanced features work together on the explore page:

```svelte
<script lang="ts">
  import { filterHistory } from '$lib/stores/filter-history.svelte';
  import { filterAnalytics } from '$lib/stores/filter-analytics.svelte';
  import FilterSidebar from '$lib/components/filters/FilterSidebar.svelte';
  import FilterSidebarDrawer from '$lib/components/filters/FilterSidebarDrawer.svelte';
  import FilterPresetsPanel from '$lib/components/filters/FilterPresetsPanel.svelte';
  import FilterShareButton from '$lib/components/filters/FilterShareButton.svelte';

  let { data } = $props();
  let mobileDrawerOpen = $state(false);

  // Track filter changes
  $effect(() => {
    // Track individual filters
    if (data.selectedSport) filterAnalytics.trackFilter('sports', data.selectedSport);
    
    // Track combination
    if (activeFilterCount > 0) {
      filterAnalytics.trackCombination({
        sport: data.selectedSport,
        category: data.selectedCategory,
        // ... all filters
      });
    }

    // Add to history
    filterHistory.addToHistory({
      sport: data.selectedSport,
      category: data.selectedCategory,
      // ... all filters
    });
  });

  // Apply preset
  function handleApplyPreset(filters) {
    // Navigate with preset filters
    applyFilters(filters);
    mobileDrawerOpen = false; // Close mobile drawer
  }

  // Apply history entry
  function handleApplyHistory(filters) {
    applyFilters(filters);
    mobileDrawerOpen = false;
  }
</script>

<!-- Desktop: Sidebar + Presets -->
<div class="hidden lg:block">
  <FilterPresetsPanel
    onApplyPreset={handleApplyPreset}
    onApplyHistory={handleApplyHistory}
  />
  
  <FilterSidebar
    {sports}
    {categories}
    selectedSport={data.selectedSport}
    onSportSelect={handleSportSelect}
    filterCounts={data.filterCounts}
  />
</div>

<!-- Mobile: Drawer button -->
<div class="lg:hidden">
  <button onclick={() => mobileDrawerOpen = true}>
    Filters ({activeFilterCount})
  </button>
</div>

<!-- Share button (all screens) -->
<FilterShareButton
  sport={data.selectedSport}
  category={data.selectedCategory}
  // ... all filters
/>

<!-- Mobile drawer -->
<FilterSidebarDrawer
  bind:open={mobileDrawerOpen}
  {sports}
  {categories}
  selectedSport={data.selectedSport}
  onSportSelect={handleSportSelect}
  onClose={() => mobileDrawerOpen = false}
  filterCounts={data.filterCounts}
/>
```

---

## Performance Considerations

### localStorage Usage

All advanced features use localStorage for persistence:

| Feature | Storage Key | Typical Size | Cleanup Strategy |
|---------|-------------|--------------|------------------|
| Presets (custom) | `gallery_filter_presets` | ~2-5 KB | User-managed (delete button) |
| Presets (recent) | `gallery_recent_presets` | ~500 bytes | Auto (keep last 10) |
| History | `gallery_filter_history` | ~3-8 KB | Auto (keep last 10) |
| Analytics | `gallery_filter_analytics` | ~10-20 KB | Auto (session timeout) |

**Total:** ~15-35 KB (well within 5-10 MB localStorage limit)

### Optimization Tips

1. **Debounce filter tracking** - Don't track every keystroke, wait for final selection
2. **Throttle analytics** - Update counts in batches, not on every change
3. **Lazy load** - Load stores only when needed (code splitting)
4. **Cleanup old data** - Prune analytics older than 30 days
5. **Export before reset** - Allow users to download analytics before clearing

---

## Feature Matrix

| Feature | Desktop | Mobile | localStorage | Network | Use Case |
|---------|---------|--------|--------------|---------|----------|
| **Sidebar** | ✅ Always visible | ❌ Drawer instead | ❌ | ❌ | Primary filtering |
| **Drawer** | ❌ Not needed | ✅ Slide-in | ❌ | ❌ | Mobile filtering |
| **Presets** | ✅ Panel | ✅ Panel | ✅ Custom only | ❌ | Quick access |
| **History** | ✅ Panel | ✅ Panel | ✅ | ❌ | Recent filters |
| **Share** | ✅ Button | ✅ Button | ❌ | ❌ URL only | Collaboration |
| **Analytics** | ✅ Background | ✅ Background | ✅ | ❌ | Insights |

---

## Browser Support

All features support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS 14+, Android 8+)

**Required APIs:**
- `localStorage` (all features)
- `navigator.clipboard.writeText()` (share button)
- CSS Grid/Flexbox (layouts)
- CSS `backdrop-filter` (drawer overlay)

**Fallbacks:**
- Share button: Disabled if clipboard API unavailable
- Analytics: Silent failure if localStorage quota exceeded
- Drawer: Fallback to inline filters if `position: fixed` unsupported

---

## Testing Checklist

### Feature Testing

- [ ] **Presets**
  - [ ] All predefined presets apply correctly
  - [ ] Custom presets can be created and deleted
  - [ ] Recent presets track usage
  - [ ] Preset UI shows correct descriptions

- [ ] **History**
  - [ ] Filter changes add to history
  - [ ] Identical filter sets deduplicate
  - [ ] History shows human-readable descriptions
  - [ ] Relative timestamps update correctly

- [ ] **Share Button**
  - [ ] Generates correct URL with all filters
  - [ ] Copies to clipboard successfully
  - [ ] Shows success/error feedback
  - [ ] Disabled when no filters active

- [ ] **Analytics**
  - [ ] Individual filter usage tracks correctly
  - [ ] Combinations track correctly
  - [ ] Session timeout works (30min)
  - [ ] Export data is valid JSON

- [ ] **Mobile Drawer**
  - [ ] Opens/closes smoothly
  - [ ] Backdrop click closes drawer
  - [ ] Escape key closes drawer
  - [ ] Body scroll prevented when open
  - [ ] Filters work same as desktop

### Integration Testing

- [ ] Preset application closes mobile drawer
- [ ] History application closes mobile drawer
- [ ] Filter changes tracked automatically
- [ ] localStorage persists across page reloads
- [ ] Multiple tabs sync (or isolate appropriately)

### Performance Testing

- [ ] localStorage writes don't block UI
- [ ] Analytics tracking doesn't slow filter changes
- [ ] Large history (10+ entries) renders quickly
- [ ] Drawer animation smooth on low-end devices

---

## Troubleshooting

### Common Issues

**Issue:** Share button shows "Failed"
- **Cause:** Clipboard API not available (HTTP or old browser)
- **Solution:** Use HTTPS or check browser support

**Issue:** Filter history not persisting
- **Cause:** localStorage quota exceeded or disabled
- **Solution:** Clear old data, check browser settings

**Issue:** Analytics data lost
- **Cause:** User cleared browser data
- **Solution:** Export data periodically, inform users

**Issue:** Mobile drawer doesn't open
- **Cause:** z-index conflict or JavaScript error
- **Solution:** Check console, ensure drawer z-index > header

**Issue:** Presets don't apply all filters
- **Cause:** Filter incompatibility (e.g., sport-specific play type)
- **Solution:** Validate preset filters before applying

---

**Version History:**
- 1.1.0 (2025-10-29) - Added advanced features section (drawer, presets, history, sharing, analytics)
- 1.0.0 (2025-10-29) - Initial guide with three filter patterns

---

## Design Principles

### Icon Usage

**IMPORTANT:** This project uses Lucide SVG icons exclusively. DO NOT use emoji characters.

**Rationale:**
- Consistent visual language across all UI elements
- Scalable and crisp at any size
- Accessible (proper ARIA labels)
- Theme-able (inherits text color)
- Professional appearance

**✅ Correct (Lucide Icons):**
```typescript
import { Zap, Sunrise, Flame } from 'lucide-svelte';

const PRESETS = [
  {
    name: 'Action Shots',
    iconName: 'Zap', // Icon name as string
    // Component resolved: <Zap class="w-4 h-4" />
  },
  {
    name: 'Golden Hour',
    iconName: 'Sunrise',
  },
];
```

**❌ Incorrect (Emoji):**
```typescript
// DO NOT USE EMOJI
const PRESETS = [
  {
    name: 'Action Shots',
    icon: '⚡', // ❌ Emoji - inconsistent rendering across platforms
  },
];
```

**Icon Resolution Pattern:**
```typescript
// Store: Define icon by name
export interface FilterPreset {
  iconName?: string; // Lucide icon name
}

// Component: Map to actual component
import { Zap, Sunrise, Flame } from 'lucide-svelte';

const iconMap: Record<string, any> = { Zap, Sunrise, Flame };

function getIconComponent(iconName?: string) {
  return iconMap[iconName] || DefaultIcon;
}

// Render
{@const IconComponent = getIconComponent(preset.iconName)}
<IconComponent class="w-4 h-4 text-gold-400" />
```

**Available Lucide Icons for Presets:**
- `Zap` - Action, speed, intensity
- `Sunrise` - Golden hour, time of day
- `Flame` - High intensity, peak moments
- `Lightbulb` - Lighting, dramatic shots
- `Award` - Celebrations, achievements
- `Grid3x3` - Composition, rule of thirds
- `Camera` - Photography, general
- `Image` - Photos, gallery
- `Sparkles` - Featured, special
- `Star` - Favorites, rated

**Size Conventions:**
- Small icons: `w-3 h-3` (12px) - Inline badges
- Default icons: `w-4 h-4` (16px) - Buttons, pills
- Medium icons: `w-5 h-5` (20px) - Headers, emphasis
- Large icons: `w-6 h-6` (24px) - Primary actions

**Color Conventions:**
- Gold: `text-gold-400` - Active states, highlights
- Charcoal: `text-charcoal-400` - Secondary, inactive
- White: `text-white` - High contrast, headers
- Inherit: No class - Inherits from parent

**Accessibility:**
```svelte
<!-- Always add aria-hidden for decorative icons -->
<IconComponent class="w-4 h-4" aria-hidden="true" />

<!-- For standalone icons, add aria-label to parent -->
<button aria-label="Apply action shots preset">
  <Zap class="w-4 h-4" aria-hidden="true" />
</button>
```

---

**Version History:**
- 1.2.0 (2025-10-29) - Added Design Principles section (icon usage)
- 1.1.0 (2025-10-29) - Added advanced features section
- 1.0.0 (2025-10-29) - Initial guide with three filter patterns
