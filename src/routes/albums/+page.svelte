<script lang="ts">
	import { goto } from '$app/navigation';
	import { Motion } from 'svelte-motion';
	import { FolderOpen } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import AlbumCard from '$lib/components/gallery/AlbumCard.svelte';
	import type { PageData } from './$types';

	// Svelte 5 Runes: $props to receive server data
	let { data }: { data: PageData } = $props();

	// Simple search (client-side)
	let searchQuery = $state('');

	// Filter albums by search
	let displayAlbums = $derived.by(() => {
		if (!searchQuery.trim()) return data.albums;

		const query = searchQuery.toLowerCase();
		return data.albums.filter((album) =>
			album.albumName.toLowerCase().includes(query) ||
			album.albumKey.toLowerCase().includes(query)
		);
	});

	function handleAlbumClick(album: { albumKey: string; albumName: string; photoCount: number }) {
		goto(`/albums/${album.albumKey}`);
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
			<!-- Title & Description -->
			<div class="flex items-center gap-4 mb-6">
				<div class="p-3 rounded-full bg-gold-500/10" aria-hidden="true">
					<FolderOpen class="w-8 h-8 text-gold-500" />
				</div>
				<div>
					<Typography variant="h1" class="text-4xl">Albums</Typography>
					<Typography variant="body" class="text-charcoal-300 mt-1">
						{data.totalAlbums.toLocaleString()} albums with {data.totalPhotos.toLocaleString()} photos
					</Typography>
				</div>
			</div>

			<!-- Search Bar -->
			<div class="mb-6">
				<input
					type="search"
					placeholder="Search albums..."
					bind:value={searchQuery}
					class="w-full px-4 py-3 rounded-lg bg-charcoal-900 border border-charcoal-800 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/50 transition-colors text-white placeholder-charcoal-500"
				/>
			</div>

			<!-- Album Count -->
			{#if searchQuery}
				<div class="mb-6">
					<Card padding="sm">
						<Typography variant="body" class="text-charcoal-300">
							{displayAlbums.length.toLocaleString()} {displayAlbums.length === 1 ? 'album' : 'albums'} found
						</Typography>
					</Card>
				</div>
			{/if}

			<!-- Album Grid -->
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
				{#each displayAlbums as album, index}
					<AlbumCard {album} {index} onclick={handleAlbumClick} />
				{/each}
			</div>

			<!-- Empty State -->
			{#if displayAlbums.length === 0}
				<Motion
					let:motion
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={MOTION.spring.gentle}
				>
					<div use:motion>
						<Card padding="lg" class="text-center">
							<FolderOpen class="w-16 h-16 text-charcoal-600 mx-auto mb-4" aria-hidden="true" />
							<Typography variant="h3" class="mb-2">No albums found</Typography>
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
