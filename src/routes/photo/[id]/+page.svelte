<script lang="ts">
	import { goto } from '$app/navigation';
	import PhotoDetailModal from '$lib/components/gallery/PhotoDetailModal.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showModal = $state(true);

	// Debug logging
	console.log('Photo page data:', data);
	console.log('Photo object:', data.photo);
	console.log('Show modal:', showModal);

	function handleClose() {
		// Navigate back to referring page, or home if no referrer
		if (document.referrer && document.referrer.includes(window.location.hostname)) {
			history.back();
		} else {
			goto('/explore');
		}
	}

	// Generate Schema.org structured data for SEO
	const schemaData = {
		'@context': 'https://schema.org',
		'@type': 'Photograph',
		name: data.photo.title,
		description: data.photo.caption || data.seo.description,
		creator: {
			'@type': 'Person',
			name: 'Nino Chavez',
			jobTitle: 'Sports Photographer',
			url: 'https://gallery.ninochavez.com/about'
		},
		datePublished: data.photo.created_at,
		keywords: data.photo.keywords.join(', '),
		contentUrl: data.seo.canonical,
		thumbnailUrl: data.photo.thumbnail_url,
		image: data.photo.image_url,
		sport: data.photo.metadata.sport_type,
		category: data.photo.metadata.photo_category,
		emotion: data.photo.metadata.emotion,
		aggregateRating: data.photo.metadata.portfolio_worthy
			? {
					'@type': 'AggregateRating',
					ratingValue: Math.round(
						(data.photo.metadata.sharpness +
							data.photo.metadata.exposure_accuracy +
							data.photo.metadata.composition_score +
							data.photo.metadata.emotional_impact) /
							4
					),
					bestRating: 10,
					worstRating: 0
				}
			: undefined
	};
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{data.seo.title}</title>
	<meta name="title" content={data.seo.title} />
	<meta name="description" content={data.seo.description} />
	<meta name="keywords" content={data.seo.keywords} />
	<link rel="canonical" href={data.seo.canonical} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={data.seo.ogType} />
	<meta property="og:url" content={data.seo.canonical} />
	<meta property="og:title" content={data.seo.title} />
	<meta property="og:description" content={data.seo.description} />
	<meta property="og:image" content={data.seo.ogImage} />
	<meta property="og:image:alt" content={data.photo.title} />
	<meta property="og:site_name" content="Nino Chavez Photography" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={data.seo.canonical} />
	<meta name="twitter:title" content={data.seo.title} />
	<meta name="twitter:description" content={data.seo.description} />
	<meta name="twitter:image" content={data.seo.ogImage} />
	<meta name="twitter:image:alt" content={data.photo.title} />

	<!-- Schema.org Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify(schemaData)}</script>`}
</svelte:head>

{#if showModal && data.photo}
	<!-- Temporary direct render to test -->
	<div class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
		<div class="bg-charcoal-900 rounded-lg max-w-4xl w-full p-6">
			<h1 class="text-2xl font-bold text-white mb-4">{data.photo.title}</h1>
			<img src={data.photo.image_url} alt={data.photo.title} class="w-full h-auto rounded-lg mb-4" />
			<p class="text-charcoal-300 mb-4">{data.photo.caption}</p>
			<p class="text-charcoal-400 text-sm mb-4">Sport: {data.photo.metadata.sport_type}</p>
			<button
				onclick={handleClose}
				class="px-6 py-3 bg-gold-500 text-charcoal-950 rounded-md hover:bg-gold-400 transition-colors"
			>
				Close
			</button>
		</div>
	</div>
{:else}
	<!-- Fallback if modal is closed but route still loaded -->
	<div class="min-h-screen flex items-center justify-center bg-charcoal-950">
		<div class="text-center">
			<h1 class="text-2xl font-bold text-white mb-4">{data.photo.title}</h1>
			<p class="text-charcoal-300 mb-6">{data.photo.caption}</p>
			<button
				onclick={() => goto('/explore')}
				class="px-6 py-3 bg-gold-500 text-charcoal-950 rounded-md hover:bg-gold-400 transition-colors"
			>
				Back to Gallery
			</button>
		</div>
	</div>
{/if}
