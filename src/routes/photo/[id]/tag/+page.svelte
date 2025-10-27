<script lang="ts">
	import TagInput from '$lib/components/photo/TagInput.svelte';
	import TagDisplay from '$lib/components/photo/TagDisplay.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Tag Players - {data.photo.title} | Nino Chavez Photography</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="mb-8">
			<a href="/photo/{data.photo.image_key}" class="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">
				← Back to Photo
			</a>
			<h1 class="text-3xl font-bold text-gray-900">Tag Players in This Photo</h1>
			<p class="mt-2 text-gray-600">
				Help identify players in this photo. Your tags will be reviewed before being published.
			</p>
		</div>

		<!-- Photo Preview -->
		<div class="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
			<img
				src={data.photo.thumbnail_url || data.photo.image_url}
				alt={data.photo.title}
				class="w-full h-auto"
			/>
		</div>

		<!-- Approved Tags Display -->
		{#if data.approvedTags.length > 0}
			<div class="mb-8">
				<h2 class="text-lg font-semibold text-gray-900 mb-4">Tagged Players</h2>
				<TagDisplay tags={data.approvedTags} />
			</div>
		{/if}

		<!-- Tag Input Form -->
		<TagInput
			photoId={data.photo.id}
			existingTags={data.approvedTags}
		/>
	</div>
</div>
