/**
 * Root Layout Server Load
 *
 * Cache distributions and base filter counts for the entire session
 * This prevents repeated expensive database queries on every page load
 *
 * Phase 1 of Intelligent Filter System:
 * - Caches base filter counts (no filters applied) every 5 minutes
 * - Individual pages fetch filtered counts based on current URL params
 */

import { getSportDistribution, getCategoryDistribution, getFilterCounts, type FilterCounts } from '$lib/supabase/server';
import type { LayoutServerLoad } from './$types';

// Trailing slash behavior: always use trailing slashes
export const trailingSlash = 'always';

// Cache duration: 5 minutes
const CACHE_DURATION_MS = 5 * 60 * 1000;

interface CachedData<T> {
  data: T;
  timestamp: number;
}

// In-memory cache (persists during server runtime)
let sportsCache: CachedData<Awaited<ReturnType<typeof getSportDistribution>>> | null = null;
let categoriesCache: CachedData<Awaited<ReturnType<typeof getCategoryDistribution>>> | null = null;
let baseFilterCountsCache: CachedData<FilterCounts> | null = null;

export const load: LayoutServerLoad = async () => {
  const now = Date.now();

  // PERFORMANCE: Refresh expired caches in parallel
  // When cache expires, all 3 queries execute simultaneously instead of sequentially
  const refreshPromises: Promise<void>[] = [];

  // Check if sport cache is valid
  if (!sportsCache || now - sportsCache.timestamp > CACHE_DURATION_MS) {
    refreshPromises.push(
      getSportDistribution().then((sports) => {
        sportsCache = { data: sports, timestamp: now };
      })
    );
  }

  // Check if category cache is valid
  if (!categoriesCache || now - categoriesCache.timestamp > CACHE_DURATION_MS) {
    refreshPromises.push(
      getCategoryDistribution().then((categories) => {
        categoriesCache = { data: categories, timestamp: now };
      })
    );
  }

  // Check if base filter counts cache is valid
  // These are counts with NO filters applied (baseline for entire gallery)
  if (!baseFilterCountsCache || now - baseFilterCountsCache.timestamp > CACHE_DURATION_MS) {
    refreshPromises.push(
      getFilterCounts().then((baseFilterCounts) => {
        baseFilterCountsCache = { data: baseFilterCounts, timestamp: now };
      })
    );
  }

  // Wait for all cache refreshes to complete in parallel
  if (refreshPromises.length > 0) {
    await Promise.all(refreshPromises);
  }

  // TypeScript safety: Ensure all caches are populated (should always be true after awaits)
  if (!sportsCache || !categoriesCache || !baseFilterCountsCache) {
    throw new Error('Failed to initialize layout data caches');
  }

  return {
    sports: sportsCache.data,
    categories: categoriesCache.data,
    baseFilterCounts: baseFilterCountsCache.data,
  };
};
