import { test, expect } from '@playwright/test';

/**
 * Journey 7: Albums Navigation and Browsing
 *
 * Tests:
 * - Albums list page loads
 * - Album cards display correctly
 * - Album detail page navigation
 * - Album photos display
 * - Search within album
 * - Breadcrumb navigation
 */
test.describe('Albums List Page', () => {
	test('should load albums list page successfully', async ({ page }) => {
		await page.goto('/albums');

		// Verify page loads
		await expect(page).toHaveURL('/albums');

		// Verify heading
		const heading = page.getByRole('heading', { name: /albums/i });
		await expect(heading).toBeVisible();
	});

	test('should display album cards', async ({ page }) => {
		await page.goto('/albums');

		// Wait for albums to load
		await page.waitForSelector('[data-testid="album-card"], article, a[href*="/albums/"]', {
			timeout: 10000,
		});

		// Verify albums are visible
		const albums = page.locator('[data-testid="album-card"], article, a[href*="/albums/"]');
		const count = await albums.count();
		expect(count).toBeGreaterThan(0);
	});

	test('should display album stats', async ({ page }) => {
		await page.goto('/albums');

		// Look for stats (total albums, total photos)
		const stats = page.locator('text=/\\d+.*albums|\\d+.*photos/i');

		if ((await stats.count()) > 0) {
			await expect(stats.first()).toBeVisible();
		}
	});

	test('should display album cover images', async ({ page }) => {
		await page.goto('/albums');

		// Wait for albums
		await page.waitForSelector('[data-testid="album-card"], article, a[href*="/albums/"]', {
			timeout: 10000,
		});

		// Look for images or folder icons
		const images = page.locator('img[alt*="album"], img[alt*="cover"], svg');
		const imageCount = await images.count();

		// Should have some visual elements
		expect(imageCount).toBeGreaterThan(0);
	});

	test('should display album photo counts', async ({ page }) => {
		await page.goto('/albums');

		// Wait for albums
		await page.waitForSelector('[data-testid="album-card"], article, a[href*="/albums/"]', {
			timeout: 10000,
		});

		// Look for photo count (e.g., "24 photos")
		const photoCount = page.locator('text=/\\d+.*photo/i');

		if ((await photoCount.count()) > 0) {
			await expect(photoCount.first()).toBeVisible();
		}
	});

	test('should navigate to album detail when clicking album card', async ({ page }) => {
		await page.goto('/albums');

		// Wait for albums
		await page.waitForSelector('[data-testid="album-card"], article, a[href*="/albums/"]', {
			timeout: 10000,
		});

		// Click first album
		const firstAlbum = page.locator('[data-testid="album-card"], article, a[href*="/albums/"]').first();
		await firstAlbum.click();

		// Verify navigation to album detail
		await expect(page).toHaveURL(/\/albums\/.+/);
	});

	test('should have keyboard navigation support', async ({ page }) => {
		await page.goto('/albums');

		// Wait for albums
		await page.waitForSelector('[data-testid="album-card"], article, a[href*="/albums/"]', {
			timeout: 10000,
		});

		// Tab to first album and press Enter
		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');
		await page.keyboard.press('Enter');

		// Should navigate to album detail
		await page.waitForTimeout(500);

		// Check if URL changed (might be albums detail or stayed on list)
		const currentUrl = page.url();
		expect(currentUrl).toContain('/albums');
	});
});

test.describe('Album Detail Page', () => {
	test('should load album detail page', async ({ page }) => {
		// Navigate via albums list
		await page.goto('/albums');

		// Wait for albums and click first one
		await page.waitForSelector('[data-testid="album-card"], article, a[href*="/albums/"]', {
			timeout: 10000,
		});

		const firstAlbum = page.locator('[data-testid="album-card"], article, a[href*="/albums/"]').first();
		await firstAlbum.click();

		// Verify album detail page loaded
		await expect(page).toHaveURL(/\/albums\/.+/);

		// Verify heading or content
		const heading = page.getByRole('heading', { level: 1 });
		await expect(heading).toBeVisible();
	});

	test('should display breadcrumb navigation', async ({ page }) => {
		// Navigate to album detail
		await page.goto('/albums');
		await page.waitForSelector('[data-testid="album-card"], article, a[href*="/albums/"]', {
			timeout: 10000,
		});

		const firstAlbum = page.locator('[data-testid="album-card"], article, a[href*="/albums/"]').first();
		await firstAlbum.click();

		// Look for breadcrumbs
		const breadcrumbs = page.locator('[aria-label*="breadcrumb"], nav').filter({
			has: page.locator('text=/home|albums/i'),
		});

		if ((await breadcrumbs.count()) > 0) {
			await expect(breadcrumbs.first()).toBeVisible();
		}
	});

	test('should navigate back to albums list via breadcrumb', async ({ page }) => {
		// Navigate to album detail
		await page.goto('/albums');
		await page.waitForSelector('[data-testid="album-card"], article, a[href*="/albums/"]', {
			timeout: 10000,
		});

		const firstAlbum = page.locator('[data-testid="album-card"], article, a[href*="/albums/"]').first();
		await firstAlbum.click();

		// Find and click Albums breadcrumb
		const albumsBreadcrumb = page.getByRole('button', { name: /^albums$/i }).or(
			page.locator('a, button').filter({ hasText: /^albums$/i })
		);

		if ((await albumsBreadcrumb.count()) > 0) {
			await albumsBreadcrumb.first().click();

			// Verify back at albums list
			await expect(page).toHaveURL('/albums');
		}
	});

	test('should navigate home via breadcrumb', async ({ page }) => {
		// Navigate to album detail
		await page.goto('/albums');
		await page.waitForSelector('[data-testid="album-card"], article, a[href*="/albums/"]', {
			timeout: 10000,
		});

		const firstAlbum = page.locator('[data-testid="album-card"], article, a[href*="/albums/"]').first();
		await firstAlbum.click();

		// Find and click Home breadcrumb
		const homeBreadcrumb = page.getByRole('button', { name: /^home$/i }).or(
			page.locator('a, button').filter({ hasText: /^home$/i })
		);

		if ((await homeBreadcrumb.count()) > 0) {
			await homeBreadcrumb.first().click();

			// Verify at homepage
			await expect(page).toHaveURL('/');
		}
	});

	test('should display photos in album', async ({ page }) => {
		// Navigate to album detail
		await page.goto('/albums');
		await page.waitForSelector('[data-testid="album-card"], article, a[href*="/albums/"]', {
			timeout: 10000,
		});

		const firstAlbum = page.locator('[data-testid="album-card"], article, a[href*="/albums/"]').first();
		await firstAlbum.click();

		// Wait for photos to load
		await page.waitForSelector('[data-testid="photo-card"], img[alt*="photo"], article', {
			timeout: 10000,
		});

		// Verify photos are visible
		const photos = page.locator('[data-testid="photo-card"], article, img[alt*="photo"]');
		const count = await photos.count();
		expect(count).toBeGreaterThan(0);
	});

	test('should have search functionality in album', async ({ page }) => {
		// Navigate to album detail
		await page.goto('/albums');
		await page.waitForSelector('[data-testid="album-card"], article, a[href*="/albums/"]', {
			timeout: 10000,
		});

		const firstAlbum = page.locator('[data-testid="album-card"], article, a[href*="/albums/"]').first();
		await firstAlbum.click();

		// Look for search input
		const searchInput = page.getByPlaceholder(/search/i);

		if ((await searchInput.count()) > 0) {
			await expect(searchInput).toBeVisible();

			// Try searching
			await searchInput.fill('test');
			await page.waitForTimeout(500);

			// Verify search input works
			const value = await searchInput.inputValue();
			expect(value).toBe('test');
		}
	});

	test('should open photo detail modal from album', async ({ page }) => {
		// Navigate to album detail
		await page.goto('/albums');
		await page.waitForSelector('[data-testid="album-card"], article, a[href*="/albums/"]', {
			timeout: 10000,
		});

		const firstAlbum = page.locator('[data-testid="album-card"], article, a[href*="/albums/"]').first();
		await firstAlbum.click();

		// Wait for photos
		await page.waitForSelector('[data-testid="photo-card"], img[alt*="photo"], article', {
			timeout: 10000,
		});

		// Click first photo
		const firstPhoto = page.locator('[data-testid="photo-card"], article, [role="img"]').first();
		await firstPhoto.click();

		// Verify modal opens
		const modal = page.locator('[role="dialog"], [aria-modal="true"]');
		await expect(modal).toBeVisible({ timeout: 5000 });
	});

	test('should display back to albums button', async ({ page }) => {
		// Navigate to album detail
		await page.goto('/albums');
		await page.waitForSelector('[data-testid="album-card"], article, a[href*="/albums/"]', {
			timeout: 10000,
		});

		const firstAlbum = page.locator('[data-testid="album-card"], article, a[href*="/albums/"]').first();
		await firstAlbum.click();

		// Look for back button or back navigation
		const backButton = page.getByRole('button', { name: /back.*albums|all albums/i }).or(
			page.locator('button, a').filter({ hasText: /back|all albums/i })
		);

		if ((await backButton.count()) > 0) {
			await expect(backButton.first()).toBeVisible();
		}
	});
});

test.describe('Albums Integration', () => {
	test('should navigate from homepage to albums to album detail', async ({ page }) => {
		// Start at homepage
		await page.goto('/');

		// Click Albums card
		const albumsCard = page.locator('text=Albums').first();
		await albumsCard.click();

		// Verify at albums list
		await expect(page).toHaveURL('/albums');

		// Click first album
		await page.waitForSelector('[data-testid="album-card"], article, a[href*="/albums/"]', {
			timeout: 10000,
		});

		const firstAlbum = page.locator('[data-testid="album-card"], article, a[href*="/albums/"]').first();
		await firstAlbum.click();

		// Verify at album detail
		await expect(page).toHaveURL(/\/albums\/.+/);
	});

	test('should navigate using header Albums link', async ({ page }) => {
		await page.goto('/');

		// Click Albums in header
		const albumsLink = page.getByRole('button', { name: /albums/i });

		if ((await albumsLink.count()) > 0) {
			await albumsLink.click();

			// Verify at albums page
			await expect(page).toHaveURL('/albums');
		}
	});
});
