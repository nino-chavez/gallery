<script lang="ts">
	import { Motion, AnimatePresence } from 'svelte-motion';
	import { Search, X } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';

	interface SearchSuggestion {
		text: string;
		type: 'sport' | 'category' | 'keyword' | 'album';
		icon?: string;
		count?: number;
	}

	interface Props {
		value?: string;
		placeholder?: string;
		sportContext?: string | null; // Current sport filter for context-aware suggestions
		categoryContext?: string | null; // Current category filter
		onSearch?: (query: string) => void;
		onClear?: () => void;
	}

	let {
		value = $bindable(''),
		placeholder = 'Search photos...',
		sportContext = null,
		categoryContext = null,
		onSearch,
		onClear
	}: Props = $props();

	let inputElement: HTMLInputElement | undefined = $state();
	let showSuggestions = $state(false);
	let focusedIndex = $state(-1);

	// Sport-specific keyword suggestions
	const sportKeywords: Record<string, string[]> = {
		volleyball: ['spike', 'block', 'dig', 'set', 'serve', 'ace', 'libero', 'rotation'],
		basketball: ['dunk', 'layup', 'three-pointer', 'rebound', 'assist', 'fast break'],
		soccer: ['goal', 'penalty', 'corner kick', 'header', 'dribble', 'pass'],
		softball: ['pitch', 'bat', 'home run', 'slide', 'catch', 'infield'],
		baseball: ['pitch', 'bat', 'home run', 'slide', 'catch', 'infield'],
		football: ['touchdown', 'tackle', 'pass', 'run', 'catch', 'kick'],
		track: ['sprint', 'hurdles', 'relay', 'finish line', 'starting blocks']
	};

	// Category-specific suggestions
	const categoryKeywords: Record<string, string[]> = {
		action: ['peak moment', 'high intensity', 'athletic', 'dynamic'],
		celebration: ['victory', 'team', 'huddle', 'cheer', 'trophy'],
		candid: ['behind the scenes', 'bench', 'timeout', 'sideline'],
		portrait: ['headshot', 'team photo', 'senior', 'individual'],
		warmup: ['practice', 'training', 'drill', 'stretching']
	};

	// General photo keywords
	const generalKeywords = [
		'portfolio',
		'high quality',
		'sharp',
		'emotional',
		'golden hour',
		'indoor',
		'outdoor',
		'team',
		'individual'
	];

	// Generate suggestions based on current context and query
	const suggestions = $derived.by(() => {
		if (!value || value.length < 2) return [];

		const query = value.toLowerCase();
		const results: SearchSuggestion[] = [];

		// Sport-aware suggestions
		if (sportContext && sportKeywords[sportContext]) {
			sportKeywords[sportContext].forEach((keyword) => {
				if (keyword.toLowerCase().includes(query)) {
					results.push({
						text: keyword,
						type: 'sport',
						icon: '🏐'
					});
				}
			});
		}

		// Category-aware suggestions
		if (categoryContext && categoryKeywords[categoryContext]) {
			categoryKeywords[categoryContext].forEach((keyword) => {
				if (keyword.toLowerCase().includes(query)) {
					results.push({
						text: keyword,
						type: 'category',
						icon: '📁'
					});
				}
			});
		}

		// General keywords
		generalKeywords.forEach((keyword) => {
			if (keyword.toLowerCase().includes(query)) {
				results.push({
					text: keyword,
					type: 'keyword',
					icon: '🔍'
				});
			}
		});

		// Limit to top 8 suggestions
		return results.slice(0, 8);
	});

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
		showSuggestions = value.length >= 2;
		focusedIndex = -1;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (!showSuggestions || suggestions.length === 0) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				focusedIndex = Math.min(focusedIndex + 1, suggestions.length - 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				focusedIndex = Math.max(focusedIndex - 1, -1);
				break;
			case 'Enter':
				event.preventDefault();
				if (focusedIndex >= 0) {
					selectSuggestion(suggestions[focusedIndex]);
				} else {
					handleSearch();
				}
				break;
			case 'Escape':
				showSuggestions = false;
				focusedIndex = -1;
				break;
		}
	}

	function selectSuggestion(suggestion: SearchSuggestion) {
		value = suggestion.text;
		showSuggestions = false;
		focusedIndex = -1;
		handleSearch();
	}

	function handleSearch() {
		showSuggestions = false;
		onSearch?.(value);
	}

	function handleClear() {
		value = '';
		showSuggestions = false;
		focusedIndex = -1;
		onClear?.();
		inputElement?.focus();
	}

	function handleBlur() {
		// Delay to allow click on suggestion
		setTimeout(() => {
			showSuggestions = false;
			focusedIndex = -1;
		}, 200);
	}

	// Context label for suggestions
	const contextLabel = $derived.by(() => {
		if (sportContext && categoryContext) {
			return `${sportContext} ${categoryContext}`;
		}
		if (sportContext) return sportContext;
		if (categoryContext) return categoryContext;
		return null;
	});
</script>

<div class="relative">
	<!-- Search Input -->
	<div class="relative">
		<div class="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400">
			<Search class="w-5 h-5" />
		</div>
		<input
			bind:this={inputElement}
			type="search"
			{placeholder}
			{value}
			oninput={handleInput}
			onkeydown={handleKeyDown}
			onblur={handleBlur}
			onfocus={() => (showSuggestions = value.length >= 2)}
			class="w-full pl-12 pr-12 py-3 rounded-lg bg-charcoal-900 border border-charcoal-800 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/50 transition-colors text-white placeholder-charcoal-400"
			autocomplete="off"
		/>
		{#if value}
			<button
				onclick={handleClear}
				class="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-white transition-colors"
				aria-label="Clear search"
			>
				<X class="w-5 h-5" />
			</button>
		{/if}
	</div>

	<!-- Autocomplete Suggestions -->
	<AnimatePresence>
		{#if showSuggestions && suggestions.length > 0}
			<Motion
				let:motion
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -10 }}
				transition={MOTION.spring.gentle}
			>
				<div
					use:motion
					class="absolute z-50 w-full mt-2 bg-charcoal-900 border border-charcoal-800 rounded-lg shadow-2xl overflow-hidden"
				>
					{#if contextLabel}
						<div class="px-4 py-2 bg-charcoal-800 border-b border-charcoal-700">
							<span class="text-xs text-charcoal-400 uppercase tracking-wide">
								Suggestions for <span class="text-gold-500 capitalize">{contextLabel}</span>
							</span>
						</div>
					{/if}

					<ul class="py-1">
						{#each suggestions as suggestion, index}
							<li>
								<button
									onclick={() => selectSuggestion(suggestion)}
									class="w-full px-4 py-3 flex items-center gap-3 transition-colors {focusedIndex ===
									index
										? 'bg-gold-500/10 text-gold-500'
										: 'text-charcoal-200 hover:bg-charcoal-800'}"
								>
									<span class="text-xl">{suggestion.icon}</span>
									<span class="flex-1 text-left text-sm">{suggestion.text}</span>
									<span class="text-xs text-charcoal-400 capitalize">{suggestion.type}</span>
								</button>
							</li>
						{/each}
					</ul>

					<div class="px-4 py-2 bg-charcoal-800 border-t border-charcoal-700">
						<span class="text-xs text-charcoal-400">
							Press <kbd class="px-1 bg-charcoal-700 rounded">Enter</kbd> to search
						</span>
					</div>
				</div>
			</Motion>
		{/if}
	</AnimatePresence>
</div>

<style>
	kbd {
		font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
	}
</style>
