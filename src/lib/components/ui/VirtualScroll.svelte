<!--
  VirtualScroll Component - Render only visible items for performance

  Features:
  - Renders only visible items + buffer
  - Maintains scroll position
  - Handles dynamic item heights
  - Optimized for large lists (1000+ items)

  Usage:
  <VirtualScroll items={photos} itemHeight={300} let:item>
    <PhotoCard photo={item} />
  </VirtualScroll>
-->

<script lang="ts" generics="T">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		items: T[];
		itemHeight: number; // Expected height of each item in pixels
		gap?: number; // Gap between items in pixels
		overscan?: number; // Number of items to render above/below visible area
		class?: string;
		children?: Snippet<[{ item: T; index: number }]>;
	}

	let {
		items,
		itemHeight,
		gap = 24,
		overscan = 3,
		class: className = '',
		children
	}: Props = $props();

	let scrollContainer: HTMLElement | undefined = $state();
	let scrollTop = $state(0);
	let containerHeight = $state(0);

	// Calculate visible range
	const visibleRange = $derived.by(() => {
		const itemHeightWithGap = itemHeight + gap;
		const startIndex = Math.max(0, Math.floor(scrollTop / itemHeightWithGap) - overscan);
		const visibleCount = Math.ceil(containerHeight / itemHeightWithGap) + overscan * 2;
		const endIndex = Math.min(items.length, startIndex + visibleCount);

		return { startIndex, endIndex };
	});

	const visibleItems = $derived(items.slice(visibleRange.startIndex, visibleRange.endIndex));
	const totalHeight = $derived(items.length * (itemHeight + gap) - gap);
	const offsetY = $derived(visibleRange.startIndex * (itemHeight + gap));

	function handleScroll(event: Event) {
		const target = event.target as HTMLElement;
		scrollTop = target.scrollTop;
	}

	onMount(() => {
		if (scrollContainer) {
			containerHeight = scrollContainer.clientHeight;

			// Update container height on resize
			const resizeObserver = new ResizeObserver(() => {
				if (scrollContainer) {
					containerHeight = scrollContainer.clientHeight;
				}
			});

			resizeObserver.observe(scrollContainer);

			return () => {
				resizeObserver.disconnect();
			};
		}
	});
</script>

<div
	bind:this={scrollContainer}
	class="overflow-auto {className}"
	onscroll={handleScroll}
	style="height: 100%;"
>
	<!-- Total height container to maintain scrollbar -->
	<div style="height: {totalHeight}px; position: relative;">
		<!-- Visible items container with offset -->
		<div style="transform: translateY({offsetY}px);">
			{#each visibleItems as item, index (visibleRange.startIndex + index)}
				<div style="height: {itemHeight}px; margin-bottom: {gap}px;">
					{@render children?.({ item, index: visibleRange.startIndex + index })}
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	/* Smooth scrolling for better UX */
	div {
		scroll-behavior: smooth;
	}

	/* Hide scrollbar on webkit browsers for cleaner look (optional) */
	div::-webkit-scrollbar {
		width: 8px;
	}

	div::-webkit-scrollbar-track {
		background: transparent;
	}

	div::-webkit-scrollbar-thumb {
		background: rgba(212, 175, 55, 0.3);
		border-radius: 4px;
	}

	div::-webkit-scrollbar-thumb:hover {
		background: rgba(212, 175, 55, 0.5);
	}
</style>
