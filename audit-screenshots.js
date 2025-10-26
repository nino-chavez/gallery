import { chromium } from 'playwright';

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

async function captureScreenshots() {
  const browser = await chromium.launch();

  for (const bp of breakpoints) {
    const context = await browser.newContext({
      viewport: { width: bp.width, height: bp.height },
      deviceScaleFactor: 2, // For high-quality screenshots
    });
    const page = await context.newPage();

    for (const pageInfo of pages) {
      try {
        await page.goto(`http://localhost:5173${pageInfo.path}`, {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        // Wait for animations to settle
        await page.waitForTimeout(1000);

        // Capture viewport screenshot
        await page.screenshot({
          path: `audit-${bp.name}-${pageInfo.name}.png`,
          fullPage: false
        });

        console.log(`✓ Captured ${bp.name} - ${pageInfo.name}`);
      } catch (error) {
        console.error(`✗ Failed to capture ${bp.name} - ${pageInfo.name}:`, error.message);
      }
    }

    await context.close();
  }

  await browser.close();
}

captureScreenshots().catch(console.error);