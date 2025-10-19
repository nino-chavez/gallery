import { fetchPhotos } from '$lib/supabase/server';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const { albumKey } = params;

	// Get all photos for this album using fetchPhotos helper
	// This properly transforms flat Supabase data into nested Photo objects
	const photos = await fetchPhotos({
		albumKey,
		sortBy: 'newest',
	});

	if (!photos || photos.length === 0) {
		throw error(404, 'Album not found or contains no enriched photos');
	}

	// Get album name from first photo's database row
	// Note: We'll need to query for album_name separately since Photo type doesn't include it
	const albumName = albumKey; // Temporary: use albumKey as fallback

	return {
		albumKey,
		albumName,
		photos,
		photoCount: photos.length
	};
};
