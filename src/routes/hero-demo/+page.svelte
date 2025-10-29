<!--
  Premium Hero Demo - Full-screen hero section showcase

  Demonstrates the PremiumHero component with different configurations
  and use cases for marketing and landing pages.
-->

<script lang="ts">
	import PremiumHero from '$lib/components/ui/PremiumHero.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Typography from '$lib/components/ui/Typography.svelte';
	import { ArrowLeft } from 'lucide-svelte';

	// Sample hero configurations
	const heroConfigs = [
		{
			backgroundImage: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200',
			title: 'VOLLEYBALL PHOTOGRAPHY',
			subtitle: 'ACTION & MOMENTS',
			description: 'Default configuration with volleyball action photography'
		},
		{
			backgroundImage: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=1200',
			title: 'SPORTS PHOTOGRAPHY',
			subtitle: 'CAPTURE THE THRILL',
			description: 'Alternative configuration with different imagery and copy'
		},
		{
			backgroundImage: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=1200',
			title: 'PROFESSIONAL PHOTOGRAPHY',
			subtitle: 'QUALITY & EXCELLENCE',
			description: 'Premium feel with professional sports photography'
		}
	];

	let currentConfigIndex = $state(0);
	let showDetails = $state(false);

	function nextConfig() {
		currentConfigIndex = (currentConfigIndex + 1) % heroConfigs.length;
	}

	function prevConfig() {
		currentConfigIndex = currentConfigIndex === 0 ? heroConfigs.length - 1 : currentConfigIndex - 1;
	}
</script>

<svelte:head>
	<title>Premium Hero Demo - Nino Chavez Gallery</title>
	<meta name="description" content="Demonstration of the PremiumHero component with full-screen hero sections" />
</svelte:head>

<!-- Navigation Header -->
<header class="fixed top-0 left-0 right-0 z-50 bg-charcoal-950/95 backdrop-blur-sm border-b border-charcoal-800/50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
		<div class="flex items-center justify-between gap-4">
			<div class="flex items-center gap-4">
				<a href="/style-guide" class="flex items-center gap-2 text-charcoal-400 hover:text-gold-500 transition-colors">
					<ArrowLeft class="w-4 h-4" />
					<span class="text-sm">Back to Style Guide</span>
				</a>
				<span class="text-charcoal-500">|</span>
				<h1 class="text-lg font-semibold text-white">Premium Hero Demo</h1>
			</div>
			<Button variant="ghost" size="sm" onclick={() => showDetails = !showDetails}>
				{showDetails ? 'Hide' : 'Show'} Details
			</Button>
		</div>
	</div>
</header>

<!-- Main Hero Section -->
<div class="pt-16">
	<PremiumHero
		backgroundImage={heroConfigs[currentConfigIndex].backgroundImage}
		title={heroConfigs[currentConfigIndex].title}
		subtitle={heroConfigs[currentConfigIndex].subtitle}
	/>

	<!-- Configuration Controls (Fixed overlay) -->
	<div class="fixed bottom-6 left-6 right-6 z-40">
		<Card class="bg-charcoal-900/95 backdrop-blur-sm border-charcoal-700 p-4">
			<div class="flex items-center justify-between gap-4">
				<div class="flex items-center gap-4">
					<Button variant="secondary" size="sm" onclick={prevConfig}>
						Previous
					</Button>
					<span class="text-sm text-charcoal-300">
						Config {currentConfigIndex + 1} of {heroConfigs.length}
					</span>
					<Button variant="secondary" size="sm" onclick={nextConfig}>
						Next
					</Button>
				</div>
				<div class="text-xs text-charcoal-400">
					{heroConfigs[currentConfigIndex].description}
				</div>
			</div>
		</Card>
	</div>

	<!-- Details Panel (Conditional) -->
	{#if showDetails}
		<div class="bg-charcoal-950 min-h-screen p-8">
			<div class="max-w-4xl mx-auto space-y-8">
				<div class="text-center">
					<Typography variant="h2" class="mb-4">Premium Hero Component Details</Typography>
					<p class="text-charcoal-300 max-w-2xl mx-auto">
						A full-screen hero section component designed for marketing pages and landing sections.
						Features premium typography, dark overlays, and smooth animations.
					</p>
				</div>

				<!-- Technical Specifications -->
				<Card class="p-6 bg-charcoal-900">
					<Typography variant="h3" class="mb-4 text-gold-400">Technical Specifications</Typography>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<h4 class="text-sm font-semibold text-charcoal-300 mb-3">Layout & Dimensions</h4>
							<ul class="text-xs text-charcoal-400 space-y-2">
								<li><strong>Height:</strong> 100vh (full viewport)</li>
								<li><strong>Width:</strong> 100% (full width)</li>
								<li><strong>Positioning:</strong> Flexbox centered</li>
								<li><strong>Responsive:</strong> Mobile-optimized</li>
							</ul>
						</div>
						<div>
							<h4 class="text-sm font-semibold text-charcoal-300 mb-3">Typography</h4>
							<ul class="text-xs text-charcoal-400 space-y-2">
								<li><strong>Font Family:</strong> Montserrat (Google Fonts)</li>
								<li><strong>Title:</strong> 5xl-7xl, uppercase, 700 weight</li>
								<li><strong>Subtitle:</strong> lg-2xl, uppercase, 300 weight</li>
								<li><strong>Letter Spacing:</strong> 2-3px for premium feel</li>
							</ul>
						</div>
					</div>
				</Card>

				<!-- Visual Effects -->
				<Card class="p-6 bg-charcoal-900">
					<Typography variant="h3" class="mb-4 text-gold-400">Visual Effects</Typography>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<h4 class="text-sm font-semibold text-charcoal-300 mb-3">Background & Overlay</h4>
							<ul class="text-xs text-charcoal-400 space-y-2">
								<li><strong>Background:</strong> Cover, center-aligned image</li>
								<li><strong>Overlay:</strong> Linear gradient (40% opacity)</li>
								<li><strong>Depth:</strong> Additional gradient for layering</li>
								<li><strong>Attachment:</strong> Fixed on desktop, scroll on mobile</li>
							</ul>
						</div>
						<div>
							<h4 class="text-sm font-semibold text-charcoal-300 mb-3">Animation & Motion</h4>
							<ul class="text-xs text-charcoal-400 space-y-2">
								<li><strong>Entry:</strong> Fade-in with gentle spring</li>
								<li><strong>Duration:</strong> 300ms with easing</li>
								<li><strong>Framework:</strong> Svelte Motion integration</li>
								<li><strong>Accessibility:</strong> Respects reduced motion</li>
							</ul>
						</div>
					</div>
				</Card>

				<!-- Usage Examples -->
				<Card class="p-6 bg-charcoal-900">
					<Typography variant="h3" class="mb-4 text-gold-400">Usage Examples</Typography>
					<div class="space-y-4">
						<div class="p-4 bg-charcoal-800 rounded-lg">
							<h4 class="text-sm font-semibold text-gold-400 mb-2">Marketing Landing Page</h4>
							<code class="text-xs text-charcoal-300 block mb-2">
								&lt;PremiumHero<br/>
								&nbsp;&nbsp;backgroundImage="/hero-image.jpg"<br/>
								&nbsp;&nbsp;title="VOLLEYBALL PHOTOGRAPHY"<br/>
								&nbsp;&nbsp;subtitle="ACTION & MOMENTS"<br/>
								/&gt;
							</code>
							<p class="text-xs text-charcoal-500">Perfect for homepage hero sections and marketing campaigns</p>
						</div>

						<div class="p-4 bg-charcoal-800 rounded-lg">
							<h4 class="text-sm font-semibold text-gold-400 mb-2">About Page Hero</h4>
							<code class="text-xs text-charcoal-300 block mb-2">
								&lt;PremiumHero<br/>
								&nbsp;&nbsp;backgroundImage="/about-hero.jpg"<br/>
								&nbsp;&nbsp;title="CAPTURING EXCELLENCE"<br/>
								&nbsp;&nbsp;subtitle="SINCE 2020"<br/>
								/&gt;
							</code>
							<p class="text-xs text-charcoal-500">Ideal for about pages and service introductions</p>
						</div>

						<div class="p-4 bg-charcoal-800 rounded-lg">
							<h4 class="text-sm font-semibold text-gold-400 mb-2">Contact/CTA Section</h4>
							<code class="text-xs text-charcoal-300 block mb-2">
								&lt;PremiumHero<br/>
								&nbsp;&nbsp;backgroundImage="/contact-bg.jpg"<br/>
								&nbsp;&nbsp;title="LET'S WORK TOGETHER"<br/>
								&nbsp;&nbsp;subtitle="BOOK YOUR SESSION"<br/>
								/&gt;
							</code>
							<p class="text-xs text-charcoal-500">Great for contact pages and call-to-action sections</p>
						</div>
					</div>
				</Card>

				<!-- Design System Integration -->
				<Card class="p-6 bg-charcoal-900">
					<Typography variant="h3" class="mb-4 text-gold-400">Design System Integration</Typography>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div class="text-center">
							<div class="w-12 h-12 bg-charcoal-800 rounded-lg flex items-center justify-center mx-auto mb-2">
								<span class="text-gold-500 font-bold">C</span>
							</div>
							<h4 class="text-sm font-semibold text-charcoal-300">Colors</h4>
							<p class="text-xs text-charcoal-500">Charcoal backgrounds, gold accents</p>
						</div>
						<div class="text-center">
							<div class="w-12 h-12 bg-charcoal-800 rounded-lg flex items-center justify-center mx-auto mb-2">
								<span class="text-gold-500 font-bold">T</span>
							</div>
							<h4 class="text-sm font-semibold text-charcoal-300">Typography</h4>
							<p class="text-xs text-charcoal-500">Montserrat, uppercase styling</p>
						</div>
						<div class="text-center">
							<div class="w-12 h-12 bg-charcoal-800 rounded-lg flex items-center justify-center mx-auto mb-2">
								<span class="text-gold-500 font-bold">M</span>
							</div>
							<h4 class="text-sm font-semibold text-charcoal-300">Motion</h4>
							<p class="text-xs text-charcoal-500">Svelte Motion integration</p>
						</div>
					</div>
				</Card>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Ensure hero section takes full height */
	:global(.hero-container) {
		min-height: 100vh;
	}
</style>