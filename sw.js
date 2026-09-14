const CACHE_NAME = 'ph2t-system-v1';

// Install event: Activates immediately without waiting
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event: Cleans up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Network-first strategy with dynamic background caching
self.addEventListener('fetch', (event) => {
  // Only handle HTTP/HTTPS requests to prevent browser extension errors
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache valid responses dynamically
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to offline cache if network is unavailable
        return caches.match(event.request);
      })
  );
});
