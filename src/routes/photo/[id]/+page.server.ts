/**
 * Photo Detail Page - Server-Side Data Loading
 *
 * Loads individual photo data from Supabase and generates SEO meta tags
 * for social sharing (Open Graph, Twitter Cards, Schema.org)
 */

import { error } from '@sveltejs/kit';
import { supabaseServer } from '$lib/supabase/server';
import type { PageServerLoad } from './$types';
import type { Photo } from '$types/photo';

export const load: PageServerLoad = async ({ params }) => {
	// Fetch photo from Supabase using image_key
	const { data: photoData, error: photoError } = await supabaseServer
		.from('photo_metadata')
		.select('*')
		.eq('image_key', params.id)
		.single();

	if (photoError || !photoData) {
		throw error(404, {
			message: 'Photo not found',
			details: `No photo found with ID: ${params.id}`
		});
	}

	// Transform flat Supabase data to nested Photo type
	const photo: Photo = {
		id: photoData.image_key,
		image_key: photoData.image_key,
		image_url: photoData.ImageUrl,
		thumbnail_url: photoData.ThumbnailUrl,
		original_url: photoData.OriginalUrl,
		title: photoData.album_name || 'Untitled Photo',
		caption: photoData.composition || '',
		keywords: photoData.use_cases || [],
		created_at: photoData.photo_date || photoData.enriched_at || photoData.upload_date,
		metadata: {
			// Quality scores
			sharpness: photoData.sharpness || 0,
			exposure_accuracy: photoData.exposure_accuracy || 0,
			composition_score: photoData.composition_score || 0,
			emotional_impact: photoData.emotional_impact || 0,

			// Portfolio flags
			portfolio_worthy: photoData.portfolio_worthy || false,
			print_ready: photoData.print_ready || false,
			social_media_optimized: photoData.social_media_optimized || false,

			// Composition & Emotion
			emotion: photoData.emotion || 'focus',
			composition: photoData.composition || '',
			time_of_day: photoData.time_of_day || '',

			// Sport taxonomy (NEW)
			sport_type: photoData.sport_type || 'volleyball',
			photo_category: photoData.photo_category || 'action',
			action_type: photoData.action_type || null,

			// Legacy volleyball-specific (backward compatibility)
			play_type: photoData.play_type || null,
			action_intensity: photoData.action_intensity || 'medium',

			// Use cases
			use_cases: photoData.use_cases || [],

			// AI metadata
			ai_provider: photoData.ai_provider || 'unknown',
			ai_cost: photoData.ai_cost || 0,
			enriched_at: photoData.enriched_at || ''
		}
	};

	// Generate SEO-optimized description
	const seoDescription = generatePhotoDescription(photo);

	// Use thumbnail for OG image (faster loading, still high quality)
	const ogImage = photo.thumbnail_url || photo.image_url;

	// Build canonical URL
	const baseUrl = 'https://gallery.ninochavez.com';
	const canonicalUrl = `${baseUrl}/photo/${params.id}`;

	// Fetch related photos (NEW - Week 2)
	const relatedPhotos = await fetchRelatedPhotos(photo, photoData.album_key);

	return {
		photo,
		relatedPhotos, // NEW
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
 * Generate SEO-optimized description for photo
 * Includes sport, category, emotion, and call-to-action
 */
function generatePhotoDescription(photo: Photo): string {
	const sport = photo.metadata.sport_type || 'sports';
	const category = photo.metadata.photo_category || 'photo';
	const emotion = photo.metadata.emotion;
	const quality = photo.metadata.portfolio_worthy ? 'Portfolio-quality' : 'High-quality';

	// Base description
	let description = `${quality} ${sport} ${category} photo`;

	// Add emotion if present
	if (emotion) {
		description += ` capturing ${emotion}`;
	}

	// Add caption if present
	if (photo.caption) {
		description += `. ${photo.caption}`;
	} else {
		description += '. Professional sports photography by Nino Chavez.';
	}

	// Add call-to-action
	const useCases = photo.metadata.use_cases || [];
	if (useCases.length > 0) {
		description += ` Perfect for ${useCases.slice(0, 3).join(', ')}.`;
	} else {
		description += ' Perfect for recruiting, social media, and print.';
	}

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
	// Then sort by quality score and limit to 12

	const { data, error } = await supabaseServer
		.from('photo_metadata')
		.select('*')
		.neq('image_key', currentPhoto.image_key) // Exclude current photo
		.not('sharpness', 'is', null) // Only enriched photos
		.or(`album_key.eq.${albumKey},and(sport_type.eq.${sportType},photo_category.eq.${photoCategory}),sport_type.eq.${sportType}`)
		.order('quality_score', { ascending: false })
		.limit(12);

	if (error) {
		console.error('[Photo Detail] Error fetching related photos:', error);
		return [];
	}

	// Transform to Photo type (reuse same mapping as main photo)
	return (data || []).map((row: any) => ({
		id: row.image_key,
		image_key: row.image_key,
		image_url: row.ImageUrl,
		thumbnail_url: row.ThumbnailUrl,
		original_url: row.OriginalUrl,
		title: row.album_name || 'Untitled Photo',
		caption: row.composition || '',
		keywords: row.use_cases || [],
		created_at: row.photo_date || row.enriched_at || row.upload_date,
		metadata: {
			sharpness: row.sharpness || 0,
			exposure_accuracy: row.exposure_accuracy || 0,
			composition_score: row.composition_score || 0,
			emotional_impact: row.emotional_impact || 0,
			portfolio_worthy: row.portfolio_worthy || false,
			print_ready: row.print_ready || false,
			social_media_optimized: row.social_media_optimized || false,
			emotion: row.emotion || 'focus',
			composition: row.composition || '',
			time_of_day: row.time_of_day || '',
			sport_type: row.sport_type || 'volleyball',
			photo_category: row.photo_category || 'action',
			action_type: row.action_type || null,
			play_type: row.play_type || null,
			action_intensity: row.action_intensity || 'medium',
			use_cases: row.use_cases || [],
			ai_provider: row.ai_provider || 'unknown',
			ai_cost: row.ai_cost || 0,
			enriched_at: row.enriched_at || ''
		}
	}));
}
