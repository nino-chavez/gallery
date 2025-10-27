<!--
  PlayTypeFilter Component - Volleyball play type filter pills

  Features:
  - Pill-based UI for play type selection (attack, block, dig, set, serve)
  - "All Types" option to clear filter
  - Smooth transitions
  - Responsive design
  - Collapsed on mobile by default
  - Lucide icons only (no emojis)

  Usage:
  <PlayTypeFilter selectedPlayType={playType} onSelect={handlePlayTypeSelect} />
-->

<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { slide } from 'svelte/transition';
	import { ChevronDown, Zap, Shield, Target, Hand, Activity } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';

	interface Props {
		selectedPlayType?: string | null;
		onSelect?: (playType: string | null) => void;
	}

	let { selectedPlayType = null, onSelect }: Props = $props();

	// Collapsed by default on ALL breakpoints
	let isExpanded = $state(false);

	function handlePlayTypeClick(playType: string | null) {
		onSelect?.(playType);
	}

	// Play types with Lucide icons
	const playTypes = [
		{ value: 'attack', label: 'Attack', icon: Zap, description: 'Offensive hits and spikes' },
		{ value: 'block', label: 'Block', icon: Shield, description: 'Defensive blocks at the net' },
		{ value: 'dig', label: 'Dig', icon: Hand, description: 'Defensive ground saves' },
		{ value: 'set', label: 'Set', icon: Target, description: 'Setting up the play' },
		{ value: 'serve', label: 'Serve', icon: Activity, description: 'Serving the ball' }
	];
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
				<!-- All Types Pill -->
				<div class="flex flex-wrap gap-2">
					<button
						onclick={() => handlePlayTypeClick(null)}
						class="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
              {selectedPlayType === null
							? 'bg-gold-500 text-charcoal-950 shadow-md'
							: 'bg-charcoal-800/50 text-charcoal-300 hover:bg-charcoal-800 hover:text-charcoal-100'}"
					>
						<Typography variant="caption" class="font-medium">All Types</Typography>
					</button>

					<!-- Play Type Pills -->
					{#each playTypes as playType}
						<button
							onclick={() => handlePlayTypeClick(playType.value)}
							class="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                {selectedPlayType === playType.value
								? 'bg-gold-500 text-charcoal-950 shadow-md'
								: 'bg-charcoal-800/50 text-charcoal-300 hover:bg-charcoal-800 hover:text-charcoal-100'}"
							title={playType.description}
						>
							<svelte:component
								this={playType.icon}
								class="w-3.5 h-3.5 {selectedPlayType === playType.value
									? 'text-charcoal-950'
									: 'text-charcoal-400 group-hover:text-charcoal-200'}"
							/>
							<Typography variant="caption" class="font-medium">{playType.label}</Typography>
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</Motion>
