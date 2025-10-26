# Nino Chavez Gallery - AI Development Instructions

**Stack:** SvelteKit 2.x + Svelte 5 + Tailwind CSS 4 + Supabase
**Type:** Photography Portfolio (Volleyball Action Sports)
**Scale:** ~20K photos | Production deployment on Vercel

## Project Context

Professional volleyball photography gallery featuring action sports photography. Built with modern web standards, optimized for performance and user experience.

**Current Status:** Production (migrated from React/Next.js)
**Database:** Supabase PostgreSQL with comprehensive indexing
**Auth:** Not yet implemented (planned future feature)

## Agent Operating System

**Version:** 3.0.0 - Multi-Mode Workflow

### Workflow Modes

| Mode | Usage | Token Budget | Best For |
|------|-------|--------------|----------|
| **Direct** ⭐ | 90% | 1K | UI components, styling, animations |
| **Selective** | 8% | 3K | Features with backend + frontend |
| **Thorough** | 2% | 5K | Security, auth, performance optimization |

**Default:** Direct mode (portfolio sites are primarily UI-focused)

## Tech Stack

**Frontend:**
- SvelteKit 2.x (adapter-vercel, SSR)
- Svelte 5 (Runes: $state, $derived, $effect, $props)
- Tailwind CSS 4 with tailwindcss-animate
- svelte-motion (animations with MOTION tokens)
- lucide-svelte (icons)
- clsx + tailwind-merge (conditional styling)

**Data & Backend:**
- Supabase PostgreSQL (photo_metadata table, ~20K rows)
- @supabase/supabase-js (v2.75.1)
- @tanstack/svelte-query (client-side data fetching)
- Performance indexes (see database/performance-indexes.sql)

**Development:**
- TypeScript (strict mode, no any types)
- Vite 7 (dev server)
- svelte-check (type checking)
- Playwright (@axe-core/playwright for accessibility)

**Deployment:**
- Vercel (nodejs20.x runtime)
- Environment: photography.ninochavez.co
- Base path: '' (subdomain root, absolute paths)

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── filters/      # CategoryFilter, SportFilter
│   │   ├── gallery/      # PhotoGrid, PhotoCard, Lightbox, AlbumCard
│   │   ├── layout/       # Header, Footer
│   │   ├── photo/        # FavoriteButton, DownloadButton
│   │   ├── search/       # SearchAutocomplete
│   │   ├── social/       # SocialShareButtons
│   │   └── ui/           # Button, Card, Loading, OptimizedImage, StatsCard, etc.
│   ├── stores/
│   │   ├── favorites.svelte.ts     # Favorites management (localStorage)
│   │   └── preferences.svelte.ts   # User preferences (class-based store)
│   ├── supabase/
│   │   ├── client.ts     # Browser client (VITE_ env vars, anon key)
│   │   └── server.ts     # Server client (service_role key, RLS bypassed)
│   ├── motion-tokens.ts  # Centralized animation presets
│   ├── photo-utils.ts    # Photo processing utilities
│   └── utils.ts          # General utilities
├── routes/
│   ├── +layout.server.ts           # Root layout (caches distributions)
│   ├── +layout.svelte              # App shell
│   ├── albums/+page.server.ts      # Album listing
│   ├── albums/[albumKey]/+page.server.ts  # Album detail
│   ├── collections/+page.server.ts # Collections
│   ├── explore/+page.server.ts     # Main gallery (filtering, sorting, pagination)
│   ├── favorites/+page.server.ts   # Favorites page
│   ├── photo/[id]/+page.server.ts  # Photo detail
│   └── timeline/+page.server.ts    # Timeline view
└── types/
    └── photo.ts          # Photo interface definitions

database/
├── performance-indexes.sql         # Production indexes
└── performance-indexes-simple.sql  # Simplified version
```

## SvelteKit Patterns (This Project)

### 1. Server Load Functions

**Pattern:** Use +page.server.ts for data loading with Supabase server client

```typescript
// src/routes/explore/+page.server.ts
import { fetchPhotos, getPhotoCount } from '$lib/supabase/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
  // Access cached data from parent layout
  const { sports, categories } = await parent();

  // Parse URL params
  const sportFilter = url.searchParams.get('sport') || undefined;
  const page = parseInt(url.searchParams.get('page') || '1');

  // Fetch data server-side
  const photos = await fetchPhotos({
    sportType: sportFilter,
    limit: 24,
    offset: (page - 1) * 24,
  });

  return { photos, sports, categories };
};
```

**Key Points:**
- ⚠️ Use `$lib/supabase/server` (NOT client) in +page.server.ts
- NO self-fetch anti-pattern (no API routes needed)
- Use `parent()` to access layout data (avoid re-fetching)
- Parse URL searchParams for filters/pagination

### 2. Svelte 5 Runes in Components

**Pattern:** Use runes for reactive state ($state, $derived, $props)

```svelte
<script lang="ts">
  import type { Photo } from '$types/photo';

  // Props using $props()
  interface Props {
    photos: Photo[];
    loading?: boolean;
  }

  let { photos, loading = false }: Props = $props();

  // Derived state
  let displayPhotos = $derived(photos.slice(0, 24));
  let isEmpty = $derived(!loading && displayPhotos.length === 0);

  // Mutable state
  let selectedPhoto = $state<Photo | null>(null);
</script>
```

### 3. Class-Based Stores with Runes

**Pattern:** Encapsulate state management in classes (see preferences.svelte.ts)

```typescript
class GalleryPreferencesStore {
  private prefs = $state<GalleryPreferences>(loadPreferences());

  get sortBy(): SortOption {
    return this.prefs.sortBy;
  }

  setSortBy(value: SortOption): void {
    this.prefs.sortBy = value;
    savePreferences(this.prefs);
  }
}

export const preferences = new GalleryPreferencesStore();
```

### 4. Performance Optimization

**Pattern:** In-memory caching in layout for expensive queries

```typescript
// src/routes/+layout.server.ts
const CACHE_DURATION_MS = 5 * 60 * 1000;

interface CachedData<T> {
  data: T;
  timestamp: number;
}

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

### 5. Animation with svelte-motion

**Pattern:** Use centralized MOTION tokens (src/lib/motion-tokens.ts)

```svelte
<script>
  import { Motion } from 'svelte-motion';
  import { MOTION } from '$lib/motion-tokens';
</script>

<Motion
  let:motion
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={MOTION.spring.gentle}
>
  <div use:motion>Content</div>
</Motion>
```

## Database Schema

**Primary Table:** `photo_metadata`

**Key Columns:**
- `photo_id` (PK), `image_key`
- `ImageUrl`, `ThumbnailUrl`, `OriginalUrl` (Supabase Storage)
- `sport_type`, `photo_category`, `emotion`, `action_intensity`
- `quality_score`, `portfolio_worthy`, `sharpness`
- `upload_date`, `photo_date`, `enriched_at`

**Indexes:** See `database/performance-indexes.sql` for:
- Sport/category filtering (10x faster)
- Quality score sorting (8x faster)
- Composite indexes for common filter combinations
- Covering indexes for read optimization

## Common Tasks by Mode

### Direct Mode (90%)

**UI Components:**
- "Add hover effects to PhotoCard component"
- "Create responsive grid layout with Tailwind"
- "Implement loading skeleton for PhotoGrid"
- "Add animation to filter panel toggle"

**Styling:**
- "Update button styles to match design system"
- "Fix mobile layout for gallery header"
- "Add dark mode support to components"

**Content:**
- "Update footer copyright year"
- "Change hero section tagline"

### Selective Mode (8%)

**Full Features:**
- "Add search functionality with autocomplete"
- "Implement favorites system with localStorage"
- "Create album detail page with photo listing"
- "Add social sharing buttons with meta tags"

**Performance:**
- "Optimize image loading with lazy loading"
- "Add pagination to explore page"
- "Implement virtual scrolling for large galleries"

### Thorough Mode (2%)

**Security & Auth:**
- "Implement user authentication with Supabase Auth"
- "Add admin panel with RLS policies"
- "Secure photo upload with signed URLs"

**Critical Performance:**
- "Optimize database queries with indexes"
- "Implement CDN caching strategy"
- "Add server-side rendering optimization"

## Validation Commands

```bash
# Type checking
npm run check

# Production build
npm run build

# Preview build
npm run preview

# E2E tests
npm test

# Watch mode
npm run check:watch
```

## Environment Variables

**Browser-safe (VITE_ prefix):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Server-only:**
- `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)

## Performance Targets

- Lighthouse score: >90
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Image optimization: WebP/AVIF with Supabase transforms

## Related Documentation

- `.agent-os/README.md` - Agent-OS overview
- `.agent-os/config.yml` - Workflow configuration
- `AGENTS.md` - Agent-specific guidance and examples
- `database/performance-indexes.sql` - Database optimization

---

**Version:** 3.0.1
**Last Updated:** 2025-10-26
