# Coding Standards

**Version:** 1.0.0
**Last Updated:** 2025-10-27
**Stack:** SvelteKit 2.x + Svelte 5 + TypeScript + Tailwind CSS 4

## Table of Contents

- [TypeScript Standards](#typescript-standards)
- [Svelte 5 Component Standards](#svelte-5-component-standards)
- [File Organization](#file-organization)
- [Naming Conventions](#naming-conventions)
- [Styling Standards](#styling-standards)
- [Performance Best Practices](#performance-best-practices)
- [Accessibility Requirements](#accessibility-requirements)

---

## TypeScript Standards

### Strict Mode

All TypeScript code must compile with **strict mode** enabled.

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Type Annotations

**Always** provide explicit types for:
- Function parameters
- Function return types (when non-obvious)
- Component props
- Event handlers

```typescript
// ✅ GOOD
function calculateTotal(items: Item[], tax: number): number {
    return items.reduce((sum, item) => sum + item.price, 0) * (1 + tax);
}

interface Props {
    photo: Photo;
    index?: number;
    onclick?: (photo: Photo) => void;
}

function handleClick(event: MouseEvent): void {
    event.stopPropagation();
}

// ❌ BAD
function calculateTotal(items, tax) {  // No types
    return items.reduce((sum, item) => sum + item.price, 0) * (1 + tax);
}

function handleClick(e) {  // No event type
    e.stopPropagation();
}
```

### No `any` Types

**Never** use `any` type. Use proper types or `unknown` if truly dynamic.

```typescript
// ❌ BAD
const data: any = await fetch('/api/data');

// ✅ GOOD
interface ApiResponse {
    photos: Photo[];
    total: number;
}

const data: ApiResponse = await fetch('/api/data').then(r => r.json());

// ✅ ACCEPTABLE (for truly unknown data)
const data: unknown = await fetch('/api/data').then(r => r.json());
if (isValidResponse(data)) {
    // Type guard
}
```

### Interfaces vs Types

**Prefer `interface`** for object shapes, **use `type`** for unions, intersections, and primitives.

```typescript
// ✅ GOOD - Interface for object shape
interface Photo {
    id: string;
    image_url: string;
    metadata: PhotoMetadata;
}

// ✅ GOOD - Type for union
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';

// ✅ GOOD - Type for intersection
type StyledPhoto = Photo & { className?: string };

// ❌ BAD - Type for simple object (use interface)
type Photo = {
    id: string;
    image_url: string;
};
```

### Optional Chaining

Use optional chaining (`?.`) for potentially undefined values.

```typescript
// ✅ GOOD
const sportName = photo.metadata?.sport_type;
callback?.(data);

// ❌ BAD
const sportName = photo.metadata && photo.metadata.sport_type;
if (callback) {
    callback(data);
}
```

---

## Svelte 5 Component Standards

### Runes Usage

Use Svelte 5 runes for reactive state:
- `$state` - Mutable reactive state
- `$derived` - Computed values
- `$effect` - Side effects
- `$props` - Component props

```svelte
<script lang="ts">
    import type { Photo } from '$types/photo';

    // Props
    interface Props {
        photos: Photo[];
        loading?: boolean;
    }

    let { photos, loading = false }: Props = $props();

    // Mutable state
    let selectedPhoto = $state<Photo | null>(null);

    // Derived state
    let displayPhotos = $derived(photos.slice(0, 24));
    let isEmpty = $derived(!loading && displayPhotos.length === 0);

    // Side effects
    $effect(() => {
        if (selectedPhoto) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = '';
            };
        }
    });
</script>
```

### Event Handlers

Use lowercase event names (Svelte 5 convention):

```svelte
<!-- ✅ GOOD - Svelte 5 -->
<button onclick={handleClick}>Click</button>
<input oninput={handleInput} />
<div onkeydown={handleKeyDown} />

<!-- ❌ BAD - Svelte 4 syntax -->
<button on:click={handleClick}>Click</button>
<input on:input={handleInput} />
```

### Component Props

Always define props interface explicitly:

```typescript
interface Props {
    // Required props
    photo: Photo;

    // Optional props with defaults
    variant?: 'default' | 'compact';
    loading?: boolean;

    // Optional callbacks
    onclick?: (photo: Photo) => void;

    // Class names
    class?: string;
}

let {
    photo,
    variant = 'default',
    loading = false,
    onclick,
    class: className
}: Props = $props();
```

### File Organization

Components should follow this structure:

```svelte
<!-- 1. Component Header Comment -->
<!--
  PhotoCard Component - Minimal Gallery Card

  Features:
  - Favorite button
  - Photo metadata overlay
  - Lazy loading with blur placeholder

  Usage:
  <PhotoCard {photo} {index} onclick={handlePhotoClick} />
-->

<!-- 2. Script Block -->
<script lang="ts">
    // 2a. Imports
    import { Motion } from 'svelte-motion';
    import type { Photo } from '$types/photo';

    // 2b. Props interface
    interface Props {
        photo: Photo;
    }

    // 2c. Props destructuring
    let { photo }: Props = $props();

    // 2d. State
    let loading = $state(false);

    // 2e. Derived values
    let photoUrl = $derived(`/photo/${photo.image_key}`);

    // 2f. Functions
    function handleClick(event: MouseEvent) {
        // ...
    }

    // 2g. Effects (if needed)
    $effect(() => {
        // ...
    });
</script>

<!-- 3. Template -->
<div class="photo-card">
    <!-- Content -->
</div>

<!-- 4. Styles (if needed) -->
<style>
    .photo-card {
        /* Scoped styles */
    }
</style>
```

---

## File Organization

### Directory Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── filters/          # Filter components
│   │   ├── gallery/          # Photo grid, cards, lightbox
│   │   ├── layout/           # Header, Footer
│   │   ├── photo/            # Photo-specific components
│   │   ├── search/           # Search components
│   │   ├── social/           # Social sharing
│   │   └── ui/               # Reusable UI primitives
│   ├── stores/
│   │   └── *.svelte.ts       # Class-based stores with runes
│   ├── supabase/
│   │   ├── client.ts         # Browser client
│   │   └── server.ts         # Server client
│   ├── utils/
│   │   ├── event-handlers.ts # Event handling utilities
│   │   ├── gestures.ts       # Touch gesture utilities
│   │   └── *.ts              # Other utilities
│   ├── motion-tokens.ts      # Animation presets
│   └── utils.ts              # General utilities
├── routes/
│   └── [route]/
│       ├── +page.svelte      # Page component
│       ├── +page.server.ts   # Server load function
│       └── +page.ts          # Client load function (rare)
└── types/
    └── *.ts                  # Type definitions
```

### File Naming

- Components: `PascalCase.svelte` (e.g., `PhotoCard.svelte`)
- Utilities: `kebab-case.ts` (e.g., `event-handlers.ts`)
- Types: `kebab-case.ts` (e.g., `photo.ts`)
- Routes: `kebab-case` (e.g., `photo/[id]/+page.svelte`)

---

## Naming Conventions

### Variables and Functions

```typescript
// ✅ GOOD - camelCase for variables and functions
const photoCount = photos.length;
let selectedPhoto = null;

function handleClick(event: MouseEvent) {}
function calculateTotal(items: Item[]): number {}

// ❌ BAD
const PhotoCount = photos.length;  // PascalCase for variables
const photo_count = photos.length;  // snake_case
```

### Components

```typescript
// ✅ GOOD - PascalCase for components
import PhotoCard from '$lib/components/gallery/PhotoCard.svelte';
import Button from '$lib/components/ui/Button.svelte';

// ❌ BAD
import photoCard from '$lib/components/gallery/photoCard.svelte';
```

### Constants

```typescript
// ✅ GOOD - SCREAMING_SNAKE_CASE for true constants
const MAX_PHOTOS_PER_PAGE = 24;
const API_BASE_URL = 'https://api.example.com';

// ✅ GOOD - camelCase for config objects
const motionTokens = {
    spring: { type: 'spring', stiffness: 300 },
    gentle: { type: 'spring', stiffness: 100 }
};
```

### Types and Interfaces

```typescript
// ✅ GOOD - PascalCase
interface Photo {}
type ButtonVariant = 'primary' | 'secondary';

// ❌ BAD
interface photo {}
type buttonVariant = 'primary' | 'secondary';
```

---

## Styling Standards

### Tailwind CSS

**Prefer Tailwind utilities** over custom CSS when possible.

```svelte
<!-- ✅ GOOD - Tailwind utilities -->
<div class="px-4 py-2 bg-charcoal-900 rounded-lg hover:bg-charcoal-800 transition-colors">

<!-- ⚠️ ACCEPTABLE - Custom CSS for complex styles -->
<div class="custom-gradient">
<style>
.custom-gradient {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}
</style>

<!-- ❌ BAD - Inline styles -->
<div style="padding: 1rem; background: #1a1a1a;">
```

### Class Organization

Use `clsx` or `cn` utility for conditional classes:

```typescript
import { cn } from '$lib/utils';

const buttonClasses = cn(
    'px-4 py-2 rounded-lg font-medium transition-colors',
    variant === 'primary' && 'bg-gold-500 text-charcoal-950',
    variant === 'secondary' && 'bg-charcoal-800 text-white',
    disabled && 'opacity-50 cursor-not-allowed',
    className
);
```

### Responsive Design

Use Tailwind responsive prefixes:

```svelte
<div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
```

---

## Performance Best Practices

### Lazy Loading

Use `priority` prop for above-fold images:

```svelte
<PhotoCard {photo} {index} priority={index < 8} />
```

### Avoid Unnecessary Reactivity

```typescript
// ✅ GOOD - Only recompute when dependencies change
let filteredPhotos = $derived(photos.filter(p => p.sport_type === selectedSport));

// ❌ BAD - Recomputes on every render
$: filteredPhotos = photos.filter(p => p.sport_type === selectedSport);
```

### Server-Side Rendering

Fetch data in `+page.server.ts`:

```typescript
// ✅ GOOD - Server-side data fetching
export const load: PageServerLoad = async ({ url }) => {
    const photos = await fetchPhotos({ limit: 24 });
    return { photos };
};

// ❌ BAD - Client-side fetching (adds waterfall delay)
// In +page.svelte
onMount(async () => {
    photos = await fetch('/api/photos').then(r => r.json());
});
```

### Caching

Use in-memory caching for expensive operations:

```typescript
const CACHE_DURATION_MS = 5 * 60 * 1000;
let sportsCache: CachedData<Sport[]> | null = null;

export const load: LayoutServerLoad = async () => {
    const now = Date.now();
    if (!sportsCache || now - sportsCache.timestamp > CACHE_DURATION_MS) {
        const sports = await getSportDistribution();
        sportsCache = { data: sports, timestamp: now };
    }
    return { sports: sportsCache.data };
};
```

### Navigation and Prefetch Patterns

**CRITICAL:** Always use `<a>` tags for navigation, never `<button>` with `goto()`.

#### Why Anchor Tags Matter

SvelteKit's prefetch only works on `<a>` tags. Using buttons prevents:
- Route preloading (adds 1-2 second delay)
- SEO benefits (search engines can't crawl buttons)
- Keyboard navigation (tab key doesn't focus buttons-as-links)
- Right-click "Open in new tab"

#### Prefetch Strategies

**Use `data-sveltekit-preload="tap"` for navigation headers:**
- Preloads on touchstart (mobile) or mousedown (desktop)
- Best for frequently accessed routes
- Used in: Main navigation, primary CTAs

```svelte
<!-- ✅ GOOD - Main navigation with tap prefetch -->
<nav>
  <a href="/explore" data-sveltekit-preload="tap">
    Explore
  </a>
</nav>
```

**Use `data-sveltekit-preload="hover"` for secondary links:**
- Preloads when user hovers (200-500ms before click)
- Good balance of performance and bandwidth
- Used in: Album cards, collection cards, footer links

```svelte
<!-- ✅ GOOD - Album card with hover prefetch -->
<a
  href="/albums/{album.albumKey}"
  data-sveltekit-preload="hover"
  class="album-card"
>
  {album.name}
</a>
```

**Use `data-sveltekit-preload="viewport"` for high-priority visible links:**
- Preloads as soon as link enters viewport
- Most aggressive, uses more bandwidth
- Used in: Homepage hero CTA, featured content

```svelte
<!-- ✅ GOOD - Hero CTA with viewport prefetch -->
<a
  href="/explore"
  data-sveltekit-preload="viewport"
  class="cta-button"
>
  Browse Gallery
</a>
```

#### When NOT to Prefetch

**Disable prefetch for:**
- External links (SmugMug, social media)
- Links with side effects (logout, delete actions)
- Low-priority links (legal pages, help docs)

```svelte
<!-- External link - no prefetch -->
<a
  href="https://smugmug.com/..."
  data-sveltekit-reload
  target="_blank"
>
  View on SmugMug
</a>

<!-- Photo detail - prefetch data causes layout shift -->
<a
  href="/photo/{id}"
  data-sveltekit-preload-data="false"
>
  View Photo
</a>
```

#### Anti-Patterns

```svelte
<!-- ❌ BAD - Button with goto() prevents prefetch -->
<button onclick={() => goto('/explore')}>
  Explore
</button>

<!-- ❌ BAD - Div with click handler, no prefetch -->
<div role="button" onclick={handleNavigate}>
  Browse Gallery
</div>

<!-- ✅ GOOD - Anchor with prefetch -->
<a href="/explore" data-sveltekit-preload="tap">
  Explore
</a>
```

#### Bundle Size Optimization

**Lazy load heavy components with dynamic imports:**

```svelte
<script>
  // Lazy load filter sidebar (27KB)
  const FilterSidebarPromise = import('$lib/components/filters/FilterSidebar.svelte');
</script>

<!-- Render with skeleton loading state -->
{#await FilterSidebarPromise}
  <div class="w-64 h-96 bg-charcoal-900/50 rounded-lg animate-pulse" />
{:then FilterSidebarModule}
  <FilterSidebarModule.default {...props} />
{/await}
```

**Benefits:**
- Reduces initial page load by 30-40%
- Mobile users don't load desktop-only components
- Improves Time to Interactive (TTI)

---

## Accessibility Requirements

### Semantic HTML

```svelte
<!-- ✅ GOOD -->
<nav aria-label="Main navigation">
    <a href="/explore">Gallery</a>
</nav>

<button type="button" aria-label="Close lightbox" onclick={close}>
    <X class="w-6 h-6" />
</button>

<!-- ❌ BAD -->
<div onclick={navigate}>Gallery</div>
<div onclick={close}>×</div>
```

### ARIA Attributes

```svelte
<button
    aria-label="Add to favorites"
    aria-pressed={isFavorited}
    onclick={toggleFavorite}
>
    <Heart class="w-5 h-5" />
</button>
```

### Keyboard Navigation

Make all interactive elements keyboard accessible:

```svelte
<div
    role="button"
    tabindex="0"
    aria-label="View photo details"
    onclick={handleClick}
    onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    }}
>
    <!-- Content -->
</div>
```

### Focus Indicators

```css
.button {
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2;
}
```

---

## Code Review Checklist

Before submitting code:

- [ ] TypeScript compiles with no errors (`npm run check`)
- [ ] No `any` types used
- [ ] All functions have explicit parameter types
- [ ] Event handlers follow naming convention (`onclick`, not `on:click`)
- [ ] Proper event propagation handling (see [EVENT_HANDLING.md](./EVENT_HANDLING.md))
- [ ] Components have prop interfaces
- [ ] Accessibility attributes present (aria-label, role, etc.)
- [ ] Keyboard navigation works
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Performance optimized (lazy loading, caching)
- [ ] No console.log statements (unless intentional debug logging)

---

## References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Svelte 5 Documentation](https://svelte-5-preview.vercel.app/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Event Handling Conventions](./EVENT_HANDLING.md)

---

**Version History:**
- **1.0.0** (2025-10-27): Initial coding standards documentation
