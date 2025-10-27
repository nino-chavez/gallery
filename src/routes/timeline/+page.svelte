<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Motion } from 'svelte-motion';
	import { Calendar, ChevronDown, X, Filter } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import PhotoCard from '$lib/components/gallery/PhotoCard.svelte';
	import PhotoDetailModal from '$lib/components/gallery/PhotoDetailModal.svelte';
	import SportFilter from '$lib/components/filters/SportFilter.svelte';
	import CategoryFilter from '$lib/components/filters/CategoryFilter.svelte';
	import YearFilterPill from '$lib/components/filters/YearFilterPill.svelte';
	import type { PageData } from './$types';
	import type { Photo } from '$types/photo';

	// Svelte 5 Runes: $props to receive server data
	let { data }: { data: PageData } = $props();

	// Modal state
	let modalOpen = $state(false);
	let selectedPhoto = $state<Photo | null>(null);

	// Active filters count
	let activeFilterCount = $derived.by(() => {
		let count = 0;
		if (data.selectedYear) count++;
		if (data.selectedSport) count++;
		if (data.selectedCategory) count++;
		return count;
	});

	// Transform raw photos to Photo type
	function transformPhoto(raw: any): Photo {
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

	function handlePhotoClick(photo: Photo) {
		selectedPhoto = photo;
		modalOpen = true;
	}

	// Handle sport filter selection
	function handleSportSelect(sport: string | null) {
		const url = new URL($page.url);
		if (sport) {
			url.searchParams.set('sport', sport);
		} else {
			url.searchParams.delete('sport');
		}
		goto(url.toString());
	}

	// Handle category filter selection
	function handleCategorySelect(category: string | null) {
		const url = new URL($page.url);
		if (category) {
			url.searchParams.set('category', category);
		} else {
			url.searchParams.delete('category');
		}
		goto(url.toString());
	}

	// Handle year filter selection
	function handleYearSelect(year: number | null) {
		const url = new URL($page.url);
		if (year) {
			url.searchParams.set('year', year.toString());
		} else {
			url.searchParams.delete('year');
		}
		goto(url.toString());
	}

	// Clear all filters
	function clearAllFilters() {
		const url = new URL($page.url);
		url.searchParams.delete('year');
		url.searchParams.delete('sport');
		url.searchParams.delete('category');
		goto(url.toString());
	}

	// Derive sport/category distributions for filters (simplified - from timeline groups)
	const sports = $derived.by(() => {
		const sportCounts = new Map<string, number>();

		data.timelineGroups.forEach((group) => {
			group.photos.forEach((photo: any) => {
				const sport = photo.sport_type;
				if (sport && sport !== 'unknown') {
					sportCounts.set(sport, (sportCounts.get(sport) || 0) + 1);
				}
			});
		});

		const total = Array.from(sportCounts.values()).reduce((sum, count) => sum + count, 0);

		return Array.from(sportCounts.entries())
			.map(([name, count]) => ({
				name,
				count,
				percentage: parseFloat(((count / total) * 100).toFixed(1))
			}))
			.sort((a, b) => b.count - a.count);
	});

	const categories = $derived.by(() => {
		const categoryCounts = new Map<string, number>();

		data.timelineGroups.forEach((group) => {
			group.photos.forEach((photo: any) => {
				const category = photo.photo_category;
				if (category && category !== 'unknown') {
					categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
				}
			});
		});

		const total = Array.from(categoryCounts.values()).reduce((sum, count) => sum + count, 0);

		return Array.from(categoryCounts.entries())
			.map(([name, count]) => ({
				name,
				count,
				percentage: parseFloat(((count / total) * 100).toFixed(1))
			}))
			.sort((a, b) => b.count - a.count);
	});
</script>

<!-- Minimal Header - Content First Design -->
<Motion let:motion initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
	<div use:motion class="sticky top-0 z-20 bg-charcoal-950/95 backdrop-blur-sm border-b border-charcoal-800/50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">

			<!-- Compact Header: Title + Count -->
			<div class="flex items-center gap-2 mb-3">
				<Typography variant="h1" class="text-xl lg:text-2xl">Timeline</Typography>
				<Typography variant="caption" class="text-charcoal-400 text-xs">
					{data.totalPhotos.toLocaleString()}
				</Typography>
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

			<!-- Inline Filters -->
			<div class="flex flex-wrap items-center gap-2">
				{#if data.years && data.years.length > 0}
					<YearFilterPill
						years={data.years}
						selectedYear={data.selectedYear}
						onSelect={handleYearSelect}
					/>
				{/if}

				{#if sports && sports.length > 0}
					<SportFilter
						sports={sports}
						selectedSport={data.selectedSport}
						onSelect={handleSportSelect}
					/>
				{/if}

				{#if categories && categories.length > 0}
					<CategoryFilter
						categories={categories}
						selectedCategory={data.selectedCategory}
						onSelect={handleCategorySelect}
					/>
				{/if}
			</div>
		</div>
	</div>

	<!-- Timeline Groups Content -->
	<div use:motion class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
		{#each data.timelineGroups as group, groupIndex}
			<Motion
				let:motion
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ ...MOTION.spring.gentle, delay: groupIndex * 0.1 }}
			>
				<div use:motion class="mb-12">
					<!-- Timeline Header -->
					<div class="sticky top-16 z-10 bg-charcoal-950/95 backdrop-blur-sm py-4 mb-6">
						<div class="flex items-center gap-4">
							<div class="h-px flex-1 bg-charcoal-800"></div>
							<Typography variant="h2" class="text-xl">
								{group.monthName} {group.year}
							</Typography>
							<Typography variant="caption" class="text-charcoal-400 text-xs">
								{group.count}
							</Typography>
							<div class="h-px flex-1 bg-charcoal-800"></div>
						</div>
					</div>

					<!-- Photo Grid -->
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{#each group.photos as photo, photoIndex}
							{@const transformedPhoto = transformPhoto(photo)}
							<PhotoCard photo={transformedPhoto} index={photoIndex} onclick={handlePhotoClick} />
						{/each}
					</div>

					<!-- Show more indicator if there are more photos -->
					{#if group.count > group.photos.length}
						<div class="mt-6 text-center">
							<Typography variant="caption" class="text-charcoal-400 text-xs">
								+ {(group.count - group.photos.length).toLocaleString()} more
							</Typography>
						</div>
					{/if}
				</div>
			</Motion>
		{/each}

		<!-- Enhanced Empty State with Filter Context -->
		{#if data.timelineGroups.length === 0}
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
</Motion>

<!-- Photo Detail Modal -->
<PhotoDetailModal bind:open={modalOpen} photo={selectedPhoto} />
