<script lang="ts">
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-white shadow">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<div class="flex justify-between items-center">
				<div>
					<h1 class="text-2xl font-bold text-gray-900">Tag Moderation</h1>
					<p class="text-sm text-gray-600 mt-1">
						Logged in as {data.user.email}
					</p>
				</div>
				<div class="flex gap-4">
					<a
						href="/"
						class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
					>
						← Back to Gallery
					</a>
					<form method="POST" action="/logout">
						<button
							type="submit"
							class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
						>
							Logout
						</button>
					</form>
				</div>
			</div>
		</div>
	</header>

	<!-- Stats -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="px-4 py-5 sm:p-6">
					<dt class="text-sm font-medium text-gray-500 truncate">Pending Tags</dt>
					<dd class="mt-1 text-3xl font-semibold text-gray-900">{data.stats.pending}</dd>
				</div>
			</div>
			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="px-4 py-5 sm:p-6">
					<dt class="text-sm font-medium text-gray-500 truncate">Approved Tags</dt>
					<dd class="mt-1 text-3xl font-semibold text-gray-900">{data.stats.approved}</dd>
				</div>
			</div>
		</div>
	</div>

	<!-- Tags List -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
		<div class="bg-white shadow overflow-hidden sm:rounded-lg">
			<div class="px-4 py-5 sm:px-6 border-b border-gray-200">
				<h2 class="text-lg font-medium text-gray-900">Pending Tags</h2>
			</div>

			{#if data.pendingTags.length === 0}
				<div class="px-4 py-12 text-center">
					<svg
						class="mx-auto h-12 w-12 text-gray-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
						/>
					</svg>
					<h3 class="mt-2 text-sm font-medium text-gray-900">No pending tags</h3>
					<p class="mt-1 text-sm text-gray-500">
						All tags have been reviewed or there are no tags submitted yet.
					</p>
				</div>
			{:else}
				<ul class="divide-y divide-gray-200">
					{#each data.pendingTags as tag}
						<li class="px-4 py-4 sm:px-6">
							<div class="flex items-center justify-between">
								<div class="flex items-center space-x-4">
									{#if tag.photo?.ThumbnailUrl}
										<img
											src={tag.photo.ThumbnailUrl}
											alt="Photo"
											class="h-16 w-16 rounded object-cover"
										/>
									{/if}
									<div>
										<p class="text-sm font-medium text-gray-900">
											{tag.athlete_name}
											{#if tag.jersey_number}
												<span class="text-gray-500">#{tag.jersey_number}</span>
											{/if}
										</p>
										<p class="text-sm text-gray-500">
											Tagged by {tag.tagged_by_user_name || 'Anonymous'}
										</p>
										<p class="text-xs text-gray-400">
											{new Date(tag.created_at).toLocaleString()}
										</p>
									</div>
								</div>
								<div class="flex gap-2">
									<form method="POST" action="?/approve">
										<input type="hidden" name="tagId" value={tag.id} />
										<button
											type="submit"
											class="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
										>
											Approve
										</button>
									</form>
									<form method="POST" action="?/reject">
										<input type="hidden" name="tagId" value={tag.id} />
										<button
											type="submit"
											class="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
										>
											Reject
										</button>
									</form>
								</div>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</div>
