/**
 * Comprehensive Album Sport Type Audit
 *
 * Lists ALL albums and their assigned sports to identify potential misclassifications
 * Helps identify albums that might be incorrectly classified
 *
 * Usage:
 *   npx tsx scripts/audit-all-album-sports.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
	console.error('❌ Missing environment variables');
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function auditAllAlbums() {
	console.log('🔍 Fetching all albums from database...\n');

	const { data: albums, error } = await supabase
		.from('albums_summary')
		.select('album_key, album_name, primary_sport, photo_count')
		.order('album_name');

	if (error) {
		console.error('❌ Error:', error);
		throw error;
	}

	if (!albums || albums.length === 0) {
		console.log('ℹ️  No albums found');
		return;
	}

	console.log(`📊 Total albums: ${albums.length}\n`);

	// Group by sport
	const bySport = new Map<string, typeof albums>();
	for (const album of albums) {
		const sport = album.primary_sport || 'unknown';
		if (!bySport.has(sport)) {
			bySport.set(sport, []);
		}
		bySport.get(sport)!.push(album);
	}

	// Display by sport
	for (const [sport, sportAlbums] of Array.from(bySport.entries()).sort((a, b) => b[1].length - a[1].length)) {
		console.log(`\n${'='.repeat(80)}`);
		console.log(`${sport.toUpperCase()} (${sportAlbums.length} albums)`);
		console.log('='.repeat(80));

		for (const album of sportAlbums) {
			console.log(`  📁 ${album.album_name}`);
			console.log(`     Key: ${album.album_key} | Photos: ${album.photo_count}`);
		}
	}

	// Summary stats
	console.log(`\n${'='.repeat(80)}`);
	console.log('SUMMARY');
	console.log('='.repeat(80));
	for (const [sport, sportAlbums] of Array.from(bySport.entries()).sort((a, b) => b[1].length - a[1].length)) {
		console.log(`  ${sport.padEnd(20)} ${sportAlbums.length.toString().padStart(4)} albums`);
	}

	// Flag potential issues
	console.log(`\n${'='.repeat(80)}`);
	console.log('POTENTIAL ISSUES TO REVIEW');
	console.log('='.repeat(80));

	const volleyballAlbums = bySport.get('volleyball') || [];
	const suspiciousPatterns = [
		/football/i,
		/soccer/i,
		/basketball/i,
		/baseball/i,
		/softball/i,
		/track/i,
		/dog|pet|puppy/i,
		/cat|kitten/i,
		/bowl(ing)?/i,
		/tennis/i,
		/golf/i,
		/swim/i,
		/hockey/i
	];

	const suspicious = volleyballAlbums.filter(album =>
		suspiciousPatterns.some(pattern => pattern.test(album.album_name))
	);

	if (suspicious.length > 0) {
		console.log('\n⚠️  Volleyball albums with non-volleyball names:');
		for (const album of suspicious) {
			console.log(`  - "${album.album_name}" (${album.album_key})`);
		}
	} else {
		console.log('\n✅ No obvious volleyball misclassifications detected');
	}

	// Look for "other" sport that might need better classification
	const otherAlbums = bySport.get('other') || [];
	if (otherAlbums.length > 0) {
		console.log(`\n📋 "Other" sport albums (may need specific sport assignment):`);
		for (const album of otherAlbums) {
			console.log(`  - "${album.album_name}" (${album.album_key})`);
		}
	}
}

auditAllAlbums().catch(console.error);
