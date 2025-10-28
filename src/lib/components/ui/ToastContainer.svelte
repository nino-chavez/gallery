<!--
  Toast Container Component

  Renders all active toast notifications from the toast store.
  Should be placed in root layout to be available globally.
-->

<script lang="ts">
	import { toast } from '$lib/stores/toast.svelte';
	import Toast from './Toast.svelte';

	const toasts = $derived(toast.items);
</script>

<!-- Fixed container for toasts (stacked from bottom-right) -->
<div class="fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-3 pointer-events-none">
	{#each toasts as item (item.id)}
		<div class="pointer-events-auto">
			<Toast variant={item.variant} icon={item.icon} duration={0} onClose={() => toast.remove(item.id)}>
				{item.message}
			</Toast>
		</div>
	{/each}
</div>
