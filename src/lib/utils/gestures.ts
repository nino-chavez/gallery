/**
 * Mobile Gesture Utilities
 *
 * Provides swipe and touch gesture detection for mobile UX
 */

export interface SwipeEvent {
	direction: 'left' | 'right' | 'up' | 'down';
	distance: number;
	duration: number;
	velocity: number;
}

export interface GestureOptions {
	minSwipeDistance?: number; // Minimum pixels to qualify as swipe (default: 50)
	maxSwipeTime?: number; // Maximum time for swipe in ms (default: 300)
	preventScroll?: boolean; // Prevent default scroll behavior
}

/**
 * Svelte action for swipe gestures
 * Usage: <div use:swipe={{ onSwipe: handleSwipe }}>
 */
export function swipe(
	node: HTMLElement,
	params: {
		onSwipe?: (event: SwipeEvent) => void;
		options?: GestureOptions;
	}
) {
	let startX = 0;
	let startY = 0;
	let startTime = 0;

	const options: Required<GestureOptions> = {
		minSwipeDistance: params.options?.minSwipeDistance ?? 50,
		maxSwipeTime: params.options?.maxSwipeTime ?? 300,
		preventScroll: params.options?.preventScroll ?? false,
	};

	function handleTouchStart(e: TouchEvent) {
		const touch = e.touches[0];
		startX = touch.clientX;
		startY = touch.clientY;
		startTime = Date.now();

		if (options.preventScroll) {
			e.preventDefault();
		}
	}

	function handleTouchEnd(e: TouchEvent) {
		const touch = e.changedTouches[0];
		const endX = touch.clientX;
		const endY = touch.clientY;
		const endTime = Date.now();

		const deltaX = endX - startX;
		const deltaY = endY - startY;
		const duration = endTime - startTime;

		// Check if it's a valid swipe
		const absX = Math.abs(deltaX);
		const absY = Math.abs(deltaY);
		const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		if (
			distance >= options.minSwipeDistance &&
			duration <= options.maxSwipeTime &&
			params.onSwipe
		) {
			// Determine direction (horizontal or vertical)
			let direction: SwipeEvent['direction'];

			if (absX > absY) {
				// Horizontal swipe
				direction = deltaX > 0 ? 'right' : 'left';
			} else {
				// Vertical swipe
				direction = deltaY > 0 ? 'down' : 'up';
			}

			const velocity = distance / duration; // pixels per ms

			params.onSwipe({
				direction,
				distance,
				duration,
				velocity,
			});
		}
	}

	node.addEventListener('touchstart', handleTouchStart, { passive: !options.preventScroll });
	node.addEventListener('touchend', handleTouchEnd, { passive: true });

	return {
		destroy() {
			node.removeEventListener('touchstart', handleTouchStart);
			node.removeEventListener('touchend', handleTouchEnd);
		},
	};
}

/**
 * Detect if device supports touch
 */
export function isTouchDevice(): boolean {
	return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get viewport size category
 */
export function getViewportSize(): 'mobile' | 'tablet' | 'desktop' {
	const width = window.innerWidth;

	if (width < 640) return 'mobile';
	if (width < 1024) return 'tablet';
	return 'desktop';
}

/**
 * Debounce resize events
 */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	return function executedFunction(...args: Parameters<T>) {
		const later = () => {
			timeout = null;
			func(...args);
		};

		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(later, wait);
	};
}
