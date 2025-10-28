# Event Handling Conventions

**Version:** 1.0.0
**Last Updated:** 2025-10-27
**Applies To:** Svelte 5 components

## Overview

This document defines standardized patterns for handling DOM events in Svelte 5 components, with specific focus on event propagation in nested interactive elements.

## The Problem

In Svelte 5, event handling has changed from Svelte 4. The two most common issues are:

1. **Event Bubbling**: Clicks on nested interactive elements propagate to parent handlers
2. **Default Behavior**: Anchor tags navigate even when you want custom handling

## Core Principles

### 1. Always Type Event Parameters

```typescript
// ✅ GOOD - Explicit typing
function handleClick(event: MouseEvent) {
    // ...
}

// ✅ GOOD - Optional when passed from template
function handleDownload(url: string, filename: string, event?: MouseEvent) {
    event?.stopPropagation();
}

// ❌ BAD - No typing
function handleClick(event) {
    // ...
}
```

### 2. Know When to Stop Propagation

Use `event.stopPropagation()` when:

- Component is inside a clickable container (button in anchor, button in card)
- Component is inside a modal/overlay with backdrop click-to-close
- Component is inside a list item with row-level click handlers
- You want to prevent parent handlers from firing

### 3. Know When to Prevent Default

Use `event.preventDefault()` when:

- Preventing anchor tag navigation (`<a href="...">`)
- Preventing form submission
- Overriding native keyboard shortcuts
- Stopping browser context menus

## Standard Patterns

### Pattern 1: Nested Interactive Element

**Use Case:** Button or clickable element inside another clickable container

```typescript
// Example: FavoriteButton inside PhotoCard
function handleClick(event: MouseEvent) {
    event.preventDefault();      // Prevent anchor navigation
    event.stopPropagation();     // Stop bubbling to PhotoCard

    favorites.toggleFavorite(photo);
}
```

**Template:**
```svelte
<button onclick={handleClick}>
    <!-- Content -->
</button>
```

### Pattern 2: Interactive Element in Modal/Overlay

**Use Case:** Button inside lightbox or modal with backdrop-click-to-close

```typescript
// Example: DownloadButton in Lightbox
function toggleMenu(event: MouseEvent) {
    event.stopPropagation();     // Prevent lightbox from closing
    showMenu = !showMenu;
}

function handleDownload(url: string, filename: string, event?: MouseEvent) {
    event?.stopPropagation();    // Prevent lightbox from closing
    // Download logic...
}
```

**Template:**
```svelte
<!-- Main button -->
<button onclick={toggleMenu}>Download</button>

<!-- Menu items -->
{#each options as option}
    <button onclick={(e) => handleDownload(option.url, option.filename, e)}>
        {option.label}
    </button>
{/each}
```

### Pattern 3: Dual-Mode Navigation (Link + onClick)

**Use Case:** Component that can navigate OR trigger custom handler

```typescript
interface Props {
    photo: Photo;
    onclick?: (photo: Photo) => void;  // Custom handler (e.g., lightbox)
}

function handleClick(event: MouseEvent) {
    if (onclick) {
        event.preventDefault();      // Don't navigate
        event.stopPropagation();     // Don't bubble
        onclick(photo);              // Use custom handler
    }
    // Otherwise, let href navigate naturally
}
```

**Template:**
```svelte
<a href={photoUrl} onclick={handleClick}>
    <!-- Content -->
</a>
```

### Pattern 4: Click Outside Handler

**Use Case:** Close dropdown/menu when clicking outside

```typescript
function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-container')) {
        showMenu = false;
    }
}
```

**Template:**
```svelte
<svelte:window onclick={handleClickOutside} />

<div class="menu-container">
    <!-- Menu content -->
</div>
```

### Pattern 5: Keyboard + Mouse Handler

**Use Case:** Make clickable div accessible

```typescript
function handleClick(event: MouseEvent) {
    event.stopPropagation();
    callback?.(data);
}

function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();  // Prevent scroll on Space
        callback?.(data);
    }
}
```

**Template:**
```svelte
<div
    role="button"
    tabindex="0"
    onclick={handleClick}
    onkeydown={handleKeyDown}
    aria-label="Descriptive label"
>
    <!-- Content -->
</div>
```

## Decision Tree

```
Does your component have nested interactive elements?
├─ YES
│  ├─ Is parent a link (<a href>)?
│  │  ├─ YES → Use preventDefault() + stopPropagation()
│  │  └─ NO → Use stopPropagation() only
│  └─ Is parent a modal/overlay?
│     └─ YES → Use stopPropagation() only
└─ NO
   └─ Is it inside a modal/overlay?
      ├─ YES → Use stopPropagation()
      └─ NO → No special handling needed
```

## Common Scenarios

### Scenario 1: Card with Multiple Clickable Areas

```svelte
<script lang="ts">
    function handleCardClick() {
        // Navigate to detail page
    }

    function handleFavoriteClick(event: MouseEvent) {
        event.stopPropagation();  // Don't trigger card click
        toggleFavorite();
    }

    function handleShareClick(event: MouseEvent) {
        event.stopPropagation();  // Don't trigger card click
        openShareMenu();
    }
</script>

<div class="card" onclick={handleCardClick}>
    <img src={photo.url} alt={photo.title} />

    <button onclick={handleFavoriteClick}>
        Favorite
    </button>

    <button onclick={handleShareClick}>
        Share
    </button>
</div>
```

### Scenario 2: Lightbox with Controls

```svelte
<script lang="ts">
    function handleBackdropClick(event: MouseEvent) {
        // Only close if clicking backdrop itself
        if (event.target === event.currentTarget) {
            close();
        }
    }

    function handleDownload(event: MouseEvent) {
        event.stopPropagation();  // Don't close lightbox
        downloadPhoto();
    }

    function handleZoom(event: MouseEvent) {
        event.stopPropagation();  // Don't close lightbox
        toggleZoom();
    }
</script>

<div class="backdrop" onclick={handleBackdropClick}>
    <div class="lightbox-content">
        <img src={photo.url} alt={photo.title} />

        <button onclick={handleDownload}>Download</button>
        <button onclick={handleZoom}>Zoom</button>
        <button onclick={() => close()}>Close</button>
    </div>
</div>
```

## Testing Checklist

When implementing event handlers, verify:

- [ ] Clicking the main element works as expected
- [ ] Clicking nested buttons/links works independently
- [ ] Parent handlers don't fire when child is clicked
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Click outside closes menus/modals (if applicable)
- [ ] No console errors about unhandled events
- [ ] Works on touch devices (test with touch events)

## Migration Guide

### From Svelte 4 to Svelte 5

**Svelte 4:**
```svelte
<button on:click={handleClick}>Click me</button>
```

**Svelte 5:**
```svelte
<button onclick={handleClick}>Click me</button>
```

**Key Changes:**
- `on:click` → `onclick` (lowercase, no colon)
- Event modifiers removed (use explicit code instead)
- No more `|stopPropagation|preventDefault` modifiers

## Anti-Patterns

### ❌ Using string event names
```svelte
<!-- BAD -->
<button on:click={handleClick}>Click</button>
```

### ❌ Not typing event parameters
```typescript
// BAD
function handleClick(e) {
    e.stopPropagation();
}
```

### ❌ Overusing stopPropagation everywhere
```typescript
// BAD - Only use when actually needed
function handleClick(event: MouseEvent) {
    event.stopPropagation();  // Why? Is this needed?
    doSomething();
}
```

### ❌ Forgetting preventDefault on Space key
```typescript
// BAD - Space will scroll the page
function handleKeyDown(event: KeyboardEvent) {
    if (event.key === ' ') {
        doSomething();  // Missing preventDefault()
    }
}
```

## References

- [MDN: Event.stopPropagation()](https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation)
- [MDN: Event.preventDefault()](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)
- [Svelte 5 Event Handlers](https://svelte-5-preview.vercel.app/docs/event-handlers)
- [WCAG 2.1: Keyboard Accessible](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html)

## Version History

- **1.0.0** (2025-10-27): Initial documentation based on PhotoCard/DownloadButton fixes
