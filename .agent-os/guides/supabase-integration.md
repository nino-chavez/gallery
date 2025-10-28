# Supabase Integration Guide

**Purpose:** Reference for consistent Supabase integration patterns in this project. Use this guide to avoid hallucinating new approaches.

---

## Table of Contents

1. [Client Setup](#client-setup)
2. [Server vs Browser Clients](#server-vs-browser-clients)
3. [Common Query Patterns](#common-query-patterns)
4. [Error Handling](#error-handling)
5. [Type Safety](#type-safety)

---

## Client Setup

### Browser Client (src/lib/supabase/client.ts)

**Always use for:**
- Client-side data fetching
- User-triggered actions
- Real-time subscriptions

**Pattern:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

**Usage:**
```typescript
import { supabase } from '$lib/supabase/client';

// Query
const { data, error } = await supabase
  .from('photo_metadata')
  .select('*')
  .limit(10);
```

### Server Client (src/lib/supabase/server.ts)

**Always use for:**
- Server-side data fetching (+page.server.ts, +layout.server.ts)
- API routes (+server.ts)
- Scripts that need to bypass RLS

**Pattern:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
```

**Usage in +page.server.ts:**
```typescript
import type { PageServerLoad } from './$types';
import { fetchPhotos } from '$lib/supabase/server';

export const load: PageServerLoad = async ({ url }) => {
  const photos = await fetchPhotos({ limit: 24 });
  return { photos };
};
```

---

## Server vs Browser Clients

| Context | Client | Import Path | Key |
|---------|--------|-------------|-----|
| **+page.svelte** | Browser | `$lib/supabase/client` | VITE_SUPABASE_ANON_KEY |
| **+page.server.ts** | Server | `$lib/supabase/server` | SUPABASE_SERVICE_ROLE_KEY |
| **+server.ts (API)** | Server | `$lib/supabase/server` | SUPABASE_SERVICE_ROLE_KEY |
| **scripts/** | Server | `$lib/supabase/server` | SUPABASE_SERVICE_ROLE_KEY |

**Critical Rule:** NEVER use browser client in server files, NEVER use service role key in browser.

---

## Common Query Patterns

### Fetch with Filters

```typescript
// src/lib/supabase/server.ts
export async function fetchPhotos(options: {
  sportType?: string;
  category?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('photo_metadata')
    .select('*')
    .order('photo_date', { ascending: false });

  if (options.sportType) {
    query = query.eq('sport_type', options.sportType);
  }

  if (options.category) {
    query = query.eq('photo_category', options.category);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 24) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Supabase query error:', error);
    throw new Error(`Failed to fetch photos: ${error.message}`);
  }

  return data || [];
}
```

### Count Queries

```typescript
export async function getPhotoCount(filters?: {
  sportType?: string;
  category?: string;
}) {
  let query = supabase
    .from('photo_metadata')
    .select('*', { count: 'exact', head: true });

  if (filters?.sportType) {
    query = query.eq('sport_type', filters.sportType);
  }

  if (filters?.category) {
    query = query.eq('photo_category', filters.category);
  }

  const { count, error } = await query;

  if (error) {
    console.error('Count query error:', error);
    return 0;
  }

  return count || 0;
}
```

### Aggregations (Distributions)

```typescript
export async function getSportDistribution() {
  const { data, error } = await supabase
    .from('photo_metadata')
    .select('sport_type')
    .not('sport_type', 'is', null);

  if (error) {
    console.error('Distribution query error:', error);
    return [];
  }

  // Manual aggregation (Supabase doesn't support GROUP BY in JS client)
  const counts = new Map<string, number>();
  data.forEach(row => {
    const count = counts.get(row.sport_type) || 0;
    counts.set(row.sport_type, count + 1);
  });

  return Array.from(counts.entries())
    .map(([sport, count]) => ({ sport, count }))
    .sort((a, b) => b.count - a.count);
}
```

### Batch Updates

```typescript
export async function updatePhotosBatch(
  albumKey: string,
  updates: { album_name: string }
) {
  const { data, error, count } = await supabase
    .from('photo_metadata')
    .update(updates)
    .eq('album_key', albumKey)
    .select('photo_id', { count: 'exact' });

  if (error) {
    throw new Error(`Batch update failed: ${error.message}`);
  }

  return { updated: count || 0, data };
}
```

---

## Error Handling

### Standard Pattern

```typescript
const { data, error } = await supabase
  .from('photo_metadata')
  .select('*');

if (error) {
  console.error('Supabase error:', error.message, error.details);
  // Option 1: Throw (for critical operations)
  throw new Error(`Database query failed: ${error.message}`);

  // Option 2: Return empty (for non-critical)
  return [];
}

return data || [];
```

### With Retry Logic

```typescript
async function fetchWithRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  retries = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    const { data, error } = await queryFn();

    if (!error && data) {
      return data;
    }

    if (i < retries - 1) {
      console.warn(`Query failed, retrying... (${i + 1}/${retries})`);
      await sleep(1000 * (i + 1)); // Exponential backoff
    } else {
      throw new Error(`Query failed after ${retries} attempts: ${error.message}`);
    }
  }

  throw new Error('Query failed');
}
```

---

## Type Safety

### Using Database Types

```typescript
// src/types/database.ts
import type { Database } from './supabase-types'; // Generated types

export type Photo = Database['public']['Tables']['photo_metadata']['Row'];
export type PhotoInsert = Database['public']['Tables']['photo_metadata']['Insert'];
export type PhotoUpdate = Database['public']['Tables']['photo_metadata']['Update'];
```

### Typed Queries

```typescript
import type { Photo } from '$types/database';

export async function fetchPhotos(): Promise<Photo[]> {
  const { data, error } = await supabase
    .from('photo_metadata')
    .select('*');

  if (error) throw new Error(error.message);
  return data as Photo[];
}
```

### Type-Safe Updates

```typescript
import type { PhotoUpdate } from '$types/database';

export async function updatePhoto(
  photoId: string,
  updates: Partial<PhotoUpdate>
) {
  const { data, error } = await supabase
    .from('photo_metadata')
    .update(updates)
    .eq('photo_id', photoId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Photo;
}
```

---

## Performance Best Practices

### 1. Use Indexes

Always query on indexed columns:
- `photo_id` (primary key)
- `image_key` (unique)
- `album_key` (indexed)
- `sport_type` (indexed)
- `photo_category` (indexed)

### 2. Limit Results

```typescript
// ✅ GOOD: Always limit
const { data } = await supabase
  .from('photo_metadata')
  .select('*')
  .limit(100);

// ❌ BAD: No limit (could return 20k+ rows)
const { data } = await supabase
  .from('photo_metadata')
  .select('*');
```

### 3. Select Only Needed Columns

```typescript
// ✅ GOOD: Select specific columns
const { data } = await supabase
  .from('photo_metadata')
  .select('photo_id, ImageUrl, ThumbnailUrl, sport_type');

// ❌ BAD: Select all columns when not needed
const { data } = await supabase
  .from('photo_metadata')
  .select('*');
```

### 4. Use Pagination

```typescript
const PAGE_SIZE = 24;
const page = 1;
const offset = (page - 1) * PAGE_SIZE;

const { data } = await supabase
  .from('photo_metadata')
  .select('*')
  .range(offset, offset + PAGE_SIZE - 1);
```

---

## Common Mistakes to Avoid

### ❌ Using Browser Client in Server Code

```typescript
// WRONG: +page.server.ts
import { supabase } from '$lib/supabase/client'; // Browser client!

export const load: PageServerLoad = async () => {
  const { data } = await supabase.from('photo_metadata').select('*');
  return { data };
};
```

**Fix:** Use server client:
```typescript
// CORRECT: +page.server.ts
import { fetchPhotos } from '$lib/supabase/server';

export const load: PageServerLoad = async () => {
  const photos = await fetchPhotos({ limit: 24 });
  return { photos };
};
```

### ❌ Ignoring Errors

```typescript
// WRONG: Silent failure
const { data } = await supabase.from('photo_metadata').select('*');
return data; // Could be null if error occurred
```

**Fix:** Always check errors:
```typescript
// CORRECT
const { data, error } = await supabase.from('photo_metadata').select('*');
if (error) {
  console.error('Query error:', error);
  throw new Error(error.message);
}
return data || [];
```

### ❌ Not Using Prepared Functions

```typescript
// WRONG: Raw queries in components/pages
const { data } = await supabase
  .from('photo_metadata')
  .select('*')
  .eq('sport_type', 'volleyball')
  .limit(24);
```

**Fix:** Use prepared functions:
```typescript
// CORRECT: src/lib/supabase/server.ts
export async function fetchPhotosBySport(sport: string, limit = 24) {
  // Implementation here
}

// In component/page:
import { fetchPhotosBySport } from '$lib/supabase/server';
const photos = await fetchPhotosBySport('volleyball');
```

---

## Related Documentation

- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript)
- `src/lib/supabase/client.ts` - Browser client implementation
- `src/lib/supabase/server.ts` - Server client implementation
- `database/performance-indexes.sql` - Index definitions

---

**Version:** 1.0
**Last Updated:** 2025-10-28
**Maintained By:** Agent-OS
