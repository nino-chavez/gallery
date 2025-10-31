<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { Sparkles } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PhotoDetailModal from '$lib/components/gallery/PhotoDetailModal.svelte';
	import CollectionCard from '$lib/components/gallery/CollectionCard.svelte';
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

<svelte:head>
	<title>Curated Collections — Nino Chavez Photography</title>
	<meta name="description" content="Explore curated photography collections showcasing the best moments, emotions, and stories from volleyball tournaments and events." />
</svelte:head>

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
	<div use:motion class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

		<!-- Collections Grid - 3x3 on desktop -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each data.collections as collection, index}
				<Motion
					let:motion
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ ...MOTION.spring.gentle, delay: index * 0.05 }}
				>
					<div use:motion>
						<CollectionCard
							{collection}
							href="/collections/{collection.slug}"
						/>
					</div>
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
