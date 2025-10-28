/**
 * Analytics Dashboard - Server Loader
 *
 * Displays popular photos, search analytics, and view statistics
 */

import { getPopularPhotos, getTopSearchQueries } from '$lib/analytics/tracker';
import { supabaseServer } from '$lib/supabase/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Get popular photos with full metadata
	const popularPhotoIds = await getPopularPhotos(20);

	// Fetch full photo data for popular photos
	const photoIds = popularPhotoIds.map((p) => p.photo_id);
	let popularPhotos: Array<{ photo_id: string; view_count: number; image_key: string; ImageUrl: string; ThumbnailUrl: string | null; photo_category: string }> = [];

	if (photoIds.length > 0) {
		const { data } = await supabaseServer
			.from('photo_metadata')
			.select('photo_id, image_key, ImageUrl, ThumbnailUrl, sport_type, photo_category')
			.in('photo_id', photoIds);

		// Merge with view counts
		popularPhotos =
			data?.map((photo) => {
				const stats = popularPhotoIds.find((p) => p.photo_id === photo.photo_id);
				return {
					...photo,
					view_count: stats?.view_count || 0,
					days_active: stats?.days_active || 0,
					last_viewed: stats?.last_viewed,
				};
			}) || [];
	}

	// Get recent search queries
	const recentSearches = await getTopSearchQueries(20);

	// Get view source distribution
	const { data: viewSourceData } = await supabaseServer
		.from('photo_views')
		.select('view_source')
		.gte('viewed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

	const viewSourceCounts = (viewSourceData || []).reduce(
		(acc, { view_source }) => {
			acc[view_source] = (acc[view_source] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>
	);

	// Get total stats
	const { count: totalViews } = await supabaseServer
		.from('photo_views')
		.select('*', { count: 'exact', head: true })
		.gte('viewed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

	const { count: totalSearches } = await supabaseServer
		.from('search_queries')
		.select('*', { count: 'exact', head: true })
		.gte('searched_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

	return {
		popularPhotos,
		recentSearches,
		stats: {
			totalViews: totalViews || 0,
			totalSearches: totalSearches || 0,
			viewSourceCounts,
		},
	};
};
