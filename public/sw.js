// Caches the app shell (HTML/JS/CSS/icons) so Mappin can still open without
// a network connection. This is deliberately separate from your pin data:
// Firestore's own persistent cache (see src/firebase.js) handles that, via
// IndexedDB, on its own terms. This service worker explicitly leaves
// Google's own domains alone so it never interferes with Firestore's
// real-time sync or the Maps/Places APIs, and leaves cloudfunctions.net
// alone too — enrichShare responses depend on the specific TikTok/Instagram
// link shared, so caching one URL's response could later be served back
// incorrectly for a completely different shared link.
const CACHE_NAME = 'mappin-shell-v2';
const APP_SHELL = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) =>
        // Individually, not cache.addAll() — addAll() is all-or-nothing,
        // so a single failed fetch (a bad path, a transient network blip)
        // would fail the WHOLE install and the service worker would never
        // activate at all. This way one bad asset just doesn't get cached,
        // instead of taking installability down with it.
        Promise.all(
          APP_SHELL.map((url) =>
            cache.add(url).catch((err) => console.warn('SW precache failed for', url, err))
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Never intercept Google API traffic — Firestore and the Maps/Places
  // libraries manage their own network behaviour and caching. Also never
  // intercept the enrichShare Cloud Function — its response is specific to
  // whatever link was shared, so caching it could serve stale/wrong data
  // back for a different link later.
  if (
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('google.com') ||
    url.hostname.includes('cloudfunctions.net')
  ) return;
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
