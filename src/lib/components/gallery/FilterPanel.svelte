<!--
  FilterPanel Component - Photo filtering controls

  Features:
  - Search input
  - Portfolio-only toggle
  - Emotion filter buttons
  - Play type filter buttons
  - Clear all filters

  Usage:
  <FilterPanel
    bind:searchQuery
    bind:portfolioOnly
    bind:selectedEmotion
    bind:selectedPlayType
  />
-->

<script lang="ts">
	import { Filter, X, ChevronDown, ChevronUp } from 'lucide-svelte';
	import { Motion } from 'svelte-motion';
	import SearchBar from '$lib/components/ui/SearchBar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Typography from '$lib/components/ui/Typography.svelte';
	import { cn } from '$lib/utils';
	import { preferences } from '$lib/stores/preferences.svelte';
	import { MOTION } from '$lib/motion-tokens';

	type Emotion = 'triumph' | 'focus' | 'intensity' | 'determination' | 'excitement' | 'serenity';
	type PlayType = 'attack' | 'block' | 'dig' | 'set' | 'serve' | 'pass' | 'celebration' | 'timeout';

	interface Props {
		searchQuery?: string;
		portfolioOnly?: boolean;
		selectedEmotion?: Emotion | null;
		selectedPlayType?: PlayType | null;
		class?: string;
	}

	let {
		searchQuery = $bindable(''),
		portfolioOnly = $bindable(false),
		selectedEmotion = $bindable<Emotion | null>(null),
		selectedPlayType = $bindable<PlayType | null>(null),
		class: className = '',
	}: Props = $props();

	// Emotion options with colors
	const emotions: { value: Emotion; label: string; color: string }[] = [
		{ value: 'triumph', label: 'Triumph', color: 'text-yellow-500' },
		{ value: 'focus', label: 'Focus', color: 'text-blue-500' },
		{ value: 'intensity', label: 'Intensity', color: 'text-red-500' },
		{ value: 'determination', label: 'Determination', color: 'text-purple-500' },
		{ value: 'excitement', label: 'Excitement', color: 'text-orange-500' },
		{ value: 'serenity', label: 'Serenity', color: 'text-green-500' },
	];

	// Play type options
	const playTypes: { value: PlayType; label: string }[] = [
		{ value: 'attack', label: 'Attack' },
		{ value: 'block', label: 'Block' },
		{ value: 'dig', label: 'Dig' },
		{ value: 'set', label: 'Set' },
		{ value: 'serve', label: 'Serve' },
		{ value: 'pass', label: 'Pass' },
		{ value: 'celebration', label: 'Celebration' },
		{ value: 'timeout', label: 'Timeout' },
	];

	let hasActiveFilters = $derived(
		portfolioOnly || selectedEmotion !== null || selectedPlayType !== null || searchQuery.length > 0,
	);

	function clearAllFilters() {
		searchQuery = '';
		portfolioOnly = false;
		selectedEmotion = null;
		selectedPlayType = null;
	}

	function toggleEmotion(emotion: Emotion) {
		selectedEmotion = selectedEmotion === emotion ? null : emotion;
	}

	function togglePlayType(playType: PlayType) {
		selectedPlayType = selectedPlayType === playType ? null : playType;
	}

	function toggleAdvancedFilters() {
		preferences.setShowAdvancedFilters(!preferences.showAdvancedFilters);
	}
</script>

<div class={cn('space-y-6', className)}>
	<!-- Search (Always Visible) -->
	<div>
		<label for="photo-search" class="block mb-2">
			<Typography variant="caption" class="text-charcoal-300">Search Photos</Typography>
		</label>
		<SearchBar
			id="photo-search"
			bind:value={searchQuery}
			placeholder="Search by title, caption, or photo ID..."
		/>
	</div>

	<!-- Advanced Filters Toggle -->
	<div class="border-t border-charcoal-800 pt-6">
		<button
			type="button"
			onclick={toggleAdvancedFilters}
			class="w-full flex items-center justify-between group hover:bg-charcoal-900/50 p-3 rounded-lg transition-colors"
			aria-expanded={preferences.showAdvancedFilters}
		>
			<div class="flex items-center gap-3">
				<div class="p-2 rounded-lg bg-gold-500/10 group-hover:bg-gold-500/20 transition-colors">
					<Filter class="w-5 h-5 text-gold-500" aria-hidden="true" />
				</div>
				<Typography variant="h3">Advanced Filters</Typography>
			</div>
			<div class="flex items-center gap-2">
				{#if hasActiveFilters && !preferences.showAdvancedFilters}
					<span class="text-xs px-2 py-1 rounded-full bg-gold-500/20 text-gold-500">
						Active
					</span>
				{/if}
				{#if preferences.showAdvancedFilters}
					<ChevronUp class="w-5 h-5 text-charcoal-400" />
				{:else}
					<ChevronDown class="w-5 h-5 text-charcoal-400" />
				{/if}
			</div>
		</button>
	</div>

	<!-- Collapsible Advanced Filters -->
	{#if preferences.showAdvancedFilters}
		<Motion
			let:motion
			initial={{ opacity: 0, height: 0 }}
			animate={{ opacity: 1, height: 'auto' }}
			exit={{ opacity: 0, height: 0 }}
			transition={MOTION.spring.gentle}
		>
			<div use:motion class="space-y-6 overflow-hidden">
				<!-- Clear All Button -->
				{#if hasActiveFilters}
					<div class="flex justify-end">
						<Button variant="ghost" size="sm" onclick={clearAllFilters}>
							<X class="w-4 h-4" />
							Clear All
						</Button>
					</div>
				{/if}

				<!-- Portfolio Only Toggle -->
				<div>
					<label class="flex items-center gap-3 cursor-pointer group">
						<input
							type="checkbox"
							bind:checked={portfolioOnly}
							class="w-5 h-5 rounded border-2 border-charcoal-700 bg-charcoal-900 checked:bg-gold-500 checked:border-gold-500 focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-charcoal-950 transition-colors cursor-pointer"
						/>
						<Typography variant="body" class="group-hover:text-white transition-colors">
							Portfolio Worthy Only
						</Typography>
					</label>
				</div>

				<!-- Emotion Filters -->
				<div>
					<Typography variant="caption" class="text-charcoal-300 block mb-3">Emotion</Typography>
					<div class="flex flex-wrap gap-2">
						{#each emotions as emotion}
							<button
								type="button"
								class={cn(
									'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
									selectedEmotion === emotion.value
										? 'bg-gold-500/20 border-gold-500 text-gold-500'
										: 'bg-charcoal-900 border-charcoal-700 text-charcoal-300 hover:border-charcoal-600 hover:text-white',
								)}
								onclick={() => toggleEmotion(emotion.value)}
							>
								<span class={selectedEmotion === emotion.value ? '' : emotion.color}>
									{emotion.label}
								</span>
							</button>
						{/each}
					</div>
				</div>

				<!-- Play Type Filters -->
				<div>
					<Typography variant="caption" class="text-charcoal-300 block mb-3">Play Type</Typography>
					<div class="flex flex-wrap gap-2">
						{#each playTypes as playType}
							<button
								type="button"
								class={cn(
									'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
									selectedPlayType === playType.value
										? 'bg-gold-500/20 border-gold-500 text-gold-500'
										: 'bg-charcoal-900 border-charcoal-700 text-charcoal-300 hover:border-charcoal-600 hover:text-white',
								)}
								onclick={() => togglePlayType(playType.value)}
							>
								{playType.label}
							</button>
						{/each}
					</div>
				</div>
			</div>
		</Motion>
	{/if}
</div>
