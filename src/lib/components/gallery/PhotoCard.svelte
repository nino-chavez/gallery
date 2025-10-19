<!--
  PhotoCard Component - Display photo with metadata overlay

  Usage:
  <PhotoCard {photo} index={0} onclick={handleClick} />
-->

<script lang="ts">
	import { Camera } from 'lucide-svelte';
	import { Motion } from 'svelte-motion';
	import { MOTION } from '$lib/motion-tokens';
	import { getPhotoQualityScore } from '$lib/photo-utils';
	import Typography from '$lib/components/ui/Typography.svelte';
	import OptimizedImage from '$lib/components/ui/OptimizedImage.svelte';
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

	// Use image_url for display, thumbnail as blur placeholder
	let imageSrc = $derived(photo.image_url);
	let thumbnailSrc = $derived(photo.thumbnail_url);

	// Generate individual photo URL for SEO
	let photoUrl = $derived(`/photo/${photo.image_key}`);

	function handleClick(event: MouseEvent) {
		// Backward compatibility: If onclick provided, use it (but prefer href navigation)
		if (onclick) {
			event.preventDefault();
			onclick(photo);
		}
		// Otherwise, let the anchor tag navigate naturally to /photo/[id]
	}
</script>

<Motion
	let:motion
	initial={{ opacity: 0, scale: 0.9 }}
	animate={{ opacity: 1, scale: 1 }}
	transition={{ ...MOTION.spring.snappy, delay: index * 0.05 }}
	whileHover={{ scale: 1.05, y: -4 }}
>
	<a
		use:motion
		href={photoUrl}
		class="group relative aspect-[4/3] bg-charcoal-900 rounded-lg overflow-hidden border border-charcoal-800 hover:border-gold-500/50 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/50 transition-colors cursor-pointer outline-none block"
		aria-label={photo.title || `Photo ${index + 1}`}
		onclick={handleClick}
	>
		<!-- Optimized Image with Lazy Loading & Blur Placeholder (NEW - Week 3) -->
		<OptimizedImage
			src={imageSrc}
			alt={photo.title || `Photo ${index + 1}`}
			thumbnailSrc={thumbnailSrc}
			aspectRatio="4/3"
			{priority}
			class="absolute inset-0"
		/>

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

		<!-- Portfolio Worthy Badge (optional subtle indicator) -->
		{#if portfolioWorthy}
			<div
				class="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-gold-500/90 text-black opacity-0 group-hover:opacity-100 transition-opacity"
				aria-hidden="true"
			>
				Portfolio
			</div>
		{/if}
	</a>
</Motion>
