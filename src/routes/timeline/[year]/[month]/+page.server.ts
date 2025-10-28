import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { supabaseServer } from '$lib/supabase/server';
import type { PhotoMetadataRow } from '$types/database';

const PHOTOS_PER_PAGE = 48;

interface MonthStats {
	totalPhotos: number;
	primarySport: string | null;
	primaryCategory: string | null;
}

export const load: PageServerLoad = async ({ params, url, parent }) => {
	// Get year and month from URL params
	const year = parseInt(params.year);
	const month = parseInt(params.month); // 1-12

	// Validate params
	if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
		throw error(400, 'Invalid year or month');
	}

	// Get page number from URL
	const page = parseInt(url.searchParams.get('page') || '1');
	const offset = (page - 1) * PHOTOS_PER_PAGE;

	// Get sport/category filters
	const sportFilter = url.searchParams.get('sport') || undefined;
	const categoryFilter = url.searchParams.get('category') || undefined;

	// Access parent data (sports, categories distributions)
	const { sports, categories } = await parent();

	// Calculate date range for the month (0-indexed month for Date constructor)
	const monthStart = new Date(year, month - 1, 1); // month - 1 because Date uses 0-indexed months
	const monthEnd = new Date(year, month, 0, 23, 59, 59, 999); // day 0 = last day of previous month

	// Build base query
	let query = supabaseServer
		.from('photo_metadata')
		.select('*', { count: 'exact' })
		.gte('upload_date', monthStart.toISOString())
		.lte('upload_date', monthEnd.toISOString())
		.not('sharpness', 'is', null);

	// Apply filters
	if (sportFilter) {
		query = query.eq('sport_type', sportFilter);
	}
	if (categoryFilter) {
		query = query.eq('photo_category', categoryFilter);
	}

	// Execute query with pagination
	const { data: photos, error: photosError, count } = await query
		.order('upload_date', { ascending: false })
		.order('quality_score', { ascending: false })
		.range(offset, offset + PHOTOS_PER_PAGE - 1);

	if (photosError) {
		console.error('[Timeline Month] Error loading photos:', photosError);
		throw error(500, 'Failed to load photos');
	}

	// Calculate total pages
	const totalPhotos = count || 0;
	const totalPages = Math.ceil(totalPhotos / PHOTOS_PER_PAGE);

	// Get month statistics (primary sport and category)
	const stats = await getMonthStats(year, month, sportFilter, categoryFilter);

	// Get month name
	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];
	const monthName = monthNames[month - 1];

	return {
		year,
		month,
		monthName,
		photos: (photos || []) as PhotoMetadataRow[],
		totalPhotos,
		currentPage: page,
		totalPages,
		hasMore: page < totalPages,
		stats,
		sports,
		categories,
		selectedSport: sportFilter || null,
		selectedCategory: categoryFilter || null
	};
};

/**
 * Get statistics for the month (total photos, primary sport, primary category)
 */
async function getMonthStats(
	year: number,
	month: number,
	sportFilter?: string,
	categoryFilter?: string
): Promise<MonthStats> {
	// Calculate date range
	const monthStart = new Date(year, month - 1, 1);
	const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

	// Build query
	let query = supabaseServer
		.from('photo_metadata')
		.select('sport_type, photo_category')
		.gte('upload_date', monthStart.toISOString())
		.lte('upload_date', monthEnd.toISOString())
		.not('sharpness', 'is', null);

	// Apply filters
	if (sportFilter) {
		query = query.eq('sport_type', sportFilter);
	}
	if (categoryFilter) {
		query = query.eq('photo_category', categoryFilter);
	}

	const { data: allPhotos, error: statsError } = await query;

	if (statsError || !allPhotos) {
		console.error('[Timeline Month] Error loading stats:', statsError);
		return {
			totalPhotos: 0,
			primarySport: null,
			primaryCategory: null
		};
	}

	// Count sport types
	const sportCounts = new Map<string, number>();
	const categoryCounts = new Map<string, number>();

	allPhotos.forEach((photo) => {
		if (photo.sport_type) {
			sportCounts.set(photo.sport_type, (sportCounts.get(photo.sport_type) || 0) + 1);
		}
		if (photo.photo_category) {
			categoryCounts.set(
				photo.photo_category,
				(categoryCounts.get(photo.photo_category) || 0) + 1
			);
		}
	});

	// Find primary sport and category (most common)
	let primarySport: string | null = null;
	let maxSportCount = 0;
	sportCounts.forEach((count, sport) => {
		if (count > maxSportCount) {
			maxSportCount = count;
			primarySport = sport;
		}
	});

	let primaryCategory: string | null = null;
	let maxCategoryCount = 0;
	categoryCounts.forEach((count, category) => {
		if (count > maxCategoryCount) {
			maxCategoryCount = count;
			primaryCategory = category;
		}
	});

	return {
		totalPhotos: allPhotos.length,
		primarySport,
		primaryCategory
	};
}
