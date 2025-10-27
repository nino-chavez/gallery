import { fetchPhotos } from '$lib/supabase/server';
import type { PageServerLoad } from './$types';
import type { Photo } from '$types/photo';

export const load: PageServerLoad = async () => {
	// Fetch recent photos (top 50)
	// NOTE: This is a placeholder - Collections should be AI-curated per two-bucket model
	const portfolioPhotos = await fetchPhotos({
		limit: 50,
		sortBy: 'newest',
	});

	// Fetch all photos for emotion grouping
	// NOTE: Emotion is Bucket 2 (internal) - this grouping is for internal curation, not user-facing
	const allEmotionPhotos = await fetchPhotos({
		sortBy: 'newest',
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
