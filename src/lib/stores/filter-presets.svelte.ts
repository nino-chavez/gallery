/**
 * Filter Presets Store
 *
 * Manages pre-configured filter combinations for quick access.
 * Examples: "Action Shots", "Golden Hour", "High Intensity"
 *
 * Features:
 * - Predefined presets for common use cases
 * - Custom user presets (saved to localStorage)
 * - Preset sharing (via URL)
 * - Recent presets tracking
 *
 * IMPORTANT: Icons use Lucide icon names (strings), not emoji.
 * Resolved in FilterPresetsPanel component.
 */

import type { ComponentType } from 'svelte';

export interface FilterPreset {
	id: string;
	name: string;
	description: string;
	iconName?: string; // Lucide icon name (e.g., 'Zap', 'Sunrise', 'Flame')
	filters: {
		sport?: string | null;
		category?: string | null;
		playType?: string | null;
		intensity?: string | null;
		lighting?: string[] | null;
		colorTemp?: string | null;
		timeOfDay?: string | null;
		composition?: string | null;
	};
	isCustom?: boolean;
	createdAt?: number;
}

// Predefined presets with Lucide icon names
export const PREDEFINED_PRESETS: FilterPreset[] = [
	{
		id: 'action-shots',
		name: 'Action Shots',
		description: 'High-intensity volleyball action',
		iconName: 'Zap',
		filters: {
			sport: 'volleyball',
			category: 'action',
			intensity: 'peak',
		},
	},
	{
		id: 'golden-hour',
		name: 'Golden Hour',
		description: 'Warm, natural lighting photos',
		iconName: 'Sunrise',
		filters: {
			timeOfDay: 'golden_hour',
			colorTemp: 'warm',
			lighting: ['natural'],
		},
	},
	{
		id: 'high-intensity',
		name: 'High Intensity',
		description: 'Peak action moments',
		iconName: 'Flame',
		filters: {
			intensity: 'peak',
			playType: 'attack',
		},
	},
	{
		id: 'dramatic-lighting',
		name: 'Dramatic Lighting',
		description: 'High-contrast, dramatic shots',
		iconName: 'Lightbulb',
		filters: {
			lighting: ['dramatic', 'backlit'],
			intensity: 'high',
		},
	},
	{
		id: 'celebration',
		name: 'Celebrations',
		description: 'Joyful celebration moments',
		iconName: 'Award',
		filters: {
			category: 'celebration',
			composition: 'centered',
		},
	},
	{
		id: 'rule-of-thirds',
		name: 'Composed Shots',
		description: 'Well-composed, rule of thirds',
		iconName: 'Grid3x3',
		filters: {
			composition: 'rule_of_thirds',
		},
	},
];

const STORAGE_KEY = 'gallery_filter_presets';
const RECENT_KEY = 'gallery_recent_presets';

class FilterPresetsStore {
	private customPresets = $state<FilterPreset[]>([]);
	private recentPresets = $state<string[]>([]); // preset IDs

	constructor() {
		this.loadFromStorage();
	}

	// Get all presets (predefined + custom)
	get all(): FilterPreset[] {
		return [...PREDEFINED_PRESETS, ...this.customPresets];
	}

	// Get predefined presets only
	get predefined(): FilterPreset[] {
		return PREDEFINED_PRESETS;
	}

	// Get custom presets only
	get custom(): FilterPreset[] {
		return this.customPresets;
	}

	// Get recent presets (ordered by usage)
	get recent(): FilterPreset[] {
		return this.recentPresets
			.map(id => this.all.find(p => p.id === id))
			.filter((p): p is FilterPreset => p !== undefined)
			.slice(0, 5); // Top 5 recent
	}

	// Save a custom preset
	savePreset(preset: Omit<FilterPreset, 'id' | 'isCustom' | 'createdAt'>): FilterPreset {
		const newPreset: FilterPreset = {
			...preset,
			id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			isCustom: true,
			createdAt: Date.now(),
		};

		this.customPresets = [...this.customPresets, newPreset];
		this.saveToStorage();

		return newPreset;
	}

	// Delete a custom preset
	deletePreset(id: string): boolean {
		const preset = this.customPresets.find(p => p.id === id);
		if (!preset) return false;

		this.customPresets = this.customPresets.filter(p => p.id !== id);
		this.recentPresets = this.recentPresets.filter(pid => pid !== id);
		this.saveToStorage();

		return true;
	}

	// Get a preset by ID
	getPreset(id: string): FilterPreset | undefined {
		return this.all.find(p => p.id === id);
	}

	// Track preset usage (for recent list)
	trackUsage(id: string): void {
		// Remove if already in list
		this.recentPresets = this.recentPresets.filter(pid => pid !== id);
		// Add to front
		this.recentPresets = [id, ...this.recentPresets].slice(0, 10); // Keep max 10
		this.saveToStorage();
	}

	// Apply a preset (returns filters object)
	applyPreset(id: string): FilterPreset['filters'] | null {
		const preset = this.getPreset(id);
		if (!preset) return null;

		this.trackUsage(id);
		return preset.filters;
	}

	// Check if current filters match a preset
	matchesPreset(currentFilters: FilterPreset['filters']): FilterPreset | null {
		return this.all.find(preset => {
			const pf = preset.filters;
			return (
				pf.sport === currentFilters.sport &&
				pf.category === currentFilters.category &&
				pf.playType === currentFilters.playType &&
				pf.intensity === currentFilters.intensity &&
				JSON.stringify(pf.lighting?.sort()) === JSON.stringify(currentFilters.lighting?.sort()) &&
				pf.colorTemp === currentFilters.colorTemp &&
				pf.timeOfDay === currentFilters.timeOfDay &&
				pf.composition === currentFilters.composition
			);
		}) || null;
	}

	// Create a shareable URL from a preset
	createShareableURL(presetId: string, baseUrl: string = '/explore'): string | null {
		const preset = this.getPreset(presetId);
		if (!preset) return null;

		const params = new URLSearchParams();
		const filters = preset.filters;

		if (filters.sport) params.set('sport', filters.sport);
		if (filters.category) params.set('category', filters.category);
		if (filters.playType) params.set('play_type', filters.playType);
		if (filters.intensity) params.set('intensity', filters.intensity);
		if (filters.lighting && filters.lighting.length > 0) {
			filters.lighting.forEach(l => params.append('lighting', l));
		}
		if (filters.colorTemp) params.set('color_temp', filters.colorTemp);
		if (filters.timeOfDay) params.set('time_of_day', filters.timeOfDay);
		if (filters.composition) params.set('composition', filters.composition);

		return `${baseUrl}?${params.toString()}`;
	}

	// Create a preset from current filters
	createFromCurrentFilters(
		currentFilters: FilterPreset['filters'],
		name: string,
		description: string
	): FilterPreset {
		return this.savePreset({
			name,
			description,
			filters: currentFilters,
		});
	}

	// Load from localStorage
	private loadFromStorage(): void {
		if (typeof window === 'undefined') return;

		try {
			const customData = localStorage.getItem(STORAGE_KEY);
			if (customData) {
				this.customPresets = JSON.parse(customData);
			}

			const recentData = localStorage.getItem(RECENT_KEY);
			if (recentData) {
				this.recentPresets = JSON.parse(recentData);
			}
		} catch (error) {
			console.error('[FilterPresets] Failed to load from storage:', error);
		}
	}

	// Save to localStorage
	private saveToStorage(): void {
		if (typeof window === 'undefined') return;

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.customPresets));
			localStorage.setItem(RECENT_KEY, JSON.stringify(this.recentPresets));
		} catch (error) {
			console.error('[FilterPresets] Failed to save to storage:', error);
		}
	}

	// Clear all custom presets
	clearCustomPresets(): void {
		this.customPresets = [];
		this.saveToStorage();
	}

	// Clear recent history
	clearRecentHistory(): void {
		this.recentPresets = [];
		this.saveToStorage();
	}
}

// Export singleton instance
export const filterPresets = new FilterPresetsStore();
