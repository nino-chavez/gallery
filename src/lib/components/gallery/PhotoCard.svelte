<!--
  PhotoCard Component - Minimal Gallery Card

  Features (Simplified - No Explanation Needed):
  - Favorite button (universal heart icon)
  - Photo title (if exists)

  Performance Optimized:
  - NO Motion/JS animations (pure CSS transitions)
  - NO layout shifts (fixed aspect ratio)
  - Lazy loading with proper placeholders

  Design Principle: "If you need to explain it, it's probably wrong"

  Usage:
  <PhotoCard {photo} index={0} />
-->

<script lang="ts">
	import { generatePhotoAltText } from '$lib/photo-utils';
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

	// Use image_url for display, thumbnail as blur placeholder
	let imageSrc = $derived(photo.image_url);
	let thumbnailSrc = $derived(photo.thumbnail_url);

	// Generate individual photo URL for SEO
	let photoUrl = $derived(`/photo/${photo.image_key}`);

	// Generate comprehensive alt text for screen readers
	let accessibleAltText = $derived(generatePhotoAltText(photo));

	function handleClick(event: MouseEvent) {
		// If onclick callback provided, prevent default navigation and use callback instead
		if (onclick) {
			event.preventDefault();
			event.stopPropagation();
			onclick(photo);
		}
		// Otherwise, let the anchor tag navigate naturally to /photo/[id]
	}
</script>

<a
	href={photoUrl}
	class="photo-card group relative aspect-[4/3] bg-charcoal-900 rounded-lg overflow-hidden border border-charcoal-800 transition-all cursor-pointer outline-none block"
	aria-label={accessibleAltText}
	onclick={handleClick}
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

	<!-- Favorite Button - Top Right (Hover Only) -->
	<div
		class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
	>
		<FavoriteButton {photo} variant="icon-only" />
	</div>

	<!-- Metadata Overlay - Bottom (Hover Only) -->
	<div
		class="absolute bottom-0 left-0 right-0 p-3
		       bg-gradient-to-t from-black/90 via-black/60 to-transparent
		       opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
		       transition-opacity"
	>
		<!-- Key Metadata Tags (No Title/Photo ID - just useful filter info) -->
		<div class="flex flex-wrap gap-1.5">
			<!-- Sport Type -->
			{#if photo.metadata?.sport_type}
				<span class="text-xs px-1.5 py-0.5 rounded bg-gold-500/20 text-gold-300 font-medium">
					{photo.metadata.sport_type}
				</span>
			{/if}

			<!-- Category -->
			{#if photo.metadata?.photo_category}
				<span class="text-xs px-1.5 py-0.5 rounded bg-charcoal-700/80 text-charcoal-200">
					{photo.metadata.photo_category}
				</span>
			{/if}

			<!-- Action Intensity (if high/extreme) -->
			{#if photo.metadata?.action_intensity === 'high' || photo.metadata?.action_intensity === 'extreme'}
				<span class="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">
					{photo.metadata.action_intensity}
				</span>
			{/if}
		</div>
	</div>
</a>

<style>
	/* Performance: Pure CSS transitions, no JS animations */
	.photo-card {
		/* Prevent layout shift */
		will-change: transform, border-color;
	}

	.photo-card:hover,
	.photo-card:focus-visible {
		transform: translateY(-4px) scale(1.02);
		border-color: rgba(212, 175, 55, 0.5);
		box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.3);
	}

	.photo-card:focus-visible {
		border-color: rgb(212, 175, 55);
		box-shadow:
			0 12px 24px -6px rgba(0, 0, 0, 0.3),
			0 0 0 2px rgba(212, 175, 55, 0.5);
	}

	/* Reduce motion for accessibility */
	@media (prefers-reduced-motion: reduce) {
		.photo-card {
			transition: none !important;
		}

		.photo-card:hover,
		.photo-card:focus-visible {
			transform: none !important;
		}
	}
</style>
