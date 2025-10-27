/**
 * Supabase Server Client with SSR Support
 *
 * Uses @supabase/ssr for proper cookie handling in SvelteKit
 */

import { createServerClient } from '@supabase/ssr';
import type { Cookies } from '@sveltejs/kit';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

/**
 * Create a Supabase client for server-side use with proper cookie handling
 */
export function createSupabaseServerClient(cookies: Cookies) {
	return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					cookies.set(name, value, options);
				});
			}
		}
	});
}

/**
 * Create admin client with service role key (bypasses RLS)
 */
export function createSupabaseAdminClient(cookies: Cookies) {
	return createServerClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		cookies: {
			getAll: () => cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					cookies.set(name, value, options);
				});
			}
		}
	});
}
