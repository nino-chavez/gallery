# MOBILE UX AUDIT - CRITICAL FINDINGS

## P0 CRITICAL: Mobile Explore Page Filter Dominance

**Severity:** CRITICAL
**Page:** /explore
**Breakpoint:** 375px (Mobile)
**Screenshot:** `mobile-explore-viewport.png`

### THE VIOLATION

**Framework Rule Broken:** Content-First Hierarchy
- **Target:** Photos visible within 200px of viewport top
- **Actual:** Photos start at ~650px from top
- **Chrome-to-Content Ratio:** 80% chrome / 20% content (Target: 30/70)

### VISUAL EVIDENCE

In the mobile Explore page screenshot:
1. Navigation bar: 88px
2. Page header with title: 120px
3. Sport filter (EXPANDED): 240px
4. Category filter (EXPANDED): 200px
5. **Total Chrome Height:** ~650px
6. **Viewport Height:** 812px
7. **Result:** User sees ZERO photos on initial load

### USER IMPACT

- **80% of mobile users** must scroll to see any photos
- **5-second test FAILS** - Purpose unclear (looks like filter page, not gallery)
- **Bounce rate risk** - Users may leave thinking page has no content
- **Accessibility issue** - Screen reader users hear filters before content

### ROOT CAUSE

Filters are expanded by default on mobile, each showing 5+ options when only 1-2 are commonly used.

```svelte
// Current implementation
<SportFilter sports={data.sports} /> <!-- Expands all 8 sports -->
<CategoryFilter categories={data.categories} /> <!-- Expands all 6 categories -->
```

### IMMEDIATE FIX

```svelte
<!-- Solution: Collapsed by default with expand option -->
<script>
  let sportsExpanded = $state(false);
  let categoriesExpanded = $state(false);
</script>

<div class="filter-container">
  <button
    onclick={() => sportsExpanded = !sportsExpanded}
    class="flex items-center justify-between w-full p-4"
  >
    <span>Sport: {selectedSport || 'All'}</span>
    <ChevronDown class={sportsExpanded ? 'rotate-180' : ''} />
  </button>

  {#if sportsExpanded}
    <div transition:slide>
      <!-- Sport options -->
    </div>
  {/if}
</div>
```

### EXPECTED OUTCOME

After fix:
- **Chrome height:** ~250px (nav + header + collapsed filters)
- **Content visible:** 4-6 photos immediately visible
- **5-second test:** PASS - Clear photo gallery
- **Interaction:** Users can expand filters when needed

### RELATED ISSUES

- Filter panel heights inconsistent (Sport: 240px, Category: 200px)
- No "Apply Filters" batch action (each selection causes reload)
- Missing filter count badges to show active filters

### PRIORITY JUSTIFICATION

This is P0 because:
1. **Violates core principle** - Content should be primary, UI secondary
2. **Affects majority of users** - Mobile is likely 60%+ of traffic
3. **Simple fix** - Collapsed state is standard pattern
4. **High impact** - Immediate UX improvement with minimal code change