import { test, expect } from '@playwright/test';
import { projects } from '../../src/data.js';

async function ready(page, path = '') {
  await page.goto(`./${path}`);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('main h1')).toBeVisible();
}

test('the selected works show architecture and drawing in balanced uncropped rails', async ({ page }) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await ready(page);
    const cards = page.locator('.selected-grid .project-tile');
    await expect(cards).toHaveCount(4);
    expect(await cards.evaluateAll(items => items.map(item => item.getAttribute('href')))).toEqual([
      '?project=low-rise-house', '?project=portal-facade', '?project=folded-roof-cafe', '?project=socrates',
    ]);
    if (width < 760) expect((await cards.first().boundingBox()).y).toBeLessThan(844 * .85);
    for (const card of await cards.all()) {
      const image = card.locator('img');
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(image => image.decode());
      expect(await image.evaluate(image => Math.abs(image.clientWidth / image.clientHeight - image.naturalWidth / image.naturalHeight))).toBeLessThan(.01);
    }
    if (width === 1440) {
      const ends = await page.locator('.selected-rail').evaluateAll(rails => rails.map(rail => rail.getBoundingClientRect().bottom));
      expect(Math.abs(ends[0] - ends[1])).toBeLessThan(100);
    }
  }
});

test('catalog result count follows filters, views and browser history in every language', async ({ page }) => {
  await ready(page);
  for (const language of ['ru', 'en', 'zh']) {
    await page.evaluate(language => localStorage.setItem('meowarch-language', language), language);
    await page.setViewportSize({ width: 320, height: 844 });
    await ready(page, '?page=portfolio');
    await expect(page.locator('.portfolio-count')).toContainText(`${projects.length} / ${projects.length}`);
    await page.locator('.project-filters a[href*="filter=graphics"]').click();
    const count = projects.filter(project => project.group === 'graphics').length;
    await expect(page.locator('.portfolio-count')).toContainText(`${count} / ${projects.length}`);
    await page.locator('.portfolio-view button').last().click();
    await expect(page.locator('.portfolio-count')).toContainText(`${count} / ${projects.length}`);
    await page.goBack();
    await page.goBack();
    await expect(page.locator('.portfolio-count')).toContainText(`${projects.length} / ${projects.length}`);
    expect(await page.locator('.portfolio-controls').evaluate(el => el.getBoundingClientRect().right <= innerWidth)).toBe(true);
  }
});

test('next-work previews preserve every source and remain usable at 320px', async ({ page }) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 320, height: 844 });
  await ready(page);
  for (const language of ['ru', 'en', 'zh']) {
    await page.evaluate(language => localStorage.setItem('meowarch-language', language), language);
    for (let index = 0; index < projects.length; index++) {
      await ready(page, `?project=${projects[index].id}`);
      const next = projects[(index + 1) % projects.length];
      const image = next.cover ?? next.images[0];
      const link = page.locator('.project-next');
      await expect(link).toHaveAttribute('href', `?project=${next.id}`);
      await expect(link.locator('img')).toHaveAttribute('src', new RegExp(`${image.src}$`));
      await link.scrollIntoViewIfNeeded();
      await link.locator('img').evaluate(image => image.decode());
      expect(await link.locator('img').evaluate(image => Math.abs(image.clientWidth / image.clientHeight - image.naturalWidth / image.naturalHeight))).toBeLessThan(.02);
      expect(await link.locator('.next-title').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.project-next').hover();
  await expect(page.locator('.next-label .icon')).toHaveCSS('transform', 'none');
  await page.locator('.project-next').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp(`project=${projects[0].id}`));
});

test('all principal pages fit the narrowest viewport in all three languages', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await ready(page);
  for (const language of ['ru', 'en', 'zh']) {
    await page.evaluate(language => localStorage.setItem('meowarch-language', language), language);
    for (const path of ['', '?page=portfolio', '?page=portfolio&filter=graphics&view=list', '?page=about', '?page=contacts', '?page=education']) {
      await ready(page, path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.locator('main h1').evaluate(el => el.getBoundingClientRect().right <= innerWidth)).toBe(true);
    }
  }
});
