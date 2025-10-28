<!--
  Timeline V2 Page - A/B testing version with vertical scroll timeline

  Features:
  - Year/month-based photo timeline
  - Lazy loading for performance
  - Scroll-based progress animation
  - Mobile-responsive design

  Route: /timeline-v2
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import TimelineV2 from '$lib/components/ui/TimelineV2.svelte';
  import { fetchPhotosByPeriod } from '$lib/supabase/server';

  interface TimelineEntry {
    year: number;
    month?: number;
    monthName?: string;
    photoCount: number;
    featuredPhotos: Array<{
      id: string;
      thumbnailUrl: string;
      imageUrl: string;
      caption: string;
      sportType: string;
      qualityScore: number;
    }>;
    description?: string;
  }

  // State
  let timelineData = $state<TimelineEntry[]>([]);
  let isLoading = $state(true);
  let hasMore = $state(true);
  let currentPage = $state(1);
  const pageSize = 12; // Load 12 periods at a time

  // Load initial data
  async function loadTimelineData(page = 1) {
    try {
      isLoading = true;

      // Fetch photo counts grouped by year/month
      const periods = await fetchPhotosByPeriod({
        page,
        limit: pageSize,
        includeFeatured: true
      });

      if (periods.length === 0) {
        hasMore = false;
        return;
      }

      // Transform data for timeline
      const newEntries: TimelineEntry[] = periods.map((period: any) => ({
        year: period.year,
        month: period.month,
        monthName: period.monthName,
        photoCount: period.photoCount,
        featuredPhotos: period.featuredPhotos || [],
        description: getPeriodDescription(period.year, period.month)
      }));

      if (page === 1) {
        timelineData = newEntries;
      } else {
        timelineData = [...timelineData, ...newEntries];
      }

      currentPage = page;
    } catch (error) {
      console.error('[Timeline V2] Failed to load data:', error);
    } finally {
      isLoading = false;
    }
  }

  // Load more data
  function loadMore() {
    if (!isLoading && hasMore) {
      loadTimelineData(currentPage + 1);
    }
  }

  // Generate descriptions for periods
  function getPeriodDescription(year: number, month?: number): string {
    const descriptions = {
      2024: "High school and college championships, pushing technical boundaries in challenging lighting conditions.",
      2023: "Building momentum with local tournaments and expanding into multi-sport coverage.",
      2022: "Finding my voice in sports photography, focusing on emotional storytelling.",
      2021: "Starting with youth sports, learning to anticipate the decisive moment.",
      2020: "Adapting to new challenges during unprecedented times, focusing on indoor sports.",
    };

    return descriptions[year as keyof typeof descriptions] ||
           `Capturing the intensity and emotion of ${month ? 'monthly' : 'yearly'} sports action.`;
  }

  // Initialize
  onMount(() => {
    loadTimelineData(1);
  });
</script>

<svelte:head>
  <title>Photo Timeline | Nino Chavez</title>
  <meta name="description" content="Explore Nino Chavez's photography journey through the years - from youth sports to professional championships." />
</svelte:head>

<div class="min-h-screen bg-charcoal-950">
  <TimelineV2
    {timelineData}
    onLoadMore={loadMore}
    {hasMore}
  />

  <!-- Loading State -->
  {#if isLoading && timelineData.length === 0}
    <div class="flex justify-center items-center py-20">
      <div class="animate-spin w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full"></div>
    </div>
  {/if}
</div>