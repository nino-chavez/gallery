<!--
  StatsCard Component - Display statistics with consistent styling

  Features:
  - Large number display
  - Label/description
  - Optional icon
  - Color variants
  - Animation on hover

  Usage:
  <StatsCard value={42} label="Photos" />
  <StatsCard value={15} label="Collections" variant="gold" />
-->

<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type StatsVariant = 'default' | 'gold' | 'success' | 'warning';

	interface Props {
		value: number | string;
		label: string;
		description?: string;
		variant?: StatsVariant;
		icon?: Snippet;
		class?: string;
	}

	let {
		value,
		label,
		description,
		variant = 'default',
		icon,
		class: className,
	}: Props = $props();

	const variantClasses: Record<StatsVariant, { number: string; label: string }> = {
		default: {
			number: 'text-white',
			label: 'text-charcoal-400',
		},
		gold: {
			number: 'text-gold-500',
			label: 'text-gold-400',
		},
		success: {
			number: 'text-green-500',
			label: 'text-green-400',
		},
		warning: {
			number: 'text-orange-500',
			label: 'text-orange-400',
		},
	};
</script>

<Motion
	let:motion
	whileHover={{ scale: 1.02 }}
	transition={MOTION.spring.snappy}
>
	<div
		use:motion
		class={cn(
			'group px-6 py-4 rounded-lg bg-charcoal-900 border border-charcoal-800 hover:border-charcoal-700 transition-colors',
			className
		)}
	>
		<div class="flex items-center gap-4">
			{#if icon}
				<div class="flex-shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true">
					{@render icon?.()}
				</div>
			{/if}

			<div class="flex-1 min-w-0">
				<!-- Value -->
				<div
					class={cn(
						'text-3xl font-bold tabular-nums transition-colors',
						variantClasses[variant].number
					)}
					aria-label={`${value} ${label}`}
				>
					{value}
				</div>

				<!-- Label -->
				<Typography
					variant="caption"
					class={cn(
						'block mt-1 transition-colors',
						variantClasses[variant].label
					)}
				>
					{label}
				</Typography>

				<!-- Optional description -->
				{#if description}
					<Typography variant="caption" class="block mt-1 text-charcoal-500 text-xs">
						{description}
					</Typography>
				{/if}
			</div>
		</div>
	</div>
</Motion>
