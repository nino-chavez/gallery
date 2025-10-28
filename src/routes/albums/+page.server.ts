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

type SortOption = 'name' | 'date' | 'count';

export const load: PageServerLoad = async ({ url }) => {
	// Browse Mode: Simple album listing without filters (IA Mode 1 - Traditionalist)
	// Get pagination and sorting params
	const page = parseInt(url.searchParams.get('page') || '1');
	const sortBy = (url.searchParams.get('sort') || 'count') as SortOption;
	const limit = 24;
	const offset = (page - 1) * limit;

	// OPTIMIZED: Query materialized view for instant results with pagination
	let query = supabaseServer
		.from('albums_summary')
		.select('*', { count: 'exact' });

	// Apply sorting
	switch (sortBy) {
		case 'name':
			query = query.order('album_name', { ascending: true });
			break;
		case 'date':
			query = query.order('latest_photo_date', { ascending: false, nullsFirst: false });
			break;
		case 'count':
		default:
			query = query
				.order('photo_count', { ascending: false })
				.order('latest_photo_date', { ascending: false, nullsFirst: false });
			break;
	}

	// Apply pagination
	query = query.range(offset, offset + limit - 1);

	const { data: albumsData, error, count } = await query;

	if (error) {
		console.error('[Albums] Error fetching from albums_summary view:', error);
		// Fallback to legacy aggregation if view doesn't exist
		return await loadAlbumsLegacy(page, sortBy, limit, offset);
	}

	// Map materialized view results to expected format
	const albums = (albumsData || []).map((album) => ({
		albumKey: album.album_key,
		albumName: album.album_name || 'Unknown Album',
		photoCount: parseInt(album.photo_count) || 0,
		coverImageUrl: album.cover_image_url,
		sports: album.sports || [],
		categories: album.categories || [],
		portfolioCount: parseInt(album.portfolio_count) || 0,
		avgQualityScore: parseFloat(album.avg_quality_score) || 0,
		primarySport: album.primary_sport || 'unknown',
		primaryCategory: album.primary_category || 'unknown',
		dateRange: {
			earliest: album.earliest_photo_date,
			latest: album.latest_photo_date
		}
	}));

	const totalAlbums = count || 0;
	const totalPages = Math.ceil(totalAlbums / limit);

	return {
		albums,
		totalAlbums,
		totalPhotos: albums.reduce((sum, album) => sum + album.photoCount, 0),
		currentPage: page,
		totalPages,
		sortBy
	};
};

// Legacy fallback method - Browse Mode: No filters
async function loadAlbumsLegacy(page: number, sortBy: SortOption, limit: number, offset: number) {
	// Get unique albums with photo counts from Supabase
	const { data: albumData, error } = await supabaseServer
		.from('photo_metadata')
		.select('*')
		.not('album_key', 'is', null)
		.not('sharpness', 'is', null) // Only enriched photos
		.order('album_key', { ascending: true }); // Order by album for better aggregation

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
		const sharpness = parseFloat((row as any).sharpness) || 0;
		const isHighQuality = sharpness >= 0.7; // Use sharpness as proxy for portfolio-worthy

		if (albumMap.has(key)) {
			const existing = albumMap.get(key)!;
			existing.count++;
			existing.sports.add(sport);
			existing.categories.add(category);
			existing.totalQualityScore += sharpness;
			if (isHighQuality) existing.portfolioCount++;
		} else {
			// First photo in this album becomes the cover
			albumMap.set(key, {
				name,
				count: 1,
				coverImageUrl: coverUrl,
				sports: new Set([sport]),
				categories: new Set([category]),
				portfolioCount: isHighQuality ? 1 : 0,
				avgQualityScore: 0,
				totalQualityScore: sharpness
			});
		}
	}

	// Convert to array, calculate averages, and apply sorting
	let albums = Array.from(albumMap.entries())
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
			primaryCategory: Array.from(data.categories)[0] || 'unknown',
			dateRange: { earliest: null, latest: null } // Legacy doesn't have date ranges
		}));

	// Apply sorting
	switch (sortBy) {
		case 'name':
			albums.sort((a, b) => a.albumName.localeCompare(b.albumName));
			break;
		case 'date':
			// Can't sort by date in legacy mode, fallback to count
			albums.sort((a, b) => b.photoCount - a.photoCount);
			break;
		case 'count':
		default:
			// Primary sort by count, secondary by name (since we don't have dates in legacy)
			albums.sort((a, b) => {
				const countDiff = b.photoCount - a.photoCount;
				if (countDiff !== 0) return countDiff;
				return a.albumName.localeCompare(b.albumName);
			});
			break;
	}

	// Apply pagination
	const totalAlbums = albums.length;
	const totalPages = Math.ceil(totalAlbums / limit);
	const paginatedAlbums = albums.slice(offset, offset + limit);

	return {
		albums: paginatedAlbums,
		totalAlbums,
		totalPhotos: albumData?.length || 0,
		currentPage: page,
		totalPages,
		sortBy
	};
}
