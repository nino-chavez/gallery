/**
 * Visual Effects Audit Script
 *
 * Detects design system violations like emotion halos and quality shimmer
 *
 * Usage:
 * 1. Open any page in browser
 * 2. Open DevTools console
 * 3. Paste this entire file and run
 */

(function auditVisualEffects() {
  console.log('%c=== VISUAL EFFECTS AUDIT ===', 'font-size: 16px; font-weight: bold; color: #eab308');
  console.log('Checking for design system violations...\n');

  const photoCards = document.querySelectorAll('[data-photo-card], .photo-card, [class*="PhotoCard"]');

  if (photoCards.length === 0) {
    console.warn('⚠️  No photo cards found on this page');
    return;
  }

  console.log(`Found ${photoCards.length} photo cards\n`);

  const violations = {
    alwaysVisibleEffects: [],
    largeGlows: [],
    infiniteAnimations: [],
    missingContext: [],
    highOpacityEffects: []
  };

  const warnings = {
    subtleEffects: [],
    hoverEffects: []
  };

  photoCards.forEach((card, i) => {
    const styles = window.getComputedStyle(card);
    const classes = card.className;

    // Check 1: Always-visible box-shadow (P1 violation)
    if (styles.boxShadow !== 'none' && !card.matches(':hover')) {
      const shadow = styles.boxShadow;
      const hasLargeSpread = shadow.match(/(\d+)px/g)?.some(s => parseInt(s) > 10);
      const hasHighOpacity = shadow.match(/rgba?\([^)]+,\s*([\d.]+)\)/)?.[1];

      if (hasHighOpacity && parseFloat(hasHighOpacity) > 0.3) {
        violations.alwaysVisibleEffects.push({
          card: i,
          issue: 'Always-visible box-shadow with high opacity',
          value: shadow.substring(0, 80) + '...',
          principle: 'P1: Content-First',
          severity: 'P1'
        });
      } else if (hasLargeSpread) {
        violations.largeGlows.push({
          card: i,
          issue: 'Large glow spread (>10px)',
          value: shadow.substring(0, 80) + '...',
          principle: 'P1: Content-First',
          severity: 'P1'
        });
      } else {
        warnings.subtleEffects.push({
          card: i,
          note: 'Has box-shadow but subtle (<0.3 opacity)',
          ok: true
        });
      }
    }

    // Check 2: Infinite animations (P1, P8 violation)
    if (styles.animation && styles.animation.includes('infinite')) {
      violations.infiniteAnimations.push({
        card: i,
        issue: 'Infinite animation on photo card',
        value: styles.animation,
        principle: 'P1: Content-First, P8: Minimal Defaults',
        severity: 'P1'
      });
    }

    // Check 3: Color-coded classes without context (IA violation)
    const colorClasses = classes.match(/emotion-halo-\w+|category-color-\w+|quality-\w+/g);
    if (colorClasses) {
      colorClasses.forEach(cls => {
        const filterType = cls.includes('emotion') ? 'emotion' :
                          cls.includes('category') ? 'category' : 'quality';
        const hasFilter = document.querySelector(`[data-filter="${filterType}"]`);

        if (!hasFilter) {
          violations.missingContext.push({
            card: i,
            issue: `Color-coded class without filter UI`,
            value: cls,
            principle: 'IA: Context Required',
            severity: 'P1'
          });
        }
      });
    }

    // Check 4: Will-change (performance anti-pattern)
    if (styles.willChange !== 'auto') {
      warnings.subtleEffects.push({
        card: i,
        note: `Has will-change: ${styles.willChange}`,
        recommendation: 'Only use will-change for active animations'
      });
    }
  });

  // Check for hover-only effects (GOOD pattern)
  const styleSheets = Array.from(document.styleSheets);
  let hoverOnlyCount = 0;

  styleSheets.forEach(sheet => {
    try {
      const rules = Array.from(sheet.cssRules || []);
      rules.forEach(rule => {
        if (rule.selectorText?.includes(':hover') &&
            (rule.cssText.includes('box-shadow') || rule.cssText.includes('border'))) {
          hoverOnlyCount++;
        }
      });
    } catch (e) {
      // CORS prevents reading some stylesheets
    }
  });

  if (hoverOnlyCount > 0) {
    console.log(`%c✅ Found ${hoverOnlyCount} hover-only visual effects (GOOD)`, 'color: #10b981');
  }

  // Report violations
  const totalViolations = Object.values(violations).flat().length;

  console.log('\n%c━━━ VIOLATIONS ━━━', 'font-size: 14px; font-weight: bold; color: #ef4444');

  if (totalViolations === 0) {
    console.log('%c✅ No violations found!', 'color: #10b981; font-weight: bold');
  } else {
    Object.entries(violations).forEach(([category, items]) => {
      if (items.length > 0) {
        console.group(`%c❌ ${category} (${items.length})`, 'color: #ef4444; font-weight: bold');
        items.forEach((item, i) => {
          console.log(`\n${i + 1}. Card #${item.card}`);
          console.log(`   Issue: ${item.issue}`);
          console.log(`   Value: ${item.value}`);
          console.log(`   Violates: ${item.principle}`);
          console.log(`   Severity: ${item.severity}`);
        });
        console.groupEnd();
      }
    });
  }

  // Report warnings
  const totalWarnings = Object.values(warnings).flat().length;

  if (totalWarnings > 0) {
    console.log('\n%c━━━ WARNINGS ━━━', 'font-size: 14px; font-weight: bold; color: #f59e0b');
    Object.entries(warnings).forEach(([category, items]) => {
      if (items.length > 0) {
        console.group(`%c⚠️  ${category} (${items.length})`, 'color: #f59e0b');
        items.forEach((item, i) => {
          console.log(`${i + 1}. Card #${item.card}: ${item.note}`);
          if (item.recommendation) {
            console.log(`   💡 ${item.recommendation}`);
          }
        });
        console.groupEnd();
      }
    });
  }

  // Summary
  console.log('\n%c━━━ SUMMARY ━━━', 'font-size: 14px; font-weight: bold');
  console.log(`Cards Audited: ${photoCards.length}`);
  console.log(`Violations: ${totalViolations}`);
  console.log(`Warnings: ${totalWarnings}`);
  console.log(`Hover Effects: ${hoverOnlyCount}`);

  const pass = totalViolations === 0;
  console.log(`\n${pass ? '✅' : '❌'} Overall: ${pass ? 'PASS' : 'FAIL'}`);

  if (!pass) {
    console.log('\n%c📖 See .agent-os/audits/design-system-violations-audit.md for fix patterns',
                'color: #eab308; font-style: italic');
  }

  // Return structured data
  return {
    totalCards: photoCards.length,
    violations,
    warnings,
    hoverEffects: hoverOnlyCount,
    pass
  };
})();
