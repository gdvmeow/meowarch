import React, { useEffect, useRef, useState } from 'react';
import { asset, contactEmail, profile } from '../data.js';
import Icon from '../components/Icon.jsx';
import PuttyText from '../PuttyText.jsx';

export function About({ t }) {
  const about = t.about;
  return <main id="main" tabIndex="-1" className="interior-page shell about-page">
    <div className="page-heading"><h1>{about.heading}</h1></div>
    <div className="about-grid">
      <div className="about-profile">
        <div className="about-intro"><h2 translate="no"><PuttyText>{t.name}</PuttyText></h2><p className="about-role">{about.role}</p><p className="about-bio">{about.body}</p></div>
        <section className="education" aria-labelledby="education-heading"><h3 id="education-heading">{about.educationHeading}</h3><ol>{about.education.map((item, index) => <li key={index}><span className="education-period">{item.period}</span><div><h4>{item.institution}</h4><p>{item.detail}</p></div></li>)}</ol></section>
        <section className="tools" aria-labelledby="tools-heading"><h3 id="tools-heading">{about.toolsHeading}</h3><dl>{about.tools.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></section>
        <a className="text-link" href="?page=contacts">{about.action}</a>
      </div>
      <figure className="about-portrait">{profile.portrait
        ? <img src={asset(profile.portrait.src)} alt={about.portraitAlt} width={profile.portrait.width} height={profile.portrait.height} decoding="async"/>
        : <div className="portrait-placeholder" role="img" aria-label={about.portraitLabel}><span>{about.portraitLabel}</span></div>}
      </figure>
    </div>
  </main>;
}

export function Contacts({ t, socialLinks }) {
  const [copyState, setCopyState] = useState('');
  const timerRef = useRef(null);
  const mountedRef = useRef(true);
  const copyingRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; window.clearTimeout(timerRef.current); };
  }, []);
  const copyEmail = async () => {
    if (copyingRef.current) return;
    copyingRef.current = true;
    window.clearTimeout(timerRef.current);
    setCopyState('copying');
    let state;
    try { await navigator.clipboard.writeText(contactEmail); state = 'copied'; }
    catch { state = 'copyFailed'; }
    copyingRef.current = false;
    if (!mountedRef.current) return;
    setCopyState(state);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopyState(''), 3500);
  };
  return <main id="main" tabIndex="-1" className="interior-page shell contacts-page">
    <div className="page-heading"><h1>{t.contacts.heading}</h1></div>
    <p className="contact-intro">{t.contacts.intro}</p>
    <div className="contact-main"><div className="contact-primary">
      <div className="contact-address"><a className="contact-email" href={`mailto:${contactEmail}`} translate="no">{contactEmail}</a><button className="copy-button" type="button" aria-label={t.contacts.copy} aria-busy={copyState === 'copying'} data-state={copyState || 'idle'} onClick={copyEmail}><Icon name="copy"/><Icon name="check"/></button></div>
      <p className="copy-status" role="status" aria-atomic="true"><span className={copyState === 'copyFailed' ? '' : 'visually-hidden'}>{['copied', 'copyFailed'].includes(copyState) ? t.contacts[copyState] : ''}</span></p>
    </div>
      <div className="contact-socials">{socialLinks.map(item => <a className="social-row" href={item.href} target="_blank" rel="noopener noreferrer" key={item.id}><span>{item.label}</span><span className="social-detail">{item.detail}</span><Icon name="external"/></a>)}</div>
    </div>
  </main>;
}

export function NotFound({ t }) {
  return <main id="main" tabIndex="-1" className="shell not-found-page"><p className="error-code" aria-hidden="true">404</p><h1>{t.notFound.heading}</h1><p>{t.notFound.body}</p><a className="text-link" href="?page=portfolio">{t.notFound.action}</a></main>;
}
