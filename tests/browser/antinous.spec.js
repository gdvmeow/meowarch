import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createHash } from 'node:crypto';
import { projects } from '../../src/data.js';
import { copy, localizeProject } from '../../src/i18n.js';

const source = projects.find(project => project.id === 'antinous');

async function fullFrame(image, isPreview = false) {
  await image.scrollIntoViewIfNeeded();
  await image.evaluate(image => image.decode());
  if (isPreview) {
    expect(await image.evaluate(image => image.currentSrc)).toContain('/assets/previews/');
    expect(await image.evaluate(image => Math.abs(image.naturalWidth / image.naturalHeight - 1536 / 2048))).toBeLessThan(.005);
  } else {
    expect(await image.evaluate(image => [image.naturalWidth, image.naturalHeight])).toEqual([1536, 2048]);
  }
  await expect(image).toHaveAttribute('width', '1536');
  await expect(image).toHaveAttribute('height', '2048');
  await expect(image).toHaveCSS('object-fit', 'contain');
  expect(await image.evaluate(image => Math.abs(image.getBoundingClientRect().width / image.getBoundingClientRect().height - 1536 / 2048))).toBeLessThan(.005);
}

for (const width of [1440, 390, 320]) {
  test(`Antinous study is complete, translated and accessible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('./');
    for (const language of ['ru', 'en', 'zh']) {
      const project = localizeProject(source, language);
      await page.evaluate(language => localStorage.setItem('meowarch-language', language), language);
      for (const view of ['grid', 'list']) {
        await page.goto(`./?page=portfolio&filter=graphics&view=${view}`);
        const card = page.locator('.project-tile[href="?project=antinous"]');
        await expect(card).toContainText(project.title);
        await expect(card.locator('img')).toHaveAttribute('src', /antinous.jpg$/);
        await expect(page.locator('.portfolio-count')).toContainText(`${projects.filter(project => project.group === 'graphics').length} / ${projects.length}`);
        if (view === 'grid') await fullFrame(card.locator('img'), true);
        await card.click();
        await expect(page.locator('main h1')).toHaveText(project.title);
        await expect(page).toHaveTitle(`${project.title} — ${copy[language].name}`);
        await expect(page.locator('.project-plate')).toHaveCount(2);
        await expect(page.locator('.project-intro p').first()).toHaveText(project.summary);
        await expect(page.locator('.project-intro p').last()).toHaveText(project.description);
        await fullFrame(page.locator('.project-cover img'));
        await expect(page.locator('.project-cover img')).toHaveAttribute('alt', project.images[0].alt);
        const button = page.locator('.project-cover button');
        await button.click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await fullFrame(page.locator('.viewer-image img'));
        await expect(page.locator('.viewer-image img')).toHaveAttribute('alt', project.images[0].alt);
        await expect(page.locator('.viewer-count')).toHaveText(copy[language].project.count(1, 2));
        await expect(page.locator('.viewer-controls')).toHaveCount(1);
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
        await expect(page.locator('.project-tile[href="?project=antinous"]')).toBeVisible();
      }
    }
    expect(errors).toEqual([]);
  });
}

test('Antinous page and modal pass accessibility checks with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./?project=antinous');
  await fullFrame(page.locator('.project-cover img'));
  await expect(new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).resolves.toMatchObject({ violations: [] });
  await page.locator('.project-cover button').click();
  await expect(new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).resolves.toMatchObject({ violations: [] });
  await page.locator('.viewer-close').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('.viewer-caption a')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('.project-cover button')).toBeFocused();
});


test('Antinous serves the original JPEG without any byte changes', async ({ request }) => {
  const response = await request.get('./assets/antinous.jpg');
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toMatch(/image\/jpeg/);
  const bytes = await response.body();
  expect(bytes.length).toBe(638037);
  expect(createHash('sha256').update(bytes).digest('hex')).toBe('bf08e1cd0de71a8fb32b8de5b259de8c5bce0a60a5684e748004b17cdfb270b7');
});
