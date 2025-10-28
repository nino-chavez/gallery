/**
 * Album Sync Example - Dual Update Workflow
 *
 * Demonstrates how to:
 * 1. Generate canonical name from SmugMug data
 * 2. Update SmugMug album name
 * 3. Sync to Supabase photo_metadata
 * 4. Verify sync status
 *
 * This is a template for your enrichment pipeline integration.
 *
 * Usage:
 *   npx tsx scripts/sync-album-example.ts --album-key HtxsgN --dry-run
 *   npx tsx scripts/sync-album-example.ts --album-key HtxsgN --apply
 */

import { generateCanonicalNameFromSmugMug, type SmugMugAlbumData } from '../src/lib/utils/canonical-album-naming';
import { syncAlbumNameToSupabase, verifyAlbumSync } from '../src/lib/supabase/album-sync';

interface CLIOptions {
	albumKey?: string;
	dryRun?: boolean;
	apply?: boolean;
	threshold?: number;
}

function parseArgs(): CLIOptions {
	const args = process.argv.slice(2);
	const options: CLIOptions = { threshold: 20 };

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === '--album-key' && args[i + 1]) {
			options.albumKey = args[++i];
		} else if (arg === '--dry-run') {
			options.dryRun = true;
		} else if (arg === '--apply') {
			options.apply = true;
		} else if (arg === '--threshold' && args[i + 1]) {
			options.threshold = parseInt(args[++i]);
		} else if (arg === '--help' || arg === '-h') {
			printHelp();
			process.exit(0);
		}
	}

	return options;
}

function printHelp() {
	console.log(`
Album Sync Example - Dual Update Workflow

Demonstrates the full workflow for updating album names in both
SmugMug and Supabase with verification.

USAGE:
  npx tsx scripts/sync-album-example.ts [OPTIONS]

OPTIONS:
  --album-key <key>     Album to process (required)
  --dry-run             Show what would be done without making changes
  --apply               Apply changes to both SmugMug and Supabase
  --threshold <num>     Drift score threshold (default: 20)
  --help, -h            Show this help message

EXAMPLES:
  # Preview changes (dry run)
  npx tsx scripts/sync-album-example.ts --album-key HtxsgN --dry-run

  # Apply changes
  npx tsx scripts/sync-album-example.ts --album-key HtxsgN --apply

  # Use custom threshold
  npx tsx scripts/sync-album-example.ts --album-key HtxsgN --apply --threshold 30

NOTES:
  This is a template. You'll need to implement:
  - SmugMug API client (fetchAlbumFromSmugMug, updateSmugMugAlbum)
  - AI enrichment data fetching (getEnrichmentData)
`);
}

/**
 * Fetch album data from SmugMug API
 * TODO: Implement using your SmugMug API client
 */
async function fetchAlbumFromSmugMug(albumKey: string): Promise<SmugMugAlbumData> {
	// This is a placeholder - implement with your SmugMug API client
	console.log(`🔍 Fetching album ${albumKey} from SmugMug...`);

	// Example response shape:
	return {
		albumKey,
		name: '2022 ACC Boys Golf 09-12-2022', // Current name from SmugMug
		dateStart: '2022-09-12',
		dateEnd: '2022-09-12',
		keywords: ['golf', 'high-school', 'ACC'],
		photos: [
			{
				exif: { DateTimeOriginal: '2022:09:12 14:23:15' },
			},
			{
				exif: { DateTimeOriginal: '2022:09:12 15:45:30' },
			},
		],
		enrichment: {
			eventName: 'ACC Boys Golf Tournament',
			sportType: 'golf',
			category: 'action',
		},
	};
}

/**
 * Update album name in SmugMug
 * TODO: Implement using your SmugMug API client
 */
async function updateSmugMugAlbum(
	albumKey: string,
	newName: string,
	description?: string
): Promise<void> {
	console.log(`🔄 Updating SmugMug album ${albumKey}...`);
	console.log(`   New name: ${newName}`);

	// Placeholder - implement with your SmugMug API client
	// Example:
	// await smugmugClient.albums.update(albumKey, {
	//   Name: newName,
	//   Description: description
	// });

	console.log('✅ SmugMug updated (simulated)');
}

/**
 * Process single album with dual sync
 */
async function processAlbum(albumKey: string, options: CLIOptions): Promise<void> {
	console.log(`\n${'='.repeat(60)}`);
	console.log(`Processing Album: ${albumKey}`);
	console.log('='.repeat(60));

	// 1. Fetch album data from SmugMug
	const albumData = await fetchAlbumFromSmugMug(albumKey);

	console.log(`\n📁 Current Album Data:`);
	console.log(`   Name: ${albumData.name}`);
	console.log(`   Photos: ${albumData.photos?.length || 0}`);
	console.log(`   Date Range: ${albumData.dateStart} to ${albumData.dateEnd || 'same day'}`);

	// 2. Generate canonical name
	console.log(`\n🔄 Generating canonical name...`);
	const result = generateCanonicalNameFromSmugMug(albumData);

	console.log(`\n📊 Canonical Name Result:`);
	console.log(`   Existing: ${result.driftAnalysis?.existingName}`);
	console.log(`   Proposed: ${result.name}`);
	console.log(`   Length: ${result.length} chars`);
	console.log(`   Date Source: ${result.metadata.dateSource.toUpperCase()}`);
	console.log(`   Confidence: ${result.metadata.confidence.toUpperCase()}`);
	console.log(`   Drift Score: ${result.driftScore}/100`);

	if (result.driftAnalysis && result.driftAnalysis.changes.length > 0) {
		console.log(`\n   Changes:`);
		result.driftAnalysis.changes.forEach((change) => console.log(`     • ${change}`));
	}

	if (result.truncated) {
		console.log(`\n   ⚠️  Name was truncated to fit length limit`);
	}

	// 3. Check if update needed
	const threshold = options.threshold || 20;

	if (!result.driftScore || result.driftScore < threshold) {
		console.log(`\n⏭️  Skipping: Drift score (${result.driftScore}) below threshold (${threshold})`);
		return;
	}

	console.log(`\n✅ Update needed: Drift score (${result.driftScore}) exceeds threshold (${threshold})`);

	// 4. Dry run or apply?
	if (options.dryRun) {
		console.log(`\n🔍 DRY RUN - Would perform these actions:`);
		console.log(`   1. Update SmugMug album name: "${result.name}"`);
		console.log(`   2. Sync to Supabase photo_metadata`);
		console.log(`   3. Verify sync status`);
		console.log(`\n   To apply changes, run with --apply flag`);
		return;
	}

	if (!options.apply) {
		console.log(`\n⚠️  No action taken. Use --dry-run to preview or --apply to execute.`);
		return;
	}

	// 5. Apply changes to both systems
	console.log(`\n🚀 Applying changes...`);

	try {
		// 5a. Update SmugMug
		console.log(`\n[1/3] Updating SmugMug...`);
		await updateSmugMugAlbum(albumKey, result.name);

		// 5b. Sync to Supabase
		console.log(`\n[2/3] Syncing to Supabase...`);
		const syncResult = await syncAlbumNameToSupabase(albumKey, result.name);

		if (syncResult.errors.length > 0) {
			console.error(`\n❌ Supabase sync errors:`);
			syncResult.errors.forEach((err) => console.error(`   ${err}`));
			throw new Error('Supabase sync failed');
		}

		console.log(`✅ Updated ${syncResult.updated} photos in Supabase`);

		// 5c. Verify sync
		console.log(`\n[3/3] Verifying sync...`);
		const verification = await verifyAlbumSync(albumKey, result.name);

		if (!verification.synced) {
			console.warn(`\n⚠️  Sync verification issues:`);
			verification.issues.forEach((issue) => console.warn(`   ${issue}`));
		} else {
			console.log(`✅ Sync verified (${verification.photoCount} photos)`);
		}

		console.log(`\n✅ Album sync complete!`);
	} catch (error) {
		console.error(`\n❌ Error during sync:`, error);
		console.error(`\n⚠️  IMPORTANT: Systems may be out of sync!`);
		console.error(`   SmugMug may have been updated, but Supabase sync failed.`);
		console.error(`   Run verification: npx tsx scripts/verify-album-sync.ts --album-key ${albumKey}`);
		throw error;
	}
}

/**
 * Main execution
 */
async function main() {
	const options = parseArgs();

	if (!options.albumKey) {
		console.error('❌ Error: --album-key is required');
		console.error('Run with --help for usage information');
		process.exit(1);
	}

	if (!options.dryRun && !options.apply) {
		console.error('❌ Error: Must specify --dry-run or --apply');
		console.error('Run with --help for usage information');
		process.exit(1);
	}

	try {
		await processAlbum(options.albumKey, options);
		console.log(`\n✅ Done!`);
	} catch (error) {
		console.error(`\n❌ Failed:`, error);
		process.exit(1);
	}
}

// Run
main().catch((error) => {
	console.error('❌ Unexpected error:', error);
	process.exit(1);
});
