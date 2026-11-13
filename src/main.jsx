import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import './styles/signature.css';
import { dataStore } from './services/dataStore';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Give session restoration and the first paint priority. Public directory data
// then hydrates progressively without competing with login/admin bootstrap.
const hydratePublicDirectory = () => { void dataStore.initialize(); };
if ('requestIdleCallback' in window) {
  window.requestIdleCallback(hydratePublicDirectory, { timeout: 400 });
} else {
  window.setTimeout(hydratePublicDirectory, 0);
}

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('[BRANDSCOPE] App installation service could not start:', error);
    });
  });
}
