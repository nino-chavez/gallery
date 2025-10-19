<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';
	import PhotoCard from '$lib/components/gallery/PhotoCard.svelte';
	import type { Photo } from '$types/photo';

	interface Props {
		photos: Photo[];
		title?: string;
		onPhotoClick?: (photo: Photo) => void;
	}

	let { photos, title = 'Related Photos', onPhotoClick }: Props = $props();

	// Carousel state
	let scrollContainer: HTMLDivElement | undefined = $state();
	let canScrollLeft = $state(false);
	let canScrollRight = $state(true);

	// Scroll amount (width of 3 cards + gaps)
	const scrollAmount = 900; // Approximate for 3 cards at ~280px each + gaps

	function scrollLeft() {
		if (scrollContainer) {
			scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
		}
	}

	function scrollRight() {
		if (scrollContainer) {
			scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
		}
	}

	function updateScrollButtons() {
		if (!scrollContainer) return;

		canScrollLeft = scrollContainer.scrollLeft > 0;
		canScrollRight =
			scrollContainer.scrollLeft < scrollContainer.scrollWidth - scrollContainer.clientWidth - 10;
	}

	function handleScroll() {
		updateScrollButtons();
	}

	// Update scroll buttons after mount
	$effect(() => {
		if (scrollContainer) {
			updateScrollButtons();
		}
	});
</script>

{#if photos.length > 0}
	<div class="relative">
		<!-- Header -->
		<div class="flex items-center justify-between mb-4">
			<Typography variant="h3" class="text-2xl">{title}</Typography>
			<div class="flex items-center gap-2">
				<button
					onclick={scrollLeft}
					disabled={!canScrollLeft}
					class="p-2 rounded-lg bg-charcoal-900 border border-charcoal-800 hover:border-gold-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
					aria-label="Scroll left"
				>
					<ChevronLeft class="w-5 h-5" />
				</button>
				<button
					onclick={scrollRight}
					disabled={!canScrollRight}
					class="p-2 rounded-lg bg-charcoal-900 border border-charcoal-800 hover:border-gold-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
					aria-label="Scroll right"
				>
					<ChevronRight class="w-5 h-5" />
				</button>
			</div>
		</div>

		<!-- Carousel Container -->
		<div
			bind:this={scrollContainer}
			onscroll={handleScroll}
			class="flex gap-6 overflow-x-auto scroll-smooth pb-4 -mx-2 px-2 scrollbar-thin scrollbar-thumb-charcoal-700 scrollbar-track-charcoal-900"
		>
			{#each photos as photo, index}
				<div class="flex-none w-[280px]">
					<PhotoCard {photo} {index} onclick={onPhotoClick} />
				</div>
			{/each}
		</div>

		<!-- Scroll Indicators (optional visual enhancement) -->
		{#if canScrollLeft}
			<div
				class="absolute left-0 top-16 bottom-0 w-16 bg-gradient-to-r from-charcoal-950 to-transparent pointer-events-none"
				aria-hidden="true"
			></div>
		{/if}
		{#if canScrollRight}
			<div
				class="absolute right-0 top-16 bottom-0 w-16 bg-gradient-to-l from-charcoal-950 to-transparent pointer-events-none"
				aria-hidden="true"
			></div>
		{/if}
	</div>
{/if}

<style>
	/* Custom scrollbar styling */
	.scrollbar-thin::-webkit-scrollbar {
		height: 6px;
	}

	.scrollbar-thin::-webkit-scrollbar-track {
		background: theme('colors.charcoal.900');
		border-radius: 3px;
	}

	.scrollbar-thin::-webkit-scrollbar-thumb {
		background: theme('colors.charcoal.700');
		border-radius: 3px;
	}

	.scrollbar-thin::-webkit-scrollbar-thumb:hover {
		background: theme('colors.gold.500');
	}

	/* Hide scrollbar for Firefox */
	.scrollbar-thin {
		scrollbar-width: thin;
		scrollbar-color: theme('colors.charcoal.700') theme('colors.charcoal.900');
	}
</style>
