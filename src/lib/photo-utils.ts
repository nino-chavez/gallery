/**
 * Photo Utility Functions - SvelteKit Migration
 *
 * Centralized utilities for photo-related calculations and transformations.
 * Eliminates duplicate logic across components.
 */

import type { Photo, PhotoMetadata } from '$types/photo';
import {
	Trophy,
	Flame,
	Target,
	Zap,
	Sparkles,
	Waves,
	type Icon
} from 'lucide-svelte';

/**
 * Emotion Color Mapping (from app.css emotion palette)
 * These colors are used for emotion halos and visual indicators
 */
export const emotionColors: Record<string, string> = {
	triumph: '#FFD700',
	intensity: '#FF4500',
	focus: '#4169E1',
	determination: '#8B008B',
	excitement: '#FF69B4',
	serenity: '#20B2AA'
};

/**
 * Emotion Icon Mapping (WCAG 1.4.1 Compliance)
 *
 * Icons provide a non-color indicator to supplement emotion halos.
 * This ensures users with color blindness can distinguish emotions.
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html
 */
export const emotionIcons: Record<string, typeof Icon> = {
	triumph: Trophy,
	intensity: Flame,
	focus: Target,
	determination: Zap,
	excitement: Sparkles,
	serenity: Waves
};

/**
 * Get emotion icon component for a given emotion
 *
 * @param emotion - Emotion string (case-insensitive)
 * @returns Icon component or null if emotion not found
 */
export function getEmotionIcon(emotion: string | null | undefined): typeof Icon | null {
	if (!emotion) return null;
	return emotionIcons[emotion.toLowerCase()] || null;
}

/**
 * Get emotion color hex value for a given emotion
 *
 * @param emotion - Emotion string (case-insensitive)
 * @returns Hex color string or null if emotion not found
 */
export function getEmotionColor(emotion: string | null | undefined): string | null {
	if (!emotion) return null;
	return emotionColors[emotion.toLowerCase()] || null;
}

/**
 * Calculate average quality score from photo metadata
 *
 * Quality score is the average of 4 metrics:
 * - Sharpness (0-10)
 * - Exposure accuracy (0-10)
 * - Composition score (0-10)
 * - Emotional impact (0-10)
 *
 * @param metadata - Photo metadata with quality scores
 * @returns Average quality score (0-10)
 *
 * @example
 * const score = calculateQualityScore(photo.metadata);
 * // => 8.5
 */
export function calculateQualityScore(metadata: PhotoMetadata): number {
  const { sharpness, exposure_accuracy, composition_score, emotional_impact } = metadata;

  // Validate all scores are numbers
  const scores = [sharpness, exposure_accuracy, composition_score, emotional_impact];
  const validScores = scores.filter((score) => typeof score === 'number' && !isNaN(score));

  if (validScores.length === 0) {
    return 0;
  }

  return validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
}

/**
 * Calculate average quality score directly from a Photo object
 *
 * @param photo - Photo object with metadata
 * @returns Average quality score (0-10)
 */
export function getPhotoQualityScore(photo: Photo): number {
  return calculateQualityScore(photo.metadata);
}

/**
 * Categorize photo quality into tiers
 *
 * @param score - Quality score (0-10)
 * @returns Quality tier classification
 */
export function getQualityTier(score: number): 'low' | 'medium' | 'high' | 'exceptional' {
  if (score < 5) return 'low';
  if (score < 7) return 'medium';
  if (score < 9) return 'high';
  return 'exceptional';
}

// REMOVED: isPortfolioQuality - Assumes quality varies (against two-bucket model)
// REMOVED: getQualityOpacity - Quality stratification removed
// REMOVED: getQualityBlurClass - Quality stratification removed

/**
 * Sort photos by quality score (descending)
 *
 * @param photos - Array of photos to sort
 * @returns Sorted array (highest quality first)
 */
export function sortPhotosByQuality(photos: Photo[]): Photo[] {
  return [...photos].sort((a, b) => {
    const qualityA = getPhotoQualityScore(a);
    const qualityB = getPhotoQualityScore(b);
    return qualityB - qualityA;
  });
}

/**
 * Sort photos by date (most recent first)
 *
 * @param photos - Array of photos to sort
 * @returns Sorted array (newest first)
 */
export function sortPhotosByDate(photos: Photo[]): Photo[] {
  return [...photos].sort((a, b) => {
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return dateB - dateA;
  });
}

// REMOVED: filterPhotosByQuality - User-facing quality filtering against two-bucket model

/**
 * Generate accessible alt text for a photo
 *
 * Combines metadata attributes into descriptive alt text for screen readers.
 * WCAG 1.4.1 compliant: includes emotion information that supplements visual halos.
 *
 * @param photo - Photo object
 * @param includeTitle - Whether to prepend photo title
 * @returns Alt text string
 *
 * @example
 * generatePhotoAltText(photo)
 * // => "Portfolio-worthy volleyball photo. Emotion: Triumph. Quality score 8.5/10. High intensity action."
 */
export function generatePhotoAltText(photo: Photo, includeTitle: boolean = true): string {
  const { metadata } = photo;
  const qualityScore = getPhotoQualityScore(photo);
  const parts: string[] = [];

  // Include title if available and requested
  if (includeTitle && photo.title) {
    parts.push(photo.title);
  }

  // Sport type
  if (metadata.sport_type) {
    parts.push(`${metadata.sport_type} photo`);
  }

  // Emotion (WCAG 1.4.1: non-color indicator for emotion halo)
  if (metadata.emotion) {
    parts.push(`Emotion: ${metadata.emotion}`);
  }

  // Lighting and aesthetic info (Bucket 1)
  if (metadata.lighting) {
    parts.push(`${metadata.lighting} lighting`);
  }

  if (metadata.time_of_day) {
    parts.push(`${metadata.time_of_day}`);
  }

  // Action intensity
  if (metadata.action_intensity) {
    parts.push(`${metadata.action_intensity} intensity action`);
  }

  // Play type
  if (metadata.play_type) {
    parts.push(metadata.play_type);
  }

  return parts.join('. ');
}

/**
 * Calculate emotion-based glow intensity
 *
 * Uses internal quality metrics (Bucket 2) for visual effects
 *
 * @param metadata - Photo metadata
 * @returns Glow intensity in pixels
 */
export function calculateGlowIntensity(metadata: PhotoMetadata): number {
  return calculateQualityScore(metadata);
}
