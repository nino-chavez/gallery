import { supabaseServer } from '$lib/supabase/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Get unique albums with photo counts from Supabase
	// Query all columns with * to let Supabase handle column mapping
	const { data: albumData, error } = await supabaseServer
		.from('photo_metadata')
		.select('*')
		.not('album_key', 'is', null)
		.not('sharpness', 'is', null) // Only enriched photos
		.order('upload_date', { ascending: false }); // Get most recent photos first

	if (error) {
		console.error('[Albums] Error fetching albums:', error);
		throw new Error(`Failed to fetch albums: ${error.message}`);
	}

	// Deduplicate and count photos per album, keeping first photo for cover
	const albumMap = new Map<
		string,
		{ name: string; count: number; coverImageUrl: string | null }
	>();

	for (const row of albumData || []) {
		const key = (row as any).album_key;
		const name = (row as any).album_name || 'Unknown Album';
		const coverUrl = (row as any).thumbnail_url || (row as any).image_url || null;

		if (albumMap.has(key)) {
			const existing = albumMap.get(key)!;
			existing.count++;
		} else {
			// First photo in this album becomes the cover
			albumMap.set(key, {
				name,
				count: 1,
				coverImageUrl: coverUrl
			});
		}
	}

	// Convert to array and sort by photo count (descending)
	const albums = Array.from(albumMap.entries())
		.map(([key, data]) => ({
			albumKey: key,
			albumName: data.name,
			photoCount: data.count,
			coverImageUrl: data.coverImageUrl
		}))
		.sort((a, b) => b.photoCount - a.photoCount);

	return {
		albums,
		totalAlbums: albums.length,
		totalPhotos: albumData?.length || 0
	};
};
