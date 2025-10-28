<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Motion } from 'svelte-motion';
	import { Calendar, ChevronLeft, ChevronRight, X, Filter } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import PhotoCard from '$lib/components/gallery/PhotoCard.svelte';
	import PhotoDetailModal from '$lib/components/gallery/PhotoDetailModal.svelte';
	import SportFilter from '$lib/components/filters/SportFilter.svelte';
	import CategoryFilter from '$lib/components/filters/CategoryFilter.svelte';
	import BackToTop from '$lib/components/ui/BackToTop.svelte';
	import type { PageData } from './$types';
	import type { Photo } from '$types/photo';
	import type { PhotoMetadataRow } from '$types/database';

	// Svelte 5 Runes: $props to receive server data
	let { data }: { data: PageData } = $props();

	// Modal state
	let modalOpen = $state(false);
	let selectedPhoto = $state<Photo | null>(null);

	// Active filters count
	let activeFilterCount = $derived.by(() => {
		let count = 0;
		if (data.selectedSport) count++;
		if (data.selectedCategory) count++;
		return count;
	});

	// Transform raw photos to Photo type
	function transformPhoto(raw: PhotoMetadataRow): Photo {
		return {
			id: raw.image_key,
			image_key: raw.image_key,
			image_url: raw.ImageUrl,
			thumbnail_url: raw.ThumbnailUrl || undefined,
			original_url: raw.OriginalUrl || undefined,
			title: raw.album_name || 'Untitled',
			caption: raw.composition || '',
			keywords: raw.use_cases || [],
			created_at: raw.photo_date || raw.enriched_at,
			metadata: {
				// BUCKET 1: Concrete & Filterable
				play_type: (raw.play_type as any) || null,
				action_intensity: (raw.action_intensity as any) || 'medium',
				sport_type: raw.sport_type,
				photo_category: raw.photo_category,
				composition: (raw.composition as any) || '',
				time_of_day: (raw.time_of_day as any) || '',
				lighting: (raw.lighting as any) || undefined,
				color_temperature: (raw.color_temperature as any) || undefined,

				// BUCKET 2: Abstract & Internal
				emotion: (raw.emotion as any) || 'focus',
				sharpness: raw.sharpness || 0,
				composition_score: raw.composition_score || 0,
				exposure_accuracy: raw.exposure_accuracy || 0,
				emotional_impact: raw.emotional_impact || 0,
				time_in_game: (raw.time_in_game as any) || undefined,
				athlete_id: raw.athlete_id || undefined,
				event_id: raw.event_id || undefined,

				// AI metadata
				ai_provider: (raw.ai_provider as any) || 'gemini',
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
		url.searchParams.delete('page'); // Reset pagination
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
		url.searchParams.delete('page'); // Reset pagination
		goto(url.toString());
	}

	// Clear all filters
	function clearAllFilters(event?: MouseEvent): void {
		event?.stopPropagation();
		const url = new URL($page.url);
		url.searchParams.delete('sport');
		url.searchParams.delete('category');
		url.searchParams.delete('page');
		goto(url.toString());
	}

	// Navigate to page
	function goToPage(pageNum: number): void {
		const url = new URL($page.url);
		if (pageNum === 1) {
			url.searchParams.delete('page');
		} else {
			url.searchParams.set('page', pageNum.toString());
		}
		goto(url.toString());
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	// Back to timeline
	function backToTimeline(): void {
		goto(`/timeline?year=${data.year}`);
	}
</script>

<svelte:head>
	<title>{data.monthName} {data.year} - Timeline - Nino Chavez Gallery</title>
	<meta
		name="description"
		content="Browse {data.totalPhotos} photos from {data.monthName} {data.year}"
	/>
</svelte:head>

<!-- Sticky Header with Filters and Breadcrumb -->
<div class="sticky top-0 z-20 bg-charcoal-950/98 backdrop-blur-md border-b border-charcoal-700/80 shadow-lg">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
		<!-- Breadcrumb and Stats -->
		<div class="flex items-center justify-between gap-4 mb-3">
			<div class="flex items-center gap-3">
				<!-- Back Button -->
				<button
					onclick={backToTimeline}
					class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-charcoal-300 hover:text-gold-400 bg-charcoal-800/50 hover:bg-charcoal-800 transition-all rounded-lg border border-charcoal-700/50 hover:border-gold-500/50"
					title="Back to Timeline"
				>
					<ChevronLeft class="w-3.5 h-3.5" />
					<span>Timeline</span>
				</button>

				<div class="flex items-center gap-2">
					<Calendar class="w-4 h-4 text-gold-400" />
					<h1 class="text-lg font-semibold text-white">{data.monthName} {data.year}</h1>
				</div>
				<span class="text-xs text-charcoal-400">{data.totalPhotos.toLocaleString()} photos</span>

				{#if data.stats.primarySport}
					<span class="px-2 py-0.5 bg-gold-500/20 text-gold-400 rounded text-xs font-medium">
						{data.stats.primarySport}
					</span>
				{/if}
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

<!-- Photo Grid -->
<Motion let:motion initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={MOTION.spring.gentle}>
	<div use:motion class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if data.photos.length > 0}
			<!-- Photos Grid -->
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{#each data.photos as photo, index}
					{@const transformedPhoto = transformPhoto(photo)}
					<Motion
						let:motion
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ ...MOTION.spring.gentle, delay: index * 0.02 }}
					>
						<div use:motion>
							<PhotoCard photo={transformedPhoto} {index} onclick={handlePhotoClick} />
						</div>
					</Motion>
				{/each}
			</div>

			<!-- Pagination -->
			{#if data.totalPages > 1}
				<div class="mt-12 flex items-center justify-center gap-2">
					<!-- Previous Page -->
					<Button
						onclick={() => goToPage(data.currentPage - 1)}
						disabled={data.currentPage === 1}
						variant="outline"
						size="sm"
					>
						<ChevronLeft class="w-4 h-4" />
						<span class="sr-only">Previous</span>
					</Button>

					<!-- Page Numbers -->
					<div class="flex items-center gap-1">
						{#each Array.from({ length: data.totalPages }, (_, i) => i + 1) as pageNum}
							{#if pageNum === 1 || pageNum === data.totalPages || (pageNum >= data.currentPage - 1 && pageNum <= data.currentPage + 1)}
								<Button
									onclick={() => goToPage(pageNum)}
									variant={pageNum === data.currentPage ? 'primary' : 'outline'}
									size="sm"
									class="min-w-[2.5rem]"
								>
									{pageNum}
								</Button>
							{:else if pageNum === data.currentPage - 2 || pageNum === data.currentPage + 2}
								<span class="px-2 text-charcoal-500">...</span>
							{/if}
						{/each}
					</div>

					<!-- Next Page -->
					<Button
						onclick={() => goToPage(data.currentPage + 1)}
						disabled={!data.hasMore}
						variant="outline"
						size="sm"
					>
						<ChevronRight class="w-4 h-4" />
						<span class="sr-only">Next</span>
					</Button>
				</div>

				<!-- Page Info -->
				<div class="mt-4 text-center">
					<Typography variant="caption" class="text-charcoal-500">
						Page {data.currentPage} of {data.totalPages} • {data.totalPhotos.toLocaleString()} total
						photos
					</Typography>
				</div>
			{/if}
		{:else}
			<!-- Empty State -->
			<Card padding="lg" class="text-center">
				{#if activeFilterCount > 0}
					<Filter class="w-16 h-16 text-charcoal-600 mx-auto mb-4" aria-hidden="true" />
					<Typography variant="h3" class="mb-2">No photos match your filters</Typography>
					<Typography variant="body" class="text-charcoal-400 text-sm mb-4">
						No photos found in {data.monthName} {data.year} with {activeFilterCount}
						{activeFilterCount === 1 ? 'active filter' : 'active filters'}. Try removing some filters.
					</Typography>
					<Button onclick={clearAllFilters} size="md" variant="outline">
						<X class="w-4 h-4 mr-2" />
						Clear All Filters
					</Button>
				{:else}
					<Calendar class="w-16 h-16 text-charcoal-600 mx-auto mb-4" aria-hidden="true" />
					<Typography variant="h3" class="mb-2">No photos found</Typography>
					<Typography variant="body" class="text-charcoal-400 text-sm mb-4">
						No photos available for {data.monthName} {data.year}
					</Typography>
					<Button onclick={backToTimeline} size="md" variant="outline">
						<ChevronLeft class="w-4 h-4 mr-2" />
						Back to Timeline
					</Button>
				{/if}
			</Card>
		{/if}
	</div>
</Motion>

<!-- Photo Detail Modal -->
<PhotoDetailModal bind:open={modalOpen} photo={selectedPhoto} />

<!-- Back to Top Button -->
<BackToTop threshold={400} />
