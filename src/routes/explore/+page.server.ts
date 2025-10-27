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
  const lightingFilter = url.searchParams.get('lighting') || undefined;
  const colorTempFilter = url.searchParams.get('color_temp') || undefined;

  // Sort mode (default to newest)
  const sortBy = (url.searchParams.get('sort') || 'newest') as 'newest' | 'oldest' | 'action' | 'intensity';
  const page = parseInt(url.searchParams.get('page') || '1');
  const pageSize = 24;
  const offset = (page - 1) * pageSize;

  const filterOptions = {
    sportType: sportFilter,
    photoCategory: categoryFilter,
    lighting: lightingFilter ? [lightingFilter] : undefined,
    colorTemperature: colorTempFilter ? [colorTempFilter] : undefined,
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
    selectedLighting: lightingFilter || null,
    selectedColorTemp: colorTempFilter || null,
  };
};
