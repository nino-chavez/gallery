/**
 * Collection Detail Page - Server Loader
 *
 * Loads full photo set for a specific AI-curated collection.
 * Uses hybrid approach: story relevance + quality thresholds.
 */

import { error } from '@sveltejs/kit';
import { supabaseServer } from '$lib/supabase/server';
import type { PageServerLoad } from './$types';
import type { Photo } from '$types/photo';

// Collection definitions (matching collections/+page.server.ts)
const COLLECTIONS = [
	{
		slug: 'portfolio-excellence',
		title: 'Portfolio Excellence',
		narrative: 'The absolute best: technical mastery meets emotional impact',
		description: 'Triple-excellent photography—the top tier where sharpness, composition, and emotional impact all score 9/10 or higher. These photos represent the pinnacle of sports photography craft.',
	},
	{
		slug: 'comeback-stories',
		title: 'Comeback Stories',
		narrative: 'Critical moments of triumph in the final minutes',
		description: 'Dramatic comebacks and clutch performances when it matters most. These photos capture the intensity and emotion of athletes fighting back in the closing moments of competition.',
	},
	{
		slug: 'peak-intensity',
		title: 'Peak Intensity',
		narrative: 'The most intense moments of gameplay',
		description: 'Maximum effort, maximum focus, maximum intensity. These photos freeze the pinnacle of athletic performance—the moments when everything is on the line and athletes give their absolute all.',
	},
	{
		slug: 'golden-hour-magic',
		title: 'Golden Hour Magic',
		narrative: 'Stunning captures during the magic hour',
		description: 'The warm, ethereal glow of golden hour transforms athletic moments into art. These photos showcase the perfect intersection of technical excellence and natural beauty.',
	},
	{
		slug: 'focus-and-determination',
		title: 'Focus & Determination',
		narrative: 'Unwavering concentration and relentless drive',
		description: 'The quiet intensity before the storm. These photos capture athletes in moments of pure focus and determination, where mental strength is just as visible as physical prowess.',
	},
	{
		slug: 'victory-celebrations',
		title: 'Victory Celebrations',
		narrative: 'Pure joy and shared triumph',
		description: 'The moments after victory—unfiltered emotion, team unity, and the sweet taste of success. These photos capture the human side of sports: the joy, the relief, the celebration.',
	},
	{
		slug: 'aerial-artistry',
		title: 'Aerial Artistry',
		narrative: 'Defying gravity with grace and power',
		description: 'Athletes suspended in air, captured at the peak of their flight. These photos showcase the beauty of vertical movement—blocks, spikes, jumps—frozen in time with exceptional composition and sharpness.',
	},
	{
		slug: 'early-game-energy',
		title: 'Early Game Energy',
		narrative: 'The fresh intensity of first contact',
		description: 'Opening moments when teams are at their sharpest. These photos capture the explosive energy and focus of the first 10 minutes—when strategy meets execution and every play matters.',
	},
	{
		slug: 'defensive-masterclass',
		title: 'Defensive Masterclass',
		narrative: 'The art of reading, reacting, and rescuing',
		description: 'Digs, blocks, and defensive saves that change momentum. These photos celebrate the unsung heroes—defenders who turn impossible plays into highlights through anticipation and athleticism.',
	},
	{
		slug: 'sunset-sessions',
		title: 'Sunset Sessions',
		narrative: 'Evening light transforms competition into cinema',
		description: 'The drama of evening competition bathed in warm light. These photos capture the intersection of athletic performance and natural beauty as daylight fades into dusk.',
	},
];

export const load: PageServerLoad = async ({ params, url }) => {
	const { slug } = params;

	// Find collection definition
	const collectionDef = COLLECTIONS.find((c) => c.slug === slug);
	if (!collectionDef) {
		throw error(404, 'Collection not found');
	}

	// Pagination params
	const page = parseInt(url.searchParams.get('page') || '1');
	const pageSize = 24;
	const offset = (page - 1) * pageSize;

	// Fetch photos based on collection type (HYBRID: Story + Quality)
	let photos: Photo[] = [];
	let totalCount = 0;

	if (slug === 'portfolio-excellence') {
		// Triple-excellent: 9/10+ on all quality metrics
		const query = supabaseServer
			.from('photo_metadata')
			.select('*', { count: 'exact' })
			.gte('sharpness', 9)
			.gte('composition_score', 9)
			.gte('emotional_impact', 9)
			.not('sharpness', 'is', null)
			.order('sharpness', { ascending: false });

		const { data, count } = await query.range(offset, offset + pageSize - 1);

		photos = (data || []) as Photo[];
		totalCount = count || 0;
	} else if (slug === 'comeback-stories') {
		// HYBRID: Story (triumph + final minutes) + Quality floor (7/10)
		const query = supabaseServer
			.from('photo_metadata')
			.select('*', { count: 'exact' })
			.eq('emotion', 'triumph')
			.eq('time_in_game', 'final_5_min')
			.gte('emotional_impact', 7)
			.gte('sharpness', 7)
			.gte('composition_score', 7)
			.not('sharpness', 'is', null)
			.order('emotional_impact', { ascending: false });

		const { data, count } = await query.range(offset, offset + pageSize - 1);

		photos = (data || []) as Photo[];
		totalCount = count || 0;
	} else if (slug === 'peak-intensity') {
		// HYBRID: Story (peak action) + Quality floor (7/10)
		const query = supabaseServer
			.from('photo_metadata')
			.select('*', { count: 'exact' })
			.eq('action_intensity', 'peak')
			.gte('emotional_impact', 8)
			.gte('sharpness', 7)
			.gte('composition_score', 7)
			.not('sharpness', 'is', null)
			.order('emotional_impact', { ascending: false });

		const { data, count } = await query.range(offset, offset + pageSize - 1);

		photos = (data || []) as Photo[];
		totalCount = count || 0;
	} else if (slug === 'golden-hour-magic') {
		const query = supabaseServer
			.from('photo_metadata')
			.select('*', { count: 'exact' })
			.eq('time_of_day', 'golden_hour')
			.gte('composition_score', 7)
			.gte('sharpness', 7)
			.not('sharpness', 'is', null)
			.order('composition_score', { ascending: false });

		const { data, count } = await query.range(offset, offset + pageSize - 1);

		photos = (data || []) as Photo[];
		totalCount = count || 0;
	} else if (slug === 'focus-and-determination') {
		// HYBRID: Story (determination) + Higher quality floor (8/10 sharpness, 7/10 others)
		const query = supabaseServer
			.from('photo_metadata')
			.select('*', { count: 'exact' })
			.eq('emotion', 'determination')
			.gte('sharpness', 8)
			.gte('composition_score', 7)
			.gte('emotional_impact', 7)
			.not('sharpness', 'is', null)
			.order('sharpness', { ascending: false });

		const { data, count } = await query.range(offset, offset + pageSize - 1);

		photos = (data || []) as Photo[];
		totalCount = count || 0;
	} else if (slug === 'victory-celebrations') {
		// HYBRID: Story (celebrations) + Quality floor (7/10)
		const query = supabaseServer
			.from('photo_metadata')
			.select('*', { count: 'exact' })
			.eq('photo_category', 'celebration')
			.gte('emotional_impact', 7)
			.gte('sharpness', 7)
			.gte('composition_score', 7)
			.not('sharpness', 'is', null)
			.order('emotional_impact', { ascending: false });

		const { data, count } = await query.range(offset, offset + pageSize - 1);

		photos = (data || []) as Photo[];
		totalCount = count || 0;
	} else if (slug === 'aerial-artistry') {
		// HYBRID: Story (attack/block actions) + High quality (8/10+)
		const query = supabaseServer
			.from('photo_metadata')
			.select('*', { count: 'exact' })
			.in('play_type', ['attack', 'block'])
			.gte('sharpness', 8)
			.gte('composition_score', 8)
			.not('sharpness', 'is', null)
			.order('composition_score', { ascending: false });

		const { data, count } = await query.range(offset, offset + pageSize - 1);

		photos = (data || []) as Photo[];
		totalCount = count || 0;
	} else if (slug === 'early-game-energy') {
		// HYBRID: Story (first_10_min) + Quality floor (7/10)
		const query = supabaseServer
			.from('photo_metadata')
			.select('*', { count: 'exact' })
			.eq('time_in_game', 'first_10_min')
			.gte('sharpness', 7)
			.gte('emotional_impact', 7)
			.gte('composition_score', 7)
			.not('sharpness', 'is', null)
			.order('emotional_impact', { ascending: false });

		const { data, count } = await query.range(offset, offset + pageSize - 1);

		photos = (data || []) as Photo[];
		totalCount = count || 0;
	} else if (slug === 'defensive-masterclass') {
		// HYBRID: Story (dig/block plays) + Quality floor (7/10)
		const query = supabaseServer
			.from('photo_metadata')
			.select('*', { count: 'exact' })
			.in('play_type', ['dig', 'block'])
			.gte('sharpness', 7)
			.gte('emotional_impact', 7)
			.gte('composition_score', 7)
			.not('sharpness', 'is', null)
			.order('sharpness', { ascending: false });

		const { data, count } = await query.range(offset, offset + pageSize - 1);

		photos = (data || []) as Photo[];
		totalCount = count || 0;
	} else if (slug === 'sunset-sessions') {
		// HYBRID: Story (evening time) + Quality floor (7/10)
		const query = supabaseServer
			.from('photo_metadata')
			.select('*', { count: 'exact' })
			.eq('time_of_day', 'evening')
			.gte('composition_score', 7)
			.gte('sharpness', 7)
			.not('sharpness', 'is', null)
			.order('composition_score', { ascending: false });

		const { data, count } = await query.range(offset, offset + pageSize - 1);

		photos = (data || []) as Photo[];
		totalCount = count || 0;
	}

	return {
		collection: {
			...collectionDef,
			photoCount: totalCount,
		},
		photos,
		totalCount,
		currentPage: page,
		pageSize,
		hasMore: totalCount > page * pageSize,
	};
};
