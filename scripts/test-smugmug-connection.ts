/**
 * Test SmugMug API Connection
 *
 * Verifies SmugMug credentials and tests basic API operations.
 *
 * Usage:
 *   npx tsx scripts/test-smugmug-connection.ts
 *   npx tsx scripts/test-smugmug-connection.ts --album-key zzSDBG
 */

import { SmugMugClient } from '../src/lib/smugmug/client';

async function main() {
	const args = process.argv.slice(2);
	const albumKey = args.find(arg => arg.startsWith('--album-key='))?.split('=')[1] ||
		args[args.indexOf('--album-key') + 1];

	console.log('🔗 Testing SmugMug API Connection\n');

	try {
		const client = new SmugMugClient();

		// Test 1: Get authenticated user
		console.log('[1/3] Testing authentication...');
		const user = await client.getAuthUser();
		console.log(`   ✅ Authenticated as: ${user.Name} (${user.NickName})`);
		console.log(`   User URI: ${user.Uri}\n`);

		// Test 2: Get specific album (if provided)
		if (albumKey) {
			console.log(`[2/3] Fetching album ${albumKey}...`);
			const album = await client.getAlbum(albumKey);
			console.log(`   ✅ Album: "${album.Name}"`);
			console.log(`   AlbumKey: ${album.AlbumKey}`);
			console.log(`   WebUri: ${album.WebUri}`);
			console.log(`   Keywords: ${Array.isArray(album.Keywords) ? album.Keywords.join(', ') : album.Keywords || 'none'}\n`);

			// Test 3: Get album photos
			console.log(`[3/3] Fetching first 5 photos from album...`);
			const photos = await client.getAlbumPhotos(albumKey, 5);
			console.log(`   ✅ Found ${photos.length} photos (showing first 5)`);

			photos.forEach((photo, idx) => {
				console.log(`   ${idx + 1}. ${photo.FileName}`);
				if (photo.EXIF?.DateTimeOriginal) {
					console.log(`      Date: ${photo.EXIF.DateTimeOriginal}`);
				}
			});
		} else {
			console.log('[2/3] Skipping album test (no --album-key provided)');
			console.log('[3/3] Skipping photo test\n');
		}

		console.log('\n✅ All tests passed!');
		console.log('\nNext steps:');
		console.log('  1. Run batch update: npx tsx scripts/batch-update-album-names.ts --dry-run --limit 5');
		console.log('  2. Apply updates: npx tsx scripts/batch-update-album-names.ts --apply --limit 5');

	} catch (error) {
		console.error('\n❌ Error:', error);
		console.error('\nTroubleshooting:');
		console.error('  1. Check environment variables:');
		console.error('     - SMUGMUG_API_KEY');
		console.error('     - SMUGMUG_API_SECRET');
		console.error('     - SMUGMUG_ACCESS_TOKEN');
		console.error('     - SMUGMUG_ACCESS_TOKEN_SECRET');
		console.error('  2. Verify tokens have not expired');
		console.error('  3. Check API rate limits');
		process.exit(1);
	}
}

main();
