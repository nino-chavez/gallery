/**
 * Timeline View - Server-Side Data Loading (VIEW-BASED ARCHITECTURE)
 *
 * STRATEGY:
 * 1. Query timeline_months view to get month metadata (fast, ~50 rows)
 * 2. Determine which months to display (first N months after cursor)
 * 3. Fetch photos only for those specific months (targeted queries)
 *
 * BENEFITS:
 * - See all years immediately (view has pre-computed metadata)
 * - Fast initial load (metadata query is <10ms)
 * - Efficient photo fetching (only load displayed months)
 * - Accurate photo counts for scrubber/filters
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

interface TimelineMonthMetadata {
	month_start: string;
	year: number;
	month: number;
	photo_count: number;
	sport_counts: Record<string, number> | null;
	category_counts: Record<string, number> | null;
	first_photo_date: string;
	last_photo_date: string;
}

const MONTHS_PER_PAGE = 6; // Load 6 months at a time

export const load: PageServerLoad = async ({ url }) => {
	// Get filter params from URL
	const sportFilter = url.searchParams.get('sport') || undefined;
	const categoryFilter = url.searchParams.get('category') || undefined;
	const yearFilter = url.searchParams.get('year') ? parseInt(url.searchParams.get('year')!) : undefined;
	const monthFilter = url.searchParams.get('month') ? parseInt(url.searchParams.get('month')!) : undefined;
	const cursorMonthStart = url.searchParams.get('cursor') || null; // Format: "2025-10-01"

	// STEP 1: Query timeline_months view to get month metadata
	let monthQuery = supabaseServer
		.from('timeline_months')
		.select('*')
		.order('year', { ascending: false })
		.order('month', { ascending: false });

	// Apply cursor for pagination
	if (cursorMonthStart) {
		monthQuery = monthQuery.lt('month_start', cursorMonthStart);
	}

	// Apply year filter
	if (yearFilter) {
		monthQuery = monthQuery.eq('year', yearFilter);
	}

	// Apply month filter (only if year is also specified)
	if (yearFilter && monthFilter !== undefined) {
		monthQuery = monthQuery.eq('month', monthFilter);
	}

	const { data: monthsMetadata, error: monthsError } = await monthQuery;

	if (monthsError) {
		console.error('[Timeline] Error fetching month metadata:', monthsError);
		throw new Error(`Failed to fetch timeline metadata: ${monthsError.message}`);
	}

	// Filter months by sport/category if specified
	let filteredMonths = monthsMetadata || [];

	if (sportFilter && filteredMonths.length > 0) {
		filteredMonths = filteredMonths.filter(m =>
			m.sport_counts && m.sport_counts[sportFilter] > 0
		);
	}

	if (categoryFilter && filteredMonths.length > 0) {
		filteredMonths = filteredMonths.filter(m =>
			m.category_counts && m.category_counts[categoryFilter] > 0
		);
	}

	// Take first N months for this page
	const monthsToLoad = filteredMonths.slice(0, MONTHS_PER_PAGE);

	// STEP 2: Fetch photos for these specific months
	const monthNames = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	];

	const timelineGroups: TimelineGroup[] = [];

	for (const monthMeta of monthsToLoad) {
		// Build query for photos in this specific month
		let photoQuery = supabaseServer
			.from('photo_metadata')
			.select('*')
			.not('sharpness', 'is', null)
			.gte('upload_date', monthMeta.first_photo_date)
			.lte('upload_date', monthMeta.last_photo_date)
			.order('upload_date', { ascending: false });

		// Apply filters
		if (sportFilter) {
			photoQuery = photoQuery.eq('sport_type', sportFilter);
		}
		if (categoryFilter) {
			photoQuery = photoQuery.eq('photo_category', categoryFilter);
		}

		const { data: photos, error: photosError } = await photoQuery;

		if (photosError) {
			console.error(`[Timeline] Error fetching photos for ${monthMeta.year}-${monthMeta.month}:`, photosError);
			continue; // Skip this month but continue with others
		}

		if (photos && photos.length > 0) {
			timelineGroups.push({
				year: monthMeta.year,
				month: monthMeta.month - 1, // Convert to 0-indexed (JavaScript months)
				monthName: monthNames[monthMeta.month - 1],
				photos: photos,
				count: photos.length
			});
		}
	}

	// Calculate next cursor (last month's start date)
	let nextCursor: string | null = null;
	if (monthsToLoad.length === MONTHS_PER_PAGE && filteredMonths.length > MONTHS_PER_PAGE) {
		const lastMonth = monthsToLoad[monthsToLoad.length - 1];
		nextCursor = lastMonth.month_start;
	}

	// Get ALL unique years with photo counts from view (for horizontal timeline)
	const { data: allYearsData } = await supabaseServer
		.from('timeline_months')
		.select('year, photo_count')
		.order('year', { ascending: false });

	// Aggregate photo counts by year
	const yearCounts = new Map<number, number>();
	(allYearsData || []).forEach((row) => {
		const count = row.photo_count || 0;
		yearCounts.set(row.year, (yearCounts.get(row.year) || 0) + count);
	});

	const allYears = Array.from(new Set((allYearsData || []).map(row => row.year)));
	const allYearsWithCounts = Array.from(yearCounts.entries())
		.map(([year, photoCount]) => ({ year, photoCount }))
		.sort((a, b) => b.year - a.year);

	// Calculate total photos count (from view, very fast)
	const totalPhotos = timelineGroups.reduce((sum, group) => sum + group.count, 0);

	// Get sport/category distributions (from current months only)
	const sportCounts = new Map<string, number>();
	const categoryCounts = new Map<string, number>();

	for (const month of monthsToLoad) {
		if (month.sport_counts) {
			for (const [sport, count] of Object.entries(month.sport_counts)) {
				if (sport !== 'unknown') {
					sportCounts.set(sport, (sportCounts.get(sport) || 0) + count);
				}
			}
		}

		if (month.category_counts) {
			for (const [category, count] of Object.entries(month.category_counts)) {
				if (category !== 'unknown') {
					categoryCounts.set(category, (categoryCounts.get(category) || 0) + count);
				}
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
		const { data: yearMonths } = await supabaseServer
			.from('timeline_months')
			.select('month')
			.eq('year', yearFilter)
			.order('month', { ascending: true });

		availableMonths = (yearMonths || []).map(row => row.month - 1); // Convert to 0-indexed
	}

	return {
		timelineGroups,
		years: allYears,
		yearsWithCounts: allYearsWithCounts,
		availableMonths,
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
