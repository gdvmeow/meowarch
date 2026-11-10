import { test, expect } from '@playwright/test';
import { copy } from '../../src/i18n.js';

async function ready(page, path, language = 'ru') {
  await page.goto(`./${path}`);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.language-trigger').click();
  await page.locator(`.language-option[lang="${language === 'zh' ? 'zh-CN' : language}"]`).click();
  await expect(page.locator('html')).toHaveAttribute('lang', language === 'zh' ? 'zh-CN' : language);
}

test('single-image drawings expose the original at full size and keep a complete keyboard loop', async ({ page }) => {
  await ready(page, '?project=caesar-study');
  const opener = page.locator('.project-cover button');
  await opener.click();
  const full = page.locator('.viewer-caption a');
  await expect(full).toBeVisible();
  await expect(full).toHaveAttribute('href', /caesar-study-white\.webp$/);
  await expect(full).toHaveAttribute('target', '_blank');
  await expect(full).toHaveAttribute('rel', /noopener/);
  await page.locator('.viewer-close').focus();
  await page.keyboard.press('Tab');
  await expect(full).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.viewer-close')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(full).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('every education certificate page can be opened at its full resolution', async ({ page }) => {
  await ready(page, '?page=education');
  await page.locator('.credential-documents button').first().click();
  for (let index = 1; index <= 3; index++) {
    await expect(page.locator('.viewer-caption a')).toHaveAttribute('href', new RegExp(`certificate-page-${index}\\.webp$`));
    await page.keyboard.press('ArrowRight');
  }
  await expect(page.locator('.viewer-count')).toHaveText('1 из 3');
});

test('short and landscape galleries keep their image and controls inside the dialog', async ({ page }) => {
  test.setTimeout(120000);
  for (const viewport of [{ width: 844, height: 390 }, { width: 568, height: 320 }, { width: 320, height: 256 }]) {
    await page.setViewportSize(viewport);
    for (const language of ['ru', 'en', 'zh']) {
      await ready(page, '?project=lyublino-restoration', language);
      await page.locator('.project-plate button').first().click();
      await page.locator('.viewer-image img').evaluate(image => image.decode());
      await expect(page.locator('.viewer-caption a')).toHaveText(`${copy[language].project.openFull} ↗`);
      const metrics = await page.locator('.gallery-dialog').evaluate(dialog => {
        const box = element => { const r = element.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height }; };
        return { dialog: box(dialog), image: box(dialog.querySelector('.viewer-image img')), top: box(dialog.querySelector('.viewer-top')), bottom: box(dialog.querySelector('.viewer-bottom')), scrollHeight: dialog.scrollHeight, clientHeight: dialog.clientHeight };
      });
      expect(metrics.image.height).toBeGreaterThan(60);
      expect(metrics.image.bottom).toBeLessThanOrEqual(metrics.bottom.top + 1);
      await expect(page.locator('.viewer-close')).toBeInViewport();
      await page.locator('.viewer-controls button').last().focus();
      await expect(page.locator('.viewer-controls button').last()).toBeInViewport();
      await page.keyboard.press('Tab');
      await expect(page.locator('.viewer-close')).toBeFocused();
      await expect(page.locator('.viewer-close')).toBeInViewport();
      await page.keyboard.press('Escape');
      await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    }
  }
});

test('award headings and document panels remain legible from desktop to narrow mobile', async ({ page }, testInfo) => {
  for (const width of [1440, 768, 320]) {
    await page.setViewportSize({ width, height: 960 });
    await ready(page, '?page=education#awards');
    await expect(page.locator('#awards-heading')).toBeVisible();
    const articles = page.locator('.award-document');
    await expect(articles).toHaveCount(5);
    for (const article of await articles.all()) {
      const image = article.locator('img');
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(image => image.decode());
      const bounds = await article.boundingBox();
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    }
    await expect(page.locator('.skip-link')).not.toBeFocused();
    expect(await page.locator('.skip-link').evaluate(link => link.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
    await page.locator('.awards-section').screenshot({ path: testInfo.outputPath(`awards-${width}.png`) });
    expect(await page.locator('.skip-link').evaluate(link => link.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('high-density phone screens select sharp previews without downloading the complete original catalog', async ({ browser }, testInfo) => {
  const { readFile } = await import('node:fs/promises');
  const manifest = JSON.parse(await readFile(new URL('../../content/responsive-previews.json', import.meta.url), 'utf8'));
  const originalBytes = manifest.assets.reduce((sum, entry) => sum + entry.originalBytes, 0);
  const sizes = new Map(manifest.assets.flatMap(entry => [[entry.original, entry.originalBytes], ...entry.variants.map(variant => [variant.src, variant.bytes])]));
  for (const width of [320, 390]) {
    const context = await browser.newContext({ baseURL: testInfo.project.use.baseURL, viewport: { width, height: 844 }, deviceScaleFactor: 3 });
    const page = await context.newPage();
    try {
      await page.goto('./?page=portfolio');
      const images = page.locator('.project-tile img');
      await expect(images).toHaveCount(manifest.assets.length);
      let selectedBytes = 0;
      for (const image of await images.all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(image => image.decode());
        const selected = await image.evaluate(image => new URL(image.currentSrc).pathname.split('/assets/')[1]);
        expect(sizes.has(selected)).toBe(true);
        selectedBytes += sizes.get(selected);
      }
      console.log(`Catalog ${width}px at 3x: ${selectedBytes} selected bytes versus ${originalBytes} original bytes`);
      expect(selectedBytes).toBeLessThan(originalBytes * .6);
    } finally {
      await context.close();
    }
  }
});
