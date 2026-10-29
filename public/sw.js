const CACHE_NAME = 'kartflow-v6';
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
      return cache.addAll(ASSETS).catch(() => {});
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
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/socket.io/') || event.request.url.includes('/api/') || event.request.url.includes('firestore.googleapis.com')) {
    return;
  }
  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
