/**
 * Photo Types - Living Archive v3 (SvelteKit)
 *
 * Core type definitions for AI-enriched photo metadata
 * Migrated from v2 Next.js implementation
 */

// =============================================================================
// BUCKET 1: Concrete & Filterable (USER-FACING)
// These types are exposed as search filters
// =============================================================================

export type PlayType =
  | 'attack'
  | 'block'
  | 'dig'
  | 'set'
  | 'serve'
  | 'celebration'
  | 'transition'
  | null;

export type ActionIntensity = 'low' | 'medium' | 'high' | 'peak';

export type CompositionType =
  | 'rule_of_thirds'
  | 'leading_lines'
  | 'framing'
  | 'symmetry'
  | 'depth'
  | 'negative_space';

export type TimeOfDay =
  | 'golden_hour'
  | 'midday'
  | 'evening'
  | 'blue_hour'
  | 'night'
  | 'dawn';

export type LightingType =
  | 'natural'
  | 'backlit'
  | 'dramatic'
  | 'soft'
  | 'artificial';

export type ColorTemperature = 'warm' | 'cool' | 'neutral';

// =============================================================================
// BUCKET 2: Abstract & Internal (AI-ONLY)
// These types are NOT exposed as user-facing filters
// =============================================================================

export type EmotionType =
  | 'triumph'
  | 'determination'
  | 'intensity'
  | 'focus'
  | 'excitement'
  | 'serenity';

export type TimeInGame =
  | 'first_5_min'
  | 'middle'
  | 'final_5_min'
  | 'overtime'
  | 'unknown';

// =============================================================================
// AI Provider
// =============================================================================

export type AIProvider = 'gemini' | 'claude' | 'openai';

/**
 * AI-enriched photo metadata (Two-Bucket Model)
 *
 * BUCKET 1: Concrete & Filterable (user-facing search filters)
 * BUCKET 2: Abstract & Internal (AI story detection only)
 */
export interface PhotoMetadata {
  // ==========================================================================
  // BUCKET 1: Concrete & Filterable (USER-FACING)
  // ==========================================================================

  // Action dimension
  play_type: PlayType;
  action_intensity: ActionIntensity;
  sport_type: string;        // volleyball, basketball, soccer
  photo_category: string;    // action, celebration, candid, portrait

  // Aesthetic dimension
  composition: CompositionType;
  time_of_day: TimeOfDay;
  lighting: LightingType;              // NEW
  color_temperature: ColorTemperature; // NEW

  // ==========================================================================
  // BUCKET 2: Abstract & Internal (AI-ONLY, NOT USER-FACING)
  // ==========================================================================

  // Emotion (internal for story detection)
  emotion: EmotionType;

  // Quality metrics (internal scoring)
  sharpness: number;              // 0-10
  composition_score: number;      // 0-10
  exposure_accuracy: number;      // 0-10
  emotional_impact: number;       // 0-10

  // Story detection context (internal)
  time_in_game?: TimeInGame;      // NEW: For game-winning rally detection
  athlete_id?: string;            // NEW: For player highlight reels
  event_id?: string;              // NEW: For grouping by game/tournament

  // ==========================================================================
  // AI Metadata
  // ==========================================================================

  ai_provider: AIProvider;
  ai_cost: number;
  ai_confidence: number;          // NEW: Overall detection confidence (0-1)
  enriched_at: string;
}

/**
 * Photo with enriched metadata and SmugMug data
 */
export interface Photo {
  id: string;
  image_key: string;
  image_url: string;
  thumbnail_url?: string; // SmugMug thumbnail URL (S or M size) for performance
  original_url?: string; // Full-resolution URL
  title: string;
  caption: string;
  keywords: string[];
  created_at: string; // Actual photo date (photo_date from DB, prioritized for sorting)
  metadata: PhotoMetadata;

  // SmugMug metadata for enhanced features
  smugmug?: {
    // Dates (for frontend flexibility)
    photo_date?: string;      // Actual capture date from EXIF
    upload_date?: string;      // When uploaded to SmugMug
    date_added?: string;       // When added to album

    // Image dimensions
    width?: number;
    height?: number;
    file_name?: string;
    aspect_ratio?: number;     // Width/height ratio for responsive layout

    // Album context
    album_key?: string;
    album_name?: string;

    // Geolocation (for future map features)
    latitude?: number;
    longitude?: number;
    location_name?: string;

    // EXIF camera data (for photography enthusiasts)
    camera_make?: string;
    camera_model?: string;
    lens_model?: string;
    focal_length?: string;
    aperture?: string;
    shutter_speed?: string;
    iso?: number;
  };
}

/**
 * Filter state for photo browsing (CONCRETE FILTERS ONLY)
 *
 * Only Bucket 1 (user-facing) fields are exposed as filters.
 * Bucket 2 (internal) fields are NOT searchable.
 */
export interface PhotoFilterState {
  // ==========================================================================
  // Action Filters (Concrete)
  // ==========================================================================
  playTypes?: PlayType[];
  actionIntensity?: ActionIntensity[];
  sportType?: string;
  photoCategory?: string;

  // ==========================================================================
  // Aesthetic Filters (Concrete)
  // ==========================================================================
  compositions?: CompositionType[];
  timeOfDay?: TimeOfDay[];
  lighting?: LightingType[];              // NEW
  colorTemperature?: ColorTemperature[];  // NEW

  // ==========================================================================
  // Context Filters
  // ==========================================================================
  albumKey?: string;
  searchQuery?: string;

  // ==========================================================================
  // REMOVED: Obsolete/Internal Filters
  // ==========================================================================
  // ❌ portfolioWorthy (assumes quality varies)
  // ❌ printReady (subjective, not extractable)
  // ❌ socialMediaOptimized (subjective, not extractable)
  // ❌ minQualityScore / maxQualityScore (futile filter)
  // ❌ emotions (abstract, not useful alone - moved to Bucket 2)
}

/**
 * Sort modes for photo grid (CONCRETE ONLY)
 */
export type PhotoSortMode =
  | 'chronological' // Sort by created_at (default)
  | 'play-type'     // Sort by play type
  | 'intensity';    // Sort by action intensity

/**
 * Photo grid view mode
 */
export type PhotoGridMode =
  | 'standard'      // Equal visual weight (default)
  | 'play-grouped'  // Grouped by play type
  | 'time-grouped'; // Grouped by time of day

// =============================================================================
// REMOVED: Obsolete sort/view modes
// =============================================================================
// ❌ 'quality' sort (assumes quality varies)
// ❌ 'emotion' sort (abstract, not user-facing)
// ❌ 'quality-stratified' view (assumes quality varies)
// ❌ 'emotion-grouped' view (abstract, not user-facing)

/**
 * Narrative arc type for AI story curation
 */
export type NarrativeArcType =
  | 'game-winning-rally'
  | 'player-highlight-reel'
  | 'season-journey'
  | 'comeback-story'
  | 'technical-excellence'
  | 'emotion-spectrum';

/**
 * AI-generated narrative arc
 */
export interface NarrativeArc {
  type: NarrativeArcType;
  title: string;
  description: string;
  photos: Photo[];
  emotionalCurve: number[]; // Emotional intensity over time (0-10)
  duration: number; // Seconds
  generatedAt: string;
}
