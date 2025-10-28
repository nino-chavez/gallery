<!--
  FilterPill Component - Reusable filter pill for Intelligent Filter System

  Phase 2 of Intelligent Filter System (27-40h total)

  Features:
  - Three states: active, available, disabled (transparency principle)
  - Count badge showing result numbers (before selection)
  - Tooltip support for descriptions
  - Design system integration (FILTER_STATES)
  - Full accessibility (ARIA, keyboard, screen readers)
  - Responsive (mobile, tablet, desktop)

  Usage:
  <FilterPill
    label="Volleyball"
    count={1234}
    state="available"
    description="Volleyball action photos"
    onclick={handleClick}
  />
-->

<script lang="ts">
  import { Motion } from 'svelte-motion';
  import { MOTION } from '$lib/motion-tokens';

  type FilterPillState = 'active' | 'available' | 'disabled';

  interface Props {
    label: string;
    count?: number;
    state?: FilterPillState;
    description?: string;
    icon?: any; // Lucide icon component
    onclick?: (event: MouseEvent) => void;
    size?: 'sm' | 'md' | 'lg';
  }

  let {
    label,
    count,
    state = 'available',
    description,
    icon,
    onclick,
    size = 'md'
  }: Props = $props();

  // Design system integration (from INTELLIGENT_FILTERS_PLAN.md)
  const stateStyles = {
    available: {
      bg: 'bg-charcoal-800/50',
      hover: 'hover:bg-charcoal-800',
      text: 'text-charcoal-300 hover:text-charcoal-100',
      badge: 'text-charcoal-400',
      cursor: 'cursor-pointer'
    },
    active: {
      bg: 'bg-gold-500',
      hover: '',
      text: 'text-charcoal-950',
      badge: 'text-charcoal-950/70',
      cursor: 'cursor-pointer'
    },
    disabled: {
      bg: 'bg-charcoal-900/30',
      hover: '',
      text: 'text-charcoal-600',
      badge: 'text-charcoal-700',
      cursor: 'cursor-not-allowed'
    }
  };

  const sizeStyles = {
    sm: {
      padding: 'px-2.5 py-1',
      text: 'text-xs',
      icon: 'w-3 h-3',
      badge: 'text-[10px] ml-1'
    },
    md: {
      padding: 'px-3 py-1.5',
      text: 'text-sm',
      icon: 'w-3.5 h-3.5',
      badge: 'text-xs ml-1.5'
    },
    lg: {
      padding: 'px-4 py-2',
      text: 'text-base',
      icon: 'w-4 h-4',
      badge: 'text-sm ml-2'
    }
  };

  const styles = $derived(stateStyles[state]);
  const sizes = $derived(sizeStyles[size]);

  function handleClick(event: MouseEvent): void {
    // Stop propagation to prevent closing dropdowns (coding standards)
    event.stopPropagation();

    // Don't trigger onclick if disabled
    if (state === 'disabled') {
      return;
    }

    onclick?.(event);
  }
</script>

<Motion
  let:motion
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={MOTION.spring.gentle}
>
  <button
    use:motion
    onclick={handleClick}
    class="
      group inline-flex items-center gap-1.5 rounded-full font-medium
      transition-all duration-200
      {sizes.padding}
      {sizes.text}
      {styles.bg}
      {styles.hover}
      {styles.text}
      {styles.cursor}
      {state === 'active' ? 'shadow-md' : ''}
      {state === 'disabled' ? 'opacity-40' : ''}
    "
    aria-pressed={state === 'active'}
    aria-disabled={state === 'disabled'}
    disabled={state === 'disabled'}
    title={description || ''}
  >
      <!-- Optional icon -->
      {#if icon}
        <svelte:component
          this={icon}
          class="
            {sizes.icon}
            {state === 'active' ? 'text-charcoal-950' : 'text-charcoal-400 group-hover:text-charcoal-200'}
            {state === 'disabled' ? 'text-charcoal-700' : ''}
            transition-colors duration-200
          "
        />
      {/if}

      <!-- Label -->
      <span class="font-medium">{label}</span>

      <!-- Count badge (transparency principle: show before selection) -->
      {#if count !== undefined}
        <span class="
          {sizes.badge}
          {styles.badge}
          font-normal opacity-70
        ">
          ({count.toLocaleString()})
        </span>
      {/if}
  </button>
</Motion>

<style>
  /* Disabled state styling (ensure no pointer events) */
  button:disabled {
    pointer-events: none;
  }

  /* Focus visible for keyboard navigation */
  button:focus-visible {
    outline: 2px solid theme('colors.gold.500');
    outline-offset: 2px;
  }
</style>
