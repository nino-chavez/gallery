<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Motion } from 'svelte-motion';
	import { FolderOpen, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import AlbumCard from '$lib/components/gallery/AlbumCard.svelte';
	import type { PageData } from './$types';

	interface Album {
		albumKey: string;
		albumName: string;
		photoCount: number;
		primarySport?: string;
		primaryCategory?: string;
		dateRange?: {
			earliest: string | null;
			latest: string | null;
		};
	}

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

	function handleAlbumClick(album: Album) {
		goto(`/albums/${album.albumKey}`);
	}

	// Pagination helpers
	function goToPage(pageNum: number) {
		const url = new URL($page.url);
		url.searchParams.set('page', pageNum.toString());
		goto(url.toString());
	}

	function changeSortOrder(sort: 'name' | 'date' | 'count') {
		const url = new URL($page.url);
		url.searchParams.set('sort', sort);
		url.searchParams.set('page', '1'); // Reset to page 1 when changing sort
		goto(url.toString());
	}

	// Keyboard shortcuts for pagination
	function handleKeyDown(event: KeyboardEvent) {
		// Only handle if not typing in search box
		if (event.target instanceof HTMLInputElement) return;

		if (event.key === 'ArrowLeft' && data.currentPage > 1) {
			event.preventDefault();
			goToPage(data.currentPage - 1);
		} else if (event.key === 'ArrowRight' && data.currentPage < data.totalPages) {
			event.preventDefault();
			goToPage(data.currentPage + 1);
		}
	}

	// Format date range for display
	function formatDateRange(dateRange?: { earliest: string | null; latest: string | null }) {
		if (!dateRange || (!dateRange.earliest && !dateRange.latest)) return null;

		const earliest = dateRange.earliest ? new Date(dateRange.earliest).getFullYear() : null;
		const latest = dateRange.latest ? new Date(dateRange.latest).getFullYear() : null;

		if (earliest && latest) {
			return earliest === latest ? `${earliest}` : `${earliest} - ${latest}`;
		}
		return earliest || latest || null;
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<!-- Minimal Header - Content First Design (Browse Mode: Traditionalist) -->
<Motion let:motion initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
	<div use:motion class="sticky top-0 z-20 bg-charcoal-950/95 backdrop-blur-sm border-b border-charcoal-800/50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
			<!-- Single Row: Title + Count + Search (Explore Page Pattern) -->
			<div class="flex items-center justify-between gap-4">
				<div class="flex items-center gap-2">
					<Typography variant="h1" class="text-xl lg:text-2xl">Albums</Typography>
					<Typography variant="caption" class="text-charcoal-400 text-xs">
						{data.totalAlbums.toLocaleString()}
					</Typography>
				</div>

				<!-- Sort Dropdown -->
				<div class="hidden sm:flex items-center gap-2">
					<ArrowUpDown class="w-4 h-4 text-charcoal-400" />
					<select
						value={data.sortBy}
						onchange={(e) => changeSortOrder(e.currentTarget.value as any)}
						class="px-3 py-1.5 text-sm rounded-lg bg-charcoal-900 border border-charcoal-800 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/50 transition-colors text-white"
						aria-label="Sort albums"
					>
						<option value="count">Most Photos</option>
						<option value="name">Name (A-Z)</option>
						<option value="date">Latest Photos</option>
					</select>
				</div>

				<!-- Responsive Search Bar -->
				<div class="flex-1 max-w-md">
					<input
						type="search"
						placeholder="Search albums..."
						bind:value={searchQuery}
						class="w-full px-4 py-2 text-sm rounded-lg bg-charcoal-900 border border-charcoal-800 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/50 transition-colors text-white placeholder-charcoal-400"
						aria-label="Search albums by name"
					/>
				</div>
			</div>

			<!-- Mobile Sort -->
			<div class="sm:hidden mt-3 flex items-center gap-2">
				<ArrowUpDown class="w-4 h-4 text-charcoal-400" />
				<select
					value={data.sortBy}
					onchange={(e) => changeSortOrder(e.currentTarget.value as any)}
					class="flex-1 px-3 py-1.5 text-sm rounded-lg bg-charcoal-900 border border-charcoal-800 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/50 transition-colors text-white"
					aria-label="Sort albums"
				>
					<option value="count">Most Photos</option>
					<option value="name">Name (A-Z)</option>
					<option value="date">Latest Photos</option>
				</select>
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
					<div>
						<AlbumCard {album} {index} onclick={handleAlbumClick} />
						<!-- Date Range Display -->
						{#if album.dateRange}
							{@const dateRange = formatDateRange(album.dateRange)}
							{#if dateRange}
								<Typography variant="caption" class="text-charcoal-500 text-xs mt-1 block">
									{dateRange}
								</Typography>
							{/if}
						{/if}
					</div>
				{/each}
			</div>

			<!-- Pagination Controls (only show when not searching) -->
			{#if !searchQuery && data.totalPages > 1}
				<div class="mt-8 flex items-center justify-center gap-2">
					<!-- Previous Button -->
					<button
						onclick={() => goToPage(data.currentPage - 1)}
						disabled={data.currentPage === 1}
						class="px-4 py-2 rounded-lg bg-charcoal-900 border border-charcoal-800 hover:border-gold-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
						aria-label="Previous page"
					>
						<ChevronLeft class="w-4 h-4" />
						<span class="hidden sm:inline">Previous</span>
					</button>

					<!-- Page Numbers -->
					<div class="flex items-center gap-2">
						{#each Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
							const pageNum = Math.max(1, Math.min(data.totalPages - 4, data.currentPage - 2)) + i;
							return pageNum;
						}) as pageNum}
							{#if pageNum <= data.totalPages}
								<button
									onclick={() => goToPage(pageNum)}
									class="w-10 h-10 rounded-lg {pageNum === data.currentPage
										? 'bg-gold-500 text-charcoal-950 font-semibold'
										: 'bg-charcoal-900 border border-charcoal-800 hover:border-gold-500'} transition-colors"
									aria-label="Go to page {pageNum}"
									aria-current={pageNum === data.currentPage ? 'page' : undefined}
								>
									{pageNum}
								</button>
							{/if}
						{/each}
					</div>

					<!-- Next Button -->
					<button
						onclick={() => goToPage(data.currentPage + 1)}
						disabled={data.currentPage === data.totalPages}
						class="px-4 py-2 rounded-lg bg-charcoal-900 border border-charcoal-800 hover:border-gold-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
						aria-label="Next page"
					>
						<span class="hidden sm:inline">Next</span>
						<ChevronRight class="w-4 h-4" />
					</button>
				</div>

				<!-- Page Info & Keyboard Hint -->
				<div class="mt-4 text-center">
					<Typography variant="caption" class="text-charcoal-400 text-xs">
						Page {data.currentPage} of {data.totalPages} • {data.totalAlbums.toLocaleString()} total albums
					</Typography>
					<Typography variant="caption" class="text-charcoal-500 text-xs mt-1 block">
						Use ← → arrow keys to navigate
					</Typography>
				</div>
			{/if}
		{:else}
			<!-- Simple Empty State (Browse Mode) -->
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
