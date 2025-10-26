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

	// P0-1: Collapsed on mobile by default
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

<!-- P0-1: Mobile summary button (compact, collapsed by default) -->
<div class="lg:hidden">
	<button
		onclick={() => isExpanded = !isExpanded}
		class="flex items-center justify-between w-full p-4 bg-charcoal-800 rounded-lg min-h-[48px]"
		aria-expanded={isExpanded}
		aria-label={isExpanded ? 'Collapse category filters' : 'Expand category filters'}
	>
		<span class="text-sm font-medium">
			Category: {selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'All Categories'}
		</span>
		<ChevronDown
			class="w-5 h-5 transition-transform {isExpanded ? 'rotate-180' : ''}"
		/>
	</button>

	{#if isExpanded}
		<div transition:slide class="mt-2 p-4 bg-charcoal-900/50 border border-charcoal-800/50 rounded-xl space-y-4">
			<!-- Filter Pills -->
			<div class="flex flex-wrap gap-3">
				<!-- All Categories Pill -->
				<Motion let:motion whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
					<button
						use:motion
						onclick={() => handleCategoryClick(null)}
						class="min-h-[48px] px-6 py-3 rounded-full text-sm font-medium transition-all {selectedCategory === null
							? 'bg-gold-500 text-charcoal-950 shadow-lg shadow-gold-500/20'
							: 'bg-charcoal-800/50 text-charcoal-100 border border-charcoal-700 hover:border-gold-500/30 hover:bg-charcoal-800'}"
						aria-label="Show all categories"
						aria-pressed={selectedCategory === null}
					>
						<span class="flex items-center gap-2 whitespace-nowrap">
							<Sparkles class="w-4 h-4" />
							<span>All</span>
						</span>
					</button>
				</Motion>

				<!-- Individual Category Pills (Progressive Disclosure) -->
				{#each displayedCategories as category (category.name)}
					{@const IconComponent = categoryIcons[category.name.toLowerCase()] || Award}
					<Motion let:motion whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
						<button
							use:motion
							onclick={() => handleCategoryClick(category.name)}
							class="min-h-[48px] px-6 py-3 rounded-full text-sm font-medium transition-all {selectedCategory === category.name
								? 'bg-gold-500 text-charcoal-950 shadow-lg shadow-gold-500/20'
								: 'bg-charcoal-800/50 text-charcoal-100 border border-charcoal-700 hover:border-gold-500/30 hover:bg-charcoal-800'}"
							aria-label="Filter by {category.name}"
							aria-pressed={selectedCategory === category.name}
							title={categoryDescriptions[category.name.toLowerCase()] || category.name}
						>
							<span class="flex items-center gap-2.5 whitespace-nowrap">
								<IconComponent class="w-4 h-4" />
								<span class="capitalize">{category.name}</span>
								<span class="text-xs {selectedCategory === category.name ? 'opacity-80' : 'opacity-60'} font-normal ml-0.5">
									{category.count.toLocaleString()}
								</span>
							</span>
						</button>
					</Motion>
				{/each}

				<!-- P0-2: Show More/Less Button -->
				{#if hasMoreCategories}
					<button
						onclick={() => showAllCategories = !showAllCategories}
						class="min-h-[48px] px-5 py-3 rounded-full text-sm font-medium transition-all border-2 border-dashed border-charcoal-700 text-charcoal-400 hover:border-gold-500/50 hover:text-gold-400 bg-transparent"
						aria-label={showAllCategories ? 'Show fewer categories' : 'Show all categories'}
						aria-expanded={showAllCategories}
					>
						<span class="flex items-center gap-2">
							<span>{showAllCategories ? '−' : '+'}</span>
							<span>{showAllCategories ? 'Less' : `${categories.length - 4} More`}</span>
						</span>
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- Desktop: Always expanded -->
<div class="hidden lg:block p-4 bg-charcoal-900/50 border border-charcoal-800/50 rounded-xl space-y-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div class="w-1 h-6 bg-purple-500 rounded-full" aria-hidden="true"></div>
			<Typography variant="h3" class="text-base font-semibold">Category</Typography>
		</div>
		{#if selectedCategory}
			<button
				onclick={() => handleCategoryClick(null)}
				class="text-sm text-gold-400 hover:text-gold-300 transition-colors underline min-h-[44px] px-3"
				aria-label="Clear category filter"
			>
				Clear
			</button>
		{/if}
	</div>

	<div class="flex flex-wrap gap-3">
		<!-- All Categories Pill -->
		<Motion let:motion whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
			<button
				use:motion
				onclick={() => handleCategoryClick(null)}
				class="min-h-[48px] px-6 py-3 rounded-full text-sm font-medium transition-all {selectedCategory === null
					? 'bg-gold-500 text-charcoal-950 shadow-lg shadow-gold-500/20'
					: 'bg-charcoal-800/50 text-charcoal-100 border border-charcoal-700 hover:border-gold-500/30 hover:bg-charcoal-800'}"
				aria-label="Show all categories"
				aria-pressed={selectedCategory === null}
			>
				<span class="flex items-center gap-2 whitespace-nowrap">
					<Sparkles class="w-4 h-4" />
					<span>All</span>
				</span>
			</button>
		</Motion>

		<!-- Individual Category Pills (Progressive Disclosure) -->
		{#each displayedCategories as category (category.name)}
			{@const IconComponent = categoryIcons[category.name.toLowerCase()] || Award}
			<Motion let:motion whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
				<button
					use:motion
					onclick={() => handleCategoryClick(category.name)}
					class="min-h-[48px] px-6 py-3 rounded-full text-sm font-medium transition-all {selectedCategory === category.name
						? 'bg-gold-500 text-charcoal-950 shadow-lg shadow-gold-500/20'
						: 'bg-charcoal-800/50 text-charcoal-100 border border-charcoal-700 hover:border-gold-500/30 hover:bg-charcoal-800'}"
					aria-label="Filter by {category.name}"
					aria-pressed={selectedCategory === category.name}
					title={categoryDescriptions[category.name.toLowerCase()] || category.name}
				>
					<span class="flex items-center gap-2.5 whitespace-nowrap">
						<IconComponent class="w-4 h-4" />
						<span class="capitalize">{category.name}</span>
						<span class="text-xs {selectedCategory === category.name ? 'opacity-80' : 'opacity-60'} font-normal ml-0.5">
							{category.count.toLocaleString()}
						</span>
					</span>
				</button>
			</Motion>
		{/each}

		<!-- P0-2: Show More/Less Button -->
		{#if hasMoreCategories}
			<button
				onclick={() => showAllCategories = !showAllCategories}
				class="min-h-[48px] px-5 py-3 rounded-full text-sm font-medium transition-all border-2 border-dashed border-charcoal-700 text-charcoal-400 hover:border-gold-500/50 hover:text-gold-400 bg-transparent"
				aria-label={showAllCategories ? 'Show fewer categories' : 'Show all categories'}
				aria-expanded={showAllCategories}
			>
				<span class="flex items-center gap-2">
					<span>{showAllCategories ? '−' : '+'}</span>
					<span>{showAllCategories ? 'Less' : `${categories.length - 4} More`}</span>
				</span>
			</button>
		{/if}
	</div>

	<!-- Category description when selected -->
	{#if selectedCategory && categoryDescriptions[selectedCategory.toLowerCase()]}
		<Motion
			let:motion
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={MOTION.spring.gentle}
		>
			<div use:motion class="px-4 py-3 bg-charcoal-900 border border-charcoal-800 rounded-lg">
				<Typography variant="caption" class="text-charcoal-300">
					{categoryDescriptions[selectedCategory.toLowerCase()]}
				</Typography>
			</div>
		</Motion>
	{/if}
</div>

<style>
	button {
		-webkit-tap-highlight-color: transparent;
	}
</style>
