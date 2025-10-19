<!--
  SportFilter Component - Multi-sport filter pills

  Features:
  - Pill-based UI for sport selection
  - Shows photo counts per sport
  - "All Sports" option to clear filter
  - Smooth transitions
  - Responsive design

  Usage:
  <SportFilter {sports} selectedSport={sport} onSelect={handleSportSelect} />
-->

<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';

	interface Sport {
		name: string;
		count: number;
		percentage: number;
	}

	interface Props {
		sports: Sport[];
		selectedSport?: string;
		onSelect?: (sport: string | null) => void;
	}

	let { sports, selectedSport = null, onSelect }: Props = $props();

	// Progressive disclosure: Show top 5 by default, expand to show all
	let showAllSports = $state(false);
	let isCollapsed = $state(false); // For mobile collapsible

	function handleSportClick(sportName: string | null) {
		onSelect?.(sportName);
	}

	// Sport icon/emoji mapping
	const sportEmojis: Record<string, string> = {
		volleyball: '🏐',
		basketball: '🏀',
		soccer: '⚽',
		softball: '🥎',
		football: '🏈',
		baseball: '⚾',
		track: '🏃',
		portrait: '📸'
	};

	const totalPhotos = $derived(sports.reduce((sum, s) => sum + s.count, 0));
	const displayedSports = $derived(showAllSports ? sports : sports.slice(0, 5));
	const hasMoreSports = $derived(sports.length > 5);
</script>

<div class="space-y-4">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<Typography variant="h3" class="text-lg">Filter by Sport</Typography>
			<!-- Mobile collapse toggle -->
			<button
				onclick={() => isCollapsed = !isCollapsed}
				class="lg:hidden text-sm text-charcoal-400 hover:text-gold-500 transition-colors"
				aria-label={isCollapsed ? 'Expand sport filters' : 'Collapse sport filters'}
			>
				{isCollapsed ? '▼ Show' : '▲ Hide'}
			</button>
		</div>
		{#if selectedSport}
			<button
				onclick={() => handleSportClick(null)}
				class="text-sm text-gold-500 hover:text-gold-400 transition-colors"
			>
				Clear filter
			</button>
		{/if}
	</div>

	<!-- Filter Pills (collapsible on mobile) -->
	<div class="flex flex-wrap gap-2 {isCollapsed ? 'hidden lg:flex' : 'flex'}">
		<!-- All Sports Pill -->
		<Motion
			let:motion
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
		>
			<button
				use:motion
				onclick={() => handleSportClick(null)}
				class="px-4 py-2 rounded-full text-sm font-medium transition-all border {!selectedSport
					? 'bg-gold-500 text-charcoal-950 border-gold-500'
					: 'bg-charcoal-800 text-charcoal-200 border-charcoal-700 hover:border-gold-500/50'}"
				aria-label="Show all sports"
			>
				<span class="flex items-center gap-2">
					<span>✨</span>
					<span>All Sports</span>
					<span class="text-xs opacity-70">({totalPhotos.toLocaleString()})</span>
				</span>
			</button>
		</Motion>

		<!-- Individual Sport Pills (Progressive Disclosure) -->
		{#each displayedSports as sport (sport.name)}
			<Motion
				let:motion
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
			>
				<button
					use:motion
					onclick={() => handleSportClick(sport.name)}
					class="px-4 py-2 rounded-full text-sm font-medium transition-all border {selectedSport === sport.name
						? 'bg-gold-500 text-charcoal-950 border-gold-500'
						: 'bg-charcoal-800 text-charcoal-200 border-charcoal-700 hover:border-gold-500/50'}"
					aria-label="Filter by {sport.name}"
				>
					<span class="flex items-center gap-2">
						<span>{sportEmojis[sport.name.toLowerCase()] || '🏆'}</span>
						<span class="capitalize">{sport.name}</span>
						<span class="text-xs opacity-70">
							({sport.count.toLocaleString()} · {sport.percentage}%)
						</span>
					</span>
				</button>
			</Motion>
		{/each}

		<!-- Show More/Less Button -->
		{#if hasMoreSports}
			<Motion let:motion whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
				<button
					use:motion
					onclick={() => showAllSports = !showAllSports}
					class="px-4 py-2 rounded-full text-sm font-medium transition-all border bg-charcoal-900 text-gold-500 border-charcoal-700 hover:border-gold-500/50"
					aria-label={showAllSports ? 'Show fewer sports' : 'Show all sports'}
				>
					{showAllSports ? `− Show Less` : `+ ${sports.length - 5} More`}
				</button>
			</Motion>
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
