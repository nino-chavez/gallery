<!--
  JumpControls Component - Direct navigation to specific dates in timeline

  Features:
  - Year dropdown (quick jump to year)
  - Month dropdown (within selected year)
  - Quick shortcuts (Today, This Year, etc.)
  - Updates URL params for shareability

  Usage:
  <JumpControls
    years={[2025, 2024, 2023]}
    selectedYear={2024}
    selectedMonth={9}
    onJump={(year, month) => scrollToDate(year, month)}
  />
-->

<script lang="ts">
	import { Calendar } from 'lucide-svelte';

	interface Props {
		years: number[];
		availableMonths?: number[]; // NEW: Only months with photos
		selectedYear: number | null;
		selectedMonth: number | null;
		onJump: (year: number, month: number | null) => void;
	}

	let { years, availableMonths = [], selectedYear, selectedMonth, onJump }: Props = $props();

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

	function handleYearChange(event: Event): void {
		const value = (event.target as HTMLSelectElement).value;

		// If "All years" option selected, need to clear filters differently
		if (value === '') {
			// Clear both year and month by navigating to base timeline URL
			const url = new URL(window.location.href);
			url.searchParams.delete('year');
			url.searchParams.delete('month');
			url.searchParams.delete('cursor');
			window.location.href = url.toString();
		} else {
			const year = parseInt(value);
			// When changing year only, clear month filter to show all months in that year
			onJump(year, null);
		}
	}

	function handleMonthChange(event: Event): void {
		const value = (event.target as HTMLSelectElement).value;

		if (selectedYear) {
			// If "All months" option selected, pass null to show all months
			if (value === '') {
				onJump(selectedYear, null);
			} else {
				const month = parseInt(value);
				onJump(selectedYear, month);
			}
		}
	}

	function jumpToToday(event: MouseEvent): void {
		event.stopPropagation();
		const now = new Date();
		onJump(now.getFullYear(), now.getMonth());
	}

	// Get current date for "Today" button
	const today = new Date();
	const currentYear = today.getFullYear();
	const currentMonth = today.getMonth();
</script>

<div class="flex items-center gap-2 flex-wrap">
	<!-- Year dropdown -->
	{#if years.length > 0}
		<select
			value={selectedYear || ''}
			onchange={handleYearChange}
			class="px-3 py-1.5 text-sm rounded-lg bg-charcoal-900 border border-charcoal-800 hover:border-gold-500 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/50 transition-colors text-white"
			aria-label="Select year"
		>
			<option value="">All years</option>
			{#each years as year}
				<option value={year}>{year}</option>
			{/each}
		</select>
	{/if}

	<!-- Month dropdown (only if year is selected) -->
	{#if selectedYear}
		<select
			value={selectedMonth !== null ? selectedMonth : ''}
			onchange={handleMonthChange}
			class="px-3 py-1.5 text-sm rounded-lg bg-charcoal-900 border border-charcoal-800 hover:border-gold-500 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/50 transition-colors text-white"
			aria-label="Select month"
		>
			<option value="">All months</option>
			{#each months as month, index}
				<!-- Only show months that have photos -->
				{#if availableMonths.length === 0 || availableMonths.includes(index)}
					<option value={index}>{month}</option>
				{/if}
			{/each}
		</select>
	{/if}

	<!-- Today button (if not already viewing current month) -->
	{#if selectedYear !== currentYear || selectedMonth !== currentMonth}
		<button
			onclick={jumpToToday}
			class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-charcoal-900 border border-charcoal-800 hover:border-gold-500 transition-colors text-white"
			aria-label="Jump to today"
			title="Jump to current month"
		>
			<Calendar class="w-3.5 h-3.5" />
			<span class="hidden sm:inline">Today</span>
		</button>
	{/if}
</div>
