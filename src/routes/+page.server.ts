/**
 * Homepage Server Load Function
 * Fetches a random portfolio-worthy photo for the hero section with album diversity
 *
 * Hero Photo Selection Strategy:
 * 1. Fetch 500 high-quality volleyball photos with relaxed criteria to ensure variety
 * 2. Group photos by album_name/album_key
 * 3. From each album, select top 10 photos by quality score (sharpness + composition + impact)
 * 4. Pick random photo from this balanced pool (max 10 photos per album)
 *
 * Quality Criteria:
 * - Technical quality (sharpness ≥ 7.5)
 * - Composition (composition_score ≥ 7.5)
 * - Emotional impact (emotional_impact ≥ 7.0)
 * - Hero-worthy categories (action, celebration, portrait)
 * - Volleyball photos ONLY (primary portfolio focus)
 *
 * This approach prevents the hero from being dominated by a single recent album
 * (e.g., VLA BREEZE - Fall 2025 with 213 photos) while maintaining high quality standards.
 * Typical result: 70+ photos from 7+ different albums in the selection pool.
 */

import type { PageServerLoad } from './$types';
import { supabaseServer } from '$lib/supabase/server';
import type { Photo } from '$types/photo';
import type { PhotoMetadataRow } from '$types/database';

/**
 * Map database row to Photo type
 */
function mapRowToPhoto(row: PhotoMetadataRow): Photo {
  const imageUrl = row.ImageUrl || row.OriginalUrl || `/api/smugmug/images/${row.image_key}`;
  const thumbnailUrl = row.ThumbnailUrl || undefined;
  const originalUrl = row.OriginalUrl || undefined;

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
      // BUCKET 1: Concrete & Filterable
      play_type: (row.play_type || null) as Photo['metadata']['play_type'],
      action_intensity: (row.action_intensity || 'medium') as Photo['metadata']['action_intensity'],
      sport_type: row.sport_type,
      photo_category: row.photo_category,
      composition: (row.composition || '') as Photo['metadata']['composition'],
      time_of_day: (row.time_of_day || '') as Photo['metadata']['time_of_day'],
      lighting: (row.lighting || undefined) as Photo['metadata']['lighting'],
      color_temperature: (row.color_temperature || undefined) as Photo['metadata']['color_temperature'],

      // BUCKET 2: Abstract & Internal
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
}

export const load: PageServerLoad = async () => {
  try {
    // Fetch high-quality volleyball photos for hero display with album diversity
    // Strategy: Get MORE photos than needed, then distribute across albums
    // Schema v2: All photos are worthy, use internal quality metrics for selection
    const { data, error } = await supabaseServer
      .from('photo_metadata')
      .select('*')
      .eq('sport_type', 'volleyball')         // Volleyball photos only
      .gte('sharpness', 7.5)                  // Lower threshold for more diversity
      .gte('composition_score', 7.5)          // Lower threshold for more diversity
      .gte('emotional_impact', 7.0)           // Lower threshold for more diversity
      .in('photo_category', ['action', 'celebration', 'portrait'])  // Hero-worthy categories
      .not('sharpness', 'is', null)
      .order('photo_date', { ascending: false })  // Most recent first
      .limit(500); // Fetch many candidates to ensure album diversity

    if (error) {
      console.error('[Homepage] Error fetching hero photo:', error);
      return { heroPhoto: null };
    }

    if (!data || data.length === 0) {
      console.warn('[Homepage] No high-quality volleyball photos found, using fallback strategies');

      // Fallback 1: Volleyball without strict quality filters
      const { data: fallbackData, error: fallbackError } = await supabaseServer
        .from('photo_metadata')
        .select('*')
        .eq('sport_type', 'volleyball')
        .not('sharpness', 'is', null)
        .limit(50);

      if (fallbackData && fallbackData.length > 0) {
        const randomIndex = Math.floor(Math.random() * fallbackData.length);
        const row = fallbackData[randomIndex];
        return { heroPhoto: mapRowToPhoto(row) };
      }

      // Fallback 2: Any photo (multi-sport)
      console.warn('[Homepage] No volleyball photos available, using any photo');
      const { data: anyPhotoData, error: anyPhotoError } = await supabaseServer
        .from('photo_metadata')
        .select('*')
        .not('sharpness', 'is', null)
        .limit(50);

      if (anyPhotoError || !anyPhotoData || anyPhotoData.length === 0) {
        console.error('[Homepage] No photos available at all');
        return { heroPhoto: null };
      }

      const randomIndex = Math.floor(Math.random() * anyPhotoData.length);
      const row = anyPhotoData[randomIndex];
      return { heroPhoto: mapRowToPhoto(row) };
    }

    // Group photos by album to ensure diversity
    const albumGroups = new Map<string, PhotoMetadataRow[]>();
    for (const photo of data) {
      const albumKey = photo.album_name || photo.album_key || 'unknown';
      if (!albumGroups.has(albumKey)) {
        albumGroups.set(albumKey, []);
      }
      albumGroups.get(albumKey)!.push(photo);
    }

    // Limit to max 10 photos per album to force diversity
    const MAX_PER_ALBUM = 10;
    const balancedPhotos: PhotoMetadataRow[] = [];

    for (const [albumName, photos] of albumGroups.entries()) {
      // Sort by quality (sum of scores) and take top photos from each album
      const sorted = photos.sort((a, b) => {
        const scoreA = (a.sharpness || 0) + (a.composition_score || 0) + (a.emotional_impact || 0);
        const scoreB = (b.sharpness || 0) + (b.composition_score || 0) + (b.emotional_impact || 0);
        return scoreB - scoreA;
      });

      // Take up to MAX_PER_ALBUM photos from this album
      balancedPhotos.push(...sorted.slice(0, MAX_PER_ALBUM));
    }

    // Pick random photo from the balanced set
    const randomIndex = Math.floor(Math.random() * balancedPhotos.length);
    const row = balancedPhotos[randomIndex];

    return { heroPhoto: mapRowToPhoto(row) };
  } catch (err) {
    console.error('[Homepage] Critical error in load function:', err);
    return { heroPhoto: null };
  }
};
