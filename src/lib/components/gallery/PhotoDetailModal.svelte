<!--
  PhotoDetailModal Component - Full photo detail view in a modal

  Features:
  - Full-screen overlay with backdrop blur
  - Photo metadata display
  - Quality score visualization
  - Close on ESC key or backdrop click
  - Smooth animations

  Usage:
  <PhotoDetailModal bind:open {photo} />
-->

<script lang="ts">
	import { Motion, AnimatePresence } from 'svelte-motion';
	import { X, Camera, Calendar, MapPin, Award, Zap, ChevronDown, ChevronUp, Sparkles } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import { getPhotoQualityScore } from '$lib/photo-utils';
	import Typography from '$lib/components/ui/Typography.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import SocialShareButtons from '$lib/components/social/SocialShareButtons.svelte';
	import DownloadButton from '$lib/components/photo/DownloadButton.svelte';
	import FavoriteButton from '$lib/components/photo/FavoriteButton.svelte';
	import type { Photo } from '$types/photo';

	interface Props {
		open?: boolean;
		photo: Photo | null;
		onclose?: () => void;
	}

	let { open = $bindable(false), photo, onclose }: Props = $props();

	// Get current photo URL for sharing
	const photoUrl = $derived(
		photo ? `${typeof window !== 'undefined' ? window.location.origin : 'https://photography.ninochavez.co'}/photo/${photo.image_key}` : ''
	);

	let qualityScore = $derived(photo ? getPhotoQualityScore(photo) : 0);
	let metadata = $derived(photo?.metadata);

	// AI Insights collapsed by default (progressive disclosure)
	let showAIInsights = $state(false);

	function handleClose(event?: MouseEvent) {
		event?.stopPropagation();
		open = false;
		onclose?.();
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}

	function handleBackdropKeyDown(event: KeyboardEvent) {
		// Allow closing modal with Enter/Space on backdrop
		if ((event.key === 'Enter' || event.key === ' ') && event.target === event.currentTarget) {
			event.preventDefault();
			handleClose();
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleClose();
		}
	}

	function toggleAIInsights(event?: MouseEvent) {
		event?.stopPropagation();
		showAIInsights = !showAIInsights;
	}

	// Emotion color mapping
	const emotionColors: Record<string, string> = {
		triumph: 'text-yellow-500',
		focus: 'text-blue-500',
		intensity: 'text-red-500',
		determination: 'text-purple-500',
		excitement: 'text-orange-500',
		serenity: 'text-green-500',
	};

	$effect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

<svelte:window onkeydown={handleKeyDown} />

<AnimatePresence>
	{#if open && photo}
		<!-- Backdrop -->
		<Motion
			let:motion
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={MOTION.spring.gentle}
		>
			<div
				use:motion
				class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8"
				role="dialog"
				aria-modal="true"
				aria-labelledby="photo-detail-title"
				tabindex="-1"
				onclick={handleBackdropClick}
				onkeydown={handleBackdropKeyDown}
			>
				<!-- Modal Content -->
				<Motion
					let:motion
					initial={{ opacity: 0, scale: 0.9, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.9, y: 20 }}
					transition={{ ...MOTION.spring.snappy, delay: 0.1 }}
				>
					<div use:motion class="w-full max-w-6xl max-h-[90vh] overflow-auto">
						<Card padding="none" class="bg-charcoal-950/95 backdrop-blur-lg">
							<!-- Header -->
							<div class="flex items-center justify-between p-6 border-b border-charcoal-800">
								<Typography variant="h2" id="photo-detail-title" class="text-2xl">
									Photo Details
								</Typography>
								<Button variant="ghost" size="sm" onclick={handleClose} aria-label="Close modal">
									<X class="w-5 h-5" />
								</Button>
							</div>

							<!-- Content Grid -->
							<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
								<!-- Photo Display -->
								<div class="relative flex items-center justify-center bg-charcoal-900 rounded-lg aspect-[4/3] border border-charcoal-800 overflow-hidden">
									{#if photo.original_url || photo.image_url}
										<img
											src={photo.original_url || photo.image_url}
											alt={photo.title || 'Photo'}
											class="absolute inset-0 w-full h-full object-contain"
										/>
									{:else}
										<Camera class="w-24 h-24 text-charcoal-600" aria-hidden="true" />
									{/if}
								</div>

								<!-- Info Panel -->
								<div class="space-y-6">
									<!-- Basic Info (Always Visible) -->
									<div class="space-y-4">
										<!-- Title -->
										{#if photo.title}
											<div>
												<Typography variant="h3" class="text-xl mb-2">
													{photo.title}
												</Typography>
											</div>
										{/if}

										<!-- Caption/Description if available -->
										{#if photo.caption}
											<div>
												<Typography variant="body" class="text-charcoal-300">
													{photo.caption}
												</Typography>
											</div>
										{/if}
									</div>

									<!-- Download, Favorite & Social Sharing (NEW - Week 3) -->
									<div class="border-t border-charcoal-800 pt-6 space-y-6">
										<!-- Action Buttons -->
										<div class="flex items-center gap-3">
											<DownloadButton photo={photo} variant="default" />
											<FavoriteButton {photo} variant="default" class="flex-1" />
										</div>

										<!-- Social Sharing -->
										<SocialShareButtons photo={photo} url={photoUrl} />
									</div>

									<!-- AI Insights Toggle -->
									<div class="border-t border-charcoal-800 pt-6">
										<button
											type="button"
											onclick={toggleAIInsights}
											class="w-full flex items-center justify-between group hover:bg-charcoal-900/50 p-3 rounded-lg transition-colors"
											aria-expanded={showAIInsights}
										>
											<div class="flex items-center gap-3">
												<div class="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
													<Sparkles class="w-5 h-5 text-purple-500" aria-hidden="true" />
												</div>
												<Typography variant="h3">AI Insights</Typography>
											</div>
											{#if showAIInsights}
												<ChevronUp class="w-5 h-5 text-charcoal-400" />
											{:else}
												<ChevronDown class="w-5 h-5 text-charcoal-400" />
											{/if}
										</button>
									</div>

									<!-- Collapsible AI Insights -->
									{#if showAIInsights}
										<Motion
											let:motion
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: 'auto' }}
											exit={{ opacity: 0, height: 0 }}
											transition={MOTION.spring.gentle}
										>
											<div use:motion class="space-y-6 overflow-hidden">
												<!-- Quality Score -->
												<div>
													<Typography variant="caption" class="text-charcoal-400 mb-2">
														Overall Quality Score
													</Typography>
													<div class="flex items-center gap-4">
														<div class="text-4xl font-bold text-gold-500">
															{qualityScore.toFixed(1)}
														</div>
														<div class="flex-1 bg-charcoal-800 rounded-full h-3 overflow-hidden">
															<div
																class="bg-gradient-to-r from-gold-500 to-gold-400 h-full transition-all duration-500"
																style="width: {qualityScore * 10}%"
															></div>
														</div>
													</div>
												</div>

												<!-- Metadata Grid -->
												<div class="space-y-4">
													<!-- Emotion -->
													{#if metadata?.emotion}
														<div class="flex items-start gap-3">
															<Zap class="w-5 h-5 text-charcoal-400 mt-1" aria-hidden="true" />
															<div class="flex-1">
																<Typography variant="caption" class="text-charcoal-400 block mb-1">
																	Detected Emotion
																</Typography>
																<Typography
																	variant="body"
																	class="capitalize {emotionColors[metadata.emotion] || 'text-white'}"
																>
																	{metadata.emotion}
																</Typography>
															</div>
														</div>
													{/if}

													<!-- Play Type -->
													{#if metadata?.play_type}
														<div class="flex items-start gap-3">
															<Zap class="w-5 h-5 text-charcoal-400 mt-1" aria-hidden="true" />
															<div class="flex-1">
																<Typography variant="caption" class="text-charcoal-400 block mb-1">
																	Play Type
																</Typography>
																<Typography variant="body" class="capitalize">
																	{metadata.play_type}
																</Typography>
															</div>
														</div>
													{/if}

													<!-- Action Intensity -->
													{#if metadata?.action_intensity}
														<div class="flex items-start gap-3">
															<Zap class="w-5 h-5 text-charcoal-400 mt-1" aria-hidden="true" />
															<div class="flex-1">
																<Typography variant="caption" class="text-charcoal-400 block mb-1">
																	Action Intensity
																</Typography>
																<Typography variant="body" class="capitalize">
																	{metadata.action_intensity}
																</Typography>
															</div>
														</div>
													{/if}

													<!-- Technical Scores -->
													<div class="pt-4 border-t border-charcoal-800 space-y-3">
														<Typography variant="h3" class="text-sm">Technical Analysis</Typography>

														{#if metadata?.sharpness !== undefined}
															<div class="flex items-center justify-between">
																<Typography variant="caption" class="text-charcoal-400">
																	Sharpness
																</Typography>
																<Typography variant="body" class="font-medium">
																	{metadata.sharpness.toFixed(1)}/10
																</Typography>
															</div>
														{/if}

														{#if metadata?.exposure_accuracy !== undefined}
															<div class="flex items-center justify-between">
																<Typography variant="caption" class="text-charcoal-400">
																	Exposure
																</Typography>
																<Typography variant="body" class="font-medium">
																	{metadata.exposure_accuracy.toFixed(1)}/10
																</Typography>
															</div>
														{/if}

														{#if metadata?.composition_score !== undefined}
															<div class="flex items-center justify-between">
																<Typography variant="caption" class="text-charcoal-400">
																	Composition
																</Typography>
																<Typography variant="body" class="font-medium">
																	{metadata.composition_score.toFixed(1)}/10
																</Typography>
															</div>
														{/if}

														{#if metadata?.emotional_impact !== undefined}
															<div class="flex items-center justify-between">
																<Typography variant="caption" class="text-charcoal-400">
																	Emotional Impact
																</Typography>
																<Typography variant="body" class="font-medium">
																	{metadata.emotional_impact.toFixed(1)}/10
																</Typography>
															</div>
														{/if}
													</div>
												</div>
											</div>
										</Motion>
									{/if}
								</div>
							</div>
						</Card>
					</div>
				</Motion>
			</div>
		</Motion>
	{/if}
</AnimatePresence>
