/**
 * Photo Utility Functions - SvelteKit Migration
 *
 * Centralized utilities for photo-related calculations and transformations.
 * Eliminates duplicate logic across components.
 */

import type { Photo, PhotoMetadata } from '$types/photo';

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

/**
 * Determine if photo meets portfolio quality standards
 *
 * A photo is considered portfolio-worthy if:
 * - Metadata flag is true, OR
 * - Quality score >= 8.0 (exceptional tier)
 *
 * @param photo - Photo object
 * @returns Whether photo meets portfolio standards
 */
export function isPortfolioQuality(photo: Photo): boolean {
  return photo.metadata.portfolio_worthy || getPhotoQualityScore(photo) >= 8.0;
}

/**
 * Get quality-based opacity for stratified display
 *
 * Used in quality-stratified grids to de-emphasize low-quality photos
 *
 * @param score - Quality score (0-10)
 * @param stratified - Whether stratification is enabled
 * @returns Opacity value (0-1)
 */
export function getQualityOpacity(score: number, stratified: boolean): number {
  if (!stratified) return 1;

  const tier = getQualityTier(score);
  switch (tier) {
    case 'low':
      return 0.4;
    case 'medium':
      return 0.7;
    case 'high':
    case 'exceptional':
      return 1.0;
  }
}

/**
 * Get quality-based blur CSS class
 *
 * @param score - Quality score (0-10)
 * @param stratified - Whether stratification is enabled
 * @returns Tailwind blur class or empty string
 */
export function getQualityBlurClass(score: number, stratified: boolean): string {
  if (!stratified) return '';
  return getQualityTier(score) === 'low' ? 'blur-[2px]' : '';
}

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

/**
 * Filter photos by minimum quality threshold
 *
 * @param photos - Array of photos to filter
 * @param minQuality - Minimum quality score (0-10)
 * @returns Filtered array
 */
export function filterPhotosByQuality(photos: Photo[], minQuality: number): Photo[] {
  return photos.filter((photo) => getPhotoQualityScore(photo) >= minQuality);
}

/**
 * Generate accessible alt text for a photo
 *
 * Combines metadata attributes into descriptive alt text for screen readers
 *
 * @param photo - Photo object
 * @returns Alt text string
 *
 * @example
 * generatePhotoAltText(photo)
 * // => "Portfolio-worthy Triumph attack photo with quality score 8.5/10, high intensity"
 */
export function generatePhotoAltText(photo: Photo): string {
  const { metadata } = photo;
  const qualityScore = getPhotoQualityScore(photo);
  const parts: string[] = [];

  if (metadata.portfolio_worthy) {
    parts.push('Portfolio-worthy');
  }

  if (metadata.emotion) {
    parts.push(metadata.emotion);
  }

  if (metadata.play_type) {
    parts.push(metadata.play_type);
  }

  parts.push(`photo with quality score ${qualityScore.toFixed(1)}/10`);

  if (metadata.action_intensity) {
    parts.push(`${metadata.action_intensity} intensity`);
  }

  return parts.join(' ');
}

/**
 * Calculate emotion-based glow intensity
 *
 * Portfolio photos get double glow intensity
 *
 * @param metadata - Photo metadata
 * @returns Glow intensity in pixels
 */
export function calculateGlowIntensity(metadata: PhotoMetadata): number {
  const baseQuality = calculateQualityScore(metadata);
  return metadata.portfolio_worthy ? baseQuality * 2 : baseQuality;
}
