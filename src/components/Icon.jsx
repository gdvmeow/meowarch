import React from 'react';

const paths = {
  external: <><path d="M6 18 18 6M6 6h12v12"/></>,
  back: <><path d="m14 6-6 6 6 6"/></>,
  next: <><path d="m10 6 6 6-6 6"/></>,
  down: <><path d="m6 9 6 6 6-6"/></>,
  close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="1"/><path d="M16 8V4H4v12h4"/></>,
  grid: <><rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/></>,
  list: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
  zoom: <><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5M7 10h6M10 7v6"/></>,
};

export default function Icon({ name, className = '' }) {
  return <svg className={`icon ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
