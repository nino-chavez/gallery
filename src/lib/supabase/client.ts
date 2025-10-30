/**
 * Supabase Browser Client for SvelteKit
 *
 * ✅ BROWSER-SAFE - This client can be imported in components
 *
 * Uses the anon (anonymous) key which:
 * - Is safe to expose in browser JavaScript
 * - Enforces Row Level Security (RLS) policies
 * - Provides read-only access (writes blocked by RLS)
 * - Used for client-side queries with TanStack Query
 *
 * Use this client when:
 * - Fetching data from browser components
 * - Using TanStack Query hooks
 * - Implementing real-time subscriptions
 * - Client-side filtering/searching
 */

import { createClient } from '@supabase/supabase-js';
import { getOptimizedSmugMugUrl } from '$lib/utils/smugmug-image-optimizer';

// Browser-safe environment variables (VITE_ prefix = exposed to browser)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('[Client] Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('[Client] Missing VITE_SUPABASE_ANON_KEY environment variable');
}

/**
 * Browser-safe Supabase client
 *
 * This client:
 * - Uses the anonymous (anon) key (safe to expose)
 * - Enforces Row Level Security policies
 * - Cannot bypass RLS or perform admin operations
 * - Perfect for client-side queries and real-time subscriptions
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Enable session persistence for admin auth
    autoRefreshToken: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

/**
 * Browser-safe query example
 *
 * Note: For server-side queries in +page.server.ts,
 * use src/lib/supabase/server.ts instead!
 */
export async function getPublicPhotos(limit = 20) {
  const { data, error } = await supabase
    .from('photo_metadata')
    .select('*')
    .not('sharpness', 'is', null)
    // Use upload_date for correct chronological sorting (photo_date is backfilled with enriched_at)
    .order('upload_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[Supabase Client] Error fetching photos:', error);
    throw error;
  }

  return data;
}

/**
 * Fetch photos grouped by period (year/month) for timeline display
 *
 * Client-safe version for browser components
 * Used for loading additional timeline pages
 */
export async function fetchPhotosByPeriod(options: {
  page?: number;
  limit?: number;
  includeFeatured?: boolean;
}) {
  const { page = 1, limit = 12, includeFeatured = false } = options;
  const offset = (page - 1) * limit;

  try {
    // Use raw SQL to get periods with photo counts (GROUP BY approach)
    const { data: periods, error: periodsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          EXTRACT(YEAR FROM upload_date) as year,
          EXTRACT(MONTH FROM upload_date) as month,
          COUNT(*) as photo_count
        FROM photo_metadata
        WHERE sharpness IS NOT NULL
          AND upload_date IS NOT NULL
        GROUP BY EXTRACT(YEAR FROM upload_date), EXTRACT(MONTH FROM upload_date)
        ORDER BY year DESC, month DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    });

    if (periodsError) {
      throw periodsError; // This will trigger the fallback below
    }

    // Process the periods data
    const processedPeriods = (periods || []).map((row: any) => ({
      year: parseInt(row.year.toString()),
      month: parseInt(row.month.toString()),
      monthName: new Date(parseInt(row.year.toString()), parseInt(row.month.toString()) - 1).toLocaleString('default', { month: 'long' }),
      photoCount: parseInt(row.photo_count.toString())
    }));

    // If we need featured photos, fetch them for each period
    if (includeFeatured && processedPeriods.length > 0) {
      const periodsWithPhotos = await Promise.all(
        processedPeriods.map(async (period: { year: number; month: number; monthName: string; photoCount: number }) => {
          const startDate = new Date(period.year, period.month - 1, 1);
          const endDate = new Date(period.year, period.month, 1);

          const { data: photos } = await supabase
            .from('photo_metadata')
            .select('*')
            .gte('upload_date', startDate.toISOString())
            .lt('upload_date', endDate.toISOString())
            .not('sharpness', 'is', null)
            .order('emotional_impact', { ascending: false })
            .limit(6); // Top 6 photos per period

          return {
            ...period,
            featuredPhotos: (photos || []).map((row: any) => {
              // PERFORMANCE FIX: Use size-optimized SmugMug URLs
              const baseImageUrl = (row.ImageUrl || row.OriginalUrl || '').replace('photos.smugmug.com', 'ninochavez.smugmug.com');
              const baseThumbnailUrl = row.ThumbnailUrl?.replace('photos.smugmug.com', 'ninochavez.smugmug.com');
              const baseOriginalUrl = row.OriginalUrl?.replace('photos.smugmug.com', 'ninochavez.smugmug.com');

              const imageUrl = getOptimizedSmugMugUrl(baseImageUrl, 'grid') || baseImageUrl;
              const isSameBaseUrl = baseThumbnailUrl && baseImageUrl.includes(row.image_key) && baseThumbnailUrl.includes(row.image_key);
              const thumbnailUrl = isSameBaseUrl ? undefined : (getOptimizedSmugMugUrl(baseThumbnailUrl, 'thumbnail') || baseThumbnailUrl);
              const originalUrl = baseOriginalUrl;

              return {
              id: row.photo_id,
              image_key: row.image_key,
              image_url: imageUrl,
              thumbnail_url: thumbnailUrl,
              original_url: originalUrl,
              title: row.image_key, // Placeholder
              caption: '',
              keywords: [],
              created_at: row.photo_date || row.enriched_at || row.upload_date,
              metadata: {
                // BUCKET 1: Concrete & Filterable (user-facing)
                play_type: (row.play_type || null),
                action_intensity: (row.action_intensity || 'medium'),
                sport_type: row.sport_type,
                photo_category: row.photo_category,
                composition: (row.composition || ''),
                time_of_day: (row.time_of_day || ''),
                lighting: (row.lighting || undefined),
                color_temperature: (row.color_temperature || undefined),

                // BUCKET 2: Abstract & Internal (AI-only)
                emotion: (row.emotion || 'focus'),
                sharpness: row.sharpness ?? 0,
                composition_score: row.composition_score ?? 0,
                exposure_accuracy: row.exposure_accuracy ?? 0,
                emotional_impact: row.emotional_impact ?? 0,
                time_in_game: (row.time_in_game || undefined),
                athlete_id: row.athlete_id || undefined,
                event_id: row.event_id || undefined,

                // AI metadata
                ai_provider: (row.ai_provider || 'gemini'),
                ai_cost: row.ai_cost ?? 0,
                ai_confidence: row.ai_confidence ?? 0,
                enriched_at: row.enriched_at || new Date().toISOString(),
              },
            };
          })
          };
        })
      );

      return periodsWithPhotos;
    }

    // Return just periods without photos
    return processedPeriods;

  } catch (error) {
    console.error('[Supabase Client] Error with SQL approach, using manual fallback:', error);

    // Manual fallback: fetch photos and group them in memory
    const { data: allPhotos, error: photosError } = await supabase
      .from('photo_metadata')
      .select('upload_date')
      .not('sharpness', 'is', null)
      .not('upload_date', 'is', null)
      .order('upload_date', { ascending: false })
      .limit(1000); // Get a reasonable sample

    if (photosError) {
      console.error('[Supabase Client] Fallback query also failed:', photosError);
      throw photosError;
    }

    // Group by year/month manually
    const periodMap = new Map<string, { year: number; month: number; count: number }>();
    allPhotos?.forEach((photo: any) => {
      const date = new Date(photo.upload_date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${month}`;

      if (periodMap.has(key)) {
        periodMap.get(key)!.count++;
      } else {
        periodMap.set(key, { year, month, count: 1 });
      }
    });

    const periods = Array.from(periodMap.values())
      .sort((a, b) => b.year - a.year || b.month - a.month)
      .slice(offset, offset + limit);

    // If we need featured photos, fetch them for each period
    if (includeFeatured && periods.length > 0) {
      const periodsWithPhotos = await Promise.all(
        periods.map(async (period) => {
          const startDate = new Date(period.year, period.month - 1, 1);
          const endDate = new Date(period.year, period.month, 1);

          const { data: photos } = await supabase
            .from('photo_metadata')
            .select('*')
            .gte('upload_date', startDate.toISOString())
            .lt('upload_date', endDate.toISOString())
            .not('sharpness', 'is', null)
            .order('emotional_impact', { ascending: false })
            .limit(6); // Top 6 photos per period

          return {
            year: period.year,
            month: period.month,
            monthName: new Date(period.year, period.month - 1).toLocaleString('default', { month: 'long' }),
            photoCount: period.count,
            featuredPhotos: (photos || []).map((row: any) => ({
              id: row.photo_id,
              image_key: row.image_key,
              image_url: row.ImageUrl || row.OriginalUrl || '',
              thumbnail_url: row.ThumbnailUrl || undefined,
              original_url: row.OriginalUrl || undefined,
              title: row.image_key, // Placeholder
              caption: '',
              keywords: [],
              created_at: row.photo_date || row.enriched_at || row.upload_date,
              metadata: {
                // BUCKET 1: Concrete & Filterable (user-facing)
                play_type: (row.play_type || null),
                action_intensity: (row.action_intensity || 'medium'),
                sport_type: row.sport_type,
                photo_category: row.photo_category,
                composition: (row.composition || ''),
                time_of_day: (row.time_of_day || ''),
                lighting: (row.lighting || undefined),
                color_temperature: (row.color_temperature || undefined),

                // BUCKET 2: Abstract & Internal (AI-only)
                emotion: (row.emotion || 'focus'),
                sharpness: row.sharpness ?? 0,
                composition_score: row.composition_score ?? 0,
                exposure_accuracy: row.exposure_accuracy ?? 0,
                emotional_impact: row.emotional_impact ?? 0,
                time_in_game: (row.time_in_game || undefined),
                athlete_id: row.athlete_id || undefined,
                event_id: row.event_id || undefined,

                // AI metadata
                ai_provider: (row.ai_provider || 'gemini'),
                ai_cost: row.ai_cost ?? 0,
                ai_confidence: row.ai_confidence ?? 0,
                enriched_at: row.enriched_at || new Date().toISOString(),
              },
            ))
          }
        })
      );


      return periodsWithPhotos;
    }

    // Return just periods without photos
    return periods.map(period => ({
      year: period.year,
      month: period.month,
      monthName: new Date(period.year, period.month - 1).toLocaleString('default', { month: 'long' }),
      photoCount: period.count
    }));
  }
}
