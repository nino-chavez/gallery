<!--
  LoadMoreButton - Simple progressive loading button

  A mobile-first, progressive loading pattern that allows users to
  incrementally load more content without page navigation.

  Features:
  - Clear visual indicator of remaining content
  - Loading state with spinner
  - Accessible with proper ARIA labels
  - Full-width on mobile, auto-width on desktop
  - Smooth transitions

  Usage:
  <LoadMoreButton
    hasMore={currentPage < totalPages}
    remaining={remainingCount}
    batchSize={24}
    loading={false}
    onLoadMore={handleLoadMore}
  />
-->

<script lang="ts">
	import { ArrowDown, Loader2 } from 'lucide-svelte';
	import Button from './Button.svelte';
	import Typography from './Typography.svelte';
	import { cn } from '$lib/utils';

	interface Props {
		hasMore: boolean;
		remaining: number;
		batchSize: number;
		loading?: boolean;
		onLoadMore: () => void;
		label?: string;
		class?: string;
	}

	let {
		hasMore,
		remaining,
		batchSize,
		loading = false,
		onLoadMore,
		label = 'Load More',
		class: className
	}: Props = $props();

	let nextBatchSize = $derived(Math.min(remaining, batchSize));

	function handleClick(event: MouseEvent) {
		event.preventDefault();
		if (!loading && hasMore) {
			onLoadMore();
		}
	}
</script>

<div class={cn('flex flex-col items-center gap-3', className)}>
	{#if hasMore}
		<Button
			onclick={handleClick}
			variant="primary"
			size="lg"
			disabled={loading}
			class="min-w-[200px] w-full sm:w-auto max-w-xs group"
			aria-label="{loading ? 'Loading' : `Load ${nextBatchSize} more photos`}"
		>
			<span class="flex items-center gap-2">
				{#if loading}
					<Loader2 class="w-4 h-4 animate-spin" aria-hidden="true" />
					<span>Loading...</span>
				{:else}
					<ArrowDown class="w-4 h-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
					<span>{label}</span>
					<span class="text-sm opacity-75">({nextBatchSize})</span>
				{/if}
			</span>
		</Button>

		<Typography variant="caption" class="text-charcoal-500 text-xs">
			{remaining.toLocaleString()} photos remaining
		</Typography>
	{:else}
		<div class="flex flex-col items-center gap-2 py-4">
			<div class="w-12 h-0.5 bg-gradient-to-r from-transparent via-charcoal-700 to-transparent"></div>
			<Typography variant="caption" class="text-charcoal-400 text-xs">
				All photos loaded
			</Typography>
		</div>
	{/if}
</div>

<!-- Loading announcement for screen readers -->
{#if loading}
	<div role="status" aria-live="polite" class="sr-only">
		Loading more photos
	</div>
{/if}

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
