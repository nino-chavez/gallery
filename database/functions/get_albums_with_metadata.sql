-- Database function to efficiently get albums with aggregated metadata
-- This replaces client-side aggregation and removes the 20K row limit

CREATE OR REPLACE FUNCTION get_albums_with_metadata(
  sport_filter text DEFAULT NULL,
  category_filter text DEFAULT NULL
)
RETURNS TABLE (
  album_key text,
  album_name text,
  photo_count bigint,
  cover_image_url text,
  sports text[],
  categories text[],
  portfolio_count bigint,
  avg_quality_score numeric,
  primary_sport text,
  primary_category text
)
LANGUAGE sql
STABLE
AS $$
  WITH album_aggregates AS (
    SELECT
      p.album_key,
      MAX(p.album_name) as album_name,
      COUNT(*) as photo_count,
      -- Get the first photo's thumbnail URL for cover (ordered by upload_date desc)
      (ARRAY_AGG(COALESCE(p."ThumbnailUrl", p."ImageUrl") ORDER BY p.upload_date DESC))[1] as cover_image_url,
      -- Collect unique sports and categories
      ARRAY_AGG(DISTINCT p.sport_type) FILTER (WHERE p.sport_type IS NOT NULL AND p.sport_type != 'unknown') as sports,
      ARRAY_AGG(DISTINCT p.photo_category) FILTER (WHERE p.photo_category IS NOT NULL AND p.photo_category != 'unknown') as categories,
      -- Count portfolio-worthy photos
      COUNT(*) FILTER (WHERE p.portfolio_worthy = true) as portfolio_count,
      -- Calculate average quality score
      AVG(p.quality_score) as avg_quality_score,
      -- Get most common sport (primary)
      MODE() WITHIN GROUP (ORDER BY p.sport_type) as primary_sport,
      -- Get most common category (primary)
      MODE() WITHIN GROUP (ORDER BY p.photo_category) as primary_category
    FROM photo_metadata p
    WHERE
      p.album_key IS NOT NULL
      AND p.sharpness IS NOT NULL  -- Only enriched photos
      AND (sport_filter IS NULL OR p.sport_type = sport_filter)
      AND (category_filter IS NULL OR p.photo_category = category_filter)
    GROUP BY p.album_key
  )
  SELECT
    a.album_key,
    a.album_name,
    a.photo_count,
    a.cover_image_url,
    COALESCE(a.sports, ARRAY[]::text[]) as sports,
    COALESCE(a.categories, ARRAY[]::text[]) as categories,
    a.portfolio_count,
    ROUND(a.avg_quality_score, 2) as avg_quality_score,
    COALESCE(a.primary_sport, 'unknown') as primary_sport,
    COALESCE(a.primary_category, 'unknown') as primary_category
  FROM album_aggregates a
  ORDER BY a.photo_count DESC;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_albums_with_metadata(text, text) TO anon;
GRANT EXECUTE ON FUNCTION get_albums_with_metadata(text, text) TO authenticated;
