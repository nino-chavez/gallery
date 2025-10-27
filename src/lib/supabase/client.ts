/**
 * Supabase Browser Client for SvelteKit
 *
 * ✅ BROWSER-SAFE - This client can be imported in components
 *
 * Uses the anon (anonymous) key which:
 * - Is safe to expose in browser JavaScript
 * - Enforces Row Level Security (RLS) policies
 * - Provides read-only access (writes blocked by RLS)
 * - Used for client-side queries with TanStack Query
 *
 * Use this client when:
 * - Fetching data from browser components
 * - Using TanStack Query hooks
 * - Implementing real-time subscriptions
 * - Client-side filtering/searching
 */

import { createClient } from '@supabase/supabase-js';

// Browser-safe environment variables (VITE_ prefix = exposed to browser)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('[Client] Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('[Client] Missing VITE_SUPABASE_ANON_KEY environment variable');
}

/**
 * Browser-safe Supabase client
 *
 * This client:
 * - Uses the anonymous (anon) key (safe to expose)
 * - Enforces Row Level Security policies
 * - Cannot bypass RLS or perform admin operations
 * - Perfect for client-side queries and real-time subscriptions
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Enable session persistence for admin auth
    autoRefreshToken: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

/**
 * Browser-safe query example
 *
 * Note: For server-side queries in +page.server.ts,
 * use src/lib/supabase/server.ts instead!
 */
export async function getPublicPhotos(limit = 20) {
  const { data, error } = await supabase
    .from('photo_metadata')
    .select('*')
    .not('sharpness', 'is', null)
    // Use upload_date for correct chronological sorting (photo_date is backfilled with enriched_at)
    .order('upload_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[Supabase Client] Error fetching photos:', error);
    throw error;
  }

  return data;
}
