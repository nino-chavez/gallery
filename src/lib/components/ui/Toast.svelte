<!--
  Toast Notification Component

  Displays temporary notification messages for user actions.

  Features:
  - Auto-dismiss (default 3000ms)
  - Manual dismiss (close button)
  - Slide-in animation
  - Variant support (success, error, info, warning)
  - Icon support
  - Accessible (role="status", aria-live)

  Usage:
  ```svelte
  <Toast variant="success" icon={Heart} onClose={handleClose}>
    Added to Favorites (12 total)
  </Toast>
  ```
-->

<script lang="ts">
	import { X } from 'lucide-svelte';
	import { Motion } from 'svelte-motion';
	import { MOTION } from '$lib/motion-tokens';
	import { onMount } from 'svelte';
	import type { ComponentType } from 'svelte';

	interface Props {
		variant?: 'success' | 'error' | 'info' | 'warning';
		icon?: ComponentType;
		duration?: number; // milliseconds, 0 = no auto-dismiss
		onClose?: () => void;
		children?: any;
	}

	let { variant = 'info', icon, duration = 3000, onClose, children }: Props = $props();

	let visible = $state(true);
	let timeoutId: number | null = null;

	const variantStyles = {
		success: 'bg-green-500/20 border-green-500/50 text-green-300',
		error: 'bg-red-500/20 border-red-500/50 text-red-300',
		info: 'bg-charcoal-800/95 border-charcoal-700 text-white',
		warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
	};

	function close() {
		visible = false;
		if (timeoutId) clearTimeout(timeoutId);
		onClose?.();
	}

	onMount(() => {
		if (duration > 0) {
			timeoutId = window.setTimeout(close, duration);
		}

		return () => {
			if (timeoutId) clearTimeout(timeoutId);
		};
	});
</script>

{#if visible}
	<Motion
		let:motion
		initial={{ opacity: 0, y: 20, x: 20 }}
		animate={{ opacity: 1, y: 0, x: 0 }}
		exit={{ opacity: 0, y: 20, x: 20 }}
		transition={MOTION.spring.gentle}
	>
		<div
			use:motion
			role="status"
			aria-live="polite"
			class="fixed bottom-6 right-6 z-50 max-w-md"
		>
			<div
				class="flex items-start gap-3 px-4 py-3 rounded-lg border backdrop-blur-md shadow-lg
                       {variantStyles[variant]}"
			>
				<!-- Icon (optional) -->
				{#if icon}
					<div class="shrink-0 mt-0.5">
						<svelte:component this={icon} class="w-5 h-5" />
					</div>
				{/if}

				<!-- Content -->
				<div class="flex-1 text-sm leading-relaxed">
					{@render children?.()}
				</div>

				<!-- Close button -->
				<button
					onclick={close}
					class="shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
					aria-label="Dismiss notification"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<!-- Progress bar (if auto-dismiss) -->
			{#if duration > 0}
				<div class="h-1 bg-white/10 rounded-b-lg overflow-hidden mt-1">
					<div
						class="h-full bg-white/40 rounded-b-lg"
						style="animation: shrink {duration}ms linear forwards;"
					></div>
				</div>
			{/if}
		</div>
	</Motion>
{/if}

<style>
	@keyframes shrink {
		from {
			width: 100%;
		}
		to {
			width: 0%;
		}
	}
</style>
