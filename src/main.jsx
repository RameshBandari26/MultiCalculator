import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { applyTheme, getStoredTheme } from './storage/theme.js';
import './index.css';

// Keep links from the single-file version working: "#emi" -> "#/emi".
const legacyHash = /^#([a-z-]+)$/.exec(window.location.hash);
if (legacyHash) window.location.hash = `#/${legacyHash[1]}`;

applyTheme(getStoredTheme());

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
