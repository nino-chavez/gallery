<!--
  Pagination - Enhanced page-based navigation for photo galleries

  Features:
  - Page number buttons with current page highlighting
  - Previous/Next navigation with disabled states
  - First/Last page shortcuts for large page counts
  - Ellipsis for large page ranges
  - Responsive design (shows fewer buttons on mobile)
  - Keyboard navigation support
  - Accessibility with proper ARIA labels

  Usage:
  <Pagination
    currentPage={data.currentPage}
    totalCount={data.totalCount}
    pageSize={data.pageSize}
    onPageChange={(page) => goto(`/explore?page=${page}`)}
  />
-->

<script lang="ts">
	import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-svelte';
	import Typography from './Typography.svelte';
	import { cn } from '$lib/utils';

	interface Props {
		currentPage: number;
		totalCount: number;
		pageSize: number;
		onPageChange: (page: number) => void;
		class?: string;
		maxVisiblePages?: number;
		showFirstLast?: boolean;
	}

	let {
		currentPage,
		totalCount,
		pageSize,
		onPageChange,
		class: className,
		maxVisiblePages = 7,
		showFirstLast = true
	}: Props = $props();

	let totalPages = $derived(Math.ceil(totalCount / pageSize));
	let hasNext = $derived(currentPage < totalPages);
	let hasPrev = $derived(currentPage > 1);
	let canGoFirst = $derived(showFirstLast && currentPage > 3);
	let canGoLast = $derived(showFirstLast && currentPage < totalPages - 2);

	// Calculate visible page range with smart ellipsis
	let visiblePages = $derived.by(() => {
		if (totalPages <= maxVisiblePages) {
			// Show all pages if total is small
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		const half = Math.floor(maxVisiblePages / 2);
		let start = Math.max(1, currentPage - half);
		let end = Math.min(totalPages, start + maxVisiblePages - 1);

		// Adjust start if we're near the end
		if (end - start + 1 < maxVisiblePages) {
			start = Math.max(1, end - maxVisiblePages + 1);
		}

		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	});

	// Show ellipsis indicators
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

	// Determine if pagination should render
	let shouldRender = $derived(totalPages > 1 && totalCount > 0);
</script>

{#if shouldRender}
<nav
	class={cn('flex items-center justify-center gap-1 sm:gap-2', className)}
	aria-label="Photo gallery pagination"
>
	<!-- Previous Button -->
	{#if hasPrev}
		<button
			onclick={(e) => handlePageClick(currentPage - 1, e)}
			onkeydown={(e) => handleKeyDown(e, currentPage - 1)}
			class="flex items-center gap-1 px-2 sm:px-3 py-2 text-sm rounded-lg border border-charcoal-700 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
			class="flex items-center px-2 sm:px-3 py-2 text-sm rounded-lg border border-charcoal-700 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
			aria-label="Go to first page"
			type="button"
		>
			<ChevronsLeft class="w-4 h-4" />
		</button>
	{/if}

	<!-- Start Ellipsis -->
	{#if showStartEllipsis}
		<span
			class="px-2 sm:px-3 py-2 text-sm text-charcoal-500 select-none"
			aria-hidden="true"
		>
			…
		</span>
	{/if}

	<!-- Page Numbers -->
	{#each visiblePages as page}
		{@const isCurrentPage = page === currentPage}
		<button
			onclick={(e) => handlePageClick(page, e)}
			onkeydown={(e) => handleKeyDown(e, page)}
			class="min-w-[40px] px-3 py-2 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 {isCurrentPage
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
		<span
			class="px-2 sm:px-3 py-2 text-sm text-charcoal-500 select-none"
			aria-hidden="true"
		>
			…
		</span>
	{/if}

	<!-- Last Page (if needed) -->
	{#if canGoLast}
		<button
			onclick={(e) => handlePageClick(totalPages, e)}
			onkeydown={(e) => handleKeyDown(e, totalPages)}
			class="flex items-center px-2 sm:px-3 py-2 text-sm rounded-lg border border-charcoal-700 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
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
			class="flex items-center gap-1 px-2 sm:px-3 py-2 text-sm rounded-lg border border-charcoal-700 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 disabled:opacity-50 disabled:cursor-not-allowed"
			aria-label="Go to next page"
			type="button"
		>
			<span class="hidden sm:inline">Next</span>
			<ChevronRight class="w-4 h-4" />
		</button>
	{/if}
</nav>

<!-- Page Info (shown below pagination) -->
<div class="flex items-center justify-center mt-4">
	<Typography variant="caption" class="text-charcoal-400 text-xs">
		Page {currentPage} of {totalPages} • {totalCount.toLocaleString()} photos
	</Typography>
</div>
{/if}
