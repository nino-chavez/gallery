import { fetchPhotos } from '$lib/supabase/server';
import type { PageServerLoad } from './$types';
import type { Photo } from '$types/photo';

export const load: PageServerLoad = async () => {
	// Fetch portfolio-worthy photos (top 50 by quality)
	// Use fetchPhotos() helper which properly transforms data into Photo objects
	const portfolioPhotos = await fetchPhotos({
		portfolioWorthy: true,
		limit: 50,
		sortBy: 'highest_quality',
	});

	// Fetch all emotion-grouped photos
	// fetchPhotos already filters for enriched photos (sharpness not null)
	const allEmotionPhotos = await fetchPhotos({
		sortBy: 'highest_quality',
	});

	// Group photos by emotion
	const collections = new Map<string, Photo[]>();
	allEmotionPhotos.forEach((photo: Photo) => {
		const emotion = photo.metadata.emotion;
		if (!emotion) return;

		if (!collections.has(emotion)) {
			collections.set(emotion, []);
		}
		collections.get(emotion)!.push(photo);
	});

	// Convert to array format for easier rendering
	const emotionCollections = Array.from(collections.entries()).map(([emotion, photos]) => ({
		emotion,
		photos: photos.slice(0, 12), // Limit to 12 photos per collection
		count: photos.length,
	}));

	return {
		portfolioPhotos,
		emotionCollections,
		stats: {
			totalCollections: emotionCollections.length,
			portfolioCount: portfolioPhotos.length,
		},
	};
};
