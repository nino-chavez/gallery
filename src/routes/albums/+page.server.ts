import { supabaseServer } from '$lib/supabase/server';
import type { PageServerLoad } from './$types';

interface AlbumMetadata {
	name: string;
	count: number;
	coverImageUrl: string | null;
	sports: Set<string>;
	categories: Set<string>;
	portfolioCount: number;
	avgQualityScore: number;
	totalQualityScore: number;
}

export const load: PageServerLoad = async ({ url }) => {
	// Get filter params from URL (NEW - Week 2)
	const sportFilter = url.searchParams.get('sport') || undefined;
	const categoryFilter = url.searchParams.get('category') || undefined;

	// Get unique albums with photo counts from Supabase
	// Query all columns with * to let Supabase handle column mapping
	let query = supabaseServer
		.from('photo_metadata')
		.select('*')
		.not('album_key', 'is', null)
		.not('sharpness', 'is', null); // Only enriched photos

	// Apply filters (NEW - Week 2)
	if (sportFilter) {
		query = query.eq('sport_type', sportFilter);
	}
	if (categoryFilter) {
		query = query.eq('photo_category', categoryFilter);
	}

	const { data: albumData, error } = await query.order('upload_date', { ascending: false });

	if (error) {
		console.error('[Albums] Error fetching albums:', error);
		throw new Error(`Failed to fetch albums: ${error.message}`);
	}

	// Deduplicate and count photos per album, keeping first photo for cover
	// Enhanced with sport/category metadata (NEW - Week 2)
	const albumMap = new Map<string, AlbumMetadata>();

	for (const row of albumData || []) {
		const key = (row as any).album_key;
		const name = (row as any).album_name || 'Unknown Album';
		const coverUrl = (row as any).ThumbnailUrl || (row as any).ImageUrl || null;
		const sport = (row as any).sport_type || 'unknown';
		const category = (row as any).photo_category || 'unknown';
		const isPortfolio = (row as any).portfolio_worthy === true;
		const qualityScore = parseFloat((row as any).quality_score) || 0;

		if (albumMap.has(key)) {
			const existing = albumMap.get(key)!;
			existing.count++;
			existing.sports.add(sport);
			existing.categories.add(category);
			existing.totalQualityScore += qualityScore;
			if (isPortfolio) existing.portfolioCount++;
		} else {
			// First photo in this album becomes the cover
			albumMap.set(key, {
				name,
				count: 1,
				coverImageUrl: coverUrl,
				sports: new Set([sport]),
				categories: new Set([category]),
				portfolioCount: isPortfolio ? 1 : 0,
				avgQualityScore: 0,
				totalQualityScore: qualityScore
			});
		}
	}

	// Convert to array, calculate averages, and sort by photo count (descending)
	const albums = Array.from(albumMap.entries())
		.map(([key, data]) => ({
			albumKey: key,
			albumName: data.name,
			photoCount: data.count,
			coverImageUrl: data.coverImageUrl,
			sports: Array.from(data.sports).filter(s => s !== 'unknown'),
			categories: Array.from(data.categories).filter(c => c !== 'unknown'),
			portfolioCount: data.portfolioCount,
			avgQualityScore: data.totalQualityScore / data.count,
			primarySport: Array.from(data.sports)[0] || 'unknown',
			primaryCategory: Array.from(data.categories)[0] || 'unknown'
		}))
		.sort((a, b) => b.photoCount - a.photoCount);

	return {
		albums,
		totalAlbums: albums.length,
		totalPhotos: albumData?.length || 0,
		selectedSport: sportFilter || null,
		selectedCategory: categoryFilter || null
	};
};
