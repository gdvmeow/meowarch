import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { projects, socialLinks } from '../src/data.js';
import { scanStudies } from '../src/scanStudies.js';
import { certificatePages } from '../src/educationDocument.js';
import { copy, languages, localizeProject, localizeSocial } from '../src/i18n.js';

function shape(value) {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]));
  return typeof value;
}

test('all languages have matching interface and profile fields', () => {
  const { projects: _projects, ...base } = copy.en;
  for (const { code } of languages) {
    const { projects: _translations, ...translated } = copy[code];
    assert.deepEqual(shape(translated), shape(base), code);
  }
});

test('every project has an existing image with dimensions and a translated description', async () => {
  assert.equal(projects.length, 20);
  assert.equal(new Set(projects.map(p => p.id)).size, projects.length);
  for (const project of projects) {
    assert.ok(project.images.length > 0);
    for (const image of [...project.images, ...(project.cover ? [project.cover] : [])]) {
      await access(new URL(`../public/assets/${image.src}`, import.meta.url));
      assert.ok(image.width > 0 && image.height > 0);
    }
    for (const { code } of languages) {
      const localized = localizeProject(project, code);
      for (const field of ['title', 'category', 'summary', 'description']) assert.ok(localized[field]?.trim());
      assert.ok(localized.images.every(image => image.alt?.trim()));
      if (code !== 'ru') {
        assert.equal(localized.title, copy[code].projects[project.id].title);
        assert.equal(copy[code].projects[project.id].imageAlts.length, project.images.length);
      }
    }
  }
});

test('new content can safely fall back while its translation is being written', () => {
  const example = { ...projects[0], id: 'new-project' };
  assert.equal(localizeProject(example, 'en'), example);
  assert.equal(localizeProject(example, 'unknown'), example);
});

test('the scan dump contributes exactly 16 distinct sheets, with every source page accounted for', async () => {
  const manifest = JSON.parse(await readFile(new URL('../content/scan-imports/terzyan-dump.json', import.meta.url), 'utf8'));
  assert.deepEqual(manifest.pages.map(p => p.page), Array.from({ length: 24 }, (_, i) => i + 1));
  const selected = manifest.pages.filter(p => p.status === 'selected');
  assert.equal(selected.length, 16);
  assert.equal(manifest.pages.filter(p => p.status === 'excluded-socrates').length, 4);
  assert.equal(manifest.pages.filter(p => p.status === 'duplicate').length, 4);
  assert.deepEqual(selected.map(p => p.uniqueImage), Array.from({ length: 16 }, (_, i) => i + 1));
  const images = scanStudies.flatMap(project => project.images);
  assert.equal(images.length, 16);
  assert.equal(scanStudies.length, 15);
  assert.deepEqual(new Set(images.map(i => i.src)), new Set(selected.map(p => p.asset)));
  assert.equal(new Set(selected.map(p => p.processedSha256)).size, 16);
  for (const image of selected) {
    const bytes = await readFile(new URL(`../public/assets/${image.asset}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), image.processedSha256, image.asset);
    assert.ok(scanStudies.find(p => p.id === image.projectId)?.images.some(i => i.src === image.asset));
  }
  assert.ok(!scanStudies.some(p => p.id === 'socrates'));
  const publicFiles = await readdir(new URL('../public/assets/', import.meta.url));
  assert.ok(!publicFiles.some(file => /\.pdf$/i.test(file)), 'Original documents stay outside public assets');
});

test('the separate certificate has three verified public pages without source document bytes', async () => {
  const manifest = JSON.parse(await readFile(new URL('../content/scan-imports/education.json', import.meta.url), 'utf8'));
  assert.equal(manifest.sourcePages, 3);
  assert.deepEqual(manifest.publicPages, [1, 2, 3]);
  assert.equal(certificatePages.length, 3);
  assert.deepEqual(certificatePages.map(page => page.src), manifest.publicAssets.map(page => page.src));
  for (const page of certificatePages) {
    const bytes = await readFile(new URL(`../public/assets/${page.src}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), page.sha256);
    assert.ok(page.width > 0 && page.height > 0);
    assert.ok(!scanStudies.some(work => work.images.some(image => image.src === page.src)));
  }
  const publicFiles = await readdir(new URL('../public/assets/', import.meta.url));
  assert.ok(!publicFiles.some(file => /\.pdf$/i.test(file)));
  assert.ok(!publicFiles.includes('education-certificate.webp'));
});

test('social targets retain valid URLs across languages', () => {
  for (const link of socialLinks) {
    assert.equal(new URL(link.href).protocol, 'https:');
    for (const { code } of languages) {
      const localized = localizeSocial(link, code);
      assert.equal(localized.href, link.href);
      assert.ok(localized.label && localized.detail);
    }
  }
});
