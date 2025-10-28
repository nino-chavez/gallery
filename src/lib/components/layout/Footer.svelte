<!--
  Footer Component - Site-wide footer

  Features:
  - Minimal brand presence
  - Essential navigation links
  - Social proof and contact
  - Compact, content-focused design

  Usage:
  <Footer />
-->

<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { Camera, Mail, Instagram } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';

	interface SocialLink {
		label: string;
		href: string;
		icon: typeof Instagram;
	}

	const socialLinks: SocialLink[] = [
		{
			label: 'Instagram',
			href: 'https://instagram.com/ninochavez.photo',
			icon: Instagram,
		},
		{
			label: 'Email',
			href: 'mailto:nino@ninochavez.co',
			icon: Mail,
		},
	];

	const currentYear = new Date().getFullYear();
</script>

<Motion
	let:motion
	initial={{ opacity: 0, y: 20 }}
	animate={{ opacity: 1, y: 0 }}
	transition={MOTION.spring.gentle}
>
	<footer use:motion class="border-t border-charcoal-800 bg-charcoal-950 mt-auto">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
				<!-- Brand Section -->
				<div class="flex items-center gap-3">
					<div class="p-1.5 rounded-md bg-gold-500/10" aria-hidden="true">
						<Camera class="w-4 h-4 text-gold-500" />
					</div>
					<div>
						<Typography variant="body" class="text-sm font-medium text-white">
							Nino Chavez
						</Typography>
						<Typography variant="caption" class="text-charcoal-400 text-xs">
							Sports Photography
						</Typography>
					</div>
				</div>

				<!-- Social Links & Links -->
				<div class="flex items-center justify-between md:justify-end gap-6">
					<!-- Essential Links -->
					<nav aria-label="Footer navigation" class="flex gap-4">
						<a
							href="/explore"
							class="text-charcoal-400 hover:text-gold-500 transition-colors text-sm"
						>
							Gallery
						</a>
						<a
							href="/collections"
							class="text-charcoal-400 hover:text-gold-500 transition-colors text-sm"
						>
							Collections
						</a>
						<a
							href="/about"
							class="text-charcoal-400 hover:text-gold-500 transition-colors text-sm"
						>
							About
						</a>
					</nav>

					<!-- Social Links -->
					<div class="flex gap-3">
						{#each socialLinks as link}
							{@const Icon = link.icon}
							<Motion let:motion whileHover={{ scale: 1.1, y: -1 }} transition={MOTION.spring.snappy}>
								<a
									use:motion
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									class="p-1.5 rounded-md bg-charcoal-900 hover:bg-gold-500/10 border border-charcoal-800 hover:border-gold-500/30 transition-colors"
									aria-label={link.label}
								>
									<Icon class="w-4 h-4 text-charcoal-400 hover:text-gold-500 transition-colors" />
								</a>
							</Motion>
						{/each}
					</div>
				</div>
			</div>

			<!-- Bottom Bar -->
			<div
				class="mt-6 pt-4 border-t border-charcoal-800/50 flex flex-col sm:flex-row justify-between items-center gap-2"
			>
				<Typography variant="caption" class="text-charcoal-500 text-xs">
					© {currentYear} Nino Chavez. All rights reserved.
				</Typography>
				<Typography variant="caption" class="text-charcoal-500 text-xs">
					MOTION. EMOTION. Frame by Frame.
				</Typography>
			</div>
		</div>
	</footer>
</Motion>
