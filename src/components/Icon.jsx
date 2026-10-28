import React from 'react';

const paths = {
  external: <><path d="M6 18 18 6M6 6h12v12"/></>,
  down: <><path d="m6 9 6 6 6-6"/></>,
  close: <><path d="m6 6 12 12M18 6 6 18"/></>,
};

export default function Icon({ name, className = '' }) {
  return <svg className={`icon ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
