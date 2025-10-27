/**
 * SvelteKit Server Hooks
 *
 * Purpose: Minimal hook setup - @supabase/ssr handles session automatically
 */

import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// @supabase/ssr handles all cookie-based session management automatically
	// No manual session handling needed
	return resolve(event);
};
