<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { slide } from 'svelte/transition';
	import { ChevronDown, Sparkles, Zap, PartyPopper, Camera, UserCircle, Activity, Award } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';
	import FilterPill from '$lib/components/ui/FilterPill.svelte';

	interface Category {
		name: string;
		count: number;
		percentage: number;
	}

	interface Props {
		categories: Category[];
		selectedCategory?: string | null;
		onSelect?: (category: string | null) => void;
		filterCounts?: Array<{ name: string; count: number }>;
	}

	let { categories, selectedCategory = null, onSelect, filterCounts }: Props = $props();

	// Merge filterCounts with categories data for context-aware counts
	let categoriesWithCounts = $derived(
		categories.map((category) => {
			const contextCount = filterCounts?.find((fc) => fc.name === category.name)?.count;
			return {
				...category,
				displayCount: contextCount !== undefined ? contextCount : category.count,
			};
		})
	);

	// P0-2: Progressive disclosure - Show top 4 by default
	let showAllCategories = $state(false);

	// P0-1: Collapsed by default on ALL breakpoints (mobile + desktop)
	let isExpanded = $state(false);
	let dropdownRef: HTMLDivElement | undefined = $state();

	function handleCategoryClick(categoryName: string | null) {
		onSelect?.(categoryName);
		isExpanded = false; // Auto-close on selection
	}

	// Click-outside detection to auto-close dropdown
	function handleClickOutside(event: MouseEvent) {
		if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
			isExpanded = false;
		}
	}

	$effect(() => {
		if (isExpanded) {
			document.addEventListener('click', handleClickOutside);
		} else {
			document.removeEventListener('click', handleClickOutside);
		}

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	// P1-3: Use Lucide icon components instead of emojis
	const categoryIcons: Record<string, any> = {
		action: Zap,
		celebration: PartyPopper,
		candid: Camera,
		portrait: UserCircle,
		warmup: Activity,
		ceremony: Award
	};

	// Category descriptions for accessibility
	const categoryDescriptions: Record<string, string> = {
		action: 'High-intensity sports action',
		celebration: 'Victory celebrations and emotional moments',
		candid: 'Behind-the-scenes and candid moments',
		portrait: 'Individual and team portraits',
		warmup: 'Pre-game warmups and practice',
		ceremony: 'Awards and ceremonies'
	};

	const totalPhotos = $derived(categoriesWithCounts.reduce((sum, c) => sum + c.displayCount, 0));
	const displayedCategories = $derived(showAllCategories ? categoriesWithCounts : categoriesWithCounts.slice(0, 4));
	const hasMoreCategories = $derived(categoriesWithCounts.length > 4);
</script>

<!-- Minimal inline collapsed pill (all breakpoints) -->
<div class="relative inline-block" bind:this={dropdownRef}>
	<button
		onclick={(e) => {
			e.stopPropagation();
			isExpanded = !isExpanded;
		}}
		class="px-3 py-1.5 text-xs rounded-full border transition-all flex items-center gap-1.5 {selectedCategory
			? 'bg-gold-500/20 border-gold-500/50 text-gold-300'
			: 'bg-charcoal-800/50 border-charcoal-700 hover:border-gold-500/30'}"
		aria-expanded={isExpanded}
		aria-label={isExpanded ? 'Collapse category filters' : 'Expand category filters'}
	>
		<Award class="w-3 h-3" />
		<span>{selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'Category'}</span>
		{#if selectedCategory}
			<span class="px-1.5 py-0.5 rounded-full bg-gold-500/30 text-gold-200 text-xs font-medium">1</span>
		{/if}
		<ChevronDown class="w-3 h-3 transition-transform {isExpanded ? 'rotate-180' : ''}" />
	</button>

	{#if isExpanded}
		<div
			transition:slide
			class="absolute top-full left-0 mt-2 p-3 bg-charcoal-900 border border-charcoal-800 rounded-lg shadow-xl z-40 min-w-[240px]"
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Filter Pills - Phase 2: Intelligent Filter System -->
			<div class="flex flex-wrap gap-2">
				<!-- All Categories Pill -->
				<FilterPill
					label="All"
					count={totalPhotos}
					state={selectedCategory === null ? 'active' : 'available'}
					description="Show all categories"
					size="sm"
					onclick={() => handleCategoryClick(null)}
				/>

				<!-- Individual Category Pills -->
				{#each displayedCategories as category (category.name)}
					{@const pillIcon = categoryIcons[category.name] || Sparkles}
					{@const pillState = selectedCategory === category.name ? 'active' : category.displayCount === 0 ? 'disabled' : 'available'}

					<FilterPill
						label={category.name.charAt(0).toUpperCase() + category.name.slice(1)}
						count={category.displayCount}
						state={pillState}
						description={categoryDescriptions[category.name.toLowerCase()] || category.name}
						icon={pillIcon}
						size="sm"
						onclick={() => handleCategoryClick(category.name)}
					/>
				{/each}

				<!-- Show More/Less -->
				{#if hasMoreCategories}
					<button
						onclick={() => showAllCategories = !showAllCategories}
						class="px-3 py-1.5 text-xs rounded-full border border-dashed border-charcoal-700 text-charcoal-400 hover:text-gold-400"
					>
						{showAllCategories ? '−' : `+${categories.length - 4}`}
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	button {
		-webkit-tap-highlight-color: transparent;
	}
</style>
