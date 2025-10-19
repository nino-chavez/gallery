<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { navigating } from '$app/stores';
	import { Motion } from 'svelte-motion';
	import { Camera, ChevronDown } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import { preferences } from '$lib/stores/preferences.svelte';
	import Typography from '$lib/components/ui/Typography.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PhotoCard from '$lib/components/gallery/PhotoCard.svelte';
	import Lightbox from '$lib/components/gallery/Lightbox.svelte'; // NEW: Full-screen lightbox viewer
	import SportFilter from '$lib/components/filters/SportFilter.svelte'; // NEW: Sport filter
	import CategoryFilter from '$lib/components/filters/CategoryFilter.svelte'; // NEW: Category filter
	import SearchAutocomplete from '$lib/components/search/SearchAutocomplete.svelte'; // NEW: Search autocomplete
	import type { PageData } from './$types';
	import type { Photo } from '$types/photo';

	// Svelte 5 Runes: $props to receive server data
	let { data }: { data: PageData } = $props();

	// Loading state for filter transitions
	let isFilterChanging = $state(false);

	// Lightbox state (NEW - Week 3)
	let lightboxOpen = $state(false);
	let selectedPhotoIndex = $state(0);

	// Search with autocomplete
	let searchQuery = $state('');

	// Filter photos by search
	let displayPhotos = $derived.by(() => {
		if (!searchQuery.trim()) return data.photos;

		const query = searchQuery.toLowerCase();
		return data.photos.filter((photo) =>
			photo.title?.toLowerCase().includes(query) ||
			photo.caption?.toLowerCase().includes(query) ||
			photo.image_key?.toLowerCase().includes(query)
		);
	});

	// NEW: Open lightbox when photo is clicked
	function handlePhotoClick(photo: Photo) {
		const index = displayPhotos.findIndex((p) => p.id === photo.id);
		if (index !== -1) {
			selectedPhotoIndex = index;
			lightboxOpen = true;
		}
	}

	// NEW: Handle lightbox navigation
	function handleLightboxNavigate(newIndex: number) {
		selectedPhotoIndex = newIndex;
	}

	// NEW: Handle sport filter selection with optimistic loading state
	function handleSportSelect(sport: string | null) {
		isFilterChanging = true;
		const url = new URL($page.url);
		if (sport) {
			url.searchParams.set('sport', sport);
		} else {
			url.searchParams.delete('sport');
		}
		// Reset to page 1 when filtering
		url.searchParams.delete('page');
		goto(url.toString());
	}

	// NEW: Handle category filter selection with optimistic loading state
	function handleCategorySelect(category: string | null) {
		isFilterChanging = true;
		const url = new URL($page.url);
		if (category) {
			url.searchParams.set('category', category);
		} else {
			url.searchParams.delete('category');
		}
		// Reset to page 1 when filtering
		url.searchParams.delete('page');
		goto(url.toString());
	}

	// NEW: Handle search from autocomplete
	function handleSearch(query: string) {
		searchQuery = query;
		// Future: Could trigger server-side search via URL param
		// For now, client-side filtering in displayPhotos works
	}

	// NEW: Handle clear search
	function handleClearSearch() {
		searchQuery = '';
	}

	function handleSortChange(event: Event) {
		isFilterChanging = true;
		const select = event.target as HTMLSelectElement;
		const sortBy = select.value as typeof preferences.sortBy;

		// Save to localStorage
		preferences.setSortBy(sortBy);

		// Update URL and navigate
		const url = new URL($page.url);
		url.searchParams.set('sort', sortBy);
		goto(url.toString());
	}

	function loadMore() {
		isFilterChanging = true;
		const url = new URL($page.url);
		const currentPage = parseInt(url.searchParams.get('page') || '1');
		url.searchParams.set('page', String(currentPage + 1));
		goto(url.toString());
	}

	// Reset loading state when navigation completes
	$effect(() => {
		if (!$navigating) {
			isFilterChanging = false;
		}
	});

	// Calculate showing range
	const showingStart = $derived((data.currentPage - 1) * data.pageSize + 1);
	const showingEnd = $derived(Math.min(data.currentPage * data.pageSize, data.totalCount));
	const hasMore = $derived(showingEnd < data.totalCount);

	// Apply stored preference if no URL sort param exists
	$effect(() => {
		const urlSortParam = $page.url.searchParams.get('sort');
		if (!urlSortParam && data.sortBy !== preferences.sortBy) {
			// User has a stored preference, apply it
			const url = new URL($page.url);
			url.searchParams.set('sort', preferences.sortBy);
			goto(url.toString(), { replaceState: true });
		}
	});
</script>

<!-- Header Section -->
<Motion
	let:motion
	initial={{ opacity: 0, y: 20 }}
	animate={{ opacity: 1, y: 0 }}
	transition={MOTION.spring.gentle}
>
	<div use:motion class="p-8">
		<div class="max-w-7xl mx-auto">
			<!-- Title & Description -->
			<div class="flex items-center gap-4 mb-6">
				<div class="p-3 rounded-full bg-gold-500/10" aria-hidden="true">
					<Camera class="w-8 h-8 text-gold-500" />
				</div>
				<div>
					<Typography variant="h1" class="text-4xl">Explore Gallery</Typography>
					<Typography variant="body" class="text-charcoal-300 mt-1">
						{data.totalCount.toLocaleString()} photos from events and sessions
					</Typography>
				</div>
			</div>

			<!-- Sport Filter (NEW - Week 2) -->
			{#if data.sports && data.sports.length > 0}
				<div class="mb-6">
					<SportFilter
						sports={data.sports}
						selectedSport={data.selectedSport}
						onSelect={handleSportSelect}
					/>
				</div>
			{/if}

			<!-- Category Filter (NEW - Week 2) -->
			{#if data.categories && data.categories.length > 0}
				<div class="mb-6">
					<CategoryFilter
						categories={data.categories}
						selectedCategory={data.selectedCategory}
						onSelect={handleCategorySelect}
					/>
				</div>
			{/if}

			<!-- Search & Sort Controls -->
			<div class="flex flex-col sm:flex-row gap-4 mb-6">
				<!-- Search Bar with Autocomplete (NEW - Week 2) -->
				<div class="flex-1">
					<SearchAutocomplete
						bind:value={searchQuery}
						sportContext={data.selectedSport}
						categoryContext={data.selectedCategory}
						onSearch={handleSearch}
						onClear={handleClearSearch}
					/>
				</div>

				<!-- Sort Dropdown -->
				<select
					value={data.sortBy}
					onchange={handleSortChange}
					class="px-4 py-3 rounded-lg bg-charcoal-900 border border-charcoal-800 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/50 transition-colors text-white cursor-pointer"
					aria-label="Sort photos"
				>
					<option value="newest">Newest First</option>
					<option value="oldest">Oldest First</option>
					<option value="highest_quality">Highest Quality</option>
					<option value="lowest_quality">Lowest Quality</option>
				</select>
			</div>

			<!-- Photo Count -->
			<div class="mb-6">
				<Card padding="sm">
					<div class="flex items-center justify-between">
						<Typography variant="body" class="text-charcoal-300">
							Showing {showingStart.toLocaleString()}–{showingEnd.toLocaleString()} of {data.totalCount.toLocaleString()} photos
						</Typography>
						{#if hasMore}
							<Typography variant="caption" class="text-charcoal-500">
								{(data.totalCount - showingEnd).toLocaleString()} more available
							</Typography>
						{/if}
					</div>
				</Card>
			</div>

			<!-- Photo Grid with Skeleton Loader -->
			{#if isFilterChanging || $navigating}
				<!-- Skeleton Loader -->
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
					{#each Array(24) as _, index}
						<Motion
							let:motion
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: Math.min(index * 0.02, 0.3) }}
						>
							<div
								use:motion
								class="aspect-[4/3] bg-charcoal-800 rounded-lg animate-pulse"
								aria-label="Loading photo {index + 1}"
							>
								<div class="flex items-center justify-center h-full">
									<Camera class="w-12 h-12 text-charcoal-700" aria-hidden="true" />
								</div>
							</div>
						</Motion>
					{/each}
				</div>
			{:else}
				<!-- Actual Photo Grid -->
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
					{#each displayPhotos as photo, index}
						<PhotoCard {photo} {index} onclick={handlePhotoClick} />
					{/each}
				</div>
			{/if}

			<!-- Empty State -->
			{#if displayPhotos.length === 0}
				<Motion
					let:motion
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={MOTION.spring.gentle}
				>
					<div use:motion>
						<Card padding="lg" class="text-center">
							<Camera class="w-16 h-16 text-charcoal-600 mx-auto mb-4" aria-hidden="true" />
							<Typography variant="h3" class="mb-2">No photos found</Typography>
							<Typography variant="body" class="text-charcoal-400">
								Try adjusting your search or filters
							</Typography>
						</Card>
					</div>
				</Motion>
			{/if}

			<!-- Load More Button -->
			{#if hasMore && displayPhotos.length > 0}
				<div class="flex justify-center mt-8">
					<Button size="lg" onclick={loadMore}>
						Load More Photos
						<ChevronDown class="w-5 h-5 ml-2" />
					</Button>
				</div>
			{/if}
		</div>
	</div>
</Motion>

<!-- Lightbox Full-Screen Viewer (NEW - Week 3) -->
<Lightbox
	bind:open={lightboxOpen}
	photo={displayPhotos[selectedPhotoIndex] || null}
	photos={displayPhotos}
	currentIndex={selectedPhotoIndex}
	onNavigate={handleLightboxNavigate}
/>
