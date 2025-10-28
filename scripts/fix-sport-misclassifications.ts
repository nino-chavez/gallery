/**
 * Fix Sport Type Misclassifications
 *
 * Identifies albums where sport_type was incorrectly assigned during AI enrichment
 * and provides options to correct them.
 *
 * Usage:
 *   npx tsx scripts/fix-sport-misclassifications.ts --preview
 *   npx tsx scripts/fix-sport-misclassifications.ts --fix
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
	console.error('❌ Missing environment variables');
	console.error('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Patterns that indicate misclassification
const MISCLASSIFICATION_PATTERNS = [
	// Other Sports → Basketball
	{
		pattern: /basketball|bball/i,
		wrongSport: 'volleyball',
		correctSport: 'basketball',
		description: 'Basketball incorrectly marked as volleyball'
	},
	// Other Sports → Other
	{
		pattern: /\bgolf\b/i,
		wrongSport: 'volleyball',
		correctSport: 'other',
		description: 'Golf incorrectly marked as volleyball'
	},
	{
		pattern: /tennis/i,
		wrongSport: 'volleyball',
		correctSport: 'other',
		description: 'Tennis incorrectly marked as volleyball'
	},
	{
		pattern: /bowl(ing)?/i,
		wrongSport: 'volleyball',
		correctSport: 'other',
		description: 'Bowling incorrectly marked as volleyball'
	},
	{
		pattern: /pickleball/i,
		wrongSport: 'volleyball',
		correctSport: 'other',
		description: 'Pickleball incorrectly marked as volleyball'
	},
	{
		pattern: /cross country/i,
		wrongSport: 'volleyball',
		correctSport: 'track',
		description: 'Cross Country incorrectly marked as volleyball'
	},
	// Events → Portrait
	{
		pattern: /graduation/i,
		wrongSport: 'volleyball',
		correctSport: 'portrait',
		description: 'Graduation events incorrectly marked as volleyball'
	},
	{
		pattern: /homecoming/i,
		wrongSport: 'volleyball',
		correctSport: 'portrait',
		description: 'Homecoming events incorrectly marked as volleyball'
	},
	{
		pattern: /birthday|party/i,
		wrongSport: 'volleyball',
		correctSport: 'portrait',
		description: 'Personal events incorrectly marked as volleyball'
	},
	{
		pattern: /drama|theatre|theater|play\b|musical/i,
		wrongSport: 'volleyball',
		correctSport: 'portrait',
		description: 'Drama/Theatre incorrectly marked as volleyball'
	},
	{
		pattern: /signing|senior night/i,
		wrongSport: 'volleyball',
		correctSport: 'portrait',
		description: 'Senior/Signing events incorrectly marked as volleyball'
	},
	// Animals/Pets → Other
	{
		pattern: /dog|puppy|canine|pet|bruno|beni|athena/i,
		wrongSport: 'volleyball',
		correctSport: 'other',
		description: 'Dogs/Pets incorrectly marked as volleyball'
	}
];

interface Album {
	album_key: string;
	album_name: string;
	primary_sport: string;
	photo_count: number;
}

interface MisclassifiedAlbum extends Album {
	reason: string;
	suggestedSport: string;
}

async function findMisclassifications(): Promise<MisclassifiedAlbum[]> {
	console.log('🔍 Searching for misclassified albums...\n');

	// Query albums from materialized view
	const { data: albums, error } = await supabase
		.from('albums_summary')
		.select('album_key, album_name, primary_sport, photo_count')
		.order('album_name');

	if (error) {
		console.error('❌ Error fetching albums:', error);
		throw error;
	}

	if (!albums || albums.length === 0) {
		console.log('ℹ️  No albums found');
		return [];
	}

	const misclassified: MisclassifiedAlbum[] = [];

	for (const album of albums as Album[]) {
		for (const { pattern, wrongSport, correctSport, description } of MISCLASSIFICATION_PATTERNS) {
			if (
				album.primary_sport === wrongSport &&
				pattern.test(album.album_name)
			) {
				misclassified.push({
					...album,
					reason: description,
					suggestedSport: correctSport
				});
				break; // Only count each album once
			}
		}
	}

	return misclassified;
}

async function previewMisclassifications() {
	const misclassified = await findMisclassifications();

	if (misclassified.length === 0) {
		console.log('✅ No misclassifications found!');
		return;
	}

	console.log(`\n📊 Found ${misclassified.length} potentially misclassified albums:\n`);

	// Group by reason
	const byReason = new Map<string, MisclassifiedAlbum[]>();
	for (const album of misclassified) {
		if (!byReason.has(album.reason)) {
			byReason.set(album.reason, []);
		}
		byReason.get(album.reason)!.push(album);
	}

	for (const [reason, albums] of byReason) {
		console.log(`\n${reason}:`);
		for (const album of albums) {
			console.log(`  - "${album.album_name}"`);
			console.log(`    Album Key: ${album.album_key}`);
			console.log(`    Current: ${album.primary_sport} → Suggested: ${album.suggestedSport}`);
			console.log(`    Photos: ${album.photo_count}`);
		}
	}

	console.log(`\n💡 To fix these issues, run:`);
	console.log(`   npx tsx scripts/fix-sport-misclassifications.ts --fix`);
}

async function fixMisclassifications() {
	const misclassified = await findMisclassifications();

	if (misclassified.length === 0) {
		console.log('✅ No misclassifications to fix!');
		return;
	}

	console.log(`\n🔧 Fixing ${misclassified.length} misclassified albums...\n`);

	let fixedCount = 0;
	let errorCount = 0;

	for (const album of misclassified) {
		console.log(`Fixing: "${album.album_name}" (${album.album_key})`);
		console.log(`  ${album.primary_sport} → ${album.suggestedSport}`);

		// Update all photos in this album
		const { error, count } = await supabase
			.from('photo_metadata')
			.update({ sport_type: album.suggestedSport })
			.eq('album_key', album.album_key);

		if (error) {
			console.error(`  ❌ Error: ${error.message}`);
			errorCount++;
		} else {
			console.log(`  ✅ Updated ${count} photos`);
			fixedCount++;
		}
	}

	console.log(`\n📊 Summary:`);
	console.log(`  Fixed: ${fixedCount} albums`);
	console.log(`  Errors: ${errorCount} albums`);

	if (fixedCount > 0) {
		console.log(`\n🔄 Refreshing materialized view...`);
		const { error: refreshError } = await supabase.rpc('refresh_albums_summary');

		if (refreshError) {
			console.error(`❌ Error refreshing view: ${refreshError.message}`);
			console.log(`\nℹ️  You may need to manually refresh the view:`);
			console.log(`   REFRESH MATERIALIZED VIEW albums_summary;`);
		} else {
			console.log(`✅ Materialized view refreshed!`);
		}
	}

	console.log(`\n✨ Done! Reload your albums page to see the changes.`);
}

// Main execution
const args = process.argv.slice(2);
const mode = args[0];

async function main() {
	try {
		if (mode === '--fix') {
			await fixMisclassifications();
		} else {
			await previewMisclassifications();
		}
	} catch (error) {
		console.error('❌ Fatal error:', error);
		process.exit(1);
	}
}

main();
