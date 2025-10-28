<!--
  Visual Data Legend Component

  Provides users with an on-demand explanation of visual data layers:
  - Emotion halos (colored glows)
  - Quality shimmer (gold glow for portfolio-worthy)
  - Quality dimming (low-quality photos)

  Design Principle: Progressive Disclosure
  - Collapsed by default (no chrome impact)
  - Expands on demand (user-controlled)
  - Fixed position (doesn't push content)

  Accessibility:
  - Keyboard accessible (Tab navigation)
  - Focus states (WCAG 2.4.7)
  - Clear labels and descriptions
-->

<script lang="ts">
	import { Eye, X } from 'lucide-svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { Motion } from 'svelte-motion';
	import { MOTION } from '$lib/motion-tokens';

	let isOpen = $state(false);

	function toggleLegend() {
		isOpen = !isOpen;
	}

	const dataLayers = [
		{
			id: 'shimmer',
			name: 'Gold Shimmer',
			description: 'Portfolio-worthy photo (quality score ≥9)',
			className: 'quality-shimmer',
			interactive: 'Click to filter portfolio photos'
		},
		{
			id: 'triumph',
			name: 'Gold Halo',
			description: 'Triumph emotion detected',
			className: 'emotion-halo-triumph',
			interactive: 'Click to filter by Triumph'
		},
		{
			id: 'intensity',
			name: 'Red-Orange Halo',
			description: 'Intensity emotion detected',
			className: 'emotion-halo-intensity',
			interactive: 'Click to filter by Intensity'
		},
		{
			id: 'focus',
			name: 'Blue Halo',
			description: 'Focus emotion detected',
			className: 'emotion-halo-focus',
			interactive: 'Click to filter by Focus'
		},
		{
			id: 'determination',
			name: 'Purple Halo',
			description: 'Determination emotion detected',
			className: 'emotion-halo-determination',
			interactive: 'Click to filter by Determination'
		},
		{
			id: 'excitement',
			name: 'Pink Halo',
			description: 'Excitement emotion detected',
			className: 'emotion-halo-excitement',
			interactive: 'Click to filter by Excitement'
		},
		{
			id: 'serenity',
			name: 'Teal Halo',
			description: 'Serenity emotion detected',
			className: 'emotion-halo-serenity',
			interactive: 'Click to filter by Serenity'
		},
		{
			id: 'dimmed',
			name: 'Dimmed & Blurred',
			description: 'Lower quality photo (quality score <6)',
			className: 'quality-dimmed',
			interactive: null
		}
	];
</script>

<!-- Fixed position toggle button -->
<div class="fixed bottom-6 right-6 z-40">
	<button
		onclick={toggleLegend}
		class="px-4 py-2 text-sm rounded-lg bg-charcoal-900/95 backdrop-blur-sm
               border border-charcoal-700 hover:border-gold-500/50 transition-colors
               flex items-center gap-2 shadow-lg
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
		aria-label={isOpen ? 'Close visual data legend' : 'Open visual data legend'}
		aria-expanded={isOpen}
	>
		{#if isOpen}
			<X class="w-4 h-4" />
		{:else}
			<Eye class="w-4 h-4" />
		{/if}
		<span>Visual Guide</span>
		{#if !isOpen}
			<span class="text-xs text-charcoal-400">▲</span>
		{/if}
	</button>

	<!-- Legend panel -->
	{#if isOpen}
		<Motion
			let:motion
			initial={{ opacity: 0, y: 20, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: 20, scale: 0.95 }}
			transition={MOTION.spring.gentle}
		>
			<div
				use:motion
				class="absolute bottom-full right-0 mb-3 w-80"
			>
				<Card class="p-5 bg-charcoal-900/98 backdrop-blur-md border-charcoal-700 shadow-2xl">
					<div class="mb-4">
						<h3 class="text-base font-semibold text-white mb-1">Visual Data Layers</h3>
						<p class="text-xs text-charcoal-400 leading-relaxed">
							Photos use visual effects to encode metadata. Hover over photos to see details,
							click to filter.
						</p>
					</div>

					<div class="space-y-3 max-h-96 overflow-y-auto pr-2">
						{#each dataLayers as layer}
							<div class="flex items-start gap-3 group">
								<!-- Visual example -->
								<div class="shrink-0">
									<div
										class="w-12 h-12 rounded-lg border border-charcoal-700 {layer.className}
                                               flex items-center justify-center bg-charcoal-800"
									>
										<div class="w-3 h-3 bg-charcoal-600 rounded"></div>
									</div>
								</div>

								<!-- Description -->
								<div class="flex-1 min-w-0">
									<h4 class="text-sm font-medium text-white mb-0.5">
										{layer.name}
									</h4>
									<p class="text-xs text-charcoal-400 leading-relaxed mb-1">
										{layer.description}
									</p>
									{#if layer.interactive}
										<p class="text-xs text-gold-400/80 flex items-center gap-1">
											<span class="inline-block w-1 h-1 rounded-full bg-gold-400"></span>
											{layer.interactive}
										</p>
									{/if}
								</div>
							</div>
						{/each}
					</div>

					<!-- Footer tip -->
					<div class="mt-4 pt-4 border-t border-charcoal-800">
						<p class="text-xs text-charcoal-500 leading-relaxed">
							<strong class="text-charcoal-400">Tip:</strong> Hover over any photo to reveal its
							emotion badge and composition overlay. Click the badge to filter by that emotion.
						</p>
					</div>
				</Card>
			</div>
		</Motion>
	{/if}
</div>

<style>
	/* Scrollbar styling for legend panel */
	.overflow-y-auto {
		scrollbar-width: thin;
		scrollbar-color: theme('colors.charcoal.700') theme('colors.charcoal.900');
	}

	.overflow-y-auto::-webkit-scrollbar {
		width: 6px;
	}

	.overflow-y-auto::-webkit-scrollbar-track {
		background: theme('colors.charcoal.900');
		border-radius: 3px;
	}

	.overflow-y-auto::-webkit-scrollbar-thumb {
		background: theme('colors.charcoal.700');
		border-radius: 3px;
	}

	.overflow-y-auto::-webkit-scrollbar-thumb:hover {
		background: theme('colors.charcoal.600');
	}
</style>
