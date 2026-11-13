const startApplication = () => import('./main.jsx');

async function bootstrap() {
  if (import.meta.env.DEV && 'serviceWorker' in navigator) {
    const hadServiceWorkerControl = Boolean(navigator.serviceWorker.controller);

    await Promise.all([
      navigator.serviceWorker.getRegistrations().then((registrations) => Promise.all(registrations.map((registration) => registration.unregister()))),
      'caches' in window
        ? caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('brandscope-')).map((key) => caches.delete(key))))
        : Promise.resolve()
    ]);

    if (hadServiceWorkerControl) {
      window.location.reload();
      return;
    }
  }

  await startApplication();
}

bootstrap().catch((error) => {
  console.error('[BRANDSCOPE] Application startup failed:', error);
});
