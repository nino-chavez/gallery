<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Motion } from 'svelte-motion';
	import { Calendar, ChevronDown, X, Filter, Loader2 } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import PhotoCard from '$lib/components/gallery/PhotoCard.svelte';
	import PhotoDetailModal from '$lib/components/gallery/PhotoDetailModal.svelte';
	import SportFilter from '$lib/components/filters/SportFilter.svelte';
	import CategoryFilter from '$lib/components/filters/CategoryFilter.svelte';
	import YearFilterPill from '$lib/components/filters/YearFilterPill.svelte';
	import FloatingDateIndicator from '$lib/components/ui/FloatingDateIndicator.svelte';
	import JumpControls from '$lib/components/filters/JumpControls.svelte';
	import HorizontalTimeline from '$lib/components/ui/HorizontalTimeline.svelte';
	import BackToTop from '$lib/components/ui/BackToTop.svelte';
	import type { PageData } from './$types';
	import type { Photo } from '$types/photo';
	import type { PhotoMetadataRow } from '$types/database';

	// Svelte 5 Runes: $props to receive server data
	let { data }: { data: PageData } = $props();

	// Modal state
	let modalOpen = $state(false);
	let selectedPhoto = $state<Photo | null>(null);

	// Infinite scroll state
	let loadingMore = $state(false);
	let allGroups = $state(data.timelineGroups);

	// Scroll tracking state
	let isScrolling = $state(false);
	let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
	let currentScrollYear = $state(data.timelineGroups[0]?.year || new Date().getFullYear());
	let currentScrollMonth = $state(data.timelineGroups[0]?.month || new Date().getMonth());
	let currentScrollMonthName = $state(data.timelineGroups[0]?.monthName || '');
	let currentScrollPhotoCount = $state(data.timelineGroups[0]?.count || 0);

	// Scroll progress for scrubber (0-1)
	let scrollProgress = $state(0);

	// Active filters count
	let activeFilterCount = $derived.by(() => {
		let count = 0;
		if (data.selectedYear) count++;
		if (data.selectedSport) count++;
		if (data.selectedCategory) count++;
		return count;
	});

	// Build photo counts map for scrubber
	let photoCounts = $derived.by(() => {
		const counts = new Map<string, number>();
		allGroups.forEach((group) => {
			const key = `${group.year}-${String(group.month).padStart(2, '0')}`;
			counts.set(key, group.count);
		});
		return counts;
	});

	// Use years with counts from server (not derived from allGroups which is paginated)
	let availableYearsWithCounts = $derived(data.yearsWithCounts || []);

	// Transform availableMonths for horizontal timeline
	let availableMonthsWithCounts = $derived.by(() => {
		if (!data.selectedYear) return [];

		const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

		// Get months that exist for the selected year from timeline groups
		const monthsInYear = allGroups
			.filter(g => g.year === data.selectedYear)
			.map(g => ({
				month: g.month,
				monthName: monthNames[g.month],
				photoCount: g.count
			}))
			.sort((a, b) => a.month - b.month);

		return monthsInYear;
	});

	// Transform raw photos to Photo type
	function transformPhoto(raw: PhotoMetadataRow): Photo {
		return {
			id: raw.image_key,
			image_key: raw.image_key,
			image_url: raw.ImageUrl,
			thumbnail_url: raw.ThumbnailUrl,
			original_url: raw.OriginalUrl,
			title: raw.album_name || 'Untitled',
			caption: raw.composition || '',
			keywords: raw.use_cases || [],
			created_at: raw.photo_date || raw.enriched_at,
			metadata: {
				// BUCKET 1: Concrete & Filterable
				play_type: raw.play_type,
				action_intensity: raw.action_intensity || 'medium',
				sport_type: raw.sport_type,
				photo_category: raw.photo_category,
				composition: raw.composition || '',
				time_of_day: raw.time_of_day || '',
				lighting: raw.lighting,
				color_temperature: raw.color_temperature,

				// BUCKET 2: Abstract & Internal
				emotion: raw.emotion || 'focus',
				sharpness: raw.sharpness || 0,
				composition_score: raw.composition_score || 0,
				exposure_accuracy: raw.exposure_accuracy || 0,
				emotional_impact: raw.emotional_impact || 0,
				time_in_game: raw.time_in_game,
				athlete_id: raw.athlete_id,
				event_id: raw.event_id,

				// AI metadata
				ai_provider: raw.ai_provider || 'gemini',
				ai_cost: raw.ai_cost || 0,
				ai_confidence: raw.ai_confidence || 0,
				enriched_at: raw.enriched_at || ''
			}
		};
	}

	function handlePhotoClick(photo: Photo): void {
		selectedPhoto = photo;
		modalOpen = true;
	}

	// Handle sport filter selection
	function handleSportSelect(sport: string | null): void {
		const url = new URL($page.url);
		if (sport) {
			url.searchParams.set('sport', sport);
		} else {
			url.searchParams.delete('sport');
		}
		url.searchParams.delete('cursor'); // Reset pagination
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
		url.searchParams.delete('cursor'); // Reset pagination
		goto(url.toString());
	}

	// Handle year filter selection
	function handleYearSelect(year: number | null): void {
		const url = new URL($page.url);
		if (year) {
			url.searchParams.set('year', year.toString());
		} else {
			url.searchParams.delete('year');
			url.searchParams.delete('month'); // Clear month when clearing year
		}
		url.searchParams.delete('cursor'); // Reset pagination
		goto(url.toString());
	}

	// Handle month selection from horizontal timeline
	function handleMonthSelect(year: number, month: number): void {
		const url = new URL($page.url);
		url.searchParams.set('year', year.toString());
		url.searchParams.set('month', month.toString());
		url.searchParams.delete('cursor'); // Reset pagination
		goto(url.toString());
	}

	// Clear all filters
	function clearAllFilters(event?: MouseEvent): void {
		event?.stopPropagation();
		const url = new URL($page.url);
		url.searchParams.delete('year');
		url.searchParams.delete('month'); // Also clear month
		url.searchParams.delete('sport');
		url.searchParams.delete('category');
		url.searchParams.delete('cursor');
		goto(url.toString());
	}

	// Load more months (infinite scroll)
	async function loadMoreMonths(): Promise<void> {
		if (loadingMore || !data.hasMore) return;

		loadingMore = true;

		try {
			const url = new URL(window.location.href);
			url.searchParams.set('cursor', data.nextCursor!);

			const response = await fetch(url.toString(), {
				headers: { Accept: 'application/json' }
			});

			if (response.ok) {
				const newData = await response.json();
				// Append new groups to existing
				allGroups = [...allGroups, ...newData.timelineGroups];
				data.nextCursor = newData.nextCursor;
				data.hasMore = newData.hasMore;
			}
		} catch (error) {
			console.error('[Timeline] Failed to load more:', error);
		} finally {
			loadingMore = false;
		}
	}

	// Scroll position tracking
	function handleScroll(): void {
		// Show floating indicator
		isScrolling = true;

		// Clear existing timeout
		if (scrollTimeout) {
			clearTimeout(scrollTimeout);
		}

		// Hide indicator after 1 second of no scroll
		scrollTimeout = setTimeout(() => {
			isScrolling = false;
		}, 1000);

		// Update current scroll position
		updateScrollPosition();

		// Calculate scroll progress for scrubber (0-1)
		calculateScrollProgress();
	}

	// Calculate scroll progress (0-1) based on document scroll position
	function calculateScrollProgress(): void {
		const scrollTop = window.scrollY;
		const docHeight = document.documentElement.scrollHeight - window.innerHeight;

		if (docHeight <= 0) {
			scrollProgress = 0;
			return;
		}

		scrollProgress = Math.max(0, Math.min(1, scrollTop / docHeight));
	}

	// Handle scrubber seek (user drags or clicks scrubber)
	function handleScrubberSeek(progress: number, instant = false): void {
		const docHeight = document.documentElement.scrollHeight - window.innerHeight;
		const targetScrollTop = progress * docHeight;

		window.scrollTo({
			top: targetScrollTop,
			behavior: instant ? 'auto' : 'smooth' // Instant during drag, smooth on click
		});
	}

	// Calculate which month/year is currently in view
	function updateScrollPosition(): void {
		const viewportMiddle = window.innerHeight / 2;

		// Find which month section is in the middle of viewport
		const sections = document.querySelectorAll('[data-timeline-group]');

		for (const section of sections) {
			const rect = section.getBoundingClientRect();

			// Check if this section contains the middle of viewport
			if (rect.top <= viewportMiddle && rect.bottom >= viewportMiddle) {
				const year = parseInt(section.getAttribute('data-year') || '0');
				const month = parseInt(section.getAttribute('data-month') || '0');
				const monthName = section.getAttribute('data-month-name') || '';
				const count = parseInt(section.getAttribute('data-count') || '0');

				if (year && monthName) {
					currentScrollYear = year;
					currentScrollMonth = month;
					currentScrollMonthName = monthName;
					currentScrollPhotoCount = count;
				}
				break;
			}
		}
	}

	// Jump to specific date (from controls or scrubber)
	async function jumpToDate(year: number, month: number | null): Promise<void> {
		// Update URL params
		const url = new URL($page.url);
		url.searchParams.set('year', year.toString());

		// Set or clear month param
		if (month !== null) {
			url.searchParams.set('month', month.toString());
		} else {
			// IMPORTANT: Delete month param to show all months in the year
			url.searchParams.delete('month');
		}

		url.searchParams.delete('cursor'); // Reset cursor

		// Navigate (will reload data)
		await goto(url.toString());

		// Scroll to top after reload
		setTimeout(() => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}, 100);
	}

	// Keyboard navigation
	function handleKeyDown(event: KeyboardEvent): void {
		// Ignore if typing in input
		if (event.target instanceof HTMLInputElement) return;

		const currentGroupIndex = allGroups.findIndex(
			(g) => g.year === currentScrollYear && g.month === currentScrollMonth
		);

		if (currentGroupIndex === -1) return;

		switch (event.key) {
			case 'ArrowLeft': // Previous month
				event.preventDefault();
				if (currentGroupIndex > 0) {
					const prevGroup = allGroups[currentGroupIndex - 1];
					jumpToDate(prevGroup.year, prevGroup.month);
				}
				break;

			case 'ArrowRight': // Next month
				event.preventDefault();
				if (currentGroupIndex < allGroups.length - 1) {
					const nextGroup = allGroups[currentGroupIndex + 1];
					jumpToDate(nextGroup.year, nextGroup.month);
				}
				break;

			case 'ArrowUp': // Previous year
				event.preventDefault();
				{
					const targetYear = currentScrollYear - 1;
					const availableYears = availableYearsWithCounts.map(y => y.year);
					if (availableYears.includes(targetYear)) {
						// Pass null to show all months in that year, not just January
						jumpToDate(targetYear, null);
					}
				}
				break;

			case 'ArrowDown': // Next year
				event.preventDefault();
				{
					const targetYear = currentScrollYear + 1;
					const availableYears = availableYearsWithCounts.map(y => y.year);
					if (availableYears.includes(targetYear)) {
						// Pass null to show all months in that year, not just January
						jumpToDate(targetYear, null);
					}
				}
				break;

			case 'Home': // Jump to newest
				event.preventDefault();
				if (allGroups.length > 0) {
					const newest = allGroups[0];
					jumpToDate(newest.year, newest.month);
				}
				break;

			case 'End': // Jump to oldest
				event.preventDefault();
				if (allGroups.length > 0) {
					const oldest = allGroups[allGroups.length - 1];
					jumpToDate(oldest.year, oldest.month);
				}
				break;

			case 't':
			case 'T': // Jump to today
				event.preventDefault();
				{
					const now = new Date();
					jumpToDate(now.getFullYear(), now.getMonth());
				}
				break;
		}
	}

	// Intersection Observer for infinite scroll
	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && data.hasMore && !loadingMore) {
					loadMoreMonths();
				}
			},
			{
				rootMargin: '400px' // Load before user reaches end
			}
		);

		const sentinel = document.querySelector('#load-more-trigger');
		if (sentinel) {
			observer.observe(sentinel);
		}

		// Add scroll listener
		window.addEventListener('scroll', handleScroll);

		// Initial position calculations
		updateScrollPosition();
		calculateScrollProgress();

		return () => {
			observer.disconnect();
			window.removeEventListener('scroll', handleScroll);
			if (scrollTimeout) clearTimeout(scrollTimeout);
		};
	});

	// Reset groups when data changes (filter applied)
	$effect(() => {
		allGroups = data.timelineGroups;
	});
</script>

<svelte:head>
	<title>Timeline - Nino Chavez Gallery</title>
	<meta name="description" content="Browse photos chronologically by upload date" />
</svelte:head>

<svelte:window onkeydown={handleKeyDown} />

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
		availableYears={availableYearsWithCounts}
		availableMonths={availableMonthsWithCounts}
		selectedYear={data.selectedYear}
		selectedMonth={data.selectedMonth}
		onYearSelect={handleYearSelect}
		onMonthSelect={handleMonthSelect}
	/>
</div>

	<!-- Timeline Groups Content (FIXED: removed sticky year/month headers) -->
	<div use:motion class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
		{#each allGroups as group, groupIndex}
			{@const showYearHeader = groupIndex === 0 || group.year !== allGroups[groupIndex - 1].year}

			<Motion
				let:motion
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ ...MOTION.spring.gentle, delay: groupIndex * 0.05 }}
			>
				<div
					use:motion
					class="mb-8"
					data-timeline-group
					data-year={group.year}
					data-month={group.month}
					data-month-name={group.monthName}
					data-count={group.count}
				>
					<!-- Year Indicator (FIXED: non-sticky, inline, minimal) -->
					{#if showYearHeader}
						<div class="py-2 mb-2">
							<span class="text-sm font-medium text-gold-400">{group.year}</span>
						</div>
					{/if}

					<!-- Month Header (FIXED: non-sticky, minimal, no decoration) -->
					<div class="py-1.5 mb-4">
						<div class="flex items-center justify-between">
							<span class="text-sm font-medium text-white">{group.monthName}</span>
							<span class="text-xs text-charcoal-400">{group.count} photos</span>
						</div>
					</div>

					<!-- Photo Grid -->
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{#each group.photos as photo, photoIndex}
							{@const transformedPhoto = transformPhoto(photo)}
							<PhotoCard photo={transformedPhoto} index={photoIndex} onclick={handlePhotoClick} />
						{/each}
					</div>
				</div>
			</Motion>
		{/each}

		<!-- Infinite Scroll Loading Indicator -->
		{#if data.hasMore}
			<div id="load-more-trigger" class="py-8 text-center">
				{#if loadingMore}
					<div class="flex items-center justify-center gap-2 text-charcoal-400">
						<Loader2 class="w-5 h-5 animate-spin" />
						<Typography variant="caption">Loading more months...</Typography>
					</div>
				{/if}
			</div>
		{:else if allGroups.length > 0}
			<div class="py-8 text-center">
				<span class="text-xs text-charcoal-500">End</span>
			</div>
		{/if}

		<!-- Enhanced Empty State with Filter Context -->
		{#if allGroups.length === 0}
			<Card padding="lg" class="text-center">
				{#if activeFilterCount > 0}
					<Filter class="w-16 h-16 text-charcoal-600 mx-auto mb-4" aria-hidden="true" />
					<Typography variant="h3" class="mb-2">No photos match your filters</Typography>
					<Typography variant="body" class="text-charcoal-400 text-sm mb-4">
						No photos found with {activeFilterCount}
						{activeFilterCount === 1 ? 'active filter' : 'active filters'}. Try removing some filters to see
						more results.
					</Typography>
					<Button onclick={clearAllFilters} size="md" variant="outline">
						<X class="w-4 h-4 mr-2" />
						Clear All Filters
					</Button>
				{:else}
					<Calendar class="w-16 h-16 text-charcoal-600 mx-auto mb-4" aria-hidden="true" />
					<Typography variant="h3" class="mb-2">No photos found</Typography>
					<Typography variant="body" class="text-charcoal-400 text-sm">
						No photos available in the timeline
					</Typography>
				{/if}
			</Card>
		{/if}
	</div>

<!-- Floating Date Indicator (appears during scroll) -->
<FloatingDateIndicator
	visible={isScrolling}
	year={currentScrollYear}
	month={currentScrollMonthName}
	photoCount={currentScrollPhotoCount}
/>

<!-- Photo Detail Modal -->
<PhotoDetailModal bind:open={modalOpen} photo={selectedPhoto} />

<!-- Back to Top Button -->
<BackToTop threshold={400} />
