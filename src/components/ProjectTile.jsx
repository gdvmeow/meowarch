import React from 'react';
import Icon from './Icon.jsx';
import { asset } from '../data.js';
import { imagePreviews } from '../imagePreviews.js';

export const railImageSizes = [
  '(max-width: 488px) calc(100vw - 44px), (max-width: 760px) 91vw, (max-width: 1422px) calc(53.0833vw - 18.6667px), (max-width: 1448px) calc(58.3333vw - 93.3333px), 752px',
  '(max-width: 488px) calc(100vw - 44px), (max-width: 760px) 91vw, (max-width: 1422px) calc(37.9167vw - 13.3333px), (max-width: 1448px) calc(41.6667vw - 66.6667px), 537px',
];

export default function ProjectTile({ project, className = '', headingLevel = 3, imageSizes = railImageSizes[0] }) {
  const image = project.cover ?? project.images[0];
  const Heading = `h${headingLevel}`;
  const previews = imagePreviews[image.src] ?? [];
  const srcSet = previews.length ? [...previews, image].map(source => `${asset(source.src)} ${source.width}w`).join(', ') : undefined;
  return <a className={`project-tile ${className}`} href={`?project=${project.id}`}>
    <div className="tile-image"><img src={asset(image.src)} srcSet={srcSet} sizes={srcSet ? imageSizes : undefined} alt="" width={image.width} height={image.height} loading="lazy" decoding="async"/></div>
    <div className="tile-meta"><Heading>{project.title}<Icon name="external" className="tile-arrow"/></Heading><p>{project.category}</p></div>
  </a>;
}
