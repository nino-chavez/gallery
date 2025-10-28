<!--
  ColorTemperatureFilter Component - Color temperature filter pills

  Features:
  - Pill-based UI with gradient colors (warm, cool, neutral)
  - Visual color representation
  - "All Temperatures" option to clear filter
  - Smooth transitions
  - Responsive design

  Usage:
  <ColorTemperatureFilter selectedTemp={colorTemp} onSelect={handleTempSelect} />
-->

<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { slide } from 'svelte/transition';
	import { ChevronDown, Thermometer } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';

	interface Props {
		selectedTemp?: string | null;
		onSelect?: (temp: string | null) => void;
	}

	let { selectedTemp = null, onSelect }: Props = $props();
	let isExpanded = $state(false);

	function handleTempClick(temp: string | null) {
		onSelect?.(temp);
	}

	const temperatures = [
		{
			value: 'warm',
			label: 'Warm',
			description: 'Orange and yellow tones',
			gradient: 'from-orange-400 to-yellow-400',
			hoverGradient: 'from-orange-500 to-yellow-500'
		},
		{
			value: 'neutral',
			label: 'Neutral',
			description: 'Balanced color temperature',
			gradient: 'from-gray-300 to-gray-400',
			hoverGradient: 'from-gray-400 to-gray-500'
		},
		{
			value: 'cool',
			label: 'Cool',
			description: 'Blue and cyan tones',
			gradient: 'from-blue-400 to-cyan-400',
			hoverGradient: 'from-blue-500 to-cyan-500'
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
		<button
			onclick={() => (isExpanded = !isExpanded)}
			class="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-charcoal-800/30"
			aria-expanded={isExpanded}
		>
			<div class="flex items-center gap-2">
				<Typography variant="label" class="text-charcoal-100">Color Temperature</Typography>
				{#if selectedTemp}
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
				<!-- Enhanced: Grid layout with prominent visual gradients -->
				<div class="grid grid-cols-3 gap-2 mb-3">
					{#each temperatures as temp}
						<button
							onclick={() => handleTempClick(temp.value)}
							class="group relative flex flex-col items-center gap-2 px-3 py-3 rounded-lg border transition-all duration-200 overflow-hidden {selectedTemp ===
							temp.value
								? 'border-gold-500 shadow-md'
								: 'border-charcoal-700/50 hover:border-charcoal-600'}"
							title={temp.description}
							aria-pressed={selectedTemp === temp.value}
						>
							<!-- Gradient background -->
							<div
								class="absolute inset-0 bg-gradient-to-br {selectedTemp === temp.value
									? temp.hoverGradient
									: temp.gradient} {selectedTemp === temp.value
									? 'opacity-40'
									: 'opacity-20 group-hover:opacity-30'} transition-opacity duration-200"
							></div>

							<!-- Icon -->
							<Thermometer
								class="w-5 h-5 relative z-10 {selectedTemp === temp.value
									? 'text-white'
									: 'text-charcoal-300 group-hover:text-charcoal-200'}"
							/>

							<!-- Label -->
							<Typography
								variant="caption"
								class="font-medium relative z-10 text-xs {selectedTemp === temp.value
									? 'text-white'
									: 'text-charcoal-300 group-hover:text-charcoal-200'}"
							>
								{temp.label}
							</Typography>
						</button>
					{/each}
				</div>

				<!-- Clear button if selected -->
				{#if selectedTemp}
					<div class="flex items-center justify-between text-xs">
						<Typography variant="caption" class="text-charcoal-400">
							{temperatures.find((t) => t.value === selectedTemp)?.description}
						</Typography>
						<button
							onclick={() => handleTempClick(null)}
							class="text-gold-500 hover:text-gold-400 transition-colors"
						>
							Clear
						</button>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</Motion>
