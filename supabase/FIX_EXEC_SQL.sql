-- Fix for exec_sql function to handle multiline SQL with leading whitespace
-- Run this in Supabase SQL Editor to update the function

DROP FUNCTION IF EXISTS public.exec_sql(text);

CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with elevated privileges
SET search_path = public  -- Prevent schema injection
AS $$
DECLARE
  result jsonb;
  normalized_sql text;
BEGIN
  -- Normalize the SQL: remove ALL leading/trailing whitespace and newlines
  -- This handles multiline SQL strings with indentation
  normalized_sql := regexp_replace(trim(sql), '^\s+', '', 'g');
  normalized_sql := lower(normalized_sql);

  -- Security check: Only allow SELECT statements
  IF NOT (normalized_sql LIKE 'select%') THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed. Query must start with SELECT.';
  END IF;

  -- Additional security: Block dangerous keywords even in SELECT statements
  IF normalized_sql ~* '\b(insert|update|delete|drop|truncate|alter|create|grant|revoke)\b' THEN
    RAISE EXCEPTION 'Query contains forbidden SQL keywords';
  END IF;

  -- Execute the query and convert results to JSONB
  EXECUTE format('SELECT jsonb_agg(row_to_json(t)) FROM (%s) t', sql) INTO result;

  -- Return empty array if no results
  RETURN COALESCE(result, '[]'::jsonb);

EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and re-raise with context
    RAISE WARNING 'exec_sql error: % (SQL: %)', SQLERRM, sql;
    RAISE;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon;

-- Add comment for documentation
COMMENT ON FUNCTION public.exec_sql(text) IS
'Execute a read-only SQL query and return results as JSONB. Only SELECT queries are allowed. Used for efficient aggregation queries like sport/category distributions. Updated to handle multiline SQL with leading whitespace.';
