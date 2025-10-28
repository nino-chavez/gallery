<script lang="ts">
	/**
	 * Touch Photo Viewer - Mobile-Optimized Photo Viewing
	 *
	 * Features:
	 * - Swipe left/right to navigate photos
	 * - Pinch to zoom
	 * - Double-tap to zoom
	 * - Pull down to close
	 */

	import { Motion } from 'svelte-motion';
	import { X, ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { swipe, type SwipeEvent } from '$lib/utils/gestures';
	import Typography from '$lib/components/ui/Typography.svelte';
	import type { Photo } from '$types/photo';

	interface Props {
		open: boolean;
		photo: Photo | null;
		photos?: Photo[]; // Array for navigation
		onClose: () => void;
		onNavigate?: (direction: 'prev' | 'next') => void;
	}

	let { open = $bindable(false), photo, photos = [], onClose, onNavigate }: Props = $props();

	let imageElement: HTMLImageElement | null = $state(null);
	let scale = $state(1);
	let translateX = $state(0);
	let translateY = $state(0);

	// Current photo index
	let currentIndex = $derived(photos.findIndex((p) => p.id === photo?.id));
	let hasPrev = $derived(currentIndex > 0);
	let hasNext = $derived(currentIndex >= 0 && currentIndex < photos.length - 1);

	// Handle swipe gestures
	function handleSwipe(event: SwipeEvent) {
		// Horizontal swipe for navigation (only if not zoomed)
		if (scale === 1) {
			if (event.direction === 'left' && hasNext) {
				onNavigate?.('next');
			} else if (event.direction === 'right' && hasPrev) {
				onNavigate?.('prev');
			} else if (event.direction === 'down' && Math.abs(event.distance) > 100) {
				// Pull down to close
				handleClose();
			}
		}
	}

	// Handle double-tap to zoom
	let lastTapTime = 0;
	function handleTap(e: TouchEvent) {
		const now = Date.now();
		const timeSinceLastTap = now - lastTapTime;

		if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
			// Double tap detected
			toggleZoom(e);
		}

		lastTapTime = now;
	}

	// Toggle zoom on double-tap
	function toggleZoom(e: TouchEvent) {
		if (scale === 1) {
			scale = 2.5;
			// Center on tap point
			const touch = e.touches?.[0] || e.changedTouches?.[0];
			if (touch && imageElement) {
				const rect = imageElement.getBoundingClientRect();
				const x = touch.clientX - rect.left;
				const y = touch.clientY - rect.top;
				const centerX = rect.width / 2;
				const centerY = rect.height / 2;

				translateX = -(x - centerX) * 1.5;
				translateY = -(y - centerY) * 1.5;
			}
		} else {
			// Reset zoom
			scale = 1;
			translateX = 0;
			translateY = 0;
		}
	}

	// Handle pinch zoom
	let initialDistance = 0;
	let initialScale = 1;

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length === 2) {
			// Pinch gesture starting
			const touch1 = e.touches[0];
			const touch2 = e.touches[1];
			initialDistance = getDistance(touch1, touch2);
			initialScale = scale;
		}
	}

	function handleTouchMove(e: TouchEvent) {
		if (e.touches.length === 2) {
			e.preventDefault();
			const touch1 = e.touches[0];
			const touch2 = e.touches[1];
			const currentDistance = getDistance(touch1, touch2);

			if (initialDistance > 0) {
				const newScale = initialScale * (currentDistance / initialDistance);
				scale = Math.max(1, Math.min(4, newScale)); // Limit zoom to 1x-4x
			}
		}
	}

	function getDistance(touch1: Touch, touch2: Touch): number {
		const dx = touch2.clientX - touch1.clientX;
		const dy = touch2.clientY - touch1.clientY;
		return Math.sqrt(dx * dx + dy * dy);
	}

	function handleClose() {
		scale = 1;
		translateX = 0;
		translateY = 0;
		onClose();
	}

	// Keyboard navigation
	function handleKeydown(e: KeyboardEvent) {
		if (!open) return;

		if (e.key === 'Escape') {
			handleClose();
		} else if (e.key === 'ArrowLeft' && hasPrev) {
			onNavigate?.('prev');
		} else if (e.key === 'ArrowRight' && hasNext) {
			onNavigate?.('next');
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open && photo}
	<Motion
		let:motion
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		exit={{ opacity: 0 }}
		transition={{ duration: 0.2 }}
	>
		<div
			use:motion
			class="fixed inset-0 z-50 bg-charcoal-950/98 backdrop-blur-sm"
			onclick={handleClose}
		>
			<!-- Close Button -->
			<button
				onclick={handleClose}
				class="absolute top-4 right-4 z-10 p-2 rounded-full bg-charcoal-900/80 backdrop-blur-sm text-charcoal-200 hover:bg-charcoal-800 hover:text-gold-500 transition-all"
				aria-label="Close viewer"
			>
				<X class="w-6 h-6" />
			</button>

			<!-- Photo Info -->
			<div
				class="absolute top-4 left-4 z-10 max-w-md bg-charcoal-900/80 backdrop-blur-sm rounded-lg px-4 py-2"
			>
				<Typography variant="body" class="text-sm text-charcoal-200">
					{photo.title || 'Untitled Photo'}
				</Typography>
				{#if photos.length > 1}
					<Typography variant="caption" class="text-xs text-charcoal-500">
						{currentIndex + 1} of {photos.length}
					</Typography>
				{/if}
			</div>

			<!-- Navigation Arrows (Desktop) -->
			{#if hasPrev}
				<button
					onclick={(e) => {
						e.stopPropagation();
						onNavigate?.('prev');
					}}
					class="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-charcoal-900/80 backdrop-blur-sm text-charcoal-200 hover:bg-charcoal-800 hover:text-gold-500 transition-all"
					aria-label="Previous photo"
				>
					<ChevronLeft class="w-8 h-8" />
				</button>
			{/if}

			{#if hasNext}
				<button
					onclick={(e) => {
						e.stopPropagation();
						onNavigate?.('next');
					}}
					class="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-charcoal-900/80 backdrop-blur-sm text-charcoal-200 hover:bg-charcoal-800 hover:text-gold-500 transition-all"
					aria-label="Next photo"
				>
					<ChevronRight class="w-8 h-8" />
				</button>
			{/if}

			<!-- Photo Container with Gestures -->
			<div
				class="absolute inset-0 flex items-center justify-center p-4 md:p-8"
				onclick={(e) => e.stopPropagation()}
				use:swipe={{ onSwipe: handleSwipe }}
				ontouchstart={handleTouchStart}
				ontouchmove={handleTouchMove}
				ontouchend={handleTap}
			>
				<img
					bind:this={imageElement}
					src={photo.image_url}
					alt={photo.title || 'Photo'}
					class="max-w-full max-h-full object-contain transition-transform duration-200 touch-none"
					style="transform: scale({scale}) translate({translateX}px, {translateY}px);"
					draggable="false"
				/>
			</div>

			<!-- Gesture Hints (Mobile Only) -->
			<div class="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
				<div class="bg-charcoal-900/80 backdrop-blur-sm rounded-lg px-4 py-2">
					<Typography variant="caption" class="text-xs text-charcoal-400 text-center">
						{#if scale > 1}
							Pinch to zoom • Double-tap to reset
						{:else}
							Swipe to navigate • Double-tap to zoom • Swipe down to close
						{/if}
					</Typography>
				</div>
			</div>
		</div>
	</Motion>
{/if}
