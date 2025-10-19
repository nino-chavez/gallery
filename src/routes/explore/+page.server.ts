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

import { fetchPhotos, getPhotoCount, getSportDistribution, getCategoryDistribution } from '$lib/supabase/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  // Get filter params from URL
  const portfolioOnly = url.searchParams.get('portfolio') === 'true';
  const minQuality = url.searchParams.get('minQuality');
  const sportFilter = url.searchParams.get('sport') || undefined; // NEW: Sport filtering
  const categoryFilter = url.searchParams.get('category') || undefined; // NEW: Category filtering
  const sortBy = (url.searchParams.get('sort') || 'newest') as 'newest' | 'oldest' | 'highest_quality' | 'lowest_quality';
  const page = parseInt(url.searchParams.get('page') || '1');
  const pageSize = 24;
  const offset = (page - 1) * pageSize;

  const filterOptions = {
    portfolioWorthy: portfolioOnly || undefined,
    minQualityScore: minQuality ? parseFloat(minQuality) : undefined,
    sportType: sportFilter, // NEW: Pass sport filter
    photoCategory: categoryFilter, // NEW: Pass category filter
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

  // Get sport distribution for filter UI (NEW)
  const sports = await getSportDistribution();

  // Get category distribution for filter UI (NEW)
  const categories = await getCategoryDistribution();

  return {
    photos,
    totalCount,
    currentPage: page,
    pageSize,
    sortBy,
    sports, // NEW: Sport distribution data
    selectedSport: sportFilter || null, // NEW: Currently selected sport
    categories, // NEW: Category distribution data
    selectedCategory: categoryFilter || null, // NEW: Currently selected category
    initialFilters: {
      portfolioOnly,
      minQuality: minQuality ? parseFloat(minQuality) : 0,
    },
  };
};
