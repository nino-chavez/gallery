import { test, expect } from '@playwright/test';

/**
 * Performance Tests
 * 
 * Measures Core Web Vitals and performance metrics
 * Run with: npm run test -- performance
 */

test.describe('Performance Tests', () => {
  test('homepage performance metrics', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Measure performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      };
    });
    
    // Assert performance thresholds
    expect(metrics.firstContentfulPaint).toBeLessThan(2000); // FCP < 2s
    expect(metrics.domContentLoaded).toBeLessThan(3000); // DCL < 3s
    expect(metrics.loadComplete).toBeLessThan(5000); // Load < 5s
    
    console.log('Homepage Performance Metrics:', metrics);
  });

  test('explore page performance metrics', async ({ page }) => {
    await page.goto('/explore', { waitUntil: 'networkidle' });
    
    // Wait for photos to load
    await page.waitForSelector('[data-testid="photo-card"], img[alt*="photo"]', {
      timeout: 10000,
    });
    
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      // Calculate image load times
      const imageLoads = resources
        .filter(r => r.initiatorType === 'img')
        .map(r => r.responseEnd - r.startTime);
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalResources: resources.length,
        imageCount: imageLoads.length,
        avgImageLoadTime: imageLoads.length > 0 
          ? imageLoads.reduce((a, b) => a + b, 0) / imageLoads.length 
          : 0,
        maxImageLoadTime: imageLoads.length > 0 ? Math.max(...imageLoads) : 0,
      };
    });
    
    // Assert performance thresholds
    expect(metrics.domContentLoaded).toBeLessThan(3000);
    expect(metrics.avgImageLoadTime).toBeLessThan(2000); // Avg image load < 2s
    expect(metrics.maxImageLoadTime).toBeLessThan(5000); // Max image load < 5s
    
    console.log('Explore Page Performance Metrics:', metrics);
  });

  test('lighthouse performance score', async ({ page }) => {
    // Note: Requires @playwright/test lighthouse plugin or separate lighthouse CI
    // This is a placeholder structure
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Basic performance check
    const performanceScore = await page.evaluate(() => {
      // Calculate performance score based on metrics
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const fcp = performance.getEntriesByType('paint')
        .find(p => p.name === 'first-contentful-paint')?.startTime || 0;
      
      // Simplified scoring (actual Lighthouse uses more complex algorithm)
      let score = 100;
      if (fcp > 1800) score -= 10;
      if (fcp > 3000) score -= 20;
      if (navigation.loadEventEnd > 5000) score -= 10;
      
      return Math.max(0, score);
    });
    
    expect(performanceScore).toBeGreaterThan(80); // Target: >80
    console.log('Performance Score:', performanceScore);
  });

  test('image loading performance', async ({ page }) => {
    await page.goto('/explore');
    
    // Track image load events using Performance API
    const imageLoadTimes: number[] = [];
    
    // Use Performance API to measure image load times
    const loadTimes = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return entries
        .filter(e => e.name.match(/\.(jpg|jpeg|png|webp)/i))
        .map(e => e.responseEnd - e.requestStart);
    });
    
    imageLoadTimes.push(...loadTimes);
    
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for all images to load
    await page.waitForTimeout(3000);
    
    // Get final load times
    const finalLoadTimes = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return entries
        .filter(e => e.name.match(/\.(jpg|jpeg|png|webp)/i))
        .map(e => e.responseEnd - e.requestStart);
    });
    
    imageLoadTimes.push(...finalLoadTimes);
    
    // Assert image loading performance
    if (imageLoadTimes.length > 0) {
      const avgLoadTime = imageLoadTimes.reduce((a, b) => a + b, 0) / imageLoadTimes.length;
      const maxLoadTime = Math.max(...imageLoadTimes);
      
      expect(avgLoadTime).toBeLessThan(2000); // Avg < 2s
      expect(maxLoadTime).toBeLessThan(5000); // Max < 5s
      
      console.log('Image Loading Metrics:', {
        count: imageLoadTimes.length,
        avgLoadTime: `${avgLoadTime.toFixed(2)}ms`,
        maxLoadTime: `${maxLoadTime.toFixed(2)}ms`,
      });
    }
  });

  test('memory usage check', async ({ page }) => {
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');
    
    // Check memory usage (if available)
    const memoryInfo = await page.evaluate(() => {
      const perf = (performance as any).memory;
      if (perf) {
        return {
          usedJSHeapSize: perf.usedJSHeapSize,
          totalJSHeapSize: perf.totalJSHeapSize,
          jsHeapSizeLimit: perf.jsHeapSizeLimit,
        };
      }
      return null;
    });
    
    if (memoryInfo) {
      const usedMB = memoryInfo.usedJSHeapSize / 1024 / 1024;
      const limitMB = memoryInfo.jsHeapSizeLimit / 1024 / 1024;
      
      console.log('Memory Usage:', {
        used: `${usedMB.toFixed(2)}MB`,
        limit: `${limitMB.toFixed(2)}MB`,
        percentUsed: `${((usedMB / limitMB) * 100).toFixed(2)}%`,
      });
      
      // Warn if using more than 50% of heap
      expect(usedMB / limitMB).toBeLessThan(0.8); // < 80% usage
    }
  });
});

