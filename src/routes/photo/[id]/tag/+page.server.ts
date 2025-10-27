/**
 * Photo Tagging Page - Server Load
 * Loads photo data and approved tags
 */

import { error } from '@sveltejs/kit';
import { supabaseServer } from '$lib/supabase/server';
import type { PageServerLoad } from './$types';
import type { Photo } from '$types/photo';

export const load: PageServerLoad = async ({ params }) => {
	// Fetch photo data
	const { data: photoData, error: photoError } = await supabaseServer
		.from('photo_metadata')
		.select('*')
		.eq('image_key', params.id)
		.single();

	if (photoError || !photoData) {
		throw error(404, 'Photo not found');
	}

	// Transform to Photo type
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
			play_type: photoData.play_type || null,
			action_intensity: photoData.action_intensity || 'medium',
			sport_type: photoData.sport_type || 'volleyball',
			photo_category: photoData.photo_category || 'action',
			composition: photoData.composition || '',
			time_of_day: photoData.time_of_day || '',
			lighting: photoData.lighting,
			color_temperature: photoData.color_temperature,
			emotion: photoData.emotion || 'focus',
			sharpness: photoData.sharpness || 0,
			composition_score: photoData.composition_score || 0,
			exposure_accuracy: photoData.exposure_accuracy || 0,
			emotional_impact: photoData.emotional_impact || 0,
			time_in_game: photoData.time_in_game,
			athlete_id: photoData.athlete_id,
			event_id: photoData.event_id,
			ai_provider: photoData.ai_provider || 'unknown',
			ai_cost: photoData.ai_cost || 0,
			ai_confidence: photoData.ai_confidence || 0,
			enriched_at: photoData.enriched_at || ''
		}
	};

	// Fetch approved tags for this photo
	const { data: tags, error: tagsError } = await supabaseServer
		.from('user_tags')
		.select('*')
		.eq('photo_id', photoData.photo_id)
		.eq('approved', true);

	if (tagsError) {
		console.error('[Photo Tagging] Error fetching tags:', tagsError);
	}

	return {
		photo,
		approvedTags: tags || []
	};
};
