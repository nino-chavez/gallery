import { test, expect } from '@playwright/test';
import { promises as fs } from 'fs';
import * as path from 'path';

// Audit breakpoints as defined in the framework
const AUDIT_BREAKPOINTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

// Pages to audit
const PAGES_TO_AUDIT = [
  { name: 'home', url: '/' },
  { name: 'explore', url: '/explore' },
  { name: 'timeline', url: '/timeline' },
  { name: 'albums', url: '/albums' },
  { name: 'collections', url: '/collections' },
  { name: 'favorites', url: '/favorites' },
];

const OUTPUT_DIR = path.resolve(process.cwd(), '.agent-os/audits/screenshots');

test.describe('UX/UI Layout Audit Screenshots', () => {
  test.beforeAll(async () => {
    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  });

  for (const page of PAGES_TO_AUDIT) {
    for (const breakpoint of AUDIT_BREAKPOINTS) {
      test(`${page.name} at ${breakpoint.name} (${breakpoint.width}px)`, async ({ browser }) => {
        const context = await browser.newContext({
          viewport: { width: breakpoint.width, height: breakpoint.height },
          deviceScaleFactor: 2, // High quality screenshots
        });
        const browserPage = await context.newPage();

        // Navigate to the page
        await browserPage.goto(`http://localhost:5173${page.url}`, {
          waitUntil: 'networkidle',
          timeout: 30000,
        });

        // Wait for any animations to complete
        await browserPage.waitForTimeout(1000);

        // Take viewport screenshot (above the fold)
        await browserPage.screenshot({
          path: path.join(OUTPUT_DIR, `${breakpoint.name}-${page.name}-viewport.png`),
          fullPage: false,
        });

        // Take full page screenshot
        await browserPage.screenshot({
          path: path.join(OUTPUT_DIR, `${breakpoint.name}-${page.name}-full.png`),
          fullPage: true,
        });

        // Capture hover states on interactive elements (if any)
        try {
          // Find first button or interactive element
          const button = await browserPage.locator('button:visible, a:visible').first();
          if (await button.count() > 0) {
            await button.hover();
            await browserPage.waitForTimeout(300);
            await browserPage.screenshot({
              path: path.join(OUTPUT_DIR, `${breakpoint.name}-${page.name}-hover.png`),
              fullPage: false,
            });
          }
        } catch (e) {
          // No interactive elements found, skip hover screenshot
        }

        // Capture focus state
        try {
          await browserPage.keyboard.press('Tab');
          await browserPage.waitForTimeout(300);
          await browserPage.screenshot({
            path: path.join(OUTPUT_DIR, `${breakpoint.name}-${page.name}-focus.png`),
            fullPage: false,
          });
        } catch (e) {
          // No focusable elements, skip
        }

        await context.close();
      });
    }
  }
});

// Summary test
test('Generate audit summary', async () => {
  const files = await fs.readdir(OUTPUT_DIR);
  const screenshots = files.filter(f => f.endsWith('.png'));

  console.log('\n=== AUDIT SCREENSHOTS GENERATED ===');
  console.log(`Total screenshots: ${screenshots.length}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);

  // Group by breakpoint
  for (const breakpoint of AUDIT_BREAKPOINTS) {
    const breakpointFiles = screenshots.filter(f => f.startsWith(breakpoint.name));
    console.log(`\n${breakpoint.name.toUpperCase()} (${breakpoint.width}px):`);
    breakpointFiles.forEach(f => console.log(`  - ${f}`));
  }
});