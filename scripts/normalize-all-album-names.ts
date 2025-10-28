#!/usr/bin/env tsx
/**
 * Normalize All Album Names
 *
 * Fetches all albums from SmugMug, generates canonical names using existing
 * utility, updates SmugMug, and syncs to Supabase.
 *
 * Uses existing infrastructure:
 * - src/lib/smugmug/client.ts (SmugMug API)
 * - src/lib/utils/canonical-album-naming.ts (Name generation)
 * - src/lib/supabase/album-sync.ts (Supabase sync)
 *
 * Usage:
 *   # Dry run (preview changes only)
 *   DRY_RUN=true npx tsx scripts/normalize-all-album-names.ts
 *
 *   # Test on first 5 albums
 *   TEST_LIMIT=5 npx tsx scripts/normalize-all-album-names.ts
 *
 *   # Full run (updates SmugMug + Supabase)
 *   npx tsx scripts/normalize-all-album-names.ts
 *
 *   # Skip SmugMug updates (only sync to Supabase)
 *   SKIP_SMUGMUG=true npx tsx scripts/normalize-all-album-names.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { SmugMugClient, type SmugMugAlbum } from '../src/lib/smugmug/client';
import {
	generateCanonicalNameFromSmugMug,
	type SmugMugAlbumData,
	type CanonicalNameResult,
} from '../src/lib/utils/canonical-album-naming';
import {
	syncAlbumNameToSupabase,
	getAllAlbumKeys,
} from '../src/lib/supabase/album-sync';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

// =============================================================================
// Configuration
// =============================================================================

const DRY_RUN = process.env.DRY_RUN === 'true';
const TEST_LIMIT = process.env.TEST_LIMIT ? parseInt(process.env.TEST_LIMIT) : undefined;
const SKIP_SMUGMUG = process.env.SKIP_SMUGMUG === 'true';
const MIN_DRIFT_SCORE = process.env.MIN_DRIFT_SCORE ? parseInt(process.env.MIN_DRIFT_SCORE) : 10;

// Rate limiting
const RATE_LIMIT_DELAY_MS = 500; // 500ms between API calls

// =============================================================================
// Types
// =============================================================================

interface AlbumNormalizationResult {
	albumKey: string;
	existingName: string;
	proposedName: string;
	driftScore: number;
	updated: boolean;
	supabasePhotoCount: number;
	error?: string;
}

interface NormalizationStats {
	total: number;
	processed: number;
	updated: number;
	skipped: number;
	errors: number;
	startTime: Date;
}

// =============================================================================
// Main Process
// =============================================================================

async function normalizeAllAlbumNames(): Promise<void> {
	console.log('🎯 Album Name Normalization\n');

	if (DRY_RUN) {
		console.log('⚠️  DRY RUN MODE: No updates will be made\n');
	}

	if (SKIP_SMUGMUG) {
		console.log('⚠️  SKIP_SMUGMUG MODE: Only syncing to Supabase\n');
	}

	console.log(`Min drift score to update: ${MIN_DRIFT_SCORE}/100\n`);

	// Initialize SmugMug client
	const smugmug = new SmugMugClient();

	console.log('📡 Fetching albums from SmugMug...\n');

	// Get authenticated user
	const authUser = await smugmug.getAuthUser();
	console.log(`Authenticated as: ${authUser.Name} (${authUser.NickName})\n`);

	// Fetch all albums
	const albums = await getAllAlbumsFromSmugMug(smugmug);
	console.log(`Found ${albums.length} albums\n`);

	// Apply test limit if specified
	let albumsToProcess = albums;
	if (TEST_LIMIT && TEST_LIMIT < albums.length) {
		console.log(`🧪 TEST_LIMIT: Processing only first ${TEST_LIMIT} albums\n`);
		albumsToProcess = albums.slice(0, TEST_LIMIT);
	}

	// Get Supabase album data
	console.log('📊 Fetching Supabase album metadata...\n');
	const supabaseAlbums = await getAllAlbumKeys();
	const supabaseMap = new Map(supabaseAlbums.map((a) => [a.albumKey, a]));

	console.log(`Found ${supabaseAlbums.length} albums in Supabase\n`);

	// Stats tracking
	const stats: NormalizationStats = {
		total: albumsToProcess.length,
		processed: 0,
		updated: 0,
		skipped: 0,
		errors: 0,
		startTime: new Date(),
	};

	const results: AlbumNormalizationResult[] = [];

	// Process each album
	for (const album of albumsToProcess) {
		const result = await processAlbum(
			album,
			smugmug,
			supabaseMap.get(album.AlbumKey)
		);

		results.push(result);

		if (result.updated) {
			stats.updated++;
		} else if (result.error) {
			stats.errors++;
		} else {
			stats.skipped++;
		}

		stats.processed++;

		// Print progress
		printProgress(stats, result);

		// Rate limiting
		if (stats.processed < stats.total && !DRY_RUN) {
			await sleep(RATE_LIMIT_DELAY_MS);
		}
	}

	// Final summary
	console.log('\n' + '='.repeat(80));
	console.log('✅ Normalization Complete\n');
	printFinalSummary(stats, results);
}

/**
 * Fetch all albums from SmugMug
 */
async function getAllAlbumsFromSmugMug(smugmug: SmugMugClient): Promise<SmugMugAlbum[]> {
	try {
		return await smugmug.getAllAlbums();
	} catch (error) {
		console.error('❌ Error fetching albums from SmugMug:', error);
		throw error;
	}
}

/**
 * Process a single album
 */
async function processAlbum(
	album: SmugMugAlbum,
	smugmug: SmugMugClient,
	supabaseAlbum?: { albumKey: string; photoCount: number; albumName: string }
): Promise<AlbumNormalizationResult> {
	const albumKey = album.AlbumKey;
	const existingName = album.Name;

	try {
		// Fetch album photos for EXIF data (first 100 photos should be sufficient)
		const photos = await smugmug.getAlbumPhotos(albumKey, 100);

		// Convert SmugMug album to canonical naming input
		const albumData: SmugMugAlbumData = {
			albumKey,
			name: existingName,
			keywords: album.Keywords,
			photos: photos.map((p) => ({
				exif: p.EXIF,
				keywords: p.Keywords,
				caption: p.Caption,
			})),
			// Note: SmugMug API may not return dateStart/dateEnd directly
			// The canonical naming utility will extract from EXIF instead
		};

		// Generate canonical name
		const nameResult: CanonicalNameResult = generateCanonicalNameFromSmugMug(albumData);

		const proposedName = nameResult.name;
		const driftScore = nameResult.driftScore || 0;

		// Skip if drift score is too low (name is already good)
		if (driftScore < MIN_DRIFT_SCORE) {
			return {
				albumKey,
				existingName,
				proposedName,
				driftScore,
				updated: false,
				supabasePhotoCount: supabaseAlbum?.photoCount || 0,
			};
		}

		// Update SmugMug album name
		if (!DRY_RUN && !SKIP_SMUGMUG) {
			await smugmug.updateAlbum(albumKey, { Name: proposedName });
		}

		// Sync to Supabase
		if (!DRY_RUN) {
			const syncResult = await syncAlbumNameToSupabase(albumKey, proposedName);

			if (syncResult.errors.length > 0) {
				return {
					albumKey,
					existingName,
					proposedName,
					driftScore,
					updated: false,
					supabasePhotoCount: supabaseAlbum?.photoCount || 0,
					error: syncResult.errors.join(', '),
				};
			}
		}

		return {
			albumKey,
			existingName,
			proposedName,
			driftScore,
			updated: true,
			supabasePhotoCount: supabaseAlbum?.photoCount || 0,
		};
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : String(error);
		return {
			albumKey,
			existingName,
			proposedName: existingName,
			driftScore: 0,
			updated: false,
			supabasePhotoCount: supabaseAlbum?.photoCount || 0,
			error: errorMsg,
		};
	}
}

/**
 * Print progress for single album
 */
function printProgress(stats: NormalizationStats, result: AlbumNormalizationResult): void {
	const percent = ((stats.processed / stats.total) * 100).toFixed(1);
	const status = result.error ? '❌' : result.updated ? '✅' : '⏭️ ';

	console.log(`[${stats.processed}/${stats.total}] (${percent}%) ${status} ${result.albumKey}`);
	console.log(`  Current: ${result.existingName}`);
	console.log(`  Proposed: ${result.proposedName}`);
	console.log(`  Drift: ${result.driftScore}/100 (min: ${MIN_DRIFT_SCORE})`);

	if (result.driftScore >= MIN_DRIFT_SCORE) {
		console.log(`  Photos: ${result.supabasePhotoCount} in Supabase`);

		if (result.updated) {
			console.log(`  ✅ UPDATED`);
		} else if (DRY_RUN) {
			console.log(`  🔍 Would update (dry run)`);
		}

		if (result.error) {
			console.log(`  Error: ${result.error}`);
		}
	} else {
		console.log(`  ⏭️  Skipped (drift below threshold)`);
	}

	console.log('');
}

/**
 * Print final summary
 */
function printFinalSummary(stats: NormalizationStats, results: AlbumNormalizationResult[]): void {
	const elapsed = (Date.now() - stats.startTime.getTime()) / 1000 / 60;

	console.log(`Total albums:    ${stats.total}`);
	console.log(`Updated:         ${stats.updated}`);
	console.log(`Skipped:         ${stats.skipped}`);
	console.log(`Errors:          ${stats.errors}`);
	console.log(`Elapsed:         ${elapsed.toFixed(1)} min\n`);

	// Show albums that would be updated (or were updated)
	const significantChanges = results.filter((r) => r.driftScore >= MIN_DRIFT_SCORE);

	if (significantChanges.length > 0) {
		console.log(`Albums with significant changes (drift >= ${MIN_DRIFT_SCORE}):\n`);

		for (const result of significantChanges) {
			console.log(`${result.albumKey} (drift: ${result.driftScore})`);
			console.log(`  ${result.existingName}`);
			console.log(`  → ${result.proposedName}\n`);
		}
	}

	// Show errors
	const errors = results.filter((r) => r.error);
	if (errors.length > 0) {
		console.log('\n❌ Errors:\n');
		for (const result of errors) {
			console.log(`${result.albumKey}: ${result.error}`);
		}
	}
}

/**
 * Sleep for ms milliseconds
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// =============================================================================
// Run Script
// =============================================================================

normalizeAllAlbumNames()
	.then(() => {
		console.log('\n✅ Script completed successfully');
		process.exit(0);
	})
	.catch((error) => {
		console.error('\n❌ Script failed:', error);
		process.exit(1);
	});
