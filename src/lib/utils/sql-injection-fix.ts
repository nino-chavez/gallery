/**
 * SQL Injection Prevention Utilities
 * 
 * Addresses assessment finding: Template literals in SQL queries pose injection risk
 * 
 * RECOMMENDATION: Use Supabase query builder instead of raw SQL when possible
 * This file provides utilities for safe SQL construction when RPC is necessary
 */

/**
 * Allowed filter values for validation
 * Prevents SQL injection by whitelisting allowed values
 */
export const ALLOWED_SPORT_TYPES = [
  'volleyball',
  'basketball',
  'softball',
  'soccer',
  'track',
  'football',
  'baseball',
  'portrait',
];

export const ALLOWED_CATEGORIES = [
  'action',
  'celebration',
  'candid',
  'portrait',
  'warmup',
  'ceremony',
];

/**
 * Sanitize SQL string value (for use in RPC exec_sql when necessary)
 * 
 * ⚠️ WARNING: This is a last resort. Prefer Supabase query builder!
 * 
 * @param value - Value to sanitize
 * @param allowedValues - Whitelist of allowed values
 * @returns Sanitized SQL-safe string or null
 */
export function sanitizeSqlValue(
  value: string | null | undefined,
  allowedValues: string[]
): string | null {
  if (!value) return null;
  
  const normalized = value.toLowerCase().trim();
  
  // Check whitelist
  if (!allowedValues.includes(normalized)) {
    console.warn(`[SQL Sanitization] Invalid value: ${value}. Allowed: ${allowedValues.join(', ')}`);
    return null;
  }
  
  // Additional safety: escape single quotes (though whitelist should prevent this)
  return normalized.replace(/'/g, "''");
}

/**
 * Build safe WHERE clause for filter
 * 
 * @param field - Database field name
 * @param value - Filter value (will be validated)
 * @param allowedValues - Whitelist of allowed values
 * @returns Safe SQL WHERE clause fragment or empty string
 */
export function buildSafeWhereClause(
  field: string,
  value: string | null | undefined,
  allowedValues: string[]
): string {
  const sanitized = sanitizeSqlValue(value, allowedValues);
  if (!sanitized) return '';
  
  // Use parameterized approach if possible, otherwise escape
  return `AND ${field} = '${sanitized}'`;
}

/**
 * PREFERRED: Use Supabase query builder instead of raw SQL
 * 
 * Example refactoring from raw SQL to query builder:
 * 
 * ❌ OLD (unsafe):
 * ```typescript
 * const { data } = await supabaseServer.rpc('exec_sql', {
 *   sql: `SELECT * FROM photo_metadata WHERE sport_type = '${sportFilter}'`
 * });
 * ```
 * 
 * ✅ NEW (safe):
 * ```typescript
 * let query = supabaseServer
 *   .from('photo_metadata')
 *   .select('*');
 * 
 * if (sportFilter && ALLOWED_SPORT_TYPES.includes(sportFilter)) {
 *   query = query.eq('sport_type', sportFilter);
 * }
 * 
 * const { data, error } = await query;
 * ```
 */
export function buildSafeSupabaseQuery(
  baseQuery: any,
  filters: {
    sportType?: string | null;
    categoryFilter?: string | null;
  }
) {
  let query = baseQuery;
  
  // Apply sport filter safely
  if (filters.sportType && ALLOWED_SPORT_TYPES.includes(filters.sportType.toLowerCase())) {
    query = query.eq('sport_type', filters.sportType.toLowerCase());
  }
  
  // Apply category filter safely
  if (filters.categoryFilter && ALLOWED_CATEGORIES.includes(filters.categoryFilter.toLowerCase())) {
    query = query.eq('photo_category', filters.categoryFilter.toLowerCase());
  }
  
  return query;
}

