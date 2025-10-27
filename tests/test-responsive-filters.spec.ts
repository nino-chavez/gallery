import { test, expect } from '@playwright/test';

/**
 * Responsive Filter Testing Suite
 * Tests the /explore page filter behavior across different viewport sizes
 */

const BASE_URL = 'http://localhost:5175/explore';

test.describe('Explore Page - Responsive Filter Behavior', () => {
  test('Mobile (375px) - Filter drawer should be collapsed by default', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Mobile toggle button should be visible
    const mobileToggle = page.locator('button:has-text("Advanced Filters")');
    await expect(mobileToggle).toBeVisible();

    // Advanced filters should be hidden initially (only Sport/Category pills visible)
    const playTypeFilter = page.locator('text=Play Type');
    await expect(playTypeFilter).toBeHidden();

    // Take screenshot
    await page.screenshot({ path: '/tmp/mobile-375-filters-collapsed.png', fullPage: true });
  });

  test('Mobile (375px) - Filter drawer should expand on toggle', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Click the mobile toggle button
    await page.click('button:has-text("Advanced Filters")');
    await page.waitForTimeout(300); // Wait for animation

    // Advanced filters should now be visible
    const playTypeFilter = page.locator('text=Play Type');
    await expect(playTypeFilter).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: '/tmp/mobile-375-filters-expanded.png', fullPage: true });
  });

  test('Tablet (768px) - Filters should be visible (no drawer)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Mobile toggle button should NOT be visible at md breakpoint
    const mobileToggle = page.locator('button:has-text("Advanced Filters")');
    await expect(mobileToggle).toBeHidden();

    // Advanced filters should be visible by default
    const playTypeFilter = page.locator('text=Play Type');
    await expect(playTypeFilter).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: '/tmp/tablet-768-filters-visible.png', fullPage: true });
  });

  test('Desktop (1440px) - All filters visible', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 }); // Desktop
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Mobile toggle should not be visible
    const mobileToggle = page.locator('button:has-text("Advanced Filters")');
    await expect(mobileToggle).toBeHidden();

    // All filter sections should be visible
    const filterSections = [
      'Play Type',
      'Action Intensity',
      'Lighting',
      'Color Temperature',
      'Time of Day'
    ];

    for (const section of filterSections) {
      const filterElement = page.locator(`text=${section}`);
      await expect(filterElement).toBeVisible();
    }

    // Take screenshot
    await page.screenshot({ path: '/tmp/desktop-1440-all-filters.png', fullPage: true });
  });

  test('Active filter count badge appears correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Initially no active filters
    const initialBadge = page.locator('span:has-text("Filters")').locator('..').locator('span.bg-gold-500\\/20');
    await expect(initialBadge).toBeHidden();

    // Click a sport filter (e.g., Volleyball)
    const volleyballPill = page.locator('button:has-text("Volleyball")').first();
    if (await volleyballPill.isVisible()) {
      await volleyballPill.click();
      await page.waitForURL(/sport=/, { timeout: 5000 });

      // Active filter badge should now show "1"
      const activeBadge = page.locator('span.bg-gold-500\\/20:has-text("1")').first();
      await expect(activeBadge).toBeVisible();

      // Take screenshot
      await page.screenshot({ path: '/tmp/mobile-375-active-filter-badge.png', fullPage: true });
    }
  });

  test('Clear All Filters button appears and works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Click a category filter to activate it
    const categoryButtons = page.locator('button[class*="rounded-full"]');
    const firstCategory = categoryButtons.first();
    if (await firstCategory.isVisible()) {
      await firstCategory.click();
      await page.waitForTimeout(500);

      // Clear All button should appear
      const clearAllButton = page.locator('button:has-text("Clear All")');
      await expect(clearAllButton).toBeVisible();

      // Take screenshot before clear
      await page.screenshot({ path: '/tmp/mobile-375-before-clear-all.png', fullPage: true });

      // Click Clear All
      await clearAllButton.click();
      await page.waitForTimeout(500);

      // Clear All button should be hidden again
      await expect(clearAllButton).toBeHidden();

      // Take screenshot after clear
      await page.screenshot({ path: '/tmp/mobile-375-after-clear-all.png', fullPage: true });
    }
  });

  test('Empty state shows correct messaging when filters active', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate with impossible filter combination
    await page.goto(`${BASE_URL}?sport=volleyball&category=impossible-category-xyz`);
    await page.waitForLoadState('networkidle');

    // Empty state should show filter-specific messaging
    const emptyMessage = page.locator('text=No photos match your filters');
    await expect(emptyMessage).toBeVisible();

    // Clear All button should be visible in empty state
    const clearAllButton = page.locator('button:has-text("Clear All Filters")');
    await expect(clearAllButton).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: '/tmp/mobile-375-empty-state-filtered.png', fullPage: true });
  });
});
