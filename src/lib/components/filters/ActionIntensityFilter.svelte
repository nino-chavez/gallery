<!--
  ActionIntensityFilter Component - Action intensity level filter pills

  Features:
  - Pill-based UI for intensity selection (low, medium, high, peak)
  - Color-coded pills for visual intensity indication
  - "All Intensities" option to clear filter
  - Smooth transitions
  - Responsive design
  - Collapsed on mobile by default

  Usage:
  <ActionIntensityFilter selectedIntensity={intensity} onSelect={handleIntensitySelect} />
-->

<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { slide } from 'svelte/transition';
	import { ChevronDown, Gauge } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';
	import FilterPill from '$lib/components/ui/FilterPill.svelte';

	interface Props {
		selectedIntensity?: string | null;
		onSelect?: (intensity: string | null) => void;
	}

	let { selectedIntensity = null, onSelect }: Props = $props();

	// Collapsed by default on ALL breakpoints
	let isExpanded = $state(false);

	function handleIntensityClick(intensity: string | null) {
		onSelect?.(intensity);
	}

	// Intensity levels with color coding
	const intensities = [
		{
			value: 'low',
			label: 'Low',
			description: 'Calm, controlled moments',
			colorClass: 'from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30',
			textClass: 'text-blue-400',
			activeClass: 'bg-gradient-to-r from-blue-500 to-blue-600'
		},
		{
			value: 'medium',
			label: 'Medium',
			description: 'Standard gameplay action',
			colorClass:
				'from-yellow-500/20 to-yellow-600/20 hover:from-yellow-500/30 hover:to-yellow-600/30',
			textClass: 'text-yellow-400',
			activeClass: 'bg-gradient-to-r from-yellow-500 to-yellow-600'
		},
		{
			value: 'high',
			label: 'High',
			description: 'Intense competitive moments',
			colorClass:
				'from-orange-500/20 to-orange-600/20 hover:from-orange-500/30 hover:to-orange-600/30',
			textClass: 'text-orange-400',
			activeClass: 'bg-gradient-to-r from-orange-500 to-orange-600'
		},
		{
			value: 'peak',
			label: 'Peak',
			description: 'Maximum intensity action',
			colorClass: 'from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30',
			textClass: 'text-red-400',
			activeClass: 'bg-gradient-to-r from-red-500 to-red-600'
		}
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
			aria-controls="intensity-filter-content"
		>
			<div class="flex items-center gap-2">
				<Typography variant="label" class="text-charcoal-100">Intensity</Typography>
				{#if selectedIntensity}
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
			<div id="intensity-filter-content" class="px-4 pb-4" transition:slide={{ duration: 200 }}>
				<!-- Filter Pills - Phase 2: Intelligent Filter System -->
				<div class="flex flex-wrap gap-2">
					<!-- All Intensities Pill -->
					<FilterPill
						label="All Intensities"
						state={selectedIntensity === null ? 'active' : 'available'}
						description="Show all intensity levels"
						size="sm"
						onclick={() => handleIntensityClick(null)}
					/>

					<!-- Intensity Pills -->
					{#each intensities as intensity}
						<FilterPill
							label={intensity.label}
							state={selectedIntensity === intensity.value ? 'active' : 'available'}
							description={intensity.description}
							icon={Gauge}
							size="sm"
							onclick={() => handleIntensityClick(intensity.value)}
						/>
					{/each}
				</div>

				<!-- Visual Intensity Bar -->
				<div class="mt-3 flex items-center gap-1">
					{#each intensities as intensity, i}
						<div
							class="flex-1 h-1.5 rounded-full transition-all duration-200 {selectedIntensity ===
								intensity.value || selectedIntensity === null
								? intensity.activeClass
								: 'bg-charcoal-800/30'}"
						/>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</Motion>
