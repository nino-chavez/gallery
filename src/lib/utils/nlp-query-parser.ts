/**
 * NLP Query Parser
 *
 * Converts natural language search queries into filter parameters.
 * Example: "blocks at golden hour" → { play_type: "block", time_of_day: "golden_hour" }
 */

export interface ParsedFilters {
	sport?: string;
	category?: string;
	play_type?: string;
	action_intensity?: string;
	lighting?: string[];
	color_temperature?: string;
	time_of_day?: string;
	composition?: string;
}

// Keyword mappings for each filter type
const KEYWORD_MAPPINGS = {
	// Sport types
	sport: {
		volleyball: ['volleyball', 'vball', 'volley'],
		basketball: ['basketball', 'bball', 'hoops'],
		soccer: ['soccer', 'football'],
		football: ['football', 'american football'],
	},

	// Photo categories
	category: {
		action: ['action', 'gameplay', 'playing', 'game'],
		celebration: ['celebration', 'celebrate', 'celebrating', 'victory', 'win', 'won'],
		candid: ['candid', 'portrait', 'closeup', 'close-up', 'face'],
	},

	// Play types
	play_type: {
		attack: ['attack', 'attacking', 'spike', 'spiking', 'hit', 'hitting', 'kill'],
		block: ['block', 'blocking', 'blocker'],
		dig: ['dig', 'digging', 'defense', 'defensive'],
		set: ['set', 'setting', 'setter', 'assist'],
		serve: ['serve', 'serving', 'server', 'service'],
		celebration: ['celebration', 'celebrate'],
	},

	// Action intensity
	action_intensity: {
		low: ['low', 'calm', 'relaxed', 'slow'],
		medium: ['medium', 'moderate'],
		high: ['high', 'intense', 'fast', 'quick'],
		peak: ['peak', 'maximum', 'extreme', 'highest', 'critical', 'crucial'],
	},

	// Lighting
	lighting: {
		natural: ['natural', 'sunlight', 'daylight', 'outdoor'],
		backlit: ['backlit', 'backlight', 'silhouette'],
		dramatic: ['dramatic', 'strong', 'harsh'],
		soft: ['soft', 'gentle', 'diffused'],
		artificial: ['artificial', 'indoor', 'gym', 'arena', 'stadium'],
	},

	// Color temperature
	color_temperature: {
		warm: ['warm', 'orange', 'golden', 'sunset'],
		cool: ['cool', 'blue', 'cold'],
		neutral: ['neutral', 'balanced', 'normal'],
	},

	// Time of day
	time_of_day: {
		morning: ['morning', 'dawn', 'sunrise', 'early'],
		afternoon: ['afternoon', 'midday', 'noon'],
		evening: ['evening', 'dusk', 'sunset'],
		golden_hour: ['golden hour', 'magic hour', 'golden', 'magic'],
		night: ['night', 'nighttime', 'dark'],
	},

	// Composition
	composition: {
		rule_of_thirds: ['rule of thirds', 'thirds'],
		leading_lines: ['leading lines', 'lines'],
		centered: ['centered', 'center', 'central'],
		symmetry: ['symmetry', 'symmetric', 'symmetrical'],
		frame_within_frame: ['frame within frame', 'framed', 'framing'],
	},
};

/**
 * Parse a natural language query into filter parameters
 */
export function parseQuery(query: string): ParsedFilters {
	const filters: ParsedFilters = {};
	const normalizedQuery = query.toLowerCase().trim();

	// Return empty if query is too short
	if (normalizedQuery.length < 2) {
		return filters;
	}

	// Check each filter type
	for (const [filterType, mappings] of Object.entries(KEYWORD_MAPPINGS)) {
		for (const [value, keywords] of Object.entries(mappings)) {
			// Check if any keyword matches
			const matches = keywords.some((keyword) => {
				// Use word boundaries for better matching
				const regex = new RegExp(`\\b${keyword}\\b`, 'i');
				return regex.test(normalizedQuery);
			});

			if (matches) {
				// Lighting can have multiple values
				if (filterType === 'lighting') {
					if (!filters.lighting) {
						filters.lighting = [];
					}
					filters.lighting.push(value);
				} else {
					// @ts-ignore - dynamic property assignment
					filters[filterType] = value;
				}
			}
		}
	}

	return filters;
}

/**
 * Generate example queries for user guidance
 */
export const EXAMPLE_QUERIES = [
	'blocks at golden hour',
	'attack with dramatic lighting',
	'celebration photos',
	'peak intensity action',
	'serve in natural light',
	'dig defense warm colors',
	'set with soft lighting',
	'volleyball at sunset',
	'basketball celebration',
];

/**
 * Get a description of detected filters from a query
 */
export function describeFilters(filters: ParsedFilters): string {
	const parts: string[] = [];

	if (filters.sport) parts.push(filters.sport);
	if (filters.play_type) parts.push(filters.play_type);
	if (filters.action_intensity) parts.push(`${filters.action_intensity} intensity`);
	if (filters.category) parts.push(filters.category);
	if (filters.time_of_day) {
		const timeLabel = filters.time_of_day.replace('_', ' ');
		parts.push(timeLabel);
	}
	if (filters.lighting && filters.lighting.length > 0) {
		parts.push(`${filters.lighting.join('/')} lighting`);
	}
	if (filters.color_temperature) parts.push(`${filters.color_temperature} colors`);
	if (filters.composition) {
		const compLabel = filters.composition.replace(/_/g, ' ');
		parts.push(compLabel);
	}

	return parts.length > 0 ? parts.join(', ') : '';
}
