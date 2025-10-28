# UX/UI Audit Methodology

**Version:** 2.0.0
**Last Updated:** 2025-10-26
**Based On:** Explore page refactor learnings

---

## Overview

This methodology provides a **systematic, repeatable process** for auditing UI/UX quality across the gallery. It evolved from the explore page remediation, which revealed patterns of "frankensteining" UI and violating core design principles.

---

## Audit Process

### Phase 1: Visual Inspection (10 min)

**Objective:** First impressions and obvious violations

#### Steps:
1. **Load page** in browser at target viewport size
2. **Screenshot** above-the-fold view
3. **Visual scan** for immediate red flags:
   - Is content visible without scrolling?
   - Does chrome dominate the viewport?
   - Are controls oversized or verbose?
   - Is spacing excessive?

#### Output:
- Screenshot with violations marked
- Initial violation count

---

### Phase 2: Chrome-to-Content Measurement (15 min)

**Objective:** Quantify spatial efficiency

#### Tools:
```javascript
// Browser console measurement
const header = document.querySelector('header');
const controls = document.querySelector('[data-controls]');
const chromeHeight = header.offsetHeight + (controls?.offsetHeight || 0);
const viewportHeight = window.innerHeight;
const chromeRatio = chromeHeight / viewportHeight;

console.log({
  chromeHeight,
  viewportHeight,
  chromeRatio,
  pass: chromeRatio <= 0.40
});
```

#### Criteria:
```
P0 FAIL: chromeRatio > 0.60 (Content burial)
P1 FAIL: chromeRatio > 0.40 (Spatial waste)
PASS: chromeRatio <= 0.40
```

#### Output:
- Exact measurements
- Pass/fail determination
- Violating components identified

---

### Phase 3: Component Analysis (20 min)

**Objective:** Evaluate individual UI components against patterns

#### Checklist:

##### Filters
- [ ] Are filters inline pills? (not full-width containers)
- [ ] Are filters collapsed by default?
- [ ] Do expanded states use dropdown positioning?
- [ ] Are pill labels concise? (not verbose)
- [ ] Are icons appropriately sized? (w-3 h-3)

##### Search
- [ ] Is search bar compact? (not oversized)
- [ ] Is search positioned logically? (header for global)
- [ ] Does search have clear affordance?

##### Sort/Pagination
- [ ] Is sort near the grid? (not in header)
- [ ] Is sort compact? (text-xs sizing)
- [ ] Is pagination near the grid?

##### Metadata Displays
- [ ] Are counts using text-xs?
- [ ] Are counts muted color? (text-charcoal-400)
- [ ] Is verbose text removed? ("1,234" not "Showing 1,234 photos")

#### Scoring:
```
Each violation: -1 point
Target: 0 violations
```

---

### Phase 4: Gestalt Principles Audit (15 min)

**Objective:** Verify logical grouping and proximity

#### Proximity Test:
```
For each control:
1. What does it control?
2. How far (in pixels) from what it controls?
3. Is there a closer zone where it should live?
```

#### Examples:
```
✅ GOOD: Sort dropdown 32px above grid
❌ BAD: Sort dropdown 400px above grid (in header)

✅ GOOD: Filter pills in header (global state)
❌ BAD: Filter pills below grid (affects above content)
```

#### Common Violations:
- Sort in header (should be near grid)
- Pagination in sidebar (should be below grid)
- Filter controls scattered (should be grouped)

#### Output:
- Violations mapped with suggested relocations
- Proximity distances measured

---

### Phase 5: Visual Data Encoding Audit (10 min)

**Objective:** Verify data visualization features

#### Checklist:

##### Quality Stratification
- [ ] Portfolio-worthy photos have shimmer animation
- [ ] Low-quality photos are dimmed/blurred
- [ ] Visual treatment is noticeable (not subtle)

##### Emotion Halos
- [ ] Different emotions have different colors
- [ ] Halos are visible (not too subtle)
- [ ] Halos encode information (not decoration)

##### Other Data Viz
- [ ] Visual hierarchy reflects information hierarchy
- [ ] No arbitrary decoration
- [ ] All visual effects encode data

#### Test Method:
```javascript
// Check if emotion halos working
const photoCards = document.querySelectorAll('[data-photo-card]');
const emotions = new Set();

photoCards.forEach(card => {
  const classes = card.className;
  const emotionMatch = classes.match(/emotion-halo-(\w+)/);
  if (emotionMatch) emotions.add(emotionMatch[1]);
});

console.log({
  totalPhotos: photoCards.length,
  uniqueEmotions: emotions.size,
  emotions: Array.from(emotions),
  pass: emotions.size > 1 // Should have variety
});
```

---

### Phase 6: Responsive Audit (20 min)

**Objective:** Verify mobile-first approach

#### Viewports to Test:
```
Mobile: 375x667 (iPhone SE)
Tablet: 768x1024 (iPad)
Desktop: 1920x1080 (Standard)
```

#### Checklist Per Viewport:

##### Mobile (375px)
- [ ] All filters collapsed by default
- [ ] Touch targets ≥48px
- [ ] No horizontal scroll
- [ ] Chrome ≤30% viewport
- [ ] Photos visible above fold

##### Tablet (768px)
- [ ] Filters still compact
- [ ] Grid columns increase (2-3 cols)
- [ ] Touch targets still ≥44px
- [ ] Chrome ≤35% viewport

##### Desktop (1920px)
- [ ] Filters inline (not full-width)
- [ ] Grid uses available width
- [ ] Chrome ≤40% viewport
- [ ] Proper hover states

---

## Violation Severity Levels

### P0 - Critical (Must Fix Immediately)
**Impact:** Breaks core user experience

Examples:
- Content burial (photos not visible above fold)
- Chrome-to-content ratio > 60%
- Broken data visualization (shimmer/halos not working)
- Inaccessible touch targets (< 44px)

**Remediation SLA:** Within 1 day

---

### P1 - High Priority (Fix This Sprint)
**Impact:** Degrades user experience significantly

Examples:
- Chrome-to-content ratio 40-60%
- Spatial waste (oversized components)
- Gestalt violations (poor grouping)
- Verbose text/labels

**Remediation SLA:** Within 1 week

---

### P2 - Medium Priority (Fix Next Sprint)
**Impact:** Suboptimal but functional

Examples:
- Animation performance
- Minor spacing issues
- Color contrast tweaks
- Loading state improvements

**Remediation SLA:** Within 2 weeks

---

### P3 - Low Priority (Backlog)
**Impact:** Polish/enhancement

Examples:
- Micro-interactions
- Easter eggs
- Advanced features
- Nice-to-haves

**Remediation SLA:** As capacity allows

---

## Anti-Pattern Detection

### "Frankensteining" Pattern
**Symptom:** UI components stacked without design consideration

**Detection:**
```
1. Count vertical UI blocks
2. Measure spacing between blocks
3. Calculate total chrome height

If blocks > 4 AND chromeHeight > 200px:
  VIOLATION: Frankensteining detected
```

**Fix:** Consolidate into inline utilities

---

### "Spatial Waste" Pattern
**Symptom:** Excessive padding/margins

**Detection:**
```css
/* Check for violations */
.component {
  padding: > 1rem; /* 16px+ padding */
  margin: > 1.5rem; /* 24px+ margins */
  min-height: > 48px; /* Oversized */
}
```

**Fix:** Reduce to minimal defaults

---

### "Content Burial" Pattern
**Symptom:** Photos below the fold

**Detection:**
```javascript
const firstPhoto = document.querySelector('[data-photo-card]');
const photoTop = firstPhoto.getBoundingClientRect().top;
const viewportHeight = window.innerHeight;

if (photoTop > viewportHeight * 0.5) {
  VIOLATION: Content buried below 50% of viewport
}
```

**Fix:** Collapse chrome, reduce header height

---

### "Gestalt Violation" Pattern
**Symptom:** Controls far from what they control

**Detection:**
```javascript
const sort = document.querySelector('[data-sort]');
const grid = document.querySelector('[data-grid]');

const sortPos = sort.getBoundingClientRect();
const gridPos = grid.getBoundingClientRect();
const distance = gridPos.top - sortPos.bottom;

if (distance > 100) {
  VIOLATION: Sort too far from grid (${distance}px)
}
```

**Fix:** Move controls near their targets

---

## Remediation Workflow

### Step 1: Prioritize Violations
```
1. Sort violations by severity (P0 → P3)
2. Group by component/page
3. Estimate effort (S/M/L)
4. Create remediation plan
```

### Step 2: Create Remediation Plan
```markdown
## Remediation Plan: [Page Name]

### P0 Violations (Must Fix)
- [ ] [Violation 1]: [Description]
  - Fix: [Specific solution]
  - Effort: [S/M/L]
  - Owner: [Name]

### P1 Violations (High Priority)
- [ ] [Violation 2]: [Description]
  - Fix: [Specific solution]
  - Effort: [S/M/L]
  - Owner: [Name]
```

### Step 3: Implement Fixes
```
1. Start with P0 violations
2. Test after each fix
3. Re-measure chrome-to-content
4. Verify no regressions
```

### Step 4: Validate Fixes
```
1. Run full audit again
2. Compare before/after metrics
3. Screenshot comparison
4. User testing (if available)
```

---

## Measurement Framework

### Quantitative Metrics

#### Chrome-to-Content Ratio
```javascript
function measureChromeRatio() {
  const header = document.querySelector('header').offsetHeight;
  const controls = document.querySelector('[data-controls]')?.offsetHeight || 0;
  const viewport = window.innerHeight;

  return {
    chromeHeight: header + controls,
    viewportHeight: viewport,
    ratio: (header + controls) / viewport,
    pass: ((header + controls) / viewport) <= 0.40
  };
}
```

#### Component Count
```javascript
function countComponents() {
  return {
    filters: document.querySelectorAll('[data-filter]').length,
    buttons: document.querySelectorAll('button').length,
    inputs: document.querySelectorAll('input, select').length,
    total: document.querySelectorAll('button, input, select, [data-filter]').length
  };
}
```

#### Visual Data Score
```javascript
function visualDataScore() {
  const photoCards = document.querySelectorAll('[data-photo-card]');
  let shimmerCount = 0;
  let haloCount = 0;
  let dimmedCount = 0;

  photoCards.forEach(card => {
    if (card.classList.contains('quality-shimmer')) shimmerCount++;
    if (card.className.match(/emotion-halo-/)) haloCount++;
    if (card.classList.contains('quality-dimmed')) dimmedCount++;
  });

  return {
    totalPhotos: photoCards.length,
    shimmer: shimmerCount,
    halos: haloCount,
    dimmed: dimmedCount,
    score: (shimmerCount + haloCount + dimmedCount) / photoCards.length
  };
}
```

### Qualitative Assessment

#### User Experience Score (1-10)
```
Layout Clarity: [1-10]
- 1: Confusing, cluttered
- 10: Clear, intuitive

Content Visibility: [1-10]
- 1: Content buried
- 10: Content immediately visible

Interaction Efficiency: [1-10]
- 1: Many clicks required
- 10: Direct, minimal clicks

Visual Hierarchy: [1-10]
- 1: Flat, no guidance
- 10: Clear information flow

Overall UX Score: Average of above
```

---

## Audit Report Template

```markdown
# UX/UI Audit Report: [Page Name]

**Date:** [YYYY-MM-DD]
**Auditor:** [Name]
**Version:** [Page version]

---

## Executive Summary

**Overall Grade:** [A/B/C/D/F]
**Chrome-to-Content Ratio:** [X%] (Target: ≤40%)
**Critical Violations:** [N] P0 issues
**Recommendation:** [Proceed/Refactor/Redesign]

---

## Metrics

| Metric | Value | Target | Pass/Fail |
|--------|-------|--------|-----------|
| Chrome Ratio | X% | ≤40% | ❌/✅ |
| Content Above Fold | X% | ≥60% | ❌/✅ |
| Component Count | N | ≤10 | ❌/✅ |
| Visual Data Score | X% | ≥80% | ❌/✅ |

---

## Violations

### P0 - Critical
1. **[Violation Name]**
   - **Issue:** [Description]
   - **Impact:** [User experience impact]
   - **Fix:** [Specific solution]
   - **Effort:** [S/M/L]

### P1 - High Priority
[...]

### P2 - Medium Priority
[...]

---

## Screenshots

### Before
![Before](./path/to/before.png)

### After (Proposed)
![After](./path/to/after.png)

---

## Remediation Plan

### Sprint 1 (P0 Fixes)
- [ ] Fix violation 1
- [ ] Fix violation 2

### Sprint 2 (P1 Fixes)
- [ ] Fix violation 3

---

## Success Criteria

- [ ] Chrome ratio ≤40%
- [ ] Content visible above fold
- [ ] No P0 violations
- [ ] ≤2 P1 violations

---

## Next Steps

1. [Action item 1]
2. [Action item 2]
3. Re-audit after fixes
```

---

## Automated Audit Script

```javascript
// audit.js - Run in browser console
function runAudit() {
  const audit = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    metrics: {},
    violations: []
  };

  // Measure chrome ratio
  const header = document.querySelector('header');
  const controls = document.querySelector('[data-controls]');
  const chromeHeight = (header?.offsetHeight || 0) + (controls?.offsetHeight || 0);
  const chromeRatio = chromeHeight / window.innerHeight;

  audit.metrics.chromeRatio = {
    value: chromeRatio,
    pass: chromeRatio <= 0.40,
    severity: chromeRatio > 0.60 ? 'P0' : chromeRatio > 0.40 ? 'P1' : null
  };

  if (!audit.metrics.chromeRatio.pass) {
    audit.violations.push({
      type: 'Chrome-to-content ratio',
      severity: audit.metrics.chromeRatio.severity,
      value: chromeRatio,
      fix: 'Reduce header height, collapse filters, use inline utilities'
    });
  }

  // Check content above fold
  const firstPhoto = document.querySelector('[data-photo-card]');
  if (firstPhoto) {
    const photoTop = firstPhoto.getBoundingClientRect().top;
    const contentAboveFold = photoTop < window.innerHeight * 0.5;

    audit.metrics.contentAboveFold = {
      value: photoTop,
      pass: contentAboveFold,
      severity: !contentAboveFold ? 'P0' : null
    };

    if (!contentAboveFold) {
      audit.violations.push({
        type: 'Content burial',
        severity: 'P0',
        value: `First photo at ${photoTop}px`,
        fix: 'Collapse chrome to bring content above fold'
      });
    }
  }

  // Component count
  const componentCount = document.querySelectorAll('button, input, select, [data-filter]').length;
  audit.metrics.componentCount = {
    value: componentCount,
    pass: componentCount <= 10,
    severity: componentCount > 15 ? 'P1' : null
  };

  // Visual data score
  const photoCards = document.querySelectorAll('[data-photo-card]');
  let visualDataCount = 0;
  photoCards.forEach(card => {
    if (card.className.match(/quality-shimmer|emotion-halo-|quality-dimmed/)) {
      visualDataCount++;
    }
  });

  const visualDataScore = photoCards.length > 0 ? visualDataCount / photoCards.length : 0;
  audit.metrics.visualDataScore = {
    value: visualDataScore,
    pass: visualDataScore >= 0.80,
    severity: visualDataScore < 0.50 ? 'P1' : null
  };

  // Overall pass/fail
  audit.pass = audit.violations.filter(v => v.severity === 'P0').length === 0;
  audit.grade = audit.pass ? (audit.violations.length === 0 ? 'A' : 'B') : 'F';

  console.table(audit.metrics);
  console.log('\nViolations:', audit.violations);
  console.log(`\nOverall Grade: ${audit.grade}`);

  return audit;
}

// Run audit
const results = runAudit();
```

---

## Version History

### v2.0.0 (2025-10-26)
- Complete rewrite based on explore page refactor
- Added quantitative metrics framework
- Defined anti-pattern detection
- Created automated audit script
- Established severity levels with SLAs

### v1.0.0 (2025-10-20)
- Initial audit methodology
- Basic checklist approach

---

**Next Actions:**
1. Run audit on remaining pages (albums, collections, home)
2. Generate remediation plans
3. Track fixes via GitHub issues
4. Establish weekly audit cadence
