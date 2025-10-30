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

  console.log('[Timeline Server] Loading with filters:', { sportFilter, categoryFilter, page, limit });

  try {
    // Load initial timeline data
    const periods = await fetchPhotosByPeriod({
      page,
      limit,
      includeFeatured: true,
      sportFilter,
      categoryFilter
    });

    console.log('[Timeline Server] Fetched periods:', periods?.length, 'periods');
    if (periods && periods.length > 0) {
      console.log('[Timeline Server] First period sample:', {
        year: periods[0].year,
        month: periods[0].month,
        photoCount: periods[0].photoCount,
        featuredPhotosCount: periods[0].featuredPhotos?.length,
        firstPhotoImageUrl: periods[0].featuredPhotos?.[0]?.image_url,
        firstPhotoThumbnailUrl: periods[0].featuredPhotos?.[0]?.thumbnail_url
      });
    }

    // Load all available periods for dropdown options
    const allPeriods = await fetchAllPeriods({
      sportFilter,
      categoryFilter
    });

    console.log('[Timeline Server] All periods count:', allPeriods?.length);

    // Get filter options (sports and categories available in the dataset)
    const { data: allPhotosForFilters } = await supabaseServer
      .from('photo_metadata')
      .select('sport_type, photo_category')
      .not('sharpness', 'is', null)
      .not('upload_date', 'is', null);

    console.log('[Timeline Server] Photos for filters count:', allPhotosForFilters?.length);

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

    console.log('[Timeline Server] Filter options:', {
      sportsCount: sports.length,
      categoriesCount: categories.length,
      topSport: sports[0]?.name,
      topCategory: categories[0]?.name
    });

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