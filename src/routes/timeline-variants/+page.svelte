<!--
  Timeline Navigation Variants Demo

  Compare different navigation patterns:
  1. Dropdown (current)
  2. Sticky Timeline Navigator
  3. Floating Action Button
  4. Gesture-Based Navigation
-->

<script lang="ts">
  import { Calendar, ChevronDown, ChevronRight, Menu, Navigation } from 'lucide-svelte';
  import Typography from '$lib/components/ui/Typography.svelte';
  import type { Photo } from '$types/photo';

  interface TimelineEntry {
    year: number;
    month?: number;
    monthName?: string;
    photoCount: number;
    featuredPhotos: Photo[];
  }

  interface Props {
    data: {
      periods: TimelineEntry[];
      hasMore: boolean;
      currentPage: number;
    };
  }

  let { data }: Props = $props();

  // Derive navigation data
  let availablePeriods = $derived.by(() => {
    return data.periods
      .filter(entry => entry.month)
      .map(entry => ({
        year: entry.year,
        month: entry.month!,
        monthName: entry.monthName!,
        label: `${entry.monthName} ${entry.year}`,
        id: `${entry.year}-${entry.month}`
      }))
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
  });

  let periodsByYear = $derived.by(() => {
    const grouped: Record<number, typeof availablePeriods> = {};
    availablePeriods.forEach(period => {
      if (!grouped[period.year]) {
        grouped[period.year] = [];
      }
      grouped[period.year].push(period);
    });

    return Object.keys(grouped)
      .map(year => parseInt(year))
      .sort((a, b) => b - a)
      .map(year => ({
        year,
        periods: grouped[year].sort((a, b) => b.month - a.month)
      }));
  });

  // Variant 1: Current Dropdown
  let dropdown1Open = $state(false);
  let dropdown1Selected = $state<string>('Select period');

  function scrollToVariant1(period: typeof availablePeriods[0]) {
    dropdown1Selected = period.label;
    dropdown1Open = false;
    // In real implementation, would scroll to that period
  }

  // Variant 2: Sticky Timeline Navigator
  let expandedYear = $state<number | null>(null);
  let stickyNavVisible = $state(true);

  function toggleYear(year: number) {
    expandedYear = expandedYear === year ? null : year;
  }

  function scrollToVariant2(year: number, month?: number) {
    // In real implementation, would scroll to that period
    console.log('Scroll to:', year, month);
  }

  // Variant 3: Floating Action Button
  let fabOpen = $state(false);
  let fabCurrentPeriod = $state('October 2025');
  let fabSelectedYear = $state<number | null>(null);

  function openFab() {
    fabOpen = true;
    fabSelectedYear = null;
  }

  function selectFabYear(year: number) {
    fabSelectedYear = year;
  }

  function scrollToVariant3(period: typeof availablePeriods[0]) {
    fabCurrentPeriod = period.label;
    fabOpen = false;
    fabSelectedYear = null;
  }

  // Variant 4: Gesture-Based Navigation
  let sideMenuOpen = $state(false);
  let gesture4SelectedYear = $state<number | null>(null);

  function openSideMenu() {
    sideMenuOpen = true;
    gesture4SelectedYear = null;
  }

  function selectGestureYear(year: number) {
    gesture4SelectedYear = year;
  }

  function scrollToVariant4(period: typeof availablePeriods[0]) {
    sideMenuOpen = false;
    gesture4SelectedYear = null;
  }

  // Close handlers
  function handleClickOutside(event: MouseEvent, closeHandler: () => void) {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-modal]')) {
      closeHandler();
    }
  }
</script>

<svelte:head>
  <title>Timeline Navigation Variants • UX Comparison</title>
</svelte:head>

<div class="min-h-screen bg-charcoal-950">
  <!-- Demo Header -->
  <div class="bg-charcoal-900 border-b border-charcoal-800 py-8 px-4">
    <div class="max-w-5xl mx-auto">
      <Typography variant="h1" class="text-white mb-3">
        Timeline Navigation Variants
      </Typography>
      <Typography variant="body" class="text-charcoal-400">
        Compare different navigation patterns for the timeline view. Each variant is interactive - try them out!
      </Typography>
    </div>
  </div>

  <div class="max-w-5xl mx-auto px-4 py-12 space-y-16">
    <!-- Variant 1: Current Dropdown Approach -->
    <section class="border border-charcoal-800 rounded-lg overflow-hidden">
      <div class="bg-charcoal-900 px-6 py-4 border-b border-charcoal-800">
        <div class="flex items-center justify-between">
          <div>
            <Typography variant="h3" class="text-white mb-1">
              1. Current Dropdown
            </Typography>
            <Typography variant="caption" class="text-charcoal-400">
              Familiar pattern, space-efficient, but requires two clicks
            </Typography>
          </div>
          <div class="px-3 py-1 bg-gold-500/10 text-gold-400 text-xs font-medium rounded-full">
            Current
          </div>
        </div>
      </div>

      <div class="bg-charcoal-950 p-6">
        <!-- Demo Year Header -->
        <div class="bg-charcoal-900/50 border border-charcoal-800 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-full bg-gold-500 flex items-center justify-center">
                <Calendar class="w-5 h-5 text-charcoal-950" />
              </div>
              <div>
                <Typography variant="h4" class="text-white">2025</Typography>
                <Typography variant="caption" class="text-charcoal-400">213 photos</Typography>
              </div>
            </div>

            <!-- Dropdown -->
            <div class="relative" data-modal>
              <button
                onclick={() => dropdown1Open = !dropdown1Open}
                class="inline-flex items-center gap-2 px-3 py-2.5 text-sm bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-200 rounded-lg border border-charcoal-700 transition-colors min-h-[44px]"
              >
                <span class="text-xs sm:text-sm">{dropdown1Selected}</span>
                <ChevronDown class="w-3 h-3" />
              </button>

              {#if dropdown1Open}
                <div class="absolute top-full right-0 mt-1 bg-charcoal-800 border border-charcoal-700 rounded-lg shadow-xl z-50 min-w-[180px] max-h-64 overflow-y-auto">
                  {#each availablePeriods.slice(0, 10) as period}
                    <button
                      onclick={() => scrollToVariant1(period)}
                      class="w-full text-left px-3 py-2.5 text-sm text-charcoal-200 hover:bg-charcoal-700 hover:text-white transition-colors first:rounded-t-lg last:rounded-b-lg min-h-[44px] flex items-center"
                    >
                      {period.label}
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        </div>

        <!-- Pros/Cons -->
        <div class="mt-4 grid md:grid-cols-2 gap-4">
          <div class="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <Typography variant="label" class="text-green-400 mb-2">Pros</Typography>
            <ul class="text-sm text-charcoal-300 space-y-1">
              <li>• Familiar pattern</li>
              <li>• Space-efficient</li>
              <li>• Works on mobile</li>
            </ul>
          </div>
          <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <Typography variant="label" class="text-red-400 mb-2">Cons</Typography>
            <ul class="text-sm text-charcoal-300 space-y-1">
              <li>• Requires two clicks</li>
              <li>• Hidden affordance</li>
              <li>• Long list (39 items)</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Variant 2: Sticky Timeline Navigator -->
    <section class="border border-charcoal-800 rounded-lg overflow-hidden">
      <div class="bg-charcoal-900 px-6 py-4 border-b border-charcoal-800">
        <div class="flex items-center justify-between">
          <div>
            <Typography variant="h3" class="text-white mb-1">
              2. Sticky Timeline Navigator
            </Typography>
            <Typography variant="caption" class="text-charcoal-400">
              Visual timeline with expandable years, shows temporal context
            </Typography>
          </div>
          <div class="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full">
            Recommended
          </div>
        </div>
      </div>

      <div class="bg-charcoal-950 p-6">
        <!-- Sticky Navigator Demo -->
        <div class="bg-charcoal-900/50 border border-charcoal-800 rounded-lg p-4">
          <div class="flex items-center gap-2 text-sm">
            <span class="text-charcoal-400 font-medium">Timeline:</span>
            <div class="flex items-center gap-1 flex-wrap">
              {#each periodsByYear.slice(0, 5) as yearGroup}
                <div class="relative" data-modal>
                  <button
                    onclick={() => toggleYear(yearGroup.year)}
                    class="px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium border border-charcoal-700 {expandedYear === yearGroup.year ? 'bg-gold-500 text-charcoal-950' : 'bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-200'}"
                  >
                    {yearGroup.year}
                    <div class="w-3 h-3 transition-transform {expandedYear === yearGroup.year ? 'rotate-180' : ''}">
                      <ChevronDown class="w-3 h-3" />
                    </div>
                  </button>

                  {#if expandedYear === yearGroup.year}
                    <div class="absolute top-full left-0 mt-1 bg-charcoal-800 border border-charcoal-700 rounded-lg shadow-xl z-50 min-w-max">
                      <div class="flex flex-wrap gap-1 p-2 max-w-sm">
                        {#each yearGroup.periods as period}
                          <button
                            onclick={() => scrollToVariant2(period.year, period.month)}
                            class="px-2 py-1 text-xs bg-charcoal-700 hover:bg-gold-500 hover:text-charcoal-950 text-charcoal-200 rounded transition-colors"
                          >
                            {period.monthName?.slice(0, 3)}
                          </button>
                        {/each}
                      </div>
                    </div>
                  {/if}
                </div>
              {/each}
              <span class="text-charcoal-600 text-xs">...</span>
            </div>
          </div>

          <!-- Visual indicator -->
          <div class="mt-4 h-1 bg-charcoal-800 rounded-full overflow-hidden">
            <div class="h-full w-1/3 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full"></div>
          </div>
          <Typography variant="caption" class="text-charcoal-500 mt-2 text-center block">
            Progress indicator shows current scroll position
          </Typography>
        </div>

        <!-- Pros/Cons -->
        <div class="mt-4 grid md:grid-cols-2 gap-4">
          <div class="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <Typography variant="label" class="text-green-400 mb-2">Pros</Typography>
            <ul class="text-sm text-charcoal-300 space-y-1">
              <li>• Single click to any month</li>
              <li>• Visual temporal context</li>
              <li>• Shows current position</li>
              <li>• Delightful animations</li>
            </ul>
          </div>
          <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <Typography variant="label" class="text-red-400 mb-2">Cons</Typography>
            <ul class="text-sm text-charcoal-300 space-y-1">
              <li>• Takes up space (sticky)</li>
              <li>• May clutter on mobile</li>
              <li>• Requires scroll position tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Variant 3: Floating Action Button -->
    <section class="border border-charcoal-800 rounded-lg overflow-hidden">
      <div class="bg-charcoal-900 px-6 py-4 border-b border-charcoal-800">
        <div>
          <Typography variant="h3" class="text-white mb-1">
            3. Floating Action Button
          </Typography>
          <Typography variant="caption" class="text-charcoal-400">
            Smart year marker with quick picker, minimal footprint
          </Typography>
        </div>
      </div>

      <div class="bg-charcoal-950 p-6">
        <!-- FAB Demo -->
        <div class="bg-charcoal-900/50 border border-charcoal-800 rounded-lg p-8 relative min-h-[200px]">
          <Typography variant="body" class="text-charcoal-400 text-center mb-8">
            Scroll through timeline content...
          </Typography>

          <!-- Floating Button -->
          <button
            onclick={openFab}
            class="absolute bottom-4 right-4 px-4 py-3 bg-gold-500 hover:bg-gold-400 text-charcoal-950 rounded-lg shadow-lg transition-all hover:scale-105 flex items-center gap-2"
          >
            <Calendar class="w-4 h-4" />
            <div class="text-left">
              <div class="text-xs font-medium">{fabCurrentPeriod}</div>
            </div>
            <Navigation class="w-4 h-4" />
          </button>

          <!-- FAB Modal -->
          {#if fabOpen}
            <div
              class="absolute inset-0 bg-charcoal-950/95 backdrop-blur-sm rounded-lg flex items-center justify-center"
              data-modal
            >
              {#if fabSelectedYear === null}
                <!-- Year Selection -->
                <div class="bg-charcoal-800 border border-charcoal-700 rounded-lg p-4 max-w-xs w-full">
                  <Typography variant="h4" class="text-white mb-3">Select Year</Typography>
                  <div class="grid grid-cols-3 gap-2">
                    {#each periodsByYear.slice(0, 9) as yearGroup}
                      <button
                        onclick={() => selectFabYear(yearGroup.year)}
                        class="px-4 py-3 bg-charcoal-700 hover:bg-gold-500 hover:text-charcoal-950 text-charcoal-200 rounded-lg transition-colors text-sm font-medium"
                      >
                        {yearGroup.year}
                      </button>
                    {/each}
                  </div>
                  <button
                    onclick={() => fabOpen = false}
                    class="mt-3 w-full px-4 py-2 bg-charcoal-700 hover:bg-charcoal-600 text-charcoal-300 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              {:else}
                <!-- Month Selection -->
                <div class="bg-charcoal-800 border border-charcoal-700 rounded-lg p-4 max-w-xs w-full">
                  <div class="flex items-center justify-between mb-3">
                    <button
                      onclick={() => fabSelectedYear = null}
                      class="text-charcoal-400 hover:text-white"
                    >
                      ← Back
                    </button>
                    <Typography variant="h4" class="text-white">{fabSelectedYear}</Typography>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    {#each periodsByYear.find(y => y.year === fabSelectedYear)?.periods || [] as period}
                      <button
                        onclick={() => scrollToVariant3(period)}
                        class="px-3 py-2 bg-charcoal-700 hover:bg-gold-500 hover:text-charcoal-950 text-charcoal-200 rounded-lg transition-colors text-xs"
                      >
                        {period.monthName?.slice(0, 3)}
                      </button>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Pros/Cons -->
        <div class="mt-4 grid md:grid-cols-2 gap-4">
          <div class="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <Typography variant="label" class="text-green-400 mb-2">Pros</Typography>
            <ul class="text-sm text-charcoal-300 space-y-1">
              <li>• Minimal footprint</li>
              <li>• Shows current position</li>
              <li>• Two-step picker (year → month)</li>
              <li>• Mobile-friendly</li>
            </ul>
          </div>
          <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <Typography variant="label" class="text-red-400 mb-2">Cons</Typography>
            <ul class="text-sm text-charcoal-300 space-y-1">
              <li>• May obscure content</li>
              <li>• Two clicks required</li>
              <li>• Less discoverable</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Variant 4: Gesture-Based Navigation -->
    <section class="border border-charcoal-800 rounded-lg overflow-hidden">
      <div class="bg-charcoal-900 px-6 py-4 border-b border-charcoal-800">
        <div>
          <Typography variant="h3" class="text-white mb-1">
            4. Gesture-Based Navigation
          </Typography>
          <Typography variant="caption" class="text-charcoal-400">
            Swipe edge to reveal picker, mobile-first design
          </Typography>
        </div>
      </div>

      <div class="bg-charcoal-950 p-6">
        <!-- Gesture Demo -->
        <div class="bg-charcoal-900/50 border border-charcoal-800 rounded-lg p-8 relative min-h-[200px]">
          <Typography variant="body" class="text-charcoal-400 text-center mb-8">
            Swipe from left edge (or tap menu button)
          </Typography>

          <!-- Menu Button -->
          <button
            onclick={openSideMenu}
            class="absolute top-4 left-4 p-2 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 rounded-lg transition-colors"
          >
            <Menu class="w-5 h-5" />
          </button>

          <!-- Side Menu -->
          {#if sideMenuOpen}
            <div
              class="absolute inset-0 bg-charcoal-950/95 backdrop-blur-sm rounded-lg flex"
              data-modal
              role="dialog"
              aria-label="Side menu"
              tabindex="-1"
              onclick={(e) => handleClickOutside(e, () => sideMenuOpen = false)}
              onkeydown={(e) => {
                if (e.key === 'Escape') {
                  sideMenuOpen = false;
                }
              }}
            >
              <div class="bg-charcoal-800 border-r border-charcoal-700 w-64 p-4 overflow-y-auto" data-modal>
                {#if gesture4SelectedYear === null}
                  <!-- Year List -->
                  <Typography variant="h4" class="text-white mb-3">Select Year</Typography>
                  <div class="space-y-2">
                    {#each periodsByYear as yearGroup}
                      <button
                        onclick={() => selectGestureYear(yearGroup.year)}
                        class="w-full text-left px-4 py-3 bg-charcoal-700 hover:bg-charcoal-600 text-charcoal-200 rounded-lg transition-colors flex items-center justify-between"
                      >
                        <span class="font-medium">{yearGroup.year}</span>
                        <ChevronRight class="w-4 h-4" />
                      </button>
                    {/each}
                  </div>
                {:else}
                  <!-- Month List -->
                  <button
                    onclick={() => gesture4SelectedYear = null}
                    class="mb-3 text-charcoal-400 hover:text-white flex items-center gap-1"
                  >
                    ← Back to years
                  </button>
                  <Typography variant="h4" class="text-white mb-3">{gesture4SelectedYear}</Typography>
                  <div class="space-y-2">
                    {#each periodsByYear.find(y => y.year === gesture4SelectedYear)?.periods || [] as period}
                      <button
                        onclick={() => scrollToVariant4(period)}
                        class="w-full text-left px-4 py-2.5 bg-charcoal-700 hover:bg-gold-500 hover:text-charcoal-950 text-charcoal-200 rounded-lg transition-colors"
                      >
                        {period.monthName}
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        </div>

        <!-- Pros/Cons -->
        <div class="mt-4 grid md:grid-cols-2 gap-4">
          <div class="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <Typography variant="label" class="text-green-400 mb-2">Pros</Typography>
            <ul class="text-sm text-charcoal-300 space-y-1">
              <li>• App-like feel</li>
              <li>• No clutter when closed</li>
              <li>• Large touch targets</li>
              <li>• Progressive disclosure</li>
            </ul>
          </div>
          <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <Typography variant="label" class="text-red-400 mb-2">Cons</Typography>
            <ul class="text-sm text-charcoal-300 space-y-1">
              <li>• Hidden affordance</li>
              <li>• Gesture may conflict</li>
              <li>• Two clicks required</li>
              <li>• Not discoverable</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Recommendation -->
    <div class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
      <div class="flex items-start gap-4">
        <div class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
          <span class="text-white text-lg">💡</span>
        </div>
        <div>
          <Typography variant="h4" class="text-white mb-2">Recommendation</Typography>
          <Typography variant="body" class="text-charcoal-300 mb-4">
            <strong class="text-blue-400">Variant 2: Sticky Timeline Navigator</strong> provides the best balance of:
          </Typography>
          <ul class="text-sm text-charcoal-300 space-y-2">
            <li>• <strong>Discoverability</strong> - Always visible, clear affordance</li>
            <li>• <strong>Efficiency</strong> - Single click from year to month</li>
            <li>• <strong>Context</strong> - Visual representation of temporal structure</li>
            <li>• <strong>Delight</strong> - Smooth animations and progress indicator</li>
          </ul>
          <Typography variant="body" class="text-charcoal-400 mt-4">
            For mobile, consider combining with <strong>Variant 3</strong> (compact FAB) to save space while maintaining functionality.
          </Typography>
        </div>
      </div>
    </div>

    <!-- Back to Timeline -->
    <div class="flex justify-center pt-8">
      <a
        href="/timeline"
        class="inline-flex items-center gap-2 px-6 py-3 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-200 rounded-lg transition-colors"
      >
        ← Back to Timeline
      </a>
    </div>
  </div>
</div>
