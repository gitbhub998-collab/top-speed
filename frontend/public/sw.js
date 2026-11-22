const CACHE_NAME = 'top-speed-v3';
const APP_SHELL = ['/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET' || request.url.includes('/api/')) {
    return;
  }

  const url = new URL(request.url);

  // Never serve stale HTML. Navigations and the app shell always go to the
  // network first so a new deploy reaches users immediately; the cache is
  // only an offline fallback. (v2 precached index.html cache-first, which
  // pinned returning visitors to a deleted bundle and a blank page.)
  if (request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          }
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Content-hashed build assets are immutable: safe to serve cache-first.
  if (/^\/assets\/.+-[A-Za-z0-9_-]{6,}\.(js|css)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok && (response.headers.get('content-type') || '').includes('html') === false) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  // Everything else (images, manifest, ...): network first, cache fallback.
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
