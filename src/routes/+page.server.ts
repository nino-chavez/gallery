/**
 * Homepage Server Load Function
 * Fetches a random portfolio-worthy photo for the hero section
 *
 * Hero Photo Selection Criteria:
 * - Portfolio-worthy (curated flag)
 * - High technical quality (sharpness ≥ 8.0)
 * - Strong composition (composition_score ≥ 8.0)
 * - Emotional impact (emotional_impact ≥ 7.5)
 * - Print-ready (ensures high resolution)
 * - Action category (excludes warmup, ceremony, candid)
 * - Volleyball photos ONLY (primary portfolio focus)
 *
 * These filters ensure the homepage always showcases the absolute best work.
 */

import type { PageServerLoad } from './$types';
import { supabaseServer } from '$lib/supabase/server';
import type { Photo } from '$types/photo';

/**
 * Map database row to Photo type
 */
function mapRowToPhoto(row: any): Photo {
  const imageUrl = row.ImageUrl || row.OriginalUrl || `/api/smugmug/images/${row.image_key}`;
  const thumbnailUrl = row.ThumbnailUrl || null;
  const originalUrl = row.OriginalUrl || null;

  return {
    id: row.photo_id,
    image_key: row.image_key,
    image_url: imageUrl,
    thumbnail_url: thumbnailUrl,
    original_url: originalUrl,
    title: row.image_key,
    caption: '',
    keywords: [],
    created_at: row.photo_date || row.enriched_at,
    metadata: {
      // BUCKET 1: Concrete & Filterable
      play_type: row.play_type,
      action_intensity: row.action_intensity || 'medium',
      sport_type: row.sport_type,
      photo_category: row.photo_category,
      composition: row.composition || '',
      time_of_day: row.time_of_day || '',
      lighting: row.lighting,
      color_temperature: row.color_temperature,

      // BUCKET 2: Abstract & Internal
      emotion: row.emotion || 'focus',
      sharpness: parseFloat(row.sharpness) || 0,
      composition_score: parseFloat(row.composition_score) || 0,
      exposure_accuracy: parseFloat(row.exposure_accuracy) || 0,
      emotional_impact: parseFloat(row.emotional_impact) || 0,
      time_in_game: row.time_in_game,
      athlete_id: row.athlete_id,
      event_id: row.event_id,

      // AI metadata
      ai_provider: row.ai_provider || 'gemini',
      ai_cost: parseFloat(row.ai_cost) || 0,
      ai_confidence: parseFloat(row.ai_confidence) || 0,
      enriched_at: row.enriched_at || new Date().toISOString(),
    },
  };
}

export const load: PageServerLoad = async () => {
  try {
    // Fetch optimal volleyball portfolio photos for hero display
    // Using strict quality thresholds to ensure only the best work is shown
    const { data, error } = await supabaseServer
      .from('photo_metadata')
      .select('*')
      .eq('portfolio_worthy', true)           // Must be curated
      .eq('print_ready', true)                // Must be high-resolution
      .eq('sport_type', 'volleyball')         // Volleyball photos only
      .gte('sharpness', 8.0)                  // Technical excellence
      .gte('composition_score', 8.0)          // Strong composition
      .gte('emotional_impact', 7.5)           // Visual impact
      .in('photo_category', ['action', 'celebration', 'portrait'])  // Hero-worthy categories
      .not('sharpness', 'is', null)
      .limit(15); // Fetch 15 candidates for variety

    if (error) {
      console.error('[Homepage] Error fetching hero photo:', error);
      return { heroPhoto: null };
    }

    if (!data || data.length === 0) {
      console.warn('[Homepage] No optimal volleyball hero photos found, trying fallback strategies');

      // Fallback 1: Portfolio-worthy volleyball without strict quality filters
      const { data: fallbackData, error: fallbackError } = await supabaseServer
        .from('photo_metadata')
        .select('*')
        .eq('portfolio_worthy', true)
        .eq('sport_type', 'volleyball')
        .not('sharpness', 'is', null)
        .limit(10);

      if (fallbackData && fallbackData.length > 0) {
        const randomIndex = Math.floor(Math.random() * fallbackData.length);
        const row = fallbackData[randomIndex];
        return { heroPhoto: mapRowToPhoto(row) };
      }

      // Fallback 2: Any portfolio-worthy photo (multi-sport)
      console.warn('[Homepage] No volleyball photos available, using any portfolio-worthy photo');
      const { data: anyPortfolioData, error: anyPortfolioError } = await supabaseServer
        .from('photo_metadata')
        .select('*')
        .eq('portfolio_worthy', true)
        .not('sharpness', 'is', null)
        .limit(10);

      if (anyPortfolioError || !anyPortfolioData || anyPortfolioData.length === 0) {
        console.error('[Homepage] No portfolio photos available at all');
        return { heroPhoto: null };
      }

      const randomIndex = Math.floor(Math.random() * anyPortfolioData.length);
      const row = anyPortfolioData[randomIndex];
      return { heroPhoto: mapRowToPhoto(row) };
    }

    // Pick random photo from the optimal candidates
    const randomIndex = Math.floor(Math.random() * data.length);
    const row = data[randomIndex];

    return { heroPhoto: mapRowToPhoto(row) };
  } catch (err) {
    console.error('[Homepage] Critical error in load function:', err);
    return { heroPhoto: null };
  }
};
