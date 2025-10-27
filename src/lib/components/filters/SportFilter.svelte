<!--
  SportFilter Component - Multi-sport filter pills

  Features:
  - Pill-based UI for sport selection
  - Shows photo counts per sport
  - "All Sports" option to clear filter
  - Smooth transitions
  - Responsive design
  - P0-1: Collapsed on mobile by default
  - P0-2: Progressive disclosure (top 5 + show more)
  - P1-3: Lucide icons only (no emojis)

  Usage:
  <SportFilter {sports} selectedSport={sport} onSelect={handleSportSelect} />
-->

<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { slide } from 'svelte/transition';
	import { ChevronDown, Sparkles, Volleyball, User, Trophy } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';

	interface Sport {
		name: string;
		count: number;
		percentage: number;
	}

	interface Props {
		sports: Sport[];
		selectedSport?: string | null;
		onSelect?: (sport: string | null) => void;
	}

	let { sports, selectedSport = null, onSelect }: Props = $props();

	// P0-2: Progressive disclosure - Show top 5 by default
	let showAllSports = $state(false);

	// P0-1: Collapsed by default on ALL breakpoints (mobile + desktop)
	let isExpanded = $state(false);

	function handleSportClick(sportName: string | null) {
		onSelect?.(sportName);
	}

	// P1-3: Use Lucide icon components instead of emojis
	const sportIcons: Record<string, any> = {
		volleyball: Volleyball,
		basketball: Trophy,
		soccer: Trophy,
		softball: Trophy,
		football: Trophy,
		baseball: Trophy,
		track: User,
		portrait: User
	};

	const totalPhotos = $derived(sports.reduce((sum, s) => sum + s.count, 0));
	const displayedSports = $derived(showAllSports ? sports : sports.slice(0, 5));
	const hasMoreSports = $derived(sports.length > 5);
</script>

<!-- Minimal inline collapsed pill (all breakpoints) -->
<div class="relative inline-block">
	<button
		onclick={() => isExpanded = !isExpanded}
		class="px-3 py-1.5 text-xs rounded-full bg-charcoal-800/50 border border-charcoal-700 hover:border-gold-500/30 transition-all flex items-center gap-1.5"
		aria-expanded={isExpanded}
		aria-label={isExpanded ? 'Collapse sport filters' : 'Expand sport filters'}
	>
		<Trophy class="w-3 h-3" />
		<span>{selectedSport ? selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1) : 'Sport'}</span>
		<ChevronDown class="w-3 h-3 transition-transform {isExpanded ? 'rotate-180' : ''}" />
	</button>

	{#if isExpanded}
		<div
			transition:slide
			class="absolute top-full left-0 mt-2 p-3 bg-charcoal-900 border border-charcoal-800 rounded-lg shadow-xl z-30 min-w-[240px]"
		>
			<!-- Filter Pills -->
			<div class="flex flex-wrap gap-2">
				<!-- All Sports Pill -->
				<button
					onclick={() => handleSportClick(null)}
					class="px-3 py-1.5 text-xs rounded-full transition-all {!selectedSport
						? 'bg-gold-500 text-charcoal-950'
						: 'bg-charcoal-800 text-charcoal-100 hover:bg-charcoal-700'}"
					aria-pressed={!selectedSport}
				>
					All
				</button>

				<!-- Individual Sport Pills -->
				{#each displayedSports as sport (sport.name)}
					<button
						onclick={() => handleSportClick(sport.name)}
						class="px-3 py-1.5 text-xs rounded-full transition-all capitalize {selectedSport === sport.name
							? 'bg-gold-500 text-charcoal-950'
							: 'bg-charcoal-800 text-charcoal-100 hover:bg-charcoal-700'}"
						aria-pressed={selectedSport === sport.name}
					>
						{sport.name}
					</button>
				{/each}

				<!-- Show More/Less -->
				{#if hasMoreSports}
					<button
						onclick={() => showAllSports = !showAllSports}
						class="px-3 py-1.5 text-xs rounded-full border border-dashed border-charcoal-700 text-charcoal-400 hover:text-gold-400"
					>
						{showAllSports ? '−' : `+${sports.length - 5}`}
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	/* Smooth filter pill animations */
	button {
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}
</style>
