# Visual Audit Framework - Nino Chavez Gallery

**Version:** 1.0.0
**Last Updated:** 2025-10-28
**Status:** Active

---

## Overview

This document outlines the comprehensive visual audit framework used to maintain design system compliance and UX quality across the Nino Chavez Gallery. The framework combines automated testing, screenshot capture, and manual review processes to ensure content-first hierarchy and visual data integrity.

---

## Framework Architecture

```
┌─ Automated Audit ──────────────────────────────┐
│ Playwright-based automated tests              │
│ - Chrome-to-content ratio measurement         │
│ - Content burial detection                    │
│ - Component count analysis                    │
│ - Visual data encoding verification           │
│ - Gestalt principle validation                │
└────────────────────────────────────────────────┘
          ↓ Generates
┌─ Audit Reports ────────────────────────────────┐
│ JSON audit results with violation details     │
│ - P0/P1/P2 severity classification             │
│ - Specific measurements and thresholds        │
│ - Remediation recommendations                  │
└────────────────────────────────────────────────┘
          ↓ Accompanied by
┌─ Screenshot Capture ───────────────────────────┐
│ Multi-breakpoint viewport screenshots         │
│ - Above-the-fold viewport captures            │
│ - Full-page screenshots                       │
│ - Interactive state captures (hover/focus)    │
└────────────────────────────────────────────────┘
          ↓ Reviewed via
┌─ Manual Audit Process ─────────────────────────┐
│ Human review of automated results             │
│ - Violation triage and prioritization         │
│ - Design system compliance verification       │
│ - User experience validation                  │
└────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Automated Audit Engine (`ux-audit-automated.spec.ts`)

#### Purpose

Runs comprehensive UX/UI audits using Playwright to measure design system compliance programmatically.

#### Key Metrics Measured

##### Chrome-to-Content Ratio

```typescript
// Measures UI chrome vs. content visibility
const chromeHeight = (filterSection?.clientHeight || header?.offsetHeight || 0);
const chromeRatio = chromeHeight / window.innerHeight;

// Thresholds
const CHROME_RATIO_P0_THRESHOLD = 0.60; // Critical: >60%
const CHROME_RATIO_P1_THRESHOLD = 0.40; // High: >40%
```

**Pass Criteria:**

- Gallery pages: ≤40% chrome ratio
- Marketing pages: ≤60% chrome ratio
- Hero/landing pages: Exempt (content-first not applicable)

##### Content Burial Detection

```typescript
// Checks if photos are visible above fold
const firstPhoto = document.querySelector('[data-photo-card]');
const photoTop = firstPhoto.getBoundingClientRect().top;
const contentAboveFold = photoTop < window.innerHeight * 0.5;
```

**Pass Criteria:** First photo must be within top 50% of viewport

##### Component Count Analysis

```typescript
// Counts interactive chrome elements (excluding photo cards)
const chromeComponents = document.querySelectorAll(
  'header button, header input, header select, [data-filter], nav button, nav input, nav select'
);
```

**Pass Criteria:** ≤15 chrome components (buttons, inputs, selects in header/nav)

##### Visual Data Encoding

```typescript
// Measures quality shimmer and emotion halo implementation
const photoCards = document.querySelectorAll('[data-photo-card]');
let visualDataCount = 0;
photoCards.forEach(card => {
  if (card.className.match(/quality-shimmer|emotion-halo-|quality-dimmed/)) {
    visualDataCount++;
  }
});
const visualDataScore = visualDataCount / photoCards.length;
```

**Pass Criteria:** ≥80% of photos have visual data encoding

##### Gestalt Principle Validation

```typescript
// Checks sort control proximity to grid
const sortControl = document.querySelector('select[aria-label*="sort" i]');
const grid = document.querySelector('[data-grid]');
const distance = Math.abs(grid.getBoundingClientRect().top - sortControl.getBoundingClientRect().bottom);
```

**Pass Criteria:** Sort controls within 100px of grid

#### Audit Breakpoints

```typescript
const AUDIT_BREAKPOINTS = [
  { name: 'mobile', width: 375, height: 812 },    // iPhone SE
  { name: 'tablet', width: 768, height: 1024 },   // iPad
  { name: 'desktop', width: 1440, height: 900 },  // Standard desktop
];
```

#### Audited Pages

```typescript
const PAGES_TO_AUDIT = [
  { name: 'home', url: '/' },
  { name: 'explore', url: '/explore' },
  { name: 'timeline', url: '/timeline' },
  { name: 'albums', url: '/albums' },
  { name: 'collections', url: '/collections' },
  { name: 'favorites', url: '/favorites' },
];
```

### 2. Screenshot Capture System (`ux-audit-screenshots.spec.ts`)

#### Purpose

Captures comprehensive visual documentation of each page state for manual review and comparison.

#### Screenshot Types

##### Viewport Screenshots

- **Purpose:** Above-the-fold content visibility
- **Dimensions:** Exact viewport size (no scrolling)
- **Naming:** `{breakpoint}-{page}-viewport.png`

##### Full Page Screenshots

- **Purpose:** Complete page layout and scrolling behavior
- **Dimensions:** Full page height
- **Naming:** `{breakpoint}-{page}-full.png`

##### Interactive State Screenshots

- **Hover States:** First visible button/link hovered
- **Focus States:** Tab navigation focus indicators
- **Naming:** `{breakpoint}-{page}-hover.png`, `{breakpoint}-{page}-focus.png`

#### Capture Process

```typescript
// Navigate and wait for stability
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000); // Animation settlement

// Viewport capture
await page.screenshot({
  path: 'viewport.png',
  fullPage: false,
});

// Interactive state capture
const button = page.locator('button:visible').first();
await button.hover();
await page.waitForTimeout(300);
await page.screenshot({ path: 'hover.png', fullPage: false });
```

### 3. Basic Screenshot Script (`audit-screenshots.js`)

#### Purpose

Quick screenshot capture for ad-hoc audits and debugging.

#### Features

- Simple Node.js script using Playwright
- Configurable breakpoints and pages
- High-quality output (2x device scale factor)
- Animation waiting and network idle detection

#### Usage

```bash
node audit-screenshots.js
# Outputs: audit-{breakpoint}-{page}.png
```

### 4. Audit Report Generation

#### JSON Audit Results

```typescript
interface AuditResult {
  timestamp: string;
  url: string;
  viewport: { width: number; height: number };
  metrics: {
    chromeRatio: {
      value: number;
      chromeHeight: number;
      viewportHeight: number;
      pass: boolean;
      severity: 'P0' | 'P1' | null;
    };
    contentAboveFold: {
      value: number | null;
      pass: boolean;
      severity: 'P0' | null;
    };
    componentCount: {
      chromeComponents: number;
      photoCardButtons: number;
      total: number;
      pass: boolean;
      severity: 'P1' | null;
    };
    visualDataScore: {
      value: number;
      totalPhotos: number;
      withVisualData: number;
      pass: boolean;
      severity: 'P1' | null;
    };
    sortProximity?: {
      value: number;
      pass: boolean;
      severity: 'P1' | 'P2' | null;
    };
  };
  violations: Array<{
    type: string;
    severity: 'P0' | 'P1' | 'P2';
    value: string | number;
    fix: string;
  }>;
  pass: boolean;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}
```

#### Consolidated Summary Report

```typescript
interface AuditSummary {
  timestamp: string;
  summary: {
    totalPages: number;
    totalBreakpoints: number;
    totalAudits: number;
    violations: {
      p0: number;
      p1: number;
      p2: number;
      total: number;
    };
    grades: {
      A: number;
      B: number;
      C: number;
      D: number;
      F: number;
    };
  };
  results: AuditResult[];
}
```

---

## Violation Severity Framework

### P0 - Critical (Must Fix Immediately)

**Impact:** Breaks core user experience, prevents content access

**Examples:**

- Chrome ratio >60% (content completely buried)
- Photos not visible above fold on gallery pages
- Broken visual data encoding (no quality/emotion indicators)

**SLA:** Fix within 1 day

### P1 - High Priority (Fix This Sprint)

**Impact:** Significantly degrades user experience

**Examples:**

- Chrome ratio 40-60% (content partially buried)
- Excessive component count (>15 chrome controls)
- Visual data score <50%
- Sort controls >200px from grid

**SLA:** Fix within 1 week

### P2 - Medium Priority (Fix Next Sprint)

**Impact:** Minor UX degradation, consistency issues

**Examples:**

- Sort controls 100-200px from grid
- Minor spacing/layout inconsistencies

**SLA:** Fix within 2 weeks

---

## Running Audits

### Automated Audit Suite

```bash
# Run all automated audits
npx playwright test ux-audit-automated.spec.ts

# Run specific page
npx playwright test ux-audit-automated.spec.ts --grep "explore"

# Run specific breakpoint
npx playwright test ux-audit-automated.spec.ts --grep "mobile"
```

### Screenshot Capture

```bash
# Generate all audit screenshots
npx playwright test ux-audit-screenshots.spec.ts

# Quick screenshot capture
node audit-screenshots.js
```

### Output Locations

```
.agent-os/audits/
├── automated/           # JSON audit results
│   ├── mobile-explore-audit.json
│   ├── desktop-home-audit.json
│   └── audit-summary.json
└── screenshots/         # PNG screenshots
    ├── mobile-explore-viewport.png
    ├── mobile-explore-full.png
    ├── mobile-explore-hover.png
    └── mobile-explore-focus.png
```

---

## Manual Review Process

### 1. Review Automated Results

- Check violation counts and severity levels
- Review specific measurements (chrome ratios, distances)
- Identify patterns across breakpoints/pages

### 2. Examine Screenshots

- Compare viewport screenshots for content visibility
- Check hover/focus states for accessibility
- Look for visual inconsistencies

### 3. Validate Design System Compliance

- Verify component patterns are followed
- Check typography scale usage
- Confirm color palette adherence

### 4. User Experience Assessment

- Consider real user workflows
- Evaluate interaction efficiency
- Assess information hierarchy clarity

---

## Integration with CI/CD

### GitHub Actions Integration

```yaml
# .github/workflows/audit.yml
name: UX/UI Audit
on: [pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npx playwright install
      - run: npx playwright test ux-audit-automated.spec.ts
      - uses: actions/upload-artifact@v3
        with:
          name: audit-results
          path: .agent-os/audits/
```

### Failure Conditions

- Any P0 violations (critical failures)
- Chrome ratio >60% on any page
- Content burial on gallery pages
- Build fails if violations exceed thresholds

---

## Anti-Patterns to Avoid

### 1. Screenshot-Only Audits

**❌ Bad:** Relying only on visual inspection

```
Problem: Subjective, inconsistent, misses quantitative issues
Solution: Combine automated metrics with visual review
```

### 2. Single-Breakpoint Testing

**❌ Bad:** Testing only desktop layouts

```
Problem: Mobile UX issues missed
Solution: Test all breakpoints (mobile/tablet/desktop)
```

### 3. Ignoring Visual Data

**❌ Bad:** Not measuring quality shimmer/emotion halos

```
Problem: Core design system features not validated
Solution: Automated visual data encoding checks
```

### 4. Manual-Only Audits

**❌ Bad:** No automated regression prevention

```
Problem: Design drift over time
Solution: CI/CD integration with automated checks
```

---

## Extending the Framework

### Adding New Metrics

```typescript
// Add to audit function
audit.metrics.newMetric = {
  value: calculateNewMetric(),
  pass: checkNewThreshold(),
  severity: determineSeverity()
};
```

### Custom Violation Types

```typescript
audit.violations.push({
  type: 'Custom violation type',
  severity: 'P1',
  value: 'Specific measurement',
  fix: 'Actionable remediation steps'
});
```

### New Breakpoints

```typescript
const AUDIT_BREAKPOINTS = [
  // Existing breakpoints...
  { name: 'large-desktop', width: 1920, height: 900 },
  { name: 'mobile-landscape', width: 812, height: 375 },
];
```

---

## Troubleshooting

### Common Issues

#### Screenshots Not Capturing

```
Problem: Animations not settled, content still loading
Solution: Increase waitForTimeout, use waitUntil: 'networkidle'
```

#### Audit Metrics Inaccurate

```
Problem: Dynamic content, incorrect selectors
Solution: Update selectors, add data attributes for reliable targeting
```

#### False Positive Violations

```
Problem: Edge cases not handled (hero pages, special layouts)
Solution: Add conditional logic for page type detection
```

---

## Success Metrics

### Framework Effectiveness

- **P0 Violations:** 0 (zero tolerance)
- **Audit Coverage:** 100% of pages, all breakpoints
- **CI/CD Integration:** All PRs audited automatically
- **Time to Feedback:** <5 minutes for automated results

### Design System Compliance

- **Chrome Budget Adherence:** 95%+ of audits pass
- **Visual Data Encoding:** 90%+ photos have indicators
- **Component Pattern Usage:** 100% audited components follow patterns

---

## Version History

### v1.0.0 (2025-10-28)

- Initial comprehensive framework documentation
- Automated audit engine with 5 key metrics
- Screenshot capture system with 4 screenshot types
- Violation severity framework (P0-P1-P2)
- CI/CD integration guidelines

---

## Related Documentation

- [DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md) - Core design principles
- [audit-methodology.md](../design/audit-methodology.md) - Manual audit process
- [component-patterns.md](../design/component-patterns.md) - UI component patterns
- [ux-audit-automated.spec.ts](../../tests/ux-audit-automated.spec.ts) - Automated tests
- [ux-audit-screenshots.spec.ts](../../tests/ux-audit-screenshots.spec.ts) - Screenshot tests

---

**Remember:** This framework serves the photos, not the other way around. Every metric and violation type exists to ensure users can discover and enjoy great photography with minimal friction.
