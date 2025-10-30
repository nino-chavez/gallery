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

import { fetchPhotos, getPhotoCount, getFilterCounts, type FilterCounts } from '$lib/supabase/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
  // Get cached data from parent layout
  const { sports, categories, baseFilterCounts } = await parent();

  // Get Bucket 1 (user-facing) filter params from URL
  let sportFilter = url.searchParams.get('sport') || undefined;
  let categoryFilter = url.searchParams.get('category') || undefined;
  let playTypeFilter = url.searchParams.get('play_type') || undefined;
  let intensityFilter = url.searchParams.get('intensity') || undefined;
  let lightingFilters = url.searchParams.getAll('lighting'); // Multi-select
  let colorTempFilter = url.searchParams.get('color_temp') || undefined;
  let timeOfDayFilter = url.searchParams.get('time_of_day') || undefined;
  let compositionFilter = url.searchParams.get('composition') || undefined;
  let searchQuery = url.searchParams.get('q') || undefined;

  // DEBUG: Log the sport filter
  console.log('[DEBUG] Sport filter from URL:', sportFilter);

  // Sort mode (default to quality)
  const sortBy = (url.searchParams.get('sort') || 'quality') as 'quality' | 'newest' | 'oldest' | 'action' | 'intensity';
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1')); // Ensure minimum page 1
  const pageSize = 24; // Fixed page size for consistent pagination
  const offset = (page - 1) * pageSize;

  const filterOptions = {
    sportType: sportFilter,
    photoCategory: categoryFilter,
    playTypes: playTypeFilter ? [playTypeFilter as any] : undefined,
    actionIntensity: intensityFilter ? [intensityFilter as any] : undefined,
    lighting: lightingFilters.length > 0 ? (lightingFilters as any[]) : undefined,
    colorTemperature: colorTempFilter ? [colorTempFilter as any] : undefined,
    timeOfDay: timeOfDayFilter ? [timeOfDayFilter as any] : undefined,
    compositions: compositionFilter ? [compositionFilter as any] : undefined, // Fixed: was 'composition', now 'compositions'
  };

  // Check if any filters are active
  const hasActiveFilters = !!(sportFilter || categoryFilter || playTypeFilter || intensityFilter ||
    lightingFilters.length > 0 || colorTempFilter || timeOfDayFilter || compositionFilter);

  // Intelligent Filter System (Phase 1):
  // - If no filters active: use cached baseFilterCounts (fast, from layout cache)
  // - If filters active: fetch dynamic counts respecting current filters (shows compatible options)
  const filterCountsStart = Date.now();
  const filterCounts = hasActiveFilters
    ? await getFilterCounts(filterOptions)
    : baseFilterCounts;
  const filterCountsTime = Date.now() - filterCountsStart;
  console.log(`[PERF] getFilterCounts took ${filterCountsTime}ms (hasActiveFilters: ${hasActiveFilters})`);

  // Phase 4: Auto-clear incompatible filters (server-side prevention)
  // Check each filter and clear if it has zero results with current combination
  const clearedFilters: string[] = [];

  if (playTypeFilter && filterCounts.playTypes) {
    const playTypeCount = filterCounts.playTypes.find(pt => pt.name === playTypeFilter)?.count || 0;
    if (playTypeCount === 0) {
      clearedFilters.push(`Play Type: ${playTypeFilter}`);
      playTypeFilter = undefined;
      delete filterOptions.playTypes;
    }
  }

  if (intensityFilter && filterCounts.intensities) {
    const intensityCount = filterCounts.intensities.find(i => i.name === intensityFilter)?.count || 0;
    if (intensityCount === 0) {
      clearedFilters.push(`Intensity: ${intensityFilter}`);
      intensityFilter = undefined;
      delete filterOptions.actionIntensity;
    }
  }

  if (categoryFilter && filterCounts.categories) {
    const categoryCount = filterCounts.categories.find(c => c.name === categoryFilter)?.count || 0;
    if (categoryCount === 0) {
      clearedFilters.push(`Category: ${categoryFilter}`);
      categoryFilter = undefined;
      delete filterOptions.photoCategory;
    }
  }

  // Auto-clear lighting filters (multi-select)
  if (lightingFilters.length > 0 && filterCounts.lighting) {
    const incompatibleLighting = lightingFilters.filter(l => {
      const count = filterCounts.lighting?.find(lighting => lighting.name === l)?.count || 0;
      return count === 0;
    });

    if (incompatibleLighting.length > 0) {
      incompatibleLighting.forEach(l => {
        clearedFilters.push(`Lighting: ${l}`);
      });
      lightingFilters = lightingFilters.filter(l => !incompatibleLighting.includes(l));
      if (lightingFilters.length === 0) {
        delete filterOptions.lighting;
      } else {
        filterOptions.lighting = lightingFilters as any[];
      }
    }
  }

  if (colorTempFilter && filterCounts.colorTemperatures) {
    const colorTempCount = filterCounts.colorTemperatures.find(ct => ct.name === colorTempFilter)?.count || 0;
    if (colorTempCount === 0) {
      clearedFilters.push(`Color Temperature: ${colorTempFilter}`);
      colorTempFilter = undefined;
      delete filterOptions.colorTemperature;
    }
  }

  if (timeOfDayFilter && filterCounts.timesOfDay) {
    const timeOfDayCount = filterCounts.timesOfDay.find(t => t.name === timeOfDayFilter)?.count || 0;
    if (timeOfDayCount === 0) {
      clearedFilters.push(`Time of Day: ${timeOfDayFilter}`);
      timeOfDayFilter = undefined;
      delete filterOptions.timeOfDay;
    }
  }

  if (compositionFilter && filterCounts.compositions) {
    const compositionCount = filterCounts.compositions.find(c => c.name === compositionFilter)?.count || 0;
    if (compositionCount === 0) {
      clearedFilters.push(`Composition: ${compositionFilter}`);
      compositionFilter = undefined;
      delete filterOptions.compositions;
    }
  }

  // DEBUG: Log filter options before fetch
  console.log('[DEBUG] Filter options being sent to fetchPhotos:', {
    ...filterOptions,
    limit: pageSize,
    offset,
    sortBy,
  });

  // Fetch photos with pagination (after auto-clear)
  const photosStart = Date.now();
  const photos = await fetchPhotos({
    ...filterOptions,
    limit: pageSize,
    offset,
    sortBy,
  });
  const photosTime = Date.now() - photosStart;
  console.log(`[PERF] fetchPhotos took ${photosTime}ms`);

  // DEBUG: Log first 3 photos returned
  console.log('[DEBUG] First 3 photos returned:', photos.slice(0, 3).map(p => ({
    id: p.image_key,
    sport: p.metadata?.sport_type
  })));

  // Get total count for "Showing X of Y" (after auto-clear)
  const countStart = Date.now();
  const totalCount = await getPhotoCount(filterOptions);
  const countTime = Date.now() - countStart;
  console.log(`[PERF] getPhotoCount took ${countTime}ms`);
  console.log(`[PERF] TOTAL server load time: ${Date.now() - filterCountsStart}ms`);

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
    filterCounts, // NEW: Dynamic result counts for smart filtering
    clearedFilters, // Phase 4: List of auto-cleared filters for notification
    searchQuery, // Global search query from URL
  };
};
