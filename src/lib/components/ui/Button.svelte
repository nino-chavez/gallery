<!--
  Button Component - Interactive buttons with design tokens

  Usage:
  <Button variant="primary" onclick={handleClick}>Submit</Button>
  <Button variant="secondary" size="sm">Cancel</Button>
  <Button variant="ghost" disabled>Loading...</Button>
-->

<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type ButtonVariant = 'primary' | 'secondary' | 'ghost';
	type ButtonSize = 'sm' | 'md' | 'lg';

	interface Props extends HTMLAttributes<HTMLButtonElement> {
		variant?: ButtonVariant;
		size?: ButtonSize;
		disabled?: boolean;
		class?: string;
		type?: 'button' | 'submit' | 'reset';
		onclick?: (event: MouseEvent) => void;
		children?: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		class: className,
		type = 'button',
		onclick,
		children,
		...restProps
	}: Props = $props();

	// Variant styles
	const variantClasses: Record<ButtonVariant, string> = {
		primary:
			'bg-gold-500 hover:bg-gold-600 text-charcoal-950 font-medium disabled:bg-gold-500/50 disabled:cursor-not-allowed',
		secondary:
			'bg-charcoal-800 hover:bg-charcoal-700 text-white border border-charcoal-700 disabled:bg-charcoal-800/50 disabled:cursor-not-allowed',
		ghost:
			'bg-transparent hover:bg-charcoal-800 text-charcoal-300 hover:text-white disabled:text-charcoal-400 disabled:cursor-not-allowed',
	};

	// Size styles
	const sizeClasses: Record<ButtonSize, string> = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-6 py-3 text-base',
		lg: 'px-8 py-4 text-lg',
	};

	// Base classes (shared across all variants)
	const baseClasses =
		'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-950';

	// Combine all classes
	const combinedClasses = cn(
		baseClasses,
		variantClasses[variant],
		sizeClasses[size],
		className,
	);
</script>

<button
	{type}
	{disabled}
	class={combinedClasses}
	{onclick}
	{...restProps}
>
	{@render children?.()}
</button>
