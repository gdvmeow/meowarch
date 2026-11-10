import { test, expect } from '@playwright/test';
import { projects } from '../../src/data.js';
import { readFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile(new URL('../../content/responsive-previews.json', import.meta.url), 'utf8'));

for (const width of [1440, 768, 390, 320]) {
  test(`catalog cards use lighter complete previews and h2 headings at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.goto('./?page=portfolio');
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('.project-tile h2')).toHaveCount(projects.length);
    await expect(page.locator('.project-tile h3')).toHaveCount(0);
    let selectedBytes = 0;
    for (const card of await page.locator('.project-tile').all()) {
      const image = card.locator('img');
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(image => image.decode());
      const selected = await image.evaluate(image => image.currentSrc);
      const variant = manifest.assets.flatMap(entry => entry.variants).find(variant => selected.endsWith(`/assets/${variant.src}`));
      const original = manifest.assets.find(entry => selected.endsWith(`/assets/${entry.original}`));
      const entry = variant ?? original;
      expect(entry).toBeTruthy();
      if (!variant) expect(original.width).toBeLessThanOrEqual(800); // Already small enough for this desktop card.
      selectedBytes += variant?.bytes ?? original.originalBytes;
      expect(await image.evaluate((image, expected) => {
        const rect = image.getBoundingClientRect();
        return Math.abs(rect.width / rect.height - expected.width / expected.height);
      }, entry)).toBeLessThan(.005);
      await expect(image).toHaveAttribute('sizes', /vw/);
    }
    const originalBytes = manifest.assets.reduce((sum, entry) => sum + entry.originalBytes, 0);
    expect(selectedBytes).toBeLessThan(originalBytes * .3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.goto('./');
    await expect(page.locator('.selected-grid .project-tile h3')).toHaveCount(4);
    await expect(page.locator('.selected-grid .project-tile h2')).toHaveCount(0);
  });
}

test('list previews remain small while project pages keep the original source', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./?page=portfolio&view=list');
  const card = page.locator('.project-tile[href="?project=antinous"]');
  await card.locator('img').scrollIntoViewIfNeeded();
  await card.locator('img').evaluate(image => image.decode());
  expect(await card.locator('img').evaluate(image => image.currentSrc)).toMatch(/previews\/antinous-400\.webp$/);
  await expect(card.locator('h2')).toHaveText('Антиной');
  await card.click();
  const original = page.locator('.project-cover img');
  await expect(original).not.toHaveAttribute('srcset');
  expect(await original.evaluate(image => image.currentSrc)).toMatch(/assets\/antinous\.jpg$/);
  await page.locator('.project-cover button').click();
  await expect(page.locator('.viewer-image img')).toHaveAttribute('src', /assets\/antinous\.jpg$/);
});
