/**
 * Supabase Server Client for SvelteKit
 *
 * ⚠️ SERVER-SIDE ONLY - Never import this in browser code!
 *
 * This client uses the service role key for privileged operations:
 * - Bypasses Row Level Security (RLS)
 * - Can perform admin operations (create, update, delete)
 * - Used ONLY in +page.server.ts, +layout.server.ts, API routes
 *
 * Uses non-VITE environment variables (not exposed to browser)
 */

import { createClient } from '@supabase/supabase-js';
import type { Photo, PhotoFilterState } from '$types/photo';
import type { PhotoMetadataRow, SportDistributionRow, CategoryDistributionRow } from '$types/database';
import { getOptimizedSmugMugUrl } from '$lib/utils/smugmug-image-optimizer';

// Server-side environment variables (NOT exposed to browser)
// In SvelteKit, we need to use import.meta.env even server-side
// but we can use non-VITE_ prefixed vars if we set them up in svelte.config.js

// Use fallback values during build to avoid build-time errors
// Variables will be validated at runtime when actually used
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'; // For now, using anon key (read-only is safe)

// TODO: Once we need write operations, add SUPABASE_SERVICE_ROLE_KEY to .env.local
// and update SvelteKit config to expose it server-side only

// Validate environment variables are set (will warn but not throw during build)
if (!import.meta.env.VITE_SUPABASE_URL && import.meta.env.PROD) {
  console.error('[Server] Missing VITE_SUPABASE_URL environment variable. Please add it to Vercel.');
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.PROD) {
  console.error('[Server] Missing VITE_SUPABASE_ANON_KEY environment variable. Please add it to Vercel.');
}

/**
 * Transform database row to Photo type with optimized SmugMug URLs
 * Exported for use in other server-side loaders
 */
export function transformPhotoRow(row: any): Photo {
  const baseImageUrl = (row.ImageUrl || row.OriginalUrl || '').replace('photos.smugmug.com', 'ninochavez.smugmug.com');
  const baseThumbnailUrl = row.ThumbnailUrl?.replace('photos.smugmug.com', 'ninochavez.smugmug.com');
  const baseOriginalUrl = row.OriginalUrl?.replace('photos.smugmug.com', 'ninochavez.smugmug.com');

  // Optimize sizes for different contexts
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
    title: row.image_key,
    caption: '',
    keywords: [],
    created_at: row.photo_date || row.enriched_at || row.upload_date,
    metadata: {
      play_type: (row.play_type || null) as Photo['metadata']['play_type'],
      action_intensity: (row.action_intensity || 'medium') as Photo['metadata']['action_intensity'],
      sport_type: row.sport_type,
      photo_category: row.photo_category,
      composition: (row.composition || '') as Photo['metadata']['composition'],
      time_of_day: (row.time_of_day || '') as Photo['metadata']['time_of_day'],
      lighting: (row.lighting || undefined) as Photo['metadata']['lighting'],
      color_temperature: (row.color_temperature || undefined) as Photo['metadata']['color_temperature'],
      emotion: (row.emotion || 'focus') as Photo['metadata']['emotion'],
      sharpness: row.sharpness ?? 0,
      composition_score: row.composition_score ?? 0,
      exposure_accuracy: row.exposure_accuracy ?? 0,
      emotional_impact: row.emotional_impact ?? 0,
      time_in_game: (row.time_in_game || undefined) as Photo['metadata']['time_in_game'],
      athlete_id: row.athlete_id || undefined,
      event_id: row.event_id || undefined,
      ai_provider: (row.ai_provider || 'gemini') as Photo['metadata']['ai_provider'],
      ai_cost: row.ai_cost ?? 0,
      ai_confidence: row.ai_confidence ?? 0,
      enriched_at: row.enriched_at || new Date().toISOString(),
    },
  } as Photo;
}

// Create Supabase client with service role for server-side operations
export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export interface FetchPhotosOptions extends PhotoFilterState {
  limit?: number;
  offset?: number;
  sortBy?: 'quality' | 'newest' | 'oldest' | 'action' | 'intensity';
}

/**
 * Fetch photos from Supabase with optional filters (SERVER-SIDE)
 *
 * This function should ONLY be called from:
 * - +page.server.ts files
 * - +layout.server.ts files
 * - API route handlers
 *
 * Never call from browser components!
 */
export async function fetchPhotos(options?: FetchPhotosOptions): Promise<Photo[]> {
  const { limit, offset, sortBy = 'newest', ...filters } = options || {};

  let query = supabaseServer
    .from('photo_metadata')
    .select('*')
    .not('sharpness', 'is', null); // Only show enriched photos

  // Apply concrete sorting (aligned with two-bucket model)
  switch (sortBy) {
    case 'quality':
      // Sort by emotional impact (best photos first), then by upload_date DESC for deterministic ordering
      query = query.order('emotional_impact', { ascending: false }).order('upload_date', { ascending: false });
      break;
    case 'newest':
      // Use upload_date (SmugMug upload) or date_added (album add) as fallback
      query = query.order('upload_date', { ascending: false });
      break;
    case 'oldest':
      query = query.order('upload_date', { ascending: true });
      break;
    case 'action':
      // Sort by play type (alphabetical grouping), then by emotional_impact for deterministic ordering
      query = query.order('play_type', { ascending: true, nullsFirst: false }).order('emotional_impact', { ascending: false });
      break;
    case 'intensity':
      // Sort by action intensity (peak -> high -> medium -> low), then by emotional_impact for deterministic ordering
      query = query.order('action_intensity', { ascending: false, nullsFirst: false }).order('emotional_impact', { ascending: false });
      break;
  }

  // Apply Bucket 1 (user-facing) filters only

  // Action filters
  if (filters?.playTypes && filters.playTypes.length > 0) {
    query = query.in('play_type', filters.playTypes);
  }

  if (filters?.actionIntensity && filters.actionIntensity.length > 0) {
    query = query.in('action_intensity', filters.actionIntensity);
  }

  if (filters?.sportType) {
    query = query.eq('sport_type', filters.sportType);
  }

  if (filters?.photoCategory) {
    query = query.eq('photo_category', filters.photoCategory);
  }

  // Aesthetic filters
  if (filters?.compositions && filters.compositions.length > 0) {
    query = query.in('composition', filters.compositions);
  }

  if (filters?.timeOfDay && filters.timeOfDay.length > 0) {
    query = query.in('time_of_day', filters.timeOfDay);
  }

  if (filters?.lighting && filters.lighting.length > 0) {
    query = query.in('lighting', filters.lighting);
  }

  if (filters?.colorTemperature && filters.colorTemperature.length > 0) {
    query = query.in('color_temperature', filters.colorTemperature);
  }

  // Context filters
  if (filters?.albumKey) {
    query = query.eq('album_key', filters.albumKey);
  }

  // Apply pagination
  if (limit) {
    query = query.limit(limit);
  }
  if (offset) {
    query = query.range(offset, offset + (limit || 24) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[Supabase Server] Error fetching photos:', error);
    throw new Error(`Failed to fetch photos: ${error.message}`);
  }

  // Map photo_metadata to Photo type (two-bucket model)
  // Filter out photos with missing/invalid image URLs
  const photos: Photo[] = (data || [])
    .filter((row: PhotoMetadataRow) => {
      const hasValidUrl = !!(row.ImageUrl || row.OriginalUrl);
      if (!hasValidUrl) {
        console.warn('[fetchPhotos] Skipping photo with no valid URL:', row.image_key);
      }
      return hasValidUrl;
    })
    .map((row: PhotoMetadataRow) => {
    // PERFORMANCE FIX: Use size-optimized SmugMug URLs
    // Before: Loading D-size (1600px) for 400px grid = 4x wasted bandwidth
    // After: Loading S-size (400px) for grid = 75% bandwidth savings
    const baseImageUrl = (row.ImageUrl || row.OriginalUrl || '').replace('photos.smugmug.com', 'ninochavez.smugmug.com');
    const baseThumbnailUrl = row.ThumbnailUrl?.replace('photos.smugmug.com', 'ninochavez.smugmug.com');
    const baseOriginalUrl = row.OriginalUrl?.replace('photos.smugmug.com', 'ninochavez.smugmug.com');

    // Optimize sizes for different contexts
    const imageUrl = getOptimizedSmugMugUrl(baseImageUrl, 'grid') || baseImageUrl; // S-size (400px) for grids

    // CRITICAL FIX: Don't use separate thumbnail if it's the same base URL as image
    // This prevents duplicate fetches of the same image at different sizes
    const isSameBaseUrl = baseThumbnailUrl && baseImageUrl.includes(row.image_key) && baseThumbnailUrl.includes(row.image_key);
    const thumbnailUrl = isSameBaseUrl ? undefined : (getOptimizedSmugMugUrl(baseThumbnailUrl, 'thumbnail') || baseThumbnailUrl); // Th-size (100px) for blur

    const originalUrl = baseOriginalUrl; // Keep original for downloads

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
        play_type: (row.play_type || null) as Photo['metadata']['play_type'],
        action_intensity: (row.action_intensity || 'medium') as Photo['metadata']['action_intensity'],
        sport_type: row.sport_type,
        photo_category: row.photo_category,
        composition: (row.composition || '') as Photo['metadata']['composition'],
        time_of_day: (row.time_of_day || '') as Photo['metadata']['time_of_day'],
        lighting: (row.lighting || undefined) as Photo['metadata']['lighting'],
        color_temperature: (row.color_temperature || undefined) as Photo['metadata']['color_temperature'],

        // BUCKET 2: Abstract & Internal (AI-only)
        emotion: (row.emotion || 'focus') as Photo['metadata']['emotion'],
        sharpness: row.sharpness ?? 0,
        composition_score: row.composition_score ?? 0,
        exposure_accuracy: row.exposure_accuracy ?? 0,
        emotional_impact: row.emotional_impact ?? 0,
        time_in_game: (row.time_in_game || undefined) as Photo['metadata']['time_in_game'],
        athlete_id: row.athlete_id || undefined,
        event_id: row.event_id || undefined,

        // AI metadata
        ai_provider: (row.ai_provider || 'gemini') as Photo['metadata']['ai_provider'],
        ai_cost: row.ai_cost ?? 0,
        ai_confidence: row.ai_confidence ?? 0,
        enriched_at: row.enriched_at || new Date().toISOString(),
      },
    };
  });

  return photos;
}

/**
 * Get count of photos matching filters (SERVER-SIDE)
 */
export async function getPhotoCount(filters?: PhotoFilterState): Promise<number> {
  let query = supabaseServer
    .from('photo_metadata')
    .select('*', { count: 'exact', head: true })
    .not('sharpness', 'is', null);

  // Apply same Bucket 1 filters as fetchPhotos
  if (filters?.playTypes && filters.playTypes.length > 0) {
    query = query.in('play_type', filters.playTypes);
  }

  if (filters?.actionIntensity && filters.actionIntensity.length > 0) {
    query = query.in('action_intensity', filters.actionIntensity);
  }

  if (filters?.sportType) {
    query = query.eq('sport_type', filters.sportType);
  }

  if (filters?.photoCategory) {
    query = query.eq('photo_category', filters.photoCategory);
  }

  if (filters?.compositions && filters.compositions.length > 0) {
    query = query.in('composition', filters.compositions);
  }

  if (filters?.timeOfDay && filters.timeOfDay.length > 0) {
    query = query.in('time_of_day', filters.timeOfDay);
  }

  if (filters?.lighting && filters.lighting.length > 0) {
    query = query.in('lighting', filters.lighting);
  }

  if (filters?.colorTemperature && filters.colorTemperature.length > 0) {
    query = query.in('color_temperature', filters.colorTemperature);
  }

  const { count, error } = await query;

  if (error) {
    console.error('[Supabase Server] Error fetching count:', error);
    throw new Error(`Failed to fetch photo count: ${error.message}`);
  }

  return count || 0;
}

/**
 * Get sport distribution statistics (SERVER-SIDE)
 * Returns count and percentage for each sport type
 * Uses SQL aggregation for efficiency (no row limit issues)
 */
export async function getSportDistribution(): Promise<Array<{ name: string; count: number; percentage: number }>> {
  try {
    // Use raw SQL to do GROUP BY aggregation on database side
    // This avoids fetching 20K rows and hitting Supabase row limits
    const { data, error } = await supabaseServer.rpc('exec_sql', {
      sql: `
        SELECT
          sport_type as name,
          COUNT(*) as count,
          ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ()), 1) as percentage
        FROM photo_metadata
        WHERE sharpness IS NOT NULL
          AND sport_type IS NOT NULL
          AND sport_type != 'unknown'
        GROUP BY sport_type
        ORDER BY count DESC
      `
    });

    if (error) {
      throw error; // Trigger fallback
    }

    // Process SQL results
    return (data || []).map((row: SportDistributionRow) => ({
      name: row.name,
      count: parseInt(row.count.toString()),
      percentage: parseFloat(row.percentage.toString())
    }));
  } catch (error) {
    // Fallback: If custom RPC doesn't exist, use Supabase's native aggregation
    console.warn('[Supabase Server] exec_sql RPC not found, using native query method:', error);

    try {
      // Get total count first
      const { count: totalCount, error: countError } = await supabaseServer
        .from('photo_metadata')
        .select('*', { count: 'exact', head: true })
        .not('sharpness', 'is', null)
        .not('sport_type', 'is', null)
        .neq('sport_type', 'unknown');

      if (countError) {
        console.error('[Supabase Server] Error fetching total count for sports:', countError);
        return []; // Return empty array instead of throwing
      }

      const total = totalCount || 0;

      // Unfortunately, Supabase JS doesn't support GROUP BY natively
      // So we have to use a workaround: fetch unique sports, then count each
      const sports = ['volleyball', 'portrait', 'basketball', 'softball', 'soccer', 'track', 'football', 'baseball'];

      const results = await Promise.all(
        sports.map(async (sport) => {
          const { count, error: sportError } = await supabaseServer
            .from('photo_metadata')
            .select('*', { count: 'exact', head: true })
            .eq('sport_type', sport)
            .not('sharpness', 'is', null);

          if (sportError) {
            console.error(`[Supabase Server] Error fetching count for sport ${sport}:`, sportError);
            return { name: sport, count: 0, percentage: 0 };
          }

          return {
            name: sport,
            count: count || 0,
            percentage: parseFloat(((count || 0) / total * 100).toFixed(1))
          };
        })
      );

      return results
        .filter(s => s.count > 0)
        .sort((a, b) => b.count - a.count);
    } catch (fallbackError) {
      console.error('[Supabase Server] Critical error in getSportDistribution fallback:', fallbackError);
      return []; // Return empty array as last resort
    }
  }
}

/**
 * Get filter counts for all filter options (SERVER-SIDE)
 * Returns counts for each filter option while respecting currently active filters
 * This enables "smart" filtering where users can see how many results each option will return
 */
export interface FilterCounts {
  sports: Array<{ name: string; count: number }>;
  categories: Array<{ name: string; count: number }>;
  playTypes: Array<{ name: string; count: number }>;
  intensities: Array<{ name: string; count: number }>;
  lighting: Array<{ name: string; count: number }>;
  colorTemperatures: Array<{ name: string; count: number }>;
  timesOfDay: Array<{ name: string; count: number }>;
  compositions: Array<{ name: string; count: number }>;
}

/**
 * OPTIMIZED: Get filter counts using aggregation queries (GROUP BY)
 * Reduces database queries from ~50-80 to ~8 (one per filter dimension)
 *
 * Performance improvements:
 * - Uses COUNT() with GROUP BY instead of individual queries
 * - Single query per dimension (8 queries total vs 50-80)
 * - Respects current filters to show compatible counts
 * - No hardcoded filter values (uses actual data)
 *
 * Phase 1 of Intelligent Filter System (27-40h total)
 * This function is the foundation - estimate 8-12h
 */
export async function getFilterCounts(currentFilters?: PhotoFilterState): Promise<FilterCounts> {
  // Helper to build WHERE clause from current filters (excluding the dimension being counted)
  const buildFilterConditions = (excludeField: string): string => {
    const conditions: string[] = ['sharpness IS NOT NULL']; // Base condition

    if (currentFilters?.sportType && excludeField !== 'sport_type') {
      conditions.push(`sport_type = '${currentFilters.sportType}'`);
    }
    if (currentFilters?.photoCategory && excludeField !== 'photo_category') {
      conditions.push(`photo_category = '${currentFilters.photoCategory}'`);
    }
    if (currentFilters?.playTypes && currentFilters.playTypes.length > 0 && excludeField !== 'play_type') {
      const playTypesList = currentFilters.playTypes.map(pt => `'${pt}'`).join(', ');
      conditions.push(`play_type IN (${playTypesList})`);
    }
    if (currentFilters?.actionIntensity && currentFilters.actionIntensity.length > 0 && excludeField !== 'action_intensity') {
      const intensityList = currentFilters.actionIntensity.map(ai => `'${ai}'`).join(', ');
      conditions.push(`action_intensity IN (${intensityList})`);
    }
    if (currentFilters?.lighting && currentFilters.lighting.length > 0 && excludeField !== 'lighting') {
      const lightingList = currentFilters.lighting.map(l => `'${l}'`).join(', ');
      conditions.push(`lighting IN (${lightingList})`);
    }
    if (currentFilters?.colorTemperature && currentFilters.colorTemperature.length > 0 && excludeField !== 'color_temperature') {
      const tempList = currentFilters.colorTemperature.map(ct => `'${ct}'`).join(', ');
      conditions.push(`color_temperature IN (${tempList})`);
    }
    if (currentFilters?.timeOfDay && currentFilters.timeOfDay.length > 0 && excludeField !== 'time_of_day') {
      const timeList = currentFilters.timeOfDay.map(tod => `'${tod}'`).join(', ');
      conditions.push(`time_of_day IN (${timeList})`);
    }
    if (currentFilters?.compositions && currentFilters.compositions.length > 0 && excludeField !== 'composition') {
      const compList = currentFilters.compositions.map(c => `'${c}'`).join(', ');
      conditions.push(`composition IN (${compList})`);
    }

    return conditions.join(' AND ');
  };

  // Aggregation query generator
  const getAggregatedCounts = async (
    fieldName: string,
    displayName: string
  ): Promise<Array<{ name: string; count: number }>> => {
    const conditions = buildFilterConditions(fieldName);

    try {
      // Try using RPC for GROUP BY aggregation (most efficient)
      const { data, error } = await supabaseServer.rpc('exec_sql', {
        sql: `
          SELECT
            ${fieldName} as name,
            COUNT(*) as count
          FROM photo_metadata
          WHERE ${conditions}
            AND ${fieldName} IS NOT NULL
          GROUP BY ${fieldName}
          ORDER BY count DESC
        `
      });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        name: row.name,
        count: parseInt(row.count.toString())
      }));
    } catch (error) {
      // Fallback: fetch distinct values then count each (less efficient but works)
      console.warn(`[getFilterCounts] RPC failed for ${fieldName}, using fallback:`, error);

      // Build query to get distinct values for this field
      let query = supabaseServer
        .from('photo_metadata')
        .select(fieldName)
        .not('sharpness', 'is', null)
        .not(fieldName, 'is', null);

      // Apply current filters (excluding this field)
      if (currentFilters?.sportType && fieldName !== 'sport_type') {
        query = query.eq('sport_type', currentFilters.sportType);
      }
      if (currentFilters?.photoCategory && fieldName !== 'photo_category') {
        query = query.eq('photo_category', currentFilters.photoCategory);
      }
      if (currentFilters?.playTypes && currentFilters.playTypes.length > 0 && fieldName !== 'play_type') {
        query = query.in('play_type', currentFilters.playTypes);
      }
      if (currentFilters?.actionIntensity && currentFilters.actionIntensity.length > 0 && fieldName !== 'action_intensity') {
        query = query.in('action_intensity', currentFilters.actionIntensity);
      }
      if (currentFilters?.lighting && currentFilters.lighting.length > 0 && fieldName !== 'lighting') {
        query = query.in('lighting', currentFilters.lighting);
      }
      if (currentFilters?.colorTemperature && currentFilters.colorTemperature.length > 0 && fieldName !== 'color_temperature') {
        query = query.in('color_temperature', currentFilters.colorTemperature);
      }
      if (currentFilters?.timeOfDay && currentFilters.timeOfDay.length > 0 && fieldName !== 'time_of_day') {
        query = query.in('time_of_day', currentFilters.timeOfDay);
      }
      if (currentFilters?.compositions && currentFilters.compositions.length > 0 && fieldName !== 'composition') {
        query = query.in('composition', currentFilters.compositions);
      }

      const { data: distinctData, error: distinctError } = await query;

      if (distinctError) {
        console.error(`[getFilterCounts] Error fetching distinct values for ${fieldName}:`, distinctError);
        return [];
      }

      // Get unique values
      const uniqueValues = Array.from(new Set((distinctData || []).map((row: any) => row[fieldName]))).filter(Boolean);

      // Count each value
      const counts = await Promise.all(
        uniqueValues.map(async (value) => {
          let countQuery = supabaseServer
            .from('photo_metadata')
            .select('*', { count: 'exact', head: true })
            .not('sharpness', 'is', null)
            .eq(fieldName, value);

          // Apply same filters
          if (currentFilters?.sportType && fieldName !== 'sport_type') {
            countQuery = countQuery.eq('sport_type', currentFilters.sportType);
          }
          if (currentFilters?.photoCategory && fieldName !== 'photo_category') {
            countQuery = countQuery.eq('photo_category', currentFilters.photoCategory);
          }
          if (currentFilters?.playTypes && currentFilters.playTypes.length > 0 && fieldName !== 'play_type') {
            countQuery = countQuery.in('play_type', currentFilters.playTypes);
          }
          if (currentFilters?.actionIntensity && currentFilters.actionIntensity.length > 0 && fieldName !== 'action_intensity') {
            countQuery = countQuery.in('action_intensity', currentFilters.actionIntensity);
          }
          if (currentFilters?.lighting && currentFilters.lighting.length > 0 && fieldName !== 'lighting') {
            countQuery = countQuery.in('lighting', currentFilters.lighting);
          }
          if (currentFilters?.colorTemperature && currentFilters.colorTemperature.length > 0 && fieldName !== 'color_temperature') {
            countQuery = countQuery.in('color_temperature', currentFilters.colorTemperature);
          }
          if (currentFilters?.timeOfDay && currentFilters.timeOfDay.length > 0 && fieldName !== 'time_of_day') {
            countQuery = countQuery.in('time_of_day', currentFilters.timeOfDay);
          }
          if (currentFilters?.compositions && currentFilters.compositions.length > 0 && fieldName !== 'composition') {
            countQuery = countQuery.in('composition', currentFilters.compositions);
          }

          const { count } = await countQuery;
          return { name: value as string, count: count || 0 };
        })
      );

      return counts.sort((a, b) => b.count - a.count);
    }
  };

  // Execute all 8 aggregation queries in parallel
  const [
    sportCounts,
    categoryCounts,
    playTypeCounts,
    intensityCounts,
    lightingCounts,
    colorTempCounts,
    timeOfDayCounts,
    compositionCounts,
  ] = await Promise.all([
    getAggregatedCounts('sport_type', 'Sport'),
    getAggregatedCounts('photo_category', 'Category'),
    getAggregatedCounts('play_type', 'Play Type'),
    getAggregatedCounts('action_intensity', 'Intensity'),
    getAggregatedCounts('lighting', 'Lighting'),
    getAggregatedCounts('color_temperature', 'Color Temperature'),
    getAggregatedCounts('time_of_day', 'Time of Day'),
    getAggregatedCounts('composition', 'Composition'),
  ]);

  return {
    sports: sportCounts.filter(s => s.count > 0),
    categories: categoryCounts.filter(c => c.count > 0),
    playTypes: playTypeCounts.filter(p => p.count > 0),
    intensities: intensityCounts.filter(i => i.count > 0),
    lighting: lightingCounts.filter(l => l.count > 0),
    colorTemperatures: colorTempCounts.filter(t => t.count > 0),
    timesOfDay: timeOfDayCounts.filter(t => t.count > 0),
    compositions: compositionCounts.filter(c => c.count > 0),
  };
}

/**
 * Get photo category distribution statistics (SERVER-SIDE)
 * Returns count and percentage for each category type
 * Uses SQL aggregation for efficiency (no row limit issues)
 */
export async function getCategoryDistribution(): Promise<Array<{ name: string; count: number; percentage: number }>> {
  try {
    // Use raw SQL to do GROUP BY aggregation on database side
    const { data, error } = await supabaseServer.rpc('exec_sql', {
      sql: `
        SELECT
          photo_category as name,
          COUNT(*) as count,
          ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ()), 1) as percentage
        FROM photo_metadata
        WHERE sharpness IS NOT NULL
          AND photo_category IS NOT NULL
        GROUP BY photo_category
        ORDER BY count DESC
      `
    });

    if (error) {
      throw error; // Trigger fallback
    }

    // Process SQL results
    return (data || []).map((row: CategoryDistributionRow) => ({
      name: row.name,
      count: parseInt(row.count.toString()),
      percentage: parseFloat(row.percentage.toString())
    }));
  } catch (error) {
    // Fallback: Use individual COUNT queries for each category
    console.warn('[Supabase Server] exec_sql RPC not found, using native query method for categories:', error);

    try {
      // Get total count first
      const { count: totalCount, error: countError } = await supabaseServer
        .from('photo_metadata')
        .select('*', { count: 'exact', head: true })
        .not('sharpness', 'is', null)
        .not('photo_category', 'is', null);

      if (countError) {
        console.error('[Supabase Server] Error fetching total count for categories:', countError);
        return []; // Return empty array instead of throwing
      }

      const total = totalCount || 0;

      // Known categories from migration SQL
      const categories = ['action', 'celebration', 'candid', 'portrait', 'warmup', 'ceremony'];

      const results = await Promise.all(
        categories.map(async (category) => {
          const { count, error: categoryError } = await supabaseServer
            .from('photo_metadata')
            .select('*', { count: 'exact', head: true })
            .eq('photo_category', category)
            .not('sharpness', 'is', null);

          if (categoryError) {
            console.error(`[Supabase Server] Error fetching count for category ${category}:`, categoryError);
            return { name: category, count: 0, percentage: 0 };
          }

          return {
            name: category,
            count: count || 0,
            percentage: parseFloat(((count || 0) / total * 100).toFixed(1))
          };
        })
      );

      return results
        .filter(c => c.count > 0)
        .sort((a, b) => b.count - a.count);
    } catch (fallbackError) {
      console.error('[Supabase Server] Critical error in getCategoryDistribution fallback:', fallbackError);
      return []; // Return empty array as last resort
    }
  }
}

export async function fetchPhotosByPeriod(options: {
  page?: number;
  limit?: number;
  includeFeatured?: boolean;
  sportFilter?: string;
  categoryFilter?: string;
}) {
  const { page = 1, limit = 12, includeFeatured = false, sportFilter, categoryFilter } = options;
  const offset = (page - 1) * limit;

  try {
    // Use raw SQL to get periods with photo counts (GROUP BY approach)
    const { data: periods, error: periodsError } = await supabaseServer.rpc('exec_sql', {
      sql: `
        SELECT
          EXTRACT(YEAR FROM upload_date) as year,
          EXTRACT(MONTH FROM upload_date) as month,
          COUNT(*) as photo_count
        FROM photo_metadata
        WHERE sharpness IS NOT NULL
          AND upload_date IS NOT NULL
          ${sportFilter ? `AND sport_type = '${sportFilter}'` : ''}
          ${categoryFilter ? `AND photo_category = '${categoryFilter}'` : ''}
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

          let photoQuery = supabaseServer
            .from('photo_metadata')
            .select('*')
            .gte('upload_date', startDate.toISOString())
            .lt('upload_date', endDate.toISOString())
            .not('sharpness', 'is', null);

          // Apply filters
          if (sportFilter) {
            photoQuery = photoQuery.eq('sport_type', sportFilter);
          }

          if (categoryFilter) {
            photoQuery = photoQuery.eq('photo_category', categoryFilter);
          }

          const { data: photos } = await photoQuery
            .order('emotional_impact', { ascending: false })
            .limit(6); // Top 6 photos per period

          return {
            ...period,
            featuredPhotos: (photos || []).map((row: PhotoMetadataRow) => {
              // PERFORMANCE FIX: Use size-optimized SmugMug URLs
              const baseImageUrl = (row.ImageUrl || row.OriginalUrl || '').replace('photos.smugmug.com', 'ninochavez.smugmug.com');
              const baseThumbnailUrl = row.ThumbnailUrl?.replace('photos.smugmug.com', 'ninochavez.smugmug.com');
              const baseOriginalUrl = row.OriginalUrl?.replace('photos.smugmug.com', 'ninochavez.smugmug.com');

              // Optimize sizes for timeline thumbnails
              const imageUrl = getOptimizedSmugMugUrl(baseImageUrl, 'grid') || baseImageUrl; // S-size (400px)
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
                  play_type: (row.play_type || null) as Photo['metadata']['play_type'],
                  action_intensity: (row.action_intensity || 'medium') as Photo['metadata']['action_intensity'],
                  sport_type: row.sport_type,
                  photo_category: row.photo_category,
                  composition: (row.composition || '') as Photo['metadata']['composition'],
                  time_of_day: (row.time_of_day || '') as Photo['metadata']['time_of_day'],
                  lighting: (row.lighting || undefined) as Photo['metadata']['lighting'],
                  color_temperature: (row.color_temperature || undefined) as Photo['metadata']['color_temperature'],

                  // BUCKET 2: Abstract & Internal (AI-only)
                  emotion: (row.emotion || 'focus') as Photo['metadata']['emotion'],
                  sharpness: row.sharpness ?? 0,
                  composition_score: row.composition_score ?? 0,
                  exposure_accuracy: row.exposure_accuracy ?? 0,
                  emotional_impact: row.emotional_impact ?? 0,
                  time_in_game: (row.time_in_game || undefined) as Photo['metadata']['time_in_game'],
                  athlete_id: row.athlete_id || undefined,
                  event_id: row.event_id || undefined,

                  // AI metadata
                  ai_provider: (row.ai_provider || 'gemini') as Photo['metadata']['ai_provider'],
                  ai_cost: row.ai_cost ?? 0,
                  ai_confidence: row.ai_confidence ?? 0,
                  enriched_at: row.enriched_at || new Date().toISOString(),
                },
              } as Photo;
            })
          };
        })
      );

      return periodsWithPhotos;
    }

    // Return just periods without photos
    return processedPeriods;

  } catch (error) {
    console.error('[Supabase] Error with SQL approach, using manual fallback:', error);

    // Manual fallback: fetch photos and group them in memory
    let query = supabaseServer
      .from('photo_metadata')
      .select('upload_date')
      .not('sharpness', 'is', null)
      .not('upload_date', 'is', null);

    if (sportFilter) {
      query = query.eq('sport_type', sportFilter);
    }

    if (categoryFilter) {
      query = query.eq('photo_category', categoryFilter);
    }

    const { data: allPhotos, error: photosError } = await query
      .order('upload_date', { ascending: false })
      .limit(1000); // Get a reasonable sample

    if (photosError) {
      console.error('[Supabase] Fallback query also failed:', photosError);
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

          let photoQuery = supabaseServer
            .from('photo_metadata')
            .select('*')
            .gte('upload_date', startDate.toISOString())
            .lt('upload_date', endDate.toISOString())
            .not('sharpness', 'is', null);

          // Apply filters
          if (sportFilter) {
            photoQuery = photoQuery.eq('sport_type', sportFilter);
          }

          if (categoryFilter) {
            photoQuery = photoQuery.eq('photo_category', categoryFilter);
          }

          const { data: photos } = await photoQuery
            .order('emotional_impact', { ascending: false })
            .limit(6); // Top 6 photos per period

          return {
            year: period.year,
            month: period.month,
            monthName: new Date(period.year, period.month - 1).toLocaleString('default', { month: 'long' }),
            photoCount: period.count,
            featuredPhotos: (photos || []).map((row: PhotoMetadataRow) => {
              // PERFORMANCE FIX: Use size-optimized SmugMug URLs
              const baseImageUrl = (row.ImageUrl || row.OriginalUrl || '').replace('photos.smugmug.com', 'ninochavez.smugmug.com');
              const baseThumbnailUrl = row.ThumbnailUrl?.replace('photos.smugmug.com', 'ninochavez.smugmug.com');
              const baseOriginalUrl = row.OriginalUrl?.replace('photos.smugmug.com', 'ninochavez.smugmug.com');

              // Optimize sizes for timeline thumbnails
              const imageUrl = getOptimizedSmugMugUrl(baseImageUrl, 'grid') || baseImageUrl; // S-size (400px)
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
                  play_type: (row.play_type || null) as Photo['metadata']['play_type'],
                  action_intensity: (row.action_intensity || 'medium') as Photo['metadata']['action_intensity'],
                  sport_type: row.sport_type,
                  photo_category: row.photo_category,
                  composition: (row.composition || '') as Photo['metadata']['composition'],
                  time_of_day: (row.time_of_day || '') as Photo['metadata']['time_of_day'],
                  lighting: (row.lighting || undefined) as Photo['metadata']['lighting'],
                  color_temperature: (row.color_temperature || undefined) as Photo['metadata']['color_temperature'],

                  // BUCKET 2: Abstract & Internal (AI-only)
                  emotion: (row.emotion || 'focus') as Photo['metadata']['emotion'],
                  sharpness: row.sharpness ?? 0,
                  composition_score: row.composition_score ?? 0,
                  exposure_accuracy: row.exposure_accuracy ?? 0,
                  emotional_impact: row.emotional_impact ?? 0,
                  time_in_game: (row.time_in_game || undefined) as Photo['metadata']['time_in_game'],
                  athlete_id: row.athlete_id || undefined,
                  event_id: row.event_id || undefined,

                  // AI metadata
                  ai_provider: (row.ai_provider || 'gemini') as Photo['metadata']['ai_provider'],
                  ai_cost: row.ai_cost ?? 0,
                  ai_confidence: row.ai_confidence ?? 0,
                  enriched_at: row.enriched_at || new Date().toISOString(),
                },
              } as Photo;
            })
          };
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

/**
 * Fetch all available periods for dropdown options (SERVER-SIDE)
 *
 * This function returns all periods with at least one photo,
 * grouped by year and month, and sorted newest first.
 */
export async function fetchAllPeriods(options?: {
  sportFilter?: string;
  categoryFilter?: string;
}) {
  const { sportFilter, categoryFilter } = options || {};

  try {
    // Use raw SQL to get all periods with photo counts (GROUP BY approach)
    const { data: periods, error: periodsError } = await supabaseServer.rpc('exec_sql', {
      sql: `
        SELECT
          EXTRACT(YEAR FROM upload_date) as year,
          EXTRACT(MONTH FROM upload_date) as month,
          COUNT(*) as photo_count
        FROM photo_metadata
        WHERE sharpness IS NOT NULL
          AND upload_date IS NOT NULL
          ${sportFilter ? `AND sport_type = '${sportFilter}'` : ''}
          ${categoryFilter ? `AND photo_category = '${categoryFilter}'` : ''}
        GROUP BY EXTRACT(YEAR FROM upload_date), EXTRACT(MONTH FROM upload_date)
        ORDER BY year DESC, month DESC
      `
    });

    if (periodsError) {
      throw periodsError; // This will trigger the fallback below
    }

    // Process the periods data
    return (periods || []).map((row: any) => ({
      year: parseInt(row.year.toString()),
      month: parseInt(row.month.toString()),
      monthName: new Date(parseInt(row.year.toString()), parseInt(row.month.toString()) - 1).toLocaleString('default', { month: 'long' }),
      photoCount: parseInt(row.photo_count.toString())
    }));

  } catch (error) {
    console.error('[Supabase] Error with SQL approach for all periods, using manual fallback:', error);

    // Manual fallback: fetch photos and group them in memory
    let query = supabaseServer
      .from('photo_metadata')
      .select('upload_date')
      .not('sharpness', 'is', null)
      .not('upload_date', 'is', null);

    if (sportFilter) {
      query = query.eq('sport_type', sportFilter);
    }

    if (categoryFilter) {
      query = query.eq('photo_category', categoryFilter);
    }

    const { data: allPhotos, error: photosError } = await query
      .order('upload_date', { ascending: false });

    if (photosError) {
      console.error('[Supabase] Fallback query also failed:', photosError);
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

    return Array.from(periodMap.values())
      .sort((a, b) => b.year - a.year || b.month - a.month)
      .map(period => ({
        year: period.year,
        month: period.month,
        monthName: new Date(period.year, period.month - 1).toLocaleString('default', { month: 'long' }),
        photoCount: period.count
      }));
  }
}
