<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Motion } from 'svelte-motion';
	import { Calendar, X, Filter } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import MonthCard from '$lib/components/gallery/MonthCard.svelte';
	import SportFilter from '$lib/components/filters/SportFilter.svelte';
	import CategoryFilter from '$lib/components/filters/CategoryFilter.svelte';
	import HorizontalTimeline from '$lib/components/ui/HorizontalTimeline.svelte';
	import BackToTop from '$lib/components/ui/BackToTop.svelte';
	import type { PageData } from './$types';

	// Interface for Month data (matches MonthCard component)
	interface Month {
		year: number;
		month: number; // 0-11 (0-indexed)
		monthName: string;
		photoCount: number;
		coverImageUrl: string | null;
		primarySport?: string;
		primaryCategory?: string;
	}

	// Svelte 5 Runes: $props to receive server data
	let { data }: { data: PageData } = $props();

	// Transform availableMonths for horizontal timeline (if needed)
	let availableMonthsWithCounts = $derived.by(() => {
		if (!data.selectedYear) return [];

		return data.months.map(m => ({
			month: m.month,
			monthName: m.monthName,
			photoCount: m.photoCount
		}));
	});

	// Active filters count
	let activeFilterCount = $derived.by(() => {
		let count = 0;
		if (data.selectedSport) count++;
		if (data.selectedCategory) count++;
		return count;
	});

	// Handle sport filter selection
	function handleSportSelect(sport: string | null): void {
		const url = new URL($page.url);
		if (sport) {
			url.searchParams.set('sport', sport);
		} else {
			url.searchParams.delete('sport');
		}
		goto(url.toString());
	}

	// Handle category filter selection
	function handleCategorySelect(category: string | null): void {
		const url = new URL($page.url);
		if (category) {
			url.searchParams.set('category', category);
		} else {
			url.searchParams.delete('category');
		}
		goto(url.toString());
	}

	// Handle year filter selection
	function handleYearSelect(year: number | null): void {
		const url = new URL($page.url);
		if (year) {
			url.searchParams.set('year', year.toString());
		} else {
			url.searchParams.delete('year');
		}
		goto(url.toString());
	}

	// Handle month selection from horizontal timeline (navigates to month detail page)
	function handleMonthSelect(year: number, month: number): void {
		// Navigate to month detail page: /timeline/{year}/{month}
		goto(`/timeline/${year}/${month + 1}`); // +1 because we display 1-12, not 0-11
	}

	// Handle month card click (navigates to month detail page)
	function handleMonthClick(month: Month): void {
		// Navigate to month detail page: /timeline/{year}/{month}
		goto(`/timeline/${month.year}/${month.month + 1}`); // +1 because we display 1-12, not 0-11
	}

	// Clear all filters
	function clearAllFilters(event?: MouseEvent): void {
		event?.stopPropagation();
		const url = new URL($page.url);
		url.searchParams.delete('year');
		url.searchParams.delete('sport');
		url.searchParams.delete('category');
		goto(url.toString());
	}
</script>

<svelte:head>
	<title>Timeline - Nino Chavez Gallery</title>
	<meta name="description" content="Browse photos chronologically by upload date" />
</svelte:head>

<!-- Sticky Header with Filters -->
<div class="sticky top-0 z-20 bg-charcoal-950/98 backdrop-blur-md border-b border-charcoal-700/80 shadow-lg">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
		<!-- Title and Stats -->
		<div class="flex items-center justify-between gap-4 mb-3">
			<div class="flex items-center gap-3">
				<div class="flex items-center gap-2">
					<Calendar class="w-4 h-4 text-gold-400" />
					<h1 class="text-lg font-semibold text-white">Timeline</h1>
				</div>
				<span class="text-xs text-charcoal-400">{data.totalPhotos.toLocaleString()} photos</span>
			</div>
		</div>

		<!-- Inline Filters -->
		<div class="flex flex-wrap items-center gap-2.5">
			{#if activeFilterCount > 0}
				<button
					onclick={clearAllFilters}
					class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-charcoal-300 hover:text-gold-400 bg-charcoal-800/50 hover:bg-charcoal-800 transition-all rounded-lg border border-charcoal-700/50 hover:border-gold-500/50"
					title="Clear all filters"
				>
					<X class="w-3.5 h-3.5" />
					<span>Clear Filters</span>
					<span class="ml-1 px-2 py-0.5 bg-gold-500/20 text-gold-400 rounded-full text-xs font-bold">
						{activeFilterCount}
					</span>
				</button>
			{/if}

			{#if data.sports && data.sports.length > 0}
				<SportFilter
					sports={data.sports}
					selectedSport={data.selectedSport}
					onSelect={handleSportSelect}
				/>
			{/if}

			{#if data.categories && data.categories.length > 0}
				<CategoryFilter
					categories={data.categories}
					selectedCategory={data.selectedCategory}
					onSelect={handleCategorySelect}
				/>
			{/if}
		</div>
	</div>
</div>

<!-- Horizontal Timeline Navigation (Year + Month) -->
<div class="sticky top-[110px] z-10">
	<HorizontalTimeline
		availableYears={data.yearsWithCounts}
		availableMonths={availableMonthsWithCounts}
		selectedYear={data.selectedYear}
		selectedMonth={null}
		onYearSelect={handleYearSelect}
		onMonthSelect={handleMonthSelect}
	/>
</div>

<!-- Month Cards Grid -->
<Motion let:motion initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={MOTION.spring.gentle}>
	<div use:motion class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if data.months.length > 0}
			<!-- Month Cards Grid: 2 cols mobile, 3 cols tablet, 4 cols desktop -->
			<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{#each data.months as month, index}
					<Motion
						let:motion
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ ...MOTION.spring.gentle, delay: index * 0.05 }}
					>
						<div use:motion>
							<MonthCard {month} {index} onclick={handleMonthClick} />
						</div>
					</Motion>
				{/each}
			</div>

			<!-- Year Selection Footer Info -->
			<div class="mt-8 text-center">
				<Typography variant="caption" class="text-charcoal-500">
					{data.selectedYear ? `Showing ${data.months.length} months from ${data.selectedYear}` : 'Select a year to browse by month'}
				</Typography>
			</div>
		{:else}
			<!-- Empty State -->
			<Card padding="lg" class="text-center">
				{#if activeFilterCount > 0}
					<Filter class="w-16 h-16 text-charcoal-600 mx-auto mb-4" aria-hidden="true" />
					<Typography variant="h3" class="mb-2">No months match your filters</Typography>
					<Typography variant="body" class="text-charcoal-400 text-sm mb-4">
						No months found with {activeFilterCount}
						{activeFilterCount === 1 ? 'active filter' : 'active filters'}. Try removing some filters to see
						more results.
					</Typography>
					<Button onclick={clearAllFilters} size="md" variant="outline">
						<X class="w-4 h-4 mr-2" />
						Clear All Filters
					</Button>
				{:else}
					<Calendar class="w-16 h-16 text-charcoal-600 mx-auto mb-4" aria-hidden="true" />
					<Typography variant="h3" class="mb-2">Select a year to browse</Typography>
					<Typography variant="body" class="text-charcoal-400 text-sm">
						Choose a year from the timeline above to view months with photos
					</Typography>
				{/if}
			</Card>
		{/if}
	</div>
</Motion>

<!-- Back to Top Button -->
<BackToTop threshold={400} />
