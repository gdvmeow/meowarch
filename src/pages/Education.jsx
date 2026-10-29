import React, { useCallback, useState } from 'react';
import { asset } from '../data.js';
import GalleryViewer from '../components/GalleryViewer.jsx';

export default function Education({ t }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const education = t.education;
  // Only the public cover is included. Personal pages remain in the original PDF.
  const document = {
    title: education.title,
    images: [{ src: 'education-certificate.webp', width: 1663, height: 2155, alt: education.imageAlt }],
  };
  const image = document.images[0];
  return <main id="main" tabIndex="-1" className="interior-page shell education-page">
    <div className="page-heading"><h1>{education.heading}</h1></div>
    <section className="credential-layout" aria-labelledby="credential-heading">
      <div className="credential-copy">
        <p className="credential-period">2019 — 2024</p>
        <h2 id="credential-heading">{education.title}</h2>
        <p className="credential-school">{education.school}</p>
        <p>{education.description}</p>
        <a className="text-link" href="?page=portfolio">{t.project.back}</a>
      </div>
      <figure className="credential-document">
        <button className="project-image-button" type="button" onClick={() => setOpen(true)} aria-label={t.project.zoomImage(image.alt)}>
          <img src={asset(image.src)} alt={image.alt} width={image.width} height={image.height} decoding="async"/>
          <span className="zoom-label" aria-hidden="true">{t.project.zoom}</span>
        </button>
        <figcaption>{education.caption}</figcaption>
      </figure>
    </section>
    {open && <GalleryViewer project={document} index={0} onChange={() => {}} onClose={close} t={t}/>}
  </main>;
}
