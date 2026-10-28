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
      const link = event.target.closest('a[href^="?"]');
      if (!link || link.target || link.hasAttribute('download')) return;
      const url = new URL(link.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
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
      history.pushState({ navigationId: currentId, scroll }, '', `${url.pathname}${url.search}`);
      setLocation({ route, scroll, focus: newPage });
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
    if (!location.scroll) return;
    window.scrollTo({ left: location.scroll[0], top: location.scroll[1], behavior: 'instant' });
    if (location.focus) document.getElementById('main')?.focus({ preventScroll: true });
  }, [location]);

  return location.route;
}
