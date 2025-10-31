/**
 * Standardized Error Handling Utilities
 * 
 * Provides consistent error handling patterns across the application
 * Addresses assessment finding: Inconsistent error handling (some throw, some return empty arrays)
 */

export interface ErrorResult<T> {
  data: T | null;
  error: Error | null;
  success: boolean;
}

/**
 * Handle Supabase errors with consistent fallback behavior
 * 
 * @param error - The error from Supabase query
 * @param fallback - Fallback value to return on error
 * @param context - Context string for logging (e.g., 'fetchPhotos')
 * @returns Fallback value
 */
export function handleSupabaseError<T>(
  error: Error | null,
  fallback: T,
  context: string
): T {
  if (error) {
    console.error(`[Supabase ${context}] Error:`, error);
    
    // In production, send to error tracking service (e.g., Sentry)
    if (import.meta.env.PROD) {
      // TODO: Integrate error tracking service
      // trackError(error, { context });
    }
    
    return fallback;
  }
  
  return fallback;
}

/**
 * Wrap async Supabase operations with error handling
 * 
 * @param operation - Async operation that returns Supabase result
 * @param fallback - Fallback value on error
 * @param context - Context for logging
 * @returns Result with data and error status
 */
export async function safeSupabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: Error | null }>,
  fallback: T,
  context: string
): Promise<ErrorResult<T>> {
  try {
    const result = await operation();
    
    if (result.error) {
      return {
        data: handleSupabaseError(result.error, fallback, context),
        error: result.error,
        success: false,
      };
    }
    
    return {
      data: result.data ?? fallback,
      error: null,
      success: true,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return {
      data: handleSupabaseError(err, fallback, context),
      error: err,
      success: false,
    };
  }
}

/**
 * Validate and sanitize filter parameters
 * Prevents SQL injection risks from user input
 * 
 * @param value - Filter value from URL params
 * @param allowedValues - Array of allowed values
 * @returns Sanitized value or null if invalid
 */
export function sanitizeFilterValue(
  value: string | null | undefined,
  allowedValues: string[]
): string | null {
  if (!value) return null;
  
  // Check if value is in allowed list
  if (allowedValues.includes(value.toLowerCase())) {
    return value.toLowerCase();
  }
  
  console.warn(`[Filter Validation] Invalid filter value: ${value}. Allowed: ${allowedValues.join(', ')}`);
  return null;
}

/**
 * Type guard for PhotoMetadataRow
 * Ensures type safety in Supabase queries
 */
export function isPhotoMetadataRow(row: any): row is {
  photo_id: string;
  image_key: string;
  ImageUrl: string | null;
  ThumbnailUrl: string | null;
  OriginalUrl: string | null;
  upload_date: string | null;
  sport_type: string | null;
  photo_category: string | null;
  play_type: string | null;
  action_intensity: string | null;
  sharpness: number | null;
} {
  return (
    typeof row === 'object' &&
    row !== null &&
    typeof row.photo_id === 'string' &&
    typeof row.image_key === 'string'
  );
}

