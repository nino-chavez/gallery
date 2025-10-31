<!--
  PremiumHero - Full-screen hero section with dark overlay and centered typography

  Features:
  - Full viewport height with background image
  - Dark semi-transparent overlay for moody feel
  - Perfectly centered content with premium typography
  - Responsive design with mobile optimizations
  - Optimized image loading with SmugMug size parameters
  - Uses design system colors and motion tokens

  Usage:
  <PremiumHero
    backgroundImage="/path/to/image.jpg"
    title="VOLLEYBALL PHOTOGRAPHY"
    subtitle="ACTION & MOMENTS"
  />
-->

<script lang="ts">
  import { Motion } from 'svelte-motion';
  import { MOTION } from '$lib/motion-tokens';
  import Typography from './Typography.svelte';
  import { cn } from '$lib/utils';

  interface Props {
    backgroundImage?: string;
    title?: string;
    subtitle?: string;
    class?: string;
  }

  let {
    backgroundImage = '',
    title = 'VOLLEYBALL PHOTOGRAPHY',
    subtitle = 'ACTION & MOMENTS',
    class: className
  }: Props = $props();

  // Generate optimized background image URL with SmugMug size parameters
  function getOptimizedBackgroundUrl(imageUrl: string, size: 'mobile' | 'desktop' | 'thumbnail'): string {
    if (!imageUrl) return '';

    // SmugMug image optimization using size suffixes
    // Available sizes: -Th (thumbnail), -S (400px), -M (600px), -L (800px),
    //                  -XL (1024px), -X2 (1600px), -X3 (2048px), -O (original)
    if (imageUrl.includes('smugmug.com')) {
      // Remove existing size suffix if present
      const baseUrl = imageUrl.replace(/-[A-Z]\d?\./, '.');

      // Thumbnail: Use -Th suffix (~5KB, loads instantly)
      // Mobile: Use X2Large (1600px) - optimal for phones/tablets in portrait
      // Desktop: Use X3Large (2048px) - optimal for desktop/large screens
      let suffix = '-X3';
      if (size === 'thumbnail') suffix = '-Th';
      else if (size === 'mobile') suffix = '-X2';

      return baseUrl.replace(/(\.[^.]+)$/, `${suffix}$1`);
    }

    // Supabase storage optimization
    if (imageUrl.includes('supabase')) {
      const url = new URL(imageUrl);
      if (size === 'thumbnail') {
        url.searchParams.set('width', '100');
        url.searchParams.set('quality', '60');
      } else {
        url.searchParams.set('width', size === 'mobile' ? '1200' : '1920');
        url.searchParams.set('quality', size === 'mobile' ? '85' : '90');
      }
      url.searchParams.set('format', 'webp');
      return url.toString();
    }

    // Fallback: return original URL
    return imageUrl;
  }

  // Generate responsive URLs
  let thumbnailBackground = $derived(getOptimizedBackgroundUrl(backgroundImage, 'thumbnail'));
  let mobileBackground = $derived(getOptimizedBackgroundUrl(backgroundImage, 'mobile'));
  let desktopBackground = $derived(getOptimizedBackgroundUrl(backgroundImage, 'desktop'));

  // Track image loading state
  let mobileImageLoaded = $state(false);
  let desktopImageLoaded = $state(false);
</script>

<section
  class={cn(
    "relative h-screen w-full flex items-center justify-center overflow-hidden bg-charcoal-950",
    className
  )}
  role="banner"
  aria-label="Hero section"
>
  <!-- Progressive loading with blur-up technique -->

  <!-- Layer 1: Solid background (instant) -->
  <div class="absolute inset-0 bg-charcoal-950" aria-hidden="true"></div>

  <!-- Layer 2: Blurred thumbnail placeholder (loads first, ~5KB) -->
  {#if thumbnailBackground}
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat blur-xl scale-110"
      style="background-image: url('{thumbnailBackground}');"
      aria-hidden="true"
    ></div>
  {/if}

  <!-- Layer 3: Mobile high-res image (up to 1024px) -->
  {#if mobileBackground}
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden transition-opacity duration-700"
      class:opacity-0={!mobileImageLoaded}
      class:opacity-100={mobileImageLoaded}
      style="background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('{mobileBackground}');"
      aria-hidden="true"
    >
      <img
        src={mobileBackground}
        alt=""
        class="hidden"
        onload={() => { mobileImageLoaded = true; }}
        onerror={() => { mobileImageLoaded = true; }}
      />
    </div>
  {/if}

  <!-- Layer 4: Desktop high-res image (1024px and up) -->
  {#if desktopBackground}
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat hidden md:block transition-opacity duration-700"
      class:opacity-0={!desktopImageLoaded}
      class:opacity-100={desktopImageLoaded}
      style="background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('{desktopBackground}');"
      aria-hidden="true"
    >
      <img
        src={desktopBackground}
        alt=""
        class="hidden"
        onload={() => { desktopImageLoaded = true; }}
        onerror={() => { desktopImageLoaded = true; }}
      />
    </div>
  {/if}

  <!-- Layer 5: Dark overlay for depth and text readability -->
  <div
    class="absolute inset-0 bg-gradient-to-b from-charcoal-950/20 via-transparent to-charcoal-950/30 pointer-events-none"
    aria-hidden="true"
  ></div>

  <!-- Main content container -->
  <Motion
    let:motion
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={MOTION.spring.gentle}
  >
    <div
      use:motion
      class="relative z-10 text-center px-4 sm:px-8 max-w-4xl mx-auto"
    >
      <!-- Main heading with premium typography -->
      <Typography
        variant="h1"
        class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white uppercase tracking-wide leading-tight mb-4"
        style="font-family: 'Montserrat', 'Helvetica Neue', sans-serif; letter-spacing: 0.1em; font-weight: 700;"
      >
        {title}
      </Typography>

      <!-- Subtitle with lighter styling -->
      <Typography
        variant="h2"
        class="text-base sm:text-lg md:text-xl lg:text-2xl font-light text-charcoal-200 uppercase tracking-widest mb-12"
        style="font-family: 'Montserrat', 'Helvetica Neue', sans-serif; letter-spacing: 0.15em; font-weight: 300;"
      >
        {subtitle}
      </Typography>

      <!-- Scroll indicator -->
      <Motion
        let:motion
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...MOTION.spring.gentle, delay: 1.2 }}
      >
        <div
          use:motion
          class="flex flex-col items-center gap-2 text-charcoal-400"
          aria-label="Scroll down for more content"
        >
          <span class="text-xs font-light uppercase tracking-widest">Explore</span>
          <div class="w-px h-8 bg-gradient-to-b from-charcoal-400 to-transparent"></div>
          <svg
            class="w-4 h-4 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </Motion>
    </div>
  </Motion>
</section>

<style>
  /* Custom font loading for premium feel */
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,700&display=swap');

  /* Parallax effect on desktop only */
  @media (min-width: 1024px) {
    section > div:first-of-type {
      background-attachment: fixed;
    }
  }
</style>
