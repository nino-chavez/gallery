/**
 * API endpoint for loading timeline periods
 * Supports pagination for lazy loading
 */

import { fetchPhotosByPeriod } from '$lib/supabase/server';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '6');
    const sport = url.searchParams.get('sport') || undefined;
    const category = url.searchParams.get('category') || undefined;

    const periods = await fetchPhotosByPeriod({
      page,
      limit,
      includeFeatured: true,
      sportFilter: sport,
      categoryFilter: category
    });

    return json({
      periods,
      hasMore: periods.length === limit,
      page
    });
  } catch (error) {
    console.error('[Timeline API] Failed to load periods:', error);
    return json({ error: 'Failed to load timeline data' }, { status: 500 });
  }
};