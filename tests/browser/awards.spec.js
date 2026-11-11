import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { awardDocuments, antinousScan } from '../../src/awardDocuments.js';
import { copy } from '../../src/i18n.js';

for (const width of [1440, 768, 390, 320]) {
  test(`five separate awards preserve their full frames and translations at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.goto('./?page=education');
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const language of ['ru', 'en', 'zh']) {
      await page.evaluate(language => localStorage.setItem('meowarch-language', language), language);
      await page.reload();
      await expect(page.locator('#awards-heading')).toHaveText(copy[language].awards.heading);
      await expect(page.locator('.award-document')).toHaveCount(5);
      await expect(page.locator('.credential-document')).toHaveCount(3);
      for (const document of awardDocuments) {
        const item = copy[language].awards.items[document.id];
        const article = page.locator(`#${document.id}`);
        await expect(article.locator('h3')).toHaveText(item.title);
        await expect(article.locator('.award-period')).toHaveCount(item.period ? 1 : 0);
        const image = article.locator('img');
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(image => image.decode());
        await expect(image).toHaveAttribute('alt', item.alt);
        expect(await image.evaluate(image => [image.naturalWidth, image.naturalHeight])).toEqual([document.width, document.height]);
        expect(await image.evaluate(image => Math.abs(image.clientWidth / image.clientHeight - image.naturalWidth / image.naturalHeight))).toBeLessThan(.01);
        const button = article.locator('button');
        await button.click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.locator('.viewer-top > span').first()).toHaveText(item.title);
        await expect(page.locator('.viewer-image img')).toHaveAttribute('src', new RegExp(`${document.src}$`));
        await expect(page.locator('.viewer-count')).toHaveText(copy[language].project.count(1, 1));
        await expect(page.locator('.viewer-controls')).toHaveCount(0);
        await expect(page.locator('.viewer-caption a')).toHaveAttribute('href', new RegExp(`${document.src}$`));
        await page.keyboard.press('ArrowRight');
        await expect(page.locator('.viewer-image img')).toHaveAttribute('alt', item.alt);
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toHaveCount(0);
        await expect(button).toBeFocused();
        await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}

test('awards and the separate Antinous scan remain accessible across interrupted and repeated galleries', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./?page=education');
  await expect(new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).resolves.toMatchObject({ violations: [] });
  const button = page.locator('.award-document button').first();
  await button.click();
  await expect(new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).resolves.toMatchObject({ violations: [] });
  await page.locator('.viewer-close').focus();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('.viewer-caption a')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.viewer-close')).toBeFocused();
  await page.locator('.viewer-close').click();
  await expect(button).toBeFocused();
  await button.click();
  await page.evaluate(() => { history.pushState({}, '', '?project=antinous'); dispatchEvent(new PopStateEvent('popstate')); });
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await expect(page.locator('.project-plate')).toHaveCount(2);
  const scan = page.locator('.project-gallery img');
  await scan.scrollIntoViewIfNeeded();
  await scan.evaluate(image => image.decode());
  expect(await scan.evaluate(image => [image.naturalWidth, image.naturalHeight])).toEqual([antinousScan.width, antinousScan.height]);
  const scanButton = page.locator('.project-gallery button');
  await scanButton.click();
  await expect(page.locator('.viewer-count')).toHaveText('2 из 2');
  await expect(page.locator('.viewer-image img')).toHaveAttribute('src', /antinous-scan-neutral.webp$/);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.viewer-image img')).toHaveAttribute('src', /antinous-neutral.webp$/);
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.viewer-image img')).toHaveAttribute('src', /antinous-scan-neutral.webp$/);
  await page.keyboard.press('Escape');
  await expect(scanButton).toBeFocused();
});

test('tile arrows stay black on hover and keyboard focus', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  for (const path of ['./', './?page=portfolio', './?page=portfolio&filter=graphics&view=list']) {
    await page.goto(path);
    const tile = page.locator('.project-tile').first();
    await tile.hover();
    await expect(tile.locator('.tile-arrow')).toHaveCSS('color', 'rgb(0, 0, 0)');
    await tile.focus();
    await expect(tile.locator('.tile-arrow')).toHaveCSS('color', 'rgb(0, 0, 0)');
  }
});
