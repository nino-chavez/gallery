# Week 5: Browse + Search Modes - Implementation Plan

**Date:** 2025-10-27
**Status:** Planning
**Prerequisites:** ✅ Week 3-4 complete (Player tagging integrated)

---

## Overview

Week 5 focuses on enhancing discovery through:
1. **Browse Mode** (2 days) - Polish existing album/timeline navigation
2. **Search Mode** (3 days) - Add Bucket 1 filters for concrete search

---

## Current State Analysis

### Existing Features
- ✅ Sport filter (volleyball, beach volleyball, etc.)
- ✅ Category filter (action, celebration, candid)
- ✅ Client-side search autocomplete
- ✅ Pagination
- ✅ Sort options (newest, oldest, action, intensity)

### Missing Features (Schema v2.0 Bucket 1)
- ❌ Play type filter (attack, block, dig, set, serve)
- ❌ Action intensity filter (low, medium, high, peak)
- ❌ Lighting filter (natural, backlit, dramatic, soft, artificial)
- ❌ Color temperature filter (warm, cool, neutral)
- ❌ Time of day filter (golden_hour, midday, evening, night)

---

## Browse Mode (Days 1-2)

### Objective
Polish existing navigation modes without major changes.

### Album Navigation
**Route:** `/albums`
**Current State:** Functional album listing with thumbnails
**Polish Tasks:**
- [ ] Add photo count to album cards
- [ ] Show date range for each album
- [ ] Add hover preview of 3-4 photos from album
- [ ] Improve loading states

### Timeline View
**Route:** `/timeline`
**Current State:** Basic timeline exists
**Polish Tasks:**
- [ ] Group photos by month/year
- [ ] Add sticky month headers during scroll
- [ ] Show photo count for each time period
- [ ] Add smooth scroll to date

**Deliverable:** Enhanced album and timeline navigation with better visual hierarchy.

---

## Search Mode (Days 3-5)

### Objective
Add comprehensive filtering using Schema v2.0 Bucket 1 fields.

### Day 3: Play Type & Action Intensity Filters

**Component:** `src/lib/components/filters/PlayTypeFilter.svelte`

```svelte
<script lang="ts">
  interface Props {
    selected: string | null;
    onSelect: (playType: string | null) => void;
  }

  let { selected, onSelect }: Props = $props();

  const playTypes = [
    { value: 'attack', label: 'Attack', icon: '⚡' },
    { value: 'block', label: 'Block', icon: '🛡️' },
    { value: 'dig', label: 'Dig', icon: '🏐' },
    { value: 'set', label: 'Set', icon: '🎯' },
    { value: 'serve', label: 'Serve', icon: '🎾' }
  ];
</script>

<div class="filter-group">
  <h3>Play Type</h3>
  <div class="filter-pills">
    <button
      class:active={selected === null}
      onclick={() => onSelect(null)}
    >
      All
    </button>
    {#each playTypes as type}
      <button
        class:active={selected === type.value}
        onclick={() => onSelect(type.value)}
      >
        {type.icon} {type.label}
      </button>
    {/each}
  </div>
</div>
```

**Component:** `src/lib/components/filters/ActionIntensityFilter.svelte`

```svelte
<script lang="ts">
  interface Props {
    selected: string | null;
    onSelect: (intensity: string | null) => void;
  }

  let { selected, onSelect }: Props = $props();

  const intensities = [
    { value: 'low', label: 'Low', color: 'blue' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'peak', label: 'Peak', color: 'red' }
  ];
</script>

<div class="filter-group">
  <h3>Intensity</h3>
  <div class="filter-pills">
    <button
      class:active={selected === null}
      onclick={() => onSelect(null)}
    >
      All
    </button>
    {#each intensities as intensity}
      <button
        class:active={selected === intensity.value}
        class="intensity-{intensity.color}"
        onclick={() => onSelect(intensity.value)}
      >
        {intensity.label}
      </button>
    {/each}
  </div>
</div>
```

### Day 4: Aesthetic Filters

**Component:** `src/lib/components/filters/LightingFilter.svelte`

```svelte
<script lang="ts">
  interface Props {
    selected: string[] | null;
    onSelect: (lighting: string[] | null) => void;
  }

  let { selected, onSelect }: Props = $props();

  const lightingTypes = [
    { value: 'natural', label: 'Natural', icon: '☀️' },
    { value: 'backlit', label: 'Backlit', icon: '🌅' },
    { value: 'dramatic', label: 'Dramatic', icon: '⚡' },
    { value: 'soft', label: 'Soft', icon: '☁️' },
    { value: 'artificial', label: 'Artificial', icon: '💡' }
  ];

  function toggleLighting(value: string) {
    const current = selected || [];
    if (current.includes(value)) {
      const filtered = current.filter(l => l !== value);
      onSelect(filtered.length > 0 ? filtered : null);
    } else {
      onSelect([...current, value]);
    }
  }
</script>

<div class="filter-group">
  <h3>Lighting</h3>
  <div class="filter-pills multi-select">
    {#each lightingTypes as lighting}
      <button
        class:active={selected?.includes(lighting.value)}
        onclick={() => toggleLighting(lighting.value)}
      >
        {lighting.icon} {lighting.label}
      </button>
    {/each}
  </div>
</div>
```

**Component:** `src/lib/components/filters/ColorTemperatureFilter.svelte`

```svelte
<script lang="ts">
  interface Props {
    selected: string | null;
    onSelect: (temp: string | null) => void;
  }

  let { selected, onSelect }: Props = $props();

  const temperatures = [
    { value: 'warm', label: 'Warm', gradient: 'from-orange-400 to-yellow-400' },
    { value: 'neutral', label: 'Neutral', gradient: 'from-gray-300 to-gray-400' },
    { value: 'cool', label: 'Cool', gradient: 'from-blue-400 to-cyan-400' }
  ];
</script>

<div class="filter-group">
  <h3>Color Temperature</h3>
  <div class="filter-pills">
    <button
      class:active={selected === null}
      onclick={() => onSelect(null)}
    >
      All
    </button>
    {#each temperatures as temp}
      <button
        class:active={selected === temp.value}
        class="bg-gradient-to-r {temp.gradient}"
        onclick={() => onSelect(temp.value)}
      >
        {temp.label}
      </button>
    {/each}
  </div>
</div>
```

### Day 5: Integration & URL State

**Update:** `src/routes/explore/+page.server.ts`

```typescript
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
  const { sports, categories } = await parent();

  // Parse filters from URL
  const sportFilter = url.searchParams.get('sport') || undefined;
  const categoryFilter = url.searchParams.get('category') || undefined;

  // NEW: Schema v2.0 Bucket 1 filters
  const playTypeFilter = url.searchParams.get('play_type') || undefined;
  const intensityFilter = url.searchParams.get('intensity') || undefined;
  const lightingFilter = url.searchParams.getAll('lighting') || undefined;
  const colorTempFilter = url.searchParams.get('color_temp') || undefined;
  const timeOfDayFilter = url.searchParams.get('time_of_day') || undefined;

  const page = parseInt(url.searchParams.get('page') || '1');
  const sortBy = (url.searchParams.get('sort') as SortOption) || 'newest';

  const photos = await fetchPhotos({
    sportType: sportFilter,
    photoCategory: categoryFilter,
    playType: playTypeFilter,
    actionIntensity: intensityFilter,
    lighting: lightingFilter?.length ? lightingFilter : undefined,
    colorTemperature: colorTempFilter,
    timeOfDay: timeOfDayFilter,
    limit: 24,
    offset: (page - 1) * 24,
    sortBy
  });

  const totalCount = await getPhotoCount({
    sportType: sportFilter,
    photoCategory: categoryFilter,
    playType: playTypeFilter,
    actionIntensity: intensityFilter,
    lighting: lightingFilter?.length ? lightingFilter : undefined,
    colorTemperature: colorTempFilter,
    timeOfDay: timeOfDayFilter
  });

  return {
    photos,
    totalCount,
    sports,
    categories,
    filters: {
      sport: sportFilter,
      category: categoryFilter,
      playType: playTypeFilter,
      intensity: intensityFilter,
      lighting: lightingFilter,
      colorTemp: colorTempFilter,
      timeOfDay: timeOfDayFilter
    },
    pagination: {
      currentPage: page,
      pageSize: 24,
      totalPages: Math.ceil(totalCount / 24)
    }
  };
};
```

**Update:** `src/lib/supabase/server.ts` - Add filter support to `fetchPhotos`

```typescript
interface FetchPhotosOptions {
  sportType?: string;
  photoCategory?: string;
  playType?: string;
  actionIntensity?: string;
  lighting?: string[];
  colorTemperature?: string;
  timeOfDay?: string;
  limit?: number;
  offset?: number;
  sortBy?: SortOption;
}

export async function fetchPhotos(options: FetchPhotosOptions): Promise<Photo[]> {
  let query = supabaseServer
    .from('photo_metadata')
    .select('*')
    .not('sharpness', 'is', null);

  // Existing filters
  if (options.sportType) {
    query = query.eq('sport_type', options.sportType);
  }
  if (options.photoCategory) {
    query = query.eq('photo_category', options.photoCategory);
  }

  // NEW: Bucket 1 filters
  if (options.playType) {
    query = query.eq('play_type', options.playType);
  }
  if (options.actionIntensity) {
    query = query.eq('action_intensity', options.actionIntensity);
  }
  if (options.lighting?.length) {
    query = query.in('lighting', options.lighting);
  }
  if (options.colorTemperature) {
    query = query.eq('color_temperature', options.colorTemperature);
  }
  if (options.timeOfDay) {
    query = query.eq('time_of_day', options.timeOfDay);
  }

  // Apply sorting
  switch (options.sortBy) {
    case 'newest':
      query = query.order('photo_date', { ascending: false });
      break;
    case 'oldest':
      query = query.order('photo_date', { ascending: true });
      break;
    case 'action':
      query = query.order('action_intensity', { ascending: false });
      break;
    case 'intensity':
      query = query.order('emotional_impact', { ascending: false });
      break;
  }

  // Apply pagination
  query = query.range(options.offset || 0, (options.offset || 0) + (options.limit || 24) - 1);

  const { data, error } = await query;

  if (error) {
    console.error('[fetchPhotos] Error:', error);
    return [];
  }

  return transformToPhotos(data || []);
}
```

---

## UI Layout

### Filter Panel Layout

```
┌──────────────────────────────────────┐
│  Explore Gallery                     │
├──────────────────────────────────────┤
│  [Search: ___________________] 🔍    │
├──────────────────────────────────────┤
│  Sport:     [All] [Volleyball] ...   │
│  Category:  [All] [Action] ...       │
├──────────────────────────────────────┤
│  Play Type: [All] ⚡Attack 🛡️Block   │
│  Intensity: [All] [Low] [Medium] ... │
├──────────────────────────────────────┤
│  Lighting:  ☀️Natural ⚡Dramatic ...  │
│  Color:     [Warm] [Cool] [Neutral]  │
├──────────────────────────────────────┤
│  Sort: [Newest ▼]  Page: 1 of 42     │
└──────────────────────────────────────┘
```

### Responsive Behavior

**Desktop:** All filters visible in left sidebar
**Tablet:** Collapsible filter panel
**Mobile:** Bottom sheet drawer with filters

---

## Success Criteria

### Browse Mode
- [ ] Album navigation shows photo counts and date ranges
- [ ] Timeline has sticky headers and smooth scrolling
- [ ] Loading states are polished and performant

### Search Mode
- [ ] All 5 new Bucket 1 filters implemented
- [ ] Multi-select works for lighting filter
- [ ] URL state reflects all active filters
- [ ] Filter state persists on page reload
- [ ] Filters combine with AND logic (not OR)
- [ ] Active filters show count badge
- [ ] "Clear all filters" button works
- [ ] Mobile filter drawer opens/closes smoothly

### Performance
- [ ] Initial page load < 2s
- [ ] Filter change < 500ms
- [ ] No layout shift during filter changes
- [ ] Lighthouse score > 90

---

## Testing Checklist

### Functional Testing
- [ ] Each filter works independently
- [ ] Multiple filters combine correctly
- [ ] URL params update on filter change
- [ ] Back button restores previous filter state
- [ ] Share URL preserves filter state
- [ ] Pagination resets when filters change
- [ ] Sort order persists across filter changes

### Edge Cases
- [ ] No results state shows helpful message
- [ ] Invalid URL params ignored gracefully
- [ ] All filters cleared returns to full gallery
- [ ] Multi-select lighting filter de-selects properly

### Browser Testing
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Mobile Safari
- [ ] Mobile Chrome

---

## Files to Create

```
src/lib/components/filters/
├── PlayTypeFilter.svelte          # NEW
├── ActionIntensityFilter.svelte   # NEW
├── LightingFilter.svelte          # NEW
├── ColorTemperatureFilter.svelte  # NEW
└── TimeOfDayFilter.svelte         # NEW

src/routes/explore/
├── +page.svelte                   # UPDATED (add new filters)
└── +page.server.ts                # UPDATED (parse new URL params)

src/lib/supabase/
└── server.ts                      # UPDATED (add filter support)
```

---

## Next Steps

After Week 5 completion:
- **Week 6-7:** Collections Mode (AI-curated story collections using Bucket 2)
- **Post-MVP:** Explore Mode (dynamic discovery feed)

---

**Status:** Ready to begin Week 5 implementation
**Estimated Time:** 5 days (2 days Browse + 3 days Search)
