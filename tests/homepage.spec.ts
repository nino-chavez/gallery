import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Journey 1: Homepage to Explore Flow
 *
 * Tests:
 * - Homepage loads correctly
 * - Navigation cards are visible and clickable
 * - Navigation to Explore page works
 * - Accessibility compliance
 */
test.describe('Homepage', () => {
	test('should load homepage successfully', async ({ page }) => {
		await page.goto('/');

		// Verify page loads
		await expect(page).toHaveTitle(/Gallery/i);

		// Verify hero section
		const heading = page.getByRole('heading', { level: 1 });
		await expect(heading).toBeVisible();
	});

	test('should display navigation cards', async ({ page }) => {
		await page.goto('/');

		// Wait for cards to render
		await page.waitForSelector('[role="button"]', { timeout: 5000 });

		// Verify Explore card
		const exploreCard = page.locator('text=Explore').first();
		await expect(exploreCard).toBeVisible();

		// Verify Collections card
		const collectionsCard = page.locator('text=Collections').first();
		await expect(collectionsCard).toBeVisible();

		// Verify Albums card
		const albumsCard = page.locator('text=Albums').first();
		await expect(albumsCard).toBeVisible();
	});

	test('should navigate to Explore page when clicking Explore card', async ({ page }) => {
		await page.goto('/');

		// Click Explore card
		await page.locator('text=Explore').first().click();

		// Verify navigation
		await expect(page).toHaveURL('/explore');

		// Verify Explore page loaded
		const heading = page.getByRole('heading', { name: /explore/i });
		await expect(heading).toBeVisible();
	});

	test('should navigate to Collections page when clicking Collections card', async ({ page }) => {
		await page.goto('/');

		// Click Collections card
		await page.locator('text=Collections').first().click();

		// Verify navigation
		await expect(page).toHaveURL('/collections');
	});

	test('should navigate to Albums page when clicking Albums card', async ({ page }) => {
		await page.goto('/');

		// Click Albums card
		await page.locator('text=Albums').first().click();

		// Verify navigation
		await expect(page).toHaveURL('/albums');
	});

	test('should have no accessibility violations', async ({ page }) => {
		await page.goto('/');

		// Run axe accessibility scan
		const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

		// Assert no violations
		expect(accessibilityScanResults.violations).toEqual([]);
	});

	test('should display header navigation', async ({ page }) => {
		await page.goto('/');

		// Verify header links
		const homeLink = page.getByRole('button', { name: /home/i });
		await expect(homeLink).toBeVisible();

		const exploreLink = page.getByRole('button', { name: /explore/i });
		await expect(exploreLink).toBeVisible();

		const favoritesLink = page.getByRole('button', { name: /favorites/i });
		await expect(favoritesLink).toBeVisible();
	});

	test('should navigate using header links', async ({ page }) => {
		await page.goto('/');

		// Click Explore in header
		await page.getByRole('button', { name: /explore/i }).click();
		await expect(page).toHaveURL('/explore');

		// Click Home to go back
		await page.getByRole('button', { name: /home/i }).click();
		await expect(page).toHaveURL('/');
	});
});
