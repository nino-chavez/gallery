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

// Server-side environment variables (NOT exposed to browser)
// In SvelteKit, we need to use import.meta.env even server-side
// but we can use non-VITE_ prefixed vars if we set them up in svelte.config.js
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_ANON_KEY; // For now, using anon key (read-only is safe)

// TODO: Once we need write operations, add SUPABASE_SERVICE_ROLE_KEY to .env.local
// and update SvelteKit config to expose it server-side only

if (!supabaseUrl) {
  throw new Error('[Server] Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseServiceRoleKey) {
  throw new Error('[Server] Missing Supabase key environment variable');
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
  sortBy?: 'newest' | 'oldest' | 'highest_quality' | 'lowest_quality';
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

  // Apply sorting
  switch (sortBy) {
    case 'newest':
      // Use upload_date (SmugMug upload) or date_added (album add) as fallback
      // photo_date is currently backfilled with enriched_at which is incorrect for sorting
      query = query.order('upload_date', { ascending: false });
      break;
    case 'oldest':
      query = query.order('upload_date', { ascending: true });
      break;
    case 'highest_quality':
      query = query.order('quality_score', { ascending: false });
      break;
    case 'lowest_quality':
      query = query.order('quality_score', { ascending: true });
      break;
  }

  // Apply filters - columns are directly on the table
  if (filters?.portfolioWorthy) {
    query = query.eq('portfolio_worthy', true);
  }

  // Quality score filter (uses computed column from database)
  if (filters?.minQualityScore) {
    query = query.gte('quality_score', filters.minQualityScore);
  }

  if (filters?.maxQualityScore) {
    query = query.lte('quality_score', filters.maxQualityScore);
  }

  if (filters?.printReady) {
    query = query.eq('print_ready', true);
  }

  if (filters?.socialMediaOptimized) {
    query = query.eq('social_media_optimized', true);
  }

  if (filters?.playTypes && filters.playTypes.length > 0) {
    query = query.in('play_type', filters.playTypes);
  }

  if (filters?.emotions && filters.emotions.length > 0) {
    query = query.in('emotion', filters.emotions);
  }

  if (filters?.actionIntensity && filters.actionIntensity.length > 0) {
    query = query.in('action_intensity', filters.actionIntensity);
  }

  if (filters?.albumKey) {
    query = query.eq('album_key', filters.albumKey);
  }

  // Sport type filter (NEW - Week 2)
  if (filters?.sportType) {
    query = query.eq('sport_type', filters.sportType);
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

  // Map photo_metadata to Photo type
  const photos: Photo[] = (data || []).map((row: any) => {
    const imageUrl = row.ImageUrl || row.OriginalUrl || `/api/smugmug/images/${row.image_key}`;
    const thumbnailUrl = row.ThumbnailUrl || null;
    const originalUrl = row.OriginalUrl || null;

    return {
      id: row.photo_id,
      image_key: row.image_key,
      image_url: imageUrl,
      thumbnail_url: thumbnailUrl,
      original_url: originalUrl,
      title: row.image_key, // Placeholder
      caption: '',
      keywords: [],
      created_at: row.photo_date || row.enriched_at,
      metadata: {
        sharpness: parseFloat(row.sharpness) || 0,
        exposure_accuracy: parseFloat(row.exposure_accuracy) || 0,
        composition_score: parseFloat(row.composition_score) || 0,
        emotional_impact: parseFloat(row.emotional_impact) || 0,
        portfolio_worthy: row.portfolio_worthy ?? false,
        print_ready: row.print_ready ?? false,
        social_media_optimized: row.social_media_optimized ?? false,
        emotion: row.emotion || 'focus',
        composition: row.composition || '',
        time_of_day: row.time_of_day || '',
        play_type: row.play_type,
        action_intensity: row.action_intensity || 'medium',
        // Sport taxonomy (NEW - Week 1)
        sport_type: row.sport_type,
        photo_category: row.photo_category,
        action_type: row.action_type,
        use_cases: row.use_cases || [],
        ai_provider: row.ai_provider || 'gemini',
        ai_cost: parseFloat(row.ai_cost) || 0,
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

  // Apply same filters as fetchPhotos
  if (filters?.portfolioWorthy) {
    query = query.eq('portfolio_worthy', true);
  }

  if (filters?.minQualityScore) {
    query = query.gte('quality_score', filters.minQualityScore);
  }

  if (filters?.playTypes && filters.playTypes.length > 0) {
    query = query.in('play_type', filters.playTypes);
  }

  if (filters?.emotions && filters.emotions.length > 0) {
    query = query.in('emotion', filters.emotions);
  }

  // Sport type filter (NEW - Week 2)
  if (filters?.sportType) {
    query = query.eq('sport_type', filters.sportType);
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
    // Fallback: If custom RPC doesn't exist, use Supabase's native aggregation
    // This won't work perfectly but better than nothing
    console.warn('[Supabase Server] exec_sql RPC not found, using native query method');

    // Get total count first
    const { count: totalCount } = await supabaseServer
      .from('photo_metadata')
      .select('*', { count: 'exact', head: true })
      .not('sharpness', 'is', null)
      .not('sport_type', 'is', null)
      .neq('sport_type', 'unknown');

    const total = totalCount || 0;

    // Unfortunately, Supabase JS doesn't support GROUP BY natively
    // So we have to use a workaround: fetch unique sports, then count each
    const sports = ['volleyball', 'portrait', 'basketball', 'softball', 'soccer', 'track', 'football', 'baseball'];

    const results = await Promise.all(
      sports.map(async (sport) => {
        const { count } = await supabaseServer
          .from('photo_metadata')
          .select('*', { count: 'exact', head: true })
          .eq('sport_type', sport)
          .not('sharpness', 'is', null);

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
  }

  // Process SQL results
  return (data || []).map((row: any) => ({
    name: row.name,
    count: parseInt(row.count),
    percentage: parseFloat(row.percentage)
  }));
}
