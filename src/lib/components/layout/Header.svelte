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
	import { Motion } from 'svelte-motion';
	import { Camera, Grid, Sparkles, Folder, Heart, Calendar } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';
	import GlobalSearch from '$lib/components/ui/GlobalSearch.svelte';
	import { cn } from '$lib/utils';
	import { favorites } from '$lib/stores/favorites.svelte';

	interface NavItem {
		label: string;
		path: string;
		icon: typeof Camera;
		badge?: () => number; // Optional badge count function
	}

	const navItems: NavItem[] = [
		{ label: 'Explore', path: '/explore', icon: Camera },
		{ label: 'Albums', path: '/albums', icon: Folder },
		{ label: 'Timeline', path: '/timeline', icon: Calendar },
		{ label: 'Collections', path: '/collections', icon: Grid },
		{ label: 'Favorites', path: '/favorites', icon: Heart, badge: () => favorites.count },
	];

	// Derived from page store
	let currentPath = $derived($page.url.pathname);

	function isActive(path: string): boolean {
		if (path === '/') {
			return currentPath === '/';
		}
		return currentPath.startsWith(path);
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
				<a
					href="/"
					class="flex items-center gap-3 cursor-pointer group"
					aria-label="Go to homepage"
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
						Nino Chavez Photography
					</Typography>
					<Typography variant="h3" class="sm:hidden group-hover:text-gold-500 transition-colors">
						NCP
					</Typography>
				</a>

				<!-- Navigation -->
				<nav class="flex items-center gap-1" aria-label="Main navigation">
					{#each navItems as item}
						{@const active = isActive(item.path)}
						{@const Icon = item.icon}
						{@const badgeCount = item.badge?.() || 0}
						<Motion let:motion whileHover={{ scale: 1.05 }} transition={MOTION.spring.snappy}>
							<a
								use:motion
								href={item.path}
								data-sveltekit-preload="tap"
								class={cn(
									'relative flex items-center gap-2 px-3 py-3 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
									active
										? 'bg-gold-500/10 text-gold-500'
										: 'text-charcoal-300 hover:text-white hover:bg-charcoal-800'
								)}
								aria-current={active ? 'page' : undefined}
							>
								<Icon class="w-5 h-5 sm:w-4 sm:h-4" aria-hidden="true" />
								<span class="hidden sm:inline">{item.label}</span>

								<!-- Badge Count (NEW - Week 3 Bonus) -->
								{#if badgeCount > 0}
									<span
										class="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold rounded-full bg-red-500 text-white"
										aria-label="{badgeCount} favorites"
									>
										{badgeCount > 99 ? '99+' : badgeCount}
									</span>
								{/if}
							</a>
						</Motion>
					{/each}
				</nav>

				<!-- Global Search -->
				<div class="max-w-md ml-4">
					<GlobalSearch />
				</div>
			</div>
		</div>
	</header>
</Motion>
