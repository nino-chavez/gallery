<!--
  FilterShareButton Component - Share current filters via URL

  Allows users to copy a URL with all active filters as query parameters.
  Provides visual feedback when URL is copied to clipboard.

  Features:
  - Generates shareable URL with current filters
  - Copies to clipboard with one click
  - Shows success/error toast notification
  - Works with all filter types (single, multi-select)

  Usage:
  <FilterShareButton
    sport={data.selectedSport}
    category={data.selectedCategory}
    playType={data.selectedPlayType}
    intensity={data.selectedIntensity}
    lighting={data.selectedLighting}
    colorTemp={data.selectedColorTemp}
    timeOfDay={data.selectedTimeOfDay}
    composition={data.selectedComposition}
  />
-->

<script lang="ts">
	import { Share2, Check, X as XIcon } from 'lucide-svelte';

	interface Props {
		sport?: string | null;
		category?: string | null;
		playType?: string | null;
		intensity?: string | null;
		lighting?: string[] | null;
		colorTemp?: string | null;
		timeOfDay?: string | null;
		composition?: string | null;
		baseUrl?: string;
	}

	let {
		sport = null,
		category = null,
		playType = null,
		intensity = null,
		lighting = null,
		colorTemp = null,
		timeOfDay = null,
		composition = null,
		baseUrl = '/explore'
	}: Props = $props();

	let copyStatus = $state<'idle' | 'success' | 'error'>('idle');
	let copyTimeout: ReturnType<typeof setTimeout> | null = null;

	// Check if any filters are active
	let hasActiveFilters = $derived(
		!!(sport || category || playType || intensity ||
		   (lighting && lighting.length > 0) || colorTemp ||
		   timeOfDay || composition)
	);

	// Generate shareable URL
	function generateShareableURL(): string {
		const url = new URL(window.location.origin + baseUrl);
		const params = url.searchParams;

		if (sport) params.set('sport', sport);
		if (category) params.set('category', category);
		if (playType) params.set('play_type', playType);
		if (intensity) params.set('intensity', intensity);
		if (lighting && lighting.length > 0) {
			lighting.forEach(l => params.append('lighting', l));
		}
		if (colorTemp) params.set('color_temp', colorTemp);
		if (timeOfDay) params.set('time_of_day', timeOfDay);
		if (composition) params.set('composition', composition);

		return url.toString();
	}

	// Copy URL to clipboard
	async function handleShareClick(event: MouseEvent) {
		event.stopPropagation();

		if (!hasActiveFilters) {
			return;
		}

		try {
			const shareableURL = generateShareableURL();
			await navigator.clipboard.writeText(shareableURL);

			// Show success state
			copyStatus = 'success';

			// Reset after 2 seconds
			if (copyTimeout) clearTimeout(copyTimeout);
			copyTimeout = setTimeout(() => {
				copyStatus = 'idle';
			}, 2000);
		} catch (error) {
			console.error('[FilterShare] Failed to copy URL:', error);
			copyStatus = 'error';

			// Reset after 2 seconds
			if (copyTimeout) clearTimeout(copyTimeout);
			copyTimeout = setTimeout(() => {
				copyStatus = 'idle';
			}, 2000);
		}
	}

	// Active filter count for tooltip
	let activeCount = $derived(
		(sport ? 1 : 0) +
		(category ? 1 : 0) +
		(playType ? 1 : 0) +
		(intensity ? 1 : 0) +
		(lighting?.length || 0) +
		(colorTemp ? 1 : 0) +
		(timeOfDay ? 1 : 0) +
		(composition ? 1 : 0)
	);
</script>

<button
	onclick={handleShareClick}
	disabled={!hasActiveFilters}
	class="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all
		{hasActiveFilters
			? copyStatus === 'success'
				? 'bg-green-500/20 border-green-500/50 text-green-300'
				: copyStatus === 'error'
				? 'bg-red-500/20 border-red-500/50 text-red-300'
				: 'bg-charcoal-800/50 border-charcoal-700 hover:border-gold-500/50 hover:bg-gold-500/10'
			: 'bg-charcoal-800/30 border-charcoal-800 text-charcoal-600 cursor-not-allowed'}"
	aria-label={hasActiveFilters ? `Share filters (${activeCount} active)` : 'No active filters to share'}
	title={hasActiveFilters ? `Copy shareable link with ${activeCount} ${activeCount === 1 ? 'filter' : 'filters'}` : 'No active filters to share'}
>
	{#if copyStatus === 'success'}
		<Check class="w-3 h-3" />
		<span>Copied!</span>
	{:else if copyStatus === 'error'}
		<XIcon class="w-3 h-3" />
		<span>Failed</span>
	{:else}
		<Share2 class="w-3 h-3" />
		<span>Share</span>
	{/if}
</button>

<style>
	button {
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}
</style>
