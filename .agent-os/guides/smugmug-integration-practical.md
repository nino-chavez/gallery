# SmugMug API - Practical Integration Guide

**Purpose:** Hands-on guide for using SmugMug API with working code examples

**Related:** [smugmug-api.md](./smugmug-api.md) - Comprehensive API reference

---

## Quick Start

### 1. Environment Setup

Create `.env` file with your SmugMug credentials:

```bash
SMUGMUG_API_KEY=your_api_key_here
SMUGMUG_API_SECRET=your_api_secret_here
SMUGMUG_ACCESS_TOKEN=your_access_token_here
SMUGMUG_ACCESS_TOKEN_SECRET=your_access_token_secret_here
```

**Where to get credentials:**
1. Go to https://api.smugmug.com/api/developer/apply
2. Create an application
3. Generate OAuth 1.0a tokens

### 2. Basic Usage

```typescript
import { SmugMugClient } from '$lib/smugmug/client';

// Initialize (reads env vars automatically)
const client = new SmugMugClient();

// Get album
const album = await client.getAlbum('albumKey');
console.log(album.Name);

// Update album
await client.updateAlbum('albumKey', {
  Name: 'New Album Name'
});
```

---

## Common Use Cases

### Get Album with EXIF Data

**Use case:** Need photo dates for canonical naming

```typescript
import {
  SmugMugClient,
  extractDateRange,
  formatCanonicalDate
} from '$lib/smugmug/client';

const client = new SmugMugClient();

// Fetch album with EXIF (rate limited automatically)
const { album, photos } = await client.getAlbumWithExif('HtxsgN', {
  maxPhotos: 10, // Optional: limit for testing
  onProgress: (current, total) => {
    console.log(`Progress: ${current}/${total}`);
  }
});

// Extract dates from EXIF
const { earliest, latest } = extractDateRange(photos);
console.log(`Date range: ${earliest} to ${latest}`);

// Format for canonical naming
const canonicalDate = formatCanonicalDate(earliest, latest);
// "May 30" or "May 2025"
```

### Update Album Name

**Use case:** Apply canonical naming to albums

```typescript
import { SmugMugClient } from '$lib/smugmug/client';

const client = new SmugMugClient();

// Get current album
const album = await client.getAlbum('HtxsgN');
console.log(`Current: ${album.Name}`);

// Update name
const updated = await client.updateAlbum('HtxsgN', {
  Name: 'ACC Boys Golf Tourney - Sep 12',
  Description: 'High school golf tournament at Aurora Central Catholic'
});

console.log(`Updated: ${updated.Name}`);
```

### Search and Filter Albums

**Use case:** Find albums that need updating

```typescript
import { SmugMugClient } from '$lib/smugmug/client';

const client = new SmugMugClient();

// Search by name
const volleyballAlbums = await client.searchAlbums('volleyball');

// Filter by criteria
const needsUpdate = volleyballAlbums.filter(album => {
  // Find albums with old naming format
  return album.Name.includes('HS VB -') || album.Name.match(/^\d{4}/);
});

console.log(`Found ${needsUpdate.length} albums to update`);
```

### Batch Process Albums

**Use case:** Update multiple albums

```typescript
import { SmugMugClient } from '$lib/smugmug/client';

const client = new SmugMugClient();

const albumKeys = ['HtxsgN', 'abc123', 'def456'];

for (const key of albumKeys) {
  try {
    // Get album with EXIF
    const { album, photos } = await client.getAlbumWithExif(key, {
      maxPhotos: 5
    });

    // Generate canonical name
    const { earliest, latest } = extractDateRange(photos);
    const canonicalDate = formatCanonicalDate(earliest, latest);

    // Extract event name (simplified)
    const eventName = album.Name
      .replace(/^(HS VB -|College -)\s*/, '')
      .replace(/\d{4}-\d{2}-\d{2}/, '')
      .trim();

    const newName = `${eventName} - ${canonicalDate}`;

    console.log(`${album.Name} → ${newName}`);

    // Update (uncomment to apply)
    // await client.updateAlbum(key, { Name: newName });

  } catch (error) {
    console.error(`Failed to process ${key}:`, error);
  }

  // Rate limiting: wait 1 second between albums
  await new Promise(resolve => setTimeout(resolve, 1000));
}
```

---

## Integration with Supabase

### Sync Album Names

**Use case:** Keep SmugMug and Supabase in sync

```typescript
import { SmugMugClient } from '$lib/smugmug/client';
import { syncAlbumNameToSupabase } from '$lib/supabase/album-sync';

const client = new SmugMugClient();

async function syncAlbumName(albumKey: string) {
  // 1. Get album from SmugMug
  const album = await client.getAlbum(albumKey);

  // 2. Update Supabase
  await syncAlbumNameToSupabase(albumKey, album.Name);

  console.log(`✅ Synced: ${album.Name}`);
}

// Sync specific album
await syncAlbumName('HtxsgN');
```

### Full Sync Workflow

**Use case:** Update SmugMug name, then sync to Supabase

```typescript
import { SmugMugClient, extractDateRange, formatCanonicalDate } from '$lib/smugmug/client';
import { syncAlbumNameToSupabase } from '$lib/supabase/album-sync';

const client = new SmugMugClient();

async function updateAndSync(albumKey: string) {
  // 1. Fetch album with EXIF
  const { album, photos } = await client.getAlbumWithExif(albumKey);

  // 2. Generate canonical name
  const { earliest, latest } = extractDateRange(photos);
  const canonicalDate = formatCanonicalDate(earliest, latest);

  // Parse event name (your logic here)
  const eventName = parseEventName(album.Name);
  const newName = `${eventName} - ${canonicalDate}`;

  // 3. Update SmugMug
  await client.updateAlbum(albumKey, { Name: newName });
  console.log(`✅ Updated SmugMug: ${newName}`);

  // 4. Sync to Supabase
  await syncAlbumNameToSupabase(albumKey, newName);
  console.log(`✅ Synced to Supabase`);
}

function parseEventName(currentName: string): string {
  // Remove prefixes and dates
  return currentName
    .replace(/^(HS VB -|College -)\s*/, '')
    .replace(/\d{4}-\d{2}-\d{2}/, '')
    .trim();
}
```

---

## Testing & Debugging

### Test Connection

```typescript
import { SmugMugClient } from '$lib/smugmug/client';

async function testConnection() {
  try {
    const client = new SmugMugClient();
    const user = await client.getAuthUser();

    console.log('✅ SmugMug connection successful');
    console.log(`User: ${user.Name}`);
    console.log(`Nickname: ${user.NickName}`);
  } catch (error) {
    console.error('❌ SmugMug connection failed:', error);
    console.log('\nCheck your environment variables:');
    console.log('  - SMUGMUG_API_KEY');
    console.log('  - SMUGMUG_API_SECRET');
    console.log('  - SMUGMUG_ACCESS_TOKEN');
    console.log('  - SMUGMUG_ACCESS_TOKEN_SECRET');
  }
}

testConnection();
```

### Verify Album Access

```typescript
import { SmugMugClient } from '$lib/smugmug/client';

async function verifyAlbum(albumKey: string) {
  try {
    const client = new SmugMugClient();
    const album = await client.getAlbum(albumKey);

    console.log('✅ Album accessible');
    console.log(`Name: ${album.Name}`);
    console.log(`Photos: ${album.ImageCount}`);
  } catch (error) {
    console.error('❌ Cannot access album:', error);
  }
}

verifyAlbum('HtxsgN');
```

---

## Example Scripts

Run the example scripts to see the API in action:

```bash
# Show usage
npx tsx scripts/smugmug-examples.ts

# Get album details
npx tsx scripts/smugmug-examples.ts 1

# Get photos with EXIF
npx tsx scripts/smugmug-examples.ts 2

# Search albums
npx tsx scripts/smugmug-examples.ts 4

# Get all albums
npx tsx scripts/smugmug-examples.ts 5

# Generate canonical name
npx tsx scripts/smugmug-examples.ts 6
```

**Script location:** `scripts/smugmug-examples.ts`

---

## Error Handling

### Handle Rate Limits

```typescript
try {
  const { album, photos } = await client.getAlbumWithExif(albumKey);
} catch (error) {
  if (error.message.includes('429')) {
    console.log('Rate limited, waiting 60 seconds...');
    await new Promise(resolve => setTimeout(resolve, 60000));
    // Retry
    const { album, photos } = await client.getAlbumWithExif(albumKey);
  } else {
    throw error;
  }
}
```

### Handle Missing EXIF

```typescript
const { album, photos } = await client.getAlbumWithExif(albumKey);

// Filter photos with EXIF
const photosWithDates = photos.filter(p => p.EXIF?.DateTimeOriginal);

if (photosWithDates.length === 0) {
  console.warn('No photos have EXIF date data');
  // Fall back to album dates or manual entry
}
```

---

## Best Practices

### 1. Always Use Rate Limiting

The client has built-in rate limiting (5 req/sec), but add delays between albums:

```typescript
for (const album of albums) {
  await processAlbum(album);
  await new Promise(resolve => setTimeout(resolve, 1000));
}
```

### 2. Progress Tracking

For long operations, show progress:

```typescript
const { album, photos } = await client.getAlbumWithExif(albumKey, {
  onProgress: (current, total) => {
    process.stdout.write(`\rFetching: ${current}/${total}`);
  }
});

console.log('\n✅ Complete');
```

### 3. Dry Run Mode

Test changes before applying:

```typescript
const DRY_RUN = process.env.DRY_RUN === 'true';

if (DRY_RUN) {
  console.log(`Would update: ${album.Name} → ${newName}`);
} else {
  await client.updateAlbum(albumKey, { Name: newName });
  console.log(`✅ Updated: ${newName}`);
}
```

### 4. Error Recovery

Log errors but continue processing:

```typescript
const results = {
  success: 0,
  failed: 0,
  errors: [] as string[]
};

for (const key of albumKeys) {
  try {
    await processAlbum(key);
    results.success++;
  } catch (error) {
    results.failed++;
    results.errors.push(`${key}: ${error.message}`);
  }
}

console.log('\nResults:');
console.log(`  Success: ${results.success}`);
console.log(`  Failed: ${results.failed}`);
if (results.errors.length > 0) {
  console.log('\nErrors:');
  results.errors.forEach(err => console.log(`  - ${err}`));
}
```

---

## Troubleshooting

### Issue: "Missing SmugMug API credentials"

**Solution:** Check `.env` file has all 4 required variables:
```bash
SMUGMUG_API_KEY=...
SMUGMUG_API_SECRET=...
SMUGMUG_ACCESS_TOKEN=...
SMUGMUG_ACCESS_TOKEN_SECRET=...
```

### Issue: "SmugMug API error (401): Unauthorized"

**Solution:**
- Verify tokens are correct
- Check if tokens have expired
- Regenerate tokens at https://api.smugmug.com

### Issue: "SmugMug API error (429): Too Many Requests"

**Solution:**
- Rate limit is 5 requests/second
- Client has built-in rate limiting
- Add delays between batch operations
- Wait 60 seconds before retrying

### Issue: No EXIF data returned

**Solution:**
- Must use `?_expand=ImageMetadata` in request
- Use `getPhotoWithExif()` or `getAlbumWithExif()`
- Some photos may not have EXIF data

---

## Related Documentation

- `src/lib/smugmug/client.ts` - Client implementation
- `scripts/smugmug-examples.ts` - Working examples
- `.agent-os/guides/smugmug-api.md` - Comprehensive API reference
- `.agent-os/implementation/DUAL_SYNC_STRATEGY.md` - SmugMug ↔ Supabase sync

---

**Version:** 1.0
**Last Updated:** 2025-10-28
**Maintained By:** Agent-OS
