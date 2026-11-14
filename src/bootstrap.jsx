const startApplication = () => import('./main.jsx');
const STALE_BUILD_RECOVERY_KEY = 'brandscope_stale_build_recovery';

async function recoverFromStaleBuild() {
  if (!import.meta.env.PROD) return false;

  const currentUrl = new URL(window.location.href);
  if (currentUrl.searchParams.has('__brandscope_refresh')) return false;

  const now = Date.now();
  let previousAttempt = 0;
  try {
    previousAttempt = Number(sessionStorage.getItem(STALE_BUILD_RECOVERY_KEY) || 0);
  } catch {
    // Storage can be unavailable in strict privacy modes; recovery still works.
  }
  if (now - previousAttempt < 30_000) return false;
  try {
    sessionStorage.setItem(STALE_BUILD_RECOVERY_KEY, String(now));
  } catch {
    // Continue without a persisted loop guard when storage is unavailable.
  }

  const recoveryTasks = [];
  if ('caches' in window) recoveryTasks.push(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('brandscope-')).map((key) => caches.delete(key))))
  );

  if ('serviceWorker' in navigator) recoveryTasks.push(
    navigator.serviceWorker.getRegistration().then((registration) => registration?.update())
  );
  await Promise.allSettled(recoveryTasks);

  const freshUrl = new URL(currentUrl);
  freshUrl.searchParams.set('__brandscope_refresh', String(now));
  window.location.replace(freshUrl);
  return true;
}

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  void recoverFromStaleBuild().catch((error) => {
    console.warn('[BRANDSCOPE] Automatic refresh could not complete:', error);
  });
});

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

  const currentUrl = new URL(window.location.href);
  if (currentUrl.searchParams.has('__brandscope_refresh')) {
    currentUrl.searchParams.delete('__brandscope_refresh');
    window.history.replaceState({}, '', `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
  }
}

bootstrap().catch(async (error) => {
  if (await recoverFromStaleBuild()) return;
  console.error('[BRANDSCOPE] Application startup failed:', error);
  const root = document.getElementById('root');
  if (root) root.textContent = 'BRANDSCOPE could not refresh this page. Please reload once to continue.';
});
