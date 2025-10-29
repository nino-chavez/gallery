<!--
  CollectionCard3D Component - 3D floating card effect for collections

  Features:
  - 3D perspective transforms on hover
  - Floating photo with rotation effects
  - Layered text elements with depth
  - Smooth transitions using project motion tokens
  - Fully accessible with keyboard navigation
  - Adheres to design system (charcoal/gold theme)

  Usage:
  <CollectionCard3D
    collection={collection}
    href="/collections/{collection.slug}"
  />
-->

<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { Award, Sparkles } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';
	import type { CoverPhotoRow } from '$types/database';

	interface CollectionWithPhotos {
		slug: string;
		title: string;
		narrative: string;
		description: string;
		photoCount: number;
		coverPhoto: CoverPhotoRow | null;
	}

	interface Props {
		collection: CollectionWithPhotos;
		href: string;
	}

	let { collection, href }: Props = $props();

	// Hover state for 3D effects
	let isHovered = $state(false);

	const isPortfolio = collection.slug === 'portfolio-excellence';
</script>

<!-- 3D Card Container with Perspective -->
<div
	class="group relative w-full"
	style="perspective: 1000px;"
	role="presentation"
	onmouseenter={() => isHovered = true}
	onmouseleave={() => isHovered = false}
>
	<Motion
		let:motion
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={MOTION.spring.gentle}
	>
		<a
			use:motion
			{href}
			class="block w-full h-full"
		>
			<!-- Card Body with 3D Transform Container -->
			<div
				class="
					relative w-full h-auto rounded-xl p-6 border
					bg-charcoal-950/95 backdrop-blur-sm
					border-charcoal-800/50
					hover:shadow-2xl hover:shadow-gold-500/10
					transition-all duration-300
					overflow-hidden
				"
				style="
					transform-style: preserve-3d;
					transform: {isHovered ? 'rotateY(-5deg) rotateX(10deg) translateZ(20px)' : 'rotateY(0deg) rotateX(0deg) translateZ(0px)'};
					transition: transform 0.3s ease-out;
				"
			>
				<!-- Cover Photo with 3D Effects -->
				{#if collection.coverPhoto}
					<div
						class="relative aspect-[4/3] overflow-hidden bg-charcoal-900 rounded-lg mb-6"
						style="
							transform: {isHovered ? 'translateZ(60px) rotateX(5deg) rotateZ(-2deg)' : 'translateZ(0px) rotateX(0deg) rotateZ(0deg)'};
							transition: transform 0.3s ease-out;
						"
					>
						<img
							src={collection.coverPhoto.ImageUrl}
							alt="{collection.title} cover"
							class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
							loading="lazy"
						/>
						{#if isPortfolio}
							<div class="absolute top-3 right-3">
								<div class="bg-gold-500/90 backdrop-blur-sm text-charcoal-950 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
									<Award class="w-3 h-3" />
									<span>Excellence</span>
								</div>
							</div>
						{/if}
					</div>
				{:else}
					<div
						class="aspect-[4/3] bg-charcoal-900 rounded-lg flex items-center justify-center mb-6"
						style="
							transform: {isHovered ? 'translateZ(40px)' : 'translateZ(0px)'};
							transition: transform 0.3s ease-out;
						"
					>
						<Sparkles class="w-12 h-12 text-charcoal-700" />
					</div>
				{/if}

				<!-- Text Block with Layered 3D Effects -->
				<div class="space-y-4">
					<!-- Title with Depth -->
					<div
						style="
							transform: {isHovered ? 'translateZ(30px) translateX(-5px)' : 'translateZ(0px) translateX(0px)'};
							transition: transform 0.3s ease-out;
						"
					>
						<div class="flex items-start justify-between gap-3 mb-2">
							<Typography variant="h3" class="text-base font-medium group-hover:text-gold-500 transition-colors">
								{collection.title}
							</Typography>
							<Typography variant="caption" class="text-charcoal-400 text-xs shrink-0">
								{collection.photoCount}
							</Typography>
						</div>
					</div>

					<!-- Narrative with Medium Depth -->
					<div
						style="
							transform: {isHovered ? 'translateZ(20px) translateX(-3px)' : 'translateZ(0px) translateX(0px)'};
							transition: transform 0.3s ease-out;
						"
					>
						<Typography variant="body" class="text-charcoal-400 text-xs mb-3 italic">
							{collection.narrative}
						</Typography>
					</div>

					<!-- Description with Subtle Depth -->
					<div
						style="
							transform: {isHovered ? 'translateZ(10px) translateX(-2px)' : 'translateZ(0px) translateX(0px)'};
							transition: transform 0.3s ease-out;
						"
					>
						<Typography variant="body" class="text-charcoal-500 text-xs line-clamp-2">
							{collection.description}
						</Typography>
					</div>
				</div>
			</div>
		</a>
	</Motion>
</div>

<style>
	/* Ensure 3D transforms work properly */
	:global(.group:hover .relative) {
		transform-style: preserve-3d;
	}
</style>