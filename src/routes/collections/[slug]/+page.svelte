<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { ArrowLeft, Award, Sparkles } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';
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

	// Determine if this is Portfolio Excellence for special styling
	let isPortfolio = $derived(data.collection.slug === 'portfolio-excellence');

	// $effect for side effects
	$effect(() => {
		console.log('[Collection Detail] Loaded:', {
			collection: data.collection.title,
			photoCount: data.photos.length,
		});
	});
</script>

<svelte:head>
	<title>{data.collection.title} - Collections</title>
	<meta name="description" content={data.collection.description} />
</svelte:head>

<!-- Page Header -->
<Motion let:motion initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
	<div use:motion class="bg-charcoal-950/95 backdrop-blur-sm border-b border-charcoal-800/50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<!-- Back Navigation -->
			<a
				href="/collections"
				class="inline-flex items-center gap-2 text-sm text-charcoal-400 hover:text-gold-500 transition-colors mb-4"
			>
				<ArrowLeft class="w-4 h-4" />
				<span>Back to Collections</span>
			</a>

			<!-- Collection Header -->
			<div class="mb-4">
				<div class="flex items-center gap-3 mb-2">
					{#if isPortfolio}
						<div class="bg-gold-500/10 border border-gold-500/20 text-gold-500 px-3 py-1 rounded-full flex items-center gap-2 text-xs font-medium">
							<Award class="w-3.5 h-3.5" />
							<span>Excellence</span>
						</div>
					{:else}
						<Sparkles class="w-5 h-5 text-gold-500" />
					{/if}
					<Typography variant="caption" class="text-charcoal-400 text-xs">
						{data.collection.photoCount} photos
					</Typography>
				</div>

				<Typography variant="h1" class="text-2xl lg:text-3xl mb-3">
					{data.collection.title}
				</Typography>

				<Typography variant="body" class="text-charcoal-400 text-base mb-2 italic">
					{data.collection.narrative}
				</Typography>

				<Typography variant="body" class="text-charcoal-500 text-sm max-w-3xl">
					{data.collection.description}
				</Typography>
			</div>
		</div>
	</div>

	<!-- Photo Grid -->
	<div use:motion class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
		{#if data.photos.length > 0}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{#each data.photos as photo, index}
					<Motion
						let:motion
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ ...MOTION.spring.gentle, delay: index * 0.05 }}
					>
						<div use:motion>
							<PhotoCard {photo} {index} onclick={handlePhotoClick} />
						</div>
					</Motion>
				{/each}
			</div>
		{:else}
			<!-- Empty State -->
			<Motion
				let:motion
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={MOTION.spring.gentle}
			>
				<div use:motion class="text-center py-16">
					<Sparkles class="w-16 h-16 text-charcoal-600 mx-auto mb-4" aria-hidden="true" />
					<Typography variant="h3" class="mb-2">No Photos Yet</Typography>
					<Typography variant="body" class="text-charcoal-400 text-sm">
						Photos will appear once they match this collection's criteria
					</Typography>
				</div>
			</Motion>
		{/if}
	</div>
</Motion>

<!-- Photo Detail Modal -->
<PhotoDetailModal bind:open={modalOpen} photo={selectedPhoto} />
