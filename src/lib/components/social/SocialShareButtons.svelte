<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { Share2, Twitter, Facebook, Linkedin, Mail, Check, Copy } from 'lucide-svelte';
	import Typography from '$lib/components/ui/Typography.svelte';
	import type { Photo } from '$types/photo';

	interface Props {
		photo: Photo;
		url: string;
		compact?: boolean;
	}

	let { photo, url, compact = false }: Props = $props();

	let copySuccess = $state(false);

	// Generate share text optimized for each platform
	const shareText = $derived(
		`${photo.title} - Professional ${photo.metadata.sport_type || 'sports'} photography by Nino Chavez`
	);

	const shareUrls = $derived({
		twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
		pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(photo.image_url)}&description=${encodeURIComponent(shareText)}`,
		email: `mailto:?subject=${encodeURIComponent(photo.title)}&body=${encodeURIComponent(`Check out this photo: ${shareText}\n\n${url}`)}`
	});

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(url);
			copySuccess = true;
			setTimeout(() => {
				copySuccess = false;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy link:', err);
		}
	}

	function handleShare(platform: string) {
		const shareUrl = shareUrls[platform as keyof typeof shareUrls];
		if (shareUrl) {
			window.open(shareUrl, '_blank', 'width=600,height=400');
		}
	}
</script>

<div class="space-y-3">
	{#if !compact}
		<div class="flex items-center gap-2">
			<Share2 class="w-4 h-4 text-charcoal-400" />
			<Typography variant="caption" class="text-charcoal-400">Share this photo</Typography>
		</div>
	{/if}

	<div class="flex flex-wrap gap-2">
		<!-- Twitter/X -->
		<Motion whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
			<button
				onclick={() => handleShare('twitter')}
				class="p-2.5 rounded-lg bg-charcoal-900 border border-charcoal-800 hover:border-[#1DA1F2]/50 hover:bg-[#1DA1F2]/10 transition-colors group"
				aria-label="Share on Twitter"
				title="Share on Twitter"
			>
				<Twitter class="w-4 h-4 text-charcoal-300 group-hover:text-[#1DA1F2]" />
			</button>
		</Motion>

		<!-- Facebook -->
		<Motion whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
			<button
				onclick={() => handleShare('facebook')}
				class="p-2.5 rounded-lg bg-charcoal-900 border border-charcoal-800 hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10 transition-colors group"
				aria-label="Share on Facebook"
				title="Share on Facebook"
			>
				<Facebook class="w-4 h-4 text-charcoal-300 group-hover:text-[#1877F2]" />
			</button>
		</Motion>

		<!-- LinkedIn -->
		<Motion whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
			<button
				onclick={() => handleShare('linkedin')}
				class="p-2.5 rounded-lg bg-charcoal-900 border border-charcoal-800 hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/10 transition-colors group"
				aria-label="Share on LinkedIn"
				title="Share on LinkedIn"
			>
				<Linkedin class="w-4 h-4 text-charcoal-300 group-hover:text-[#0A66C2]" />
			</button>
		</Motion>

		<!-- Email -->
		<Motion whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
			<a
				href={shareUrls.email}
				class="p-2.5 rounded-lg bg-charcoal-900 border border-charcoal-800 hover:border-gold-500/50 hover:bg-gold-500/10 transition-colors group"
				aria-label="Share via Email"
				title="Share via Email"
			>
				<Mail class="w-4 h-4 text-charcoal-300 group-hover:text-gold-500" />
			</a>
		</Motion>

		<!-- Copy Link -->
		<Motion whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
			<button
				onclick={copyLink}
				class="p-2.5 rounded-lg bg-charcoal-900 border border-charcoal-800 hover:border-gold-500/50 hover:bg-gold-500/10 transition-colors group relative"
				aria-label="Copy link"
				title={copySuccess ? 'Link copied!' : 'Copy link'}
			>
				{#if copySuccess}
					<Check class="w-4 h-4 text-green-500" />
				{:else}
					<Copy class="w-4 h-4 text-charcoal-300 group-hover:text-gold-500" />
				{/if}
			</button>
		</Motion>
	</div>

	{#if copySuccess}
		<Motion initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
			<Typography variant="caption" class="text-green-500">Link copied to clipboard!</Typography>
		</Motion>
	{/if}
</div>
