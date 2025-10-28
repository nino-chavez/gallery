/**
 * Onboarding Store
 *
 * Manages first-use tooltips and educational overlays using localStorage.
 * Ensures users only see onboarding content once per feature.
 *
 * Usage:
 * ```typescript
 * import { onboarding } from '$lib/stores/onboarding.svelte';
 *
 * // Check if should show
 * if (onboarding.shouldShow('visual-data-layers')) {
 *   // Show tooltip
 * }
 *
 * // Mark as shown
 * onboarding.markShown('visual-data-layers');
 * ```
 *
 * Design Principle: Progressive Disclosure
 * - Show educational content once
 * - Respect user dismissals
 * - No annoying repeat tooltips
 */

const STORAGE_KEY = 'gallery-onboarding-shown';

interface OnboardingKeys {
	'visual-data-layers': boolean;
	'find-similar': boolean;
	'emotion-filters': boolean;
	'quality-filters': boolean;
	'composition-overlays': boolean;
}

type OnboardingKey = keyof OnboardingKeys;

/**
 * Load shown state from localStorage
 */
function loadShown(): Set<OnboardingKey> {
	if (typeof window === 'undefined') return new Set();

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return new Set();

		const parsed = JSON.parse(stored);
		return new Set(Array.isArray(parsed) ? parsed : []);
	} catch (error) {
		console.warn('[Onboarding] Failed to load shown state:', error);
		return new Set();
	}
}

/**
 * Save shown state to localStorage
 */
function saveShown(shown: Set<OnboardingKey>): void {
	if (typeof window === 'undefined') return;

	try {
		const array = Array.from(shown);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(array));
	} catch (error) {
		console.warn('[Onboarding] Failed to save shown state:', error);
	}
}

/**
 * Onboarding store class
 */
class OnboardingStore {
	private shown = $state<Set<OnboardingKey>>(loadShown());

	/**
	 * Check if onboarding should be shown for a key
	 */
	shouldShow(key: OnboardingKey): boolean {
		return !this.shown.has(key);
	}

	/**
	 * Mark onboarding as shown for a key
	 */
	markShown(key: OnboardingKey): void {
		this.shown.add(key);
		saveShown(this.shown);
	}

	/**
	 * Reset a specific onboarding item (for testing)
	 */
	reset(key: OnboardingKey): void {
		this.shown.delete(key);
		saveShown(this.shown);
	}

	/**
	 * Reset all onboarding (for testing)
	 */
	resetAll(): void {
		this.shown.clear();
		saveShown(this.shown);
	}

	/**
	 * Get all shown keys (for debugging)
	 */
	getShown(): OnboardingKey[] {
		return Array.from(this.shown);
	}
}

/**
 * Global onboarding store instance
 */
export const onboarding = new OnboardingStore();
