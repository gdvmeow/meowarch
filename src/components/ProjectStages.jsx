import React from 'react';
import { asset } from '../data.js';

const size = bytes => `${(bytes / 1000000).toFixed(1)} MB`;

export default function ProjectStages({ project, renderImage }) {
  const { sections, resources } = project;
  return <>
    <nav className="shell project-stages-nav" aria-label={project.stagesLabel}>
      {sections.map(section => <a data-navigation-anchor href={`#stage-${section.id}`} key={section.id}>{section.title}</a>)}
      {resources && <a data-navigation-anchor href="#project-materials">{resources.heading}</a>}
    </nav>
    <div className="shell project-stages">
      {sections.map(section => <section className={`project-stage project-stage--${section.id}`} tabIndex="-1" id={`stage-${section.id}`} key={section.id} aria-labelledby={`stage-title-${section.id}`}>
        <header className="project-stage-heading"><h2 id={`stage-title-${section.id}`}>{section.title}</h2><p>{section.text}</p></header>
        <div className="project-stage-gallery">{section.imageIndexes.map(imageIndex => renderImage(imageIndex))}</div>
      </section>)}
      {resources && <section id="project-materials" tabIndex="-1" className="project-materials" aria-labelledby="materials-title">
        <header className="project-materials-heading"><div><h2 id="materials-title">{resources.heading}</h2><p>{resources.description}</p></div><a className="project-download-all" href={asset(resources.archive.src)} download={resources.archive.name}><span>{resources.archiveLabel} ↗</span><small>ZIP · {size(resources.archive.bytes)}</small></a></header>
        <div className="project-download-groups">{Object.entries(resources.groupLabels).map(([stage, label]) => <details key={stage}><summary>{label}<span aria-hidden="true">+</span></summary><ul>{resources.files.filter(file => file.stage === stage).map(file => <li key={file.src}><a href={asset(file.src)} download={file.name}><span>{file.label}</span><small>{file.src.split('.').pop().toUpperCase()} · {size(file.bytes)}</small></a></li>)}</ul></details>)}</div>
      </section>}
    </div>
  </>;
}
