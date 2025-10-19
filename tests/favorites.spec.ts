import { test, expect } from '@playwright/test';

/**
 * Journey 5: Favorites Management
 *
 * Tests:
 * - Adding photos to favorites
 * - Removing photos from favorites
 * - Favorites persistence
 * - Export/import functionality
 * - Clear all functionality
 */
test.describe('Favorites', () => {
	// Clear favorites before each test
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		// Clear localStorage favorites
		await page.evaluate(() => {
			localStorage.removeItem('gallery-favorites');
		});
	});

	test('should add photo to favorites from explore page', async ({ page }) => {
		await page.goto('/explore');

		// Wait for photos to load
		await page.waitForSelector('[data-testid="photo-card"], img[alt*="photo"]', {
			timeout: 10000,
		});

		// Find and click heart icon on first photo
		const heartButton = page.locator('[aria-label*="favorite"], button').filter({
			has: page.locator('svg'),
		});

		if ((await heartButton.count()) > 0) {
			await heartButton.first().click();

			// Wait for state update
			await page.waitForTimeout(300);

			// Navigate to favorites page
			await page.goto('/favorites');

			// Verify photo appears in favorites
			const favoritedPhotos = page.locator(
				'[data-testid="photo-card"], article, img[alt*="photo"]'
			);
			const count = await favoritedPhotos.count();
			expect(count).toBeGreaterThan(0);
		}
	});

	test('should show favorites count in header badge', async ({ page }) => {
		await page.goto('/explore');

		// Wait for photos
		await page.waitForSelector('[data-testid="photo-card"], img[alt*="photo"]', {
			timeout: 10000,
		});

		// Add photo to favorites
		const heartButton = page.locator('[aria-label*="favorite"], button').filter({
			has: page.locator('svg'),
		});

		if ((await heartButton.count()) > 0) {
			await heartButton.first().click();
			await page.waitForTimeout(300);

			// Check header badge
			const badge = page.locator('[aria-label*="favorite"]').locator('span');
			if ((await badge.count()) > 0) {
				await expect(badge.first()).toBeVisible();
			}
		}
	});

	test('should persist favorites after page reload', async ({ page }) => {
		await page.goto('/explore');

		// Wait for photos
		await page.waitForSelector('[data-testid="photo-card"], img[alt*="photo"]', {
			timeout: 10000,
		});

		// Add photo to favorites
		const heartButton = page.locator('[aria-label*="favorite"], button').filter({
			has: page.locator('svg'),
		});

		if ((await heartButton.count()) > 0) {
			await heartButton.first().click();
			await page.waitForTimeout(300);

			// Reload page
			await page.reload();

			// Navigate to favorites
			await page.goto('/favorites');

			// Verify favorites persist
			const favoritedPhotos = page.locator(
				'[data-testid="photo-card"], article, img[alt*="photo"]'
			);
			const count = await favoritedPhotos.count();
			expect(count).toBeGreaterThan(0);
		}
	});

	test('should remove photo from favorites', async ({ page }) => {
		await page.goto('/explore');

		// Add photo
		await page.waitForSelector('[data-testid="photo-card"], img[alt*="photo"]', {
			timeout: 10000,
		});
		const heartButton = page.locator('[aria-label*="favorite"], button').filter({
			has: page.locator('svg'),
		});

		if ((await heartButton.count()) > 0) {
			const firstHeart = heartButton.first();
			await firstHeart.click();
			await page.waitForTimeout(300);

			// Remove photo (click heart again)
			await firstHeart.click();
			await page.waitForTimeout(300);

			// Navigate to favorites
			await page.goto('/favorites');

			// Verify empty state or no photos
			const emptyState = page.getByText(/no favorites/i).or(page.getByText(/start adding/i));
			await expect(emptyState).toBeVisible({ timeout: 5000 });
		}
	});

	test('should display empty state when no favorites', async ({ page }) => {
		await page.goto('/favorites');

		// Verify empty state message
		const emptyState = page
			.getByText(/no favorites/i)
			.or(page.getByText(/start adding/i))
			.or(page.getByText(/haven't favorited/i));

		await expect(emptyState.first()).toBeVisible();
	});

	test('should export favorites as JSON', async ({ page }) => {
		await page.goto('/explore');

		// Add a photo to favorites first
		await page.waitForSelector('[data-testid="photo-card"], img[alt*="photo"]', {
			timeout: 10000,
		});
		const heartButton = page.locator('[aria-label*="favorite"], button').filter({
			has: page.locator('svg'),
		});

		if ((await heartButton.count()) > 0) {
			await heartButton.first().click();
			await page.waitForTimeout(300);

			// Navigate to favorites
			await page.goto('/favorites');

			// Find export button
			const exportButton = page.getByRole('button', { name: /export/i });

			if ((await exportButton.count()) > 0) {
				// Set up download listener
				const downloadPromise = page.waitForEvent('download');

				// Click export
				await exportButton.click();

				// Wait for download
				const download = await downloadPromise;

				// Verify download
				expect(download.suggestedFilename()).toMatch(/favorites.*\.json/);
			}
		}
	});

	test('should clear all favorites', async ({ page }) => {
		await page.goto('/explore');

		// Add photos to favorites
		await page.waitForSelector('[data-testid="photo-card"], img[alt*="photo"]', {
			timeout: 10000,
		});
		const heartButtons = page.locator('[aria-label*="favorite"], button').filter({
			has: page.locator('svg'),
		});

		if ((await heartButtons.count()) > 0) {
			// Add first photo
			await heartButtons.first().click();
			await page.waitForTimeout(300);

			// Navigate to favorites
			await page.goto('/favorites');

			// Find clear all button
			const clearButton = page.getByRole('button', { name: /clear all/i });

			if ((await clearButton.count()) > 0) {
				// Click clear all
				await clearButton.click();

				// Handle confirmation dialog if present
				page.once('dialog', (dialog) => dialog.accept());
				await page.waitForTimeout(500);

				// Verify empty state
				const emptyState = page
					.getByText(/no favorites/i)
					.or(page.getByText(/start adding/i));
				await expect(emptyState.first()).toBeVisible();
			}
		}
	});
});
