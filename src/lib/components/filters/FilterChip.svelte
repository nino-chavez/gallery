<!--
  FilterChip Component - Active filter display chip

  Features:
  - Shows label and value of active filter
  - Remove button with X icon
  - Hover effects and transitions
  - Compact design for horizontal layout

  Usage:
  <FilterChip label="Sport: volleyball" onRemove={handleRemove} />
-->

<script lang="ts">
	import { X } from 'lucide-svelte';
	import Typography from '$lib/components/ui/Typography.svelte';

	interface Props {
		label: string;
		onRemove?: () => void;
	}

	let { label, onRemove }: Props = $props();

	function handleClick(event: MouseEvent) {
		event.stopPropagation();
		onRemove?.();
	}
</script>

<div
	class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold-500/20 border border-gold-500/30 text-gold-300 text-xs transition-colors hover:bg-gold-500/30"
>
	<Typography variant="caption" class="font-medium">{label}</Typography>
	{#if onRemove}
		<button
			onclick={handleClick}
			class="flex items-center justify-center min-w-[32px] min-h-[32px] rounded-full hover:bg-gold-500/40 transition-colors"
			aria-label="Remove filter: {label}"
		>
			<X class="w-3 h-3" />
		</button>
	{/if}
</div>

<style>
	button {
		-webkit-tap-highlight-color: transparent;
	}
</style>
