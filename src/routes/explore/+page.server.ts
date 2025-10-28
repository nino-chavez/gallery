/**
 * Server-side data loading for /explore route
 *
 * This demonstrates the correct SvelteKit pattern:
 * - Direct Supabase calls in +page.server.ts using SERVER client
 * - NO self-fetch anti-pattern (no API route needed!)
 * - Data passed to page component via `data` prop
 *
 * ⚠️ IMPORTANT: We use $lib/supabase/server.ts (not client.ts) here
 * because this code runs SERVER-SIDE ONLY
 */

import { fetchPhotos, getPhotoCount } from '$lib/supabase/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
  // Get cached sport/category distributions from layout
  const { sports, categories } = await parent();

  // Get Bucket 1 (user-facing) filter params from URL
  const sportFilter = url.searchParams.get('sport') || undefined;
  const categoryFilter = url.searchParams.get('category') || undefined;
  const playTypeFilter = url.searchParams.get('play_type') || undefined;
  const intensityFilter = url.searchParams.get('intensity') || undefined;
  const lightingFilters = url.searchParams.getAll('lighting'); // Multi-select
  const colorTempFilter = url.searchParams.get('color_temp') || undefined;
  const timeOfDayFilter = url.searchParams.get('time_of_day') || undefined;
  const compositionFilter = url.searchParams.get('composition') || undefined;

  // Sort mode (default to newest)
  const sortBy = (url.searchParams.get('sort') || 'newest') as 'newest' | 'oldest' | 'action' | 'intensity';
  const page = parseInt(url.searchParams.get('page') || '1');
  const pageSize = 24;
  const offset = (page - 1) * pageSize;

  const filterOptions = {
    sportType: sportFilter,
    photoCategory: categoryFilter,
    playTypes: playTypeFilter ? [playTypeFilter as any] : undefined,
    actionIntensity: intensityFilter ? [intensityFilter as any] : undefined,
    lighting: lightingFilters.length > 0 ? (lightingFilters as any[]) : undefined,
    colorTemperature: colorTempFilter ? [colorTempFilter as any] : undefined,
    timeOfDay: timeOfDayFilter ? [timeOfDayFilter as any] : undefined,
    composition: compositionFilter ? [compositionFilter as any] : undefined,
  };

  // Fetch photos with pagination
  const photos = await fetchPhotos({
    ...filterOptions,
    limit: pageSize,
    offset,
    sortBy,
  });

  // Get total count for "Showing X of Y"
  const totalCount = await getPhotoCount(filterOptions);

  return {
    photos,
    totalCount,
    currentPage: page,
    pageSize,
    sortBy,
    sports, // From parent layout (cached)
    selectedSport: sportFilter || null,
    categories, // From parent layout (cached)
    selectedCategory: categoryFilter || null,
    selectedPlayType: playTypeFilter || null,
    selectedIntensity: intensityFilter || null,
    selectedLighting: lightingFilters.length > 0 ? lightingFilters : null,
    selectedColorTemp: colorTempFilter || null,
    selectedTimeOfDay: timeOfDayFilter || null,
    selectedComposition: compositionFilter || null,
  };
};
