<script lang="ts">
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { page } from '$app/stores';
	import '../app.css';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';

	let { children } = $props();

	// Create QueryClient instance for TanStack Query
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000 * 60 * 5, // 5 minutes
				refetchOnWindowFocus: false,
			},
		},
	});

	// SEO metadata
	const siteTitle = 'Nino Chavez Photography';
	const siteDescription =
		'MOTION. EMOTION. Frame by Frame. Professional action sports photography capturing the intensity, emotion, and dynamic energy of volleyball, basketball, softball, and more.';
	const siteUrl = 'https://photography.ninochavez.co';
	const ogImage = `${siteUrl}/images/og-image.jpg`;
	const twitterHandle = '@flickday.media';

	// Derive page-specific title
	const pageTitle = $derived.by(() => {
		const path = $page.url.pathname;
		if (path === '/') return siteTitle;
		if (path === '/explore') return `Explore Photos | ${siteTitle}`;
		if (path === '/timeline') return `Timeline | ${siteTitle}`;
		if (path === '/collections') return `Collections | ${siteTitle}`;
		if (path === '/albums') return `Albums | ${siteTitle}`;
		if (path === '/favorites') return `Favorites | ${siteTitle}`;
		return siteTitle;
	});

	// Derive page-specific description
	const pageDescription = $derived.by(() => {
		const path = $page.url.pathname;
		if (path === '/explore')
			return 'Browse 19,000+ professional action sports photos. Filter by sport, emotion, quality, and more.';
		if (path === '/timeline') return 'Explore photos chronologically by upload date.';
		if (path === '/collections')
			return 'Curated collections showcasing portfolio-worthy shots and emotion-driven moments.';
		if (path === '/albums') return 'Browse all 253 photo albums organized by event and date.';
		if (path === '/favorites') return 'Your favorited photos - create your own collection.';
		return siteDescription;
	});

	// Canonical URL
	const canonicalUrl = $derived(`${siteUrl}${$page.url.pathname}`);
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{pageTitle}</title>
	<meta name="title" content={pageTitle} />
	<meta name="description" content={pageDescription} />
	<link rel="canonical" href={canonicalUrl} />

	<!-- PERFORMANCE: View Transitions API for smooth page transitions -->
	<meta name="view-transition" content="same-origin" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:site_name" content={siteTitle} />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={canonicalUrl} />
	<meta property="twitter:title" content={pageTitle} />
	<meta property="twitter:description" content={pageDescription} />
	<meta property="twitter:image" content={ogImage} />
	<meta property="twitter:site" content={twitterHandle} />
	<meta property="twitter:creator" content={twitterHandle} />

	<!-- Additional Meta Tags -->
	<meta name="keywords" content="sports photography, volleyball photography, action sports, basketball photography, softball photography, professional photography, Nino Chavez, motion photography, emotion photography" />
	<meta name="author" content="Nino Chavez" />
	<meta name="robots" content="index, follow" />
	<meta name="theme-color" content="#D4AF37" />
</svelte:head>

<QueryClientProvider client={queryClient}>
	<div class="min-h-screen bg-charcoal-950 text-white flex flex-col">
		<Header />

		<main class="flex-1">
			{@render children?.()}
		</main>

		<Footer />
	</div>
</QueryClientProvider>
