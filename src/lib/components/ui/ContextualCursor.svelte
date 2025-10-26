<!--
  ContextualCursor Component - Custom cursor with photo metadata preview

  Features:
  - P2-3: Follows mouse with smooth easing (200ms)
  - Morphs size/color based on photo emotion
  - Displays quality score, composition, play type without clicks
  - Hides on touch devices

  Usage:
  <ContextualCursor {currentPhoto} />
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { Motion } from 'svelte-motion';
	import type { Photo } from '$types/photo';
	import { getPhotoQualityScore } from '$lib/photo-utils';
	import {
		Zap, Shield, ArrowDown, Target, Circle,
		Trophy, Camera, UserCircle
	} from 'lucide-svelte';

	interface Props {
		currentPhoto?: Photo | null;
	}

	let { currentPhoto = null }: Props = $props();

	// Cursor position state
	let cursorX = $state(0);
	let cursorY = $state(0);
	let isTouchDevice = $state(false);
	let isVisible = $state(false);

	// Cursor visual state based on photo
	let cursorSize = $derived(() => {
		if (!currentPhoto) return 20;
		const quality = getPhotoQualityScore(currentPhoto);
		// Size scales with quality: 20px (low) to 60px (high)
		return Math.max(20, Math.min(60, quality * 6));
	});

	let cursorColor = $derived(() => {
		if (!currentPhoto) return 'rgba(255, 255, 255, 0.3)';

		const emotion = currentPhoto.metadata.emotion?.toLowerCase();
		switch (emotion) {
			case 'triumph':
				return 'rgba(255, 215, 0, 0.6)'; // Gold
			case 'intensity':
				return 'rgba(255, 69, 0, 0.6)'; // Red-orange
			case 'focus':
				return 'rgba(65, 105, 225, 0.6)'; // Cool blue
			case 'determination':
				return 'rgba(139, 0, 139, 0.6)'; // Deep purple
			case 'excitement':
				return 'rgba(255, 105, 180, 0.6)'; // Hot pink
			case 'serenity':
				return 'rgba(64, 224, 208, 0.6)'; // Soft teal
			default:
				return 'rgba(255, 255, 255, 0.3)';
		}
	});

	// Play type icon mapping
	const playTypeIcons: Record<string, any> = {
		attack: Zap,
		block: Shield,
		dig: ArrowDown,
		set: Target,
		serve: Circle,
		rally: Trophy
	};

	let PlayTypeIcon = $derived(() => {
		if (!currentPhoto?.metadata.play_type) return null;
		return playTypeIcons[currentPhoto.metadata.play_type.toLowerCase()] || null;
	});

	// Mouse move handler with smoothing
	function handleMouseMove(event: MouseEvent) {
		// Use requestAnimationFrame for smooth updates
		requestAnimationFrame(() => {
			cursorX = event.clientX;
			cursorY = event.clientY;

			if (!isVisible) {
				isVisible = true;
			}
		});
	}

	function handleMouseLeave() {
		isVisible = false;
	}

	onMount(() => {
		// Detect touch devices
		isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

		if (!isTouchDevice) {
			// Add global mouse listeners
			window.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseleave', handleMouseLeave);

			return () => {
				window.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseleave', handleMouseLeave);
			};
		}
	});
</script>

{#if !isTouchDevice && isVisible}
	<div
		class="contextual-cursor"
		style="
			left: {cursorX}px;
			top: {cursorY}px;
			width: {cursorSize()}px;
			height: {cursorSize()}px;
			background: {cursorColor()};
			transform: translate(-50%, -50%);
		"
	>
		<!-- Cursor inner content -->
		{#if currentPhoto}
			<div class="cursor-content">
				<!-- Quality Score -->
				<div class="cursor-quality">
					{getPhotoQualityScore(currentPhoto).toFixed(1)}
				</div>

				<!-- Play Type Icon -->
				{#if PlayTypeIcon()}
					{@const Icon = PlayTypeIcon()}
					<div class="cursor-icon">
						<Icon class="w-3 h-3" />
					</div>
				{/if}

				<!-- Composition Type (abbreviated) -->
				{#if currentPhoto.metadata.composition}
					<div class="cursor-composition">
						{currentPhoto.metadata.composition.substring(0, 3).toUpperCase()}
					</div>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
	.contextual-cursor {
		position: fixed;
		pointer-events: none;
		z-index: 9999;
		border-radius: 50%;
		backdrop-filter: blur(8px);
		transition:
			width 200ms cubic-bezier(0.4, 0, 0.2, 1),
			height 200ms cubic-bezier(0.4, 0, 0.2, 1),
			background 200ms cubic-bezier(0.4, 0, 0.2, 1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.cursor-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		font-size: 8px;
		font-weight: 600;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
	}

	.cursor-quality {
		font-size: 10px;
		letter-spacing: -0.5px;
	}

	.cursor-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.cursor-composition {
		font-size: 7px;
		opacity: 0.8;
	}

	/* Hide default cursor when custom cursor is active */
	:global(body:has(.contextual-cursor)) {
		cursor: none !important;
	}

	:global(body:has(.contextual-cursor) a),
	:global(body:has(.contextual-cursor) button) {
		cursor: none !important;
	}
</style>
