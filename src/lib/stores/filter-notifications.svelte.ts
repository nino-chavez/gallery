/**
 * Filter Notifications Store - Phase 4 Implementation
 *
 * Manages notification state for filter auto-clear events
 * Prevents "zero results trap" by alerting users when filters are cleared
 */

interface FilterNotification {
	id: string;
	message: string;
	variant: 'info' | 'warning' | 'success' | 'error';
	duration: number;
	timestamp: number;
}

class FilterNotificationsStore {
	private notifications = $state<FilterNotification[]>([]);
	private nextId = 0;

	get all(): FilterNotification[] {
		return this.notifications;
	}

	/**
	 * Show notification about auto-cleared filters
	 *
	 * @param clearedFilters - Array of filter names that were cleared
	 * @param reason - Why they were cleared (e.g., "incompatible with Volleyball")
	 */
	notifyAutoCleared(clearedFilters: string[], reason: string): void {
		const filterList = clearedFilters.join(', ');
		const message = `Cleared ${filterList} (${reason})`;

		this.add({
			message,
			variant: 'info',
			duration: 5000, // 5 seconds
		});
	}

	/**
	 * Show notification about zero results
	 */
	notifyZeroResults(): void {
		this.add({
			message: 'No photos match your current filters. Try adjusting your selection.',
			variant: 'warning',
			duration: 5000,
		});
	}

	/**
	 * Add a notification to the queue
	 */
	add(notification: Omit<FilterNotification, 'id' | 'timestamp'>): string {
		const id = `notification-${this.nextId++}`;
		const timestamp = Date.now();

		this.notifications = [
			...this.notifications,
			{
				id,
				timestamp,
				...notification,
			},
		];

		// Auto-remove after duration
		if (notification.duration > 0) {
			setTimeout(() => {
				this.remove(id);
			}, notification.duration);
		}

		return id;
	}

	/**
	 * Remove a notification by ID
	 */
	remove(id: string): void {
		this.notifications = this.notifications.filter((n) => n.id !== id);
	}

	/**
	 * Clear all notifications
	 */
	clear(): void {
		this.notifications = [];
	}
}

export const filterNotifications = new FilterNotificationsStore();
