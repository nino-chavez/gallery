# Agent Development Guide - Nino Chavez Gallery

Practical guidance for AI agents working on this SvelteKit + Svelte 5 photography portfolio.

## Quick Reference

**When working on this project, you should:**
- ✅ Read CLAUDE.md first for project context
- ✅ Use Direct mode (90%) for UI/component work
- ✅ Use Selective mode (8%) for features with backend
- ✅ Use Thorough mode (2%) for security/auth/performance
- ✅ Run `npm run check && npm run build` before committing
- ✅ Follow Svelte 5 Runes patterns ($state, $derived, $props)
- ✅ Use $lib/supabase/server in +page.server.ts files
- ✅ Use $lib/supabase/client in browser components

## Mode Selection Guide

### When to Use Direct Mode (⭐ Default)

**Characteristics:**
- UI-only changes
- No database queries
- Styling and layout
- Component refactoring
- Animation updates
- Content changes

**Examples:**

```
✅ "Add hover effect to PhotoCard"
✅ "Make gallery responsive on mobile"
✅ "Update button variant styles"
✅ "Add loading skeleton to PhotoGrid"
✅ "Change hero section copy"
✅ "Fix footer alignment"
```

**Workflow:**
1. Locate component in src/lib/components/
2. Make changes using Svelte 5 patterns
3. Test visually in browser
4. Run `npm run check && npm run build`
5. Commit

### When to Use Selective Mode

**Characteristics:**
- Backend + frontend integration
- New feature with data
- API route creation
- Complex state management
- Multi-component features

**Examples:**

```
✅ "Add search with autocomplete"
✅ "Implement favorites with localStorage"
✅ "Create album detail page"
✅ "Add pagination to explore page"
✅ "Implement filter panel with URL params"
```

**Workflow:**
1. Design data flow (server → component)
2. Create/update +page.server.ts load function
3. Create/update Svelte components
4. Add TypeScript types
5. Run `npm run check && npm run build && npm test`
6. Commit

### When to Use Thorough Mode

**Characteristics:**
- Security-sensitive features
- Authentication/authorization
- Performance optimization
- Database schema changes
- RLS policy implementation

**Examples:**

```
✅ "Implement Supabase Auth with RLS"
✅ "Add admin panel with role-based access"
✅ "Optimize photo loading performance"
✅ "Create database indexes for new queries"
✅ "Implement secure photo upload"
```

**Workflow:**
1. Research security/performance requirements
2. Design comprehensive solution
3. Implement with thorough testing
4. Add Playwright tests
5. Run full test suite
6. Security/performance review
7. Commit

## Common Task Patterns

### 1. Creating a New Component

**Location:** `src/lib/components/{category}/ComponentName.svelte`

**Template:**

```svelte
<!--
  ComponentName - Brief description

  Features:
  - Feature 1
  - Feature 2

  Usage:
  <ComponentName prop={value} />
-->

<script lang="ts">
  import type { ComponentProps } from 'svelte';

  interface Props {
    required: string;
    optional?: boolean;
  }

  let { required, optional = false }: Props = $props();

  // Derived state
  let computed = $derived(required.toUpperCase());

  // Mutable state
  let count = $state(0);

  // Effects
  $effect(() => {
    console.log('Required changed:', required);
  });
</script>

<div class="container">
  <p>{computed}</p>
  <button onclick={() => count++}>
    Count: {count}
  </button>
</div>

<style>
  /* Use Tailwind CSS - minimal custom CSS */
</style>
```

**Checklist:**
- [ ] Use TypeScript Props interface
- [ ] Use $props() for props destructuring
- [ ] Use $derived for computed values
- [ ] Use $state for mutable state
- [ ] Add JSDoc comment at top
- [ ] Use Tailwind CSS (not custom styles)
- [ ] Export from appropriate index if needed

### 2. Creating a Server Load Function

**Location:** `src/routes/path/+page.server.ts`

**Template:**

```typescript
/**
 * Server-side data loading for /path route
 *
 * Pattern: Direct Supabase calls with server client
 * NO self-fetch anti-pattern (no API route needed)
 */

import { fetchPhotos } from '$lib/supabase/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
  // Access parent layout data (cached)
  const { sports, categories } = await parent();

  // Parse URL params
  const filter = url.searchParams.get('filter') || undefined;

  // Fetch data using server client
  const photos = await fetchPhotos({ filter });

  return {
    photos,
    sports,
    categories,
  };
};
```

**Checklist:**
- [ ] Import from `$lib/supabase/server` (NOT client)
- [ ] Use `parent()` to access layout data
- [ ] Parse URL searchParams for filters/pagination
- [ ] Return plain objects (serializable)
- [ ] Add JSDoc with explanation
- [ ] Handle errors appropriately

### 3. Adding a Database Query

**Location:** `src/lib/supabase/server.ts`

**Template:**

```typescript
export async function fetchPhotosWithFilter(options: FilterOptions) {
  let query = supabase
    .from('photo_metadata')
    .select('*')
    .not('sharpness', 'is', null); // Only processed photos

  // Apply filters
  if (options.sportType) {
    query = query.eq('sport_type', options.sportType);
  }

  if (options.minQuality) {
    query = query.gte('quality_score', options.minQuality);
  }

  // Sorting
  const orderColumn = options.sortBy === 'quality' ? 'quality_score' : 'upload_date';
  query = query.order(orderColumn, { ascending: false });

  // Pagination
  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 24) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[Supabase] Error fetching photos:', error);
    throw error;
  }

  return data;
}
```

**Checklist:**
- [ ] Use server.ts (for +page.server.ts) or client.ts (for components)
- [ ] Filter out null sharpness (unprocessed photos)
- [ ] Apply filters conditionally
- [ ] Use proper ordering (upload_date DESC for newest)
- [ ] Implement pagination with range()
- [ ] Handle errors with console.error + throw
- [ ] Add TypeScript types for options

### 4. Creating a Store (Svelte 5 Runes)

**Location:** `src/lib/stores/feature.svelte.ts`

**Template:**

```typescript
/**
 * Feature Store
 *
 * Manages feature state with localStorage persistence
 * Uses Svelte 5 runes for reactive state
 */

interface FeatureState {
  value: string;
  enabled: boolean;
}

const STORAGE_KEY = 'feature_state';

const DEFAULT_STATE: FeatureState = {
  value: '',
  enabled: false,
};

function loadState(): FeatureState {
  if (typeof window === 'undefined') return DEFAULT_STATE;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULT_STATE, ...JSON.parse(stored) } : DEFAULT_STATE;
  } catch (error) {
    console.warn('[Feature] Failed to load state:', error);
    return DEFAULT_STATE;
  }
}

function saveState(state: FeatureState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('[Feature] Failed to save state:', error);
  }
}

class FeatureStore {
  private state = $state<FeatureState>(loadState());

  // Getters
  get value(): string {
    return this.state.value;
  }

  get enabled(): boolean {
    return this.state.enabled;
  }

  // Setters with persistence
  setValue(value: string): void {
    this.state.value = value;
    saveState(this.state);
  }

  setEnabled(enabled: boolean): void {
    this.state.enabled = enabled;
    saveState(this.state);
  }

  reset(): void {
    this.state = { ...DEFAULT_STATE };
    saveState(this.state);
  }
}

// Export singleton instance
export const featureStore = new FeatureStore();
```

**Checklist:**
- [ ] Use class-based pattern with $state
- [ ] Check `typeof window === 'undefined'` for SSR
- [ ] Implement localStorage persistence
- [ ] Provide getters for reactive values
- [ ] Provide setters that auto-save
- [ ] Export singleton instance
- [ ] Add JSDoc comments

### 5. Using Animation

**Pattern:** Use MOTION tokens from `src/lib/motion-tokens.ts`

```svelte
<script>
  import { Motion } from 'svelte-motion';
  import { MOTION } from '$lib/motion-tokens';

  // Available presets:
  // MOTION.spring.gentle
  // MOTION.spring.bouncy
  // MOTION.spring.snappy
  // MOTION.timing.smooth
  // MOTION.timing.fast
</script>

<Motion
  let:motion
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={MOTION.spring.gentle}
>
  <div use:motion>
    Content with animation
  </div>
</Motion>
```

**For lists (staggered):**

```svelte
{#each items as item, i (item.id)}
  <Motion
    let:motion
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      ...MOTION.spring.gentle,
      delay: i * 0.05
    }}
  >
    <div use:motion>{item.name}</div>
  </Motion>
{/each}
```

## File Naming Conventions

```
src/routes/
  +page.svelte                 # Page component
  +page.server.ts              # Server load function
  +layout.svelte               # Layout component
  +layout.server.ts            # Layout server load
  +error.svelte                # Error boundary
  [param]/+page.svelte         # Dynamic route

src/lib/
  components/
    ui/Button.svelte           # PascalCase for components
    gallery/PhotoGrid.svelte
  stores/
    preferences.svelte.ts      # camelCase for stores
    favorites.svelte.ts
  supabase/
    client.ts                  # Lowercase for utilities
    server.ts
```

## TypeScript Patterns

### Props Interface

```typescript
interface Props {
  required: string;
  optional?: number;
  handler?: (value: string) => void;
  children?: Snippet;
}

let { required, optional = 0, handler, children }: Props = $props();
```

### Type Imports

```typescript
import type { Photo } from '$types/photo';
import type { PageServerLoad } from './$types';
```

### Generic Components

```typescript
interface Props<T> {
  items: T[];
  render: (item: T) => string;
}

let { items, render }: Props<Photo> = $props();
```

## Common Pitfalls

### ❌ Don't: Use client in server files

```typescript
// src/routes/explore/+page.server.ts
import { supabase } from '$lib/supabase/client'; // ❌ WRONG
```

### ✅ Do: Use server in server files

```typescript
// src/routes/explore/+page.server.ts
import { fetchPhotos } from '$lib/supabase/server'; // ✅ CORRECT
```

---

### ❌ Don't: Create API routes for data fetching

```typescript
// src/routes/api/photos/+server.ts ❌ AVOID
export async function GET() {
  const photos = await fetchPhotos();
  return json(photos);
}
```

### ✅ Do: Use server load functions

```typescript
// src/routes/explore/+page.server.ts ✅ CORRECT
export const load: PageServerLoad = async () => {
  const photos = await fetchPhotos();
  return { photos };
};
```

---

### ❌ Don't: Use old Svelte store syntax

```typescript
let count = writable(0); // ❌ Old Svelte 4 pattern
```

### ✅ Do: Use Svelte 5 runes

```typescript
let count = $state(0); // ✅ Svelte 5 runes
```

---

### ❌ Don't: Fetch data in components

```svelte
<script>
  import { onMount } from 'svelte';
  let photos = $state([]);

  onMount(async () => {
    const res = await fetch('/api/photos'); // ❌ Client-side fetch
    photos = await res.json();
  });
</script>
```

### ✅ Do: Use server load + props

```svelte
<!-- +page.server.ts loads data -->
<script lang="ts">
  interface Props {
    data: { photos: Photo[] };
  }

  let { data }: Props = $props();
  let { photos } = data;
</script>
```

---

### ❌ Don't: Mutate props directly

```typescript
let { items }: Props = $props();
items.push(newItem); // ❌ Props are readonly
```

### ✅ Do: Create local state if mutation needed

```typescript
let { items }: Props = $props();
let localItems = $state([...items]);
localItems.push(newItem); // ✅ Mutate local copy
```

## Testing Checklist

### Before Committing

```bash
# 1. Type check
npm run check

# 2. Build check
npm run build

# 3. Run tests (if applicable)
npm test

# 4. Visual check in browser
npm run dev
```

### For Selective/Thorough Mode

```bash
# Run specific test file
npx playwright test path/to/test.spec.ts

# Run with UI
npm run test:ui

# Debug mode
npm run test:debug
```

## Debugging Tips

### Check Supabase Query

```typescript
const { data, error } = await supabase
  .from('photo_metadata')
  .select('*')
  .eq('sport_type', 'volleyball');

console.log('Query result:', { data, error }); // Log results
console.log('Row count:', data?.length); // Check count
```

### Check Server Load Data

```typescript
// +page.server.ts
export const load: PageServerLoad = async () => {
  const photos = await fetchPhotos();
  console.log('[Server Load] Photos:', photos.length);
  return { photos };
};
```

### Check Component Props

```svelte
<script lang="ts">
  let { photos }: Props = $props();

  $effect(() => {
    console.log('[Component] Photos received:', photos.length);
  });
</script>
```

## Performance Tips

### 1. Use parent() to avoid re-fetching

```typescript
export const load: PageServerLoad = async ({ parent }) => {
  const { sports } = await parent(); // Cached from layout
  return { sports };
};
```

### 2. Limit data in queries

```typescript
const photos = await supabase
  .from('photo_metadata')
  .select('photo_id, ImageUrl, ThumbnailUrl') // Only needed columns
  .limit(24);
```

### 3. Use indexes for filtering

See `database/performance-indexes.sql` for:
- Sport filtering
- Category filtering
- Quality score sorting
- Composite indexes

### 4. Lazy load images

```svelte
<img
  src={photo.ThumbnailUrl}
  alt={photo.caption}
  loading="lazy"
/>
```

## Resources

- [SvelteKit Docs](https://svelte.dev/docs/kit)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/reactivity)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Playwright](https://playwright.dev/docs/intro)

## Agent Workflow Summary

1. **Understand the task** → Determine mode (Direct/Selective/Thorough)
2. **Read relevant files** → Use patterns from this guide
3. **Make changes** → Follow conventions and checklist
4. **Test locally** → Visual + type check + build
5. **Verify** → Run appropriate validation commands
6. **Commit** → With descriptive message

---

**Version:** 1.0.0
**Last Updated:** 2025-10-26
**Related:** CLAUDE.md, .agent-os/README.md, .agent-os/config.yml
