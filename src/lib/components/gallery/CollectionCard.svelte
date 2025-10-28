<!--
  CollectionCard Component - Preview card for photo collections

  Features:
  - Displays collection title and emotion color
  - Shows photo count and preview thumbnails
  - Hover effects with scale animation
  - Click to navigate or trigger action
  - Fully accessible

  Usage:
  <CollectionCard
    emotion="triumph"
    photoCount={24}
    onclick={() => handleClick()}
  />
-->

<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { Camera } from 'lucide-svelte';
	import { MOTION, EMOTION_PALETTE } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { cn } from '$lib/utils';

	interface Props {
		emotion: string;
		photoCount: number;
		previewPhotos?: Array<{ id: string }>;
		onclick?: () => void;
		class?: string;
	}

	let {
		emotion,
		photoCount,
		previewPhotos = [],
		onclick,
		class: className,
	}: Props = $props();

	// Get emotion palette
	const emotionPalette = $derived(
		EMOTION_PALETTE[emotion as keyof typeof EMOTION_PALETTE] || EMOTION_PALETTE.triumph
	);

	function handleClick(event?: MouseEvent) {
		event?.stopPropagation();
		onclick?.();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleClick();
		}
	}
</script>

<Motion
	let:motion
	whileHover={{ scale: 1.02, y: -4 }}
	transition={MOTION.spring.snappy}
>
	<div
		use:motion
		class={cn(
			'group cursor-pointer',
			className
		)}
		role="button"
		tabindex="0"
		aria-label={`View ${emotion} collection with ${photoCount} photos`}
		onclick={handleClick}
		onkeydown={handleKeyDown}
	>
		<Card
			padding="lg"
			class="h-full border-charcoal-800 hover:border-gold-500/50 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/50 transition-colors"
		>
			<!-- Collection Header -->
			<div class="flex items-center gap-3 mb-4">
				<div
					class="w-3 h-3 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform"
					style="background: {emotionPalette.color}"
					aria-hidden="true"
				></div>
				<Typography variant="h3" class="capitalize group-hover:text-gold-500 transition-colors">
					{emotion}
				</Typography>
			</div>

			<!-- Photo Count -->
			<Typography variant="caption" class="text-charcoal-400 mb-4 block">
				{photoCount} {photoCount === 1 ? 'photo' : 'photos'}
			</Typography>

			<!-- Preview Grid -->
			{#if previewPhotos.length > 0}
				<div class="grid grid-cols-3 gap-2">
					{#each previewPhotos.slice(0, 3) as photo}
						<div
							class="aspect-square bg-charcoal-900 rounded-lg border border-charcoal-800 flex items-center justify-center overflow-hidden"
						>
							<Camera class="w-8 h-8 text-charcoal-600" aria-hidden="true" />
						</div>
					{/each}
				</div>
			{:else}
				<div
					class="aspect-[3/2] bg-charcoal-900 rounded-lg border border-charcoal-800 flex items-center justify-center"
				>
					<Camera class="w-16 h-16 text-charcoal-600" aria-hidden="true" />
				</div>
			{/if}

			<!-- Emotion Badge -->
			<div class="mt-4 pt-4 border-t border-charcoal-800">
				<div
					class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
					style="background: {emotionPalette.color}20; color: {emotionPalette.color}"
				>
					<div
						class="w-1.5 h-1.5 rounded-full"
						style="background: {emotionPalette.color}"
						aria-hidden="true"
					></div>
					<span class="capitalize">{emotion} Collection</span>
				</div>
			</div>
		</Card>
	</div>
</Motion>
