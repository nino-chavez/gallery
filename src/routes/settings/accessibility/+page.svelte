<!--
  Accessibility Settings Page

  Provides user controls for accessibility preferences.
  Phase 1 Implementation (WCAG Compliance):
  - Disable quality dimming
  - Always show emotion labels
  - High contrast mode
  - Quality score overlays
-->

<script lang="ts">
	import { accessibility } from '$lib/stores/accessibility.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { Eye, EyeOff, Tag, Contrast, BarChart3, RotateCcw } from 'lucide-svelte';

	// Track if preferences have changed
	let hasChanges = $state(false);

	function handleReset() {
		if (confirm('Reset all accessibility settings to defaults?')) {
			accessibility.resetToDefaults();
			hasChanges = false;
		}
	}
</script>

<svelte:head>
	<title>Accessibility Settings - Nino Chavez Gallery</title>
</svelte:head>

<!-- Page Header -->
<header class="sticky top-0 z-20 bg-charcoal-950/95 backdrop-blur-sm border-b border-charcoal-800/50">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
		<div class="flex items-center justify-between gap-4">
			<div>
				<h1 class="text-xl lg:text-2xl font-bold text-white">Accessibility Settings</h1>
				<p class="text-xs text-charcoal-400 mt-1">
					Customize visual effects to match your needs
				</p>
			</div>
			<a href="/" class="text-xs text-gold-500 hover:text-gold-400 transition-colors">
				← Back to Gallery
			</a>
		</div>
	</div>
</header>

<!-- Main Content -->
<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

	<!-- Introduction -->
	<Card class="p-6 bg-charcoal-900 border-gold-500/30">
		<h2 class="text-lg font-semibold mb-3 text-gold-400">About These Settings</h2>
		<p class="text-sm text-charcoal-300 leading-relaxed">
			The gallery uses visual effects like colored halos, shimmer animations, and photo dimming
			to encode information. These settings provide "escape hatches" if any effects impact
			your experience. All settings are saved to your browser.
		</p>
	</Card>

	<!-- Quality Dimming -->
	<Card class="p-6">
		<div class="flex items-start gap-4">
			<div class="mt-1 text-gold-400">
				{#if accessibility.disableQualityDimming}
					<Eye class="w-5 h-5" />
				{:else}
					<EyeOff class="w-5 h-5" />
				{/if}
			</div>
			<div class="flex-1">
				<h3 class="text-base font-semibold mb-2">Disable Quality Dimming</h3>
				<p class="text-sm text-charcoal-400 mb-4 leading-relaxed">
					By default, lower-quality photos (scored below 6/10) are slightly blurred and dimmed.
					Enable this setting to show all photos at full brightness. Recommended for users with
					low vision or display brightness limitations.
				</p>
				<label class="flex items-center gap-3 cursor-pointer">
					<input
						type="checkbox"
						checked={accessibility.disableQualityDimming}
						onchange={() => {
							accessibility.toggleQualityDimming();
							hasChanges = true;
						}}
						class="w-5 h-5 rounded border-charcoal-700 bg-charcoal-800
						       text-gold-500 focus:ring-2 focus:ring-gold-500/50
						       focus:ring-offset-2 focus:ring-offset-charcoal-950"
					/>
					<span class="text-sm font-medium">
						{accessibility.disableQualityDimming ? 'Enabled' : 'Disabled'}
					</span>
				</label>
			</div>
		</div>
	</Card>

	<!-- Emotion Labels -->
	<Card class="p-6">
		<div class="flex items-start gap-4">
			<div class="mt-1 text-gold-400">
				<Tag class="w-5 h-5" />
			</div>
			<div class="flex-1">
				<h3 class="text-base font-semibold mb-2">Always Show Emotion Labels</h3>
				<p class="text-sm text-charcoal-400 mb-4 leading-relaxed">
					Emotion halos use colored glows to indicate photo emotion (Triumph, Intensity, Focus, etc.).
					By default, text labels appear only on hover. Enable this to always show emotion text alongside
					the colored icon. <strong>WCAG 1.4.1 compliant:</strong> ensures color is not the only
					means of conveying information.
				</p>
				<label class="flex items-center gap-3 cursor-pointer">
					<input
						type="checkbox"
						checked={accessibility.alwaysShowEmotionLabels}
						onchange={() => {
							accessibility.toggleEmotionLabels();
							hasChanges = true;
						}}
						class="w-5 h-5 rounded border-charcoal-700 bg-charcoal-800
						       text-gold-500 focus:ring-2 focus:ring-gold-500/50
						       focus:ring-offset-2 focus:ring-offset-charcoal-950"
					/>
					<span class="text-sm font-medium">
						{accessibility.alwaysShowEmotionLabels ? 'Enabled' : 'Disabled'}
					</span>
				</label>
			</div>
		</div>
	</Card>

	<!-- High Contrast Mode -->
	<Card class="p-6">
		<div class="flex items-start gap-4">
			<div class="mt-1 text-gold-400">
				<Contrast class="w-5 h-5" />
			</div>
			<div class="flex-1">
				<h3 class="text-base font-semibold mb-2">High Contrast Mode</h3>
				<p class="text-sm text-charcoal-400 mb-4 leading-relaxed">
					Enhances visual contrast for emotion halos and quality indicators. Uses stronger borders
					and patterns instead of subtle shadows. Automatically enabled if your OS reports
					<code class="text-xs bg-charcoal-800 px-1 py-0.5 rounded">prefers-contrast: more</code>.
				</p>
				<label class="flex items-center gap-3 cursor-pointer">
					<input
						type="checkbox"
						checked={accessibility.highContrastMode}
						onchange={() => {
							accessibility.toggleHighContrast();
							hasChanges = true;
						}}
						class="w-5 h-5 rounded border-charcoal-700 bg-charcoal-800
						       text-gold-500 focus:ring-2 focus:ring-gold-500/50
						       focus:ring-offset-2 focus:ring-offset-charcoal-950"
					/>
					<span class="text-sm font-medium">
						{accessibility.highContrastMode ? 'Enabled' : 'Disabled'}
					</span>
				</label>
			</div>
		</div>
	</Card>

	<!-- Quality Scores -->
	<Card class="p-6">
		<div class="flex items-start gap-4">
			<div class="mt-1 text-gold-400">
				<BarChart3 class="w-5 h-5" />
			</div>
			<div class="flex-1">
				<h3 class="text-base font-semibold mb-2">Show Quality Scores</h3>
				<p class="text-sm text-charcoal-400 mb-4 leading-relaxed">
					Display numeric quality scores (0-10) as text overlays on photos. Useful for understanding
					why certain photos have visual treatments applied (shimmer for 9+, dimming for &lt;6).
				</p>
				<label class="flex items-center gap-3 cursor-pointer">
					<input
						type="checkbox"
						checked={accessibility.showQualityScores}
						onchange={() => {
							accessibility.toggleQualityScores();
							hasChanges = true;
						}}
						class="w-5 h-5 rounded border-charcoal-700 bg-charcoal-800
						       text-gold-500 focus:ring-2 focus:ring-gold-500/50
						       focus:ring-offset-2 focus:ring-offset-charcoal-950"
					/>
					<span class="text-sm font-medium">
						{accessibility.showQualityScores ? 'Enabled' : 'Disabled'}
					</span>
				</label>
			</div>
		</div>
	</Card>

	<!-- System Preferences Detection -->
	<Card class="p-6 bg-charcoal-900/50">
		<h3 class="text-base font-semibold mb-3">System Preferences</h3>
		<p class="text-sm text-charcoal-400 mb-4 leading-relaxed">
			The gallery automatically respects your OS accessibility settings:
		</p>
		<ul class="text-sm text-charcoal-400 space-y-2">
			<li class="flex items-start gap-2">
				<span class="text-gold-400 mt-0.5">✓</span>
				<span>
					<code class="text-xs bg-charcoal-800 px-1 py-0.5 rounded">prefers-reduced-motion</code>
					disables animations
				</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="text-gold-400 mt-0.5">✓</span>
				<span>
					<code class="text-xs bg-charcoal-800 px-1 py-0.5 rounded">prefers-contrast: more</code>
					enables high contrast mode
				</span>
			</li>
		</ul>
		{#if accessibility.disableAnimations}
			<div class="mt-4 p-3 bg-gold-500/10 border border-gold-500/30 rounded-lg">
				<p class="text-xs text-gold-400">
					<strong>Note:</strong> Animations are currently disabled based on your system preference.
				</p>
			</div>
		{/if}
	</Card>

	<!-- Actions -->
	<div class="flex items-center justify-between gap-4 pt-4">
		<Button variant="secondary" size="md" onclick={handleReset}>
			<RotateCcw class="w-4 h-4" />
			Reset to Defaults
		</Button>

		{#if hasChanges}
			<p class="text-xs text-gold-400">
				Settings saved automatically
			</p>
		{/if}
	</div>

	<!-- Footer Info -->
	<Card class="p-6 bg-charcoal-900 border-charcoal-700">
		<h3 class="text-sm font-semibold mb-2 text-charcoal-300">Need More Help?</h3>
		<p class="text-xs text-charcoal-400 leading-relaxed">
			These settings are designed to provide flexible options for users with different
			accessibility needs. If you encounter any issues or have suggestions for additional
			accessibility features, please reach out via the <a href="/contact" class="text-gold-500 hover:text-gold-400 transition-colors">contact page</a>.
		</p>
	</Card>
</div>
