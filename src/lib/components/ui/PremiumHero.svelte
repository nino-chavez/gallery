<!--
  PremiumHero - Full-screen hero section with dark overlay and centered typography

  Features:
  - Full viewport height with background image
  - Dark semi-transparent overlay for moody feel
  - Perfectly centered content with premium typography
  - Responsive design with mobile optimizations
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

  // Generate optimized background image URL
  function getOptimizedBackgroundUrl(imageUrl: string): string {
    if (!imageUrl) return '';

    // If URL contains Supabase storage, add transform parameters for hero quality
    if (imageUrl.includes('supabase')) {
      const url = new URL(imageUrl);
      url.searchParams.set('width', '1920');
      url.searchParams.set('height', '1080');
      url.searchParams.set('quality', '95');
      url.searchParams.set('format', 'webp');
      return url.toString();
    }

    return imageUrl;
  }

  let optimizedBackground = $derived(getOptimizedBackgroundUrl(backgroundImage));
</script>

<section
  class={cn(
    "relative h-screen w-full flex items-center justify-center overflow-hidden",
    className
  )}
  style="background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('{optimizedBackground}'); background-size: cover; background-position: center; background-repeat: no-repeat;"
  role="banner"
  aria-label="Hero section"
>
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

  /* Ensure smooth background loading */
  section {
    background-attachment: fixed;
  }

  @media (max-width: 768px) {
    section {
      background-attachment: scroll;
    }
  }
</style>