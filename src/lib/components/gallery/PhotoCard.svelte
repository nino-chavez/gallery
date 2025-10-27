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
		// Backward compatibility: If onclick provided, use it (but prefer href navigation)
		if (onclick) {
			event.preventDefault();
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

	<!-- Title - Bottom (Hover Only) -->
	{#if photo.title}
		<div
			class="absolute bottom-0 left-0 right-0 p-3
			       bg-gradient-to-t from-black/80 via-black/40 to-transparent
			       opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
			       transition-opacity"
		>
			<Typography variant="caption" class="font-medium text-white line-clamp-2">
				{photo.title}
			</Typography>
		</div>
	{/if}
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
