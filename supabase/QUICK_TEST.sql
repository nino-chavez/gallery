-- Quick test queries for exec_sql function
-- Copy and paste each one individually into Supabase SQL Editor

-- Test 1: Simple COUNT query
SELECT exec_sql('SELECT COUNT(*) as total FROM photo_metadata WHERE sharpness IS NOT NULL');

-- Test 2: Sport Distribution (correct parentheses)
SELECT exec_sql('SELECT sport_type as name, COUNT(*) as count, ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ()), 1) as percentage FROM photo_metadata WHERE sharpness IS NOT NULL AND sport_type IS NOT NULL AND sport_type != ''unknown'' GROUP BY sport_type ORDER BY count DESC');

-- Test 3: Category Distribution (correct parentheses)
SELECT exec_sql('SELECT photo_category as name, COUNT(*) as count, ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ()), 1) as percentage FROM photo_metadata WHERE sharpness IS NOT NULL AND photo_category IS NOT NULL GROUP BY photo_category ORDER BY count DESC');
