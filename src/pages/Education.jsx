import React, { useCallback, useState } from 'react';
import { asset } from '../data.js';
import { certificatePages } from '../educationDocument.js';
import GalleryViewer from '../components/GalleryViewer.jsx';
import PortfolioHeading from '../components/PortfolioHeading.jsx';

export default function Education({ t, route }) {
  const [index, setIndex] = useState(null);
  const close = useCallback(() => setIndex(null), []);
  const education = t.education;
  const document = {
    title: education.title,
    images: certificatePages.map((page, i) => ({ ...page, alt: education.pageAlts[i] })),
  };
  return <main id="main" tabIndex="-1" className="interior-page shell education-page">
    <PortfolioHeading active="education" route={route} t={t}/>
    <section className="credential-layout" aria-labelledby="credential-heading">
      <div className="credential-copy">
        <p className="credential-period">2019 — 2024</p>
        <h2 id="credential-heading">{education.title}</h2>
        <p className="credential-school">{education.school}</p>
        <p>{education.description}</p>
      </div>
      <div className="credential-documents">
        {document.images.map((image, i) => <figure className="credential-document" key={image.src}>
          <button className="project-image-button" type="button" onClick={() => setIndex(i)} aria-label={t.project.zoomImage(image.alt)}>
            <img src={asset(image.src)} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async"/>
            <span className="zoom-label" aria-hidden="true">{t.project.zoom}</span>
          </button>
          <figcaption>{t.project.count(i + 1, document.images.length)} · {image.alt}</figcaption>
        </figure>)}
      </div>
    </section>
    {index !== null && <GalleryViewer project={document} index={index} onChange={setIndex} onClose={close} t={t}/>}
  </main>;
}
