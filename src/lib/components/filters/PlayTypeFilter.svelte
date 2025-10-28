<!--
  PlayTypeFilter Component - Multi-sport play type filter pills

  Features:
  - Sport-aware: Shows play types relevant to selected sport
  - Pill-based UI for play type selection
  - "All Types" option to clear filter
  - Smooth transitions
  - Responsive design
  - Collapsed on mobile by default
  - Lucide icons only (no emojis)

  Usage:
  <PlayTypeFilter
    selectedPlayType={playType}
    selectedSport={sport}
    onSelect={handlePlayTypeSelect}
  />
-->

<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { slide } from 'svelte/transition';
	import {
		ChevronDown, Zap, Shield, Target, Hand, Activity,
		Dribbble, Circle, Goal, Wind, ArrowRight, Footprints,
		Flag, TrendingUp
	} from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';
	import FilterPill from '$lib/components/ui/FilterPill.svelte';

	interface Props {
		selectedPlayType?: string | null;
		selectedSport?: string | null;
		onSelect?: (playType: string | null) => void;
	}

	let { selectedPlayType = null, selectedSport = null, onSelect }: Props = $props();

	// Collapsed by default on ALL breakpoints
	let isExpanded = $state(false);

	function handlePlayTypeClick(playType: string | null) {
		onSelect?.(playType);
	}

	// Sport-specific play types with Lucide icons
	const sportPlayTypes: Record<string, Array<{ value: string; label: string; icon: any; description: string }>> = {
		volleyball: [
			{ value: 'spike', label: 'Spike', icon: Zap, description: 'Attacking hit over the net' },
			{ value: 'block', label: 'Block', icon: Shield, description: 'Defensive blocks at the net' },
			{ value: 'dig', label: 'Dig', icon: Hand, description: 'Defensive ground saves' },
			{ value: 'set', label: 'Set', icon: Target, description: 'Setting up the play' },
			{ value: 'serve', label: 'Serve', icon: Activity, description: 'Serving the ball' },
			{ value: 'pass', label: 'Pass', icon: ArrowRight, description: 'Passing to teammate' }
		],
		basketball: [
			{ value: 'dunk', label: 'Dunk', icon: Zap, description: 'Slam dunk' },
			{ value: 'layup', label: 'Layup', icon: Target, description: 'Close-range shot' },
			{ value: 'jump_shot', label: 'Jump Shot', icon: Circle, description: 'Mid-range or three-point shot' },
			{ value: 'rebound', label: 'Rebound', icon: Hand, description: 'Grabbing missed shot' },
			{ value: 'block', label: 'Block', icon: Shield, description: 'Blocking opponent shot' },
			{ value: 'pass', label: 'Pass', icon: ArrowRight, description: 'Passing to teammate' },
			{ value: 'dribble', label: 'Dribble', icon: Dribbble, description: 'Ball handling' }
		],
		soccer: [
			{ value: 'kick', label: 'Kick', icon: Footprints, description: 'Kicking the ball' },
			{ value: 'header', label: 'Header', icon: Circle, description: 'Heading the ball' },
			{ value: 'tackle', label: 'Tackle', icon: Shield, description: 'Defensive tackle' },
			{ value: 'save', label: 'Save', icon: Hand, description: 'Goalkeeper save' },
			{ value: 'dribble', label: 'Dribble', icon: Dribbble, description: 'Dribbling past opponents' },
			{ value: 'pass', label: 'Pass', icon: ArrowRight, description: 'Passing to teammate' }
		],
		softball: [
			{ value: 'pitch', label: 'Pitch', icon: Circle, description: 'Pitching the ball' },
			{ value: 'hit', label: 'Hit', icon: Zap, description: 'Batting/hitting' },
			{ value: 'catch', label: 'Catch', icon: Hand, description: 'Catching the ball' },
			{ value: 'throw', label: 'Throw', icon: ArrowRight, description: 'Throwing to base' },
			{ value: 'slide', label: 'Slide', icon: Wind, description: 'Sliding into base' },
			{ value: 'run', label: 'Run', icon: Footprints, description: 'Running bases' }
		],
		baseball: [
			{ value: 'pitch', label: 'Pitch', icon: Circle, description: 'Pitching the ball' },
			{ value: 'hit', label: 'Hit', icon: Zap, description: 'Batting/hitting' },
			{ value: 'catch', label: 'Catch', icon: Hand, description: 'Catching the ball' },
			{ value: 'throw', label: 'Throw', icon: ArrowRight, description: 'Throwing to base' },
			{ value: 'slide', label: 'Slide', icon: Wind, description: 'Sliding into base' },
			{ value: 'run', label: 'Run', icon: Footprints, description: 'Running bases' }
		],
		football: [
			{ value: 'throw', label: 'Throw', icon: ArrowRight, description: 'Throwing the ball' },
			{ value: 'catch', label: 'Catch', icon: Hand, description: 'Catching pass' },
			{ value: 'run', label: 'Run', icon: Footprints, description: 'Running with ball' },
			{ value: 'tackle', label: 'Tackle', icon: Shield, description: 'Defensive tackle' },
			{ value: 'block', label: 'Block', icon: Shield, description: 'Blocking opponent' },
			{ value: 'kick', label: 'Kick', icon: Goal, description: 'Kicking the ball' }
		],
		track: [
			{ value: 'sprint', label: 'Sprint', icon: Zap, description: 'Sprint racing' },
			{ value: 'hurdle', label: 'Hurdle', icon: TrendingUp, description: 'Hurdle jumping' },
			{ value: 'relay', label: 'Relay', icon: ArrowRight, description: 'Relay handoff' },
			{ value: 'jump', label: 'Jump', icon: TrendingUp, description: 'Long/high jump' },
			{ value: 'throw', label: 'Throw', icon: Circle, description: 'Shot put/javelin' }
		]
	};

	// Get play types for current sport (or show all if no sport selected)
	let playTypes = $derived(
		selectedSport && sportPlayTypes[selectedSport]
			? sportPlayTypes[selectedSport]
			: Object.values(sportPlayTypes).flat()
	);
</script>

<Motion
	let:motion
	initial={{ opacity: 0, y: -10 }}
	animate={{ opacity: 1, y: 0 }}
	transition={MOTION.spring.gentle}
>
	<div
		use:motion
		class="mb-4 rounded-lg border border-charcoal-800/30 bg-charcoal-900/50 backdrop-blur-sm"
	>
		<!-- Header -->
		<button
			onclick={() => (isExpanded = !isExpanded)}
			class="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-charcoal-800/30"
			aria-expanded={isExpanded}
			aria-controls="play-type-filter-content"
		>
			<div class="flex items-center gap-2">
				<Typography variant="label" class="text-charcoal-100">Play Type</Typography>
				{#if selectedPlayType}
					<span
						class="px-2 py-0.5 text-xs font-medium bg-gold-500/20 text-gold-400 rounded-full"
					>
						1
					</span>
				{/if}
			</div>
			<ChevronDown
				class="w-4 h-4 text-charcoal-400 transition-transform duration-200 {isExpanded
					? 'rotate-180'
					: ''}"
			/>
		</button>

		<!-- Content -->
		{#if isExpanded}
			<div
				id="play-type-filter-content"
				class="px-4 pb-4"
				transition:slide={{ duration: 200 }}
			>
				<!-- Play Type Pills - Phase 2: Intelligent Filter System -->
				<div class="flex flex-wrap gap-2">
					<!-- All Types Pill -->
					<FilterPill
						label="All Types"
						state={selectedPlayType === null ? 'active' : 'available'}
						description="Show all play types"
						size="sm"
						onclick={() => handlePlayTypeClick(null)}
					/>

					<!-- Individual Play Type Pills -->
					{#each playTypes as playType}
						<FilterPill
							label={playType.label}
							state={selectedPlayType === playType.value ? 'active' : 'available'}
							description={playType.description}
							icon={playType.icon}
							size="sm"
							onclick={() => handlePlayTypeClick(playType.value)}
						/>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</Motion>
