<!--
  TimelineScrubber Component - Vertical timeline navigation (Amazon Photos style)

  Features:
  - Fixed position on right side
  - Shows all years in timeline
  - Month indicators (dots)
  - Drag to scrub through timeline
  - Click year/month to jump
  - Syncs with scroll position
  - Hidden on mobile (<768px)

  Usage:
  <TimelineScrubber
    years={[2025, 2024, 2023]}
    currentYear={2024}
    currentMonth={9}
    photoCounts={new Map([['2024-09', 147]])}
    onJump={(year, month) => scrollToDate(year, month)}
  />
-->

<script lang="ts">
	interface Props {
		years: number[];
		currentYear: number;
		currentMonth: number;
		photoCounts: Map<string, number>;
		onJump: (year: number, month: number) => void;
	}

	let {
		years = [],
		currentYear,
		currentMonth,
		photoCounts = new Map(),
		onJump
	}: Props = $props();

	let scrubberElement: HTMLDivElement | null = $state(null);
	let isDragging = $state(false);

	// Calculate scrubber position (0-100%) based on current year/month
	let scrubberPosition = $derived.by(() => {
		if (years.length === 0) return 0;

		// Find index of current year
		const yearIndex = years.indexOf(currentYear);
		if (yearIndex === -1) return 0;

		// Calculate position within the year (month contribution)
		const monthProgress = currentMonth / 12;

		// Total progress through timeline
		const totalProgress = (yearIndex + monthProgress) / years.length;

		return totalProgress * 100;
	});

	function handleYearClick(year: number, event: MouseEvent): void {
		event.stopPropagation();
		// Jump to first available month of selected year
		const firstMonth = findFirstMonthWithPhotos(year);
		onJump(year, firstMonth);
	}

	function findFirstMonthWithPhotos(year: number): number {
		// Look for first month with photos in this year
		for (let month = 0; month < 12; month++) {
			const key = `${year}-${String(month).padStart(2, '0')}`;
			if (photoCounts.has(key)) {
				return month;
			}
		}
		return 0; // Default to January if no photos found
	}

	function calculateYearMonthFromPosition(percentage: number): { year: number; month: number } {
		// Clamp percentage
		const clampedPercentage = Math.max(0, Math.min(1, percentage));

		// Calculate which year/month this corresponds to
		const totalMonths = years.length * 12;
		const targetMonthIndex = Math.floor(clampedPercentage * totalMonths);
		const targetYearIndex = Math.floor(targetMonthIndex / 12);
		const targetYear = years[Math.min(targetYearIndex, years.length - 1)];
		const targetMonth = targetMonthIndex % 12;

		return { year: targetYear || years[0], month: targetMonth };
	}

	function handleScrubberClick(event: MouseEvent): void {
		if (!scrubberElement || isDragging) return;

		const rect = scrubberElement.getBoundingClientRect();
		const clickY = event.clientY - rect.top;
		const percentage = clickY / rect.height;

		const { year, month } = calculateYearMonthFromPosition(percentage);
		onJump(year, month);
	}

	function handleDragStart(event: MouseEvent): void {
		event.preventDefault();
		isDragging = true;
		document.body.style.cursor = 'grabbing';
		document.body.style.userSelect = 'none';
	}

	function handleDragMove(event: MouseEvent): void {
		if (!isDragging || !scrubberElement) return;

		const rect = scrubberElement.getBoundingClientRect();
		const dragY = event.clientY - rect.top;
		const percentage = dragY / rect.height;

		const { year, month } = calculateYearMonthFromPosition(percentage);

		// Throttle updates during drag
		if (year && month !== undefined) {
			onJump(year, month);
		}
	}

	function handleDragEnd(): void {
		if (isDragging) {
			isDragging = false;
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
		}
	}

	// Add global event listeners
	$effect(() => {
		window.addEventListener('mousemove', handleDragMove);
		window.addEventListener('mouseup', handleDragEnd);

		return () => {
			window.removeEventListener('mousemove', handleDragMove);
			window.removeEventListener('mouseup', handleDragEnd);
		};
	});

	const monthNames = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
</script>

<!-- Hidden on mobile, visible on md+ -->
<div
	class="fixed right-4 top-32 bottom-20 w-20 z-30 hidden md:block"
	role="region"
	aria-label="Timeline scrubber"
>
	<!-- Timeline track -->
	<div
		bind:this={scrubberElement}
		class="relative h-full bg-charcoal-800/50 backdrop-blur-sm rounded-full border border-charcoal-700/50 cursor-pointer hover:bg-charcoal-800/70 transition-colors {isDragging
			? 'bg-charcoal-800/70'
			: ''}"
		onclick={handleScrubberClick}
		onmousedown={handleDragStart}
		role="slider"
		tabindex="0"
		aria-valuemin={years[years.length - 1]}
		aria-valuemax={years[0]}
		aria-valuenow={currentYear}
		aria-valuetext="{getMonthName(currentMonth)} {currentYear}"
	>
		<!-- Current position indicator -->
		<div
			class="absolute w-4 h-4 bg-gold-500 rounded-full left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg border-2 border-charcoal-950 transition-all duration-300 ease-out pointer-events-none {isDragging
				? 'scale-125'
				: ''}"
			style="top: {scrubberPosition}%"
			aria-hidden="true"
		/>

		<!-- Year markers -->
		<div class="absolute inset-0 py-2 pointer-events-none">
			{#each years as year, index}
				{@const yearPosition = (index / Math.max(1, years.length - 1)) * 100}
				{@const isCurrentYear = year === currentYear}
				<button
					class="absolute left-1/2 -translate-x-1/2 text-xs font-medium transition-all pointer-events-auto {isCurrentYear
						? 'text-gold-400 font-bold scale-110'
						: 'text-charcoal-400 hover:text-white'}"
					style="top: {yearPosition}%"
					title="Jump to {year}"
					aria-label="Jump to year {year}"
					onclick={(e) => handleYearClick(year, e)}
				>
					{year}
				</button>
			{/each}
		</div>

		<!-- Month dots for all years -->
		<div class="absolute inset-0 pointer-events-none">
			{#each years as year, yearIndex}
				{@const yearStartPosition = (yearIndex / Math.max(1, years.length - 1)) * 100}
				{@const yearEndPosition = ((yearIndex + 1) / Math.max(1, years.length - 1)) * 100}
				{@const yearHeight = yearEndPosition - yearStartPosition}

				{#each Array(12) as _, monthIndex}
					{@const monthPosition = yearStartPosition + (monthIndex / 12) * yearHeight}
					{@const isCurrentMonth = year === currentYear && monthIndex === currentMonth}
					{@const photoCount = photoCounts.get(`${year}-${String(monthIndex).padStart(2, '0')}`)}

					{#if photoCount}
						<div
							class="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full transition-all {isCurrentMonth
								? 'bg-gold-500 scale-150'
								: 'bg-charcoal-500 hover:bg-charcoal-300'}"
							style="top: {monthPosition}%"
							title="{monthNames[monthIndex]} {year} ({photoCount} photos)"
							aria-hidden="true"
						/>
					{/if}
				{/each}
			{/each}
		</div>
	</div>

	<!-- Helper text -->
	<div class="mt-2 text-center text-xs text-charcoal-500 pointer-events-none">
		{#if isDragging}
			<span class="text-gold-400">Scrubbing...</span>
		{:else}
			<span>Drag to navigate</span>
		{/if}
	</div>
</div>

<script context="module" lang="ts">
	function getMonthName(month: number): string {
		const months = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		];
		return months[month] || 'Unknown';
	}
</script>
