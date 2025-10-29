/**
 * Filter History Store
 *
 * Tracks recently used filter combinations for quick re-access.
 * Automatically saves to localStorage and provides quick-access UI.
 *
 * Features:
 * - Tracks up to 10 recent filter combinations
 * - Deduplicates identical filter sets
 * - Persists to localStorage
 * - Provides human-readable descriptions
 */

export interface FilterState {
	sport?: string | null;
	category?: string | null;
	playType?: string | null;
	intensity?: string | null;
	lighting?: string[] | null;
	colorTemp?: string | null;
	timeOfDay?: string | null;
	composition?: string | null;
}

export interface FilterHistoryEntry {
	id: string;
	filters: FilterState;
	timestamp: number;
	description: string; // Human-readable description
}

const STORAGE_KEY = 'gallery_filter_history';
const MAX_HISTORY = 10;

// Label mappings for descriptions
const LABELS = {
	sport: (v: string) => v.charAt(0).toUpperCase() + v.slice(1),
	category: (v: string) => v.charAt(0).toUpperCase() + v.slice(1),
	playType: (v: string) => {
		const map: Record<string, string> = {
			attack: 'Attack',
			block: 'Block',
			dig: 'Dig',
			set: 'Set',
			serve: 'Serve',
		};
		return map[v] || v;
	},
	intensity: (v: string) => {
		const map: Record<string, string> = {
			low: 'Low',
			medium: 'Medium',
			high: 'High',
			peak: 'Peak',
		};
		return map[v] || v;
	},
	lighting: (v: string) => {
		const map: Record<string, string> = {
			natural: 'Natural',
			backlit: 'Backlit',
			dramatic: 'Dramatic',
			soft: 'Soft',
			artificial: 'Artificial',
		};
		return map[v] || v;
	},
	colorTemp: (v: string) => {
		const map: Record<string, string> = {
			warm: 'Warm',
			neutral: 'Neutral',
			cool: 'Cool',
		};
		return map[v] || v;
	},
	timeOfDay: (v: string) => {
		const map: Record<string, string> = {
			golden_hour: 'Golden Hour',
			midday: 'Midday',
			evening: 'Evening',
			night: 'Night',
		};
		return map[v] || v;
	},
	composition: (v: string) => {
		const map: Record<string, string> = {
			rule_of_thirds: 'Rule of Thirds',
			leading_lines: 'Leading Lines',
			centered: 'Centered',
			symmetry: 'Symmetry',
			frame_within_frame: 'Framed',
		};
		return map[v] || v;
	},
};

class FilterHistoryStore {
	private history = $state<FilterHistoryEntry[]>([]);

	constructor() {
		this.loadFromStorage();
	}

	// Get all history entries
	get all(): FilterHistoryEntry[] {
		return this.history;
	}

	// Get recent entries (last 5)
	get recent(): FilterHistoryEntry[] {
		return this.history.slice(0, 5);
	}

	// Add a filter state to history
	addToHistory(filters: FilterState): void {
		// Don't add if no filters are active
		if (this.isEmptyFilterState(filters)) {
			return;
		}

		// Check if identical filter state already exists
		const existingIndex = this.history.findIndex(entry =>
			this.areFiltersEqual(entry.filters, filters)
		);

		// If exists, move to front with updated timestamp
		if (existingIndex !== -1) {
			const existing = this.history[existingIndex];
			this.history.splice(existingIndex, 1);
			this.history.unshift({
				...existing,
				timestamp: Date.now(),
			});
		} else {
			// Add new entry to front
			const newEntry: FilterHistoryEntry = {
				id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				filters,
				timestamp: Date.now(),
				description: this.generateDescription(filters),
			};

			this.history.unshift(newEntry);

			// Keep only MAX_HISTORY entries
			if (this.history.length > MAX_HISTORY) {
				this.history = this.history.slice(0, MAX_HISTORY);
			}
		}

		this.saveToStorage();
	}

	// Remove an entry by ID
	remove(id: string): void {
		this.history = this.history.filter(entry => entry.id !== id);
		this.saveToStorage();
	}

	// Clear all history
	clear(): void {
		this.history = [];
		this.saveToStorage();
	}

	// Generate human-readable description from filters
	private generateDescription(filters: FilterState): string {
		const parts: string[] = [];

		if (filters.sport) {
			parts.push(LABELS.sport(filters.sport));
		}
		if (filters.category) {
			parts.push(LABELS.category(filters.category));
		}
		if (filters.playType) {
			parts.push(LABELS.playType(filters.playType));
		}
		if (filters.intensity) {
			parts.push(`${LABELS.intensity(filters.intensity)} Intensity`);
		}
		if (filters.lighting && filters.lighting.length > 0) {
			const lightingStr = filters.lighting.map(l => LABELS.lighting(l)).join(' + ');
			parts.push(`${lightingStr} Lighting`);
		}
		if (filters.colorTemp) {
			parts.push(`${LABELS.colorTemp(filters.colorTemp)} Tones`);
		}
		if (filters.timeOfDay) {
			parts.push(LABELS.timeOfDay(filters.timeOfDay));
		}
		if (filters.composition) {
			parts.push(LABELS.composition(filters.composition));
		}

		return parts.length > 0 ? parts.join(' • ') : 'Mixed Filters';
	}

	// Check if filter state is empty
	private isEmptyFilterState(filters: FilterState): boolean {
		return (
			!filters.sport &&
			!filters.category &&
			!filters.playType &&
			!filters.intensity &&
			(!filters.lighting || filters.lighting.length === 0) &&
			!filters.colorTemp &&
			!filters.timeOfDay &&
			!filters.composition
		);
	}

	// Compare two filter states for equality
	private areFiltersEqual(a: FilterState, b: FilterState): boolean {
		return (
			a.sport === b.sport &&
			a.category === b.category &&
			a.playType === b.playType &&
			a.intensity === b.intensity &&
			JSON.stringify(a.lighting?.sort()) === JSON.stringify(b.lighting?.sort()) &&
			a.colorTemp === b.colorTemp &&
			a.timeOfDay === b.timeOfDay &&
			a.composition === b.composition
		);
	}

	// Load from localStorage
	private loadFromStorage(): void {
		if (typeof window === 'undefined') return;

		try {
			const data = localStorage.getItem(STORAGE_KEY);
			if (data) {
				this.history = JSON.parse(data);
			}
		} catch (error) {
			console.error('[FilterHistory] Failed to load from storage:', error);
		}
	}

	// Save to localStorage
	private saveToStorage(): void {
		if (typeof window === 'undefined') return;

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
		} catch (error) {
			console.error('[FilterHistory] Failed to save to storage:', error);
		}
	}

	// Get relative time string (e.g., "2 hours ago")
	getRelativeTime(timestamp: number): string {
		const now = Date.now();
		const diff = now - timestamp;
		const seconds = Math.floor(diff / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) return `${days}d ago`;
		if (hours > 0) return `${hours}h ago`;
		if (minutes > 0) return `${minutes}m ago`;
		return 'Just now';
	}
}

// Export singleton instance
export const filterHistory = new FilterHistoryStore();
