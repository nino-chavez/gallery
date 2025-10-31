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
  function getOptimizedBackgroundUrl(imageUrl: string, size: 'mobile' | 'desktop'): string {
    if (!imageUrl) return '';

    // SmugMug image optimization using size suffixes
    // Available sizes: -Th (thumbnail), -S (400px), -M (600px), -L (800px),
    //                  -XL (1024px), -X2 (1600px), -X3 (2048px), -O (original)
    if (imageUrl.includes('smugmug.com')) {
      // Remove existing size suffix if present
      const baseUrl = imageUrl.replace(/-[A-Z]\d?\./, '.');

      // Mobile: Use X2Large (1600px) - optimal for phones/tablets in portrait
      // Desktop: Use X3Large (2048px) - optimal for desktop/large screens
      const suffix = size === 'mobile' ? '-X2' : '-X3';
      return baseUrl.replace(/(\.[^.]+)$/, `${suffix}$1`);
    }

    // Supabase storage optimization
    if (imageUrl.includes('supabase')) {
      const url = new URL(imageUrl);
      url.searchParams.set('width', size === 'mobile' ? '1200' : '1920');
      url.searchParams.set('quality', size === 'mobile' ? '85' : '90');
      url.searchParams.set('format', 'webp');
      return url.toString();
    }

    // Fallback: return original URL
    return imageUrl;
  }

  // Generate responsive URLs
  let mobileBackground = $derived(getOptimizedBackgroundUrl(backgroundImage, 'mobile'));
  let desktopBackground = $derived(getOptimizedBackgroundUrl(backgroundImage, 'desktop'));
</script>

<section
  class={cn(
    "relative h-screen w-full flex items-center justify-center overflow-hidden",
    className
  )}
  role="banner"
  aria-label="Hero section"
>
  <!-- Responsive background images -->
  <!-- Mobile background (up to 1024px) -->
  <div
    class="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden"
    style="background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('{mobileBackground}');"
    aria-hidden="true"
  ></div>

  <!-- Desktop background (1024px and up) -->
  <div
    class="absolute inset-0 bg-cover bg-center bg-no-repeat hidden md:block"
    style="background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('{desktopBackground}');"
    aria-hidden="true"
  ></div>

  <!-- Dark overlay for depth and text readability -->
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
      class="relative z-10 text-center px-6 sm:px-8 max-w-4xl mx-auto"
    >
      <!-- Main heading with premium typography -->
      <Typography
        variant="h1"
        class="text-5xl sm:text-6xl lg:text-7xl font-bold text-white uppercase tracking-wider leading-none mb-4"
        style="font-family: 'Montserrat', 'Helvetica Neue', sans-serif; letter-spacing: 3px; font-weight: 700;"
      >
        {title}
      </Typography>

      <!-- Subtitle with lighter styling -->
      <Typography
        variant="h2"
        class="text-lg sm:text-xl lg:text-2xl font-light text-charcoal-200 uppercase tracking-widest mb-12"
        style="font-family: 'Montserrat', 'Helvetica Neue', sans-serif; letter-spacing: 2px; font-weight: 300;"
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
