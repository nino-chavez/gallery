/**
 * Logout Route
 */

import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createSupabaseServerClient } from '$lib/supabase/server-ssr';

export const actions = {
	default: async ({ cookies }) => {
		const supabase = createSupabaseServerClient(cookies);

		// Sign out - this will clear the cookies automatically
		await supabase.auth.signOut();

		// Redirect to home page
		throw redirect(303, '/');
	}
} satisfies Actions;
