const CACHE_NAME = 'kb-stone-v3-diagram';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/admin.js',
  '/pdf.js',
  '/pwa.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
