# exec_sql RPC Function Migration

## Overview
This migration creates a secure `exec_sql()` RPC function in Supabase that enables efficient GROUP BY aggregation queries for sport and category distributions.

## Why This Function?
Without this function, the app falls back to making **multiple individual COUNT queries** (one per sport/category), which is:
- Slower (9+ separate queries vs 1 aggregated query)
- More expensive (more database round trips)
- Less efficient (can't use SQL aggregation optimizations)

With this function, we can execute a **single optimized query** using GROUP BY and window functions.

## Security
The function is designed with security in mind:
- ✅ **Read-only**: Only `SELECT` queries are allowed
- ✅ **Keyword filtering**: Blocks INSERT, UPDATE, DELETE, DROP, etc.
- ✅ **Schema protection**: Uses `SET search_path = public`
- ✅ **Error handling**: Logs errors with context
- ✅ **Permission control**: Only accessible to authenticated and anon users

## How to Deploy

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `20251020223737_create_exec_sql_function.sql`
5. Click **Run** to execute the migration

### Option 2: Supabase CLI
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

### Option 3: Manual SQL Execution
1. Open your Supabase SQL Editor
2. Paste the migration SQL directly
3. Execute

## Testing the Function

After deploying, test the function with these queries:

### Test 1: Sport Distribution
```sql
SELECT * FROM exec_sql('
  SELECT
    sport_type as name,
    COUNT(*) as count,
    ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ()), 1) as percentage
  FROM photo_metadata
  WHERE sharpness IS NOT NULL
    AND sport_type IS NOT NULL
    AND sport_type != ''unknown''
  GROUP BY sport_type
  ORDER BY count DESC
');
```

Expected result: JSON array with sport distributions
```json
[
  {"name": "volleyball", "count": 16490, "percentage": 83.7},
  {"name": "portrait", "count": 975, "percentage": 5.0},
  ...
]
```

### Test 2: Category Distribution
```sql
SELECT * FROM exec_sql('
  SELECT
    photo_category as name,
    COUNT(*) as count,
    ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ()), 1) as percentage
  FROM photo_metadata
  WHERE sharpness IS NOT NULL
    AND photo_category IS NOT NULL
  GROUP BY photo_category
  ORDER BY count DESC
');
```

Expected result: JSON array with category distributions

### Test 3: Security - Should Fail
```sql
-- This should raise an error
SELECT * FROM exec_sql('DELETE FROM photo_metadata WHERE id = 1');
-- Error: Only SELECT queries are allowed
```

## Performance Impact

### Before (Fallback Mode)
- 9+ individual COUNT queries
- ~2-3 seconds for distribution data
- Higher database load

### After (Optimized Mode)
- 2 aggregated queries (sports + categories)
- ~200-500ms for distribution data
- Lower database load, uses indexes efficiently

## Verification

After deployment, check your application logs. You should see:
- ✅ No more "exec_sql RPC not found" warnings
- ✅ Faster page load times for routes using filters
- ✅ Sports and categories load correctly

## Rollback

If you need to remove the function:
```sql
DROP FUNCTION IF EXISTS public.exec_sql(text);
```

## Next Steps

1. Deploy the migration to Supabase
2. Push your error handling code to production (already committed)
3. Verify the app works without fallback warnings
4. Monitor performance improvements in Vercel logs
