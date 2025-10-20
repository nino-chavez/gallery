# Database Optimization Scripts

## Performance Indexes

### 📋 Two Versions Available:

1. **`performance-indexes-simple.sql`** ⭐ **RECOMMENDED FOR SUPABASE**
   - Clean, focused index creation only
   - No verification queries that might fail
   - Just creates indexes + runs ANALYZE
   - **Use this version for Supabase!**

2. **`performance-indexes.sql`** (Advanced)
   - Includes verification queries
   - Includes test queries with EXPLAIN ANALYZE
   - More comprehensive but may have compatibility issues
   - Use for local PostgreSQL or advanced debugging

### ⚠️ Important Notes

**PostgreSQL Column Case Sensitivity:**
- Table has mixed-case columns: `ImageUrl`, `ThumbnailUrl`, `OriginalUrl`
- Must use quoted identifiers: `"ImageUrl"` not `imageurl`

**Supabase Compatibility:**
- Some `pg_stat_*` views may have restricted access
- Use `performance-indexes-simple.sql` to avoid issues

### How to Apply (Recommended)

1. **Open Supabase SQL Editor**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Click "New Query"

2. **Copy Simple Version**
   ```bash
   # Use the simplified version for Supabase
   cat database/performance-indexes-simple.sql
   ```

3. **Run the Script**
   - Paste entire contents into SQL Editor
   - Click "Run" or press Cmd/Ctrl + Enter
   - Wait 10-30 seconds for completion

4. **Verify Success**
   - Should see: `total_indexes_created: 14`
   - Should see: `✓ All indexes created successfully!`
   - No errors should appear

### Expected Results

**Before Indexes:**
| Query Type | Time |
|------------|------|
| Sport filter | 200-500ms |
| Sport + Category | 300-800ms |
| Quality sort | 400-1000ms |
| Aggregation (getSportDistribution) | 1000-3000ms |

**After Indexes:**
| Query Type | Time | Improvement |
|------------|------|-------------|
| Sport filter | 20-50ms | **10x faster** ⚡ |
| Sport + Category | 30-80ms | **10x faster** ⚡ |
| Quality sort | 50-150ms | **8x faster** ⚡ |
| Aggregation | 100-300ms | **10x faster** ⚡ |

### Indexes Created

1. **Primary Indexes** (7)
   - `idx_photo_metadata_sport_type` - Sport filtering
   - `idx_photo_metadata_category` - Category filtering
   - `idx_photo_metadata_quality_score` - Quality sorting
   - `idx_photo_metadata_portfolio` - Portfolio flag
   - `idx_photo_metadata_upload_date` - Date sorting
   - `idx_photo_metadata_sport_agg` - Sport aggregation
   - `idx_photo_metadata_category_agg` - Category aggregation

2. **Composite Indexes** (4)
   - `idx_photo_metadata_sport_category` - Combined filters
   - `idx_photo_metadata_sport_quality` - Sport + quality
   - `idx_photo_metadata_category_quality` - Category + quality
   - `idx_photo_metadata_portfolio_sport` - Portfolio + sport

3. **Covering Index** (1)
   - `idx_photo_metadata_explore_covering` - Includes commonly queried columns

4. **Partial Indexes** (2)
   - `idx_photo_metadata_action_photos` - Action category optimized
   - `idx_photo_metadata_volleyball` - Volleyball sport optimized

**Total:** 14 indexes (~50-100MB storage)

### Maintenance

**Monitor Index Usage** (run monthly):
```sql
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE tablename = 'photo_metadata'
  AND idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

**Reindex After Bulk Updates:**
```sql
REINDEX TABLE photo_metadata;
```

**Update Statistics:**
```sql
ANALYZE photo_metadata;
```

### Troubleshooting

**Error: "column does not exist"**
- Cause: Column name case mismatch
- Solution: Mixed-case columns are quoted: `"ImageUrl"`
- Check exact column names: `\d photo_metadata` in psql

**Error: "index already exists"**
- Cause: Trying to create duplicate index
- Solution: Script uses `IF NOT EXISTS`, safe to re-run
- Drop manually if needed: `DROP INDEX idx_name;`

**Slow queries after indexing**
- Run `ANALYZE photo_metadata;` to update statistics
- Check query plan: `EXPLAIN ANALYZE SELECT ...;`
- Verify indexes are being used (look for "Index Scan")

### Performance Testing

Test queries are included at the bottom of the script:
- Sport filtering
- Combined filters
- Quality sorting
- Aggregations

Each test shows:
- Query plan (`EXPLAIN ANALYZE`)
- Index usage
- Execution time

### Notes

- Indexes update automatically when data changes
- Supabase handles vacuum and maintenance
- Safe to run script multiple times (`IF NOT EXISTS`)
- Indexes may take time to "warm up" (first few queries slower)
- Monitor database size in Supabase dashboard

### Related Documentation

- [PostgreSQL Indexing](https://www.postgresql.org/docs/current/indexes.html)
- [Supabase Performance](https://supabase.com/docs/guides/database/performance)
- [docs/PERFORMANCE_OPTIMIZATIONS.md](../docs/PERFORMANCE_OPTIMIZATIONS.md) - Full performance guide
