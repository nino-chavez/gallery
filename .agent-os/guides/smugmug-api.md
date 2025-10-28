# SmugMug API Integration Guide

**Purpose:** Reference for SmugMug API patterns in this project. Avoid hallucinating new API approaches.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Common Endpoints](#common-endpoints)
3. [Photo EXIF Data](#photo-exif-data)
4. [Album Operations](#album-operations)
5. [Rate Limiting](#rate-limiting)
6. [Error Handling](#error-handling)

---

## Authentication

### OAuth 1.0a Pattern

**DO NOT** use OAuth 2.0 or bearer tokens. SmugMug uses OAuth 1.0a.

```typescript
// src/lib/smugmug/client.ts
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

const oauth = OAuth({
  consumer: {
    key: process.env.SMUGMUG_API_KEY!,
    secret: process.env.SMUGMUG_API_SECRET!
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto
      .createHmac('sha1', key)
      .update(base_string)
      .digest('base64');
  }
});

const token = {
  key: process.env.SMUGMUG_ACCESS_TOKEN!,
  secret: process.env.SMUGMUG_ACCESS_TOKEN_SECRET!
};

export class SmugMugClient {
  private baseUrl = 'https://api.smugmug.com';

  async request(method: string, endpoint: string, data?: any) {
    const requestData = {
      url: `${this.baseUrl}${endpoint}`,
      method
    };

    const headers = oauth.toHeader(oauth.authorize(requestData, token));
    headers['Accept'] = 'application/json';

    const response = await fetch(requestData.url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      throw new Error(`SmugMug API error: ${response.statusText}`);
    }

    return response.json();
  }
}
```

---

## Common Endpoints

### Get User Info

```typescript
async getUser() {
  const data = await this.request('GET', '/api/v2!authuser');
  return data.Response.User;
}
```

### List Albums

```typescript
async getAlbums() {
  const user = await this.getUser();
  const data = await this.request('GET', user.Uris.UserAlbums.Uri);
  return data.Response.Album;
}
```

### Get Album Details

```typescript
async getAlbum(albumKey: string) {
  const data = await this.request('GET', `/api/v2/album/${albumKey}`);
  return data.Response.Album;
}
```

### Get Album Images

```typescript
async getAlbumImages(albumKey: string) {
  const data = await this.request(
    'GET',
    `/api/v2/album/${albumKey}!images`
  );
  return data.Response.AlbumImage;
}
```

---

## Photo EXIF Data

### Fetch Photo with EXIF

**Critical:** Must explicitly request EXIF expansion.

```typescript
async getPhotoWithExif(imageKey: string) {
  // MUST include ?_expand=ImageMetadata to get EXIF
  const data = await this.request(
    'GET',
    `/api/v2/image/${imageKey}?_expand=ImageMetadata`
  );

  return {
    photo: data.Response.Image,
    exif: data.Response.ImageMetadata
  };
}
```

### EXIF Data Structure

```typescript
interface SmugMugEXIF {
  DateTimeOriginal?: string;  // "YYYY:MM:DD HH:MM:SS"
  Make?: string;              // Camera make
  Model?: string;             // Camera model
  LensModel?: string;         // Lens
  ISO?: number;               // ISO speed
  FocalLength?: string;       // "85mm"
  Aperture?: string;          // "f/1.8"
  ShutterSpeed?: string;      // "1/200"
}
```

### Extract Date from EXIF

```typescript
function extractExifDate(exif: SmugMugEXIF): string | undefined {
  if (!exif.DateTimeOriginal) return undefined;

  // SmugMug format: "2025:05:30 18:15:23"
  // Convert to ISO: "2025-05-30"
  const [datePart] = exif.DateTimeOriginal.split(' ');
  return datePart.replace(/:/g, '-');
}
```

---

## Album Operations

### Get Album with All Photos and EXIF

```typescript
async getAlbumComplete(albumKey: string) {
  // 1. Get album metadata
  const album = await this.getAlbum(albumKey);

  // 2. Get all images in album
  const images = await this.getAlbumImages(albumKey);

  // 3. Fetch EXIF for each image (with rate limiting!)
  const photosWithExif = [];

  for (const image of images) {
    const { photo, exif } = await this.getPhotoWithExif(image.ImageKey);
    photosWithExif.push({
      imageKey: image.ImageKey,
      url: photo.ArchivedUri,
      exif
    });

    // Rate limiting: 1 request per second
    await sleep(1000);
  }

  return {
    albumKey: album.AlbumKey,
    name: album.Name,
    description: album.Description,
    keywords: album.Keywords,
    photos: photosWithExif
  };
}
```

### Update Album Name

```typescript
async updateAlbum(albumKey: string, updates: {
  Name?: string;
  Description?: string;
  Keywords?: string[];
}) {
  const data = await this.request(
    'PATCH',
    `/api/v2/album/${albumKey}`,
    updates
  );

  return data.Response.Album;
}
```

### Update Album Keywords

```typescript
async updateAlbumKeywords(albumKey: string, keywords: string[]) {
  // SmugMug expects semicolon-separated string
  const keywordString = keywords.join(';');

  return this.updateAlbum(albumKey, {
    Keywords: keywordString
  });
}
```

---

## Rate Limiting

### SmugMug Rate Limits

- **Standard:** 5 requests per second
- **Burst:** 10 requests per second (short bursts)
- **Daily:** No documented limit, but be respectful

### Rate Limiting Pattern

```typescript
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private requestsPerSecond = 5;
  private interval = 1000 / this.requestsPerSecond;

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.process();
    });
  }

  private async process() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const fn = this.queue.shift()!;
      await fn();
      await sleep(this.interval);
    }

    this.processing = false;
  }
}

// Usage
const rateLimiter = new RateLimiter();

async function fetchMultipleAlbums(albumKeys: string[]) {
  const results = await Promise.all(
    albumKeys.map(key =>
      rateLimiter.add(() => client.getAlbum(key))
    )
  );

  return results;
}
```

---

## Error Handling

### Standard Pattern

```typescript
try {
  const album = await client.getAlbum(albumKey);
  return album;
} catch (error) {
  if (error.response?.status === 404) {
    console.error(`Album not found: ${albumKey}`);
    return null;
  }

  if (error.response?.status === 429) {
    console.error('Rate limit exceeded, waiting...');
    await sleep(60000); // Wait 1 minute
    return client.getAlbum(albumKey); // Retry
  }

  console.error('SmugMug API error:', error);
  throw error;
}
```

### Retry with Exponential Backoff

```typescript
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = i === retries - 1;

      if (isLastAttempt) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, i);
      console.warn(`Request failed, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  throw new Error('Should not reach here');
}
```

---

## Common Patterns

### Sync Album Name to SmugMug

```typescript
import { generateCanonicalNameFromSmugMug } from '$lib/utils/canonical-album-naming';
import { syncAlbumNameToSupabase } from '$lib/supabase/album-sync';

async function syncAlbumName(albumKey: string) {
  // 1. Fetch album from SmugMug
  const album = await client.getAlbumComplete(albumKey);

  // 2. Generate canonical name
  const result = generateCanonicalNameFromSmugMug({
    albumKey: album.albumKey,
    name: album.name,
    photos: album.photos.map(p => ({
      exif: p.exif
    }))
  });

  // 3. Update SmugMug if needed
  if (result.driftScore && result.driftScore > 20) {
    await client.updateAlbum(albumKey, {
      Name: result.name
    });

    // 4. Sync to Supabase
    await syncAlbumNameToSupabase(albumKey, result.name);
  }
}
```

### Batch Process Albums

```typescript
async function processAllAlbums() {
  const albums = await client.getAlbums();

  for (const album of albums) {
    console.log(`Processing: ${album.Name}`);

    try {
      await syncAlbumName(album.AlbumKey);
      console.log('✅ Synced');
    } catch (error) {
      console.error('❌ Failed:', error);
      // Continue with next album
    }

    // Rate limiting
    await sleep(1000);
  }
}
```

---

## Common Mistakes to Avoid

### ❌ Missing EXIF Expansion

```typescript
// WRONG: No EXIF data
const photo = await client.request('GET', `/api/v2/image/${imageKey}`);
console.log(photo.DateTimeOriginal); // undefined!
```

**Fix:**
```typescript
// CORRECT: Request EXIF expansion
const photo = await client.request(
  'GET',
  `/api/v2/image/${imageKey}?_expand=ImageMetadata`
);
console.log(photo.ImageMetadata.DateTimeOriginal); // "2025:05:30 18:15:23"
```

### ❌ No Rate Limiting

```typescript
// WRONG: Hammers API
const photos = await Promise.all(
  imageKeys.map(key => client.getPhotoWithExif(key))
);
// Result: 429 Rate Limit errors
```

**Fix:**
```typescript
// CORRECT: Rate limited
const photos = [];
for (const key of imageKeys) {
  const photo = await client.getPhotoWithExif(key);
  photos.push(photo);
  await sleep(200); // 5 requests/second
}
```

### ❌ Using OAuth 2.0

```typescript
// WRONG: SmugMug doesn't use OAuth 2.0
const headers = {
  'Authorization': `Bearer ${token}`
};
```

**Fix:**
```typescript
// CORRECT: Use OAuth 1.0a
const oauth = OAuth({ /* OAuth 1.0a config */ });
const headers = oauth.toHeader(oauth.authorize(requestData, token));
```

---

## Testing

### Mock Client for Tests

```typescript
// tests/mocks/smugmug-client.ts
export class MockSmugMugClient {
  async getAlbum(albumKey: string) {
    return {
      AlbumKey: albumKey,
      Name: 'Test Album',
      Description: 'Test Description'
    };
  }

  async getAlbumImages(albumKey: string) {
    return [
      { ImageKey: 'img1' },
      { ImageKey: 'img2' }
    ];
  }
}
```

---

## Environment Variables

Required env vars:

```bash
SMUGMUG_API_KEY=your_api_key
SMUGMUG_API_SECRET=your_api_secret
SMUGMUG_ACCESS_TOKEN=your_access_token
SMUGMUG_ACCESS_TOKEN_SECRET=your_access_token_secret
```

---

## Related Documentation

- [SmugMug API Docs](https://api.smugmug.com/api/v2/doc)
- `src/lib/smugmug/` - SmugMug client implementation (when created)
- `.agent-os/implementation/DUAL_SYNC_STRATEGY.md` - Album sync workflow

---

**Version:** 1.0
**Last Updated:** 2025-10-28
**Maintained By:** Agent-OS
