/**
 * Database Type Definitions
 *
 * Strongly-typed interfaces for Supabase database rows.
 * These types represent the raw data structure returned from Supabase queries.
 */

/**
 * Photo metadata row from photo_metadata table
 * Represents the complete database schema for photo records
 */
export interface PhotoMetadataRow {
	// Primary identifiers
	photo_id: string;
	image_key: string;

	// Image URLs
	ImageUrl: string;
	ThumbnailUrl: string | null;
	OriginalUrl: string | null;

	// Photo metadata
	title: string | null;
	description: string | null;
	sport_type: string;
	photo_category: string;
	play_type: string | null;
	composition: string | null;
	time_of_day: string | null;
	lighting: string | null;
	color_temperature: string | null;
	use_cases: string[] | null;

	// Technical scores
	sharpness: number | null;
	exposure_accuracy: number | null;
	composition_score: number | null;
	color_quality: number | null;
	emotional_impact: number | null;
	technical_execution: number | null;

	// Classification
	emotion: string | null;
	action_intensity: string | null;

	// Game/Event context
	time_in_game: string | null;
	athlete_id: string | null;
	event_id: string | null;

	// AI metadata
	ai_provider: string | null;
	ai_cost: number | null;
	ai_confidence: number | null;

	// Album/Collection associations
	album_key: string | null;
	album_name: string | null;
	collection_slug: string | null;

	// Timestamps
	upload_date: string;
	photo_date: string | null;
	enriched_at: string | null;
	created_at: string;
	updated_at: string;
}

/**
 * Album row structure
 * Minimal representation for album queries
 */
export interface AlbumRow {
	album_key: string;
	album_name: string;
	photo_id: string;
	image_key: string;
	ImageUrl: string;
	ThumbnailUrl: string | null;
	sport_type: string;
	photo_category: string;
	upload_date: string;
}

/**
 * Collection row structure
 * For collection queries with cover photo
 */
export interface CollectionRow {
	collection_slug: string;
	photo_id: string;
	image_key: string;
	ImageUrl: string;
	ThumbnailUrl: string | null;
	sport_type: string;
	photo_category: string;
	upload_date: string;
}

/**
 * Sport distribution row
 * Result from aggregation queries
 */
export interface SportDistributionRow {
	name: string;
	count: number;
	percentage: number;
}

/**
 * Category distribution row
 * Result from aggregation queries
 */
export interface CategoryDistributionRow {
	name: string;
	count: number;
	percentage: number;
}

/**
 * Cover photo structure
 * Lightweight photo data for cover images
 */
export interface CoverPhotoRow {
	photo_id: string;
	image_key: string;
	ImageUrl: string;
	ThumbnailUrl: string | null;
}

/**
 * Related photo row
 * Minimal data for related photo suggestions
 */
export interface RelatedPhotoRow {
	photo_id: string;
	image_key: string;
	ImageUrl: string;
	ThumbnailUrl: string | null;
	sport_type: string;
	photo_category: string;
	emotion: string | null;
}

/**
 * Album with metadata structure
 * Complete album information with photo count and sport distribution
 */
export interface AlbumWithMetadata {
	albumKey: string;
	albumName: string;
	photoCount: number;
	primarySport?: string;
	primaryCategory?: string;
	firstPhotoDate?: string;
	lastPhotoDate?: string;
	coverPhoto?: CoverPhotoRow;
}
