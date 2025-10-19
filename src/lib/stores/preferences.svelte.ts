/**
 * Gallery User Preferences Store
 *
 * Manages user preferences with localStorage persistence:
 * - Sort preference (newest, oldest, highest_quality, lowest_quality)
 * - View mode (grid, list)
 * - Advanced filters visibility
 *
 * Uses Svelte 5 runes for reactive state management
 */

export type SortOption = 'newest' | 'oldest' | 'highest_quality' | 'lowest_quality';
export type ViewMode = 'grid' | 'list';

interface GalleryPreferences {
	sortBy: SortOption;
	viewMode: ViewMode;
	showAdvancedFilters: boolean;
}

const STORAGE_KEY = 'gallery_preferences';

const DEFAULT_PREFERENCES: GalleryPreferences = {
	sortBy: 'newest',
	viewMode: 'grid',
	showAdvancedFilters: false,
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

	// Reset to defaults
	reset(): void {
		this.prefs = { ...DEFAULT_PREFERENCES };
		savePreferences(this.prefs);
	}
}

// Export singleton instance
export const preferences = new GalleryPreferencesStore();
