import React from 'react';

// Let the current text size set the width, so neighbours follow it naturally.
export default function ChoiceText({ children }) {
  return <span className="choice-text"><span>{children}</span></span>;
}
