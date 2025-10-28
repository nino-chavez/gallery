/**
 * Photo Detail Page - Server-Side Data Loading
 *
 * Loads individual photo data from Supabase and generates SEO meta tags
 * for social sharing (Open Graph, Twitter Cards, Schema.org)
 */

import { error } from '@sveltejs/kit';
import { supabaseServer } from '$lib/supabase/server';
import { trackPhotoView } from '$lib/analytics/tracker';
import type { PageServerLoad } from './$types';
import type { Photo } from '$types/photo';
import type { PhotoMetadataRow } from '$types/database';

export const load: PageServerLoad = async ({ params, url }) => {
	// Fetch photo from Supabase using image_key
	const { data: photoData, error: photoError } = await supabaseServer
		.from('photo_metadata')
		.select('*')
		.eq('image_key', params.id)
		.single();

	if (photoError || !photoData) {
		throw error(404, `Photo not found: ${params.id}`);
	}

	// Transform flat Supabase data to nested Photo type (two-bucket model)
	const photo: Photo = {
		id: photoData.image_key,
		image_key: photoData.image_key,
		image_url: photoData.ImageUrl,
		thumbnail_url: photoData.ThumbnailUrl,
		original_url: photoData.OriginalUrl,
		title: photoData.album_name || 'Untitled Photo',
		caption: photoData.composition || '',
		keywords: [],
		created_at: photoData.photo_date || photoData.enriched_at || photoData.upload_date,
		metadata: {
			// BUCKET 1: Concrete & Filterable
			play_type: (photoData.play_type || null) as Photo['metadata']['play_type'],
			action_intensity: (photoData.action_intensity || 'medium') as Photo['metadata']['action_intensity'],
			sport_type: photoData.sport_type || 'volleyball',
			photo_category: photoData.photo_category || 'action',
			composition: (photoData.composition || '') as Photo['metadata']['composition'],
			time_of_day: (photoData.time_of_day || '') as Photo['metadata']['time_of_day'],
			lighting: (photoData.lighting || undefined) as Photo['metadata']['lighting'],
			color_temperature: (photoData.color_temperature || undefined) as Photo['metadata']['color_temperature'],

			// BUCKET 2: Abstract & Internal
			emotion: (photoData.emotion || 'focus') as Photo['metadata']['emotion'],
			sharpness: photoData.sharpness || 0,
			composition_score: photoData.composition_score || 0,
			exposure_accuracy: photoData.exposure_accuracy || 0,
			emotional_impact: photoData.emotional_impact || 0,
			time_in_game: (photoData.time_in_game || undefined) as Photo['metadata']['time_in_game'],
			athlete_id: photoData.athlete_id || undefined,
			event_id: photoData.event_id || undefined,

			// AI metadata
			ai_provider: (photoData.ai_provider || 'gemini') as Photo['metadata']['ai_provider'],
			ai_cost: photoData.ai_cost || 0,
			ai_confidence: photoData.ai_confidence || 0,
			enriched_at: photoData.enriched_at || new Date().toISOString()
		}
	};

	// Generate SEO-optimized description
	const seoDescription = generatePhotoDescription(photo);

	// Use thumbnail for OG image (faster loading, still high quality)
	const ogImage = photo.thumbnail_url || photo.image_url;

	// Build canonical URL
	const baseUrl = 'https://photography.ninochavez.co';
	const canonicalUrl = `${baseUrl}/photo/${params.id}`;

	// Fetch related photos (NEW - Week 2)
	const relatedPhotos = await fetchRelatedPhotos(photo, photoData.album_key);

	// Fetch approved tags (NEW - Week 3-4: Player Tagging)
	const { data: tags } = await supabaseServer
		.from('user_tags')
		.select('*')
		.eq('photo_id', photoData.photo_id)
		.eq('approved', true);

	// Track photo view (NEW - Analytics)
	// Determine view source from referrer
	const referrer = url.searchParams.get('ref') || url.searchParams.get('from');
	let viewSource: 'explore' | 'collection' | 'album' | 'direct' | 'search' | 'timeline' | 'favorites' = 'direct';

	if (referrer) {
		if (referrer.startsWith('collection-')) {
			viewSource = 'collection';
		} else if (referrer.startsWith('album-')) {
			viewSource = 'album';
		} else if (referrer === 'explore') {
			viewSource = 'explore';
		} else if (referrer === 'search') {
			viewSource = 'search';
		} else if (referrer === 'timeline') {
			viewSource = 'timeline';
		} else if (referrer === 'favorites') {
			viewSource = 'favorites';
		}
	}

	// Track asynchronously (don't wait)
	trackPhotoView({
		photo_id: photoData.photo_id,
		view_source: viewSource,
		referrer: referrer || undefined,
	});

	return {
		photo,
		relatedPhotos, // NEW
		approvedTags: tags || [], // NEW
		seo: {
			title: `${photo.title} | Nino Chavez Photography`,
			description: seoDescription,
			ogImage: ogImage,
			ogType: 'article' as const,
			canonical: canonicalUrl,
			keywords: photo.keywords.join(', ')
		}
	};
};

/**
 * Generate SEO-optimized description for photo (two-bucket model)
 * Includes sport, category, lighting/aesthetic details
 */
function generatePhotoDescription(photo: Photo): string {
	const sport = photo.metadata.sport_type || 'sports';
	const category = photo.metadata.photo_category || 'photo';
	const lighting = photo.metadata.lighting;
	const timeOfDay = photo.metadata.time_of_day;

	// Base description (all photos are worthy)
	let description = `Professional ${sport} ${category} photo`;

	// Add aesthetic details (Bucket 1)
	if (lighting) {
		description += ` with ${lighting} lighting`;
	}

	if (timeOfDay) {
		description += ` captured during ${timeOfDay}`;
	}

	// Add caption if present
	if (photo.caption) {
		description += `. ${photo.caption}`;
	} else {
		description += '. Professional sports photography by Nino Chavez.';
	}

	// Generic call-to-action
	description += ' Perfect for recruiting, social media, and print.';

	return description;
}

/**
 * Fetch related photos based on sport, category, album, and similarity
 * (NEW - Week 2: Related Photos Carousel)
 */
async function fetchRelatedPhotos(currentPhoto: Photo, albumKey: string): Promise<Photo[]> {
	const sportType = currentPhoto.metadata.sport_type;
	const photoCategory = currentPhoto.metadata.photo_category;

	// Strategy: Fetch photos prioritizing:
	// 1. Same album (most relevant context)
	// 2. Same sport + category
	// 3. Same sport only
	// Sort by newest and limit to 12

	const { data, error } = await supabaseServer
		.from('photo_metadata')
		.select('*')
		.neq('image_key', currentPhoto.image_key) // Exclude current photo
		.not('sharpness', 'is', null) // Only enriched photos
		.or(`album_key.eq.${albumKey},and(sport_type.eq.${sportType},photo_category.eq.${photoCategory}),sport_type.eq.${sportType}`)
		.order('upload_date', { ascending: false })
		.limit(12);

	if (error) {
		console.error('[Photo Detail] Error fetching related photos:', error);
		return [];
	}

	// Transform to Photo type with two-bucket model
	return (data || []).map((row: PhotoMetadataRow) => ({
		id: row.image_key,
		image_key: row.image_key,
		image_url: row.ImageUrl,
		thumbnail_url: row.ThumbnailUrl || undefined,
		original_url: row.OriginalUrl || undefined,
		title: row.album_name || 'Untitled Photo',
		caption: row.composition || '',
		keywords: [],
		created_at: row.photo_date || row.enriched_at || row.upload_date,
		metadata: {
			// BUCKET 1
			play_type: (row.play_type || null) as Photo['metadata']['play_type'],
			action_intensity: (row.action_intensity || 'medium') as Photo['metadata']['action_intensity'],
			sport_type: row.sport_type || 'volleyball',
			photo_category: row.photo_category || 'action',
			composition: (row.composition || '') as Photo['metadata']['composition'],
			time_of_day: (row.time_of_day || '') as Photo['metadata']['time_of_day'],
			lighting: (row.lighting || undefined) as Photo['metadata']['lighting'],
			color_temperature: (row.color_temperature || undefined) as Photo['metadata']['color_temperature'],

			// BUCKET 2
			emotion: (row.emotion || 'focus') as Photo['metadata']['emotion'],
			sharpness: row.sharpness || 0,
			composition_score: row.composition_score || 0,
			exposure_accuracy: row.exposure_accuracy || 0,
			emotional_impact: row.emotional_impact || 0,
			time_in_game: (row.time_in_game || undefined) as Photo['metadata']['time_in_game'],
			athlete_id: row.athlete_id || undefined,
			event_id: row.event_id || undefined,

			// AI metadata
			ai_provider: (row.ai_provider || 'gemini') as Photo['metadata']['ai_provider'],
			ai_cost: row.ai_cost || 0,
			ai_confidence: row.ai_confidence || 0,
			enriched_at: row.enriched_at || new Date().toISOString()
		}
	}));
}
