import { test, expect } from '@playwright/test';
import { projects } from '../../src/data.js';
import { localizeProject } from '../../src/i18n.js';

const ids = ['composition', 'column', 'still-life', 'decorative-painting'];
for (const width of [1440, 390, 320]) {
  test(`four new works appear in each language with complete images at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('./');
    for (const lang of ['ru', 'en', 'zh']) {
      await page.evaluate(language => localStorage.setItem('meowarch-language', language), lang);
      for (const id of ids) {
        const project = localizeProject(projects.find(p => p.id === id), lang);
        await page.goto('./?page=portfolio&filter=graphics');
        const card = page.locator(`.project-tile[href="?project=${id}"]`);
        await expect(card).toContainText(project.title);
        await card.click();
        await expect(page.locator('main h1')).toHaveText(project.title);
        await expect(page.locator('.project-intro p').first()).toHaveText(project.summary);
        const image = page.locator('.project-cover img');
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(img => img.decode());
        await expect(image).toHaveAttribute('alt', project.images[0].alt);
        expect(await image.evaluate(img => [img.naturalWidth, img.naturalHeight])).toEqual([project.images[0].width, project.images[0].height]);
        await expect(image).toHaveCSS('object-fit', 'contain');
        expect(await image.evaluate(img => Math.abs(img.clientWidth / img.clientHeight - img.naturalWidth / img.naturalHeight))).toBeLessThan(.01);
        await page.locator('.project-cover button').click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.locator('.viewer-image img')).toHaveAttribute('alt', project.images[0].alt);
        await page.keyboard.press('Escape');
        await expect(page.locator('.project-cover button')).toBeFocused();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
    }
    expect(errors).toEqual([]);
  });
}
