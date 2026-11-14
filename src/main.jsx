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
    const hadController = Boolean(navigator.serviceWorker.controller);
    let refreshing = false;

    if (hadController) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    }

    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        if (registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              worker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
        return registration.update();
      })
      .catch((error) => {
        console.warn('[BRANDSCOPE] App installation service could not start:', error);
      });
  });
}
