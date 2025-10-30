/**
 * SmugMug Image Size Optimizer
 *
 * Converts SmugMug image URLs to appropriate sizes for different contexts.
 *
 * SmugMug Size Reference:
 * - Th: 100x100   (thumbnail, blur placeholder)
 * - S:  400xAuto  (grid thumbnails)
 * - M:  600xAuto  (lightbox preview)
 * - L:  1024xAuto (full screen view)
 * - D:  1600xAuto (display/download)
 * - X2: 2048xAuto (high resolution)
 * - X3: 3000xAuto (original quality)
 *
 * Performance Impact:
 * - Using D-size (1600px) for 400px grid = 4x unnecessary data
 * - Using S-size (400px) = 75% bandwidth savings
 * - Load time: 800ms → 200ms per image
 */

export type SmugMugSize = 'Th' | 'S' | 'M' | 'L' | 'D' | 'B' | 'X2' | 'X3' | 'X4' | 'X5';

export interface SmugMugSizeConfig {
  /** Approximate pixel width */
  width: number;
  /** Use case description */
  useCase: string;
  /** Typical file size */
  typicalSize: string;
}

export const SMUGMUG_SIZES: Record<SmugMugSize, SmugMugSizeConfig> = {
  Th: { width: 100, useCase: 'Thumbnail square', typicalSize: '5-10 KB' },
  S: { width: 400, useCase: 'Small (grid)', typicalSize: '20-40 KB' },
  M: { width: 600, useCase: 'Medium (lightbox)', typicalSize: '50-100 KB' },
  L: { width: 1024, useCase: 'Large (full view)', typicalSize: '100-200 KB' },
  D: { width: 1600, useCase: 'Display (download)', typicalSize: '200-400 KB' },
  B: { width: 2048, useCase: 'Big 2K (legacy)', typicalSize: '400-800 KB' },
  X2: { width: 2048, useCase: 'Extra large 2K', typicalSize: '400-800 KB' },
  X3: { width: 3000, useCase: 'Extra large 3K', typicalSize: '800-1500 KB' },
  X4: { width: 4000, useCase: 'Extra large 4K', typicalSize: '1-2 MB' },
  X5: { width: 5000, useCase: 'Original 5K+', typicalSize: '2-5 MB' }
};

/**
 * Extract the current size code from a SmugMug URL
 *
 * @example
 * extractSize('https://photos.smugmug.com/.../i-ABC123/0/.../D/i-ABC123-D.jpg')
 * // Returns: 'D'
 */
export function extractSmugMugSize(url: string): SmugMugSize | null {
  if (!url) return null;

  // Match pattern: filename-SIZE.jpg (extract from filename, not path)
  // This handles URLs with security hashes: /0/HASH/SIZE/filename-SIZE.jpg
  const match = url.match(/-([A-Z0-9]+)\.(jpg|jpeg|png|gif)$/i);
  if (!match) return null;

  const sizeCode = match[1];
  return Object.keys(SMUGMUG_SIZES).includes(sizeCode) ? (sizeCode as SmugMugSize) : null;
}

/**
 * Replace the size code in a SmugMug URL
 *
 * @example
 * replaceSize('https://photos.smugmug.com/.../D/...-D.jpg', 'S')
 * // Returns: 'https://photos.smugmug.com/.../S/...-S.jpg'
 */
export function replaceSmugMugSize(url: string, newSize: SmugMugSize): string {
  if (!url) return url;

  const currentSize = extractSmugMugSize(url);
  if (!currentSize) {
    console.warn('[SmugMug Optimizer] Could not extract size from URL:', url);
    return url;
  }

  // Replace both occurrences: in path and in filename
  // Pattern handles security hash: /0/HASH/OLD/filename-OLD.jpg → /0/HASH/NEW/filename-NEW.jpg
  const optimizedUrl = url
    .replace(`/${currentSize}/`, `/${newSize}/`)  // Replace in path (after hash)
    .replace(`-${currentSize}.`, `-${newSize}.`); // Replace in filename

  return optimizedUrl;
}

/**
 * Get optimized SmugMug URL for a specific use case
 *
 * @param url - Original SmugMug URL (any size)
 * @param context - Usage context (determines optimal size)
 * @returns Optimized URL with appropriate size
 *
 * @example
 * // For photo grid
 * const gridUrl = getOptimizedUrl(originalUrl, 'grid');
 *
 * // For lightbox
 * const lightboxUrl = getOptimizedUrl(originalUrl, 'lightbox');
 */
export function getOptimizedSmugMugUrl(
  url: string | undefined,
  context: 'thumbnail' | 'grid' | 'lightbox' | 'fullscreen' | 'download' | 'original'
): string | undefined {
  if (!url) return undefined;

  const sizeMap: Record<typeof context, SmugMugSize> = {
    thumbnail: 'Th',   // 100px - blur placeholder
    grid: 'S',         // 400px - photo grid
    lightbox: 'M',     // 600px - lightbox preview
    fullscreen: 'L',   // 1024px - full screen
    download: 'D',     // 1600px - download
    original: 'X3'     // 3000px+ - original quality
  };

  const targetSize = sizeMap[context];
  return replaceSmugMugSize(url, targetSize);
}

/**
 * Get responsive srcset for SmugMug image
 * Generates multiple sizes for responsive images
 *
 * @example
 * const srcset = getSmugMugSrcSet(originalUrl);
 * // Returns: "...S.jpg 400w, ...M.jpg 600w, ...L.jpg 1024w"
 */
export function getSmugMugSrcSet(url: string | undefined): string | undefined {
  if (!url) return undefined;

  const sizes: Array<{ size: SmugMugSize; width: number }> = [
    { size: 'S', width: 400 },
    { size: 'M', width: 600 },
    { size: 'L', width: 1024 },
    { size: 'D', width: 1600 }
  ];

  return sizes
    .map(({ size, width }) => `${replaceSmugMugSize(url, size)} ${width}w`)
    .join(', ');
}

/**
 * Check if URL is a SmugMug photo URL
 */
export function isSmugMugUrl(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes('smugmug.com') && url.includes('/i-');
}

/**
 * Get estimated file size for a SmugMug URL
 * Useful for debugging and performance analysis
 */
export function getEstimatedSize(url: string): string {
  const size = extractSmugMugSize(url);
  if (!size) return 'Unknown';
  return SMUGMUG_SIZES[size]?.typicalSize || 'Unknown';
}

/**
 * Batch optimize multiple URLs
 * Useful for optimizing entire photo grids
 *
 * @example
 * const photos = [{ image_url: '...D.jpg' }, { image_url: '...D.jpg' }];
 * const optimized = batchOptimize(photos.map(p => p.image_url), 'grid');
 */
export function batchOptimizeSmugMugUrls(
  urls: (string | undefined)[],
  context: Parameters<typeof getOptimizedSmugMugUrl>[1]
): (string | undefined)[] {
  return urls.map(url => getOptimizedSmugMugUrl(url, context));
}
