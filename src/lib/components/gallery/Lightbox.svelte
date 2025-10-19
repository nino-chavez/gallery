<script lang="ts">
	import { Motion, AnimatePresence } from 'svelte-motion';
	import {
		X,
		ChevronLeft,
		ChevronRight,
		ZoomIn,
		ZoomOut,
		Download,
		Share2
	} from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';
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

	let zoomLevel = $state(1);
	let isDragging = $state(false);
	let dragStart = $state({ x: 0, y: 0 });
	let imagePosition = $state({ x: 0, y: 0 });

	// Navigation availability
	const canGoNext = $derived(photos.length > 0 && currentIndex < photos.length - 1);
	const canGoPrev = $derived(photos.length > 0 && currentIndex > 0);

	function handleClose() {
		open = false;
		zoomLevel = 1;
		imagePosition = { x: 0, y: 0 };
		onClose?.();
	}

	function handleNext() {
		if (canGoNext) {
			zoomLevel = 1;
			imagePosition = { x: 0, y: 0 };
			onNavigate?.(currentIndex + 1);
		}
	}

	function handlePrev() {
		if (canGoPrev) {
			zoomLevel = 1;
			imagePosition = { x: 0, y: 0 };
			onNavigate?.(currentIndex - 1);
		}
	}

	function handleZoomIn() {
		zoomLevel = Math.min(zoomLevel + 0.5, 3);
	}

	function handleZoomOut() {
		zoomLevel = Math.max(zoomLevel - 0.5, 1);
		if (zoomLevel === 1) {
			imagePosition = { x: 0, y: 0 };
		}
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

<AnimatePresence>
	{#if open && photo}
		<!-- Backdrop -->
		<Motion
			let:motion
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={MOTION.spring.gentle}
		>
			<div
				use:motion
				class="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center"
				onclick={handleBackdropClick}
				onkeydown={(e) => e.key === 'Enter' && handleBackdropClick(e as any)}
				role="dialog"
				aria-modal="true"
				aria-label="Photo lightbox"
				tabindex="-1"
			>
				<!-- Top Controls -->
				<div class="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
					<div class="max-w-7xl mx-auto flex items-center justify-between">
						<!-- Photo Info -->
						<div class="flex-1">
							<Typography variant="h3" class="text-white text-lg">
								{photo.title || 'Untitled'}
							</Typography>
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
								class="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
								class="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
								aria-label="Zoom in"
								title="Zoom in (+)"
							>
								<ZoomIn class="w-5 h-5 text-white" />
							</button>
						</div>

						<!-- Close Button -->
						<button
							onclick={handleClose}
							class="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
							aria-label="Close lightbox"
							title="Close (ESC)"
						>
							<X class="w-6 h-6 text-white" />
						</button>
					</div>
				</div>

				<!-- Main Image Container -->
				<Motion
					let:motion
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.9 }}
					transition={MOTION.spring.snappy}
				>
					<div
						use:motion
						class="relative w-full h-full flex items-center justify-center p-20"
						onmousedown={handleMouseDown}
						role="img"
						aria-label="Zoomable photo - drag to pan when zoomed"
						tabindex="0"
						style="cursor: {zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'}"
					>
						<img
							src={photo.original_url || photo.image_url}
							alt={photo.title || 'Photo'}
							class="max-w-full max-h-full object-contain select-none transition-transform duration-200"
							style="transform: scale({zoomLevel}) translate({imagePosition.x /
								zoomLevel}px, {imagePosition.y / zoomLevel}px)"
							draggable="false"
						/>
					</div>
				</Motion>

				<!-- Navigation Arrows -->
				{#if photos.length > 1}
					<!-- Previous -->
					{#if canGoPrev}
						<button
							onclick={handlePrev}
							class="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors z-10"
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
							class="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors z-10"
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
							{#if photo.metadata.sport_type}
								<span class="capitalize">{photo.metadata.sport_type}</span>
							{/if}
							{#if photo.metadata.photo_category}
								<span class="capitalize">{photo.metadata.photo_category}</span>
							{/if}
							{#if photo.metadata.portfolio_worthy}
								<span class="px-2 py-1 rounded bg-gold-500/20 text-gold-400 text-xs">
									Portfolio
								</span>
							{/if}
						</div>

						<!-- Keyboard Shortcuts Hint -->
						<Typography variant="caption" class="text-white/40">
							Use arrow keys to navigate • +/- to zoom • ESC to close
						</Typography>
					</div>
				</div>
			</div>
		</Motion>
	{/if}
</AnimatePresence>
