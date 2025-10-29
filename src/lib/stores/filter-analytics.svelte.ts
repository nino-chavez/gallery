/**
 * Filter Analytics Store
 *
 * Tracks filter usage statistics for insights and optimization.
 * Helps identify most-used filters and popular combinations.
 *
 * Features:
 * - Track individual filter usage counts
 * - Track filter combination patterns
 * - Session-based vs. all-time stats
 * - Lightweight (no external analytics service)
 * - Privacy-friendly (local storage only)
 */

export interface FilterUsageStats {
	// Individual filter counts
	sports: Record<string, number>;
	categories: Record<string, number>;
	playTypes: Record<string, number>;
	intensities: Record<string, number>;
	lighting: Record<string, number>;
	colorTemps: Record<string, number>;
	timesOfDay: Record<string, number>;
	compositions: Record<string, number>;

	// Combination patterns (top 10)
	combinations: Array<{
		filters: string[];
		count: number;
	}>;

	// Session stats
	sessionStartedAt: number;
	filterChanges: number;
	totalSessions: number;
}

const STORAGE_KEY = 'gallery_filter_analytics';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

class FilterAnalyticsStore {
	private stats = $state<FilterUsageStats>({
		sports: {},
		categories: {},
		playTypes: {},
		intensities: {},
		lighting: {},
		colorTemps: {},
		timesOfDay: {},
		compositions: {},
		combinations: [],
		sessionStartedAt: Date.now(),
		filterChanges: 0,
		totalSessions: 0,
	});

	constructor() {
		this.loadFromStorage();
		this.checkSession();
	}

	// Track a filter selection
	trackFilter(type: string, value: string): void {
		const key = type as keyof Omit<FilterUsageStats, 'combinations' | 'sessionStartedAt' | 'filterChanges' | 'totalSessions'>;

		if (this.stats[key]) {
			const currentCount = this.stats[key][value] || 0;
			this.stats[key][value] = currentCount + 1;
		}

		this.stats.filterChanges++;
		this.saveToStorage();
	}

	// Track a filter combination
	trackCombination(filters: Record<string, string | string[]>): void {
		// Create a sorted array of filter strings
		const filterStrings: string[] = [];

		Object.entries(filters).forEach(([key, value]) => {
			if (value) {
				if (Array.isArray(value)) {
					value.forEach(v => filterStrings.push(`${key}:${v}`));
				} else {
					filterStrings.push(`${key}:${value}`);
				}
			}
		});

		filterStrings.sort();

		// Find or create combination entry
		const existingIndex = this.stats.combinations.findIndex(
			combo => JSON.stringify(combo.filters) === JSON.stringify(filterStrings)
		);

		if (existingIndex !== -1) {
			this.stats.combinations[existingIndex].count++;
		} else {
			this.stats.combinations.push({
				filters: filterStrings,
				count: 1,
			});
		}

		// Sort by count and keep top 20
		this.stats.combinations.sort((a, b) => b.count - a.count);
		this.stats.combinations = this.stats.combinations.slice(0, 20);

		this.saveToStorage();
	}

	// Get top N filters by type
	getTopFilters(
		type: keyof Omit<FilterUsageStats, 'combinations' | 'sessionStartedAt' | 'filterChanges' | 'totalSessions'>,
		limit: number = 5
	): Array<{ value: string; count: number }> {
		const filterStats = this.stats[type];
		return Object.entries(filterStats)
			.map(([value, count]) => ({ value, count: count as number }))
			.sort((a, b) => b.count - a.count)
			.slice(0, limit);
	}

	// Get top filter combinations
	getTopCombinations(limit: number = 10): Array<{
		filters: string[];
		count: number;
		description: string;
	}> {
		return this.stats.combinations.slice(0, limit).map(combo => ({
			...combo,
			description: this.describeCombination(combo.filters),
		}));
	}

	// Get session stats
	get sessionStats() {
		return {
			duration: Date.now() - this.stats.sessionStartedAt,
			filterChanges: this.stats.filterChanges,
			totalSessions: this.stats.totalSessions,
		};
	}

	// Get all-time stats summary
	get summary() {
		const totalFilterUsage =
			Object.values(this.stats.sports).reduce((sum, count) => sum + count, 0) +
			Object.values(this.stats.categories).reduce((sum, count) => sum + count, 0) +
			Object.values(this.stats.playTypes).reduce((sum, count) => sum + count, 0) +
			Object.values(this.stats.intensities).reduce((sum, count) => sum + count, 0) +
			Object.values(this.stats.lighting).reduce((sum, count) => sum + count, 0) +
			Object.values(this.stats.colorTemps).reduce((sum, count) => sum + count, 0) +
			Object.values(this.stats.timesOfDay).reduce((sum, count) => sum + count, 0) +
			Object.values(this.stats.compositions).reduce((sum, count) => sum + count, 0);

		return {
			totalFilterUsage,
			totalSessions: this.stats.totalSessions,
			avgFiltersPerSession: this.stats.totalSessions > 0
				? Math.round(totalFilterUsage / this.stats.totalSessions)
				: 0,
			mostUsedSport: this.getTopFilters('sports', 1)[0]?.value || null,
			mostUsedCategory: this.getTopFilters('categories', 1)[0]?.value || null,
		};
	}

	// Reset analytics data
	reset(): void {
		this.stats = {
			sports: {},
			categories: {},
			playTypes: {},
			intensities: {},
			lighting: {},
			colorTemps: {},
			timesOfDay: {},
			compositions: {},
			combinations: [],
			sessionStartedAt: Date.now(),
			filterChanges: 0,
			totalSessions: 1,
		};
		this.saveToStorage();
	}

	// Export analytics data (for debugging or analysis)
	exportData(): string {
		return JSON.stringify({
			...this.stats,
			summary: this.summary,
			topCombinations: this.getTopCombinations(10),
		}, null, 2);
	}

	// Describe a combination in human-readable format
	private describeCombination(filters: string[]): string {
		return filters
			.map(f => {
				const [type, value] = f.split(':');
				return this.formatFilterValue(type, value);
			})
			.join(' + ');
	}

	// Format filter value for display
	private formatFilterValue(type: string, value: string): string {
		const labelMaps: Record<string, Record<string, string>> = {
			sport: { volleyball: 'Volleyball', basketball: 'Basketball' },
			category: { action: 'Action', celebration: 'Celebration', candid: 'Candid' },
			playType: { attack: 'Attack', block: 'Block', dig: 'Dig', set: 'Set', serve: 'Serve' },
			intensity: { low: 'Low', medium: 'Medium', high: 'High', peak: 'Peak' },
			lighting: { natural: 'Natural', backlit: 'Backlit', dramatic: 'Dramatic', soft: 'Soft', artificial: 'Artificial' },
			colorTemp: { warm: 'Warm', neutral: 'Neutral', cool: 'Cool' },
			timeOfDay: { golden_hour: 'Golden Hour', midday: 'Midday', evening: 'Evening', night: 'Night' },
			composition: {
				rule_of_thirds: 'Rule of Thirds',
				leading_lines: 'Leading Lines',
				centered: 'Centered',
				symmetry: 'Symmetry',
				frame_within_frame: 'Framed',
			},
		};

		const map = labelMaps[type];
		return map && map[value] ? map[value] : value;
	}

	// Check if session has timed out and start new session
	private checkSession(): void {
		const timeSinceStart = Date.now() - this.stats.sessionStartedAt;

		if (timeSinceStart > SESSION_TIMEOUT) {
			// Start new session
			this.stats.totalSessions++;
			this.stats.sessionStartedAt = Date.now();
			this.stats.filterChanges = 0;
			this.saveToStorage();
		}
	}

	// Load from localStorage
	private loadFromStorage(): void {
		if (typeof window === 'undefined') return;

		try {
			const data = localStorage.getItem(STORAGE_KEY);
			if (data) {
				const loaded = JSON.parse(data);
				this.stats = {
					...this.stats,
					...loaded,
				};
			}
		} catch (error) {
			console.error('[FilterAnalytics] Failed to load from storage:', error);
		}
	}

	// Save to localStorage
	private saveToStorage(): void {
		if (typeof window === 'undefined') return;

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stats));
		} catch (error) {
			console.error('[FilterAnalytics] Failed to save to storage:', error);
		}
	}
}

// Export singleton instance
export const filterAnalytics = new FilterAnalyticsStore();
