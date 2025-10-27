/**
 * Login Page Server Actions
 */

import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createSupabaseServerClient } from '$lib/supabase/server-ssr';

// Check if already logged in
export const load: PageServerLoad = async ({ cookies }) => {
	const supabase = createSupabaseServerClient(cookies);
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (user) {
		// Already logged in, redirect to admin
		throw redirect(302, '/admin/tags');
	}

	return {};
};

export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email')?.toString();
		const password = data.get('password')?.toString();

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required' });
		}

		// Create Supabase client with cookie handling
		const supabase = createSupabaseServerClient(cookies);

		// Attempt login - cookies are automatically handled by @supabase/ssr
		const { error: authError } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (authError) {
			console.error('[Login] Auth error:', authError);
			return fail(401, { error: authError.message });
		}

		console.log('[Login] Login successful, redirecting to /admin/tags');

		// Redirect to admin dashboard
		throw redirect(303, '/admin/tags');
	}
} satisfies Actions;
