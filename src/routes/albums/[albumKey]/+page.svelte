<script lang="ts">
	import { goto } from '$app/navigation';
	import { Motion } from 'svelte-motion';
	import { FolderOpen, ChevronRight } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
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

	// Simple search (client-side)
	let searchQuery = $state('');

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

	function handlePhotoClick(photo: Photo) {
		selectedPhoto = photo;
		modalOpen = true;
	}

	function goBackToAlbums() {
		goto('/albums');
	}
</script>

<!-- Minimal Header - Content First Design -->
<Motion let:motion initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
	<div use:motion class="sticky top-0 z-20 bg-charcoal-950/95 backdrop-blur-sm border-b border-charcoal-800/50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">

			<!-- Compact Breadcrumb Navigation -->
			<nav aria-label="Breadcrumb" class="mb-2">
				<ol class="flex items-center gap-1 text-xs text-charcoal-400">
					<li>
						<button
							type="button"
							onclick={() => goto('/')}
							class="hover:text-gold-500 transition-colors"
							aria-label="Navigate to home"
						>
							Home
						</button>
					</li>
					<li aria-hidden="true">
						<ChevronRight class="w-3 h-3" />
					</li>
					<li>
						<button
							type="button"
							onclick={goBackToAlbums}
							class="hover:text-gold-500 transition-colors"
							aria-label="Navigate to albums list"
						>
							Albums
						</button>
					</li>
					<li aria-hidden="true">
						<ChevronRight class="w-3 h-3" />
					</li>
					<li>
						<span class="text-white font-medium truncate max-w-[200px] md:max-w-none" aria-current="page">
							{data.albumName}
						</span>
					</li>
				</ol>
			</nav>

			<!-- Compact Header: Title + Count + Search -->
			<div class="flex items-center justify-between gap-4">
				<div class="flex items-center gap-2 min-w-0 flex-1">
					<Typography variant="h1" class="text-xl lg:text-2xl truncate">{data.albumName}</Typography>
					<Typography variant="caption" class="text-charcoal-400 text-xs whitespace-nowrap">
						{data.photoCount.toLocaleString()}
					</Typography>
				</div>

				<!-- Desktop search -->
				<div class="hidden md:flex items-center gap-2">
					<button
						type="button"
						onclick={goBackToAlbums}
						class="px-2 py-1 text-xs text-charcoal-400 hover:text-gold-500 transition-colors whitespace-nowrap"
						aria-label="Back to albums"
					>
						← Back
					</button>
					<div class="flex-1 max-w-md">
						<input
							type="search"
							placeholder="Search photos..."
							bind:value={searchQuery}
							class="w-full px-4 py-2 text-sm rounded-lg bg-charcoal-900 border border-charcoal-800 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/50 transition-colors text-white placeholder-charcoal-400"
						/>
					</div>
				</div>
			</div>

			<!-- Mobile search -->
			<div class="md:hidden mt-3">
				<input
					type="search"
					placeholder="Search photos..."
					bind:value={searchQuery}
					class="w-full px-4 py-2 text-sm rounded-lg bg-charcoal-900 border border-charcoal-800 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/50 transition-colors text-white placeholder-charcoal-400"
				/>
			</div>
		</div>
	</div>

	<!-- Photo Grid Content -->
	<div use:motion class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

		<!-- Search results indicator -->
		{#if searchQuery && displayPhotos.length > 0}
			<div class="mb-4">
				<Typography variant="caption" class="text-charcoal-400 text-xs">
					{displayPhotos.length.toLocaleString()} {displayPhotos.length === 1 ? 'photo' : 'photos'} found
				</Typography>
			</div>
		{/if}

		<!-- Photo Grid -->
		{#if displayPhotos.length > 0}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{#each displayPhotos as photo, index}
					<PhotoCard {photo} {index} onclick={handlePhotoClick} />
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
				<div use:motion>
					<Card padding="lg" class="text-center">
						<FolderOpen class="w-16 h-16 text-charcoal-600 mx-auto mb-4" aria-hidden="true" />
						<Typography variant="h3" class="mb-2">No photos found</Typography>
						<Typography variant="body" class="text-charcoal-400 text-sm">
							{searchQuery ? 'Try adjusting your search' : 'This album is empty'}
						</Typography>
					</Card>
				</div>
			</Motion>
		{/if}
	</div>
</Motion>

<!-- Photo Detail Modal -->
<PhotoDetailModal bind:open={modalOpen} photo={selectedPhoto} />
