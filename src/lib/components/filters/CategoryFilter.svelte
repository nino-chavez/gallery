<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { slide } from 'svelte/transition';
	import { ChevronDown, Sparkles, Zap, PartyPopper, Camera, UserCircle, Activity, Award } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';

	interface Category {
		name: string;
		count: number;
		percentage: number;
	}

	interface Props {
		categories: Category[];
		selectedCategory?: string | null;
		onSelect?: (category: string | null) => void;
	}

	let { categories, selectedCategory = null, onSelect }: Props = $props();

	// P0-2: Progressive disclosure - Show top 4 by default
	let showAllCategories = $state(false);

	// P0-1: Collapsed by default on ALL breakpoints (mobile + desktop)
	let isExpanded = $state(false);

	function handleCategoryClick(categoryName: string | null) {
		onSelect?.(categoryName);
	}

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

	const totalPhotos = $derived(categories.reduce((sum, c) => sum + c.count, 0));
	const displayedCategories = $derived(showAllCategories ? categories : categories.slice(0, 4));
	const hasMoreCategories = $derived(categories.length > 4);
</script>

<!-- Minimal inline collapsed pill (all breakpoints) -->
<div class="relative inline-block">
	<button
		onclick={() => isExpanded = !isExpanded}
		class="px-3 py-1.5 text-xs rounded-full bg-charcoal-800/50 border border-charcoal-700 hover:border-gold-500/30 transition-all flex items-center gap-1.5"
		aria-expanded={isExpanded}
		aria-label={isExpanded ? 'Collapse category filters' : 'Expand category filters'}
	>
		<Award class="w-3 h-3" />
		<span>{selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'Category'}</span>
		<ChevronDown class="w-3 h-3 transition-transform {isExpanded ? 'rotate-180' : ''}" />
	</button>

	{#if isExpanded}
		<div
			transition:slide
			class="absolute top-full left-0 mt-2 p-3 bg-charcoal-900 border border-charcoal-800 rounded-lg shadow-xl z-30 min-w-[240px]"
		>
			<!-- Filter Pills -->
			<div class="flex flex-wrap gap-2">
				<!-- All Categories Pill -->
				<button
					onclick={() => handleCategoryClick(null)}
					class="px-3 py-1.5 text-xs rounded-full transition-all {selectedCategory === null
						? 'bg-gold-500 text-charcoal-950'
						: 'bg-charcoal-800 text-charcoal-100 hover:bg-charcoal-700'}"
					aria-pressed={selectedCategory === null}
				>
					All
				</button>

				<!-- Individual Category Pills -->
				{#each displayedCategories as category (category.name)}
					<button
						onclick={() => handleCategoryClick(category.name)}
						class="px-3 py-1.5 text-xs rounded-full transition-all capitalize {selectedCategory === category.name
							? 'bg-gold-500 text-charcoal-950'
							: 'bg-charcoal-800 text-charcoal-100 hover:bg-charcoal-700'}"
						aria-pressed={selectedCategory === category.name}
						title={categoryDescriptions[category.name.toLowerCase()] || category.name}
					>
						{category.name}
					</button>
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
