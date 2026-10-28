const CACHE_NAME = 'kartflow-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/picker.html',
  '/customer.html',
  '/cashier.html',
  '/manager.html',
  '/css/style.css',
  '/config.js',
  '/js/icons.js',
  '/js/catalog.js',
  '/js/logic.js',
  '/js/db.js',
  '/js/shell.js',
  '/js/scanner.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(err => console.log('Cache addAll error (normal during dev):', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Always fetch network first for real-time APIs, fallback to cache for static
  if (event.request.url.includes('/socket.io/') || event.request.url.includes('/api/')) {
    return;
  }
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
