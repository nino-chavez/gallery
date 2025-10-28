<script lang="ts">
	import { Grid, Move, Maximize, Columns, Square } from 'lucide-svelte';
	import Typography from '$lib/components/ui/Typography.svelte';

	interface Props {
		selected: string | null;
		onSelect: (composition: string | null) => void;
	}

	let { selected, onSelect }: Props = $props();

	const compositions = [
		{
			value: 'rule_of_thirds',
			label: 'Rule of Thirds',
			icon: Grid,
			description: 'Classic grid composition',
		},
		{
			value: 'leading_lines',
			label: 'Leading Lines',
			icon: Move,
			description: 'Lines guide the eye',
		},
		{
			value: 'centered',
			label: 'Centered',
			icon: Maximize,
			description: 'Subject in center',
		},
		{
			value: 'symmetry',
			label: 'Symmetry',
			icon: Columns,
			description: 'Balanced symmetry',
		},
		{
			value: 'frame_within_frame',
			label: 'Framed',
			icon: Square,
			description: 'Natural framing',
		},
	];

	function handleSelect(value: string) {
		if (selected === value) {
			onSelect(null);
		} else {
			onSelect(value);
		}
	}
</script>

<div class="space-y-2">
	<Typography variant="label" class="text-xs font-medium text-charcoal-300">
		Composition
	</Typography>

	<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
		{#each compositions as composition}
			{@const Icon = composition.icon}
			<button
				onclick={() => handleSelect(composition.value)}
				class="group relative flex flex-col items-center gap-2 px-3 py-2.5 rounded-lg border transition-all duration-200 {selected ===
				composition.value
					? 'bg-gold-500 border-gold-500 text-charcoal-950'
					: 'bg-charcoal-900/50 border-charcoal-700/50 text-charcoal-400 hover:border-charcoal-600 hover:bg-charcoal-800/50'}"
				aria-pressed={selected === composition.value}
				aria-label="Filter by {composition.label}"
			>
				<Icon
					class="w-3.5 h-3.5 {selected === composition.value
						? 'text-charcoal-950'
						: 'text-charcoal-400 group-hover:text-charcoal-200'}"
				/>
				<Typography variant="caption" class="font-medium">{composition.label}</Typography>

				<!-- Tooltip -->
				<div
					class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-charcoal-800 text-charcoal-200 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
				>
					{composition.description}
				</div>
			</button>
		{/each}
	</div>

	{#if selected}
		<div class="flex items-center justify-between text-xs">
			<Typography variant="caption" class="text-charcoal-400">
				{compositions.find((c) => c.value === selected)?.description}
			</Typography>
			<button
				onclick={() => onSelect(null)}
				class="text-gold-500 hover:text-gold-400 transition-colors"
			>
				Clear
			</button>
		</div>
	{/if}
</div>
