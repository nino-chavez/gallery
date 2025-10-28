# Timeline View Setup Guide

## Problem

The timeline page was only showing 2025 photos because it was fetching 500-1000 photos at a time, and with 4,164 photos from 2025, it never got past 2025 to show historical data.

## Solution

Create a database view that pre-computes the timeline structure (year-month aggregations with photo counts) so the timeline page can:
1. **Scaffold efficiently** - Load just the metadata, not thousands of photos
2. **Show all years** - Know which months exist across all years instantly
3. **Power the scrubber** - Get photo counts per month for visualization
4. **Enable smart filters** - Show sport/category breakdowns per month

## Apply the Migration

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project SQL Editor:
   https://supabase.com/dashboard/project/skywzpcekhntecegyjoj/sql

2. Copy the entire contents of [`database/timeline-metadata-view.sql`](./database/timeline-metadata-view.sql)

3. Paste into the SQL Editor and click **Run**

4. Verify it worked:
   ```sql
   SELECT year, month, photo_count
   FROM timeline_months
   ORDER BY year DESC, month DESC
   LIMIT 10;
   ```

### Option 2: Command Line (if you have DB password)

```bash
# Set your database password
export SUPABASE_DB_PASSWORD="your-db-password"

# Run the script
chmod +x scripts/apply-view.sh
SUPABASE_DB_URL="postgresql://postgres:$SUPABASE_DB_PASSWORD@db.skywzpcekhntecegyjoj.supabase.co:5432/postgres" \
  ./scripts/apply-view.sh
```

## What the View Does

The `timeline_months` view aggregates the ~20K photos into ~50-100 month records:

```sql
SELECT * FROM timeline_months LIMIT 1;
```

Returns:
```
month_start     | 2025-10-01
year            | 2025
month           | 10
photo_count     | 1234
sport_counts    | {"volleyball": 800, "basketball": 300, ...}
category_counts | {"action": 900, "celebration": 200, ...}
first_photo_date| 2025-10-01T...
last_photo_date | 2025-10-31T...
avg_sharpness   | 87.50
portfolio_count | 456
```

## Benefits

**Before:**
- Fetch 500-1000 photos per page load
- Group photos client-side to find months
- Only see recent months (never got past 2025)
- Slow scrubber (needs all photo data)

**After:**
- Fetch ~50-100 month records (1-2KB vs 500KB+)
- Years/months pre-computed
- See entire timeline history instantly
- Fast scrubber (uses pre-computed counts)

## Next Steps

After creating the view:

1. **Update timeline page** - Modify `src/routes/timeline/+page.server.ts` to:
   - Query `timeline_months` view first to get structure
   - Then fetch photos only for the months being displayed
   - Use month boundaries for efficient pagination

2. **Update scrubber** - Modify scrubber component to query `timeline_months` directly

3. **Update filters** - Use `sport_counts` and `category_counts` JSONB fields

## Verification

After applying, verify data looks correct:

```sql
-- Check year distribution
SELECT year, SUM(photo_count) as total
FROM timeline_months
GROUP BY year
ORDER BY year DESC;

-- Should show:
--   2025: 4,164
--   2024: 3,536
--   2023: 8,258
--   2022: 3,948

-- Check sport breakdowns for a month
SELECT
  year, month,
  sport_counts->>'volleyball' as volleyball,
  sport_counts->>'basketball' as basketball
FROM timeline_months
WHERE year = 2024 AND month = 10;
```

## Maintenance

The view is automatically updated as photos are added/removed since it's a regular view (not materialized). For production, consider creating a materialized view (see commented section in SQL file) and refreshing it periodically.
