import React, { useCallback, useState } from 'react';
import { asset } from '../data.js';
import { portfolioHref } from '../routing.js';
import PuttyText from '../PuttyText.jsx';
import ProjectTile from '../components/ProjectTile.jsx';
import GalleryViewer from '../components/GalleryViewer.jsx';

export function Home({ t, projects }) {
  return <main id="main" tabIndex="-1" className="home-page">
    <section className="home-hero" aria-label={t.pageTitles.home}>
      <div className="shell hero-shell">
        <div className="hero-copy">
          <h1><span><PuttyText variant="hero">{t.hero.architecture}</PuttyText></span><span className="hero-italic-line"><PuttyText variant="hero">{t.hero.and}</PuttyText><em><PuttyText variant="hero">{t.hero.graphics}</PuttyText></em></span></h1>
          <p className="hero-description">{t.hero.description}</p>
        </div>
        <a className="hero-project-link" href="?page=portfolio">{t.hero.action}</a>
      </div>
    </section>
    <section className="selected-section shell" aria-labelledby="selected-heading">
      <div className="section-heading"><h2 id="selected-heading">{t.selectedProjects}</h2><a className="text-link" href="?page=portfolio">{t.fullPortfolio}</a></div>
      <div className="selected-grid"><ProjectTile project={projects[0]} className="selected-large"/><ProjectTile project={projects[1]} className="selected-small"/></div>
    </section>
  </main>;
}

export function Portfolio({ t, projects, route }) {
  const { filter, view } = route;
  const shown = projects.filter(project => filter === 'all' || project.group === filter);
  const filters = ['all', 'architecture', 'graphics'];
  return <main id="main" tabIndex="-1" className="interior-page shell portfolio-page">
    <div className="page-heading"><h1>{t.portfolio.heading}</h1></div>
    <div className="portfolio-toolbar">
      <nav className="project-filters" aria-label={t.portfolio.filtersLabel}>
        {filters.map(value => <a key={value} href={portfolioHref({ filter: value, view })} aria-current={filter === value ? 'true' : undefined}>{t.portfolio[value]}</a>)}
      </nav>
      <nav className="portfolio-view" aria-label={t.portfolio.viewLabel}>
        {['grid', 'list'].map(value => <a key={value} href={portfolioHref({ filter, view: value })} aria-current={view === value ? 'true' : undefined} aria-label={t.portfolio[value]}><span>{t.portfolio[value]}</span></a>)}
      </nav>
    </div>
    <div className={`portfolio-grid ${view === 'list' ? 'is-list' : ''}`}>
      {shown.map(project => <ProjectTile key={project.id} project={project}/>)}
    </div>
  </main>;
}

function ProjectImage({ image, onOpen, t, priority = false }) {
  return <figure className="project-plate">
    <button className="project-image-button" type="button" onClick={onOpen} aria-label={t.project.zoomImage(image.alt)}>
      <img src={asset(image.src)} alt={image.alt} width={image.width} height={image.height} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async"/><span className="zoom-label" aria-hidden="true">{t.project.zoom}</span>
    </button><figcaption>{image.alt}</figcaption>
  </figure>;
}

export function ProjectPage({ project, projects, t }) {
  const [zoomIndex, setZoomIndex] = useState(null);
  const next = projects[(projects.findIndex(item => item.id === project.id) + 1) % projects.length];
  const closeImage = useCallback(() => setZoomIndex(null), []);
  return <main id="main" tabIndex="-1" className="project-page">
    <div className="shell project-heading">
      <a className="back-link" href="?page=portfolio">{t.project.back}</a>
      <p className="project-category">{project.category}</p>
      <h1>{project.title}</h1>
      <div className="project-intro"><p>{project.summary}</p><p>{project.description}</p></div>
    </div>
    <div className="project-cover shell"><ProjectImage image={project.images[0]} onOpen={() => setZoomIndex(0)} t={t} priority/></div>
    {project.images.length > 1 && <div className="shell project-gallery">{project.images.slice(1).map((image, index) => <ProjectImage key={image.src} image={image} onOpen={() => setZoomIndex(index + 1)} t={t}/>)}</div>}
    <a className="shell project-next" href={`?project=${next.id}`}><span>{t.project.next}</span><span className="next-title">{next.title}</span></a>
    {zoomIndex !== null && <GalleryViewer project={project} index={zoomIndex} onChange={setZoomIndex} onClose={closeImage} t={t}/>}
  </main>;
}
