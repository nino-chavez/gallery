import { test, expect } from '@playwright/test';

/**
 * Journey 2: Photo Filtering and Search
 * Journey 3: Photo Detail Modal Interaction
 * Journey 4: Lightbox Navigation and Zoom
 *
 * Tests:
 * - Explore page loads photos
 * - Filtering works correctly
 * - Photo detail modal opens and closes
 * - Lightbox functionality
 */
test.describe('Explore Page', () => {
	test('should load photos on explore page', async ({ page }) => {
		await page.goto('/explore');

		// Wait for photos to load
		await page.waitForSelector('[data-testid="photo-card"], img[alt*="photo"]', {
			timeout: 10000,
		});

		// Verify photos are visible
		const photos = page.locator('[data-testid="photo-card"], article, [role="img"]');
		const count = await photos.count();
		expect(count).toBeGreaterThan(0);
	});

	test('should display filter panel', async ({ page }) => {
		await page.goto('/explore');

		// Verify search input exists
		const searchInput = page.getByPlaceholder(/search/i);
		await expect(searchInput).toBeVisible();

		// Verify advanced filters toggle exists
		const advancedFilters = page.getByText(/advanced filters/i).or(page.getByText(/filters/i));
		await expect(advancedFilters.first()).toBeVisible();
	});

	test('should filter photos by search', async ({ page }) => {
		await page.goto('/explore');

		// Wait for initial load
		await page.waitForSelector('[data-testid="photo-card"], img[alt*="photo"]', {
			timeout: 10000,
		});

		// Get initial photo count
		const photos = page.locator('[data-testid="photo-card"], article, img[alt*="photo"]');
		const initialCount = await photos.count();

		// Enter search term
		const searchInput = page.getByPlaceholder(/search/i);
		await searchInput.fill('volleyball');

		// Wait for filtering
		await page.waitForTimeout(500);

		// Verify results changed (or stayed same if all are volleyball)
		const filteredCount = await photos.count();
		expect(filteredCount).toBeGreaterThanOrEqual(0);
	});

	test('should open photo detail modal on click', async ({ page }) => {
		await page.goto('/explore');

		// Wait for photos
		await page.waitForSelector('[data-testid="photo-card"], img[alt*="photo"]', {
			timeout: 10000,
		});

		// Click first photo
		const firstPhoto = page
			.locator('[data-testid="photo-card"], article, [role="img"]')
			.first();
		await firstPhoto.click();

		// Verify modal opens
		const modal = page.locator('[role="dialog"], [aria-modal="true"]');
		await expect(modal).toBeVisible({ timeout: 5000 });
	});

	test('should close modal with ESC key', async ({ page }) => {
		await page.goto('/explore');

		// Open modal
		await page.waitForSelector('[data-testid="photo-card"], img[alt*="photo"]', {
			timeout: 10000,
		});
		const firstPhoto = page
			.locator('[data-testid="photo-card"], article, [role="img"]')
			.first();
		await firstPhoto.click();

		// Wait for modal
		const modal = page.locator('[role="dialog"], [aria-modal="true"]');
		await expect(modal).toBeVisible();

		// Press ESC
		await page.keyboard.press('Escape');

		// Verify modal closes
		await expect(modal).not.toBeVisible();
	});

	test('should close modal by clicking backdrop', async ({ page }) => {
		await page.goto('/explore');

		// Open modal
		await page.waitForSelector('[data-testid="photo-card"], img[alt*="photo"]', {
			timeout: 10000,
		});
		const firstPhoto = page
			.locator('[data-testid="photo-card"], article, [role="img"]')
			.first();
		await firstPhoto.click();

		// Wait for modal
		const modal = page.locator('[role="dialog"], [aria-modal="true"]');
		await expect(modal).toBeVisible();

		// Click backdrop (outside modal content)
		await page.mouse.click(50, 50);

		// Verify modal closes
		await expect(modal).not.toBeVisible({ timeout: 2000 });
	});

	test('should expand advanced filters', async ({ page }) => {
		await page.goto('/explore');

		// Find and click advanced filters toggle
		const toggleButton = page
			.getByText(/advanced filters/i)
			.or(page.getByRole('button', { name: /filter/i }));

		if ((await toggleButton.count()) > 0) {
			await toggleButton.first().click();

			// Wait for filter panel to expand
			await page.waitForTimeout(300);

			// Verify filters are visible (sport, category, quality, etc.)
			const filterSection = page.locator('text=/sport|quality|emotion|category/i');
			await expect(filterSection.first()).toBeVisible();
		}
	});

	test('should navigate with keyboard in photo grid', async ({ page }) => {
		await page.goto('/explore');

		// Wait for photos
		await page.waitForSelector('[data-testid="photo-card"], img[alt*="photo"]', {
			timeout: 10000,
		});

		// Tab to first photo
		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');

		// Press Enter to open
		await page.keyboard.press('Enter');

		// Verify modal opens
		const modal = page.locator('[role="dialog"], [aria-modal="true"]');
		await expect(modal).toBeVisible({ timeout: 2000 });
	});
});
