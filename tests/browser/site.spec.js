import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { projects } from '../../src/data.js';

const pages = ['', '?page=portfolio', '?page=about', '?page=contacts', '?page=education', ...projects.map(project => `?project=${project.id}`), '?project=missing'];

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
  test.setTimeout(180000);
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
  test.setTimeout(120000);
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

test('portfolio restores filters and layouts with one cover per real work', async ({ page }) => {
  await ready(page, '?page=portfolio');
  await expect(page.locator('.project-tile')).toHaveCount(projects.length);
  for (const project of projects) {
    const tile = page.locator(`a.project-tile[href="?project=${project.id}"]`);
    await expect(tile.locator('img')).toHaveCount(1);
    await expect(tile.locator('img')).toHaveAttribute('src', new RegExp(`${(project.cover ?? project.images[0]).src}$`));
    await tile.locator('img').scrollIntoViewIfNeeded();
    await tile.locator('img').evaluate(im => im.decode());
    const frame = await tile.locator('.tile-image').evaluate(el => {
      const image = el.querySelector('img');
      const box = el.getBoundingClientRect();
      const rect = image.getBoundingClientRect();
      return { gap: Math.abs(box.height - rect.height) + Math.abs(box.width - rect.width), ratio: rect.width / rect.height, naturalRatio: image.naturalWidth / image.naturalHeight };
    });
    expect(frame.gap, project.id).toBeLessThan(1);
    expect(Math.abs(frame.ratio - frame.naturalRatio), project.id).toBeLessThan(.005);
  }
  await page.getByRole('navigation', { name: 'Разделы работ' }).getByRole('link', { name: 'Графика' }).click();
  await expect(page).toHaveURL(/filter=graphics/);
  await expect(page.locator('.project-tile')).toHaveCount(projects.filter(p => p.group === 'graphics').length);
  await page.getByRole('navigation', { name: 'Вид работ' }).getByRole('button', { name: 'Список' }).click();
  await expect(page).toHaveURL(/view=list/);
  await page.reload();
  await expect(page.locator('.portfolio-grid')).toHaveClass(/is-list/);
  await expect(page.locator('.project-tile')).toHaveCount(projects.filter(p => p.group === 'graphics').length);
  await page.goBack();
  await expect(page.locator('.portfolio-grid')).not.toHaveClass(/is-list/);
  await page.goBack();
  await expect(page.locator('.project-tile')).toHaveCount(projects.length);
  for (const id of ['house', 'structure', 'courtyard', 'drawing', 'form']) {
    await ready(page, `?project=${id}`);
    await expect(page.locator('main h1')).toHaveText('Страница не найдена');
  }
});

test('Portfolio navigation and paired section headings retain catalog state', async ({ page }) => {
  await ready(page);
  for (const [language, topLabel, workLabel, educationLabel] of [
    ['ru', 'Портфолио', 'Работы', 'Образование и опыт'],
    ['en', 'Portfolio', 'Work', 'Education & experience'],
    ['zh', '作品集', '作品', '教育与经历'],
  ]) {
    await page.evaluate(language => localStorage.setItem('meowarch-language', language), language);
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      await ready(page, '?page=portfolio&filter=graphics&view=list');
      await expect(page.locator('main h1')).toHaveText(workLabel);
      await expect(page.locator('.portfolio-section-link')).toHaveText(educationLabel);
      const topLink = page.locator('.site-nav a[href="?page=portfolio"]');
      await expect(topLink).toHaveText(topLabel);
      await expect(topLink).toHaveAttribute('aria-current', 'page');
      await page.locator('.portfolio-section-link').click();
      await expect(page).toHaveURL(/page=education&filter=graphics&view=list/);
      await expect(page.locator('main h1')).toHaveText(educationLabel);
      await expect(page.locator('.portfolio-section-link')).toHaveText(workLabel);
      await expect(topLink).toHaveAttribute('aria-current', 'page');
      await page.locator('.portfolio-section-link').click();
      await expect(page).toHaveURL(/page=portfolio&filter=graphics&view=list/);
      await expect(page.locator('.portfolio-grid')).toHaveClass(/is-list/);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});

test('the long English education title keeps its reciprocal link nearby', async ({ page }) => {
  await ready(page);
  await page.evaluate(() => localStorage.setItem('meowarch-language', 'en'));
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await ready(page, '?page=education');
    const heading = await page.locator('main h1').boundingBox();
    const link = await page.locator('.portfolio-section-link').boundingBox();
    if (width < 900) {
      expect(Math.abs(link.x - heading.x)).toBeLessThan(1);
      expect(link.y).toBeGreaterThanOrEqual(heading.y + heading.height);
    } else {
      expect(link.x - (heading.x + heading.width)).toBeGreaterThanOrEqual(16);
      expect(link.x - (heading.x + heading.width)).toBeLessThanOrEqual(40);
      expect(heading.height).toBeLessThan(100);
    }
  }
});

test('all three certificate pages appear in order and open a complete accessible gallery', async ({ page }) => {
  await ready(page, '?page=education');
  const sheets = page.locator('.credential-document');
  await expect(sheets).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    const image = sheets.nth(i).locator('img');
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(el => el.decode());
    await expect(image).toHaveAttribute('src', new RegExp(`certificate-page-${i + 1}\\.webp$`));
    expect(await image.evaluate(el => Math.abs(el.getBoundingClientRect().width / el.getBoundingClientRect().height - el.naturalWidth / el.naturalHeight))).toBeLessThan(.005);
  }
  const opener = sheets.nth(1).locator('button');
  await opener.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page.locator('.viewer-count')).toHaveText('2 из 3');
  await expect(page.locator('.viewer-image img')).toHaveAttribute('src', /certificate-page-2\.webp$/);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.viewer-count')).toHaveText('3 из 3');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.viewer-count')).toHaveText('1 из 3');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('the full catalog follows two steady rails without tall empty row gaps', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await ready(page, '?page=portfolio');
  const rails = page.locator('.portfolio-rail');
  await expect(rails).toHaveCount(2);
  for (const rail of await rails.all()) {
    const cards = await rail.locator('.project-tile').all();
    expect(cards.length).toBeGreaterThan(0);
    const boxes = await Promise.all(cards.map(card => card.boundingBox()));
    for (let i = 1; i < boxes.length; i++) {
      expect(boxes[i].x - boxes[0].x).toBeLessThan(1);
      expect(boxes[i].y - (boxes[i - 1].y + boxes[i - 1].height)).toBeGreaterThanOrEqual(63);
      expect(boxes[i].y - (boxes[i - 1].y + boxes[i - 1].height)).toBeLessThanOrEqual(65);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.project-tile')).toHaveCount(projects.length);
  const order = await page.locator('.project-tile').evaluateAll(cards => cards.map(card => card.getAttribute('href')));
  expect(order).toEqual(projects.map(project => `?project=${project.id}`));
});

test('each catalog filter balances natural sheets while preserving the source and Tab order', async ({ page }) => {
  for (const width of [768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 960 });
    for (const filter of ['all', 'architecture', 'graphics']) {
      await ready(page, `?page=portfolio${filter === 'all' ? '' : `&filter=${filter}`}`);
      const shown = projects.filter(project => filter === 'all' || project.group === filter);
      const rails = page.locator('.portfolio-rail');
      const cards = await rails.locator('.project-tile').all();
      expect(await Promise.all(cards.map(card => card.getAttribute('href')))).toEqual(shown.map(project => `?project=${project.id}`));
      const ends = await rails.evaluateAll(elements => elements.map(rail => {
        const card = rail.querySelector('.project-tile:last-child');
        const box = card.getBoundingClientRect();
        return box.bottom;
      }));
      expect(Math.abs(ends[0] - ends[1]), `${width} ${filter}`).toBeLessThan(650);
      if (width === 1440 && filter === 'graphics') {
        await cards[0].focus();
        for (let i = 1; i < cards.length; i++) {
          await page.keyboard.press('Tab');
          await expect(cards[i]).toBeFocused();
        }
      }
    }
  }
});

test('certificate pages use a readable single column at tablet width', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 960 });
  await ready(page, '?page=education');
  const documents = await page.locator('.credential-document').evaluateAll(elements => elements.map(el => {
    const rect = el.getBoundingClientRect();
    return { x: rect.x, top: rect.top, bottom: rect.bottom, width: rect.width };
  }));
  expect(documents).toHaveLength(3);
  for (let i = 0; i < documents.length; i++) {
    expect(documents[i].width).toBeGreaterThan(600);
    if (i) {
      expect(Math.abs(documents[i].x - documents[0].x)).toBeLessThan(1);
      expect(documents[i].top - documents[i - 1].bottom).toBeGreaterThanOrEqual(31);
    }
  }
});

test('card hover, keyboard focus and touch activation share one direct affordance', async ({ page, browser }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await ready(page, '?page=portfolio');
  const tile = page.locator('.project-tile').first();
  await tile.hover();
  await expect.poll(() => tile.evaluate(el => getComputedStyle(el).transform)).toBe('matrix(1, 0, 0, 1, 0, -3)');
  await expect(tile.locator('h3')).toHaveCSS('text-decoration-color', 'rgb(37, 43, 38)');
  await tile.focus();
  await expect(tile).toHaveCSS('outline-style', 'solid');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(tile).toHaveCSS('transform', 'none');
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const touchPage = await context.newPage();
  await ready(touchPage, '?page=portfolio');
  await touchPage.locator('.project-tile').first().tap();
  await expect(touchPage).toHaveURL(new RegExp(`project=${projects[0].id}`));
  await context.close();
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

test('list titles and categories stay inside their column, clear of thumbnails in every language', async ({ page }) => {
  await ready(page, '?page=portfolio&view=list');
  for (const language of ['ru', 'en', 'zh']) {
    await page.evaluate(language => localStorage.setItem('meowarch-language', language), language);
    await ready(page, '?page=portfolio&view=list');
    for (const width of [320, 360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      const rows = await page.locator('.project-tile').evaluateAll(tiles => tiles.map(tile => {
        const column = tile.querySelector('.tile-meta').getBoundingClientRect();
        const thumbnail = tile.querySelector('.tile-image').getBoundingClientRect();
        return [...tile.querySelectorAll('.tile-meta h3, .tile-meta p')].map(text => {
          const range = document.createRange();
          range.selectNodeContents(text);
          const rect = range.getBoundingClientRect();
          return { text: text.textContent, overflow: rect.right - column.right, separation: thumbnail.left - rect.right };
        });
      }).flat());
      for (const row of rows) {
        expect(row.overflow, `${language} ${width}: ${row.text}`).toBeLessThanOrEqual(1);
        expect(row.separation, `${language} ${width}: ${row.text}`).toBeGreaterThanOrEqual(12);
      }
    }
  }
});

test('the six longest project titles wrap between whole words on narrow screens', async ({ page }) => {
  const ids = ['low-rise-house', 'single-storey-house', 'house-construction', 'graphic-textures', 'projection-study', 'geometric-solids'];
  await ready(page);
  for (const language of ['ru', 'en']) {
    await page.evaluate(language => localStorage.setItem('meowarch-language', language), language);
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      for (const id of ids) {
        await ready(page, `?project=${id}`);
        const broken = await page.locator('main h1').evaluate(el => {
          const text = el.firstChild;
          // A written hyphen is an intentional break between lexical words.
          return [...text.textContent.matchAll(/[\p{L}\p{N}]+/gu)].filter(match => {
            const range = document.createRange();
            range.setStart(text, match.index);
            range.setEnd(text, match.index + match[0].length);
            return new Set([...range.getClientRects()].filter(rect => rect.width).map(rect => Math.round(rect.top))).size > 1;
          }).map(match => match[0]);
        });
        expect(broken, `${language} ${width}: ${id}`).toEqual([]);
      }
    }
  }
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

test('project navigation advances to a different real work and wraps around', async ({ page }) => {
  for (const [index, project] of projects.entries()) {
    await ready(page, `?project=${project.id}`);
    const next = projects[(index + 1) % projects.length];
    await expect(page.locator('.project-next')).toHaveAttribute('href', `?project=${next.id}`);
  }
});

test('a one-sheet architecture project opens a gallery without inactive paging controls', async ({ page }) => {
  await ready(page, '?project=low-rise-house');
  await page.locator('.project-cover button').click();
  await expect(page.locator('.viewer-count')).toHaveText('1 из 1');
  await expect(page.locator('.viewer-controls')).toHaveCount(0);
  await page.getByRole('button', { name: 'Закрыть', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('clipboard success and denial give usable feedback', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await ready(page, '?page=contacts');
  await page.getByRole('button', { name: 'Скопировать адрес' }).click();
  const copyPosition = await page.locator('.contact-address').evaluate(el => ({
    addressRight: el.querySelector('.contact-email').getBoundingClientRect().right,
    buttonLeft: el.querySelector('.copy-button').getBoundingClientRect().left,
  }));
  expect(copyPosition.buttonLeft - copyPosition.addressRight).toBeGreaterThanOrEqual(8);
  await expect(page.getByRole('status')).toHaveText('Адрес скопирован');
  await expect(page.locator('.copy-button')).toHaveAttribute('data-state', 'copied');
  await expect(page.locator('.copy-button')).toHaveAccessibleName('Скопировать адрес');
  await expect(page.locator('.copy-button')).toHaveText('');
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
  await expect(page.locator('.portfolio-cta')).toHaveCSS('color', ink);
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
  await page.locator('#site-navigation').getByRole('link', { name: 'Портфолио' }).click();
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

test('the full About photo fills a substantial desktop column at 100% and 80% scale', async ({ browser }) => {
  for (const scale of [1, .8]) {
    const context = await browser.newContext({ viewport: { width: 1920 / scale, height: 1080 / scale }, deviceScaleFactor: scale });
    const page = await context.newPage();
    await ready(page, '?page=about');
    const photo = page.locator('.about-portrait img');
    await photo.evaluate(image => image.decode());
    const geometry = await photo.evaluate(image => {
      const rect = image.getBoundingClientRect();
      return { width: rect.width, ratio: rect.width / rect.height, share: rect.width / document.querySelector('.about-grid').clientWidth, source: [image.naturalWidth, image.naturalHeight] };
    });
    expect(geometry.source).toEqual([1280, 960]);
    expect(Math.abs(geometry.ratio - 4 / 3)).toBeLessThan(.005);
    expect(geometry.width * scale).toBeGreaterThan(440);
    expect(geometry.share).toBeGreaterThan(.43);
    await context.close();
  }
});

test('Socrates has one cover while its second scan stays inside the work', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    for (const path of ['?page=portfolio&filter=graphics', '?page=portfolio&view=list&filter=graphics']) {
      await ready(page, path);
      const tile = page.locator('a.project-tile[href="?project=socrates"]');
      await expect(tile.locator('img')).toHaveCount(1);
      await expect(tile.locator('img')).toHaveCSS('object-fit', 'contain');
      await expect(tile.locator('img')).toHaveAttribute('src', /socrates-01.webp$/);
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
  for (const path of ['', '?page=portfolio', '?page=about', '?page=contacts', '?page=education', '?project=socrates', '?project=missing']) {
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


test('visible choices follow actual text widths, keep type hierarchy and icon-only view controls', async ({ page }) => {
  for (const language of ['ru', 'en', 'zh']) {
    await ready(page);
    await page.evaluate(language => localStorage.setItem('meowarch-language', language), language);
    for (const width of [320, 390, 768, 1440, 2400]) {
      await page.setViewportSize({ width, height: 960 });
      await ready(page, '?page=portfolio');
      const filters = page.locator('.project-filters a');
      for (let i = 0; i < await filters.count(); i++) {
        await filters.nth(i).click();
        await page.waitForTimeout(250);
        const sizes = await filters.evaluateAll(links => links.map(el => ({
          selected: el.hasAttribute('aria-current'),
          size: parseFloat(getComputedStyle(el.querySelector('.choice-text > span')).fontSize),
          fill: getComputedStyle(el).backgroundColor,
          height: el.getBoundingClientRect().height,
        })));
        expect(sizes.filter(item => item.selected)).toHaveLength(1);
        expect(sizes[i].size).toBeGreaterThanOrEqual(Math.max(...sizes.filter(item => !item.selected).map(item => item.size)) * 1.3);
        expect(sizes.every(item => item.fill === 'rgba(0, 0, 0, 0)' && item.height >= 44)).toBe(true);
        const geometry = await filters.evaluateAll(links => links.map(el => {
          const box = el.getBoundingClientRect();
          const text = el.querySelector('.choice-text > span').getBoundingClientRect();
          return { x: box.x, y: box.y, right: box.right, width: box.width, textWidth: text.width };
        }));
        const gap = await page.locator('.project-filters').evaluate(el => parseFloat(getComputedStyle(el).columnGap));
        for (let j = 0; j < geometry.length; j++) {
          expect(Math.abs(geometry[j].width - geometry[j].textWidth)).toBeLessThan(1);
          if (j && Math.abs(geometry[j].y - geometry[j - 1].y) < 12) expect(Math.abs(geometry[j].x - geometry[j - 1].right - gap)).toBeLessThan(1);
        }
      }
      const buttons = page.locator('.portfolio-view button');
      await expect(buttons).toHaveCount(2);
      await expect(buttons.nth(0)).toHaveAttribute('aria-pressed', 'true');
      await buttons.nth(1).focus();
      await page.keyboard.press('Space');
      await expect(page).toHaveURL(/view=list/);
      await expect(buttons.nth(1)).toHaveAttribute('aria-pressed', 'true');
      await expect(buttons.nth(1)).toBeFocused();
      await expect(buttons.nth(1)).toHaveCSS('outline-style', 'solid');
      await expect(buttons.nth(1)).toHaveText('');
      await page.goBack();
      await expect(buttons.nth(0)).toHaveAttribute('aria-pressed', 'true');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});

test('home actions, footer group, Houdon deep link and LinkedIn are coherent in every language', async ({ page }) => {
  for (const [language, title] of [['ru', 'Экорше Гудона'], ['en', 'Houdon’s écorché'], ['zh', '乌东人体解剖像']]) {
    await ready(page);
    await page.evaluate(language => localStorage.setItem('meowarch-language', language), language);
    for (const width of [320, 390, 768, 1440, 2400]) {
      await page.setViewportSize({ width, height: 960 });
      await ready(page);
      await expect(page.locator('.hero-project-link')).toHaveAttribute('href', '#selected-work');
      await expect(page.locator('.portfolio-cta')).toHaveAttribute('href', '?page=portfolio');
      await page.locator('.hero-project-link').click();
      await expect(page.locator('#selected-work')).toBeInViewport();
      await page.locator('.portfolio-cta').click();
      await expect(page).toHaveURL(/page=portfolio/);
      await expect(page.locator('.footer-identity > p')).toHaveCount(0);
      const gap = await page.locator('.footer-identity').evaluate(el => el.querySelector('a').getBoundingClientRect().top - el.querySelector('h2').getBoundingClientRect().bottom);
      expect(gap).toBeLessThanOrEqual(10);
      await ready(page, '?project=head-muscles');
      await expect(page.locator('main h1')).toHaveText(title);
      await expect(page.locator('.project-cover img')).toHaveAttribute('alt', new RegExp(title));
      await ready(page, '?page=contacts');
      await expect(page.locator('.social-row[href="https://linkedin.com/in/gdvmeow"] .social-detail')).toHaveText('linkedin.com/in/gdvmeow');
      await expect(page.locator('.contact-label')).toHaveCount(0);
      const geometry = await page.locator('.contact-address').evaluate(el => {
        const address = el.querySelector('a').getBoundingClientRect();
        const button = el.querySelector('button').getBoundingClientRect();
        return { gap: button.left - address.right, aligned: Math.abs(button.top + button.height / 2 - address.top - address.height / 2), right: button.right, addressHeight: address.height, lineHeight: parseFloat(getComputedStyle(el.querySelector('a')).lineHeight) };
      });
      expect(geometry.gap).toBeGreaterThanOrEqual(8);
      expect(geometry.aligned).toBeLessThan(1);
      expect(geometry.right).toBeLessThanOrEqual(width);
      expect(geometry.addressHeight).toBeLessThanOrEqual(geometry.lineHeight + 1);
    }
  }
});

test('new control motion respects reduced motion while preserving success and selection', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  await page.locator('.portfolio-cta').hover();
  await expect(page.locator('.portfolio-cta .icon')).toHaveCSS('transform', 'none');
  await ready(page, '?page=portfolio');
  await page.locator('.portfolio-view button').first().hover();
  for (const shape of await page.locator('.portfolio-view .icon > *').all()) await expect(shape).toHaveCSS('transform', 'none');
  await ready(page, '?page=contacts');
  await page.evaluate(() => { navigator.clipboard.writeText = () => Promise.resolve(); });
  await page.locator('.copy-button').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.copy-button')).toHaveAttribute('data-state', 'copied');
  await expect(page.locator('.copy-button .icon').last()).toHaveCSS('opacity', '1');
  await expect(page.locator('.copy-button .icon').last()).toHaveCSS('transform', 'none');
  await expect(page.getByRole('status')).toHaveText('Адрес скопирован');
});
