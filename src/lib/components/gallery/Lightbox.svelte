<script lang="ts">
	import {
		X,
		ChevronLeft,
		ChevronRight,
		ZoomIn,
		ZoomOut,
		Download,
		Share2,
		Sparkles
	} from 'lucide-svelte';
	import { getEmotionColor } from '$lib/photo-utils';
	import { swipe, type SwipeEvent, isTouchDevice } from '$lib/utils/gestures';
	import Typography from '$lib/components/ui/Typography.svelte';
	import DownloadButton from '$lib/components/photo/DownloadButton.svelte';
	import { generatePhotoTitle, generatePhotoCaption, generateMetadataSummary } from '$lib/photo-utils';
	import { getOptimizedSmugMugUrl, getSmugMugSrcSet, isSmugMugUrl } from '$lib/utils/smugmug-image-optimizer';
	import type { Photo } from '$types/photo';

	interface Props {
		open?: boolean;
		photo: Photo | null;
		photos?: Photo[]; // Array for navigation
		currentIndex?: number;
		onClose?: () => void;
		onNavigate?: (index: number) => void;
	}

	let {
		open = $bindable(false),
		photo,
		photos = [],
		currentIndex = 0,
		onClose,
		onNavigate
	}: Props = $props();

	// Debug: Log when props change
	$effect(() => {
		console.log('[Lightbox $effect] Props changed: open=', open, 'photo=', photo?.id);
		console.log('[Lightbox $effect] Condition check: open && photo =', open && photo);
	});

	let zoomLevel = $state(1);
	let isDragging = $state(false);
	let dragStart = $state({ x: 0, y: 0 });
	let imagePosition = $state({ x: 0, y: 0 });
	
	// Track viewport size for responsive image loading
	let viewportWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1920);
	let devicePixelRatio = $state(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
	
	// Update viewport on resize
	$effect(() => {
		if (typeof window === 'undefined') return;
		
		function updateViewport() {
			viewportWidth = window.innerWidth;
			devicePixelRatio = window.devicePixelRatio || 1;
		}
		
		window.addEventListener('resize', updateViewport);
		updateViewport(); // Initial call
		
		return () => {
			window.removeEventListener('resize', updateViewport);
		};
	});
	
	// Get optimized image URL based on viewport and zoom level
	// Progressive loading: Start smaller, upgrade on zoom
	const optimizedImageUrl = $derived.by(() => {
		if (!photo) return null;
		
		const baseUrl = photo.original_url || photo.image_url;
		if (!baseUrl) return null;
		
		// For SmugMug URLs, use size optimization
		if (isSmugMugUrl(baseUrl)) {
			// Calculate effective display width needed
			// Account for viewport width, zoom level, and device pixel ratio
			const displayWidth = viewportWidth * Math.max(1, zoomLevel);
			const effectiveWidth = displayWidth * devicePixelRatio;
			
			// Conservative sizing strategy:
			// - Mobile portrait (< 480px): L (1024px) ~100-200KB
			// - Mobile landscape/Tablet (< 1024px): D (1600px) ~200-400KB  
			// - Desktop (> 1024px): D (1600px) ~200-400KB
			// - Desktop Retina (2x): Still D (1600px) is usually enough
			// - Only use X2/X3 for extreme zoom (> 2x) or very large Retina displays
			if (effectiveWidth <= 1024) {
				// Small screens or low zoom
				return getOptimizedSmugMugUrl(baseUrl, 'fullscreen'); // L (1024px) ~100-200KB
			} else if (effectiveWidth <= 2048 && zoomLevel <= 2) {
				// Standard desktop or moderate zoom
				return getOptimizedSmugMugUrl(baseUrl, 'download'); // D (1600px) ~200-400KB
			} else {
				// High zoom (> 2x) or very large Retina displays - use X2 (2048px) ~400-800KB
				// Avoid X3/X4/X5 unless absolutely necessary (those are 20MB+)
				return getOptimizedSmugMugUrl(baseUrl, 'download'); // Stay conservative with D size
			}
		}
		
		// Fallback to original URL for non-SmugMug images
		return baseUrl;
	});
	
	// Get srcset for responsive loading (allows browser to choose optimal size)
	const imageSrcSet = $derived.by(() => {
		if (!photo) return undefined;
		
		const baseUrl = photo.original_url || photo.image_url;
		if (!baseUrl || !isSmugMugUrl(baseUrl)) return undefined;
		
		return getSmugMugSrcSet(baseUrl);
	});
	
	// Sizes attribute for responsive images
	const imageSizes = $derived('100vw'); // Full viewport width

	// Touch gesture state
	let isTouch = $state(false);
	let initialDistance = $state(0);
	let initialScale = $state(1);
	let lastTapTime = $state(0);

	// Navigation availability
	const canGoNext = $derived(photos.length > 0 && currentIndex < photos.length - 1);
	const canGoPrev = $derived(photos.length > 0 && currentIndex > 0);

	// Detect touch device
	$effect(() => {
		isTouch = isTouchDevice();
	});

	// "Find Similar" functionality
	const emotionColor = $derived(photo ? getEmotionColor(photo.metadata.emotion) : null);
	const findSimilarUrl = $derived(
		photo?.metadata.emotion ? `/explore?emotion=${photo.metadata.emotion.toLowerCase()}` : null
	);

	// Generate user-friendly display text
	const displayTitle = $derived(photo ? generatePhotoTitle(photo) : 'Sports Photo');
	const displayCaption = $derived(photo ? generatePhotoCaption(photo) : '');
	const metadataSummary = $derived(photo ? generateMetadataSummary(photo) : []);

	function handleClose() {
		open = false;
		zoomLevel = 1;
		imagePosition = { x: 0, y: 0 };
		onClose?.();
	}

	function handleNext(event?: MouseEvent) {
		event?.stopPropagation();
		if (canGoNext) {
			zoomLevel = 1;
			imagePosition = { x: 0, y: 0 };
			onNavigate?.(currentIndex + 1);
		}
	}

	function handlePrev(event?: MouseEvent) {
		event?.stopPropagation();
		if (canGoPrev) {
			zoomLevel = 1;
			imagePosition = { x: 0, y: 0 };
			onNavigate?.(currentIndex - 1);
		}
	}

	function handleZoomIn(event?: MouseEvent) {
		event?.stopPropagation();
		zoomLevel = Math.min(zoomLevel + 0.5, 3);
	}

	function handleZoomOut(event?: MouseEvent) {
		event?.stopPropagation();
		zoomLevel = Math.max(zoomLevel - 0.5, 1);
		if (zoomLevel === 1) {
			imagePosition = { x: 0, y: 0 };
		}
	}

	// Touch gesture handlers
	function handleSwipe(event: SwipeEvent) {
		// Only allow navigation when not zoomed
		if (zoomLevel === 1) {
			if (event.direction === 'left' && canGoNext) {
				handleNext();
			} else if (event.direction === 'right' && canGoPrev) {
				handlePrev();
			} else if (event.direction === 'down' && Math.abs(event.distance) > 100) {
				// Pull down to close
				handleClose();
			}
		}
	}

	function handleDoubleTap(e: TouchEvent) {
		const now = Date.now();
		const timeSinceLastTap = now - lastTapTime;

		if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
			// Double tap detected - toggle zoom
			if (zoomLevel === 1) {
				zoomLevel = 2.5;
				// Center on tap point
				const touch = e.touches?.[0] || e.changedTouches?.[0];
				if (touch) {
					const target = e.currentTarget as HTMLElement;
					const rect = target.getBoundingClientRect();
					const x = touch.clientX - rect.left;
					const y = touch.clientY - rect.top;
					const centerX = rect.width / 2;
					const centerY = rect.height / 2;

					imagePosition = {
						x: -(x - centerX) * 1.5,
						y: -(y - centerY) * 1.5
					};
				}
			} else {
				// Reset zoom
				zoomLevel = 1;
				imagePosition = { x: 0, y: 0 };
			}
		}

		lastTapTime = now;
	}

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length === 2) {
			// Pinch gesture starting
			const touch1 = e.touches[0];
			const touch2 = e.touches[1];
			initialDistance = getDistance(touch1, touch2);
			initialScale = zoomLevel;
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
				zoomLevel = Math.max(1, Math.min(4, newScale)); // Limit 1x-4x
			}
		}
	}

	function getDistance(touch1: Touch, touch2: Touch): number {
		const dx = touch2.clientX - touch1.clientX;
		const dy = touch2.clientY - touch1.clientY;
		return Math.sqrt(dx * dx + dy * dy);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (!open) return;

		switch (event.key) {
			case 'Escape':
				handleClose();
				break;
			case 'ArrowLeft':
				event.preventDefault();
				handlePrev();
				break;
			case 'ArrowRight':
				event.preventDefault();
				handleNext();
				break;
			case '+':
			case '=':
				event.preventDefault();
				handleZoomIn();
				break;
			case '-':
			case '_':
				event.preventDefault();
				handleZoomOut();
				break;
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}

	function handleMouseDown(event: MouseEvent) {
		if (zoomLevel > 1) {
			isDragging = true;
			dragStart = { x: event.clientX - imagePosition.x, y: event.clientY - imagePosition.y };
		}
	}

	function handleMouseMove(event: MouseEvent) {
		if (isDragging && zoomLevel > 1) {
			imagePosition = {
				x: event.clientX - dragStart.x,
				y: event.clientY - dragStart.y
			};
		}
	}

	function handleMouseUp() {
		isDragging = false;
	}

	// Lock body scroll when lightbox is open
	$effect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
			return () => {
				document.body.style.overflow = '';
			};
		}
	});
</script>

<svelte:window
	onkeydown={handleKeyDown}
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
/>

{#if open && photo}
	{#snippet renderLog()}
		{@const __ = console.log('[Lightbox] Inside {#if open && photo} - RENDERING LIGHTBOX!')}
	{/snippet}
	{@render renderLog()}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 bg-black/95 flex items-center justify-center"
		style="z-index: 9999;"
		onclick={handleBackdropClick}
		onkeydown={(e) => e.key === 'Enter' && handleBackdropClick(e as any)}
		role="dialog"
		aria-modal="true"
		aria-label="Photo lightbox"
		tabindex="0"
	>
				<!-- Top Controls -->
				<div class="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
					<div class="max-w-7xl mx-auto flex items-center justify-between">
						<!-- Photo Info -->
						<div class="flex-1">
							<Typography variant="h3" class="text-white text-lg">
								{displayTitle}
							</Typography>
							{#if displayCaption}
								<Typography variant="body" class="text-white/70 text-sm mt-1 italic">
									{displayCaption}
								</Typography>
							{/if}
							{#if photos.length > 0}
								<Typography variant="caption" class="text-white/60">
									{currentIndex + 1} / {photos.length}
								</Typography>
							{/if}
						</div>

						<!-- Zoom Controls -->
						<div class="flex items-center gap-2 mr-4">
							<button
								onclick={handleZoomOut}
								disabled={zoomLevel <= 1}
								class="p-3 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gold-500"
								aria-label="Zoom out"
								title="Zoom out (-)"
							>
								<ZoomOut class="w-5 h-5 text-white" />
							</button>
							<Typography variant="caption" class="text-white/80 w-12 text-center">
								{Math.round(zoomLevel * 100)}%
							</Typography>
							<button
								onclick={handleZoomIn}
								disabled={zoomLevel >= 3}
								class="p-3 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gold-500"
								aria-label="Zoom in"
								title="Zoom in (+)"
							>
								<ZoomIn class="w-5 h-5 text-white" />
							</button>
						</div>

						<!-- Download Button (NEW - Week 3) -->
						<div class="mr-4">
							<DownloadButton {photo} variant="compact" />
						</div>

						<!-- Close Button -->
						<button
							onclick={handleClose}
							class="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gold-500"
							aria-label="Close lightbox"
							title="Close (ESC)"
						>
							<X class="w-6 h-6 text-white" />
						</button>
					</div>
				</div>

				<!-- Main Image Container -->
				<div
					use:swipe={{ onSwipe: handleSwipe }}
					class="relative w-full h-full flex items-center justify-center p-4 md:p-20"
					onmousedown={handleMouseDown}
					ontouchstart={handleTouchStart}
					ontouchmove={handleTouchMove}
					ontouchend={handleDoubleTap}
					role="presentation"
					style="cursor: {zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'}"
				>
					<img
						src={optimizedImageUrl || photo.image_url}
						srcset={imageSrcSet}
						sizes={imageSizes}
						alt={displayTitle}
						class="max-w-full max-h-full object-contain select-none transition-transform duration-200 touch-none"
						style="transform: scale({zoomLevel}) translate({imagePosition.x /
							zoomLevel}px, {imagePosition.y / zoomLevel}px)"
						draggable="false"
						loading="eager"
						decoding="async"
					/>
				</div>

				<!-- Navigation Arrows -->
				{#if photos.length > 1}
					<!-- Previous -->
					{#if canGoPrev}
						<button
							onclick={handlePrev}
							class="absolute left-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors z-10 min-h-[56px] min-w-[56px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gold-500"
							aria-label="Previous photo"
							title="Previous (←)"
						>
							<ChevronLeft class="w-8 h-8 text-white" />
						</button>
					{/if}

					<!-- Next -->
					{#if canGoNext}
						<button
							onclick={handleNext}
							class="absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors z-10 min-h-[56px] min-w-[56px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gold-500"
							aria-label="Next photo"
							title="Next (→)"
						>
							<ChevronRight class="w-8 h-8 text-white" />
						</button>
					{/if}
				{/if}

				<!-- Bottom Info/Metadata Bar -->
				<div
					class="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/50 to-transparent"
				>
					<div class="max-w-7xl mx-auto flex items-center justify-between">
						<div class="flex items-center gap-6 text-white/80 text-sm">
							{#each metadataSummary as tag}
								<span class="capitalize">{tag}</span>
							{/each}

							<!-- "Find Similar" Button -->
							{#if findSimilarUrl && emotionColor}
								<a
									href={findSimilarUrl}
									class="px-3 py-1.5 rounded-full text-xs font-medium
									       bg-white/10 hover:bg-white/20 backdrop-blur-sm
									       transition-colors flex items-center gap-1.5
									       border border-white/20 hover:border-current
									       focus:outline-none focus:ring-2 focus:ring-gold-500"
									style="color: {emotionColor}"
									aria-label="Find similar {photo.metadata.emotion} photos"
									title="Find more photos with {photo.metadata.emotion} emotion"
								>
									<Sparkles class="w-3.5 h-3.5" aria-hidden="true" />
									<span>Similar Photos</span>
								</a>
							{/if}
						</div>

						<!-- Mobile/Desktop Hints -->
						{#if isTouch}
							<Typography variant="caption" class="text-white/40 text-xs">
								{#if zoomLevel > 1}
									Pinch to zoom • Double-tap to reset
								{:else}
									Swipe to navigate • Double-tap to zoom • Swipe down to close
								{/if}
							</Typography>
						{:else}
							<Typography variant="caption" class="text-white/40">
								Use arrow keys to navigate • +/- to zoom • ESC to close
							</Typography>
						{/if}
					</div>
				</div>
			</div>
	{/if}
