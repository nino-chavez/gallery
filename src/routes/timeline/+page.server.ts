/**
 * Timeline View - Server-Side Data Loading
 *
 * Fetches photos grouped by upload date for chronological browsing
 * Week 2: Discovery Features
 */

import { supabaseServer } from '$lib/supabase/server';
import type { PageServerLoad } from './$types';

interface TimelineGroup {
	year: number;
	month: number;
	monthName: string;
	photos: any[];
	count: number;
}

export const load: PageServerLoad = async ({ url }) => {
	// Get filter params from URL
	const sportFilter = url.searchParams.get('sport') || undefined;
	const categoryFilter = url.searchParams.get('category') || undefined;
	const year = url.searchParams.get('year') ? parseInt(url.searchParams.get('year')!) : undefined;

	// Fetch photos with optional filters
	let query = supabaseServer
		.from('photo_metadata')
		.select('*')
		.not('sharpness', 'is', null) // Only enriched photos
		.order('upload_date', { ascending: false }); // Most recent first

	// Apply filters
	if (sportFilter) {
		query = query.eq('sport_type', sportFilter);
	}
	if (categoryFilter) {
		query = query.eq('photo_category', categoryFilter);
	}

	const { data: photos, error } = await query;

	if (error) {
		console.error('[Timeline] Error fetching photos:', error);
		throw new Error(`Failed to fetch timeline photos: ${error.message}`);
	}

	// Group photos by year/month
	const timelineGroups: TimelineGroup[] = [];
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
		if (year && yearNum !== year) continue;

		const key = `${yearNum}-${monthNum}`;

		if (!groupMap.has(key)) {
			groupMap.set(key, []);
		}
		groupMap.get(key)!.push(photo);
	}

	// Convert map to sorted array
	for (const [key, groupPhotos] of groupMap.entries()) {
		const [yearStr, monthStr] = key.split('-');
		const yearNum = parseInt(yearStr);
		const monthNum = parseInt(monthStr);

		timelineGroups.push({
			year: yearNum,
			month: monthNum,
			monthName: monthNames[monthNum],
			photos: groupPhotos.slice(0, 12), // Limit to 12 per group for performance
			count: groupPhotos.length
		});
	}

	// Sort by year/month descending
	timelineGroups.sort((a, b) => {
		if (a.year !== b.year) return b.year - a.year;
		return b.month - a.month;
	});

	// Get unique years for filter
	const years = Array.from(new Set(timelineGroups.map(g => g.year))).sort((a, b) => b - a);

	return {
		timelineGroups,
		years,
		selectedYear: year || null,
		selectedSport: sportFilter || null,
		selectedCategory: categoryFilter || null,
		totalPhotos: photos?.length || 0
	};
};
