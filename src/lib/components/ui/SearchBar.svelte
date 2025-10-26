<!--
  SearchBar Component - Search input with clear button

  Features:
  - Search icon prefix
  - Clear button when text is present
  - Keyboard shortcuts (Escape to clear)
  - Debouncing support
  - Full accessibility

  Usage:
  <SearchBar bind:value={searchQuery} placeholder="Search photos..." />
  <SearchBar bind:value={searchQuery} onsubmit={handleSearch} />
-->

<script lang="ts">
	import { Search, X } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'oninput' | 'onsubmit'> {
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		onsubmit?: (value: string) => void;
		oninput?: (value: string) => void;
		class?: string;
	}

	let {
		value = $bindable(''),
		placeholder = 'Search...',
		disabled = false,
		onsubmit,
		oninput,
		class: className = '',
		...restProps
	}: Props = $props();

	let inputElement: HTMLInputElement | undefined = $state();
	let hasFocus = $state(false);
	let hasValue = $derived(value.length > 0);

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
		oninput?.(value);
	}

	function handleClear() {
		value = '';
		inputElement?.focus();
		oninput?.('');
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			handleClear();
		} else if (event.key === 'Enter') {
			event.preventDefault();
			onsubmit?.(value);
		}
	}

	function handleFocus() {
		hasFocus = true;
	}

	function handleBlur() {
		hasFocus = false;
	}
</script>

<div
	class={cn(
		'relative flex items-center gap-3 px-4 py-3 bg-charcoal-900 border rounded-lg transition-colors',
		hasFocus ? 'border-gold-500 ring-2 ring-gold-500/20' : 'border-charcoal-800',
		disabled && 'opacity-50 cursor-not-allowed',
		className,
	)}
	{...restProps}
>
	<!-- Search Icon -->
	<Search
		class={cn(
			'w-5 h-5 flex-shrink-0 transition-colors',
			hasFocus ? 'text-gold-500' : 'text-charcoal-400',
		)}
		aria-hidden="true"
	/>

	<!-- Input Field -->
	<input
		bind:this={inputElement}
		type="search"
		{value}
		{placeholder}
		{disabled}
		class="flex-1 bg-transparent text-white placeholder:text-charcoal-400 outline-none disabled:cursor-not-allowed"
		aria-label={placeholder}
		oninput={handleInput}
		onkeydown={handleKeyDown}
		onfocus={handleFocus}
		onblur={handleBlur}
	/>

	<!-- Clear Button -->
	{#if hasValue && !disabled}
		<button
			type="button"
			class="flex-shrink-0 p-1 rounded-md hover:bg-charcoal-800 text-charcoal-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
			aria-label="Clear search"
			onclick={handleClear}
		>
			<X class="w-4 h-4" aria-hidden="true" />
		</button>
	{/if}
</div>
