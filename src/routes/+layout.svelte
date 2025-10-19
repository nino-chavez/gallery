<script lang="ts">
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import '../app.css';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';

	let { children } = $props();

	// Create QueryClient instance for TanStack Query
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000 * 60 * 5, // 5 minutes
				refetchOnWindowFocus: false,
			},
		},
	});
</script>

<QueryClientProvider client={queryClient}>
	<div class="min-h-screen bg-charcoal-950 text-white flex flex-col">
		<Header />

		<main class="flex-1">
			{@render children?.()}
		</main>

		<Footer />
	</div>
</QueryClientProvider>
