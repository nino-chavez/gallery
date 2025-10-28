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
];

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;

	// Find collection definition
	const collectionDef = COLLECTIONS.find((c) => c.slug === slug);
	if (!collectionDef) {
		throw error(404, 'Collection not found');
	}

	// Fetch photos based on collection type (HYBRID: Story + Quality)
	let photos: Photo[] = [];

	if (slug === 'portfolio-excellence') {
		// Triple-excellent: 9/10+ on all quality metrics
		const { data } = await supabaseServer
			.from('photo_metadata')
			.select('*')
			.gte('sharpness', 9)
			.gte('composition_score', 9)
			.gte('emotional_impact', 9)
			.not('sharpness', 'is', null)
			.order('sharpness', { ascending: false })
			.limit(48); // Show more of the best

		photos = (data || []) as Photo[];
	} else if (slug === 'comeback-stories') {
		// HYBRID: Story (triumph + final minutes) + Quality floor (7/10)
		const { data } = await supabaseServer
			.from('photo_metadata')
			.select('*')
			.eq('emotion', 'triumph')
			.eq('time_in_game', 'final_5_min')
			.gte('emotional_impact', 7)
			.gte('sharpness', 7)
			.gte('composition_score', 7)
			.not('sharpness', 'is', null)
			.order('emotional_impact', { ascending: false })
			.limit(24);

		photos = (data || []) as Photo[];
	} else if (slug === 'peak-intensity') {
		// HYBRID: Story (peak action) + Quality floor (7/10)
		const { data } = await supabaseServer
			.from('photo_metadata')
			.select('*')
			.eq('action_intensity', 'peak')
			.gte('emotional_impact', 8)
			.gte('sharpness', 7)
			.gte('composition_score', 7)
			.not('sharpness', 'is', null)
			.order('emotional_impact', { ascending: false })
			.limit(24);

		photos = (data || []) as Photo[];
	} else if (slug === 'golden-hour-magic') {
		const { data } = await supabaseServer
			.from('photo_metadata')
			.select('*')
			.eq('time_of_day', 'golden_hour')
			.gte('composition_score', 7)
			.gte('sharpness', 7)
			.not('sharpness', 'is', null)
			.order('composition_score', { ascending: false })
			.limit(24);

		photos = (data || []) as Photo[];
	} else if (slug === 'focus-and-determination') {
		// HYBRID: Story (determination) + Higher quality floor (8/10 sharpness, 7/10 others)
		const { data } = await supabaseServer
			.from('photo_metadata')
			.select('*')
			.eq('emotion', 'determination')
			.gte('sharpness', 8)
			.gte('composition_score', 7)
			.gte('emotional_impact', 7)
			.not('sharpness', 'is', null)
			.order('sharpness', { ascending: false })
			.limit(24);

		photos = (data || []) as Photo[];
	} else if (slug === 'victory-celebrations') {
		// HYBRID: Story (celebrations) + Quality floor (7/10)
		const { data } = await supabaseServer
			.from('photo_metadata')
			.select('*')
			.eq('photo_category', 'celebration')
			.gte('emotional_impact', 7)
			.gte('sharpness', 7)
			.gte('composition_score', 7)
			.not('sharpness', 'is', null)
			.order('emotional_impact', { ascending: false })
			.limit(24);

		photos = (data || []) as Photo[];
	}

	return {
		collection: {
			...collectionDef,
			photoCount: photos.length,
		},
		photos,
	};
};
