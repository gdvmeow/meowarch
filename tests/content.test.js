import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { projects, socialLinks } from '../src/data.js';
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
  assert.equal(new Set(projects.map(p => p.id)).size, projects.length);
  for (const project of projects) {
    assert.ok(project.images.length > 0);
    for (const image of project.images) {
      await access(new URL(`../public/assets/${image.src}`, import.meta.url));
      assert.ok(image.width > 0 && image.height > 0);
    }
    for (const { code } of languages) {
      const localized = localizeProject(project, code);
      for (const field of ['title', 'category', 'summary', 'description']) assert.ok(localized[field]?.trim());
      assert.ok(localized.images.every(image => image.alt?.trim()));
      if (code !== 'ru') assert.equal(localized.title, copy[code].projects[project.id].title);
    }
  }
});

test('new content can safely fall back while its translation is being written', () => {
  const example = { ...projects[0], id: 'new-project' };
  assert.equal(localizeProject(example, 'en'), example);
  assert.equal(localizeProject(example, 'unknown'), example);
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
