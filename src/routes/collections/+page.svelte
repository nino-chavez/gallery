<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { Grid, Award, Sparkles } from 'lucide-svelte';
	import { MOTION, EMOTION_PALETTE } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PhotoCard from '$lib/components/gallery/PhotoCard.svelte';
	import PhotoDetailModal from '$lib/components/gallery/PhotoDetailModal.svelte';
	import type { PageData } from './$types';
	import type { Photo } from '$types/photo';

	// Svelte 5 Runes: $props to receive server data
	let { data }: { data: PageData } = $props();

	// Modal state
	let modalOpen = $state(false);
	let selectedPhoto = $state<Photo | null>(null);

	function handlePhotoClick(photo: Photo) {
		selectedPhoto = photo;
		modalOpen = true;
	}

	// $effect for side effects
	$effect(() => {
		console.log('[Collections] Loaded:', {
			portfolioPhotos: data.portfolioPhotos.length,
			emotionCollections: data.emotionCollections.length,
		});
	});
</script>

<div class="min-h-screen p-8">
	<div class="max-w-7xl mx-auto">
		<!-- Header Section -->
		<Motion
			let:motion
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={MOTION.spring.gentle}
		>
			<div use:motion class="mb-12">
				<div class="flex items-center gap-4 mb-4">
					<div class="p-3 rounded-full bg-gold-500/10" aria-hidden="true">
						<Grid class="w-8 h-8 text-gold-500" />
					</div>
					<div>
						<Typography variant="h1" class="text-4xl">Collections</Typography>
						<Typography variant="body" class="text-charcoal-300 mt-1">
							Curated photo collections organized by emotion and theme
						</Typography>
					</div>
				</div>

				<!-- Stats Bar -->
				<div use:motion>
					<Card padding="sm" role="region" aria-label="Collection statistics">
						<div class="flex gap-6">
							<div>
								<div class="text-2xl font-bold text-gold-500" aria-label={`${data.stats.portfolioCount} portfolio photos`}>
									{data.stats.portfolioCount}
								</div>
								<Typography variant="caption">Portfolio Photos</Typography>
							</div>
							<div class="w-px bg-charcoal-700" aria-hidden="true"></div>
							<div>
								<div class="text-2xl font-bold text-white" aria-label={`${data.stats.totalCollections} emotion collections`}>
									{data.stats.totalCollections}
								</div>
								<Typography variant="caption">Emotion Collections</Typography>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</Motion>

		<!-- Portfolio Showcase Section -->
		<Motion
			let:motion
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ ...MOTION.spring.gentle, delay: 0.1 }}
		>
			<div use:motion class="mb-16">
				<div class="flex items-center gap-3 mb-6">
					<Award class="w-6 h-6 text-gold-500" aria-hidden="true" />
					<Typography variant="h2" class="text-2xl">Portfolio Showcase</Typography>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{#each data.portfolioPhotos as photo, index}
						<PhotoCard {photo} {index} onclick={handlePhotoClick} />
					{/each}
				</div>
			</div>
		</Motion>

		<!-- Emotion Collections -->
		{#each data.emotionCollections as collection, collectionIndex}
			{@const emotionPalette = EMOTION_PALETTE[collection.emotion] || EMOTION_PALETTE.triumph}

			<Motion
				let:motion
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ ...MOTION.spring.gentle, delay: 0.2 + collectionIndex * 0.1 }}
			>
				<div use:motion class="mb-16">
					<!-- Collection Header -->
					<div class="flex items-center gap-4 mb-6">
						<div
							class="w-3 h-3 rounded-full"
							style="background: {emotionPalette.color}"
							aria-hidden="true"
						></div>
						<div>
							<Typography variant="h2" class="text-2xl capitalize">
								{collection.emotion} Collection
							</Typography>
							<Typography variant="caption" class="text-charcoal-400">
								{collection.count} photos
							</Typography>
						</div>
					</div>

					<!-- Collection Grid -->
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{#each collection.photos as photo, index}
							<PhotoCard {photo} index={index + collectionIndex * 12} onclick={handlePhotoClick} />
						{/each}
					</div>
				</div>
			</Motion>
		{/each}

		<!-- Empty State -->
		{#if data.emotionCollections.length === 0}
			<Motion
				let:motion
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={MOTION.spring.gentle}
			>
				<div use:motion>
					<Card padding="lg" class="text-center">
						<Sparkles class="w-16 h-16 text-charcoal-600 mx-auto mb-4" aria-hidden="true" />
						<Typography variant="h3" class="mb-2">No Collections Yet</Typography>
						<Typography variant="body" class="text-charcoal-400">
							Collections will appear here once photos are enriched with emotional metadata
						</Typography>
					</Card>
				</div>
			</Motion>
		{/if}
	</div>
</div>

<!-- Photo Detail Modal -->
<PhotoDetailModal bind:open={modalOpen} photo={selectedPhoto} />
