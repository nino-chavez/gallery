<script lang="ts">
	import type { PageData } from './$types';
	import PremiumHero from '$lib/components/ui/PremiumHero.svelte';
	import { Motion } from 'svelte-motion';
	import { MOTION } from '$lib/motion-tokens';
	import { Camera, Trophy, Calendar } from 'lucide-svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// Get optimized image URL using SmugMug size parameters
	function getOptimizedImageUrl(imageUrl: string | null, width: number): string {
		if (!imageUrl) return '';

		// SmugMug image optimization using size suffixes
		if (imageUrl.includes('smugmug.com')) {
			// Remove existing size suffix if present
			const baseUrl = imageUrl.replace(/-[A-Z]\d?\./, '.');

			// Use appropriate size based on width
			let suffix = '-M'; // Default: Medium (600px)
			if (width >= 800) suffix = '-L';   // Large (800px)
			if (width >= 1024) suffix = '-XL'; // XLarge (1024px)
			if (width >= 400 && width < 600) suffix = '-S'; // Small (400px)

			return baseUrl.replace(/(\.[^.]+)$/, `${suffix}$1`);
		}

		// Supabase storage optimization
		if (imageUrl.includes('supabase')) {
			const url = new URL(imageUrl);
			url.searchParams.set('width', width.toString());
			url.searchParams.set('quality', '85');
			url.searchParams.set('format', 'webp');
			return url.toString();
		}

		return imageUrl;
	}

	// Generate links for virtual albums
	function getVirtualAlbumLink(type: string): string {
		switch (type) {
			case 'editors-choice':
				// Link to explore page with filters for high emotional impact + quality
				return '/explore?sport=volleyball&sort=emotional_impact';
			case 'action-showcase':
				// Link to explore page with action category and high intensity
				return '/explore?category=action&sport=volleyball&sort=quality';
			default:
				return '/explore';
		}
	}

	// Hero background image - pass original URL, PremiumHero handles responsive optimization
	let heroBackgroundImage = $derived(data.heroPhoto?.image_url || '');
</script>

<svelte:head>
	<title>Nino Chavez — Volleyball Photography</title>
	<meta name="description" content="Professional volleyball action sports photography. Browse portfolio-quality photos from tournaments, matches, and events." />
</svelte:head>

<!-- Premium Hero Section -->
{#if data.heroPhoto}
	<PremiumHero
		backgroundImage={heroBackgroundImage}
		title="VOLLEYBALL PHOTOGRAPHY"
		subtitle="INTENSITY • DETERMINATION • TRIUMPH"
	/>
{:else}
	<!-- Fallback hero without background image -->
	<PremiumHero
		title="VOLLEYBALL PHOTOGRAPHY"
		subtitle="INTENSITY • DETERMINATION • TRIUMPH"
	/>
{/if}

<!-- Content Sections Below Hero -->
<div class="relative z-10 bg-charcoal-950">
	<!-- Featured Content Section -->
	<Motion
		let:motion
		initial={{ opacity: 0, y: 30 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ ...MOTION.spring.gentle, delay: 0.6 }}
	>
		<section use:motion class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
			<div class="text-center mb-12">
				<h2 class="text-2xl lg:text-3xl font-bold text-white mb-4">
					Featured Albums
				</h2>
				<p class="text-lg text-charcoal-300 max-w-2xl mx-auto leading-relaxed">
					Discover our latest events, most comprehensive collections, and highest quality photography.
				</p>
			</div>

			<!-- Featured Album Cards -->
			{#if data.featuredAlbums && data.featuredAlbums.length > 0}
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
					{#each data.featuredAlbums as featuredAlbum}
						{@const albumLink = featuredAlbum.album.isVirtual
							? getVirtualAlbumLink(featuredAlbum.type)
							: `/albums/${featuredAlbum.album.albumKey}`
						}
						<a
							href={albumLink}
							data-sveltekit-preload="hover"
							class="group bg-charcoal-900 border border-charcoal-800 rounded-lg overflow-hidden
							       hover:border-gold-500/50 transition-all duration-200 block"
						>
							<!-- Album Cover Image -->
							<div class="aspect-[4/3] relative overflow-hidden">
								{#if featuredAlbum.album.coverImageUrl}
									<img
										src="{getOptimizedImageUrl(featuredAlbum.album.coverImageUrl, 400)}"
										alt="{featuredAlbum.album.albumName}"
										class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
									/>
								{:else}
									<div class="w-full h-full bg-charcoal-800 flex items-center justify-center">
										<Camera class="w-12 h-12 text-charcoal-600" />
									</div>
								{/if}

								<!-- Overlay with album info -->
								<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
									<div class="absolute bottom-0 left-0 right-0 p-4">
										<div class="flex items-center gap-2 text-xs text-white/80 mb-1">
											<span class="capitalize">{featuredAlbum.album.primarySport}</span>
											<span>•</span>
											<span class="capitalize">{featuredAlbum.album.primaryCategory}</span>
											{#if featuredAlbum.album.isVirtual}
												<span class="ml-auto text-gold-400">★ Curated</span>
											{/if}
										</div>
										<div class="text-xs text-white/60">
											{featuredAlbum.album.photoCount} photos
											{#if featuredAlbum.album.avgQualityScore > 0}
												• ★{featuredAlbum.album.avgQualityScore.toFixed(1)}
											{/if}
										</div>
									</div>
								</div>
							</div>

							<!-- Album Info -->
							<div class="p-6">
								<div class="flex items-center gap-2 mb-2">
									<span class="text-xs font-medium text-gold-500 bg-gold-500/10 px-2 py-1 rounded-full uppercase tracking-wide">
										{featuredAlbum.title}
									</span>
									{#if featuredAlbum.album.isVirtual}
										<span class="text-xs text-gold-400 ml-auto">Virtual Collection</span>
									{/if}
								</div>
								<h3 class="text-lg font-semibold text-white group-hover:text-gold-500 transition-colors mb-2">
									{featuredAlbum.album.albumName}
								</h3>
								<p class="text-sm text-charcoal-400 leading-relaxed">
									{#if featuredAlbum.type === 'recent'}
										Latest event coverage with fresh action photography.
									{:else if featuredAlbum.type === 'editors-choice'}
										Curated selection of emotionally compelling moments and technical excellence.
									{:else if featuredAlbum.type === 'action-showcase'}
										High-intensity action shots capturing peak athletic performance.
									{/if}
								</p>
							</div>
						</a>
					{/each}
				</div>
			{:else}
				<!-- Fallback: Show navigation cards if no featured albums -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
					<a
						href="/explore"
						data-sveltekit-preload="viewport"
						class="group bg-charcoal-900 border border-charcoal-800 rounded-lg p-6
						       hover:border-gold-500/50 transition-all duration-200"
					>
						<div class="flex items-center gap-3 mb-3">
							<Camera class="w-6 h-6 text-gold-500" />
							<h3 class="text-lg font-semibold text-white group-hover:text-gold-500 transition-colors">
								Browse Gallery
							</h3>
						</div>
						<p class="text-sm text-charcoal-400 leading-relaxed">
							Explore our complete collection of volleyball action photography
							with advanced filtering and search.
						</p>
					</a>

					<a
						href="/collections"
						data-sveltekit-preload="hover"
						class="group bg-charcoal-900 border border-charcoal-800 rounded-lg p-6
						       hover:border-gold-500/50 transition-all duration-200"
					>
						<div class="flex items-center gap-3 mb-3">
							<Trophy class="w-6 h-6 text-gold-500" />
							<h3 class="text-lg font-semibold text-white group-hover:text-gold-500 transition-colors">
								Collections
							</h3>
						</div>
						<p class="text-sm text-charcoal-400 leading-relaxed">
							Curated collections showcasing championship tournaments,
							elite athletes, and memorable moments.
						</p>
					</a>

					<a
						href="/albums"
						data-sveltekit-preload="hover"
						class="group bg-charcoal-900 border border-charcoal-800 rounded-lg p-6
						       hover:border-gold-500/50 transition-all duration-200"
					>
						<div class="flex items-center gap-3 mb-3">
							<Calendar class="w-6 h-6 text-gold-500" />
							<h3 class="text-lg font-semibold text-white group-hover:text-gold-500 transition-colors">
								Event Albums
							</h3>
						</div>
						<p class="text-sm text-charcoal-400 leading-relaxed">
							Complete event coverage from tournaments, matches, and
							special volleyball events.
						</p>
					</a>
				</div>
			{/if}
		</section>
	</Motion>
</div>
