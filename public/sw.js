
const CACHE_NAME = 'matownik-v4.9.1-cache';
const ASSETS = [
  './index.html',
  './public/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => console.log('Asset cache failed')))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k))))
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith('http')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((res) => {
          if (!res || res.status !== 200 || res.type !== 'basic') return res;
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return res;
        }).catch(() => {
          if (event.request.mode === 'navigate') return caches.match('./index.html');
        });
      })
    );
  }
});
