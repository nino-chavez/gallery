<!--
  Loading Component - Animated spinner with optional message

  Usage:
  <Loading />
  <Loading message="Loading photos..." />
  <Loading size="lg" />
-->

<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import Typography from './Typography.svelte';
	import { cn } from '$lib/utils';

	type LoadingSize = 'sm' | 'md' | 'lg';

	interface Props {
		message?: string;
		size?: LoadingSize;
		class?: string;
	}

	let { message, size = 'md', class: className, ...restProps }: Props = $props();

	// Size mapping
	const sizeClasses: Record<LoadingSize, string> = {
		sm: 'w-4 h-4',
		md: 'w-8 h-8',
		lg: 'w-12 h-12',
	};

	const iconSize = sizeClasses[size];
</script>

<div
	class={cn('flex flex-col items-center justify-center gap-4', className)}
	role="status"
	aria-live="polite"
	aria-busy="true"
	{...restProps}
>
	<Loader2
		class={cn(iconSize, 'text-gold-500 animate-spin')}
		aria-hidden="true"
	/>

	{#if message}
		<Typography variant="body" class="text-charcoal-300">
			{message}
		</Typography>
	{:else}
		<span class="sr-only">Loading...</span>
	{/if}
</div>

<style>
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	:global(.animate-spin) {
		animation: spin 1s linear infinite;
	}
</style>
