/**
 * Run Album Key Migration
 *
 * Populates album_key field in photo_metadata table by extracting
 * from ImageUrl field.
 *
 * Usage:
 *   npx tsx scripts/run-album-key-migration.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
	process.env.VITE_SUPABASE_URL || '',
	process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface MigrationStats {
	totalPhotos: number;
	withAlbumKey: number;
	withoutAlbumKey: number;
}

async function getStats(): Promise<MigrationStats> {
	const { data, error } = await supabase.from('photo_metadata').select('album_key');

	if (error) {
		throw new Error(`Failed to get stats: ${error.message}`);
	}

	const totalPhotos = data?.length || 0;
	const withAlbumKey = data?.filter((p) => p.album_key).length || 0;
	const withoutAlbumKey = totalPhotos - withAlbumKey;

	return { totalPhotos, withAlbumKey, withoutAlbumKey };
}

async function extractAlbumKeyFromUrl(imageUrl: string): Promise<string | null> {
	// Extract album_key from ImageUrl
	// Format: https://photos.smugmug.com/photos/{album_key}/{image_key}...
	// Or: https://{custom-domain}/photos/{album_key}/{image_key}...

	const match = imageUrl.match(/^https?:\/\/[^/]+\/photos\/([^/]+)/i);
	return match ? match[1] : null;
}

async function migrateAlbumKeys(): Promise<void> {
	console.log('🔄 Starting album_key migration...\n');

	// Step 1: Get initial stats
	console.log('[Step 1/5] Checking current state...');
	const beforeStats = await getStats();

	console.log(`  Total Photos: ${beforeStats.totalPhotos}`);
	console.log(`  With album_key: ${beforeStats.withAlbumKey}`);
	console.log(`  Without album_key: ${beforeStats.withoutAlbumKey}\n`);

	if (beforeStats.withoutAlbumKey === 0) {
		console.log('✅ All photos already have album_key populated!');
		return;
	}

	// Step 2: Fetch photos without album_key
	console.log('[Step 2/5] Fetching photos without album_key...');
	const { data: photosToUpdate, error: fetchError } = await supabase
		.from('photo_metadata')
		.select('photo_id, image_key, ImageUrl')
		.is('album_key', null)
		.not('ImageUrl', 'is', null);

	if (fetchError) {
		throw new Error(`Failed to fetch photos: ${fetchError.message}`);
	}

	console.log(`  Found ${photosToUpdate?.length || 0} photos to update\n`);

	if (!photosToUpdate || photosToUpdate.length === 0) {
		console.log('✅ No photos need updating');
		return;
	}

	// Step 3: Extract album_keys and update
	console.log('[Step 3/5] Extracting album_keys from ImageUrl...');
	let updated = 0;
	let failed = 0;

	for (const photo of photosToUpdate) {
		const albumKey = await extractAlbumKeyFromUrl(photo.ImageUrl);

		if (albumKey) {
			const { error: updateError } = await supabase
				.from('photo_metadata')
				.update({ album_key: albumKey })
				.eq('photo_id', photo.photo_id);

			if (updateError) {
				console.error(`  ❌ Failed to update ${photo.image_key}: ${updateError.message}`);
				failed++;
			} else {
				updated++;
				if (updated % 100 === 0) {
					console.log(`  Progress: ${updated}/${photosToUpdate.length} photos updated...`);
				}
			}
		} else {
			console.warn(`  ⚠️  Could not extract album_key from: ${photo.ImageUrl}`);
			failed++;
		}
	}

	console.log(`\n  ✅ Updated: ${updated}`);
	console.log(`  ❌ Failed: ${failed}\n`);

	// Step 4: Verify extraction
	console.log('[Step 4/5] Verifying results...');
	const afterStats = await getStats();

	console.log(`  Total Photos: ${afterStats.totalPhotos}`);
	console.log(`  With album_key: ${afterStats.withAlbumKey}`);
	console.log(`  Without album_key: ${afterStats.withoutAlbumKey}\n`);

	// Step 5: Show sample albums
	console.log('[Step 5/5] Sample of extracted album_keys...');
	const { data: sampleAlbums, error: sampleError } = await supabase.rpc('get_album_summary', {});

	// If RPC doesn't exist, use regular query
	const { data: albums } = await supabase
		.from('photo_metadata')
		.select('album_key, album_name')
		.not('album_key', 'is', null)
		.limit(10);

	if (albums) {
		// Group by album_key
		const albumMap = new Map<string, { count: number; name: string }>();

		const { data: allPhotos } = await supabase
			.from('photo_metadata')
			.select('album_key, album_name')
			.not('album_key', 'is', null);

		allPhotos?.forEach((p) => {
			if (p.album_key) {
				const existing = albumMap.get(p.album_key);
				if (existing) {
					existing.count++;
				} else {
					albumMap.set(p.album_key, { count: 1, name: p.album_name || 'Unknown' });
				}
			}
		});

		// Sort by photo count and show top 10
		const topAlbums = Array.from(albumMap.entries())
			.sort((a, b) => b[1].count - a[1].count)
			.slice(0, 10);

		console.log('\n  Top 10 albums by photo count:');
		topAlbums.forEach(([albumKey, { count, name }]) => {
			console.log(`    ${albumKey}: ${count} photos - "${name}"`);
		});
	}

	console.log('\n✅ Migration complete!\n');

	// Summary
	const improvement = afterStats.withAlbumKey - beforeStats.withAlbumKey;
	console.log('📊 Summary:');
	console.log(`  Photos updated: ${improvement}`);
	console.log(`  Success rate: ${updated}/${photosToUpdate.length} (${Math.round((updated / photosToUpdate.length) * 100)}%)`);

	if (afterStats.withoutAlbumKey > 0) {
		console.log(`\n⚠️  Warning: ${afterStats.withoutAlbumKey} photos still missing album_key`);
		console.log('   These photos may have invalid or missing ImageUrl fields');
	}

	console.log('\nNext steps:');
	console.log('  1. Run verification: npx tsx scripts/verify-album-sync.ts');
	console.log('  2. Test sync: npx tsx scripts/sync-album-example.ts --album-key <key> --dry-run');
}

// Run migration
migrateAlbumKeys().catch((error) => {
	console.error('❌ Migration failed:', error);
	process.exit(1);
});
