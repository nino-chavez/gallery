/**
 * Timeline View - Server-Side Data Loading (REFACTORED)
 *
 * PERFORMANCE OPTIMIZATIONS:
 * - Cursor-based pagination (loads 3 months at a time)
 * - No arbitrary photo limits per month (shows all)
 * - Efficient querying (~500 photos per page vs 20K)
 *
 * Week 2: Discovery Features
 */

import { supabaseServer } from '$lib/supabase/server';
import type { PageServerLoad } from './$types';
import type { PhotoMetadataRow } from '$types/database';

interface TimelineGroup {
	year: number;
	month: number;
	monthName: string;
	photos: PhotoMetadataRow[];
	count: number;
}

const MONTHS_PER_PAGE = 3; // Load 3 months at a time for performance
const PHOTOS_PER_PAGE = 500; // Avg ~150-200 photos per month

export const load: PageServerLoad = async ({ url }) => {
	// Get filter params from URL
	const sportFilter = url.searchParams.get('sport') || undefined;
	const categoryFilter = url.searchParams.get('category') || undefined;
	const yearFilter = url.searchParams.get('year') ? parseInt(url.searchParams.get('year')!) : undefined;
	const monthFilter = url.searchParams.get('month') ? parseInt(url.searchParams.get('month')!) : undefined;
	const cursor = url.searchParams.get('cursor') || null; // Format: "2025-10-01"

	// Build query
	let query = supabaseServer
		.from('photo_metadata')
		.select('*')
		.not('sharpness', 'is', null) // Only enriched photos
		.order('upload_date', { ascending: false }); // Most recent first

	// Apply cursor for pagination (if loading more months)
	if (cursor) {
		query = query.lt('upload_date', cursor);
	}

	// Apply filters
	if (sportFilter) {
		query = query.eq('sport_type', sportFilter);
	}
	if (categoryFilter) {
		query = query.eq('photo_category', categoryFilter);
	}

	// Limit to reasonable batch size
	query = query.limit(PHOTOS_PER_PAGE);

	const { data: photos, error } = await query;

	if (error) {
		console.error('[Timeline] Error fetching photos:', error);
		throw new Error(`Failed to fetch timeline photos: ${error.message}`);
	}

	// Group photos by year/month
	const monthNames = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	];

	const groupMap = new Map<string, any[]>();

	for (const photo of photos || []) {
		const uploadDate = new Date(photo.upload_date);
		const yearNum = uploadDate.getFullYear();
		const monthNum = uploadDate.getMonth();

		// Skip photos with invalid dates
		if (isNaN(yearNum) || isNaN(monthNum)) continue;

		// Filter by year if specified
		if (yearFilter && yearNum !== yearFilter) continue;

		// Filter by month if specified (only when year is also specified)
		if (yearFilter && monthFilter !== undefined && monthNum !== monthFilter) continue;

		const key = `${yearNum}-${monthNum}`;

		if (!groupMap.has(key)) {
			groupMap.set(key, []);
		}
		groupMap.get(key)!.push(photo);
	}

	// Convert map to sorted array (no photo limit per month!)
	const timelineGroups: TimelineGroup[] = [];
	for (const [key, groupPhotos] of groupMap.entries()) {
		const [yearStr, monthStr] = key.split('-');
		const yearNum = parseInt(yearStr);
		const monthNum = parseInt(monthStr);

		timelineGroups.push({
			year: yearNum,
			month: monthNum,
			monthName: monthNames[monthNum],
			photos: groupPhotos, // FIXED: Show ALL photos (no .slice(0, 12))
			count: groupPhotos.length
		});
	}

	// Sort by year/month descending
	timelineGroups.sort((a, b) => {
		if (a.year !== b.year) return b.year - a.year;
		return b.month - a.month;
	});

	// Limit to MONTHS_PER_PAGE for pagination
	const paginatedGroups = timelineGroups.slice(0, MONTHS_PER_PAGE);

	// Calculate next cursor (last photo date of last loaded month)
	let nextCursor: string | null = null;
	if (paginatedGroups.length === MONTHS_PER_PAGE && photos && photos.length > 0) {
		const lastGroup = paginatedGroups[paginatedGroups.length - 1];
		const lastPhoto = lastGroup.photos[lastGroup.photos.length - 1];
		if (lastPhoto?.upload_date) {
			nextCursor = lastPhoto.upload_date;
		}
	}

	// Get ALL unique years from database (not just current page)
	// This is a separate lightweight query to populate year dropdown
	const { data: allYearsData } = await supabaseServer
		.from('photo_metadata')
		.select('upload_date')
		.not('sharpness', 'is', null)
		.order('upload_date', { ascending: false });

	const allYears = new Set<number>();
	for (const row of allYearsData || []) {
		const year = new Date(row.upload_date).getFullYear();
		if (!isNaN(year)) {
			allYears.add(year);
		}
	}
	const years = Array.from(allYears).sort((a, b) => b - a);

	// Calculate total photos count (from current batch only for performance)
	const totalPhotos = paginatedGroups.reduce((sum, group) => sum + group.count, 0);

	// Get sport/category distributions (from current batch for performance)
	const sportCounts = new Map<string, number>();
	const categoryCounts = new Map<string, number>();

	for (const group of paginatedGroups) {
		for (const photo of group.photos) {
			const sport = photo.sport_type;
			const category = photo.photo_category;

			if (sport && sport !== 'unknown') {
				sportCounts.set(sport, (sportCounts.get(sport) || 0) + 1);
			}
			if (category && category !== 'unknown') {
				categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
			}
		}
	}

	// Convert to arrays with percentages
	const sportTotal = Array.from(sportCounts.values()).reduce((sum, count) => sum + count, 0);
	const categoryTotal = Array.from(categoryCounts.values()).reduce((sum, count) => sum + count, 0);

	const sports = Array.from(sportCounts.entries())
		.map(([name, count]) => ({
			name,
			count,
			percentage: sportTotal > 0 ? parseFloat(((count / sportTotal) * 100).toFixed(1)) : 0
		}))
		.sort((a, b) => b.count - a.count);

	const categories = Array.from(categoryCounts.entries())
		.map(([name, count]) => ({
			name,
			count,
			percentage: categoryTotal > 0 ? parseFloat(((count / categoryTotal) * 100).toFixed(1)) : 0
		}))
		.sort((a, b) => b.count - a.count);

	// Get available months for selected year (if year is selected)
	let availableMonths: number[] = [];
	if (yearFilter) {
		const { data: monthsData } = await supabaseServer
			.from('photo_metadata')
			.select('upload_date')
			.not('sharpness', 'is', null)
			.gte('upload_date', `${yearFilter}-01-01`)
			.lt('upload_date', `${yearFilter + 1}-01-01`);

		const monthsSet = new Set<number>();
		for (const row of monthsData || []) {
			const month = new Date(row.upload_date).getMonth();
			if (!isNaN(month)) {
				monthsSet.add(month);
			}
		}
		availableMonths = Array.from(monthsSet).sort((a, b) => a - b);
	}

	return {
		timelineGroups: paginatedGroups,
		years,
		availableMonths, // NEW: Months with actual photos
		sports,
		categories,
		selectedYear: yearFilter || null,
		selectedMonth: monthFilter !== undefined ? monthFilter : null,
		selectedSport: sportFilter || null,
		selectedCategory: categoryFilter || null,
		totalPhotos,
		nextCursor,
		hasMore: nextCursor !== null
	};
};
