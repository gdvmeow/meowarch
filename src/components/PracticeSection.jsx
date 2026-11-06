import React, { useCallback, useState } from 'react';
import { asset } from '../data.js';
import { practicePhotos } from '../practice.js';
import GalleryViewer from './GalleryViewer.jsx';

export default function PracticeSection({ t, className, headingId }) {
  const [index, setIndex] = useState(null);
  const close = useCallback(() => setIndex(null), []);
  const about = t.about;
  const gallery = {
    title: about.practiceHeading,
    images: practicePhotos.map((image, i) => ({ ...image, alt: about.practicePhotoAlts[i] })),
  };
  return <section className={className} aria-labelledby={headingId}>
    <div className="practice-heading"><h2 id={headingId}>{about.practiceHeading}</h2><p className="practice-period">{about.practicePeriod}</p></div>
    <div className="about-prose">{about.practice.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
    <div className="practice-gallery">
      {gallery.images.map((image, i) => <figure key={image.src}>
        <button className="project-image-button" type="button" onClick={() => setIndex(i)} aria-label={t.project.zoomImage(image.alt)}>
          <img src={asset(image.src)} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async"/>
          <span className="zoom-label" aria-hidden="true">{t.project.zoom}</span>
        </button>
        <figcaption>{image.alt}</figcaption>
      </figure>)}
    </div>
    {index !== null && <GalleryViewer project={gallery} index={index} onChange={setIndex} onClose={close} t={t}/>}
  </section>;
}
