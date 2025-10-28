# Component Patterns

**Version:** 1.0.0
**Last Updated:** 2025-10-27

Common reusable patterns for building components in this project.

## Table of Contents

- [Class-Based Stores with Runes](#class-based-stores-with-runes)
- [Server-Side Data Loading](#server-side-data-loading)
- [In-Memory Caching](#in-memory-caching)
- [Motion/Animation Patterns](#motionanimation-patterns)
- [Modal/Lightbox Pattern](#modallightbox-pattern)
- [Nested Interactive Elements](#nested-interactive-elements)
- [Filter Components](#filter-components)

---

## Class-Based Stores with Runes

Use class-based stores for complex state management with Svelte 5 runes.

**Example:** `src/lib/stores/preferences.svelte.ts`

```typescript
interface GalleryPreferences {
    sortBy: SortOption;
    viewMode: ViewMode;
}

class GalleryPreferencesStore {
    private prefs = $state<GalleryPreferences>(this.load());

    // Getters
    get sortBy(): SortOption {
        return this.prefs.sortBy;
    }

    get viewMode(): ViewMode {
        return this.prefs.viewMode;
    }

    // Setters
    setSortBy(value: SortOption): void {
        this.prefs.sortBy = value;
        this.save();
    }

    // Private helpers
    private load(): GalleryPreferences {
        if (typeof window === 'undefined') return defaultPreferences;
        const stored = localStorage.getItem('gallery-preferences');
        return stored ? JSON.parse(stored) : defaultPreferences;
    }

    private save(): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem('gallery-preferences', JSON.stringify(this.prefs));
    }
}

export const preferences = new GalleryPreferencesStore();
```

**Usage:**
```svelte
<script lang="ts">
    import { preferences } from '$lib/stores/preferences.svelte';

    let sortBy = $derived(preferences.sortBy);

    function handleSortChange(newSort: SortOption) {
        preferences.setSortBy(newSort);
    }
</script>
```

---

## Server-Side Data Loading

Always prefer server-side data fetching in `+page.server.ts`.

**Pattern:**

```typescript
// src/routes/explore/+page.server.ts
import { fetchPhotos } from '$lib/supabase/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
    // Access cached parent layout data
    const { sports, categories } = await parent();

    // Parse URL params
    const sportFilter = url.searchParams.get('sport') || undefined;
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = 24;

    // Fetch data server-side
    const photos = await fetchPhotos({
        sportType: sportFilter,
        limit,
        offset: (page - 1) * limit
    });

    const totalCount = await getPhotoCount({ sportType: sportFilter });

    return {
        photos,
        sports,        // From parent layout
        categories,    // From parent layout
        totalCount,
        currentPage: page,
        pageSize: limit
    };
};
```

**Benefits:**
- No loading states needed (SSR renders with data)
- SEO-friendly
- Faster perceived performance
- Avoids waterfall requests

---

## In-Memory Caching

Cache expensive queries in layout server load functions.

**Pattern:**

```typescript
// src/routes/+layout.server.ts
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface CachedData<T> {
    data: T;
    timestamp: number;
}

let sportsCache: CachedData<Sport[]> | null = null;
let categoriesCache: CachedData<Category[]> | null = null;

export const load: LayoutServerLoad = async () => {
    const now = Date.now();

    // Cache sports distribution
    if (!sportsCache || now - sportsCache.timestamp > CACHE_DURATION_MS) {
        const sports = await getSportDistribution();
        sportsCache = { data: sports, timestamp: now };
    }

    // Cache categories distribution
    if (!categoriesCache || now - categoriesCache.timestamp > CACHE_DURATION_MS) {
        const categories = await getCategoryDistribution();
        categoriesCache = { data: categories, timestamp: now };
    }

    return {
        sports: sportsCache.data,
        categories: categoriesCache.data
    };
};
```

---

## Motion/Animation Patterns

Use centralized motion tokens from `src/lib/motion-tokens.ts`.

**Motion Tokens:**

```typescript
// src/lib/motion-tokens.ts
export const MOTION = {
    spring: {
        gentle: { type: 'spring', stiffness: 100, damping: 20 },
        snappy: { type: 'spring', stiffness: 300, damping: 30 },
        bouncy: { type: 'spring', stiffness: 400, damping: 10 }
    },
    duration: {
        fast: 0.15,
        normal: 0.3,
        slow: 0.5
    }
};
```

**Usage:**

```svelte
<script>
    import { Motion } from 'svelte-motion';
    import { MOTION } from '$lib/motion-tokens';
</script>

<Motion
    let:motion
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={MOTION.spring.snappy}
>
    <div use:motion>
        Content
    </div>
</Motion>
```

---

## Modal/Lightbox Pattern

Standard pattern for modals with backdrop-click-to-close.

**Pattern:**

```svelte
<script lang="ts">
    interface Props {
        open?: boolean;
        onClose?: () => void;
    }

    let { open = $bindable(false), onClose }: Props = $props();

    function handleBackdropClick(event: MouseEvent) {
        // Only close if clicking backdrop itself
        if (event.target === event.currentTarget) {
            close();
        }
    }

    function close() {
        open = false;
        onClose?.();
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            close();
        }
    }

    // Lock body scroll when open
    $effect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = '';
            };
        }
    });
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if open}
    <div
        class="fixed inset-0 bg-black/95 flex items-center justify-center"
        style="z-index: 9999;"
        onclick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
    >
        <div class="relative max-w-4xl mx-auto p-4">
            <!-- Modal content - clicks here won't close modal -->
            <button onclick={close}>Close</button>
        </div>
    </div>
{/if}
```

---

## Nested Interactive Elements

Pattern for buttons/links inside clickable containers.

**See:** [EVENT_HANDLING.md](./EVENT_HANDLING.md) for complete guide.

**Quick Reference:**

```svelte
<script lang="ts">
    function handleCardClick() {
        navigateToDetail();
    }

    function handleFavoriteClick(event: MouseEvent) {
        event.stopPropagation();  // Don't trigger card click
        toggleFavorite();
    }
</script>

<div class="card" onclick={handleCardClick}>
    <img src={photo.url} alt={photo.title} />

    <!-- This button won't trigger card click -->
    <button onclick={handleFavoriteClick}>
        Favorite
    </button>
</div>
```

---

## Filter Components

Standard pattern for filter pill components.

**Pattern:**

```svelte
<script lang="ts">
    interface FilterItem {
        name: string;
        count: number;
    }

    interface Props {
        items: FilterItem[];
        selected?: string | null;
        onSelect?: (value: string | null) => void;
    }

    let { items, selected = null, onSelect }: Props = $props();

    // Progressive disclosure
    let showAll = $state(false);
    let displayed = $derived(showAll ? items : items.slice(0, 5));
    let hasMore = $derived(items.length > 5);

    // Collapsed state (for responsive)
    let isExpanded = $state(false);

    function handleSelect(value: string | null) {
        onSelect?.(value);
    }
</script>

<!-- Collapsed pill -->
<div class="relative inline-block">
    <button
        onclick={() => isExpanded = !isExpanded}
        class="px-3 py-1.5 text-xs rounded-full border"
    >
        {selected || 'All'}
    </button>

    {#if isExpanded}
        <div class="absolute top-full left-0 mt-2 bg-charcoal-900 rounded-lg">
            <!-- All option -->
            <button onclick={() => handleSelect(null)}>
                All
            </button>

            <!-- Individual items -->
            {#each displayed as item}
                <button onclick={() => handleSelect(item.name)}>
                    {item.name}
                </button>
            {/each}

            <!-- Show more/less -->
            {#if hasMore}
                <button onclick={() => showAll = !showAll}>
                    {showAll ? '−' : `+${items.length - 5}`}
                </button>
            {/if}
        </div>
    {/if}
</div>
```

---

## Component Template

Standard component structure:

```svelte
<!--
  ComponentName - Short description

  Features:
  - Feature 1
  - Feature 2

  Usage:
  <ComponentName prop1="value" {prop2} />
-->

<script lang="ts">
    // Imports
    import type { Photo } from '$types/photo';

    // Props
    interface Props {
        required: string;
        optional?: number;
    }

    let { required, optional = 0 }: Props = $props();

    // State
    let count = $state(0);

    // Derived
    let doubled = $derived(count * 2);

    // Functions
    function handleClick(event: MouseEvent) {
        event.stopPropagation();
        count++;
    }

    // Effects
    $effect(() => {
        console.log('count changed:', count);
    });
</script>

<!-- Template -->
<div class="component">
    <button onclick={handleClick}>
        Count: {count} (Doubled: {doubled})
    </button>
</div>

<!-- Styles (if needed) -->
<style>
    .component {
        /* Scoped styles */
    }
</style>
```

---

## Related Documentation

- [CODING_STANDARDS.md](./CODING_STANDARDS.md) - TypeScript and Svelte conventions
- [EVENT_HANDLING.md](./EVENT_HANDLING.md) - Event propagation patterns
- [PERFORMANCE_OPTIMIZATIONS.md](./PERFORMANCE_OPTIMIZATIONS.md) - Performance best practices

---

**Version History:**
- **1.0.0** (2025-10-27): Initial component patterns documentation
