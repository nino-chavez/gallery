# Micro-Interaction Library

**Version:** 1.0.0
**Last Updated:** 2025-10-27
**Status:** Active

---

## Purpose

This document defines subtle, elegant micro-interactions that enhance user experience without violating the photo-first design principle. All interactions are purposeful, performant, and respect `prefers-reduced-motion`.

---

## Core Principles

### 1. **Purposeful, Not Decorative**
Every animation must serve a function:
- Provide feedback (click, hover, focus)
- Guide attention (to new content, errors)
- Show relationships (parent-child, cause-effect)
- Reduce perceived latency (skeleton loaders)

### 2. **Subtle, Not Distracting**
Animations should feel natural:
- Duration: 150-300ms (quick, responsive)
- Easing: Ease-out (starts fast, ends slow)
- Scale: Subtle (1.02x max, not 1.5x)
- Opacity: Smooth (fade, not flash)

### 3. **Respectful of User Preferences**
All animations respect accessibility:
- `@media (prefers-reduced-motion: reduce)` disables animations
- Keyboard navigation works without animations
- Screen readers ignore animations

### 4. **Performant**
Animations use GPU-accelerated properties:
- ✅ `transform`, `opacity`, `filter`
- ❌ `width`, `height`, `top`, `left` (cause reflow)

---

## Interaction Patterns

### 1. Photo Card Hover

**Purpose:** Provide visual feedback that card is interactive

**Trigger:** Mouse hover or keyboard focus

**Animation:**
```css
/* Transform: lift + scale */
transform: translateY(-4px) scale(1.02);

/* Border: highlight */
border-color: rgba(212, 175, 55, 0.5);

/* Shadow: depth */
box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.3);

/* Duration & Easing */
transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
```

**Implementation:**
```svelte
<!-- PhotoCard.svelte -->
<a href={photoUrl} class="photo-card group">
  <OptimizedImage {src} {alt} />

  <!-- Metadata appears on hover -->
  <div class="opacity-0 group-hover:opacity-100 transition-opacity">
    <Typography variant="caption">{photo.title}</Typography>
  </div>
</a>

<style>
  .photo-card:hover {
    transform: translateY(-4px) scale(1.02);
    border-color: rgba(212, 175, 55, 0.5);
  }
</style>
```

---

### 2. Button Click Feedback

**Purpose:** Confirm user action with tactile feedback

**Trigger:** Mouse down or touch

**Animation:**
```typescript
// Using svelte-motion
whileTap={{ scale: 0.97 }}
```

**Implementation:**
```svelte
<script lang="ts">
  import { Motion } from 'svelte-motion';
</script>

<Motion whileTap={{ scale: 0.97 }}>
  <button class="px-4 py-2 bg-gold-500 rounded-lg">
    Click Me
  </button>
</Motion>
```

---

### 3. Photo Load Animation

**Purpose:** Smooth entrance, reduce perceived latency

**Trigger:** Photo enters viewport (Intersection Observer)

**Animation:**
```typescript
// Fade-in + subtle scale
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.3, ease: 'easeOut' }}
```

**Implementation:**
```svelte
<script lang="ts">
  import { Motion } from 'svelte-motion';
  import { MOTION } from '$lib/motion-tokens';
</script>

<Motion
  let:motion
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={MOTION.spring.gentle}
>
  <div use:motion>
    <PhotoCard {photo} />
  </div>
</Motion>
```

---

### 4. Toast Notification Slide-In

**Purpose:** Alert user to action completion without blocking content

**Trigger:** User action (favorite added, download started)

**Animation:**
```typescript
// Slide in from bottom-right
initial={{ opacity: 0, y: 20, x: 20 }}
animate={{ opacity: 1, y: 0, x: 0 }}
exit={{ opacity: 0, y: 20, x: 20 }}
transition={{ duration: 0.2, ease: 'easeOut' }}
```

**Implementation:**
```svelte
<!-- See Toast.svelte for full implementation -->
<Toast variant="success" duration={3000}>
  ❤️ Added to Favorites (12 total)
</Toast>
```

---

### 5. Filter Pill Shake (Error)

**Purpose:** Indicate invalid action without modal/alert

**Trigger:** User applies incompatible filters

**Animation:**
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

.shake {
  animation: shake 200ms ease-in-out;
}
```

**Implementation:**
```svelte
<script lang="ts">
  let isShaking = $state(false);

  function handleInvalidFilter() {
    isShaking = true;
    setTimeout(() => isShaking = false, 200);
  }
</script>

<button
  class="filter-pill {isShaking ? 'shake' : ''}"
  onclick={applyFilter}
>
  Sport
</button>
```

---

### 6. Dropdown Menu Slide-Down

**Purpose:** Smooth reveal of additional content

**Trigger:** Click filter pill, expand menu

**Animation:**
```svelte
<script lang="ts">
  import { slide } from 'svelte/transition';
</script>

{#if isExpanded}
  <div transition:slide={{ duration: 200 }}>
    <!-- Dropdown content -->
  </div>
{/if}
```

---

### 7. Focus Ring Animation

**Purpose:** Clear keyboard navigation indicator (WCAG 2.4.7)

**Trigger:** Tab key navigation

**Animation:**
```css
/* Instant appearance (no transition) */
.button:focus-visible {
  outline: none;
  ring: 2px solid rgba(212, 175, 55, 1);
  ring-offset: 2px;
  transition: none; /* Instant, no fade */
}
```

**Rationale:** Focus indicators should appear instantly for accessibility

---

### 8. Skeleton Loader Pulse

**Purpose:** Show loading state, reduce perceived latency

**Trigger:** Page load, infinite scroll

**Animation:**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.skeleton {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

**Implementation:**
```svelte
<div class="animate-pulse space-y-4">
  <div class="h-48 bg-charcoal-800 rounded-lg"></div>
  <div class="h-4 bg-charcoal-800 rounded w-3/4"></div>
  <div class="h-3 bg-charcoal-800 rounded w-1/2"></div>
</div>
```

---

### 9. Lightbox Fade & Scale

**Purpose:** Smooth transition to fullscreen photo view

**Trigger:** Click photo card

**Animation:**
```typescript
// Background overlay fade-in
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}

// Photo scale-up from card position
initial={{ scale: 0.8, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
transition={{ duration: 0.3 }}
```

**Implementation:**
```svelte
<!-- See Lightbox.svelte for full implementation -->
{#if isOpen}
  <Motion
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div class="lightbox-overlay">
      <Motion
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <img src={photo.image_url} alt={photo.title} />
      </Motion>
    </div>
  </Motion>
{/if}
```

---

### 10. Metadata Reveal on Hover

**Purpose:** Progressive disclosure of photo details

**Trigger:** Hover on photo card

**Animation:**
```css
/* Title overlay slides up from bottom */
.title-overlay {
  transform: translateY(100%);
  opacity: 0;
  transition: all 200ms ease-out;
}

.photo-card:hover .title-overlay {
  transform: translateY(0);
  opacity: 1;
}
```

**Implementation:**
```svelte
<div class="photo-card group">
  <img src={photo.thumbnail_url} alt={photo.title} />

  <!-- Slides up on hover -->
  <div class="title-overlay opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-all">
    <Typography variant="caption">{photo.title}</Typography>
  </div>
</div>
```

---

## Accessibility Guidelines

### Reduced Motion Support

All animations must respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Implementation in svelte-motion:**
```svelte
<Motion
  transition={{
    ...MOTION.spring.gentle,
    // Automatically respects prefers-reduced-motion
  }}
>
```

---

### Keyboard Navigation

Interactions must work without animations:

```svelte
<!-- Good: Works with keyboard, animations are optional enhancement -->
<button
  class="button"
  onclick={handleClick}
  onkeypress={handleKeyPress}
>
  Click Me
</button>

<!-- Bad: Relies on hover animation for functionality -->
<div
  class="hover-only"
  onmouseenter={reveal}
  <!-- No keyboard alternative -->
>
```

---

### Screen Readers

Animations should be invisible to screen readers:

```svelte
<!-- Good: aria-label describes final state -->
<Motion animate={{ opacity: 1 }}>
  <div aria-label="Photo gallery loaded">
    <PhotoGrid {photos} />
  </div>
</Motion>

<!-- Bad: aria-label describes animation -->
<div aria-label="Photos are fading in">
```

---

## Performance Guidelines

### GPU-Accelerated Properties

✅ **Use these (fast):**
- `transform` (translate, scale, rotate)
- `opacity`
- `filter` (blur, brightness, etc.)

❌ **Avoid these (slow):**
- `width`, `height` (causes reflow)
- `top`, `left` (causes reflow)
- `margin`, `padding` (causes reflow)

### Will-Change Hint

For animations that happen frequently:

```css
.photo-card {
  will-change: transform, opacity;
}

/* Remove will-change after animation completes */
.photo-card:not(:hover) {
  will-change: auto;
}
```

**Warning:** Don't overuse `will-change`—it uses memory.

---

### Debouncing & Throttling

For interactions that trigger expensive operations:

```typescript
import { debounce } from '$lib/utils';

// Debounce search input (300ms)
const handleSearch = debounce((query: string) => {
  searchPhotos(query);
}, 300);

// Throttle scroll events (100ms)
const handleScroll = throttle(() => {
  loadMorePhotos();
}, 100);
```

---

## Testing Checklist

For every new micro-interaction, verify:

- [ ] **Purposeful:** Serves a clear function (not decoration)
- [ ] **Subtle:** Feels natural, not distracting
- [ ] **Fast:** Duration ≤300ms
- [ ] **Accessible:** Works with keyboard, screen readers
- [ ] **Reduced Motion:** Respects `prefers-reduced-motion`
- [ ] **Performant:** Uses GPU-accelerated properties
- [ ] **Browser Support:** Works in Safari, Chrome, Firefox
- [ ] **Mobile:** Works on touch devices (no hover-only)

---

## Anti-Patterns to Avoid

### ❌ Infinite Animations on Photos

**Bad:**
```css
.photo-card {
  animation: shimmer 2s infinite; /* Competes with photos */
}
```

**Good:**
```css
.photo-card:hover {
  transform: translateY(-4px); /* Subtle, on-demand */
}
```

---

### ❌ Slow Animations

**Bad:**
```typescript
transition={{ duration: 1.5 }} // Too slow, feels laggy
```

**Good:**
```typescript
transition={{ duration: 0.2 }} // Fast, responsive
```

---

### ❌ Layout Shift Animations

**Bad:**
```css
.card:hover {
  width: 400px; /* Causes reflow, shifts layout */
}
```

**Good:**
```css
.card:hover {
  transform: scale(1.02); /* No reflow, smooth */
}
```

---

## Version History

### v1.0.0 (2025-10-27)
- Initial micro-interaction library
- Defined 10 core interaction patterns
- Established accessibility and performance guidelines

---

## Related Documentation

- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Full design system
- [design-principles.md](./design-principles.md) - Design principles
- [motion-tokens.ts](../src/lib/motion-tokens.ts) - Motion token presets

---

**Remember:** Micro-interactions enhance UX, but photos remain the hero. Every animation must justify its existence.
