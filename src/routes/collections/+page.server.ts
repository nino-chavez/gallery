/**
 * Collections Page - AI-Curated Story Collections
 *
 * Week 6-7 deliverable: Display AI-curated story collections using Bucket 2 metadata
 *
 * Collections are curated based on narrative arcs:
 * 1. Comeback Stories - triumph in final minutes
 * 2. Peak Intensity - highest action moments
 * 3. Golden Hour Magic - aesthetic excellence in golden hour
 * 4. Focus & Determination - determined athletes with technical excellence
 * 5. Victory Celebrations - celebration moments with high emotional impact
 */

import { supabaseServer } from '$lib/supabase/server';
import type { PageServerLoad } from './$types';

// Collection definitions (HYBRID: Story + Quality)
// Matching generate-collections.ts with quality thresholds
const COLLECTIONS = [
	{
		slug: 'portfolio-excellence',
		title: 'Portfolio Excellence',
		narrative: 'The absolute best: technical mastery meets emotional impact',
		description: 'Triple-excellent photography—the top tier where sharpness, composition, and emotional impact all score 9/10 or higher. These photos represent the pinnacle of sports photography craft.',
		coverPhotoIndex: 0,
	},
	{
		slug: 'comeback-stories',
		title: 'Comeback Stories',
		narrative: 'Critical moments of triumph in the final minutes',
		description: 'Dramatic comebacks and clutch performances when it matters most. These photos capture the intensity and emotion of athletes fighting back in the closing moments of competition.',
		coverPhotoIndex: 0,
	},
	{
		slug: 'peak-intensity',
		title: 'Peak Intensity',
		narrative: 'The most intense moments of gameplay',
		description: 'Maximum effort, maximum focus, maximum intensity. These photos freeze the pinnacle of athletic performance—the moments when everything is on the line and athletes give their absolute all.',
		coverPhotoIndex: 0,
	},
	{
		slug: 'golden-hour-magic',
		title: 'Golden Hour Magic',
		narrative: 'Stunning captures during the magic hour',
		description: 'The warm, ethereal glow of golden hour transforms athletic moments into art. These photos showcase the perfect intersection of technical excellence and natural beauty.',
		coverPhotoIndex: 0,
	},
	{
		slug: 'focus-and-determination',
		title: 'Focus & Determination',
		narrative: 'Unwavering concentration and relentless drive',
		description: 'The quiet intensity before the storm. These photos capture athletes in moments of pure focus and determination, where mental strength is just as visible as physical prowess.',
		coverPhotoIndex: 0,
	},
	{
		slug: 'victory-celebrations',
		title: 'Victory Celebrations',
		narrative: 'Pure joy and shared triumph',
		description: 'The moments after victory—unfiltered emotion, team unity, and the sweet taste of success. These photos capture the human side of sports: the joy, the relief, the celebration.',
		coverPhotoIndex: 0,
	},
];

interface CollectionWithPhotos {
	slug: string;
	title: string;
	narrative: string;
	description: string;
	photoCount: number;
	coverPhoto: any | null;
}

export const load: PageServerLoad = async () => {
	// Generate collections dynamically by querying with the same criteria as generate-collections.ts
	const collectionsWithPhotos: CollectionWithPhotos[] = [];

	for (const collection of COLLECTIONS) {
		let photoCount = 0;
		let coverPhoto = null;

		// Query based on collection type (HYBRID: Story + Quality thresholds)
		if (collection.slug === 'portfolio-excellence') {
			// Triple-excellent: 9/10+ on all quality metrics
			const { data, count } = await supabaseServer
				.from('photo_metadata')
				.select('photo_id, image_key, ImageUrl, ThumbnailUrl', { count: 'exact' })
				.gte('sharpness', 9)
				.gte('composition_score', 9)
				.gte('emotional_impact', 9)
				.not('sharpness', 'is', null)
				.order('sharpness', { ascending: false })
				.limit(1);

			photoCount = count || 0;
			coverPhoto = data?.[0] || null;
		} else if (collection.slug === 'comeback-stories') {
			// HYBRID: Story (triumph + final minutes) + Quality floor (7/10)
			const { data, count } = await supabaseServer
				.from('photo_metadata')
				.select('photo_id, image_key, ImageUrl, ThumbnailUrl', { count: 'exact' })
				.eq('emotion', 'triumph')
				.eq('time_in_game', 'final_5_min')
				.gte('emotional_impact', 7)
				.gte('sharpness', 7)
				.gte('composition_score', 7)
				.not('sharpness', 'is', null)
				.order('emotional_impact', { ascending: false })
				.limit(1);

			photoCount = count || 0;
			coverPhoto = data?.[0] || null;
		} else if (collection.slug === 'peak-intensity') {
			// HYBRID: Story (peak action) + Quality floor (7/10)
			const { data, count } = await supabaseServer
				.from('photo_metadata')
				.select('photo_id, image_key, ImageUrl, ThumbnailUrl', { count: 'exact' })
				.eq('action_intensity', 'peak')
				.gte('emotional_impact', 8)
				.gte('sharpness', 7)
				.gte('composition_score', 7)
				.not('sharpness', 'is', null)
				.order('emotional_impact', { ascending: false })
				.limit(1);

			photoCount = count || 0;
			coverPhoto = data?.[0] || null;
		} else if (collection.slug === 'golden-hour-magic') {
			const { data, count } = await supabaseServer
				.from('photo_metadata')
				.select('photo_id, image_key, ImageUrl, ThumbnailUrl', { count: 'exact' })
				.eq('time_of_day', 'golden_hour')
				.gte('composition_score', 7)
				.gte('sharpness', 7)
				.not('sharpness', 'is', null)
				.order('composition_score', { ascending: false })
				.limit(1);

			photoCount = count || 0;
			coverPhoto = data?.[0] || null;
		} else if (collection.slug === 'focus-and-determination') {
			// HYBRID: Story (determination) + Higher quality floor (8/10 sharpness, 7/10 others)
			const { data, count } = await supabaseServer
				.from('photo_metadata')
				.select('photo_id, image_key, ImageUrl, ThumbnailUrl', { count: 'exact' })
				.eq('emotion', 'determination')
				.gte('sharpness', 8)
				.gte('composition_score', 7)
				.gte('emotional_impact', 7)
				.not('sharpness', 'is', null)
				.order('sharpness', { ascending: false })
				.limit(1);

			photoCount = count || 0;
			coverPhoto = data?.[0] || null;
		} else if (collection.slug === 'victory-celebrations') {
			// HYBRID: Story (celebrations) + Quality floor (7/10)
			const { data, count } = await supabaseServer
				.from('photo_metadata')
				.select('photo_id, image_key, ImageUrl, ThumbnailUrl', { count: 'exact' })
				.eq('photo_category', 'celebration')
				.gte('emotional_impact', 7)
				.gte('sharpness', 7)
				.gte('composition_score', 7)
				.not('sharpness', 'is', null)
				.order('emotional_impact', { ascending: false })
				.limit(1);

			photoCount = count || 0;
			coverPhoto = data?.[0] || null;
		}

		collectionsWithPhotos.push({
			...collection,
			photoCount,
			coverPhoto,
		});
	}

	// Filter out empty collections
	const activeCollections = collectionsWithPhotos.filter((c) => c.photoCount > 0);

	return {
		collections: activeCollections,
		stats: {
			totalCollections: activeCollections.length,
			totalPhotos: activeCollections.reduce((sum, c) => sum + c.photoCount, 0),
		},
	};
};
