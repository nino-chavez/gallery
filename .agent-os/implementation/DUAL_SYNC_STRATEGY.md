# Dual Sync Strategy - SmugMug + Supabase

**Purpose:** Keep album names synchronized between SmugMug (source of truth) and Supabase (enriched metadata) during canonical naming workflow.

**Version:** 1.0
**Date:** 2025-10-28

---

## Problem Statement

Currently, we have two data sources:

1. **SmugMug:** Album metadata, photos, EXIF data (source of truth)
2. **Supabase:** Enriched photo metadata with AI-generated fields

When we update album names to canonical format, we need to:
- ✅ Update SmugMug album name
- ✅ Update Supabase `photo_metadata.album_name` for all photos in that album
- ✅ Maintain referential integrity between both systems

**Risk:** If we only update SmugMug, our Supabase database becomes stale and the gallery UI shows old names.

---

## Data Model

### SmugMug Schema

```
Album {
  AlbumKey: string (PK)
  Name: string
  Description: string
  Keywords: string[]
  DateStart: string (ISO)
  DateEnd: string (ISO)
}

Photo {
  ImageKey: string (PK)
  AlbumKey: string (FK)
  Title: string
  Caption: string
  EXIF: {
    DateTimeOriginal: string
  }
}
```

### Supabase Schema

```sql
-- photo_metadata table
CREATE TABLE photo_metadata (
  photo_id uuid PRIMARY KEY,
  image_key text UNIQUE NOT NULL,
  album_key text,           -- SmugMug album reference
  album_name text,          -- STALE DATA RISK

  -- Photo URLs
  ImageUrl text,
  ThumbnailUrl text,
  OriginalUrl text,

  -- AI enrichment
  sport_type text,
  photo_category text,
  emotion text,
  quality_score numeric,

  -- Dates
  photo_date timestamp,
  upload_date timestamp,
  enriched_at timestamp
);

-- Index for album sync
CREATE INDEX idx_photo_metadata_album_key ON photo_metadata(album_key);
```

**Key Field:** `album_key` links Supabase photos to SmugMug albums.

---

## Sync Strategy

### Option 1: Update Both Systems (Recommended)

**Workflow:**

```
1. Fetch album from SmugMug (AlbumKey, Name, Photos with EXIF)
2. Generate canonical name using EXIF + enrichment
3. Calculate drift score
4. IF drift > threshold:
   a. Update SmugMug album.Name
   b. Update Supabase photo_metadata.album_name for all photos with album_key
   c. Log sync operation
5. ELSE:
   Skip (name already canonical)
```

**Pros:**
- ✅ Both systems stay in sync
- ✅ Gallery UI always shows correct names
- ✅ No stale data

**Cons:**
- Requires database access
- Two API calls per album update

### Option 2: Supabase as Cache (Alternative)

**Workflow:**

```
1. Update SmugMug album names (canonical)
2. On next photo fetch, update Supabase album_name from SmugMug
3. Use album_key to re-sync stale data
```

**Pros:**
- Simpler update logic
- Eventually consistent

**Cons:**
- ❌ Temporary stale data in Supabase
- ❌ Requires album_key to be populated
- ❌ UI shows old names until next sync

**Recommendation:** Use **Option 1** for immediate consistency.

---

## Implementation

### 1. Create Sync Function

Create: `src/lib/supabase/album-sync.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Bypass RLS
);

/**
 * Update album name in Supabase for all photos in an album
 */
export async function syncAlbumNameToSupabase(
  albumKey: string,
  newAlbumName: string
): Promise<{ updated: number; errors: string[] }> {
  const errors: string[] = [];

  try {
    // Update all photos with this album_key
    const { data, error, count } = await supabase
      .from('photo_metadata')
      .update({
        album_name: newAlbumName,
        updated_at: new Date().toISOString()
      })
      .eq('album_key', albumKey)
      .select('photo_id', { count: 'exact' });

    if (error) {
      errors.push(`Supabase error: ${error.message}`);
      return { updated: 0, errors };
    }

    console.log(`✅ Synced album name to ${count || 0} photos in Supabase`);
    return { updated: count || 0, errors };

  } catch (err) {
    errors.push(`Exception: ${err}`);
    return { updated: 0, errors };
  }
}

/**
 * Verify sync status: check if album_name matches SmugMug
 */
export async function verifyAlbumSync(
  albumKey: string,
  expectedName: string
): Promise<{ synced: boolean; photoCount: number; issues: string[] }> {
  const { data, error } = await supabase
    .from('photo_metadata')
    .select('photo_id, album_name')
    .eq('album_key', albumKey);

  if (error) {
    return {
      synced: false,
      photoCount: 0,
      issues: [`Query error: ${error.message}`]
    };
  }

  const issues: string[] = [];
  const mismatchedPhotos = data?.filter(p => p.album_name !== expectedName) || [];

  if (mismatchedPhotos.length > 0) {
    issues.push(`${mismatchedPhotos.length} photos have stale album names`);
  }

  return {
    synced: mismatchedPhotos.length === 0,
    photoCount: data?.length || 0,
    issues
  };
}

/**
 * Batch sync: update multiple albums
 */
export async function batchSyncAlbums(
  albums: Array<{ albumKey: string; newName: string }>
): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const { albumKey, newName } of albums) {
    const result = await syncAlbumNameToSupabase(albumKey, newName);

    if (result.errors.length > 0) {
      failed++;
      errors.push(`${albumKey}: ${result.errors.join(', ')}`);
    } else {
      success++;
    }
  }

  return { success, failed, errors };
}
```

### 2. Integrate into Enrichment Pipeline

Update enrichment script to sync both systems:

```typescript
import { generateCanonicalNameFromSmugMug } from './src/lib/utils/canonical-album-naming';
import { syncAlbumNameToSupabase, verifyAlbumSync } from './src/lib/supabase/album-sync';
import { SmugMugClient } from './lib/smugmug-client'; // Your SmugMug API wrapper

async function processAlbumWithSync(albumKey: string) {
  // 1. Fetch album from SmugMug
  const smugmugClient = new SmugMugClient();
  const album = await smugmugClient.getAlbum(albumKey);
  const photos = await smugmugClient.getPhotos(albumKey);

  // 2. Get enrichment data (from Supabase or AI model)
  const enrichment = await getEnrichmentData(albumKey);

  // 3. Generate canonical name
  const result = generateCanonicalNameFromSmugMug({
    albumKey: album.AlbumKey,
    name: album.Name,
    dateStart: album.DateStart,
    dateEnd: album.DateEnd,
    keywords: album.Keywords,
    photos: photos.map(p => ({
      exif: { DateTimeOriginal: p.EXIF?.DateTimeOriginal }
    })),
    enrichment
  });

  console.log(`\n📁 Album: ${albumKey}`);
  console.log(`Existing: ${album.Name}`);
  console.log(`Proposed: ${result.name}`);
  console.log(`Drift Score: ${result.driftScore}/100`);

  // 4. Update if drift is significant
  if (result.driftScore && result.driftScore > 20) {
    try {
      // 4a. Update SmugMug
      console.log('🔄 Updating SmugMug...');
      await smugmugClient.updateAlbum(albumKey, {
        Name: result.name,
        Description: generateDescription(enrichment)
      });
      console.log('✅ SmugMug updated');

      // 4b. Update Supabase
      console.log('🔄 Syncing to Supabase...');
      const syncResult = await syncAlbumNameToSupabase(albumKey, result.name);

      if (syncResult.errors.length > 0) {
        console.error('❌ Supabase sync errors:', syncResult.errors);
        return { success: false, errors: syncResult.errors };
      }

      console.log(`✅ Supabase updated (${syncResult.updated} photos)`);

      // 4c. Verify sync
      const verification = await verifyAlbumSync(albumKey, result.name);
      if (!verification.synced) {
        console.warn('⚠️  Sync verification issues:', verification.issues);
      } else {
        console.log('✅ Sync verified');
      }

      return { success: true, updated: syncResult.updated };

    } catch (error) {
      console.error('❌ Update failed:', error);
      return { success: false, errors: [String(error)] };
    }
  } else {
    console.log('⏭️  Skipping (drift below threshold)');
    return { success: true, skipped: true };
  }
}

// Process all albums
async function syncAllAlbums() {
  const albumKeys = await getAllAlbumKeys(); // From SmugMug or Supabase

  for (const albumKey of albumKeys) {
    await processAlbumWithSync(albumKey);
    await sleep(1000); // Rate limiting
  }
}
```

### 3. Create Sync Verification Script

Create: `scripts/verify-album-sync.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { SmugMugClient } from '../lib/smugmug-client';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyAllAlbumsSync() {
  console.log('🔍 Verifying SmugMug ↔ Supabase sync...\n');

  // Get all unique album_keys from Supabase
  const { data: albums } = await supabase
    .from('photo_metadata')
    .select('album_key, album_name')
    .not('album_key', 'is', null);

  const uniqueAlbums = new Map<string, string>();
  albums?.forEach(a => {
    if (a.album_key && !uniqueAlbums.has(a.album_key)) {
      uniqueAlbums.set(a.album_key, a.album_name);
    }
  });

  console.log(`Found ${uniqueAlbums.size} albums in Supabase\n`);

  const smugmugClient = new SmugMugClient();
  const issues: Array<{ albumKey: string; issue: string }> = [];
  let synced = 0;

  for (const [albumKey, supabaseName] of uniqueAlbums.entries()) {
    try {
      // Fetch current name from SmugMug
      const album = await smugmugClient.getAlbum(albumKey);

      if (album.Name !== supabaseName) {
        issues.push({
          albumKey,
          issue: `Name mismatch: SmugMug="${album.Name}" vs Supabase="${supabaseName}"`
        });
      } else {
        synced++;
      }
    } catch (error) {
      issues.push({
        albumKey,
        issue: `Failed to fetch from SmugMug: ${error}`
      });
    }
  }

  console.log(`\n✅ Synced: ${synced}/${uniqueAlbums.size}`);
  console.log(`❌ Issues: ${issues.length}\n`);

  if (issues.length > 0) {
    console.log('Issues found:');
    issues.forEach(({ albumKey, issue }) => {
      console.log(`  ${albumKey}: ${issue}`);
    });
  }

  return { synced, total: uniqueAlbums.size, issues };
}

// Run verification
verifyAllAlbumsSync();
```

### 4. Add Migration to Populate album_key

If `album_key` is not populated in Supabase, create migration:

```sql
-- database/migrations/populate-album-keys.sql

-- Extract album_key from ImageUrl if not set
-- Assuming ImageUrl format: https://.../photos/{album_key}/{image_key}...
UPDATE photo_metadata
SET album_key = (
  SELECT regexp_replace(
    ImageUrl,
    '^https://[^/]+/photos/([^/]+)/.*$',
    '\1'
  )
)
WHERE album_key IS NULL AND ImageUrl IS NOT NULL;

-- Verify population
SELECT
  COUNT(*) FILTER (WHERE album_key IS NOT NULL) as with_album_key,
  COUNT(*) FILTER (WHERE album_key IS NULL) as without_album_key
FROM photo_metadata;
```

---

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Enrichment Pipeline                                         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
          ┌───────────────────────────────┐
          │ 1. Fetch Album from SmugMug   │
          │    - AlbumKey, Name, Photos   │
          │    - EXIF DateTimeOriginal    │
          └───────────────┬───────────────┘
                          │
                          ▼
          ┌───────────────────────────────┐
          │ 2. Generate Canonical Name    │
          │    - Use EXIF dates           │
          │    - Use AI enrichment        │
          │    - Calculate drift score    │
          └───────────────┬───────────────┘
                          │
                          ▼
                 ┌────────────────┐
                 │ Drift > 20?    │
                 └────┬───────┬───┘
                      │ YES   │ NO
                      │       └─────────> Skip
                      ▼
          ┌───────────────────────────────┐
          │ 3a. Update SmugMug Album      │
          │     album.Name = canonical    │
          └───────────────┬───────────────┘
                          │
                          ▼
          ┌───────────────────────────────┐
          │ 3b. Update Supabase Photos    │
          │     WHERE album_key = X       │
          │     SET album_name = canonical│
          └───────────────┬───────────────┘
                          │
                          ▼
          ┌───────────────────────────────┐
          │ 4. Verify Sync                │
          │    - Check all photos updated │
          │    - Log any mismatches       │
          └───────────────────────────────┘
```

---

## Testing Strategy

### 1. Unit Tests

```typescript
// Test sync function
describe('syncAlbumNameToSupabase', () => {
  it('should update all photos with album_key', async () => {
    const result = await syncAlbumNameToSupabase('test123', 'New Name - May 30');
    expect(result.updated).toBeGreaterThan(0);
    expect(result.errors).toHaveLength(0);
  });

  it('should handle non-existent album_key', async () => {
    const result = await syncAlbumNameToSupabase('nonexistent', 'New Name');
    expect(result.updated).toBe(0);
    expect(result.errors).toHaveLength(0); // Not an error, just no matches
  });
});
```

### 2. Integration Tests

```bash
# 1. Test single album sync
npx tsx scripts/sync-album.ts --album-key HtxsgN --verify

# 2. Verify sync status
npx tsx scripts/verify-album-sync.ts

# 3. Test batch sync (dry run)
npx tsx scripts/batch-sync-albums.ts --dry-run

# 4. Full sync with verification
npx tsx scripts/batch-sync-albums.ts --verify
```

### 3. Rollback Plan

If sync fails, rollback using audit log:

```sql
-- Create audit table
CREATE TABLE album_name_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_key text NOT NULL,
  old_name text,
  new_name text,
  changed_at timestamp DEFAULT now(),
  changed_by text
);

-- Track changes
INSERT INTO album_name_changes (album_key, old_name, new_name, changed_by)
VALUES ('HtxsgN', 'Old Name', 'New Name - May 30', 'enrichment-pipeline');

-- Rollback if needed
UPDATE photo_metadata
SET album_name = (
  SELECT old_name
  FROM album_name_changes
  WHERE album_key = photo_metadata.album_key
  ORDER BY changed_at DESC
  LIMIT 1
)
WHERE album_key IN (
  SELECT DISTINCT album_key
  FROM album_name_changes
  WHERE changed_at > '2025-10-28 10:00:00'
);
```

---

## Performance Considerations

### Batch Updates

For large albums (1000+ photos), use batch updates:

```typescript
async function syncAlbumNameBatch(
  albumKey: string,
  newName: string,
  batchSize: number = 100
): Promise<void> {
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('photo_metadata')
      .update({ album_name: newName })
      .eq('album_key', albumKey)
      .range(offset, offset + batchSize - 1);

    if (error) throw error;

    hasMore = data && data.length === batchSize;
    offset += batchSize;

    console.log(`Updated batch: ${offset} photos`);
  }
}
```

### Rate Limiting

Respect API rate limits:

```typescript
async function syncAllAlbumsWithRateLimit() {
  const albumKeys = await getAllAlbumKeys();
  const RATE_LIMIT_MS = 1000; // 1 request per second

  for (const albumKey of albumKeys) {
    await processAlbumWithSync(albumKey);
    await sleep(RATE_LIMIT_MS);
  }
}
```

---

## Monitoring

### Dashboard Metrics

Track sync health:

```sql
-- Sync status query
SELECT
  COUNT(DISTINCT album_key) as total_albums,
  COUNT(DISTINCT CASE WHEN updated_at > NOW() - INTERVAL '1 day' THEN album_key END) as recently_synced,
  COUNT(*) FILTER (WHERE album_name IS NULL) as missing_names
FROM photo_metadata
WHERE album_key IS NOT NULL;
```

### Alerts

Set up alerts for:
- Albums with NULL album_name
- High drift scores (> 60)
- Sync failures (errors in log)
- Stale data (updated_at > 7 days)

---

## Summary

**Dual Sync Strategy:**
1. ✅ Update SmugMug album name (source of truth)
2. ✅ Update Supabase photo_metadata.album_name (enriched data)
3. ✅ Verify sync status
4. ✅ Log changes for audit trail

**Key Files to Create:**
- `src/lib/supabase/album-sync.ts` - Sync functions
- `scripts/verify-album-sync.ts` - Verification script
- `scripts/batch-sync-albums.ts` - Batch processing
- `database/migrations/populate-album-keys.sql` - Ensure album_key exists

**Next Step:** Implement `album-sync.ts` and integrate into enrichment pipeline.
