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
  assert.equal(projects.length, 23);
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


test('the two November architecture works retain distinct sheets and complete translations', async () => {
  const manifest = JSON.parse(await readFile(new URL('../content/scan-imports/architecture-2026-11-05.json', import.meta.url), 'utf8'));
  assert.deepEqual(manifest.works.map(work => work.projectId), ['mansard-house', 'house-on-slope']);
  for (const entry of manifest.works) {
    const project = projects.find(work => work.id === entry.projectId);
    assert.equal(project.group, 'architecture');
    assert.equal(project.images.length, 1);
    assert.equal(project.images[0].src, entry.asset);
    assert.equal(project.images[0].width, entry.width);
    assert.equal(project.images[0].height, entry.height);
    const bytes = await readFile(new URL(`../public/assets/${entry.asset}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.processedSha256);
    await assert.rejects(access(new URL(`../public/assets/${entry.sourceFile}`, import.meta.url)));
    for (const { code } of languages) assert.ok(localizeProject(project, code).images[0].alt);
  }
  assert.equal(projects.find(work => work.id === 'mansard-house').title, 'Малоэтажный жилой дом');
  assert.equal(projects.find(work => work.id === 'house-on-slope').title, 'Дом на яру');
});

test('personal profile has complete facts and every requested software tool', async () => {
  const { software } = await import('../src/software.js');
  assert.deepEqual(software.map(tool => tool.name), ['Renga', 'NanoCAD', 'AutoCAD', 'Autodesk Revit', 'Archicad', 'Blender', 'SketchUp', '3ds Max', 'Rhinoceros 3D', 'Grasshopper', 'Lumion', 'Twinmotion', 'Adobe Photoshop', 'Adobe Illustrator', 'Adobe InDesign']);
  const manifest = JSON.parse(await readFile(new URL('../content/software-icons.json', import.meta.url), 'utf8'));
  for (const tool of software) {
    if (tool.icon) {
      const entry = manifest.assets.find(asset => asset.id === tool.id);
      assert.ok(entry?.source && entry?.license);
      const bytes = await readFile(new URL(`../public/assets/software/${tool.icon}`, import.meta.url));
      assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256);
    } else assert.fail(`Missing icon for ${tool.name}`);
  }
  for (const { code } of languages) {
    const about = copy[code].about;
    assert.equal(about.body.length, 2);
    assert.equal(about.competencies.length, 4);
    assert.equal(about.practice.length, 2);
    assert.equal(about.education.length, 2);
    const strings = value => typeof value === 'string' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];
    assert.ok(!strings(about).some(text => /\[[^\]]+\]/.test(text)), code);
    assert.equal(about.iconsNote, undefined);
    assert.equal(about.approachHeading, undefined);
    assert.equal(about.approach, undefined);
    assert.match(about.education[0].title, /ГБПОУ «МКАГ»/);
    assert.match(about.education[0].period, /2025/);
    assert.match(about.education[1].period, /2019.*2024/);
  }
});


test('renamed studies preserve their original links, image metadata and translated names', async () => {
  const expected = {
    'portal-facade': { names: { ru: 'Фонтан Треви', en: 'Trevi Fountain', zh: '特雷维喷泉' }, width: 2024, height: 1422 },
    'line-landscape': { names: { ru: 'Антураж и стаффаж', en: 'Entourage and staffage', zh: '环境配景与人物点景' }, width: 2024, height: 1435 },
  };
  const manifest = JSON.parse(await readFile(new URL('../content/scan-imports/terzyan-dump.json', import.meta.url), 'utf8'));
  for (const [id, entry] of Object.entries(expected)) {
    const project = projects.find(project => project.id === id);
    assert.ok(project);
    assert.deepEqual(project.images.map(({ src, width, height }) => ({ src, width, height })), [{ src: `${id}.webp`, width: entry.width, height: entry.height }]);
    assert.equal(manifest.pages.find(page => page.projectId === id && page.status === 'selected').title, entry.names.ru);
    for (const { code } of languages) {
      const localized = localizeProject(project, code);
      assert.equal(localized.id, id);
      assert.equal(localized.title, entry.names[code]);
      assert.ok(localized.images[0].alt.startsWith(entry.names[code]));
    }
  }
});

test('practice photos retain their full frames and localized dates and captions', async () => {
  const { practicePhotos } = await import('../src/practice.js');
  const manifest = JSON.parse(await readFile(new URL('../content/scan-imports/practice-2026.json', import.meta.url), 'utf8'));
  assert.equal(manifest.period, '2026-05/2026-06');
  assert.equal(practicePhotos.length, 3);
  for (const [index, photo] of practicePhotos.entries()) {
    const entry = manifest.photos[index];
    assert.equal(entry.asset, photo.src);
    assert.deepEqual([photo.width, photo.height], [960, 1280]);
    const bytes = await readFile(new URL(`../public/assets/${photo.src}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.processedSha256);
    await assert.rejects(access(new URL(`../public/assets/${entry.sourceFile}`, import.meta.url)));
  }
  for (const { code } of languages) {
    assert.match(copy[code].about.practicePeriod, /2026/);
    assert.equal(copy[code].about.practicePhotoAlts.length, 3);
    assert.ok(copy[code].about.practicePhotoAlts.every(alt => alt.trim()));
  }
  assert.match(copy.ru.about.practice[0], /менее недели/);
  assert.match(copy.en.about.practice[0], /less than a week/);
  assert.match(copy.zh.about.practice[0], /不到一周/);
});

test('the Rotterdam house preserves the complete source sheet and a separate facade detail', async () => {
  const manifest = JSON.parse(await readFile(new URL('../content/scan-imports/rotterdam-house.json', import.meta.url), 'utf8'));
  const project = projects.find(project => project.id === manifest.projectId);
  assert.equal(manifest.sourcePages, 1);
  assert.equal(manifest.sourceTitle, 'TWO-FAMILY HOUSE IN ROTTERDAM');
  assert.equal(project.group, 'architecture');
  assert.equal(project.images.length, 2);
  for (const [index, image] of project.images.entries()) {
    const entry = manifest.assets[index];
    assert.deepEqual([image.src, image.width, image.height], [entry.src, entry.width, entry.height]);
    const bytes = await readFile(new URL(`../public/assets/${image.src}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256);
  }
  assert.deepEqual(manifest.assets[0].cropBox, [0, 0, 1978, 2630]);
  await assert.rejects(access(new URL(`../public/assets/${manifest.sourceFile}`, import.meta.url)));
});
