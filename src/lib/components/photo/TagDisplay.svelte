<script lang="ts">
	/**
	 * TagDisplay Component
	 * Shows approved tags for a photo
	 */

	interface Tag {
		id: string;
		athlete_name: string;
		jersey_number?: string | null;
		tagged_by_user_name?: string | null;
	}

	interface Props {
		tags: Tag[];
	}

	let { tags }: Props = $props();
</script>

{#if tags.length > 0}
	<div class="flex flex-wrap gap-2">
		{#each tags as tag}
			<div
				class="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium shadow-sm"
			>
				<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
					/>
				</svg>
				<span>{tag.athlete_name}</span>
				{#if tag.jersey_number}
					<span class="ml-1 font-bold">#{tag.jersey_number}</span>
				{/if}
			</div>
		{/each}
	</div>
{/if}
