# Intelligent Filter System - Implementation Plan

**Version:** 1.0
**Created:** 2025-10-28
**Status:** 📋 Planned - Awaiting Approval
**Priority:** P1 - Critical UX Enhancement

---

## Executive Summary

Implement a comprehensive "no dead ends" intelligent filter system that prevents users from selecting filter combinations that yield zero results. This aligns with IA best practices and significantly improves user experience across all devices.

**Key Principle:** Never lead users to impossible states.

---

## 1. IA & UX Principles

### Core Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Progressive Disclosure** | Show only relevant options as context narrows | Filter options update based on current selections |
| **Transparency** | Show result counts before selection | Display photo counts next to each filter option |
| **Forgiveness** | Allow easy recovery from mistakes | Auto-clear incompatible filters with notification |
| **Feedback** | Inform users of system state changes | Toast notifications + visual state updates |
| **Accessibility** | Support all interaction methods | ARIA live regions, keyboard navigation, screen readers |

### User Flows Improved

**Before (Current State):**
```
User selects Sport: Volleyball →
User selects Play Type: Spike → 127 results ✅ →
User switches to Sport: Basketball → 0 results ❌
```

**After (Target State):**
```
User selects Sport: Volleyball →
User selects Play Type: Spike → 127 results ✅ →
User switches to Sport: Basketball →
  → Play Type auto-clears (notification shown) →
  → Play Type options update to basketball-specific →
  → User sees (330) next to Basketball sport →
  → User selects Play Type: Dunk → 45 results ✅
```

---

## 2. Design System Integration

### Color Palette (from Tailwind config)

```typescript
// Filter states
const FILTER_STATES = {
  // Available options (has results)
  available: {
    bg: 'bg-charcoal-800/50',
    hover: 'hover:bg-charcoal-800',
    text: 'text-charcoal-300',
    border: 'border-charcoal-800/30'
  },

  // Selected/Active options
  active: {
    bg: 'bg-gold-500',
    text: 'text-charcoal-950',
    shadow: 'shadow-md',
    glow: 'ring-2 ring-gold-500/50'
  },

  // Disabled options (zero results)
  disabled: {
    bg: 'bg-charcoal-900/30',
    text: 'text-charcoal-600',
    opacity: 'opacity-40',
    cursor: 'cursor-not-allowed'
  },

  // Result count badges
  badge: {
    default: 'text-charcoal-400 opacity-70',
    warning: 'text-yellow-400', // Low count (<10)
    disabled: 'text-charcoal-700' // Zero count
  }
};
```

### Typography (from existing system)

- **Filter Labels:** `Typography variant="label"` - charcoal-100, 14px
- **Result Counts:** `Typography variant="caption"` - charcoal-400, 12px
- **Notifications:** `Typography variant="body"` - white, 14px

### Motion Tokens

```typescript
// From src/lib/motion-tokens.ts
const FILTER_ANIMATIONS = {
  // Filter option state changes
  stateChange: MOTION.spring.snappy,

  // Count updates
  countUpdate: MOTION.spring.gentle,

  // Auto-clear notification
  notification: {
    enter: MOTION.spring.gentle,
    exit: MOTION.spring.gentle
  },

  // Disabled state transition
  disableTransition: {
    duration: MOTION.duration.fast
  }
};
```

### Spacing & Layout

```typescript
// Consistent spacing across breakpoints
const FILTER_SPACING = {
  mobile: {
    gap: 'gap-2',          // 8px between pills
    padding: 'p-3',        // 12px container padding
    pillPadding: 'px-3 py-1.5' // 12px horizontal, 6px vertical
  },
  tablet: {
    gap: 'gap-2',
    padding: 'p-4',
    pillPadding: 'px-3 py-1.5'
  },
  desktop: {
    gap: 'gap-3',          // 12px between pills
    padding: 'p-4',        // 16px container padding
    pillPadding: 'px-4 py-2'  // 16px horizontal, 8px vertical
  }
};
```

---

## 3. Responsive Breakpoints

### Breakpoint Strategy

```typescript
const BREAKPOINTS = {
  mobile: '< 640px',   // sm
  tablet: '640px - 1024px', // sm to lg
  desktop: '>= 1024px'  // lg+
};
```

### Behavior by Breakpoint

| Feature | Mobile (<640px) | Tablet (640-1024px) | Desktop (≥1024px) |
|---------|----------------|---------------------|-------------------|
| **Filter Layout** | Collapsed accordion | Collapsible sections | Always visible sidebar |
| **Result Counts** | Always visible | Always visible | Always visible |
| **Notification Position** | Bottom center | Bottom right | Bottom right |
| **Count Badge Size** | Small (12px) | Medium (12px) | Medium (14px) |
| **Disabled State** | Hidden options | Grayed out options | Grayed out options |
| **Touch Targets** | 44px min | 44px min | 40px min |

### Mobile-First Implementation

```svelte
<!-- Example: Play Type Filter -->
<div class="space-y-2">
  <!-- Mobile: Stack vertically, hide disabled -->
  <div class="flex flex-col gap-2 sm:hidden">
    {#each availablePlayTypes as playType}
      <FilterPill {...playType} size="md" />
    {/each}
  </div>

  <!-- Tablet/Desktop: Horizontal wrap, show disabled -->
  <div class="hidden sm:flex flex-wrap gap-2">
    {#each allPlayTypes as playType}
      <FilterPill {...playType} size="default" />
    {/each}
  </div>
</div>
```

---

## 4. Technical Architecture

### 4.1 Data Flow

```
Server (+page.server.ts)
  ↓
  Fetch comprehensive filter counts
  ↓
  Load data { photos, filterCounts, currentFilters }
  ↓
Client (+page.svelte)
  ↓
  Derive available filter options from counts
  ↓
  User selects filter
  ↓
  Check for incompatible filters
  ↓
  Auto-clear conflicts + show notification
  ↓
  Navigate with new filter state
  ↓
  Server refetches with updated counts
```

### 4.2 Server-Side Changes

**File:** `src/routes/explore/+page.server.ts`

```typescript
// NEW: Comprehensive filter counts interface
interface FilterCounts {
  sports: Record<string, number>;
  categories: Record<string, number>;
  playTypes: Record<string, number>;
  intensities: Record<string, number>;
  compositions: Record<string, number>;
  timesOfDay: Record<string, number>;
  lighting: Record<string, number>;
  colorTemperatures: Record<string, number>;
}

// NEW: Function to get counts for ALL filter combinations
async function getComprehensiveFilterCounts(
  currentFilters: PhotoFilterState
): Promise<FilterCounts> {
  // For each filter dimension, count photos that match:
  // 1. All OTHER current filters
  // 2. Each option in THIS dimension

  const counts: FilterCounts = {
    sports: {},
    categories: {},
    playTypes: {},
    // ... etc
  };

  // Example: Get play type counts given current sport/category
  if (currentFilters.sportType) {
    const { data } = await supabase
      .from('photo_metadata')
      .select('play_type')
      .eq('sport_type', currentFilters.sportType)
      .not('play_type', 'is', null);

    // Group by play_type and count
    counts.playTypes = data.reduce((acc, row) => {
      acc[row.play_type] = (acc[row.play_type] || 0) + 1;
      return acc;
    }, {});
  }

  return counts;
}

export const load: PageServerLoad = async ({ url }) => {
  // Parse current filters from URL
  const currentFilters = parseFiltersFromURL(url);

  // Fetch photos (existing logic)
  const photos = await fetchPhotos(currentFilters);

  // NEW: Fetch comprehensive counts
  const filterCounts = await getComprehensiveFilterCounts(currentFilters);

  return {
    photos,
    filterCounts, // NEW
    currentFilters
  };
};
```

### 4.3 Client-Side State Management

**File:** `src/routes/explore/+page.svelte`

```typescript
// NEW: Derived available options based on counts
let availablePlayTypes = $derived(() => {
  if (!data.filterCounts?.playTypes) return [];

  return Object.entries(data.filterCounts.playTypes)
    .filter(([_, count]) => count > 0)
    .map(([value, count]) => ({ value, count }));
});

// NEW: Check if filter is compatible
function isCompatibleFilter(
  filterType: string,
  filterValue: string,
  currentState: FilterState
): boolean {
  // Logic to determine if this filter combo is valid
  // Example: "spike" is NOT compatible with sport: "basketball"

  if (filterType === 'playType' && currentState.sport) {
    const validPlayTypes = getPlayTypesForSport(currentState.sport);
    return validPlayTypes.includes(filterValue);
  }

  return true;
}

// NEW: Auto-clear incompatible filters
function handleSportSelect(sportName: string | null) {
  // Check if current play type is compatible with new sport
  if (sportName && data.selectedPlayType) {
    if (!isCompatibleFilter('playType', data.selectedPlayType, { sport: sportName })) {
      // Auto-clear incompatible play type
      const clearedPlayType = data.selectedPlayType;
      handlePlayTypeSelect(null); // Clear it

      // Show notification
      showToast({
        variant: 'info',
        icon: Info,
        message: `Play type "${clearedPlayType}" cleared (not available for ${sportName})`
      });
    }
  }

  // Continue with sport selection
  // ... existing logic
}

// NEW: Toast notification manager
let toastQueue = $state<Toast[]>([]);

function showToast(toast: Toast) {
  toastQueue = [...toastQueue, { ...toast, id: Date.now() }];
}

function dismissToast(id: number) {
  toastQueue = toastQueue.filter(t => t.id !== id);
}
```

### 4.4 Filter Component Updates

**All filter components get these props:**

```typescript
interface FilterComponentProps {
  // Existing
  selectedValue?: string | null;
  onSelect?: (value: string | null) => void;

  // NEW: Result counts
  filterCounts?: Record<string, number>;

  // NEW: Show zero-result options?
  showDisabled?: boolean; // true on desktop, false on mobile
}
```

**Example: Updated PlayTypeFilter.svelte**

```svelte
<script lang="ts">
  interface Props {
    selectedPlayType?: string | null;
    selectedSport?: string | null;
    onSelect?: (playType: string | null) => void;
    filterCounts?: Record<string, number>; // NEW
    showDisabled?: boolean; // NEW (default: true on desktop, false on mobile)
  }

  let { selectedPlayType, selectedSport, onSelect, filterCounts = {}, showDisabled = true }: Props = $props();

  // Get play types with counts
  let playTypesWithCounts = $derived(
    getPlayTypesForSport(selectedSport).map(pt => ({
      ...pt,
      count: filterCounts[pt.value] || 0,
      disabled: (filterCounts[pt.value] || 0) === 0
    }))
  );

  // Filter out disabled on mobile
  let displayedPlayTypes = $derived(
    showDisabled
      ? playTypesWithCounts
      : playTypesWithCounts.filter(pt => !pt.disabled)
  );
</script>

<!-- Pills with counts and disabled states -->
{#each displayedPlayTypes as playType}
  <button
    onclick={() => handleClick(playType.value)}
    disabled={playType.disabled}
    class:opacity-40={playType.disabled}
    class:cursor-not-allowed={playType.disabled}
    class="transition-all duration-200 {playType.disabled ? '' : 'hover:scale-105'}"
  >
    <Icon />
    {playType.label}
    <span class="opacity-70 text-xs">
      ({playType.count})
    </span>
  </button>
{/each}
```

---

## 5. Implementation Phases

### Phase 1: Foundation (Server-Side) - 2-3 hours

**Goal:** Get comprehensive filter counts to the client

- [ ] Update `PhotoFilterState` interface to include all filterable fields
- [ ] Create `getComprehensiveFilterCounts()` function
- [ ] Add `filterCounts` to page load data
- [ ] Add unit tests for count calculations

**Files:**
- `src/routes/explore/+page.server.ts`
- `src/lib/supabase/server.ts` (helper functions)

**Testing:**
```bash
# Verify counts in browser devtools
# data.filterCounts should show all dimensions
```

---

### Phase 2: Smart Filter Components - 3-4 hours

**Goal:** Update all filter components to show counts and disable zero-result options

**Components to Update:**
1. ✅ PlayTypeFilter.svelte (already updated for sport-awareness)
2. ⬜ ActionIntensityFilter.svelte
3. ⬜ CompositionFilter.svelte
4. ⬜ TimeOfDayFilter.svelte
5. ⬜ LightingFilter.svelte
6. ⬜ ColorTemperatureFilter.svelte
7. ⬜ SportFilter.svelte (add counts)
8. ⬜ CategoryFilter.svelte (add counts)

**Pattern for Each:**
```typescript
// Add props
interface Props {
  // ... existing props
  filterCounts?: Record<string, number>;
  showDisabled?: boolean;
}

// Derive counts
let optionsWithCounts = $derived(
  options.map(opt => ({
    ...opt,
    count: filterCounts?.[opt.value] || 0,
    disabled: (filterCounts?.[opt.value] || 0) === 0
  }))
);

// Filter for mobile
let displayed = $derived(
  showDisabled ? optionsWithCounts : optionsWithCounts.filter(o => !o.disabled)
);
```

---

### Phase 3: Auto-Clear Logic - 2-3 hours

**Goal:** Implement intelligent filter clearing when conflicts arise

**Logic Map:**

| Changed Filter | Auto-Clear | Reason |
|---------------|------------|---------|
| Sport | Play Type (if incompatible) | Play types are sport-specific |
| Sport | Action Intensity (if category=candid) | Candid photos don't have intensity |
| Category | Play Type (if category≠action) | Only action photos have play types |
| Category | Action Intensity (if category≠action) | Only action photos have intensity |

**Implementation:**
```typescript
// Create filter compatibility matrix
const FILTER_DEPENDENCIES: Record<string, string[]> = {
  sport: ['playType'],
  category: ['playType', 'actionIntensity']
};

function handleFilterChange(
  filterType: string,
  newValue: string | null,
  currentState: FilterState
): FilterState {
  let newState = { ...currentState, [filterType]: newValue };

  // Check dependencies
  const dependents = FILTER_DEPENDENCIES[filterType] || [];

  for (const dependent of dependents) {
    const currentValue = currentState[dependent];
    if (currentValue && !isCompatible(dependent, currentValue, newState)) {
      // Clear it
      newState[dependent] = null;

      // Show notification
      showToast({
        variant: 'info',
        message: `${dependent} filter cleared (not compatible with new ${filterType})`
      });
    }
  }

  return newState;
}
```

---

### Phase 4: Toast Notification System - 1-2 hours

**Goal:** Inform users when filters auto-clear

**Use Existing Toast Component:** ✅ Already have `src/lib/components/ui/Toast.svelte`

**Create Toast Manager:**

```typescript
// src/lib/stores/toast-manager.svelte.ts
interface ToastMessage {
  id: number;
  variant: 'info' | 'warning' | 'success' | 'error';
  message: string;
  icon?: ComponentType;
  duration?: number;
}

class ToastManager {
  private messages = $state<ToastMessage[]>([]);

  show(message: Omit<ToastMessage, 'id'>): void {
    this.messages = [
      ...this.messages,
      { ...message, id: Date.now() }
    ];
  }

  dismiss(id: number): void {
    this.messages = this.messages.filter(m => m.id !== id);
  }

  get all(): ToastMessage[] {
    return this.messages;
  }
}

export const toastManager = new ToastManager();
```

**Usage in explore page:**
```svelte
<!-- Toast container (bottom-right on desktop, bottom-center on mobile) -->
<div class="fixed bottom-6 right-6 sm:right-6 left-6 sm:left-auto z-50 space-y-2">
  {#each toastManager.all as toast (toast.id)}
    <Toast
      variant={toast.variant}
      icon={toast.icon}
      duration={toast.duration}
      onClose={() => toastManager.dismiss(toast.id)}
    >
      {toast.message}
    </Toast>
  {/each}
</div>
```

---

### Phase 5: Responsive Behavior - 2 hours

**Goal:** Optimize filter display for each breakpoint

**Mobile (<640px):**
- Hide disabled options entirely (showDisabled=false)
- Stack filters vertically
- Larger touch targets (44px min)
- Notifications at bottom-center

**Tablet (640-1024px):**
- Show disabled options (grayed out)
- Horizontal pill layout with wrap
- Standard touch targets (40px)
- Notifications at bottom-right

**Desktop (≥1024px):**
- Show disabled options (grayed out)
- Horizontal pill layout
- Hover states enabled
- Notifications at bottom-right

**Implementation:**
```svelte
<PlayTypeFilter
  selectedPlayType={data.selectedPlayType}
  selectedSport={data.selectedSport}
  filterCounts={data.filterCounts?.playTypes}
  showDisabled={isDesktop} <!-- Derived from viewport width -->
  onSelect={handlePlayTypeSelect}
/>
```

---

### Phase 6: Accessibility Enhancements - 2 hours

**Goal:** Ensure filter system is fully accessible

**ARIA Attributes:**
```svelte
<button
  role="button"
  aria-pressed={isSelected}
  aria-disabled={isDisabled}
  aria-label={`Filter by ${label} (${count} results)`}
  disabled={isDisabled}
>
  {label}
  <span aria-hidden="true">({count})</span>
</button>
```

**Live Regions for Notifications:**
```svelte
<div aria-live="polite" aria-atomic="true" class="sr-only">
  {#if lastNotification}
    {lastNotification.message}
  {/if}
</div>
```

**Keyboard Navigation:**
- All filters navigable via Tab
- Space/Enter to select
- Escape to close dropdowns
- Focus management when auto-clearing

---

### Phase 7: Testing & Validation - 2-3 hours

**Unit Tests:**
```typescript
// Test filter compatibility logic
describe('isCompatibleFilter', () => {
  it('should return false for volleyball spike with basketball sport', () => {
    expect(isCompatibleFilter('playType', 'spike', { sport: 'basketball' }))
      .toBe(false);
  });

  it('should return false for action intensity with candid category', () => {
    expect(isCompatibleFilter('actionIntensity', 'high', { category: 'candid' }))
      .toBe(false);
  });
});
```

**E2E Tests (Playwright):**
```typescript
// tests/intelligent-filters.spec.ts
test('should auto-clear incompatible play type when sport changes', async ({ page }) => {
  await page.goto('/explore');

  // Select volleyball + spike
  await page.click('[data-testid="sport-volleyball"]');
  await page.click('[data-testid="playtype-spike"]');

  // Should see results
  await expect(page.locator('[data-testid="photo-count"]')).not.toContainText('0');

  // Switch to basketball
  await page.click('[data-testid="sport-basketball"]');

  // Spike should auto-clear
  await expect(page.locator('[data-testid="playtype-spike"]')).not.toBeChecked();

  // Should see notification
  await expect(page.locator('[role="status"]')).toContainText('Play type cleared');

  // Should still have results
  await expect(page.locator('[data-testid="photo-count"]')).not.toContainText('0');
});

test('should show result counts on all filter options', async ({ page }) => {
  await page.goto('/explore');

  // All sport options should show counts
  const sportButtons = page.locator('[data-testid^="sport-"]');
  const count = await sportButtons.count();

  for (let i = 0; i < count; i++) {
    await expect(sportButtons.nth(i)).toContainText(/\(\d+\)/);
  }
});

test('should disable options with zero results', async ({ page }) => {
  await page.goto('/explore');

  // Select very specific filter combo
  await page.click('[data-testid="sport-volleyball"]');
  await page.click('[data-testid="category-candid"]');

  // Action intensity options should be disabled (candid has no intensity)
  await expect(page.locator('[data-testid="intensity-high"]')).toBeDisabled();
});
```

**Manual Testing Checklist:**
- [ ] All filter combinations work without hitting 0 results
- [ ] Notifications appear when filters auto-clear
- [ ] Counts update correctly after each filter change
- [ ] Disabled state is visually clear
- [ ] Mobile: Disabled options are hidden
- [ ] Tablet/Desktop: Disabled options are grayed out
- [ ] Keyboard navigation works throughout
- [ ] Screen reader announces state changes
- [ ] Performance: No lag when changing filters

---

## 6. Performance Considerations

### Database Optimization

**Query Pattern:**
```sql
-- Instead of N separate queries for each filter dimension,
-- use a single aggregation query with grouping

SELECT
  sport_type,
  COUNT(*) as count
FROM photo_metadata
WHERE
  photo_category = $1  -- Apply current filters
  AND lighting = $2
GROUP BY sport_type;

-- Repeat for each dimension
```

**Caching Strategy:**
- Cache filter counts for 1 minute (counts don't change rapidly)
- Invalidate cache on photo upload/enrichment
- Use SvelteKit's built-in caching

### Client-Side Performance

- Debounce filter count calculations
- Memoize derived filter options
- Lazy load filter components below the fold
- Virtual scrolling for large filter lists (if needed)

---

## 7. Success Metrics

### Quantitative Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Zero-result filter selections | ~15% | <1% | Analytics event tracking |
| Filter interaction time | ~8s | <5s | Time to select 3 filters |
| Filter abandonment rate | ~20% | <5% | Users who clear all filters |
| Mobile filter usage | ~30% | >50% | Filter interactions on mobile |

### Qualitative Metrics

- User feedback: "I always see relevant options"
- Support tickets: Reduction in "why no results?" inquiries
- User testing: 9/10 users successfully complete multi-filter task

---

## 8. Rollout Plan

### Stage 1: Internal Testing (Day 1)
- Deploy to staging
- Team testing across devices
- Fix critical bugs

### Stage 2: Beta Users (Days 2-3)
- 10% traffic rollout
- Monitor analytics for issues
- Gather user feedback

### Stage 3: Full Rollout (Day 4)
- 100% traffic
- Monitor performance metrics
- Iterate based on data

### Rollback Plan
- Feature flag: `ENABLE_INTELLIGENT_FILTERS`
- Can disable instantly if issues arise
- Fallback to current "dumb" filters

---

## 9. Documentation Requirements

### User-Facing
- [ ] Help tooltip: "Grayed out options have no matching photos"
- [ ] FAQ entry: "Why did my filter clear?"
- [ ] Onboarding tip: "Numbers show available photos"

### Developer-Facing
- [ ] Update COMPONENT_PATTERNS.md with filter best practices
- [ ] Document filter compatibility matrix
- [ ] Add examples to style guide

---

## 10. Estimated Effort

| Phase | Hours | Priority |
|-------|-------|----------|
| Phase 1: Foundation | 2-3 | P0 |
| Phase 2: Smart Components | 3-4 | P0 |
| Phase 3: Auto-Clear Logic | 2-3 | P1 |
| Phase 4: Notifications | 1-2 | P1 |
| Phase 5: Responsive | 2 | P1 |
| Phase 6: Accessibility | 2 | P2 |
| Phase 7: Testing | 2-3 | P0 |

**Total:** 14-19 hours (~2-3 days)

---

## 11. Dependencies

**External:**
- None (all libraries already installed)

**Internal:**
- ✅ Toast component exists
- ✅ Motion tokens defined
- ✅ Design system documented
- ✅ Filter components scaffolded
- ⬜ Comprehensive filter counts API (Phase 1)

---

## 12. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Performance degradation on large datasets | High | Medium | Add query optimization + caching |
| Complex filter logic causes bugs | Medium | High | Comprehensive unit + E2E tests |
| Mobile UX feels too restrictive | Medium | Low | User testing before full rollout |
| Notification overload | Low | Medium | Limit to 1 notification per action |

---

## 13. Open Questions

1. **Should we persist "cleared filter" notifications across sessions?**
   - Proposal: Show once per session, then suppress

2. **How to handle very low counts (1-2 results)?**
   - Proposal: Show warning badge in yellow, but keep enabled

3. **Should we add a "Reset all filters" button?**
   - Proposal: Yes, add to active filter chips area

---

## Approval & Sign-Off

- [ ] **UX Review:** Approved by ___________
- [ ] **Technical Review:** Approved by ___________
- [ ] **Stakeholder Approval:** Approved by ___________

**Next Steps After Approval:**
1. Create feature branch: `feature/intelligent-filters`
2. Begin Phase 1 implementation
3. Daily standup updates on progress

---

**Questions or feedback?** Comment on this document or reach out to the development team.
