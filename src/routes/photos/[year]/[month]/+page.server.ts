/**
 * Month Detail Page Server Loader
 *
 * Loads all photos for a specific year and month
 * Provides navigation to adjacent months
 *
 * Route: /photos/[year]/[month]
 * Example: /photos/2025/10 → October 2025
 */

import { error } from '@sveltejs/kit';
import { fetchPhotosByYearMonth, getAdjacentMonth } from '$lib/supabase/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
  // Parse and validate year/month params
  const year = parseInt(params.year);
  const month = parseInt(params.month);

  // Validate params
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    throw error(404, 'Invalid year or month');
  }

  // Parse sort param
  const sortBy = (url.searchParams.get('sort') as 'newest' | 'oldest' | 'quality') || 'newest';

  console.log(`[Month Detail Server] Loading photos for ${year}-${month}`, { sortBy });

  try {
    // Fetch photos for this month
    const photos = await fetchPhotosByYearMonth(year, month, { sortBy });

    if (photos.length === 0) {
      throw error(404, `No photos found for ${year}-${month}`);
    }

    // Get adjacent months for navigation
    const [prevMonth, nextMonth] = await Promise.all([
      getAdjacentMonth(year, month, 'prev'),
      getAdjacentMonth(year, month, 'next')
    ]);

    // Format month name
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

    console.log(`[Month Detail Server] Loaded ${photos.length} photos`, {
      prevMonth: prevMonth ? `${prevMonth.year}-${prevMonth.month}` : null,
      nextMonth: nextMonth ? `${nextMonth.year}-${nextMonth.month}` : null
    });

    return {
      photos,
      year,
      month,
      monthName,
      prevMonth,
      nextMonth,
      sortBy,
      photoCount: photos.length
    };
  } catch (err) {
    console.error('[Month Detail Server] Failed to load photos:', err);
    throw error(500, 'Failed to load photos');
  }
};
