<script lang="ts">
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import Typography from './Typography.svelte';
	import { cn } from '$lib/utils';

	interface Props {
		currentPage: number;
		totalCount: number;
		pageSize: number;
		onPageChange: (page: number) => void;
		class?: string;
	}

	let { currentPage, totalCount, pageSize, onPageChange, class: className }: Props = $props();

	let totalPages = $derived(Math.ceil(totalCount / pageSize));
	let hasNext = $derived(currentPage < totalPages);
	let hasPrev = $derived(currentPage > 1);

	// Calculate page range to show (max 5 pages)
	let pageRange = $derived.by(() => {
		const range: number[] = [];
		const maxPagesToShow = 5;

		if (totalPages <= maxPagesToShow) {
			// Show all pages if total is small
			for (let i = 1; i <= totalPages; i++) {
				range.push(i);
			}
		} else {
			// Show sliding window of pages
			let start = Math.max(1, currentPage - 2);
			let end = Math.min(totalPages, start + maxPagesToShow - 1);

			// Adjust start if we're near the end
			if (end - start < maxPagesToShow - 1) {
				start = Math.max(1, end - maxPagesToShow + 1);
			}

			for (let i = start; i <= end; i++) {
				range.push(i);
			}
		}

		return range;
	});

	function handlePageClick(page: number) {
		if (page !== currentPage && page >= 1 && page <= totalPages) {
			onPageChange(page);
		}
	}
</script>

<nav
	class={cn('flex items-center justify-between gap-4', className)}
	aria-label="Pagination navigation"
>
	<!-- Previous Button -->
	<button
		onclick={() => handlePageClick(currentPage - 1)}
		disabled={!hasPrev}
		class="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 {hasPrev
			? 'bg-charcoal-900/50 border-charcoal-700/50 text-charcoal-200 hover:bg-charcoal-800/50 hover:border-charcoal-600'
			: 'bg-charcoal-950/50 border-charcoal-800/30 text-charcoal-600 cursor-not-allowed'}"
		aria-label="Previous page"
	>
		<ChevronLeft class="w-4 h-4" />
		<Typography variant="caption" class="hidden sm:block font-medium">Previous</Typography>
	</button>

	<!-- Page Numbers -->
	<div class="flex items-center gap-1">
		{#each pageRange as page}
			<button
				onclick={() => handlePageClick(page)}
				class="min-w-[40px] px-3 py-2 rounded-lg border transition-all duration-200 {page ===
				currentPage
					? 'bg-gold-500 border-gold-500 text-charcoal-950 font-medium'
					: 'bg-charcoal-900/50 border-charcoal-700/50 text-charcoal-400 hover:bg-charcoal-800/50 hover:border-charcoal-600 hover:text-charcoal-200'}"
				aria-label="Page {page}"
				aria-current={page === currentPage ? 'page' : undefined}
			>
				<Typography variant="caption" class="font-medium">{page}</Typography>
			</button>
		{/each}
	</div>

	<!-- Next Button -->
	<button
		onclick={() => handlePageClick(currentPage + 1)}
		disabled={!hasNext}
		class="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 {hasNext
			? 'bg-charcoal-900/50 border-charcoal-700/50 text-charcoal-200 hover:bg-charcoal-800/50 hover:border-charcoal-600'
			: 'bg-charcoal-950/50 border-charcoal-800/30 text-charcoal-600 cursor-not-allowed'}"
		aria-label="Next page"
	>
		<Typography variant="caption" class="hidden sm:block font-medium">Next</Typography>
		<ChevronRight class="w-4 h-4" />
	</button>
</nav>

<!-- Page Info -->
<div class="flex justify-center mt-3">
	<Typography variant="caption" class="text-xs text-charcoal-500">
		Page {currentPage} of {totalPages} ({totalCount} total)
	</Typography>
</div>
