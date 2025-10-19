<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { goto } from '$app/navigation';
	import { Camera, Grid, Sparkles, FolderOpen } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	// Keyboard navigation handler
	function handleKeyDown(event: KeyboardEvent, pathway: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			goto(pathway);
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center p-8">
	<div class="max-w-4xl w-full space-y-12">
		<!-- Hero Section -->
		<Motion
			let:motion
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={MOTION.spring.gentle}
		>
			<div use:motion class="text-center space-y-6">
				<div class="flex justify-center mb-6">
					<div class="p-4 rounded-full bg-gold-500/10 border border-gold-500/20">
						<Sparkles class="w-12 h-12 text-gold-500" aria-hidden="true" />
					</div>
				</div>

				<Typography variant="h1">Nino Chavez Gallery v3</Typography>

				<Typography variant="body" class="text-xl text-charcoal-300 max-w-2xl mx-auto">
					Rebuilt with SvelteKit and Svelte 5 for a simpler, faster, and more reliable gallery experience.
				</Typography>
			</div>
		</Motion>

		<!-- Navigation Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="navigation" aria-label="Gallery navigation">
			<!-- Explore Gallery Card -->
			<Motion
				let:motion
				whileHover={{ scale: 1.02, y: -4 }}
				transition={MOTION.spring.snappy}
			>
				<div
					use:motion
					class="group cursor-pointer"
					role="button"
					tabindex="0"
					aria-label="Navigate to Explore Gallery page"
					onclick={() => goto('/explore')}
					onkeydown={(e) => handleKeyDown(e, '/explore')}
				>
					<Card
						padding="lg"
						class="h-full border-charcoal-800 hover:border-gold-500/50 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/50 transition-colors"
					>
						<div class="space-y-4">
							<div class="flex items-center gap-4">
								<div
									class="w-12 h-12 rounded-lg bg-gold-500/10 flex items-center justify-center group-hover:scale-110 transition-transform"
									aria-hidden="true"
								>
									<Camera class="w-6 h-6 text-gold-500" />
								</div>
								<Typography variant="h3" class="group-hover:text-gold-500 transition-colors">
									Explore Gallery
								</Typography>
							</div>
							<Typography variant="body" class="text-charcoal-400">
								Browse photos with advanced filtering by emotion, play type, and portfolio quality.
								Interactive photo details with full metadata display.
							</Typography>
						</div>
					</Card>
				</div>
			</Motion>

			<!-- Collections Card -->
			<Motion
				let:motion
				whileHover={{ scale: 1.02, y: -4 }}
				transition={MOTION.spring.snappy}
			>
				<div
				use:motion
				class="group cursor-pointer"
				role="button"
				tabindex="0"
				aria-label="Navigate to Collections page"
				onclick={() => goto('/collections')}
				onkeydown={(e) => handleKeyDown(e, '/collections')}
			>
					<Card
						padding="lg"
						class="h-full border-charcoal-800 hover:border-gold-500/50 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/50 transition-colors"
					>
						<div class="space-y-4">
							<div class="flex items-center gap-4">
								<div
									class="w-12 h-12 rounded-lg bg-gold-500/10 flex items-center justify-center group-hover:scale-110 transition-transform"
									aria-hidden="true"
								>
									<Grid class="w-6 h-6 text-gold-500" />
								</div>
								<Typography variant="h3" class="group-hover:text-gold-500 transition-colors">
									Collections
								</Typography>
							</div>
							<Typography variant="body" class="text-charcoal-400">
								Browse curated photo collections organized by emotion and theme. Explore featured
								galleries and portfolio showcases.
							</Typography>
						</div>
					</Card>
				</div>
			</Motion>

			<!-- Albums Card -->
			<Motion
				let:motion
				whileHover={{ scale: 1.02, y: -4 }}
				transition={MOTION.spring.snappy}
			>
				<div
					use:motion
					class="group cursor-pointer"
					role="button"
					tabindex="0"
					aria-label="Navigate to Albums page"
					onclick={() => goto('/albums')}
					onkeydown={(e) => handleKeyDown(e, '/albums')}
				>
					<Card
						padding="lg"
						class="h-full border-charcoal-800 hover:border-gold-500/50 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/50 transition-colors"
					>
						<div class="space-y-4">
							<div class="flex items-center gap-4">
								<div
									class="w-12 h-12 rounded-lg bg-gold-500/10 flex items-center justify-center group-hover:scale-110 transition-transform"
									aria-hidden="true"
								>
									<FolderOpen class="w-6 h-6 text-gold-500" />
								</div>
								<Typography variant="h3" class="group-hover:text-gold-500 transition-colors">
									Albums
								</Typography>
							</div>
							<Typography variant="body" class="text-charcoal-400">
								Browse all photo albums organized by event and session. Explore complete collections
								from tournaments, matches, and special events.
							</Typography>
						</div>
					</Card>
				</div>
			</Motion>
		</div>

		<!-- Migration Progress -->
		<Motion
			let:motion
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ ...MOTION.spring.gentle, delay: 0.2 }}
		>
			<div use:motion>
				<Card padding="lg">
					<Typography variant="h2" class="mb-4">Migration Complete</Typography>
				<ul class="space-y-2 text-charcoal-300" role="list">
					<li class="flex items-start gap-2">
						<span class="text-gold-500 mt-1" aria-hidden="true">✓</span>
						<Typography variant="body">
							<strong>Svelte 5 Runes:</strong> Complete migration from React hooks to $state, $derived, $derived.by, $effect
						</Typography>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-gold-500 mt-1" aria-hidden="true">✓</span>
						<Typography variant="body">
							<strong>svelte-motion:</strong> Smooth 60fps animations with spring physics (no re-render bugs!)
						</Typography>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-gold-500 mt-1" aria-hidden="true">✓</span>
						<Typography variant="body">
							<strong>Component Library:</strong> Typography, Button, Card, Loading, SearchBar fully implemented
						</Typography>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-gold-500 mt-1" aria-hidden="true">✓</span>
						<Typography variant="body">
							<strong>Gallery Features:</strong> PhotoCard, PhotoGrid, FilterPanel, PhotoDetailModal complete
						</Typography>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-gold-500 mt-1" aria-hidden="true">✓</span>
						<Typography variant="body">
							<strong>Advanced Filtering:</strong> Search, emotion, play type, and portfolio filters with reactive state
						</Typography>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-gold-500 mt-1" aria-hidden="true">✓</span>
						<Typography variant="body">
							<strong>Supabase Integration:</strong> Direct database queries in +page.server.ts (no self-fetch anti-pattern)
						</Typography>
					</li>
				</ul>
				</Card>
			</div>
		</Motion>
	</div>
</div>
