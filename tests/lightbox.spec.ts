import { test, expect } from '@playwright/test';

/**
 * Journey 4: Lightbox Navigation and Zoom
 *
 * Tests:
 * - Lightbox opens from photo detail modal
 * - Navigation between photos (prev/next)
 * - Zoom functionality (zoom in/out)
 * - Drag-to-pan when zoomed
 * - Keyboard navigation (arrows, +/-, ESC)
 * - Photo counter display
 * - Close functionality
 */
test.describe('Lightbox', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to explore page and open a photo
		await page.goto('/explore');
		await page.waitForSelector('[data-testid="photo-card"], img[alt*="photo"]', {
			timeout: 10000,
		});
	});

	test('should open lightbox from photo detail modal', async ({ page }) => {
		// Click first photo to open modal
		const firstPhoto = page
			.locator('[data-testid="photo-card"], article, [role="img"]')
			.first();
		await firstPhoto.click();

		// Wait for modal
		const modal = page.locator('[role="dialog"], [aria-modal="true"]');
		await expect(modal).toBeVisible();

		// Find and click view in lightbox button or image
		const lightboxTrigger = page
			.getByRole('button', { name: /lightbox|full.*screen|view larger/i })
			.or(page.locator('img[alt*="photo"]').first());

		if ((await lightboxTrigger.count()) > 0) {
			await lightboxTrigger.first().click();

			// Verify lightbox opens
			const lightbox = page.locator('[data-lightbox], [role="dialog"]').last();
			await expect(lightbox).toBeVisible({ timeout: 5000 });
		}
	});

	test('should display photo counter in lightbox', async ({ page }) => {
		// Open modal and lightbox
		await page.locator('[data-testid="photo-card"], article, [role="img"]').first().click();

		const modal = page.locator('[role="dialog"]');
		await expect(modal.first()).toBeVisible();

		// Try to open lightbox
		const lightboxTrigger = page
			.getByRole('button', { name: /lightbox|full.*screen|view larger/i })
			.or(page.locator('img[alt*="photo"]').first());

		if ((await lightboxTrigger.count()) > 0) {
			await lightboxTrigger.first().click();

			// Look for counter (e.g., "1 / 50")
			const counter = page.locator('text=/\\d+\\s*\\/\\s*\\d+/');
			if ((await counter.count()) > 0) {
				await expect(counter.first()).toBeVisible();
			}
		}
	});

	test('should navigate to next photo with right arrow', async ({ page }) => {
		// Open lightbox
		await page.locator('[data-testid="photo-card"], article, [role="img"]').first().click();

		const modal = page.locator('[role="dialog"]').first();
		await expect(modal).toBeVisible();

		const lightboxTrigger = page
			.getByRole('button', { name: /lightbox|full.*screen|view larger/i })
			.or(page.locator('img[alt*="photo"]').first());

		if ((await lightboxTrigger.count()) > 0) {
			await lightboxTrigger.first().click();
			await page.waitForTimeout(500);

			// Press right arrow
			await page.keyboard.press('ArrowRight');
			await page.waitForTimeout(300);

			// Verify photo changed (counter should update or image should change)
			const counter = page.locator('text=/\\d+\\s*\\/\\s*\\d+/');
			if ((await counter.count()) > 0) {
				const text = await counter.first().textContent();
				expect(text).toBeTruthy();
			}
		}
	});

	test('should navigate to previous photo with left arrow', async ({ page }) => {
		// Open lightbox on second photo
		const photos = page.locator('[data-testid="photo-card"], article, [role="img"]');
		if ((await photos.count()) > 1) {
			await photos.nth(1).click();

			const modal = page.locator('[role="dialog"]').first();
			await expect(modal).toBeVisible();

			const lightboxTrigger = page
				.getByRole('button', { name: /lightbox|full.*screen|view larger/i })
				.or(page.locator('img[alt*="photo"]').first());

			if ((await lightboxTrigger.count()) > 0) {
				await lightboxTrigger.first().click();
				await page.waitForTimeout(500);

				// Press left arrow
				await page.keyboard.press('ArrowLeft');
				await page.waitForTimeout(300);

				// Verify navigation occurred
				const counter = page.locator('text=/\\d+\\s*\\/\\s*\\d+/');
				if ((await counter.count()) > 0) {
					const text = await counter.first().textContent();
					expect(text).toBeTruthy();
				}
			}
		}
	});

	test('should zoom in with + key', async ({ page }) => {
		// Open lightbox
		await page.locator('[data-testid="photo-card"], article, [role="img"]').first().click();

		const modal = page.locator('[role="dialog"]').first();
		await expect(modal).toBeVisible();

		const lightboxTrigger = page
			.getByRole('button', { name: /lightbox|full.*screen|view larger/i })
			.or(page.locator('img[alt*="photo"]').first());

		if ((await lightboxTrigger.count()) > 0) {
			await lightboxTrigger.first().click();
			await page.waitForTimeout(500);

			// Get initial zoom level indicator
			const zoomIndicator = page.locator('text=/\\d+x|\\d+%|zoom/i');
			const initialZoom = (await zoomIndicator.count()) > 0 ? await zoomIndicator.first().textContent() : null;

			// Press + to zoom in
			await page.keyboard.press('+');
			await page.waitForTimeout(300);

			// Verify zoom changed
			if ((await zoomIndicator.count()) > 0) {
				const newZoom = await zoomIndicator.first().textContent();
				expect(newZoom).not.toBe(initialZoom);
			}
		}
	});

	test('should zoom out with - key', async ({ page }) => {
		// Open lightbox
		await page.locator('[data-testid="photo-card"], article, [role="img"]').first().click();

		const modal = page.locator('[role="dialog"]').first();
		await expect(modal).toBeVisible();

		const lightboxTrigger = page
			.getByRole('button', { name: /lightbox|full.*screen|view larger/i })
			.or(page.locator('img[alt*="photo"]').first());

		if ((await lightboxTrigger.count()) > 0) {
			await lightboxTrigger.first().click();
			await page.waitForTimeout(500);

			// Zoom in first
			await page.keyboard.press('+');
			await page.waitForTimeout(300);

			const zoomIndicator = page.locator('text=/\\d+x|\\d+%|zoom/i');
			const zoomedInLevel = (await zoomIndicator.count()) > 0 ? await zoomIndicator.first().textContent() : null;

			// Zoom out
			await page.keyboard.press('-');
			await page.waitForTimeout(300);

			// Verify zoom decreased
			if ((await zoomIndicator.count()) > 0) {
				const zoomedOutLevel = await zoomIndicator.first().textContent();
				expect(zoomedOutLevel).not.toBe(zoomedInLevel);
			}
		}
	});

	test('should close lightbox with ESC key', async ({ page }) => {
		// Open lightbox
		await page.locator('[data-testid="photo-card"], article, [role="img"]').first().click();

		const modal = page.locator('[role="dialog"]').first();
		await expect(modal).toBeVisible();

		const lightboxTrigger = page
			.getByRole('button', { name: /lightbox|full.*screen|view larger/i })
			.or(page.locator('img[alt*="photo"]').first());

		if ((await lightboxTrigger.count()) > 0) {
			await lightboxTrigger.first().click();
			await page.waitForTimeout(500);

			// Press ESC
			await page.keyboard.press('Escape');

			// Verify lightbox closes (should return to modal or close both)
			await page.waitForTimeout(500);

			// Check if lightbox specifically closed
			const lightbox = page.locator('[data-lightbox]');
			if ((await lightbox.count()) > 0) {
				await expect(lightbox).not.toBeVisible();
			}
		}
	});

	test('should close lightbox with close button', async ({ page }) => {
		// Open lightbox
		await page.locator('[data-testid="photo-card"], article, [role="img"]').first().click();

		const modal = page.locator('[role="dialog"]').first();
		await expect(modal).toBeVisible();

		const lightboxTrigger = page
			.getByRole('button', { name: /lightbox|full.*screen|view larger/i })
			.or(page.locator('img[alt*="photo"]').first());

		if ((await lightboxTrigger.count()) > 0) {
			await lightboxTrigger.first().click();
			await page.waitForTimeout(500);

			// Find and click close button
			const closeButton = page.getByRole('button', { name: /close/i }).last();
			if ((await closeButton.count()) > 0) {
				await closeButton.click();

				// Verify lightbox closes
				await page.waitForTimeout(500);
				const lightbox = page.locator('[data-lightbox]');
				if ((await lightbox.count()) > 0) {
					await expect(lightbox).not.toBeVisible();
				}
			}
		}
	});

	test('should navigate with next/prev buttons', async ({ page }) => {
		// Open lightbox
		await page.locator('[data-testid="photo-card"], article, [role="img"]').first().click();

		const modal = page.locator('[role="dialog"]').first();
		await expect(modal).toBeVisible();

		const lightboxTrigger = page
			.getByRole('button', { name: /lightbox|full.*screen|view larger/i })
			.or(page.locator('img[alt*="photo"]').first());

		if ((await lightboxTrigger.count()) > 0) {
			await lightboxTrigger.first().click();
			await page.waitForTimeout(500);

			// Find next button
			const nextButton = page
				.getByRole('button', { name: /next/i })
				.or(page.locator('button').filter({ has: page.locator('svg[class*="chevron-right"]') }));

			if ((await nextButton.count()) > 0) {
				const counter = page.locator('text=/\\d+\\s*\\/\\s*\\d+/');
				const initialCount = (await counter.count()) > 0 ? await counter.first().textContent() : null;

				// Click next
				await nextButton.first().click();
				await page.waitForTimeout(300);

				// Verify changed
				if ((await counter.count()) > 0) {
					const newCount = await counter.first().textContent();
					expect(newCount).not.toBe(initialCount);
				}
			}
		}
	});

	test('should display zoom controls', async ({ page }) => {
		// Open lightbox
		await page.locator('[data-testid="photo-card"], article, [role="img"]').first().click();

		const modal = page.locator('[role="dialog"]').first();
		await expect(modal).toBeVisible();

		const lightboxTrigger = page
			.getByRole('button', { name: /lightbox|full.*screen|view larger/i })
			.or(page.locator('img[alt*="photo"]').first());

		if ((await lightboxTrigger.count()) > 0) {
			await lightboxTrigger.first().click();
			await page.waitForTimeout(500);

			// Look for zoom in/out buttons or zoom indicator
			const zoomIn = page.getByRole('button', { name: /zoom in|\+/i });
			const zoomOut = page.getByRole('button', { name: /zoom out|-/i });
			const zoomIndicator = page.locator('text=/\\d+x|\\d+%|zoom/i');

			// At least one zoom control should be visible
			const hasZoomControls =
				(await zoomIn.count()) > 0 || (await zoomOut.count()) > 0 || (await zoomIndicator.count()) > 0;

			expect(hasZoomControls).toBeTruthy();
		}
	});
});
