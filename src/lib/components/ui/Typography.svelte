<!--
  Typography Component - Semantic text elements with design tokens

  Usage:
  <Typography variant="h1">Main Heading</Typography>
  <Typography variant="body">Body text</Typography>
  <Typography variant="caption" class="text-charcoal-400">Metadata</Typography>
-->

<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label';

	interface Props extends HTMLAttributes<HTMLElement> {
		variant?: TypographyVariant;
		class?: string;
		element?: string; // Override element type
		children?: Snippet;
	}

	let { variant = 'body', class: className, element, children, ...restProps }: Props = $props();

	// Map variants to HTML elements
	const elementMap: Record<TypographyVariant, string> = {
		h1: 'h1',
		h2: 'h2',
		h3: 'h3',
		h4: 'h4',
		body: 'p',
		caption: 'span',
		label: 'label',
	};

	// Map variants to Tailwind classes (following design system)
	const classMap: Record<TypographyVariant, string> = {
		h1: 'text-5xl font-bold text-white leading-tight tracking-tight',
		h2: 'text-2xl font-semibold text-white leading-tight',
		h3: 'text-xl font-semibold text-white',
		h4: 'text-lg font-semibold text-white',
		body: 'text-base text-charcoal-200 leading-relaxed',
		caption: 'text-sm text-charcoal-400',
		label: 'text-sm font-medium text-charcoal-300',
	};

	// Get the element to render
	const elementType = element || elementMap[variant];

	// Combine variant classes with custom className
	const combinedClasses = cn(classMap[variant], className);
</script>

<svelte:element this={elementType} class={combinedClasses} {...restProps}>
	{@render children?.()}
</svelte:element>
