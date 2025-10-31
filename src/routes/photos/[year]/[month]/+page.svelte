<!--
  Month Detail Page - View all photos from a specific month

  Route: /photos/[year]/[month]
  Example: /photos/2025/10 → All photos from October 2025

  Features:
  - Full photo grid for the month
  - Prev/Next month navigation
  - Breadcrumb back to timeline
  - Sorting options
  - Maintains chronological context
-->

<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Calendar, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-svelte';
  import PhotoGrid from '$lib/components/gallery/PhotoGrid.svelte';
  import Lightbox from '$lib/components/gallery/Lightbox.svelte';
  import Typography from '$lib/components/ui/Typography.svelte';
  import type { Photo } from '$types/photo';

  interface Props {
    data: {
      photos: Photo[];
      year: number;
      month: number;
      monthName: string;
      prevMonth: { year: number; month: number; monthName: string; photoCount: number } | null;
      nextMonth: { year: number; month: number; monthName: string; photoCount: number } | null;
      sortBy: 'newest' | 'oldest' | 'quality';
      photoCount: number;
    };
  }

  let { data }: Props = $props();

  // Lightbox state - consistent with other pages
  let lightboxOpen = $state(false);
  let selectedPhotoIndex = $state(0);

  // Handle photo click - open lightbox instead of navigating
  function handlePhotoClick(photo: Photo) {
    const index = data.photos.findIndex((p) => p.image_key === photo.image_key);
    if (index !== -1) {
      selectedPhotoIndex = index;
      lightboxOpen = true;
    }
  }

  // Handle lightbox navigation
  function handleLightboxNavigate(newIndex: number) {
    selectedPhotoIndex = newIndex;
  }

  // Handle month navigation
  function navigateToMonth(year: number, month: number) {
    goto(`/photos/${year}/${month}`);
  }

  // Handle sort change
  function handleSortChange(newSort: 'newest' | 'oldest' | 'quality') {
    const url = new URL($page.url);
    url.searchParams.set('sort', newSort);
    goto(url.toString());
  }
</script>

<svelte:head>
  <title>{data.monthName} {data.year} • {data.photoCount} Photos | Nino Chavez Gallery</title>
  <meta
    name="description"
    content="View all {data.photoCount} photos from {data.monthName} {data.year} in Nino Chavez's sports photography gallery."
  />
</svelte:head>

<div class="min-h-screen bg-charcoal-950">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm text-charcoal-400 mb-6">
      <a
        href="/timeline"
        class="flex items-center gap-1 hover:text-gold-400 transition-colors"
      >
        <ArrowLeft class="w-4 h-4" />
        Timeline
      </a>
      <span>/</span>
      <span class="text-charcoal-300">{data.year}</span>
      <span>/</span>
      <span class="text-white">{data.monthName}</span>
    </div>

    <!-- Month Header -->
    <div class="flex items-center justify-between mb-8 pb-6 border-b border-charcoal-800">
      <div class="flex items-center gap-4">
        <!-- Calendar Icon -->
        <div class="h-16 w-16 rounded-full bg-gold-500 flex items-center justify-center shadow-lg">
          <Calendar class="w-8 h-8 text-charcoal-950" />
        </div>

        <!-- Title -->
        <div>
          <Typography variant="h1" class="text-white mb-1">
            {data.monthName} {data.year}
          </Typography>
          <Typography variant="body" class="text-charcoal-400">
            {data.photoCount} {data.photoCount === 1 ? 'photo' : 'photos'}
          </Typography>
        </div>
      </div>

      <!-- Sort Dropdown -->
      <div class="flex items-center gap-2">
        <Typography variant="label" class="text-charcoal-400 text-sm">
          Sort:
        </Typography>
        <select
          value={data.sortBy}
          onchange={(e) => handleSortChange(e.currentTarget.value as any)}
          class="px-3 py-2 bg-charcoal-800 text-charcoal-200 border border-charcoal-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="quality">Best Quality</option>
        </select>
      </div>
    </div>

    <!-- Month Navigation -->
    <div class="flex items-center justify-between mb-8">
      {#if data.prevMonth}
        <button
          onclick={() => navigateToMonth(data.prevMonth!.year, data.prevMonth!.month)}
          class="flex items-center gap-2 px-4 py-2.5 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-200 rounded-lg transition-colors"
        >
          <ChevronLeft class="w-4 h-4" />
          <div class="text-left">
            <div class="text-xs text-charcoal-400">Previous</div>
            <div class="text-sm font-medium">{data.prevMonth.monthName} {data.prevMonth.year}</div>
          </div>
        </button>
      {:else}
        <div></div>
      {/if}

      {#if data.nextMonth}
        <button
          onclick={() => navigateToMonth(data.nextMonth!.year, data.nextMonth!.month)}
          class="flex items-center gap-2 px-4 py-2.5 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-200 rounded-lg transition-colors"
        >
          <div class="text-right">
            <div class="text-xs text-charcoal-400">Next</div>
            <div class="text-sm font-medium">{data.nextMonth.monthName} {data.nextMonth.year}</div>
          </div>
          <ChevronRight class="w-4 h-4" />
        </button>
      {:else}
        <div></div>
      {/if}
    </div>

    <!-- Photo Grid -->
    <PhotoGrid photos={data.photos} loading={false} onclick={handlePhotoClick} />

    <!-- Lightbox - consistent with other pages -->
    <Lightbox
      bind:open={lightboxOpen}
      photo={data.photos[selectedPhotoIndex] || null}
      photos={data.photos}
      currentIndex={selectedPhotoIndex}
      onNavigate={handleLightboxNavigate}
    />

    <!-- Bottom Navigation -->
    <div class="flex items-center justify-center mt-12 pt-8 border-t border-charcoal-800">
      <a
        href="/timeline"
        class="inline-flex items-center gap-2 px-6 py-3 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-200 rounded-lg transition-colors"
      >
        <ArrowLeft class="w-4 h-4" />
        Back to Timeline
      </a>
    </div>
  </div>
</div>
