<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { Camera } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';

	interface Props {
		src: string;
		alt: string;
		thumbnailSrc?: string;
		class?: string;
		aspectRatio?: string; // e.g., "4/3", "16/9"
		sizes?: string; // Responsive sizes attribute
		priority?: boolean; // Disable lazy loading for above-fold images
		onLoad?: () => void;
		onError?: () => void;
	}

	let {
		src,
		alt,
		thumbnailSrc,
		class: className = '',
		aspectRatio = '4/3',
		sizes,
		priority = false,
		onLoad,
		onError
	}: Props = $props();

	let imageLoaded = $state(false);
	let imageError = $state(false);
	let imageElement: HTMLImageElement | undefined = $state();

	// Handle image load
	function handleLoad() {
		imageLoaded = true;
		onLoad?.();
	}

	// Handle image error
	function handleError() {
		imageError = true;
		onError?.();
	}

	// Check if image is already cached
	$effect(() => {
		if (imageElement?.complete && imageElement?.naturalHeight !== 0) {
			imageLoaded = true;
		}
	});
</script>

<div
	class="relative overflow-hidden bg-charcoal-900 {className}"
	style="aspect-ratio: {aspectRatio}"
>
	<!-- Blur Placeholder (thumbnail or gradient) -->
	{#if !imageLoaded && !imageError}
		<div class="absolute inset-0">
			{#if thumbnailSrc}
				<!-- Blurred thumbnail -->
				<img
					src={thumbnailSrc}
					alt=""
					class="absolute inset-0 w-full h-full object-cover blur-lg scale-110"
					aria-hidden="true"
				/>
			{:else}
				<!-- Gradient placeholder -->
				<div
					class="absolute inset-0 bg-gradient-to-br from-charcoal-800 to-charcoal-900 animate-pulse"
					aria-hidden="true"
				></div>
			{/if}

			<!-- Loading spinner overlay -->
			<div class="absolute inset-0 flex items-center justify-center">
				<div class="relative">
					<Camera class="w-12 h-12 text-charcoal-700 animate-pulse" aria-hidden="true" />
				</div>
			</div>
		</div>
	{/if}

	<!-- Error State -->
	{#if imageError}
		<div class="absolute inset-0 flex flex-col items-center justify-center bg-charcoal-900">
			<Camera class="w-16 h-16 text-charcoal-600 mb-2" aria-hidden="true" />
			<p class="text-sm text-charcoal-500">Failed to load image</p>
		</div>
	{/if}

	<!-- Main Image -->
	{#if !imageError}
		<Motion
			let:motion
			initial={{ opacity: 0 }}
			animate={{ opacity: imageLoaded ? 1 : 0 }}
			transition={MOTION.spring.gentle}
		>
			<img
				bind:this={imageElement}
				use:motion
				{src}
				{alt}
				{sizes}
				loading={priority ? 'eager' : 'lazy'}
				decoding="async"
				class="absolute inset-0 w-full h-full object-cover"
				onload={handleLoad}
				onerror={handleError}
			/>
		</Motion>
	{/if}
</div>

<style>
	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>
