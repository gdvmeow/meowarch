import { test, expect } from '@playwright/test';
import { copy, localizeProject } from '../../src/i18n.js';
import { projects } from '../../src/data.js';

const source = projects.find(project => project.id === 'mansard-house');

async function fullFrame(image) {
  await image.scrollIntoViewIfNeeded();
  await image.evaluate(image => image.decode());
  expect(await image.evaluate(image => [image.naturalWidth, image.naturalHeight])).toEqual([1384, 2048]);
  await expect(image).toHaveAttribute('width', '1384');
  await expect(image).toHaveAttribute('height', '2048');
  await expect(image).toHaveCSS('object-fit', 'contain');
  expect(await image.evaluate(image => Math.abs(image.getBoundingClientRect().width / image.getBoundingClientRect().height - 1384 / 2048))).toBeLessThan(.005);
}

for (const width of [1440, 390, 320]) {
  test(`the replacement house sheet stays complete in card, page and viewer at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('./');
    for (const language of ['ru', 'en', 'zh']) {
      const project = localizeProject(source, language);
      await page.evaluate(language => localStorage.setItem('meowarch-language', language), language);
      await page.goto('./?page=portfolio&filter=architecture');
      const card = page.locator('.project-tile[href="?project=mansard-house"]');
      await expect(card).toContainText(project.title);
      await fullFrame(card.locator('img'));
      await card.click();
      await expect(page.locator('main h1')).toHaveText(project.title);
      await expect(page.locator('.project-plate')).toHaveCount(1);
      const sheet = page.locator('.project-cover img');
      await fullFrame(sheet);
      await expect(sheet).toHaveAttribute('alt', project.images[0].alt);
      const button = page.locator('.project-cover button');
      await button.click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await fullFrame(page.locator('.viewer-image img'));
      await expect(page.locator('.viewer-count')).toHaveText(copy[language].project.count(1, 1));
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(button).toBeFocused();
      await button.click();
      await page.locator('.viewer-close').click();
      await expect(button).toBeFocused();
      await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.reload();
      await fullFrame(page.locator('.project-cover img'));
    }
    expect(errors).toEqual([]);
  });
}
