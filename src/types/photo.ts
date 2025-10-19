/**
 * Photo Types - Living Archive v3 (SvelteKit)
 *
 * Core type definitions for AI-enriched photo metadata
 * Migrated from v2 Next.js implementation
 */

export type EmotionType =
  | 'triumph'
  | 'focus'
  | 'intensity'
  | 'determination'
  | 'excitement'
  | 'serenity';

export type PlayType =
  | 'attack'
  | 'block'
  | 'dig'
  | 'set'
  | 'serve'
  | 'pass'
  | 'celebration'
  | 'timeout'
  | null;

export type ActionIntensity = 'low' | 'medium' | 'high' | 'peak';

export type CompositionType =
  | 'rule-of-thirds'
  | 'leading-lines'
  | 'symmetry'
  | 'depth-of-field';

export type AIProvider = 'gemini' | 'claude' | 'openai';

/**
 * AI-enriched photo metadata (12 semantic dimensions)
 */
export interface PhotoMetadata {
  // Quality scores (0-10)
  sharpness: number;
  exposure_accuracy: number;
  composition_score: number;
  emotional_impact: number;

  // Portfolio flags
  portfolio_worthy: boolean;
  print_ready: boolean;
  social_media_optimized: boolean;

  // Composition & Emotion
  emotion: EmotionType;
  composition: string;
  time_of_day: string;

  // Volleyball-specific (legacy)
  play_type: PlayType;
  action_intensity: ActionIntensity;

  // Sport taxonomy (NEW - Week 1 multi-sport migration)
  sport_type?: string;       // volleyball, basketball, soccer, portrait, etc.
  photo_category?: string;   // action, celebration, candid, portrait, warmup, ceremony
  action_type?: string | null;      // Sport-specific action type (e.g., attack, dunk, goal)

  // Use cases
  use_cases: string[];

  // AI metadata
  ai_provider: AIProvider;
  ai_cost: number;
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
 * Filter state for photo browsing
 */
export interface PhotoFilterState {
  // Quality filters
  portfolioWorthy?: boolean;
  printReady?: boolean;
  socialMediaOptimized?: boolean;
  minQualityScore?: number;
  maxQualityScore?: number; // Added for gallery quality range support

  // Semantic filters
  emotions?: EmotionType[];
  playTypes?: PlayType[];
  actionIntensity?: ActionIntensity[];
  compositions?: CompositionType[];
  timeOfDay?: string[];

  // Sport taxonomy filters (NEW - Week 2)
  sportType?: string;           // volleyball, basketball, soccer, etc.
  photoCategory?: string;       // action, celebration, candid, portrait, etc.
  actionType?: string;          // Sport-specific action type

  // Album filter
  albumKey?: string;

  // Search
  searchQuery?: string;
}

/**
 * Sort modes for photo grid
 */
export type PhotoSortMode =
  | 'quality' // Sort by average quality score
  | 'chronological' // Sort by created_at
  | 'emotion' // Sort by emotion
  | 'play-type'; // Sort by play type

/**
 * Photo grid view mode
 */
export type PhotoGridMode =
  | 'standard' // Equal visual weight
  | 'quality-stratified' // Portfolio photos prioritized
  | 'emotion-grouped'; // Grouped by emotion

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
