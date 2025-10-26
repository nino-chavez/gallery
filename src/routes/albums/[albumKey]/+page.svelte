<script lang="ts">
	import { goto } from '$app/navigation';
	import { Motion } from 'svelte-motion';
	import { ArrowLeft, FolderOpen, Home, ChevronRight } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';
	import Button from '$lib/components/ui/Button.svelte';
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

<!-- Header Section -->
<Motion
	let:motion
	initial={{ opacity: 0, y: 20 }}
	animate={{ opacity: 1, y: 0 }}
	transition={MOTION.spring.gentle}
>
	<div use:motion class="p-8">
		<div class="max-w-7xl mx-auto">
			<!-- Breadcrumb Navigation -->
			<nav aria-label="Breadcrumb" class="mb-4">
				<ol class="flex items-center gap-2 text-sm text-charcoal-400">
					<li>
						<button
							type="button"
							onclick={() => goto('/')}
							class="flex items-center gap-1 hover:text-gold-500 transition-colors"
							aria-label="Navigate to home"
						>
							<Home class="w-4 h-4" aria-hidden="true" />
							<span>Home</span>
						</button>
					</li>
					<li aria-hidden="true">
						<ChevronRight class="w-4 h-4" />
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
						<ChevronRight class="w-4 h-4" />
					</li>
					<li>
						<span class="text-white font-medium line-clamp-1" aria-current="page">
							{data.albumName}
						</span>
					</li>
				</ol>
			</nav>

			<!-- Back Button -->
			<div class="mb-6">
				<Button variant="ghost" size="sm" onclick={goBackToAlbums}>
					<ArrowLeft class="w-4 h-4 mr-2" />
					Back to Albums
				</Button>
			</div>

			<!-- Title & Description -->
			<div class="flex items-center gap-4 mb-6">
				<div class="p-3 rounded-full bg-gold-500/10" aria-hidden="true">
					<FolderOpen class="w-8 h-8 text-gold-500" />
				</div>
				<div>
					<Typography variant="h1" class="text-4xl">{data.albumName}</Typography>
					<Typography variant="body" class="text-charcoal-300 mt-1">
						{data.photoCount.toLocaleString()} {data.photoCount === 1 ? 'photo' : 'photos'}
					</Typography>
				</div>
			</div>

			<!-- Search Bar -->
			<div class="mb-6">
				<input
					type="search"
					placeholder="Search photos in this album..."
					bind:value={searchQuery}
					class="w-full px-4 py-3 rounded-lg bg-charcoal-900 border border-charcoal-800 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/50 transition-colors text-white placeholder-charcoal-400"
				/>
			</div>

			<!-- Photo Count -->
			{#if searchQuery}
				<div class="mb-6">
					<Card padding="sm">
						<Typography variant="body" class="text-charcoal-300">
							{displayPhotos.length.toLocaleString()} {displayPhotos.length === 1 ? 'photo' : 'photos'} found
						</Typography>
					</Card>
				</div>
			{/if}

			<!-- Photo Grid -->
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
				{#each displayPhotos as photo, index}
					<PhotoCard {photo} {index} onclick={handlePhotoClick} />
				{/each}
			</div>

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
							<FolderOpen class="w-16 h-16 text-charcoal-600 mx-auto mb-4" aria-hidden="true" />
							<Typography variant="h3" class="mb-2">No photos found</Typography>
							<Typography variant="body" class="text-charcoal-400">
								Try adjusting your search
							</Typography>
						</Card>
					</div>
				</Motion>
			{/if}
		</div>
	</div>
</Motion>

<!-- Photo Detail Modal -->
<PhotoDetailModal bind:open={modalOpen} photo={selectedPhoto} />
