import test from 'node:test';
import assert from 'node:assert/strict';
import { projects } from '../src/data.js';
import { readRoute, portfolioHref } from '../src/routing.js';

test('valid project deep links resolve and take precedence over page parameters', () => {
  for (const project of projects) {
    assert.deepEqual(readRoute(`?page=about&project=${project.id}`, projects), {
      type: 'project', projectId: project.id, key: `project-${project.id}`,
    });
  }
});

test('missing projects and unknown pages have a recovery route', () => {
  for (const search of ['?project=missing', '?project=', '?page=missing']) {
    assert.equal(readRoute(search, projects).type, 'notFound');
  }
  assert.equal(readRoute('', projects).type, 'home');
});

test('portfolio links round-trip each filter and layout', () => {
  for (const filter of ['all', 'architecture', 'graphics']) {
    for (const view of ['grid', 'list']) {
      assert.deepEqual(readRoute(portfolioHref({ filter, view }), projects), {
        type: 'portfolio', key: 'portfolio', filter, view,
      });
    }
  }
  assert.equal(portfolioHref(), '?page=portfolio');
});

test('unsupported filter and layout parameters recover to valid defaults', () => {
  const route = readRoute('?page=portfolio&filter=invalid&view=invalid', projects);
  assert.equal(route.filter, 'all');
  assert.equal(route.view, 'grid');
});
