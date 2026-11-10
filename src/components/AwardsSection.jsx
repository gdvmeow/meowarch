import React, { useCallback, useState } from 'react';
import { asset } from '../data.js';
import { awardDocuments } from '../awardDocuments.js';
import GalleryViewer from './GalleryViewer.jsx';

export default function AwardsSection({ t }) {
  const [openId, setOpenId] = useState(null);
  const close = useCallback(() => setOpenId(null), []);
  const openDocument = awardDocuments.find(document => document.id === openId);
  const openCopy = openDocument && t.awards.items[openDocument.id];
  return <section className="awards-section" id="awards" aria-labelledby="awards-heading">
    <h2 id="awards-heading">{t.awards.heading}</h2>
    <div className="awards-grid">
      {awardDocuments.map(document => {
        const item = t.awards.items[document.id];
        return <article className="award-document" id={document.id} key={document.id} aria-labelledby={`${document.id}-heading`}>
          <div className="award-copy">
            {item.period && <p className="award-period">{item.period}</p>}
            <h3 id={`${document.id}-heading`}>{item.title}</h3>
            <p className="award-issuer">{item.issuer}</p>
            <p className="award-description">{item.description}</p>
          </div>
          <button className="project-image-button award-image" type="button" onClick={() => setOpenId(document.id)} aria-label={t.project.zoomImage(item.alt)}>
            <img src={asset(document.src)} alt={item.alt} width={document.width} height={document.height} loading="lazy" decoding="async"/>
            <span className="zoom-label" aria-hidden="true">{t.project.zoom}</span>
          </button>
        </article>;
      })}
    </div>
    {openDocument && <GalleryViewer project={{ title: openCopy.title, images: [{ ...openDocument, alt: openCopy.alt }] }} index={0} onChange={() => {}} onClose={close} t={t}/>}
  </section>;
}
