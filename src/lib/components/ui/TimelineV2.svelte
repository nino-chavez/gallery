<!--
  TimelineV2 Component - Vertical timeline for photo browsing

  Features:
  - Scroll-based animations with progress indicator
  - Year/month grouping for large datasets
  - Lazy-loaded photo grids
  - Mobile-responsive design
  - Content-first layout

  Usage:
  <TimelineV2 {timelineData} />
-->

<script lang="ts">
  import { Motion } from 'svelte-motion';
  import { Calendar, ChevronDown } from 'lucide-svelte';
  import { MOTION } from '$lib/motion-tokens';
  import Typography from '$lib/components/ui/Typography.svelte';
  import PhotoCard from '$lib/components/gallery/PhotoCard.svelte';

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

  interface Props {
    timelineData: TimelineEntry[];
    onLoadMore?: () => void;
    hasMore?: boolean;
  }

  let { timelineData, onLoadMore, hasMore = false }: Props = $props();

  // Animation state
  let containerElement = $state<HTMLElement>();
  let progressHeight = $state(0);
  let scrollProgress = $state(0);

  // Scroll handler for progress animation
  function handleScroll() {
    if (!containerElement) return;

    const rect = containerElement.getBoundingClientRect();
    const scrollTop = window.scrollY;
    const elementTop = rect.top + scrollTop;
    const elementHeight = rect.height;
    const windowHeight = window.innerHeight;

    const progress = Math.min(Math.max((scrollTop - elementTop + windowHeight) / elementHeight, 0), 1);
    scrollProgress = progress;
    progressHeight = progress * elementHeight;
  }

  // Intersection observer for lazy loading
  let loadMoreTrigger = $state<HTMLElement>();

  $effect(() => {
    if (loadMoreTrigger && onLoadMore) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            onLoadMore();
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(loadMoreTrigger);

      return () => observer.disconnect();
    }
  });

  // Group photos by quality for display
  function getFeaturedPhotos(photos: TimelineEntry['featuredPhotos']) {
    return photos
      .sort((a, b) => b.qualityScore - a.qualityScore)
      .slice(0, 6); // Show top 6 photos per period
  }
</script>

<svelte:window onscroll={handleScroll} />

<div bind:this={containerElement} class="relative w-full bg-charcoal-950">
  <!-- Header -->
  <div class="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-10">
    <Motion
      let:motion
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={MOTION.spring.gentle}
    >
      <div use:motion class="text-center">
        <Typography variant="h1" class="text-white mb-4">
          Photo Timeline
        </Typography>
        <Typography variant="body" class="text-charcoal-300 max-w-2xl mx-auto">
          Explore my photography journey through the years. Each period showcases the moments that defined my style and captured the essence of sports.
        </Typography>
      </div>
    </Motion>
  </div>

  <!-- Timeline -->
  <div class="relative max-w-7xl mx-auto pb-20">
    {#each timelineData as entry, index (entry.year + (entry.month || 0))}
      <Motion
        let:motion
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...MOTION.spring.gentle, delay: index * 0.1 }}
      >
        <div use:motion class="flex justify-start pt-16 md:pt-24 md:gap-12">
          <!-- Timeline Marker -->
          <div class="sticky flex flex-col items-center top-24 self-start z-40 max-w-xs lg:max-w-sm md:w-full">
            <div class="h-12 w-12 rounded-full bg-gold-500 flex items-center justify-center shadow-lg">
              <Calendar class="w-6 h-6 text-charcoal-950" />
            </div>
            <Typography variant="h2" class="hidden md:block text-center mt-4 text-white">
              {entry.year}
              {#if entry.monthName}
                <br />
                <span class="text-gold-400 text-lg">{entry.monthName}</span>
              {/if}
            </Typography>
          </div>

          <!-- Content -->
          <div class="relative pl-8 md:pl-0 w-full max-w-4xl">
            <!-- Mobile Title -->
            <Typography variant="h3" class="md:hidden block mb-6 text-white">
              {entry.year}
              {#if entry.monthName}
                <span class="text-gold-400 ml-2">{entry.monthName}</span>
              {/if}
            </Typography>

            <!-- Description -->
            {#if entry.description}
              <Typography variant="body" class="text-charcoal-300 mb-8">
                {entry.description}
              </Typography>
            {/if}

            <!-- Photo Count -->
            <div class="flex items-center gap-2 mb-6">
              <Typography variant="caption" class="text-charcoal-400">
                {entry.photoCount} photos from this period
              </Typography>
            </div>

            <!-- Photo Grid -->
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {#each getFeaturedPhotos(entry.featuredPhotos) as photo (photo.id)}
                <Motion
                  let:motion
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={MOTION.spring.snappy}
                >
                  <div use:motion>
                    <PhotoCard
                      {photo}
                      size="small"
                      showCaption={false}
                      class="aspect-square"
                    />
                  </div>
                </Motion>
              {/each}
            </div>

            <!-- View All Link -->
            <a
              href="/explore?year={entry.year}{entry.month ? `&month=${entry.month}` : ''}"
              class="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors"
            >
              <Typography variant="body" class="font-medium">
                View all {entry.photoCount} photos
              </Typography>
              <ChevronDown class="w-4 h-4 rotate-[-90deg]" />
            </a>
          </div>
        </div>
      {/each}

      <!-- Load More Trigger -->
      {#if hasMore}
        <div bind:this={loadMoreTrigger} class="flex justify-center py-12">
          <Motion
            let:motion
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <div use:motion class="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full"></div>
          </Motion>
        </div>
      {/if}

    <!-- Progress Line -->
    <div class="absolute left-6 md:left-6 top-0 w-0.5 bg-gradient-to-b from-transparent via-gold-500/50 to-transparent">
      <Motion
        let:motion
        animate={{ height: `${scrollProgress * 100}%` }}
        transition={MOTION.timing.smooth}
      >
        <div use:motion class="w-full bg-gradient-to-b from-gold-400 to-gold-600 rounded-full"></div>
      </Motion>
    </div>
  </div>
</div>

<style>
  /* Custom scrollbar for timeline */
  .timeline-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgb(245 158 11 / 0.3) transparent;
  }

  .timeline-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .timeline-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .timeline-scroll::-webkit-scrollbar-thumb {
    background: rgb(245 158 11 / 0.3);
    border-radius: 3px;
  }

  .timeline-scroll::-webkit-scrollbar-thumb:hover {
    background: rgb(245 158 11 / 0.5);
  }
</style>