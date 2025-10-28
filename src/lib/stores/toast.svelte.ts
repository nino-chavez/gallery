/**
 * Toast Store
 *
 * Manages toast notifications globally across the application.
 *
 * Usage:
 * ```typescript
 * import { toast } from '$lib/stores/toast.svelte';
 *
 * // Show success toast
 * toast.success('Photo added to favorites!', { duration: 3000 });
 *
 * // Show error toast
 * toast.error('Failed to save photo', { duration: 5000 });
 *
 * // Show custom toast
 * toast.show({
 *   message: 'Processing...',
 *   variant: 'info',
 *   icon: LoaderCircle,
 *   duration: 0 // No auto-dismiss
 * });
 * ```
 */

import type { ComponentType } from 'svelte';

export interface ToastOptions {
	variant?: 'success' | 'error' | 'info' | 'warning';
	icon?: ComponentType;
	duration?: number;
}

export interface ToastItem extends ToastOptions {
	id: string;
	message: string;
}

class ToastStore {
	private toasts = $state<ToastItem[]>([]);
	private nextId = 0;

	/**
	 * Get all active toasts
	 */
	get items(): ToastItem[] {
		return this.toasts;
	}

	/**
	 * Show a toast notification
	 */
	show(message: string, options: ToastOptions = {}): string {
		const id = `toast-${this.nextId++}`;
		const toast: ToastItem = {
			id,
			message,
			variant: options.variant ?? 'info',
			icon: options.icon,
			duration: options.duration ?? 3000
		};

		this.toasts = [...this.toasts, toast];

		// Auto-remove after duration (if specified)
		if (toast.duration && toast.duration > 0) {
			setTimeout(() => this.remove(id), toast.duration + 500); // +500ms for exit animation
		}

		return id;
	}

	/**
	 * Show success toast (convenience method)
	 */
	success(message: string, options: Omit<ToastOptions, 'variant'> = {}): string {
		return this.show(message, { ...options, variant: 'success' });
	}

	/**
	 * Show error toast (convenience method)
	 */
	error(message: string, options: Omit<ToastOptions, 'variant'> = {}): string {
		return this.show(message, { ...options, variant: 'error' });
	}

	/**
	 * Show info toast (convenience method)
	 */
	info(message: string, options: Omit<ToastOptions, 'variant'> = {}): string {
		return this.show(message, { ...options, variant: 'info' });
	}

	/**
	 * Show warning toast (convenience method)
	 */
	warning(message: string, options: Omit<ToastOptions, 'variant'> = {}): string {
		return this.show(message, { ...options, variant: 'warning' });
	}

	/**
	 * Remove a specific toast
	 */
	remove(id: string): void {
		this.toasts = this.toasts.filter((t) => t.id !== id);
	}

	/**
	 * Clear all toasts
	 */
	clear(): void {
		this.toasts = [];
	}
}

/**
 * Global toast store instance
 */
export const toast = new ToastStore();
