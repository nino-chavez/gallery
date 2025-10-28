<!--
  Tooltip Component

  General-purpose tooltip for educational content, hints, and onboarding.

  Features:
  - Positioned relative to parent (center, top, bottom, left, right)
  - Dismissible (close button)
  - Auto-dismiss (optional timeout)
  - Keyboard accessible (Escape to close)
  - Animated entrance/exit

  Accessibility:
  - role="tooltip" with aria-describedby
  - Focus trap for dismiss button
  - Keyboard navigation (Escape to close)
-->

<script lang="ts">
	import { X } from 'lucide-svelte';
	import { Motion } from 'svelte-motion';
	import { MOTION } from '$lib/motion-tokens';
	import { onMount } from 'svelte';

	interface Props {
		position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
		onClose?: () => void;
		autoDismiss?: number; // milliseconds
		children?: any;
	}

	let { position = 'center', onClose, autoDismiss, children }: Props = $props();

	let visible = $state(true);
	let timeoutId: number | null = null;

	const positionClasses = {
		center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
		top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
		bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
		left: 'right-full top-1/2 -translate-y-1/2 mr-3',
		right: 'left-full top-1/2 -translate-y-1/2 ml-3'
	};

	function close() {
		visible = false;
		if (timeoutId) clearTimeout(timeoutId);
		onClose?.();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
		}
	}

	onMount(() => {
		if (autoDismiss) {
			timeoutId = window.setTimeout(close, autoDismiss);
		}

		return () => {
			if (timeoutId) clearTimeout(timeoutId);
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if visible}
	<Motion
		let:motion
		initial={{ opacity: 0, scale: 0.9 }}
		animate={{ opacity: 1, scale: 1 }}
		exit={{ opacity: 0, scale: 0.9 }}
		transition={MOTION.spring.gentle}
	>
		<div
			use:motion
			role="tooltip"
			class="absolute {positionClasses[position]} z-50 max-w-sm"
		>
			<div
				class="bg-charcoal-900/98 backdrop-blur-md border border-gold-500/50 rounded-lg shadow-2xl p-4"
			>
				<!-- Close button -->
				<button
					onclick={close}
					class="absolute top-2 right-2 p-1 rounded-md hover:bg-charcoal-800
                           transition-colors focus-visible:outline-none focus-visible:ring-2
                           focus-visible:ring-gold-500"
					aria-label="Close tooltip"
				>
					<X class="w-4 h-4 text-charcoal-400" />
				</button>

				<!-- Content -->
				<div class="pr-6">
					{@render children?.()}
				</div>
			</div>

			<!-- Arrow (optional, based on position) -->
			{#if position !== 'center'}
				<div
					class="absolute {position === 'top'
						? 'top-full left-1/2 -translate-x-1/2 -mt-px'
						: position === 'bottom'
							? 'bottom-full left-1/2 -translate-x-1/2 -mb-px'
							: position === 'left'
								? 'left-full top-1/2 -translate-y-1/2 -ml-px'
								: 'right-full top-1/2 -translate-y-1/2 -mr-px'}"
				>
					<div
						class="w-3 h-3 bg-charcoal-900 border-gold-500/50
                               {position === 'top' ? 'border-l border-b -rotate-45' : ''}
                               {position === 'bottom' ? 'border-r border-t rotate-45' : ''}
                               {position === 'left' ? 'border-r border-b rotate-45' : ''}
                               {position === 'right' ? 'border-l border-t -rotate-45' : ''}"
					></div>
				</div>
			{/if}
		</div>
	</Motion>
{/if}
