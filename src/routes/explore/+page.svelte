<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Camera, ChevronDown } from 'lucide-svelte';
	import { preferences } from '$lib/stores/preferences.svelte';
	import Typography from '$lib/components/ui/Typography.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import PhotoCard from '$lib/components/gallery/PhotoCard.svelte';
	import Lightbox from '$lib/components/gallery/Lightbox.svelte';
	import SportFilter from '$lib/components/filters/SportFilter.svelte';
	import CategoryFilter from '$lib/components/filters/CategoryFilter.svelte';
	import SearchAutocomplete from '$lib/components/search/SearchAutocomplete.svelte';
	import type { PageData } from './$types';
	import type { Photo } from '$types/photo';

	let { data }: { data: PageData } = $props();

	// Lightbox state
	let lightboxOpen = $state(false);
	let selectedPhotoIndex = $state(0);

	// Search
	let searchQuery = $state('');

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

	// Lightbox handlers
	function handlePhotoClick(photo: Photo) {
		const index = displayPhotos.findIndex((p) => p.id === photo.id);
		if (index !== -1) {
			selectedPhotoIndex = index;
			lightboxOpen = true;
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
		searchQuery = query;
	}

	function handleClearSearch() {
		searchQuery = '';
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
			<div class="flex items-center gap-2">
				<Typography variant="h1" class="text-xl lg:text-2xl">Gallery</Typography>
				<Typography variant="caption" class="text-charcoal-400 text-xs">
					{data.totalCount.toLocaleString()}
				</Typography>
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
		</div>

		<!-- Filters -->
		<div class="flex flex-wrap items-center gap-2">
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
			{#each displayPhotos as photo, index (photo.id)}
				<PhotoCard {photo} {index} onclick={handlePhotoClick} priority={index < 8} />
			{/each}
		</div>
	{:else}
		<!-- Empty State -->
		<div class="flex flex-col items-center justify-center py-16 text-center">
			<Camera class="w-16 h-16 text-charcoal-600 mb-4" aria-hidden="true" />
			<Typography variant="h3" class="mb-2">No photos found</Typography>
			<Typography variant="body" class="text-charcoal-400">
				Try adjusting your search or filters
			</Typography>
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
<Lightbox
	bind:open={lightboxOpen}
	photo={displayPhotos[selectedPhotoIndex] || null}
	photos={displayPhotos}
	currentIndex={selectedPhotoIndex}
	onNavigate={handleLightboxNavigate}
/>

<style>
	/* Performance: Use CSS transitions instead of JS animations */
	:global(.photo-card-link) {
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	:global(.photo-card-link:hover) {
		transform: translateY(-4px) scale(1.02);
	}
</style>
