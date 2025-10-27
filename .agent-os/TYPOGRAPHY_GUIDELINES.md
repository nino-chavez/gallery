# Typography Guidelines

**Version:** 2.0.0 (Phase 2: Extended Display Scale)
**Last Updated:** 2025-10-26
**Status:** Active

---

## Overview

This document defines the complete typography system for the Nino Chavez Gallery, including the **core gallery scale** (chrome budget protected) and the **extended display scale** (for marketing/content pages).

---

## Two-Tier Typography System

### Tier 1: Core Gallery Scale (Chrome Budget Protected)

**Usage:** Gallery pages (Explore, Albums, Collections, Photo Detail)
**Constraint:** Must maintain ≤40% chrome ratio
**Max Size:** `text-2xl` (24px)

| Class | Size | Usage | Chrome Impact |
|-------|------|-------|---------------|
| `text-xs` | 12px | Metadata, counts, utility labels | Minimal |
| `text-sm` | 14px | Body text, captions | Minimal |
| `text-base` | 16px | Primary content | Low |
| `text-lg` | 18px | Subheadings | Low |
| `text-xl` | 20px | Page titles | Medium |
| `text-2xl` | 24px | Display emphasis | Medium |

**Design Philosophy:**
> "Data is small, content is large. Typography reflects information hierarchy, not importance."

---

### Tier 2: Extended Display Scale (Marketing/Content Pages)

**Usage:** About, Contact, Landing pages, Marketing materials
**Constraint:** Content-first still applies, but chrome budget is more flexible
**Max Size:** `text-8xl` (96px) — use sparingly!

| Class | Size | Usage | When to Use |
|-------|------|-------|-------------|
| `text-3xl` | 30px | Large page titles | About page main heading |
| `text-4xl` | 36px | Hero section titles | Contact page hero |
| `text-5xl` | 48px | Landing headlines | Homepage hero text |
| `text-6xl` | 60px | Marketing hero | Campaign landing pages |
| `text-7xl` | 72px | Extra large display | Special announcements |
| `text-8xl` | 96px | Massive hero text | Marketing splash pages |

**Design Philosophy:**
> "Extended scale is for storytelling and conversion. Gallery pages prioritize photos; marketing pages prioritize messaging."

---

## Usage Rules by Page Type

### ✅ Gallery Pages (RESTRICTED SCALE)

**Pages:** `/explore`, `/albums`, `/albums/[key]`, `/collections`, `/photo/[id]`

**Typography Restrictions:**
```typescript
// ✅ ALLOWED
<h1 class="text-xl lg:text-2xl">Gallery</h1>
<p class="text-sm text-charcoal-400">1,234 photos</p>

// ❌ FORBIDDEN
<h1 class="text-5xl">Explore Gallery</h1> // Violates chrome budget!
```

**Why?**
- Chrome budget must stay ≤40%
- Photos are the product — large text competes with content
- Metadata should be de-emphasized (`text-xs`)

---

### ✅ Marketing Pages (EXTENDED SCALE ALLOWED)

**Pages:** `/`, `/about`, `/contact`, `/style-guide`, landing pages

**Typography Freedom:**
```typescript
// ✅ ENCOURAGED
<h1 class="text-5xl lg:text-6xl font-bold">
  Capturing Athletic Moments
</h1>

<p class="text-xl lg:text-2xl text-charcoal-300">
  AI-powered sports photography gallery
</p>

// ⚠️ USE SPARINGLY
<h1 class="text-8xl">EPIC</h1> // Reserved for special emphasis
```

**Why?**
- These pages are about messaging, not gallery browsing
- Chrome budget can be higher (up to 60% acceptable)
- Larger typography aids conversion and engagement

---

## Responsive Typography Patterns

### Pattern 1: Mobile-First Scaling

**Use Case:** Hero headings that need to scale dramatically

```html
<h1 class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold">
  Your Athletic Story
</h1>
```

**Breakpoint Strategy:**
- Mobile (`< 640px`): Start conservative (text-4xl)
- Tablet (`640px+`): Increase moderately (text-5xl)
- Desktop (`1024px+`): Full scale (text-6xl)
- Large Desktop (`1280px+`): Maximum impact (text-7xl)

---

### Pattern 2: Proportional Hierarchy

**Use Case:** Maintaining visual hierarchy across breakpoints

```html
<!-- Hero Section -->
<h1 class="text-4xl lg:text-6xl">Main Headline</h1>
<h2 class="text-2xl lg:text-4xl">Supporting Headline</h2>
<p class="text-base lg:text-xl">Body text</p>
```

**Ratio:** Maintain ~2:1 ratio between heading levels

---

### Pattern 3: Content-Aware Scaling

**Use Case:** Gallery pages where content density matters

```html
<!-- Explore Page (Content-First) -->
<h1 class="text-xl">Gallery</h1>
<span class="text-xs text-charcoal-400">1,234</span>

<!-- About Page (Message-First) -->
<h1 class="text-4xl lg:text-5xl">About Nino Chavez</h1>
<p class="text-lg lg:text-xl">Professional volleyball photographer</p>
```

---

## Typography + Chrome Budget

### Chrome Budget Calculator

```typescript
function calculateChromeWithTypography(
  headerHeight: number,
  typographySize: 'core' | 'display'
): { ratio: number; pass: boolean } {
  const viewport = 1080; // Standard desktop height

  // Core scale: minimal chrome impact
  if (typographySize === 'core') {
    const chromeHeight = headerHeight; // Compact headers
    const ratio = chromeHeight / viewport;
    return { ratio, pass: ratio <= 0.40 };
  }

  // Display scale: higher chrome acceptable
  if (typographySize === 'display') {
    const chromeHeight = headerHeight; // Larger headers OK
    const ratio = chromeHeight / viewport;
    return { ratio, pass: ratio <= 0.60 }; // More lenient
  }
}
```

### Examples

**Gallery Page (Core Scale):**
```
Header: 80px (text-xl title + text-xs metadata)
Viewport: 1080px
Chrome Ratio: 7.4% ✅ PASS (well under 40%)
```

**About Page (Display Scale):**
```
Hero: 300px (text-6xl headline + text-xl subhead + spacing)
Viewport: 1080px
Chrome Ratio: 27.8% ✅ PASS (under 60% for marketing)
```

---

## Font Pairing & Hierarchy

### Inter Variable (System Font)

**Why Inter?**
- Designed for screen readability
- Variable font (efficient loading)
- Excellent at small sizes (data/metadata)
- Professional, neutral aesthetic

**Weight Usage:**
```css
.font-normal { font-weight: 400; }  /* Body text */
.font-medium { font-weight: 500; }  /* Emphasis */
.font-semibold { font-weight: 600; } /* Subheadings */
.font-bold { font-weight: 700; }     /* Headings */
```

---

## Accessibility Considerations

### Minimum Sizes

```typescript
const accessibilitySizes = {
  minimum: 'text-sm',    // 14px - WCAG minimum for body text
  preferred: 'text-base', // 16px - Recommended default
  metadata: 'text-xs'     // 12px - OK for non-essential metadata only
};
```

**WCAG 1.4.4 Compliance:**
- User can zoom to 200% without loss of functionality ✅
- Text reflows without horizontal scrolling ✅

### Contrast Requirements

All typography must meet WCAG AA contrast:
- Normal text: 4.5:1 minimum
- Large text (≥18px): 3:1 minimum

```css
/* ✅ PASS: White on charcoal-950 */
color: #f8f8f9; /* White */
background: #18181b; /* Charcoal-950 */
/* Contrast: 16.5:1 */

/* ✅ PASS: Charcoal-400 on charcoal-950 */
color: #9fa2ab; /* Charcoal-400 */
background: #18181b; /* Charcoal-950 */
/* Contrast: 7.2:1 */
```

---

## Anti-Patterns

### ❌ Anti-Pattern 1: Display Typography on Gallery Pages

**Bad:**
```html
<!-- ❌ Explore page with huge heading -->
<h1 class="text-6xl font-bold">Explore Gallery</h1>
<p class="text-2xl">Browse 1,234 photos</p>
```

**Why it fails:**
- Consumes 200px+ of vertical space
- Pushes photos below fold
- Violates chrome budget (>40%)

**Good:**
```html
<!-- ✅ Compact heading, photos visible -->
<h1 class="text-xl">Gallery <span class="text-xs text-charcoal-400">1,234</span></h1>
```

---

### ❌ Anti-Pattern 2: Inconsistent Hierarchy

**Bad:**
```html
<h1 class="text-5xl">Main Heading</h1>
<h2 class="text-3xl">Subheading</h2>  <!-- Too small jump -->
<h3 class="text-6xl">Section Title</h3> <!-- Bigger than h1! -->
```

**Good:**
```html
<h1 class="text-6xl">Main Heading</h1>
<h2 class="text-4xl">Subheading</h2>  <!-- Clear hierarchy -->
<h3 class="text-2xl">Section Title</h3>
```

---

### ❌ Anti-Pattern 3: Over-Emphasis

**Bad:**
```html
<!-- ❌ Everything is HUGE -->
<h1 class="text-8xl">Welcome</h1>
<p class="text-5xl">Check out our gallery!</p>
<button class="text-4xl">Click Here</button>
```

**Why it fails:**
- No hierarchy (everything competes)
- Poor readability
- Looks amateurish

**Good:**
```html
<!-- ✅ Clear hierarchy -->
<h1 class="text-6xl">Welcome</h1>
<p class="text-xl text-charcoal-300">Check out our gallery</p>
<button class="text-base font-medium">Explore Photos</button>
```

---

## Implementation Checklist

### For Gallery Pages

- [ ] Use only `text-xs` through `text-2xl`
- [ ] Page title is `text-xl` max
- [ ] Metadata/counts are `text-xs`
- [ ] Chrome ratio ≤40%
- [ ] Photos visible above fold

### For Marketing Pages

- [ ] Hero uses `text-4xl` through `text-6xl`
- [ ] Body text is `text-base` or `text-lg`
- [ ] Hierarchy is clear (2:1 ratio between levels)
- [ ] Responsive scaling implemented
- [ ] Chrome ratio ≤60% (acceptable for marketing)

---

## Quick Reference

### Core Scale (Gallery)
```
xs(12) → sm(14) → base(16) → lg(18) → xl(20) → 2xl(24)
```

### Display Scale (Marketing)
```
3xl(30) → 4xl(36) → 5xl(48) → 6xl(60) → 7xl(72) → 8xl(96)
```

### Common Patterns
```html
<!-- Gallery Header -->
<h1 class="text-xl">Title <span class="text-xs">Count</span></h1>

<!-- Marketing Hero -->
<h1 class="text-5xl lg:text-6xl">Headline</h1>
<p class="text-xl lg:text-2xl">Subheadline</p>

<!-- Content Page -->
<h1 class="text-4xl lg:text-5xl">About</h1>
<p class="text-lg">Body paragraph</p>
```

---

## Version History

### v2.0.0 (2025-10-26) - Phase 2
- Added extended display scale (text-3xl through text-8xl)
- Defined two-tier system (core vs display)
- Created usage rules by page type
- Added chrome budget exceptions
- Documented responsive patterns

### v1.0.0 (2025-10-26) - Phase 1
- Initial core scale (text-xs through text-2xl)
- Established chrome budget constraints
- Defined typography as data visualization principle

---

## Related Documentation

- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Full design system
- [design-principles.md](./design-principles.md) - Core principles
- [component-patterns.md](./component-patterns.md) - Component usage

---

**Remember:** Typography is a tool for hierarchy, not decoration. Use the smallest size that achieves clarity. When in doubt, go smaller on gallery pages, larger on marketing pages.
