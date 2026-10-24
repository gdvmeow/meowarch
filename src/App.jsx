import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { asset, contactEmail, projects, socialLinks } from './data.js';
import PuttyText from './PuttyText.jsx';
import { languages, copy, localizeProject, localizeSocial } from './i18n.js';

const navigation = [
  { href: '?page=portfolio', page: 'portfolio' },
  { href: '?page=about', page: 'about' },
  { href: '?page=contacts', page: 'contacts' },
];

const imageSize = src => src === 'site-background-perspective.png'
  ? { width: 1808, height: 870 }
  : { width: 1448, height: 1086 };

function TextLink({ children, href, className = '' }) {
  return <a className={`text-link ${className}`} href={href}>{children}</a>;
}

function LanguageSwitcher({ language, onChange, onOpen, t }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const current = languages.find(item => item.code === language);

  useEffect(() => {
    if (!open) return;
    optionRefs.current[languages.findIndex(item => item.code === language)]?.focus();
    const onPointerDown = event => { if (!rootRef.current?.contains(event.target)) setOpen(false); };
    const onKeyDown = event => {
      if (event.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, language]);

  const select = code => {
    onChange(code);
    setOpen(false);
    triggerRef.current?.focus();
  };
  const onOptionKeyDown = (event, index) => {
    let next;
    if (event.key === 'ArrowDown') next = (index + 1) % languages.length;
    if (event.key === 'ArrowUp') next = (index - 1 + languages.length) % languages.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = languages.length - 1;
    if (next !== undefined) { event.preventDefault(); optionRefs.current[next]?.focus(); }
  };

  return <div className="language-switcher" ref={rootRef}>
    <button className="language-trigger" ref={triggerRef} type="button" aria-label={`${t.siteLanguage}: ${current.label}`} aria-haspopup="menu" aria-controls="language-options" aria-expanded={open} onClick={() => { if (!open) onOpen?.(); setOpen(!open); }}>
      <img className="language-flag" src={current.flag} alt="" width="30" height="20" aria-hidden="true"/><span className="language-chevron" aria-hidden="true"/>
    </button>
    <div className={`language-menu ${open ? 'is-open' : ''}`} id="language-options" role="menu" aria-label={t.siteLanguage} aria-hidden={!open} inert={!open}>
      {languages.map((item, index) => <button className="language-option" key={item.code} ref={element => { optionRefs.current[index] = element; }} type="button" role="menuitemradio" aria-checked={language === item.code} lang={item.code === 'zh' ? 'zh-CN' : item.code} tabIndex={open ? 0 : -1} onKeyDown={event => onOptionKeyDown(event, index)} onClick={() => select(item.code)}>
        <img className="language-flag" src={item.flag} alt="" width="30" height="20" aria-hidden="true"/><span>{item.label}</span><span className="language-check" aria-hidden="true"/>
      </button>)}
    </div>
  </div>;
}

function Header({ route, t, language, onLanguageChange }) {
  const [open, setOpen] = useState(false);
  const activePage = route.type === 'project' ? 'portfolio' : route.type;

  useEffect(() => setOpen(false), [route.key]);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = event => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  return <header id="top" className="site-header">
    <div className="header-inner shell">
      <a className="wordmark" href="?" aria-label={t.homeLabel}><PuttyText>{t.name}</PuttyText></a>
      <nav id="site-navigation" className={`site-nav ${open ? 'is-open' : ''}`} aria-label={t.navigationLabel}>
        {navigation.map(item => <a key={item.page} href={item.href} aria-current={activePage === item.page ? 'page' : undefined}>{t.nav[item.page]}</a>)}
      </nav>
      <div className="header-actions">
        <a className="header-contact" href={`mailto:${contactEmail}`}>{t.write}</a>
        <LanguageSwitcher language={language} onChange={onLanguageChange} onOpen={() => setOpen(false)} t={t}/>
        <button className="menu-button" type="button" aria-label={open ? t.closeMenu : t.menu} aria-controls="site-navigation" aria-expanded={open} onClick={() => setOpen(value => !value)}>
          <span className="menu-label">{open ? t.closeMenu : t.menu}</span><span className={`menu-mark ${open ? 'is-open' : ''}`} aria-hidden="true"><i/><i/></span>
        </button>
      </div>
    </div>
  </header>;
}

function ProjectTile({ project, className = '', imagePriority = false }) {
  const image = project.images[0];
  return <a className={`project-tile ${className}`} href={`?project=${project.id}`}>
    <div className="tile-image"><img src={asset(image.src)} alt="" {...imageSize(image.src)} loading={imagePriority ? 'eager' : 'lazy'} decoding="async"/></div>
    <div className="tile-meta"><h3>{project.title}</h3><p>{project.category}</p></div>
  </a>;
}

function Home({ t, projects }) {
  return <main id="main" className="home-page">
    <section className="home-hero">
      <div className="shell hero-shell">
        <div className="hero-copy">
          <h1><span><PuttyText variant="hero">{t.hero.architecture}</PuttyText></span><span className="hero-italic-line"><PuttyText variant="hero">{t.hero.and}</PuttyText><em><PuttyText variant="hero">{t.hero.graphics}</PuttyText></em></span></h1>
          <p className="hero-description">{t.hero.description}</p>
        </div>
        <a className="hero-project-link" href="?page=portfolio">{t.hero.action}</a>
      </div>
    </section>

    <section className="selected-section shell">
      <div className="section-heading"><h2>{t.selectedProjects}</h2><TextLink href="?page=portfolio">{t.fullPortfolio}</TextLink></div>
      <div className="selected-grid">
        <ProjectTile project={projects[0]} className="selected-large" imagePriority/>
        <ProjectTile project={projects[1]} className="selected-small"/>
      </div>
    </section>

  </main>;
}

function Portfolio({ t, projects }) {
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('grid');
  const shown = projects.filter(project => filter === 'all' || project.group === filter);
  const filters = [
    { value: 'all', label: t.portfolio.all },
    { value: 'architecture', label: t.portfolio.architecture },
    { value: 'graphics', label: t.portfolio.graphics },
  ];

  return <main id="main" className="interior-page shell portfolio-page">
    <div className="page-heading"><h1>{t.portfolio.heading}</h1></div>
    <div className="portfolio-toolbar">
      <div className="project-filters" role="group" aria-label={t.portfolio.filtersLabel}>
        {filters.map(item => <button key={item.value} type="button" className={filter === item.value ? 'selected' : ''} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>{item.label}</button>)}
      </div>
      <div className="portfolio-view" role="group" aria-label={t.portfolio.viewLabel}>
        <button type="button" className={view === 'grid' ? 'selected' : ''} aria-pressed={view === 'grid'} onClick={() => setView('grid')}>{t.portfolio.grid}</button>
        <button type="button" className={view === 'list' ? 'selected' : ''} aria-pressed={view === 'list'} onClick={() => setView('list')}>{t.portfolio.list}</button>
      </div>
    </div>
    <div className={`portfolio-grid ${view === 'list' ? 'is-list' : ''}`}>
      {shown.map((project, index) => <ProjectTile key={project.id} project={project} className={index === 0 && filter === 'all' && view === 'grid' ? 'portfolio-feature' : ''} imagePriority={index === 0}/>)}
    </div>
  </main>;
}

function GalleryViewer({ project, index, onChange, onClose, t }) {
  const closeRef = useRef(null);
  const lastFocus = useRef(null);
  const total = project.images.length;

  useEffect(() => {
    lastFocus.current = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = event => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onChange(current => (current + 1) % total);
      if (event.key === 'ArrowLeft') onChange(current => (current - 1 + total) % total);
      if (event.key === 'Tab') {
        const controls = [...document.querySelectorAll('.gallery-viewer button')];
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener('keydown', onKey);
      lastFocus.current?.focus();
    };
  }, [onChange, onClose, total]);

  const image = project.images[index];
  return <div className="viewer-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="gallery-viewer" role="dialog" aria-modal="true" aria-label={t.project.galleryLabel(project.title)}>
      <div className="viewer-top"><span>{project.title}</span><span>{t.project.count(index + 1, total)}</span><button ref={closeRef} type="button" onClick={onClose}>{t.project.close}</button></div>
      <div className="viewer-image"><img src={asset(image.src)} alt={image.alt}/></div>
      <div className="viewer-bottom"><span>{image.alt}</span>{total > 1 && <div><button type="button" onClick={() => onChange((index - 1 + total) % total)} aria-label={t.project.previousLabel}>{t.project.previous}</button><button type="button" onClick={() => onChange((index + 1) % total)} aria-label={t.project.nextLabel}>{t.project.nextImage}</button></div>}</div>
    </div>
  </div>;
}

function ProjectPage({ project, projects, t }) {
  const [zoomIndex, setZoomIndex] = useState(null);
  const next = projects[(projects.findIndex(item => item.id === project.id) + 1) % projects.length];
  const openImage = index => setZoomIndex(index);
  const closeImage = useCallback(() => setZoomIndex(null), []);

  return <main id="main" className="project-page">
    <div className="shell project-heading">
      <a className="back-link" href="?page=portfolio">{t.project.back}</a>
      <p className="project-category">{project.category}</p>
      <h1>{project.title}</h1>
      <div className="project-intro"><p>{project.summary}</p><p>{project.description}</p></div>
    </div>
    <button className="project-cover project-image-button" type="button" onClick={() => openImage(0)} aria-label={t.project.zoomMain}>
      <img src={asset(project.images[0].src)} alt={project.images[0].alt} {...imageSize(project.images[0].src)}/><span aria-hidden="true">{t.project.zoom}</span>
    </button>
    {project.images.length > 1 && <div className="shell project-gallery">
      {project.images.slice(1).map((image, index) => <button className="project-image-button" type="button" key={image.src} onClick={() => openImage(index + 1)} aria-label={t.project.zoomImage(image.alt)}><img src={asset(image.src)} alt={image.alt} {...imageSize(image.src)} loading="lazy" decoding="async"/><span aria-hidden="true">{t.project.zoom}</span></button>)}
    </div>}
    <div className="shell project-next"><span>{t.project.next}</span><a href={`?project=${next.id}`}>{next.title}</a></div>
    {zoomIndex !== null && <GalleryViewer project={project} index={zoomIndex} onChange={setZoomIndex} onClose={closeImage} t={t}/>}
  </main>;
}

function About({ t }) {
  return <main id="main" className="interior-page shell about-page">
    <div className="page-heading"><h1>{t.about.heading}</h1></div>
    <div className="about-grid">
      <div className="about-statement"><h2>{t.about.lineOne}<br/><em>{t.about.lineTwo}</em></h2><p>{t.about.body}</p><TextLink href="?page=contacts">{t.about.action}</TextLink></div>
    </div>
  </main>;
}

function Contacts({ t, socialLinks }) {
  const [copyState, setCopyState] = useState('');
  const timerRef = useRef(null);
  useEffect(() => () => window.clearTimeout(timerRef.current), []);
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(contactEmail); setCopyState('copied'); }
    catch { setCopyState('copyFailed'); }
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopyState(''), 2500);
  };

  return <main id="main" className="interior-page shell contacts-page">
    <div className="page-heading"><h1>{t.contacts.heading}</h1></div>
    <div className="contact-main"><div className="contact-primary"><a className="contact-email" href={`mailto:${contactEmail}`}>{contactEmail}</a><button className="copy-button" type="button" onClick={copyEmail}>{t.contacts.copy}</button><span className="copy-status" role="status" aria-live="polite">{copyState ? t.contacts[copyState] : ''}</span></div>
      <div className="contact-socials">{socialLinks.map(item => <a className="social-row" href={item.href} target="_blank" rel="noopener noreferrer" key={item.id}><span>{item.label}</span><span>{item.detail}</span></a>)}</div>
    </div>
  </main>;
}

function Footer({ t, socialLinks }) {
  return <footer className="site-footer">
    <div className="shell footer-content">
      <div className="footer-main">
        <div className="footer-identity">
          <h2><PuttyText>{t.name}</PuttyText></h2>
          <p>{t.footer.description}</p>
          <a className="footer-email" href={`mailto:${contactEmail}`}>{contactEmail}</a>
        </div>
        <nav className="footer-links" aria-label={t.footerNavigationLabel}>
          <div><span>{t.footer.sections}</span>{navigation.map(item => <a href={item.href} key={item.page}>{t.nav[item.page]}</a>)}</div>
          <div><span>{t.footer.platforms}</span>{socialLinks.map(item => <a href={item.href} target="_blank" rel="noopener noreferrer" key={item.id}>{item.label}</a>)}</div>
        </nav>
      </div>
      <div className="footer-bottom"><span>{t.footer.copyright(new Date().getFullYear())}</span><a href="#top">{t.footer.top}</a></div>
    </div>
    <div className="footer-art" aria-hidden="true"><img src={asset('footer-architect-drawing.webp')} alt="" width="1670" height="942" loading="lazy" decoding="async"/></div>
  </footer>;
}

function readRoute() {
  const params = new URLSearchParams(window.location.search);
  const project = projects.find(item => item.id === params.get('project'));
  if (project) return { type: 'project', project, key: `project-${project.id}` };
  const page = params.get('page');
  if (['portfolio', 'about', 'contacts'].includes(page)) return { type: page, key: page };
  return { type: 'home', key: 'home' };
}

export default function App() {
  const [route, setRoute] = useState(readRoute);
  const [language, setLanguage] = useState(() => {
    try {
      const saved = window.localStorage.getItem('meowarch-language');
      return languages.some(item => item.code === saved) ? saved : 'ru';
    } catch { return 'ru'; }
  });
  const firstPage = useRef(true);
  const t = copy[language];
  const localizedProjects = projects.map(project => localizeProject(project, language));
  const localizedSocialLinks = socialLinks.map(link => localizeSocial(link, language));
  const activeProject = route.type === 'project'
    ? localizedProjects.find(project => project.id === route.project.id)
    : null;

  useEffect(() => {
    const navigate = event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest('a[href^="?"]');
      if (!link || link.target || link.hasAttribute('download')) return;
      event.preventDefault();
      const url = new URL(link.getAttribute('href'), window.location.href);
      window.history.pushState(null, '', url.pathname + url.search);
      setRoute(readRoute());
    };
    const back = () => setRoute(readRoute());
    document.addEventListener('click', navigate);
    window.addEventListener('popstate', back);
    return () => { document.removeEventListener('click', navigate); window.removeEventListener('popstate', back); };
  }, []);

  useLayoutEffect(() => {
    if (firstPage.current) { firstPage.current = false; return; }
    window.scrollTo(0, 0);
    const main = document.getElementById('main');
    main?.setAttribute('tabindex', '-1');
    main?.focus({ preventScroll: true });
  }, [route.key]);

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : language;
    try { window.localStorage.setItem('meowarch-language', language); } catch { /* Browsers may block storage. */ }
    document.title = `${activeProject?.title ?? t.pageTitles[route.type]} — ${t.name}`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = activeProject?.summary ?? t.metaDescription;
  }, [route, language]);

  return <>
    <a className="skip-link" href="#main">{t.skip}</a>
    <Header route={route} t={t} language={language} onLanguageChange={setLanguage}/>
    <div className={`site-canvas canvas-${route.type}${route.type === 'project' ? ` canvas-project-${route.project.id}` : ''}`}>
      {route.type === 'portfolio' ? <Portfolio t={t} projects={localizedProjects}/> : route.type === 'project' ? <ProjectPage key={route.project.id} project={activeProject} projects={localizedProjects} t={t}/> : route.type === 'about' ? <About t={t}/> : route.type === 'contacts' ? <Contacts t={t} socialLinks={localizedSocialLinks}/> : <Home t={t} projects={localizedProjects}/>}
    </div>
    <Footer t={t} socialLinks={localizedSocialLinks}/>
  </>;
}
