import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { copy, localizeProject } from '../../src/i18n.js';
import { projects } from '../../src/data.js';

async function ready(page, path, language) {
  await page.goto('./');
  await page.evaluate(language => localStorage.setItem('meowarch-language', language), language);
  await page.goto(`./${path}`);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('main h1')).toBeVisible();
}

for (const language of ['ru', 'en', 'zh']) {
  test(`practice dates and full-frame gallery work on both pages in ${language}`, async ({ page }) => {
    const t = copy[language];
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 960 });
      for (const route of ['about', 'education']) {
        await ready(page, `?page=${route}`, language);
        const section = page.locator(route === 'about' ? '.about-practice' : '.education-practice');
        await expect(section.locator('.practice-period')).toHaveText(t.about.practicePeriod);
        await expect(section.locator('.about-prose p').first()).toHaveText(t.about.practice[0]);
        await expect(section.locator('.practice-gallery img')).toHaveCount(3);
        for (const [index, image] of (await section.locator('.practice-gallery img').all()).entries()) {
          await image.scrollIntoViewIfNeeded();
          await image.evaluate(image => image.decode());
          await expect(image).toHaveAttribute('alt', t.about.practicePhotoAlts[index]);
          expect(await image.evaluate(image => Math.abs(image.clientWidth / image.clientHeight - .75))).toBeLessThan(.01);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        if (width === 320) {
          const buttons = section.locator('.practice-gallery button');
          await buttons.first().click();
          await expect(page.locator('dialog')).toBeVisible();
          await expect(page.locator('.viewer-count')).toHaveText(t.project.count(1, 3));
          await page.keyboard.press('ArrowRight');
          await expect(page.locator('.viewer-image img')).toHaveAttribute('alt', t.about.practicePhotoAlts[1]);
          await page.keyboard.press('ArrowLeft');
          await page.keyboard.press('Escape');
          await expect(page.locator('dialog')).toHaveCount(0);
          await expect(buttons.first()).toBeFocused();
          await buttons.last().click();
          await expect(page.locator('.viewer-count')).toHaveText(t.project.count(3, 3));
          await page.locator('.viewer-close').click();
          await expect(buttons.last()).toBeFocused();
          await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
        }
      }
    }
  });
}

test('Rotterdam house has a translated card, complete sheet and accessible detail gallery', async ({ page }) => {
  const source = projects.find(project => project.id === 'two-family-house-rotterdam');
  for (const language of ['ru', 'en', 'zh']) {
    const project = localizeProject(source, language);
    for (const width of [1440, 320]) {
      await page.setViewportSize({ width, height: 960 });
      await ready(page, '?page=portfolio&filter=architecture', language);
      const card = page.locator(`.project-tile[href="?project=${project.id}"]`);
      await expect(card).toContainText(project.title);
      await expect(card.locator('img')).toHaveAttribute('src', /rotterdam-house-sheet.webp$/);
      await card.click();
      await expect(page.locator('main h1')).toHaveText(project.title);
      await expect(page).toHaveTitle(`${project.title} — ${copy[language].name}`);
      await expect(page.locator('.project-plate')).toHaveCount(2);
      for (const [index, image] of (await page.locator('.project-plate img').all()).entries()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(image => image.decode());
        await expect(image).toHaveAttribute('alt', project.images[index].alt);
        expect(await image.evaluate(image => Math.abs(image.clientWidth / image.clientHeight - image.naturalWidth / image.naturalHeight))).toBeLessThan(.01);
      }
      await page.locator('.project-plate button').first().click();
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('.viewer-image img')).toHaveAttribute('src', /rotterdam-house-elevation.webp$/);
      await page.keyboard.press('Escape');
      await expect(page.locator('.project-plate button').first()).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
  await expect(new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).resolves.toMatchObject({ violations: [] });
});

test('practice modal navigation releases scroll lock and supports focus and reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page, '?page=education', 'en');
  await page.locator('.practice-gallery button').first().click();
  await expect(new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).resolves.toMatchObject({ violations: [] });
  await page.locator('.viewer-close').focus();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('.viewer-controls button').last()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.viewer-close')).toBeFocused();
  await page.evaluate(() => { history.pushState({}, '', '?page=about'); dispatchEvent(new PopStateEvent('popstate')); });
  await expect(page.locator('dialog')).toHaveCount(0);
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await expect(page.locator('.about-practice')).toBeVisible();
});
