import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/golos-text/wght.css';
import '@fontsource-variable/literata/wght.css';
import '@fontsource-variable/literata/wght-italic.css';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(<App />);
