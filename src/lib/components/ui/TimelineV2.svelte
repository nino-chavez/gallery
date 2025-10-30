<!--
  TimelineV2 Component - Vertical timeline for photo browsing

  Features:
  - Year/month grouping for large datasets
  - Photo grids
  - Mobile-responsive design

  Usage:
  <TimelineV2 {timelineData} />
-->

<script lang="ts">
  import { untrack } from 'svelte';
  import Typography from '$lib/components/ui/Typography.svelte';
  import PhotoCard from '$lib/components/gallery/PhotoCard.svelte';
  import { Calendar, ChevronDown, ChevronUp, Filter, X } from 'lucide-svelte';
  import SportFilter from '$lib/components/filters/SportFilter.svelte';
  import CategoryFilter from '$lib/components/filters/CategoryFilter.svelte';
  import { Motion } from 'svelte-motion';
  import { MOTION } from '$lib/motion-tokens';
  import type { Photo } from '$types/photo';

  interface TimelineEntry {
    year: number;
    month?: number;
    monthName?: string;
    photoCount: number;
    featuredPhotos: Photo[];
    description?: string;
  }

  interface Props {
    timelineData: TimelineEntry[];
    hasMore?: boolean;
    currentPage?: number;
    selectedSport?: string | null;
    selectedCategory?: string | null;
    sports?: Array<{ name: string; count: number; percentage: number }>;
    categories?: Array<{ name: string; count: number; percentage: number }>;
    allAvailablePeriods?: TimelineEntry[];
  }

  let {
    timelineData,
    hasMore = false,
    currentPage = 1,
    selectedSport = null,
    selectedCategory = null,
    sports = [],
    categories = [],
    allAvailablePeriods = []
  }: Props = $props();

  // Lazy loading state
  let isLoadingMore = $state(false);
  let hasMorePeriods = $state(hasMore);
  let currentPageNum = $state(currentPage);

  // Navigation state
  let selectedYear: number | null = $state(null);
  let selectedMonth: number | null = $state(null);
  let showPeriodSelector = $state(false);

  // Sync props to local state
  $effect(() => {
    hasMorePeriods = hasMore;
  });

  $effect(() => {
    currentPageNum = currentPage;
  });

  // Animation state for period transitions
  let currentVisiblePeriod = $state<{ year: number; month?: number } | null>(null);
  let isTransitioning = $state(false);
  let transitionType = $state<'same-year' | 'new-year' | null>(null);

  // Intersection observer for period visibility and animations
  let periodObservers = $state<Map<string, IntersectionObserver>>(new Map());

  // Group periods by year for sticky year headers
  let periodsByYear = $derived.by(() => {
    const grouped: Record<number, TimelineEntry[]> = {};
    timelineData.forEach(entry => {
      if (!grouped[entry.year]) {
        grouped[entry.year] = [];
      }
      grouped[entry.year].push(entry);
    });

    // Sort years descending, and within each year sort months descending
    return Object.keys(grouped)
      .map(year => parseInt(year))
      .sort((a, b) => b - a)
      .map(year => ({
        year,
        periods: grouped[year].sort((a, b) => (b.month || 0) - (a.month || 0))
      }));
  });

  // Get unique years and months for navigation
  let availableYears = $derived.by(() => {
    const years = new Set(timelineData.map(entry => entry.year));
    return Array.from(years).sort((a, b) => b - a); // Newest first
  });

  let availableMonths = $derived.by(() => {
    if (!selectedYear) return [];
    return timelineData
      .filter(entry => entry.year === selectedYear && entry.month)
      .map(entry => ({ month: entry.month!, monthName: entry.monthName! }))
      .sort((a, b) => b.month - a.month); // Newest first
  });

  // Combined periods for single dropdown
  let availablePeriods = $derived.by(() => {
    return allAvailablePeriods
      .filter(entry => entry.month) // Only include entries with months
      .map(entry => ({
        year: entry.year,
        month: entry.month!,
        monthName: entry.monthName!,
        label: `${entry.monthName} ${entry.year}`,
        id: `${entry.year}-${entry.month}`
      }))
      .sort((a, b) => {
        // Sort by year descending, then by month descending
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
  });

  // Filter state
  let showFilters = $state(false);
  let activeFilterCount = $derived.by(() => {
    let count = 0;
    if (selectedSport) count++;
    if (selectedCategory) count++;
    return count;
  });

  // Filter handlers
  function handleSportSelect(sport: string | null) {
    selectedSport = sport;
    // Reset to first page when filtering
    currentPageNum = 1;
    // Note: Filtering should be handled by parent component via URL changes
  }

  function handleCategorySelect(category: string | null) {
    selectedCategory = category;
    // Reset to first page when filtering
    currentPageNum = 1;
    // Note: Filtering should be handled by parent component via URL changes
  }

  function clearAllFilters() {
    selectedSport = null;
    selectedCategory = null;
    currentPageNum = 1;
    // Note: Filtering should be handled by parent component via URL changes
  }

  // Scroll to period function
  function scrollToPeriod(year: number, month?: number) {
    const periodId = month ? `month-${year}-${month}` : `year-${year}`;
    const element = document.getElementById(periodId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      selectedYear = year;
      selectedMonth = month || null;
      showPeriodSelector = false;
    }
  }

  // Calculate content diversity for a period
  function getContentDiversity(photos: Photo[]) {
    const sports = new Set(photos.map(p => p.metadata?.sport_type).filter(Boolean));
    const categories = new Set(photos.map(p => p.metadata?.photo_category).filter(Boolean));

    return {
      sportCount: sports.size,
      categoryCount: categories.size,
      sports: Array.from(sports),
      categories: Array.from(categories)
    };
  }

  // Get featured photos (simple passthrough for now)
  function getFeaturedPhotos(photos: Photo[]): Photo[] {
    return photos || [];
  }

  // Click outside handler for dropdowns
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-dropdown]')) {
      showPeriodSelector = false;
    }
  }

  // Close dropdowns on escape
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      showPeriodSelector = false;
    }
  }

  // Effects for event listeners
  $effect(() => {
    if (showPeriodSelector) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKeydown);
      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleKeydown);
      };
    }
  });

  // Intersection observer for infinite scroll
  let sentinelElement: HTMLElement | null = $state(null);
  let sentinelObserver: IntersectionObserver | null = $state(null);

  // Load more periods
  async function loadMorePeriods() {
    // Note: Infinite scroll should be handled by parent component
    // For now, disable to prevent errors
    return;
  }

  // Initialize intersection observer for infinite scroll
  function initIntersectionObserver() {
    if (sentinelObserver) {
      sentinelObserver.disconnect();
    }

    sentinelObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMorePeriods && !isLoadingMore) {
          // Use untrack to prevent reactive updates from triggering the effect
          untrack(() => loadMorePeriods());
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before the sentinel comes into view
        threshold: 0.1
      }
    );

    if (sentinelElement) {
      sentinelObserver.observe(sentinelElement);
    }
  }

  // Set up observer when sentinel element is available
  $effect(() => {
    // Only initialize when sentinel element becomes available
    if (sentinelElement && !sentinelObserver) {
      initIntersectionObserver();
    }

    return () => {
      if (sentinelObserver) {
        sentinelObserver.disconnect();
        sentinelObserver = null;
      }
    };
  });
</script>

<div class="relative w-full bg-charcoal-950">
  <!-- Compact Header with Navigation -->
  <div class="sticky top-0 z-50 bg-charcoal-950/95 backdrop-blur-sm border-b border-charcoal-800/50">
    <div class="max-w-7xl mx-auto px-4 md:px-8 lg:px-10">
      <div class="flex items-center justify-end gap-3 py-4">
        <!-- Header is now empty but kept for future use -->
      </div>
    </div>
  </div>

  <!-- Timeline Content -->
  <div class="relative max-w-7xl mx-auto pt-8 pb-20">
    {#each periodsByYear as yearGroup}
      <!-- Sticky Year Header -->
      <div
        id="year-{yearGroup.year}"
        class="sticky top-20 z-30 bg-charcoal-950/95 backdrop-blur-sm border-y border-charcoal-800/50 mb-8 -mx-4 px-4 py-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <!-- Year Marker -->
            <div class="h-12 w-12 rounded-full bg-gold-500 flex items-center justify-center shadow-lg">
              <Calendar class="w-6 h-6 text-charcoal-950" />
            </div>

            <!-- Year Title -->
            <div>
              <Typography variant="h2" class="text-white">
                {yearGroup.year}
              </Typography>
              <Typography variant="caption" class="text-charcoal-400">
                {yearGroup.periods.reduce((total, period) => total + period.photoCount, 0)} photos this year
              </Typography>
            </div>
          </div>

          <!-- Filters and navigation aligned with year row -->
          <div class="flex items-center gap-2">
            <!-- Jump to dropdown -->
            {#if availablePeriods.length > 0}
              <div class="flex items-center gap-2">
                <Typography variant="label" class="hidden sm:inline text-charcoal-300 text-xs font-medium">
                  Jump to:
                </Typography>
                <div class="relative" data-dropdown>
                  <button
                    onclick={() => showPeriodSelector = !showPeriodSelector}
                    class="inline-flex items-center gap-2 px-3 py-2.5 text-sm bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-200 rounded-lg border border-charcoal-700 transition-colors min-h-[44px]"
                  >
                    <span class="text-xs sm:text-sm">{selectedYear && selectedMonth ? `${availablePeriods.find(p => p.year === selectedYear && p.month === selectedMonth)?.monthName} ${selectedYear}` : 'Select period'}</span>
                    <ChevronDown class="w-3 h-3" />
                  </button>

                  {#if showPeriodSelector}
                    <div class="absolute top-full right-0 mt-1 bg-charcoal-800 border border-charcoal-700 rounded-lg shadow-xl z-50 min-w-[180px] max-h-64 overflow-y-auto">
                      {#each availablePeriods as period}
                        <button
                          onclick={() => scrollToPeriod(period.year, period.month)}
                          class="w-full text-left px-3 py-2.5 text-sm text-charcoal-200 hover:bg-charcoal-700 hover:text-white transition-colors first:rounded-t-lg last:rounded-b-lg min-h-[44px] flex items-center"
                        >
                          {period.label}
                        </button>
                      {/each}
                    </div>
                  {/if}
                </div>
              </div>
            {/if}

            {#if activeFilterCount > 0}
              <button
                onclick={clearAllFilters}
                class="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium text-charcoal-300 hover:text-gold-400 bg-charcoal-800/50 hover:bg-charcoal-800 transition-all rounded-lg border border-charcoal-700/50 hover:border-gold-500/50 min-h-[44px]"
              >
                <X class="w-3 h-3" />
                <span class="hidden sm:inline">Clear</span>
                <span class="ml-1 px-1.5 py-0.5 bg-gold-500/20 text-gold-400 rounded-full text-xs font-bold">
                  {activeFilterCount}
                </span>
              </button>
            {/if}

            {#if sports && sports.length > 0}
              <SportFilter
                {sports}
                selectedSport={selectedSport}
                onSelect={handleSportSelect}
              />
            {/if}

            {#if categories && categories.length > 0}
              <CategoryFilter
                {categories}
                selectedCategory={selectedCategory}
                onSelect={handleCategorySelect}
              />
            {/if}
          </div>
        </div>
      </div>

      <!-- Months within this year -->
      {#each yearGroup.periods as entry, monthIndex}
        <div
          id="month-{entry.year}-{entry.month}"
          class="mb-12"
        >
          <!-- Month Header -->
          <div class="flex items-center gap-4 mb-6">
            <!-- Month Marker -->
            <div class="h-8 w-8 rounded-full bg-gold-400 flex items-center justify-center shadow-md">
              <span class="text-charcoal-950 text-sm font-bold">
                {entry.month}
              </span>
            </div>

            <!-- Month Title -->
            <div>
              <Typography variant="h3" class="text-white">
                {entry.monthName}
              </Typography>
              <Typography variant="caption" class="text-charcoal-400">
                {entry.photoCount} photos
              </Typography>
            </div>
          </div>

          <!-- Month Content -->
          <div class="ml-12">
            <!-- Description -->
            {#if entry.description}
              <Typography variant="body" class="text-charcoal-300 mb-4">
                {entry.description}
              </Typography>
            {/if}

            <!-- Diversity Indicators -->
            {#if entry.featuredPhotos && entry.featuredPhotos.length > 0}
              {@const diversity = getContentDiversity(entry.featuredPhotos)}
              <div class="flex items-center gap-4 mb-4">
                <Typography variant="caption" class="text-charcoal-400">
                  {entry.photoCount} photos from this month
                </Typography>

                <div class="flex items-center gap-2 text-xs text-charcoal-500">
                  {#if diversity.sportCount > 1}
                    <span class="flex items-center gap-1">
                      <span class="w-2 h-2 bg-gold-500 rounded-full"></span>
                      {diversity.sportCount} sports
                    </span>
                  {/if}
                  {#if diversity.categoryCount > 1}
                    <span class="flex items-center gap-1">
                      <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                      {diversity.categoryCount} categories
                    </span>
                  {/if}
                </div>
              </div>
            {/if}

            <!-- Photo Grid or Empty State -->
            {#if getFeaturedPhotos(entry.featuredPhotos).length > 0}
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6">
                {#each getFeaturedPhotos(entry.featuredPhotos) as photo (photo.id)}
                  <PhotoCard
                    {photo}
                    index={0}
                  />
                {/each}
              </div>
            {:else}
              <!-- Empty State for periods with no featured photos -->
              <div class="bg-charcoal-900/50 border border-charcoal-800 rounded-lg p-6 mb-6 text-center">
                <Calendar class="w-10 h-10 text-charcoal-600 mx-auto mb-3" />
                <Typography variant="body" class="text-charcoal-400 mb-1">
                  Featured photos coming soon
                </Typography>
                <Typography variant="caption" class="text-charcoal-500">
                  {entry.photoCount} photos available • Processing in progress
                </Typography>
              </div>
            {/if}

            <!-- View All Link -->
            <a
              href="/explore?year={entry.year}{entry.month ? `&month=${entry.month}` : ''}"
              class="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors text-sm"
            >
              <Typography variant="body" class="font-medium">
                View all {entry.photoCount} photos
              </Typography>
              <ChevronDown class="w-4 h-4 rotate-[-90deg]" />
            </a>
          </div>
        </div>
      {/each}

      <!-- Infinite scroll sentinel - only show for the last year group -->
      {#if yearGroup === periodsByYear[periodsByYear.length - 1] && hasMorePeriods}
        <div
          bind:this={sentinelElement}
          class="flex justify-center py-12"
        >
          {#if isLoadingMore}
            <div class="flex items-center gap-3 text-charcoal-400">
              <div class="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
              <Typography variant="body" class="text-sm">
                Loading more periods...
              </Typography>
            </div>
          {:else}
            <div class="h-4"></div>
          {/if}
        </div>
      {/if}
    {/each}

    <!-- Progress Line -->
    <div class="absolute left-4 md:left-6 top-0 w-0.5 bg-gradient-to-b from-transparent via-gold-500/50 to-transparent">
      <div class="w-full bg-gradient-to-b from-gold-400 to-gold-600 rounded-full h-full"></div>
    </div>
  </div>

</div>