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
	import Lightbox from '$lib/components/gallery/Lightbox.svelte';
	import SportFilter from '$lib/components/filters/SportFilter.svelte';
	import CategoryFilter from '$lib/components/filters/CategoryFilter.svelte';
	import SearchAutocomplete from '$lib/components/search/SearchAutocomplete.svelte';
	import ContextualCursor from '$lib/components/ui/ContextualCursor.svelte'; // P2-3: Contextual cursor
	import { getPhotoQualityScore } from '$lib/photo-utils';
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

	// P2-3: Contextual cursor - track hovered photo
	let hoveredPhoto: Photo | null = $state(null);

	// P2-5: Smart scroll snap state
	let scrollContainer: HTMLElement | null = null;
	let isSnapping = $state(false);
	let lastScrollVelocity = $state(0);

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

	// P2-3: Track hovered photo for contextual cursor
	function handlePhotoHover(photo: Photo | null) {
		hoveredPhoto = photo;
	}

	// P2-5: Smart scroll snap - detect when user stops scrolling
	let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
	function handleScroll(event: Event) {
		if (scrollTimeout) clearTimeout(scrollTimeout);

		// Debounce scroll end detection
		scrollTimeout = setTimeout(() => {
			snapToQualityPhoto();
		}, 150);
	}

	// P2-5: Snap to nearest portfolio-worthy photo with quality >= 8
	function snapToQualityPhoto() {
		if (!scrollContainer) return;
		if (isSnapping) return;

		const scrollTop = window.scrollY;
		const viewportHeight = window.innerHeight;
		const scrollCenter = scrollTop + viewportHeight / 2;

		// Find all portfolio-worthy photos with quality >= 8
		const qualityPhotos = displayPhotos
			.map((photo, index) => ({
				photo,
				index,
				quality: getPhotoQualityScore(photo),
				portfolioWorthy: photo.metadata.portfolio_worthy
			}))
			.filter(item => item.portfolioWorthy && item.quality >= 8);

		if (qualityPhotos.length === 0) return;

		// Find photo cards in DOM
		const photoCards = document.querySelectorAll('[data-photo-card]');
		const qualityCards = qualityPhotos
			.map(item => {
				const card = photoCards[item.index] as HTMLElement;
				if (!card) return null;

				const rect = card.getBoundingClientRect();
				const cardCenter = rect.top + window.scrollY + rect.height / 2;
				const distance = Math.abs(cardCenter - scrollCenter);

				return { card, distance, cardCenter };
			})
			.filter(item => item !== null)
			.sort((a, b) => a!.distance - b!.distance);

		if (qualityCards.length === 0) return;

		const nearest = qualityCards[0]!;

		// Only snap if we're within 300px of the target
		if (nearest.distance < 300) {
			isSnapping = true;
			window.scrollTo({
				top: nearest.cardCenter - viewportHeight / 2,
				behavior: 'smooth'
			});

			setTimeout(() => {
				isSnapping = false;
			}, 500);
		}
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

	// P2-5: Add scroll listener
	$effect(() => {
		if (typeof window === 'undefined') return;

		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
			if (scrollTimeout) clearTimeout(scrollTimeout);
		};
	});

	// PERFORMANCE: Prefetch popular filter combinations
	$effect(() => {
		if (typeof window === 'undefined') return;

		// Prefetch most popular filters after initial load
		const prefetchPopularFilters = async () => {
			// Wait for initial page load to complete
			await new Promise(resolve => setTimeout(resolve, 2000));

			// Most popular filters based on user behavior
			const popularFilters = [
				'/explore?sport=volleyball',
				'/explore?category=action',
				'/explore?sport=volleyball&category=action'
			];

			popularFilters.forEach(url => {
				// Use <link rel="prefetch"> for optimal browser handling
				const link = document.createElement('link');
				link.rel = 'prefetch';
				link.href = url;
				link.as = 'document';
				document.head.appendChild(link);
			});
		};

		prefetchPopularFilters();
	});
</script>

<svelte:head>
	<!-- PERFORMANCE: Resource hints for faster external resource loading -->
	<link rel="dns-prefetch" href="https://ixkyfroynzvgqwhhpjwj.supabase.co" />
	<link rel="preconnect" href="https://ixkyfroynzvgqwhhpjwj.supabase.co" crossorigin="anonymous" />
</svelte:head>

<!-- P2-3: Contextual Cursor - DISABLED for performance -->
<!-- <ContextualCursor currentPhoto={hoveredPhoto} /> -->

<!-- Header Section -->
<Motion
	let:motion
	initial={{ opacity: 0, y: 20 }}
	animate={{ opacity: 1, y: 0 }}
	transition={MOTION.spring.gentle}
>
	<!-- Sticky Header Container -->
	<div use:motion class="sticky top-0 z-20 bg-charcoal-950/95 backdrop-blur-sm border-b border-charcoal-800/50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
			<!-- Title & Description -->
			<div class="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
				<div class="p-2 lg:p-3 rounded-full bg-gold-500/10" aria-hidden="true">
					<Camera class="w-6 h-6 lg:w-8 lg:h-8 text-gold-500" />
				</div>
				<div>
					<Typography variant="h1" class="text-2xl lg:text-4xl">Explore Gallery</Typography>
					<Typography variant="body" class="text-charcoal-300 mt-0.5 lg:mt-1 text-sm lg:text-base">
						{data.totalCount.toLocaleString()} photos from events and sessions
					</Typography>
				</div>
			</div>

			<!-- Filter Row: Combine Sport + Category on tablet+ with proper spacing -->
			<div class="flex flex-col sm:flex-row gap-4 mb-4">
				<!-- Sport Filter -->
				{#if data.sports && data.sports.length > 0}
					<div class="sm:flex-1">
						<SportFilter
							sports={data.sports}
							selectedSport={data.selectedSport}
							onSelect={handleSportSelect}
						/>
					</div>
				{/if}

				<!-- Category Filter -->
				{#if data.categories && data.categories.length > 0}
					<div class="sm:flex-1">
						<CategoryFilter
							categories={data.categories}
							selectedCategory={data.selectedCategory}
							onSelect={handleCategorySelect}
						/>
					</div>
				{/if}
			</div>

			<!-- Search & Sort Controls -->
			<div class="flex flex-col sm:flex-row gap-3 mb-3">
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
					<option value="quality">Quality (Portfolio First)</option>
					<option value="newest">Newest First</option>
					<option value="oldest">Oldest First</option>
					<option value="highest_quality">Highest Quality</option>
					<option value="lowest_quality">Lowest Quality</option>
				</select>
			</div>

			<!-- Photo Count (Hidden on mobile to save space) -->
			<div class="hidden sm:block">
				<Card padding="sm">
					<div class="flex items-center justify-between">
						<Typography variant="body" class="text-charcoal-300">
							Showing {showingStart.toLocaleString()}–{showingEnd.toLocaleString()} of {data.totalCount.toLocaleString()} photos
						</Typography>
						{#if hasMore}
							<Typography variant="caption" class="text-charcoal-400">
								{(data.totalCount - showingEnd).toLocaleString()} more available
							</Typography>
						{/if}
					</div>
				</Card>
			</div>
		</div>
	</div>

	<!-- Main Content Area -->
	<div bind:this={scrollContainer} class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

		<!-- Photo Grid with Skeleton Loader -->
		{#if isFilterChanging || $navigating}
			<!-- Skeleton Loader -->
			<div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
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
			<div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
				{#each displayPhotos as photo, index}
					<div
						data-photo-card
						role="group"
						aria-label="Photo card"
						onmouseenter={() => handlePhotoHover(photo)}
						onmouseleave={() => handlePhotoHover(null)}
					>
						<PhotoCard {photo} {index} onclick={handlePhotoClick} />
					</div>
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
</Motion>

<!-- Lightbox Full-Screen Viewer (NEW - Week 3) -->
<Lightbox
	bind:open={lightboxOpen}
	photo={displayPhotos[selectedPhotoIndex] || null}
	photos={displayPhotos}
	currentIndex={selectedPhotoIndex}
	onNavigate={handleLightboxNavigate}
/>
