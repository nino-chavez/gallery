/**
 * Canonical Album Naming Utility
 *
 * Generates IA-optimized album names for maximum scanability.
 * Used by:
 * - Data enrichment pipeline (creates albums with proper names)
 * - Normalization scripts (fixes existing albums)
 * - CLI utilities (standalone name generation)
 *
 * Format: [Event/Teams] - [Date]
 * Character limit: 35-45 characters
 * See: .agent-os/CANONICAL_NAMING_STRATEGY.md
 */

// UX-aware character limits
export const MAX_LENGTH_IDEAL = 35; // Optimal for scanning (1 line)
export const MAX_LENGTH_HARD = 45; // Absolute maximum (2 lines mobile)

/**
 * SmugMug Album Data (from API)
 * Primary source of truth for canonical name generation
 */
export interface SmugMugAlbumData {
	albumKey: string;
	name: string; // Existing name (used for drift scoring only)

	// Date fields from SmugMug API
	dateStart?: string; // Album start date (ISO format)
	dateEnd?: string; // Album end date (ISO format)

	// Album metadata
	keywords?: string[]; // Sport, category, event type
	description?: string; // Full album description

	// Photo data for EXIF extraction
	photos?: Array<{
		exif?: {
			DateTimeOriginal?: string; // EXIF date (most reliable)
		};
		keywords?: string[]; // Photo-level keywords
		caption?: string; // Photo caption (may contain team/event info)
	}>;

	// AI-enriched metadata (if available)
	enrichment?: {
		sportType?: string;
		teams?: { home: string; away: string };
		eventName?: string;
		category?: string;
	};
}

/**
 * Legacy input format (for backward compatibility)
 */
export interface AlbumNameInput {
	currentName?: string; // Optional: existing name to parse
	sportType?: string; // e.g., "volleyball", "basketball"
	earliestPhotoDate?: string; // ISO date string
	latestPhotoDate?: string; // ISO date string
	teams?: { home: string; away: string }; // For matchups
	eventName?: string; // For tournaments/events
}

/**
 * Canonical name result with drift analysis
 */
export interface CanonicalNameResult {
	name: string;
	length: number;
	truncated: boolean;
	components: {
		event: string;
		date: string;
	};
	metadata: {
		isMatchup: boolean;
		isMultiDay: boolean;
		dateSource: 'exif' | 'album_field' | 'inferred' | 'fallback';
		confidence: 'high' | 'medium' | 'low';
	};
	driftScore?: number; // 0-100: how different from existing name
	driftAnalysis?: {
		existingName: string;
		proposedName: string;
		changes: string[];
	};
}

/**
 * Generate canonical name from SmugMug album data (PRIMARY METHOD)
 *
 * Uses SmugMug API data and photo EXIF as primary sources of truth.
 * Existing album name is only used for drift analysis, not as input.
 */
export function generateCanonicalNameFromSmugMug(
	album: SmugMugAlbumData
): CanonicalNameResult {
	const parts: string[] = [];
	let isMatchup = false;
	let isMultiDay = false;
	let dateSource: 'exif' | 'album_field' | 'inferred' | 'fallback' = 'fallback';
	let confidence: 'high' | 'medium' | 'low' = 'low';

	// 1. Event or Teams (PRIMARY identifier)
	// Priority: enrichment > keywords > caption analysis > existing name fallback
	if (album.enrichment?.teams) {
		// AI-enriched team data (highest confidence)
		const homeTeam = cleanTeamName(album.enrichment.teams.home);
		const awayTeam = cleanTeamName(album.enrichment.teams.away);
		parts.push(`${homeTeam} vs ${awayTeam}`);
		isMatchup = true;
		confidence = 'high';
	} else if (album.enrichment?.eventName) {
		// AI-enriched event name
		const cleanEvent = cleanEventName(album.enrichment.eventName, album.enrichment.sportType);
		parts.push(cleanEvent);
		confidence = 'high';
	} else {
		// Fallback: parse from existing name (lower confidence)
		const parsed = parseExistingName(album.name);
		if (parsed.teams) {
			parts.push(`${parsed.teams.home} vs ${parsed.teams.away}`);
			isMatchup = true;
			confidence = 'medium';
		} else if (parsed.event) {
			parts.push(parsed.event);
			confidence = 'medium';
		}
	}

	// 2. Date (SECONDARY differentiator)
	// Priority: EXIF DateTimeOriginal > SmugMug dateStart/dateEnd > infer from existing name
	const dateResult = extractDateRange(album);
	const earliest = dateResult.earliest;
	const latest = dateResult.latest;
	dateSource = dateResult.source;

	if (dateResult.source === 'exif' || dateResult.source === 'album_field') {
		// High confidence if from EXIF or SmugMug fields
		if (confidence === 'low') confidence = 'medium';
	}

	if (latest) {
		const canonicalDate = formatCanonicalDate(earliest, latest);
		if (canonicalDate) {
			parts.push(canonicalDate);
			isMultiDay = earliest !== latest;
		}
	}

	let proposed = parts.join(' - ');

	// 3. Apply smart truncation if needed
	const { name: truncatedName, truncated } = truncateIfNeeded(proposed, MAX_LENGTH_HARD);

	// 4. Calculate drift score (how different from existing name)
	const { score, changes } = calculateDriftScore(album.name, truncatedName);

	return {
		name: truncatedName,
		length: truncatedName.length,
		truncated,
		components: {
			event: parts[0] || '',
			date: parts[1] || '',
		},
		metadata: {
			isMatchup,
			isMultiDay,
			dateSource,
			confidence,
		},
		driftScore: score,
		driftAnalysis: {
			existingName: album.name,
			proposedName: truncatedName,
			changes,
		},
	};
}

/**
 * Extract date range from SmugMug album data
 * Priority: EXIF DateTimeOriginal > SmugMug dateStart/dateEnd > infer from name
 */
function extractDateRange(album: SmugMugAlbumData): {
	earliest: string | undefined;
	latest: string | undefined;
	source: 'exif' | 'album_field' | 'inferred' | 'fallback';
} {
	// Priority 1: Extract from photo EXIF data (most reliable)
	if (album.photos && album.photos.length > 0) {
		const exifDates = album.photos
			.map((p) => p.exif?.DateTimeOriginal)
			.filter((d): d is string => !!d)
			.map((d) => normalizeExifDate(d))
			.filter((d): d is string => !!d)
			.sort();

		if (exifDates.length > 0) {
			return {
				earliest: exifDates[0],
				latest: exifDates[exifDates.length - 1],
				source: 'exif',
			};
		}
	}

	// Priority 2: Use SmugMug album date fields
	if (album.dateStart || album.dateEnd) {
		return {
			earliest: album.dateStart,
			latest: album.dateEnd || album.dateStart,
			source: 'album_field',
		};
	}

	// Priority 3: Try to infer from existing name (low confidence)
	const inferredDate = inferDateFromName(album.name);
	if (inferredDate) {
		return {
			earliest: inferredDate,
			latest: inferredDate,
			source: 'inferred',
		};
	}

	// Fallback: no date available
	return {
		earliest: undefined,
		latest: undefined,
		source: 'fallback',
	};
}

/**
 * Normalize EXIF DateTimeOriginal to ISO date string
 * EXIF format: "YYYY:MM:DD HH:MM:SS" or "YYYY-MM-DD HH:MM:SS"
 *
 * Note: Extracts only the date portion to avoid timezone conversion issues.
 * We don't need the time component for album naming.
 */
function normalizeExifDate(exifDate: string): string | undefined {
	try {
		// Extract date portion only (YYYY:MM:DD or YYYY-MM-DD)
		const dateMatch = exifDate.match(/^(\d{4})[-:](\d{2})[-:](\d{2})/);

		if (!dateMatch) {
			return undefined;
		}

		// Return as ISO date string (YYYY-MM-DD)
		return `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
	} catch {
		return undefined;
	}
}

/**
 * Try to infer date from existing album name (low confidence)
 * Looks for patterns like: 2025, 09-12-2022, 2022-09-12
 */
function inferDateFromName(name: string): string | undefined {
	// Try ISO date: YYYY-MM-DD
	const isoMatch = name.match(/(\d{4})-(\d{2})-(\d{2})/);
	if (isoMatch) {
		return isoMatch[0];
	}

	// Try US date: MM-DD-YYYY
	const usMatch = name.match(/(\d{2})-(\d{2})-(\d{4})/);
	if (usMatch) {
		return `${usMatch[3]}-${usMatch[1]}-${usMatch[2]}`;
	}

	// Try year only: YYYY (but only if 2000-2099)
	const yearMatch = name.match(/\b(20\d{2})\b/);
	if (yearMatch) {
		return `${yearMatch[1]}-01-01`; // Use January 1st as placeholder
	}

	return undefined;
}

/**
 * Calculate drift score: how different is proposed name from existing
 * Score: 0 = identical, 100 = completely different
 */
function calculateDriftScore(
	existingName: string,
	proposedName: string
): { score: number; changes: string[] } {
	const changes: string[] = [];

	// Normalize for comparison
	const existing = existingName.toLowerCase().trim();
	const proposed = proposedName.toLowerCase().trim();

	// Exact match
	if (existing === proposed) {
		return { score: 0, changes: [] };
	}

	let score = 0;

	// Check length difference
	const lengthDiff = Math.abs(existing.length - proposed.length);
	const lengthDiffPercent = lengthDiff / Math.max(existing.length, proposed.length);
	score += lengthDiffPercent * 20; // Up to 20 points for length difference

	if (lengthDiff > 10) {
		changes.push(`Length changed by ${lengthDiff} characters`);
	}

	// Check if sport prefix removed
	if (/^(hs|ms|college|men's|women's|pro|vb|volleyball|basketball)\s/i.test(existing) &&
		!/^(hs|ms|college|men's|women's|pro|vb|volleyball|basketball)\s/i.test(proposed)) {
		score += 15;
		changes.push('Removed sport/level prefix');
	}

	// Check if date format changed
	const existingHasISODate = /\d{4}-\d{2}-\d{2}/.test(existing);
	const proposedHasISODate = /\d{4}-\d{2}-\d{2}/.test(proposed);

	if (existingHasISODate && !proposedHasISODate) {
		score += 10;
		changes.push('Date format changed from ISO to readable');
	}

	// Check if year format changed (YYYY → Mon YYYY)
	const existingHasYear = /\b(20\d{2})\b/.test(existing);
	const proposedHasMonthYear = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}/i.test(proposed);

	if (existingHasYear && proposedHasMonthYear) {
		score += 5;
		changes.push('Date format enhanced with month');
	}

	// Check Levenshtein distance for semantic similarity
	const distance = levenshteinDistance(existing, proposed);
	const maxLen = Math.max(existing.length, proposed.length);
	const similarity = 1 - distance / maxLen;
	score += (1 - similarity) * 40; // Up to 40 points for text changes

	if (similarity < 0.7) {
		changes.push('Significant text changes detected');
	}

	// Check if team names preserved (high confidence indicator)
	const existingVs = existing.includes(' vs ');
	const proposedVs = proposed.includes(' vs ');

	if (existingVs && proposedVs) {
		score -= 10; // Reduce score if vs matchup structure preserved
		changes.push('Matchup structure preserved');
	}

	// Cap score at 100
	score = Math.min(100, Math.max(0, score));

	return { score: Math.round(score), changes };
}

/**
 * Levenshtein distance (edit distance) between two strings
 */
function levenshteinDistance(a: string, b: string): number {
	const matrix: number[][] = [];

	for (let i = 0; i <= b.length; i++) {
		matrix[i] = [i];
	}

	for (let j = 0; j <= a.length; j++) {
		matrix[0][j] = j;
	}

	for (let i = 1; i <= b.length; i++) {
		for (let j = 1; j <= a.length; j++) {
			if (b.charAt(i - 1) === a.charAt(j - 1)) {
				matrix[i][j] = matrix[i - 1][j - 1];
			} else {
				matrix[i][j] = Math.min(
					matrix[i - 1][j - 1] + 1, // substitution
					matrix[i][j - 1] + 1, // insertion
					matrix[i - 1][j] + 1 // deletion
				);
			}
		}
	}

	return matrix[b.length][a.length];
}

/**
 * Generate canonical album name from metadata (LEGACY METHOD)
 *
 * @deprecated Use generateCanonicalNameFromSmugMug() instead for new code
 */
export function generateCanonicalName(input: AlbumNameInput): CanonicalNameResult {
	const parts: string[] = [];
	let isMatchup = false;
	let isMultiDay = false;

	// 1. Event or Teams (PRIMARY identifier)
	if (input.teams) {
		// Matchup format: "Team A vs Team B"
		const homeTeam = cleanTeamName(input.teams.home);
		const awayTeam = cleanTeamName(input.teams.away);
		parts.push(`${homeTeam} vs ${awayTeam}`);
		isMatchup = true;
	} else if (input.eventName) {
		// Event format: "Event Name"
		const cleanEvent = cleanEventName(input.eventName, input.sportType);
		parts.push(cleanEvent);
	} else if (input.currentName) {
		// Parse from existing name
		const parsed = parseExistingName(input.currentName);
		if (parsed.teams) {
			parts.push(`${parsed.teams.home} vs ${parsed.teams.away}`);
			isMatchup = true;
		} else if (parsed.event) {
			parts.push(parsed.event);
		}
	}

	// 2. Date (SECONDARY differentiator)
	const earliest = input.earliestPhotoDate;
	const latest = input.latestPhotoDate || earliest;

	if (latest) {
		const canonicalDate = formatCanonicalDate(earliest, latest);
		if (canonicalDate) {
			parts.push(canonicalDate);
			isMultiDay = earliest !== latest;
		}
	}

	let proposed = parts.join(' - ');

	// 3. Apply smart truncation if needed
	const { name: truncatedName, truncated } = truncateIfNeeded(proposed, MAX_LENGTH_HARD);

	return {
		name: truncatedName,
		length: truncatedName.length,
		truncated,
		components: {
			event: parts[0] || '',
			date: parts[1] || '',
		},
		metadata: {
			isMatchup,
			isMultiDay,
			dateSource: 'fallback', // Legacy method doesn't track source
			confidence: 'medium', // Legacy method has medium confidence
		},
	};
}

/**
 * Clean team name by removing redundant prefixes
 */
function cleanTeamName(team: string): string {
	return team
		.trim()
		.replace(/^(hs|ms|college|men's|women's|boys|girls|pro)\s+/i, '')
		.replace(/\s+(volleyball|vb|basketball|soccer|football|baseball|softball|track)\s*$/i, '')
		.trim();
}

/**
 * Clean event name by removing redundant words and sport prefixes
 */
function cleanEventName(event: string, sport?: string): string {
	let cleaned = event
		.trim()
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

	// Shorten verbose event types for scanability
	cleaned = cleaned
		.replace(/\bchampionship\b/gi, 'Champ')
		.replace(/\binvitational\b/gi, 'Invite')
		.replace(/\btournament\b/gi, 'Tourney')
		.replace(/\bpicture day\b/gi, '')
		.replace(/\s+photos?\s*$/i, ''); // Remove trailing "photos"

	return cleaned.trim();
}

/**
 * Format date for canonical album names
 * Single-day: "May 30"
 * Multi-day: "May 2024"
 */
function formatCanonicalDate(earliest: string | undefined, latest: string | undefined): string {
	if (!latest) return '';

	// Parse as UTC to avoid timezone shifts
	const [year, month, day] = latest.split('-').map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));

	const monthNames = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	];
	const monthName = monthNames[date.getUTCMonth()];
	const dayNum = date.getUTCDate();
	const yearNum = date.getUTCFullYear();

	// Single day event
	if (earliest === latest) {
		return `${monthName} ${dayNum}`;
	}

	// Multi-day event
	return `${monthName} ${yearNum}`;
}

/**
 * Parse existing album name to extract components
 */
function parseExistingName(name: string): {
	teams?: { home: string; away: string };
	event?: string;
} {
	// First strip common prefixes from the entire name
	let cleanedName = name
		.replace(/^(hs|ms|college|men's|women's|boys|girls|pro)\s+/i, '')
		.replace(/^(vb|volleyball|basketball|soccer|football|baseball|softball|track)\s+[-–]?\s*/i, '')
		.trim();

	// Try to extract matchup
	const vsMatch = cleanedName.match(/(.+?)\s+vs\.?\s+(.+?)(?:\s+[-–]\s+|\s+\d{4}|$)/i);
	if (vsMatch) {
		return {
			teams: {
				home: cleanTeamName(vsMatch[1]),
				away: cleanTeamName(vsMatch[2]),
			},
		};
	}

	// Otherwise treat as event
	const eventName = cleanEventName(cleanedName);
	if (eventName.length > 3) {
		return { event: eventName };
	}

	return {};
}

/**
 * Smart truncation that preserves meaning
 */
function truncateIfNeeded(
	name: string,
	maxLength: number
): { name: string; truncated: boolean } {
	if (name.length <= maxLength) {
		return { name, truncated: false };
	}

	const parts = name.split(' - ');

	if (parts.length <= 1) {
		// Simple name, hard truncate
		return { name: name.substring(0, maxLength - 3) + '...', truncated: true };
	}

	// Try shortening event/team names while keeping date
	const date = parts[parts.length - 1];
	const availableForContent = maxLength - date.length - 3; // " - "

	if (availableForContent > 20) {
		const content = parts.slice(0, -1).join(' - ');
		if (content.length > availableForContent) {
			return { name: `${content.substring(0, availableForContent - 3)}... - ${date}`, truncated: true };
		}
	}

	// Last resort
	return { name: name.substring(0, maxLength - 3) + '...', truncated: true };
}

/**
 * Validate if a proposed name meets quality standards
 */
export function validateCanonicalName(name: string): {
	valid: boolean;
	warnings: string[];
	errors: string[];
} {
	const warnings: string[] = [];
	const errors: string[] = [];

	if (name.length > MAX_LENGTH_HARD) {
		errors.push(`Name exceeds maximum length (${name.length} > ${MAX_LENGTH_HARD})`);
	}

	if (name.length > MAX_LENGTH_IDEAL) {
		warnings.push(`Name over ideal length (${name.length} > ${MAX_LENGTH_IDEAL}), will wrap`);
	}

	if (name.includes('  ')) {
		errors.push('Name contains double spaces');
	}

	if (name.match(/\d{4}-\d{2}-\d{2}/)) {
		warnings.push('Name contains ISO date format (should use "Mon DD" or "Mon YYYY")');
	}

	// Check for common redundant prefixes
	const redundantPrefixes = ['HS VB', 'College VB', 'Volleyball -', 'Basketball -'];
	for (const prefix of redundantPrefixes) {
		if (name.includes(prefix)) {
			warnings.push(`Name contains redundant prefix: "${prefix}"`);
		}
	}

	return {
		valid: errors.length === 0,
		warnings,
		errors,
	};
}

/**
 * Generate canonical name from SmugMug album data (LEGACY WRAPPER)
 *
 * @deprecated Use generateCanonicalNameFromSmugMug() with full SmugMugAlbumData instead
 */
export function fromSmugMugAlbum(albumData: {
	name: string;
	keywords?: string[];
	earliestDate?: string;
	latestDate?: string;
}): CanonicalNameResult {
	// Extract sport from keywords if available
	const sportKeywords = ['volleyball', 'basketball', 'soccer', 'football'];
	const sport = albumData.keywords?.find((k) =>
		sportKeywords.includes(k.toLowerCase())
	);

	// Use legacy method for backward compatibility
	return generateCanonicalName({
		currentName: albumData.name,
		sportType: sport,
		earliestPhotoDate: albumData.earliestDate,
		latestPhotoDate: albumData.latestDate,
	});
}
