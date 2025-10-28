/**
 * Album Name Analysis
 *
 * Analyzes existing album names to identify:
 * - Naming patterns and conventions
 * - Inconsistencies (dates, sport names, formatting)
 * - Missing metadata (teams, locations, event types)
 * - Opportunities for normalization
 *
 * Output: Detailed report of naming patterns and recommendations
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
	console.error('❌ Missing environment variables');
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface AlbumAnalysis {
	album_key: string;
	album_name: string;
	photo_count: number;
	primary_sport: string;
	earliest_date: string | null;
	latest_date: string | null;
	sample_titles: string[];
	sample_descriptions: string[];
}

// Naming pattern detectors
const PATTERNS = {
	hasYear: /\b(19|20)\d{2}\b/,
	hasDate: /\b\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}\b/,
	hasSport: /\b(volleyball|vb|basketball|soccer|football|baseball|softball|track)\b/i,
	hasVs: /\bvs\.?\s+/i,
	hasAt: /\bat\s+/i,
	hasEventType: /\b(championship|tournament|invitational|regional|sectional|conference)\b/i,
	hasLevel: /\b(hs|ms|college|men's|women's|boys|girls)\b/i,
};

async function analyzeAlbumNames() {
	console.log('📊 Analyzing album naming patterns...\n');

	// Get all albums with sample photo metadata
	const { data: albums, error } = await supabase.from('albums_summary').select('*');

	if (error) {
		console.error('❌ Error fetching albums:', error);
		throw error;
	}

	console.log(`Found ${albums.length} albums\n`);

	// Analyze patterns
	const analysis = {
		total: albums.length,
		withYear: 0,
		withDate: 0,
		withSport: 0,
		withVs: 0,
		withAt: 0,
		withEventType: 0,
		withLevel: 0,
		sportMismatch: 0,
		inconsistentFormat: [] as string[],
	};

	const sportCounts: Record<string, number> = {};
	const nameLengths: number[] = [];
	const problematicAlbums: Array<{
		name: string;
		issues: string[];
	}> = [];

	for (const album of albums) {
		const name = album.album_name || '';
		nameLengths.push(name.length);

		const issues: string[] = [];

		// Pattern detection
		if (PATTERNS.hasYear.test(name)) analysis.withYear++;
		if (PATTERNS.hasDate.test(name)) analysis.withDate++;
		if (PATTERNS.hasSport.test(name)) analysis.withSport++;
		if (PATTERNS.hasVs.test(name)) analysis.withVs++;
		if (PATTERNS.hasAt.test(name)) analysis.withAt++;
		if (PATTERNS.hasEventType.test(name)) analysis.withEventType++;
		if (PATTERNS.hasLevel.test(name)) analysis.withLevel++;

		// Sport in metadata vs name
		const sportInName = name.match(
			/\b(volleyball|basketball|soccer|football|baseball|softball|track)\b/i
		)?.[0];
		if (sportInName && album.primary_sport) {
			const normalized = sportInName.toLowerCase().replace('vb', 'volleyball');
			if (!album.primary_sport.includes(normalized)) {
				analysis.sportMismatch++;
				issues.push(
					`Sport mismatch: name="${sportInName}" metadata="${album.primary_sport}"`
				);
			}
		}

		// Track sport distribution
		if (album.primary_sport) {
			sportCounts[album.primary_sport] = (sportCounts[album.primary_sport] || 0) + 1;
		}

		// Check for inconsistent formatting
		if (name.includes('  ')) issues.push('Double spaces');
		if (name.match(/\d{4}-\d{2}-\d{2}/)) issues.push('ISO date format (not user-friendly)');
		if (name.startsWith('"') || name.endsWith('"')) issues.push('Quoted name');
		if (name.includes('&amp;')) issues.push('HTML entities');

		if (issues.length > 0) {
			problematicAlbums.push({ name, issues });
		}
	}

	// Calculate statistics
	const avgLength = nameLengths.reduce((a, b) => a + b, 0) / nameLengths.length;
	const maxLength = Math.max(...nameLengths);
	const minLength = Math.min(...nameLengths);

	// Print report
	console.log('═'.repeat(80));
	console.log('ALBUM NAMING ANALYSIS REPORT');
	console.log('═'.repeat(80));

	console.log('\n📈 Pattern Distribution:');
	console.log(`  Has year (YYYY):        ${analysis.withYear} (${((analysis.withYear / analysis.total) * 100).toFixed(1)}%)`);
	console.log(`  Has full date:          ${analysis.withDate} (${((analysis.withDate / analysis.total) * 100).toFixed(1)}%)`);
	console.log(`  Has sport name:         ${analysis.withSport} (${((analysis.withSport / analysis.total) * 100).toFixed(1)}%)`);
	console.log(`  Has "vs" (matchups):    ${analysis.withVs} (${((analysis.withVs / analysis.total) * 100).toFixed(1)}%)`);
	console.log(`  Has "at" (location):    ${analysis.withAt} (${((analysis.withAt / analysis.total) * 100).toFixed(1)}%)`);
	console.log(`  Has event type:         ${analysis.withEventType} (${((analysis.withEventType / analysis.total) * 100).toFixed(1)}%)`);
	console.log(`  Has level (HS/College): ${analysis.withLevel} (${((analysis.withLevel / analysis.total) * 100).toFixed(1)}%)`);

	console.log('\n📏 Name Length Statistics:');
	console.log(`  Average: ${avgLength.toFixed(1)} characters`);
	console.log(`  Min: ${minLength} characters`);
	console.log(`  Max: ${maxLength} characters`);

	console.log('\n🏐 Sport Distribution:');
	Object.entries(sportCounts)
		.sort(([, a], [, b]) => b - a)
		.forEach(([sport, count]) => {
			console.log(`  ${sport.padEnd(15)} ${count} albums`);
		});

	console.log('\n⚠️  Quality Issues:');
	console.log(`  Sport mismatches:       ${analysis.sportMismatch} albums`);
	console.log(`  Formatting issues:      ${problematicAlbums.length} albums`);

	if (problematicAlbums.length > 0) {
		console.log('\n📋 Sample Problematic Albums:');
		problematicAlbums.slice(0, 10).forEach((album) => {
			console.log(`\n  "${album.name}"`);
			album.issues.forEach((issue) => console.log(`    - ${issue}`));
		});
	}

	// Analyze naming conventions by sport
	console.log('\n' + '═'.repeat(80));
	console.log('NAMING CONVENTION RECOMMENDATIONS');
	console.log('═'.repeat(80));

	console.log('\n🎯 Proposed Standard Format:');
	console.log('  [Level] [Sport] - [Teams/Event] - [Date]');
	console.log('  Examples:');
	console.log('    HS Volleyball - North Central vs Aurora - 2023-09-15');
	console.log('    College VB - Lewis vs UCLA - 2025-01-11');
	console.log('    Portrait - ACC Homecoming 2022');
	console.log('    Track - DU Cross Country Invitational - 2023');

	console.log('\n📝 Normalization Rules:');
	console.log('  1. Consistent sport abbreviations (VB for volleyball, etc.)');
	console.log('  2. Date format: YYYY-MM-DD for single games, YYYY for seasons');
	console.log('  3. Use "vs" for matchups, "at" for locations');
	console.log('  4. Include level prefix (HS, MS, College, Pro)');
	console.log('  5. Event type at end (Championship, Tournament, etc.)');
	console.log('  6. Remove redundant words (Picture, Day, Photos, etc.)');

	console.log('\n' + '═'.repeat(80));
	console.log('\n✅ Analysis complete. Run normalize-album-names.ts to generate proposals.\n');
}

analyzeAlbumNames().catch(console.error);
