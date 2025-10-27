/**
 * Admin Tag Moderation Page (Server-Side)
 *
 * Purpose: Load pending tags for admin moderation
 * Authentication: Supabase Auth (single-user admin model)
 */

import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createSupabaseServerClient, createSupabaseAdminClient } from '$lib/supabase/server-ssr';

export const load: PageServerLoad = async ({ cookies }) => {
	// Check authentication
	const supabase = createSupabaseServerClient(cookies);
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) {
		// Redirect to login page if not authenticated
		throw redirect(302, '/login');
	}

	// User is authenticated - that's enough (signup disabled, only admin exists)

	// Get admin client for tag queries (bypasses RLS)
	const adminClient = createSupabaseAdminClient(cookies);

	// Load pending tags with photo metadata
	const { data: pendingTags, error: queryError } = await adminClient
		.from('user_tags')
		.select(
			`
			*,
			photo:photo_metadata(photo_id, ThumbnailUrl, album_key)
		`
		)
		.eq('approved', false)
		.order('created_at', { ascending: false });

	if (queryError) {
		console.error('Error loading pending tags:', queryError);
		throw error(500, 'Failed to load pending tags');
	}

	// Get total counts
	const { count: pendingCount } = await adminClient
		.from('user_tags')
		.select('id', { count: 'exact', head: true })
		.eq('approved', false);

	const { count: approvedCount } = await adminClient
		.from('user_tags')
		.select('id', { count: 'exact', head: true })
		.eq('approved', true);

	return {
		pendingTags: pendingTags || [],
		stats: {
			pending: pendingCount || 0,
			approved: approvedCount || 0
		},
		user: {
			id: user.id,
			email: user.email
		}
	};
};

export const actions = {
	approve: async ({ request, cookies }) => {
		// Check authentication
		const supabase = createSupabaseServerClient(cookies);
		const {
			data: { user }
		} = await supabase.auth.getUser();

		if (!user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const tagId = data.get('tagId')?.toString();

		if (!tagId) {
			return fail(400, { error: 'Tag ID required' });
		}

		// Approve the tag
		const adminClient = createSupabaseAdminClient(cookies);
		const { error: updateError } = await adminClient
			.from('user_tags')
			.update({
				approved: true,
				approved_by: user.id,
				approved_at: new Date().toISOString()
			})
			.eq('id', tagId);

		if (updateError) {
			console.error('Error approving tag:', updateError);
			return fail(500, { error: 'Failed to approve tag' });
		}

		return { success: true };
	},

	reject: async ({ request, cookies }) => {
		// Check authentication
		const supabase = createSupabaseServerClient(cookies);
		const {
			data: { user }
		} = await supabase.auth.getUser();

		if (!user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const tagId = data.get('tagId')?.toString();

		if (!tagId) {
			return fail(400, { error: 'Tag ID required' });
		}

		// Delete the tag (rejection = deletion)
		const adminClient = createSupabaseAdminClient(cookies);
		const { error: deleteError } = await adminClient.from('user_tags').delete().eq('id', tagId);

		if (deleteError) {
			console.error('Error rejecting tag:', deleteError);
			return fail(500, { error: 'Failed to reject tag' });
		}

		return { success: true };
	}
} satisfies Actions;
