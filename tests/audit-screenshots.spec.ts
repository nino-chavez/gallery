import { test } from '@playwright/test';

const breakpoints = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 },
];

const pages = [
  { path: '/', name: 'home' },
  { path: '/explore', name: 'explore' },
  { path: '/collections', name: 'collections' },
  { path: '/albums', name: 'albums' }
];

for (const bp of breakpoints) {
  for (const pageInfo of pages) {
    test(`Screenshot ${bp.name} - ${pageInfo.name}`, async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto(pageInfo.path, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for animations
      await page.waitForTimeout(1000);

      // Capture viewport screenshot
      await page.screenshot({
        path: `audit-${bp.name}-${pageInfo.name}.png`,
        fullPage: false
      });
    });
  }
}