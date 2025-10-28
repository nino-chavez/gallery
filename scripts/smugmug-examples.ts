/**
 * SmugMug API Usage Examples
 *
 * Practical examples showing how to use the SmugMug client
 * See: .agent-os/guides/smugmug-api.md for full documentation
 */

import { SmugMugClient, extractExifDate, extractDateRange, formatCanonicalDate } from '../src/lib/smugmug/client';

// Initialize client (reads env vars automatically)
const client = new SmugMugClient();

/**
 * Example 1: Get album details
 */
async function example1_GetAlbumDetails() {
	console.log('\n=== Example 1: Get Album Details ===\n');

	const albumKey = 'HtxsgN'; // Replace with your album key

	try {
		const album = await client.getAlbum(albumKey);

		console.log('Album Details:');
		console.log(`  Name: ${album.Name}`);
		console.log(`  Key: ${album.AlbumKey}`);
		console.log(`  Description: ${album.Description || 'N/A'}`);
		console.log(`  Image Count: ${album.ImageCount}`);
		console.log(`  Web URL: ${album.WebUri}`);
	} catch (error) {
		console.error('Error fetching album:', error);
	}
}

/**
 * Example 2: Get photos with EXIF data
 */
async function example2_GetPhotosWithExif() {
	console.log('\n=== Example 2: Get Photos with EXIF ===\n');

	const albumKey = 'HtxsgN'; // Replace with your album key

	try {
		const { album, photos } = await client.getAlbumWithExif(albumKey, {
			maxPhotos: 5, // Limit to 5 for testing
			onProgress: (current, total) => {
				console.log(`Fetching EXIF: ${current}/${total}`);
			}
		});

		console.log(`\nFetched ${photos.length} photos from "${album.Name}"\n`);

		// Show first photo with EXIF
		const firstPhoto = photos[0];
		if (firstPhoto.EXIF) {
			console.log('First Photo EXIF:');
			console.log(`  Filename: ${firstPhoto.FileName}`);
			console.log(`  Date: ${firstPhoto.EXIF.DateTimeOriginal}`);
			console.log(`  Camera: ${firstPhoto.EXIF.Make} ${firstPhoto.EXIF.Model}`);
			console.log(`  Lens: ${firstPhoto.EXIF.LensModel || 'N/A'}`);
			console.log(`  ISO: ${firstPhoto.EXIF.ISO || 'N/A'}`);
			console.log(`  Aperture: ${firstPhoto.EXIF.Aperture || 'N/A'}`);
		}

		// Extract date range
		const dateRange = extractDateRange(photos);
		console.log('\nDate Range:');
		console.log(`  Earliest: ${dateRange.earliest}`);
		console.log(`  Latest: ${dateRange.latest}`);
		console.log(`  Canonical: ${formatCanonicalDate(dateRange.earliest, dateRange.latest)}`);
	} catch (error) {
		console.error('Error:', error);
	}
}

/**
 * Example 3: Update album name
 */
async function example3_UpdateAlbumName() {
	console.log('\n=== Example 3: Update Album Name ===\n');

	const albumKey = 'HtxsgN'; // Replace with your album key
	const newName = 'ACC Boys Golf Tourney - Sep 12';

	try {
		// Get current album
		const album = await client.getAlbum(albumKey);
		console.log(`Current name: ${album.Name}`);

		// Update (commented out for safety)
		// const updated = await client.updateAlbum(albumKey, {
		//   Name: newName
		// });
		// console.log(`New name: ${updated.Name}`);

		console.log(`\nWould update to: ${newName}`);
		console.log('(Uncomment code above to actually update)');
	} catch (error) {
		console.error('Error:', error);
	}
}

/**
 * Example 4: Search albums by name
 */
async function example4_SearchAlbums() {
	console.log('\n=== Example 4: Search Albums ===\n');

	const searchTerm = 'volleyball'; // Replace with your search term

	try {
		const albums = await client.searchAlbums(searchTerm);

		console.log(`Found ${albums.length} albums matching "${searchTerm}":\n`);

		albums.slice(0, 10).forEach((album, i) => {
			console.log(`${i + 1}. ${album.Name}`);
			console.log(`   Key: ${album.AlbumKey}`);
			console.log(`   Photos: ${album.ImageCount}`);
			console.log('');
		});

		if (albums.length > 10) {
			console.log(`... and ${albums.length - 10} more`);
		}
	} catch (error) {
		console.error('Error:', error);
	}
}

/**
 * Example 5: Get all albums
 */
async function example5_GetAllAlbums() {
	console.log('\n=== Example 5: Get All Albums ===\n');

	try {
		console.log('Fetching all albums (may take a while)...');
		const albums = await client.getAllAlbums();

		console.log(`\nTotal albums: ${albums.length}\n`);

		// Group by year
		const byYear = new Map<string, number>();
		albums.forEach(album => {
			const year = album.LastUpdated?.substring(0, 4) || 'Unknown';
			byYear.set(year, (byYear.get(year) || 0) + 1);
		});

		console.log('Albums by year:');
		Array.from(byYear.entries())
			.sort()
			.forEach(([year, count]) => {
				console.log(`  ${year}: ${count} albums`);
			});

		// Show most recent
		console.log('\nMost recent 5 albums:');
		albums
			.sort((a, b) => (b.LastUpdated || '').localeCompare(a.LastUpdated || ''))
			.slice(0, 5)
			.forEach((album, i) => {
				console.log(`${i + 1}. ${album.Name}`);
				console.log(`   Updated: ${album.LastUpdated}`);
			});
	} catch (error) {
		console.error('Error:', error);
	}
}

/**
 * Example 6: Generate canonical album name
 */
async function example6_GenerateCanonicalName() {
	console.log('\n=== Example 6: Generate Canonical Name ===\n');

	const albumKey = 'HtxsgN'; // Replace with your album key

	try {
		// Get album with EXIF
		const { album, photos } = await client.getAlbumWithExif(albumKey, {
			maxPhotos: 10,
			onProgress: (current, total) => {
				process.stdout.write(`\rFetching EXIF: ${current}/${total}`);
			}
		});

		console.log('\n');

		// Extract metadata
		const dateRange = extractDateRange(photos);
		const canonicalDate = formatCanonicalDate(dateRange.earliest, dateRange.latest);

		// Parse event name from current name
		const currentName = album.Name;
		const eventName = currentName
			.replace(/^\d{4}\s+/, '') // Remove leading year
			.replace(/\s*-?\s*\d{2}-\d{2}-\d{4}$/, '') // Remove trailing date
			.trim();

		const proposedName = `${eventName} - ${canonicalDate}`;

		console.log('Name Generation:');
		console.log(`  Current: ${currentName}`);
		console.log(`  Event: ${eventName}`);
		console.log(`  Date Range: ${dateRange.earliest} to ${dateRange.latest}`);
		console.log(`  Proposed: ${proposedName}`);

		// Calculate drift
		const drift = Math.abs(currentName.length - proposedName.length);
		console.log(`\nDrift: ${drift} characters`);
	} catch (error) {
		console.error('Error:', error);
	}
}

// Run examples
async function main() {
	const example = process.argv[2];

	if (!example) {
		console.log('Usage: npx tsx scripts/smugmug-examples.ts <example-number>');
		console.log('');
		console.log('Available examples:');
		console.log('  1 - Get album details');
		console.log('  2 - Get photos with EXIF');
		console.log('  3 - Update album name');
		console.log('  4 - Search albums');
		console.log('  5 - Get all albums');
		console.log('  6 - Generate canonical name');
		console.log('');
		console.log('Example: npx tsx scripts/smugmug-examples.ts 1');
		return;
	}

	switch (example) {
		case '1':
			await example1_GetAlbumDetails();
			break;
		case '2':
			await example2_GetPhotosWithExif();
			break;
		case '3':
			await example3_UpdateAlbumName();
			break;
		case '4':
			await example4_SearchAlbums();
			break;
		case '5':
			await example5_GetAllAlbums();
			break;
		case '6':
			await example6_GenerateCanonicalName();
			break;
		default:
			console.error(`Unknown example: ${example}`);
			console.log('Valid examples: 1, 2, 3, 4, 5, 6');
	}
}

// Only run if called directly
if (require.main === module) {
	main().catch(console.error);
}
