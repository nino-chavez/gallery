/**
 * Batch Update Album Names - Full Dual Sync Workflow
 *
 * This script:
 * 1. Fetches all albums from Supabase
 * 2. Generates canonical names using EXIF + enrichment data
 * 3. Calculates drift scores
 * 4. Updates Supabase with canonical names (simulates SmugMug update)
 * 5. Verifies sync status
 *
 * Usage:
 *   npx tsx scripts/batch-update-album-names.ts --dry-run
 *   npx tsx scripts/batch-update-album-names.ts --apply --threshold 20
 *   npx tsx scripts/batch-update-album-names.ts --apply --limit 10
 */

import { createClient } from '@supabase/supabase-js';
import { generateCanonicalNameFromSmugMug, type SmugMugAlbumData } from '../src/lib/utils/canonical-album-naming';
import { syncAlbumNameToSupabase, verifyAlbumSync, getAllAlbumKeys } from '../src/lib/supabase/album-sync';
import { SmugMugClient } from '../src/lib/smugmug/client';

const supabase = createClient(
	process.env.VITE_SUPABASE_URL || '',
	process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface CLIOptions {
	dryRun?: boolean;
	apply?: boolean;
	threshold?: number;
	limit?: number;
	verbose?: boolean;
}

interface AlbumUpdateResult {
	albumKey: string;
	existingName: string;
	canonicalName: string;
	driftScore: number;
	photoCount: number;
	updated: boolean;
	error?: string;
}

function parseArgs(): CLIOptions {
	const args = process.argv.slice(2);
	const options: CLIOptions = { threshold: 20 };

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === '--dry-run') {
			options.dryRun = true;
		} else if (arg === '--apply') {
			options.apply = true;
		} else if (arg === '--threshold' && args[i + 1]) {
			options.threshold = parseInt(args[++i]);
		} else if (arg === '--limit' && args[i + 1]) {
			options.limit = parseInt(args[++i]);
		} else if (arg === '--verbose' || arg === '-v') {
			options.verbose = true;
		} else if (arg === '--help' || arg === '-h') {
			printHelp();
			process.exit(0);
		}
	}

	return options;
}

function printHelp() {
	console.log(`
Batch Update Album Names - Full Dual Sync Workflow

Updates album names to canonical format and syncs between systems.

USAGE:
  npx tsx scripts/batch-update-album-names.ts [OPTIONS]

OPTIONS:
  --dry-run             Show what would be done without making changes
  --apply               Apply changes to Supabase (simulates SmugMug update)
  --threshold <num>     Drift score threshold (default: 20)
  --limit <num>         Limit number of albums to process
  --verbose, -v         Show detailed output for each album
  --help, -h            Show this help message

EXAMPLES:
  # Preview all changes
  npx tsx scripts/batch-update-album-names.ts --dry-run

  # Apply changes with default threshold (20)
  npx tsx scripts/batch-update-album-names.ts --apply

  # Process only albums with drift > 30
  npx tsx scripts/batch-update-album-names.ts --apply --threshold 30

  # Test on first 10 albums
  npx tsx scripts/batch-update-album-names.ts --apply --limit 10

NOTE:
  This script currently updates Supabase directly.
  To update SmugMug, integrate with SmugMug API client:
    await smugmugClient.updateAlbum(albumKey, { Name: canonicalName });
`);
}

/**
 * Fetch album data from Supabase with EXIF dates
 */
async function fetchAlbumDataFromSupabase(albumKey: string): Promise<SmugMugAlbumData | null> {
	// Get all photos for this album
	const { data: photos, error } = await supabase
		.from('photo_metadata')
		.select('image_key, album_name, photo_date, sport_type, photo_category')
		.eq('album_key', albumKey);

	if (error || !photos || photos.length === 0) {
		return null;
	}

	// Use first photo's album_name as current name
	const currentName = photos[0].album_name || 'Unknown Album';

	// Extract dates from photo_date (acts as EXIF DateTimeOriginal)
	const photoDates = photos
		.map((p) => p.photo_date)
		.filter((d): d is string => !!d)
		.sort();

	const earliestDate = photoDates[0];
	const latestDate = photoDates[photoDates.length - 1];

	// Detect sport type from photos
	const sportTypes = photos.map((p) => p.sport_type).filter((s): s is string => !!s);
	const sportType = sportTypes.length > 0 ? sportTypes[0] : undefined;

	// Build SmugMugAlbumData
	return {
		albumKey,
		name: currentName,
		dateStart: earliestDate?.split('T')[0], // Convert timestamp to date
		dateEnd: latestDate?.split('T')[0],
		keywords: sportType ? [sportType] : [],
		photos: photos.map((p) => ({
			exif: {
				DateTimeOriginal: p.photo_date || undefined,
			},
		})),
		// Note: Real enrichment would come from AI model
		// For now, we infer from existing data
		enrichment: {
			sportType,
			// Could extract teams/event from currentName if needed
		},
	};
}

/**
 * Process single album
 */
async function processAlbum(
	albumKey: string,
	albumName: string,
	photoCount: number,
	options: CLIOptions
): Promise<AlbumUpdateResult> {
	const result: AlbumUpdateResult = {
		albumKey,
		existingName: albumName,
		canonicalName: albumName,
		driftScore: 0,
		photoCount,
		updated: false,
	};

	try {
		// 1. Fetch album data
		const albumData = await fetchAlbumDataFromSupabase(albumKey);

		if (!albumData) {
			result.error = 'Failed to fetch album data';
			return result;
		}

		// 2. Generate canonical name
		const canonical = generateCanonicalNameFromSmugMug(albumData);

		result.canonicalName = canonical.name;
		result.driftScore = canonical.driftScore || 0;

		if (options.verbose) {
			console.log(`\n📁 ${albumKey}: ${albumName}`);
			console.log(`   → ${canonical.name}`);
			console.log(`   Drift: ${canonical.driftScore}/100 | Date Source: ${canonical.metadata.dateSource}`);
		}

		// 3. Check if update needed
		const threshold = options.threshold || 20;

		if (canonical.driftScore < threshold) {
			if (options.verbose) {
				console.log(`   ⏭️  Skip (drift < ${threshold})`);
			}
			return result;
		}

		// 4. Apply update (if not dry run)
		if (options.apply && !options.dryRun) {
			// Step 1: Update SmugMug (source of truth)
			try {
				const smugmugClient = new SmugMugClient();
				await smugmugClient.updateAlbum(albumKey, { Name: canonical.name });

				if (options.verbose) {
					console.log(`   ✅ Updated SmugMug`);
				}
			} catch (error) {
				result.error = `SmugMug update failed: ${error instanceof Error ? error.message : String(error)}`;
				if (options.verbose) {
					console.log(`   ❌ ${result.error}`);
				}
				return result;
			}

			// Step 2: Sync to Supabase
			const syncResult = await syncAlbumNameToSupabase(albumKey, canonical.name);

			if (syncResult.errors.length > 0) {
				result.error = syncResult.errors.join(', ');
				if (options.verbose) {
					console.log(`   ⚠️  SmugMug updated but Supabase sync failed: ${result.error}`);
				}
				return result;
			}

			result.updated = true;

			if (options.verbose) {
				console.log(`   ✅ Synced ${syncResult.updated} photos to Supabase`);
			}
		} else if (options.verbose) {
			console.log(`   🔍 Would update (dry run)`);
		}

		return result;
	} catch (error) {
		result.error = error instanceof Error ? error.message : String(error);
		return result;
	}
}

/**
 * Main execution
 */
async function main() {
	const options = parseArgs();

	if (!options.dryRun && !options.apply) {
		console.error('❌ Error: Must specify --dry-run or --apply');
		console.error('Run with --help for usage information');
		process.exit(1);
	}

	console.log('🔄 Batch Album Name Update\n');

	if (options.dryRun) {
		console.log('🔍 DRY RUN MODE - No changes will be made\n');
	}

	// 1. Get all albums
	console.log('[Step 1/4] Fetching albums from Supabase...');
	const albums = await getAllAlbumKeys();

	let albumsToProcess = albums;

	if (options.limit) {
		albumsToProcess = albums.slice(0, options.limit);
		console.log(`  Limited to first ${options.limit} albums\n`);
	}

	console.log(`  Found ${albums.length} total albums`);
	console.log(`  Processing ${albumsToProcess.length} albums\n`);

	// 2. Process each album
	console.log('[Step 2/4] Generating canonical names...');

	const results: AlbumUpdateResult[] = [];
	let processed = 0;

	for (const { albumKey, photoCount, albumName } of albumsToProcess) {
		const result = await processAlbum(albumKey, albumName, photoCount, options);
		results.push(result);
		processed++;

		if (!options.verbose && processed % 10 === 0) {
			console.log(`  Progress: ${processed}/${albumsToProcess.length} albums processed...`);
		}
	}

	console.log(`  ✅ Processed ${processed} albums\n`);

	// 3. Analyze results
	console.log('[Step 3/4] Analyzing results...\n');

	const needsUpdate = results.filter((r) => r.driftScore >= (options.threshold || 20));
	const updated = results.filter((r) => r.updated);
	const errors = results.filter((r) => r.error);
	const skipped = results.filter((r) => !r.updated && !r.error && r.driftScore < (options.threshold || 20));

	console.log('📊 Summary:');
	console.log(`  Total Processed: ${results.length}`);
	console.log(`  Needs Update: ${needsUpdate.length} (drift ≥ ${options.threshold})`);
	console.log(`  Updated: ${updated.length}`);
	console.log(`  Skipped: ${skipped.length} (drift < ${options.threshold})`);
	console.log(`  Errors: ${errors.length}\n`);

	// Show top drift scores
	if (needsUpdate.length > 0) {
		console.log('🔝 Top 10 albums by drift score:');
		const topDrift = needsUpdate.sort((a, b) => b.driftScore - a.driftScore).slice(0, 10);

		topDrift.forEach((r) => {
			console.log(`  ${r.driftScore.toString().padStart(3)}/100 - ${r.albumKey}: ${r.existingName}`);
			console.log(`         → ${r.canonicalName}`);
		});
		console.log();
	}

	// Show errors
	if (errors.length > 0) {
		console.log('❌ Errors encountered:');
		errors.forEach((r) => {
			console.log(`  ${r.albumKey}: ${r.error}`);
		});
		console.log();
	}

	// 4. Verification (if updates were applied)
	if (updated.length > 0 && options.apply && !options.dryRun) {
		console.log('[Step 4/4] Verifying updates...');

		let verified = 0;
		let verifyErrors = 0;

		for (const result of updated) {
			const verification = await verifyAlbumSync(result.albumKey, result.canonicalName);

			if (verification.synced) {
				verified++;
			} else {
				verifyErrors++;
				console.log(`  ⚠️  ${result.albumKey}: ${verification.issues.join(', ')}`);
			}
		}

		console.log(`  ✅ Verified: ${verified}/${updated.length}`);

		if (verifyErrors > 0) {
			console.log(`  ⚠️  Verification issues: ${verifyErrors}`);
		}

		console.log();
	} else {
		console.log('[Step 4/4] Verification skipped (dry run or no updates)\n');
	}

	// Final summary
	console.log('✅ Batch update complete!\n');

	if (options.dryRun) {
		console.log('Next steps:');
		console.log('  1. Review proposed changes above');
		console.log('  2. Run with --apply to execute updates');
		console.log('  3. Integrate SmugMug API to update source of truth');
	} else if (updated.length > 0) {
		console.log('Next steps:');
		console.log('  1. Verify gallery UI shows updated names');
		console.log('  2. Test search/filter with canonical names');
		console.log('  3. Update SmugMug via API (currently simulated)');
	}

	// Exit code
	process.exit(errors.length > 0 ? 1 : 0);
}

// Run
main().catch((error) => {
	console.error('❌ Unexpected error:', error);
	process.exit(1);
});
