<!--
  HorizontalTimeline Component - Apple Photos style timeline navigation

  Two-tier horizontal timeline:
  - Top tier: Years (clickable segments)
  - Bottom tier: Months within selected year (desktop) or Quarters (mobile)

  Click year → Load that year's photos
  Click month → Jump to that month within year
  Click quarter (mobile) → Jump to first month of that quarter

  Mobile Optimization:
  - Shows quarters (Q1-Q4) instead of individual months on mobile (< 768px)
  - Quarters are easier to tap and less compressed
  - Desktop still shows all months for precision

  Props:
  - availableYears: { year: number, photoCount: number }[]
  - availableMonths: { month: number, monthName: string, photoCount: number }[]
  - selectedYear: number | null
  - selectedMonth: number | null
  - onYearSelect: (year: number | null) => void
  - onMonthSelect: (year: number, month: number) => void
-->

<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { MOTION } from '$lib/motion-tokens';

	interface YearData {
		year: number;
		photoCount: number;
	}

	interface MonthData {
		month: number; // 0-11
		monthName: string;
		photoCount: number;
	}

	interface Props {
		availableYears: YearData[];
		availableMonths: MonthData[];
		selectedYear: number | null;
		selectedMonth: number | null;
		onYearSelect: (year: number | null) => void;
		onMonthSelect: (year: number, month: number) => void;
	}

	let {
		availableYears = [],
		availableMonths = [],
		selectedYear = null,
		selectedMonth = null,
		onYearSelect,
		onMonthSelect
	}: Props = $props();

	// Calculate visual width for each year based on photo count
	function getYearWidth(photoCount: number, totalPhotos: number): number {
		// Minimum 80px, proportional to photo count
		const minWidth = 80;
		const maxWidth = 200;
		const proportion = photoCount / totalPhotos;
		return Math.max(minWidth, proportion * 1000);
	}

	let totalPhotos = $derived(availableYears.reduce((sum, y) => sum + y.photoCount, 0));

	// Calculate month width
	function getMonthWidth(photoCount: number, yearTotal: number): number {
		const minWidth = 60;
		const maxWidth = 150;
		const proportion = photoCount / yearTotal;
		return Math.max(minWidth, proportion * 800);
	}

	// Calculate quarter width (larger minimum for better mobile tap targets)
	function getQuarterWidth(photoCount: number, yearTotal: number): number {
		const minWidth = 90; // Larger minimum for mobile
		const maxWidth = 200;
		const proportion = photoCount / yearTotal;
		return Math.max(minWidth, proportion * 1200);
	}

	let yearTotal = $derived(
		selectedYear
			? availableYears.find((y) => y.year === selectedYear)?.photoCount || 0
			: 0
	);

	// Group months into quarters for mobile view
	interface QuarterData {
		quarter: number; // 1-4
		quarterName: string; // "Q1", "Q2", etc.
		months: MonthData[];
		photoCount: number;
		firstMonth: number; // 0-11, for navigation
	}

	let quarters = $derived.by(() => {
		if (availableMonths.length === 0) return [];

		const quartersData: QuarterData[] = [
			{ quarter: 1, quarterName: 'Q1', months: [], photoCount: 0, firstMonth: 0 },
			{ quarter: 2, quarterName: 'Q2', months: [], photoCount: 0, firstMonth: 3 },
			{ quarter: 3, quarterName: 'Q3', months: [], photoCount: 0, firstMonth: 6 },
			{ quarter: 4, quarterName: 'Q4', months: [], photoCount: 0, firstMonth: 9 }
		];

		// Group months by quarter
		for (const month of availableMonths) {
			const quarterIndex = Math.floor(month.month / 3);
			if (quartersData[quarterIndex]) {
				quartersData[quarterIndex].months.push(month);
				quartersData[quarterIndex].photoCount += month.photoCount;
			}
		}

		// Only return quarters that have months
		return quartersData.filter((q) => q.months.length > 0);
	});

	function handleQuarterClick(quarter: QuarterData, event: MouseEvent): void {
		event.stopPropagation();

		if (!selectedYear) return;

		// Navigate to the first month of the quarter (or first available month in quarter)
		const firstAvailableMonth = quarter.months[0]?.month ?? quarter.firstMonth;
		onMonthSelect(selectedYear, firstAvailableMonth);
	}

	function handleYearClick(year: number, event: MouseEvent): void {
		event.stopPropagation();

		if (selectedYear === year) {
			// Clicking same year = deselect (show all years)
			onYearSelect(null);
		} else {
			// Select this year
			onYearSelect(year);
		}
	}

	function handleMonthClick(month: number, event: MouseEvent): void {
		event.stopPropagation();

		if (!selectedYear) return;

		onMonthSelect(selectedYear, month);
	}

	function handleAllYearsClick(event: MouseEvent): void {
		event.stopPropagation();
		onYearSelect(null);
	}
</script>

<!-- Horizontal Timeline Container -->
<Motion let:motion initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
	<div use:motion class="w-full bg-charcoal-900/80 backdrop-blur-sm border-b border-charcoal-800">
		<!-- Years Timeline -->
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
			<!-- "All Years" button when year is selected -->
			{#if selectedYear !== null}
				<div class="mb-2">
					<button
						onclick={handleAllYearsClick}
						class="text-xs text-charcoal-400 hover:text-gold-400 transition-colors flex items-center gap-1"
					>
						<span>←</span>
						<span>All Years</span>
					</button>
				</div>
			{/if}

			<!-- Years Bar -->
			<div class="flex items-stretch gap-1 overflow-x-auto scrollbar-thin scrollbar-thumb-charcoal-700 scrollbar-track-charcoal-900 pb-2">
				{#each availableYears as yearData}
					{@const isSelected = selectedYear === yearData.year}
					{@const width = getYearWidth(yearData.photoCount, totalPhotos)}

					<button
						onclick={(e) => handleYearClick(yearData.year, e)}
						class="relative flex-shrink-0 rounded-lg border transition-all duration-200 overflow-hidden group"
						class:bg-gold-500={isSelected}
						class:text-charcoal-950={isSelected}
						class:border-gold-400={isSelected}
						class:bg-charcoal-800={!isSelected}
						class:text-white={!isSelected}
						class:border-charcoal-700={!isSelected}
						class:hover:border-gold-500={!isSelected}
						class:hover:bg-charcoal-700={!isSelected}
						style="width: {width}px; min-height: 60px;"
						title="{yearData.year} - {yearData.photoCount.toLocaleString()} photos"
					>
						<!-- Year Label -->
						<div class="absolute inset-0 flex flex-col items-center justify-center p-2">
							<span class="text-lg font-bold">{yearData.year}</span>
							<span class="text-xs opacity-75">
								{yearData.photoCount.toLocaleString()}
							</span>
						</div>

						<!-- Photo count bar (visual indicator) -->
						<div
							class="absolute bottom-0 left-0 right-0 h-1 transition-all"
							class:bg-charcoal-950={isSelected}
							class:bg-gold-500={!isSelected}
							class:opacity-30={!isSelected}
							class:group-hover:opacity-60={!isSelected}
						></div>
					</button>
				{/each}
			</div>
		</div>

		<!-- Months/Quarters Timeline (only when year is selected) -->
		{#if selectedYear !== null && availableMonths.length > 0}
			<Motion
				let:motion
				initial={{ opacity: 0, height: 0 }}
				animate={{ opacity: 1, height: 'auto' }}
				exit={{ opacity: 0, height: 0 }}
				transition={MOTION.spring.gentle}
			>
				<div use:motion class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 border-t border-charcoal-800/50 pt-3">
					<div class="flex items-center gap-2 mb-2">
						<span class="text-xs text-charcoal-400 font-medium">
							<span class="md:hidden">Quarters</span>
							<span class="hidden md:inline">Months</span> in {selectedYear}
						</span>
					</div>

					<!-- Quarters Bar (Mobile) -->
					<div class="flex items-stretch gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-charcoal-700 scrollbar-track-charcoal-900 pb-2 md:hidden">
						{#each quarters as quarterData}
							{@const isSelected = selectedMonth !== null && quarterData.months.some(m => m.month === selectedMonth)}
							{@const width = getQuarterWidth(quarterData.photoCount, yearTotal)}

							<button
								onclick={(e) => handleQuarterClick(quarterData, e)}
								class="relative flex-shrink-0 rounded-lg border transition-all duration-200 overflow-hidden group"
								class:bg-gold-500={isSelected}
								class:text-charcoal-950={isSelected}
								class:border-gold-400={isSelected}
								class:unselected-bg={!isSelected}
								class:text-white={!isSelected}
								class:border-charcoal-700={!isSelected}
								class:hover:border-gold-500={!isSelected}
								class:hover:bg-charcoal-700={!isSelected}
								style="width: {width}px; min-height: 56px;"
								title="{quarterData.quarterName} {selectedYear} - {quarterData.photoCount.toLocaleString()} photos"
							>
								<!-- Quarter Label -->
								<div class="absolute inset-0 flex flex-col items-center justify-center p-2">
									<span class="text-base font-bold">{quarterData.quarterName}</span>
									<span class="text-xs opacity-75 mt-0.5">
										{quarterData.photoCount.toLocaleString()}
									</span>
									<span class="text-[10px] opacity-60 mt-0.5">
										{quarterData.months.map(m => m.monthName.substring(0, 3)).join(', ')}
									</span>
								</div>

								<!-- Photo count bar -->
								<div
									class="absolute bottom-0 left-0 right-0 h-1 transition-all"
									class:bg-charcoal-950={isSelected}
									class:bg-gold-500={!isSelected}
									class:opacity-30={!isSelected}
									class:group-hover:opacity-60={!isSelected}
								></div>
							</button>
						{/each}
					</div>

					<!-- Months Bar (Desktop) -->
					<div class="hidden md:flex items-stretch gap-1 overflow-x-auto scrollbar-thin scrollbar-thumb-charcoal-700 scrollbar-track-charcoal-900 pb-2">
						{#each availableMonths as monthData}
							{@const isSelected = selectedMonth === monthData.month}
							{@const width = getMonthWidth(monthData.photoCount, yearTotal)}

							<button
								onclick={(e) => handleMonthClick(monthData.month, e)}
								class="relative flex-shrink-0 rounded-md border transition-all duration-200 overflow-hidden group"
								class:bg-gold-500={isSelected}
								class:text-charcoal-950={isSelected}
								class:border-gold-400={isSelected}
								class:unselected-bg={!isSelected}
								class:text-white={!isSelected}
								class:border-charcoal-700={!isSelected}
								class:hover:border-gold-500={!isSelected}
								class:hover:bg-charcoal-700={!isSelected}
								style="width: {width}px; min-height: 48px;"
								title="{monthData.monthName} {selectedYear} - {monthData.photoCount.toLocaleString()} photos"
							>
								<!-- Month Label -->
								<div class="absolute inset-0 flex flex-col items-center justify-center p-2">
									<span class="text-sm font-semibold">{monthData.monthName}</span>
									<span class="text-xs opacity-75">
										{monthData.photoCount.toLocaleString()}
									</span>
								</div>

								<!-- Photo count bar -->
								<div
									class="absolute bottom-0 left-0 right-0 h-0.5 transition-all"
									class:bg-charcoal-950={isSelected}
									class:bg-gold-500={!isSelected}
									class:opacity-30={!isSelected}
									class:group-hover:opacity-60={!isSelected}
								></div>
							</button>
						{/each}
					</div>
				</div>
			</Motion>
		{/if}
	</div>
</Motion>

<style>
	/* Custom scrollbar styles */
	.scrollbar-thin::-webkit-scrollbar {
		height: 6px;
	}

	.scrollbar-thumb-charcoal-700::-webkit-scrollbar-thumb {
		background-color: rgb(55, 65, 81);
		border-radius: 3px;
	}

	.scrollbar-track-charcoal-900::-webkit-scrollbar-track {
		background-color: rgb(17, 24, 39);
	}

	/* Custom class for unselected background */
	.unselected-bg {
		background-color: rgb(31 41 55 / 0.5);
	}
</style>
