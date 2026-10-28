import React from 'react';
import { asset } from '../data.js';

export default function ProjectTile({ project, className = '' }) {
  const image = project.images[0];
  return <a className={`project-tile ${className}`} href={`?project=${project.id}`}>
    <div className="tile-image"><img src={asset(image.src)} alt="" width={image.width} height={image.height} loading="lazy" decoding="async"/></div>
    <div className="tile-meta"><h3>{project.title}</h3><p>{project.category}</p></div>
  </a>;
}
