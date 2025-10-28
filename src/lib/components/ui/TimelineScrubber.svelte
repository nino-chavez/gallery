<!--
  TimelineScrubber Component - Vertical timeline navigation (REDESIGNED FROM SCRATCH)

  Architecture:
  - Uses scroll position (0-100%) as source of truth
  - Bidirectional sync: page scroll ↔ scrubber position
  - Smooth dragging with immediate visual feedback
  - Click to jump to any position

  Props:
  - scrollProgress: number (0-1) - Current scroll position from page
  - onSeek: (progress: number) => void - Callback to scroll page to position
  - years: number[] - Available years for markers
  - currentYear: number - Currently visible year
  - currentMonth: number - Currently visible month
-->

<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		scrollProgress: number; // 0-1, from page scroll
		onSeek: (progress: number, instant?: boolean) => void; // Callback to scroll page
		years: number[];
		currentYear: number;
		currentMonth: number;
	}

	let {
		scrollProgress = 0,
		onSeek,
		years = [],
		currentYear = new Date().getFullYear(),
		currentMonth = 0
	}: Props = $props();

	// Component state
	let trackElement: HTMLDivElement | null = $state(null);
	let isDragging = $state(false);
	let dragProgress = $state(0); // 0-1, used during drag for immediate feedback

	// Visual position (0-100%) - use drag position during drag, scroll position otherwise
	let thumbPosition = $derived(isDragging ? dragProgress * 100 : scrollProgress * 100);

	// Month names for display
	const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	/**
	 * Handle click on track - jump to that position
	 */
	function handleTrackClick(event: MouseEvent): void {
		if (!trackElement || isDragging) return;

		const rect = trackElement.getBoundingClientRect();
		const clickY = event.clientY - rect.top;
		const progress = Math.max(0, Math.min(1, clickY / rect.height));

		onSeek(progress);
	}

	/**
	 * Start dragging
	 */
	function handleDragStart(event: MouseEvent): void {
		event.preventDefault();
		event.stopPropagation();

		isDragging = true;
		dragProgress = scrollProgress; // Initialize with current position

		document.body.style.cursor = 'grabbing';
		document.body.style.userSelect = 'none';
	}

	/**
	 * Handle drag movement
	 */
	function handleDragMove(event: MouseEvent): void {
		if (!isDragging || !trackElement) return;

		const rect = trackElement.getBoundingClientRect();
		const dragY = event.clientY - rect.top;
		const progress = Math.max(0, Math.min(1, dragY / rect.height));

		dragProgress = progress; // Update visual position immediately
		onSeek(progress, true); // Tell page to scroll (instant=true for smooth dragging)
	}

	/**
	 * End dragging
	 */
	function handleDragEnd(): void {
		if (!isDragging) return;

		isDragging = false;
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
	}

	/**
	 * Click year label to jump to that year
	 */
	function handleYearClick(year: number, event: MouseEvent): void {
		event.stopPropagation();

		// Find this year's position in the timeline
		const yearIndex = years.indexOf(year);
		if (yearIndex === -1) return;

		// Calculate progress (year at top of its section)
		const progress = yearIndex / Math.max(1, years.length - 1);
		onSeek(progress);
	}

	// Global mouse event listeners for dragging
	onMount(() => {
		const handleMouseMove = (e: MouseEvent): void => handleDragMove(e);
		const handleMouseUp = (): void => handleDragEnd();

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		};
	});
</script>

<!-- Scrubber Container (hidden on mobile) -->
<div
	class="fixed right-4 top-32 bottom-20 w-16 z-30 hidden md:block"
	role="region"
	aria-label="Timeline scrubber"
>
	<!-- Track -->
	<div
		bind:this={trackElement}
		class="relative h-full bg-charcoal-800/50 backdrop-blur-sm rounded-full border border-charcoal-700/50 cursor-pointer hover:bg-charcoal-800/70 transition-colors"
		class:dragging={isDragging}
		onclick={handleTrackClick}
		role="slider"
		tabindex="0"
		aria-valuemin="0"
		aria-valuemax="100"
		aria-valuenow={Math.round(thumbPosition)}
		aria-valuetext="{monthNames[currentMonth]} {currentYear}"
	>
		<!-- Thumb (draggable indicator) -->
		<button
			class="absolute w-5 h-5 bg-gold-500 rounded-full left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg border-2 border-charcoal-950 transition-all duration-150 ease-out z-10 hover:scale-110 active:scale-125 cursor-grab active:cursor-grabbing"
			class:scale-125={isDragging}
			style="top: {thumbPosition}%"
			onmousedown={handleDragStart}
			aria-label="Drag to navigate timeline"
		>
			<!-- Inner dot for better visibility -->
			<div class="absolute inset-1 bg-gold-400 rounded-full"></div>
		</button>

		<!-- Year markers -->
		<div class="absolute inset-0 py-4 pointer-events-none">
			{#each years as year, index}
				{@const yearPosition = (index / Math.max(1, years.length - 1)) * 100}
				{@const isCurrentYear = year === currentYear}

				<button
					class="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold transition-all pointer-events-auto px-1 py-0.5 rounded"
					class:text-gold-400={isCurrentYear}
					class:current-year-bg={isCurrentYear}
					class:text-charcoal-400={!isCurrentYear}
					class:hover:text-white={!isCurrentYear}
					class:scale-110={isCurrentYear}
					style="top: {yearPosition}%"
					onclick={(e) => handleYearClick(year, e)}
					title="Jump to {year}"
					aria-label="Jump to year {year}"
				>
					{year}
				</button>
			{/each}
		</div>

		<!-- Progress fill (shows scrolled portion) -->
		<div
			class="absolute top-0 left-0 right-0 bg-gradient-to-b from-gold-500/20 to-transparent rounded-full pointer-events-none transition-all duration-150"
			style="height: {thumbPosition}%"
		></div>
	</div>

	<!-- Helper text -->
	<div class="mt-2 text-center text-[10px] text-charcoal-500 pointer-events-none">
		{#if isDragging}
			<span class="text-gold-400 font-medium">Scrolling...</span>
		{:else}
			<span>{monthNames[currentMonth]} {currentYear}</span>
		{/if}
	</div>
</div>

<style>
	.dragging {
		background-color: rgb(31 41 55 / 0.7);
	}

	.current-year-bg {
		background-color: rgb(245 158 11 / 0.2);
	}
</style>
