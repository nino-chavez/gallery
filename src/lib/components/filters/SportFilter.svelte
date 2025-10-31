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
	import FilterPill from '$lib/components/ui/FilterPill.svelte';

	interface Sport {
		name: string;
		count: number;
		percentage: number;
	}

	interface Props {
		sports: Sport[];
		selectedSport?: string | null;
		onSelect?: (sport: string | null) => void;
		filterCounts?: Array<{ name: string; count: number }>;
	}

	let { sports, selectedSport = null, onSelect, filterCounts }: Props = $props();

	// Merge filterCounts with sports data for context-aware counts
	let sportsWithCounts = $derived(
		sports.map((sport) => {
			const contextCount = filterCounts?.find((fc) => fc.name === sport.name)?.count;
			return {
				...sport,
				// Use contextual count if available (shows results with current filters applied)
				// Otherwise fall back to total count
				displayCount: contextCount !== undefined ? contextCount : sport.count,
			};
		})
	);

	// P0-2: Progressive disclosure - Show top 5 by default
	let showAllSports = $state(false);

	// P0-1: Collapsed by default on ALL breakpoints (mobile + desktop)
	let isExpanded = $state(false);
	let dropdownRef: HTMLDivElement | undefined = $state();

	function handleSportClick(sportName: string | null) {
		onSelect?.(sportName);
		isExpanded = false; // Auto-close on selection
	}

	// Click-outside detection to auto-close dropdown
	function handleClickOutside(event: MouseEvent) {
		if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
			isExpanded = false;
		}
	}

	$effect(() => {
		if (isExpanded) {
			document.addEventListener('click', handleClickOutside);
		} else {
			document.removeEventListener('click', handleClickOutside);
		}

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

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

	const totalPhotos = $derived(sportsWithCounts.reduce((sum, s) => sum + s.displayCount, 0));
	const displayedSports = $derived(showAllSports ? sportsWithCounts : sportsWithCounts.slice(0, 5));
	const hasMoreSports = $derived(sportsWithCounts.length > 5);
</script>

<!-- Minimal inline collapsed pill (all breakpoints) -->
<div class="relative inline-block" bind:this={dropdownRef}>
	<button
		onclick={(e) => {
			e.stopPropagation();
			isExpanded = !isExpanded;
		}}
		class="px-3 py-1.5 text-xs rounded-full border transition-all flex items-center gap-1.5 {selectedSport
			? 'bg-gold-500/20 border-gold-500/50 text-gold-300'
			: 'bg-charcoal-800/50 border-charcoal-700 hover:border-gold-500/30'}"
		aria-expanded={isExpanded}
		aria-label={isExpanded ? 'Collapse sport filters' : 'Expand sport filters'}
	>
		<Trophy class="w-3 h-3" />
		<span>{selectedSport ? selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1) : 'Sport'}</span>
		{#if selectedSport}
			<span class="px-1.5 py-0.5 rounded-full bg-gold-500/30 text-gold-200 text-xs font-medium">1</span>
		{/if}
		<ChevronDown class="w-3 h-3 transition-transform {isExpanded ? 'rotate-180' : ''}" />
	</button>

	{#if isExpanded}
		<div
			transition:slide
			class="absolute top-full left-0 mt-2 p-3 bg-charcoal-900 border border-charcoal-800 rounded-lg shadow-xl z-50 min-w-[240px]"
			role="group"
			aria-label="Sport filter options"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => {
				if (e.key === 'Escape') {
					isExpanded = false;
				}
			}}
		>
			<!-- Filter Pills - Phase 2: Intelligent Filter System -->
			<div class="flex flex-wrap gap-2">
				<!-- All Sports Pill -->
				<FilterPill
					label="All"
					count={totalPhotos}
					state={!selectedSport ? 'active' : 'available'}
					description="Show all sports"
					size="sm"
					onclick={() => handleSportClick(null)}
				/>

				<!-- Individual Sport Pills -->
				{#each displayedSports as sport (sport.name)}
					{@const pillIcon = sportIcons[sport.name] || Trophy}
					{@const pillState = selectedSport === sport.name ? 'active' : sport.displayCount === 0 ? 'disabled' : 'available'}

					<FilterPill
						label={sport.name.charAt(0).toUpperCase() + sport.name.slice(1)}
						count={sport.displayCount}
						state={pillState}
						description="{sport.name.charAt(0).toUpperCase() + sport.name.slice(1)} photos"
						icon={pillIcon}
						size="sm"
						onclick={() => handleSportClick(sport.name)}
					/>
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
