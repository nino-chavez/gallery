<script lang="ts">
	import { Motion } from 'svelte-motion';
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

	// Progressive disclosure: Show top 5 by default
	let showAllCategories = $state(false);
	let isCollapsed = $state(false); // For mobile collapsible

	function handleCategoryClick(categoryName: string | null) {
		onSelect?.(categoryName);
	}

	// Category emojis for visual distinction
	const categoryEmojis: Record<string, string> = {
		action: '⚡',
		celebration: '🎉',
		candid: '📷',
		portrait: '🎭',
		warmup: '🏃‍♂️',
		ceremony: '🏆'
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

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<Typography variant="h3" class="text-lg">Filter by Category</Typography>
			<!-- Mobile collapse toggle -->
			<button
				onclick={() => isCollapsed = !isCollapsed}
				class="lg:hidden text-sm text-charcoal-400 hover:text-gold-500 transition-colors"
				aria-label={isCollapsed ? 'Expand category filters' : 'Collapse category filters'}
			>
				{isCollapsed ? '▼ Show' : '▲ Hide'}
			</button>
		</div>
		{#if selectedCategory}
			<button
				onclick={() => handleCategoryClick(null)}
				class="text-sm text-gold-500 hover:text-gold-400 transition-colors"
				aria-label="Clear category filter"
			>
				Clear filter
			</button>
		{/if}
	</div>

	<div class="flex flex-wrap gap-2 {isCollapsed ? 'hidden lg:flex' : 'flex'}">
		<!-- All Categories Pill -->
		<Motion let:motion whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
			<button
				use:motion
				onclick={() => handleCategoryClick(null)}
				class="px-4 py-2 rounded-full text-sm font-medium transition-all border {selectedCategory ===
				null
					? 'bg-gold-500 text-charcoal-950 border-gold-500'
					: 'bg-charcoal-800 text-charcoal-200 border-charcoal-700 hover:border-gold-500/50'}"
				aria-label="Show all categories"
			>
				<span class="flex items-center gap-2">
					<span>✨</span>
					<span>All Categories</span>
					<span class="text-xs opacity-70">({totalPhotos.toLocaleString()})</span>
				</span>
			</button>
		</Motion>

		<!-- Individual Category Pills (Progressive Disclosure) -->
		{#each displayedCategories as category (category.name)}
			<Motion let:motion whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
				<button
					use:motion
					onclick={() => handleCategoryClick(category.name)}
					class="px-4 py-2 rounded-full text-sm font-medium transition-all border {selectedCategory ===
					category.name
						? 'bg-gold-500 text-charcoal-950 border-gold-500'
						: 'bg-charcoal-800 text-charcoal-200 border-charcoal-700 hover:border-gold-500/50'}"
					aria-label="Filter by {category.name}"
					title={categoryDescriptions[category.name.toLowerCase()] || category.name}
				>
					<span class="flex items-center gap-2">
						<span>{categoryEmojis[category.name.toLowerCase()] || '📁'}</span>
						<span class="capitalize">{category.name}</span>
						<span class="text-xs opacity-70"
							>({category.count.toLocaleString()} · {category.percentage}%)</span
						>
					</span>
				</button>
			</Motion>
		{/each}

		<!-- Show More/Less Button -->
		{#if hasMoreCategories}
			<Motion let:motion whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
				<button
					use:motion
					onclick={() => showAllCategories = !showAllCategories}
					class="px-4 py-2 rounded-full text-sm font-medium transition-all border bg-charcoal-900 text-gold-500 border-charcoal-700 hover:border-gold-500/50"
					aria-label={showAllCategories ? 'Show fewer categories' : 'Show all categories'}
				>
					{showAllCategories ? `− Show Less` : `+ ${categories.length - 4} More`}
				</button>
			</Motion>
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
