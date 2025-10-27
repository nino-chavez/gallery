<script lang="ts">
	import { enhance } from '$app/forms';

	interface Props {
		photoId: string;
		existingTags?: Array<{ athlete_name: string; jersey_number?: string }>;
	}

	let { photoId, existingTags = [] }: Props = $props();

	let athleteName = $state('');
	let jerseyNumber = $state('');
	let userName = $state('');
	let isSubmitting = $state(false);
	let showForm = $state(false);
	let successMessage = $state('');
	let errorMessage = $state('');
</script>

<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
	<div class="flex justify-between items-center mb-3">
		<h3 class="text-sm font-semibold text-gray-900">Player Tags</h3>
		{#if !showForm}
			<button
				onclick={() => (showForm = true)}
				class="text-sm text-blue-600 hover:text-blue-700 font-medium"
			>
				+ Tag Player
			</button>
		{/if}
	</div>

	<!-- Existing Tags -->
	{#if existingTags.length > 0}
		<div class="mb-3 space-y-2">
			{#each existingTags as tag}
				<div class="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
					<svg
						class="w-4 h-4 mr-1.5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						/>
					</svg>
					{tag.athlete_name}
					{#if tag.jersey_number}
						<span class="ml-1 font-semibold">#{tag.jersey_number}</span>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<p class="text-sm text-gray-500 mb-3">No players tagged yet. Be the first!</p>
	{/if}

	<!-- Tag Input Form -->
	{#if showForm}
		<form
			method="POST"
			action="/api/tags"
			class="space-y-3 mt-3 pt-3 border-t border-gray-200"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ result, update }) => {
					isSubmitting = false;
					if (result.type === 'success') {
						successMessage = 'Tag submitted for review!';
						errorMessage = '';
						athleteName = '';
						jerseyNumber = '';
						userName = '';
						setTimeout(() => {
							successMessage = '';
							showForm = false;
						}, 2000);
					} else if (result.type === 'failure') {
						errorMessage = result.data?.error || 'Failed to submit tag';
						successMessage = '';
					}
					await update();
				};
			}}
		>
			<input type="hidden" name="photoId" value={photoId} />

			<div>
				<label for="athleteName" class="block text-sm font-medium text-gray-700 mb-1">
					Player Name <span class="text-red-500">*</span>
				</label>
				<input
					type="text"
					id="athleteName"
					name="athleteName"
					bind:value={athleteName}
					required
					placeholder="e.g., Sarah Johnson"
					class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>

			<div>
				<label for="jerseyNumber" class="block text-sm font-medium text-gray-700 mb-1">
					Jersey Number <span class="text-gray-400">(optional)</span>
				</label>
				<input
					type="text"
					id="jerseyNumber"
					name="jerseyNumber"
					bind:value={jerseyNumber}
					placeholder="e.g., 12"
					class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>

			<div>
				<label for="userName" class="block text-sm font-medium text-gray-700 mb-1">
					Your Name <span class="text-gray-400">(optional)</span>
				</label>
				<input
					type="text"
					id="userName"
					name="userName"
					bind:value={userName}
					placeholder="e.g., John Doe"
					class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
				<p class="mt-1 text-xs text-gray-500">Help us credit you for the tag!</p>
			</div>

			{#if successMessage}
				<div class="rounded-md bg-green-50 p-3">
					<p class="text-sm text-green-800">{successMessage}</p>
				</div>
			{/if}

			{#if errorMessage}
				<div class="rounded-md bg-red-50 p-3">
					<p class="text-sm text-red-800">{errorMessage}</p>
				</div>
			{/if}

			<div class="flex gap-2">
				<button
					type="submit"
					disabled={isSubmitting || !athleteName}
					class="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isSubmitting ? 'Submitting...' : 'Submit Tag'}
				</button>
				<button
					type="button"
					onclick={() => {
						showForm = false;
						athleteName = '';
						jerseyNumber = '';
						userName = '';
						errorMessage = '';
					}}
					class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
				>
					Cancel
				</button>
			</div>
		</form>
	{/if}
</div>
