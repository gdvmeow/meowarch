import test from 'node:test';
import assert from 'node:assert/strict';
import { projects } from '../src/data.js';
import { readRoute, portfolioHref, educationHref } from '../src/routing.js';
import { balancedRailBreak } from '../src/portfolioLayout.js';

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

test('portfolio links round-trip each available filter and layout', () => {
  const catalog = [{ group: 'architecture' }, { group: 'graphics' }];
  for (const filter of ['all', 'architecture', 'graphics']) {
    for (const view of ['grid', 'list']) {
      assert.deepEqual(readRoute(portfolioHref({ filter, view }), catalog), {
        type: 'portfolio', key: 'portfolio', filter, view,
      });
    }
  }
  assert.equal(portfolioHref(), '?page=portfolio');
});

test('the two portfolio sections preserve filter and view in reciprocal links', () => {
  const catalog = [{ group: 'architecture' }, { group: 'graphics' }];
  for (const filter of ['all', 'architecture', 'graphics']) {
    for (const view of ['grid', 'list']) {
      const state = { filter, view };
      assert.deepEqual(readRoute(educationHref(state), catalog), {
        type: 'education', key: 'education', filter, view,
      });
      assert.equal(portfolioHref(readRoute(educationHref(state), catalog)), portfolioHref(state));
    }
  }
});

test('unsupported filter and layout parameters recover to valid defaults', () => {
  const route = readRoute('?page=portfolio&filter=invalid&view=invalid', projects);
  assert.equal(route.filter, 'all');
  assert.equal(route.view, 'grid');
});

test('removed work categories recover to the complete current catalog', () => {
  assert.equal(readRoute('?page=portfolio&filter=architecture', [{ group: 'graphics' }]).filter, 'all');
});

test('natural scan proportions determine stable, continuous catalog rail breaks', () => {
  assert.equal(balancedRailBreak(projects), 9);
  assert.equal(balancedRailBreak(projects.filter(project => project.group === 'architecture')), 3);
  assert.equal(balancedRailBreak(projects.filter(project => project.group === 'graphics')), 6);
});
