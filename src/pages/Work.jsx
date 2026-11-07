import React, { useCallback, useState } from 'react';
import { asset } from '../data.js';
import { portfolioHref } from '../routing.js';
import { balancedRailBreak } from '../portfolioLayout.js';
import PuttyText from '../PuttyText.jsx';
import ProjectTile from '../components/ProjectTile.jsx';
import GalleryViewer from '../components/GalleryViewer.jsx';
import ProjectStages from '../components/ProjectStages.jsx';
import PortfolioHeading from '../components/PortfolioHeading.jsx';
import Icon from '../components/Icon.jsx';
import ChoiceText from '../components/ChoiceText.jsx';

export function Home({ t, projects }) {
  // The author’s selected works, in reading order across the two rails.
  // The full catalog remains in its original source order.
  const selectedRails = [
    ['lyublino-restoration', 'two-family-house-rotterdam'],
    ['line-landscape', 'socrates'],
  ].map(ids => ids.map(id => projects.find(project => project.id === id)).filter(Boolean));
  return <main id="main" tabIndex="-1" className="home-page">
    <section className="home-hero" aria-label={t.pageTitles.home}>
      <div className="shell hero-shell">
        <div className="hero-copy">
          <h1><span><PuttyText variant="hero">{t.hero.architecture}</PuttyText></span><span className="hero-italic-line"><PuttyText variant="hero">{t.hero.and}</PuttyText><em><PuttyText variant="hero">{t.hero.graphics}</PuttyText></em></span></h1>
          <p className="hero-description">{t.hero.description}</p>
        </div>
      </div>
    </section>
    <section id="selected-work" className="selected-section shell" aria-labelledby="selected-heading">
      <div className="section-heading"><h2 id="selected-heading">{t.selectedProjects}</h2><a className="portfolio-cta" href="?page=portfolio"><span>{t.fullPortfolio}</span><Icon name="arrowRight"/></a></div>
      <div className="selected-grid">{selectedRails.map((rail, index) => <div className="selected-rail" key={index}>{rail.map(project => <ProjectTile key={project.id} project={project}/>)}</div>)}</div>
    </section>
  </main>;
}

export function Portfolio({ t, projects, route }) {
  const { filter, view } = route;
  const single = projects.length === 1;
  const shown = projects.filter(project => filter === 'all' || project.group === filter);
  const railBreak = balancedRailBreak(shown);
  const filters = ['all', ...new Set(projects.map(project => project.group))];
  return <main id="main" tabIndex="-1" className="interior-page shell portfolio-page">
    <PortfolioHeading active="portfolio" route={route} t={t}/>
    {!single && <div className="portfolio-toolbar">
      <nav className="project-filters" aria-label={t.portfolio.filtersLabel}>
        {filters.map(value => <a key={value} href={portfolioHref({ filter: value, view })} aria-current={filter === value ? 'true' : undefined}><ChoiceText>{t.portfolio[value]}</ChoiceText></a>)}
      </nav>
      <div className="portfolio-controls">
      <p className="portfolio-count" role="status" aria-atomic="true"><span className="visually-hidden">{t.portfolio.heading}: </span>{shown.length} / {projects.length}</p>
      <nav className="portfolio-view" aria-label={t.portfolio.viewLabel}>
        {['grid', 'list'].map(value => <button key={value} type="button" data-navigation-href={portfolioHref({ filter, view: value })} aria-pressed={view === value} aria-label={t.portfolio[value]}><Icon name={value} className={`view-icon view-icon--${value}`}/></button>)}
      </nav>
      </div>
    </div>}
    <div className={`portfolio-grid ${view === 'list' ? 'is-list' : ''}`}>
      {view === 'list' ? shown.map(project => <ProjectTile key={project.id} project={project}/>)
        : <>
          <div className="portfolio-rail">{shown.slice(0, railBreak).map(project => <ProjectTile key={project.id} project={project}/>)}</div>
          <div className="portfolio-rail">{shown.slice(railBreak).map(project => <ProjectTile key={project.id} project={project}/>)}</div>
        </>}
    </div>
  </main>;
}

function ProjectImage({ image, onOpen, t, priority = false }) {
  return <figure className={`project-plate${image.height > image.width ? ' project-plate--portrait' : ''}${image.fullWidth ? ' project-plate--full' : ''}`}>
    <button className="project-image-button" type="button" onClick={onOpen} aria-label={t.project.zoomImage(image.alt)}>
      <img src={asset(image.src)} alt={image.alt} width={image.width} height={image.height} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async"/><span className="zoom-label" aria-hidden="true">{t.project.zoom}</span>
    </button><figcaption>{image.alt}</figcaption>
  </figure>;
}

export function ProjectPage({ project, projects, t }) {
  const [zoomIndex, setZoomIndex] = useState(null);
  const next = projects[(projects.findIndex(item => item.id === project.id) + 1) % projects.length];
  const nextImage = next.cover ?? next.images[0];
  const leadImage = project.leadImageIndex !== undefined ? project.images[project.leadImageIndex] : null;
  const closeImage = useCallback(() => setZoomIndex(null), []);
  return <main id="main" tabIndex="-1" className="project-page">
    <div className={`shell project-heading${project.sections ? ' project-heading--staged' : ''}`}>
      <a className="back-link" href="?page=portfolio">{t.project.back}</a>
      <p className="project-category">{project.category}</p>
      <h1>{project.title}</h1>
      <div className="project-intro"><p>{project.summary}</p><p>{project.description}</p></div>
    </div>
    {leadImage && <figure className="shell project-lead-image"><button className="project-image-button" type="button" onClick={() => setZoomIndex(project.leadImageIndex)} aria-label={t.project.zoomImage(leadImage.alt)}><img src={asset(leadImage.src)} alt={leadImage.alt} width={leadImage.width} height={leadImage.height} fetchPriority="high" decoding="async"/><span className="zoom-label" aria-hidden="true">{t.project.zoom}</span></button></figure>}
    {project.sections ? <ProjectStages project={project} renderImage={index => <ProjectImage key={project.images[index].src} image={project.images[index]} onOpen={() => setZoomIndex(index)} t={t} priority={!leadImage && index === 0}/>}/> : <>
      <div className="project-cover shell"><ProjectImage image={project.images[0]} onOpen={() => setZoomIndex(0)} t={t} priority/></div>
      {project.images.length > 1 && <div className="shell project-gallery">{project.images.slice(1).map((image, index) => <ProjectImage key={image.src} image={image} onOpen={() => setZoomIndex(index + 1)} t={t}/>)}</div>}
    </>}
    {projects.length > 1 && <a className="shell project-next" href={`?project=${next.id}`}><span className="next-label">{t.project.next}<Icon name="arrowRight"/></span><span className="next-title">{next.title}</span><span className="next-preview"><img src={asset(nextImage.src)} alt="" width={nextImage.width} height={nextImage.height} loading="lazy" decoding="async"/></span></a>}
    {zoomIndex !== null && <GalleryViewer project={project} index={zoomIndex} onChange={setZoomIndex} onClose={closeImage} t={t}/>}
  </main>;
}
