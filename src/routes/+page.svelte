<script lang="ts">
	import type { PageData } from './$types';
	import { Motion } from 'svelte-motion';
	import { MOTION } from '$lib/motion-tokens';
	import { ArrowRight } from 'lucide-svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// Get optimized image URL using Supabase transforms
	function getOptimizedImageUrl(imageUrl: string | null, width: number): string {
		if (!imageUrl) return '';

		// If URL contains Supabase storage, add transform parameters
		if (imageUrl.includes('supabase')) {
			const url = new URL(imageUrl);
			url.searchParams.set('width', width.toString());
			url.searchParams.set('quality', '90');
			return url.toString();
		}

		return imageUrl;
	}

	// Responsive hero image URLs
	let heroImageMobile = $derived(getOptimizedImageUrl(data.heroPhoto?.image_url || null, 800));
	let heroImageDesktop = $derived(getOptimizedImageUrl(data.heroPhoto?.image_url || null, 1200));
</script>

<svelte:head>
	<title>Nino Chavez — Volleyball Photography</title>
	<meta name="description" content="Professional volleyball action sports photography. Browse portfolio-quality photos from tournaments, matches, and events." />
</svelte:head>

<!-- Editorial Split-Screen Layout -->
<div class="h-screen flex flex-col lg:flex-row overflow-hidden">
	<!-- Left Panel: Text & Navigation (40% desktop, 50vh mobile) -->
	<Motion
		let:motion
		initial={{ opacity: 0, x: -20 }}
		animate={{ opacity: 1, x: 0 }}
		transition={MOTION.spring.gentle}
	>
		<div
			use:motion
			class="flex-1 lg:max-w-[480px] bg-charcoal-950 flex items-center justify-center p-8 lg:p-12 relative z-10"
		>
			<div class="w-full max-w-md space-y-8">
				<!-- Title -->
				<div class="space-y-3">
					<h1 class="text-4xl lg:text-5xl font-bold text-white tracking-tight">
						Nino Chavez
					</h1>
					<p class="text-base text-charcoal-300">
						Volleyball Photography
					</p>
				</div>

				<!-- Navigation Links -->
				<nav aria-label="Main navigation" class="space-y-3">
					<a
						href="/explore"
						class="group flex items-center justify-between px-4 py-3 rounded-lg
						       border border-charcoal-800 hover:border-gold-500/50
						       transition-all duration-200"
					>
						<span class="text-sm font-medium text-white group-hover:text-gold-500 transition-colors">
							Explore Gallery
						</span>
						<ArrowRight
							class="w-4 h-4 text-charcoal-500 group-hover:text-gold-500
							       group-hover:translate-x-1 transition-all duration-200"
							aria-hidden="true"
						/>
					</a>

					<a
						href="/collections"
						class="group flex items-center justify-between px-4 py-3 rounded-lg
						       border border-charcoal-800 hover:border-gold-500/50
						       transition-all duration-200"
					>
						<span class="text-sm font-medium text-white group-hover:text-gold-500 transition-colors">
							Collections
						</span>
						<ArrowRight
							class="w-4 h-4 text-charcoal-500 group-hover:text-gold-500
							       group-hover:translate-x-1 transition-all duration-200"
							aria-hidden="true"
						/>
					</a>

					<a
						href="/albums"
						class="group flex items-center justify-between px-4 py-3 rounded-lg
						       border border-charcoal-800 hover:border-gold-500/50
						       transition-all duration-200"
					>
						<span class="text-sm font-medium text-white group-hover:text-gold-500 transition-colors">
							Albums
						</span>
						<ArrowRight
							class="w-4 h-4 text-charcoal-500 group-hover:text-gold-500
							       group-hover:translate-x-1 transition-all duration-200"
							aria-hidden="true"
						/>
					</a>
				</nav>

				<!-- Secondary Link -->
				<div class="pt-4 border-t border-charcoal-800">
					<a
						href="/timeline"
						class="text-xs text-charcoal-400 hover:text-gold-500 transition-colors"
					>
						View Timeline
					</a>
				</div>
			</div>
		</div>
	</Motion>

	<!-- Right Panel: Hero Photo (60% desktop, 50vh mobile) -->
	{#if data.heroPhoto}
		<Motion
			let:motion
			initial={{ opacity: 0, scale: 0.98 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ ...MOTION.spring.gentle, delay: 0.1 }}
		>
			<div
				use:motion
				class="flex-1 lg:flex-[1.5] relative overflow-hidden bg-charcoal-900"
			>
				<!-- Hero Image -->
				<img
					src={heroImageDesktop}
					srcset="{heroImageMobile} 800w, {heroImageDesktop} 1200w"
					sizes="(max-width: 1024px) 100vw, 60vw"
					alt="Portfolio photograph showcasing volleyball action photography"
					class="w-full h-full object-cover"
					loading="eager"
					fetchpriority="high"
				/>

				<!-- Left-side gradient fade for depth and separation -->
				<div
					class="absolute inset-y-0 left-0 w-32 lg:w-48 bg-gradient-to-r from-charcoal-950 via-charcoal-950/60 to-transparent pointer-events-none"
					aria-hidden="true"
				></div>

				<!-- Subtle bottom gradient for depth -->
				<div
					class="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-charcoal-950/20 via-transparent to-transparent pointer-events-none"
					aria-hidden="true"
				></div>

			</div>
		</Motion>
	{:else}
		<!-- Fallback: No hero photo available -->
		<div class="flex-1 lg:flex-[1.5] bg-charcoal-900 flex items-center justify-center">
			<p class="text-sm text-charcoal-500">Loading photography...</p>
		</div>
	{/if}
</div>
