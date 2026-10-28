import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { asset } from '../data.js';
import Icon from './Icon.jsx';

export default function GalleryViewer({ project, index, onChange, onClose, t }) {
  const dialogRef = useRef(null);
  const touchRef = useRef(null);
  const titleId = useId();
  const total = project.images.length;
  const image = project.images[index];
  const step = direction => onChange(current => (current + direction + total) % total);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return createPortal(<dialog className="gallery-dialog" ref={dialogRef} aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
  }} onKeyDown={event => {
    if (event.key === 'Tab') {
      const controls = [...event.currentTarget.querySelectorAll('button:not(:disabled)')];
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
  }}>
    <div className="gallery-viewer">
      <div className="viewer-top"><span id={titleId}>{project.title}</span><span className="viewer-count" aria-live="polite">{t.project.count(index + 1, total)}</span><button className="viewer-close" type="button" onClick={onClose} aria-label={t.project.close}><Icon name="close"/></button></div>
      <div className="viewer-image" onPointerDown={event => {
        if (event.pointerType === 'touch') touchRef.current = { x: event.clientX, y: event.clientY };
      }} onPointerCancel={() => { touchRef.current = null; }} onPointerUp={event => {
        const start = touchRef.current;
        touchRef.current = null;
        if (!start) return;
        const dx = event.clientX - start.x, dy = event.clientY - start.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
      }}><img src={asset(image.src)} alt={image.alt} width={image.width} height={image.height} decoding="async"/></div>
      <div className="viewer-bottom"><p>{image.alt}</p>{total > 1 && <div className="viewer-controls"><button type="button" onClick={() => step(-1)} aria-label={t.project.previousLabel}>{t.project.previous}</button><button type="button" onClick={() => step(1)} aria-label={t.project.nextLabel}>{t.project.nextImage}</button></div>}</div>
    </div>
  </dialog>, document.body);
}
