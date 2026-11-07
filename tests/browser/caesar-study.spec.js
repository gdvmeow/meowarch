import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { projects } from '../../src/data.js';
import { copy, localizeProject } from '../../src/i18n.js';

const source = projects.find(project => project.id === 'caesar-study');

async function fullFrame(image) {
  await image.scrollIntoViewIfNeeded();
  await image.evaluate(image => image.decode());
  expect(await image.evaluate(image => [image.naturalWidth, image.naturalHeight])).toEqual([2296, 3061]);
  await expect(image).toHaveAttribute('width', '2296');
  await expect(image).toHaveAttribute('height', '3061');
  await expect(image).toHaveCSS('object-fit', 'contain');
  expect(await image.evaluate(image => Math.abs(image.getBoundingClientRect().width / image.getBoundingClientRect().height - 2296 / 3061))).toBeLessThan(.005);
}

for (const width of [1440, 390, 320]) {
  test(`Caesar study is complete, translated and accessible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('./');
    for (const language of ['ru', 'en', 'zh']) {
      const project = localizeProject(source, language);
      await page.evaluate(language => localStorage.setItem('meowarch-language', language), language);
      for (const view of ['grid', 'list']) {
        await page.goto(`./?page=portfolio&filter=graphics&view=${view}`);
        const card = page.locator('.project-tile[href="?project=caesar-study"]');
        await expect(card).toContainText(project.title);
        await expect(card.locator('img')).toHaveAttribute('src', /caesar-study-white.webp$/);
        await expect(page.locator('.portfolio-count')).toContainText(`${projects.filter(project => project.group === 'graphics').length} / ${projects.length}`);
        if (view === 'grid') await fullFrame(card.locator('img'));
        await card.click();
        await expect(page.locator('main h1')).toHaveText(project.title);
        await expect(page).toHaveTitle(`${project.title} — ${copy[language].name}`);
        await expect(page.locator('.project-plate')).toHaveCount(1);
        await expect(page.locator('.project-intro p').first()).toHaveText(project.summary);
        await expect(page.locator('.project-intro p').last()).toHaveText(project.description);
        await fullFrame(page.locator('.project-cover img'));
        await expect(page.locator('.project-cover img')).toHaveAttribute('alt', project.images[0].alt);
        const button = page.locator('.project-cover button');
        await button.click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await fullFrame(page.locator('.viewer-image img'));
        await expect(page.locator('.viewer-image img')).toHaveAttribute('alt', project.images[0].alt);
        await expect(page.locator('.viewer-count')).toHaveText(copy[language].project.count(1, 1));
        await expect(page.locator('.viewer-controls')).toHaveCount(0);
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toHaveCount(0);
        await expect(button).toBeFocused();
        await button.click();
        await page.locator('.viewer-close').click();
        await expect(button).toBeFocused();
        await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.reload();
        await expect(page.locator('main h1')).toHaveText(project.title);
        await fullFrame(page.locator('.project-cover img'));
        await page.goBack();
        await expect(page.locator('.project-tile[href="?project=caesar-study"]')).toBeVisible();
      }
    }
    expect(errors).toEqual([]);
  });
}

test('Caesar page and modal pass accessibility checks with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./?project=caesar-study');
  await fullFrame(page.locator('.project-cover img'));
  await expect(new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).resolves.toMatchObject({ violations: [] });
  await page.locator('.project-cover button').click();
  await expect(new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).resolves.toMatchObject({ violations: [] });
  await page.locator('.viewer-close').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('.viewer-close')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('.project-cover button')).toBeFocused();
});


test('Caesar paper is bright while faint forehead axes and neck detail remain visible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./?project=caesar-study');
  const image = page.locator('.project-cover img');
  await fullFrame(image);
  // Read the delivered native pixels, independent of CSS viewport scaling.
  // Regions are fixed to the unchanged 2296 x 3061 drawing geometry.
  const pixels = await image.evaluate(image => {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0);
    const region = (x, y, width, height) => {
      const { data } = context.getImageData(x, y, width, height);
      const values = [];
      for (let i = 0; i < data.length; i += 4) {
        values.push(.2126 * data[i] + .7152 * data[i + 1] + .0722 * data[i + 2]);
      }
      const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
      const deviation = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
      return { mean, deviation };
    };
    return {
      paperTop: region(40, 300, 180, 180),
      paperRight: region(2040, 1500, 180, 180),
      foreheadAxis: region(1140, 360, 12, 120),
      foreheadLeft: region(1110, 360, 12, 120),
      foreheadRight: region(1170, 360, 12, 120),
      neck: region(940, 2300, 320, 350),
    };
  });
  expect(pixels.paperTop.mean).toBeGreaterThan(250);
  expect(pixels.paperRight.mean).toBeGreaterThan(247);
  const foreheadPaper = (pixels.foreheadLeft.mean + pixels.foreheadRight.mean) / 2;
  expect(foreheadPaper - pixels.foreheadAxis.mean).toBeGreaterThan(17);
  expect(pixels.foreheadAxis.mean).toBeGreaterThan(210);
  expect(pixels.neck.deviation).toBeGreaterThan(25);
  expect(pixels.neck.mean).toBeGreaterThan(220);
  expect(pixels.neck.mean).toBeLessThan(240);
});
