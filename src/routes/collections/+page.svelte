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

<!-- Minimal Header - Content First Design -->
<Motion let:motion initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
	<div use:motion class="sticky top-0 z-20 bg-charcoal-950/95 backdrop-blur-sm border-b border-charcoal-800/50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
			<!-- Compact Header with Inline Stats -->
			<div class="flex items-center gap-3 flex-wrap">
				<Typography variant="h1" class="text-xl lg:text-2xl">Collections</Typography>

				<!-- Inline stats -->
				<div class="flex items-center gap-3 text-xs text-charcoal-400">
					<span class="flex items-center gap-1">
						<Award class="w-3 h-3 text-gold-500" />
						<span class="text-gold-500 font-medium">{data.stats.portfolioCount}</span>
					</span>
					<span>·</span>
					<span>{data.stats.totalCollections} collections</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Collections Content -->
	<div use:motion class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

		<!-- Portfolio Showcase Section -->
		<Motion
			let:motion
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ ...MOTION.spring.gentle, delay: 0.1 }}
		>
			<div use:motion class="mb-12">
				<div class="flex items-center gap-2 mb-4">
					<Award class="w-4 h-4 text-gold-500" aria-hidden="true" />
					<Typography variant="h2" class="text-lg">Portfolio Showcase</Typography>
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
				<div use:motion class="mb-12">
					<!-- Collection Header -->
					<div class="flex items-center gap-2 mb-4">
						<div
							class="w-2 h-2 rounded-full"
							style="background: {emotionPalette.color}"
							aria-hidden="true"
						></div>
						<Typography variant="h2" class="text-lg capitalize">
							{collection.emotion}
						</Typography>
						<Typography variant="caption" class="text-charcoal-400 text-xs">
							{collection.count}
						</Typography>
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
						<Typography variant="body" class="text-charcoal-400 text-sm">
							Collections appear once photos are enriched
						</Typography>
					</Card>
				</div>
			</Motion>
		{/if}
	</div>
</Motion>

<!-- Photo Detail Modal -->
<PhotoDetailModal bind:open={modalOpen} photo={selectedPhoto} />
