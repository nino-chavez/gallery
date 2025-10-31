/**
 * Timeline Variants Demo - Server Loader
 *
 * Loads same timeline data for comparing different navigation patterns
 */

import { fetchPhotosByPeriod } from '$lib/supabase/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const limit = 100; // Load all periods for demo

  console.log(`[Timeline Variants] Loading ${limit} periods for demo`);

  try {
    const periods = await fetchPhotosByPeriod({
      page: 1,
      limit,
      includeFeatured: false // Don't need photo data for navigation demos
    });

    console.log(`[Timeline Variants] Loaded ${periods.length} periods`);

    return {
      periods,
      hasMore: periods.length === limit,
      currentPage: 1
    };
  } catch (error) {
    console.error('[Timeline Variants] Failed to load timeline data:', error);
    throw error;
  }
};
