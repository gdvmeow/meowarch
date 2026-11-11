import { test, expect } from '@playwright/test';

async function landsAt(page, path, target) {
  await page.goto(`./${path}`);
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.locator(target).evaluate(element => {
    const margin = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
    return Math.abs(element.getBoundingClientRect().top - margin);
  })).toBeLessThan(3);
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(100);
}

for (const width of [1440, 390, 320]) {
  test(`shared award and project section links land at their targets at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    for (const [path, target] of [
      ['?page=education#awards', '#awards'],
      ['?page=education#%61wards', '#awards'],
      ['?project=lyublino-restoration#stage-presentation', '#stage-presentation'],
      ['?project=lyublino-restoration#project-materials', '#project-materials'],
    ]) {
      await landsAt(page, path, target);
      await page.reload();
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator(target)).toBeInViewport();
    }
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('./?page=education#%E0%A4%A');
    await expect(page.locator('main h1')).toHaveText('Образование и опыт');
    expect(errors).toEqual([]);
  });
}

test('a shared award link survives back and forward without locking scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await landsAt(page, '?page=education#awards', '#awards');
  await page.goto('./?page=about');
  await page.goBack();
  await expect(page).toHaveURL(/page=education#awards$/);
  await expect(page.locator('#awards-heading')).toBeInViewport();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await page.goForward();
  await expect(page.locator('main h1')).toHaveText('О себе');
});

test('internal query links retain their section across route changes and history', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./?page=about');
  await page.evaluate(() => {
    const link = document.createElement('a');
    link.id = 'test-awards-link'; link.href = '?page=education#awards'; link.textContent = 'Awards section';
    document.body.append(link);
  });
  await page.locator('#test-awards-link').click();
  await expect(page).toHaveURL(/page=education#awards$/);
  await expect(page.locator('#awards-heading')).toBeInViewport();
  await page.goBack();
  await expect(page).toHaveURL(/page=about$/);
  await page.goForward();
  await expect(page.locator('#awards-heading')).toBeInViewport();
  await page.locator('#test-awards-link').click();
  await expect(page.locator('#awards-heading')).toBeInViewport();
});

test('late font readiness does not override a manual scroll or a newer page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    let release;
    const held = new Promise(resolve => { release = resolve; });
    Object.defineProperty(document.fonts, 'ready', { get: () => held });
    window.releaseTestFonts = release;
  });
  await page.goto('./?page=education#awards');
  await expect(page.locator('#awards-heading')).toBeInViewport();
  const initial = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, -500);
  await expect.poll(() => page.evaluate(expected => Math.abs(scrollY - expected), initial - 500)).toBeLessThan(3);
  const manual = await page.evaluate(() => scrollY);
  await page.evaluate(() => window.releaseTestFonts());
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(Math.abs((await page.evaluate(() => scrollY)) - manual)).toBeLessThan(3);
  // Reload creates a fresh document and a new held fonts.ready promise. A goto
  // of the current URL can instead keep the resolved promise and smooth-scroll
  // the existing fragment, which tests a different browser behaviour.
  await page.reload();
  await expect(page.locator('#awards-heading')).toBeInViewport();
  await page.evaluate(() => document.querySelector('.site-nav a[href="?page=about"]').click());
  await expect(page).toHaveURL(/page=about$/);
  // pushState changes the URL before React has committed the destination.
  // Measure the new page after its heading and scroll reset have settled.
  await expect(page.locator('main h1')).toHaveText('О себе');
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(3);
  const pageScroll = await page.evaluate(() => scrollY);
  await page.evaluate(() => window.releaseTestFonts());
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(Math.abs((await page.evaluate(() => scrollY)) - pageScroll)).toBeLessThan(3);
});
