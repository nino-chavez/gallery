<script lang="ts">
	import { goto } from '$app/navigation';
	import PhotoDetailModal from '$lib/components/gallery/PhotoDetailModal.svelte';
	import RelatedPhotosCarousel from '$lib/components/gallery/RelatedPhotosCarousel.svelte'; // NEW: Related photos
	import TagDisplay from '$lib/components/photo/TagDisplay.svelte'; // NEW: Player tags
	import { getOptimizedSmugMugUrl, getSmugMugSrcSet, isSmugMugUrl } from '$lib/utils/smugmug-image-optimizer';
	import type { PageData } from './$types';
	import type { Photo } from '$types/photo';

	let { data }: { data: PageData } = $props();

	let showModal = $state(true);
	
	// Optimize image URL for the inline modal
	const optimizedImageUrl = $derived.by(() => {
		const baseUrl = data.photo.original_url || data.photo.image_url;
		if (!baseUrl) return data.photo.image_url;
		
		if (isSmugMugUrl(baseUrl)) {
			// For inline modal, use download size (1600px) ~200-400KB
			return getOptimizedSmugMugUrl(baseUrl, 'download') || baseUrl;
		}
		
		return baseUrl;
	});
	
	const imageSrcSet = $derived.by(() => {
		const baseUrl = data.photo.original_url || data.photo.image_url;
		if (!baseUrl || !isSmugMugUrl(baseUrl)) return undefined;
		return getSmugMugSrcSet(baseUrl);
	});

	function handleClose() {
		// Navigate back to referring page, or home if no referrer
		if (document.referrer && document.referrer.includes(window.location.hostname)) {
			history.back();
		} else {
			goto('/explore');
		}
	}

	// NEW: Handle related photo click
	function handleRelatedPhotoClick(photo: Photo) {
		// Navigate to the new photo's detail page
		goto(`/photo/${photo.image_key}`);
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
			url: 'https://photography.ninochavez.co/about'
		},
		datePublished: data.photo.created_at,
		keywords: data.photo.keywords.join(', '),
		contentUrl: data.seo.canonical,
		thumbnailUrl: data.photo.thumbnail_url,
		image: data.photo.image_url,
		sport: data.photo.metadata.sport_type,
		category: data.photo.metadata.photo_category,
		emotion: data.photo.metadata.emotion,
		// Include rating for SEO (using internal Bucket 2 quality metrics)
		aggregateRating: {
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
			<img 
				src={optimizedImageUrl} 
				srcset={imageSrcSet}
				sizes="(max-width: 768px) 100vw, 896px"
				alt={data.photo.title} 
				class="w-full h-auto rounded-lg mb-4"
				loading="eager"
				decoding="async"
			/>
			<p class="text-charcoal-300 mb-4">{data.photo.caption}</p>
			<p class="text-charcoal-400 text-sm mb-4">Sport: {data.photo.metadata.sport_type}</p>

			<!-- Player Tags (NEW - Week 3-4) -->
			{#if data.approvedTags && data.approvedTags.length > 0}
				<div class="mb-4">
					<h3 class="text-sm font-semibold text-charcoal-400 mb-2">Tagged Players:</h3>
					<TagDisplay tags={data.approvedTags} />
				</div>
			{/if}
			<div class="flex gap-4">
				<button
					onclick={handleClose}
					class="px-6 py-3 bg-gold-500 text-charcoal-950 rounded-md hover:bg-gold-400 transition-colors"
				>
					Close
				</button>
				<a
					href="/photo/{data.photo.image_key}/tag"
					class="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						/>
					</svg>
					Tag Players
				</a>
			</div>
		</div>

		<!-- Related Photos Carousel (NEW - Week 2) -->
		{#if data.relatedPhotos && data.relatedPhotos.length > 0}
			<div class="mt-8 px-6">
				<RelatedPhotosCarousel
					photos={data.relatedPhotos}
					title="More from this Album & Sport"
					onPhotoClick={handleRelatedPhotoClick}
				/>
			</div>
		{/if}
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
