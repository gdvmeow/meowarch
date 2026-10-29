import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { projects } from '../../src/data.js';

const pages = ['', '?page=portfolio', '?page=about', '?page=contacts', ...projects.map(project => `?project=${project.id}`), '?project=missing'];

async function ready(page, path = '') {
  await page.goto(`./${path}`);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('main h1')).toBeVisible();
}

async function glyphPoint(glyph, xRatio = .5, yRatio = .5) {
  return glyph.evaluate((g, { xRatio, yRatio }) => {
    const rect = g.getBoundingClientRect();
    const value = name => parseFloat(g.style.getPropertyValue(`--hit-${name}`));
    return { x: rect.left + value('left') + value('width') * xRatio, y: rect.top + value('top') + value('height') * yRatio };
  }, { xRatio, yRatio });
}

test('each page has a landmark, coherent headings, no runtime failures or horizontal overflow', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [320, 390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 960 });
    for (const path of pages) {
      await ready(page, path);
      await expect(page.locator('main')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      expect(await page.locator('main h1').evaluate(el => el.getBoundingClientRect().right <= innerWidth)).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});

test('all three languages cover each page without clipping', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page);
  for (const language of ['en', 'zh', 'ru']) {
    await page.locator('.language-trigger').click();
    await page.locator(`.language-option[lang="${language === 'zh' ? 'zh-CN' : language}"]`).click();
    for (const path of pages) {
      await ready(page, path);
      await expect(page.locator('html')).toHaveAttribute('lang', language === 'zh' ? 'zh-CN' : language);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.locator('main').innerText()).not.toContain('undefined');
    }
    await expect(page.locator('.language-trigger')).toHaveAttribute('aria-expanded', 'false');
  }
});

test('language menu supports arrows, escape, tab dismissal and has no selection ornament', async ({ page }) => {
  await ready(page);
  const trigger = page.locator('.language-trigger');
  await trigger.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitemradio', { name: 'Русский' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitemradio', { name: 'English' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.click();
  await page.keyboard.press('End');
  await page.keyboard.press('Tab');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('.language-check')).toHaveCount(0);
  expect(await page.locator('.language-menu').evaluate(el => getComputedStyle(el).borderTopWidth)).toBe('1px');
});

test('a single real work has no redundant controls and legacy filters still show it', async ({ page }) => {
  for (const query of ['?page=portfolio', '?page=portfolio&filter=architecture', '?page=portfolio&filter=graphics&view=list']) {
    await ready(page, query);
    await expect(page.locator('.project-tile')).toHaveCount(1);
    await expect(page.locator('.project-tile')).toHaveAttribute('href', '?project=socrates');
    await expect(page.locator('.portfolio-toolbar')).toHaveCount(0);
    await expect(page.locator('.tile-pair img')).toHaveCount(2);
    await page.reload();
    await expect(page.locator('.project-tile')).toHaveCount(1);
  }
  for (const id of ['house', 'structure', 'courtyard', 'drawing', 'form']) {
    await ready(page, `?project=${id}`);
    await expect(page.locator('main h1')).toHaveText('Страница не найдена');
  }
});

test('history restores catalog scroll and new pages start at the top', async ({ page }) => {
  await ready(page, '?page=portfolio');
  await page.locator('a[href="?project=socrates"] .tile-meta h3').click();
  await expect(page).toHaveURL(/project=socrates/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.goBack();
  await expect(page).toHaveURL(/page=portfolio/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  await expect(page.locator('main')).toBeFocused();
  await page.goForward();
  await expect(page).toHaveURL(/project=socrates/);
  await page.evaluate(() => scrollTo({ top: 400, behavior: 'instant' }));
  await page.goBack();
  await page.goForward();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(400);
});

test('gallery isolates background, cycles, traps focus, closes and restores the opener', async ({ page }) => {
  await ready(page, '?project=socrates');
  const opener = page.locator('.project-cover button');
  await opener.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(21, 29, 23)');
  await expect(page.locator('.viewer-count')).toHaveText('1 из 2');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.viewer-count')).toHaveText('2 из 2');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.viewer-count')).toHaveText('1 из 2');
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  await opener.click();
  await page.mouse.click(1, 1);
  await expect(dialog).toHaveCount(0);
});

test('the only work does not link to itself as a next project', async ({ page }) => {
  await ready(page, '?project=socrates');
  await expect(page.locator('.project-next')).toHaveCount(0);
  await expect(page.locator('main .project-image-button')).toHaveCount(2);
});

test('clipboard success and denial give usable feedback', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await ready(page, '?page=contacts');
  await page.getByRole('button', { name: 'Скопировать адрес' }).click();
  const copyPosition = await page.locator('.contact-primary').evaluate(el => ({
    addressBottom: el.querySelector('.contact-email').getBoundingClientRect().bottom,
    buttonTop: el.querySelector('.copy-button').getBoundingClientRect().top,
  }));
  expect(copyPosition.buttonTop - copyPosition.addressBottom).toBeGreaterThanOrEqual(16);
  await expect(page.getByRole('status')).toHaveText('Адрес скопирован');
  await expect(page.getByText('Адрес скопирован', { exact: true })).toHaveCount(1);
  await expect(page.locator('.copy-button')).toHaveText('Скопировать адрес');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('gdvmeow@gmail.com');
  await page.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error('denied')); });
  await page.locator('.copy-button').click();
  await expect(page.getByRole('status')).toContainText('скопируйте вручную');
  await expect(page.locator('main a[href="mailto:gdvmeow@gmail.com"]')).toBeVisible();
});

test('navigation and calls to action keep the original ink and paper palette', async ({ page }) => {
  await ready(page);
  const ink = 'rgb(37, 43, 38)';
  await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(238, 234, 226)');
  await expect(page.locator('.section-heading .text-link')).toHaveCSS('color', ink);
  await expect(page.locator('.hero-project-link')).toHaveCSS('color', ink);
  await expect(page.locator('.hero-project-link .icon')).toHaveCount(0);
  for (const path of ['?page=about', '?page=contacts', '?page=portfolio']) {
    await ready(page, path);
    await expect(page.locator('.site-nav [aria-current="page"]')).toHaveCSS('color', ink);
    for (const link of await page.locator('main .text-link, main .copy-button').all()) await expect(link).toHaveCSS('color', ink);
  }
});

test('social addresses stay at the right edge beside the external arrow', async ({ page }) => {
  for (const width of [320, 390, 768, 1920]) {
    await page.setViewportSize({ width, height: 962 });
    await ready(page, '?page=contacts');
    for (const row of await page.locator('.social-row').all()) {
      const gap = await row.evaluate(el => {
        const label = el.children[0].getBoundingClientRect();
        const address = el.querySelector('.social-detail').getBoundingClientRect();
        const arrow = el.querySelector('.icon').getBoundingClientRect();
        return { right: arrow.left - address.right, expected: parseFloat(getComputedStyle(el).columnGap), separation: address.left - label.right };
      });
      expect(Math.abs(gap.right - gap.expected)).toBeLessThan(1);
      expect(gap.separation).toBeGreaterThanOrEqual(gap.expected - 1);
    }
  }
});

test('mobile navigation, escape and current-page links close correctly', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page, '?page=about');
  const menu = page.getByRole('button', { name: 'Меню', exact: true });
  await menu.click();
  await expect(page.locator('#site-navigation a').first()).toBeFocused();
  expect(await page.locator('header').evaluate(el => el.getBoundingClientRect().bottom <= document.querySelector('main').getBoundingClientRect().top)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
  await menu.click();
  await page.locator('#site-navigation').getByRole('link', { name: 'О себе' }).click();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.click();
  await page.locator('#site-navigation').getByRole('link', { name: 'Работы' }).click();
  await expect(page.locator('main h1')).toHaveText('Работы');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
});

test('hero hit areas follow source letters and never the enlarged lower line', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await ready(page);
  await expect(page.locator('h1 .putty-text[data-hit-ready]')).toHaveCount(3);
  const upper = page.locator('h1 > span:first-child .putty-glyph').nth(1);
  const lower = page.locator('.hero-italic-line em .putty-glyph').nth(5);
  const tail = await glyphPoint(upper, .15, .92);
  await page.mouse.move(tail.x, tail.y);
  await expect(upper).toHaveClass(/is-hovered/);
  await expect(page.locator('.hero-italic-line .is-hovered')).toHaveCount(0);
  const lowerPoint = await glyphPoint(lower);
  await page.mouse.move(lowerPoint.x, lowerPoint.y);
  await expect(lower).toHaveClass(/is-hovered/);
  const upperK = page.locator('h1 > span:first-child .putty-glyph').nth(6);
  const upperPoint = await glyphPoint(upperK);
  await page.waitForTimeout(850);
  await page.mouse.move(upperPoint.x, upperPoint.y);
  await expect(upperK).toHaveClass(/is-hovered/);
  await expect(page.locator('.hero-italic-line .is-hovered')).toHaveCount(0);
  await page.mouse.down();
  await page.mouse.move(upperPoint.x + 80, upperPoint.y + 30);
  await expect(upperK).toHaveClass(/is-dragging/);
  await page.mouse.up();
  await expect(page.locator('h1 .is-dragging')).toHaveCount(0);
  const oldHeight = await upperK.evaluate(el => el.style.getPropertyValue('--hit-height'));
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => upperK.evaluate(el => el.style.getPropertyValue('--hit-height'))).not.toBe(oldHeight);
});

test('reduced motion keeps glyphs still and prevents an invisible drag', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  const glyph = page.locator('h1 .putty-glyph').first();
  await expect(glyph).toHaveCSS('--hit-width', /px$/);
  const point = await glyphPoint(glyph);
  await page.mouse.move(point.x, point.y);
  await expect(glyph.locator('.putty-face')).toHaveCSS('transform', 'none');
  await page.mouse.down();
  await expect(page.locator('h1 .is-dragging')).toHaveCount(0);
  await page.mouse.up();
});

test('drawings preserve their natural dimensions and project captions', async ({ page }) => {
  for (const { id } of projects) {
    await ready(page, `?project=${id}`);
    for (const image of await page.locator('main .project-image-button img').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
      expect(await image.evaluate(el => Number(el.getAttribute('width')) === el.naturalWidth && Number(el.getAttribute('height')) === el.naturalHeight)).toBe(true);
      await expect(image).toHaveCSS('object-fit', 'contain');
    }
    await expect(page.locator('.project-plate figcaption').first()).not.toBeEmpty();
  }
});

test('portrait artwork stays complete in featured, grid and list cards and opens both scans', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    for (const path of ['', '?page=portfolio&filter=graphics', '?page=portfolio&view=list&filter=graphics']) {
      await ready(page, path);
      const image = page.locator('a[href="?project=socrates"] .tile-image').first();
      const ratio = await image.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return rect.width / rect.height;
      });
      expect(Math.abs(ratio - 1650 / 2153)).toBeLessThan(.002);
    }
  }
  await ready(page, '?project=socrates');
  await expect(page.locator('main h1')).toHaveText('Сократ');
  await expect(page.locator('.project-image-button')).toHaveCount(2);
  await page.locator('.project-cover button').click();
  await expect(page.locator('.viewer-count')).toHaveText('1 из 2');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.viewer-count')).toHaveText('2 из 2');
  await expect(page.locator('.viewer-image img')).toHaveAttribute('src', /socrates-02.webp$/);
});

test('page, language popup and modal pass automated accessibility checks', async ({ page }) => {
  test.setTimeout(90000);
  for (const path of ['', '?page=portfolio', '?page=about', '?page=contacts', '?project=socrates', '?project=missing']) {
    await ready(page, path);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
  }
  await page.locator('.language-trigger').click();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await ready(page, '?project=socrates');
  await page.locator('.project-cover button').click();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});
