const pages = new Set(['portfolio', 'about', 'contacts', 'education']);
const filters = new Set(['all', 'architecture', 'graphics']);

export function readRoute(search, projects) {
  const params = new URLSearchParams(search);
  if (params.has('project')) {
    const project = projects.find(item => item.id === params.get('project'));
    return project
      ? { type: 'project', projectId: project.id, key: `project-${project.id}` }
      : { type: 'notFound', key: 'not-found' };
  }
  const page = params.get('page');
  if (!page) return { type: 'home', key: 'home' };
  if (!pages.has(page)) return { type: 'notFound', key: 'not-found' };
  return {
    type: page,
    key: page,
    ...(page === 'portfolio' && {
      filter: projects.some(project => project.group === params.get('filter')) ? params.get('filter') : 'all',
      view: params.get('view') === 'list' ? 'list' : 'grid',
    }),
  };
}

export function portfolioHref({ filter = 'all', view = 'grid' } = {}) {
  const params = new URLSearchParams({ page: 'portfolio' });
  if (filters.has(filter) && filter !== 'all') params.set('filter', filter);
  if (view === 'list') params.set('view', view);
  return `?${params}`;
}
