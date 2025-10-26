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

	// P0-1: Collapsed on mobile by default
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

<!-- P0-1: Mobile summary button (compact, collapsed by default) -->
<div class="lg:hidden">
	<button
		onclick={() => isExpanded = !isExpanded}
		class="flex items-center justify-between w-full p-4 bg-charcoal-800 rounded-lg min-h-[48px]"
		aria-expanded={isExpanded}
		aria-label={isExpanded ? 'Collapse sport filters' : 'Expand sport filters'}
	>
		<span class="text-sm font-medium">
			Sport: {selectedSport ? selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1) : 'All Sports'}
		</span>
		<ChevronDown
			class="w-5 h-5 transition-transform {isExpanded ? 'rotate-180' : ''}"
		/>
	</button>

	{#if isExpanded}
		<div transition:slide class="mt-2 p-4 bg-charcoal-900/50 border border-charcoal-800/50 rounded-xl space-y-4">
			<!-- Filter Pills -->
			<div class="flex flex-wrap gap-3">
				<!-- All Sports Pill -->
				<Motion
					let:motion
					whileHover={{ scale: 1.03 }}
					whileTap={{ scale: 0.97 }}
				>
					<button
						use:motion
						onclick={() => handleSportClick(null)}
						class="min-h-[48px] px-6 py-3 rounded-full text-sm font-medium transition-all {!selectedSport
							? 'bg-gold-500 text-charcoal-950 shadow-lg shadow-gold-500/20'
							: 'bg-charcoal-800/50 text-charcoal-100 border border-charcoal-700 hover:border-gold-500/30 hover:bg-charcoal-800'}"
						aria-label="Show all sports"
						aria-pressed={!selectedSport}
					>
						<span class="flex items-center gap-2 whitespace-nowrap">
							<Sparkles class="w-4 h-4" />
							<span>All</span>
						</span>
					</button>
				</Motion>

				<!-- Individual Sport Pills (Progressive Disclosure) -->
				{#each displayedSports as sport (sport.name)}
					{@const IconComponent = sportIcons[sport.name.toLowerCase()] || Trophy}
					<Motion
						let:motion
						whileHover={{ scale: 1.03 }}
						whileTap={{ scale: 0.97 }}
					>
						<button
							use:motion
							onclick={() => handleSportClick(sport.name)}
							class="min-h-[48px] px-6 py-3 rounded-full text-sm font-medium transition-all {selectedSport === sport.name
								? 'bg-gold-500 text-charcoal-950 shadow-lg shadow-gold-500/20'
								: 'bg-charcoal-800/50 text-charcoal-100 border border-charcoal-700 hover:border-gold-500/30 hover:bg-charcoal-800'}"
							aria-label="Filter by {sport.name}"
							aria-pressed={selectedSport === sport.name}
						>
							<span class="flex items-center gap-2.5 whitespace-nowrap">
								<IconComponent class="w-4 h-4" />
								<span class="capitalize">{sport.name}</span>
								<span class="text-xs {selectedSport === sport.name ? 'opacity-80' : 'opacity-60'} font-normal ml-0.5">
									{sport.count.toLocaleString()}
								</span>
							</span>
						</button>
					</Motion>
				{/each}

				<!-- P0-2: Show More/Less Button -->
				{#if hasMoreSports}
					<button
						onclick={() => showAllSports = !showAllSports}
						class="min-h-[48px] px-5 py-3 rounded-full text-sm font-medium transition-all border-2 border-dashed border-charcoal-700 text-charcoal-400 hover:border-gold-500/50 hover:text-gold-400 bg-transparent"
						aria-label={showAllSports ? 'Show fewer sports' : 'Show all sports'}
						aria-expanded={showAllSports}
					>
						<span class="flex items-center gap-2">
							<span>{showAllSports ? '−' : '+'}</span>
							<span>{showAllSports ? 'Less' : `${sports.length - 5} More`}</span>
						</span>
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- Desktop: Always expanded, compact layout -->
<div class="hidden lg:block p-3 bg-charcoal-900/50 border border-charcoal-800/50 rounded-lg space-y-2">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<div class="w-1 h-4 bg-blue-500 rounded-full" aria-hidden="true"></div>
			<Typography variant="h3" class="text-sm font-semibold">Sport</Typography>
		</div>
		{#if selectedSport}
			<button
				onclick={() => handleSportClick(null)}
				class="text-xs text-gold-400 hover:text-gold-300 transition-colors underline min-h-[32px] px-2"
				aria-label="Clear sport filter"
			>
				Clear
			</button>
		{/if}
	</div>

	<!-- Filter Pills -->
	<div class="flex flex-wrap gap-2">
		<!-- All Sports Pill -->
		<Motion
			let:motion
			whileHover={{ scale: 1.03 }}
			whileTap={{ scale: 0.97 }}
		>
			<button
				use:motion
				onclick={() => handleSportClick(null)}
				class="min-h-[36px] px-4 py-2 rounded-full text-xs font-medium transition-all {!selectedSport
					? 'bg-gold-500 text-charcoal-950 shadow-lg shadow-gold-500/20'
					: 'bg-charcoal-800/50 text-charcoal-100 border border-charcoal-700 hover:border-gold-500/30 hover:bg-charcoal-800'}"
				aria-label="Show all sports"
				aria-pressed={!selectedSport}
			>
				<span class="flex items-center gap-1.5 whitespace-nowrap">
					<Sparkles class="w-3 h-3" />
					<span>All</span>
				</span>
			</button>
		</Motion>

		<!-- Individual Sport Pills (Progressive Disclosure) -->
		{#each displayedSports as sport (sport.name)}
			{@const IconComponent = sportIcons[sport.name.toLowerCase()] || Trophy}
			<Motion
				let:motion
				whileHover={{ scale: 1.03 }}
				whileTap={{ scale: 0.97 }}
			>
				<button
					use:motion
					onclick={() => handleSportClick(sport.name)}
					class="min-h-[36px] px-4 py-2 rounded-full text-xs font-medium transition-all {selectedSport === sport.name
						? 'bg-gold-500 text-charcoal-950 shadow-lg shadow-gold-500/20'
						: 'bg-charcoal-800/50 text-charcoal-100 border border-charcoal-700 hover:border-gold-500/30 hover:bg-charcoal-800'}"
					aria-label="Filter by {sport.name}"
					aria-pressed={selectedSport === sport.name}
				>
					<span class="flex items-center gap-1.5 whitespace-nowrap">
						<IconComponent class="w-3 h-3" />
						<span class="capitalize">{sport.name}</span>
						<span class="text-[10px] {selectedSport === sport.name ? 'opacity-80' : 'opacity-60'} font-normal ml-0.5">
							{sport.count.toLocaleString()}
						</span>
					</span>
				</button>
			</Motion>
		{/each}

		<!-- P0-2: Show More/Less Button -->
		{#if hasMoreSports}
			<button
				onclick={() => showAllSports = !showAllSports}
				class="min-h-[36px] px-4 py-2 rounded-full text-xs font-medium transition-all border border-dashed border-charcoal-700 text-charcoal-400 hover:border-gold-500/50 hover:text-gold-400 bg-transparent"
				aria-label={showAllSports ? 'Show fewer sports' : 'Show all sports'}
				aria-expanded={showAllSports}
			>
				<span class="flex items-center gap-1.5">
					<span>{showAllSports ? '−' : '+'}</span>
					<span>{showAllSports ? 'Less' : `${sports.length - 5} More`}</span>
				</span>
			</button>
		{/if}
	</div>

	<!-- Mobile: Selected Sport Indicator -->
	{#if selectedSport}
		<div class="md:hidden">
			<Typography variant="caption" class="text-charcoal-400">
				Showing {sports.find(s => s.name === selectedSport)?.count.toLocaleString()} {selectedSport} photos
			</Typography>
		</div>
	{/if}
</div>

<style>
	/* Smooth filter pill animations */
	button {
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}
</style>
