import React from 'react';
import { portfolioHref, educationHref } from '../routing.js';

export default function PortfolioHeading({ active, route, t }) {
  const education = active === 'education';
  return <div className={`page-heading portfolio-heading${education ? ' portfolio-heading--education' : ''}`}>
    <h1>{education ? t.education.heading : t.portfolio.heading}</h1>
    <a className="portfolio-section-link" href={education ? portfolioHref(route) : educationHref(route)}>
      {education ? t.portfolio.heading : t.education.heading}
    </a>
  </div>;
}
