// SanScore Service Worker
// Strategia:
//   - API calls (/api/*): sempre rete, mai cache
//   - Asset statici (.js/.css/.png/ecc.): cache-first
//   - Navigazione (HTML / SPA fallback): network-first con fallback a cache

const CACHE_NAME = 'sanscore-v1';
const OFFLINE_URL = '/';

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL]))
  );
  // Attiva subito senza aspettare che tutte le tab vengano chiuse
  self.skipWaiting();
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Prende controllo di tutte le tab aperte
  self.clients.claim();
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Ignora richieste non-GET e origini esterne
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // 2. API → sempre rete, mai cache
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 3. Asset statici con hash (JS, CSS, font, immagini) → cache-first
  //    Vite genera nomi tipo /assets/index-Dq3j8Kfz.js
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.match(/\.(js|css|woff2?|ttf|otf|png|jpg|jpeg|gif|svg|ico|webp)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // 4. Navigazione (HTML / SPA) → network-first, fallback a cache → fallback a /
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        caches
          .match(request)
          .then((cached) => cached || caches.match(OFFLINE_URL))
      )
  );
});
