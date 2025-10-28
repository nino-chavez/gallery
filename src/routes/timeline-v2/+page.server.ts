/**
 * Server-side data loading for timeline v2 page
 *
 * Pattern: Direct Supabase calls with server client
 * Loads photo periods for timeline display
 */

import { fetchPhotosByPeriod } from '$lib/supabase/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  // Parse query params for pagination
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '12');

  try {
    // Load initial timeline data
    const periods = await fetchPhotosByPeriod({
      page,
      limit,
      includeFeatured: true
    });

    return {
      periods,
      currentPage: page,
      hasMore: periods.length === limit
    };
  } catch (error) {
    console.error('[Timeline V2 Server] Failed to load periods:', error);
    throw error;
  }
};