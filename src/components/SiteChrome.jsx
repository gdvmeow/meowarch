import React, { useEffect, useRef, useState } from 'react';
import { asset, contactEmail } from '../data.js';
import { languages } from '../i18n.js';
import PuttyText from '../PuttyText.jsx';
import Icon from './Icon.jsx';

const navigation = ['portfolio', 'about', 'contacts'];

function LanguageSwitcher({ language, onChange, onOpen, t }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const current = languages.find(item => item.code === language);

  useEffect(() => {
    if (!open) return;
    const focusFrame = requestAnimationFrame(() => {
      optionRefs.current[languages.findIndex(item => item.code === language)]?.focus({ preventScroll: true });
    });
    const outside = event => { if (!rootRef.current?.contains(event.target)) setOpen(false); };
    const escape = event => {
      if (event.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open, language]);

  const select = code => { onChange(code); setOpen(false); triggerRef.current?.focus(); };
  const onOptionKeyDown = (event, index) => {
    let next;
    if (event.key === 'ArrowDown') next = (index + 1) % languages.length;
    if (event.key === 'ArrowUp') next = (index - 1 + languages.length) % languages.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = languages.length - 1;
    if (next !== undefined) { event.preventDefault(); optionRefs.current[next]?.focus(); }
  };

  return <div className="language-switcher" ref={rootRef} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button className="language-trigger" ref={triggerRef} type="button" aria-label={`${t.siteLanguage}: ${current.label}`} aria-haspopup="menu" aria-controls="language-options" aria-expanded={open} onClick={() => { if (!open) onOpen(); setOpen(value => !value); }} onKeyDown={event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); onOpen(); setOpen(true); }
    }}>
      <img className="language-flag" src={current.flag} alt="" width="24" height="16"/><Icon name="down"/>
    </button>
    <div className={`language-menu ${open ? 'is-open' : ''}`} id="language-options" role="menu" aria-label={t.siteLanguage} inert={!open}>
      {languages.map((item, index) => <button className="language-option" key={item.code} ref={element => { optionRefs.current[index] = element; }} type="button" role="menuitemradio" aria-checked={language === item.code} lang={item.code === 'zh' ? 'zh-CN' : item.code} tabIndex={open ? 0 : -1} onKeyDown={event => onOptionKeyDown(event, index)} onClick={() => select(item.code)}>
        <img className="language-flag" src={item.flag} alt="" width="24" height="16"/><span>{item.label}</span>
      </button>)}
    </div>
  </div>;
}

export function Header({ route, t, language, onLanguageChange }) {
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const activePage = route.type === 'project' ? 'portfolio' : route.type;
  useEffect(() => setOpen(false), [route.key]);
  useEffect(() => {
    if (!open) return;
    headerRef.current?.querySelector('.site-nav a')?.focus({ preventScroll: true });
    const escape = event => {
      if (event.key === 'Escape') { setOpen(false); menuRef.current?.focus(); }
    };
    const outside = event => { if (!headerRef.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('keydown', escape);
    document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', escape); document.removeEventListener('pointerdown', outside); };
  }, [open]);

  return <header id="top" className="site-header" ref={headerRef} onBlur={event => {
    if (open && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <div className="header-inner shell">
      <a className="wordmark" href="?" aria-label={t.homeLabel} translate="no"><PuttyText>{t.name}</PuttyText></a>
      <nav id="site-navigation" className={`site-nav ${open ? 'is-open' : ''}`} aria-label={t.navigationLabel} onClick={event => {
        if (event.target.closest('a')) setOpen(false);
      }}>
        {navigation.map(page => <a key={page} href={`?page=${page}`} aria-current={activePage === page ? 'page' : undefined}>{t.nav[page]}</a>)}
      </nav>
      <div className="header-actions">
        <a className="header-contact" href={`mailto:${contactEmail}`}>{t.write}</a>
        <LanguageSwitcher language={language} onChange={onLanguageChange} onOpen={() => setOpen(false)} t={t}/>
        <button className="menu-button" ref={menuRef} type="button" aria-label={open ? t.closeMenu : t.menu} aria-controls="site-navigation" aria-expanded={open} onClick={() => setOpen(value => !value)}>
          <span className="menu-label">{open ? t.closeMenu : t.menu}</span><span className={`menu-mark ${open ? 'is-open' : ''}`} aria-hidden="true"><i/><i/></span>
        </button>
      </div>
    </div>
  </header>;
}

export function Footer({ t, socialLinks }) {
  return <footer className="site-footer">
    <div className="shell footer-content">
      <div className="footer-main">
        <div className="footer-identity">
          <h2 translate="no"><PuttyText>{t.name}</PuttyText></h2>
          <p>{t.footer.description}</p>
          <a className="footer-email" href={`mailto:${contactEmail}`} translate="no">{contactEmail}</a>
        </div>
        <nav className="footer-links" aria-label={t.footerNavigationLabel}>
          <div><span>{t.footer.sections}</span>{navigation.map(page => <a href={`?page=${page}`} key={page}>{t.nav[page]}</a>)}</div>
          <div><span>{t.footer.platforms}</span>{socialLinks.map(item => <a href={item.href} target="_blank" rel="noopener noreferrer" key={item.id}>{item.label}</a>)}</div>
        </nav>
      </div>
      <div className="footer-bottom"><span>{t.footer.copyright(new Date().getFullYear())}</span><a href="#top">{t.footer.top}<Icon name="down"/></a></div>
    </div>
    <div className="footer-art" aria-hidden="true"><img src={asset('footer-architect-drawing.webp')} alt="" width="1670" height="942" loading="lazy" decoding="async"/></div>
  </footer>;
}
