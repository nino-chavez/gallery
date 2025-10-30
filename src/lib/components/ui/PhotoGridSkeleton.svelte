<!--
  PhotoGridSkeleton - Loading skeleton for photo grid

  Shows placeholder cards while photos are loading. Matches the actual
  PhotoGrid layout for a seamless loading experience.

  Features:
  - Matches grid layout (responsive columns)
  - Animated shimmer effect
  - Aspect ratio matching actual photos
  - Accessible with proper ARIA labels

  Usage:
  <PhotoGridSkeleton count={24} />
-->

<script lang="ts">
	interface Props {
		count?: number;
		class?: string;
	}

	let { count = 24, class: className }: Props = $props();

	let items = $derived(Array.from({ length: count }, (_, i) => i));
</script>

<div
	class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 {className}"
	role="status"
	aria-label="Loading photos"
>
	{#each items as i (i)}
		<div class="relative overflow-hidden rounded-lg bg-charcoal-900 border border-charcoal-800/50">
			<!-- Aspect ratio container (3:2 typical photo ratio) -->
			<div class="aspect-[3/2] relative">
				<!-- Animated shimmer effect -->
				<div class="absolute inset-0 bg-gradient-to-r from-charcoal-900 via-charcoal-800/50 to-charcoal-900 animate-shimmer"></div>
			</div>

			<!-- Card footer skeleton -->
			<div class="p-3 space-y-2">
				<!-- Title bar -->
				<div class="h-3 bg-charcoal-800/70 rounded w-3/4 animate-pulse"></div>
				<!-- Metadata bar -->
				<div class="h-2 bg-charcoal-800/50 rounded w-1/2 animate-pulse" style="animation-delay: 75ms"></div>
			</div>
		</div>
	{/each}

	<!-- Screen reader announcement -->
	<span class="sr-only">Loading {count} photos...</span>
</div>

<style>
	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	.animate-shimmer {
		animation: shimmer 2s infinite;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.03) 50%,
			transparent 100%
		);
		background-size: 200% 100%;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
