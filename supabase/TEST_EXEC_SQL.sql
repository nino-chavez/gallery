-- Test exec_sql function with actual queries
-- Run these queries in Supabase SQL Editor to verify the function works

-- Test 1: Simple COUNT query
-- Expected: Should return total photo count
SELECT exec_sql('SELECT COUNT(*) as total FROM photo_metadata WHERE sharpness IS NOT NULL');

-- Test 2: Sport Distribution (actual query from the app)
-- Expected: Should return sports with counts and percentages
SELECT exec_sql('
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

-- Test 3: Category Distribution (actual query from the app)
-- Expected: Should return categories with counts and percentages
SELECT exec_sql('
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

-- Test 4: Security Test - This should FAIL with an error
-- Expected: "Only SELECT queries are allowed"
SELECT exec_sql('DELETE FROM photo_metadata WHERE id = 1');
