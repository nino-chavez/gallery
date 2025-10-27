<script lang="ts">
	import { slide } from 'svelte/transition';
	import { Calendar, ChevronDown } from 'lucide-svelte';

	interface Props {
		years: number[];
		selectedYear: number | null;
		onSelect: (year: number | null) => void;
	}

	let { years, selectedYear, onSelect }: Props = $props();
	let isExpanded = $state(false);

	function handleSelect(year: number | null) {
		onSelect(year);
		isExpanded = false;
	}
</script>

<div class="relative inline-block">
	<!-- Collapsed Pill Button -->
	<button
		onclick={() => (isExpanded = !isExpanded)}
		class="px-3 py-1.5 text-xs rounded-full
           bg-charcoal-800/50 border border-charcoal-700
           hover:border-gold-500/30 transition-all
           flex items-center gap-1.5
           {selectedYear ? 'border-gold-500/50 bg-gold-500/10' : ''}"
		aria-expanded={isExpanded}
		aria-label="Filter by year"
	>
		<Calendar class="w-3 h-3" />
		<span class="font-medium">
			{selectedYear || 'Year'}
		</span>
		<ChevronDown class="w-3 h-3 transition-transform {isExpanded ? 'rotate-180' : ''}" />
	</button>

	<!-- Dropdown Overlay -->
	{#if isExpanded}
		<div
			transition:slide={{ duration: 200 }}
			class="absolute top-full left-0 mt-2 p-3
             bg-charcoal-900 border border-charcoal-800
             rounded-lg shadow-xl z-30 min-w-[200px]
             max-h-[300px] overflow-y-auto"
		>
			<div class="flex flex-col gap-1">
				<!-- "All Years" option -->
				<button
					onclick={() => handleSelect(null)}
					class="px-3 py-1.5 text-xs text-left rounded
                 hover:bg-charcoal-800 transition-colors
                 {!selectedYear
						? 'bg-gold-500/10 text-gold-500 font-medium'
						: 'text-charcoal-200'}"
				>
					All Years
				</button>

				<!-- Year options -->
				{#each years as year}
					<button
						onclick={() => handleSelect(year)}
						class="px-3 py-1.5 text-xs text-left rounded
                   hover:bg-charcoal-800 transition-colors
                   {selectedYear === year
							? 'bg-gold-500/10 text-gold-500 font-medium'
							: 'text-charcoal-200'}"
					>
						{year}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
