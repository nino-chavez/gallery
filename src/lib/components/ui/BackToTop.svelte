<!--
  BackToTop Component - Floating button to scroll back to top

  Features:
  - Shows when user scrolls down
  - Smooth scroll to top
  - Animated entrance/exit
  - Fixed position (bottom-right)

  Usage:
  <BackToTop threshold={400} />
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { Motion } from 'svelte-motion';
	import { ArrowUp } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';

	interface Props {
		threshold?: number; // Show button after scrolling this many pixels
	}

	let { threshold = 400 }: Props = $props();

	let isVisible = $state(false);

	function handleScroll(): void {
		isVisible = window.scrollY > threshold;
	}

	function scrollToTop(): void {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	}

	onMount(() => {
		window.addEventListener('scroll', handleScroll, { passive: true });
		handleScroll(); // Initial check

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

{#if isVisible}
	<Motion
		let:motion
		initial={{ opacity: 0, scale: 0.8, y: 20 }}
		animate={{ opacity: 1, scale: 1, y: 0 }}
		exit={{ opacity: 0, scale: 0.8, y: 20 }}
		transition={MOTION.spring.snappy}
	>
		<button
			use:motion
			onclick={scrollToTop}
			class="fixed bottom-6 right-6 z-40 p-3 bg-gold-500 text-charcoal-950 rounded-full shadow-lg hover:bg-gold-400 hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 focus:ring-offset-charcoal-950"
			aria-label="Scroll to top"
			title="Back to top"
		>
			<ArrowUp class="w-5 h-5" />
		</button>
	</Motion>
{/if}
