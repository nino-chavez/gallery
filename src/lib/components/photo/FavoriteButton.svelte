<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { Heart } from 'lucide-svelte';
	import { favorites } from '$lib/stores/favorites.svelte';
	import type { Photo } from '$types/photo';

	interface Props {
		photo: Photo;
		variant?: 'default' | 'compact' | 'icon-only';
		class?: string;
	}

	let { photo, variant = 'default', class: className = '' }: Props = $props();

	// Reactive favorite status
	const isFavorited = $derived(favorites.isFavorite(photo.image_key));

	function handleClick(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();

		try {
			favorites.toggleFavorite(photo);
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message); // Show limit error to user
			}
		}
	}
</script>

{#if variant === 'icon-only'}
	<!-- Icon Only (for overlays) -->
	<Motion
		whileHover={{ scale: 1.1 }}
		whileTap={{ scale: 0.9 }}
		transition={{ duration: 0.2 }}
	>
		<button
			onclick={handleClick}
			class="p-2 rounded-full {isFavorited
				? 'bg-red-500/90'
				: 'bg-white/10 hover:bg-white/20'} backdrop-blur-sm transition-colors {className}"
			aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
			title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
		>
			<Heart
				class="w-5 h-5 {isFavorited ? 'text-white fill-white' : 'text-white'}"
			/>
		</button>
	</Motion>
{:else if variant === 'compact'}
	<!-- Compact Button (for toolbars) -->
	<Motion whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
		<button
			onclick={handleClick}
			class="p-2.5 rounded-lg {isFavorited
				? 'bg-red-500 hover:bg-red-600'
				: 'bg-charcoal-900 border border-charcoal-800 hover:border-red-500/50 hover:bg-red-500/10'} transition-colors group {className}"
			aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
			title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
		>
			<Heart
				class="w-4 h-4 {isFavorited ? 'text-white fill-white' : 'text-charcoal-300 group-hover:text-red-500'}"
			/>
		</button>
	</Motion>
{:else}
	<!-- Default Full Button -->
	<Motion whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
		<button
			onclick={handleClick}
			class="flex items-center gap-2 px-4 py-2.5 rounded-lg {isFavorited
				? 'bg-red-500 hover:bg-red-600 text-white'
				: 'bg-charcoal-900 border border-charcoal-800 hover:border-red-500/50 hover:bg-red-500/10 text-charcoal-300 hover:text-red-500'} font-medium transition-colors {className}"
			aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
		>
			<Heart
				class="w-5 h-5 {isFavorited ? 'fill-white' : ''}"
			/>
			<span>{isFavorited ? 'Favorited' : 'Add to Favorites'}</span>
		</button>
	</Motion>
{/if}
