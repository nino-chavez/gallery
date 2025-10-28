# TypeScript Patterns for This Project

**Purpose:** Project-specific TypeScript patterns and conventions. Follow these to maintain consistency.

---

## Table of Contents

1. [Type Definitions](#type-definitions)
2. [Interface vs Type](#interface-vs-type)
3. [Function Signatures](#function-signatures)
4. [Error Handling](#error-handling)
5. [Async Patterns](#async-patterns)
6. [Svelte 5 Runes](#svelte-5-runes)

---

## Type Definitions

### Photo Types

**Location:** `src/types/photo.ts`

```typescript
export interface Photo {
  photo_id: string;
  image_key: string;
  album_key?: string;
  album_name?: string;

  // URLs
  ImageUrl: string;
  ThumbnailUrl: string;
  OriginalUrl?: string;

  // AI Enrichment
  sport_type?: string;
  photo_category?: string;
  emotion?: string;
  action_intensity?: number;
  quality_score?: number;

  // Dates
  photo_date?: string;
  upload_date?: string;
  enriched_at?: string;
}

export interface PhotoFilters {
  sportType?: string;
  category?: string;
  emotion?: string;
  minQuality?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}
```

### Album Types

```typescript
export interface Album {
  album_key: string;
  album_name: string;
  photo_count: number;
  primary_sport?: string;
  date_start?: string;
  date_end?: string;
  cover_photo_url?: string;
}

export interface AlbumFilters {
  sport?: string;
  year?: number;
}
```

---

## Interface vs Type

### Use `interface` for:
- Object shapes (data structures)
- Extensible types
- Public APIs

```typescript
// ✅ GOOD
export interface Photo {
  photo_id: string;
  ImageUrl: string;
}

export interface EnrichedPhoto extends Photo {
  sport_type: string;
  quality_score: number;
}
```

### Use `type` for:
- Unions
- Intersections
- Mapped types
- Function types

```typescript
// ✅ GOOD
export type SportType = 'volleyball' | 'basketball' | 'track' | 'portrait' | 'other';

export type SortOption = 'date-desc' | 'date-asc' | 'quality-desc';

export type PhotoWithEnrichment = Photo & {
  enrichment_complete: boolean;
};
```

---

## Function Signatures

### Server-Side Functions

```typescript
// ✅ GOOD: Explicit types, clear purpose
export async function fetchPhotos(options: {
  sportType?: string;
  limit?: number;
  offset?: number;
}): Promise<Photo[]> {
  // Implementation
}

// ✅ GOOD: Named params object for multiple options
export async function getPhotoCount(filters: PhotoFilters): Promise<number> {
  // Implementation
}
```

### Component Functions

```typescript
// ✅ GOOD: Event handlers with typed events
function handleClick(event: MouseEvent): void {
  event.stopPropagation();
  // Implementation
}

function handleSubmit(event: SubmitEvent): void {
  event.preventDefault();
  // Implementation
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    // Implementation
  }
}
```

### Utility Functions

```typescript
// ✅ GOOD: Generic with constraints
function groupBy<T, K extends keyof T>(
  array: T[],
  key: K
): Map<T[K], T[]> {
  const groups = new Map<T[K], T[]>();
  for (const item of array) {
    const groupKey = item[key];
    const group = groups.get(groupKey) || [];
    group.push(item);
    groups.set(groupKey, group);
  }
  return groups;
}
```

---

## Error Handling

### Standard Error Pattern

```typescript
// ✅ GOOD: Throw typed errors
class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export async function fetchPhotos(): Promise<Photo[]> {
  const { data, error } = await supabase
    .from('photo_metadata')
    .select('*');

  if (error) {
    throw new DatabaseError(
      `Failed to fetch photos: ${error.message}`,
      error.code
    );
  }

  return data || [];
}
```

### Try-Catch Pattern

```typescript
// ✅ GOOD: Specific error handling
async function syncAlbum(albumKey: string): Promise<void> {
  try {
    const album = await fetchAlbum(albumKey);
    await processAlbum(album);
  } catch (error) {
    if (error instanceof DatabaseError) {
      console.error('Database error:', error.message, error.code);
      // Handle database-specific errors
    } else if (error instanceof NetworkError) {
      console.error('Network error:', error.message);
      // Handle network errors
    } else {
      console.error('Unexpected error:', error);
      throw error; // Re-throw unknown errors
    }
  }
}
```

---

## Async Patterns

### Sequential Processing

```typescript
// ✅ GOOD: When order matters or rate limiting needed
async function processAlbumsSequential(albumKeys: string[]): Promise<void> {
  for (const key of albumKeys) {
    await processAlbum(key);
    await sleep(1000); // Rate limiting
  }
}
```

### Parallel Processing

```typescript
// ✅ GOOD: When operations are independent
async function fetchMultipleAlbums(albumKeys: string[]): Promise<Album[]> {
  const promises = albumKeys.map(key => fetchAlbum(key));
  return Promise.all(promises);
}
```

### Batch Processing

```typescript
// ✅ GOOD: Process in chunks for memory efficiency
async function processBatch<T, R>(
  items: T[],
  processFn: (item: T) => Promise<R>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processFn(item))
    );
    results.push(...batchResults);
  }

  return results;
}
```

---

## Svelte 5 Runes

### Component Props

```typescript
<script lang="ts">
  import type { Photo } from '$types/photo';

  // ✅ GOOD: Typed props with defaults
  interface Props {
    photos: Photo[];
    loading?: boolean;
    onSelect?: (photo: Photo) => void;
  }

  let {
    photos,
    loading = false,
    onSelect
  }: Props = $props();
</script>
```

### Reactive State

```typescript
<script lang="ts">
  // ✅ GOOD: Typed state
  let selectedPhoto = $state<Photo | null>(null);
  let filters = $state<PhotoFilters>({
    sportType: undefined,
    minQuality: 70
  });

  // ✅ GOOD: Derived state
  let filteredPhotos = $derived(
    photos.filter(p =>
      (!filters.sportType || p.sport_type === filters.sportType) &&
      (!filters.minQuality || (p.quality_score || 0) >= filters.minQuality)
    )
  );

  let isEmpty = $derived(!loading && filteredPhotos.length === 0);
</script>
```

### Effects

```typescript
<script lang="ts">
  import { onMount } from 'svelte';

  // ✅ GOOD: Side effects in $effect
  $effect(() => {
    if (selectedPhoto) {
      console.log('Photo selected:', selectedPhoto.photo_id);
      // Track analytics, etc.
    }
  });

  // ✅ GOOD: Cleanup in $effect
  $effect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        selectedPhoto = null;
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  });
</script>
```

### Class-Based Stores

```typescript
// ✅ GOOD: Encapsulated state management
class PreferencesStore {
  private prefs = $state<Preferences>({
    sortBy: 'date-desc',
    gridSize: 'medium'
  });

  get sortBy(): SortOption {
    return this.prefs.sortBy;
  }

  setSortBy(value: SortOption): void {
    this.prefs.sortBy = value;
    this.persist();
  }

  private persist(): void {
    localStorage.setItem('prefs', JSON.stringify(this.prefs));
  }
}

export const preferences = new PreferencesStore();
```

---

## Common Patterns

### Option Objects

```typescript
// ✅ GOOD: Use option objects for multiple params
export function createPhoto(options: {
  imageKey: string;
  albumKey: string;
  url: string;
  sportType?: string;
}): Photo {
  return {
    photo_id: crypto.randomUUID(),
    image_key: options.imageKey,
    album_key: options.albumKey,
    ImageUrl: options.url,
    sport_type: options.sportType,
    ThumbnailUrl: generateThumbnailUrl(options.url)
  };
}

// ❌ BAD: Too many positional params
export function createPhoto(
  imageKey: string,
  albumKey: string,
  url: string,
  sportType?: string
): Photo {
  // Hard to remember order
}
```

### Type Guards

```typescript
// ✅ GOOD: Type guards for runtime checks
export function isPhoto(value: unknown): value is Photo {
  return (
    typeof value === 'object' &&
    value !== null &&
    'photo_id' in value &&
    'ImageUrl' in value
  );
}

// Usage
if (isPhoto(data)) {
  console.log(data.photo_id); // TypeScript knows it's a Photo
}
```

### Discriminated Unions

```typescript
// ✅ GOOD: Discriminated unions for state
type LoadingState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function handleState<T>(state: LoadingState<T>): void {
  switch (state.status) {
    case 'idle':
      console.log('Idle');
      break;
    case 'loading':
      console.log('Loading...');
      break;
    case 'success':
      console.log('Data:', state.data); // TypeScript knows data exists
      break;
    case 'error':
      console.log('Error:', state.error.message); // TypeScript knows error exists
      break;
  }
}
```

---

## Common Mistakes to Avoid

### ❌ Using `any`

```typescript
// WRONG
function processData(data: any) {
  return data.photos.map(p => p.url);
}

// CORRECT
function processData(data: { photos: Photo[] }) {
  return data.photos.map(p => p.ImageUrl);
}
```

### ❌ Non-Null Assertions

```typescript
// WRONG: Assumes data exists
const photo = photos.find(p => p.photo_id === id)!;
console.log(photo.ImageUrl); // Could crash

// CORRECT: Handle null case
const photo = photos.find(p => p.photo_id === id);
if (!photo) {
  throw new Error(`Photo not found: ${id}`);
}
console.log(photo.ImageUrl);
```

### ❌ Implicit Any

```typescript
// WRONG: TypeScript infers 'any' from empty array
const photos = [];
photos.push({ url: 'test' }); // No type checking

// CORRECT: Explicit type
const photos: Photo[] = [];
photos.push({ url: 'test' }); // Type error!
```

---

## Type Utilities

### Useful Built-in Types

```typescript
// Partial: Make all properties optional
type PartialPhoto = Partial<Photo>;

// Required: Make all properties required
type RequiredPhoto = Required<Photo>;

// Pick: Select specific properties
type PhotoPreview = Pick<Photo, 'photo_id' | 'ImageUrl' | 'ThumbnailUrl'>;

// Omit: Exclude specific properties
type PhotoWithoutDates = Omit<Photo, 'photo_date' | 'upload_date'>;
```

---

## Related Documentation

- `docs/CODING_STANDARDS.md` - Full coding standards
- `tsconfig.json` - TypeScript configuration
- `src/types/photo.ts` - Photo type definitions

---

**Version:** 1.0
**Last Updated:** 2025-10-28
**Maintained By:** Agent-OS
