/**
 * Album Sync Module
 *
 * Keeps album names synchronized between SmugMug (source of truth)
 * and Supabase (enriched photo metadata).
 *
 * Usage:
 * ```typescript
 * import { syncAlbumNameToSupabase, verifyAlbumSync } from '$lib/supabase/album-sync';
 *
 * // After updating SmugMug album name
 * await syncAlbumNameToSupabase(albumKey, newCanonicalName);
 *
 * // Verify sync status
 * const status = await verifyAlbumSync(albumKey, expectedName);
 * ```
 */

import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS
const supabase = createClient(
	process.env.VITE_SUPABASE_URL || '',
	process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface SyncResult {
	updated: number;
	errors: string[];
}

export interface VerificationResult {
	synced: boolean;
	photoCount: number;
	issues: string[];
}

export interface BatchSyncResult {
	success: number;
	failed: number;
	errors: string[];
}

/**
 * Update album name in Supabase for all photos in an album
 *
 * @param albumKey - SmugMug album key
 * @param newAlbumName - New canonical album name
 * @returns Number of photos updated and any errors
 */
export async function syncAlbumNameToSupabase(
	albumKey: string,
	newAlbumName: string
): Promise<SyncResult> {
	const errors: string[] = [];

	try {
		// Update all photos with this album_key
		const { data, error } = await supabase
			.from('photo_metadata')
			.update({
				album_name: newAlbumName,
				// Note: updated_at column doesn't exist in schema, using enriched_at
			})
			.eq('album_key', albumKey)
			.select('photo_id');

		if (error) {
			errors.push(`Supabase error: ${error.message}`);
			return { updated: 0, errors };
		}

		const updatedCount = data?.length || 0;

		if (updatedCount > 0) {
			console.log(`✅ Synced album name to ${updatedCount} photos in Supabase`);
		} else {
			console.warn(`⚠️  No photos found for album_key: ${albumKey}`);
		}

		return { updated: updatedCount, errors };
	} catch (err) {
		const errorMsg = err instanceof Error ? err.message : String(err);
		errors.push(`Exception: ${errorMsg}`);
		return { updated: 0, errors };
	}
}

/**
 * Verify sync status: check if album_name matches expected name
 *
 * @param albumKey - SmugMug album key
 * @param expectedName - Expected album name (from SmugMug)
 * @returns Sync status and any issues found
 */
export async function verifyAlbumSync(
	albumKey: string,
	expectedName: string
): Promise<VerificationResult> {
	try {
		const { data, error } = await supabase
			.from('photo_metadata')
			.select('photo_id, album_name, image_key')
			.eq('album_key', albumKey);

		if (error) {
			return {
				synced: false,
				photoCount: 0,
				issues: [`Query error: ${error.message}`],
			};
		}

		if (!data || data.length === 0) {
			return {
				synced: false,
				photoCount: 0,
				issues: [`No photos found for album_key: ${albumKey}`],
			};
		}

		const issues: string[] = [];
		const mismatchedPhotos = data.filter((p) => p.album_name !== expectedName);

		if (mismatchedPhotos.length > 0) {
			issues.push(
				`${mismatchedPhotos.length}/${data.length} photos have stale album names`
			);

			// Log first few mismatches for debugging
			const samples = mismatchedPhotos.slice(0, 3);
			samples.forEach((p) => {
				issues.push(
					`  Photo ${p.image_key}: "${p.album_name}" should be "${expectedName}"`
				);
			});

			if (mismatchedPhotos.length > 3) {
				issues.push(`  ... and ${mismatchedPhotos.length - 3} more`);
			}
		}

		return {
			synced: mismatchedPhotos.length === 0,
			photoCount: data.length,
			issues,
		};
	} catch (err) {
		const errorMsg = err instanceof Error ? err.message : String(err);
		return {
			synced: false,
			photoCount: 0,
			issues: [`Exception: ${errorMsg}`],
		};
	}
}

/**
 * Batch sync: update multiple albums
 *
 * @param albums - Array of {albumKey, newName} pairs
 * @returns Success/failure counts and errors
 */
export async function batchSyncAlbums(
	albums: Array<{ albumKey: string; newName: string }>
): Promise<BatchSyncResult> {
	let success = 0;
	let failed = 0;
	const errors: string[] = [];

	for (const { albumKey, newName } of albums) {
		const result = await syncAlbumNameToSupabase(albumKey, newName);

		if (result.errors.length > 0) {
			failed++;
			errors.push(`${albumKey}: ${result.errors.join(', ')}`);
		} else {
			success++;
		}
	}

	return { success, failed, errors };
}

/**
 * Get all unique album keys from Supabase
 *
 * @returns Array of album keys with photo counts
 */
export async function getAllAlbumKeys(): Promise<
	Array<{ albumKey: string; photoCount: number; albumName: string }>
> {
	try {
		const { data, error } = await supabase
			.from('photo_metadata')
			.select('album_key, album_name')
			.not('album_key', 'is', null);

		if (error) {
			console.error('Error fetching album keys:', error);
			return [];
		}

		// Group by album_key and count photos
		const albumMap = new Map<string, { count: number; name: string }>();

		data?.forEach((row) => {
			if (row.album_key) {
				const existing = albumMap.get(row.album_key);
				if (existing) {
					existing.count++;
				} else {
					albumMap.set(row.album_key, {
						count: 1,
						name: row.album_name || 'Unknown',
					});
				}
			}
		});

		return Array.from(albumMap.entries()).map(([albumKey, { count, name }]) => ({
			albumKey,
			photoCount: count,
			albumName: name,
		}));
	} catch (err) {
		console.error('Exception fetching album keys:', err);
		return [];
	}
}

/**
 * Get sync statistics
 *
 * @returns Overall sync health metrics
 */
export async function getSyncStats(): Promise<{
	totalAlbums: number;
	totalPhotos: number;
	photosWithAlbumKey: number;
	photosWithoutAlbumKey: number;
	recentlyEnriched: number;
}> {
	try {
		// Get total albums
		const albumKeys = await getAllAlbumKeys();

		// Get photo stats (using enriched_at instead of updated_at)
		const { data, error } = await supabase.from('photo_metadata').select('album_key, enriched_at');

		if (error) {
			console.error('Error fetching sync stats:', error);
			return {
				totalAlbums: 0,
				totalPhotos: 0,
				photosWithAlbumKey: 0,
				photosWithoutAlbumKey: 0,
				recentlyEnriched: 0,
			};
		}

		const totalPhotos = data?.length || 0;
		const photosWithAlbumKey = data?.filter((p) => p.album_key).length || 0;
		const photosWithoutAlbumKey = totalPhotos - photosWithAlbumKey;

		// Count recently enriched (last 24 hours)
		const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
		const recentlyEnriched =
			data?.filter((p) => p.enriched_at && p.enriched_at > oneDayAgo).length || 0;

		return {
			totalAlbums: albumKeys.length,
			totalPhotos,
			photosWithAlbumKey,
			photosWithoutAlbumKey,
			recentlyEnriched,
		};
	} catch (err) {
		console.error('Exception getting sync stats:', err);
		return {
			totalAlbums: 0,
			totalPhotos: 0,
			photosWithAlbumKey: 0,
			photosWithoutAlbumKey: 0,
			recentlyEnriched: 0,
		};
	}
}
