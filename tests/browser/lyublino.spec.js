import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { projects } from '../../src/data.js';
import { copy, localizeProject } from '../../src/i18n.js';

const source = projects.find(p => p.id === 'lyublino-restoration');
async function ready(page, language, path = '?project=lyublino-restoration') {
  await page.goto('./');
  await page.evaluate(language => localStorage.setItem('meowarch-language', language), language);
  await page.goto(`./${path}`);
  await page.evaluate(() => document.fonts.ready);
}

for (const width of [1440, 768, 390, 320]) {
  test(`Lyublino stays one complete chronological project in three languages at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const language of ['ru', 'en', 'zh']) {
      const project = localizeProject(source, language);
      await ready(page, language, '?page=portfolio&filter=architecture');
      const card = page.locator('.project-tile[href="?project=lyublino-restoration"]');
      await expect(card).toHaveCount(1);
      await expect(card).toContainText(project.title);
      await card.click();
      await expect(page.locator('main h1')).toHaveText(project.title);
      await expect(page).toHaveTitle(`${project.title} — ${copy[language].name}`);
      await expect(page.locator('.project-stage')).toHaveCount(3);
      await expect(page.locator('.project-stage h2')).toHaveText(project.sections.map(s => s.title));
      await expect(page.locator('.project-plate')).toHaveCount(20);
      await expect(page.locator('.project-download-groups a[download]')).toHaveCount(15);
      await expect(page.locator('.project-download-all')).toHaveAttribute('href', /lyublino-materials.zip$/);
      for (const [i, image] of (await page.locator('.project-plate img').all()).entries()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(img => img.decode());
        await expect(image).toHaveAttribute('alt', project.images[i].alt);
        expect(await image.evaluate(img => Math.abs(img.getBoundingClientRect().width / img.getBoundingClientRect().height - img.naturalWidth / img.naturalHeight))).toBeLessThan(.01);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}

test('stage links, full-resolution gallery, focus, wraparound and route changes work', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page, 'ru');
  await page.locator('a[href="#stage-renga"]').click();
  await expect(page).toHaveURL(/#stage-renga$/);
  await expect.poll(() => page.locator('#stage-renga').evaluate(el => Math.abs(el.getBoundingClientRect().top - 32))).toBeLessThan(8);
  await page.locator('a[href="#stage-presentation"]').scrollIntoViewIfNeeded();
  const beforePresentation = await page.evaluate(() => scrollY);
  await page.locator('a[href="#stage-presentation"]').click();
  await expect.poll(() => page.locator('#stage-presentation').evaluate(el => Math.abs(el.getBoundingClientRect().top - 32))).toBeLessThan(8);
  await page.goBack();
  await expect(page).toHaveURL(/#stage-renga$/);
  await expect.poll(() => page.evaluate(y => Math.abs(scrollY - y), beforePresentation)).toBeLessThan(2);
  await page.goForward();
  await expect(page).toHaveURL(/#stage-presentation$/);
  await expect.poll(() => page.locator('#stage-presentation').evaluate(el => Math.abs(el.getBoundingClientRect().top - 32))).toBeLessThan(8);
  const plates = page.locator('.project-plate button');
  await plates.nth(11).click();
  await expect(page.locator('.viewer-count')).toHaveText('12 из 20');
  await expect(page.locator('.viewer-image img')).toHaveAttribute('src', /project-sheet-full.webp$/);
  await expect(page.locator('.viewer-caption a')).toHaveAttribute('href', /project-sheet-full.webp$/);
  await expect(page.locator('.viewer-caption a')).toHaveAttribute('target', '_blank');
  await page.locator('.viewer-close').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('.viewer-caption a')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('.viewer-close')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(plates.nth(11)).toBeFocused();
  await plates.last().click();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.viewer-count')).toHaveText('1 из 20');
  await expect(page.locator('.viewer-image img')).toHaveAttribute('src', /clausura-full.webp$/);
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.viewer-count')).toHaveText('20 из 20');
  await page.keyboard.press('Escape');
  await plates.first().click();
  await page.locator('.viewer-caption a').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.viewer-count')).toHaveText('2 из 20');
  await expect(page.locator('.viewer-caption a')).toBeFocused();
  await expect(page.locator('.viewer-caption a')).toHaveAttribute('href', /renga-01.webp$/);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.viewer-count')).toHaveText('3 из 20');
  await expect(page.locator('.viewer-caption a')).toBeFocused();
  await page.evaluate(() => { history.pushState({}, '', '?project=caesar-study'); dispatchEvent(new PopStateEvent('popstate')); });
  await expect(page.locator('dialog')).toHaveCount(0);
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await expect(page.locator('main h1')).toHaveText('Цезарь');
});

test('every material and its complete ZIP are downloadable, with all image and PDF links intact', async ({ page, request }) => {
  await ready(page, 'en');
  for (const file of source.resources.files) {
    const link = page.locator(`.project-download-groups a[href$="/${file.src}"]`);
    await expect(link).toHaveAttribute('download', file.name);
    const response = await request.get(await link.getAttribute('href'));
    expect(response.status()).toBe(200);
    expect((await response.body()).length).toBe(file.bytes);
  }
  const archive = page.locator('.project-download-all');
  const [download] = await Promise.all([page.waitForEvent('download'), archive.click()]);
  expect(download.suggestedFilename()).toBe('lyublino-materials.zip');
  expect(await download.failure()).toBeNull();
});

test('Lyublino page and high-resolution viewer meet WCAG on mobile and desktop', async ({ page }) => {
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 960 });
    await ready(page, 'en');
    await expect(new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).resolves.toMatchObject({ violations: [] });
    await page.locator('.project-plate button').first().click();
    await expect(new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).resolves.toMatchObject({ violations: [] });
    await page.keyboard.press('Escape');
  }
});
