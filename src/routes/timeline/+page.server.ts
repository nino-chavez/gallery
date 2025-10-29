/**
 * Server-side data loading for timeline v2 page
 *
 * Pattern: Direct Supabase calls with server client
 * Loads photo periods for timeline display
 */

import { supabaseServer } from '$lib/supabase/server';
import { fetchPhotosByPeriod } from '$lib/supabase/server';
import { fetchAllPeriods } from '$lib/supabase/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  // Parse query params for pagination
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '6'); // Start with fewer for better initial load

  // Parse filter params
  const sportFilter = url.searchParams.get('sport') || undefined;
  const categoryFilter = url.searchParams.get('category') || undefined;

  try {
    // Load initial timeline data
    const periods = await fetchPhotosByPeriod({
      page,
      limit,
      includeFeatured: true,
      sportFilter,
      categoryFilter
    });

    // Load all available periods for dropdown options
    const allPeriods = await fetchAllPeriods({
      sportFilter,
      categoryFilter
    });

    // Get filter options (sports and categories available in the dataset)
    const { data: allPhotosForFilters } = await supabaseServer
      .from('photo_metadata')
      .select('sport_type, photo_category')
      .not('sharpness', 'is', null)
      .not('upload_date', 'is', null);

    const sportCounts = new Map<string, number>();
    const categoryCounts = new Map<string, number>();

    (allPhotosForFilters || []).forEach((row) => {
      if (row.sport_type && row.sport_type !== 'unknown') {
        sportCounts.set(row.sport_type, (sportCounts.get(row.sport_type) || 0) + 1);
      }
      if (row.photo_category && row.photo_category !== 'unknown') {
        categoryCounts.set(row.photo_category, (categoryCounts.get(row.photo_category) || 0) + 1);
      }
    });

    const sports = Array.from(sportCounts.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: 0 // Calculate if needed
      }))
      .sort((a, b) => b.count - a.count);

    const categories = Array.from(categoryCounts.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: 0
      }))
      .sort((a, b) => b.count - a.count);

    return {
      periods,
      allPeriods,
      currentPage: page,
      hasMore: periods.length === limit,
      selectedSport: sportFilter || null,
      selectedCategory: categoryFilter || null,
      sports,
      categories
    };
  } catch (error) {
    console.error('[Timeline V2 Server] Failed to load periods:', error);
    throw error;
  }
};