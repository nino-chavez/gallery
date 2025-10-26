<!--
  PhotoCard Component - Display photo with metadata overlay

  Features:
  - P1-2: Emotion halos (colored glow per emotion)
  - P1-2: Quality glow (shimmer for portfolio-worthy)
  - P1-2: Quality dimming (blur for low-quality photos)
  - P2-1: Composition overlays (SVG overlays revealed on hover)
  - P2-2: 3D photo card physics (tilt effect, lift, cursor repulsion)

  Usage:
  <PhotoCard {photo} index={0} onclick={handleClick} />
-->

<script lang="ts">
	import { Camera } from 'lucide-svelte';
	import { Motion, useMotionValue, useTransform } from 'svelte-motion';
	import { MOTION } from '$lib/motion-tokens';
	import { getPhotoQualityScore } from '$lib/photo-utils';
	import Typography from '$lib/components/ui/Typography.svelte';
	import OptimizedImage from '$lib/components/ui/OptimizedImage.svelte';
	import FavoriteButton from '$lib/components/photo/FavoriteButton.svelte';
	import type { Photo } from '$types/photo';

	interface Props {
		photo: Photo;
		index?: number;
		onclick?: (photo: Photo) => void; // Deprecated: Use href navigation instead
		priority?: boolean; // For above-fold images
	}

	let { photo, index = 0, onclick, priority = false }: Props = $props();

	// Keep computed values for aria-label accessibility
	let qualityScore = $derived(getPhotoQualityScore(photo));
	let portfolioWorthy = $derived(photo.metadata.portfolio_worthy);

	// P1-2: Determine emotion halo class
	let emotionHaloClass = $derived(() => {
		const emotion = photo.metadata.emotion;
		if (!emotion) return '';
		return `emotion-halo-${emotion.toLowerCase()}`;
	});

	// P1-2: Determine quality class
	let qualityClass = $derived(() => {
		if (portfolioWorthy) return 'quality-shimmer';
		if (qualityScore < 6) return 'quality-dimmed';
		return '';
	});

	// Use image_url for display, thumbnail as blur placeholder
	let imageSrc = $derived(photo.image_url);
	let thumbnailSrc = $derived(photo.thumbnail_url);

	// Generate individual photo URL for SEO
	let photoUrl = $derived(`/photo/${photo.image_key}`);

	// P2-1: Composition overlay state
	let showComposition = $state(false);
	let compositionDismissed = $state(false);

	// P2-2: 3D tilt physics - DISABLED for performance
	// The global window listener was causing severe performance issues
	let isHovering = $state(false);

	function handleMouseEnter() {
		isHovering = true;
		if (!compositionDismissed) {
			showComposition = true;
		}
	}

	function handleMouseLeave() {
		isHovering = false;
		showComposition = false;
	}

	function handleCompositionClick(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		compositionDismissed = true;
		showComposition = false;
	}

	function handleClick(event: MouseEvent) {
		// Backward compatibility: If onclick provided, use it (but prefer href navigation)
		if (onclick) {
			event.preventDefault();
			onclick(photo);
		}
		// Otherwise, let the anchor tag navigate naturally to /photo/[id]
	}

	// P2-1: Generate composition overlay paths
	function getCompositionPaths(composition: string): string[] {
		switch (composition.toLowerCase()) {
			case 'rule of thirds':
				// Vertical and horizontal thirds lines
				return [
					'M 33.33 0 L 33.33 100',
					'M 66.67 0 L 66.67 100',
					'M 0 33.33 L 100 33.33',
					'M 0 66.67 L 100 66.67'
				];
			case 'leading lines':
				// Diagonal lines converging to center
				return [
					'M 0 0 L 50 50',
					'M 100 0 L 50 50',
					'M 0 100 L 50 50',
					'M 100 100 L 50 50'
				];
			case 'framing':
				// Frame around edges
				return [
					'M 10 10 L 90 10 L 90 90 L 10 90 Z'
				];
			case 'centered':
				// Center cross
				return [
					'M 50 0 L 50 100',
					'M 0 50 L 100 50'
				];
			default:
				// Default to rule of thirds
				return [
					'M 33.33 0 L 33.33 100',
					'M 66.67 0 L 66.67 100',
					'M 0 33.33 L 100 33.33',
					'M 0 66.67 L 100 66.67'
				];
		}
	}

	let compositionPaths = $derived(
		photo.metadata.composition ? getCompositionPaths(photo.metadata.composition) : []
	);
</script>

<Motion
	let:motion
	initial={{ opacity: 0, scale: 0.95 }}
	animate={{ opacity: 1, scale: 1 }}
	transition={{ ...MOTION.spring.snappy, delay: Math.min(index * 0.02, 0.3) }}
	whileHover={{ scale: 1.02, y: -4 }}
>
	<a
		use:motion
		href={photoUrl}
		class="group relative aspect-[4/3] bg-charcoal-900 rounded-lg overflow-hidden border border-charcoal-800 hover:border-gold-500/50 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/50 transition-all cursor-pointer outline-none block {emotionHaloClass()} {qualityClass()}"
		aria-label={photo.title || `Photo ${index + 1}`}
		onclick={handleClick}
		onmouseenter={handleMouseEnter}
		onmouseleave={handleMouseLeave}
	>
		<!-- Optimized Image with Lazy Loading & Blur Placeholder -->
		<OptimizedImage
			src={imageSrc}
			alt={photo.title || `Photo ${index + 1}`}
			thumbnailSrc={thumbnailSrc}
			aspectRatio="4/3"
			{priority}
			class="absolute inset-0"
		/>

		<!-- P2-1: Composition Overlay (SVG) -->
		{#if showComposition && compositionPaths.length > 0}
			<svg
				class="absolute inset-0 w-full h-full pointer-events-none composition-overlay"
				viewBox="0 0 100 100"
				preserveAspectRatio="none"
				onclick={handleCompositionClick}
				onkeydown={(e) => e.key === 'Enter' && handleCompositionClick(e)}
				role="button"
				tabindex="0"
				aria-label="Hide composition overlay"
				style="pointer-events: auto; opacity: 0.4;"
			>
				{#each compositionPaths as path, i}
					<path
						d={path}
						stroke="white"
						stroke-width="0.5"
						fill="none"
						stroke-dasharray="200"
						stroke-dashoffset="200"
						class="composition-line"
						style="animation: drawLine 1s ease-out forwards; animation-delay: {i * 0.1}s;"
					/>
				{/each}
			</svg>
		{/if}

		<!-- Simple Title Overlay (if title exists) -->
		{#if photo.title}
			<div
				class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
				aria-hidden="true"
			>
				<div class="absolute bottom-0 left-0 right-0 p-4">
					<Typography variant="caption" class="font-medium text-white line-clamp-2">
						{photo.title}
					</Typography>
				</div>
			</div>
		{/if}

		<!-- Favorite Button -->
		<div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
			<FavoriteButton {photo} variant="icon-only" />
		</div>

		<!-- Portfolio Worthy Badge -->
		{#if portfolioWorthy}
			<div
				class="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-gold-500/90 text-black opacity-0 group-hover:opacity-100 transition-opacity"
				aria-hidden="true"
			>
				Portfolio
			</div>
		{/if}

		<!-- Composition Type Label (shown when overlay visible) -->
		{#if showComposition && photo.metadata.composition}
			<div
				class="absolute bottom-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-charcoal-900/80 text-white"
				aria-hidden="true"
			>
				{photo.metadata.composition}
			</div>
		{/if}
	</a>
</Motion>

<style>
	@keyframes drawLine {
		from {
			stroke-dashoffset: 200;
		}
		to {
			stroke-dashoffset: 0;
		}
	}

	.composition-overlay {
		transition: opacity 0.3s ease;
	}
</style>
