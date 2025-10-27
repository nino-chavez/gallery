/**
 * API Endpoints: User Tags
 *
 * Purpose: Simple player tagging with admin approval
 *
 * Endpoints:
 * - POST /api/tags - Create new tag (authenticated users)
 * - GET /api/tags?photo_id={id} - Get tags for a photo (public for approved, user's own pending)
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ============================================
// Types
// ============================================

interface CreateTagRequest {
	photo_id: string;
	athlete_name: string;
	jersey_number?: string;
}

interface UserTag {
	id: string;
	photo_id: string;
	athlete_name: string;
	jersey_number: string | null;
	tagged_by_user_id: string;
	tagged_by_user_name: string | null;
	approved: boolean;
	approved_by: string | null;
	approved_at: string | null;
	created_at: string;
}

// ============================================
// POST /api/tags - Create new tag
// ============================================

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		// Get auth token from cookies
		const authToken = cookies.get('sb-access-token');
		const refreshToken = cookies.get('sb-refresh-token');

		if (!authToken) {
			throw error(401, 'Authentication required');
		}

		// Create authenticated Supabase client
		const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
			global: {
				headers: {
					Authorization: `Bearer ${authToken}`
				}
			}
		});

		// Verify user is authenticated
		const {
			data: { user },
			error: authError
		} = await supabase.auth.getUser();

		if (authError || !user) {
			throw error(401, 'Invalid authentication');
		}

		// Parse request body
		const body = (await request.json()) as CreateTagRequest;

		// Validate required fields
		if (!body.photo_id || !body.athlete_name) {
			throw error(400, 'photo_id and athlete_name are required');
		}

		// Validate athlete_name is not empty or just whitespace
		if (body.athlete_name.trim().length === 0) {
			throw error(400, 'athlete_name cannot be empty');
		}

		// Check if photo exists
		const { data: photo, error: photoError } = await supabase
			.from('photo_metadata')
			.select('photo_id')
			.eq('photo_id', body.photo_id)
			.single();

		if (photoError || !photo) {
			throw error(404, 'Photo not found');
		}

		// Create tag
		const { data: tag, error: insertError } = await supabase
			.from('user_tags')
			.insert({
				photo_id: body.photo_id,
				athlete_name: body.athlete_name.trim(),
				jersey_number: body.jersey_number?.trim() || null,
				tagged_by_user_id: user.id,
				tagged_by_user_name: user.email || user.user_metadata?.name || null,
				approved: false
			})
			.select()
			.single();

		if (insertError) {
			console.error('Error creating tag:', insertError);
			throw error(500, 'Failed to create tag');
		}

		return json(
			{
				success: true,
				message: 'Tag submitted for approval',
				tag
			},
			{ status: 201 }
		);
	} catch (err) {
		console.error('POST /api/tags error:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}
		throw error(500, 'Internal server error');
	}
};

// ============================================
// GET /api/tags?photo_id={id} - Get tags for photo
// ============================================

export const GET: RequestHandler = async ({ url, cookies }) => {
	try {
		const photoId = url.searchParams.get('photo_id');

		if (!photoId) {
			throw error(400, 'photo_id query parameter is required');
		}

		// Get auth token (optional for GET - shows approved + user's own)
		const authToken = cookies.get('sb-access-token');

		// Create Supabase client (may be unauthenticated)
		const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
			global: authToken
				? {
						headers: {
							Authorization: `Bearer ${authToken}`
						}
					}
				: undefined
		});

		// Get user if authenticated (optional)
		const {
			data: { user }
		} = await supabase.auth.getUser();

		// Query tags for this photo
		// RLS will handle filtering:
		// - Unauthenticated: only approved tags
		// - Authenticated: approved tags + user's own pending tags
		const { data: tags, error: queryError } = await supabase
			.from('user_tags')
			.select('*')
			.eq('photo_id', photoId)
			.order('created_at', { ascending: false });

		if (queryError) {
			console.error('Error fetching tags:', queryError);
			throw error(500, 'Failed to fetch tags');
		}

		return json({
			success: true,
			photo_id: photoId,
			tags: tags || [],
			user_id: user?.id || null
		});
	} catch (err) {
		console.error('GET /api/tags error:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}
		throw error(500, 'Internal server error');
	}
};

// ============================================
// DELETE /api/tags/{id} - Delete own tag (optional)
// ============================================

export const DELETE: RequestHandler = async ({ url, cookies }) => {
	try {
		// Get tag ID from URL path
		const tagId = url.pathname.split('/').pop();

		if (!tagId) {
			throw error(400, 'Tag ID is required');
		}

		// Get auth token
		const authToken = cookies.get('sb-access-token');

		if (!authToken) {
			throw error(401, 'Authentication required');
		}

		// Create authenticated Supabase client
		const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
			global: {
				headers: {
					Authorization: `Bearer ${authToken}`
				}
			}
		});

		// Verify user is authenticated
		const {
			data: { user },
			error: authError
		} = await supabase.auth.getUser();

		if (authError || !user) {
			throw error(401, 'Invalid authentication');
		}

		// Get the tag to verify ownership
		const { data: tag, error: fetchError } = await supabase
			.from('user_tags')
			.select('*')
			.eq('id', tagId)
			.single();

		if (fetchError || !tag) {
			throw error(404, 'Tag not found');
		}

		// Verify user owns this tag
		if (tag.tagged_by_user_id !== user.id) {
			throw error(403, 'You can only delete your own tags');
		}

		// Verify tag is not approved (can't delete approved tags)
		if (tag.approved) {
			throw error(403, 'Cannot delete approved tags');
		}

		// Delete the tag
		const { error: deleteError } = await supabase.from('user_tags').delete().eq('id', tagId);

		if (deleteError) {
			console.error('Error deleting tag:', deleteError);
			throw error(500, 'Failed to delete tag');
		}

		return json({
			success: true,
			message: 'Tag deleted'
		});
	} catch (err) {
		console.error('DELETE /api/tags error:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}
		throw error(500, 'Internal server error');
	}
};
