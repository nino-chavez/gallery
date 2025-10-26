<!--
  PhotoGrid Component - Responsive grid layout for photo galleries

  Features:
  - Responsive column layout (1-4 columns)
  - Loading state with skeleton placeholders
  - Empty state with custom message
  - Staggered animations for photo cards

  Usage:
  <PhotoGrid photos={data.photos} />
  <PhotoGrid photos={data.photos} loading={true} />
  <PhotoGrid photos={[]} emptyMessage="No photos found" />
-->

<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { ImageOff } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import PhotoCard from './PhotoCard.svelte';
	import Loading from '$lib/components/ui/Loading.svelte';
	import Typography from '$lib/components/ui/Typography.svelte';
	import type { Photo } from '$types/photo';

	interface Props {
		photos: Photo[];
		loading?: boolean;
		emptyMessage?: string;
		maxPhotos?: number;
		onclick?: (photo: Photo) => void;
		class?: string;
	}

	let {
		photos,
		loading = false,
		emptyMessage = 'No photos to display',
		maxPhotos,
		onclick,
		class: className = '',
	}: Props = $props();

	// Limit photos if maxPhotos is specified
	let displayPhotos = $derived(maxPhotos ? photos.slice(0, maxPhotos) : photos);
	let isEmpty = $derived(!loading && displayPhotos.length === 0);
</script>

{#if loading}
	<!-- Loading State -->
	<div class="flex items-center justify-center min-h-[400px]">
		<Loading size="lg" message="Loading photos..." />
	</div>
{:else if isEmpty}
	<!-- Empty State -->
	<Motion
		let:motion
		initial={{ opacity: 0, scale: 0.95 }}
		animate={{ opacity: 1, scale: 1 }}
		transition={MOTION.spring.gentle}
	>
		<div
			use:motion
			class="flex flex-col items-center justify-center min-h-[400px] gap-6"
			role="status"
			aria-label="No photos available"
		>
			<div class="p-6 rounded-full bg-charcoal-800/50 border border-charcoal-700">
				<ImageOff class="w-16 h-16 text-charcoal-400" aria-hidden="true" />
			</div>
			<div class="text-center max-w-md">
				<Typography variant="h3" class="text-charcoal-300 mb-2">
					{emptyMessage}
				</Typography>
				<Typography variant="body" class="text-charcoal-400">
					Try adjusting your filters or check back later for new photos.
				</Typography>
			</div>
		</div>
	</Motion>
{:else}
	<!-- Photo Grid -->
	<div
		class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 {className}"
		role="list"
		aria-label="Photo gallery"
	>
		{#each displayPhotos as photo, i (photo.id)}
			<PhotoCard {photo} index={i} {onclick} />
		{/each}
	</div>
{/if}
