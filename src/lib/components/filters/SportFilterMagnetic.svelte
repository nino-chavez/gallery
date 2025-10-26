<!--
  SportFilter Component - Multi-sport filter pills with magnetic attraction

  Features:
  - Pill-based UI for sport selection
  - Shows photo counts per sport
  - "All Sports" option to clear filter
  - Smooth transitions
  - Responsive design
  - P0-1: Collapsed on mobile by default
  - P0-2: Progressive disclosure (top 5 + show more)
  - P1-3: Lucide icons only (no emojis)
  - P2-4: Magnetic filter orbs (100px radius, spring physics)

  Usage:
  <SportFilter {sports} selectedSport={sport} onSelect={handleSportSelect} />
-->

<script lang="ts">
	import { Motion, useSpring } from 'svelte-motion';
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

	// P2-4: Magnetic attraction state
	let mouseX = $state(0);
	let mouseY = $state(0);
	let pillRefs: Map<string, HTMLElement> = new Map();

	const MAGNETIC_RADIUS = 100; // px
	const ATTRACTION_STRENGTH = 0.3; // 0-1 scale

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

	// P2-4: Calculate magnetic attraction for a pill
	function getMagneticTransform(pillId: string): { x: number; y: number } {
		const pill = pillRefs.get(pillId);
		if (!pill) return { x: 0, y: 0 };

		const rect = pill.getBoundingClientRect();
		const pillCenterX = rect.left + rect.width / 2;
		const pillCenterY = rect.top + rect.height / 2;

		const dx = mouseX - pillCenterX;
		const dy = mouseY - pillCenterY;
		const distance = Math.sqrt(dx * dx + dy * dy);

		// Only attract within radius
		if (distance > MAGNETIC_RADIUS) {
			return { x: 0, y: 0 };
		}

		// Calculate attraction strength (inverse square falloff)
		const strength = (1 - distance / MAGNETIC_RADIUS) * ATTRACTION_STRENGTH;

		return {
			x: dx * strength,
			y: dy * strength
		};
	}

	function handleMouseMove(event: MouseEvent) {
		mouseX = event.clientX;
		mouseY = event.clientY;
	}

	function setPillRef(id: string, element: HTMLElement | null) {
		if (element) {
			pillRefs.set(id, element);
		} else {
			pillRefs.delete(id);
		}
	}
</script>

<svelte:window onmousemove={handleMouseMove} />

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
			<!-- Filter Pills (Mobile - no magnetic effect) -->
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

<!-- Desktop: Always expanded with P2-4 Magnetic Orbs -->
<div class="hidden lg:block p-4 bg-charcoal-900/50 border border-charcoal-800/50 rounded-xl space-y-4">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div class="w-1 h-6 bg-blue-500 rounded-full" aria-hidden="true"></div>
			<Typography variant="h3" class="text-base font-semibold">Sport</Typography>
		</div>
		{#if selectedSport}
			<button
				onclick={() => handleSportClick(null)}
				class="text-sm text-gold-400 hover:text-gold-300 transition-colors underline min-h-[44px] px-3"
				aria-label="Clear sport filter"
			>
				Clear
			</button>
		{/if}
	</div>

	<!-- Filter Pills with Magnetic Attraction -->
	<div class="flex flex-wrap gap-3">
		<!-- All Sports Pill -->
		{@const allTransform = getMagneticTransform('sport-all')}
		<Motion
			let:motion
			animate={{
				x: allTransform.x,
				y: allTransform.y
			}}
			transition={{
				type: 'spring',
				stiffness: 300,
				damping: 30
			}}
		>
			<button
				use:motion
				use:setPillRef={'sport-all'}
				onclick={() => handleSportClick(null)}
				class="min-h-[48px] px-6 py-3 rounded-full text-sm font-medium transition-colors {!selectedSport
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

		<!-- Individual Sport Pills (Progressive Disclosure with Magnetic) -->
		{#each displayedSports as sport (sport.name)}
			{@const IconComponent = sportIcons[sport.name.toLowerCase()] || Trophy}
			{@const transform = getMagneticTransform(`sport-${sport.name}`)}
			<Motion
				let:motion
				animate={{
					x: transform.x,
					y: transform.y
				}}
				transition={{
					type: 'spring',
					stiffness: 300,
					damping: 30
				}}
			>
				<button
					use:motion
					use:setPillRef={`sport-${sport.name}`}
					onclick={() => handleSportClick(sport.name)}
					class="min-h-[48px] px-6 py-3 rounded-full text-sm font-medium transition-colors {selectedSport === sport.name
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
