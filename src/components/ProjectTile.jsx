import React from 'react';
import { asset } from '../data.js';

export default function ProjectTile({ project, className = '', expanded = false }) {
  const images = expanded ? project.images : project.images.slice(0, 1);
  const renderImage = image => <div key={image.src} className={`tile-image${image.height > image.width ? ' tile-image--portrait' : ''}`} style={image.height > image.width ? { aspectRatio: `${image.width} / ${image.height}` } : undefined}><img src={asset(image.src)} alt="" width={image.width} height={image.height} loading="lazy" decoding="async"/></div>;
  return <a className={`project-tile ${className}`} href={`?project=${project.id}`}>
    {expanded && images.length > 1 ? <div className="tile-pair">{images.map(renderImage)}</div> : images.map(renderImage)}
    <div className="tile-meta"><h3>{project.title}</h3><p>{project.category}</p></div>
  </a>;
}
