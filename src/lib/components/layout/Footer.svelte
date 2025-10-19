<!--
  Footer Component - Site-wide footer

  Features:
  - Copyright information
  - Social links
  - Credits and attribution
  - Responsive layout
  - Accessibility support

  Usage:
  <Footer />
-->

<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { Github, Linkedin, Mail, Camera } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';

	interface SocialLink {
		label: string;
		href: string;
		icon: typeof Github;
	}

	const socialLinks: SocialLink[] = [
		{
			label: 'GitHub',
			href: 'https://github.com/ninochevez',
			icon: Github,
		},
		{
			label: 'LinkedIn',
			href: 'https://linkedin.com/in/ninochavez',
			icon: Linkedin,
		},
		{
			label: 'Email',
			href: 'mailto:nino@example.com',
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
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				<!-- Brand Section -->
				<div class="space-y-4">
					<div class="flex items-center gap-3">
						<div class="p-2 rounded-lg bg-gold-500/10" aria-hidden="true">
							<Camera class="w-5 h-5 text-gold-500" />
						</div>
						<Typography variant="h3" class="text-lg">Nino Chavez Gallery</Typography>
					</div>
					<Typography variant="body" class="text-charcoal-400">
						AI-powered sports photography gallery showcasing the emotion and intensity of athletic
						moments.
					</Typography>
				</div>

				<!-- Quick Links -->
				<div class="space-y-4">
					<Typography variant="h3" class="text-lg">Explore</Typography>
					<nav aria-label="Footer navigation">
						<ul class="space-y-2">
							<li>
								<a
									href="/"
									class="text-charcoal-400 hover:text-gold-500 transition-colors inline-block"
								>
									Home
								</a>
							</li>
							<li>
								<a
									href="/explore"
									class="text-charcoal-400 hover:text-gold-500 transition-colors inline-block"
								>
									Explore Photos
								</a>
							</li>
							<li>
								<a
									href="/collections"
									class="text-charcoal-400 hover:text-gold-500 transition-colors inline-block"
								>
									Collections
								</a>
							</li>
						</ul>
					</nav>
				</div>

				<!-- Social Links -->
				<div class="space-y-4">
					<Typography variant="h3" class="text-lg">Connect</Typography>
					<div class="flex gap-4">
						{#each socialLinks as link}
							{@const Icon = link.icon}
							<Motion let:motion whileHover={{ scale: 1.1, y: -2 }} transition={MOTION.spring.snappy}>
								<a
									use:motion
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									class="p-2 rounded-lg bg-charcoal-900 hover:bg-gold-500/10 border border-charcoal-800 hover:border-gold-500/50 transition-colors"
									aria-label={link.label}
								>
									<Icon class="w-5 h-5 text-charcoal-400 hover:text-gold-500 transition-colors" />
								</a>
							</Motion>
						{/each}
					</div>
				</div>
			</div>

			<!-- Bottom Bar -->
			<div
				class="mt-8 pt-8 border-t border-charcoal-800 flex flex-col sm:flex-row justify-between items-center gap-4"
			>
				<Typography variant="caption" class="text-charcoal-500">
					© {currentYear} Nino Chavez. All rights reserved.
				</Typography>
				<Typography variant="caption" class="text-charcoal-500">
					Built with <span class="text-gold-500">SvelteKit</span> and
					<span class="text-gold-500">AI</span>
				</Typography>
			</div>
		</div>
	</footer>
</Motion>
