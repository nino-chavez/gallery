# Component Pattern Library

**Version:** 1.0.0
**Last Updated:** 2025-10-26
**Framework:** SvelteKit 2.x + Svelte 5

---

## Overview

This library documents **proven UI patterns** extracted from the explore page refactor. Each pattern includes implementation code, usage guidelines, and anti-patterns to avoid.

---

## Pattern Index

1. [Inline Filter Pill](#1-inline-filter-pill)
2. [Compact Search Bar](#2-compact-search-bar)
3. [Minimal Sort Dropdown](#3-minimal-sort-dropdown)
4. [Metadata Display](#4-metadata-display)
5. [Photo Card with Visual Data](#5-photo-card-with-visual-data)
6. [Page Header (Minimal)](#6-page-header-minimal)
7. [Grid Control Bar](#7-grid-control-bar)
8. [Loading Skeleton](#8-loading-skeleton)

---

## 1. Inline Filter Pill

### Purpose
Collapsed filter control that expands to dropdown, maintaining inline horizontal flow.

### Implementation

```svelte
<script lang="ts">
  import { slide } from 'svelte/transition';
  import { ChevronDown, Trophy } from 'lucide-svelte';

  interface Option {
    name: string;
    count: number;
  }

  interface Props {
    options: Option[];
    selected?: string | null;
    onSelect?: (value: string | null) => void;
    label: string;
    icon?: any;
  }

  let { options, selected = null, onSelect, label, icon }: Props = $props();

  let isExpanded = $state(false);
  let showAll = $state(false);

  const displayed = $derived(showAll ? options : options.slice(0, 5));
  const hasMore = $derived(options.length > 5);

  function handleSelect(value: string | null) {
    onSelect?.(value);
    isExpanded = false;
  }
</script>

<div class="relative inline-block">
  <!-- Collapsed pill button -->
  <button
    onclick={() => isExpanded = !isExpanded}
    class="px-3 py-1.5 text-xs rounded-full
           bg-charcoal-800/50 border border-charcoal-700
           hover:border-gold-500/30 transition-all
           flex items-center gap-1.5"
    aria-expanded={isExpanded}
  >
    {#if icon}
      <svelte:component this={icon} class="w-3 h-3" />
    {/if}
    <span>{selected || label}</span>
    <ChevronDown class="w-3 h-3 transition-transform {isExpanded ? 'rotate-180' : ''}" />
  </button>

  <!-- Dropdown overlay -->
  {#if isExpanded}
    <div
      transition:slide
      class="absolute top-full left-0 mt-2 p-3
             bg-charcoal-900 border border-charcoal-800
             rounded-lg shadow-xl z-30 min-w-[240px]"
    >
      <div class="flex flex-wrap gap-2">
        <!-- All option -->
        <button
          onclick={() => handleSelect(null)}
          class="px-3 py-1.5 text-xs rounded-full transition-all
                 {!selected
                   ? 'bg-gold-500 text-charcoal-950'
                   : 'bg-charcoal-800 text-charcoal-100 hover:bg-charcoal-700'}"
        >
          All
        </button>

        <!-- Individual options -->
        {#each displayed as option (option.name)}
          <button
            onclick={() => handleSelect(option.name)}
            class="px-3 py-1.5 text-xs rounded-full transition-all capitalize
                   {selected === option.name
                     ? 'bg-gold-500 text-charcoal-950'
                     : 'bg-charcoal-800 text-charcoal-100 hover:bg-charcoal-700'}"
          >
            {option.name}
          </button>
        {/each}

        <!-- Show more -->
        {#if hasMore}
          <button
            onclick={() => showAll = !showAll}
            class="px-3 py-1.5 text-xs rounded-full
                   border border-dashed border-charcoal-700
                   text-charcoal-400 hover:text-gold-400"
          >
            {showAll ? '−' : `+${options.length - 5}`}
          </button>
        {/if}
      </div>
    </div>
  {/if}
</div>
```

### Usage

```svelte
<InlineFilterPill
  label="Sport"
  icon={Trophy}
  options={sports}
  selected={selectedSport}
  onSelect={handleSportSelect}
/>
```

### Specifications

```typescript
const specs = {
  collapsed: {
    height: '28px',      // py-1.5 = 6px top + 6px bottom + 16px content
    padding: '6px 12px', // px-3 py-1.5
    fontSize: '12px',    // text-xs
    icon: '12px'         // w-3 h-3
  },
  dropdown: {
    minWidth: '240px',
    maxWidth: 'auto',
    padding: '12px',     // p-3
    zIndex: 30,
    position: 'absolute'
  }
};
```

### Anti-Patterns

```svelte
<!-- ❌ Bad: Full-width container -->
<div class="w-full p-4 bg-charcoal-800">
  <h3 class="text-lg mb-4">Sport Filter</h3>
  <div class="grid gap-3"><!-- Pills --></div>
</div>

<!-- ❌ Bad: Always expanded -->
<div class="flex flex-wrap gap-3">
  <!-- All pills visible, no collapse -->
</div>

<!-- ❌ Bad: Oversized -->
<button class="px-6 py-3 text-base">
  Sport ▼
</button>
```

---

## 2. Compact Search Bar

### Purpose
Minimal search input that scales based on context.

### Implementation

```svelte
<script lang="ts">
  import { Search, X } from 'lucide-svelte';

  interface Props {
    value?: string;
    placeholder?: string;
    onSearch?: (query: string) => void;
    onClear?: () => void;
  }

  let { value = $bindable(''), placeholder = 'Search...', onSearch, onClear }: Props = $props();

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
    onSearch?.(value);
  }

  function handleClear() {
    value = '';
    onClear?.();
  }
</script>

<div class="relative w-full max-w-md">
  <div class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
    <Search class="w-4 h-4 text-charcoal-400" />
  </div>

  <input
    type="text"
    bind:value
    oninput={handleInput}
    placeholder={placeholder}
    class="w-full pl-10 pr-10 py-2 text-sm
           bg-charcoal-900 border border-charcoal-800
           rounded-lg
           focus:border-gold-500 focus:ring-2 focus:ring-gold-500/50
           transition-colors
           placeholder:text-charcoal-500"
  />

  {#if value}
    <button
      onclick={handleClear}
      class="absolute right-3 top-1/2 -translate-y-1/2
             text-charcoal-400 hover:text-charcoal-200
             transition-colors"
      aria-label="Clear search"
    >
      <X class="w-4 h-4" />
    </button>
  {/if}
</div>
```

### Specifications

```typescript
const specs = {
  height: '40px',        // py-2 + border + text
  fontSize: '14px',      // text-sm
  iconSize: '16px',      // w-4 h-4
  padding: {
    left: '40px',        // pl-10 (space for icon)
    right: '40px',       // pr-10 (space for clear button)
    vertical: '8px'      // py-2
  },
  maxWidth: '448px'      // max-w-md
};
```

### Responsive Behavior

```svelte
<!-- Desktop: Constrained width -->
<div class="hidden md:block max-w-md">
  <SearchBar />
</div>

<!-- Mobile: Full width -->
<div class="md:hidden">
  <SearchBar />
</div>
```

---

## 3. Minimal Sort Dropdown

### Purpose
Compact native select for sorting options.

### Implementation

```svelte
<script lang="ts">
  interface Props {
    value: string;
    options: Array<{ value: string; label: string }>;
    onChange?: (value: string) => void;
  }

  let { value = $bindable('quality'), options, onChange }: Props = $props();

  function handleChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    value = target.value;
    onChange?.(value);
  }
</script>

<select
  bind:value
  onchange={handleChange}
  class="px-3 py-1.5 text-xs rounded-md
         bg-charcoal-900 border border-charcoal-800
         focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50
         transition-colors text-white cursor-pointer"
  aria-label="Sort photos"
>
  {#each options as option}
    <option value={option.value}>{option.label}</option>
  {/each}
</select>
```

### Usage

```svelte
<SortDropdown
  value={sortBy}
  options={[
    { value: 'quality', label: 'Portfolio First' },
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' }
  ]}
  onChange={handleSortChange}
/>
```

### Specifications

```typescript
const specs = {
  height: '28px',      // py-1.5 + border
  fontSize: '12px',    // text-xs
  padding: '6px 12px', // px-3 py-1.5
  borderRadius: '6px'  // rounded-md
};
```

---

## 4. Metadata Display

### Purpose
Minimal, muted display of counts and metadata.

### Implementation

```svelte
<script lang="ts">
  import Typography from '$lib/components/ui/Typography.svelte';

  interface Props {
    start: number;
    end: number;
    total: number;
  }

  let { start, end, total }: Props = $props();
</script>

<Typography variant="caption" class="text-charcoal-400 text-xs">
  {start.toLocaleString()}–{end.toLocaleString()} of {total.toLocaleString()}
</Typography>
```

### Specifications

```typescript
const specs = {
  fontSize: '12px',           // text-xs
  color: 'rgb(159 162 171)',  // text-charcoal-400
  fontWeight: 400,
  lineHeight: 1.5
};
```

### Usage Patterns

```svelte
<!-- With total count only -->
<span class="text-xs text-charcoal-400">{count.toLocaleString()}</span>

<!-- With range -->
<Typography variant="caption" class="text-charcoal-400 text-xs">
  {start}–{end} of {total}
</Typography>

<!-- As page title suffix -->
<h1 class="text-xl">
  Gallery
  <span class="text-xs text-charcoal-400">{total}</span>
</h1>
```

---

## 5. Photo Card with Visual Data

### Purpose
Photo display with emotion halos, quality shimmer, and quality dimming.

### Implementation

```svelte
<script lang="ts">
  import { Motion } from 'svelte-motion';
  import OptimizedImage from '$lib/components/ui/OptimizedImage.svelte';
  import { getPhotoQualityScore } from '$lib/photo-utils';
  import type { Photo } from '$types/photo';

  interface Props {
    photo: Photo;
    index?: number;
  }

  let { photo, index = 0 }: Props = $props();

  let qualityScore = $derived(getPhotoQualityScore(photo));
  let portfolioWorthy = $derived(photo.metadata.portfolio_worthy);

  // P1-2: Emotion halo class
  let emotionHaloClass = $derived(
    photo.metadata.emotion
      ? `emotion-halo-${photo.metadata.emotion.toLowerCase()}`
      : ''
  );

  // P1-2: Quality class
  let qualityClass = $derived(
    portfolioWorthy
      ? 'quality-shimmer'
      : qualityScore < 6
        ? 'quality-dimmed'
        : ''
  );

  let photoUrl = $derived(`/photo/${photo.image_key}`);
</script>

<Motion
  let:motion
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ delay: Math.min(index * 0.02, 0.3) }}
  whileHover={{ scale: 1.02, y: -4 }}
>
  <a
    use:motion
    href={photoUrl}
    data-photo-card
    class="group relative aspect-[4/3] bg-charcoal-900
           rounded-lg overflow-hidden border border-charcoal-800
           hover:border-gold-500/50 transition-all
           cursor-pointer outline-none block
           {emotionHaloClass} {qualityClass}"
    aria-label={photo.title || `Photo ${index + 1}`}
  >
    <OptimizedImage
      src={photo.image_url}
      alt={photo.title || `Photo ${index + 1}`}
      thumbnailSrc={photo.thumbnail_url}
      aspectRatio="4/3"
      class="absolute inset-0"
    />

    <!-- Title overlay on hover -->
    {#if photo.title}
      <div class="absolute inset-0 bg-gradient-to-t from-black/80
                  via-transparent to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity">
        <div class="absolute bottom-0 left-0 right-0 p-4">
          <Typography variant="caption" class="font-medium text-white line-clamp-2">
            {photo.title}
          </Typography>
        </div>
      </div>
    {/if}

    <!-- Portfolio badge -->
    {#if portfolioWorthy}
      <div class="absolute top-2 left-2 px-2 py-1 rounded-full
                  text-xs font-medium bg-gold-500/90 text-black
                  opacity-0 group-hover:opacity-100 transition-opacity">
        Portfolio
      </div>
    {/if}
  </a>
</Motion>
```

### CSS (app.css)

```css
/* Emotion halos - visible colored glows */
.emotion-halo-triumph {
  box-shadow: 0 0 20px 8px rgba(255, 215, 0, 0.8), 0 0 40px 12px rgba(255, 215, 0, 0.4);
  border-color: rgba(255, 215, 0, 0.5) !important;
}

.emotion-halo-intensity {
  box-shadow: 0 0 20px 8px rgba(255, 69, 0, 0.8), 0 0 40px 12px rgba(255, 69, 0, 0.4);
  border-color: rgba(255, 69, 0, 0.5) !important;
}

/* Quality shimmer animation */
@keyframes shimmer {
  0%, 100% {
    box-shadow: 0 0 16px 4px rgba(212, 175, 55, 0.6), 0 0 32px 8px rgba(212, 175, 55, 0.3);
    border-color: rgba(212, 175, 55, 0.4);
  }
  50% {
    box-shadow: 0 0 24px 8px rgba(212, 175, 55, 1), 0 0 48px 16px rgba(212, 175, 55, 0.6);
    border-color: rgba(212, 175, 55, 0.8);
  }
}

.quality-shimmer {
  animation: shimmer 2s ease-in-out infinite;
}

/* Quality dimming */
.quality-dimmed {
  opacity: 0.5;
  filter: blur(3px) grayscale(30%);
  transform: scale(0.98);
}
```

---

## 6. Page Header (Minimal)

### Purpose
Compact header with title, search, and filters.

### Implementation

```svelte
<script lang="ts">
  import Typography from '$lib/components/ui/Typography.svelte';
  import SearchBar from '$lib/components/ui/SearchBar.svelte';
  import InlineFilterPill from '$lib/components/filters/InlineFilterPill.svelte';

  interface Props {
    title: string;
    count: number;
    searchQuery?: string;
    onSearch?: (query: string) => void;
  }

  let { title, count, searchQuery = $bindable(''), onSearch }: Props = $props();
</script>

<div class="sticky top-0 z-20 bg-charcoal-950/95 backdrop-blur-sm border-b border-charcoal-800/50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
    <!-- Title + Count + Search -->
    <div class="flex items-center justify-between gap-4 mb-3">
      <div class="flex items-center gap-2">
        <Typography variant="h1" class="text-xl lg:text-2xl">{title}</Typography>
        <Typography variant="caption" class="text-charcoal-400 text-xs">
          {count.toLocaleString()}
        </Typography>
      </div>

      <!-- Desktop search -->
      <div class="hidden md:block flex-1 max-w-md">
        <SearchBar bind:value={searchQuery} {onSearch} />
      </div>
    </div>

    <!-- Mobile search -->
    <div class="md:hidden mb-3">
      <SearchBar bind:value={searchQuery} {onSearch} />
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-2">
      <slot name="filters" />
    </div>
  </div>
</div>
```

### Usage

```svelte
<PageHeader title="Gallery" count={1234}>
  <svelte:fragment slot="filters">
    <InlineFilterPill label="Sport" {sports} />
    <InlineFilterPill label="Category" {categories} />
  </svelte:fragment>
</PageHeader>
```

### Specifications

```typescript
const specs = {
  height: {
    desktop: '~120px',   // py-3 + title + search + filters
    mobile: '~140px'     // Additional space for stacked search
  },
  padding: {
    horizontal: '16px', // px-4
    vertical: '12px'    // py-3
  },
  sticky: true,
  backdrop: 'blur(8px)'
};
```

---

## 7. Grid Control Bar

### Purpose
Metadata + sort controls positioned above grid (proximity).

### Implementation

```svelte
<script lang="ts">
  import Typography from '$lib/components/ui/Typography.svelte';
  import SortDropdown from '$lib/components/ui/SortDropdown.svelte';

  interface Props {
    start: number;
    end: number;
    total: number;
    sortBy: string;
    sortOptions: Array<{ value: string; label: string }>;
    onSortChange?: (value: string) => void;
  }

  let { start, end, total, sortBy = $bindable('quality'), sortOptions, onSortChange }: Props = $props();
</script>

<div class="flex items-center justify-between mb-4">
  <Typography variant="caption" class="text-charcoal-400 text-xs">
    {start.toLocaleString()}–{end.toLocaleString()} of {total.toLocaleString()}
  </Typography>

  <SortDropdown
    bind:value={sortBy}
    options={sortOptions}
    onChange={onSortChange}
  />
</div>
```

### Layout

```
┌─ Grid Control Bar ────────────────┐
│ "1-24 of 1,234" ······ [Sort ▼]  │ ← 32px height
└───────────────────────────────────┘
┌─ Photo Grid ──────────────────────┐
│ [Photo] [Photo] [Photo] [Photo]   │
└───────────────────────────────────┘
```

---

## 8. Loading Skeleton

### Purpose
Loading state that maintains layout, provides feedback.

### Implementation

```svelte
<script lang="ts">
  import { Motion } from 'svelte-motion';
  import { Camera } from 'lucide-svelte';

  interface Props {
    count?: number;
  }

  let { count = 24 }: Props = $props();
</script>

<div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
  {#each Array(count) as _, index}
    <Motion
      let:motion
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
    >
      <div
        use:motion
        class="aspect-[4/3] bg-charcoal-800 rounded-lg animate-pulse"
        aria-label="Loading photo {index + 1}"
      >
        <div class="flex items-center justify-center h-full">
          <Camera class="w-12 h-12 text-charcoal-700" aria-hidden="true" />
        </div>
      </div>
    </Motion>
  {/each}
</div>
```

---

## Component Composition

### Example: Complete Page

```svelte
<script lang="ts">
  import PageHeader from '$lib/components/layout/PageHeader.svelte';
  import InlineFilterPill from '$lib/components/filters/InlineFilterPill.svelte';
  import GridControlBar from '$lib/components/layout/GridControlBar.svelte';
  import PhotoCard from '$lib/components/gallery/PhotoCard.svelte';
  import LoadingSkeleton from '$lib/components/ui/LoadingSkeleton.svelte';

  let { data } = $props();

  let searchQuery = $state('');
  let isLoading = $state(false);
</script>

<!-- Minimal header -->
<PageHeader
  title="Gallery"
  count={data.totalCount}
  bind:searchQuery
>
  <svelte:fragment slot="filters">
    <InlineFilterPill label="Sport" options={data.sports} />
    <InlineFilterPill label="Category" options={data.categories} />
  </svelte:fragment>
</PageHeader>

<!-- Main content -->
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
  <!-- Grid controls (proximity to grid) -->
  <GridControlBar
    start={data.start}
    end={data.end}
    total={data.total}
    sortBy={data.sortBy}
    sortOptions={data.sortOptions}
  />

  <!-- Photo grid -->
  {#if isLoading}
    <LoadingSkeleton />
  {:else}
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {#each data.photos as photo, index}
        <PhotoCard {photo} {index} />
      {/each}
    </div>
  {/if}
</div>
```

---

## Design Tokens

### Spacing Scale

```typescript
const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '0.75rem',  // 12px
  lg: '1rem',     // 16px
  xl: '1.5rem',   // 24px
  '2xl': '2rem'   // 32px
};
```

### Typography Scale

```typescript
const fontSize = {
  xs: '0.75rem',   // 12px - Metadata, utility labels
  sm: '0.875rem',  // 14px - Body text, inputs
  base: '1rem',    // 16px - Content
  lg: '1.125rem',  // 18px - Subheadings
  xl: '1.25rem',   // 20px - Page titles
  '2xl': '1.5rem'  // 24px - Display text
};
```

### Color Palette

```typescript
const colors = {
  // Charcoal (neutral)
  charcoal: {
    400: '#9fa2ab',  // Muted text
    700: '#525463',  // Borders (light)
    800: '#454654',  // Backgrounds
    900: '#3b3c48',  // Backgrounds (darker)
    950: '#18181b'   // Page background
  },

  // Gold (accent)
  gold: {
    400: '#facc15',  // Hover states
    500: '#eab308'   // Primary actions
  },

  // Emotion palette
  emotion: {
    triumph: '#FFD700',
    intensity: '#FF4500',
    focus: '#4169E1',
    determination: '#8B008B',
    excitement: '#FF69B4',
    serenity: '#20B2AA'
  }
};
```

---

## Version History

### v1.0.0 (2025-10-26)
- Initial pattern library
- 8 core patterns documented
- Implementation examples
- Composition guidelines

---

**Next Steps:**
1. Extract patterns into reusable Svelte components
2. Create Storybook documentation
3. Add accessibility guidelines per pattern
4. Establish pattern review process
