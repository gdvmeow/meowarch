import { useEffect, useLayoutEffect, useState } from 'react';
import { readRoute } from './routing.js';
import { projects } from './data.js';

export default function useNavigation() {
  const [location, setLocation] = useState(() => ({ route: readRoute(window.location.search, projects) }));

  useEffect(() => {
    const history = window.history;
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    const positions = new Map();
    let sequence = 0;
    const nextId = () => `${Date.now()}-${sequence++}`;
    let currentId = history.state?.navigationId ?? nextId();
    const rememberScroll = () => positions.set(currentId, [window.scrollX, window.scrollY]);
    // Keep scroll positions in memory while scrolling. Writing History on every
    // frame can hit browser rate limits during a long page scroll.
    const saveEntry = () => {
      rememberScroll();
      history.replaceState({ ...history.state, navigationId: currentId, scroll: positions.get(currentId) }, '');
    };
    saveEntry();

    const navigate = event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest('a[href^="?"], a[data-navigation-anchor], button[data-navigation-href]');
      if (!link || link.target || link.hasAttribute('download')) return;
      const url = new URL(link.dataset.navigationHref ?? link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
      let hashId;
      try { hashId = url.hash ? decodeURIComponent(url.hash.slice(1)) : undefined; } catch { /* Ignore malformed fragments. */ }
      if (url.search === window.location.search && hashId) {
        const anchor = document.getElementById(hashId);
        if (!anchor) return;
        event.preventDefault();
        saveEntry();
        currentId = nextId();
        const margin = parseFloat(getComputedStyle(anchor).scrollMarginTop) || 0;
        const scroll = [window.scrollX, Math.max(0, anchor.getBoundingClientRect().top + window.scrollY - margin)];
        positions.set(currentId, scroll);
        history.pushState({ navigationId: currentId, scroll }, '', `${url.pathname}${url.search}${url.hash}`);
        setLocation({ route: readRoute(url.search, projects), scroll, anchor: anchor.id });
        return;
      }
      event.preventDefault();
      if (url.search === window.location.search) {
        if (!link.closest('.portfolio-toolbar')) {
          window.scrollTo({ top: 0, behavior: 'instant' });
          document.getElementById('main')?.focus({ preventScroll: true });
        }
        return;
      }
      saveEntry();
      const route = readRoute(url.search, projects);
      const newPage = route.key !== readRoute(window.location.search, projects).key;
      const scroll = newPage ? [0, 0] : [window.scrollX, window.scrollY];
      currentId = nextId();
      positions.set(currentId, scroll);
      history.pushState({ navigationId: currentId, scroll }, '', `${url.pathname}${url.search}${url.hash}`);
      setLocation({ route, scroll, focus: newPage, anchor: hashId });
    };
    const back = event => {
      rememberScroll();
      currentId = event.state?.navigationId ?? nextId();
      const scroll = positions.get(currentId) ?? event.state?.scroll ?? [0, 0];
      if (!event.state?.navigationId) history.replaceState({ ...event.state, navigationId: currentId, scroll }, '');
      setLocation({ route: readRoute(window.location.search, projects), scroll, focus: true });
    };
    document.addEventListener('click', navigate);
    window.addEventListener('popstate', back);
    window.addEventListener('scroll', rememberScroll, { passive: true });
    window.addEventListener('pagehide', saveEntry);
    return () => {
      history.scrollRestoration = previousRestoration;
      document.removeEventListener('click', navigate);
      window.removeEventListener('popstate', back);
      window.removeEventListener('scroll', rememberScroll);
      window.removeEventListener('pagehide', saveEntry);
    };
  }, []);

  useLayoutEffect(() => {
    if (!location.scroll) {
      // The initial hash is handled before React has mounted its target.
      // Repeat after local fonts settle so a shared section link lands correctly.
      const hash = window.location.hash;
      if (!hash) return;
      let anchorId;
      try { anchorId = decodeURIComponent(hash.slice(1)); } catch { return; }
      let active = true;
      const scrollToAnchor = () => {
        if (!active || window.location.hash !== hash) return;
        const anchor = document.getElementById(anchorId);
        if (!anchor) return;
        const margin = parseFloat(getComputedStyle(anchor).scrollMarginTop) || 0;
        window.scrollTo({ top: Math.max(0, anchor.getBoundingClientRect().top + window.scrollY - margin), behavior: 'instant' });
      };
      const interrupts = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
      const removeListeners = () => interrupts.forEach(type => window.removeEventListener(type, cancel));
      const cancel = () => { active = false; removeListeners(); };
      scrollToAnchor();
      interrupts.forEach(type => window.addEventListener(type, cancel, { passive: true }));
      document.fonts?.ready.then(() => { scrollToAnchor(); removeListeners(); });
      return cancel;
    }
    window.scrollTo({ left: location.scroll[0], top: location.scroll[1], behavior: 'instant' });
    if (location.focus) document.getElementById('main')?.focus({ preventScroll: true });
    if (location.anchor) {
      const anchor = document.getElementById(location.anchor);
      if (!anchor) return;
      const margin = parseFloat(getComputedStyle(anchor).scrollMarginTop) || 0;
      window.scrollTo({ top: Math.max(0, anchor.getBoundingClientRect().top + window.scrollY - margin), behavior: 'instant' });
      anchor.focus({ preventScroll: true });
    }
  }, [location]);

  return location.route;
}
