# Page Type Taxonomy

**Version:** 1.0.0
**Last Updated:** 2025-10-27
**Status:** Active

---

## Purpose

This document classifies all pages in the gallery application into tiers with specific design constraints. This provides clarity on when to apply strict chrome budget rules versus when creative freedom is appropriate.

---

## Page Type Classification

### **Tier 1: Gallery Pages (Strict Rules)**

**Pages:**
- `/explore` - Main gallery browser
- `/albums` - Album listing
- `/albums/[albumKey]` - Individual album view
- `/timeline` - Chronological photo timeline
- `/photo/[id]` - Individual photo detail view
- `/favorites` - User's favorited photos

**Chrome Budget:** ≤40%

**Typography:** `text-xl` max (Phase 1: Core Scale)

**Principle:** Photos are the product; UI is infrastructure

**Rationale:**
These pages exist to deliver photos to users. Every pixel of chrome must justify its existence. Users come here to browse, discover, and view photography—not to read marketing copy or navigate complex UI.

**Examples:**
```svelte
<!-- ✅ GOOD: Minimal header, photos above fold -->
<header class="py-3">
  <h1 class="text-xl">Gallery <span class="text-xs text-charcoal-400">1,234</span></h1>
</header>

<!-- ❌ BAD: Large header pushes photos below fold -->
<header class="py-8">
  <h1 class="text-5xl mb-4">Explore Gallery</h1>
  <p class="text-2xl">Browse 1,234 amazing photos from events</p>
</header>
```

---

### **Tier 2: Hybrid Pages (Relaxed Rules)**

**Pages:**
- `/collections` - Curated collection listing
- `/collections/[id]` - Individual collection with narrative

**Chrome Budget:** ≤50%

**Typography:** `text-3xl` max for hero section, `text-xl` for body

**Principle:** Photos + narrative (60/40 content-to-chrome split)

**Rationale:**
Collections pages combine photography with storytelling. A featured collection might have a short narrative paragraph explaining the story behind the photos. The chrome budget is relaxed to accommodate this hybrid purpose, but photos still dominate (60% content minimum).

**Examples:**
```svelte
<!-- ✅ GOOD: Narrative hero + photos -->
<header class="py-6">
  <h1 class="text-3xl mb-2">Comeback Stories</h1>
  <p class="text-base text-charcoal-300 max-w-2xl">
    Critical moments of triumph in the final minutes of gameplay.
  </p>
</header>
<PhotoGrid photos={collection.photos} /> <!-- 60%+ of viewport -->

<!-- ❌ BAD: Too much narrative, photos buried -->
<header class="py-12">
  <h1 class="text-6xl mb-6">Comeback Stories</h1>
  <p class="text-2xl mb-4">...</p>
  <p class="text-xl mb-4">...</p>
  <!-- 300px+ of chrome -->
</header>
```

---

### **Tier 3: Marketing Pages (Creative Freedom)**

**Pages:**
- `/` - Homepage/landing page
- `/about` - About the photographer
- `/contact` - Contact page
- `/style-guide` - Living style guide

**Chrome Budget:** ≤60%

**Typography:** `text-6xl` max (Phase 2: Extended Display Scale)
- `text-8xl` allowed sparingly for hero impact

**Principle:** Storytelling and conversion

**Rationale:**
These pages are about messaging, branding, and user conversion. They introduce the photographer, explain services, and guide users to book sessions or explore galleries. Larger typography and more expressive layouts are acceptable because the goal is engagement and conversion, not photo delivery.

**Examples:**
```svelte
<!-- ✅ GOOD: Impactful marketing hero -->
<section class="py-16">
  <h1 class="text-5xl lg:text-6xl font-bold mb-6">
    Capturing Athletic Moments
  </h1>
  <p class="text-xl lg:text-2xl text-charcoal-300 mb-8">
    AI-powered sports photography that tells your story
  </p>
  <button class="px-8 py-4 bg-gold-500 text-charcoal-950 rounded-lg text-lg">
    Explore Gallery
  </button>
</section>

<!-- ⚠️ USE SPARINGLY: text-8xl for special emphasis -->
<h1 class="text-8xl font-bold">EPIC</h1>
```

---

### **Tier 4: One-Off Creative (Exceptions)**

**Pages:**
- `/artist-statement` (hypothetical)
- `/campaigns/[slug]` (hypothetical)
- Special landing pages for specific events

**Chrome Budget:** No hard limit (document rationale)

**Typography:** Creative freedom

**Principle:** Art direction > system rules

**Requirement:** Document rationale, get approval

**Rationale:**
Some pages are art, not UI. An artist statement page might be a creative expression that intentionally breaks design system rules. These exceptions are rare and require explicit documentation and approval to prevent "exception creep."

**Process:** See [DESIGN_EXCEPTION_PROCESS.md](./DESIGN_EXCEPTION_PROCESS.md)

---

## Decision Tree

Use this flowchart to classify a new page:

```
Is the page primarily for browsing/viewing photos?
├─ YES → Tier 1 (Gallery Page)
│         Chrome ≤40%, text-xl max
│
└─ NO → Does the page combine photos with narrative?
    ├─ YES → Tier 2 (Hybrid Page)
    │         Chrome ≤50%, text-3xl max
    │
    └─ NO → Is the page for marketing/conversion?
        ├─ YES → Tier 3 (Marketing Page)
        │         Chrome ≤60%, text-6xl max
        │
        └─ NO → Is this a one-off creative page?
            └─ YES → Tier 4 (Exception)
                      Document rationale, get approval
```

---

## Common Questions

**Q: Can I use `text-4xl` on a gallery page hero?**

A: No. Gallery pages (Tier 1) are restricted to `text-xl` max. Use concise copy instead:
- ❌ `<h1 class="text-4xl">Explore Gallery</h1>`
- ✅ `<h1 class="text-xl">Gallery <span class="text-xs">1,234</span></h1>`

**Q: What about the homepage? It has a photo grid.**

A: The homepage is Tier 3 (Marketing). Even though it shows photos, its primary purpose is conversion (getting users to explore the gallery). Extended typography scale is allowed.

**Q: Can I create a "featured photo of the week" page with a large hero image and story?**

A: Yes, classify it as Tier 2 (Hybrid). Use `text-3xl` for the hero, keep the narrative concise, and ensure photos occupy ≥60% of the viewport.

**Q: What if I need to break the rules for a special campaign?**

A: Use the Design Exception Process (Tier 4). Document why the exception serves the user and get approval before implementation.

---

## Enforcement

### Code Review Checklist

- [ ] Page type identified (Tier 1-4)
- [ ] Chrome budget measured and within limits
- [ ] Typography scale appropriate for tier
- [ ] Photos visible above fold (Tier 1-2 only)
- [ ] Exception documented (Tier 4 only)

### Automated Checks (Future)

```typescript
// Potential CI check
const chromeRatioLimits = {
  tier1: 0.40,
  tier2: 0.50,
  tier3: 0.60,
  tier4: null // No limit
};

function validatePage(pageUrl: string, chromeRatio: number) {
  const tier = classifyPage(pageUrl);
  const limit = chromeRatioLimits[tier];

  if (limit && chromeRatio > limit) {
    throw new Error(`Chrome ratio ${chromeRatio} exceeds ${tier} limit of ${limit}`);
  }
}
```

---

## Version History

### v1.0.0 (2025-10-27)
- Initial taxonomy with 4 tiers
- Defined chrome budgets and typography limits
- Created decision tree for page classification

---

## Related Documentation

- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Full design system
- [TYPOGRAPHY_GUIDELINES.md](./TYPOGRAPHY_GUIDELINES.md) - Typography scale details
- [design-principles.md](./design-principles.md) - Core design principles
- [DESIGN_EXCEPTION_PROCESS.md](./DESIGN_EXCEPTION_PROCESS.md) - Exception workflow

---

**Remember:** These tiers exist to serve users. Tier 1-2 pages prioritize photos. Tier 3 pages prioritize messaging. Tier 4 exceptions must justify breaking the system.
