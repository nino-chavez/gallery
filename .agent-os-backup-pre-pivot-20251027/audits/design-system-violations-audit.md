# Design System Violations Audit Framework

**Version:** 1.0.0
**Created:** 2025-10-27
**Purpose:** Prevent features from satisfying one principle while violating others

---

## The Problem Pattern

**Symptom:** Feature satisfies Principle X but violates Principles Y and Z

**Recent Examples:**
1. **Emotion Halos** - Satisfied Visual Data (P6) but violated Content-First (P1) and IA
2. **Quality Shimmer** - Satisfied Visual Data (P6) but violated Content-First (P1) and Minimal Defaults (P8)

**Root Cause:** Features implemented in isolation without cross-principle validation

---

## Cross-Principle Validation Matrix

### For Every New Feature

Check against ALL 10 principles, not just the primary one:

```typescript
interface FeatureAudit {
  feature: string;
  primaryPrinciple: string;
  validations: {
    principle: string;
    passes: boolean;
    notes: string;
  }[];
  overallPass: boolean;
}
```

### Example Audit

```typescript
{
  feature: "Emotion Halos (colored border glows)",
  primaryPrinciple: "P6: Visual Data Layers",
  validations: [
    { principle: "P1: Content-First", passes: false,
      notes: "Glows compete with photos for attention" },
    { principle: "P6: Visual Data", passes: true,
      notes: "Colors encode emotion metadata" },
    { principle: "P8: Minimal Defaults", passes: false,
      notes: "Always visible, not minimal" },
    { principle: "IA: Context", passes: false,
      notes: "No legend, no filters, colors meaningless to new users" }
  ],
  overallPass: false  // ❌ FAIL: Violates 3/4 principles
}
```

---

## Automated Violation Detection

### Category 1: Visual Competition (P1 Violations)

**Detection:** Effects that draw attention away from photos

```bash
# Search for always-visible visual effects
grep -r "box-shadow.*infinite" src/
grep -r "animation:.*infinite" src/
grep -r "will-change" src/
grep -r "background:.*gradient.*rotate" src/
```

**Red Flags:**
- Infinite animations on photo cards
- Large glows (>10px spread)
- High opacity effects (>0.3)
- Always-visible (not hover/focus gated)

**Fix Pattern:**
```css
/* ❌ Bad: Always competing */
.photo-card {
  box-shadow: 0 0 20px 8px rgba(255, 215, 0, 0.8);
  animation: shimmer 2s infinite;
}

/* ✅ Good: Hover-only, subtle */
.photo-card:hover {
  box-shadow: 0 0 8px 2px rgba(255, 215, 0, 0.15);
  transition: box-shadow 0.2s ease;
}
```

---

### Category 2: IA Violations (Missing Context)

**Detection:** Visual indicators without UI context

```bash
# Find color-coded elements
grep -r "emotion-halo" src/
grep -r "category-color" src/
grep -r "priority-level" src/

# Check for corresponding filters/legends
grep -r "emotion.*filter" src/routes/
grep -r "legend.*emotion" src/
```

**Validation Questions:**
1. Does a visual indicator have a filter UI?
2. Is there a legend explaining colors/effects?
3. Can users trigger an action based on the indicator?

**Fix Pattern:**
```svelte
<!-- ❌ Bad: Color without context -->
<div class="border-{emotionColor}">Photo</div>

<!-- ✅ Good: Color + actionable filter -->
<div class="border-{emotionColor}">
  Photo
  <button onclick={() => filterByEmotion()}>
    Find Similar
  </button>
</div>

<!-- Elsewhere: Filter UI that creates mental mapping -->
<FilterBar>
  <EmotionFilter /> <!-- Users learn color meanings -->
</FilterBar>
```

---

### Category 3: Minimal Defaults Violations (P8)

**Detection:** Features that aren't collapsed/hidden by default

```bash
# Find expanded/visible defaults
grep -r "isExpanded = true" src/
grep -r "opacity: 1" src/app.css | grep -v "hover"
grep -r "display: block" src/ | grep -v "responsive"
```

**Red Flags:**
- Filters expanded by default
- Animations playing on page load
- Optional metadata always visible
- Tooltips shown without hover

**Fix Pattern:**
```svelte
<!-- ❌ Bad: Expanded by default -->
let isExpanded = $state(true);

<!-- ✅ Good: Collapsed by default -->
let isExpanded = $state(false);
```

---

### Category 4: Chrome Budget Violations (P7)

**Detection:** Features adding vertical space

```bash
# Measure chrome height additions
# Run in browser console:
const header = document.querySelector('header').offsetHeight;
const controls = document.querySelectorAll('[data-control-bar]');
const totalChrome = header + Array.from(controls).reduce((sum, el) => sum + el.offsetHeight, 0);
console.log({ totalChrome, budget: window.innerHeight * 0.4, pass: totalChrome < window.innerHeight * 0.4 });
```

**Red Flags:**
- New features adding >20px vertical space
- Full-width containers (not inline)
- Large padding (>p-4)
- Oversized text (>text-xl on utility pages)

---

## Implementation Review Checklist

Before implementing any feature, validate against ALL principles:

### Pre-Implementation

```markdown
## Feature: [Name]
**Primary Principle:** [Which principle does this satisfy?]

### Cross-Principle Validation

- [ ] **P1: Content-First** - Does this compete with photos for attention?
- [ ] **P2: Inline Utility** - Is this inline or full-width block?
- [ ] **P3: Gestalt** - Is this near what it controls?
- [ ] **P4: Typography** - Is text sizing appropriate for data hierarchy?
- [ ] **P5: Progressive Disclosure** - Is this collapsed by default?
- [ ] **P6: Visual Data** - Does this encode information (not decoration)?
- [ ] **P7: Chrome Budget** - How much vertical space does this add?
- [ ] **P8: Minimal Defaults** - Does this start in smallest state?
- [ ] **P9: Interaction** - Are transitions smooth (0.2s max)?
- [ ] **P10: Responsive** - Does this work on mobile collapsed?

### IA Validation

- [ ] **Context** - If visual indicator, is there UI to explain it?
- [ ] **Actionable** - Does this trigger a user action?
- [ ] **Learnable** - Can users discover what this means?

### Overall
- [ ] Passes ≥9/13 checks (70% threshold)
- [ ] No P0 violations (Content-First must pass)
```

---

## Pattern Alternatives

### When Visual Data Violates Other Principles

**Original Intent:** Show quality/emotion data visually

**Violating Pattern:**
```svelte
<!-- Always-visible glow -->
<PhotoCard class="quality-shimmer emotion-halo-{emotion}" />
```

**Adhering Alternatives:**

#### Option 1: Hover-Revealed Badges
```svelte
<PhotoCard>
  <div class="opacity-0 group-hover:opacity-100">
    <Badge variant="portfolio">Portfolio</Badge>
    <Badge variant="emotion" color={emotionColor}>
      {emotion}
    </Badge>
  </div>
</PhotoCard>
```

**Satisfies:**
- ✅ P1 (Content-First) - Clean by default
- ✅ P6 (Visual Data) - Data still encoded
- ✅ P8 (Minimal) - Hidden until interaction

---

#### Option 2: Functional Indicators
```svelte
<PhotoCard>
  <div class="group-hover:visible">
    <!-- Not just showing data, but actionable -->
    <Button onclick={() => filterByQuality('portfolio')}>
      <Star /> Portfolio
    </Button>
    <Button onclick={() => filterByEmotion(emotion)}>
      <Sparkles /> Find Similar
    </Button>
  </div>
</PhotoCard>
```

**Satisfies:**
- ✅ P1 (Content-First) - Minimal chrome
- ✅ P6 (Visual Data) - Data encoded in buttons
- ✅ IA (Context) - Buttons create mental model
- ✅ P8 (Minimal) - Hidden until needed

---

#### Option 3: Dedicated Filter UI
```svelte
<!-- Instead of decorating photos, create filter UI -->
<FilterBar>
  <QualityFilter /> <!-- Visual indicator WITH context -->
  <EmotionFilter /> <!-- Color swatches WITH labels -->
</FilterBar>

<PhotoGrid>
  <!-- Clean photos -->
  <PhotoCard /> <!-- No competing effects -->
</PhotoGrid>
```

**Satisfies:**
- ✅ P1 (Content-First) - Photos clean
- ✅ P2 (Inline Utility) - Filters as pills
- ✅ P3 (Gestalt) - Filters in header (global state)
- ✅ IA (Context) - Filter UI teaches meaning

---

## Audit Schedule

### Weekly: Feature Review
- Review all PRs/commits for new visual effects
- Run automated detection scripts
- Check cross-principle validation

### Monthly: Component Audit
- Review all PhotoCard variants
- Check filter components for IA violations
- Measure chrome budget across pages

### Quarterly: System-Wide Audit
- Run full design principles audit
- Update violation patterns
- Revise implementation guidelines

---

## Violation Severity

### P0: Critical (Blocks Release)
- Content buried below fold (violates P1)
- Chrome >60% of viewport (violates P7)
- Broken functionality (violates P6 intent)

### P1: High (Fix Before Next Release)
- Visual effects competing with photos (P1)
- Missing IA context (confusing UX)
- Not mobile responsive (P10)

### P2: Medium (Fix in Sprint)
- Not collapsed by default (P8)
- Gestalt violations (P3)
- Oversized typography (P4)

### P3: Low (Backlog)
- Animation timing not optimal (P9)
- Could be more minimal (P8)
- Minor spacing issues (P2)

---

## Prevention Tools

### 1. Browser Console Audit

```javascript
// Paste in console on any page
(function auditVisualEffects() {
  const photoCards = document.querySelectorAll('[data-photo-card]');

  const violations = {
    alwaysVisibleEffects: [],
    largeGlows: [],
    infiniteAnimations: [],
    missingContext: []
  };

  photoCards.forEach((card, i) => {
    const styles = window.getComputedStyle(card);

    // Check for always-visible effects
    if (styles.boxShadow !== 'none' && !card.matches(':hover')) {
      violations.alwaysVisibleEffects.push(`Card ${i}: box-shadow without hover`);
    }

    // Check for large glows
    const shadowMatch = styles.boxShadow.match(/(\d+)px.*rgba/g);
    if (shadowMatch && shadowMatch.some(s => parseInt(s) > 10)) {
      violations.largeGlows.push(`Card ${i}: glow >10px spread`);
    }

    // Check for infinite animations
    if (styles.animation.includes('infinite')) {
      violations.infiniteAnimations.push(`Card ${i}: infinite animation`);
    }

    // Check for color indicators without context
    const hasColorIndicator = card.className.match(/emotion-halo|category-color/);
    const hasFilter = document.querySelector(`[data-filter="${hasColorIndicator?.[0]}"]`);
    if (hasColorIndicator && !hasFilter) {
      violations.missingContext.push(`Card ${i}: ${hasColorIndicator[0]} without filter UI`);
    }
  });

  console.log('=== VISUAL EFFECTS AUDIT ===');
  console.table(violations);

  const totalViolations = Object.values(violations).flat().length;
  console.log(`\nTotal Violations: ${totalViolations}`);
  console.log(totalViolations === 0 ? '✅ PASS' : '❌ FAIL');

  return violations;
})();
```

### 2. ESLint Rule (Custom)

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'no-always-visible-effects': {
      create(context) {
        return {
          // Flag class assignments with shimmer/glow without hover
          'ClassDeclaration[name=/shimmer|glow|halo/]'(node) {
            if (!node.parent.selector.includes(':hover')) {
              context.report({
                node,
                message: 'Visual effects must be hover-only (P1 violation)'
              });
            }
          }
        };
      }
    }
  }
};
```

### 3. Git Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check for new visual effects
if git diff --cached --name-only | grep -E '\.(css|svelte)$'; then
  echo "Checking for design system violations..."

  # Flag always-visible effects
  if git diff --cached | grep -E "animation:.*infinite|box-shadow.*rgba.*\);" | grep -v ":hover"; then
    echo "❌ BLOCKED: Always-visible visual effects detected"
    echo "Visual effects must be hover-only (see .agent-os/audits/design-system-violations-audit.md)"
    exit 1
  fi

  echo "✅ No violations detected"
fi
```

---

## Example: Emotion Halos - Full Fix

### Before (Violates P1, P8, IA)

```css
/* Always visible, competes with photos */
.emotion-halo-triumph {
  box-shadow: 0 0 20px 8px rgba(255, 215, 0, 0.8);
  border-color: rgba(255, 215, 0, 0.5) !important;
}
```

```svelte
<!-- No context for colors -->
<PhotoCard class={emotionHaloClass} />
```

### After (Adheres to ALL Principles)

```css
/* Hover-only, subtle */
.emotion-halo-triumph:hover {
  box-shadow: 0 0 8px 2px rgba(255, 215, 0, 0.15);
  transition: box-shadow 0.2s ease;
}
```

```svelte
<!-- Functional + contextual -->
<PhotoCard class={emotionHaloClass}>
  {#if emotion}
    <Button
      class="opacity-0 group-hover:opacity-100"
      onclick={() => goto(`/explore?emotion=${emotion}`)}
      style="color: {emotionColor}"
    >
      <Sparkles /> Find Similar
    </Button>
  {/if}
</PhotoCard>

<!-- Filter UI provides context -->
<EmotionFilter options={emotions} /> <!-- Creates mental model -->
```

**Result:**
- ✅ P1 (Content-First) - Minimal hover effect
- ✅ P6 (Visual Data) - Still encodes emotion
- ✅ P8 (Minimal) - Hidden until hover
- ✅ IA (Context) - Button + filter teach meaning
- ✅ Functional - Triggers user action

---

## Success Metrics

### Target: 0 Cross-Principle Violations

Track violations over time:

```typescript
const metrics = {
  week: '2025-10-27',
  violations: {
    p0: 0,  // Critical
    p1: 2,  // High (emotion halos, quality shimmer)
    p2: 0,  // Medium
    p3: 0   // Low
  },
  newFeatures: 3,
  featuresWithViolations: 2,
  violationRate: '67%'  // Target: <10%
};
```

**Goals:**
- P0 violations: Always 0
- P1 violations: <1 per quarter
- Violation rate: <10% of new features

---

## Next Steps

1. **Immediate:**
   - [x] Audit emotion halos → Fixed (hover-only + Find Similar)
   - [x] Audit quality shimmer → Fixed (disabled)
   - [ ] Run automated detection script on all components

2. **This Week:**
   - [ ] Create pre-commit hook
   - [ ] Document all current visual effects
   - [ ] Review PhotoCard for other violations

3. **This Month:**
   - [ ] Audit all pages with cross-principle matrix
   - [ ] Establish feature review process
   - [ ] Create ESLint rules

---

**Remember:** Satisfying ONE principle while violating OTHERS is a net negative. Features must pass the full cross-principle validation.
