<!--
  LightingFilter Component - Lighting type multi-select filter

  Features:
  - Pill-based UI for lighting selection (natural, backlit, dramatic, soft, artificial)
  - MULTI-SELECT support (can select multiple lighting types)
  - "Clear All" option to reset selections
  - Smooth transitions
  - Responsive design
  - Collapsed on mobile by default
  - Shows count of selected items

  Usage:
  <LightingFilter selectedLighting={lighting} onSelect={handleLightingSelect} />
-->

<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { slide } from 'svelte/transition';
	import { ChevronDown, Sun, Sunrise, Zap, Cloud, Lightbulb } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';

	interface Props {
		selectedLighting?: string[] | null;
		onSelect?: (lighting: string[] | null) => void;
	}

	let { selectedLighting = null, onSelect }: Props = $props();

	// Collapsed by default on ALL breakpoints
	let isExpanded = $state(false);

	function handleLightingClick(value: string) {
		const current = selectedLighting || [];

		if (current.includes(value)) {
			// Remove from selection
			const filtered = current.filter((l) => l !== value);
			onSelect?.(filtered.length > 0 ? filtered : null);
		} else {
			// Add to selection
			onSelect?.([...current, value]);
		}
	}

	function clearAll() {
		onSelect?.(null);
	}

	// Lighting types with Lucide icons
	const lightingTypes = [
		{
			value: 'natural',
			label: 'Natural',
			icon: Sun,
			description: 'Natural daylight and outdoor lighting'
		},
		{
			value: 'backlit',
			label: 'Backlit',
			icon: Sunrise,
			description: 'Backlit silhouettes and rim lighting'
		},
		{
			value: 'dramatic',
			label: 'Dramatic',
			icon: Zap,
			description: 'High contrast and dramatic shadows'
		},
		{ value: 'soft', label: 'Soft', icon: Cloud, description: 'Diffused soft lighting' },
		{
			value: 'artificial',
			label: 'Artificial',
			icon: Lightbulb,
			description: 'Indoor and artificial lighting'
		}
	];

	let selectedCount = $derived(selectedLighting?.length || 0);
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
			aria-controls="lighting-filter-content"
		>
			<div class="flex items-center gap-2">
				<Typography variant="label" class="text-charcoal-100">Lighting</Typography>
				{#if selectedCount > 0}
					<span
						class="px-2 py-0.5 text-xs font-medium bg-gold-500/20 text-gold-400 rounded-full"
					>
						{selectedCount}
					</span>
				{/if}
			</div>
			<ChevronDown
				class="w-4 h-4 text-charcoal-400 transition-transform duration-200 {isExpanded
					? 'rotate-180'
					: ''}"
			/>
		</button>

		<!-- Content (Enhanced: Icon Grid Layout) -->
		{#if isExpanded}
			<div id="lighting-filter-content" class="px-4 pb-4" transition:slide={{ duration: 200 }}>
				<!-- Icon Grid (similar to CompositionFilter) -->
				<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-3">
					{#each lightingTypes as lighting}
						<button
							onclick={() => handleLightingClick(lighting.value)}
							class="group relative flex flex-col items-center gap-2 px-3 py-2.5 rounded-lg border transition-all duration-200 {selectedLighting?.includes(
								lighting.value
							)
								? 'bg-gold-500 border-gold-500 text-charcoal-950'
								: 'bg-charcoal-900/50 border-charcoal-700/50 text-charcoal-400 hover:border-charcoal-600 hover:bg-charcoal-800/50'}"
							aria-pressed={selectedLighting?.includes(lighting.value)}
							aria-label="Filter by {lighting.label}"
						>
							<svelte:component
								this={lighting.icon}
								class="w-4 h-4 {selectedLighting?.includes(lighting.value)
									? 'text-charcoal-950'
									: 'text-charcoal-400 group-hover:text-charcoal-200'}"
							/>
							<Typography
								variant="caption"
								class="font-medium text-xs {selectedLighting?.includes(lighting.value)
									? 'text-charcoal-950'
									: ''}">{lighting.label}</Typography
							>

							<!-- Tooltip -->
							<div
								class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-charcoal-800 text-charcoal-200 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
							>
								{lighting.description}
							</div>
						</button>
					{/each}
				</div>

				<!-- Clear All button (if selections exist) -->
				{#if selectedCount > 0}
					<div class="flex items-center justify-between text-xs">
						<Typography variant="caption" class="text-gold-400">
							{selectedCount} selected
						</Typography>
						<button
							onclick={clearAll}
							class="text-gold-500 hover:text-gold-400 transition-colors"
						>
							Clear All
						</button>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</Motion>
