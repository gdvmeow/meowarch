import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['iPhone 13'], defaultBrowserType: 'chromium' });

test('mobile menu links navigate on touch, close, and preserve history', async ({ page }) => {
  await page.goto('./');
  for (const pageName of ['about', 'contacts', 'portfolio']) {
    await page.locator('.menu-button').tap();
    await expect(page.locator('.menu-button')).toHaveAttribute('aria-expanded', 'true');
    await page.locator(`.site-nav a[href="?page=${pageName}"]`).tap();
    await expect(page).toHaveURL(new RegExp(`page=${pageName}`));
    await expect(page.locator('.menu-button')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('main h1')).toBeVisible();
  }
  await page.goBack();
  await expect(page).toHaveURL(/page=contacts/);
  await page.goForward();
  await expect(page).toHaveURL(/page=portfolio/);
  await page.locator('.menu-button').tap();
  await page.locator('.site-nav a[href="?page=portfolio"]').tap();
  await expect(page.locator('.menu-button')).toHaveAttribute('aria-expanded', 'false');
  await page.locator('.menu-button').tap();
  await page.locator('.menu-button').tap();
  await expect(page.locator('.menu-button')).toHaveAttribute('aria-expanded', 'false');
});

test('tile arrows are visible, decorative and fit at narrow widths', async ({ page }) => {
  for (const width of [320, 390, 760]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('./?page=portfolio');
    const arrows = page.locator('.project-tile .tile-arrow');
    expect(await arrows.count()).toBeGreaterThan(0);
    for (const arrow of await arrows.all()) {
      await expect(arrow).toHaveAttribute('aria-hidden', 'true');
      const rect = await arrow.boundingBox();
      expect(rect.width).toBeGreaterThan(10);
      expect(rect.right ?? rect.x + rect.width).toBeLessThanOrEqual(width);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});
