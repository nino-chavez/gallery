<!--
  TimeOfDayFilter Component - Time of day filter pills

  Features:
  - Pill-based UI for time selection (golden_hour, midday, evening, night)
  - Icon representation for each time period
  - "All Times" option to clear filter
  - Smooth transitions

  Usage:
  <TimeOfDayFilter selectedTime={timeOfDay} onSelect={handleTimeSelect} />
-->

<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { slide } from 'svelte/transition';
	import { ChevronDown, Sunrise, Sun, Sunset, Moon } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';

	interface Props {
		selectedTime?: string | null;
		onSelect?: (time: string | null) => void;
	}

	let { selectedTime = null, onSelect }: Props = $props();
	let isExpanded = $state(false);

	function handleTimeClick(time: string | null) {
		onSelect?.(time);
	}

	const times = [
		{ value: 'golden_hour', label: 'Golden Hour', icon: Sunrise, description: 'Sunrise and sunset' },
		{ value: 'midday', label: 'Midday', icon: Sun, description: 'Bright midday light' },
		{ value: 'evening', label: 'Evening', icon: Sunset, description: 'Evening light' },
		{ value: 'night', label: 'Night', icon: Moon, description: 'Night and low light' }
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
		<button
			onclick={() => (isExpanded = !isExpanded)}
			class="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-charcoal-800/30"
			aria-expanded={isExpanded}
		>
			<div class="flex items-center gap-2">
				<Typography variant="label" class="text-charcoal-100">Time of Day</Typography>
				{#if selectedTime}
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

		{#if isExpanded}
			<div class="px-4 pb-4" transition:slide={{ duration: 200 }}>
				<div class="flex flex-wrap gap-2">
					<button
						onclick={() => handleTimeClick(null)}
						class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 {selectedTime ===
						null
							? 'bg-gold-500 text-charcoal-950 shadow-md'
							: 'bg-charcoal-800/50 text-charcoal-300 hover:bg-charcoal-800 hover:text-charcoal-100'}"
					>
						<Typography variant="body-sm" class="font-medium">All Times</Typography>
					</button>

					{#each times as time}
						<button
							onclick={() => handleTimeClick(time.value)}
							class="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 {selectedTime ===
							time.value
								? 'bg-gold-500 text-charcoal-950 shadow-md'
								: 'bg-charcoal-800/50 text-charcoal-300 hover:bg-charcoal-800 hover:text-charcoal-100'}"
							title={time.description}
						>
							<svelte:component
								this={time.icon}
								class="w-3.5 h-3.5 {selectedTime === time.value
									? 'text-charcoal-950'
									: 'text-charcoal-400 group-hover:text-charcoal-200'}"
							/>
							<Typography variant="body-sm" class="font-medium">{time.label}</Typography>
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</Motion>
