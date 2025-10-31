<!--
  TimelineV2 Component - Vertical timeline for photo browsing

  Features:
  - Year/month grouping for large datasets
  - Date-based timeline navigation (year/month dots aligned to actual dates)
  - Clickable year labels with active state tracking
  - Visual hierarchy: Years above timeline, months on timeline
  - Scroll position tracking for active year highlighting
  - Photo grids with lazy loading
  - Mobile-responsive design

  Navigation IA:
  - Top level: Year labels (clickable, show active state)
  - Second level: Month dots (clickable, positioned by actual date)
  - Visual feedback: Active year highlighted, hover states on all elements
  - Progress indicator shows current scroll position

  Usage:
  <TimelineV2 {timelineData} />
-->

<script lang="ts">
  import { untrack } from 'svelte';
  import Typography from '$lib/components/ui/Typography.svelte';
  import PhotoCard from '$lib/components/gallery/PhotoCard.svelte';
  import Lightbox from '$lib/components/gallery/Lightbox.svelte';
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

  // Lightbox state - collect all photos from timeline for full navigation
  let lightboxOpen = $state(false);
  let selectedPhotoIndex = $state(0);
  
  // Collect all featured photos from all periods for lightbox navigation
  let allTimelinePhotos = $derived.by(() => {
    const photos: Photo[] = [];
    timelineData.forEach(entry => {
      if (entry.featuredPhotos && entry.featuredPhotos.length > 0) {
        photos.push(...entry.featuredPhotos);
      }
    });
    return photos;
  });

  // Photo click handler - find photo in full timeline collection
  // Consistent with other pages: opens full lightbox with all timeline photos
  // PhotoCard's onclick handler already prevents default navigation
  function handlePhotoClick(photo: Photo) {
    console.log('[Timeline] Photo clicked:', photo.image_key);
    console.log('[Timeline] All timeline photos count:', allTimelinePhotos.length);
    
    // Find the photo in the full timeline collection
    const index = allTimelinePhotos.findIndex((p) => p.image_key === photo.image_key);
    
    console.log('[Timeline] Found photo at index:', index);
    
    if (index !== -1) {
      selectedPhotoIndex = index;
      lightboxOpen = true;
      console.log('[Timeline] Opening lightbox with index:', index);
    } else {
      // Fallback: if photo not found, try to add it temporarily or use first photo
      console.warn('[Timeline] Photo not found in allTimelinePhotos:', photo.image_key);
      console.warn('[Timeline] Available photo keys:', allTimelinePhotos.slice(0, 5).map(p => p.image_key));
      
      // If we have photos, use the first one as fallback
      if (allTimelinePhotos.length > 0) {
        selectedPhotoIndex = 0;
        lightboxOpen = true;
        console.log('[Timeline] Using fallback: opening first photo');
      } else {
        console.error('[Timeline] No photos available in timeline!');
      }
    }
  }

  function handleLightboxNavigate(newIndex: number) {
    selectedPhotoIndex = newIndex;
  }

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
      const offset = getScrollOffset();
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
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

  // Visual Timeline Navigator State
  let hoveredPeriod = $state<{ year: number; month: number; monthName: string } | null>(null);

  // Calculate scroll offset for sticky headers
  // Header: h-16 (64px) + Timeline navigator: top-16 (64px offset) + height (~108px) = ~172px
  function getScrollOffset(): number {
    // Measure actual timeline navigator height dynamically
    const timelineNav = document.querySelector('[data-timeline-nav]');
    if (timelineNav) {
      const navHeight = timelineNav.getBoundingClientRect().height;
      // Header (64px) + Navigator height + padding (20px)
      return 64 + navHeight + 20;
    }
    // Fallback: Header (64px) + Navigator estimated (~108px) + padding (20px)
    return 192;
  }

  function scrollToNavPeriod(year: number, month: number) {
    const periodId = `month-${year}-${month}`;
    const element = document.getElementById(periodId);
    if (element) {
      const offset = getScrollOffset();
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  // Calculate timeline positions (0-100%) for each period
  let timelinePositions = $derived.by(() => {
    if (availablePeriods.length === 0) return [];

    // Get min and max dates
    const firstPeriod = availablePeriods[availablePeriods.length - 1]; // Oldest
    const lastPeriod = availablePeriods[0]; // Newest

    const minDate = new Date(firstPeriod.year, firstPeriod.month - 1, 1);
    const maxDate = new Date(lastPeriod.year, lastPeriod.month - 1, 1);
    const totalRange = maxDate.getTime() - minDate.getTime();

    return availablePeriods.map(period => {
      const periodDate = new Date(period.year, period.month - 1, 1);
      const position = ((periodDate.getTime() - minDate.getTime()) / totalRange) * 100;
      return {
        ...period,
        position: 100 - position // Reverse so newest is on the right
      };
    });
  });

  // Get unique years for milestones with proper date-based positioning
  let yearMilestones = $derived.by(() => {
    if (availablePeriods.length === 0) return [];
    
    const years = new Set(availablePeriods.map(p => p.year));
    const yearsArray = Array.from(years).sort((a, b) => b - a); // Newest first
    
    // Get min and max dates for proper positioning
    const firstPeriod = availablePeriods[availablePeriods.length - 1]; // Oldest
    const lastPeriod = availablePeriods[0]; // Newest
    const minDate = new Date(firstPeriod.year, firstPeriod.month - 1, 1);
    const maxDate = new Date(lastPeriod.year, lastPeriod.month - 1, 1);
    const totalRange = maxDate.getTime() - minDate.getTime();
    
    // Calculate position for each year (use January 1st of that year)
    return yearsArray.map(year => {
      const yearDate = new Date(year, 0, 1); // January 1st
      // Clamp to min/max range
      const clampedDate = yearDate < minDate ? minDate : yearDate > maxDate ? maxDate : yearDate;
      const position = ((clampedDate.getTime() - minDate.getTime()) / totalRange) * 100;
      return {
        year,
        position: 100 - position // Reverse so newest is on the right
      };
    });
  });

  // Track currently visible year and month based on scroll position
  let currentVisibleYear = $state<number | null>(null);
  let currentVisibleMonth = $state<{ year: number; month: number } | null>(null);

  // Update visible year and month based on scroll position
  function updateVisibleYear() {
    const scrollY = window.scrollY + 200; // Offset for sticky header
    const yearElements = document.querySelectorAll('[id^="year-"]');
    const monthElements = document.querySelectorAll('[id^="month-"]');

    let newVisibleYear: number | null = null;
    yearElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const elTop = rect.top + window.scrollY;
      const elBottom = elTop + rect.height;

      if (scrollY >= elTop && scrollY < elBottom) {
        const yearId = el.id.replace('year-', '');
        newVisibleYear = parseInt(yearId);
      }
    });

    if (newVisibleYear !== currentVisibleYear) {
      currentVisibleYear = newVisibleYear;
    }

    // Track visible month (find the month section closest to viewport top)
    let closestMonth: { year: number; month: number; distance: number } | null = null;
    monthElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const distance = Math.abs(rect.top);

      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const monthId = el.id.replace('month-', '');
        const [year, month] = monthId.split('-').map(Number);

        if (!closestMonth || distance < closestMonth.distance) {
          closestMonth = { year, month, distance };
        }
      }
    });

    if (closestMonth) {
      const newMonth = { year: closestMonth.year, month: closestMonth.month };
      if (!currentVisibleMonth ||
          currentVisibleMonth.year !== newMonth.year ||
          currentVisibleMonth.month !== newMonth.month) {
        currentVisibleMonth = newMonth;
      }
    }
  }

  // Scroll to year function
  function scrollToYear(year: number) {
    const element = document.getElementById(`year-${year}`);
    if (element) {
      const offset = getScrollOffset();
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      selectedYear = year;
      selectedMonth = null;
    }
  }

  // Track scroll position for progress indicator
  let scrollProgress = $state(0);

  function handleScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = (scrollTop / docHeight) * 100;
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

  // Scroll tracking effect
  $effect(() => {
    function scrollHandler() {
      handleScroll();
      updateVisibleYear();
    }
    window.addEventListener('scroll', scrollHandler, { passive: true });
    updateVisibleYear(); // Initial check
    return () => {
      window.removeEventListener('scroll', scrollHandler);
    };
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
    // Only track sentinelElement changes, not sentinelObserver
    const element = sentinelElement;

    // Use untrack to prevent infinite loop from reading/writing sentinelObserver
    untrack(() => {
      if (element && !sentinelObserver) {
        initIntersectionObserver();
      }
    });

    return () => {
      untrack(() => {
        if (sentinelObserver) {
          sentinelObserver.disconnect();
          sentinelObserver = null;
        }
      });
    };
  });
</script>

<div class="relative w-full bg-charcoal-950">
  <!-- Visual Timeline Navigator -->
  <div class="sticky top-16 z-40 bg-charcoal-950/95 backdrop-blur-sm border-b border-charcoal-800/50 shadow-lg" data-timeline-nav>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <!-- Timeline Label -->
      <div class="flex items-center gap-3 mb-3">
        <span class="text-charcoal-400 text-xs font-medium flex-shrink-0">Timeline</span>
        <div class="flex-1 h-px bg-charcoal-800"></div>
      </div>

      <!-- Visual Timeline Bar -->
      <div class="relative h-16">
        <!-- Horizontal timeline line -->
        <div class="absolute top-8 left-0 right-0 h-0.5 bg-charcoal-800"></div>

        <!-- Year milestones (clickable, positioned above timeline) -->
        {#each yearMilestones as milestone}
          {@const isActive = currentVisibleYear === milestone.year}
          <button
            onclick={() => scrollToYear(milestone.year)}
            class="absolute top-0 transform -translate-x-1/2 group cursor-pointer transition-all"
            style="left: {milestone.position}%"
            aria-label="Jump to {milestone.year}"
          >
            <!-- Year marker -->
            <div class="flex flex-col items-center">
              <!-- Year label -->
              <div
                class="px-2 py-1 rounded-md transition-all"
                class:bg-gold-500={isActive}
                class:text-charcoal-950={isActive}
                class:text-charcoal-300={!isActive}
                class:hover:bg-gold-400={!isActive}
                class:hover:text-charcoal-950={!isActive}
              >
                <Typography 
                  variant="caption" 
                  class={`text-sm font-semibold whitespace-nowrap ${isActive ? 'text-white' : 'text-charcoal-300'}`}
                >
                  {milestone.year}
                </Typography>
              </div>
              <!-- Year marker line and dot -->
              <div class="w-px h-3 bg-charcoal-600 group-hover:bg-gold-500 transition-colors mt-1"
                   class:bg-gold-500={isActive}></div>
              <div class="w-2 h-2 rounded-full bg-charcoal-600 group-hover:bg-gold-500 -mt-px transition-colors"
                   class:bg-gold-500={isActive}></div>
            </div>
          </button>
        {/each}

        <!-- Month dots (only periods with photos, positioned on timeline) -->
        {#each timelinePositions as period}
          {@const isActiveMonth = currentVisibleMonth?.year === period.year && currentVisibleMonth?.month === period.month}
          {@const monthNumStr = String(period.month).padStart(2, '0')}
          {@const yearShortStr = String(period.year).slice(-2)}

          <button
            onclick={() => scrollToNavPeriod(period.year, period.month)}
            onmouseenter={() => hoveredPeriod = { year: period.year, month: period.month, monthName: period.monthName }}
            onmouseleave={() => hoveredPeriod = null}
            class="absolute top-7 transform -translate-x-1/2 group cursor-pointer z-20"
            style="left: {period.position}%"
            aria-label="Jump to {period.monthName} {period.year}"
          >
            <!-- Month dot with dimmed/active states -->
            <div class="relative">
              <!-- Dimmed by default, highlighted when active or hovered -->
              <div
                class="w-2.5 h-2.5 rounded-full transition-all duration-200"
                class:bg-charcoal-600={!isActiveMonth}
                class:opacity-40={!isActiveMonth}
                class:bg-gold-500={isActiveMonth}
                class:opacity-100={isActiveMonth}
                class:shadow-lg={isActiveMonth}
                class:ring-1={isActiveMonth}
                class:ring-gold-600={isActiveMonth}
                class:group-hover:bg-gold-400={true}
                class:group-hover:opacity-100={true}
                class:group-hover:scale-150={true}
                class:scale-125={isActiveMonth}
              ></div>

              <!-- Hover tooltip with MM/YY format -->
              {#if hoveredPeriod && hoveredPeriod.year === period.year && hoveredPeriod.month === period.month}
                <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-1.5 bg-charcoal-900 border border-gold-500/30 rounded shadow-xl whitespace-nowrap z-50 backdrop-blur-sm">
                  <Typography variant="caption" class="text-white text-xs font-medium">
                    {monthNumStr}/{yearShortStr}
                  </Typography>
                  <Typography variant="caption" class="text-charcoal-400 text-[10px]">
                    {period.monthName} {period.year}
                  </Typography>
                  <div class="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                    <div class="border-4 border-transparent border-t-charcoal-900"></div>
                  </div>
                </div>
              {/if}
            </div>
          </button>
        {/each}

        <!-- Progress indicator (current scroll position) -->
        <div
          class="absolute top-7 transform -translate-x-1/2 z-10 pointer-events-none"
          style="left: {scrollProgress}%"
        >
          <div class="w-3 h-3 rounded-full bg-white border-2 border-gold-500 shadow-lg"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Timeline Content -->
  <div class="relative max-w-7xl mx-auto pt-8 pb-20">
    {#each periodsByYear as yearGroup}
      <!-- Sticky Year Header -->
      <div
        id="year-{yearGroup.year}"
        class="sticky top-[88px] z-30 mb-8"
      >
        <div class="bg-charcoal-950 border-b border-charcoal-800/50 -mx-4 px-4 pb-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10">
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
            <!-- Diversity Indicators -->
            {#if entry.featuredPhotos && entry.featuredPhotos.length > 0}
              {@const diversity = getContentDiversity(entry.featuredPhotos)}
              {#if diversity.sportCount > 1 || diversity.categoryCount > 1}
                <div class="flex items-center gap-3 mb-4 text-xs text-charcoal-500">
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
              {/if}
            {/if}

            <!-- Photo Grid or Empty State -->
            {#if getFeaturedPhotos(entry.featuredPhotos).length > 0}
              {@const featuredPhotos = getFeaturedPhotos(entry.featuredPhotos)}
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6">
                {#each featuredPhotos as photo, photoIndex (photo.id)}
                  <PhotoCard
                    {photo}
                    index={photoIndex}
                    onclick={handlePhotoClick}
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
              href="/photos/{entry.year}/{entry.month}"
              class="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors text-sm"
            >
              <Typography variant="body" class="font-medium">
                View gallery
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

  <!-- Lightbox - consistent with other pages, shows all timeline photos -->
  <Lightbox
    bind:open={lightboxOpen}
    photo={allTimelinePhotos[selectedPhotoIndex] || null}
    photos={allTimelinePhotos}
    currentIndex={selectedPhotoIndex}
    onNavigate={handleLightboxNavigate}
  />

</div>