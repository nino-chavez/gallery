/**
 * Analyze Album Badge Distribution
 *
 * Determines what percentage of albums qualify for each badge type
 * to inform UX decisions about badge utility
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
	console.error('❌ Missing environment variables');
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function analyzeAlbumBadges() {
	console.log('📊 Analyzing album badge distribution...\n');

	const { data: albums, error } = await supabase
		.from('albums_summary')
		.select('album_key, album_name, photo_count, avg_quality_score, primary_sport');

	if (error) {
		console.error('❌ Error:', error);
		throw error;
	}

	if (!albums || albums.length === 0) {
		console.log('ℹ️  No albums found');
		return;
	}

	const total = albums.length;

	// Photo count distribution
	const count100Plus = albums.filter((a) => a.photo_count >= 100).length;
	const count200Plus = albums.filter((a) => a.photo_count >= 200).length;
	const count50Plus = albums.filter((a) => a.photo_count >= 50).length;

	// Quality score distribution (if exists)
	const highQuality = albums.filter((a) => (a.avg_quality_score || 0) >= 0.7).length;
	const topQuality = albums.filter((a) => (a.avg_quality_score || 0) >= 0.8).length;

	// Sport distribution
	const withSport = albums.filter((a) => a.primary_sport && a.primary_sport !== 'other').length;

	console.log('='.repeat(80));
	console.log('BADGE DISTRIBUTION ANALYSIS');
	console.log('='.repeat(80));
	console.log(`\nTotal albums: ${total}\n`);

	console.log('📸 Photo Count Badges:');
	console.log(`  100+ photos: ${count100Plus} albums (${((count100Plus / total) * 100).toFixed(1)}%)`);
	console.log(`  200+ photos: ${count200Plus} albums (${((count200Plus / total) * 100).toFixed(1)}%)`);
	console.log(`   50+ photos: ${count50Plus} albums (${((count50Plus / total) * 100).toFixed(1)}%)`);

	console.log('\n⭐ Quality Badges:');
	console.log(
		`  High Quality (≥0.7): ${highQuality} albums (${((highQuality / total) * 100).toFixed(1)}%)`
	);
	console.log(
		`  Top Quality  (≥0.8): ${topQuality} albums (${((topQuality / total) * 100).toFixed(1)}%)`
	);

	console.log('\n🏐 Sport Pills:');
	console.log(
		`  Has specific sport: ${withSport} albums (${((withSport / total) * 100).toFixed(1)}%)`
	);

	console.log('\n' + '='.repeat(80));
	console.log('RECOMMENDATIONS');
	console.log('='.repeat(80));

	// Recommendations based on distribution
	if (count100Plus / total > 0.7) {
		console.log('\n⚠️  "100+" badge shown on >70% of albums - LOW UTILITY');
		console.log('   Consider: Remove or increase threshold to 200+');
	}

	if (highQuality / total > 0.7) {
		console.log('\n⚠️  "High Quality" badge shown on >70% of albums - LOW UTILITY');
		console.log('   Consider: Remove or increase threshold to 0.8 (top tier only)');
	}

	if (withSport / total > 0.5) {
		console.log('\n✅ Sport pills provide good differentiation - KEEP');
	}

	// Show sample of albums WITHOUT common badges
	const uniqueAlbums = albums.filter(
		(a) => a.photo_count < 100 || (a.avg_quality_score || 0) < 0.7
	);

	if (uniqueAlbums.length > 0) {
		console.log(`\n📋 Albums WITHOUT common badges (${uniqueAlbums.length} total):`);
		for (const album of uniqueAlbums.slice(0, 10)) {
			console.log(
				`  - "${album.album_name}" (${album.photo_count} photos, quality: ${(album.avg_quality_score || 0).toFixed(2)})`
			);
		}
	}

	console.log('\n' + '='.repeat(80));
}

analyzeAlbumBadges().catch(console.error);
