import React, { useEffect, useState } from 'react';
import { projects, socialLinks } from './data.js';
import { languages, copy, localizeProject, localizeSocial } from './i18n.js';
import useNavigation from './useNavigation.js';
import { Header, Footer } from './components/SiteChrome.jsx';
import { Home, Portfolio, ProjectPage } from './pages/Work.jsx';
import { About, Contacts, NotFound } from './pages/Profile.jsx';
import Education from './pages/Education.jsx';

export default function App() {
  const route = useNavigation();
  const [language, setLanguage] = useState(() => {
    try {
      const saved = window.localStorage.getItem('meowarch-language');
      return languages.some(item => item.code === saved) ? saved : 'ru';
    } catch { return 'ru'; }
  });
  const t = copy[language];
  const localizedProjects = projects.map(project => localizeProject(project, language));
  const localizedSocialLinks = socialLinks.map(link => localizeSocial(link, language));
  const activeProject = localizedProjects.find(project => project.id === route.projectId);

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : language;
    try { window.localStorage.setItem('meowarch-language', language); } catch { /* Storage may be unavailable. */ }
    const title = `${activeProject?.title ?? t.pageTitles[route.type]} — ${t.name}`;
    const description = activeProject?.summary ?? t.metaDescription;
    document.title = title;
    document.querySelector('meta[name="description"]').content = description;
    document.querySelector('meta[property="og:title"]').content = title;
    document.querySelector('meta[property="og:description"]').content = description;
  }, [language, activeProject?.id, route.type, t]);

  return <>
    <a className="skip-link" href="#main">{t.skip}</a>
    <Header route={route} t={t} language={language} onLanguageChange={setLanguage}/>
    <div className={`site-canvas canvas-${route.type}`}>
      {route.type === 'portfolio' ? <Portfolio t={t} projects={localizedProjects} route={route}/>
        : route.type === 'project' ? <ProjectPage key={route.projectId} project={activeProject} projects={localizedProjects} t={t}/>
        : route.type === 'about' ? <About t={t}/>
        : route.type === 'contacts' ? <Contacts t={t} socialLinks={localizedSocialLinks}/>
        : route.type === 'education' ? <Education t={t} route={route}/>
        : route.type === 'notFound' ? <NotFound t={t}/>
        : <Home t={t} projects={localizedProjects}/>}
    </div>
    <Footer t={t} socialLinks={localizedSocialLinks}/>
  </>;
}
