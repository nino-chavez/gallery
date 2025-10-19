<!--
  AlbumCard Component - Display album with photo count

  Usage:
  <AlbumCard {album} index={0} onclick={handleClick} />
-->

<script lang="ts">
	import { Folder, Camera } from 'lucide-svelte';
	import { Motion } from 'svelte-motion';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';

	interface Album {
		albumKey: string;
		albumName: string;
		photoCount: number;
		coverImageUrl: string | null;
		sports?: string[];
		categories?: string[];
		portfolioCount?: number;
		avgQualityScore?: number;
		primarySport?: string;
		primaryCategory?: string;
	}

	interface Props {
		album: Album;
		index?: number;
		onclick?: (album: Album) => void;
	}

	let { album, index = 0, onclick }: Props = $props();

	// Image loading state
	let imageLoaded = $state(false);
	let imageError = $state(false);

	function handleClick() {
		onclick?.(album);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleClick();
		}
	}

	function handleImageLoad() {
		imageLoaded = true;
		imageError = false;
	}

	function handleImageError() {
		imageError = true;
		imageLoaded = false;
	}

	// Sport emojis for badges
	const sportEmojis: Record<string, string> = {
		volleyball: '🏐',
		basketball: '🏀',
		soccer: '⚽',
		softball: '🥎',
		football: '🏈',
		baseball: '⚾',
		track: '🏃',
		portrait: '📸'
	};
</script>

<Motion
	let:motion
	initial={{ opacity: 0, scale: 0.9 }}
	animate={{ opacity: 1, scale: 1 }}
	transition={{ ...MOTION.spring.snappy, delay: index * 0.05 }}
	whileHover={{ scale: 1.05, y: -4 }}
>
	<div
		use:motion
		class="group relative aspect-[4/3] bg-charcoal-900 rounded-lg overflow-hidden border border-charcoal-800 hover:border-gold-500/50 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/50 transition-colors cursor-pointer outline-none"
		role="button"
		tabindex="0"
		aria-label={`Album: ${album.albumName}, ${album.photoCount} photos`}
		onclick={handleClick}
		onkeydown={handleKeyDown}
	>
		<!-- Loading/Fallback State -->
		{#if !imageLoaded || imageError || !album.coverImageUrl}
			<div
				class="absolute inset-0 bg-gradient-to-br from-charcoal-800 to-charcoal-900 flex items-center justify-center"
				aria-hidden="true"
			>
				{#if !album.coverImageUrl}
					<Folder class="w-24 h-24 text-charcoal-700 group-hover:text-gold-500/50 transition-colors" />
				{:else}
					<Camera class="w-16 h-16 text-charcoal-600" />
				{/if}
			</div>
		{/if}

		<!-- Cover Image -->
		{#if album.coverImageUrl && !imageError}
			<img
				src={album.coverImageUrl}
				alt={`${album.albumName} cover`}
				loading="lazy"
				class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 {imageLoaded
					? 'opacity-100'
					: 'opacity-0'}"
				onload={handleImageLoad}
				onerror={handleImageError}
			/>
		{/if}

		<!-- Album Info Overlay -->
		<div
			class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-between p-4"
		>
			<!-- Top Badges -->
			<div class="flex items-start justify-between">
				<!-- Sport Badge (NEW - Week 2) -->
				{#if album.primarySport && album.primarySport !== 'unknown'}
					<div
						class="px-2 py-1 rounded-full text-xs font-medium bg-charcoal-900/80 text-white border border-charcoal-700 backdrop-blur-sm"
					>
						{sportEmojis[album.primarySport] || '🏆'}
						<span class="capitalize ml-1">{album.primarySport}</span>
					</div>
				{/if}

				<!-- Portfolio Badge (NEW - Week 2) -->
				{#if album.portfolioCount && album.portfolioCount > 0}
					<div
						class="px-2 py-1 rounded-full text-xs font-medium bg-gold-500/90 text-black"
						title="{album.portfolioCount} portfolio photos"
					>
						⭐ {album.portfolioCount}
					</div>
				{/if}
			</div>

			<!-- Bottom Info -->
			<div>
				<Typography variant="h3" class="text-xl font-semibold text-white mb-2 line-clamp-2">
					{album.albumName}
				</Typography>
				<div class="flex items-center justify-between">
					<Typography variant="caption" class="text-charcoal-300">
						{album.photoCount.toLocaleString()} {album.photoCount === 1 ? 'photo' : 'photos'}
					</Typography>
					<!-- Quality Badge (NEW - Week 2) -->
					{#if album.avgQualityScore && album.avgQualityScore > 7.5}
						<div class="px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
							High Quality
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Hover Effect Border -->
		<div
			class="absolute inset-0 border-2 border-gold-500/0 group-hover:border-gold-500/30 rounded-lg transition-colors pointer-events-none"
			aria-hidden="true"
		></div>
	</div>
</Motion>
