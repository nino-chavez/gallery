# Database Views & Functions

This directory contains SQL views and functions for your Supabase database.

## albums_summary (Materialized View) ⭐ RECOMMENDED

**Purpose:** Pre-aggregated album metadata for instant retrieval. This is the **most performant** solution.

**Benefits:**
- ✅ Sub-millisecond query times (materialized = pre-computed)
- ✅ Removes 20K row fetch limit (was causing only 11 albums to show)
- ✅ Returns all albums regardless of total photo count
- ✅ Indexed for fast filtering by sport/category
- ✅ No external API calls needed

**Location:** `../views/albums_summary.sql`

### Installation

1. Navigate to your Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new
   ```

2. Copy and paste the entire contents of `../views/albums_summary.sql`

3. Click "Run" to execute

4. Verify installation:
   ```sql
   SELECT COUNT(*) FROM albums_summary;
   SELECT * FROM albums_summary LIMIT 5;
   ```

### Usage

The materialized view is automatically queried by `/albums` page server loader.

**Columns:**
- `album_key`: Unique album identifier
- `album_name`: Display name
- `photo_count`: Number of photos in album
- `cover_image_url`: URL for album cover (most recent photo)
- `sports`: Array of sports in album
- `categories`: Array of categories in album
- `portfolio_count`: Number of portfolio-worthy photos
- `avg_quality_score`: Average quality score (rounded to 2 decimals)
- `primary_sport`: Most common sport
- `primary_category`: Most common category
- `last_photo_date`: Most recent upload date
- `last_enriched_at`: Most recent enrichment timestamp

### Refreshing the View

The view needs to be refreshed after bulk photo uploads/updates:

```sql
-- Manual refresh
REFRESH MATERIALIZED VIEW CONCURRENTLY albums_summary;

-- Or use the helper function
SELECT refresh_albums_summary();
```

**When to refresh:**
- After uploading new photos
- After enriching photos with metadata
- After updating album information
- Recommended: Set up a cron job or trigger

### Performance

**Query time:** <5ms for 200+ albums (vs 2000ms+ with on-the-fly aggregation)

**Space:** ~50KB for 200 albums (negligible)

**Indexes:**
- `album_key` (primary lookups)
- `photo_count DESC` (sorting)
- `primary_sport` (filtering)
- `primary_category` (filtering)

---

## Alternative: get_albums_with_metadata (Function)

**Status:** Deprecated in favor of materialized view

This function performs on-the-fly aggregation. While functional, it's slower than the materialized view approach.

**When to use:** Only if you need real-time data without refresh delays

**Location:** `get_albums_with_metadata.sql`
