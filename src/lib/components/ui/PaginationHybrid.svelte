<!--
  PaginationHybrid - Hybrid pagination with Load More + numbered pages

  Combines the best of both worlds:
  - Load More button for progressive discovery (primary action)
  - Numbered pagination for direct page access (secondary navigation)

  Perfect for photo galleries where users both browse and search.

  Features:
  - Progressive loading with "Load More" button
  - Traditional page numbers for direct access
  - Responsive design (Load More prominent on mobile)
  - Accessibility with proper ARIA labels
  - Loading states and feedback
  - Shows remaining photo count

  Usage:
  <PaginationHybrid
    currentPage={data.currentPage}
    totalCount={data.totalCount}
    pageSize={data.pageSize}
    onPageChange={(page) => goto(`/explore?page=${page}`)}
  />
-->

<script lang="ts">
	import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowDown } from 'lucide-svelte';
	import Typography from './Typography.svelte';
	import Button from './Button.svelte';
	import { cn } from '$lib/utils';

	interface Props {
		currentPage: number;
		totalCount: number;
		pageSize: number;
		onPageChange: (page: number) => void;
		class?: string;
		maxVisiblePages?: number;
		showFirstLast?: boolean;
		loadMoreLabel?: string;
	}

	let {
		currentPage,
		totalCount,
		pageSize,
		onPageChange,
		class: className,
		maxVisiblePages = 7,
		showFirstLast = true,
		loadMoreLabel = 'Load More'
	}: Props = $props();

	let totalPages = $derived(Math.ceil(totalCount / pageSize));
	let hasNext = $derived(currentPage < totalPages);
	let hasPrev = $derived(currentPage > 1);
	let canGoFirst = $derived(showFirstLast && currentPage > 3);
	let canGoLast = $derived(showFirstLast && currentPage < totalPages - 2);

	// Calculate remaining photos for Load More button
	let remainingPhotos = $derived((totalPages - currentPage) * pageSize);
	let nextBatchSize = $derived(Math.min(remainingPhotos, pageSize));

	// Showing range
	let showingStart = $derived((currentPage - 1) * pageSize + 1);
	let showingEnd = $derived(Math.min(currentPage * pageSize, totalCount));

	// Calculate visible page range with smart ellipsis
	let visiblePages = $derived.by(() => {
		if (totalPages <= maxVisiblePages) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		const half = Math.floor(maxVisiblePages / 2);
		let start = Math.max(1, currentPage - half);
		let end = Math.min(totalPages, start + maxVisiblePages - 1);

		if (end - start + 1 < maxVisiblePages) {
			start = Math.max(1, end - maxVisiblePages + 1);
		}

		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	});

	let showStartEllipsis = $derived(visiblePages[0] > 2);
	let showEndEllipsis = $derived(visiblePages[visiblePages.length - 1] < totalPages - 1);

	function handlePageClick(page: number, event: MouseEvent) {
		event.preventDefault();
		if (page !== currentPage && page >= 1 && page <= totalPages) {
			onPageChange(page);
		}
	}

	function handleKeyDown(event: KeyboardEvent, page: number) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handlePageClick(page, event as any);
		}
	}

	function handleLoadMore(event: MouseEvent) {
		event.preventDefault();
		if (hasNext) {
			onPageChange(currentPage + 1);
		}
	}

	// Don't render if only one page or no content
	if (totalPages <= 1 || totalCount === 0) {
		// Don't render anything
	}
</script>

{#if totalPages > 1 && totalCount > 0}
<div class={cn('space-y-4', className)}>
	<!-- Load More Button (Primary Action) -->
	{#if hasNext}
		<div class="flex justify-center">
			<Button
				onclick={handleLoadMore}
				variant="primary"
				size="lg"
				class="min-w-[200px] w-full sm:w-auto max-w-xs group"
				aria-label="Load next {nextBatchSize} photos (page {currentPage + 1})"
			>
				<span class="flex items-center gap-2">
					<ArrowDown class="w-4 h-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
					<span>{loadMoreLabel}</span>
					<span class="text-sm opacity-75">({nextBatchSize})</span>
				</span>
			</Button>
		</div>
	{/if}

	<!-- Numbered Pagination (Secondary Navigation) -->
	<nav
		class="flex items-center justify-center gap-2 sm:gap-2"
		aria-label="Photo gallery pagination"
		role="navigation"
	>
		<!-- Previous Button -->
		{#if hasPrev}
			<button
				onclick={(e) => handlePageClick(currentPage - 1, e)}
				onkeydown={(e) => handleKeyDown(e, currentPage - 1)}
				class="flex items-center gap-1 px-3 py-2.5 text-sm rounded-lg border border-charcoal-700 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 min-h-[44px]"
				aria-label="Go to previous page"
				type="button"
			>
				<ChevronLeft class="w-4 h-4" />
				<span class="hidden sm:inline">Previous</span>
			</button>
		{/if}

		<!-- First Page (if needed) -->
		{#if canGoFirst}
			<button
				onclick={(e) => handlePageClick(1, e)}
				onkeydown={(e) => handleKeyDown(e, 1)}
				class="flex items-center px-3 py-2.5 text-sm rounded-lg border border-charcoal-700 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 min-h-[44px] min-w-[44px] justify-center"
				aria-label="Go to first page"
				type="button"
			>
				<ChevronsLeft class="w-4 h-4" />
			</button>
		{/if}

		<!-- Start Ellipsis -->
		{#if showStartEllipsis}
			<span class="px-2 sm:px-3 py-2 text-sm text-charcoal-500 select-none" aria-hidden="true">
				…
			</span>
		{/if}

		<!-- Page Numbers -->
		{#each visiblePages as page}
			{@const isCurrentPage = page === currentPage}
			<button
				onclick={(e) => handlePageClick(page, e)}
				onkeydown={(e) => handleKeyDown(e, page)}
				class="min-w-[44px] min-h-[44px] px-3 py-2.5 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 flex items-center justify-center {isCurrentPage
					? 'border-gold-500 bg-gold-500 text-charcoal-950 font-medium'
					: 'border-charcoal-700 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 hover:text-white'}"
				aria-label="Go to page {page}"
				aria-current={isCurrentPage ? 'page' : undefined}
				type="button"
			>
				{page}
			</button>
		{/each}

		<!-- End Ellipsis -->
		{#if showEndEllipsis}
			<span class="px-2 sm:px-3 py-2 text-sm text-charcoal-500 select-none" aria-hidden="true">
				…
			</span>
		{/if}

		<!-- Last Page (if needed) -->
		{#if canGoLast}
			<button
				onclick={(e) => handlePageClick(totalPages, e)}
				onkeydown={(e) => handleKeyDown(e, totalPages)}
				class="flex items-center px-3 py-2.5 text-sm rounded-lg border border-charcoal-700 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 min-h-[44px] min-w-[44px] justify-center"
				aria-label="Go to last page"
				type="button"
			>
				<ChevronsRight class="w-4 h-4" />
			</button>
		{/if}

		<!-- Next Button -->
		{#if hasNext}
			<button
				onclick={(e) => handlePageClick(currentPage + 1, e)}
				onkeydown={(e) => handleKeyDown(e, currentPage + 1)}
				class="flex items-center gap-1 px-3 py-2.5 text-sm rounded-lg border border-charcoal-700 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 min-h-[44px]"
				aria-label="Go to next page"
				type="button"
			>
				<span class="hidden sm:inline">Next</span>
				<ChevronRight class="w-4 h-4" />
			</button>
		{/if}
	</nav>

	<!-- Page Info -->
	<div class="flex items-center justify-center">
		<Typography variant="caption" class="text-charcoal-400 text-xs">
			Showing {showingStart.toLocaleString()}-{showingEnd.toLocaleString()} of {totalCount.toLocaleString()} photos
			{#if hasNext}
				<span class="text-charcoal-500">• {remainingPhotos.toLocaleString()} more</span>
			{/if}
		</Typography>
	</div>
</div>
{/if}

<style>
	button {
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Mobile optimizations - Removed min-width override to maintain 44px touch targets */
</style>
