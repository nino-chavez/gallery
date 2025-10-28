<!--
  Visual Data Legend Component

  Provides users with an on-demand explanation of visual data layers:
  - Hover metadata badges (sport, category, intensity)
  - Emotion halos (colored glows) - DEPRECATED/NOT USED
  - Quality shimmer (gold glow for portfolio-worthy) - DEPRECATED/NOT USED
  - Quality dimming (low-quality photos) - DEPRECATED/NOT USED

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

	// Hover badge legend (active/current system)
	const hoverBadges = [
		{
			id: 'sport-badge',
			name: 'Sport Type',
			example: 'volleyball',
			description: 'Shows the sport captured in the photo',
			badgeClass: 'bg-gold-500/20 text-gold-300'
		},
		{
			id: 'category-badge',
			name: 'Photo Category',
			example: 'action',
			description: 'Type of shot (action, celebration, portrait, etc.)',
			badgeClass: 'bg-charcoal-700/80 text-charcoal-200'
		},
		{
			id: 'intensity-badge',
			name: 'Action Intensity',
			example: 'high',
			description: 'High or extreme action moments only',
			badgeClass: 'bg-red-500/20 text-red-300'
		}
	];

	// Legacy visual effects (deprecated - kept for reference)
	// These were part of the original emotion halo system but are no longer used
	const legacyDataLayers = [
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
						<h3 class="text-base font-semibold text-white mb-1">Photo Hover Guide</h3>
						<p class="text-xs text-charcoal-400 leading-relaxed">
							Hover over any photo to see colored metadata badges
						</p>
					</div>

					<div class="space-y-3">
						{#each hoverBadges as badge}
							<div class="flex items-start gap-3">
								<!-- Badge example -->
								<div class="shrink-0">
									<span class="text-xs px-1.5 py-0.5 rounded {badge.badgeClass} font-medium whitespace-nowrap">
										{badge.example}
									</span>
								</div>

								<!-- Description -->
								<div class="flex-1 min-w-0">
									<h4 class="text-sm font-medium text-white mb-0.5">
										{badge.name}
									</h4>
									<p class="text-xs text-charcoal-400 leading-relaxed">
										{badge.description}
									</p>
								</div>
							</div>
						{/each}
					</div>

					<!-- Footer tip -->
					<div class="mt-4 pt-4 border-t border-charcoal-800">
						<p class="text-xs text-charcoal-500 leading-relaxed">
							<strong class="text-charcoal-400">Tip:</strong> Click any photo to view full details and larger image
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
