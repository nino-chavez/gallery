<!--
  Living Style Guide - Nino Chavez Gallery

  A comprehensive demonstration of the design system tokens, components,
  and principles that power the gallery experience.
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PhotoCard from '$lib/components/gallery/PhotoCard.svelte';
	import SearchBar from '$lib/components/ui/SearchBar.svelte';
	import { Heart, Camera, Award } from 'lucide-svelte';
	import type { Photo } from '$types/photo';

	// Sample photo data for PhotoCard demonstration
	const samplePhotos: Photo[] = [
		{
			id: 'sample-1',
			image_key: 'sample-1',
			image_url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800',
			thumbnail_url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=200',
			title: 'Portfolio Worthy Photo',
			caption: 'High quality volleyball action',
			keywords: ['volleyball', 'action', 'portfolio'],
			created_at: '2025-01-15',
			metadata: {
				sharpness: 9.5,
				exposure_accuracy: 9.0,
				composition_score: 9.5,
				emotional_impact: 9.0,
				portfolio_worthy: true,
				print_ready: true,
				social_media_optimized: true,
				emotion: 'triumph',
				composition: 'rule_of_thirds',
				time_of_day: 'midday',
				play_type: 'attack',
				action_intensity: 'high',
				sport_type: 'volleyball',
				photo_category: 'action',
				action_type: 'attack',
				use_cases: ['portfolio', 'print', 'social'],
				ai_provider: 'claude',
				ai_cost: 0.05,
				enriched_at: '2025-01-15T10:00:00Z'
			}
		},
		{
			id: 'sample-2',
			image_key: 'sample-2',
			image_url: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=800',
			thumbnail_url: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=200',
			title: 'Intense Action Shot',
			caption: 'High intensity volleyball moment',
			keywords: ['volleyball', 'intensity', 'action'],
			created_at: '2025-01-14',
			metadata: {
				sharpness: 8.0,
				exposure_accuracy: 7.5,
				composition_score: 8.0,
				emotional_impact: 8.5,
				portfolio_worthy: false,
				print_ready: true,
				social_media_optimized: true,
				emotion: 'intensity',
				composition: 'leading-lines',
				time_of_day: 'evening',
				play_type: 'dig',
				action_intensity: 'peak',
				sport_type: 'volleyball',
				photo_category: 'action',
				action_type: 'dig',
				use_cases: ['social', 'web'],
				ai_provider: 'claude',
				ai_cost: 0.05,
				enriched_at: '2025-01-14T10:00:00Z'
			}
		},
		{
			id: 'sample-3',
			image_key: 'sample-3',
			image_url: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800',
			thumbnail_url: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=200',
			title: 'Low Quality Photo (Dimmed)',
			caption: 'Lower quality test photo',
			keywords: ['volleyball', 'test'],
			created_at: '2025-01-13',
			metadata: {
				sharpness: 4.0,
				exposure_accuracy: 4.5,
				composition_score: 4.0,
				emotional_impact: 4.5,
				portfolio_worthy: false,
				print_ready: false,
				social_media_optimized: false,
				emotion: 'focus',
				composition: 'centered',
				time_of_day: 'morning',
				play_type: null,
				action_intensity: 'low',
				sport_type: 'volleyball',
				photo_category: 'candid',
				action_type: null,
				use_cases: ['archive'],
				ai_provider: 'claude',
				ai_cost: 0.05,
				enriched_at: '2025-01-13T10:00:00Z'
			}
		}
	];

	// Color swatches organized by category
	const colorTokens = {
		charcoal: [
			{ name: '--color-charcoal-50', value: '#f8f8f9' },
			{ name: '--color-charcoal-100', value: '#efeff1' },
			{ name: '--color-charcoal-200', value: '#dcdde0' },
			{ name: '--color-charcoal-300', value: '#c0c2c8' },
			{ name: '--color-charcoal-400', value: '#9fa2ab' },
			{ name: '--color-charcoal-500', value: '#808593' },
			{ name: '--color-charcoal-600', value: '#67697a' },
			{ name: '--color-charcoal-700', value: '#525463' },
			{ name: '--color-charcoal-800', value: '#454654' },
			{ name: '--color-charcoal-900', value: '#3b3c48' },
			{ name: '--color-charcoal-950', value: '#18181b' }
		],
		gold: [
			{ name: '--color-gold-50', value: '#fefce8' },
			{ name: '--color-gold-100', value: '#fef9c3' },
			{ name: '--color-gold-200', value: '#fef08a' },
			{ name: '--color-gold-300', value: '#fde047' },
			{ name: '--color-gold-400', value: '#facc15' },
			{ name: '--color-gold-500', value: '#eab308' },
			{ name: '--color-gold-600', value: '#ca8a04' },
			{ name: '--color-gold-700', value: '#a16207' },
			{ name: '--color-gold-800', value: '#854d0e' },
			{ name: '--color-gold-900', value: '#713f12' },
			{ name: '--color-gold-950', value: '#422006' }
		],
		emotion: [
			{ name: '--color-emotion-triumph', value: '#FFD700' },
			{ name: '--color-emotion-intensity', value: '#FF4500' },
			{ name: '--color-emotion-focus', value: '#4169E1' },
			{ name: '--color-emotion-determination', value: '#8B008B' },
			{ name: '--color-emotion-excitement', value: '#FF69B4' },
			{ name: '--color-emotion-serenity', value: '#20B2AA' }
		],
		semantic: [
			{ name: '--color-background', value: '#18181b' },
			{ name: '--color-foreground', value: '#f8f8f9' },
			{ name: '--color-border', value: '#454654' }
		]
	};

	// Typography scale
	const typographyScale = [
		{ name: 'text-xs', size: '0.75rem (12px)', usage: 'Metadata, utility labels' },
		{ name: 'text-sm', size: '0.875rem (14px)', usage: 'Body text, inputs' },
		{ name: 'text-base', size: '1rem (16px)', usage: 'Content' },
		{ name: 'text-lg', size: '1.125rem (18px)', usage: 'Subheadings' },
		{ name: 'text-xl', size: '1.25rem (20px)', usage: 'Page titles' },
		{ name: 'text-2xl', size: '1.5rem (24px)', usage: 'Display text' }
	];

	// Spacing scale
	const spacingScale = [
		{ name: 'spacing-1', value: '0.25rem', pixels: '4px' },
		{ name: 'spacing-2', value: '0.5rem', pixels: '8px' },
		{ name: 'spacing-3', value: '0.75rem', pixels: '12px' },
		{ name: 'spacing-4', value: '1rem', pixels: '16px' },
		{ name: 'spacing-6', value: '1.5rem', pixels: '24px' },
		{ name: 'spacing-8', value: '2rem', pixels: '32px' }
	];

	// Border radius
	const borderRadius = [
		{ name: 'rounded-md', value: '0.375rem', pixels: '6px', usage: 'Small elements' },
		{ name: 'rounded-lg', value: '0.5rem', pixels: '8px', usage: 'Cards, buttons' },
		{ name: 'rounded-full', value: '9999px', pixels: '∞', usage: 'Pills, badges' }
	];

	// Animation values
	const animations = [
		{ name: 'shimmer', description: 'Pulsing glow for portfolio-worthy photos', duration: '2s' },
		{ name: 'drawLine', description: 'SVG line drawing for composition overlays', duration: '1s' }
	];

	let searchQuery = $state('');
	let chromeRatioResult = $state<string>('');

	// Run the chrome ratio audit
	function runChromeAudit() {
		const header = document.querySelector('header');
		const viewport = window.innerHeight;
		const headerHeight = header?.offsetHeight || 0;
		const ratio = headerHeight / viewport;

		chromeRatioResult = `
Chrome Height: ${headerHeight}px
Viewport Height: ${viewport}px
Chrome Ratio: ${(ratio * 100).toFixed(1)}%
Status: ${ratio <= 0.40 ? '✅ PASS' : '❌ FAIL'}
		`.trim();
	}

	onMount(() => {
		runChromeAudit();
	});
</script>

<svelte:head>
	<title>Style Guide - Nino Chavez Gallery</title>
</svelte:head>

<!-- Minimal Page Header -->
<header class="sticky top-0 z-20 bg-charcoal-950/95 backdrop-blur-sm border-b border-charcoal-800/50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
		<div class="flex items-center justify-between gap-4">
			<div class="flex items-center gap-2">
				<h1 class="text-xl lg:text-2xl font-bold text-white">Style Guide</h1>
				<span class="text-charcoal-400 text-xs">Design System v2.0.0</span>
			</div>
			<a href="/" class="text-xs text-gold-500 hover:text-gold-400 transition-colors">
				← Back to Gallery
			</a>
		</div>
	</div>
</header>

<!-- Main Content -->
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">

	<!-- Introduction -->
	<section>
		<h2 class="text-2xl mb-4 font-semibold text-white">Welcome to the Living Style Guide</h2>
		<p class="text-charcoal-300 mb-6 max-w-3xl leading-relaxed">
			This page demonstrates the design tokens, component patterns, and core principles that power
			the Nino Chavez Gallery. Every element shown here is built using production code, ensuring
			this documentation always stays in sync with the live site.
		</p>
		<Card class="bg-charcoal-900 border-gold-500/30 p-6">
			<h3 class="text-lg mb-3 text-gold-400 font-semibold">Core Philosophy: Digital Gallery Aesthetic</h3>
			<p class="text-charcoal-300 text-sm leading-relaxed">
				"A gallery is a content delivery system, not a software application. Every pixel of chrome
				must justify its existence. Photos are the product; UI is infrastructure."
			</p>
		</Card>
	</section>

	<!-- 1. Color System -->
	<section>
		<h2 class="text-2xl mb-6 border-b border-charcoal-800 pb-3 font-semibold text-white">
			1. Color System
		</h2>

		<!-- Charcoal (Neutral) -->
		<div class="mb-8">
			<h3 class="text-lg mb-4 text-charcoal-300 font-semibold">Charcoal (Neutral Palette)</h3>
			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
				{#each colorTokens.charcoal as color}
					<div class="flex flex-col">
						<div
							class="h-20 rounded-lg border border-charcoal-700 mb-2"
							style="background-color: {color.value};"
						></div>
						<span class="text-xs text-charcoal-400 font-mono">
							{color.name.replace('--color-', '')}
						</span>
						<span class="text-xs text-charcoal-500 font-mono">
							{color.value}
						</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Gold (Accent) -->
		<div class="mb-8">
			<h3 class="text-lg mb-4 text-charcoal-300 font-semibold">Gold (Accent Palette)</h3>
			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
				{#each colorTokens.gold as color}
					<div class="flex flex-col">
						<div
							class="h-20 rounded-lg border border-charcoal-700 mb-2"
							style="background-color: {color.value};"
						></div>
						<span class="text-xs text-charcoal-400 font-mono">
							{color.name.replace('--color-', '')}
						</span>
						<span class="text-xs text-charcoal-500 font-mono">
							{color.value}
						</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Emotion Colors -->
		<div class="mb-8">
			<h3 class="text-lg mb-4 text-charcoal-300 font-semibold">Emotion Palette</h3>
			<p class="text-xs text-charcoal-400 mb-4">
				These colors are used for emotion halos that encode photo emotion metadata as colored glows.
			</p>
			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
				{#each colorTokens.emotion as color}
					<div class="flex flex-col">
						<div
							class="h-20 rounded-lg border border-charcoal-700 mb-2"
							style="background-color: {color.value}; box-shadow: 0 0 20px 4px {color.value}80;"
						></div>
						<span class="text-xs text-charcoal-400 font-mono">
							{color.name.replace('--color-emotion-', '')}
						</span>
						<span class="text-xs text-charcoal-500 font-mono">
							{color.value}
						</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Semantic Colors -->
		<div>
			<h3 class="text-lg mb-4 text-charcoal-300 font-semibold">Semantic Colors</h3>
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
				{#each colorTokens.semantic as color}
					<div class="flex flex-col">
						<div
							class="h-20 rounded-lg border border-charcoal-700 mb-2"
							style="background-color: {color.value};"
						></div>
						<span class="text-xs text-charcoal-400 font-mono">
							{color.name}
						</span>
						<span class="text-xs text-charcoal-500 font-mono">
							{color.value}
						</span>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- 2. Typography -->
	<section>
		<h2 class="text-2xl mb-6 border-b border-charcoal-800 pb-3 font-semibold text-white">
			2. Typography
		</h2>

		<!-- Typography Scale -->
		<div class="mb-8">
			<h3 class="text-lg mb-4 text-charcoal-300 font-semibold">Typography Scale</h3>
			<div class="space-y-4">
				{#each typographyScale as type}
					<div class="flex items-baseline gap-6 p-4 bg-charcoal-900/50 rounded-lg">
						<span class="text-xs text-charcoal-400 font-mono w-24 shrink-0">
							{type.name}
						</span>
						<div class="flex-1">
							<p class={type.name}>The quick brown fox jumps over the lazy dog</p>
						</div>
						<div class="text-right shrink-0">
							<span class="text-xs text-charcoal-500 block">
								{type.size}
							</span>
							<span class="text-xs text-charcoal-600">
								{type.usage}
							</span>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Heading Hierarchy -->
		<div class="mb-8">
			<h3 class="text-lg mb-4 text-charcoal-300 font-semibold">Heading Hierarchy</h3>
			<div class="space-y-4">
				<h1 class="text-4xl font-bold">Heading 1 - Display Text</h1>
				<h2 class="text-3xl font-semibold">Heading 2 - Page Sections</h2>
				<h3 class="text-2xl font-semibold">Heading 3 - Subsections</h3>
				<h4 class="text-xl font-semibold">Heading 4 - Card Titles</h4>
			</div>
		</div>

		<!-- Body Text -->
		<div class="mb-8">
			<h3 class="text-lg mb-4 text-charcoal-300 font-semibold">Body Text</h3>
			<div class="space-y-4">
				<p class="text-base max-w-2xl text-charcoal-200 leading-relaxed">
					Standard body text using text-base (16px). This is the default size for most content.
					It provides excellent readability while maintaining a professional appearance.
				</p>
				<p class="text-sm text-charcoal-400 max-w-2xl">
					Caption text using text-sm (14px). Used for secondary information, metadata, and helper text.
					Typically paired with muted colors like charcoal-400.
				</p>
				<p class="text-xs text-charcoal-500 max-w-2xl">
					Metadata text using text-xs (12px). The smallest text size in our system, reserved for
					counts, timestamps, and utility labels that should not compete for attention.
				</p>
			</div>
		</div>

		<!-- Display Typography (Marketing/Content Pages Only) -->
		<div>
			<h3 class="text-lg mb-4 text-charcoal-300 font-semibold">Display Typography (Phase 2)</h3>
			<Card class="p-6 bg-charcoal-900 border-gold-500/30 mb-6">
				<p class="text-sm text-charcoal-300 leading-relaxed mb-3">
					<strong class="text-gold-400">⚠️ Important:</strong> Display typography (text-3xl through text-8xl)
					is <strong>only for marketing and content pages</strong> (About, Contact, Landing pages).
				</p>
				<p class="text-xs text-charcoal-400 leading-relaxed">
					Gallery pages (Explore, Albums, Collections) must use text-xl max to maintain the ≤40% chrome budget.
					Extended scale allows for impactful storytelling on pages where content is the message, not photos.
				</p>
			</Card>

			<div class="space-y-6">
				<div class="p-6 bg-charcoal-900/50 rounded-lg">
					<p class="text-xs text-charcoal-400 mb-3">text-3xl (30px) - Large page titles</p>
					<h1 class="text-3xl font-bold">Large Display Heading</h1>
				</div>

				<div class="p-6 bg-charcoal-900/50 rounded-lg">
					<p class="text-xs text-charcoal-400 mb-3">text-4xl (36px) - Hero section titles</p>
					<h1 class="text-4xl font-bold">Hero Section Title</h1>
				</div>

				<div class="p-6 bg-charcoal-900/50 rounded-lg">
					<p class="text-xs text-charcoal-400 mb-3">text-5xl (48px) - Landing page headlines</p>
					<h1 class="text-5xl font-bold">Landing Page Headline</h1>
				</div>

				<div class="p-6 bg-charcoal-900/50 rounded-lg">
					<p class="text-xs text-charcoal-400 mb-3">text-6xl (60px) - Marketing hero (use sparingly)</p>
					<h1 class="text-6xl font-bold">Marketing Hero</h1>
				</div>

				<div class="p-6 bg-charcoal-900/50 rounded-lg">
					<p class="text-xs text-charcoal-400 mb-3">text-7xl (72px) - Extra large displays</p>
					<h1 class="text-7xl font-bold">Extra Large</h1>
				</div>

				<div class="p-6 bg-charcoal-900/50 rounded-lg overflow-hidden">
					<p class="text-xs text-charcoal-400 mb-3">text-8xl (96px) - Massive hero text</p>
					<h1 class="text-8xl font-bold leading-none">EPIC</h1>
				</div>
			</div>

			<Card class="p-6 bg-charcoal-800 mt-6">
				<h4 class="text-base mb-3 font-semibold">Usage Example: Marketing Page Hero</h4>
				<div class="p-8 bg-charcoal-900 rounded-lg border border-gold-500/20">
					<h1 class="text-4xl lg:text-6xl font-bold mb-4 leading-tight">
						Capturing Athletic<br />Moments
					</h1>
					<p class="text-lg lg:text-2xl text-charcoal-300 mb-6">
						AI-powered sports photography that tells your story
					</p>
					<button class="px-6 py-3 bg-gold-500 text-charcoal-950 rounded-lg font-medium text-base">
						Explore Gallery
					</button>
				</div>
				<p class="text-xs text-charcoal-500 mt-4">
					This example uses text-6xl for the hero headline and text-2xl for supporting text.
					Chrome ratio: ~28% (acceptable for marketing pages ≤60%).
				</p>
			</Card>
		</div>
	</section>

	<!-- 3. Spacing, Shape & Elevation -->
	<section>
		<h2 class="text-2xl mb-6 border-b border-charcoal-800 pb-3 font-semibold text-white">
			3. Spacing, Shape & Elevation
		</h2>

		<!-- Spacing Scale -->
		<div class="mb-8">
			<h3 class="text-lg mb-4 text-charcoal-300 font-semibold">Spacing Scale</h3>
			<div class="space-y-4">
				{#each spacingScale as space}
					<div class="flex items-center gap-6">
						<span class="text-xs text-charcoal-400 font-mono w-32">
							{space.name}
						</span>
						<div class="bg-gold-500" style="width: {space.value}; height: 24px;"></div>
						<span class="text-xs text-charcoal-500">
							{space.value} ({space.pixels})
						</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Border Radius -->
		<div class="mb-8">
			<h3 class="text-lg mb-4 text-charcoal-300 font-semibold">Border Radius</h3>
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
				{#each borderRadius as radius}
					<div class="flex flex-col items-center gap-3">
						<div
							class="w-24 h-24 bg-charcoal-800 border border-charcoal-700 {radius.name}"
						></div>
						<span class="text-xs text-charcoal-400 font-mono">
							{radius.name}
						</span>
						<span class="text-xs text-charcoal-500 text-center">
							{radius.value} ({radius.pixels})<br/>{radius.usage}
						</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Shadow Scale -->
		<div>
			<h3 class="text-lg mb-4 text-charcoal-300 font-semibold">Shadow Scale</h3>
			<p class="text-xs text-charcoal-400 mb-4">
				Shadows are primarily used for emotion halos and quality effects, not UI elevation.
			</p>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				<div class="p-6 bg-charcoal-900 rounded-lg">
					<div class="w-full h-24 bg-charcoal-800 rounded-lg emotion-halo-triumph"></div>
					<span class="text-xs text-charcoal-400 mt-3 text-center block">
						Triumph Halo (Gold)
					</span>
				</div>
				<div class="p-6 bg-charcoal-900 rounded-lg">
					<div class="w-full h-24 bg-charcoal-800 rounded-lg emotion-halo-intensity"></div>
					<span class="text-xs text-charcoal-400 mt-3 text-center block">
						Intensity Halo (Red-Orange)
					</span>
				</div>
				<div class="p-6 bg-charcoal-900 rounded-lg">
					<div class="w-full h-24 bg-charcoal-800 rounded-lg quality-shimmer"></div>
					<span class="text-xs text-charcoal-400 mt-3 text-center block">
						Quality Shimmer (Portfolio)
					</span>
				</div>
			</div>
		</div>
	</section>

	<!-- 3.5. Animated Glow Effects -->
	<section>
		<h2 class="text-2xl mb-6 border-b border-charcoal-800 pb-3 font-semibold text-white">
			3.5. Animated Glow Effects
		</h2>

		<Card class="p-6 bg-charcoal-900 border-gold-500/30 mb-8">
			<h3 class="text-lg mb-3 text-gold-400 font-semibold">Animated Gradient Glow (Emotion Palette)</h3>
			<p class="text-sm text-charcoal-300 leading-relaxed mb-3">
				Animated gradient border effects inspired by Instagram's story rings and highlight buttons.
				These effects use CSS keyframe animations with the gallery's emotion palette (Triumph gold → Intensity red-orange → Excitement pink)
				to create eye-catching, premium visual treatments that align with the existing design system.
			</p>
			<p class="text-xs text-charcoal-400 mb-3">
				<strong>Performance Note:</strong> These effects use CSS transforms and gradients.
				All animations respect <code class="text-gold-400">prefers-reduced-motion</code>.
			</p>
			<div class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
				<p class="text-sm text-red-300 leading-relaxed mb-2">
					<strong class="text-red-400">⚠️ Photo-First UX Warning:</strong> This effect is visually distracting and competes with photos for attention.
				</p>
				<p class="text-xs text-red-200/80 leading-relaxed">
					<strong>Recommendation:</strong> Avoid using on gallery pages (Explore, Albums, Collections, Timeline).
					Reserve for marketing pages, CTAs on static pages, or non-photo contexts only. The core principle is:
					<em>"Photos are the product; UI is infrastructure."</em> Animated effects violate this principle.
				</p>
			</div>
		</Card>

		<!-- Basic Animated Glow -->
		<div class="mb-12">
			<h3 class="text-lg mb-6 text-charcoal-300 font-semibold">Basic Animated Glow</h3>
			<p class="text-xs text-charcoal-400 mb-6">
				A smooth gradient animation that cycles through Triumph gold (#FFD700) → Intensity red-orange (#FF4500) → Excitement pink (#FF69B4) over 3 seconds.
			</p>

			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
				<!-- Example 1: Basic Rectangle -->
				<div class="relative p-8 bg-charcoal-900 rounded-lg flex items-center justify-center">
					<div class="relative">
						<div class="absolute -inset-0.5 rounded-lg blur opacity-75 animate-glow-rotate"></div>
						<div class="relative bg-charcoal-950 rounded-lg p-6">
							<p class="text-white font-medium text-center">Basic Glow</p>
						</div>
					</div>
				</div>

				<!-- Example 2: Card -->
				<div class="relative p-8 bg-charcoal-900 rounded-lg flex items-center justify-center">
					<div class="relative">
						<div class="absolute -inset-0.5 rounded-lg blur opacity-75 animate-glow-rotate"></div>
						<div class="relative bg-charcoal-950 rounded-lg p-4 min-w-[160px]">
							<div class="flex items-center justify-center mb-2">
								<Camera class="w-8 h-8 text-gold-500" />
							</div>
							<p class="text-white text-sm text-center font-medium">Featured</p>
						</div>
					</div>
				</div>

				<!-- Example 3: Button -->
				<div class="relative p-8 bg-charcoal-900 rounded-lg flex items-center justify-center">
					<div class="relative">
						<div class="absolute -inset-0.5 rounded-lg blur opacity-75 animate-glow-rotate"></div>
						<button class="relative bg-charcoal-950 rounded-lg px-6 py-3 font-medium text-white hover:bg-charcoal-900 transition-colors">
							Premium CTA
						</button>
					</div>
				</div>
			</div>

			<Card class="p-4 bg-charcoal-950">
				<p class="text-xs text-charcoal-400 mb-2 font-medium">Implementation:</p>
				<pre class="text-xs text-charcoal-300 font-mono overflow-x-auto"><code>&lt;div class="relative"&gt;
  &lt;div class="absolute -inset-0.5 rounded-lg blur opacity-75 animate-glow-rotate"&gt;&lt;/div&gt;
  &lt;div class="relative bg-charcoal-950 rounded-lg p-6"&gt;
    Your content here
  &lt;/div&gt;
&lt;/div&gt;</code></pre>
				<p class="text-xs text-charcoal-500 mt-2">
					<strong>How it works:</strong> The <code class="text-gold-400">animate-glow-rotate</code> class applies a 400% background gradient that smoothly scrolls through
					Triumph gold → Intensity red-orange → Excitement pink using <code class="text-gold-400">background-position</code> animation for a seamless flow.
				</p>
			</Card>
		</div>

		<!-- Speed Variants -->
		<div class="mb-12">
			<h3 class="text-lg mb-6 text-charcoal-300 font-semibold">Speed Variants</h3>
			<p class="text-xs text-charcoal-400 mb-6">
				Control the animation speed to match the context. Fast for attention-grabbing CTAs, slow for ambient premium effects.
			</p>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				<!-- Slow (6s) -->
				<div class="relative p-8 bg-charcoal-900 rounded-lg flex items-center justify-center">
					<div class="relative">
						<div class="absolute -inset-0.5 rounded-lg blur opacity-75 animate-glow-slow"></div>
						<div class="relative bg-charcoal-950 rounded-lg p-6 text-center">
							<p class="text-white font-medium mb-1">Slow</p>
							<p class="text-xs text-charcoal-400">6s duration</p>
						</div>
					</div>
				</div>

				<!-- Medium (3s) - Default -->
				<div class="relative p-8 bg-charcoal-900 rounded-lg flex items-center justify-center">
					<div class="relative">
						<div class="absolute -inset-0.5 rounded-lg blur opacity-75 animate-glow-rotate"></div>
						<div class="relative bg-charcoal-950 rounded-lg p-6 text-center">
							<p class="text-white font-medium mb-1">Medium</p>
							<p class="text-xs text-charcoal-400">3s duration</p>
						</div>
					</div>
				</div>

				<!-- Fast (1.5s) -->
				<div class="relative p-8 bg-charcoal-900 rounded-lg flex items-center justify-center">
					<div class="relative">
						<div class="absolute -inset-0.5 rounded-lg blur opacity-75 animate-glow-fast"></div>
						<div class="relative bg-charcoal-950 rounded-lg p-6 text-center">
							<p class="text-white font-medium mb-1">Fast</p>
							<p class="text-xs text-charcoal-400">1.5s duration</p>
						</div>
					</div>
				</div>
			</div>

			<Card class="p-4 bg-charcoal-950">
				<p class="text-xs text-charcoal-400 mb-2 font-medium">CSS Classes:</p>
				<pre class="text-xs text-charcoal-300 font-mono overflow-x-auto"><code>animate-glow-slow   /* 6s duration - ambient premium effect */
animate-glow-rotate /* 3s duration - balanced (default) */
animate-glow-fast   /* 1.5s duration - attention-grabbing CTAs */</code></pre>
			</Card>
		</div>

		<!-- Intensity Variants -->
		<div class="mb-12">
			<h3 class="text-lg mb-6 text-charcoal-300 font-semibold">Intensity Variants</h3>
			<p class="text-xs text-charcoal-400 mb-6">
				Adjust the blur and opacity to control the glow intensity. Subtle for backgrounds, intense for hero elements.
			</p>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				<!-- Subtle -->
				<div class="relative p-8 bg-charcoal-900 rounded-lg flex items-center justify-center">
					<div class="relative">
						<div class="absolute -inset-0.5 rounded-lg blur-sm opacity-40 animate-glow-rotate"></div>
						<div class="relative bg-charcoal-950 rounded-lg p-6 text-center">
							<p class="text-white font-medium mb-1">Subtle</p>
							<p class="text-xs text-charcoal-400">blur-sm opacity-40</p>
						</div>
					</div>
				</div>

				<!-- Medium - Default -->
				<div class="relative p-8 bg-charcoal-900 rounded-lg flex items-center justify-center">
					<div class="relative">
						<div class="absolute -inset-0.5 rounded-lg blur opacity-75 animate-glow-rotate"></div>
						<div class="relative bg-charcoal-950 rounded-lg p-6 text-center">
							<p class="text-white font-medium mb-1">Medium</p>
							<p class="text-xs text-charcoal-400">blur opacity-75</p>
						</div>
					</div>
				</div>

				<!-- Intense -->
				<div class="relative p-8 bg-charcoal-900 rounded-lg flex items-center justify-center">
					<div class="relative">
						<div class="absolute -inset-1 rounded-lg blur-lg opacity-90 animate-glow-rotate"></div>
						<div class="relative bg-charcoal-950 rounded-lg p-6 text-center">
							<p class="text-white font-medium mb-1">Intense</p>
							<p class="text-xs text-charcoal-400">blur-lg opacity-90</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Gallery-Specific Applications -->
		<div class="mb-12">
			<h3 class="text-lg mb-6 text-charcoal-300 font-semibold">Potential Applications (Non-Gallery Pages Only)</h3>
			<div class="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-6">
				<p class="text-sm text-yellow-300 leading-relaxed mb-2">
					<strong class="text-yellow-400">⚠️ Reality Check:</strong> Most of these examples violate photo-first UX principles.
				</p>
				<p class="text-xs text-yellow-200/80 leading-relaxed">
					These demonstrations show <em>technical implementation</em>, not recommended usage.
					In practice, this effect should be used extremely rarely or not at all on pages containing photography.
				</p>
			</div>

			<div class="space-y-8">
				<!-- Application 1: Featured Portfolio Photo -->
				<div>
					<h4 class="text-base mb-4 text-charcoal-300 font-medium">
						1. Featured Portfolio Photo Badge
						<span class="text-xs text-red-400 font-normal ml-2">❌ Bad Example - Competes with photos</span>
					</h4>
					<p class="text-xs text-charcoal-500 mb-4">
						<strong class="text-red-400">Why this is bad:</strong> The animated glow draws attention away from the photo itself.
						Use static emotion halos or gold shimmer instead for portfolio-worthy indicators.
					</p>
					<div class="relative p-8 bg-charcoal-900 rounded-lg">
						<div class="relative inline-block">
							<div class="absolute -inset-0.5 rounded-full blur opacity-75 animate-glow-rotate"></div>
							<div class="relative flex items-center gap-2 bg-charcoal-950 rounded-full px-4 py-2">
								<Heart class="w-4 h-4 text-pink-400" />
								<span class="text-white font-medium text-sm">Editor's Pick</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Application 2: Premium Photo Card -->
				<div>
					<h4 class="text-base mb-4 text-charcoal-300 font-medium">
						2. Premium Photo Card Border
						<span class="text-xs text-red-400 font-normal ml-2">❌ Bad Example - Worst offender</span>
					</h4>
					<p class="text-xs text-charcoal-500 mb-4">
						<strong class="text-red-400">Why this is terrible:</strong> Animated borders around photos are the #1 violation of photo-first UX.
						The animation constantly pulls the eye away from the photograph. Never do this on gallery pages.
					</p>
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						<div class="relative">
							<div class="absolute -inset-0.5 rounded-lg blur-sm opacity-60 animate-glow-slow"></div>
							<div class="relative bg-charcoal-950 rounded-lg overflow-hidden">
								<div class="aspect-[4/3] bg-charcoal-800 flex items-center justify-center">
									<Camera class="w-16 h-16 text-charcoal-700" />
								</div>
								<div class="p-3">
									<p class="text-white text-sm font-medium">Premium Photo</p>
									<p class="text-xs text-charcoal-400">Portfolio-worthy • 9.5/10</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Application 3: Call-to-Action Button -->
				<div>
					<h4 class="text-base mb-4 text-charcoal-300 font-medium">
						3. Premium Call-to-Action
						<span class="text-xs text-yellow-400 font-normal ml-2">⚠️ Maybe - Only on marketing pages</span>
					</h4>
					<p class="text-xs text-charcoal-500 mb-4">
						<strong class="text-yellow-400">Context matters:</strong> This might be acceptable for "Book Photo Session" buttons
						on About/Contact pages where photos aren't the primary focus. Still use sparingly.
					</p>
					<div class="relative p-8 bg-charcoal-900 rounded-lg flex justify-center">
						<div class="relative">
							<div class="absolute -inset-0.5 rounded-lg blur opacity-75 animate-glow-rotate"></div>
							<button class="relative bg-charcoal-950 rounded-lg px-8 py-4 font-semibold text-white hover:bg-charcoal-900 transition-colors flex items-center gap-2">
								<span>Book Photo Session</span>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
								</svg>
							</button>
						</div>
					</div>
				</div>

				<!-- Application 4: Collection Header -->
				<div>
					<h4 class="text-base mb-4 text-charcoal-300 font-medium">
						4. Premium Collection Header
						<span class="text-xs text-red-400 font-normal ml-2">❌ Bad Example - Chrome budget violation</span>
					</h4>
					<p class="text-xs text-charcoal-500 mb-4">
						<strong class="text-red-400">Why this is bad:</strong> Large animated headers on collection pages add unnecessary chrome
						and distract from the photos below. Collections pages should be minimal and content-focused.
					</p>
					<div class="relative p-8 bg-charcoal-900 rounded-lg">
						<div class="relative">
							<div class="absolute -inset-1 rounded-lg blur-md opacity-50 animate-glow-slow"></div>
							<div class="relative bg-charcoal-950 rounded-lg p-8 text-center">
								<div class="flex items-center justify-center mb-3">
									<Award class="w-8 h-8 text-gold-500" />
								</div>
								<h3 class="text-2xl font-bold text-white mb-2">Championship Finals 2025</h3>
								<p class="text-sm text-charcoal-300 mb-4">Limited Edition Collection • 24 Photos</p>
								<button class="px-6 py-2 bg-gold-500 text-charcoal-950 rounded-lg font-medium text-sm hover:bg-gold-600 transition-colors">
									View Collection
								</button>
							</div>
						</div>
					</div>
				</div>

				<!-- Application 5: Loading State / Skeleton -->
				<div>
					<h4 class="text-base mb-4 text-charcoal-300 font-medium">
						5. Premium Loading State
						<span class="text-xs text-red-400 font-normal ml-2">❌ Bad Example - Unnecessary complexity</span>
					</h4>
					<p class="text-xs text-charcoal-500 mb-4">
						<strong class="text-red-400">Why this is bad:</strong> Loading states should be simple and unobtrusive.
						Animated glows on skeletons add visual noise during an already-distracting loading period. Use simple pulse animations instead.
					</p>
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
						{#each [1, 2, 3] as i}
							<div class="relative">
								<div class="absolute -inset-0.5 rounded-lg blur-sm opacity-30 animate-glow-fast"></div>
								<div class="relative bg-charcoal-950 rounded-lg p-4">
									<div class="animate-pulse space-y-3">
										<div class="aspect-[4/3] bg-charcoal-800 rounded"></div>
										<div class="h-4 bg-charcoal-800 rounded w-3/4"></div>
										<div class="h-3 bg-charcoal-800 rounded w-1/2"></div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- Design Recommendations -->
		<Card class="p-6 bg-charcoal-900 border-gold-500/30">
			<h3 class="text-lg mb-4 text-gold-400 font-semibold">Design Recommendations</h3>
			<div class="space-y-3 text-sm text-charcoal-300">
				<div class="flex items-start gap-3">
					<span class="text-red-400 font-mono text-xl">✗</span>
					<div>
						<strong class="text-red-400">DON'T USE ON GALLERY PAGES:</strong> This effect is fundamentally incompatible with photo-first UX.
						Avoid on Explore, Albums, Collections, Timeline, and any page where photos are the primary content.
					</div>
				</div>
				<div class="flex items-start gap-3">
					<span class="text-red-400 font-mono">✗</span>
					<div>
						<strong>DON'T:</strong> Use on photo cards or near photo grids - competes for attention with actual content
					</div>
				</div>
				<div class="flex items-start gap-3">
					<span class="text-red-400 font-mono">✗</span>
					<div>
						<strong>DON'T:</strong> Use fast animation speeds for large elements (causes distraction)
					</div>
				</div>
				<div class="flex items-start gap-3">
					<span class="text-yellow-400 font-mono">⚠</span>
					<div>
						<strong class="text-yellow-400">MAYBE:</strong> Marketing pages, About/Contact CTAs, or "Book Session" buttons on non-gallery pages
					</div>
				</div>
				<div class="flex items-start gap-3">
					<span class="text-green-400 font-mono">✓</span>
					<div>
						<strong>DO:</strong> Use slow animation (6s) if absolutely necessary for ambient effects
					</div>
				</div>
				<div class="flex items-start gap-3">
					<span class="text-green-400 font-mono">✓</span>
					<div>
						<strong>DO:</strong> Keep it in the style guide as a technical reference and cautionary example
					</div>
				</div>
			</div>
			<div class="mt-4 p-3 bg-charcoal-950 rounded border border-charcoal-800">
				<p class="text-xs text-charcoal-400 italic">
					"A gallery is a content delivery system, not a software application. Every pixel of chrome must justify its existence.
					Photos are the product; UI is infrastructure." - Design System v2.0.0
				</p>
			</div>
		</Card>
	</section>

	<!-- 4. Component Library -->
	<section>
		<h2 class="text-2xl mb-6 border-b border-charcoal-800 pb-3 font-semibold text-white">
			4. Component Library
		</h2>

		<!-- Buttons -->
		<div class="mb-12">
			<h3 class="text-lg mb-4 text-charcoal-300 font-semibold">Buttons</h3>
			<div class="space-y-6">
				<!-- Primary Variant -->
				<div>
					<p class="text-xs text-charcoal-400 mb-3">
						Primary (Gold accent for main CTAs)
					</p>
					<div class="flex flex-wrap items-center gap-4">
						<Button variant="primary" size="sm">Small Primary</Button>
						<Button variant="primary" size="md">Medium Primary</Button>
						<Button variant="primary" size="lg">Large Primary</Button>
						<Button variant="primary" size="md" disabled>Disabled</Button>
					</div>
				</div>

				<!-- Secondary Variant -->
				<div>
					<p class="text-xs text-charcoal-400 mb-3">
						Secondary (Subtle, outlined)
					</p>
					<div class="flex flex-wrap items-center gap-4">
						<Button variant="secondary" size="sm">Small Secondary</Button>
						<Button variant="secondary" size="md">Medium Secondary</Button>
						<Button variant="secondary" size="lg">Large Secondary</Button>
						<Button variant="secondary" size="md" disabled>Disabled</Button>
					</div>
				</div>

				<!-- Ghost Variant -->
				<div>
					<p class="text-xs text-charcoal-400 mb-3">
						Ghost (Minimal, transparent)
					</p>
					<div class="flex flex-wrap items-center gap-4">
						<Button variant="ghost" size="sm">Small Ghost</Button>
						<Button variant="ghost" size="md">Medium Ghost</Button>
						<Button variant="ghost" size="lg">Large Ghost</Button>
						<Button variant="ghost" size="md" disabled>Disabled</Button>
					</div>
				</div>
			</div>
		</div>

		<!-- Search Bar -->
		<div class="mb-12">
			<h3 class="text-lg mb-4 text-charcoal-300 font-semibold">Search Bar</h3>
			<p class="text-xs text-charcoal-400 mb-4">
				Compact search input with icon and clear functionality
			</p>
			<div class="max-w-md">
				<SearchBar bind:value={searchQuery} placeholder="Search photos..." />
			</div>
			{#if searchQuery}
				<p class="text-xs text-charcoal-500 mt-2">
					Current query: "{searchQuery}"
				</p>
			{/if}
		</div>

		<!-- Photo Cards (Live Demo) -->
		<div class="mb-12">
			<h3 class="text-lg mb-4 text-charcoal-300 font-semibold">Photo Cards</h3>
			<p class="text-xs text-charcoal-400 mb-4">
				Photo cards demonstrate all primary visual data layers: emotion halos, quality shimmer, and quality dimming.
				Hover over cards to reveal composition overlays and metadata.
			</p>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each samplePhotos as photo, index}
					<PhotoCard {photo} {index} />
				{/each}
			</div>
			<div class="mt-6 p-4 bg-charcoal-900/50 rounded-lg">
				<p class="text-xs text-charcoal-400 mb-2">
					<strong>Visual Data Encoding:</strong>
				</p>
				<ul class="text-xs text-charcoal-500 space-y-1 list-disc list-inside">
					<li><strong>Gold Shimmer:</strong> Portfolio-worthy photos (quality_score ≥ 9, portfolio_worthy = true)</li>
					<li><strong>Colored Halos:</strong> Emotion metadata (Triumph = Gold, Intensity = Red-Orange, etc.)</li>
					<li><strong>Blur & Dim:</strong> Low-quality photos (quality_score &lt; 6)</li>
					<li><strong>Composition Overlays:</strong> SVG guides shown on hover (Rule of Thirds, Leading Lines, etc.)</li>
				</ul>
			</div>
		</div>

		<!-- Cards -->
		<div class="mb-12">
			<h3 class="text-lg mb-4 text-charcoal-300 font-semibold">Cards</h3>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				<Card class="p-6">
					<h4 class="text-lg mb-2 font-semibold">Default Card</h4>
					<p class="text-sm text-charcoal-400">
						Standard card with default styling.
					</p>
				</Card>
				<Card class="p-6 border-gold-500/30 bg-charcoal-900">
					<h4 class="text-lg mb-2 text-gold-400 font-semibold">Accent Card</h4>
					<p class="text-sm text-charcoal-400">
						Card with gold accent border.
					</p>
				</Card>
				<Card class="p-6 bg-charcoal-800">
					<h4 class="text-lg mb-2 font-semibold">Dark Card</h4>
					<p class="text-sm text-charcoal-400">
						Card with darker background.
					</p>
				</Card>
			</div>
		</div>

		<!-- Badges -->
		<div>
			<h3 class="text-lg mb-4 text-charcoal-300 font-semibold">Badges</h3>
			<div class="flex flex-wrap gap-3">
				<span class="px-3 py-1 rounded-full text-xs bg-gold-500 text-black font-medium">
					Portfolio
				</span>
				<span class="px-3 py-1 rounded-full text-xs bg-charcoal-800 text-charcoal-100 border border-charcoal-700">
					Sport: Volleyball
				</span>
				<span class="px-3 py-1 rounded-full text-xs bg-charcoal-900 text-charcoal-300">
					Category: Action
				</span>
				<span class="px-3 py-1 rounded-full text-xs border border-gold-500/50 text-gold-400">
					High Quality
				</span>
			</div>
		</div>
	</section>

	<!-- 4.5. Interactive States & Transitions (Phase 3) -->
	<section>
		<h2 class="text-2xl mb-6 border-b border-charcoal-800 pb-3 font-semibold text-white">
			4.5. Interactive States & Transitions (Phase 3)
		</h2>

		<Card class="p-6 bg-charcoal-900 border-gold-500/30 mb-8">
			<h3 class="text-lg mb-3 text-gold-400 font-semibold">About Interactive States</h3>
			<p class="text-sm text-charcoal-300 leading-relaxed mb-3">
				All interactive elements have clearly defined states to provide visual feedback and ensure
				predictable user experience. This section documents every state with live examples.
			</p>
			<p class="text-xs text-charcoal-400">
				<strong>WCAG 2.1 Compliance:</strong> Focus states meet WCAG 2.4.7 (visible focus) with
				gold-500 focus rings. All states maintain minimum contrast ratios (WCAG 1.4.3).
			</p>
		</Card>

		<!-- Button State Matrix -->
		<div class="mb-12">
			<h3 class="text-lg mb-6 text-charcoal-300 font-semibold">Button State Matrix</h3>

			<!-- Primary Variant States -->
			<div class="mb-8">
				<h4 class="text-base mb-4 text-charcoal-400 font-medium">Primary Variant</h4>
				<div class="overflow-x-auto">
					<table class="w-full text-sm border-collapse">
						<thead>
							<tr class="border-b border-charcoal-800">
								<th class="text-left py-3 px-4 text-charcoal-400 font-medium">State</th>
								<th class="py-3 px-4 text-charcoal-400 font-medium">Visual</th>
								<th class="text-left py-3 px-4 text-charcoal-400 font-medium">CSS Classes</th>
								<th class="text-left py-3 px-4 text-charcoal-400 font-medium">Trigger</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-charcoal-800">
							<tr>
								<td class="py-4 px-4 text-charcoal-300">Default</td>
								<td class="py-4 px-4">
									<Button variant="primary" size="sm">Default</Button>
								</td>
								<td class="py-4 px-4 text-xs font-mono text-charcoal-400">
									bg-gold-500 text-charcoal-950
								</td>
								<td class="py-4 px-4 text-xs text-charcoal-500">Initial state</td>
							</tr>
							<tr>
								<td class="py-4 px-4 text-charcoal-300">Hover</td>
								<td class="py-4 px-4">
									<button class="px-3 py-1.5 text-sm inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors bg-gold-600 text-charcoal-950">
										Hover
									</button>
								</td>
								<td class="py-4 px-4 text-xs font-mono text-charcoal-400">
									hover:bg-gold-600
								</td>
								<td class="py-4 px-4 text-xs text-charcoal-500">Cursor over element</td>
							</tr>
							<tr>
								<td class="py-4 px-4 text-charcoal-300">Active</td>
								<td class="py-4 px-4">
									<button class="px-3 py-1.5 text-sm inline-flex items-center justify-center gap-2 rounded-lg font-medium bg-gold-700 text-charcoal-950 scale-95">
										Active
									</button>
								</td>
								<td class="py-4 px-4 text-xs font-mono text-charcoal-400">
									active:scale-95 (via motion)
								</td>
								<td class="py-4 px-4 text-xs text-charcoal-500">Mouse down / touch</td>
							</tr>
							<tr>
								<td class="py-4 px-4 text-charcoal-300">Focus</td>
								<td class="py-4 px-4">
									<button class="px-3 py-1.5 text-sm inline-flex items-center justify-center gap-2 rounded-lg font-medium bg-gold-500 text-charcoal-950 ring-2 ring-gold-500 ring-offset-2 ring-offset-charcoal-950">
										Focus
									</button>
								</td>
								<td class="py-4 px-4 text-xs font-mono text-charcoal-400">
									ring-2 ring-gold-500
								</td>
								<td class="py-4 px-4 text-xs text-charcoal-500">Keyboard navigation (Tab)</td>
							</tr>
							<tr>
								<td class="py-4 px-4 text-charcoal-300">Disabled</td>
								<td class="py-4 px-4">
									<Button variant="primary" size="sm" disabled>Disabled</Button>
								</td>
								<td class="py-4 px-4 text-xs font-mono text-charcoal-400">
									disabled:bg-gold-500/50
								</td>
								<td class="py-4 px-4 text-xs text-charcoal-500">disabled attribute</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<!-- Secondary Variant States -->
			<div class="mb-8">
				<h4 class="text-base mb-4 text-charcoal-400 font-medium">Secondary Variant</h4>
				<div class="overflow-x-auto">
					<table class="w-full text-sm border-collapse">
						<thead>
							<tr class="border-b border-charcoal-800">
								<th class="text-left py-3 px-4 text-charcoal-400 font-medium">State</th>
								<th class="py-3 px-4 text-charcoal-400 font-medium">Visual</th>
								<th class="text-left py-3 px-4 text-charcoal-400 font-medium">CSS Classes</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-charcoal-800">
							<tr>
								<td class="py-4 px-4 text-charcoal-300">Default</td>
								<td class="py-4 px-4">
									<Button variant="secondary" size="sm">Default</Button>
								</td>
								<td class="py-4 px-4 text-xs font-mono text-charcoal-400">
									bg-charcoal-800 border-charcoal-700
								</td>
							</tr>
							<tr>
								<td class="py-4 px-4 text-charcoal-300">Hover</td>
								<td class="py-4 px-4">
									<button class="px-3 py-1.5 text-sm inline-flex items-center justify-center gap-2 rounded-lg font-medium border bg-charcoal-700 text-white border-charcoal-700">
										Hover
									</button>
								</td>
								<td class="py-4 px-4 text-xs font-mono text-charcoal-400">
									hover:bg-charcoal-700
								</td>
							</tr>
							<tr>
								<td class="py-4 px-4 text-charcoal-300">Disabled</td>
								<td class="py-4 px-4">
									<Button variant="secondary" size="sm" disabled>Disabled</Button>
								</td>
								<td class="py-4 px-4 text-xs font-mono text-charcoal-400">
									disabled:bg-charcoal-800/50
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<!-- Ghost Variant States -->
			<div>
				<h4 class="text-base mb-4 text-charcoal-400 font-medium">Ghost Variant</h4>
				<div class="overflow-x-auto">
					<table class="w-full text-sm border-collapse">
						<thead>
							<tr class="border-b border-charcoal-800">
								<th class="text-left py-3 px-4 text-charcoal-400 font-medium">State</th>
								<th class="py-3 px-4 text-charcoal-400 font-medium">Visual</th>
								<th class="text-left py-3 px-4 text-charcoal-400 font-medium">CSS Classes</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-charcoal-800">
							<tr>
								<td class="py-4 px-4 text-charcoal-300">Default</td>
								<td class="py-4 px-4">
									<Button variant="ghost" size="sm">Default</Button>
								</td>
								<td class="py-4 px-4 text-xs font-mono text-charcoal-400">
									bg-transparent text-charcoal-300
								</td>
							</tr>
							<tr>
								<td class="py-4 px-4 text-charcoal-300">Hover</td>
								<td class="py-4 px-4">
									<button class="px-3 py-1.5 text-sm inline-flex items-center justify-center gap-2 rounded-lg font-medium bg-charcoal-800 text-white">
										Hover
									</button>
								</td>
								<td class="py-4 px-4 text-xs font-mono text-charcoal-400">
									hover:bg-charcoal-800 hover:text-white
								</td>
							</tr>
							<tr>
								<td class="py-4 px-4 text-charcoal-300">Disabled</td>
								<td class="py-4 px-4">
									<Button variant="ghost" size="sm" disabled>Disabled</Button>
								</td>
								<td class="py-4 px-4 text-xs font-mono text-charcoal-400">
									disabled:text-charcoal-400
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- PhotoCard Interactive States -->
		<div class="mb-12">
			<h3 class="text-lg mb-6 text-charcoal-300 font-semibold">PhotoCard Interactive States</h3>
			<Card class="p-6 bg-charcoal-900/50 mb-6">
				<h4 class="text-base mb-3 font-semibold">State Transitions</h4>
				<div class="space-y-3 text-sm text-charcoal-300">
					<div class="flex items-start gap-3">
						<span class="text-gold-400 font-mono">→</span>
						<div>
							<strong>Default:</strong> Emotion halo visible (colored glow), border charcoal-800
						</div>
					</div>
					<div class="flex items-start gap-3">
						<span class="text-gold-400 font-mono">→</span>
						<div>
							<strong>Hover:</strong> Scale 1.02, lift -4px, border gold-500/50,
							emotion badge appears (icon + text), title overlay fades in
						</div>
					</div>
					<div class="flex items-start gap-3">
						<span class="text-gold-400 font-mono">→</span>
						<div>
							<strong>Focus:</strong> Border gold-500, ring-2 ring-gold-500/50,
							emotion badge appears (keyboard accessible)
						</div>
					</div>
					<div class="flex items-start gap-3">
						<span class="text-gold-400 font-mono">→</span>
						<div>
							<strong>Active (click):</strong> Scale 0.97 (via svelte-motion whileTap)
						</div>
					</div>
				</div>
			</Card>

			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div>
					<p class="text-xs text-charcoal-400 mb-3 font-medium">Default State</p>
					<div class="aspect-[4/3] bg-charcoal-900 rounded-lg border border-charcoal-800 relative emotion-halo-triumph">
						<div class="absolute inset-0 flex items-center justify-center">
							<Camera class="w-12 h-12 text-charcoal-700" />
						</div>
					</div>
					<code class="text-xs text-charcoal-500 mt-2 block">border-charcoal-800 + emotion-halo</code>
				</div>

				<div>
					<p class="text-xs text-charcoal-400 mb-3 font-medium">Hover State</p>
					<div class="aspect-[4/3] bg-charcoal-900 rounded-lg border border-gold-500/50 relative emotion-halo-triumph scale-[1.02] -translate-y-1">
						<div class="absolute inset-0 flex items-center justify-center">
							<Camera class="w-12 h-12 text-charcoal-700" />
						</div>
						<div class="absolute top-2 left-2 px-2 py-1 rounded-full bg-charcoal-900/90 backdrop-blur-sm border border-charcoal-700/50 flex items-center gap-1.5">
							<span class="text-xs font-medium text-white">Triumph</span>
						</div>
					</div>
					<code class="text-xs text-charcoal-500 mt-2 block">scale-1.02 border-gold-500/50</code>
				</div>

				<div>
					<p class="text-xs text-charcoal-400 mb-3 font-medium">Focus State</p>
					<div class="aspect-[4/3] bg-charcoal-900 rounded-lg border border-gold-500 ring-2 ring-gold-500/50 relative emotion-halo-triumph">
						<div class="absolute inset-0 flex items-center justify-center">
							<Camera class="w-12 h-12 text-charcoal-700" />
						</div>
						<div class="absolute top-2 left-2 px-2 py-1 rounded-full bg-charcoal-900/90 backdrop-blur-sm border border-charcoal-700/50 flex items-center gap-1.5">
							<span class="text-xs font-medium text-white">Triumph</span>
						</div>
					</div>
					<code class="text-xs text-charcoal-500 mt-2 block">ring-2 ring-gold-500</code>
				</div>
			</div>
		</div>

		<!-- Input/Form States -->
		<div class="mb-12">
			<h3 class="text-lg mb-6 text-charcoal-300 font-semibold">Input & Form Element States</h3>
			<div class="space-y-6 max-w-2xl">
				<div>
					<label for="input-default" class="text-sm text-charcoal-400 mb-2 block">Default State</label>
					<input
						id="input-default"
						type="text"
						placeholder="Enter text..."
						class="w-full px-4 py-2 bg-charcoal-900 border border-charcoal-800 rounded-lg text-white placeholder:text-charcoal-500 transition-colors"
					/>
					<code class="text-xs text-charcoal-500 mt-1 block">border-charcoal-800</code>
				</div>

				<div>
					<label for="input-focus" class="text-sm text-charcoal-400 mb-2 block">Focus State</label>
					<input
						id="input-focus"
						type="text"
						placeholder="Enter text..."
						class="w-full px-4 py-2 bg-charcoal-900 border border-gold-500 rounded-lg text-white placeholder:text-charcoal-500 ring-2 ring-gold-500/50 transition-colors"
					/>
					<code class="text-xs text-charcoal-500 mt-1 block">focus:border-gold-500 focus:ring-2 focus:ring-gold-500/50</code>
				</div>

				<div>
					<label for="input-error" class="text-sm text-charcoal-400 mb-2 block">Error State</label>
					<input
						id="input-error"
						type="text"
						placeholder="Invalid input"
						class="w-full px-4 py-2 bg-charcoal-900 border border-red-500 rounded-lg text-white placeholder:text-charcoal-500 ring-2 ring-red-500/50 transition-colors"
					/>
					<p class="text-xs text-red-400 mt-1">This field is required</p>
					<code class="text-xs text-charcoal-500 mt-1 block">border-red-500 ring-red-500/50</code>
				</div>

				<div>
					<label for="input-disabled" class="text-sm text-charcoal-400 mb-2 block">Disabled State</label>
					<input
						id="input-disabled"
						type="text"
						placeholder="Disabled input"
						disabled
						class="w-full px-4 py-2 bg-charcoal-800/50 border border-charcoal-700 rounded-lg text-charcoal-500 placeholder:text-charcoal-600 cursor-not-allowed"
					/>
					<code class="text-xs text-charcoal-500 mt-1 block">disabled:bg-charcoal-800/50 disabled:cursor-not-allowed</code>
				</div>
			</div>
		</div>

		<!-- Transition Specifications -->
		<div>
			<h3 class="text-lg mb-6 text-charcoal-300 font-semibold">Transition Specifications</h3>
			<Card class="p-6 bg-charcoal-900">
				<h4 class="text-base mb-4 font-semibold">Standard Transitions</h4>
				<div class="space-y-4">
					<div class="p-4 bg-charcoal-800 rounded-lg">
						<h5 class="text-sm font-medium mb-2 text-gold-400">Colors & Borders</h5>
						<code class="text-xs text-charcoal-300 block mb-1">transition-colors</code>
						<p class="text-xs text-charcoal-500">Duration: 150ms | Easing: cubic-bezier(0.4, 0, 0.2, 1)</p>
					</div>

					<div class="p-4 bg-charcoal-800 rounded-lg">
						<h5 class="text-sm font-medium mb-2 text-gold-400">Transforms (Scale, Translate)</h5>
						<code class="text-xs text-charcoal-300 block mb-1">transition-transform</code>
						<p class="text-xs text-charcoal-500">Duration: 200ms | Easing: cubic-bezier(0.4, 0, 0.2, 1)</p>
					</div>

					<div class="p-4 bg-charcoal-800 rounded-lg">
						<h5 class="text-sm font-medium mb-2 text-gold-400">Opacity</h5>
						<code class="text-xs text-charcoal-300 block mb-1">transition-opacity</code>
						<p class="text-xs text-charcoal-500">Duration: 200ms | Easing: linear</p>
					</div>

					<div class="p-4 bg-charcoal-800 rounded-lg">
						<h5 class="text-sm font-medium mb-2 text-gold-400">PhotoCard Hover (svelte-motion)</h5>
						<code class="text-xs text-charcoal-300 block mb-1">whileHover=&#123;&#123; scale: 1.02, y: -4 &#125;&#125;</code>
						<p class="text-xs text-charcoal-500">Duration: 200ms | Easing: Spring (gentle)</p>
					</div>
				</div>
			</Card>
		</div>
	</section>

	<!-- 5. Design Principles -->
	<section>
		<h2 class="text-2xl mb-6 border-b border-charcoal-800 pb-3 font-semibold text-white">
			5. Design Principles
		</h2>

		<div class="space-y-6">
			<Card class="p-6 bg-charcoal-900">
				<h3 class="text-lg mb-3 text-gold-400 font-semibold">1. Content-First Hierarchy</h3>
				<p class="text-sm text-charcoal-300 leading-relaxed">
					Photos must be visible immediately upon page load. No "scroll to see content" pattern.
					Target: ≥60% content, ≤40% chrome above the fold.
				</p>
			</Card>

			<Card class="p-6 bg-charcoal-900">
				<h3 class="text-lg mb-3 text-gold-400 font-semibold">2. Inline Utility Pattern</h3>
				<p class="text-sm text-charcoal-300 leading-relaxed">
					Controls should be inline pills, not block containers. UI should flow horizontally,
					not stack vertically. Collapsed by default, expand on demand.
				</p>
			</Card>

			<Card class="p-6 bg-charcoal-900">
				<h3 class="text-lg mb-3 text-gold-400 font-semibold">3. Gestalt Principles (Proximity)</h3>
				<p class="text-sm text-charcoal-300 leading-relaxed">
					Related items should be visually proximate. Controls should live near what they control.
					Sort controls live above the grid, not in the header.
				</p>
			</Card>

			<Card class="p-6 bg-charcoal-900">
				<h3 class="text-lg mb-3 text-gold-400 font-semibold">4. Typography as Data Visualization</h3>
				<p class="text-sm text-charcoal-300 leading-relaxed">
					Text size reflects information hierarchy, not importance. Data is small (text-xs),
					content is large. No verbose text consuming space.
				</p>
			</Card>

			<Card class="p-6 bg-charcoal-900">
				<h3 class="text-lg mb-3 text-gold-400 font-semibold">5. Progressive Disclosure</h3>
				<p class="text-sm text-charcoal-300 leading-relaxed">
					Show only what users need right now. All expandable UI starts collapsed.
					Complexity is opt-in, minimal by default.
				</p>
			</Card>

			<Card class="p-6 bg-charcoal-900">
				<h3 class="text-lg mb-3 text-gold-400 font-semibold">6. Visual Data Layers</h3>
				<p class="text-sm text-charcoal-300 leading-relaxed">
					Visual treatments encode information, not just decoration. Quality shimmer for
					portfolio-worthy photos, emotion halos for captured emotions, dimming for low-quality.
				</p>
			</Card>
		</div>
	</section>

	<!-- 6. Accessibility & Motion -->
	<section>
		<h2 class="text-2xl mb-6 border-b border-charcoal-800 pb-3 font-semibold text-white">
			6. Accessibility & Motion
		</h2>

		<!-- Focus States -->
		<div class="mb-8">
			<h3 class="text-lg mb-4 text-charcoal-300 font-semibold">Focus States (WCAG Compliant)</h3>
			<p class="text-xs text-charcoal-400 mb-4">
				All interactive elements have visible focus rings using gold-500 with 2px offset for clarity.
			</p>
			<div class="flex flex-wrap gap-4">
				<button class="px-4 py-2 bg-gold-500 text-black rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-950">
					Tab to focus me
				</button>
				<input
					type="text"
					placeholder="Focus on this input"
					class="px-4 py-2 bg-charcoal-900 border border-charcoal-800 rounded-lg focus:border-gold-500 focus:ring-2 focus:ring-gold-500/50 transition-colors"
				/>
			</div>
		</div>

		<!-- Touch Targets -->
		<div class="mb-8">
			<h3 class="text-lg mb-4 text-charcoal-300 font-semibold">Minimum Touch Targets (44x44px)</h3>
			<p class="text-xs text-charcoal-400 mb-4">
				All interactive elements meet the WCAG 2.1 minimum touch target size of 44x44 pixels.
			</p>
			<div class="flex gap-4">
				<button class="min-w-[44px] min-h-[44px] flex items-center justify-center bg-charcoal-800 rounded-lg border border-charcoal-700 hover:border-gold-500/50 transition-colors">
					<Heart class="w-5 h-5" />
				</button>
				<button class="min-w-[44px] min-h-[44px] flex items-center justify-center bg-charcoal-800 rounded-lg border border-charcoal-700 hover:border-gold-500/50 transition-colors">
					<Camera class="w-5 h-5" />
				</button>
				<span class="text-xs text-charcoal-500 flex items-center">
					← 44x44px minimum
				</span>
			</div>
		</div>

		<!-- Animations -->
		<div>
			<h3 class="text-lg mb-4 text-charcoal-300 font-semibold">Animations</h3>
			<p class="text-xs text-charcoal-400 mb-4">
				All animations respect prefers-reduced-motion. Key animations include:
			</p>
			<div class="space-y-3">
				{#each animations as animation}
					<div class="p-4 bg-charcoal-900/50 rounded-lg">
						<span class="text-xs text-charcoal-300 font-mono block mb-1">
							{animation.name}
						</span>
						<span class="text-xs text-charcoal-500">
							{animation.description} • Duration: {animation.duration}
						</span>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- 7. Chrome Budget System -->
	<section>
		<h2 class="text-2xl mb-6 border-b border-charcoal-800 pb-3 font-semibold text-white">
			7. Chrome Budget System
		</h2>

		<Card class="p-6 bg-charcoal-900 mb-6">
			<h3 class="text-lg mb-4 text-gold-400 font-semibold">Current Page Chrome Audit</h3>
			<Button variant="secondary" size="sm" onclick={runChromeAudit}>
				Run Chrome Ratio Audit
			</Button>
			{#if chromeRatioResult}
				<pre class="mt-4 p-4 bg-charcoal-950 rounded-lg text-xs text-charcoal-300 font-mono overflow-x-auto">{chromeRatioResult}</pre>
			{/if}
		</Card>

		<p class="text-sm text-charcoal-300 mb-4 leading-relaxed">
			UI chrome has a strict budget. Target: ≤40% chrome, ≥60% content above the fold.
			The explore page achieves 11% chrome ratio after refactoring.
		</p>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<Card class="p-6 bg-charcoal-800">
				<h4 class="text-base mb-3 text-red-400 font-semibold">❌ Bad Example</h4>
				<p class="text-xs text-charcoal-400 mb-2">
					Large header: 400px
				</p>
				<p class="text-xs text-charcoal-400 mb-2">
					Chrome ratio: 55% (FAIL)
				</p>
				<p class="text-xs text-charcoal-500">
					Photos buried below fold, excessive padding, expanded filters by default
				</p>
			</Card>

			<Card class="p-6 bg-charcoal-800">
				<h4 class="text-base mb-3 text-green-400 font-semibold">✅ Good Example</h4>
				<p class="text-xs text-charcoal-400 mb-2">
					Compact header: 80px
				</p>
				<p class="text-xs text-charcoal-400 mb-2">
					Chrome ratio: 11% (PASS)
				</p>
				<p class="text-xs text-charcoal-500">
					Photos visible immediately, inline pills, collapsed by default
				</p>
			</Card>
		</div>
	</section>

	<!-- Footer -->
	<section class="border-t border-charcoal-800 pt-8">
		<p class="text-sm text-charcoal-400 text-center">
			Version 2.0.0 • Last Updated: October 26, 2025 •
			<a href="/.agent-os/DESIGN_SYSTEM.md" class="text-gold-500 hover:text-gold-400 transition-colors">
				Design System Documentation
			</a>
		</p>
	</section>
</div>

<style>
	/* ⚠️ DEMO ONLY - DO NOT USE IN PRODUCTION
	 * These glow animations are for style-guide demonstration purposes only
	 * They violate P1 (Content-First) with infinite animations
	 * Removed from main app.css to prevent misuse
	 */

	@keyframes glow-rotate {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}

	:global(.animate-glow-rotate) {
		background: linear-gradient(270deg, #FFD700, #FF4500, #FF69B4, #FFD700);
		background-size: 400% 400%;
		animation: glow-rotate 3s ease infinite;
	}

	:global(.animate-glow-slow) {
		background: linear-gradient(270deg, #FFD700, #FF4500, #FF69B4, #FFD700);
		background-size: 400% 400%;
		animation: glow-rotate 6s ease infinite;
	}

	:global(.animate-glow-fast) {
		background: linear-gradient(270deg, #FFD700, #FF4500, #FF69B4, #FFD700);
		background-size: 400% 400%;
		animation: glow-rotate 1.5s ease infinite;
	}
</style>
