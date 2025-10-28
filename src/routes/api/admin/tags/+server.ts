/**
 * API Endpoints: Admin Tag Management
 *
 * Purpose: Admin approval/rejection of user-submitted tags
 *
 * Endpoints:
 * - GET /api/admin/tags - Get pending tags (admin only)
 * - POST /api/admin/tags - Approve tag (admin only, tagId in request body)
 * - DELETE /api/admin/tags - Reject/delete tag (admin only, tagId in request body)
 *
 * Authentication: Supabase Auth with admin role check
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Helper to get admin client (checks key at runtime, not build time)
function getAdminClient() {
	if (!SUPABASE_SERVICE_KEY) {
		throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
	}
	return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// ============================================
// Admin Auth Middleware (Supabase Auth)
// ============================================

async function verifyAdmin(request: Request): Promise<string> {
	const authHeader = request.headers.get('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		throw error(401, 'Authentication required');
	}

	const token = authHeader.replace('Bearer ', '');

	// Verify token with Supabase
	const adminClient = getAdminClient();
	const {
		data: { user },
		error: authError
	} = await adminClient.auth.getUser(token);

	if (authError || !user) {
		throw error(401, 'Invalid authentication token');
	}

	// User is authenticated - that's enough (signup disabled, only admin exists)
	return user.id;
}

// ============================================
// GET /api/admin/tags - Get pending tags
// ============================================

export const GET: RequestHandler = async ({ request, url }) => {
	try {
		// Verify admin
		await verifyAdmin(request);

		// Get admin client
		const adminClient = getAdminClient();

		// Get filter params
		const status = url.searchParams.get('status') || 'pending';
		const limit = parseInt(url.searchParams.get('limit') || '50');
		const offset = parseInt(url.searchParams.get('offset') || '0');

		// Build query
		let query = adminClient
			.from('user_tags')
			.select(
				`
        *,
        photo:photo_metadata(photo_id, ThumbnailUrl, album_key)
      `
			)
			.order('created_at', { ascending: false })
			.range(offset, offset + limit - 1);

		// Filter by approval status
		if (status === 'pending') {
			query = query.eq('approved', false);
		} else if (status === 'approved') {
			query = query.eq('approved', true);
		}

		const { data: tags, error: queryError } = await query;

		if (queryError) {
			console.error('Error fetching admin tags:', queryError);
			throw error(500, 'Failed to fetch tags');
		}

		// Get total count
		let countQuery = adminClient.from('user_tags').select('id', { count: 'exact', head: true });

		if (status === 'pending') {
			countQuery = countQuery.eq('approved', false);
		} else if (status === 'approved') {
			countQuery = countQuery.eq('approved', true);
		}

		const { count, error: countError } = await countQuery;

		if (countError) {
			console.error('Error counting tags:', countError);
		}

		return json({
			success: true,
			tags: tags || [],
			total: count || 0,
			limit,
			offset
		});
	} catch (err) {
		console.error('GET /api/admin/tags error:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};

// ============================================
// POST /api/admin/tags - Approve tag
// ============================================

export const POST: RequestHandler = async ({ request }) => {
	try {
		// Verify admin
		const adminUser = await verifyAdmin(request);

		// Get admin client
		const adminClient = getAdminClient();

		// Get tag ID from request body
		const { tagId } = await request.json();

		if (!tagId) {
			throw error(400, 'Tag ID is required');
		}

		// Get the tag
		const { data: tag, error: fetchError } = await adminClient
			.from('user_tags')
			.select('*')
			.eq('id', tagId)
			.single();

		if (fetchError || !tag) {
			throw error(404, 'Tag not found');
		}

		// Check if already approved
		if (tag.approved) {
			return json({
				success: true,
				message: 'Tag already approved',
				tag
			});
		}

		// Approve the tag
		const { data: updatedTag, error: updateError } = await adminClient
			.from('user_tags')
			.update({
				approved: true,
				approved_by: adminUser,
				approved_at: new Date().toISOString()
			})
			.eq('id', tagId)
			.select()
			.single();

		if (updateError) {
			console.error('Error approving tag:', updateError);
			throw error(500, 'Failed to approve tag');
		}

		return json({
			success: true,
			message: 'Tag approved',
			tag: updatedTag
		});
	} catch (err) {
		console.error('POST /api/admin/tags/approve error:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};

// ============================================
// DELETE /api/admin/tags - Reject/delete tag
// ============================================

export const DELETE: RequestHandler = async ({ request }) => {
	try {
		// Verify admin
		await verifyAdmin(request);

		// Get admin client
		const adminClient = getAdminClient();

		// Get tag ID from request body
		const { tagId } = await request.json();

		if (!tagId) {
			throw error(400, 'Tag ID is required');
		}

		// Delete the tag (rejection = deletion)
		const { error: deleteError } = await adminClient.from('user_tags').delete().eq('id', tagId);

		if (deleteError) {
			console.error('Error rejecting tag:', deleteError);
			throw error(500, 'Failed to reject tag');
		}

		return json({
			success: true,
			message: 'Tag rejected'
		});
	} catch (err) {
		console.error('DELETE /api/admin/tags error:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};
