import { test, expect } from '@playwright/test';
import { imageCorrections } from '../../src/imageCorrections.js';

// Pixel checks complement full-frame/gallery tests: replacing a source filename
// alone must not accidentally reintroduce the warm scan or dark photograph.
async function samples(page, path, box = [0, 0, 1, 1]) {
  return page.evaluate(async ({ path, box }) => {
    const image = new Image();
    image.src = new URL(`./assets/${path}`, location.href).href;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = 180; canvas.height = 240;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const [x, y, width, height] = box;
    context.drawImage(image, x*image.naturalWidth, y*image.naturalHeight,
      width*image.naturalWidth, height*image.naturalHeight, 0, 0, 180, 240);
    const data = context.getImageData(0, 0, 180, 240).data;
    const luminance = []; let cast = 0;
    for (let i = 0; i < data.length; i += 4) {
      luminance.push(.299*data[i] + .587*data[i+1] + .114*data[i+2]);
      cast += Math.abs(data[i]-data[i+2]);
    }
    luminance.sort((a, b) => a-b);
    return {
      cast: cast/luminance.length,
      mean: luminance.reduce((sum, value) => sum+value, 0)/luminance.length,
      range: luminance[Math.floor(luminance.length*.9)] - luminance[Math.floor(luminance.length*.1)],
      size: [image.naturalWidth, image.naturalHeight],
    };
  }, { path, box });
}

test('Antinous tonal copies remove warm cast, brighten paper and retain more readable pencil contrast', async ({ page }) => {
  await page.goto('./?project=antinous');
  const photograph = await samples(page, imageCorrections['antinous.jpg'].src);
  const sourcePhotograph = await samples(page, 'antinous.jpg');
  expect(photograph.size).toEqual(sourcePhotograph.size);
  expect(photograph.cast).toBeLessThan(2);
  expect(photograph.mean).toBeGreaterThan(sourcePhotograph.mean + 35);
  const paper = [.025, .025, .13, .075];
  const neutralPaper = await samples(page, imageCorrections['antinous-scan.webp'].src, paper);
  const sourcePaper = await samples(page, 'antinous-scan.webp', paper);
  expect(neutralPaper.size).toEqual(sourcePaper.size);
  expect(neutralPaper.cast).toBeLessThan(2);
  expect(neutralPaper.mean).toBeGreaterThan(sourcePaper.mean + 12);
  const drawing = [.2, .1, .65, .65];
  const neutralDrawing = await samples(page, imageCorrections['antinous-scan.webp'].src, drawing);
  const sourceDrawing = await samples(page, 'antinous-scan.webp', drawing);
  expect(neutralDrawing.range).toBeGreaterThan(sourceDrawing.range + 15);
});

test('Minsk diploma uses the same corrected full frame in the page, viewer and download link', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./?page=education');
  const document = page.locator('#on-our-land-diploma-2024');
  const corrected = imageCorrections['awards/on-our-land-diploma-2024.webp'];
  const image = document.locator('img');
  await image.scrollIntoViewIfNeeded();
  await image.evaluate(image => image.decode());
  await expect(image).toHaveAttribute('src', new RegExp(`${corrected.src}$`));
  expect(await image.evaluate(image => [image.naturalWidth, image.naturalHeight])).toEqual([745, 1128]);
  await document.locator('button').click();
  await expect(page.locator('.viewer-image img')).toHaveAttribute('src', new RegExp(`${corrected.src}$`));
  await expect(page.locator('.viewer-caption a')).toHaveAttribute('href', new RegExp(`${corrected.src}$`));
  await page.keyboard.press('Escape');
  await expect(document.locator('button')).toBeFocused();
});
