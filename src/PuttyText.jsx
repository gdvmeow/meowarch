import React, { useEffect, useRef } from 'react';

const segmenter = typeof Intl.Segmenter === 'function'
  ? new Intl.Segmenter('ru', { granularity: 'grapheme' })
  : null;

const letters = value => segmenter
  ? Array.from(segmenter.segment(value), item => item.segment)
  : Array.from(value);

export default function PuttyText({ children, className = '', variant = 'medium' }) {
  const label = String(children);
  const rootRef = useRef(null);
  const hoverRef = useRef(null);
  const dragRef = useRef(null);
  const frameRef = useRef(0);
  const suppressClickRef = useRef(false);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const setHover = glyph => {
    if (hoverRef.current === glyph) return;
    hoverRef.current?.classList.remove('is-hovered');
    hoverRef.current = glyph;
    glyph?.classList.add('is-hovered');
  };

  const clearNearby = () => {
    cancelAnimationFrame(frameRef.current);
    rootRef.current?.querySelectorAll('.putty-glyph').forEach(glyph => {
      glyph.style.removeProperty('--push-x');
      glyph.style.removeProperty('--push-y');
    });
  };

  const release = event => {
    const drag = dragRef.current;
    if (!drag || (event && event.pointerId !== drag.pointerId)) return;
    drag.glyph.classList.remove('is-dragging');
    drag.glyph.style.removeProperty('--drag-x');
    drag.glyph.style.removeProperty('--drag-y');
    drag.glyph.style.removeProperty('--drag-rotate');
    if (drag.moved) {
      suppressClickRef.current = true;
      window.setTimeout(() => { suppressClickRef.current = false; }, 250);
    }
    if (drag.glyph.hasPointerCapture?.(drag.pointerId)) drag.glyph.releasePointerCapture(drag.pointerId);
    dragRef.current = null;
    if (event && !rootRef.current?.contains(document.elementFromPoint(event.clientX, event.clientY))) {
      setHover(null);
      clearNearby();
    }
  };

  const onPointerDown = event => {
    if (variant !== 'hero' || event.button !== 0) return;
    const glyph = event.target.closest('.putty-glyph');
    if (!glyph || !rootRef.current?.contains(glyph)) return;
    setHover(glyph);
    glyph.classList.add('is-dragging');
    dragRef.current = { glyph, pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    if (event.pointerType !== 'touch') glyph.setPointerCapture(event.pointerId);
  };

  const onPointerMove = event => {
    const root = rootRef.current;
    if (!root) return;
    const x = event.clientX;
    const y = event.clientY;
    const drag = dragRef.current;
    if (drag?.pointerId === event.pointerId) {
      const dx = x - drag.x;
      const dy = y - drag.y;
      drag.moved ||= Math.hypot(dx, dy) > 6;
      drag.glyph.style.setProperty('--drag-x', `${dx}px`);
      drag.glyph.style.setProperty('--drag-y', `${dy}px`);
      if (variant === 'hero') drag.glyph.style.setProperty('--drag-rotate', `${Math.max(-24, Math.min(24, dx * .16))}deg`);
    } else {
      const glyph = event.target.closest('.putty-glyph');
      setHover(glyph && root.contains(glyph) ? glyph : null);
    }
    if (variant === 'hero') {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        const positions = [...root.querySelectorAll('.putty-glyph')].map(glyph => ({ glyph, rect: glyph.getBoundingClientRect() }));
        positions.forEach(({ glyph, rect }) => {
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const distance = Math.hypot(cx - x, cy - y);
          const force = Math.max(0, 1 - distance / Math.max(120, rect.height * 2.2));
          glyph.style.setProperty('--push-x', `${((cx - x) * force * .075).toFixed(2)}px`);
          glyph.style.setProperty('--push-y', `${((cy - y) * force * .05).toFixed(2)}px`);
        });
      });
    }
  };

  const onPointerLeave = () => {
    if (dragRef.current) return;
    setHover(null);
    clearNearby();
  };

  const onPointerUp = event => {
    release(event);
    if (event.pointerType === 'touch') onPointerLeave();
  };

  const onClickCapture = event => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  };

  let index = 0;
  const renderGlyph = glyph => {
    const current = index++;
    return <span className="putty-glyph" data-tone={current % 3} key={current}>
      <span className="putty-placeholder">{glyph}</span>
      <span className="putty-face">{glyph}</span>
    </span>;
  };
  return <span
    className={`putty-text putty-text--${variant} ${className}`.trim()}
    ref={rootRef}
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerLeave={onPointerLeave}
    onPointerUp={onPointerUp}
    onPointerCancel={release}
    onClickCapture={onClickCapture}
  >
    <span className="visually-hidden">{label}</span>
    {label.split(/(\s+)/u).map((part, partIndex) => {
      if (/\s/u.test(part)) return <React.Fragment key={partIndex}>{part}</React.Fragment>;
      if (/\p{Script=Han}/u.test(part)) return <React.Fragment key={partIndex}>
        {letters(part).map(glyph => <span className="putty-word" aria-hidden="true" key={index}>{renderGlyph(glyph)}</span>)}
      </React.Fragment>;
      return <span className="putty-word" aria-hidden="true" key={partIndex}>{letters(part).map(renderGlyph)}</span>;
    })}
  </span>;
}
