/**
 * Accessibility Preferences Store
 *
 * Manages user accessibility preferences with localStorage persistence.
 * Provides "escape hatches" for visual effects that may impact accessibility.
 *
 * Phase 1 Implementation (WCAG Compliance):
 * - Disable quality dimming (for low-vision users)
 * - Always show emotion labels (for color-blind users)
 * - Respect prefers-reduced-motion
 * - High contrast emotion patterns (optional)
 */

import { browser } from '$app/environment';

export interface AccessibilityPreferences {
	/** Disable blur/dimming on low-quality photos (WCAG: Low vision support) */
	disableQualityDimming: boolean;

	/** Always show emotion text labels, not just on hover (WCAG 1.4.1: Use of Color) */
	alwaysShowEmotionLabels: boolean;

	/** Disable animations (respects prefers-reduced-motion) */
	disableAnimations: boolean;

	/** Use high-contrast patterns instead of subtle shadows (WCAG 1.4.3: Contrast) */
	highContrastMode: boolean;

	/** Show quality scores as text overlays */
	showQualityScores: boolean;
}

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
	disableQualityDimming: false,
	alwaysShowEmotionLabels: false,
	disableAnimations: false,
	highContrastMode: false,
	showQualityScores: false
};

const STORAGE_KEY = 'nino-gallery-accessibility-prefs';

/**
 * Accessibility Preferences Store (Svelte 5 Runes)
 *
 * Usage:
 * ```svelte
 * <script>
 *   import { accessibility } from '$lib/stores/accessibility.svelte';
 * </script>
 *
 * {#if accessibility.alwaysShowEmotionLabels}
 *   <span>Always visible emotion label</span>
 * {/if}
 * ```
 */
class AccessibilityStore {
	private prefs = $state<AccessibilityPreferences>({ ...DEFAULT_PREFERENCES });

	constructor() {
		if (browser) {
			this.loadFromStorage();
			this.detectSystemPreferences();
		}
	}

	// Getters for reactive access
	get disableQualityDimming(): boolean {
		return this.prefs.disableQualityDimming;
	}

	get alwaysShowEmotionLabels(): boolean {
		return this.prefs.alwaysShowEmotionLabels;
	}

	get disableAnimations(): boolean {
		return this.prefs.disableAnimations;
	}

	get highContrastMode(): boolean {
		return this.prefs.highContrastMode;
	}

	get showQualityScores(): boolean {
		return this.prefs.showQualityScores;
	}

	// Get all preferences (for settings UI)
	get all(): AccessibilityPreferences {
		return { ...this.prefs };
	}

	/**
	 * Toggle quality dimming on/off
	 */
	toggleQualityDimming(): void {
		this.prefs.disableQualityDimming = !this.prefs.disableQualityDimming;
		this.save();
	}

	/**
	 * Toggle emotion labels visibility
	 */
	toggleEmotionLabels(): void {
		this.prefs.alwaysShowEmotionLabels = !this.prefs.alwaysShowEmotionLabels;
		this.save();
	}

	/**
	 * Toggle animations on/off
	 */
	toggleAnimations(): void {
		this.prefs.disableAnimations = !this.prefs.disableAnimations;
		this.save();
	}

	/**
	 * Toggle high contrast mode
	 */
	toggleHighContrast(): void {
		this.prefs.highContrastMode = !this.prefs.highContrastMode;
		this.save();
	}

	/**
	 * Toggle quality score display
	 */
	toggleQualityScores(): void {
		this.prefs.showQualityScores = !this.prefs.showQualityScores;
		this.save();
	}

	/**
	 * Set a specific preference
	 */
	setPreference<K extends keyof AccessibilityPreferences>(
		key: K,
		value: AccessibilityPreferences[K]
	): void {
		this.prefs[key] = value;
		this.save();
	}

	/**
	 * Reset all preferences to defaults
	 */
	resetToDefaults(): void {
		this.prefs = { ...DEFAULT_PREFERENCES };
		this.save();
		// Re-detect system preferences after reset
		this.detectSystemPreferences();
	}

	/**
	 * Load preferences from localStorage
	 */
	private loadFromStorage(): void {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				this.prefs = { ...DEFAULT_PREFERENCES, ...parsed };
			}
		} catch (error) {
			console.warn('Failed to load accessibility preferences:', error);
		}
	}

	/**
	 * Save preferences to localStorage
	 */
	private save(): void {
		if (!browser) return;

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.prefs));
		} catch (error) {
			console.warn('Failed to save accessibility preferences:', error);
		}
	}

	/**
	 * Detect system accessibility preferences
	 * Automatically enables features based on OS/browser settings
	 */
	private detectSystemPreferences(): void {
		if (!browser) return;

		// Respect prefers-reduced-motion
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion && !this.prefs.disableAnimations) {
			this.prefs.disableAnimations = true;
			this.save();
		}

		// Respect prefers-contrast (high)
		const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;
		if (prefersHighContrast && !this.prefs.highContrastMode) {
			this.prefs.highContrastMode = true;
			this.save();
		}

		// Listen for changes to system preferences
		window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
			if (e.matches) {
				this.prefs.disableAnimations = true;
				this.save();
			}
		});

		window.matchMedia('(prefers-contrast: more)').addEventListener('change', (e) => {
			if (e.matches) {
				this.prefs.highContrastMode = true;
				this.save();
			}
		});
	}
}

/**
 * Global accessibility store instance
 * Import and use throughout the application
 */
export const accessibility = new AccessibilityStore();
