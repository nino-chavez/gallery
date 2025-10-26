<!--
  Root Error Boundary

  Catches errors that occur anywhere in the application and displays
  a user-friendly error message.

  Reference: https://kit.svelte.dev/docs/errors
-->

<script lang="ts">
	import { page } from '$app/stores';
	import { AlertCircle, Home, RefreshCw } from 'lucide-svelte';
	import Typography from '$lib/components/ui/Typography.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { Motion } from 'svelte-motion';
	import { MOTION } from '$lib/motion-tokens';

	function handleRefresh() {
		window.location.reload();
	}

	function goHome() {
		window.location.href = '/';
	}
</script>

<div class="min-h-screen flex items-center justify-center p-8 bg-charcoal-950">
	<Motion
		let:motion
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={MOTION.spring.gentle}
	>
		<div use:motion class="max-w-2xl w-full">
			<div class="flex flex-col items-center gap-8 text-center">
				<!-- Error Icon -->
				<div class="p-6 rounded-full bg-red-500/10 border border-red-500/20">
					<AlertCircle class="w-16 h-16 text-red-500" />
				</div>

				<!-- Error Message -->
				<div class="space-y-4">
					<Typography variant="h1" class="text-white">
						{$page.status === 404 ? 'Page Not Found' : 'Something Went Wrong'}
					</Typography>

					<Typography variant="body" class="text-charcoal-300 max-w-lg mx-auto">
						{#if $page.status === 404}
							The page you're looking for doesn't exist. It may have been moved or deleted.
						{:else if $page.error?.message}
							{$page.error.message}
						{:else}
							An unexpected error occurred. Please try refreshing the page or return to the
							homepage.
						{/if}
					</Typography>

					{#if $page.status}
						<Typography variant="caption" class="text-charcoal-400">
							Error {$page.status}
						</Typography>
					{/if}
				</div>

				<!-- Actions -->
				<div class="flex items-center gap-4">
					<Button variant="primary" onclick={goHome}>
						<Home class="w-4 h-4" />
						Go Home
					</Button>

					{#if $page.status !== 404}
						<Button variant="secondary" onclick={handleRefresh}>
							<RefreshCw class="w-4 h-4" />
							Refresh
						</Button>
					{/if}
				</div>
			</div>
		</div>
	</Motion>
</div>
