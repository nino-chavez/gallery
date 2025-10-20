/**
 * Root Layout Server Load
 *
 * Cache sport/category distributions for the entire session
 * This prevents repeated expensive database queries on every page load
 */

import { getSportDistribution, getCategoryDistribution } from '$lib/supabase/server';
import type { LayoutServerLoad } from './$types';

// Trailing slash behavior: never add trailing slashes (matches main site)
export const trailingSlash = 'never';

// Cache duration: 5 minutes
const CACHE_DURATION_MS = 5 * 60 * 1000;

interface CachedData<T> {
  data: T;
  timestamp: number;
}

// In-memory cache (persists during server runtime)
let sportsCache: CachedData<Awaited<ReturnType<typeof getSportDistribution>>> | null = null;
let categoriesCache: CachedData<Awaited<ReturnType<typeof getCategoryDistribution>>> | null = null;

export const load: LayoutServerLoad = async () => {
  const now = Date.now();

  // Check if sport cache is valid
  if (!sportsCache || now - sportsCache.timestamp > CACHE_DURATION_MS) {
    const sports = await getSportDistribution();
    sportsCache = { data: sports, timestamp: now };
  }

  // Check if category cache is valid
  if (!categoriesCache || now - categoriesCache.timestamp > CACHE_DURATION_MS) {
    const categories = await getCategoryDistribution();
    categoriesCache = { data: categories, timestamp: now };
  }

  return {
    sports: sportsCache.data,
    categories: categoriesCache.data,
  };
};
