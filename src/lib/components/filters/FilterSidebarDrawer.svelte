<!--
  FilterSidebarDrawer Component - Mobile slide-in drawer for filters

  A mobile-optimized version of FilterSidebar that slides in from the right.
  Uses the same internal structure as FilterSidebar for consistency.

  Features:
  - Slides in from right with backdrop overlay
  - Full-height drawer with scroll
  - Close button and backdrop click to dismiss
  - Escape key to close
  - Same accordion sections as desktop sidebar
  - Touch-friendly spacing and targets

  Usage:
  <FilterSidebarDrawer
    bind:open={drawerOpen}
    {sports}
    {categories}
    selectedSport={data.selectedSport}
    onSportSelect={handleSportSelect}
    onClose={() => drawerOpen = false}
  />
-->

<script lang="ts">
	import { slide, fade } from 'svelte/transition';
	import { X } from 'lucide-svelte';
	import FilterSidebar from './FilterSidebar.svelte';
	import type { FilterCounts } from '$lib/supabase/server';

	interface Sport {
		name: string;
		count: number;
		percentage: number;
	}

	interface Category {
		name: string;
		count: number;
		percentage: number;
	}

	interface Props {
		open: boolean;
		sports: Sport[];
		categories: Category[];
		selectedSport?: string | null;
		selectedCategory?: string | null;
		selectedPlayType?: string | null;
		selectedIntensity?: string | null;
		selectedLighting?: string[] | null;
		selectedColorTemp?: string | null;
		selectedTimeOfDay?: string | null;
		selectedComposition?: string | null;
		onSportSelect?: (sport: string | null) => void;
		onCategorySelect?: (category: string | null) => void;
		onPlayTypeSelect?: (playType: string | null) => void;
		onIntensitySelect?: (intensity: string | null) => void;
		onLightingSelect?: (lighting: string[] | null) => void;
		onColorTempSelect?: (temp: string | null) => void;
		onTimeOfDaySelect?: (time: string | null) => void;
		onCompositionSelect?: (composition: string | null) => void;
		onClearAll?: () => void;
		onClose?: () => void;
		filterCounts?: FilterCounts;
	}

	let {
		open = $bindable(false),
		sports,
		categories,
		selectedSport = null,
		selectedCategory = null,
		selectedPlayType = null,
		selectedIntensity = null,
		selectedLighting = null,
		selectedColorTemp = null,
		selectedTimeOfDay = null,
		selectedComposition = null,
		onSportSelect,
		onCategorySelect,
		onPlayTypeSelect,
		onIntensitySelect,
		onLightingSelect,
		onColorTempSelect,
		onTimeOfDaySelect,
		onCompositionSelect,
		onClearAll,
		onClose,
		filterCounts
	}: Props = $props();

	// Close drawer with escape key
	$effect(() => {
		if (open) {
			const handleEscape = (e: KeyboardEvent) => {
				if (e.key === 'Escape') {
					close();
				}
			};
			document.addEventListener('keydown', handleEscape);

			// Prevent body scroll when drawer is open
			document.body.style.overflow = 'hidden';

			return () => {
				document.removeEventListener('keydown', handleEscape);
				document.body.style.overflow = '';
			};
		}
	});

	function close() {
		open = false;
		onClose?.();
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			close();
		}
	}
</script>

{#if open}
	<!-- Backdrop overlay -->
	<div
		class="fixed inset-0 bg-charcoal-950/80 backdrop-blur-sm z-50"
		onclick={handleBackdropClick}
		transition:fade={{ duration: 200 }}
		role="presentation"
	>
		<!-- Drawer panel -->
		<div
			class="fixed top-0 right-0 h-full w-full max-w-sm bg-charcoal-950 border-l border-charcoal-800 shadow-2xl overflow-y-auto"
			transition:slide={{ duration: 300, axis: 'x' }}
			role="dialog"
			aria-modal="true"
			aria-label="Filter options"
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Header with close button -->
			<div class="sticky top-0 z-10 bg-charcoal-950/95 backdrop-blur-sm border-b border-charcoal-800 px-4 py-3 flex items-center justify-between">
				<h2 class="text-lg font-semibold">Filters</h2>
				<button
					onclick={close}
					class="p-2 -mr-2 rounded-lg hover:bg-charcoal-800 transition-colors"
					aria-label="Close filters"
				>
					<X class="w-5 h-5" />
				</button>
			</div>

			<!-- Filter content (reuse FilterSidebar structure) -->
			<div class="p-4">
				<FilterSidebar
					{sports}
					{categories}
					{selectedSport}
					{selectedCategory}
					{selectedPlayType}
					{selectedIntensity}
					{selectedLighting}
					{selectedColorTemp}
					{selectedTimeOfDay}
					{selectedComposition}
					{onSportSelect}
					{onCategorySelect}
					{onPlayTypeSelect}
					{onIntensitySelect}
					{onLightingSelect}
					{onColorTempSelect}
					{onTimeOfDaySelect}
					{onCompositionSelect}
					{onClearAll}
					{filterCounts}
				/>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Override sidebar's sticky positioning for drawer context */
	:global(.filter-sidebar-drawer) {
		position: static !important;
		height: auto !important;
		width: 100% !important;
	}
</style>
