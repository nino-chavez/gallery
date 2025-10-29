/**
 * Gallery User Preferences Store
 *
 * Manages user preferences with localStorage persistence:
 * - Sort preference (quality, newest, oldest, intensity, action)
 * - View mode (grid, list)
 * - Advanced filters visibility
 *
 * Uses Svelte 5 runes for reactive state management
 */

export type SortOption = 'quality' | 'newest' | 'oldest' | 'intensity' | 'action';
export type ViewMode = 'grid' | 'list';

export interface FilterPreset {
	id: string;
	name: string;
	filters: {
		sport?: string;
		category?: string;
		playType?: string;
		intensity?: string;
		lighting?: string[];
		colorTemp?: string;
		timeOfDay?: string;
		composition?: string;
	};
	createdAt: number;
}

export interface RecentFilter {
	filters: FilterPreset['filters'];
	timestamp: number;
}

interface GalleryPreferences {
	sortBy: SortOption;
	viewMode: ViewMode;
	showAdvancedFilters: boolean;
	savedPresets: FilterPreset[];
	recentFilters: RecentFilter[];
}

const STORAGE_KEY = 'gallery_preferences';

const DEFAULT_PREFERENCES: GalleryPreferences = {
	sortBy: 'quality',
	viewMode: 'grid',
	showAdvancedFilters: false,
	savedPresets: [],
	recentFilters: [],
};

/**
 * Load preferences from localStorage
 */
function loadPreferences(): GalleryPreferences {
	if (typeof window === 'undefined') {
		return DEFAULT_PREFERENCES;
	}

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			return {
				...DEFAULT_PREFERENCES,
				...parsed,
			};
		}
	} catch (error) {
		console.warn('[Preferences] Failed to load from localStorage:', error);
	}

	return DEFAULT_PREFERENCES;
}

/**
 * Save preferences to localStorage
 */
function savePreferences(preferences: GalleryPreferences): void {
	if (typeof window === 'undefined') {
		return;
	}

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
	} catch (error) {
		console.warn('[Preferences] Failed to save to localStorage:', error);
	}
}

/**
 * Gallery preferences store with localStorage persistence
 *
 * Usage:
 * ```ts
 * import { preferences } from '$lib/stores/preferences.svelte';
 *
 * // Read preference
 * console.log(preferences.sortBy);
 *
 * // Update preference (automatically persists to localStorage)
 * preferences.setSortBy('highest_quality');
 * ```
 */
class GalleryPreferencesStore {
	private prefs = $state<GalleryPreferences>(loadPreferences());

	// Getters
	get sortBy(): SortOption {
		return this.prefs.sortBy;
	}

	get viewMode(): ViewMode {
		return this.prefs.viewMode;
	}

	get showAdvancedFilters(): boolean {
		return this.prefs.showAdvancedFilters;
	}

	get savedPresets(): FilterPreset[] {
		return this.prefs.savedPresets;
	}

	get recentFilters(): RecentFilter[] {
		return this.prefs.recentFilters;
	}

	// Setters with persistence
	setSortBy(value: SortOption): void {
		this.prefs.sortBy = value;
		savePreferences(this.prefs);
	}

	setViewMode(value: ViewMode): void {
		this.prefs.viewMode = value;
		savePreferences(this.prefs);
	}

	setShowAdvancedFilters(value: boolean): void {
		this.prefs.showAdvancedFilters = value;
		savePreferences(this.prefs);
	}

	// Saved Presets Management
	saveFilterPreset(name: string, filters: FilterPreset['filters']): void {
		const preset: FilterPreset = {
			id: `preset-${Date.now()}`,
			name,
			filters,
			createdAt: Date.now(),
		};

		this.prefs.savedPresets = [...this.prefs.savedPresets, preset];
		savePreferences(this.prefs);
	}

	deleteFilterPreset(id: string): void {
		this.prefs.savedPresets = this.prefs.savedPresets.filter((p) => p.id !== id);
		savePreferences(this.prefs);
	}

	// Recent Filters Management (max 5)
	addRecentFilter(filters: FilterPreset['filters']): void {
		// Skip if filters are empty
		const hasFilters = Object.values(filters).some((v) => v !== undefined && v !== null);
		if (!hasFilters) return;

		// Remove duplicate if exists
		const filtered = this.prefs.recentFilters.filter((rf) =>
			JSON.stringify(rf.filters) !== JSON.stringify(filters)
		);

		// Add to front and keep max 5
		this.prefs.recentFilters = [
			{ filters, timestamp: Date.now() },
			...filtered
		].slice(0, 5);

		savePreferences(this.prefs);
	}

	clearRecentFilters(): void {
		this.prefs.recentFilters = [];
		savePreferences(this.prefs);
	}

	// Reset to defaults
	reset(): void {
		this.prefs = { ...DEFAULT_PREFERENCES };
		savePreferences(this.prefs);
	}
}

// Export singleton instance
export const preferences = new GalleryPreferencesStore();
