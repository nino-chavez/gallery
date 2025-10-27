<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Motion } from 'svelte-motion';
	import { FolderOpen } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import AlbumCard from '$lib/components/gallery/AlbumCard.svelte';
	import SportFilter from '$lib/components/filters/SportFilter.svelte'; // NEW: Sport filter
	import CategoryFilter from '$lib/components/filters/CategoryFilter.svelte'; // NEW: Category filter
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

	function handleAlbumClick(album: any) {
		goto(`/albums/${album.albumKey}`);
	}

	// NEW: Handle sport filter selection
	function handleSportSelect(sport: string | null) {
		const url = new URL($page.url);
		if (sport) {
			url.searchParams.set('sport', sport);
		} else {
			url.searchParams.delete('sport');
		}
		goto(url.toString());
	}

	// NEW: Handle category filter selection
	function handleCategorySelect(category: string | null) {
		const url = new URL($page.url);
		if (category) {
			url.searchParams.set('category', category);
		} else {
			url.searchParams.delete('category');
		}
		goto(url.toString());
	}

	// NEW: Fetch sport/category distributions for filters
	// This is a simplified version - in production, you'd want to fetch this from the server
	// For now, we'll derive it from the albums data
	const sports = $derived.by(() => {
		const sportCounts = new Map<string, number>();
		let totalPhotos = 0;

		data.albums.forEach((album) => {
			if (album.primarySport && album.primarySport !== 'unknown') {
				const current = sportCounts.get(album.primarySport) || 0;
				sportCounts.set(album.primarySport, current + album.photoCount);
				totalPhotos += album.photoCount;
			}
		});

		return Array.from(sportCounts.entries())
			.map(([name, count]) => ({
				name,
				count,
				percentage: parseFloat(((count / totalPhotos) * 100).toFixed(1))
			}))
			.sort((a, b) => b.count - a.count);
	});

	const categories = $derived.by(() => {
		const categoryCounts = new Map<string, number>();
		let totalPhotos = 0;

		data.albums.forEach((album) => {
			if (album.primaryCategory && album.primaryCategory !== 'unknown') {
				const current = categoryCounts.get(album.primaryCategory) || 0;
				categoryCounts.set(album.primaryCategory, current + album.photoCount);
				totalPhotos += album.photoCount;
			}
		});

		return Array.from(categoryCounts.entries())
			.map(([name, count]) => ({
				name,
				count,
				percentage: parseFloat(((count / totalPhotos) * 100).toFixed(1))
			}))
			.sort((a, b) => b.count - a.count);
	});
</script>

<!-- Minimal Header - Content First Design -->
<Motion let:motion initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
	<div use:motion class="sticky top-0 z-20 bg-charcoal-950/95 backdrop-blur-sm border-b border-charcoal-800/50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">

			<!-- Compact Header: Title + Count + Search -->
			<div class="flex items-center justify-between gap-4 mb-3">
				<div class="flex items-center gap-2">
					<Typography variant="h1" class="text-xl lg:text-2xl">Albums</Typography>
					<Typography variant="caption" class="text-charcoal-400 text-xs">
						{data.totalAlbums.toLocaleString()}
					</Typography>
				</div>

				<!-- Desktop search -->
				<div class="hidden md:block flex-1 max-w-md">
					<input
						type="search"
						placeholder="Search albums..."
						bind:value={searchQuery}
						class="w-full px-4 py-2 text-sm rounded-lg bg-charcoal-900 border border-charcoal-800 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/50 transition-colors text-white placeholder-charcoal-400"
					/>
				</div>
			</div>

			<!-- Inline Filters + Mobile Search -->
			<div class="flex flex-wrap items-center gap-2">
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

				<!-- Mobile search as inline element -->
				<div class="md:hidden w-full">
					<input
						type="search"
						placeholder="Search albums..."
						bind:value={searchQuery}
						class="w-full px-4 py-2 text-sm rounded-lg bg-charcoal-900 border border-charcoal-800 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/50 transition-colors text-white placeholder-charcoal-400"
					/>
				</div>
			</div>
		</div>
	</div>

	<!-- Album Grid Content -->
	<div use:motion class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

		<!-- Search results indicator -->
		{#if searchQuery && displayAlbums.length > 0}
			<div class="mb-4">
				<Typography variant="caption" class="text-charcoal-400 text-xs">
					{displayAlbums.length.toLocaleString()} {displayAlbums.length === 1 ? 'album' : 'albums'} found
				</Typography>
			</div>
		{/if}

		<!-- Album Grid -->
		{#if displayAlbums.length > 0}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{#each displayAlbums as album, index}
					<AlbumCard {album} {index} onclick={handleAlbumClick} />
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
						<Typography variant="h3" class="mb-2">No albums found</Typography>
						<Typography variant="body" class="text-charcoal-400 text-sm">
							{searchQuery ? 'Try adjusting your search' : 'No albums available'}
						</Typography>
					</Card>
				</div>
			</Motion>
		{/if}
	</div>
</Motion>
