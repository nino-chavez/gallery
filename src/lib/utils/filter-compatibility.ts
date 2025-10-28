/**
 * Filter Compatibility Logic - Phase 3 of Intelligent Filter System
 *
 * Implements:
 * - FILTER_DEPENDENCIES matrix for sport-aware filtering
 * - isCompatible() function for dynamic disable states
 * - Filter count-based compatibility detection
 *
 * Design Principles:
 * 1. Transparency: Show disabled options (don't hide)
 * 2. Progressive Disclosure: Show relevant options as context narrows
 * 3. Data-Driven: Use actual result counts to determine compatibility
 */

import type { FilterCounts } from '$lib/supabase/server';

/**
 * Current filter state
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

/**
 * FILTER_DEPENDENCIES: Defines which filters are sport-aware
 *
 * Sport-aware filters show different options based on selected sport:
 * - play_type: Different sports have different play types (spike for volleyball, dunk for basketball)
 * - intensity: Action intensity varies by sport characteristics
 *
 * Sport-agnostic filters work across all sports:
 * - category: All sports have action, celebration, candid, etc.
 * - lighting, color_temp, time_of_day, composition: Photography aesthetics
 */
const FILTER_DEPENDENCIES = {
	// Sport-aware filters (context-dependent)
	play_type: {
		dependsOn: ['sport'] as const,
		sportSpecific: true,
	},
	intensity: {
		dependsOn: ['sport'] as const,
		sportSpecific: false, // Intensity exists across sports, but may vary
	},

	// Sport-agnostic filters (universal)
	category: {
		dependsOn: [] as const,
		sportSpecific: false,
	},
	lighting: {
		dependsOn: [] as const,
		sportSpecific: false,
	},
	color_temp: {
		dependsOn: [] as const,
		sportSpecific: false,
	},
	time_of_day: {
		dependsOn: [] as const,
		sportSpecific: false,
	},
	composition: {
		dependsOn: [] as const,
		sportSpecific: false,
	},
} as const;

/**
 * Check if a filter option is compatible with current filter state
 *
 * Compatibility is determined by:
 * 1. Result count > 0 (from filterCounts)
 * 2. Sport-specific rules (e.g., volleyball play types only when volleyball selected)
 *
 * @param filterType - The filter dimension (sport, category, play_type, etc.)
 * @param optionValue - The specific option value to check (e.g., "volleyball", "spike")
 * @param currentState - Current active filters
 * @param filterCounts - Dynamic result counts respecting current filters
 * @returns true if option should be enabled, false if disabled
 */
export function isCompatible(
	filterType: keyof FilterState,
	optionValue: string,
	currentState: FilterState,
	filterCounts: FilterCounts
): boolean {
	// 1. Check result count (primary compatibility check)
	const count = getFilterCount(filterType, optionValue, filterCounts);
	if (count === 0) {
		return false; // Zero results = incompatible
	}

	// 2. Sport-specific compatibility rules
	if (filterType === 'playType') {
		// Play types are sport-specific
		// If a sport is selected, we rely on server-side filtering
		// The filterCounts will already exclude incompatible play types
		// This is handled by Phase 1's smart count fetching
		return true;
	}

	// 3. All other filters are compatible if count > 0
	return true;
}

/**
 * Get result count for a specific filter option
 *
 * @param filterType - The filter dimension
 * @param optionValue - The option value
 * @param filterCounts - Dynamic counts from server
 * @returns Result count (0 if not found)
 */
function getFilterCount(
	filterType: keyof FilterState,
	optionValue: string,
	filterCounts: FilterCounts
): number {
	switch (filterType) {
		case 'sport':
			return filterCounts.sports?.find((s) => s.name === optionValue)?.count || 0;

		case 'category':
			return filterCounts.categories?.find((c) => c.name === optionValue)?.count || 0;

		case 'playType':
			return filterCounts.playTypes?.find((p) => p.name === optionValue)?.count || 0;

		case 'intensity':
			return filterCounts.intensities?.find((i) => i.name === optionValue)?.count || 0;

		case 'lighting':
			return filterCounts.lighting?.find((l) => l.name === optionValue)?.count || 0;

		case 'colorTemp':
			return filterCounts.colorTemperatures?.find((ct) => ct.name === optionValue)?.count || 0;

		case 'timeOfDay':
			return filterCounts.timesOfDay?.find((t) => t.name === optionValue)?.count || 0;

		case 'composition':
			return filterCounts.compositions?.find((c) => c.name === optionValue)?.count || 0;

		default:
			return 0;
	}
}

/**
 * Build current filter state from URL search params or component props
 *
 * @param params - Object with filter values
 * @returns Normalized FilterState
 */
export function buildFilterState(params: {
	sport?: string | null;
	category?: string | null;
	playType?: string | null;
	intensity?: string | null;
	lighting?: string[] | null;
	colorTemp?: string | null;
	timeOfDay?: string | null;
	composition?: string | null;
}): FilterState {
	return {
		sport: params.sport || null,
		category: params.category || null,
		playType: params.playType || null,
		intensity: params.intensity || null,
		lighting: params.lighting || null,
		colorTemp: params.colorTemp || null,
		timeOfDay: params.timeOfDay || null,
		composition: params.composition || null,
	};
}

/**
 * Calculate FilterPill state based on selection and compatibility
 *
 * @param isSelected - Is this option currently selected?
 * @param isCompatible - Is this option compatible with current filters?
 * @returns FilterPill state ('active' | 'available' | 'disabled')
 */
export function getPillState(
	isSelected: boolean,
	isCompatible: boolean
): 'active' | 'available' | 'disabled' {
	if (isSelected) return 'active';
	if (!isCompatible) return 'disabled';
	return 'available';
}

/**
 * Get count to display in FilterPill badge
 *
 * @param filterType - The filter dimension
 * @param optionValue - The option value
 * @param filterCounts - Dynamic counts from server
 * @returns Count to display (undefined if zero or unavailable)
 */
export function getDisplayCount(
	filterType: keyof FilterState,
	optionValue: string,
	filterCounts: FilterCounts
): number | undefined {
	const count = getFilterCount(filterType, optionValue, filterCounts);
	return count > 0 ? count : undefined;
}

/**
 * Check if any filters are currently active
 *
 * @param state - Current filter state
 * @returns true if any filters are active
 */
export function hasActiveFilters(state: FilterState): boolean {
	return !!(
		state.sport ||
		state.category ||
		state.playType ||
		state.intensity ||
		(state.lighting && state.lighting.length > 0) ||
		state.colorTemp ||
		state.timeOfDay ||
		state.composition
	);
}

/**
 * Get count of active filters
 *
 * @param state - Current filter state
 * @returns Number of active filters
 */
export function getActiveFilterCount(state: FilterState): number {
	let count = 0;
	if (state.sport) count++;
	if (state.category) count++;
	if (state.playType) count++;
	if (state.intensity) count++;
	if (state.lighting && state.lighting.length > 0) count += state.lighting.length;
	if (state.colorTemp) count++;
	if (state.timeOfDay) count++;
	if (state.composition) count++;
	return count;
}

/**
 * Auto-clear incompatible filters that would result in zero results
 *
 * Phase 4: Prevents "zero results trap" by intelligently clearing filters
 * when a new selection would create an impossible combination
 *
 * @param newFilter - The filter being changed (e.g., 'sport')
 * @param newValue - The new value for that filter (e.g., 'volleyball')
 * @param currentState - Current filter state
 * @param filterCounts - Dynamic counts with the new filter applied
 * @returns Object with clearedFilters array and updated state
 */
export function autoCleanIncompatibleFilters(
	newFilter: keyof FilterState,
	newValue: string | string[] | null,
	currentState: FilterState,
	filterCounts: FilterCounts
): {
	updatedState: FilterState;
	clearedFilters: Array<{ filter: keyof FilterState; value: string | string[] }>;
} {
	const updatedState = { ...currentState };
	const clearedFilters: Array<{ filter: keyof FilterState; value: string | string[] }> = [];

	// Apply the new filter value
	(updatedState as any)[newFilter] = newValue;

	// Check each active filter for compatibility
	if (updatedState.playType) {
		const count = getFilterCount('playType', updatedState.playType, filterCounts);
		if (count === 0) {
			clearedFilters.push({ filter: 'playType', value: updatedState.playType });
			updatedState.playType = null;
		}
	}

	if (updatedState.intensity) {
		const count = getFilterCount('intensity', updatedState.intensity, filterCounts);
		if (count === 0) {
			clearedFilters.push({ filter: 'intensity', value: updatedState.intensity });
			updatedState.intensity = null;
		}
	}

	if (updatedState.category) {
		const count = getFilterCount('category', updatedState.category, filterCounts);
		if (count === 0) {
			clearedFilters.push({ filter: 'category', value: updatedState.category });
			updatedState.category = null;
		}
	}

	if (updatedState.lighting && updatedState.lighting.length > 0) {
		const incompatibleLighting = updatedState.lighting.filter((l) => {
			const count = getFilterCount('lighting', l, filterCounts);
			return count === 0;
		});

		if (incompatibleLighting.length > 0) {
			clearedFilters.push({ filter: 'lighting', value: incompatibleLighting });
			updatedState.lighting = updatedState.lighting.filter(
				(l) => !incompatibleLighting.includes(l)
			);
			if (updatedState.lighting.length === 0) {
				updatedState.lighting = null;
			}
		}
	}

	if (updatedState.colorTemp) {
		const count = getFilterCount('colorTemp', updatedState.colorTemp, filterCounts);
		if (count === 0) {
			clearedFilters.push({ filter: 'colorTemp', value: updatedState.colorTemp });
			updatedState.colorTemp = null;
		}
	}

	if (updatedState.timeOfDay) {
		const count = getFilterCount('timeOfDay', updatedState.timeOfDay, filterCounts);
		if (count === 0) {
			clearedFilters.push({ filter: 'timeOfDay', value: updatedState.timeOfDay });
			updatedState.timeOfDay = null;
		}
	}

	if (updatedState.composition) {
		const count = getFilterCount('composition', updatedState.composition, filterCounts);
		if (count === 0) {
			clearedFilters.push({ filter: 'composition', value: updatedState.composition });
			updatedState.composition = null;
		}
	}

	return { updatedState, clearedFilters };
}

/**
 * Format cleared filters for user-friendly notification
 *
 * @param clearedFilters - Array of cleared filters
 * @returns Human-readable filter names
 */
export function formatClearedFilters(
	clearedFilters: Array<{ filter: keyof FilterState; value: string | string[] }>
): string[] {
	const filterLabels: Record<keyof FilterState, string> = {
		sport: 'Sport',
		category: 'Category',
		playType: 'Play Type',
		intensity: 'Intensity',
		lighting: 'Lighting',
		colorTemp: 'Color Temperature',
		timeOfDay: 'Time of Day',
		composition: 'Composition',
	};

	return clearedFilters.map((cf) => {
		const label = filterLabels[cf.filter];
		if (Array.isArray(cf.value)) {
			return `${label} (${cf.value.join(', ')})`;
		}
		return `${label}: ${cf.value}`;
	});
}
