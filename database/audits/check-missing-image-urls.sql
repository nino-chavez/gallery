-- Check for photos with missing or invalid image URLs
-- Purpose: Identify data quality issues causing image loading failures
-- Date: 2025-10-28
-- Single query that returns comprehensive audit results

WITH url_issues AS (
  SELECT
    image_key,
    photo_id,
    sport_type,
    photo_category,
    upload_date,
    "ImageUrl",
    "ThumbnailUrl",
    "OriginalUrl",
    CASE
      WHEN ("ImageUrl" IS NULL OR "ImageUrl" = '') AND ("OriginalUrl" IS NULL OR "OriginalUrl" = '') AND ("ThumbnailUrl" IS NULL OR "ThumbnailUrl" = '') THEN 'critical_no_urls'
      WHEN ("ImageUrl" IS NULL OR "ImageUrl" = '') AND ("OriginalUrl" IS NULL OR "OriginalUrl" = '') AND "ThumbnailUrl" IS NOT NULL THEN 'missing_primary'
      WHEN "ImageUrl" IS NOT NULL AND ("OriginalUrl" IS NULL OR "OriginalUrl" = '') THEN 'missing_original'
      WHEN ("ImageUrl" IS NOT NULL AND "ImageUrl" != '' AND "ImageUrl" NOT LIKE 'http%')
        OR ("OriginalUrl" IS NOT NULL AND "OriginalUrl" != '' AND "OriginalUrl" NOT LIKE 'http%')
        OR ("ThumbnailUrl" IS NOT NULL AND "ThumbnailUrl" != '' AND "ThumbnailUrl" NOT LIKE 'http%') THEN 'malformed_url'
      ELSE 'ok'
    END as issue_type
  FROM photo_metadata
),
summary_counts AS (
  SELECT
    issue_type,
    COUNT(*) as photo_count
  FROM url_issues
  WHERE issue_type != 'ok'
  GROUP BY issue_type
),
sport_summary AS (
  SELECT
    sport_type,
    COUNT(*) as total_photos,
    COUNT(CASE WHEN issue_type IN ('critical_no_urls', 'missing_primary') THEN 1 END) as missing_url_count,
    ROUND(
      100.0 * COUNT(CASE WHEN issue_type IN ('critical_no_urls', 'missing_primary') THEN 1 END) / COUNT(*),
      2
    ) as missing_url_percent
  FROM url_issues
  GROUP BY sport_type
  HAVING COUNT(CASE WHEN issue_type IN ('critical_no_urls', 'missing_primary') THEN 1 END) > 0
  ORDER BY missing_url_count DESC
)
SELECT
  '=== SUMMARY ===' as section,
  NULL::text as issue_type,
  NULL::bigint as photo_count,
  NULL::text as sport_type,
  NULL::bigint as total_photos,
  NULL::numeric as missing_url_percent,
  NULL::text as image_key,
  NULL::text as details

UNION ALL

SELECT
  'Issue Counts' as section,
  issue_type,
  photo_count,
  NULL, NULL, NULL, NULL, NULL
FROM summary_counts

UNION ALL

SELECT
  '=== BY SPORT TYPE ===' as section,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL

UNION ALL

SELECT
  'Sport Summary' as section,
  NULL as issue_type,
  NULL as photo_count,
  sport_type,
  total_photos,
  missing_url_percent,
  NULL as image_key,
  missing_url_count || ' missing' as details
FROM sport_summary

UNION ALL

SELECT
  '=== SAMPLE ISSUES ===' as section,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL

UNION ALL

SELECT
  'Sample Photos' as section,
  issue_type,
  NULL as photo_count,
  sport_type,
  NULL as total_photos,
  NULL as missing_url_percent,
  image_key,
  CASE
    WHEN "ImageUrl" IS NOT NULL AND "ImageUrl" != '' THEN 'Has ImageUrl'
    WHEN "OriginalUrl" IS NOT NULL AND "OriginalUrl" != '' THEN 'Has OriginalUrl only'
    WHEN "ThumbnailUrl" IS NOT NULL AND "ThumbnailUrl" != '' THEN 'Has ThumbnailUrl only'
    ELSE 'No URLs'
  END as details
FROM url_issues
WHERE issue_type != 'ok'
LIMIT 20;
