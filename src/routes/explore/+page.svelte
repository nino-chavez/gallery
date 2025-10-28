<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Camera, ChevronDown, X, Filter, SlidersHorizontal } from 'lucide-svelte';
	import { preferences } from '$lib/stores/preferences.svelte';
	import { filterNotifications } from '$lib/stores/filter-notifications.svelte';
	import Typography from '$lib/components/ui/Typography.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import PhotoCard from '$lib/components/gallery/PhotoCard.svelte';
	import Lightbox from '$lib/components/gallery/Lightbox.svelte';
	import VisualDataLegend from '$lib/components/ui/VisualDataLegend.svelte';
	import SearchAutocomplete from '$lib/components/search/SearchAutocomplete.svelte';
	import FilterChip from '$lib/components/filters/FilterChip.svelte';
	import ConsolidatedFilter from '$lib/components/filters/ConsolidatedFilter.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import { parseQuery, describeFilters } from '$lib/utils/nlp-query-parser';
	import {
		buildFilterState,
		autoCleanIncompatibleFilters,
		formatClearedFilters,
		type FilterState
	} from '$lib/utils/filter-compatibility';
	import type { PageData } from './$types';
	import type { Photo } from '$types/photo';

	// Label mappings for user-friendly display
	const compositionLabels: Record<string, string> = {
		rule_of_thirds: 'Rule of Thirds',
		leading_lines: 'Leading Lines',
		centered: 'Centered',
		symmetry: 'Symmetry',
		frame_within_frame: 'Framed',
	};

	const timeOfDayLabels: Record<string, string> = {
		golden_hour: 'Golden Hour',
		midday: 'Midday',
		evening: 'Evening',
		night: 'Night',
	};

	const playTypeLabels: Record<string, string> = {
		attack: 'Attack',
		block: 'Block',
		dig: 'Dig',
		set: 'Set',
		serve: 'Serve',
	};

	const intensityLabels: Record<string, string> = {
		low: 'Low',
		medium: 'Medium',
		high: 'High',
		peak: 'Peak',
	};

	const lightingLabels: Record<string, string> = {
		natural: 'Natural',
		backlit: 'Backlit',
		dramatic: 'Dramatic',
		soft: 'Soft',
		artificial: 'Artificial',
	};

	const colorTempLabels: Record<string, string> = {
		warm: 'Warm',
		neutral: 'Neutral',
		cool: 'Cool',
	};

	let { data }: { data: PageData } = $props();

	// Lightbox state
	let lightboxOpen = $state(false);
	let selectedPhotoIndex = $state(0);

	// Search
	let searchQuery = $state('');

	// Parse current search query for detected filters
	let detectedFilters = $derived.by(() => {
		if (!searchQuery.trim()) return null;
		const parsed = parseQuery(searchQuery);
		return Object.keys(parsed).length > 0 ? describeFilters(parsed) : null;
	});

	// Filter photos by search (client-side only)
	let displayPhotos = $derived.by(() => {
		if (!searchQuery.trim()) return data.photos;

		const query = searchQuery.toLowerCase();
		return data.photos.filter((photo) =>
			photo.title?.toLowerCase().includes(query) ||
			photo.caption?.toLowerCase().includes(query) ||
			photo.image_key?.toLowerCase().includes(query)
		);
	});

	// Active filters count
	let activeFilterCount = $derived.by(() => {
		let count = 0;
		if (data.selectedSport) count++;
		if (data.selectedCategory) count++;
		if (data.selectedPlayType) count++;
		if (data.selectedIntensity) count++;
		if (data.selectedLighting && data.selectedLighting.length > 0) count += data.selectedLighting.length;
		if (data.selectedColorTemp) count++;
		if (data.selectedTimeOfDay) count++;
		if (data.selectedComposition) count++;
		return count;
	});

	// Mobile filter drawer state
	let mobileFiltersOpen = $state(false);

	// Diagnostic: Check for duplicate or missing IDs
	$effect(() => {
		if (displayPhotos.length > 0) {
			const ids = displayPhotos.map(p => p.id);
			const imageKeys = displayPhotos.map(p => p.image_key);
			const uniqueIds = new Set(ids);
			const uniqueImageKeys = new Set(imageKeys);

			if (uniqueIds.size !== displayPhotos.length) {
				console.warn('[DIAGNOSTIC] Duplicate or missing photo IDs detected!', {
					totalPhotos: displayPhotos.length,
					uniqueIds: uniqueIds.size,
					missingIds: ids.filter(id => !id).length,
					duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index)
				});
			}

			if (uniqueImageKeys.size !== displayPhotos.length) {
				console.warn('[DIAGNOSTIC] Duplicate image_keys detected!', {
					totalPhotos: displayPhotos.length,
					uniqueImageKeys: uniqueImageKeys.size
				});
			}
		}
	});

	// Zero results detection (Phase 4: Auto-Clear notification)
	$effect(() => {
		// Only show zero results warning if filters are active AND no photos
		if (activeFilterCount > 0 && displayPhotos.length === 0) {
			filterNotifications.notifyZeroResults();
		}
	});

	// Auto-clear notification (Phase 4: Show notification when server cleared filters)
	$effect(() => {
		if (data.clearedFilters && data.clearedFilters.length > 0) {
			filterNotifications.notifyAutoCleared(
				data.clearedFilters,
				'incompatible with current filters'
			);
		}
	});

	// Lightbox handlers
	function handlePhotoClick(photo: Photo) {
		console.log('[handlePhotoClick] Clicked photo:', {
			id: photo.id,
			image_key: photo.image_key
		});

		// Use image_key for matching (more reliable than id)
		const index = displayPhotos.findIndex((p) => p.image_key === photo.image_key);
		console.log('[handlePhotoClick] Found index:', index, 'of', displayPhotos.length);

		if (index !== -1) {
			selectedPhotoIndex = index;
			lightboxOpen = true;
			console.log('[handlePhotoClick] Opening lightbox at index', selectedPhotoIndex);
		} else {
			console.error('[handlePhotoClick] Photo not found in displayPhotos!', {
				clickedImageKey: photo.image_key,
				displayPhotoKeys: displayPhotos.map(p => p.image_key).slice(0, 5)
			});
		}
	}

	function handleLightboxNavigate(newIndex: number) {
		selectedPhotoIndex = newIndex;
	}

	// Filter handlers
	function handleSportSelect(sport: string | null) {
		const url = new URL($page.url);
		if (sport) {
			url.searchParams.set('sport', sport);
		} else {
			url.searchParams.delete('sport');
		}
		url.searchParams.delete('page');
		goto(url.toString());
	}

	function handleCategorySelect(category: string | null) {
		const url = new URL($page.url);
		if (category) {
			url.searchParams.set('category', category);
		} else {
			url.searchParams.delete('category');
		}
		url.searchParams.delete('page');
		goto(url.toString());
	}

	function handleSearch(query: string) {
		// Parse the query for NLP filters
		const parsedFilters = parseQuery(query);

		// If we detected filters, apply them to URL
		if (Object.keys(parsedFilters).length > 0) {
			const url = new URL($page.url);

			// Apply detected filters
			if (parsedFilters.sport) url.searchParams.set('sport', parsedFilters.sport);
			if (parsedFilters.category) url.searchParams.set('category', parsedFilters.category);
			if (parsedFilters.play_type) url.searchParams.set('play_type', parsedFilters.play_type);
			if (parsedFilters.action_intensity)
				url.searchParams.set('intensity', parsedFilters.action_intensity);
			if (parsedFilters.lighting && parsedFilters.lighting.length > 0) {
				url.searchParams.delete('lighting');
				parsedFilters.lighting.forEach((l) => url.searchParams.append('lighting', l));
			}
			if (parsedFilters.color_temperature)
				url.searchParams.set('color_temp', parsedFilters.color_temperature);
			if (parsedFilters.time_of_day) url.searchParams.set('time_of_day', parsedFilters.time_of_day);
			if (parsedFilters.composition) url.searchParams.set('composition', parsedFilters.composition);

			url.searchParams.delete('page');
			goto(url.toString());

			// Keep the query for text display but filters are now active
			searchQuery = query;
		} else {
			// No NLP filters detected, just use as client-side text search
			searchQuery = query;
		}
	}

	function handleClearSearch() {
		searchQuery = '';
	}

	function handlePlayTypeSelect(playType: string | null) {
		const url = new URL($page.url);
		if (playType) {
			url.searchParams.set('play_type', playType);
		} else {
			url.searchParams.delete('play_type');
		}
		url.searchParams.delete('page');
		goto(url.toString());
	}

	function handleIntensitySelect(intensity: string | null) {
		const url = new URL($page.url);
		if (intensity) {
			url.searchParams.set('intensity', intensity);
		} else {
			url.searchParams.delete('intensity');
		}
		url.searchParams.delete('page');
		goto(url.toString());
	}

	function handleLightingSelect(lighting: string[] | null) {
		const url = new URL($page.url);
		url.searchParams.delete('lighting'); // Clear existing
		if (lighting && lighting.length > 0) {
			lighting.forEach((l) => url.searchParams.append('lighting', l));
		}
		url.searchParams.delete('page');
		goto(url.toString());
	}

	function handleColorTempSelect(temp: string | null) {
		const url = new URL($page.url);
		if (temp) {
			url.searchParams.set('color_temp', temp);
		} else {
			url.searchParams.delete('color_temp');
		}
		url.searchParams.delete('page');
		goto(url.toString());
	}

	function handleTimeOfDaySelect(time: string | null) {
		const url = new URL($page.url);
		if (time) {
			url.searchParams.set('time_of_day', time);
		} else {
			url.searchParams.delete('time_of_day');
		}
		url.searchParams.delete('page');
		goto(url.toString());
	}

	function handleCompositionSelect(composition: string | null) {
		const url = new URL($page.url);
		if (composition) {
			url.searchParams.set('composition', composition);
		} else {
			url.searchParams.delete('composition');
		}
		url.searchParams.delete('page');
		goto(url.toString());
	}

	function clearAllFilters(event?: MouseEvent) {
		event?.stopPropagation();
		const url = new URL($page.url);
		// Remove all filter params
		url.searchParams.delete('sport');
		url.searchParams.delete('category');
		url.searchParams.delete('play_type');
		url.searchParams.delete('intensity');
		url.searchParams.delete('lighting');
		url.searchParams.delete('color_temp');
		url.searchParams.delete('time_of_day');
		url.searchParams.delete('composition');
		url.searchParams.delete('page');
		// Keep sort preference
		goto(url.toString());
	}

	function handleSortChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		const sortBy = select.value as typeof preferences.sortBy;
		preferences.setSortBy(sortBy);

		const url = new URL($page.url);
		url.searchParams.set('sort', sortBy);
		goto(url.toString());
	}

	function loadMore() {
		const url = new URL($page.url);
		const currentPage = parseInt(url.searchParams.get('page') || '1');
		url.searchParams.set('page', String(currentPage + 1));
		goto(url.toString());
	}

	// Pagination
	const showingStart = $derived((data.currentPage - 1) * data.pageSize + 1);
	const showingEnd = $derived(Math.min(data.currentPage * data.pageSize, data.totalCount));
	const hasMore = $derived(showingEnd < data.totalCount);

	// Apply stored preference if no URL sort param
	$effect(() => {
		const urlSortParam = $page.url.searchParams.get('sort');
		if (!urlSortParam && data.sortBy !== preferences.sortBy) {
			const url = new URL($page.url);
			url.searchParams.set('sort', preferences.sortBy);
			goto(url.toString(), { replaceState: true });
		}
	});
</script>

<!-- Minimal Sticky Header -->
<div class="sticky top-0 z-20 bg-charcoal-950/95 backdrop-blur-sm border-b border-charcoal-800/50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
		<!-- Title + Count -->
		<div class="flex items-center justify-between gap-4 mb-3">
			<div class="flex items-center gap-3">
				<Typography variant="h1" class="text-xl lg:text-2xl">Gallery</Typography>
				<span class="px-2.5 py-1 rounded-full bg-charcoal-800/60 border border-charcoal-700 text-charcoal-300 text-xs font-medium">
					{data.totalCount.toLocaleString()} photos
				</span>
			</div>

			<!-- Desktop Search -->
			<div class="hidden md:block flex-1 max-w-md">
				<SearchAutocomplete
					bind:value={searchQuery}
					sportContext={data.selectedSport}
					categoryContext={data.selectedCategory}
					onSearch={handleSearch}
					onClear={handleClearSearch}
				/>
			</div>
		</div>

		<!-- Mobile Search -->
		<div class="md:hidden mb-3">
			<SearchAutocomplete
				bind:value={searchQuery}
				sportContext={data.selectedSport}
				categoryContext={data.selectedCategory}
				onSearch={handleSearch}
				onClear={handleClearSearch}
			/>

			<!-- NLP Filter Detection Indicator -->
			{#if detectedFilters}
				<div class="mt-2 px-3 py-2 bg-gold-500/10 border border-gold-500/20 rounded-lg">
					<Typography variant="caption" class="text-xs text-gold-400">
						<span class="font-medium">Detected filters:</span>
						{detectedFilters}
					</Typography>
				</div>
			{/if}
		</div>

		<!-- Filters Header with Clear All Button -->
		<div class="flex items-center justify-between gap-2 mb-2">
			<div class="flex items-center gap-2">
				<Typography variant="label" class="text-charcoal-300 text-xs">
					Filters
					{#if activeFilterCount > 0}
						<span class="ml-1 px-2 py-0.5 bg-gold-500/20 text-gold-400 rounded-full text-xs">
							{activeFilterCount}
						</span>
					{/if}
				</Typography>
			</div>

			{#if activeFilterCount > 0}
				<button
					onclick={clearAllFilters}
					class="inline-flex items-center gap-1 px-2 py-1 text-xs text-charcoal-400 hover:text-gold-400 transition-colors"
				>
					<X class="w-3 h-3" />
					<span>Clear All</span>
				</button>
			{/if}
		</div>

		<!-- Active Filter Chips (NEW: P0 Enhancement) -->
		{#if activeFilterCount > 0}
			<div class="flex flex-wrap items-center gap-2 mb-3 p-2 rounded-lg bg-charcoal-900/50 border border-charcoal-800/30">
				<Typography variant="caption" class="text-charcoal-400 text-xs font-medium">Active:</Typography>

				{#if data.selectedSport}
					<FilterChip
						label="Sport: {data.selectedSport}"
						onRemove={() => handleSportSelect(null)}
					/>
				{/if}

				{#if data.selectedCategory}
					<FilterChip
						label="Category: {data.selectedCategory}"
						onRemove={() => handleCategorySelect(null)}
					/>
				{/if}

				{#if data.selectedPlayType}
					<FilterChip
						label="Play: {playTypeLabels[data.selectedPlayType] || data.selectedPlayType}"
						onRemove={() => handlePlayTypeSelect(null)}
					/>
				{/if}

				{#if data.selectedIntensity}
					<FilterChip
						label="Intensity: {intensityLabels[data.selectedIntensity] || data.selectedIntensity}"
						onRemove={() => handleIntensitySelect(null)}
					/>
				{/if}

				{#if data.selectedLighting && data.selectedLighting.length > 0}
					{#each data.selectedLighting as lighting}
						<FilterChip
							label="Lighting: {lightingLabels[lighting] || lighting}"
							onRemove={() => {
								const remaining = data.selectedLighting?.filter(l => l !== lighting) || [];
								handleLightingSelect(remaining.length > 0 ? remaining : null);
							}}
						/>
					{/each}
				{/if}

				{#if data.selectedColorTemp}
					<FilterChip
						label="Color: {colorTempLabels[data.selectedColorTemp] || data.selectedColorTemp}"
						onRemove={() => handleColorTempSelect(null)}
					/>
				{/if}

				{#if data.selectedTimeOfDay}
					<FilterChip
						label="Time: {timeOfDayLabels[data.selectedTimeOfDay] || data.selectedTimeOfDay}"
						onRemove={() => handleTimeOfDaySelect(null)}
					/>
				{/if}

				{#if data.selectedComposition}
					<FilterChip
						label="Composition: {compositionLabels[data.selectedComposition] || data.selectedComposition}"
						onRemove={() => handleCompositionSelect(null)}
					/>
				{/if}
			</div>
		{/if}

		<!-- Consolidated Filters (Reduces component count from 8 to 2) -->
		{#if data.sports && data.sports.length > 0 && data.categories && data.categories.length > 0}
			<ConsolidatedFilter
				sports={data.sports}
				categories={data.categories}
				selectedSport={data.selectedSport}
				selectedCategory={data.selectedCategory}
				selectedPlayType={data.selectedPlayType}
				selectedIntensity={data.selectedIntensity}
				selectedLighting={data.selectedLighting}
				selectedColorTemp={data.selectedColorTemp}
				selectedTimeOfDay={data.selectedTimeOfDay}
				selectedComposition={data.selectedComposition}
				onSportSelect={handleSportSelect}
				onCategorySelect={handleCategorySelect}
				onPlayTypeSelect={handlePlayTypeSelect}
				onIntensitySelect={handleIntensitySelect}
				onLightingSelect={handleLightingSelect}
				onColorTempSelect={handleColorTempSelect}
				onTimeOfDaySelect={handleTimeOfDaySelect}
				onCompositionSelect={handleCompositionSelect}
				filterCounts={data.filterCounts}
			/>
		{/if}
	</div>
</div>

<!-- Main Content -->
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
	<!-- Sort & Count -->
	<div class="flex items-center justify-between mb-4">
		<Typography variant="caption" class="text-charcoal-400 text-xs">
			{showingStart.toLocaleString()}–{showingEnd.toLocaleString()} of {data.totalCount.toLocaleString()}
		</Typography>

		<select
			value={data.sortBy}
			onchange={handleSortChange}
			class="px-3 py-1.5 text-xs rounded-md bg-charcoal-900 border border-charcoal-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition-colors text-white cursor-pointer"
			aria-label="Sort photos"
		>
			<option value="quality">Best Photos First</option>
			<option value="newest">Newest</option>
			<option value="oldest">Oldest</option>
			<option value="highest_quality">Highest Quality</option>
			<option value="lowest_quality">Lowest Quality</option>
		</select>
	</div>

	<!-- Photo Grid -->
	{#if displayPhotos.length > 0}
		<div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
			{#each displayPhotos as photo, index (photo.image_key)}
				<PhotoCard {photo} {index} onclick={handlePhotoClick} priority={index < 8} />
			{/each}
		</div>
	{:else}
		<!-- Enhanced Empty State with Filter Context -->
		<div class="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
			{#if activeFilterCount > 0}
				<Filter class="w-16 h-16 text-charcoal-600 mb-4" aria-hidden="true" />
				<Typography variant="h3" class="mb-2">No photos match your filters</Typography>
				<Typography variant="body" class="text-charcoal-400 mb-4">
					No photos found with {activeFilterCount}
					{activeFilterCount === 1 ? 'active filter' : 'active filters'}. Try removing some filters to see
					more results.
				</Typography>
				<Button onclick={clearAllFilters} size="md" variant="outline">
					<X class="w-4 h-4 mr-2" />
					Clear All Filters
				</Button>
			{:else}
				<Camera class="w-16 h-16 text-charcoal-600 mb-4" aria-hidden="true" />
				<Typography variant="h3" class="mb-2">No photos found</Typography>
				<Typography variant="body" class="text-charcoal-400">
					{#if searchQuery.trim()}
						No photos match your search "{searchQuery}". Try a different search term.
					{:else}
						The gallery is empty. Check back later for new photos.
					{/if}
				</Typography>
			{/if}
		</div>
	{/if}

	<!-- Load More -->
	{#if hasMore && displayPhotos.length > 0}
		<div class="flex justify-center mt-8">
			<Button size="lg" onclick={loadMore}>
				Load More Photos
				<ChevronDown class="w-5 h-5 ml-2" />
			</Button>
		</div>
	{/if}
</div>

<!-- Lightbox -->
{#snippet debugLightbox()}
	{@const currentPhoto = displayPhotos[selectedPhotoIndex] || null}
	{@const _ = console.log('[explore] Lightbox props: open=', lightboxOpen, 'photo=', currentPhoto?.id, 'selectedPhotoIndex=', selectedPhotoIndex, 'displayPhotos.length=', displayPhotos.length)}
{/snippet}
{@render debugLightbox()}
<Lightbox
	bind:open={lightboxOpen}
	photo={displayPhotos[selectedPhotoIndex] || null}
	photos={displayPhotos}
	currentIndex={selectedPhotoIndex}
	onNavigate={handleLightboxNavigate}
/>

<!-- Visual Data Legend (explains hover badge system) -->
<VisualDataLegend />

<!-- Toast Notifications Container (Phase 4: Auto-Clear Notifications) -->
<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2" role="status" aria-live="polite" aria-atomic="true">
	{#each filterNotifications.all as notification (notification.id)}
		<Toast
			variant={notification.variant}
			duration={notification.duration}
			onClose={() => filterNotifications.remove(notification.id)}
		>
			{notification.message}
		</Toast>
	{/each}
</div>

<style>
	/* Performance: Use CSS transitions instead of JS animations */
	:global(.photo-card-link) {
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	:global(.photo-card-link:hover) {
		transform: translateY(-4px) scale(1.02);
	}
</style>
