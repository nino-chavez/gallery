<!--
  Header Component - Site navigation header

  Features:
  - Logo/brand name
  - Navigation links
  - Active route highlighting
  - Responsive mobile menu (future)
  - Sticky positioning

  Usage:
  <Header />
-->

<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Motion } from 'svelte-motion';
	import { Camera, Grid, Sparkles, Folder } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';
	import { cn } from '$lib/utils';

	interface NavItem {
		label: string;
		path: string;
		icon: typeof Camera;
	}

	const navItems: NavItem[] = [
		{ label: 'Home', path: '/', icon: Sparkles },
		{ label: 'Explore', path: '/explore', icon: Camera },
		{ label: 'Albums', path: '/albums', icon: Folder },
		{ label: 'Collections', path: '/collections', icon: Grid },
	];

	// Derived from page store
	let currentPath = $derived($page.url.pathname);

	function isActive(path: string): boolean {
		if (path === '/') {
			return currentPath === '/';
		}
		return currentPath.startsWith(path);
	}

	function handleNavClick(path: string) {
		goto(path);
	}

	function handleKeyDown(event: KeyboardEvent, path: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			goto(path);
		}
	}
</script>

<Motion
	let:motion
	initial={{ opacity: 0, y: -20 }}
	animate={{ opacity: 1, y: 0 }}
	transition={MOTION.spring.gentle}
>
	<header
		use:motion
		class="sticky top-0 z-50 w-full border-b border-charcoal-800 bg-charcoal-950/95 backdrop-blur-lg"
	>
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<!-- Logo/Brand -->
				<div
					class="flex items-center gap-3 cursor-pointer group"
					role="button"
					tabindex="0"
					aria-label="Navigate to home"
					onclick={() => handleNavClick('/')}
					onkeydown={(e) => handleKeyDown(e, '/')}
				>
					<div
						class="p-2 rounded-lg bg-gold-500/10 group-hover:bg-gold-500/20 transition-colors"
						aria-hidden="true"
					>
						<Camera class="w-6 h-6 text-gold-500" />
					</div>
					<Typography
						variant="h3"
						class="hidden sm:block group-hover:text-gold-500 transition-colors"
					>
						Nino Chavez Gallery
					</Typography>
					<Typography variant="h3" class="sm:hidden group-hover:text-gold-500 transition-colors">
						NCG
					</Typography>
				</div>

				<!-- Navigation -->
				<nav class="flex items-center gap-1" aria-label="Main navigation">
					{#each navItems as item}
						{@const active = isActive(item.path)}
					{@const Icon = item.icon}
						<Motion let:motion whileHover={{ scale: 1.05 }} transition={MOTION.spring.snappy}>
							<button
								use:motion
								type="button"
								class={cn(
									'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
									active
										? 'bg-gold-500/10 text-gold-500'
										: 'text-charcoal-300 hover:text-white hover:bg-charcoal-800'
								)}
								onclick={() => handleNavClick(item.path)}
								aria-current={active ? 'page' : undefined}
							>
								<Icon class="w-4 h-4" aria-hidden="true" />
								<span class="hidden sm:inline">{item.label}</span>
							</button>
						</Motion>
					{/each}
				</nav>
			</div>
		</div>
	</header>
</Motion>
