# Pagination UI/UX Patterns Guide

**Context:** Photography portfolio with 20K+ photos, 24 items per page
**Last Updated:** 2025-10-29

## Pattern Selection Decision Tree

```
Start
├── Casual browsing (social feed)? → Infinite Scroll
├── Goal-oriented search (e-commerce)? → Numbered Pagination
├── Content discovery (gallery)? → Hybrid Approach ⭐
└── Mobile-first experience? → Load More Button
```

**Recommendation for this project:** **Hybrid Approach** (Numbered Pagination + Load More)

## Why Hybrid for Photo Gallery?

### Context Analysis

**Dataset:** 20K photos across 8 filter dimensions
**User Intent:** Both browsing (discovery) AND searching (specific filters)
**Device Mix:** Mobile + desktop with faceted sidebar
**Current Pattern:** Numbered pagination only

### User Behavior

1. **Discovery Mode** (60% of users)
   - Browse without specific goal
   - Want seamless scrolling
   - Benefit from "Load More" progressive loading

2. **Search Mode** (40% of users)
   - Use filters to narrow results
   - Want to jump to specific pages
   - Benefit from numbered pagination

3. **Mixed Mode** (common)
   - Start with filters
   - Switch to browsing results
   - Need both patterns

### Hybrid Solution Benefits

✅ **Progressive Loading** - Users can load next page inline without navigation
✅ **Direct Access** - Jump to specific pages for deeper exploration
✅ **SEO Friendly** - Numbered pages provide clear URL structure
✅ **Mobile Optimized** - "Load More" works better on touch devices
✅ **Footer Access** - Unlike infinite scroll, footer remains accessible
✅ **Position Tracking** - URL updates preserve scroll position

## Pattern 1: Hybrid Pagination (Recommended)

### Visual Design

```
┌─────────────────────────────────────────────┐
│  [Gallery Grid - 24 photos]                 │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│              ┌──────────────────┐            │
│              │   Load More (24) │ ← Primary  │
│              └──────────────────┘            │
│                                              │
│  ← Prev  1  2  [3]  4  5  ...  833  Next →  │ ← Secondary
│                                              │
│         Showing 49-72 of 19,992 photos       │
└─────────────────────────────────────────────┘
```

### Implementation Pattern

```svelte
<script lang="ts">
  interface Props {
    currentPage: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onLoadMore?: () => void; // Optional progressive loading
    loadMoreLabel?: string;
    class?: string;
  }

  let {
    currentPage,
    totalCount,
    pageSize,
    onPageChange,
    onLoadMore,
    loadMoreLabel = 'Load More',
    class: className
  }: Props = $props();

  let totalPages = $derived(Math.ceil(totalCount / pageSize));
  let hasNext = $derived(currentPage < totalPages);
  let remainingPhotos = $derived((totalPages - currentPage) * pageSize);
  let nextBatchSize = $derived(Math.min(remainingPhotos, pageSize));

  function handleLoadMore(event: MouseEvent) {
    event.preventDefault();
    if (hasNext) {
      // Option 1: Navigate to next page (preserves URL)
      onPageChange(currentPage + 1);

      // Option 2: Progressive load (if implemented)
      onLoadMore?.();
    }
  }
</script>

{#if totalPages > 1}
<div class="space-y-6">
  <!-- Load More Button (Primary CTA) -->
  {#if hasNext}
    <div class="flex justify-center">
      <Button
        onclick={handleLoadMore}
        variant="primary"
        size="lg"
        class="min-w-[200px]"
        aria-label="Load next {nextBatchSize} photos"
      >
        {loadMoreLabel}
        <span class="ml-2 text-sm opacity-75">({nextBatchSize})</span>
      </Button>
    </div>
  {/if}

  <!-- Numbered Pagination (Secondary Navigation) -->
  <nav class="flex items-center justify-center gap-2" aria-label="Page navigation">
    <!-- Previous -->
    <!-- Page Numbers -->
    <!-- Next -->
  </nav>

  <!-- Info -->
  <div class="text-center text-sm text-charcoal-400">
    Showing {showingStart}-{showingEnd} of {totalCount.toLocaleString()} photos
  </div>
</div>
{/if}
```

### Mobile Optimization

```css
/* Desktop: Both Load More + Numbered */
@media (min-width: 1024px) {
  .pagination-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
}

/* Mobile: Load More prominent, simplified numbers */
@media (max-width: 1023px) {
  .load-more-button {
    width: 100%;
    max-width: 320px;
  }

  .pagination-numbers {
    font-size: 0.875rem; /* Smaller */
    gap: 0.25rem; /* Tighter */
  }

  .pagination-numbers .page-label {
    display: none; /* Hide "Previous"/"Next" text */
  }
}
```

### Accessibility Features

```html
<!-- ARIA labels -->
<button aria-label="Load next 24 photos">Load More</button>
<nav aria-label="Page navigation">
  <button aria-current="page" aria-label="Page 3, current page">3</button>
  <button aria-label="Go to page 4">4</button>
</nav>

<!-- Keyboard navigation -->
<button onkeydown={(e) => e.key === 'Enter' && handleLoadMore()}>

<!-- Screen reader announcements -->
<div role="status" aria-live="polite" class="sr-only">
  {#if loading}Loading more photos{/if}
  {#if loaded}Loaded 24 more photos. Now showing {showingEnd} of {totalCount}{/if}
</div>
```

## Pattern 2: Pure Numbered Pagination (Current)

### When to Use

- E-commerce product listings
- Search results with relevance ranking
- Admin tables with sorting
- When SEO is critical (each page = unique URL)

### Current Implementation Analysis

**Strengths:**
✅ Well-implemented ellipsis logic (`visiblePages` calculation)
✅ First/Last shortcuts with smart thresholds
✅ Responsive design (fewer buttons on mobile)
✅ Full keyboard navigation
✅ Proper ARIA labels
✅ Clean visual design with gold accent

**Weaknesses:**
❌ Requires click for every page (disrupts flow)
❌ Not ideal for casual browsing
❌ Mobile experience requires precision tapping
❌ No progressive loading option
❌ Footer info separate from controls

### Enhancement Opportunities

1. **Add Quick Jump Dropdown**
   ```svelte
   <select
     value={currentPage}
     onchange={(e) => onPageChange(parseInt(e.target.value))}
     aria-label="Jump to page"
   >
     {#each Array(totalPages) as _, i}
       <option value={i + 1}>Page {i + 1}</option>
     {/each}
   </select>
   ```

2. **Show Results Range in Button**
   ```svelte
   <!-- Instead of just "3", show "49-72" -->
   <button aria-label="Page 3, photos 49-72">
     3
     <span class="text-xs opacity-60">(49-72)</span>
   </button>
   ```

3. **Sticky Positioning**
   ```css
   .pagination {
     position: sticky;
     bottom: 1rem;
     background: var(--charcoal-950);
     padding: 1rem;
     border-radius: 0.75rem;
   }
   ```

## Pattern 3: Load More Button Only

### When to Use

- Mobile-first applications
- Content feeds (news, blogs)
- When infinite scroll is too aggressive
- When users need footer access

### Implementation

```svelte
<script lang="ts">
  let visibleCount = $state(24);
  let loading = $state(false);

  async function loadMore() {
    loading = true;
    visibleCount += 24;

    // Fetch additional data if needed
    await fetchPhotos({
      limit: 24,
      offset: visibleCount - 24
    });

    loading = false;
  }
</script>

<div class="flex flex-col items-center gap-4">
  {#if visibleCount < totalCount}
    <Button
      onclick={loadMore}
      disabled={loading}
      aria-label="Load 24 more photos"
    >
      {loading ? 'Loading...' : `Load More (${Math.min(24, totalCount - visibleCount)})`}
    </Button>
  {:else}
    <p class="text-charcoal-400 text-sm">
      All {totalCount} photos loaded
    </p>
  {/if}

  <p class="text-charcoal-500 text-xs">
    Showing {visibleCount} of {totalCount}
  </p>
</div>
```

### Advantages

- ✅ Excellent mobile experience
- ✅ User controls pace
- ✅ Better performance than infinite scroll
- ✅ Footer remains accessible

### Disadvantages

- ❌ No direct page access
- ❌ Back button doesn't preserve scroll
- ❌ Poor for deep navigation
- ❌ Accumulates DOM nodes

## Pattern 4: Infinite Scroll (Not Recommended)

### Why Not for Photo Gallery?

❌ **Footer Problem** - Users can never reach contact/copyright info
❌ **Position Loss** - Back button returns to top
❌ **Performance** - 20K photos would accumulate in DOM
❌ **Accessibility** - Screen readers struggle with dynamic content
❌ **User Control** - No way to "stop" loading
❌ **SEO** - Single URL for all content

### Only Use For

- Social media feeds (Twitter, Instagram)
- Endless discovery (Pinterest)
- Real-time updates (news feeds)

## Visual Design Specifications

### Color System (Gallery Theme)

```css
/* Current page - Gold accent */
.page-current {
  background: #D4AF37; /* gold-500 */
  border: 1px solid #D4AF37;
  color: #0F0F0F; /* charcoal-950 */
  font-weight: 500;
}

/* Inactive pages */
.page-inactive {
  background: #1F1F1F; /* charcoal-800 */
  border: 1px solid #2F2F2F; /* charcoal-700 */
  color: #A0A0A0; /* charcoal-300 */
}

/* Hover state */
.page-inactive:hover {
  background: #2F2F2F; /* charcoal-700 */
  color: #FFFFFF;
}

/* Disabled state */
.page-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Load More button */
.load-more-primary {
  background: linear-gradient(135deg, #D4AF37 0%, #B89530 100%);
  border: 1px solid #D4AF37;
  color: #0F0F0F;
  font-weight: 600;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(212, 175, 55, 0.1);
}

.load-more-primary:hover {
  background: linear-gradient(135deg, #E5C248 0%, #C9A641 100%);
  box-shadow: 0 6px 8px rgba(212, 175, 55, 0.2);
}
```

### Sizing & Spacing

```css
/* Button sizes */
.pagination-button {
  min-width: 40px;
  height: 40px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem; /* 14px */
}

.load-more-button {
  min-width: 200px;
  height: 48px;
  padding: 0.75rem 2rem;
  font-size: 1rem; /* 16px */
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .pagination-button {
    min-width: 36px;
    height: 36px;
    padding: 0.375rem 0.5rem;
    font-size: 0.8125rem; /* 13px */
  }

  .load-more-button {
    width: 100%;
    max-width: 320px;
  }
}

/* Spacing */
.pagination-container {
  gap: 1.5rem; /* 24px between elements */
}

.pagination-buttons {
  gap: 0.5rem; /* 8px between page buttons */
}

@media (max-width: 640px) {
  .pagination-buttons {
    gap: 0.25rem; /* 4px on mobile */
  }
}
```

### Iconography (Lucide)

```svelte
import {
  ChevronLeft,      // Previous page
  ChevronRight,     // Next page
  ChevronsLeft,     // First page
  ChevronsRight,    // Last page
  Loader2,          // Loading spinner
  ArrowDown         // Load more indicator
} from 'lucide-svelte';

<!-- Usage -->
<ChevronLeft class="w-4 h-4" aria-hidden="true" />
<Loader2 class="w-4 h-4 animate-spin" aria-hidden="true" />
```

## Performance Considerations

### Current Setup (24 items/page)

- **Total Photos:** ~20K
- **Total Pages:** ~833
- **Page Size:** 24 photos
- **Average Photo Size:** ~200KB (thumbnail)
- **Page Load:** ~4.8MB (24 × 200KB)

### Optimization Strategies

1. **Lazy Loading Images**
   ```svelte
   <img
     src={photo.ThumbnailUrl}
     loading="lazy"
     decoding="async"
     alt={photo.Title}
   />
   ```

2. **Preload Next Page**
   ```typescript
   // In load function
   if (currentPage < totalPages) {
     // Hint browser to prefetch next page
     const nextPageUrl = `/explore?page=${currentPage + 1}`;
     // SvelteKit's preloadData handles this
   }
   ```

3. **Virtual Scrolling** (for infinite scroll - if needed)
   ```typescript
   // Only render visible items + buffer
   let visibleStart = $state(0);
   let visibleEnd = $state(50);
   let bufferSize = 10;

   let visiblePhotos = $derived(
     photos.slice(
       Math.max(0, visibleStart - bufferSize),
       visibleEnd + bufferSize
     )
   );
   ```

4. **Image CDN Transforms** (Supabase)
   ```typescript
   // Request specific size
   const thumbnailUrl = `${baseUrl}/object/public/photos/${key}?width=400&quality=80`;
   ```

## Testing Checklist

### Functional Testing

- [ ] Navigate to page 1, middle page, last page
- [ ] Use Previous/Next buttons
- [ ] Use First/Last shortcuts
- [ ] Load more increases visible count
- [ ] URL updates on page change
- [ ] Back button returns to previous page
- [ ] Filters + pagination work together
- [ ] Empty state (0 results) hides pagination

### Mobile Testing

- [ ] Buttons are tap-friendly (min 44×44px)
- [ ] Load More is prominent and full-width
- [ ] Page numbers don't overflow
- [ ] Ellipsis appears correctly
- [ ] Horizontal scroll not needed
- [ ] Touch gestures work (swipe between pages)

### Accessibility Testing

- [ ] Keyboard navigation (Tab, Enter, Space)
- [ ] Screen reader announces current page
- [ ] ARIA labels are descriptive
- [ ] Focus indicators are visible
- [ ] Loading states announced
- [ ] Disabled states prevent interaction

### Performance Testing

- [ ] Page transitions are smooth (<200ms)
- [ ] Images load progressively
- [ ] No layout shift during load
- [ ] Preloading works for next page
- [ ] Memory usage stable (no leaks)
- [ ] Works on 3G connection

## Common Mistakes to Avoid

### 1. Infinite Scroll Without Escape

**❌ Bad:**
```svelte
<!-- Footer never accessible -->
<div class="photos" onscroll={handleScroll}>
  {#each photos as photo}
    <PhotoCard {photo} />
  {/each}
</div>
<footer>Contact info</footer> <!-- Never reached -->
```

**✅ Good:**
```svelte
<!-- Pagination allows footer access -->
<div class="photos">
  {#each photos as photo}
    <PhotoCard {photo} />
  {/each}
</div>
<Pagination {...props} />
<footer>Contact info</footer> <!-- Accessible -->
```

### 2. Page Numbers Without Context

**❌ Bad:**
```svelte
<!-- Just numbers, no context -->
<button>3</button>
```

**✅ Good:**
```svelte
<!-- Descriptive labels -->
<button aria-label="Go to page 3, photos 49-72">
  3
</button>
```

### 3. Mobile Precision Tapping

**❌ Bad:**
```css
.pagination-button {
  min-width: 24px; /* Too small */
  padding: 4px; /* Hard to tap */
}
```

**✅ Good:**
```css
.pagination-button {
  min-width: 44px; /* Touch-friendly */
  padding: 12px; /* Comfortable target */
}
```

### 4. No Loading Feedback

**❌ Bad:**
```svelte
<button onclick={loadMore}>Load More</button>
<!-- No indication of loading state -->
```

**✅ Good:**
```svelte
<button onclick={loadMore} disabled={loading}>
  {#if loading}
    <Loader2 class="w-4 h-4 animate-spin" />
    Loading...
  {:else}
    Load More
  {/if}
</button>
```

### 5. Ellipsis Without Logic

**❌ Bad:**
```svelte
<!-- Always shows ... even when not needed -->
1 2 3 ... 5
```

**✅ Good:**
```svelte
<!-- Smart ellipsis based on current page -->
{#if showStartEllipsis}...{/if}
{#each visiblePages as page}
  <button>{page}</button>
{/each}
{#if showEndEllipsis}...{/if}
```

## Component Reference

### Current Components

- **Pagination.svelte** - Numbered pagination (current implementation)
  - Location: `src/lib/components/ui/Pagination.svelte`
  - Pattern: Pure numbered with ellipsis
  - Usage: Explore page, album pages

### Recommended New Components

- **PaginationHybrid.svelte** - Hybrid pattern (Load More + Numbers)
  - Pattern: Recommended for explore page
  - Features: Progressive loading + direct access

- **LoadMoreButton.svelte** - Simple load more (mobile-first)
  - Pattern: Progressive loading only
  - Features: Inline loading, count indicator

## Real-World Examples

### Photo Galleries Using Hybrid

**Pinterest** - Load more + pagination combo
- Primary: Infinite scroll for discovery
- Secondary: "Jump to" for specific sections

**Flickr** - Professional photography platform
- Primary: Load more for explore
- Secondary: Page numbers for search results

**Unsplash** - Stock photo gallery
- Load more for homepage
- Numbered pagination for search

### E-commerce Using Pure Pagination

**Amazon** - Product listings
- Numbered pages with clear structure
- "Previous"/"Next" for sequential browsing

**eBay** - Auction listings
- Page numbers + item count
- SEO-optimized URLs

## Migration Guide

### From Pure Pagination to Hybrid

1. **Keep existing Pagination.svelte**
   ```bash
   # Rename for clarity
   mv Pagination.svelte PaginationNumbered.svelte
   ```

2. **Create PaginationHybrid.svelte**
   ```svelte
   <script>
     import PaginationNumbered from './PaginationNumbered.svelte';
     import LoadMoreButton from './LoadMoreButton.svelte';
   </script>

   <div class="pagination-hybrid">
     <LoadMoreButton {...props} />
     <PaginationNumbered {...props} />
   </div>
   ```

3. **Update explore page**
   ```diff
   - import Pagination from '$lib/components/ui/Pagination.svelte';
   + import PaginationHybrid from '$lib/components/ui/PaginationHybrid.svelte';

   - <Pagination {...props} />
   + <PaginationHybrid {...props} />
   ```

4. **Test thoroughly**
   - All page navigation works
   - URL updates correctly
   - Load more increments page
   - Filters preserve pagination state

## Related Documentation

- [Filter UI Patterns](./filter-ui-patterns.md) - Faceted sidebar integration
- [Coding Standards](../../docs/CODING_STANDARDS.md) - TypeScript and Svelte conventions
- [Component Patterns](../../docs/COMPONENT_PATTERNS.md) - Reusable patterns

---

**Version:** 1.0.0
**Status:** Recommended for implementation
**Priority:** Medium (current pagination works, hybrid improves UX)
