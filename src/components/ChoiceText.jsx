import React from 'react';

// Reserve the selected size so changing the choice never moves its neighbours.
export default function ChoiceText({ children }) {
  return <span className="choice-text" data-label={children}><span>{children}</span></span>;
}
