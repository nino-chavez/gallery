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
		image_url: photoData.ImageUrl || photoData.image_url,
		thumbnail_url: photoData.ThumbnailUrl || photoData.thumbnail_url,
		original_url: photoData.OriginalUrl || photoData.original_url,
		title: photoData.title || 'Untitled Photo',
		caption: photoData.caption || '',
		keywords: photoData.keywords || [],
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

	return {
		photo,
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
