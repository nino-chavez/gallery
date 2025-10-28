/**
 * Album Name Normalization
 *
 * Generates improved, consistent album names based on:
 * - Photo metadata (sport, dates, locations, descriptions)
 * - Naming convention standards
 * - User-friendly formatting
 *
 * Output: Proposals for album renames with before/after comparison
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
	console.error('❌ Missing environment variables');
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface AlbumData {
	album_key: string;
	album_name: string;
	photo_count: number;
	primary_sport: string;
	earliest_photo_date: string | null;
	latest_photo_date: string | null;
}

interface NormalizationResult {
	album_key: string;
	current_name: string;
	proposed_name: string;
	confidence: 'high' | 'medium' | 'low';
	changes: string[];
	reason: string;
	length: number;
	truncated: boolean;
}

// UX-aware character limits based on IA best practices
// Shorter names for list scanning, full context in album description
const MAX_LENGTH_IDEAL = 35; // Optimal for quick scanning (1 line mobile, 1 line desktop)
const MAX_LENGTH_HARD = 45; // Absolute maximum (allows wrapping on mobile)

// Normalization helpers
function normalizeDate(dateStr: string | null): string | null {
	if (!dateStr) return null;
	const date = new Date(dateStr);
	if (isNaN(date.getTime())) return null;
	return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function formatUserFriendlyDate(dateStr: string | null): string {
	if (!dateStr) return '';
	const date = new Date(dateStr);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${month}-${day}-${year}`; // User-friendly: MM-DD-YYYY
}

/**
 * Format date for canonical album names - CONSISTENT pattern
 * Rule: Use LATEST photo date (most recent = most relevant for identification)
 * Format: "Mon Day" for single-day, "Mon Year" for multi-day
 * Examples: "May 30", "Aug 2024"
 */
function formatCanonicalDate(earliest: string | null, latest: string | null): string {
	if (!latest) return '';

	// ALWAYS use latest date (most recent photo in album)
	const date = new Date(latest);
	const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const month = monthNames[date.getMonth()];
	const day = date.getDate();
	const year = date.getFullYear();

	// Single day event: "May 30"
	if (earliest === latest) {
		return `${month} ${day}`;
	}

	// Multi-day event: "May 2024"
	// (user can see full date range on detail page)
	return `${month} ${year}`;
}

function extractTeams(name: string): { homeTeam?: string; awayTeam?: string } | null {
	const vsMatch = name.match(/(.+?)\s+vs\.?\s+(.+?)(?:\s+[-–]\s+|\s+\d{4}|$)/i);
	if (vsMatch) {
		let homeTeam = vsMatch[1].trim();
		let awayTeam = vsMatch[2].trim();

		// Strip common prefixes from team names
		homeTeam = homeTeam
			.replace(/^(hs|ms|college|men's|women's|boys|girls|pro)\s+/i, '')
			.replace(/^(vb|volleyball|basketball|soccer|football|baseball|softball|track)\s+[-–]?\s*/i, '')
			.trim();

		awayTeam = awayTeam
			.replace(/^(hs|ms|college|men's|women's|boys|girls|pro)\s+/i, '')
			.replace(/^(vb|volleyball|basketball|soccer|football|baseball|softball|track)\s+[-–]?\s*/i, '')
			.trim();

		return {
			homeTeam,
			awayTeam,
		};
	}
	return null;
}

function extractLocation(name: string): string | null {
	const atMatch = name.match(/\bat\s+([^-\d]+?)(?:\s+-\s+|\s+\d{4}|$)/i);
	return atMatch ? atMatch[1].trim() : null;
}

function extractLevel(name: string): string | null {
	const levelMatch = name.match(/\b(hs|ms|college|men's|women's|boys|girls|pro)\b/i);
	if (!levelMatch) return null;

	const level = levelMatch[1].toLowerCase();
	const mapping: Record<string, string> = {
		hs: 'HS',
		ms: 'MS',
		college: 'College',
		"men's": "Men's",
		"women's": "Women's",
		boys: 'Boys',
		girls: 'Girls',
		pro: 'Pro',
	};
	return mapping[level] || null;
}

function normalizeSport(sport: string): string {
	const mapping: Record<string, string> = {
		volleyball: 'VB',
		basketball: 'Basketball',
		soccer: 'Soccer',
		football: 'Football',
		baseball: 'Baseball',
		softball: 'Softball',
		track: 'Track',
		portrait: 'Portrait',
		other: 'Other',
	};
	return mapping[sport.toLowerCase()] || sport;
}

/**
 * Smart truncation that maintains readability
 * Priority: Keep teams/event, truncate location/descriptors, keep date
 */
function truncateAlbumName(name: string, maxLength: number): { name: string; truncated: boolean } {
	if (name.length <= maxLength) {
		return { name, truncated: false };
	}

	// Parse parts: [Level] [Sport] - [Event] - [Location?] - [Date]
	const parts = name.split(' - ');

	if (parts.length <= 2) {
		// Simple name, just hard truncate
		return { name: name.substring(0, maxLength - 3) + '...', truncated: true };
	}

	// Try removing location first (usually 3rd or 4th part)
	if (parts.length >= 4 && parts[2].startsWith('at ')) {
		const withoutLocation = [...parts.slice(0, 2), ...parts.slice(3)].join(' - ');
		if (withoutLocation.length <= maxLength) {
			return { name: withoutLocation, truncated: true };
		}
	}

	// Try shortening event name
	if (parts.length >= 2) {
		const eventPart = parts[1];
		// Shorten long event names
		const shortenedEvent = eventPart
			.replace(/Championship/i, 'Champ')
			.replace(/Invitational/i, 'Invite')
			.replace(/Tournament/i, 'Tourney')
			.replace(/Regional/i, 'Reg')
			.replace(/Sectional/i, 'Sect');

		const shortenedParts = [parts[0], shortenedEvent, ...parts.slice(2)];
		const shortened = shortenedParts.join(' - ');

		if (shortened.length <= maxLength) {
			return { name: shortened, truncated: true };
		}
	}

	// Try removing redundant prefixes in event name
	if (parts.length >= 2) {
		const levelSport = parts[0]; // "HS VB"
		let eventName = parts[1];

		// Remove redundant "HS VB - " from event if already in prefix
		const tokens = levelSport.split(' ');
		for (const token of tokens) {
			if (eventName.startsWith(token + ' - ')) {
				eventName = eventName.substring(token.length + 3);
			} else if (eventName.startsWith(token + ' ')) {
				eventName = eventName.substring(token.length + 1);
			}
		}

		const cleanedParts = [parts[0], eventName, ...parts.slice(2)];
		const cleaned = cleanedParts.join(' - ');

		if (cleaned.length <= maxLength) {
			return { name: cleaned, truncated: true };
		}
	}

	// Last resort: Hard truncate but keep date
	const date = parts[parts.length - 1];
	const availableForContent = maxLength - date.length - 3; // " - " separator

	if (availableForContent > 20) {
		const content = parts.slice(0, -1).join(' - ').substring(0, availableForContent);
		return { name: `${content}... - ${date}`, truncated: true };
	}

	// Really last resort: just hard truncate
	return { name: name.substring(0, maxLength - 3) + '...', truncated: true };
}

function generateProposedName(album: AlbumData, photoSample: any[]): NormalizationResult {
	const current = album.album_name.trim().replace(/^"|"$/g, ''); // Remove surrounding quotes
	const changes: string[] = [];
	let confidence: 'high' | 'medium' | 'low' = 'medium';
	let reason = '';

	// Check if current name already follows the standard pattern
	// Standard: [Level] [Sport] - [Event/Teams] - [Date]
	const standardPattern = /^(\w+\s+)?(\w+)\s+-\s+(.+?)\s+-\s+(\d{1,2}-\d{1,2}-\d{4}|\d{4})$/;
	if (standardPattern.test(current) && !current.match(/\d{4}-\d{2}-\d{2}/)) {
		// Already good, just check for ISO date
		return {
			album_key: album.album_key,
			current_name: album.album_name,
			proposed_name: current,
			confidence: 'low',
			changes: [],
			reason: 'Already follows standard format',
			length: current.length,
			truncated: false,
		};
	}

	// Extract components
	const level = extractLevel(current);
	const teams = extractTeams(current);
	const location = extractLocation(current);
	const sport = normalizeSport(album.primary_sport);

	// Build canonical name: [Event/Teams] - [Date]
	// NO level, NO sport (redundant with UI pills)
	const parts: string[] = [];

	// 1. Teams or Event (PRIMARY identifier)
	if (teams) {
		// Clean up team names (remove redundant words)
		let homeTeam = teams.homeTeam?.trim();
		let awayTeam = teams.awayTeam?.trim();

		// Shorten common verbose phrases
		homeTeam = homeTeam?.replace(/\s+(volleyball|vb|basketball)\s*$/i, '');
		awayTeam = awayTeam?.replace(/\s+(volleyball|vb|basketball)\s*$/i, '');

		parts.push(`${homeTeam} vs ${awayTeam}`);
		confidence = 'high';
		reason = 'Matchup detected';
		changes.push('Canonical matchup format');
	} else {
		// Extract clean event name
		let eventName = current
			.replace(/^\d{4}\s*[-–]?\s*/, '') // Remove leading year
			.replace(/\s*[-–]\s*\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}\s*$/, '') // Remove trailing date
			.replace(/\s*[-–]\s*\d{4}-\d{2}-\d{2}\s*$/, '') // Remove ISO date
			.replace(/\s*[-–]?\s*\d{4}\s*$/, '') // Remove trailing year
			.replace(/\s+\d{1,2}-\d{1,2}-\d{2,4}\s*$/i, '') // Remove embedded date at end (e.g., " 09-12-2022")
			.replace(/\s+\d{1,2}-\d{1,2}\s*$/i, '') // Remove short embedded date (e.g., " 09-12")
			.replace(/^\s*(hs|ms|college|men's|women's)\s+/i, '') // Remove level prefix
			.replace(/^\s*(volleyball|vb|basketball|soccer|football|baseball|softball|track)\s+/i, '') // Remove sport
			.replace(/\s{2,}/g, ' ') // Fix double spaces
			.trim();

		// Shorten common verbose words for scanability
		eventName = eventName
			.replace(/\bchampionship\b/gi, 'Champ')
			.replace(/\binvitational\b/gi, 'Invite')
			.replace(/\btournament\b/gi, 'Tourney')
			.replace(/\bpicture day\b/gi, '')
			.replace(/\s+photos?\s*$/i, ''); // Remove trailing "photos"

		if (eventName && eventName.length > 3) {
			parts.push(eventName.trim());
			confidence = 'medium';
			reason = 'Event name extracted and cleaned';
			changes.push('Removed redundant words');
		}
	}

	// 2. Date (SECONDARY - for differentiation)
	const earliest = normalizeDate(album.earliest_photo_date);
	const latest = normalizeDate(album.latest_photo_date);

	if (earliest && latest) {
		const canonicalDate = formatCanonicalDate(earliest, latest);
		if (canonicalDate) {
			parts.push(canonicalDate);
			changes.push('Canonical date format (short & scannable)');
		}
	}

	let proposed = parts.join(' - ');

	// Apply smart truncation to stay within UX limits
	const { name: truncatedName, truncated } = truncateAlbumName(proposed, MAX_LENGTH_HARD);
	proposed = truncatedName;

	// Detect what changed
	if (current.match(/\d{4}-\d{2}-\d{2}/)) {
		changes.push('ISO date → canonical date');
	}
	if (current.includes('  ')) {
		changes.push('Fixed double spaces');
	}
	if (album.album_name.startsWith('"')) {
		changes.push('Removed quotes');
	}
	if (level && current.toLowerCase().includes(level.toLowerCase())) {
		changes.push(`Removed level prefix (${level})`);
	}
	if (sport !== 'Other' && current.toLowerCase().includes(sport.toLowerCase())) {
		changes.push(`Removed sport prefix (${sport})`);
	}
	if (truncated) {
		changes.push('Truncated for scanability');
	}
	if (proposed.length <= MAX_LENGTH_IDEAL) {
		changes.push('✅ Optimal length for scanning');
	}

	return {
		album_key: album.album_key,
		current_name: album.album_name,
		proposed_name: proposed,
		confidence,
		changes,
		reason,
		length: proposed.length,
		truncated,
	};
}

async function normalizeAlbumNames() {
	console.log('🔄 Generating album name normalization proposals...\n');

	// Get all albums
	const { data: albums, error: albumError } = await supabase
		.from('albums_summary')
		.select('album_key, album_name, photo_count, primary_sport, earliest_photo_date, latest_photo_date')
		.order('photo_count', { ascending: false });

	if (albumError) {
		console.error('❌ Error fetching albums:', albumError);
		throw albumError;
	}

	console.log(`Processing ${albums.length} albums...\n`);

	const results: NormalizationResult[] = [];
	let changesNeeded = 0;

	for (const album of albums) {
		// Get sample photos to inform naming
		const { data: photos } = await supabase
			.from('photo_metadata')
			.select('title, description, sport_type, photo_category')
			.eq('album_key', album.album_key)
			.limit(5);

		const result = generateProposedName(album, photos || []);
		results.push(result);

		if (result.proposed_name !== result.current_name) {
			changesNeeded++;
		}
	}

	// Generate report
	console.log('═'.repeat(80));
	console.log('ALBUM NAME NORMALIZATION PROPOSALS');
	console.log('═'.repeat(80));

	console.log(`\n📊 Summary:`);
	console.log(`  Total albums:       ${albums.length}`);
	console.log(`  Changes proposed:   ${changesNeeded}`);
	console.log(`  No changes needed:  ${albums.length - changesNeeded}`);

	const highConfidence = results.filter((r) => r.confidence === 'high').length;
	const mediumConfidence = results.filter((r) => r.confidence === 'medium').length;
	const lowConfidence = results.filter((r) => r.confidence === 'low').length;

	console.log(`\n🎯 Confidence:`);
	console.log(`  High:   ${highConfidence} proposals`);
	console.log(`  Medium: ${mediumConfidence} proposals`);
	console.log(`  Low:    ${lowConfidence} proposals`);

	// Length statistics
	const lengths = results.map((r) => r.length);
	const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
	const maxLength = Math.max(...lengths);
	const overIdeal = results.filter((r) => r.length > MAX_LENGTH_IDEAL).length;
	const overHard = results.filter((r) => r.length > MAX_LENGTH_HARD).length;
	const truncated = results.filter((r) => r.truncated).length;

	console.log(`\n📏 UX Length Analysis:`);
	console.log(`  Average length:          ${avgLength.toFixed(1)} chars`);
	console.log(`  Max length:              ${maxLength} chars`);
	console.log(`  Over ideal (${MAX_LENGTH_IDEAL} chars):  ${overIdeal} albums (will wrap to 2 lines)`);
	console.log(`  Over hard limit (${MAX_LENGTH_HARD}):   ${overHard} albums (should be 0)`);
	console.log(`  Truncated for UX:        ${truncated} albums`);

	// Show sample proposals
	console.log('\n📋 Sample Proposals (Changes Only):\n');
	results
		.filter((r) => r.proposed_name !== r.current_name)
		.slice(0, 20)
		.forEach((result, idx) => {
			console.log(`${(idx + 1).toString().padStart(2)}. ${result.confidence.toUpperCase()} CONFIDENCE`);
			console.log(`    Current:  "${result.current_name}"`);
			console.log(`    Proposed: "${result.proposed_name}"`);
			if (result.changes.length > 0) {
				console.log(`    Changes:  ${result.changes.join(', ')}`);
			}
			console.log('');
		});

	// Export to JSON for review
	const outputPath = '.agent-os/album-rename-proposals.json';
	writeFileSync(outputPath, JSON.stringify(results, null, 2));
	console.log(`\n💾 Full proposals saved to: ${outputPath}`);

	// Generate CSV for easy review
	const csvLines = [
		'Album Key,Current Name,Proposed Name,Confidence,Changes',
		...results
			.filter((r) => r.proposed_name !== r.current_name)
			.map(
				(r) =>
					`"${r.album_key}","${r.current_name}","${r.proposed_name}","${r.confidence}","${r.changes.join('; ')}"`
			),
	];
	const csvPath = '.agent-os/album-rename-proposals.csv';
	writeFileSync(csvPath, csvLines.join('\n'));
	console.log(`📊 CSV saved to: ${csvPath}\n`);

	console.log('═'.repeat(80));
	console.log('\n✅ Normalization proposals generated!');
	console.log('   Review proposals and run apply-album-renames.ts to update SmugMug.\n');
}

normalizeAlbumNames().catch(console.error);
