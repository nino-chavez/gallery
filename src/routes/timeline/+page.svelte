<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Motion } from 'svelte-motion';
	import { Calendar, ChevronDown } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PhotoCard from '$lib/components/gallery/PhotoCard.svelte';
	import PhotoDetailModal from '$lib/components/gallery/PhotoDetailModal.svelte';
	import SportFilter from '$lib/components/filters/SportFilter.svelte';
	import CategoryFilter from '$lib/components/filters/CategoryFilter.svelte';
	import type { PageData } from './$types';
	import type { Photo } from '$types/photo';

	// Svelte 5 Runes: $props to receive server data
	let { data }: { data: PageData } = $props();

	// Modal state
	let modalOpen = $state(false);
	let selectedPhoto = $state<Photo | null>(null);

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
				sharpness: raw.sharpness || 0,
				exposure_accuracy: raw.exposure_accuracy || 0,
				composition_score: raw.composition_score || 0,
				emotional_impact: raw.emotional_impact || 0,
				portfolio_worthy: raw.portfolio_worthy || false,
				print_ready: raw.print_ready || false,
				social_media_optimized: raw.social_media_optimized || false,
				emotion: raw.emotion || 'focus',
				composition: raw.composition || '',
				time_of_day: raw.time_of_day || '',
				sport_type: raw.sport_type,
				photo_category: raw.photo_category,
				action_type: raw.action_type,
				play_type: raw.play_type,
				action_intensity: raw.action_intensity || 'medium',
				use_cases: raw.use_cases || [],
				ai_provider: raw.ai_provider || 'gemini',
				ai_cost: raw.ai_cost || 0,
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
	function handleYearSelect(event: Event) {
		const select = event.target as HTMLSelectElement;
		const year = select.value;

		const url = new URL($page.url);
		if (year) {
			url.searchParams.set('year', year);
		} else {
			url.searchParams.delete('year');
		}
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
					<Calendar class="w-8 h-8 text-gold-500" />
				</div>
				<div>
					<Typography variant="h1" class="text-4xl">Timeline</Typography>
					<Typography variant="body" class="text-charcoal-300 mt-1">
						{data.totalPhotos.toLocaleString()} photos organized chronologically
					</Typography>
				</div>
			</div>

			<!-- Filters -->
			<div class="space-y-6 mb-8">
				<!-- Year Filter -->
				{#if data.years && data.years.length > 0}
					<div>
						<label for="year-select" class="block text-sm font-medium text-charcoal-300 mb-2">
							Filter by Year
						</label>
						<select
							id="year-select"
							value={data.selectedYear || ''}
							onchange={handleYearSelect}
							class="px-4 py-3 rounded-lg bg-charcoal-900 border border-charcoal-800 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/50 transition-colors text-white cursor-pointer"
						>
							<option value="">All Years</option>
							{#each data.years as year}
								<option value={year}>{year}</option>
							{/each}
						</select>
					</div>
				{/if}

				<!-- Sport Filter -->
				{#if sports && sports.length > 0}
					<SportFilter
						sports={sports}
						selectedSport={data.selectedSport}
						onSelect={handleSportSelect}
					/>
				{/if}

				<!-- Category Filter -->
				{#if categories && categories.length > 0}
					<CategoryFilter
						categories={categories}
						selectedCategory={data.selectedCategory}
						onSelect={handleCategorySelect}
					/>
				{/if}
			</div>

			<!-- Timeline Groups -->
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
								<Typography variant="h2" class="text-2xl">
									{group.monthName} {group.year}
								</Typography>
								<Typography variant="caption" class="text-charcoal-400">
									{group.count} {group.count === 1 ? 'photo' : 'photos'}
								</Typography>
								<div class="h-px flex-1 bg-charcoal-800"></div>
							</div>
						</div>

						<!-- Photo Grid -->
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{#each group.photos as photo, photoIndex}
								{@const transformedPhoto = transformPhoto(photo)}
								<PhotoCard
									photo={transformedPhoto}
									index={photoIndex}
									onclick={handlePhotoClick}
								/>
							{/each}
						</div>

						<!-- Show more indicator if there are more photos -->
						{#if group.count > group.photos.length}
							<div class="mt-6 text-center">
								<Typography variant="caption" class="text-charcoal-400">
									+ {(group.count - group.photos.length).toLocaleString()} more photos from this
									month
								</Typography>
							</div>
						{/if}
					</div>
				</Motion>
			{/each}

			<!-- Empty State -->
			{#if data.timelineGroups.length === 0}
				<Card padding="lg" class="text-center">
					<Calendar class="w-16 h-16 text-charcoal-600 mx-auto mb-4" aria-hidden="true" />
					<Typography variant="h3" class="mb-2">No photos found</Typography>
					<Typography variant="body" class="text-charcoal-400">
						Try adjusting your filters
					</Typography>
				</Card>
			{/if}
		</div>
	</div>
</Motion>

<!-- Photo Detail Modal -->
<PhotoDetailModal bind:open={modalOpen} photo={selectedPhoto} />
