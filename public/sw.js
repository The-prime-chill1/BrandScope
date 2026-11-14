// The build replaces this token, making every deployment install a fresh
// worker and retire caches that reference deleted Vite asset filenames.
const CACHE_NAME = 'brandscope-static-__BUILD_VERSION__';
const STATIC_SHELL = ['/offline.html', '/site.webmanifest', '/favicon.svg', '/pwa-icon-192.png', '/pwa-icon-512.png'];
const IS_LOCAL_DEVELOPMENT = ['localhost', '127.0.0.1'].includes(self.location.hostname);

self.addEventListener('install', (event) => {
  if (IS_LOCAL_DEVELOPMENT) {
    event.waitUntil(self.skipWaiting());
    return;
  }
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  if (IS_LOCAL_DEVELOPMENT) {
    event.waitUntil(
      caches.keys()
        .then((keys) => Promise.all(keys.filter((key) => key.startsWith('brandscope-')).map((key) => caches.delete(key))))
        .then(() => self.registration.unregister())
        .then(() => self.clients.claim())
    );
    return;
  }
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('brandscope-') && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (IS_LOCAL_DEVELOPMENT) return;
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      // Never cache route HTML. A cached index can reference hashed JS/CSS
      // files that no longer exist after the next Vercel deployment.
      fetch(event.request, { cache: 'no-store' })
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  if (STATIC_SHELL.includes(url.pathname)) {
    event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existingClient = clients.find((client) => client.url === targetUrl);
      if (existingClient) return existingClient.focus();
      return self.clients.openWindow(targetUrl);
    })
  );
});
