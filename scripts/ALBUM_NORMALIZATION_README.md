# Album Name Normalization Workflow

This workflow normalizes album names across SmugMug and Supabase using consistent canonical naming conventions.

## Overview

**Problem:** Album names are inconsistent across SmugMug, making them hard to scan and search.

**Solution:** Generate canonical names using:
- EXIF date data from photos (most reliable)
- SmugMug album metadata
- AI-enriched team/event data
- Existing name parsing (fallback)

**Format:** `[Event/Teams] - [Date]`
- Single day: `Team A vs Team B - May 30`
- Multi-day: `Tournament Name - May 2024`
- Character limit: 35-45 chars (optimal for mobile scanning)

## Infrastructure

### Modules

1. **[src/lib/smugmug/client.ts](../src/lib/smugmug/client.ts)**
   - SmugMug API client with OAuth 1.0a authentication
   - Methods: `getAlbum()`, `updateAlbum()`, `getAllAlbums()`, `getAlbumPhotos()`

2. **[src/lib/utils/canonical-album-naming.ts](../src/lib/utils/canonical-album-naming.ts)**
   - Canonical name generation logic
   - EXIF date extraction
   - Drift score calculation (0-100: how different from existing name)

3. **[src/lib/supabase/album-sync.ts](../src/lib/supabase/album-sync.ts)**
   - Syncs album names from SmugMug to Supabase `photo_metadata` table
   - Updates all photos with matching `album_key`

### Scripts

1. **[normalize-all-album-names.ts](./normalize-all-album-names.ts)** - Main normalization script
2. **[analyze-album-drift.ts](./analyze-album-drift.ts)** - Generate drift analysis report

## Workflow Steps

### Step 1: Analyze Drift (Optional but Recommended)

Generate a report showing which albums need normalization:

```bash
# CSV report (can open in Excel/Numbers)
npx tsx scripts/analyze-album-drift.ts > album-drift-report.csv

# JSON report (for programmatic processing)
npx tsx scripts/analyze-album-drift.ts --json > album-drift-report.json
```

**Report Columns:**
- `AlbumKey` - SmugMug album identifier
- `DriftScore` - 0-100 (higher = more changes needed)
- `Confidence` - high/medium/low (data quality)
- `DateSource` - exif/album_field/inferred/fallback
- `ExistingName` - Current album name
- `ProposedName` - Canonical name that would be applied

**Review the report:**
- Albums with drift >= 20: Significant changes (review before applying)
- Albums with drift >= 10: Moderate changes
- Albums with drift < 10: Minor or no changes

### Step 2: Dry Run (Required First Step)

**Always do a dry run first to preview changes:**

```bash
# Test on first 5 albums
DRY_RUN=true TEST_LIMIT=5 npx tsx scripts/normalize-all-album-names.ts

# Test on first 20 albums
DRY_RUN=true TEST_LIMIT=20 npx tsx scripts/normalize-all-album-names.ts

# Full dry run (all albums, preview only)
DRY_RUN=true npx tsx scripts/normalize-all-album-names.ts
```

**Review the output:**
- Check proposed names look correct
- Verify drift scores match expectations
- Confirm Supabase photo counts are correct

### Step 3: Apply Changes

**Option A: Incremental Updates (Recommended)**

Start with high-drift albums first:

```bash
# Update albums with drift >= 30 (most significant changes)
MIN_DRIFT_SCORE=30 npx tsx scripts/normalize-all-album-names.ts

# Update albums with drift >= 20
MIN_DRIFT_SCORE=20 npx tsx scripts/normalize-all-album-names.ts

# Update albums with drift >= 10
MIN_DRIFT_SCORE=10 npx tsx scripts/normalize-all-album-names.ts
```

**Option B: Full Update**

```bash
# Update all albums with any drift
MIN_DRIFT_SCORE=5 npx tsx scripts/normalize-all-album-names.ts

# Or update everything (even 0 drift, useful for sync)
MIN_DRIFT_SCORE=0 npx tsx scripts/normalize-all-album-names.ts
```

**Option C: Test Batch**

```bash
# Update first 10 albums only
TEST_LIMIT=10 npx tsx scripts/normalize-all-album-names.ts
```

### Step 4: Verify Changes

```bash
# Check Supabase sync status
npx tsx scripts/verify-album-sync.ts

# Re-run drift analysis to confirm changes
npx tsx scripts/analyze-album-drift.ts > album-drift-after.csv
```

## Environment Variables

### Required

```bash
# SmugMug OAuth credentials
SMUGMUG_API_KEY=your_api_key
SMUGMUG_API_SECRET=your_api_secret
SMUGMUG_ACCESS_TOKEN=your_access_token
SMUGMUG_ACCESS_TOKEN_SECRET=your_access_token_secret

# Supabase (for sync)
VITE_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Optional

```bash
# Dry run mode (preview only, no updates)
DRY_RUN=true

# Test limit (process only first N albums)
TEST_LIMIT=10

# Minimum drift score to trigger update
MIN_DRIFT_SCORE=10  # Default: 10

# Skip SmugMug updates (only sync to Supabase)
SKIP_SMUGMUG=true
```

## Rate Limiting

The script includes automatic rate limiting:
- 500ms delay between API calls
- Pagination for large album collections
- Graceful error handling

**Estimated runtime:**
- 296 albums × 500ms = ~2.5 minutes
- Plus API request time: ~5-10 minutes total

## Understanding Drift Scores

**Drift Score Components:**

1. **Length difference** (up to 20 points)
   - Significant length changes indicate structural modifications

2. **Prefix removal** (15 points)
   - Removing redundant prefixes like "HS VB", "College"

3. **Date format changes** (10-15 points)
   - ISO dates → readable format (2025-05-30 → May 30)
   - Year only → month + year

4. **Text similarity** (up to 40 points)
   - Levenshtein distance for semantic changes

**Example Drift Scores:**

- **0 points**: Identical names (no change needed)
- **5-10 points**: Minor formatting (date style, spacing)
- **10-20 points**: Moderate changes (prefix removal, date enhancement)
- **20-40 points**: Significant restructuring
- **40+ points**: Major changes (team extraction, event parsing)

## Troubleshooting

### "No albums found"
- Check SmugMug API credentials in `.env.local`
- Verify tokens haven't expired
- Run `npx tsx scripts/test-smugmug-connection.ts`

### "Supabase sync failed"
- Check `SUPABASE_SERVICE_ROLE_KEY` (not anon key)
- Verify `album_key` column exists in `photo_metadata` table
- Check RLS policies aren't blocking service role

### "Drift scores all 0"
- Albums already have canonical names ✅
- Re-run with `MIN_DRIFT_SCORE=0` to force sync

### "Proposed names truncated"
- Long team/event names exceed 45 char limit
- Truncation is intentional for mobile UX
- Review `.agent-os/CANONICAL_NAMING_STRATEGY.md` for details

## Related Documentation

- [Canonical Naming Strategy](../.agent-os/CANONICAL_NAMING_STRATEGY.md)
- [Album Sync Module](../src/lib/supabase/album-sync.ts)
- [SmugMug API Client](../src/lib/smugmug/client.ts)

## Rollback

If you need to revert changes:

```bash
# SmugMug: Manual revert via SmugMug web UI
# (No automated rollback for SmugMug album names)

# Supabase: Can re-sync from SmugMug
SKIP_SMUGMUG=true npx tsx scripts/normalize-all-album-names.ts
```

**Note:** Keep the drift report CSV as a backup of original names.

## Success Criteria

✅ **After normalization:**
- Drift scores < 10 for most albums
- Album names follow consistent format
- Supabase `album_name` matches SmugMug
- Mobile scanning experience improved (35-45 char optimal length)
