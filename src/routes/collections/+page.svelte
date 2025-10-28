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
			totalCollections: data.collections.length,
			totalPhotos: data.stats.totalPhotos,
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
						<Sparkles class="w-3 h-3 text-gold-500" />
						<span class="text-gold-500 font-medium">{data.stats.totalCollections}</span>
					</span>
					<span>·</span>
					<span>{data.stats.totalPhotos} curated photos</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Collections Content -->
	<div use:motion class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

		<!-- Collections Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			{#each data.collections as collection, index}
				{@const isPortfolio = collection.slug === 'portfolio-excellence'}

				<Motion
					let:motion
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ ...MOTION.spring.gentle, delay: index * 0.1 }}
				>
					<a
						use:motion
						href="/collections/{collection.slug}"
						class="group block"
					>
						<Card
							padding="none"
							class="overflow-hidden hover:ring-2 {isPortfolio ? 'hover:ring-gold-500/50' : 'hover:ring-charcoal-600/50'} transition-all duration-300"
						>
							<!-- Cover Photo -->
							{#if collection.coverPhoto}
								<div class="relative aspect-[4/3] overflow-hidden bg-charcoal-900">
									<img
										src={collection.coverPhoto.ThumbnailUrl || collection.coverPhoto.ImageUrl}
										alt="{collection.title} cover"
										class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
										loading="lazy"
									/>
									{#if isPortfolio}
										<div class="absolute top-3 right-3">
											<div class="bg-gold-500/90 backdrop-blur-sm text-charcoal-950 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
												<Award class="w-3 h-3" />
												<span>Excellence</span>
											</div>
										</div>
									{/if}
								</div>
							{:else}
								<div class="aspect-[4/3] bg-charcoal-900 flex items-center justify-center">
									<Sparkles class="w-12 h-12 text-charcoal-700" />
								</div>
							{/if}

							<!-- Collection Info -->
							<div class="p-5">
								<div class="flex items-start justify-between gap-3 mb-2">
									<Typography variant="h3" class="text-base font-medium group-hover:text-gold-500 transition-colors">
										{collection.title}
									</Typography>
									<Typography variant="caption" class="text-charcoal-400 text-xs shrink-0">
										{collection.photoCount}
									</Typography>
								</div>

								<Typography variant="body" class="text-charcoal-400 text-xs mb-3 italic">
									{collection.narrative}
								</Typography>

								<Typography variant="body" class="text-charcoal-500 text-xs line-clamp-2">
									{collection.description}
								</Typography>
							</div>
						</Card>
					</a>
				</Motion>
			{/each}
		</div>

		<!-- Empty State -->
		{#if data.collections.length === 0}
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
