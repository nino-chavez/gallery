<!--
  CollectionCard Component - Elegant card with reveal hover effect

  Features:
  - Smooth gradient reveal on hover
  - Content slides up with image zoom
  - Gold accent shine effect
  - Optimized image loading with SmugMug sizes
  - Fully accessible with keyboard navigation
  - Adheres to design system (charcoal/gold theme)

  Usage:
  <CollectionCard
    collection={collection}
    href="/collections/{collection.slug}"
  />
-->

<script lang="ts">
	import { Award } from 'lucide-svelte';
	import Typography from '$lib/components/ui/Typography.svelte';
	import type { CoverPhotoRow } from '$types/database';

	interface CollectionWithPhotos {
		slug: string;
		title: string;
		narrative: string;
		description: string;
		photoCount: number;
		coverPhoto: CoverPhotoRow | null;
	}

	interface Props {
		collection: CollectionWithPhotos;
		href: string;
	}

	let { collection, href }: Props = $props();

	const isPortfolio = collection.slug === 'portfolio-excellence';

	// Get optimized SmugMug image URL
	function getOptimizedImageUrl(imageUrl: string | null): string {
		if (!imageUrl) return '';

		// SmugMug optimization - use Large size (800px) for collection cards
		if (imageUrl.includes('smugmug.com')) {
			const baseUrl = imageUrl.replace(/-[A-Z]\d?\./, '.');
			return baseUrl.replace(/(\.[^.]+)$/, '-L$1');
		}

		return imageUrl;
	}

	let coverImageUrl = $derived(getOptimizedImageUrl(collection.coverPhoto?.ImageUrl || null));
</script>

<a
	{href}
	data-sveltekit-preload="hover"
	class="group block relative aspect-[3/4] rounded-xl overflow-hidden bg-charcoal-900 border border-charcoal-800 hover:border-gold-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-gold-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-950"
	aria-label="View {collection.title} collection with {collection.photoCount} photos"
>
	<!-- Cover Image with Zoom Effect -->
	{#if coverImageUrl}
		<div class="absolute inset-0">
			<img
				src={coverImageUrl}
				alt="{collection.title} cover"
				class="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
				loading="lazy"
			/>
			<!-- Gradient Overlay - darkens slightly on hover -->
			<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/95 group-hover:via-black/60 transition-all duration-200"></div>
		</div>
	{:else}
		<!-- Fallback gradient -->
		<div class="absolute inset-0 bg-gradient-to-br from-charcoal-900 to-charcoal-800"></div>
	{/if}

	<!-- Gold Shine Effect on Hover -->
	<div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
		<div class="absolute inset-0 bg-gradient-to-tr from-transparent via-gold-500/10 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-out"></div>
	</div>

	<!-- Portfolio Excellence Badge -->
	{#if isPortfolio}
		<div class="absolute top-4 right-4 z-10">
			<div class="bg-gold-500 text-charcoal-950 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold shadow-lg">
				<Award class="w-3.5 h-3.5" />
				<span>Excellence</span>
			</div>
		</div>
	{/if}

	<!-- Content - Slides up on hover -->
	<div class="absolute inset-x-0 bottom-0 p-6 transform transition-transform duration-200 ease-out group-hover:-translate-y-2">
		<!-- Photo Count -->
		<div class="flex items-center gap-2 mb-3">
			<div class="flex items-center gap-1.5 px-2.5 py-1 bg-charcoal-900/80 backdrop-blur-sm rounded-full border border-charcoal-700/50 group-hover:border-gold-500/50 transition-colors duration-150">
				<div class="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse"></div>
				<span class="text-xs text-charcoal-300 font-medium">{collection.photoCount} photos</span>
			</div>
		</div>

		<!-- Title -->
		<Typography
			variant="h3"
			class="text-xl font-bold text-white mb-2 group-hover:text-gold-400 transition-colors duration-150 line-clamp-2"
		>
			{collection.title}
		</Typography>

		<!-- Narrative - appears on hover -->
		<div class="overflow-hidden max-h-0 group-hover:max-h-24 transition-all duration-200 ease-out">
			<Typography
				variant="body"
				class="text-sm text-charcoal-300 italic line-clamp-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
			>
				{collection.narrative}
			</Typography>
		</div>

		<!-- Description - fades in on hover -->
		<Typography
			variant="body"
			class="text-xs text-charcoal-400 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
		>
			{collection.description}
		</Typography>

		<!-- View Collection CTA - appears on hover -->
		<div class="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
			<div class="inline-flex items-center gap-2 text-xs font-medium text-gold-500 hover:text-gold-400 transition-colors">
				<span>View Collection</span>
				<svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</div>
		</div>
	</div>

	<!-- Border Glow Effect -->
	<div class="absolute inset-0 rounded-xl border border-gold-500/0 group-hover:border-gold-500/20 transition-all duration-200 pointer-events-none"></div>
</a>
