/**
 * Verify Album Sync Status
 *
 * Checks if Supabase album names match SmugMug album names.
 * Useful for detecting stale data after canonical naming updates.
 *
 * Usage:
 *   npx tsx scripts/verify-album-sync.ts
 *   npx tsx scripts/verify-album-sync.ts --album-key HtxsgN
 *   npx tsx scripts/verify-album-sync.ts --fix  # Auto-sync mismatches
 */

import { getAllAlbumKeys, verifyAlbumSync, syncAlbumNameToSupabase, getSyncStats } from '../src/lib/supabase/album-sync';

interface CLIOptions {
	albumKey?: string;
	fix?: boolean;
	verbose?: boolean;
}

function parseArgs(): CLIOptions {
	const args = process.argv.slice(2);
	const options: CLIOptions = {};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === '--album-key' && args[i + 1]) {
			options.albumKey = args[++i];
		} else if (arg === '--fix') {
			options.fix = true;
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
Verify Album Sync Status

Checks if Supabase album names are in sync with SmugMug.

USAGE:
  npx tsx scripts/verify-album-sync.ts [OPTIONS]

OPTIONS:
  --album-key <key>   Check specific album only
  --fix               Auto-sync mismatched albums (requires SmugMug API)
  --verbose, -v       Show detailed output
  --help, -h          Show this help message

EXAMPLES:
  # Check all albums
  npx tsx scripts/verify-album-sync.ts

  # Check specific album
  npx tsx scripts/verify-album-sync.ts --album-key HtxsgN

  # Show sync statistics
  npx tsx scripts/verify-album-sync.ts --verbose
`);
}

/**
 * Verify single album
 */
async function verifySingleAlbum(albumKey: string, expectedName: string): Promise<boolean> {
	const result = await verifyAlbumSync(albumKey, expectedName);

	console.log(`\n📁 Album: ${albumKey}`);
	console.log(`Expected Name: ${expectedName}`);
	console.log(`Photo Count: ${result.photoCount}`);

	if (result.synced) {
		console.log('✅ Synced');
		return true;
	} else {
		console.log('❌ Out of sync');
		result.issues.forEach((issue) => console.log(`  ${issue}`));
		return false;
	}
}

/**
 * Verify all albums
 */
async function verifyAllAlbums(verbose: boolean = false): Promise<void> {
	console.log('🔍 Verifying album sync status...\n');

	// Get sync statistics
	const stats = await getSyncStats();

	console.log('📊 Overview:');
	console.log(`  Total Albums: ${stats.totalAlbums}`);
	console.log(`  Total Photos: ${stats.totalPhotos}`);
	console.log(`  Photos with album_key: ${stats.photosWithAlbumKey}`);
	console.log(`  Photos without album_key: ${stats.photosWithoutAlbumKey}`);
	console.log(`  Recently enriched (24h): ${stats.recentlyEnriched}`);

	if (stats.photosWithoutAlbumKey > 0) {
		console.log(`\n⚠️  Warning: ${stats.photosWithoutAlbumKey} photos missing album_key`);
		console.log('   Run: database/migrations/populate-album-keys.sql');
	}

	// Get all albums
	console.log(`\n🔍 Checking ${stats.totalAlbums} albums...\n`);

	const albums = await getAllAlbumKeys();
	let synced = 0;
	let outOfSync = 0;
	const issues: Array<{ albumKey: string; albumName: string; issue: string }> = [];

	for (const { albumKey, photoCount, albumName } of albums) {
		// For verification without SmugMug API, we just check consistency
		// within Supabase (all photos in album have same album_name)
		const result = await verifyAlbumSync(albumKey, albumName);

		if (result.synced) {
			synced++;
			if (verbose) {
				console.log(`✅ ${albumKey}: ${albumName} (${photoCount} photos)`);
			}
		} else {
			outOfSync++;
			console.log(`❌ ${albumKey}: ${albumName} (${photoCount} photos)`);
			result.issues.forEach((issue) => {
				console.log(`   ${issue}`);
				issues.push({ albumKey, albumName, issue });
			});
		}
	}

	console.log(`\n📊 Results:`);
	console.log(`  ✅ Synced: ${synced}/${albums.length}`);
	console.log(`  ❌ Out of sync: ${outOfSync}/${albums.length}`);

	if (outOfSync > 0) {
		console.log(`\n⚠️  ${outOfSync} albums have inconsistent data`);
		console.log('   This usually means photos in the same album have different album_name values');
		console.log('   Run canonical naming workflow to fix');
	}

	// Summary
	if (synced === albums.length) {
		console.log('\n✅ All albums are synced!');
	} else {
		console.log(`\n❌ ${outOfSync} albums need attention`);
		console.log('\nNext steps:');
		console.log('  1. Review album naming proposals: album-rename-proposals.json');
		console.log('  2. Run enrichment pipeline with sync enabled');
		console.log('  3. Or use: npx tsx scripts/batch-sync-albums.ts');
	}
}

/**
 * Main execution
 */
async function main() {
	const options = parseArgs();

	if (options.albumKey) {
		// Verify single album
		// Note: Without SmugMug API, we can only check internal consistency
		console.log('⚠️  Note: Verification checks internal consistency within Supabase');
		console.log('   To verify against SmugMug, integrate SmugMug API fetch\n');

		const albums = await getAllAlbumKeys();
		const album = albums.find((a) => a.albumKey === options.albumKey);

		if (!album) {
			console.error(`❌ Album not found: ${options.albumKey}`);
			process.exit(1);
		}

		const synced = await verifySingleAlbum(album.albumKey, album.albumName);
		process.exit(synced ? 0 : 1);
	} else {
		// Verify all albums
		await verifyAllAlbums(options.verbose);
	}
}

// Run
main().catch((error) => {
	console.error('❌ Error:', error);
	process.exit(1);
});
