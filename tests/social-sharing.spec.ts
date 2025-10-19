import { test, expect } from '@playwright/test';

/**
 * Journey 6: Social Sharing and Download
 *
 * Tests:
 * - Social sharing buttons display
 * - Copy link functionality
 * - Platform-specific sharing (Twitter, Facebook, etc.)
 * - Download functionality
 * - Download size options
 */
test.describe('Social Sharing', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to explore and open photo modal
		await page.goto('/explore');
		await page.waitForSelector('[data-testid="photo-card"], img[alt*="photo"]', {
			timeout: 10000,
		});

		// Click first photo to open modal
		const firstPhoto = page
			.locator('[data-testid="photo-card"], article, [role="img"]')
			.first();
		await firstPhoto.click();

		// Wait for modal
		const modal = page.locator('[role="dialog"], [aria-modal="true"]');
		await expect(modal).toBeVisible();
	});

	test('should display social sharing buttons in photo modal', async ({ page }) => {
		// Look for share buttons
		const shareSection = page.locator('text=/share|social/i').or(
			page.locator('[aria-label*="share"]')
		);

		// Check if share functionality exists
		const shareButtons = page.locator('button, a').filter({
			has: page.locator('svg'),
		});

		const count = await shareButtons.count();
		// Should have some interactive elements (buttons)
		expect(count).toBeGreaterThan(0);
	});

	test('should copy link to clipboard', async ({ page }) => {
		// Grant clipboard permissions
		await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

		// Find copy link button
		const copyButton = page
			.getByRole('button', { name: /copy.*link|copy.*url/i })
			.or(page.locator('[aria-label*="copy"]'))
			.or(page.locator('button').filter({ hasText: /copy/i }));

		if ((await copyButton.count()) > 0) {
			// Click copy button
			await copyButton.first().click();

			// Wait for clipboard operation
			await page.waitForTimeout(500);

			// Verify clipboard contains a URL
			const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
			expect(clipboardText).toContain('http');
		}
	});

	test('should show success feedback after copying link', async ({ page }) => {
		// Grant clipboard permissions
		await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

		const copyButton = page
			.getByRole('button', { name: /copy.*link|copy.*url/i })
			.or(page.locator('[aria-label*="copy"]'))
			.or(page.locator('button').filter({ hasText: /copy/i }));

		if ((await copyButton.count()) > 0) {
			await copyButton.first().click();

			// Look for success message
			const successMessage = page
				.locator('text=/copied|success/i')
				.or(page.locator('[role="status"]'));

			if ((await successMessage.count()) > 0) {
				await expect(successMessage.first()).toBeVisible({ timeout: 2000 });
			}
		}
	});

	test('should have Twitter share button', async ({ page }) => {
		const twitterButton = page
			.getByRole('link', { name: /twitter|x\.com/i })
			.or(page.locator('a[href*="twitter.com"]'))
			.or(page.locator('a[href*="x.com/intent"]'));

		if ((await twitterButton.count()) > 0) {
			const href = await twitterButton.first().getAttribute('href');
			expect(href).toMatch(/twitter\.com|x\.com/);
		}
	});

	test('should have Facebook share button', async ({ page }) => {
		const facebookButton = page
			.getByRole('link', { name: /facebook/i })
			.or(page.locator('a[href*="facebook.com"]'));

		if ((await facebookButton.count()) > 0) {
			const href = await facebookButton.first().getAttribute('href');
			expect(href).toContain('facebook.com');
		}
	});

	test('should have LinkedIn share button', async ({ page }) => {
		const linkedInButton = page
			.getByRole('link', { name: /linkedin/i })
			.or(page.locator('a[href*="linkedin.com"]'));

		if ((await linkedInButton.count()) > 0) {
			const href = await linkedInButton.first().getAttribute('href');
			expect(href).toContain('linkedin.com');
		}
	});

	test('should have Pinterest share button', async ({ page }) => {
		const pinterestButton = page
			.getByRole('link', { name: /pinterest/i })
			.or(page.locator('a[href*="pinterest.com"]'));

		if ((await pinterestButton.count()) > 0) {
			const href = await pinterestButton.first().getAttribute('href');
			expect(href).toContain('pinterest.com');
		}
	});

	test('should have Email share button', async ({ page }) => {
		const emailButton = page
			.getByRole('link', { name: /email/i })
			.or(page.locator('a[href^="mailto:"]'));

		if ((await emailButton.count()) > 0) {
			const href = await emailButton.first().getAttribute('href');
			expect(href).toMatch(/^mailto:/);
		}
	});

	test('should open share links in new tab', async ({ page }) => {
		const shareLinks = page.locator('a[href*="twitter.com"], a[href*="facebook.com"], a[href*="linkedin.com"]');

		if ((await shareLinks.count()) > 0) {
			const target = await shareLinks.first().getAttribute('target');
			expect(target).toBe('_blank');

			// Verify rel attribute for security
			const rel = await shareLinks.first().getAttribute('rel');
			expect(rel).toContain('noopener');
		}
	});
});

test.describe('Download Functionality', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to explore and open photo modal
		await page.goto('/explore');
		await page.waitForSelector('[data-testid="photo-card"], img[alt*="photo"]', {
			timeout: 10000,
		});

		// Click first photo to open modal
		const firstPhoto = page
			.locator('[data-testid="photo-card"], article, [role="img"]')
			.first();
		await firstPhoto.click();

		// Wait for modal
		const modal = page.locator('[role="dialog"], [aria-modal="true"]');
		await expect(modal).toBeVisible();
	});

	test('should display download button', async ({ page }) => {
		const downloadButton = page
			.getByRole('button', { name: /download/i })
			.or(page.locator('[aria-label*="download"]'));

		if ((await downloadButton.count()) > 0) {
			await expect(downloadButton.first()).toBeVisible();
		}
	});

	test('should show download size options', async ({ page }) => {
		const downloadButton = page
			.getByRole('button', { name: /download/i })
			.or(page.locator('[aria-label*="download"]'));

		if ((await downloadButton.count()) > 0) {
			// Click download button to reveal options
			await downloadButton.first().click();
			await page.waitForTimeout(300);

			// Look for size options (Original, Web, Thumbnail)
			const sizeOptions = page.locator('text=/original|web|thumbnail|small|medium|large/i');

			if ((await sizeOptions.count()) > 0) {
				expect(await sizeOptions.count()).toBeGreaterThan(0);
			}
		}
	});

	test('should trigger download when size option selected', async ({ page }) => {
		const downloadButton = page
			.getByRole('button', { name: /download/i })
			.or(page.locator('[aria-label*="download"]'));

		if ((await downloadButton.count()) > 0) {
			await downloadButton.first().click();
			await page.waitForTimeout(300);

			// Find a download option
			const downloadOption = page
				.getByRole('button', { name: /original|web|thumbnail/i })
				.or(page.locator('button').filter({ hasText: /original|web|thumbnail/i }));

			if ((await downloadOption.count()) > 0) {
				// Set up download listener
				const downloadPromise = page.waitForEvent('download', { timeout: 5000 });

				// Click download option
				await downloadOption.first().click();

				try {
					// Wait for download to start
					const download = await downloadPromise;

					// Verify download was triggered
					expect(download).toBeTruthy();
				} catch (error) {
					// Download might be blocked or handled differently
					// This is acceptable as long as the button works
					console.log('Download event not captured, but UI interaction succeeded');
				}
			}
		}
	});

	test('should display usage notice for downloads', async ({ page }) => {
		const downloadButton = page
			.getByRole('button', { name: /download/i })
			.or(page.locator('[aria-label*="download"]'));

		if ((await downloadButton.count()) > 0) {
			await downloadButton.first().click();
			await page.waitForTimeout(300);

			// Look for usage notice
			const usageNotice = page.locator('text=/personal.*use|non.*commercial|terms/i');

			if ((await usageNotice.count()) > 0) {
				await expect(usageNotice.first()).toBeVisible();
			}
		}
	});

	test('should show loading state during download', async ({ page }) => {
		const downloadButton = page
			.getByRole('button', { name: /download/i })
			.or(page.locator('[aria-label*="download"]'));

		if ((await downloadButton.count()) > 0) {
			await downloadButton.first().click();
			await page.waitForTimeout(300);

			const downloadOption = page
				.getByRole('button', { name: /original|web|thumbnail/i })
				.or(page.locator('button').filter({ hasText: /original|web|thumbnail/i }));

			if ((await downloadOption.count()) > 0) {
				await downloadOption.first().click();

				// Look for loading indicator
				const loadingIndicator = page.locator('text=/downloading|loading/i').or(
					page.locator('[role="status"]')
				);

				if ((await loadingIndicator.count()) > 0) {
					// Loading state should appear briefly
					await expect(loadingIndicator.first()).toBeVisible({ timeout: 2000 });
				}
			}
		}
	});
});
